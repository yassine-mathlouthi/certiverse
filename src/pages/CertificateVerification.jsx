// src/pages/CertificateVerification.jsx
import { useState, useEffect } from 'react';
import { Search, Shield, CheckCircle, XCircle, ExternalLink, Download, ArrowLeft, Copy, Check, Building2, User, Calendar, FileText, AlertCircle, Award } from 'lucide-react';
import { getContractReadOnly } from '../utils/contract';
import toast, { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

function CertificateVerification({ onBack }) {
    const [certId, setCertId] = useState('');
    const [loading, setLoading] = useState(false);
    const [certificate, setCertificate] = useState(null);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    // Check URL for certificate ID on mount
    useEffect(() => {
        const path = window.location.pathname;
        const match = path.match(/\/verify\/(\d+)/);
        if (match && match[1]) {
            const urlCertId = match[1];
            console.log('hey:', urlCertId);
            setCertId(urlCertId);
            // Auto-verify after setting the ID
            setTimeout(() => {
                handleVerifyWithId(urlCertId);
            }, 100);
        }
    }, []);

    const handleVerifyWithId = async (id) => {
        const idToUse = id || certId;
        if (!idToUse.trim()) {
            toast.error('Veuillez entrer un ID de certificat');
            return;
        }

        setLoading(true);
        setError('');
        setCertificate(null);

        try {
            const contract = getContractReadOnly();

            // Parse certificate ID (handle both numeric and alphanumeric formats)
            let certIdNumber;
            if (idToUse.includes('CERT-')) {
                // Extract number from CERT-2025-0015 format
                const parts = idToUse.split('-');
                certIdNumber = parseInt(parts[parts.length - 1]);
            } else {
                certIdNumber = parseInt(idToUse);
            }
            console.log(certIdNumber);
            console.log(idToUse);

            if (isNaN(certIdNumber)) {
                setError('Format d\'ID de certificat invalide');
                toast.error('Format d\'ID de certificat invalide');
                setLoading(false);
                return;
            }

            const cert = await contract.getCertificate(certIdNumber);

            if (cert.id.toString() === '0') {
                setError('Certificat introuvable');
                toast.error('Certificat introuvable');
            } else {
                // Fetch transaction hash from CertificateIssued events (same as Org dashboard)
                let txHash = null;
                try {
                    console.log('Fetching transaction hash for certId:', certIdNumber);

                    // Get current block to limit range
                    const provider = contract.runner.provider;
                    console.log('Provider:', provider);
                    const currentBlock = await provider.getBlockNumber();
                    console.log('Current block:', currentBlock);

                    // Limit to last 50K blocks to avoid RPC "request too large" errors
                    const blockRange = 50000;
                    const fromBlock = Math.max(0, currentBlock - blockRange);
                    console.log(`Searching from block ${fromBlock} to ${currentBlock}`);

                    // Filter for this specific certificate ID (same pattern as org dashboard)
                    const filter = contract.filters.CertificateIssued(certIdNumber);
                    const events = await contract.queryFilter(filter, fromBlock, currentBlock);
                    console.log('Events found:', events.length);

                    if (events.length > 0) {
                        txHash = events[0].transactionHash; // Get first (should be only) event
                        console.log('Transaction hash:', txHash);
                    } else {
                        console.log('No events found for this certificate in recent blocks');
                        console.log('Note: Certificate may have been issued more than 50K blocks ago');
                    }
                } catch (err) {
                    console.error('Error fetching transaction hash:', err);
                }

                // Fetch revocation transaction hash if certificate is revoked
                let revokeTxHash = null;
                if (cert.revoked) {
                    try {
                        console.log('Certificate is revoked, fetching revoke transaction...');
                        const provider = contract.runner.provider;
                        const currentBlock = await provider.getBlockNumber();
                        const blockRange = 50000;
                        const fromBlock = Math.max(0, currentBlock - blockRange);

                        const revokeFilter = contract.filters.CertificateRevoked(certIdNumber);
                        const revokeEvents = await contract.queryFilter(revokeFilter, fromBlock, currentBlock);
                        console.log('Revoke events found:', revokeEvents.length);

                        if (revokeEvents.length > 0) {
                            revokeTxHash = revokeEvents[0].transactionHash;
                            console.log('Revocation transaction hash:', revokeTxHash);
                        }
                    } catch (err) {
                        console.error('Error fetching revocation hash:', err);
                    }
                }

                const certificateData = {
                    id: cert.id.toString(),
                    issuer: cert.issuer,
                    issuerName: cert.issuerName,
                    student: cert.student,
                    studentName: cert.studentName,
                    studentEmail: cert.studentEmail,
                    formationName: cert.formationName,
                    certType: cert.certType,
                    ipfsHash: cert.ipfsHash,
                    issuedAt: new Date(Number(cert.issuedAt) * 1000),
                    revoked: cert.revoked,
                    transactionHash: txHash,
                    revokeTxHash: revokeTxHash
                };
                console.log('Certificate data:', certificateData);
                setCertificate(certificateData);
                toast.success('Certificat vérifié avec succès !');
            }
        } catch (err) {
            console.error('Verification error:', err);
            setError('Erreur lors de la vérification du certificat. Veuillez vérifier l\'ID et réessayer.');
            toast.error('Échec de la vérification');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = () => {
        handleVerifyWithId(certId);
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success('Copié dans le presse-papiers !');
        setTimeout(() => setCopied(false), 2000);
    };

    const getBlockExplorerUrl = (address) => {
        return `https://sepolia.etherscan.io/address/${address}`;
    };

    const getCertTypeBadgeClass = (type) => {
        switch (type) {
            case 'Diplôme': return 'badge-diplome';
            case 'Certification': return 'badge-certification';
            case 'Formation': return 'badge-formation';
            case 'Attestation': return 'badge-attestation';
            default: return 'badge-primary';
        }
    };

    return (
        <div className="min-h-screen bg-mesh relative overflow-hidden">
            <Toaster position="top-right" />

            {/* Animated Gradient Orbs */}
            <div className="gradient-orb gradient-orb-1 animate-float"></div>
            <div className="gradient-orb gradient-orb-2 animate-float-delayed"></div>

            {/* Header */}
            <nav className="glass sticky top-0 z-50 border-b border-white/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
                    <div className="flex items-center justify-between">
                        <motion.div
                            className="flex items-center space-x-2 sm:space-x-3"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="bg-gradient-primary p-2 sm:p-2.5 rounded-xl shadow-lg glow">
                                <Shield className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl sm:text-2xl font-bold gradient-text font-display">
                                    CertiVerse
                                </h1>
                                <p className="text-xs text-gray-500 hidden sm:block">Vérification de Certificat</p>
                            </div>
                        </motion.div>
                        {onBack && (
                            <motion.button
                                onClick={onBack}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="flex items-center space-x-1 sm:space-x-2 text-gray-600 hover:text-[var(--color-primary-600)] transition-colors px-3 sm:px-4 py-2 rounded-xl hover:bg-white/50"
                            >
                                <ArrowLeft className="w-5 h-5" />
                                <span className="font-medium hidden sm:inline">Retour</span>
                            </motion.button>
                        )}
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-16 relative z-10">
                <motion.div
                    className="text-center mb-8 sm:mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 font-display">
                        Vérifier l'Authenticité du Certificat
                    </h2>
                    <p className="text-base sm:text-lg text-gray-600 max-w-xl mx-auto px-2">
                        Entrez l'ID du certificat pour vérifier son authenticité sur la blockchain
                    </p>
                </motion.div>

                {/* Search Box */}
                <motion.div
                    className="card p-4 sm:p-8 mb-6 sm:mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                ID du Certificat
                            </label>
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={certId}
                                    onChange={(e) => setCertId(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleVerify()}
                                    placeholder="Entrez l'ID du certificat (ex: CERT-2025-0015 ou 15)"
                                    className="input-modern text-lg"
                                    style={{ paddingLeft: '3rem' }}
                                />
                            </div>
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={handleVerify}
                                disabled={loading}
                                className="btn-primary w-full md:w-auto flex items-center justify-center space-x-2 text-lg px-8 py-3.5"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                        <span>Vérification...</span>
                                    </>
                                ) : (
                                    <>
                                        <Search className="w-5 h-5" />
                                        <span>Vérifier</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Error Message */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 mb-8 flex items-start space-x-4"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <div className="bg-red-100 p-2 rounded-xl">
                                <AlertCircle className="w-6 h-6 text-red-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-red-900 mb-1 font-display">Échec de la Vérification</h3>
                                <p className="text-red-700">{error}</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Certificate Details */}
                <AnimatePresence>
                    {certificate && (
                        <motion.div
                            className="card overflow-hidden"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -30 }}
                            transition={{ type: "spring", stiffness: 200 }}
                        >
                            {/* Status Banner */}
                            <div className={`px-4 sm:px-8 py-6 sm:py-8 ${certificate.revoked
                                ? 'bg-gradient-to-r from-red-500 to-red-600'
                                : 'bg-gradient-to-r from-emerald-500 to-emerald-600'
                                }`}>
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-white">
                                    <div className="flex items-center space-x-4">
                                        <motion.div
                                            className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: "spring", delay: 0.2 }}
                                        >
                                            {certificate.revoked ? (
                                                <XCircle className="w-10 h-10" />
                                            ) : (
                                                <CheckCircle className="w-10 h-10" />
                                            )}
                                        </motion.div>
                                        <div>
                                            <motion.div
                                                className="text-xl sm:text-2xl md:text-3xl font-bold font-display"
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.3 }}
                                            >
                                                {certificate.revoked ? 'Certificat Révoqué' : 'Certificat Vérifié ✓'}
                                            </motion.div>
                                            <motion.div
                                                className="text-sm opacity-90 mt-1"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 0.9 }}
                                                transition={{ delay: 0.4 }}
                                            >
                                                {certificate.revoked
                                                    ? 'Ce certificat n\'est plus valide'
                                                    : 'Ce certificat est authentique et valide'
                                                }
                                            </motion.div>
                                        </div>
                                    </div>
                                    <span className={`badge ${getCertTypeBadgeClass(certificate.certType)} text-sm`}>
                                        {certificate.certType}
                                    </span>
                                </div>
                            </div>

                            {/* Certificate Information */}
                            <div className="p-4 sm:p-8">
                                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8 font-display flex items-center gap-2 sm:gap-3">
                                    <Award className="w-6 h-6 sm:w-7 sm:h-7 text-[var(--color-primary-500)]" />
                                    Détails du Certificat
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                    {/* Student Info */}
                                    <div className="space-y-5">
                                        <div className="bg-gray-50 rounded-xl p-4">
                                            <label className="flex items-center text-sm font-semibold text-gray-500 mb-2">
                                                <User className="w-4 h-4 mr-2" />
                                                Nom de l'Étudiant
                                            </label>
                                            <p className="text-lg font-bold text-gray-900">{certificate.studentName}</p>
                                        </div>

                                        <div className="bg-gray-50 rounded-xl p-4">
                                            <label className="flex items-center text-sm font-semibold text-gray-500 mb-2">
                                                <Building2 className="w-4 h-4 mr-2" />
                                                Organisation Émettrice
                                            </label>
                                            <p className="text-lg font-bold text-gray-900">{certificate.issuerName}</p>
                                        </div>

                                        <div className="bg-gray-50 rounded-xl p-4">
                                            <label className="flex items-center text-sm font-semibold text-gray-500 mb-2">
                                                <FileText className="w-4 h-4 mr-2" />
                                                Formation
                                            </label>
                                            <p className="text-lg font-bold text-gray-900">{certificate.formationName}</p>
                                        </div>
                                    </div>

                                    {/* Additional Info */}
                                    <div className="space-y-5">
                                        <div className="bg-gray-50 rounded-xl p-4">
                                            <label className="flex items-center text-sm font-semibold text-gray-500 mb-2">
                                                <Award className="w-4 h-4 mr-2" />
                                                Type de Certificat
                                            </label>
                                            <p className="text-lg font-bold text-gray-900">{certificate.certType}</p>
                                        </div>

                                        <div className="bg-gray-50 rounded-xl p-4">
                                            <label className="flex items-center text-sm font-semibold text-gray-500 mb-2">
                                                <Calendar className="w-4 h-4 mr-2" />
                                                Date d'Émission
                                            </label>
                                            <p className="text-lg font-bold text-gray-900">
                                                {certificate.issuedAt.toLocaleDateString('fr-FR', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                        </div>

                                        <div className="bg-gray-50 rounded-xl p-4">
                                            <label className="text-sm font-semibold text-gray-500 mb-2 block">
                                                ID du Certificat
                                            </label>
                                            <p className="text-lg font-bold text-gray-900 font-mono">#{certificate.id}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Blockchain Proof */}
                                <div className="mt-6 sm:mt-10 pt-6 sm:pt-8 border-t border-gray-200">
                                    <h4 className="font-bold text-gray-900 mb-4 sm:mb-6 flex items-center space-x-2 text-base sm:text-lg font-display">
                                        <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--color-primary-500)]" />
                                        <span>Vérification Blockchain</span>
                                    </h4>

                                    <div className="space-y-3">
                                        {/* Transaction Hash Row */}
                                        {certificate.transactionHash && (
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-[var(--color-primary-50)] rounded-xl p-3 sm:p-4 border border-[var(--color-primary-200)] gap-2">
                                                <span className="text-xs sm:text-sm text-gray-600 font-semibold">Transaction Émission</span>
                                                <div className="flex items-center space-x-2">
                                                    <code className="text-xs sm:text-sm font-mono text-gray-900 bg-white px-2 py-1 rounded-lg truncate max-w-[120px] sm:max-w-none">{certificate.transactionHash.slice(0, 10)}...{certificate.transactionHash.slice(-8)}</code>
                                                    <button
                                                        onClick={() => copyToClipboard(certificate.transactionHash)}
                                                        className="p-2 hover:bg-[var(--color-primary-100)] rounded-lg transition-colors"
                                                    >
                                                        {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-600" />}
                                                    </button>
                                                    <a
                                                        href={`https://sepolia.etherscan.io/tx/${certificate.transactionHash}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2 hover:bg-[var(--color-primary-100)] rounded-lg transition-colors"
                                                        title="Voir sur Etherscan"
                                                    >
                                                        <ExternalLink className="w-4 h-4 text-[var(--color-primary-600)]" />
                                                    </a>
                                                </div>
                                            </div>
                                        )}

                                        {/* Revocation Transaction Hash Row */}
                                        {certificate.revokeTxHash && (
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-red-50 rounded-xl p-3 sm:p-4 border border-red-200 gap-2">
                                                <span className="text-xs sm:text-sm text-gray-600 font-semibold">Transaction Révocation</span>
                                                <div className="flex items-center space-x-2">
                                                    <code className="text-xs sm:text-sm font-mono text-gray-900 bg-white px-2 py-1 rounded-lg truncate max-w-[120px] sm:max-w-none">{certificate.revokeTxHash.slice(0, 10)}...{certificate.revokeTxHash.slice(-8)}</code>
                                                    <button
                                                        onClick={() => copyToClipboard(certificate.revokeTxHash)}
                                                        className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                                                    >
                                                        {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-600" />}
                                                    </button>
                                                    <a
                                                        href={`https://sepolia.etherscan.io/tx/${certificate.revokeTxHash}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                                                        title="Voir sur Etherscan"
                                                    >
                                                        <ExternalLink className="w-4 h-4 text-red-600" />
                                                    </a>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-gray-100 rounded-xl p-3 sm:p-4 gap-2">
                                            <span className="text-xs sm:text-sm text-gray-600 font-semibold">Portefeuille Étudiant</span>
                                            <div className="flex items-center space-x-2">
                                                <code className="text-xs sm:text-sm font-mono bg-white px-2 py-1 rounded-lg truncate max-w-[120px] sm:max-w-none">{certificate.student.slice(0, 10)}...{certificate.student.slice(-8)}</code>
                                                <button
                                                    onClick={() => copyToClipboard(certificate.student)}
                                                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                                                >
                                                    {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-600" />}
                                                </button>
                                                <a
                                                    href={getBlockExplorerUrl(certificate.student)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                                                >
                                                    <ExternalLink className="w-4 h-4 text-[var(--color-primary-600)]" />
                                                </a>
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-gray-100 rounded-xl p-3 sm:p-4 gap-2">
                                            <span className="text-xs sm:text-sm text-gray-600 font-semibold">Portefeuille Émetteur</span>
                                            <div className="flex items-center space-x-2">
                                                <code className="text-xs sm:text-sm font-mono bg-white px-2 py-1 rounded-lg truncate max-w-[120px] sm:max-w-none">{certificate.issuer.slice(0, 10)}...{certificate.issuer.slice(-8)}</code>
                                                <a
                                                    href={getBlockExplorerUrl(certificate.issuer)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                                                >
                                                    <ExternalLink className="w-4 h-4 text-[var(--color-primary-600)]" />
                                                </a>
                                            </div>
                                        </div>

                                        {/* IPFS Hash Display */}
                                        {certificate.ipfsHash && (
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-purple-50 rounded-xl p-3 sm:p-4 border border-purple-200 gap-2">
                                                <span className="text-xs sm:text-sm text-gray-600 font-semibold">Hash IPFS</span>
                                                <div className="flex items-center space-x-2">
                                                    <code className="text-xs sm:text-sm font-mono bg-white px-2 py-1 rounded-lg truncate max-w-[120px] sm:max-w-none">{certificate.ipfsHash.replace('ipfs://', '').slice(0, 10)}...{certificate.ipfsHash.replace('ipfs://', '').slice(-8)}</code>
                                                    <button
                                                        onClick={() => copyToClipboard(certificate.ipfsHash.replace('ipfs://', ''))}
                                                        className="p-2 hover:bg-purple-100 rounded-lg transition-colors"
                                                    >
                                                        {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-600" />}
                                                    </button>
                                                    <a
                                                        href={`https://ipfs.io/ipfs/${certificate.ipfsHash.replace('ipfs://', '')}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2 hover:bg-purple-100 rounded-lg transition-colors"
                                                    >
                                                        <ExternalLink className="w-4 h-4 text-purple-600" />
                                                    </a>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}

export default CertificateVerification;
