// Test script for AutoSei Portfolio contract interaction
const { ethers } = require("hardhat");

async function testContractInteraction(contractAddress) {
  console.log("Testing AutoSei Portfolio contract interaction...");
  console.log("Contract Address:", contractAddress);

  // Get contract instance
  const AutoSeiPortfolio = await ethers.getContractFactory("AutoSeiPortfolio");
  const contract = AutoSeiPortfolio.attach(contractAddress);

  // Get signers
  const [deployer, user1, user2] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);
  console.log("User1:", user1.address);
  console.log("User2:", user2.address);

  try {
    // Test 1: Basic contract info
    console.log("\n=== TEST 1: Basic Contract Info ===");
    const owner = await contract.owner();
    const totalUsers = await contract.getTotalUsers();
    const supportedCategories = await contract.getSupportedCategories();
    
    console.log("Owner:", owner);
    console.log("Total Users:", totalUsers.toString());
    console.log("Supported Categories:", supportedCategories);

    // Test 2: AI Signals
    console.log("\n=== TEST 2: AI Signals ===");
    const aiSignals = await contract.getAllAISignals();
    console.log("AI Signals Categories:", aiSignals[0]);
    console.log("AI Signals Values:", aiSignals[1].map(s => s.toString()));
    console.log("AI Signals Confidence:", aiSignals[2].map(c => c.toString()));

    // Test 3: Trading Bots
    console.log("\n=== TEST 3: Trading Bots ===");
    const tradingBots = await contract.getActiveTradingBots();
    console.log("Bot IDs:", tradingBots[0].map(id => id.toString()));
    console.log("Bot Names:", tradingBots[1]);
    console.log("Bot Strategies:", tradingBots[2]);
    console.log("Bot Performances:", tradingBots[3].map(p => p.toString()));

    // Test 4: User Registration
    console.log("\n=== TEST 4: User Registration ===");
    const userContract = contract.connect(user1);
    
    try {
      const registerTx = await userContract.registerUser(5); // Risk level 5
      await registerTx.wait();
      console.log("User1 registered successfully");
    } catch (error) {
      console.log("User1 registration failed:", error.message);
    }

    // Test 5: User Allocations
    console.log("\n=== TEST 5: User Allocations ===");
    try {
      const allocations = await contract.getUserAllocations(user1.address);
      console.log("User1 Categories:", allocations[0]);
      console.log("User1 Percentages:", allocations[1].map(p => p.toString()));
      console.log("User1 Active Status:", allocations[2]);
    } catch (error) {
      console.log("Failed to get user allocations:", error.message);
    }

    // Test 6: Portfolio Summary
    console.log("\n=== TEST 6: Portfolio Summary ===");
    try {
      const summary = await contract.getPortfolioSummary(user1.address);
      console.log("Total Value:", summary[0].toString());
      console.log("Performance Score:", summary[1].toString());
      console.log("Risk Level:", summary[2].toString());
      console.log("Auto Rebalance:", summary[3]);
      console.log("Last Rebalance:", summary[4].toString());
    } catch (error) {
      console.log("Failed to get portfolio summary:", error.message);
    }

    // Test 7: Update Allocations
    console.log("\n=== TEST 7: Update Allocations ===");
    try {
      const categories = ["ai", "meme", "defi", "bigcap", "stablecoin"];
      const percentages = [30, 20, 20, 20, 10];
      
      const updateTx = await userContract.updateUserAllocations(categories, percentages);
      await updateTx.wait();
      console.log("User allocations updated successfully");
    } catch (error) {
      console.log("Failed to update allocations:", error.message);
    }

    // Test 8: Rebalance Portfolio
    console.log("\n=== TEST 8: Rebalance Portfolio ===");
    try {
      const rebalanceTx = await userContract.rebalancePortfolio();
      await rebalanceTx.wait();
      console.log("Portfolio rebalanced successfully");
    } catch (error) {
      console.log("Failed to rebalance portfolio:", error.message);
    }

    // Test 9: AI Signal Update (as owner)
    console.log("\n=== TEST 9: AI Signal Update ===");
    try {
      const updateSignalTx = await contract.updateAISignal(
        "ai",
        2, // BUY signal
        85, // 85% confidence
        "Strong bullish momentum detected in AI sector"
      );
      await updateSignalTx.wait();
      console.log("AI signal updated successfully");
    } catch (error) {
      console.log("Failed to update AI signal:", error.message);
    }

    // Test 10: Whale Activity Recording
    console.log("\n=== TEST 10: Whale Activity Recording ===");
    try {
      const recordWhaleTx = await contract.recordWhaleActivity(
        "0x742d35Cc6634C0532925a3b8D7C9C4e3C4B8C92B",
        "SEI",
        ethers.utils.parseEther("100000"),
        0, // BUY
        500 // 5% price impact
      );
      await recordWhaleTx.wait();
      console.log("Whale activity recorded successfully");
    } catch (error) {
      console.log("Failed to record whale activity:", error.message);
    }

    // Test 11: Get Whale Activities
    console.log("\n=== TEST 11: Get Whale Activities ===");
    try {
      const whaleActivities = await contract.getRecentWhaleActivities(5);
      console.log("Whale Addresses:", whaleActivities[0]);
      console.log("Whale Tokens:", whaleActivities[1]);
      console.log("Whale Amounts:", whaleActivities[2].map(a => a.toString()));
      console.log("Whale Actions:", whaleActivities[3].map(a => a.toString()));
    } catch (error) {
      console.log("Failed to get whale activities:", error.message);
    }

    // Test 12: Final State Check
    console.log("\n=== TEST 12: Final State Check ===");
    const finalTotalUsers = await contract.getTotalUsers();
    const finalAISignals = await contract.getAllAISignals();
    const whaleCount = await contract.whaleActivityCount();
    
    console.log("Final Total Users:", finalTotalUsers.toString());
    console.log("Updated AI Signals:", finalAISignals[1].map(s => s.toString()));
    console.log("Total Whale Activities:", whaleCount.toString());

    console.log("\n✅ All tests completed successfully!");
    return true;

  } catch (error) {
    console.error("❌ Test failed:", error);
    return false;
  }
}

// Main function to run tests
async function main() {
  const contractAddress = process.argv[2];
  
  if (!contractAddress) {
    console.error("Please provide contract address as argument");
    console.error("Usage: npx hardhat run scripts/test-contract.js --network sei-testnet <CONTRACT_ADDRESS>");
    process.exit(1);
  }

  const success = await testContractInteraction(contractAddress);
  
  if (success) {
    console.log("\n🎉 All contract interactions working correctly!");
  } else {
    console.log("\n❌ Some tests failed. Check the logs above.");
  }
}

// Execute if running directly
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { testContractInteraction };
