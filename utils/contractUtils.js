import { ethers } from 'ethers';
import VotingABI from './VotingABI.json';

/**
 * Get the Ethereum provider from MetaMask or another wallet
 * @returns {Promise<BrowserProvider | null>} The Ethereum provider or null if not available
 */
export const getProvider = async () => {
  if (typeof window === 'undefined') return null;
  if (!window.ethereum) return null;
  
  try {
    return new ethers.BrowserProvider(window.ethereum);
  } catch (error) {
    console.error('Error creating provider:', error);
    return null;
  }
};

/**
 * Get the signer for the connected account
 * @returns {Promise<Signer | null>} The signer for the connected account or null if not available
 */
export const getSigner = async () => {
  const provider = await getProvider();
  if (!provider) return null;
  
  try {
    return await provider.getSigner();
  } catch (error) {
    console.error('Error getting signer:', error);
    return null;
  }
};

/**
 * Get the contract instance
 * @returns {Promise<Contract | null>} The contract instance or null if not available
 */
export const getContract = async () => {
  const signer = await getSigner();
  if (!signer) return null;
  
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  if (!contractAddress) {
    console.error('Contract address not found in environment variables');
    return null;
  }
  
  try {
    return new ethers.Contract(contractAddress, VotingABI, signer);
  } catch (error) {
    console.error('Error creating contract instance:', error);
    return null;
  }
};

/**
 * Check if a wallet address has voted
 * @param {string} address - The wallet address to check
 * @returns {Promise<boolean>} True if the address has voted, false otherwise
 */
export const checkIfAddressHasVoted = async (address) => {
  const contract = await getContract();
  if (!contract) return false;
  
  try {
    return await contract.hasVoted(address);
  } catch (error) {
    console.error('Error checking if address has voted:', error);
    return false;
  }
};

/**
 * Get all candidates from the contract
 * @returns {Promise<Array | null>} Array of candidates or null if error
 */
export const getAllCandidates = async () => {
  const contract = await getContract();
  if (!contract) return null;
  
  try {
    const count = await contract.getCandidatesCount();
    
    const candidates = [];
    for (let i = 1; i <= count; i++) {
      const candidate = await contract.getCandidate(i);
      candidates.push({
        id: candidate[0],
        name: candidate[1],
        voteCount: candidate[2]
      });
    }
    
    return candidates;
  } catch (error) {
    console.error('Error getting candidates:', error);
    return null;
  }
};

/**
 * Vote for a candidate
 * @param {number} candidateId - The ID of the candidate to vote for
 * @returns {Promise<{success: boolean, error: string | null, transaction: any | null}>} The result of the vote
 */
export const voteForCandidate = async (candidateId) => {
  const contract = await getContract();
  if (!contract) {
    return { success: false, error: 'Contract not available', transaction: null };
  }
  
  try {
    const tx = await contract.vote(candidateId);
    await tx.wait();
    
    return { success: true, error: null, transaction: tx };
  } catch (error) {
    console.error('Error voting for candidate:', error);
    return { 
      success: false, 
      error: error.message || 'Error voting for candidate', 
      transaction: null 
    };
  }
};