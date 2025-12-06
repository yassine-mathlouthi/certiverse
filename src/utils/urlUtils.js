// src/utils/urlUtils.js

/**
 * Génère l'URL de vérification pour un certificat
 * @param {string} certId - ID du certificat (format: CERT-2025-0001 ou juste le numéro)
 * @returns {string} URL complète de vérification
 */
export const getVerifyUrl = (certId) => {
  // En production, utiliser le domaine réel
  const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin;
  return `${baseUrl}?verify=${encodeURIComponent(certId)}`;
};

/**
 * Extrait l'ID de certificat depuis les paramètres URL
 * @returns {string|null} ID du certificat ou null
 */
export const getCertIdFromUrl = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get('verify');
};
