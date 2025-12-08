// src/pages/EmployerVerification.jsx
import { Shield, Search, User, ArrowRight, Sparkles, Lock, Zap, ArrowLeft, Home, Award, CheckCircle, Github, Twitter, Mail, ExternalLink, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

function EmployerVerification({ onNavigateToVerify, onNavigateToProfile, onNavigateHome, onNavigateToEmployer, onConnectWallet }) {
    return (
        <div className="min-h-screen bg-mesh relative overflow-hidden">
            {/* Animated Gradient Orbs */}
            <div className="gradient-orb gradient-orb-1 animate-float"></div>
            <div className="gradient-orb gradient-orb-2 animate-float-delayed"></div>
            <div className="gradient-orb gradient-orb-3 animate-float"></div>

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
                                <p className="text-xs text-gray-500 hidden sm:block">Portail de Vérification Employeur</p>
                            </div>
                        </motion.div>

                        {onNavigateHome && (
                            <motion.button
                                onClick={onNavigateHome}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="group flex items-center space-x-1 sm:space-x-2 px-3 sm:px-5 py-2 sm:py-2.5 glass-dark rounded-xl font-medium hover:shadow-lg transition-all duration-300 border border-gray-200/50"
                            >
                                <Home className="w-5 h-5 text-[var(--color-primary-500)] group-hover:scale-110 transition-transform" />
                                <span className="text-gray-700 group-hover:text-[var(--color-primary-600)] hidden sm:inline">Accueil</span>
                            </motion.button>
                        )}
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-20 relative z-10">
                <div className="text-center mb-10 sm:mb-20">
                    <motion.div
                        className="inline-flex items-center space-x-2 badge badge-primary mb-6 sm:mb-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <Shield className="w-4 h-4" />
                        <span>Portail Employeur & Recruteur</span>
                    </motion.div>

                    <motion.h2
                        className="text-3xl sm:text-5xl md:text-7xl font-bold text-gray-900 mb-6 sm:mb-8 leading-tight font-display"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                    >
                        Vérifier les Diplômes
                        <br />
                        <span className="gradient-text">
                            Sur la Blockchain
                        </span>
                    </motion.h2>

                    <motion.p
                        className="text-base sm:text-xl text-gray-600 max-w-2xl mx-auto mb-8 sm:mb-12 leading-relaxed px-2"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                    >
                        Vérifiez instantanément les certificats ou consultez les profils complets des étudiants pour prendre des décisions de recrutement éclairées.
                    </motion.p>
                </div>

                {/* Two Options */}
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                >
                    {/* Certificate Verification */}
                    <motion.button
                        onClick={onNavigateToVerify}
                        className="group card p-6 sm:p-10 text-left relative overflow-hidden"
                        whileHover={{ y: -8 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        {/* Hover gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary-500)]/5 to-[var(--color-primary-600)]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                        <div className="relative z-10">
                            <div className="bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-primary-600)] rounded-2xl flex items-center justify-center mb-6 sm:mb-8 group-hover:scale-110 transition-transform duration-300 shadow-lg w-14 h-14 sm:w-[72px] sm:h-[72px]">
                                <Search className="w-7 h-7 sm:w-9 sm:h-9 text-white" />
                            </div>
                            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 font-display">
                                Vérifier un Certificat
                            </h3>
                            <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-6 sm:mb-8">
                                Vérifiez rapidement l'authenticité d'un certificat spécifique en utilisant son ID ou son code QR. Parfait pour valider les diplômes pendant le processus de recrutement.
                            </p>
                            <div className="flex items-center text-[var(--color-primary-600)] font-semibold group-hover:translate-x-2 transition-transform duration-300">
                                <span>Commencer la Vérification</span>
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </div>
                        </div>
                    </motion.button>

                    {/* Student Profile Viewer */}
                    <motion.button
                        onClick={onNavigateToProfile}
                        className="group card p-6 sm:p-10 text-left relative overflow-hidden"
                        whileHover={{ y: -8 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        {/* Hover gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-secondary-500)]/5 to-[var(--color-secondary-600)]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                        <div className="relative z-10">
                            <div className="bg-gradient-to-br from-[var(--color-secondary-500)] to-[var(--color-secondary-600)] rounded-2xl flex items-center justify-center mb-6 sm:mb-8 group-hover:scale-110 transition-transform duration-300 shadow-lg w-14 h-14 sm:w-[72px] sm:h-[72px]">
                                <User className="w-7 h-7 sm:w-9 sm:h-9 text-white" />
                            </div>
                            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 font-display">
                                Voir le Profil Étudiant
                            </h3>
                            <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-6 sm:mb-8">
                                Consultez tous les certificats et qualifications pour une adresse étudiante. Nécessite une connexion de portefeuille pour un accès sécurisé aux profils complets.
                            </p>
                            <div className="flex items-center text-[var(--color-secondary-600)] font-semibold group-hover:translate-x-2 transition-transform duration-300">
                                <span>Voir le Profil</span>
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </div>
                        </div>
                    </motion.button>
                </motion.div>

                {/* Features */}
                <motion.div
                    className="mt-16 sm:mt-28 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                >
                    <div className="glass-dark rounded-2xl p-6 sm:p-8 text-center group hover:shadow-lg transition-all duration-300">
                        <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-primary-600)] mb-4 group-hover:scale-110 transition-transform">
                            <Zap className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                        </div>
                        <div className="text-2xl sm:text-3xl font-bold gradient-text mb-2 font-display">Instantané</div>
                        <p className="text-sm sm:text-base text-gray-600">Vérification en temps réel depuis la blockchain</p>
                    </div>
                    <div className="glass-dark rounded-2xl p-6 sm:p-8 text-center group hover:shadow-lg transition-all duration-300">
                        <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-[var(--color-secondary-500)] to-[var(--color-secondary-600)] mb-4 group-hover:scale-110 transition-transform">
                            <Lock className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                        </div>
                        <div className="text-2xl sm:text-3xl font-bold gradient-text-secondary mb-2 font-display">Sécurisé</div>
                        <p className="text-sm sm:text-base text-gray-600">Diplômes vérifiés cryptographiquement</p>
                    </div>
                    <div className="glass-dark rounded-2xl p-6 sm:p-8 text-center group hover:shadow-lg transition-all duration-300">
                        <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-[var(--color-success-500)] to-emerald-600 mb-4 group-hover:scale-110 transition-transform">
                            <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                        </div>
                        <div className="text-2xl sm:text-3xl font-bold text-emerald-600 mb-2 font-display">Fiable</div>
                        <p className="text-sm sm:text-base text-gray-600">Enregistrements de certificats infalsifiables</p>
                    </div>
                </motion.div>
            </main>


            {/* Footer */}
            <footer className="bg-gradient-to-b from-gray-900 to-gray-950 text-gray-300 mt-16 sm:mt-28 relative z-10">
                {/* Top accent line */}
                <div className="h-1 bg-gradient-primary"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
                    {/* Main Footer Content */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12 mb-8 sm:mb-12">
                        {/* Brand Column */}
                        <div className="md:col-span-2">
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="bg-gradient-primary p-3 rounded-xl shadow-lg">
                                    <Shield className="w-7 h-7 text-white" />
                                </div>
                                <div>
                                    <span className="text-2xl font-bold text-white font-display">CertiVerse</span>
                                    <p className="text-xs text-gray-500">Certification sur Blockchain</p>
                                </div>
                            </div>
                            <p className="text-gray-400 leading-relaxed mb-6 max-w-md">
                                Une plateforme décentralisée de certification qui garantit l'authenticité et l'immuabilité de vos diplômes et compétences grâce à la technologie blockchain.
                            </p>
                            {/* Social Links */}
                            <div className="flex space-x-4">
                                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="p-3 bg-gray-800 hover:bg-gray-700 rounded-xl transition-all hover:scale-110 hover:shadow-lg">
                                    <Github className="w-5 h-5 text-gray-400 hover:text-white" />
                                </a>
                                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="p-3 bg-gray-800 hover:bg-gray-700 rounded-xl transition-all hover:scale-110 hover:shadow-lg">
                                    <Twitter className="w-5 h-5 text-gray-400 hover:text-white" />
                                </a>
                                <a href="mailto:contact@certiverse.app" className="p-3 bg-gray-800 hover:bg-gray-700 rounded-xl transition-all hover:scale-110 hover:shadow-lg">
                                    <Mail className="w-5 h-5 text-gray-400 hover:text-white" />
                                </a>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h4 className="text-white font-bold mb-6 font-display">Produit</h4>
                            <ul className="space-y-3">
                                <li>
                                    <button onClick={onNavigateToEmployer} className="text-gray-400 hover:text-white transition-colors flex items-center space-x-2 group">
                                        <CheckCircle className="w-4 h-4 text-[var(--color-primary-500)] group-hover:scale-110 transition-transform" />
                                        <span>Vérifier un certificat</span>
                                    </button>
                                </li>
                                <li>
                                    <button onClick={onConnectWallet} className="text-gray-400 hover:text-white transition-colors flex items-center space-x-2 group">
                                        <Lock className="w-4 h-4 text-[var(--color-primary-500)] group-hover:scale-110 transition-transform" />
                                        <span>Se connecter</span>
                                    </button>
                                </li>
                            </ul>
                        </div>

                        {/* Technology */}
                        <div>
                            <h4 className="text-white font-bold mb-6 font-display">Technologie</h4>
                            <ul className="space-y-3">
                                <li>
                                    <a href="https://ethereum.org" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors flex items-center space-x-2 group">
                                        <div className="w-4 h-4 relative">
                                            <svg viewBox="0 0 256 417" className="w-4 h-4 fill-current">
                                                <path d="M127.961 0l-2.795 9.5v275.668l2.795 2.79 127.962-75.638z" fillOpacity="0.6" />
                                                <path d="M127.962 0L0 212.32l127.962 75.639V154.158z" fillOpacity="0.8" />
                                                <path d="M127.961 312.187l-1.575 1.92v98.199l1.575 4.6L256 236.587z" fillOpacity="0.6" />
                                                <path d="M127.962 416.905v-104.72L0 236.585z" fillOpacity="0.8" />
                                            </svg>
                                        </div>
                                        <span>Ethereum</span>
                                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </a>
                                </li>
                                <li>
                                    <a href="https://ipfs.tech" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors flex items-center space-x-2 group">
                                        <Globe className="w-4 h-4 text-[var(--color-secondary-500)]" />
                                        <span>IPFS / Pinata</span>
                                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </a>
                                </li>
                                <li>
                                    <a href="https://sepolia.etherscan.io" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors flex items-center space-x-2 group">
                                        <div className="w-4 h-4 rounded-full bg-purple-500/20 flex items-center justify-center">
                                            <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                                        </div>
                                        <span>Sepolia Testnet</span>
                                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-800 pt-8">
                        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                            <p className="text-sm text-gray-500">
                                © 2025 CertiVerse. Tous droits réservés.
                            </p>
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                                <span>Propulsé par</span>
                                <div className="flex items-center space-x-1 px-2 py-1 bg-gray-800 rounded-lg">
                                    <svg viewBox="0 0 256 417" className="w-3 h-3 fill-current text-purple-400">
                                        <path d="M127.961 0l-2.795 9.5v275.668l2.795 2.79 127.962-75.638z" fillOpacity="0.6" />
                                        <path d="M127.962 0L0 212.32l127.962 75.639V154.158z" fillOpacity="0.8" />
                                    </svg>
                                    <span className="text-purple-400 font-medium">Ethereum</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default EmployerVerification;
