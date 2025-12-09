// src/context/Web3Context.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { initContract, getContractReadOnly } from '../utils/contract';

const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isRegisteredOrg, setIsRegisteredOrg] = useState(false);
  const [orgData, setOrgData] = useState(null);
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(false);

  const connectWallet = async () => {
    try {
      setLoading(true);
      const { contract: connectedContract, signer } = await initContract();
      if (!connectedContract) {
        setLoading(false);
        return;
      }

      const address = await signer.getAddress();
      setAccount(address);
      setContract(connectedContract);

      // Vérifier si admin
      const admin = await connectedContract.admin();
      console.log("Admin du contrat:", admin);
      console.log("Adresse connectée:", address);
      setIsAdmin(address.toLowerCase() === admin.toLowerCase());

      // Vérifier si organisation enregistrée
      const org = await connectedContract.organizations(address);
      console.log("Organisation récupérée:", org);
      console.log("isActive:", org.isActive);
      if (org.isActive) {
        setIsRegisteredOrg(true);
        setOrgData({
          name: org.name,
          email: org.email,
          orgType: org.orgType,
          registeredAt: Number(org.registeredAt),
          totalIssued: Number(org.totalIssued),
          uniqueStudents: Number(org.uniqueStudents)
        });
      } else { // nahi l else
        // IMPORTANT : Réinitialiser si pas active
        setIsRegisteredOrg(false);
        setOrgData(null);
      }

      setLoading(false);
    } catch (err) {
      console.error(err);
      alert("Erreur de connexion : " + err.message);
      setLoading(false);
    }
  };

  const disconnect = () => {
    setAccount(null);
    setIsAdmin(false);
    setIsRegisteredOrg(false);
    setOrgData(null);
    setContract(null);
  };

  // Écouter les changements de compte
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          connectWallet();
        } else {
          disconnect();
        }
      });
    }
  }, []);

  return (
    <Web3Context.Provider value={{
      account,
      isAdmin,
      isRegisteredOrg,
      orgData,
      contract,
      loading,
      connectWallet,
      disconnect
    }}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => useContext(Web3Context);