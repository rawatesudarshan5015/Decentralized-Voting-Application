import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Head from 'next/head';
import { useRouter } from 'next/router';
import styles from '../styles/Vote.module.css';

export default function Vote() {
  const [currentAccount, setCurrentAccount] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isVoting, setIsVoting] = useState(false);
  const [error, setError] = useState('');
  const [votingSuccess, setVotingSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const { ethereum } = window;

        if (!ethereum) {
          setError('Make sure you have MetaMask installed!');
          setIsLoading(false);
          return;
        }

        const accounts = await ethereum.request({ method: 'eth_accounts' });

        if (accounts.length === 0) {
          router.push('/');
          return;
        }

        const account = accounts[0];
        setCurrentAccount(account);

        const hasVoted = await checkVotingStatus(account);
        if (hasVoted) {
          router.push('/');
          return;
        }

        await loadCandidates();
        setIsLoading(false);
      } catch (error) {
        console.error(error);
        setError('Error connecting to blockchain');
        setIsLoading(false);
      }
    };

    checkConnection();
  }, [router]);

  const checkVotingStatus = async (account) => {
    try {
      const { ethereum } = window;
      if (!ethereum) return false;

      const provider = new ethers.BrowserProvider(ethereum);
      const signer = await provider.getSigner();

      const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
      const contractABI = [
        "function hasVoted(address _address) public view returns (bool)"
      ];

      const votingContract = new ethers.Contract(contractAddress, contractABI, signer);
      return await votingContract.hasVoted(account);
    } catch (error) {
      console.error("Error checking voting status:", error);
      setError('Error checking voting status');
      return false;
    }
  };

  const loadCandidates = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) return;

      const provider = new ethers.BrowserProvider(ethereum);
      const signer = await provider.getSigner();

      const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
      const contractABI = [
        "function getCandidatesCount() public view returns (uint256)",
        "function getCandidate(uint256 _candidateId) public view returns (uint256, string memory, uint256)"
      ];

      const votingContract = new ethers.Contract(contractAddress, contractABI, signer);
      const count = await votingContract.getCandidatesCount();

      const candidatesList = [];
      for (let i = 1; i <= count; i++) {
        const candidate = await votingContract.getCandidate(i);
        candidatesList.push({
          id: candidate[0].toString(),
          name: candidate[1],
          voteCount: candidate[2]
        });
      }

      setCandidates(candidatesList);
    } catch (error) {
      console.error("Error loading candidates:", error);
      setError('Error loading candidates');
    }
  };

  const castVote = async () => {
    if (!selectedCandidate) {
      setError('Please select a candidate');
      return;
    }

    try {
      setIsVoting(true);
      setError('');

      const { ethereum } = window;
      if (!ethereum) {
        setError('Make sure you have MetaMask installed!');
        setIsVoting(false);
        return;
      }

      const provider = new ethers.BrowserProvider(ethereum);
      const signer = await provider.getSigner();

      const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
      const contractABI = [
        "function vote(uint256 _candidateId) public"
      ];

      const votingContract = new ethers.Contract(contractAddress, contractABI, signer);

      // Fix: Convert selectedCandidate to a number
      const tx = await votingContract.vote(Number(selectedCandidate));
      await tx.wait();

      setVotingSuccess(true);
      setIsVoting(false);
      await loadCandidates();

      setTimeout(() => {
        router.push('/');
      }, 3000);
    } catch (error) {
      console.error("Error casting vote:", error);
      setError(error.message || 'Error casting vote');
      setIsVoting(false);
    }
  };

  const handleCandidateChange = (event) => {
    setSelectedCandidate(event.target.value);
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <Head>
          <title>Loading... | Voting DApp</title>
        </Head>
        <main className={styles.main}>
          <p>Loading...</p>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Cast Your Vote | Voting DApp</title>
        <meta name="description" content="Cast your vote in the decentralized voting system" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Cast Your Vote</h1>

        <div className={styles.walletAddress}>
          <p>Connected Wallet: {currentAccount.slice(0, 6)}...{currentAccount.slice(-4)}</p>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        {votingSuccess ? (
          <div className={styles.success}>
            <p>Your vote has been cast successfully!</p>
            <p>Redirecting to home page...</p>
          </div>
        ) : (
          <div className={styles.voteContainer}>
            <div className={styles.candidateSelection}>
              <label htmlFor="candidate-select">Select a candidate:</label>
              <select
                id="candidate-select"
                value={selectedCandidate}
                onChange={handleCandidateChange}
                className={styles.select}
                disabled={isVoting}
              >
                <option value="">-- Select a candidate --</option>
                {candidates.map((candidate) => (
                  <option key={candidate.id} value={candidate.id}>
                    {candidate.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              className={styles.voteButton}
              onClick={castVote}
              disabled={!selectedCandidate || isVoting}
            >
              {isVoting ? 'Voting...' : 'Vote'}
            </button>

            <div className={styles.voteCount}>
              <h2>Current Vote Count</h2>
              <ul>
                {candidates.map((candidate) => (
                  <li key={candidate.id}>
                    {candidate.name}: {candidate.voteCount.toString()} votes
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
