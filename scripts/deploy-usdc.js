// scripts/deploy-usdc.js
const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying Mock USDC contract...");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  // Deploy Mock USDC
  const MockUSDC = await ethers.getContractFactory("MockUSDC");
  const mockUSDC = await MockUSDC.deploy();
  
  await mockUSDC.waitForDeployment();
  const address = await mockUSDC.getAddress();
  
  console.log("Mock USDC deployed to:", address);
  console.log("Initial supply:", await mockUSDC.totalSupply());
  console.log("Deployer balance:", await mockUSDC.balanceOf(deployer.address));
  
  // Verify deployment
  console.log("Contract name:", await mockUSDC.name());
  console.log("Contract symbol:", await mockUSDC.symbol());
  console.log("Contract decimals:", await mockUSDC.decimals());
  
  return {
    mockUSDC: address,
    deployer: deployer.address
  };
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = main;
