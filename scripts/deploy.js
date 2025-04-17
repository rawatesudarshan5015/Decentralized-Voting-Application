const hre = require("hardhat");

async function main() {
  // Get the contract factory
  const Voting = await hre.ethers.getContractFactory("Voting");
  
  // Deploy the contract
  console.log("Deploying Voting contract...");
  const voting = await Voting.deploy();
  
  // Wait for deployment to finish
  await voting.waitForDeployment();
  
  // Get the contract's address
  const address = await voting.getAddress();
  console.log("Voting contract deployed to:", address);
}

// Execute the deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });