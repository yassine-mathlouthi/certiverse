// src/utils/certificateUtils.js

/**
 * Télécharge un certificat depuis IPFS
 * @param {string} ipfsHash - Hash IPFS du certificat (avec ou sans préfixe ipfs://)
 * @param {string} certId - ID du certificat pour le nom de fichier
 */
export const downloadCertificate = async (ipfsHash, certId) => {
  try {
    const cid = ipfsHash.replace('ipfs://', '');
    const gateway = import.meta.env.VITE_PINATA_GATEWAY;
    const response = await fetch(`https://${gateway}/ipfs/${cid}`);
    if (!response.ok) throw new Error(`Erreur HTTP ${response.status}`);
    const htmlContent = await response.text();
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${certId}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Erreur téléchargement:', error);
    alert(`Erreur lors du téléchargement:\n${error.message}`);
  }
};

/**
 * Ouvre un certificat dans un nouvel onglet
 * @param {string} ipfsHash - Hash IPFS du certificat (avec ou sans préfixe ipfs://)
 */
export const viewCertificate = async (ipfsHash) => {
  try {
    const cid = ipfsHash.replace('ipfs://', '');
    const gateway = import.meta.env.VITE_PINATA_GATEWAY;
    const url = `https://${gateway}/ipfs/${cid}`;
    window.open(url, '_blank');
  } catch (error) {
    console.error('Erreur visualisation:', error);
    alert(`Erreur lors de la visualisation:\n${error.message}`);
  }
};

/**
 * Upload un fichier vers Pinata IPFS
 * @param {File} file - Fichier à uploader
 * @returns {Promise<string>} Hash IPFS avec préfixe ipfs://
 */
export const uploadToPinata = async (file) => {
  const jwt = import.meta.env.VITE_PINATA_JWT;
  const gateway = import.meta.env.VITE_PINATA_GATEWAY;

  if (!jwt) throw new Error("VITE_PINATA_JWT manquant dans .env");
  if (!gateway) throw new Error("VITE_PINATA_GATEWAY manquant dans .env");

  const formData = new FormData();
  formData.append('file', file);
  formData.append('pinataMetadata', JSON.stringify({ name: file.name }));
  formData.append('pinataOptions', JSON.stringify({ cidVersion: 1 }));

  const res = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: { Authorization: `Bearer ${jwt}` },
    body: formData
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.reason || 'Erreur Pinata');

  return `ipfs://${data.IpfsHash}`;
};
