const { ethers } = require("hardhat");

async function main() {
  console.log("Starting AutoSei Portfolio contract deployment...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Get account balance
  const balance = await deployer.getBalance();
  console.log("Account balance:", ethers.utils.formatEther(balance), "ETH");

  // Deploy the AutoSeiPortfolio contract
  console.log("Deploying AutoSeiPortfolio contract...");
  const AutoSeiPortfolio = await ethers.getContractFactory("AutoSeiPortfolio");
  const autoSeiPortfolio = await AutoSeiPortfolio.deploy();

  await autoSeiPortfolio.deployed();
  console.log("AutoSeiPortfolio deployed to:", autoSeiPortfolio.address);

  // Verify the contract deployment
  console.log("Verifying contract deployment...");
  const owner = await autoSeiPortfolio.owner();
  console.log("Contract owner:", owner);

  const totalUsers = await autoSeiPortfolio.getTotalUsers();
  console.log("Total users:", totalUsers.toString());

  const supportedCategories = await autoSeiPortfolio.getSupportedCategories();
  console.log("Supported categories:", supportedCategories);

  // Get AI signals
  const aiSignals = await autoSeiPortfolio.getAllAISignals();
  console.log("AI signals initialized:", aiSignals[0].length, "categories");

  // Get trading bots
  const tradingBots = await autoSeiPortfolio.getActiveTradingBots();
  console.log("Active trading bots:", tradingBots[0].length);

  // Optional: Deploy the factory contract
  console.log("\nDeploying AutoSeiPortfolioFactory contract...");
  const AutoSeiPortfolioFactory = await ethers.getContractFactory("AutoSeiPortfolioFactory");
  const factory = await AutoSeiPortfolioFactory.deploy();

  await factory.deployed();
  console.log("AutoSeiPortfolioFactory deployed to:", factory.address);

  // Summary
  console.log("\n=== DEPLOYMENT SUMMARY ===");
  console.log("AutoSeiPortfolio Address:", autoSeiPortfolio.address);
  console.log("AutoSeiPortfolioFactory Address:", factory.address);
  console.log("Deployer Address:", deployer.address);
  console.log("Gas Used: Check transaction receipts");
  
  console.log("\n=== ENVIRONMENT VARIABLES ===");
  console.log("Add these to your .env file:");
  console.log(`VITE_PORTFOLIO_CONTRACT_ADDRESS=${autoSeiPortfolio.address}`);
  console.log(`VITE_PORTFOLIO_FACTORY_ADDRESS=${factory.address}`);

  console.log("\n=== NEXT STEPS ===");
  console.log("1. Update your .env file with the contract addresses");
  console.log("2. Update the ABI file if needed");
  console.log("3. Configure AI oracle addresses");
  console.log("4. Test contract functions");
  console.log("5. Verify contracts on block explorer");

  return {
    autoSeiPortfolio: autoSeiPortfolio.address,
    factory: factory.address
  };
}

// Error handling
main()
  .then((addresses) => {
    console.log("\n✅ Deployment completed successfully!");
    console.log("Contract addresses:", addresses);
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
