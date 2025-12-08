// src/pages/StudentDashboard.jsx
import { useState, useEffect } from 'react';
import {
  LogOut, Award, Download, Eye, Calendar, Building2,
  CheckCircle, XCircle, Search, Filter, FileText, X,
  TrendingUp, Shield, ExternalLink, Activity, Hash, DollarSign, Copy, Check
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { downloadCertificateAsPDF } from '../utils/pdfGenerator';
import AddToLinkedInButton from '../components/LinkedInShareButton';


// ======================== TÉLÉCHARGEMENT PDF ========================
const downloadCertificate = async (ipfsHash, certId) => {
  const loadingToast = toast.loading('Génération du PDF...');
  try {
    const gateway = import.meta.env.VITE_PINATA_GATEWAY;
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <div className="absolute inset-0" onClick={onClose} />

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-6xl h-[90vh] sm:h-[85vh] flex flex-col overflow-hidden"
      >
        <div className="flex items-center justify-between p-3 sm:p-5 border-b bg-gradient-to-r from-blue-600 via-cyan-600 to-indigo-700 text-white rounded-t-2xl sm:rounded-t-3xl">
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
              <FileText className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold">Certificat Officiel</h3>
              <p className="text-xs sm:text-sm opacity-90 hidden sm:block">{certificate.formationName}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onDownload(certificate.ipfsHash, certificate.id)}
              className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-medium transition-all"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Télécharger</span>
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
              title={`Certificat ${certificate.id}`}
              className="w-full h-full border-0 bg-white"
              sandbox="allow-scripts allow-same-origin allow-popups"
            />
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

// ======================== STUDENT DASHBOARD MAIN ========================
export default function StudentDashboard({ studentAddress, onDisconnect, contract }) {
  const [certificates, setCertificates] = useState([]);
  const [filteredCertificates, setFilteredCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, revoked
  const [filterType, setFilterType] = useState('all'); // all, Diplôme, Certification, Formation, Attestation
  const [sortOrder, setSortOrder] = useState('newest'); // Add sortOrder state
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [activeTab, setActiveTab] = useState('certificates'); // certificates or transactions
  const [transactions, setTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [copiedTxHash, setCopiedTxHash] = useState('');
  const [copiedVerifyId, setCopiedVerifyId] = useState(null);

  // Base URL for verification
  const VERIFY_BASE_URL = `${import.meta.env.VITE_APP_BASE_URL}/verify`;

  const copyVerifyLink = (certId) => {
    const verifyUrl = `${VERIFY_BASE_URL}/${certId}`;
    navigator.clipboard.writeText(verifyUrl);
    setCopiedVerifyId(certId);
    toast.success('Lien de vérification copié !');
    setTimeout(() => setCopiedVerifyId(null), 2000);
  };

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    revoked: 0,
    organizations: 0
  });

  // Charger les certificats de l'étudiant
  const loadCertificates = async () => {
    if (!contract) return;
    try {
      setLoading(true);
      const certs = await contract.getStudentCertificates(studentAddress);

      const formatted = certs.map((c) => ({
        id: Number(c.id),
        issuerAddress: c.issuer,
        issuerName: c.issuerName,
        studentName: c.studentName,
        studentEmail: c.studentEmail,
        formationName: c.formationName,
        certType: c.certType,
        ipfsHash: c.ipfsHash,
        issuedAt: Number(c.issuedAt),
        revoked: c.revoked,
        date: new Date(Number(c.issuedAt) * 1000).toLocaleDateString('fr-FR')
      }));

      // Trier par date (plus récent en premier)
      formatted.sort((a, b) => b.issuedAt - a.issuedAt);

      setCertificates(formatted);
      setFilteredCertificates(formatted);

      // Calculer les stats
      const active = formatted.filter(c => !c.revoked).length;
      const revoked = formatted.filter(c => c.revoked).length;
      const uniqueOrgs = new Set(formatted.map(c => c.issuerAddress)).size;

      setStats({
        total: formatted.length,
        active,
        revoked,
        organizations: uniqueOrgs
      });

      setLoading(false);
    } catch (err) {
      console.error("Erreur chargement certificats:", err);
      setLoading(false);
    }
  };

  // Load transaction history with REAL blockchain transaction hashes
  const loadTransactionHistory = async () => {
    if (!contract || certificates.length === 0) return;

    try {
      setLoadingTransactions(true);

      // Fetch blockchain events to get real transaction hashes
      // Get current block for range limiting
      const provider = contract.runner.provider;
      const currentBlock = await provider.getBlockNumber();

      // Limit to last 50K blocks to avoid RPC errors
      const blockRange = 50000;
      const fromBlock = Math.max(0, currentBlock - blockRange);

      const filter = contract.filters.CertificateIssued(null, null, studentAddress);
      const events = await contract.queryFilter(filter, fromBlock, currentBlock);

      // Create map of certId => transactionHash
      const txHashMap = {};
      events.forEach(event => {
        const certId = Number(event.args.certId);
        txHashMap[certId] = event.transactionHash;
      });

      const txHistory = [];

      // Create transaction records with REAL tx hashes
      for (const cert of certificates) {
        txHistory.push({
          id: cert.id,
          type: `${cert.certType} émis`, // Show certificate type + "émis" in French
          formationName: cert.formationName,
          issuerName: cert.issuerName,
          timestamp: cert.issuedAt,
          date: new Date(cert.issuedAt * 1000).toLocaleString('fr-FR'),
          certId: cert.id,
          status: cert.revoked ? 'Révoqué' : 'Confirmé',
          txHash: txHashMap[cert.id] || null, // Real transaction hash from blockchain
          ipfsHash: cert.ipfsHash, // Add IPFS hash
        });
      }

      // Sort by timestamp descending
      txHistory.sort((a, b) => b.timestamp - a.timestamp);
      setTransactions(txHistory);
    } catch (error) {
      console.error('Error loading transactions:', error);
      toast.error('Erreur lors du chargement des transactions');
    } finally {
      setLoadingTransactions(false);
    }
  };

  // Clear all filters function
  const clearFilters = () => {
    setSearchTerm('');
    setFilterStatus('all');
    setFilterType('all');
    setSortOrder('newest');
  };

  useEffect(() => {
    if (contract) loadCertificates();
  }, [contract, studentAddress]);

  useEffect(() => {
    if (activeTab === 'transactions' && certificates.length > 0 && transactions.length === 0) {
      loadTransactionHistory();
    }
  }, [activeTab, certificates]);

  // Filtrage et recherche
  useEffect(() => {
    let filtered = certificates;

    // Filtre par statut
    if (filterStatus === 'active') {
      filtered = filtered.filter(c => !c.revoked);
    } else if (filterStatus === 'revoked') {
      filtered = filtered.filter(c => c.revoked);
    }

    // Filtre par type
    if (filterType !== 'all') {
      filtered = filtered.filter(c => c.certType === filterType);
    }

    // Recherche
    if (searchTerm) {
      filtered = filtered.filter(c =>
        c.formationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.issuerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.certType.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Group by status first (Active first, then Revoked), then sort by date within each group
    filtered.sort((a, b) => {
      // First, group by revoked status (active certificates first)
      if (a.revoked !== b.revoked) {
        return a.revoked ? 1 : -1; // Non-revoked (false) comes before revoked (true)
      }
      // Within the same group, sort by displayed date
      const dateA = new Date(a.date.split('/').reverse().join('-')); // Convert DD/MM/YYYY to Date
      const dateB = new Date(b.date.split('/').reverse().join('-'));
      return sortOrder === 'oldest' ? dateB - dateA : dateA - dateB;
    });

    setFilteredCertificates(filtered);
  }, [certificates, searchTerm, filterStatus, filterType, sortOrder]);

  const handleViewCertificate = (cert) => {
    setSelectedCertificate(cert);
  };

  const handleDownload = (ipfsHash, certId) => {
    downloadCertificate(ipfsHash, certId);
  };

  const copyTxHash = (txHash) => {
    navigator.clipboard.writeText(txHash);
    setCopiedTxHash(txHash);
    toast.success('Transaction hash copied!');
    setTimeout(() => setCopiedTxHash(''), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-mesh relative overflow-hidden">
        <Toaster position="top-right" />
        {/* Header Skeleton */}
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-gray-200 p-3 rounded-xl w-14 h-14 animate-pulse"></div>
                <div>
                  <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Skeleton */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="bg-gray-200 w-12 h-12 rounded-xl animate-pulse"></div>
                  <div className="bg-gray-200 w-6 h-6 rounded animate-pulse"></div>
                </div>
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>

          {/* Search Bar Skeleton */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 mb-8">
            <div className="h-12 bg-gray-200 rounded-xl animate-pulse"></div>
          </div>

          {/* Certificate Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse"></div>
                <div className="p-6 space-y-3">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                  <div className="flex gap-2 pt-4">
                    <div className="h-10 flex-1 bg-gray-200 rounded-lg animate-pulse"></div>
                    <div className="h-10 flex-1 bg-gray-200 rounded-lg animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mesh relative overflow-hidden">
      <Toaster position="top-right" />
      {/* Subtle background orbs */}
      <div className="gradient-orb gradient-orb-1 opacity-30"></div>
      <div className="gradient-orb gradient-orb-2 opacity-30"></div>
      {/* Header */}
      <header className="glass sticky top-0 z-40 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
              <div className="bg-gradient-primary p-2 sm:p-3 rounded-xl shadow-lg flex-shrink-0 glow">
                <Award className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl font-bold gradient-text truncate font-display">
                  Mes Certificats
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">Portefeuille de compétences</p>
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
              <div
                onClick={() => {
                  navigator.clipboard.writeText(studentAddress);
                  toast.success('Adresse copiée !');
                }}
                className="hidden md:flex items-center space-x-2 px-4 py-2.5 bg-gradient-primary rounded-xl cursor-pointer hover:shadow-lg transition-all glow-hover"
              >
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-mono text-white">
                  {studentAddress.slice(0, 6)}...{studentAddress.slice(-4)}
                </span>
                <Copy className="w-4 h-4 text-white/70 hover:text-white" />
              </div>
              <button
                onClick={onDisconnect}
                className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors font-medium"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline text-sm">Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="card p-4 sm:p-6 stat-card"
          >
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="bg-blue-100 p-2 sm:p-3 rounded-xl">
                <Award className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Total Certificats</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="card p-4 sm:p-6 stat-card"
          >
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="bg-green-100 p-2 sm:p-3 rounded-xl">
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.active}</p>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Certificats Actifs</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="card p-4 sm:p-6 stat-card"
          >
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="bg-red-100 p-2 sm:p-3 rounded-xl">
                <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.revoked}</p>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Révoqués</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="card p-4 sm:p-6 stat-card"
          >
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="bg-purple-100 p-2 sm:p-3 rounded-xl">
                <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.organizations}</p>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Organisations</p>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-6 tabs-scroll">
          <button
            onClick={() => setActiveTab('certificates')}
            className={`flex items-center space-x-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${activeTab === 'certificates'
              ? 'bg-white shadow-lg text-blue-600 border-2 border-blue-200'
              : 'bg-white/50 text-gray-600 hover:bg-white'
              }`}
          >
            <Award className="w-5 h-5" />
            <span className="hidden sm:inline">Mes Certificats</span>
            <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === 'certificates' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-600'
              }`}>
              {stats.total}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('transactions')}
            className={`flex items-center space-x-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${activeTab === 'transactions'
              ? 'bg-white shadow-lg text-cyan-600 border-2 border-cyan-200'
              : 'bg-white/50 text-gray-600 hover:bg-white'
              }`}
          >
            <Activity className="w-5 h-5" />
            <span className="hidden sm:inline">Historique</span>
          </button>
        </div>

        {/* Certificates Tab */}
        {activeTab === 'certificates' && (
          <>
            {/* Search and Filter Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 mb-8"
            >
              <div className="flex flex-col gap-3 sm:gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 sm:flex sm:items-center sm:space-x-3">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-2 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="all">Tous</option>
                    <option value="active">Actifs</option>
                    <option value="revoked">Révoqués</option>
                  </select>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full px-2 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="all">Types</option>
                    <option value="Diplôme">Diplôme</option>
                    <option value="Certification">Certif.</option>
                    <option value="Formation">Form.</option>
                    <option value="Attestation">Attest.</option>
                  </select>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="w-full px-2 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="newest">Récents</option>
                    <option value="oldest">Anciens</option>
                  </select>
                </div>
              </div>
              {(searchTerm || filterStatus !== 'all' || filterType !== 'all' || sortOrder !== 'newest') && (
                <div className="flex items-center justify-between mt-4 p-3 bg-cyan-50 border border-cyan-200 rounded-xl">
                  <p className="text-sm text-cyan-800">
                    <strong>{filteredCertificates.length}</strong> certificat{filteredCertificates.length !== 1 ? 's' : ''} trouvé{filteredCertificates.length !== 1 ? 's' : ''}
                  </p>
                  <button
                    onClick={clearFilters}
                    className="text-sm text-cyan-600 hover:text-cyan-800 font-medium flex items-center space-x-1 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span>Effacer</span>
                  </button>
                </div>
              )}
            </motion.div>

            {/* Certificates Grid */}
            {filteredCertificates.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-16 text-center">
                <Award className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {certificates.length === 0 ? 'Aucun certificat' : 'Aucun résultat'}
                </h3>
                <p className="text-gray-600">
                  {certificates.length === 0
                    ? 'Vous n\'avez pas encore reçu de certificat.'
                    : 'Essayez de modifier vos critères de recherche.'}
                </p>
              </div>
            ) : (
              <>
                {/* Group Active Certificates */}
                {filteredCertificates.filter(c => !c.revoked).length > 0 && (
                  <div className="mb-8">
                    <div className="flex items-center space-x-3 mb-4 px-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <h3 className="text-lg font-bold text-gray-900">
                        Certificats Actifs ({filteredCertificates.filter(c => !c.revoked).length})
                      </h3>
                      <div className="flex-1 h-px bg-gradient-to-r from-green-200 to-transparent"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredCertificates.filter(c => !c.revoked).map((cert, index) => (
                        <motion.div
                          key={cert.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className={`bg-white rounded-2xl shadow-lg border-2 transition-all hover:shadow-xl hover:-translate-y-1 ${cert.revoked ? 'border-red-200 bg-red-50/30' : 'border-gray-100'
                            }`}
                        >
                          <div className={`p-6 rounded-t-2xl ${cert.revoked
                            ? 'bg-gradient-to-r from-red-500 to-red-600'
                            : cert.certType === 'Diplôme' ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                              : cert.certType === 'Certification' ? 'bg-gradient-to-r from-purple-500 to-purple-600'
                                : cert.certType === 'Formation' ? 'bg-gradient-to-r from-green-500 to-green-600'
                                  : cert.certType === 'Attestation' ? 'bg-gradient-to-r from-orange-500 to-orange-600'
                                    : 'bg-gradient-to-r from-gray-500 to-gray-600'
                            }`}>
                            <div className="flex items-start justify-between mb-3">
                              <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                                <Award className="w-6 h-6 text-white" />
                              </div>
                              {cert.revoked ? (
                                <span className="px-3 py-1 bg-red-900/30 backdrop-blur-sm text-white text-xs font-medium rounded-full flex items-center space-x-1">
                                  <XCircle className="w-3 h-3" />
                                  <span>Révoqué</span>
                                </span>
                              ) : (
                                <span className="px-3 py-1 bg-green-500/30 backdrop-blur-sm text-white text-xs font-medium rounded-full flex items-center space-x-1">
                                  <CheckCircle className="w-3 h-3" />
                                  <span>Actif</span>
                                </span>
                              )}
                            </div>
                            <h3 className="text-xl font-bold text-white mb-1 line-clamp-2">
                              {cert.formationName}
                            </h3>
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${cert.certType === 'Diplôme' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                              cert.certType === 'Certification' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                                cert.certType === 'Formation' ? 'bg-green-100 text-green-800 border border-green-200' :
                                  cert.certType === 'Attestation' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                                    'bg-gray-100 text-gray-800 border border-gray-200'
                              }`}>
                              {cert.certType}
                            </span>
                          </div>

                          <div className="p-4 sm:p-6 space-y-3">
                            <div className="flex items-center space-x-3 text-sm">
                              <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              <span className="text-gray-700 font-medium truncate">{cert.issuerName}</span>
                            </div>

                            <div className="flex items-center space-x-3 text-sm">
                              <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              <span className="text-gray-600">{cert.date}</span>
                            </div>

                            <div className="flex items-center space-x-3 text-sm">
                              <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              <span className="text-gray-600 font-mono text-xs truncate">ID: {cert.id}</span>
                            </div>

                            {/* Verification Chip */}
                            <div className="flex items-center space-x-2 pt-2">
                              <a
                                href={`/verify/${cert.id}`}
                                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-cyan-50 to-blue-50 hover:from-cyan-100 hover:to-blue-100 border border-cyan-200 hover:border-cyan-300 rounded-full text-cyan-700 text-xs font-medium transition-all group"
                              >
                                <ExternalLink className="w-3 h-3 group-hover:scale-110 transition-transform" />
                                <span>Vérifier</span>
                              </a>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  copyVerifyLink(cert.id);
                                }}
                                className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${copiedVerifyId === cert.id
                                  ? 'bg-green-100 border border-green-300 text-green-700'
                                  : 'bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 text-gray-600'
                                  }`}
                                title="Copier le lien de vérification"
                              >
                                {copiedVerifyId === cert.id ? (
                                  <><Check className="w-3 h-3" /><span>Copié</span></>
                                ) : (
                                  <><Copy className="w-3 h-3" /><span>Copier</span></>
                                )}
                              </button>
                            </div>

                            <div className="pt-4 flex flex-col sm:flex-row gap-2">
                              <button
                                onClick={() => handleViewCertificate(cert)}
                                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 sm:py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-all active:scale-95"
                              >
                                <Eye className="w-4 h-4" />
                                <span className="text-sm font-medium">Voir</span>
                              </button>
                              <AddToLinkedInButton
                                certificate={cert}
                                studentName={cert.studentName}
                              />
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Group Revoked Certificates */}
                {filteredCertificates.filter(c => c.revoked).length > 0 && (
                  <div className="mb-8">
                    <div className="flex items-center space-x-3 mb-4 px-2">
                      <XCircle className="w-5 h-5 text-red-600" />
                      <h3 className="text-lg font-bold text-gray-900">
                        Certificats Révoqués ({filteredCertificates.filter(c => c.revoked).length})
                      </h3>
                      <div className="flex-1 h-px bg-gradient-to-r from-red-200 to-transparent"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredCertificates.filter(c => c.revoked).map((cert, index) => (
                        <motion.div
                          key={cert.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className="bg-white rounded-2xl shadow-lg border-2 border-red-200 bg-red-50/30 transition-all hover:shadow-xl hover:-translate-y-1"
                        >
                          <div className="p-6 rounded-t-2xl bg-gradient-to-r from-red-500 to-red-600">
                            <div className="flex items-start justify-between mb-3">
                              <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                                <Award className="w-6 h-6 text-white" />
                              </div>
                              <span className="px-3 py-1 bg-red-900/30 backdrop-blur-sm text-white text-xs font-medium rounded-full flex items-center space-x-1">
                                <XCircle className="w-3 h-3" />
                                <span>Révoqué</span>
                              </span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-1 line-clamp-2">
                              {cert.formationName}
                            </h3>
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${cert.certType === 'Diplôme' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                              cert.certType === 'Certification' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                                cert.certType === 'Formation' ? 'bg-green-100 text-green-800 border border-green-200' :
                                  cert.certType === 'Attestation' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                                    'bg-gray-100 text-gray-800 border border-gray-200'
                              }`}>
                              {cert.certType}
                            </span>
                          </div>

                          <div className="p-4 sm:p-6 space-y-3">
                            <div className="flex items-center space-x-3 text-sm">
                              <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              <span className="text-gray-700 font-medium truncate">{cert.issuerName}</span>
                            </div>

                            <div className="flex items-center space-x-3 text-sm">
                              <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              <span className="text-gray-600">{cert.date}</span>
                            </div>

                            <div className="flex items-center space-x-3 text-sm">
                              <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              <span className="text-gray-600 font-mono text-xs truncate">ID: {cert.id}</span>
                            </div>

                            {/* Verification Chip */}
                            <div className="flex items-center space-x-2 pt-2">
                              <a
                                href={`/verify/${cert.id}`}
                                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-cyan-50 to-blue-50 hover:from-cyan-100 hover:to-blue-100 border border-cyan-200 hover:border-cyan-300 rounded-full text-cyan-700 text-xs font-medium transition-all group"
                              >
                                <ExternalLink className="w-3 h-3 group-hover:scale-110 transition-transform" />
                                <span>Vérifier</span>
                              </a>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  copyVerifyLink(cert.id);
                                }}
                                className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${copiedVerifyId === cert.id
                                  ? 'bg-green-100 border border-green-300 text-green-700'
                                  : 'bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 text-gray-600'
                                  }`}
                                title="Copier le lien de vérification"
                              >
                                {copiedVerifyId === cert.id ? (
                                  <><Check className="w-3 h-3" /><span>Copié</span></>
                                ) : (
                                  <><Copy className="w-3 h-3" /><span>Copier</span></>
                                )}
                              </button>
                            </div>

                            <div className="pt-4 flex flex-col sm:flex-row gap-2">
                              <button
                                onClick={() => handleViewCertificate(cert)}
                                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 sm:py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-all active:scale-95"
                              >
                                <Eye className="w-4 h-4" />
                                <span className="text-sm font-medium">Voir</span>
                              </button>
                              <button
                                onClick={() => handleDownload(cert.ipfsHash, cert.id)}
                                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 sm:py-2 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg transition-all active:scale-95"
                              >
                                <Download className="w-4 h-4" />
                                <span className="text-sm font-medium">Télécharger</span>
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
        {/* Transaction History Tab */}
        {activeTab === 'transactions' && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-cyan-50 to-blue-50">
              <div className="flex items-center space-x-3">
                <Activity className="w-6 h-6 text-cyan-600" />
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Historique des Transactions</h3>
                  <p className="text-sm text-gray-600">Toutes vos transactions de certification sur la blockchain</p>
                </div>
              </div>
            </div>

            {loadingTransactions ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-600 border-t-transparent mx-auto mb-4"></div>
                <p className="text-gray-600">Chargement des transactions...</p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="p-12 text-center">
                <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h4 className="text-lg font-bold text-gray-900 mb-2">Aucune transaction</h4>
                <p className="text-gray-600">Vous n'avez pas encore de transactions enregistrées.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Formation / Organisation
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Transaction Hash
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        IPFS
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactions.map((tx, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <div className={`p-2 rounded-lg ${tx.type.startsWith('Diplôme') ? 'bg-blue-100' :
                              tx.type.startsWith('Certification') ? 'bg-purple-100' :
                                tx.type.startsWith('Formation') ? 'bg-green-100' :
                                  tx.type.startsWith('Attestation') ? 'bg-orange-100' :
                                    'bg-cyan-100'
                              }`}>
                              <Award className={`w-4 h-4 ${tx.type.startsWith('Diplôme') ? 'text-blue-600' :
                                tx.type.startsWith('Certification') ? 'text-purple-600' :
                                  tx.type.startsWith('Formation') ? 'text-green-600' :
                                    tx.type.startsWith('Attestation') ? 'text-orange-600' :
                                      'text-cyan-600'
                                }`} />
                            </div>
                            <span className="text-sm font-medium text-gray-900">{tx.type}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{tx.formationName}</div>
                          <div className="text-sm text-gray-500">{tx.issuerName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-900">{tx.date}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {tx.status === 'Confirmé' ? (
                            <span className="px-3 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Confirmé
                            </span>
                          ) : (
                            <span className="px-3 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                              <XCircle className="w-3 h-3 mr-1" />
                              {tx.status}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <code className="text-xs font-mono text-gray-600">
                              {tx.txHash.slice(0, 10)}...{tx.txHash.slice(-8)}
                            </code>
                            <button
                              onClick={() => copyTxHash(tx.txHash)}
                              className="p-1 hover:bg-gray-100 rounded transition-colors"
                              title="Copy transaction hash"
                            >
                              {copiedTxHash === tx.txHash ? (
                                <Check className="w-4 h-4 text-green-600" />
                              ) : (
                                <Copy className="w-4 h-4 text-gray-400" />
                              )}
                            </button>
                            <a
                              href={`${import.meta.env.VITE_ETHERSCAN_BASE_URL}/tx/${tx.txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 hover:bg-gray-100 rounded transition-colors"
                              title="View on Etherscan"
                            >
                              <ExternalLink className="w-4 h-4 text-blue-600" />
                            </a>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {tx.ipfsHash ? (
                              <>
                                <code className="text-xs font-mono text-gray-600">
                                  {tx.ipfsHash.replace('ipfs://', '').slice(0, 8)}...{tx.ipfsHash.replace('ipfs://', '').slice(-6)}
                                </code>
                                <a
                                  href={`https://${import.meta.env.VITE_IPFS_PUBLIC_GATEWAY}/ipfs/${tx.ipfsHash.replace('ipfs://', '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                                  title="View on IPFS"
                                >
                                  <ExternalLink className="w-4 h-4 text-purple-600" />
                                </a>
                              </>
                            ) : (
                              <span className="text-xs text-gray-400 italic">N/A</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Certificate Viewer Modal */}
      <AnimatePresence>
        {selectedCertificate && (
          <CertificateViewer
            certificate={selectedCertificate}
            onClose={() => setSelectedCertificate(null)}
            onDownload={handleDownload}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
