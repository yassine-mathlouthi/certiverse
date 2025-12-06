import { useState, useEffect } from 'react';
import { Shield, Search, CheckCircle, XCircle, AlertCircle, ArrowLeft, FileText, Calendar, User, Building2, Download, Eye } from 'lucide-react';
import { getContractReadOnly } from '../utils/contract';
import { downloadCertificate, viewCertificate } from '../utils/certificateUtils';

function VerifyCertificate({ onBack, initialCertId }) {
  const [certId, setCertId] = useState('');
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);
  const [htmlContent, setHtmlContent] = useState('');
  const [loadingCertificate, setLoadingCertificate] = useState(false);

  // Vérifier automatiquement si un ID initial est fourni (via QR code)
  useEffect(() => {
    if (initialCertId) {
      setCertId(initialCertId);
      // Déclencher la vérification automatiquement
      setTimeout(() => {
        handleVerify(initialCertId);
      }, 100);
    }
  }, [initialCertId]);

  // Fonction pour charger le certificat depuis IPFS
  const loadCertificateFromIPFS = async (ipfsHash) => {
    try {
      setLoadingCertificate(true);
      const cid = ipfsHash.replace('ipfs://', '');
      const gateway = import.meta.env.VITE_PINATA_GATEWAY;
      const response = await fetch(`https://${gateway}/ipfs/${cid}`);
      if (!response.ok) throw new Error(`Erreur HTTP ${response.status}`);
      
      let content = await response.text();
      
      // Améliorer le style pour l'affichage intégré
      const styledContent = content.replace(
        '</head>',
        `<style>
          body { background: white !important; }
          .certificate { box-shadow: none !important; }
        </style></head>`
      );
      
      setHtmlContent(styledContent);
    } catch (err) {
      console.error('Erreur chargement IPFS:', err);
    } finally {
      setLoadingCertificate(false);
    }
  };

  const handleVerify = async (idToVerify = null) => {
    // S'assurer que targetId est une chaîne de caractères
    const targetId = idToVerify || certId;
    
    if (!targetId || (typeof targetId === 'string' && targetId.trim() === '')) {
      setError('Veuillez entrer un ID de certificat');
      return;
    }

    setLoading(true);
    setError('');
    setNotFound(false);
    setCertificate(null);
    setHtmlContent(''); // Réinitialiser le contenu HTML

    try {
      // Extraire le numéro de l'ID (supporte "14" ou "CERT-2025-0014")
      let numericId = String(targetId).trim();
      
      // Si le format est CERT-YYYY-NNNN, extraire juste le nombre à la fin
      const certFormatMatch = numericId.match(/CERT-\d{4}-(\d+)/i);
      if (certFormatMatch) {
        numericId = certFormatMatch[1];
      }
      
      // Enlever les zéros en début
      numericId = numericId.replace(/^0+/, '') || '0';
      

      const contract = getContractReadOnly();
      
      const cert = await contract.getCertificate(numericId);





      setCertificate({
        id: cert.id.toString(),
        issuer: cert.issuer,
        issuerName: cert.issuerName || 'Non spécifié',
        student: cert.student,
        studentName: cert.studentName || 'Non spécifié',
        studentEmail: cert.studentEmail || 'Non spécifié',
        formationName: cert.formationName || 'Non spécifié',
        certType: cert.certType || 'Non spécifié',
        ipfsHash: cert.ipfsHash || '',
        issuedAt: cert.issuedAt && Number(cert.issuedAt) > 0 
          ? new Date(Number(cert.issuedAt) * 1000).toLocaleDateString('fr-FR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })
          : 'Date non disponible',
        revoked: cert.revoked || false
      });

      // Charger automatiquement le certificat depuis IPFS
      if (cert.ipfsHash) {
        loadCertificateFromIPFS(cert.ipfsHash);
      }
    } catch (err) {
      if (err.message && err.message.includes('network')) {
        setError('Erreur de connexion au réseau blockchain. Vérifiez votre connexion Internet.');
      } else if (err.message && err.message.includes('timeout')) {
        setError('La requête a expiré. Le réseau blockchain est peut-être surchargé. Réessayez dans quelques instants.');
      } else {
        setError(`Erreur lors de la vérification du certificat , l'id n'existe pas.`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-blue-600 to-cyan-600 p-2 rounded-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  CertiVerse
                </h1>
                <p className="text-xs text-gray-500">Vérification de Certificat</p>
              </div>
            </div>
            <button
              onClick={onBack}
              className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Retour</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Search className="w-4 h-4" />
            <span>Vérification sur la Blockchain</span>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-3">
            Vérifier un certificat
          </h2>
          <p className="text-gray-600">
            Entrez l'ID du certificat pour vérifier son authenticité sur la blockchain
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="certId" className="block text-sm font-medium text-gray-700 mb-2">
                ID du certificat
              </label>
              <input
                id="certId"
                type="text"
                value={certId}
                onChange={(e) => setCertId(e.target.value)}
                placeholder="Ex: 14 ou CERT-2025-0014"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-600 focus:outline-none transition-colors"
                onKeyPress={(e) => e.key === 'Enter' && handleVerify()}
              />
            </div>
            <div className="sm:pt-7">
              <button
                onClick={handleVerify}
                disabled={loading}
                className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
              >
                <Search className="w-5 h-5" />
                <span>{loading ? 'Vérification...' : 'Vérifier'}</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700">{error}</p>
            </div>
          )}
        </div>

        {notFound && (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Certificat non trouvé
            </h3>
            <p className="text-gray-600">
              Aucun certificat ne correspond à l'ID #{certId}
            </p>
          </div>
        )}

        {certificate && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className={`p-6 ${certificate.revoked ? 'bg-red-50' : 'bg-green-50'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {certificate.revoked ? (
                    <XCircle className="w-8 h-8 text-red-600" />
                  ) : (
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  )}
                  <div>
                    <h3 className={`text-xl font-bold ${certificate.revoked ? 'text-red-900' : 'text-green-900'}`}>
                      {certificate.revoked ? 'Certificat Révoqué' : 'Certificat Valide'}
                    </h3>
                    <p className={certificate.revoked ? 'text-red-700' : 'text-green-700'}>
                      {certificate.revoked ? 'Ce certificat a été révoqué par l\'émetteur' : 'Vérifié sur la blockchain Ethereum'}
                    </p>
                  </div>
                </div>
                <div className="bg-white px-4 py-2 rounded-lg">
                  <span className="text-sm font-medium text-gray-600">ID:</span>
                  <span className="ml-2 text-lg font-bold text-gray-900">#{certificate.id}</span>
                </div>
              </div>
            </div>

            {/* Affichage du certificat directement dans l'interface */}
            {certificate.ipfsHash && (
              <div className="border-t border-gray-200">
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-8 py-4">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <span>Aperçu du certificat</span>
                  </h3>
                </div>
                <div className="bg-gray-50 p-4">
                  {loadingCertificate ? (
                    <div className="flex flex-col items-center justify-center py-20">
                      <div className="animate-spin rounded-full h-14 w-14 border-4 border-blue-600 border-t-transparent mb-4"></div>
                      <p className="text-gray-600 font-medium">Chargement du certificat depuis IPFS...</p>
                    </div>
                  ) : htmlContent ? (
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                      <iframe
                        srcDoc={htmlContent}
                        title={`Certificat ${certificate.id}`}
                        className="w-full border-0 bg-white"
                        style={{ height: '800px' }}
                        sandbox="allow-scripts allow-same-origin"
                      />
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p>Impossible de charger le certificat</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="p-8 border-t border-gray-200">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <User className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-medium text-gray-500">Étudiant</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">{certificate.studentName}</p>
                    <p className="text-sm text-gray-600">{certificate.studentEmail}</p>
                    <p className="text-xs text-gray-400 font-mono break-all">{certificate.student}</p>
                  </div>

                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Building2 className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-medium text-gray-500">Organisation émettrice</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">{certificate.issuerName}</p>
                    <p className="text-xs text-gray-400 font-mono break-all">{certificate.issuer}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-medium text-gray-500">Formation</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">{certificate.formationName}</p>
                    <p className="text-sm text-gray-600">{certificate.certType}</p>
                  </div>

                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-medium text-gray-500">Date d'émission</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">{certificate.issuedAt}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-500">Hash IPFS</span>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors">
                  <a
                    href={`https://${import.meta.env.VITE_PINATA_GATEWAY}/ipfs/${certificate.ipfsHash.replace('ipfs://', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-mono text-blue-600 hover:text-blue-800 hover:underline break-all flex items-center space-x-2"
                  >
                    <span>{certificate.ipfsHash}</span>
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
                {certificate.ipfsHash && (
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      onClick={() => downloadCertificate(certificate.ipfsHash, certificate.id)}
                      className="flex-1 min-w-[200px] inline-flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
                    >
                      <Download className="w-5 h-5" />
                      <span>Télécharger le certificat</span>
                    </button>
                    <button
                      onClick={() => viewCertificate(certificate.ipfsHash)}
                      className="flex-1 min-w-[200px] inline-flex items-center justify-center space-x-2 px-6 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-xl font-semibold hover:bg-blue-50 transform hover:-translate-y-1 transition-all duration-200"
                    >
                      <Eye className="w-5 h-5" />
                      <span>Ouvrir dans un nouvel onglet</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            
          </div>
        )}

        <div className="mt-8 bg-blue-50 rounded-xl p-6 border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-2 flex items-center space-x-2">
            <AlertCircle className="w-5 h-5" />
            <span>Comment obtenir un ID de certificat ?</span>
          </h4>
          <p className="text-blue-800 text-sm">
            L'ID du certificat est fourni par l'organisation lors de l'émission du certificat.
            Vous pouvez le trouver sur votre certificat ou demander à l'organisation émettrice.
          </p>
        </div>
      </main>
    </div>
  );
}

export default VerifyCertificate;
