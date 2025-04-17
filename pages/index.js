import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Head from 'next/head';
import { useRouter } from 'next/router';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [currentAccount, setCurrentAccount] = useState('');
  const [hasVoted, setHasVoted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Check if MetaMask is installed
  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;
  
      if (!ethereum) {
        setError('Make sure you have MetaMask installed!');
        return;
      }
  
      const accounts = await ethereum.request({ method: 'eth_accounts' });
  
      if (accounts.length !== 0) {
        const account = accounts[0];
        setCurrentAccount(account);
        // Do not auto-check voting status here
      }
    } catch (error) {
      console.error(error);
      setError('Error connecting to MetaMask');
    }
  };
  

  // Connect wallet method
  const connectWallet = async () => {
    try {
      setIsLoading(true);
      const { ethereum } = window;
  
      if (!ethereum) {
        setError('Make sure you have MetaMask installed!');
        setIsLoading(false);
        return;
      }
  
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      setCurrentAccount(accounts[0]);
  
      // ✅ Only here, after user clicks button
      await checkVotingStatus(accounts[0]);
  
      setIsLoading(false);
    } catch (error) {
      console.error(error);
      setError('Error connecting to MetaMask');
      setIsLoading(false);
    }
  };
  

  // Check if user has already voted
  const checkVotingStatus = async (account) => {
    try {
      const { ethereum } = window;
      
      if (!ethereum) return;
      
      const provider = new ethers.BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      
      // Connect to contract
      const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
      const contractABI = [
        "function hasVoted(address _address) public view returns (bool)"
      ];
      
      const votingContract = new ethers.Contract(contractAddress, contractABI, signer);
      
      // Check if address has voted
      const votingStatus = await votingContract.hasVoted(account);
      setHasVoted(votingStatus);
      
      // Navigate based on voting status
      if (votingStatus) {
        // User has already voted, stay on this page
      } else {
        // User has not voted, navigate to voting page
        router.push('/vote');
      }
    } catch (error) {
      console.error("Error checking voting status:", error);
      setError('Error checking voting status');
    }
  };

  // Run when component mounts
  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  return (
    <div className={styles.container}>
      <Head>
        <title>Decentralized Voting DApp</title>
        <meta name="description" content="A decentralized Ethereum voting application" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to the Decentralized Voting DApp
        </h1>

        {error && <p className={styles.error}>{error}</p>}

        {!currentAccount ? (
          <button 
            className={styles.connectButton} 
            onClick={connectWallet}
            disabled={isLoading}
          >
            {isLoading ? 'Connecting...' : 'Connect Wallet'}
          </button>
        ) : (
          <div className={styles.connectedContainer}>
            <p className={styles.connectedText}>
              Connected: {currentAccount.slice(0, 6)}...{currentAccount.slice(-4)}
            </p>
            
            {hasVoted ? (
              <div className={styles.votedMessage}>
                <p>You have already voted!</p>
                <p>Thank you for participating in this election.</p>
              </div>
            ) : (
              <button 
                className={styles.voteButton} 
                onClick={() => router.push('/vote')}
              >
                Proceed to Vote
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}