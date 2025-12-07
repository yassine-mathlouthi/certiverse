// src/pages/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import {
  LogOut, Search, Building2, Award, TrendingUp, Plus, X, Copy, Check,
  AlertCircle, CheckCircle, Ban, ExternalLink, Loader2, Shield, Users,
  Activity, GraduationCap, Briefcase, School, Filter
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminDashboard({ adminAddress, onDisconnect, contract }) {
  const [organizations, setOrganizations] = useState([]);
  const [stats, setStats] = useState({
    totalOrgs: 0,
    activeOrgs: 0,
    totalCertificates: 0,
    revokedCertificates: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('all');
  const [searchStatus, setSearchStatus] = useState('all');
  const [sortOrder, setSortOrder] = useState('recent');
  const [showAddForm, setShowAddForm] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [revokingAddress, setRevokingAddress] = useState(null);
  const [activeTab, setActiveTab] = useState('table');

  const [formData, setFormData] = useState({
    address: '',
    name: '',
    email: '',
    type: 'Université',
    registeredAt: Math.floor(Date.now() / 1000)
  });
  const [formErrors, setFormErrors] = useState({});

  // Charger toutes les données depuis le contrat
  const loadData = async () => {
    if (!contract) return;
    try {
      setLoading(true);
      const globalStats = await contract.getGlobalStats();
      setStats({
        totalOrgs: Number(globalStats[0]),
        activeOrgs: Number(globalStats[1]),
        totalCertificates: Number(globalStats[2]),
        revokedCertificates: Number(globalStats[3])
      });

      const [
        addresses, names, emails, types, actives,
        totalIssued, totalRevoked, uniqueStudents, registeredAt
      ] = await contract.getAllOrganizations();

      const orgsList = addresses.map((addr, i) => ({
        address: addr,
        name: names[i],
        email: emails[i],
        type: types[i],
        status: actives[i] ? 'actif' : 'révoqué',
        certificates: Number(totalIssued[i]),
        revokedCerts: Number(totalRevoked[i]),
        students: Number(uniqueStudents[i]),
        dateAdded: new Date(Number(registeredAt[i]) * 1000).toLocaleDateString('fr-FR'),
        registeredAt: Number(registeredAt[i])
      }));

      setOrganizations(orgsList);
      setLoading(false);
    } catch (err) {
      console.error("Erreur chargement données:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (contract) loadData();
  }, [contract]);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(id);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const validateAddress = (addr) => {
    if (!addr) return 'Adresse requise';
    if (!addr.startsWith('0x')) return 'Doit commencer par 0x';
    if (addr.length !== 42) return 'Doit faire 42 caractères';
    if (!/^0x[a-fA-F0-9]{40}$/.test(addr)) return 'Caractères invalides';
    return '';
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'address') {
      const error = validateAddress(value);
      setFormErrors(prev => ({ ...prev, address: error }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const addressError = validateAddress(formData.address);
    if (addressError || !formData.name || !formData.email) {
      setFormErrors({
        address: addressError,
        name: !formData.name ? 'Nom requis' : '',
        email: !formData.email ? 'Email requis' : ''
      });
      return;
    }

    try {
      setSubmitStatus({ type: 'loading', message: 'Envoi de la transaction...' });
      const tx = await contract.registerOrganization(
        formData.address,
        formData.name,
        formData.email,
        formData.type,
        formData.registeredAt
      );
      setSubmitStatus({ type: 'loading', message: 'Transaction en attente...', txHash: tx.hash });
      await tx.wait();

      setSubmitStatus({
        type: 'success',
        message: 'Organisation enregistrée avec succès !',
        txHash: tx.hash
      });

      toast.success('Organisation enregistrée avec succès !', {
        duration: 4000,
        icon: '✅',
      });

      await loadData();

      setTimeout(() => {
        setShowAddForm(false);
        setFormData({ address: '', name: '', email: '', type: 'Université', registeredAt: Math.floor(Date.now() / 1000) });
        setSubmitStatus(null);
        setFormErrors({});
      }, 3000);
    } catch (err) {
      console.error(err);
      const errorMsg = err.reason || err.error?.message || err.message || "Transaction refusée";
      setSubmitStatus({
        type: 'error',
        message: errorMsg
      });
      toast.error(errorMsg, {
        duration: 5000,
        icon: '❌',
      });
    }
  };

  const handleRevoke = async (orgAddress, orgName) => {
    const confirmToast = toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="font-semibold">Révoquer {orgName} ?</p>
        <p className="text-sm text-gray-600">Cette action est définitive.</p>
        <div className="flex gap-2">
          <button
            onClick={() => {
              toast.dismiss(t.id);
              proceedRevoke(orgAddress, orgName);
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

  const proceedRevoke = async (orgAddress, orgName) => {
    setOrganizations(prev =>
      prev.map(org =>
        org.address === orgAddress
          ? { ...org, status: 'révoqué' }
          : org
      )
    );
    setStats(prev => ({ ...prev, activeOrgs: prev.activeOrgs - 1 }));
    setRevokingAddress(orgAddress);

    const loadingToast = toast.loading('Révocation en cours...');

    try {
      const tx = await contract.revokeOrganization(orgAddress);
      await tx.wait();
      toast.success(`${orgName} révoquée avec succès`, { id: loadingToast });
    } catch (err) {
      console.error("Échec révocation:", err);

      setOrganizations(prev =>
        prev.map(org =>
          org.address === orgAddress
            ? { ...org, status: 'actif' }
            : org
        )
      );
      setStats(prev => ({ ...prev, activeOrgs: prev.activeOrgs + 1 }));

      toast.error("Échec de la révocation : " + (err.reason || err.message || "Transaction refusée"), { id: loadingToast });
    } finally {
      setRevokingAddress(null);
    }
  };

  const truncateAddress = (addr) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const getTypeConfig = (type) => {
    const config = {
      'Université': {
        badge: 'badge-diplome',
        icon: GraduationCap,
        color: 'blue'
      },
      'Organisme de formation': {
        badge: 'badge-formation',
        icon: School,
        color: 'emerald'
      },
      'Centre de certification': {
        badge: 'badge-certification',
        icon: Award,
        color: 'purple'
      },
      'Entreprise': {
        badge: 'badge-attestation',
        icon: Briefcase,
        color: 'orange'
      },
    };
    return config[type] || { badge: 'badge-primary', icon: Building2, color: 'gray' };
  };

  const filteredOrgs = organizations
    .filter(org => {
      const matchesSearch = org.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = searchType === 'all' || org.type === searchType;
      const matchesStatus = searchStatus === 'all' || org.status === searchStatus;
      return matchesSearch && matchesType && matchesStatus;
    })
    .sort((a, b) => {
      if (sortOrder === 'recent') {
        return b.registeredAt - a.registeredAt;
      } else {
        return a.registeredAt - b.registeredAt;
      }
    });

  // Analytics calculations
  const getOrgsByType = () => {
    const counts = {};
    organizations.forEach(org => {
      counts[org.type] = (counts[org.type] || 0) + 1;
    });
    return counts;
  };

  const getTopOrgs = () => {
    return [...organizations]
      .sort((a, b) => b.certificates - a.certificates)
      .slice(0, 5);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-mesh flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[var(--color-primary-500)] border-t-transparent mx-auto mb-4"></div>
          <p className="text-xl font-semibold gradient-text font-display">Chargement des données blockchain...</p>
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

      {/* Header */}
      <header className="glass sticky top-0 z-40 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h1 className="text-2xl font-bold text-gray-900 font-display">Administration</h1>
              <p className="text-sm text-gray-500">Gestion des Organisations</p>
            </motion.div>
            <div className="flex items-center space-x-4">
              <motion.div
                className="bg-gradient-primary px-5 py-2.5 rounded-xl cursor-pointer hover:shadow-lg transition-all glow-hover"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <button
                  onClick={() => copyToClipboard(adminAddress, 'admin')}
                  className="flex items-center space-x-2 text-white"
                >
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-mono">{truncateAddress(adminAddress)}</span>
                  {copiedAddress === 'admin' ? (
                    <Check className="w-4 h-4 text-green-300" />
                  ) : (
                    <Copy className="w-4 h-4 opacity-70 hover:opacity-100" />
                  )}
                </button>
              </motion.div>
              <motion.button
                onClick={onDisconnect}
                className="flex items-center space-x-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 font-medium transition-all"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <LogOut className="w-4 h-4" />
                <span>Déconnexion</span>
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 relative z-10">
        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Organisations', value: stats.totalOrgs, icon: Building2, gradient: 'from-[var(--color-primary-500)] to-[var(--color-primary-600)]' },
            { label: 'Organisations Actives', value: stats.activeOrgs, icon: CheckCircle, gradient: 'from-emerald-500 to-emerald-600' },
            { label: 'Total Certificats', value: stats.totalCertificates, icon: Award, gradient: 'from-[var(--color-accent-500)] to-[var(--color-accent-600)]' },
            { label: 'Certificats Révoqués', value: stats.revokedCertificates, icon: Ban, gradient: 'from-red-500 to-red-600' }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              className="card p-6 stat-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`bg-gradient-to-br ${stat.gradient} p-3 rounded-xl shadow-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-3xl font-bold text-gray-900 font-display">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => setActiveTab('table')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all ${activeTab === 'table'
              ? 'bg-white shadow-lg text-[var(--color-primary-600)] border-2 border-[var(--color-primary-200)]'
              : 'bg-white/50 text-gray-600 hover:bg-white'
              }`}
          >
            <Building2 className="w-5 h-5" />
            <span>Organisations</span>
            <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === 'table' ? 'bg-[var(--color-primary-100)] text-[var(--color-primary-700)]' : 'bg-gray-200 text-gray-600'}`}>
              {stats.totalOrgs}
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

        {/* Organizations Table Tab */}
        {activeTab === 'table' && (
          <motion.div
            className="card overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="p-6 border-b border-gray-100">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 mb-6">
                <h2 className="text-xl font-bold text-gray-900 font-display">Organisations Enregistrées</h2>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Ajouter une organisation</span>
                </button>
              </div>

              {/* Enhanced Filters */}
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Rechercher par adresse ou nom..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-modern"
                    style={{ paddingLeft: '3rem' }}
                  />
                </div>
                <div className="flex gap-3">
                  <select
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value)}
                    className="input-modern w-full md:w-auto appearance-none cursor-pointer"
                    style={{ minWidth: '200px' }}
                  >
                    <option value="all">Tous les types</option>
                    <option value="Université">Université</option>
                    <option value="Organisme de formation">Organisme de formation</option>
                    <option value="Centre de certification">Centre de certification</option>
                    <option value="Entreprise">Entreprise</option>
                  </select>
                  <select
                    value={searchStatus}
                    onChange={(e) => setSearchStatus(e.target.value)}
                    className="input-modern w-full md:w-auto"
                    style={{ minWidth: '140px' }}
                  >
                    <option value="all">Tous statuts</option>
                    <option value="actif">Actif</option>
                    <option value="révoqué">Révoqué</option>
                  </select>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="input-modern w-full md:w-auto"
                    style={{ minWidth: '140px' }}
                  >
                    <option value="recent">Plus récent</option>
                    <option value="oldest">Plus ancien</option>
                  </select>
                </div>
              </div>

              {/* Active filters summary */}
              {(searchType !== 'all' || searchStatus !== 'all' || searchTerm) && (
                <div className="flex items-center gap-2 mt-4 flex-wrap">
                  <span className="text-sm text-gray-500">Filtres actifs:</span>
                  {searchTerm && (
                    <span className="badge badge-primary text-xs">
                      Recherche: "{searchTerm}"
                      <button onClick={() => setSearchTerm('')} className="ml-1 hover:text-red-500">×</button>
                    </span>
                  )}
                  {searchType !== 'all' && (
                    <span className="badge badge-primary text-xs">
                      Type: {searchType}
                      <button onClick={() => setSearchType('all')} className="ml-1 hover:text-red-500">×</button>
                    </span>
                  )}
                  {searchStatus !== 'all' && (
                    <span className="badge badge-primary text-xs">
                      Statut: {searchStatus}
                      <button onClick={() => setSearchStatus('all')} className="ml-1 hover:text-red-500">×</button>
                    </span>
                  )}
                  <button
                    onClick={() => { setSearchTerm(''); setSearchType('all'); setSearchStatus('all'); }}
                    className="text-xs text-red-500 hover:underline ml-2"
                  >
                    Effacer tout
                  </button>
                </div>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="table-modern">
                <thead>
                  <tr>
                    <th>Adresse</th>
                    <th>Organisation</th>
                    <th>Type</th>
                    <th>Certificats</th>
                    <th>Étudiants</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrgs.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-16 text-center">
                        <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 font-medium">Aucune organisation trouvée</p>
                      </td>
                    </tr>
                  ) : (
                    filteredOrgs.map((org, index) => {
                      const typeConfig = getTypeConfig(org.type);
                      const TypeIcon = typeConfig.icon;
                      return (
                        <motion.tr
                          key={org.address}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <td>
                            <div className="flex flex-col gap-1">
                              <button
                                onClick={() => copyToClipboard(org.address, org.address)}
                                className="flex items-center space-x-2 font-mono text-sm text-gray-700 hover:text-[var(--color-primary-600)] transition-colors"
                              >
                                <span>{truncateAddress(org.address)}</span>
                                {copiedAddress === org.address ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                              </button>
                              <a
                                href={`https://sepolia.etherscan.io/address/${org.address}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-xs text-[var(--color-primary-500)] hover:text-[var(--color-primary-700)] hover:underline transition-colors"
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span>Etherscan</span>
                              </a>
                            </div>
                          </td>
                          <td>
                            <div>
                              <p className="font-semibold text-gray-900">{org.name}</p>
                              <p className="text-sm text-gray-500">{org.email}</p>
                              <p className="text-xs text-gray-400 mt-1">Ajouté le {org.dateAdded}</p>
                            </div>
                          </td>
                          <td>
                            <span className={`badge ${typeConfig.badge}`}>
                              {org.type}
                            </span>
                          </td>
                          <td>
                            <div className="flex flex-col">
                              <span className="font-bold text-gray-900 text-lg">{org.certificates}</span>
                              {org.revokedCerts > 0 && (
                                <span className="text-xs text-red-500 flex items-center gap-1">
                                  <Ban className="w-3 h-3" />
                                  {org.revokedCerts} révoqué{org.revokedCerts > 1 ? 's' : ''}
                                </span>
                              )}
                            </div>
                          </td>
                          <td>
                            <div className="flex items-center gap-1.5">
                              <Users className="w-4 h-4 text-gray-400" />
                              <span className="font-semibold text-gray-700">{org.students}</span>
                            </div>
                          </td>
                          <td>
                            {org.status === 'actif' ? (
                              <span className="badge badge-success">
                                <CheckCircle className="w-4 h-4" />
                                <span>Actif</span>
                              </span>
                            ) : (
                              <span className="badge badge-error">
                                <Ban className="w-4 h-4" />
                                <span>Révoqué</span>
                              </span>
                            )}
                          </td>
                          <td>
                            {org.status === 'actif' && (
                              <button
                                onClick={() => handleRevoke(org.address, org.name)}
                                disabled={revokingAddress === org.address}
                                className="px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
                              >
                                {revokingAddress === org.address ? (
                                  <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Révocation...</span>
                                  </>
                                ) : (
                                  'Révoquer'
                                )}
                              </button>
                            )}
                          </td>
                        </motion.tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="grid md:grid-cols-2 gap-6">
              {/* Organisations par type */}
              <div className="card p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6 font-display flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[var(--color-primary-500)]" />
                  Répartition par Type
                </h3>
                <div className="space-y-4">
                  {Object.entries(getOrgsByType()).map(([type, count]) => {
                    const typeConfig = getTypeConfig(type);
                    const TypeIcon = typeConfig.icon;
                    const percentage = Math.round((count / organizations.length) * 100);
                    return (
                      <div key={type}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded-lg bg-${typeConfig.color}-100`}>
                              <TypeIcon className={`w-4 h-4 text-${typeConfig.color}-600`} />
                            </div>
                            <span className="text-sm font-medium text-gray-700">{type}</span>
                          </div>
                          <span className="text-sm font-bold text-gray-900">{count} ({percentage}%)</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full bg-gradient-to-r ${typeConfig.badge.includes('blue') ? 'from-blue-500 to-blue-600' :
                              typeConfig.badge.includes('emerald') ? 'from-emerald-500 to-emerald-600' :
                                typeConfig.badge.includes('purple') ? 'from-purple-500 to-purple-600' :
                                  'from-orange-500 to-orange-600'}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Top organisations */}
              <div className="card p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6 font-display flex items-center gap-2">
                  <Award className="w-5 h-5 text-[var(--color-accent-500)]" />
                  Top 5 Organisations
                </h3>
                <div className="space-y-3">
                  {getTopOrgs().map((org, index) => {
                    const typeConfig = getTypeConfig(org.type);
                    return (
                      <div key={org.address} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-400' : 'bg-gray-300'
                          }`}>
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate">{org.name}</p>
                          <p className="text-xs text-gray-500">{org.type}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-[var(--color-primary-600)]">{org.certificates}</p>
                          <p className="text-xs text-gray-500">certificats</p>
                        </div>
                      </div>
                    );
                  })}
                  {organizations.length === 0 && (
                    <p className="text-center text-gray-500 py-8">Aucune donnée disponible</p>
                  )}
                </div>
              </div>

              {/* Statistiques globales */}
              <div className="card p-6 md:col-span-2">
                <h3 className="text-lg font-bold text-gray-900 mb-6 font-display flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                  Vue d'Ensemble
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center p-4 bg-blue-50 rounded-2xl">
                    <p className="text-3xl font-bold text-blue-600 font-display">{stats.activeOrgs}</p>
                    <p className="text-sm text-gray-600 mt-1">Organisations Actives</p>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-2xl">
                    <p className="text-3xl font-bold text-red-600 font-display">{stats.totalOrgs - stats.activeOrgs}</p>
                    <p className="text-sm text-gray-600 mt-1">Organisations Révoquées</p>
                  </div>
                  <div className="text-center p-4 bg-emerald-50 rounded-2xl">
                    <p className="text-3xl font-bold text-emerald-600 font-display">{stats.totalCertificates - stats.revokedCertificates}</p>
                    <p className="text-sm text-gray-600 mt-1">Certificats Valides</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-2xl">
                    <p className="text-3xl font-bold text-purple-600 font-display">
                      {stats.totalOrgs > 0 ? Math.round(stats.totalCertificates / stats.totalOrgs) : 0}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">Moyenne par Org</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </main>

      {/* Modal Ajout Organisation */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            className="fixed inset-0 modal-backdrop flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="sticky top-0 bg-gradient-primary px-6 py-5 flex items-center justify-between rounded-t-3xl">
                <div className="flex items-center space-x-3">
                  <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white font-display">Ajouter une Organisation</h3>
                </div>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setFormData({ address: '', name: '', email: '', type: 'Université' });
                    setFormErrors({});
                    setSubmitStatus(null);
                  }}
                  className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {submitStatus && (
                  <div className={`p-4 rounded-xl border-2 ${submitStatus.type === 'success' ? 'bg-green-50 border-green-200' : submitStatus.type === 'loading' ? 'bg-[var(--color-primary-50)] border-[var(--color-primary-200)]' : 'bg-red-50 border-red-200'}`}>
                    <div className="flex items-center space-x-3">
                      {submitStatus.type === 'success' ? <CheckCircle className="w-5 h-5 text-green-600" /> :
                        submitStatus.type === 'loading' ? <Loader2 className="w-5 h-5 text-[var(--color-primary-600)] animate-spin" /> :
                          <AlertCircle className="w-5 h-5 text-red-600" />}
                      <p className={`font-medium ${submitStatus.type === 'success' ? 'text-green-800' : submitStatus.type === 'loading' ? 'text-[var(--color-primary-800)]' : 'text-red-800'}`}>
                        {submitStatus.message}
                      </p>
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Adresse Ethereum *</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="0x..."
                    className={`input-modern font-mono ${formErrors.address ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-200' : ''}`}
                  />
                  {formErrors.address && <p className="mt-1 text-sm text-red-600">{formErrors.address}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nom *</label>
                  <input type="text" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} placeholder="Université de Tunis" className="input-modern" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                  <input type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} placeholder="contact@org.tn" className="input-modern" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Type *</label>
                  <select value={formData.type} onChange={(e) => handleInputChange('type', e.target.value)} className="input-modern">
                    <option value="Université">Université</option>
                    <option value="Organisme de formation">Organisme de formation</option>
                    <option value="Centre de certification">Centre de certification</option>
                    <option value="Entreprise">Entreprise</option>
                  </select>
                </div>
                <div className="flex space-x-4 pt-4">
                  <button type="button" onClick={() => setShowAddForm(false)} className="btn-secondary flex-1">
                    Annuler
                  </button>
                  <button type="submit" className="btn-primary flex-1">
                    Enregistrer sur la blockchain
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}