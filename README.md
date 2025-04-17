# Decentralized Voting DApp

A decentralized voting application built with Ethereum smart contracts and Next.js. This DApp allows users to connect their wallets and vote for candidates in a secure, transparent, and decentralized manner.

## Features

- Connect to MetaMask wallet
- Check if user has already voted
- Cast votes for candidates
- View real-time vote counts
- Deployed on Sepolia testnet via Alchemy

## Prerequisites

- Node.js (v16+)
- npm or yarn
- MetaMask browser extension
- Alchemy account
- Sepolia testnet ETH (can be obtained from faucets)

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/decentralized-voting-dapp.git
cd decentralized-voting-dapp
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
```

### 3. Set up environment variables

Copy the `.env.example` file to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

The `.env.local` file should contain:

```
ALCHEMY_API_KEY=your-alchemy-api-key
PRIVATE_KEY=your-wallet-private-key
ETHERSCAN_API_KEY=your-etherscan-api-key
NEXT_PUBLIC_CONTRACT_ADDRESS=your-deployed-contract-address
NEXT_PUBLIC_ALCHEMY_API_KEY=your-alchemy-api-key
```

### 4. Compile the smart contract

```bash
npm run compile
# or
yarn compile
```

### 5. Deploy the smart contract to Sepolia

```bash
npm run deploy:sepolia
# or
yarn deploy:sepolia
```

After deployment, copy the contract address and update your `.env.local` file with `NEXT_PUBLIC_CONTRACT_ADDRESS`.

### 6. Run the development server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Smart Contract

The voting smart contract includes the following features:

- Add candidates (done at deployment)
- Vote for candidates (one vote per address)
- Check if an address has already voted
- Get candidate information and vote counts

## Project Structure

```
├── contracts/           # Solidity smart contracts
│   └── Voting.sol
├── scripts/             # Deployment scripts
│   └── deploy.js
├── pages/               # Next.js pages
│   ├── _app.js
│   ├── index.js         # Landing page (wallet connection)
│   └── vote.js          # Voting page
├── styles/              # CSS modules
│   ├── globals.css
│   ├── Home.module.css
│   └── Vote.module.css
├── utils/               # Utility files
│   └── VotingABI.json   # Contract ABI
├── hardhat.config.js    # Hardhat configuration
├── .env.example         # Example environment variables
└── package.json         # Project dependencies
```

## Usage Flow

1. Visit the homepage and connect your MetaMask wallet
2. If you haven't voted yet, you'll be directed to the voting page
3. Select a candidate from the dropdown menu
4. Click the "Vote" button to cast your vote
5. Transaction will be processed on the Ethereum network
6. After successful voting, you'll be redirected to the homepage
7. If you've already voted, the homepage will show a message indicating that you've voted

## Note

This DApp is configured to work with the Sepolia testnet. Make sure your MetaMask is connected to the Sepolia network when interacting with the application.
