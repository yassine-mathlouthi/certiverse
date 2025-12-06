// src/App.jsx
import { Web3Provider, useWeb3 } from './context/Web3Context';
import HomePage from './pages/HomePage';
import AdminDashboard from './pages/AdminDashboard';
import OrganizationDashboard from './pages/OrganizationDashboard';
import VerifyCertificate from './pages/VerifyCertificate';
import { useEffect, useState } from 'react';
import { getCertIdFromUrl } from './utils/urlUtils';

function AppContent() {
  const { account, isAdmin, isRegisteredOrg, orgData, loading, connectWallet, disconnect } = useWeb3();
  const [showVerifyPage, setShowVerifyPage] = useState(false);
  const [initialCertId, setInitialCertId] = useState(null);

  useEffect(() => {
    // Vérifier si un certificat est demandé via URL (QR code)
    const certId = getCertIdFromUrl();
    if (certId) {
      setInitialCertId(certId);
      setShowVerifyPage(true);
    }
    
    // Optionnel : auto-connect si déjà connecté
    if (window.ethereum?.selectedAddress) {
      connectWallet();
    }
  }, []);

  // Afficher la page de vérification
  if (showVerifyPage) {
    return <VerifyCertificate onBack={() => setShowVerifyPage(false)} initialCertId={initialCertId} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="text-2xl font-bold text-blue-600">Connexion à la blockchain...</div>
      </div>
    );
  }

  if (!account) {
    return <HomePage onConnectWallet={connectWallet} onVerifyCertificate={() => setShowVerifyPage(true)} />;
  }

  if (isAdmin) {
    return <AdminDashboard adminAddress={account} onDisconnect={disconnect} contract={useWeb3().contract} />;
  }

  if (isRegisteredOrg && orgData) {
    return (
      <OrganizationDashboard
        orgAddress={account}
        orgName={orgData.name}
        orgType={orgData.orgType}
        onDisconnect={disconnect}
        contract={useWeb3().contract}
        orgData={orgData}
      />
    );
  }

  // Compte connecté mais pas autorisé
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
      <div className="bg-white p-10 rounded-2xl shadow-xl text-center max-w-md">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Accès refusé</h2>
        <p className="text-gray-700">Cette adresse n'est ni admin, ni organisation enregistrée.</p>
        <button onClick={disconnect} className="mt-6 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700">
          Déconnexion
        </button>
      </div>
    </div>
  );
}

function App() {
  return (
    <Web3Provider>
      <AppContent />
    </Web3Provider>
  );
}

export default App;