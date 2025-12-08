// src/pages/HomePage.jsx
import { Shield, Award, CheckCircle, Sparkles, Zap, Github, Twitter, Mail, ExternalLink, Globe, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

function HomePage({ onConnectWallet, onNavigateToEmployer }) {
  return (
    <div className="min-h-screen bg-mesh relative overflow-hidden">
      {/* Animated Gradient Orbs */}
      <div className="gradient-orb gradient-orb-1 animate-float"></div>
      <div className="gradient-orb gradient-orb-2 animate-float-delayed"></div>
      <div className="gradient-orb gradient-orb-3 animate-float"></div>

      {/* Navigation */}
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
                <p className="text-xs text-gray-500 hidden sm:block">Certification sur Blockchain</p>
              </div>
            </motion.div>

            {onNavigateToEmployer && (
              <motion.button
                onClick={onNavigateToEmployer}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="group px-3 sm:px-5 py-2 sm:py-2.5 glass-dark rounded-xl font-medium flex items-center space-x-2 hover:shadow-lg transition-all duration-300 border border-gray-200/50"
              >
                <CheckCircle className="w-5 h-5 text-[var(--color-primary-500)] group-hover:scale-110 transition-transform" />
                <span className="text-gray-700 group-hover:text-[var(--color-primary-600)] hidden sm:inline">Employer Portal</span>
              </motion.button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-20 relative z-10">
        <div className="text-center mb-10 sm:mb-20">
          <motion.div
            className="inline-flex items-center space-x-2 badge badge-primary mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Sparkles className="w-4 h-4" />
            <span>Plateforme de Certification Décentralisée</span>
          </motion.div>

          <motion.h2
            className="text-3xl sm:text-5xl md:text-7xl font-bold text-gray-900 mb-6 sm:mb-8 leading-tight font-display"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Vos compétences certifiées
            <br />
            <span className="gradient-text">
              sur la blockchain
            </span>
          </motion.h2>

          <motion.p
            className="text-base sm:text-xl text-gray-600 max-w-2xl mx-auto mb-8 sm:mb-14 leading-relaxed px-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            Une solution sécurisée, transparente et infalsifiable pour la certification
            des compétences professionnelles et académiques.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-5 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <button
              onClick={onConnectWallet}
              className="group relative px-6 sm:px-8 py-3 sm:py-4 bg-gradient-primary text-white rounded-2xl font-semibold text-base sm:text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 flex items-center space-x-2 sm:space-x-3 glow-hover overflow-hidden"
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>

              {/* MetaMask Fox Logo */}
              <svg className="w-7 h-7 relative z-10" viewBox="0 0 35 33" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M32.9582 1L19.8241 10.7183L22.2665 4.99099L32.9582 1Z" fill="#E17726" stroke="#E17726" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2.66296 1L15.6799 10.809L13.3547 4.99098L2.66296 1Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M28.2295 23.5334L24.7346 28.872L32.2271 30.9323L34.3761 23.6501L28.2295 23.5334Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M1.27271 23.6501L3.40658 30.9323L10.8844 28.872L7.40458 23.5334L1.27271 23.6501Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M10.4706 14.5149L8.39209 17.6507L15.7968 17.9888L15.5477 9.97754L10.4706 14.5149Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M25.1505 14.5149L19.9925 9.88647L19.8241 17.9888L27.2289 17.6507L25.1505 14.5149Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M10.8844 28.8721L15.3416 26.7072L11.4924 23.6989L10.8844 28.8721Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M20.2795 26.7072L24.7346 28.8721L24.1287 23.6989L20.2795 26.7072Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M24.7346 28.8721L20.2795 26.7072L20.6399 29.6088L20.5991 30.8412L24.7346 28.8721Z" fill="#D5BFB2" stroke="#D5BFB2" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M10.8844 28.8721L15.0199 30.8412L14.9937 29.6088L15.3416 26.7072L10.8844 28.8721Z" fill="#D5BFB2" stroke="#D5BFB2" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M15.0998 21.7842L11.3855 20.6963L13.9942 19.4893L15.0998 21.7842Z" fill="#233447" stroke="#233447" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M20.5214 21.7842L21.6269 19.4893L24.2503 20.6963L20.5214 21.7842Z" fill="#233447" stroke="#233447" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M10.8844 28.872L11.5217 23.5334L7.40454 23.6501L10.8844 28.872Z" fill="#CC6228" stroke="#CC6228" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M24.0994 23.5334L24.7346 28.872L28.2295 23.6501L24.0994 23.5334Z" fill="#CC6228" stroke="#CC6228" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M27.2289 17.6506L19.8241 17.9887L20.5214 21.7841L21.6269 19.4893L24.2503 20.6962L27.2289 17.6506Z" fill="#CC6228" stroke="#CC6228" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M11.3855 20.6962L13.9942 19.4893L15.0998 21.7841L15.7968 17.9887L8.39209 17.6506L11.3855 20.6962Z" fill="#CC6228" stroke="#CC6228" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8.39209 17.6506L11.4924 23.6989L11.3855 20.6962L8.39209 17.6506Z" fill="#E27525" stroke="#E27525" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M24.2503 20.6962L24.1287 23.6989L27.2289 17.6506L24.2503 20.6962Z" fill="#E27525" stroke="#E27525" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M15.7968 17.9888L15.0998 21.7842L15.9785 26.2541L16.1753 20.3567L15.7968 17.9888Z" fill="#E27525" stroke="#E27525" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M19.8241 17.9888L19.4604 20.3421L19.6425 26.2541L20.5214 21.7842L19.8241 17.9888Z" fill="#E27525" stroke="#E27525" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M20.5214 21.7843L19.6425 26.2542L20.2795 26.7073L24.1287 23.699L24.2503 20.6963L20.5214 21.7843Z" fill="#F5841F" stroke="#F5841F" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M11.3855 20.6963L11.4924 23.699L15.3416 26.7073L15.9785 26.2542L15.0998 21.7843L11.3855 20.6963Z" fill="#F5841F" stroke="#F5841F" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M20.5991 30.8412L20.6399 29.6088L20.3088 29.3193H15.3124L14.9937 29.6088L15.0199 30.8412L10.8844 28.8721L12.3536 30.0645L15.2683 32.0336H20.3527L23.2821 30.0645L24.7346 28.8721L20.5991 30.8412Z" fill="#C0AC9D" stroke="#C0AC9D" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M20.2795 26.7072L19.6425 26.2541H15.9785L15.3416 26.7072L14.9937 29.6088L15.3124 29.3193H20.3088L20.6399 29.6088L20.2795 26.7072Z" fill="#161616" stroke="#161616" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M33.5166 11.3532L34.6221 6.0146L32.9582 1L20.2795 10.3801L25.1505 14.5149L32.0602 16.5136L33.5873 14.7403L32.9289 14.2579L33.9983 13.2819L33.1927 12.6637L34.262 11.8231L33.5166 11.3532Z" fill="#763E1A" stroke="#763E1A" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M1 6.0146L2.1202 11.3532L1.35962 11.8231L2.42888 12.6637L1.62321 13.2819L2.69247 14.2579L2.03412 14.7403L3.56116 16.5136L10.4706 14.5149L15.3416 10.3801L2.66295 1L1 6.0146Z" fill="#763E1A" stroke="#763E1A" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M32.0602 16.5137L25.1505 14.515L27.2289 17.6508L24.1287 23.699L28.2295 23.6502H34.3761L32.0602 16.5137Z" fill="#F5841F" stroke="#F5841F" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M10.4706 14.515L3.56116 16.5137L1.27271 23.6502H7.40458L11.4924 23.699L8.39209 17.6508L10.4706 14.515Z" fill="#F5841F" stroke="#F5841F" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M19.8241 17.9888L20.2795 10.3801L22.2665 4.99097H13.3547L15.3416 10.3801L15.7968 17.9888L15.9639 20.3713L15.9785 26.2541H19.6425L19.6571 20.3713L19.8241 17.9888Z" fill="#F5841F" stroke="#F5841F" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="relative z-10">Connecter avec MetaMask</span>
            </button>

            <button
              onClick={onNavigateToEmployer}
              className="btn-secondary flex items-center space-x-3 text-lg gradient-border"
            >
              <CheckCircle className="w-6 h-6" />
              <span>Vérifier un certificat</span>
            </button>
          </motion.div>
        </div>

        {/* Feature Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mt-16 sm:mt-28"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <motion.div
            className="card p-6 sm:p-8 group"
            whileHover={{ y: -8, rotateY: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-primary-600)] w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3 font-display">
              Sécurité Maximale
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Vos certificats sont enregistrés sur la blockchain Ethereum,
              garantissant leur authenticité et leur immuabilité.
            </p>
          </motion.div>

          <motion.div
            className="card p-6 sm:p-8 group"
            whileHover={{ y: -8, rotateY: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="bg-gradient-to-br from-[var(--color-secondary-500)] to-[var(--color-secondary-600)] w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3 font-display">
              Vérification Instantanée
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Vérifiez l'authenticité de n'importe quel certificat en quelques
              secondes grâce à la technologie blockchain.
            </p>
          </motion.div>

          <motion.div
            className="card p-6 sm:p-8 group"
            whileHover={{ y: -8, rotateY: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="bg-gradient-to-br from-[var(--color-success-500)] to-emerald-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3 font-display">
              Reconnaissance Universelle
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Des certificats reconnus par les organisations du monde entier,
              accessibles partout et à tout moment.
            </p>
          </motion.div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          className="mt-16 sm:mt-28 relative"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <div className="absolute inset-0 bg-gradient-primary rounded-2xl sm:rounded-3xl blur-xl opacity-20 animate-pulse-glow"></div>
          <div className="relative bg-gradient-primary rounded-2xl sm:rounded-3xl p-6 sm:p-14 text-center text-white shadow-2xl overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

            <h3 className="text-2xl sm:text-4xl font-bold mb-4 sm:mb-5 relative z-10 font-display">
              Prêt à sécuriser vos certifications ?
            </h3>
            <p className="text-base sm:text-xl text-white/90 mb-6 sm:mb-10 relative z-10">
              Rejoignez des milliers d'organisations et d'utilisateurs qui font confiance à CertiVerse
            </p>
            <button
              onClick={onConnectWallet}
              className="relative z-10 px-10 py-4 bg-white text-[var(--color-primary-600)] rounded-2xl font-bold text-lg hover:bg-gray-50 transform hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
            >
              Commencer maintenant
            </button>
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

export default HomePage;
