// src/pages/StudentProfileViewer.jsx
import { useState } from 'react';
import { ArrowLeft, User, Award, Building2, Calendar, Shield, ExternalLink, Search, AlertCircle, Sparkles } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

function StudentProfileViewer({ onBack }) {
    const [studentAddress, setStudentAddress] = useState('');
    const [searchAddress, setSearchAddress] = useState('');
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const isValidAddress = (address) => {
        return /^0x[a-fA-F0-9]{40}$/.test(address);
    };

    const handleSearch = async () => {
        if (!searchAddress.trim()) {
            toast.error('Veuillez entrer une adresse de portefeuille étudiant');
            return;
        }

        if (!isValidAddress(searchAddress)) {
            toast.error('Format d\'adresse Ethereum invalide');
            return;
        }

        setStudentAddress(searchAddress);
        await loadStudentProfile(searchAddress);
    };

    const loadStudentProfile = async (address) => {
        setLoading(true);
        setError('');
        setCertificates([]);

        try {
            const { getContractReadOnly } = await import('../utils/contract');
            const contract = getContractReadOnly();

            const certs = await contract.getStudentCertificates(address);

            if (certs.length === 0) {
                setError('Aucun certificat trouvé pour cette adresse étudiante');
                toast.info('Aucun certificat trouvé');
            } else {
                const formattedCerts = certs.map(cert => ({
                    id: cert.id.toString(),
                    issuer: cert.issuer,
                    issuerName: cert.issuerName,
                    studentName: cert.studentName,
                    studentEmail: cert.studentEmail,
                    formationName: cert.formationName,
                    certType: cert.certType,
                    ipfsHash: cert.ipfsHash,
                    issuedAt: new Date(Number(cert.issuedAt) * 1000),
                    revoked: cert.revoked
                }));

                setCertificates(formattedCerts);
                toast.success(`${formattedCerts.length} certificat(s) trouvé(s)`);
            }
        } catch (err) {
            console.error('Error loading student profile:', err);
            setError('Erreur lors du chargement du profil étudiant. Veuillez réessayer.');
            toast.error('Échec du chargement du profil');
        } finally {
            setLoading(false);
        }
    };

    const activeCertificates = certificates.filter(cert => !cert.revoked);
    const revokedCertificates = certificates.filter(cert => cert.revoked);

    const getUniqueOrganizations = () => {
        const orgs = new Set(certificates.map(cert => cert.issuerName));
        return Array.from(orgs);
    };

    const getCertificateTypes = () => {
        const types = new Set(certificates.map(cert => cert.certType));
        return Array.from(types);
    };

    // Helper function to get certificate type styling
    const getCertTypeBadgeClass = (certType) => {
        const styles = {
            'Diplôme': 'badge-diplome',
            'Certification': 'badge-certification',
            'Formation': 'badge-formation',
            'Attestation': 'badge-attestation'
        };
        return styles[certType] || 'badge-primary';
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
                            <div className="p-1 sm:p-1.5">
                                <img
                                    src="/logo.png"
                                    alt="CertiVerse Logo"
                                    className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                                />
                            </div>
                            <div>
                                <h1 className="text-xl sm:text-2xl font-bold gradient-text font-display">
                                    CertiVerse
                                </h1>
                                <p className="text-xs text-gray-500 hidden sm:block">Profil Étudiant</p>
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
            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-10">
                {/* Hero Section */}
                <motion.div
                    className="text-center mb-8 sm:mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="inline-flex items-center space-x-2 badge badge-primary mb-4 sm:mb-6">
                        <Sparkles className="w-4 h-4" />
                        <span>Visualiseur de Profil</span>
                    </div>
                    <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 font-display">
                        Rechercher un <span className="gradient-text">Profil Étudiant</span>
                    </h2>
                    <p className="text-base sm:text-lg text-gray-600 max-w-xl mx-auto px-2">
                        Consultez tous les certificats et compétences d'un étudiant enregistrés sur la blockchain
                    </p>
                </motion.div>

                {/* Search Section */}
                <motion.div
                    className="card p-4 sm:p-8 mb-6 sm:mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Adresse du Portefeuille Étudiant
                            </label>
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchAddress}
                                    onChange={(e) => setSearchAddress(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    placeholder="0x..."
                                    className="input-modern text-lg"
                                    style={{ paddingLeft: '3rem' }}
                                />
                            </div>
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={handleSearch}
                                disabled={loading}
                                className="btn-primary w-full md:w-auto flex items-center justify-center space-x-2 text-lg px-8 py-3.5"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                        <span>Chargement...</span>
                                    </>
                                ) : (
                                    <>
                                        <Search className="w-5 h-5" />
                                        <span>Rechercher</span>
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
                            className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6 mb-8 flex items-start space-x-4"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <div className="bg-yellow-100 p-2 rounded-xl">
                                <AlertCircle className="w-6 h-6 text-yellow-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-yellow-900 mb-1 font-display">Aucun Certificat Trouvé</h3>
                                <p className="text-yellow-700">{error}</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Profile Results */}
                <AnimatePresence>
                    {certificates.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -30 }}
                            transition={{ type: "spring", stiffness: 200 }}
                        >
                            {/* Summary Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
                                <motion.div
                                    className="card p-4 sm:p-6 stat-card"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-gray-500 text-xs sm:text-sm font-medium mb-1">Certificats Actifs</p>
                                            <p className="text-2xl sm:text-3xl font-bold text-gray-900 font-display">{activeCertificates.length}</p>
                                        </div>
                                        <div className="bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-primary-600)] p-2 sm:p-3 rounded-xl shadow-lg">
                                            <Award className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div
                                    className="card p-4 sm:p-6 stat-card"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-gray-500 text-xs sm:text-sm font-medium mb-1">Organisations</p>
                                            <p className="text-2xl sm:text-3xl font-bold text-gray-900 font-display">{getUniqueOrganizations().length}</p>
                                        </div>
                                        <div className="bg-gradient-to-br from-[var(--color-secondary-500)] to-[var(--color-secondary-600)] p-2 sm:p-3 rounded-xl shadow-lg">
                                            <Building2 className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div
                                    className="card p-4 sm:p-6 stat-card"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-gray-500 text-xs sm:text-sm font-medium mb-1">Types</p>
                                            <p className="text-2xl sm:text-3xl font-bold text-gray-900 font-display">{getCertificateTypes().length}</p>
                                        </div>
                                        <div className="bg-gradient-to-br from-[var(--color-success-500)] to-emerald-600 p-2 sm:p-3 rounded-xl shadow-lg">
                                            <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div
                                    className="card p-4 sm:p-6 stat-card"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-gray-500 text-xs sm:text-sm font-medium mb-1">Total</p>
                                            <p className="text-2xl sm:text-3xl font-bold text-gray-900 font-display">{certificates.length}</p>
                                        </div>
                                        <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-2 sm:p-3 rounded-xl shadow-lg">
                                            <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                                        </div>
                                    </div>
                                </motion.div>
                            </div>

                            {/* Student Info Card */}
                            <motion.div
                                className="card p-4 sm:p-6 mb-6 sm:mb-8"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                            >
                                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 font-display flex items-center gap-2 sm:gap-3">
                                    <User className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--color-primary-500)]" />
                                    Informations Étudiant
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                    <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
                                        <label className="text-xs sm:text-sm font-semibold text-gray-500 mb-2 block">Nom</label>
                                        <p className="text-base sm:text-lg font-bold text-gray-900">{certificates[0]?.studentName || 'N/A'}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
                                        <label className="text-xs sm:text-sm font-semibold text-gray-500 mb-2 block">Adresse du Portefeuille</label>
                                        <div className="flex items-center space-x-2">
                                            <code className="text-xs sm:text-sm font-mono text-gray-900 truncate">{studentAddress.slice(0, 10)}...{studentAddress.slice(-8)}</code>
                                            <a
                                                href={`https://sepolia.etherscan.io/address/${studentAddress}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0"
                                            >
                                                <ExternalLink className="w-4 h-4 text-[var(--color-primary-600)]" />
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Active Certificates */}
                            <motion.div
                                className="mb-6 sm:mb-8"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                            >
                                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 font-display flex items-center gap-2 sm:gap-3">
                                    <Award className="w-6 h-6 sm:w-7 sm:h-7 text-[var(--color-primary-500)]" />
                                    Certificats Actifs
                                </h3>
                                <div className="space-y-3">
                                    {activeCertificates.map((cert, index) => (
                                        <motion.div
                                            key={cert.id}
                                            className="card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-[var(--color-primary-200)]"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.1 * index }}
                                        >
                                            <div className="flex items-start sm:items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                                                <span className={`badge ${getCertTypeBadgeClass(cert.certType)} flex-shrink-0`}>
                                                    {cert.certType}
                                                </span>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-gray-900 text-base sm:text-lg truncate">{cert.formationName}</p>
                                                    <p className="text-xs sm:text-sm text-gray-500 flex items-center gap-1 sm:gap-2">
                                                        <Building2 className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                                        <span className="truncate">{cert.issuerName}</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between sm:justify-end space-x-3 sm:space-x-4">
                                                <span className="text-xs sm:text-sm text-gray-500 flex items-center gap-1 sm:gap-2">
                                                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                                                    {cert.issuedAt.toLocaleDateString('fr-FR')}
                                                </span>
                                                <a
                                                    href={`/verify/${cert.id}`}
                                                    className="btn-primary flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 text-xs sm:text-sm"
                                                >
                                                    <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
                                                    <span>Vérifier</span>
                                                </a>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Revoked Certificates */}
                            {revokedCertificates.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.7 }}
                                >
                                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 font-display flex items-center gap-2 sm:gap-3">
                                        <AlertCircle className="w-6 h-6 sm:w-7 sm:h-7 text-red-500" />
                                        Certificats Révoqués
                                    </h3>
                                    <div className="space-y-3">
                                        {revokedCertificates.map((cert, index) => (
                                            <motion.div
                                                key={cert.id}
                                                className="card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-red-50 border-2 border-red-200 hover:border-red-400 transition-all"
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.1 * index }}
                                            >
                                                <div className="flex items-start sm:items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                                                    <span className={`badge ${getCertTypeBadgeClass(cert.certType)} flex-shrink-0`}>
                                                        {cert.certType}
                                                    </span>
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-gray-900 text-base sm:text-lg truncate">{cert.formationName}</p>
                                                        <p className="text-xs sm:text-sm text-gray-500 flex items-center gap-1 sm:gap-2">
                                                            <Building2 className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                                            <span className="truncate">{cert.issuerName}</span>
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between sm:justify-end space-x-3 sm:space-x-4">
                                                    <span className="text-xs sm:text-sm text-gray-500 flex items-center gap-1 sm:gap-2">
                                                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                                                        {cert.issuedAt.toLocaleDateString('fr-FR')}
                                                    </span>
                                                    <a
                                                        href={`/verify/${cert.id}`}
                                                        className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-all text-xs sm:text-sm"
                                                    >
                                                        <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
                                                        <span>Vérifier</span>
                                                    </a>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}

export default StudentProfileViewer;
