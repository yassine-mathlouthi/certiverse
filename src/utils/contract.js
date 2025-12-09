// src/utils/contract.js
import { ethers } from "ethers";

// Adresse du contrat déployé sur Sepolia
export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

// ABI du contrat
import ContractABI from "./ContractABI.json";
export const CONTRACT_ABI = ContractABI;

let provider;
let signer;
let contract;

// Initialiser le provider et le contrat
export const initContract = async () => {
  if (typeof window.ethereum === "undefined") {
    alert("MetaMask n'est pas installé !");
    return null;
  }

  provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  signer = await provider.getSigner();
  contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

  return { provider, signer, contract };
};

// Obtenir une instance en lecture seule (sans signer)
export const getContractReadOnly = () => {
  // Use public Sepolia RPC endpoint (Infura public endpoint)
  const stableProvider = new ethers.JsonRpcProvider(import.meta.env.VITE_RPC_URL);
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, stableProvider);
};
export { contract, provider };