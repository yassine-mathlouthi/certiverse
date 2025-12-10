// src/components/AddToLinkedInButton.jsx
import { Linkedin } from 'lucide-react';
import toast from 'react-hot-toast';

function AddToLinkedInButton({ certificate }) {
    const handleAddToLinkedIn = () => {
        const ipfsUrl = `https://ipfs.io/ipfs/${certificate.ipfsHash.replace('ipfs://', '')}`;

        // Issue date
        console.log(certificate.issuedAt);
        const issueDate = new Date(certificate.issuedAt * 1000);
        console.log(issueDate);
        const issueYear = issueDate.getFullYear();
        console.log(issueYear);
        const issueMonth = issueDate.getMonth() + 1; // 1-12
        console.log(issueMonth);

        const linkedInUrl = new URL('https://www.linkedin.com/profile/add');

        linkedInUrl.searchParams.append('startTask', 'CERT_ADD');
        linkedInUrl.searchParams.append('name', certificate.formationName);
        linkedInUrl.searchParams.append('authority', certificate.issuerName);
        linkedInUrl.searchParams.append('organizationName', certificate.issuerName);

        linkedInUrl.searchParams.append('issueYear', issueYear.toString());
        linkedInUrl.searchParams.append('issueMonth', issueMonth.toString());

        // Correct LinkedIn parameter name
        linkedInUrl.searchParams.append('certUrl', ipfsUrl);
        linkedInUrl.searchParams.append('certId', `CERT-${issueYear}-00${certificate.certId || certificate.id}`);

        // Show success message
        toast.success('Opening LinkedIn - Add your blockchain certificate!', {
            duration: 4000,
            icon: '🎓'
        });

        // Open LinkedIn in new window
        window.open(linkedInUrl.toString(), '_blank', 'width=800,height=700');
    };

    return (
        <button
            onClick={handleAddToLinkedIn}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-[#0A66C2] hover:bg-[#004182] text-white rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow"
            title="Add certificate to your LinkedIn profile"
        >
            <Linkedin className="w-4 h-4" />
            <span>Add to LinkedIn Profile</span>
        </button>
    );
}

export default AddToLinkedInButton;
