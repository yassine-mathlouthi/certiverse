// src/pages/OrganizationDashboard.jsx
import { useState, useEffect } from 'react';
import {
  LogOut, Search, Award, Users, Ban, Plus, ExternalLink, X, Download, Eye,
  CheckCircle, XCircle, ChevronRight, ChevronLeft, Calendar,
  FileText, Upload, Copy, Check, Activity, School, Building2, Briefcase
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { generateCertificateHTML } from '../utils/certificateTemplate';
import OrganizationAnalytics from '../components/OrganizationAnalytics';
import BatchCertificateIssuer from '../components/BatchCertificateIssuer';

// ======================== UPLOAD PINATA ========================
const uploadToPinata = async (file) => {
  const jwt = import.meta.env.VITE_PINATA_JWT;
  const gateway = import.meta.env.VITE_PINATA_GATEWAY;

  if (!jwt) throw new Error("VITE_PINATA_JWT manquant dans .env");
  if (!gateway) throw new Error("VITE_PINATA_GATEWAY manquant dans .env");

  const formData = new FormData();
  formData.append('file', file);
  formData.append('pinataMetadata', JSON.stringify({ name: file.name }));
  formData.append('pinataOptions', JSON.stringify({ cidVersion: 1 }));

  const res = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: { Authorization: `Bearer ${jwt}` },
    body: formData
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.reason || 'Erreur Pinata');

  return `ipfs://${data.IpfsHash}`;
};

// ======================== TÉLÉCHARGEMENT PDF ========================
const downloadCertificate = async (ipfsHash, certId) => {
  const loadingToast = toast.loading('Génération du PDF...');
  try {
    const gateway = import.meta.env.VITE_PINATA_GATEWAY;
    const { downloadCertificateAsPDF } = await import('../utils/pdfGenerator');
    await downloadCertificateAsPDF(ipfsHash, certId, gateway);
    toast.success('Certificat téléchargé avec succès !', { id: loadingToast });
  } catch (error) {
    console.error('Erreur téléchargement:', error);
    toast.error(`Erreur lors du téléchargement: ${error.message}`, { id: loadingToast });
  }
};

