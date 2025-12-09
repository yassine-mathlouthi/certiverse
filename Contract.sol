// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CertiVerse {

    struct Organization {
        string name;
        string email;
        string orgType;
        bool   isActive;
        uint256 registeredAt;    // timestamp fourni par le front
        uint256 totalIssued;
        uint256 totalRevoked;
        uint256 uniqueStudents;
    }

    struct Certificate {
        uint256 id;
        address issuer;
        string  issuerName;
        address student;
        string  studentName;
        string  studentEmail;
        string  formationName;
        string  certType;
        string  ipfsHash;
        uint256 issuedAt;         // timestamp fourni par le front
        bool    revoked;
    }

    address public immutable admin;
    uint256 public certificateCounter;

    mapping(address => Organization) public organizations;
    address[] public organizationList;

    mapping(uint256 => Certificate) public certificates;
    mapping(address => uint256[]) public studentCertificates;

    mapping(address => mapping(address => bool)) private hasReceivedFromOrg;

    event OrganizationRegistered(address indexed org, string name);
    event OrganizationRevoked(address indexed org);
    event CertificateIssued(uint256 indexed certId, address indexed issuer, address indexed student, string formation);
    event CertificateRevoked(uint256 indexed certId);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Admin uniquement");
        _;
    }

    modifier onlyAuthorizedOrg() {
        require(organizations[msg.sender].isActive, "Organisation non autorisee ou revoquee");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    // ---------------- Admin functions ----------------
    function registerOrganization(
        address orgAddress,
        string memory name,
        string memory email,
        string memory orgType,
        uint256 registeredAt  // <-- date du front
    ) external onlyAdmin {
        require(orgAddress != address(0), "Adresse invalide");
        require(bytes(name).length > 0, "Nom requis");
        require(!organizations[orgAddress].isActive, "Deja enregistree");

        organizations[orgAddress] = Organization({
            name: name,
            email: email,
            orgType: orgType,
            isActive: true,
            registeredAt: registeredAt, // timestamp fourni
            totalIssued: 0,
            totalRevoked: 0,
            uniqueStudents: 0
        });

        organizationList.push(orgAddress);
        emit OrganizationRegistered(orgAddress, name);
    }

    function revokeOrganization(address orgAddress) external onlyAdmin {
        require(organizations[orgAddress].isActive, "Deja revoquee");
        organizations[orgAddress].isActive = false;
        emit OrganizationRevoked(orgAddress);
    }

    // ---------------- Organization functions ----------------
    function issueCertificate(
        address student,
        string memory studentName,
        string memory studentEmail,
        string memory formationName,
        string memory certType,
        string memory ipfsHash,
        uint256 issuedAt   // <-- date du front
    ) external onlyAuthorizedOrg {
        require(student != address(0), "Etudiant invalide");
        require(bytes(studentName).length > 0, "Nom etudiant requis");
        require(bytes(ipfsHash).length > 0, "IPFS requis");

        certificateCounter++;

        Organization storage org = organizations[msg.sender];

        org.totalIssued++;
        if (!hasReceivedFromOrg[msg.sender][student]) {
            hasReceivedFromOrg[msg.sender][student] = true;
            org.uniqueStudents++;
        }

        certificates[certificateCounter] = Certificate({
            id: certificateCounter,
            issuer: msg.sender,
            issuerName: org.name,
            student: student,
            studentName: studentName,
            studentEmail: studentEmail,
            formationName: formationName,
            certType: certType,
            ipfsHash: ipfsHash,
            issuedAt: issuedAt, // timestamp fourni
            revoked: false
        });

        studentCertificates[student].push(certificateCounter);
        emit CertificateIssued(certificateCounter, msg.sender, student, formationName);
    }

    function revokeCertificate(uint256 certId) external onlyAuthorizedOrg {
        Certificate storage cert = certificates[certId];
        require(cert.issuer == msg.sender, "Pas l'emetteur");
        require(!cert.revoked, "Deja revoque");

        cert.revoked = true;
        organizations[msg.sender].totalRevoked++;
        emit CertificateRevoked(certId);
    }

    // ---------------- View functions ----------------
    function getAllOrganizations() external view returns (
        address[] memory addresses,
        string[] memory names,
        string[] memory emails,
        string[] memory types,
        bool[] memory actives,
        uint256[] memory totalIssued,
        uint256[] memory totalRevoked,
        uint256[] memory uniqueStudents,
        uint256[] memory registeredAt
    ) {
        uint256 len = organizationList.length;
        addresses = new address[](len);
        names = new string[](len);
        emails = new string[](len);
        types = new string[](len);
        actives = new bool[](len);
        totalIssued = new uint256[](len);
        totalRevoked = new uint256[](len);
        uniqueStudents = new uint256[](len);
        registeredAt = new uint256[](len);

        for (uint i = 0; i < len; i++) {
            address addr = organizationList[i];
            Organization memory o = organizations[addr];
            addresses[i] = addr;
            names[i] = o.name;
            emails[i] = o.email;
            types[i] = o.orgType;
            actives[i] = o.isActive;
            totalIssued[i] = o.totalIssued;
            totalRevoked[i] = o.totalRevoked;
            uniqueStudents[i] = o.uniqueStudents;
            registeredAt[i] = o.registeredAt;
        }
    }

    function getOrganizationCertificates(address org) external view returns (Certificate[] memory) {
        Certificate[] memory temp = new Certificate[](certificateCounter);
        uint256 count = 0;
        for (uint256 i = 1; i <= certificateCounter; i++) {
            if (certificates[i].issuer == org) {
                temp[count] = certificates[i];
                count++;
            }
        }
        Certificate[] memory result = new Certificate[](count);
        for (uint256 i = 0; i < count; i++) result[i] = temp[i];
        return result;
    }

    function getStudentCertificates(address student) external view returns (Certificate[] memory) {
        uint256[] memory ids = studentCertificates[student];
        Certificate[] memory result = new Certificate[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) result[i] = certificates[ids[i]];
        return result;
    }

    function getCertificate(uint256 certId) external view returns (Certificate memory) {
        Certificate memory c = certificates[certId];
        require(c.id != 0, "Certificat inexistant");
        return c;
    }

    function getGlobalStats() external view returns (
        uint256 totalOrgs,
        uint256 activeOrgs,
        uint256 totalCerts,
        uint256 revokedCerts
    ) {
        uint256 active = 0;
        uint256 revoked = 0;
        for (uint i = 0; i < organizationList.length; i++) {
            if (organizations[organizationList[i]].isActive) active++;
        }
        for (uint i = 1; i <= certificateCounter; i++) {
            if (certificates[i].revoked) revoked++;
        }
        return (organizationList.length, active, certificateCounter, revoked);
    }
}