// ======================== MODAL CONSULTATION ========================
const CertificateViewer = ({ certificate, onClose, onDownload }) => {
  const [loading, setLoading] = useState(true);
  const [htmlContent, setHtmlContent] = useState('');
  const [error, setError] = useState(null);

  const loadCertificate = async () => {
    try {
      setLoading(true);
      setError(null);
      const cid = certificate.ipfsHash.replace('ipfs://', '');
      const gateway = import.meta.env.VITE_PINATA_GATEWAY;
      const response = await fetch(`https://${gateway}/ipfs/${cid}`);
      if (!response.ok) throw new Error(`Certificat introuvable (HTTP ${response.status})`);

      let content = await response.text();

      const styledContent = content.replace(
        '</head>',
        `<style>
          h1 { font-size: 48px !important; letter-spacing: 2px !important; }
          h2 { font-size: 36px !important; }
          .name { font-size: 52px !important; }
          .skill { font-size: 38px !important; }
          .to { font-size: 28px !important; }
          .info { font-size: 24px !important; }
        </style></head>`
      );

      setHtmlContent(styledContent);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {

    if (certificate?.ipfsHash) loadCertificate();
  }, [certificate]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-6xl h-[85vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b bg-gradient-to-r from-blue-600 via-cyan-600 to-indigo-700 text-white rounded-t-3xl">
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
              <FileText className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Certificat Officiel</h3>
              <p className="text-sm opacity-90">{certificate.studentName}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onDownload(certificate.ipfsHash, certificate.certId)}
              className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-medium transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Télécharger</span>
            </button>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl transition-all">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-0 bg-gray-50">
          {loading && (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <div className="animate-spin rounded-full h-14 w-14 border-4 border-blue-600 border-t-transparent"></div>
              <p className="text-gray-600 font-medium">Chargement depuis IPFS...</p>
            </div>
          )}
          {error && (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <XCircle className="w-16 h-16 text-red-500 mb-4" />
              <p className="text-lg font-bold text-red-600">Erreur</p>
              <p className="text-gray-600 mt-2">{error}</p>
            </div>
          )}
          {htmlContent && !loading && (
            <iframe
              srcDoc={htmlContent}
              title={`Certificat ${certificate.certId}`}
              className="w-full h-full border-0 bg-white"
              sandbox="allow-scripts allow-same-origin allow-popups"
            />
          )}
        </div>

        <div className="p-4 border-t bg-gradient-to-r from-gray-50 to-blue-50 text-sm">
          <div className="flex items-center justify-between text-gray-600">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                {certificate.dateIssued}
              </span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-medium text-xs">
                {certificate.type}
              </span>
              <span className={`font-medium text-xs ${certificate.status === 'actif' ? 'text-green-600' : 'text-red-600'}`}>
                {certificate.status === 'actif' ? 'Actif' : 'Révoqué'}
              </span>
            </div>

            {/* Issuance Transaction Hash */}
            {certificate.transactionHash && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-500 font-medium">Émission:</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(certificate.transactionHash);
                    toast.success('Hash copié !', { duration: 2000 });
                  }}
                  className="font-mono bg-blue-50 px-2 py-1 rounded border border-blue-200 hover:bg-blue-100 transition"
                >
                  {certificate.transactionHash.slice(0, 8)}...{certificate.transactionHash.slice(-6)}
                </button>
                <a
                  href={`https://sepolia.etherscan.io/tx/${certificate.transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  Etherscan
                </a>
              </div>
            )}

            {/* Revocation Transaction Hash */}
            {certificate.revokeTxHash && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-500 font-medium">Révocation:</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(certificate.revokeTxHash);
                    toast.success('Hash copié !', { duration: 2000 });
                  }}
                  className="font-mono bg-red-50 px-2 py-1 rounded border border-red-200 hover:bg-red-100 transition"
                >
                  {certificate.revokeTxHash.slice(0, 8)}...{certificate.revokeTxHash.slice(-6)}
                </button>
                <a
                  href={`https://sepolia.etherscan.io/tx/${certificate.revokeTxHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-600 hover:underline flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  Etherscan
                </a>
              </div>
            )}

            {/* IPFS Hash Link */}
            {certificate.ipfsHash && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-500 font-medium">IPFS:</span>
                <button
                  onClick={() => {
                    const cleanHash = certificate.ipfsHash.replace('ipfs://', '');
                    navigator.clipboard.writeText(cleanHash);
                    toast.success('Hash IPFS copié !', { duration: 2000 });
                  }}
                  className="font-mono bg-purple-50 px-2 py-1 rounded border border-purple-200 hover:bg-purple-100 transition"
                >
                  {certificate.ipfsHash.replace('ipfs://', '').slice(0, 8)}...{certificate.ipfsHash.replace('ipfs://', '').slice(-6)}
                </button>
                <a
                  href={`https://ipfs.io/ipfs/${certificate.ipfsHash.replace('ipfs://', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:underline flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  Voir sur IPFS
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ======================== QR CODE ========================
const QRCodeSVG = ({ value, size = 128 }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <rect width="100" height="100" fill="white" />
      <rect x="10" y="10" width="30" height="30" fill="black" />
      <rect x="60" y="10" width="30" height="30" fill="black" />
      <rect x="10" y="60" width="30" height="30" fill="black" />
      <rect x="50" y="50" width="10" height="10" fill="black" />
      <text x="50" y="95" fontSize="8" textAnchor="middle" fill="black">
        {value.slice(-4)}
      </text>
    </svg>
  );
};

export default function OrganizationDashboard({
  orgAddress,
  orgName,
  orgType,
  onDisconnect,
  contract,
  orgData
}) {
  const [certificates, setCertificates] = useState([]);
  const [activeTab, setActiveTab] = useState('table');
  const [stats, setStats] = useState({ totalCertificates: 0, revokedCertificates: 0, totalStudents: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [copiedId, setCopiedId] = useState(null);

  const [formData, setFormData] = useState({
    studentAddress: '',
    studentName: '',
    studentEmail: '',
    certType: 'Diplôme',
    skillName: '',
    obtainedDate: '',
    ipfsHash: '',
    certId: ''
  });

  const [issueStatus, setIssueStatus] = useState('');
  const [finalCertId, setFinalCertId] = useState('');

  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [selectedCertificateForView, setSelectedCertificateForView] = useState(null);
  const [revokeLoading, setRevokeLoading] = useState({});

  const loadCerts = async () => {
    if (!contract || !orgAddress) return;

    try {
      setLoading(true);

      const filter = contract.filters.CertificateIssued(null, orgAddress, null);
      const events = await contract.queryFilter(filter);

      const txHashMap = {};
      events.forEach(event => {
        const certId = Number(event.args.certId);
        txHashMap[certId] = event.transactionHash;
      });

      // Fetch revocation transaction hashes for revoked certificates
      const revokeFilter = contract.filters.CertificateRevoked(null);
      const revokeEvents = await contract.queryFilter(revokeFilter);

      const revokeTxHashMap = {};
      revokeEvents.forEach(event => {
        const certId = Number(event.args.certId);
        revokeTxHashMap[certId] = event.transactionHash;
      });

      const certs = await contract.getOrganizationCertificates(orgAddress);

      const formatted = certs.map(c => {
        const year = new Date(Number(c.issuedAt) * 1000).getFullYear();
        const realId = `CERT-${year}-${String(Number(c.id)).padStart(4, '0')}`;

        return {
          id: Number(c.id),
          rawId: Number(c.id),
          certId: realId,
          studentName: c.studentName,
          studentAddress: c.student,
          type: c.certType,
          skillName: c.formationName,
          dateIssued: new Date(Number(c.issuedAt) * 1000).toLocaleDateString('fr-FR'),
          status: c.revoked ? 'révoqué' : 'actif',
          ipfsHash: c.ipfsHash,
          transactionHash: txHashMap[Number(c.id)] || null,
          revokeTxHash: c.revoked ? (revokeTxHashMap[Number(c.id)] || null) : null,
        };
      });

      const revoked = formatted.filter(c => c.status === 'révoqué').length;
      const uniqueStudents = new Set(formatted.map(c => c.studentAddress)).size;

      setCertificates(formatted);
      setStats({
        totalCertificates: formatted.length,
        revokedCertificates: revoked,
        totalStudents: uniqueStudents
      });

    } catch (err) {
      console.error("Erreur chargement certificats:", err);
      toast.error("Erreur de chargement. Voir console.");
    } finally {
      setLoading(false);
    }
  };
  // CHARGEMENT DES CERTIFICATS
  useEffect(() => {


    loadCerts();
  }, [contract, orgAddress]);

  // State for tracking upload loading
  const [uploadingToIPFS, setUploadingToIPFS] = useState(false);

  // GÉNÉRATION PDF + UPLOAD
  const handleGeneratePDF = async () => {
    if (!formData.studentName || !formData.skillName || !formData.obtainedDate) {
      toast.error("Remplis tous les champs obligatoires !");
      return;
    }

    setIssueStatus('Calcul de l’ID officiel...');

    const counter = await contract.certificateCounter();
    const nextId = Number(counter) + 1;
    const year = new Date().getFullYear();
    const officialId = `CERT-${year}-${String(nextId).padStart(4, '0')}`;

    setFinalCertId(officialId);
    setFormData(prev => ({ ...prev, certId: officialId }));

    const issueDate = new Date(formData.obtainedDate);
    const formattedDate = issueDate.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });


    // Generate certificate using template
    const certificateHTML = generateCertificateHTML({
      studentName: formData.studentName,
      formationName: formData.skillName,
      certType: formData.certType || 'Diplôme',
      issuerName: orgName,
      issuedAt: formData.obtainedDate,
      certId: officialId,
      orgName: orgName
    });



    const blob = new Blob([certificateHTML], { type: 'text/html' });
    const file = new File([blob], `${officialId}.html`, { type: 'text/html' });

    setUploadingToIPFS(true); // Start loading
    setIssueStatus('Upload sur Pinata en cours...');

    try {
      const ipfsHash = await uploadToPinata(file);
      const cid = ipfsHash.replace('ipfs://', '');
      const gateway = import.meta.env.VITE_PINATA_GATEWAY || 'gateway.pinata.cloud';

      setFormData(prev => ({ ...prev, ipfsHash }));

      setIssueStatus(
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-4 text-green-500">
            <svg viewBox="0 0 80 80" fill="none" stroke="currentColor" strokeWidth="6">
              <circle cx="40" cy="40" r="36" />
              <path d="M20 40 L35 55 L60 30" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-green-700 mb-2">
            ✅ Upload réussi !
          </p>
          <p className="text-sm text-gray-600 mb-4">Votre certificat est maintenant sur IPFS</p>

          {/* IPFS Hash Display */}
          <div className="bg-white rounded-lg p-3 mb-4">
            <p className="text-xs text-gray-500 font-medium mb-1">Hash IPFS</p>
            <p className="font-mono text-sm text-gray-800 break-all">{cid}</p>
          </div>

          {/* Gateway Links */}
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <a
              href={`https://${gateway}/ipfs/${cid}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all shadow-sm"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Voir sur Pinata</span>
            </a>
          </div>
        </div>
      );
      setUploadingToIPFS(false); // Upload complete

    } catch (err) {
      console.error(err);
      setIssueStatus(
        <p className="text-red-600 text-xl font-bold">Erreur : {err.message || "Échec de l'upload"}</p>
      );
      setUploadingToIPFS(false); // Upload failed
    }
  };

  const handleSubmitCertificate = async () => {
    if (!formData.ipfsHash) {
      toast.error("Upload d'abord le certificat sur Pinata !");
      return;
    }

    setIssueStatus('Émission sur la blockchain...');

    try {
      const issuedAt = Math.floor(new Date(formData.obtainedDate).getTime() / 1000) || Math.floor(Date.now() / 1000);
      const tx = await contract.issueCertificate(
        formData.studentAddress || "0x0000000000000000000000000000000000000000",
        formData.studentName,
        formData.studentEmail,
        formData.skillName,
        formData.certType,
        formData.ipfsHash,
        issuedAt
      );
      await tx.wait();

      const verifyUrl = `https://certiverse-six.vercel.app/verify/${finalCertId}`;
      navigator.clipboard.writeText(verifyUrl);

      toast.success(`CERTIFICAT ÉMIS !\n\nID : ${finalCertId}\n\nLien copié :\n${verifyUrl}`, {
        duration: 6000,
        icon: '🎉',
      });

      setShowIssueForm(false);
      setCurrentStep(1);
      setFormData({
        studentAddress: '', studentName: '', studentEmail: '',
        certType: 'Diplôme', skillName: '', obtainedDate: '', ipfsHash: '', certId: ''
      });
      setFinalCertId('');
      setIssueStatus('');
      await loadCerts();
    } catch (err) {
      toast.error("Erreur blockchain : " + (err.reason || err.message));
    }
  };

  const handleRevoke = async (certRawId, certDisplayId) => {
    const confirmToast = toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="font-semibold">Révoquer le certificat {certDisplayId} ?</p>
        <div className="flex gap-2">
          <button
            onClick={() => {
              toast.dismiss(t.id);
              proceedRevoke(certRawId, certDisplayId);
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
          >
            Confirmer
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300"
          >
            Annuler
          </button>
        </div>
      </div>
    ), { duration: Infinity });
  };

  const proceedRevoke = async (certRawId, certDisplayId) => {
    setRevokeLoading(prev => ({ ...prev, [certRawId]: true }));
    const loadingToast = toast.loading('Révocation en cours...');
    try {
      const tx = await contract.revokeCertificate(certRawId);
      await tx.wait();
      setCertificates(prev => prev.map(c => c.rawId === certRawId ? { ...c, status: 'révoqué' } : c));
      setStats(prev => ({ ...prev, revokedCertificates: prev.revokedCertificates + 1 }));
      toast.success(`Certificat ${certDisplayId} révoqué !`, { id: loadingToast, icon: '🚫' });
    } catch (err) {
      toast.error("Erreur : " + (err.reason || err.message), { id: loadingToast });
    } finally {
      setRevokeLoading(prev => ({ ...prev, [certRawId]: false }));
    }
  };

  const truncateAddress = (addr) => addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '';
  const copyToClipboard = (text, key = 'generic') => {
    navigator.clipboard.writeText(text);
    setCopiedId(key);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getOrgIcon = () => {
    const type = (orgType || '').toLowerCase();
    if (type.includes('université') || type.includes('école') || type.includes('school')) return <School className="w-10 h-10 text-white" />;
    if (type.includes('entreprise') || type.includes('company')) return <Building2 className="w-10 h-10 text-white" />;
    return <Briefcase className="w-10 h-10 text-white" />;
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterType('all');
    setFilterStatus('all');
    setSortOrder('newest');
  };

  const filteredCertificates = certificates.filter(cert => {
    const matchesSearch = cert.certId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.studentAddress.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || cert.type === filterType;
    const matchesStatus = filterStatus === 'all' || cert.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  }).sort((a, b) => {
    // Sort by displayed date (newest/oldest)
    const dateA = new Date(a.dateIssued.split('/').reverse().join('-')); // Convert DD/MM/YYYY to Date
    const dateB = new Date(b.dateIssued.split('/').reverse().join('-'));
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });

  const openCertificateViewer = (certificate) => {
    setSelectedCertificateForView(certificate);
    setShowCertificateModal(true);
  };

  const getStatusBadge = (status) => {
    if (status === 'actif') return (
      <span className="inline-flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
        <CheckCircle className="w-4 h-4" /><span>Actif</span>
      </span>
    );
    return (
      <span className="inline-flex items-center space-x-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
        <XCircle className="w-4 h-4" /><span>Révoqué</span>
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-mesh flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[var(--color-primary-500)] border-t-transparent mx-auto mb-4"></div>
          <p className="text-xl font-semibold gradient-text font-display">Chargement des certificats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mesh relative">
      <Toaster position="top-right" />
      {/* Subtle background orbs */}
      <div className="gradient-orb gradient-orb-1 opacity-30"></div>
      <div className="gradient-orb gradient-orb-2 opacity-30"></div>
      {/* ==================== HEADER ==================== */}
      <header className="glass sticky top-0 z-40 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-5">
              <div className="bg-gradient-primary p-4 rounded-2xl shadow-lg glow">
                {getOrgIcon()}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 font-display">{orgName}</h1>
                <p className="text-sm text-gray-500">Émission de certificats sur blockchain</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3 bg-gradient-to-r from-blue-600 to-cyan-600 px-5 py-3 rounded-xl text-white font-medium">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="font-mono text-sm">{truncateAddress(orgAddress)}</span>
                <button onClick={() => copyToClipboard(orgAddress, 'org')} className="ml-2 hover:bg-white/20 p-1.5 rounded transition">
                  {copiedId === 'org' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <button onClick={onDisconnect} className="flex items-center space-x-2 px-5 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition font-medium">
                <LogOut className="w-5 h-5" />
                <span>Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* ==================== STATS ==================== */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="card p-6 stat-card">
            <div className="flex items-center justify-between">
              <div><p className="text-gray-500 text-sm font-medium mb-1">Total Certificats</p><p className="text-3xl font-bold text-gray-900 font-display">{stats.totalCertificates}</p></div>
              <div className="bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-primary-600)] p-3 rounded-xl shadow-lg"><Award className="w-8 h-8 text-white" /></div>
            </div>
          </div>
          <div className="card p-6 stat-card">
            <div className="flex items-center justify-between">
              <div><p className="text-gray-500 text-sm font-medium mb-1">Révoqués</p><p className="text-3xl font-bold text-gray-900 font-display">{stats.revokedCertificates}</p></div>
              <div className="bg-gradient-to-br from-red-500 to-red-600 p-3 rounded-xl shadow-lg"><Ban className="w-8 h-8 text-white" /></div>
            </div>
          </div>
          <div className="card p-6 stat-card">
            <div className="flex items-center justify-between">
              <div><p className="text-gray-500 text-sm font-medium mb-1">Étudiants Uniques</p><p className="text-3xl font-bold text-gray-900 font-display">{stats.totalStudents}</p></div>
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-3 rounded-xl shadow-lg"><Users className="w-8 h-8 text-white" /></div>
            </div>
          </div>
        </div>

        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => setActiveTab('table')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all ${activeTab === 'table'
              ? 'bg-white shadow-lg text-blue-600 border-2 border-blue-200'
              : 'bg-white/50 text-gray-600 hover:bg-white'
              }`}
          >
            <Award className="w-5 h-5" />
            <span>Certificats Émis</span>
            <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === 'table' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-600'
              }`}>
              {stats.totalCertificates}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all ${activeTab === 'analytics'
              ? 'bg-white shadow-lg text-purple-600 border-2 border-purple-200'
              : 'bg-white/50 text-gray-600 hover:bg-white'
              }`}
          >
            <Activity className="w-5 h-5" />
            <span>Analytique</span>
          </button>
        </div>


        {/* ==================== TABLEAU ==================== */}
        {activeTab === 'table' && (
          <div className="card overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space, space-y-4 md:space-y-0 mb-6">
                <h2 className="text-xl font-bold text-gray-900">Certificats Émis</h2>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowBatchModal(true)}
                    className="inline-flex items-center space-x-2 px-5 py-3 border-2 border-[var(--color-primary-500)] text-[var(--color-primary-600)] rounded-xl hover:bg-[var(--color-primary-50)] transition-all font-semibold"
                  >
                    <Upload className="w-5 h-5" />
                    <span>Émission en lot</span>
                  </button>
                  <button onClick={() => setShowIssueForm(true)} className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all font-semibold shadow-lg">
                    <Plus className="w-5 h-5" /><span>Émettre un certificat</span>
                  </button>
                </div>
              </div>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input type="text" placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                  <option value="all">Tous les types</option>
                  <option>Diplôme</option>
                  <option>Certification</option>
                  <option>Formation</option>
                  <option>Attestation</option>
                </select>
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                  <option value="all">Tous les statuts</option>
                  <option value="actif">Actif</option>
                  <option value="révoqué">Révoqué</option>
                </select>
                <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                  <option value="newest">Plus récents d'abord</option>
                  <option value="oldest">Plus anciens d'abord</option>
                </select>
              </div>
              {(searchTerm || filterType !== 'all' || filterStatus !== 'all' || sortOrder !== 'newest') && (
                <div className="flex items-center justify-between mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>{filteredCertificates.length}</strong> certificat{filteredCertificates.length !== 1 ? 's' : ''} trouvé{filteredCertificates.length !== 1 ? 's' : ''}
                  </p>
                  <button
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-1"
                  >
                    <X className="w-4 h-4" />
                    <span>Effacer les filtres</span>
                  </button>
                </div>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID Certificat</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Étudiant</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Statut</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCertificates.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">Aucun certificat trouvé</p>
                      </td>
                    </tr>
                  ) : (
                    filteredCertificates.map((cert) => (
                      <tr key={cert.id} className="hover:bg-gray-50/80 transition-all duration-200">
                        <td className="px-6 py-4">
                          <button
                            onClick={() => copyToClipboard(cert.certId, cert.certId)}
                            className="flex items-center space-x-2 font-mono text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                          >
                            <span>{cert.certId}</span>
                            {copiedId === cert.certId ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4 text-gray-400 hover:text-blue-500" />
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <div className="max-w-xs">
                            <p className="font-semibold text-gray-900 text-sm truncate">{cert.studentName}</p>
                            <button
                              onClick={() => copyToClipboard(cert.studentAddress, cert.studentAddress)}
                              className="text-xs text-gray-500 font-mono hover:text-blue-600 flex items-center space-x-1 mt-1"
                            >
                              <span>{truncateAddress(cert.studentAddress)}</span>
                              {copiedId === cert.studentAddress ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3 text-gray-400" />}
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${cert.type === 'Diplôme' ? 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300' :
                            cert.type === 'Certification' ? 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border border-purple-300' :
                              cert.type === 'Formation' ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300' :
                                cert.type === 'Attestation' ? 'bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 border border-orange-300' :
                                  'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300'
                            }`}>
                            {cert.type}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span>{cert.dateIssued}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">{getStatusBadge(cert.status)}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <button onClick={() => openCertificateViewer(cert)} className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 hover:from-blue-100 hover:to-blue-200 rounded-xl transition-all shadow-sm hover:shadow-md hover:scale-105 border border-blue-200">
                              <Eye className="w-5 h-5" />
                            </button>
                            <button onClick={() => downloadCertificate(cert.ipfsHash, cert.certId)} className="p-3 bg-gradient-to-br from-green-50 to-emerald-100 text-green-600 hover:from-green-100 hover:to-emerald-200 rounded-xl transition-all shadow-sm hover:shadow-md hover:scale-105 border border-green-200">
                              <Download className="w-5 h-5" />
                            </button>
                            {cert.status === 'actif' && (
                              <button
                                onClick={() => handleRevoke(cert.rawId, cert.certId)}
                                disabled={revokeLoading[cert.rawId]}
                                className={`p-3 rounded-xl transition-all hover:scale-105 ${revokeLoading[cert.rawId]
                                  ? 'bg-gray-300 cursor-wait'
                                  : 'bg-gradient-to-br from-red-50 to-red-100 text-red-600 border border-red-200 shadow-sm hover:shadow-md'
                                  }`}
                              >
                                {revokeLoading[cert.rawId] ? (
                                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-600 border-t-transparent" />
                                ) : (
                                  <Ban className="w-5 h-5" />
                                )}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (

          <OrganizationAnalytics
            certificates={certificates}
            contract={contract}
          />
        )}
      </main>

      {/* ==================== MODAL CONSULTATION ==================== */}
      {showCertificateModal && selectedCertificateForView && (
        <CertificateViewer
          certificate={selectedCertificateForView}
          onClose={() => {
            setShowCertificateModal(false);
            setSelectedCertificateForView(null);
          }}
          onDownload={downloadCertificate}
        />
      )}

      {/* ==================== MODAL ÉMISSION ==================== */}
      {showIssueForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl flex-shrink-0">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-gray-900">Émettre un Nouveau Certificat</h3>
                <button onClick={() => { setShowIssueForm(false); setCurrentStep(1); setIssueStatus(''); }} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-6 h-6 text-gray-500" /></button>
              </div>
              <div className="flex items-center justify-between">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex items-center flex-1">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${currentStep >= step ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                      {step}
                    </div>
                    {step < 3 && <div className={`flex-1 h-1 mx-2 ${currentStep > step ? 'bg-gradient-to-r from-blue-600 to-cyan-600' : 'bg-gray-200'}`}></div>}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {issueStatus && <div className="mb-6">{issueStatus}</div>}

              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Adresse Ethereum de l'étudiant *</label>
                    <input type="text" value={formData.studentAddress} onChange={(e) => setFormData(prev => ({ ...prev, studentAddress: e.target.value }))} placeholder="0x..." className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono" />
                    <p className="text-xs text-gray-500 mt-1">L'adresse Ethereum de l'étudiant (requis pour l'émission blockchain)</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nom complet *</label>
                    <input type="text" value={formData.studentName} onChange={(e) => setFormData(prev => ({ ...prev, studentName: e.target.value }))} placeholder="Ex: Fida Ghourabi" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                    <input type="email" value={formData.studentEmail} onChange={(e) => setFormData(prev => ({ ...prev, studentEmail: e.target.value }))} placeholder="fida@example.com" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Type</label>
                      <select value={formData.certType} onChange={(e) => setFormData(prev => ({ ...prev, certType: e.target.value }))} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                        <option>Diplôme</option>
                        <option>Certification</option>
                        <option>Formation</option>
                        <option>Attestation</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Date d'obtention</label>
                      <input type="date" value={formData.obtainedDate} onChange={(e) => setFormData(prev => ({ ...prev, obtainedDate: e.target.value }))} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Nom de la formation *</label>
                    <input type="text" value={formData.skillName} onChange={(e) => setFormData(prev => ({ ...prev, skillName: e.target.value }))} placeholder="Ex: Développement Mobile avec Flutter" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>

                  {/* PRÉVISUALISATION SUPPRIMÉE */}

                  {!formData.ipfsHash ? (
                    <button
                      onClick={handleGeneratePDF}
                      disabled={uploadingToIPFS}
                      className={`w-full mt-8 px-6 py-4 rounded-lg transition-all font-bold text-lg shadow-lg flex items-center justify-center space-x-3 ${uploadingToIPFS
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700'
                        }`}
                    >
                      {uploadingToIPFS ? (
                        <>
                          <div className="animate-spin rounded-full h-6 w-6 border-3 border-white border-t-transparent"></div>
                          <span>Upload en cours...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-6 h-6" />
                          <span>Générer & Uploader sur Pinata</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="mt-6 p-6 bg-green-50 border-2 border-green-300 rounded-xl text-center">
                      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-3" />
                      <p className="text-green-800 font-bold text-xl">Certificat prêt !</p>
                      <p className="font-mono text-2xl mt-2">{finalCertId}</p>
                    </div>
                  )}
                </div>
              )}

              {currentStep === 3 && (
                <div className="text-center py-12">
                  <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-6" />
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">Tout est prêt !</h3>
                  <p className="text-lg text-gray-600 mb-8">Confirmez pour émettre sur la blockchain</p>
                  <div className="bg-gray-50 rounded-xl p-6 max-w-2xl mx-auto text-left space-y-3">
                    <p><span className="font-semibold">Étudiant :</span> {formData.studentName}</p>
                    <p><span className="font-semibold">Formation :</span> {formData.skillName}</p>
                    <p><span className="font-semibold">Type :</span> {formData.certType}</p>
                    <p><span className="font-semibold">Date :</span> {formData.obtainedDate}</p>
                    <p><span className="font-semibold">ID officiel :</span> <code className="font-mono text-lg">{finalCertId}</code></p>
                  </div>
                  <p className="mt-8 text-yellow-700 font-bold text-lg">Action irréversible • Frais estimés : ~0.003 ETH</p>
                </div>
              )}
            </div>

            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 rounded-b-2xl flex justify-between">
              <button onClick={() => setCurrentStep(Math.max(1, currentStep - 1))} disabled={currentStep === 1} className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold ${currentStep === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                <ChevronLeft className="w-5 h-5" /><span>Précédent</span>
              </button>
              {currentStep < 3 ? (
                <button
                  onClick={() => {
                    // Validation for Step 1 -> Step 2
                    if (currentStep === 1) {
                      if (!formData.studentAddress || !formData.studentName || !formData.studentEmail) {
                        toast.error('Veuillez remplir l\'adresse Ethereum, le nom et l\'email de l\'étudiant');
                        return;
                      }
                      // Basic Ethereum address validation
                      if (!formData.studentAddress.startsWith('0x') || formData.studentAddress.length !== 42) {
                        toast.error('Adresse Ethereum invalide (doit commencer par 0x et avoir 42 caractères)');
                        return;
                      }
                    }
                    // Validation for Step 2 -> Step 3
                    if (currentStep === 2) {
                      if (!formData.skillName || !formData.obtainedDate) {
                        toast.error('Veuillez remplir le nom de la formation et la date');
                        return;
                      }
                      if (!formData.ipfsHash) {
                        toast.error('Veuillez d\'abord générer et uploader le certificat sur IPFS');
                        return;
                      }
                    }
                    setCurrentStep(currentStep + 1);
                  }}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 font-semibold shadow-lg flex items-center space-x-2"
                >
                  <span>Suivant</span><ChevronRight className="w-5 h-5" />
                </button>
              ) : (
                <button onClick={handleSubmitCertificate} className="px-10 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 font-bold text-xl shadow-lg flex items-center space-x-3">
                  <CheckCircle className="w-7 h-7" />
                  <span>Émettre sur la blockchain</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Batch Certificate Issuer Modal */}
      <BatchCertificateIssuer
        isOpen={showBatchModal}
        onClose={() => setShowBatchModal(false)}
        contract={contract}
        orgName={orgName}
        orgAddress={orgAddress}
        onComplete={loadCerts}
      />
    </div>
  );
}