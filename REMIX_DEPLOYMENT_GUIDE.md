# Remix Deployment Guide for AutoSei Portfolio (Updated v0.8.26)

## 📋 Contract Options

### Option A: Full Featured (May exceed size limit)
- **AutoSeiPortfolio.sol** - Complete features but larger size
- **AutoSeiPortfolioFactory.sol** - Factory for full version

### Option B: Optimized Core (Recommended)
- **AutoSeiPortfolioCore.sol** - Essential features, smaller size ✅
- **AutoSeiFactory.sol** - Minimal factory contract ✅

## 🚀 Recommended Deployment (Option B)

### Contract Files to Deploy:
1. **AutoSeiPortfolioCore.sol** (Core contract - optimized)
2. **AutoSeiFactory.sol** (Optional factory contract)

### ⚠️ Optimizations Applied:
- ✅ Updated to Solidity ^0.8.26
- ✅ Removed trading bots system (reduce size)
- ✅ Removed whale tracking (reduce size)
- ✅ Simplified error messages
- ✅ Streamlined functions
- ✅ Core portfolio features maintained

## 🚀 Deployment Steps on Remix

### Step 1: Open Remix IDE
1. Go to https://remix.ethereum.org
2. Create a new workspace or use default

### Step 2: Upload Optimized Contract Files
1. Create `contracts/` folder
2. Upload `AutoSeiPortfolioCore.sol` 
3. Upload `AutoSeiFactory.sol` (optional)

### Step 3: Compiler Settings (CRITICAL)
1. Go to **Solidity Compiler** tab
2. Set compiler version: `0.8.26`
3. **IMPORTANT**: Enable optimizer with runs: `1` (minimum for size)
   - Click **Advanced Configurations**
   - Check **Enable optimization**
   - Set **Runs**: `1` (lowest value for maximum size reduction)

### Step 4: Compile Contracts
1. Select `AutoSeiPortfolioCore.sol`
2. Click **Compile**
3. Verify no size warnings
4. Repeat for `AutoSeiFactory.sol`

### Step 5: Deploy AutoSeiPortfolioCore (Main Contract)
1. Go to **Deploy & Run Transactions** tab
2. Set Environment: **Injected Provider - MetaMask**
3. Connect MetaMask to Sei EVM Testnet
4. Select contract: `AutoSeiPortfolioCore`
5. Click **Deploy**
6. **Save the deployed address** 📝

### Step 6: Deploy AutoSeiFactory (Optional)
1. Select contract: `AutoSeiFactory`
2. Click **Deploy**
3. **Save the deployed address** 📝

## 🔧 Sei EVM Testnet Configuration

### Network Details:
- **Network Name**: Sei EVM Testnet
- **RPC URL**: `https://evm-rpc-testnet.sei-apis.com`
- **Chain ID**: `1328`
- **Currency Symbol**: `SEI`
- **Block Explorer**: `https://seitrace.com`

### Get Testnet Tokens:
- Use Sei Faucet: https://seitrace.com/tool/faucet?chain=atlantic-2

## 📝 Post-Deployment Steps

### 1. Update Environment Variables
```bash
# Add to your .env file
VITE_PORTFOLIO_CONTRACT_ADDRESS=YOUR_DEPLOYED_CONTRACT_ADDRESS
VITE_PORTFOLIO_FACTORY_ADDRESS=YOUR_FACTORY_CONTRACT_ADDRESS
```

### 2. Test Contract Functions
Use Remix interface to test:
- `registerUser(5)` - Register with risk level 5
- `getUserAllocations(YOUR_ADDRESS)` - Get your allocations
- `getAllAISignals()` - Get AI signals
- `getActiveTradingBots()` - Get trading bots

### 3. Verify Contracts (Optional)
1. Go to Sei block explorer
2. Find your contract address
3. Upload source code for verification

## 🎯 Contract Sizes (Optimized)

### AutoSeiPortfolio.sol:
- **Functions**: 25+ functions
- **Features**: AI signals, portfolio management, trading bots, whale tracking
- **Storage**: Efficient struct-based storage
- **Gas**: Optimized for Sei EVM

### AutoSeiPortfolioFactory.sol:
- **Functions**: 3 functions
- **Purpose**: Deploy multiple portfolio instances
- **Size**: Minimal footprint

## 🚨 Common Issues & Solutions

### Issue 1: "Contract too large"
**Solution**: Optimizer is enabled with runs=200

### Issue 2: "Gas estimation failed"
**Solution**: Increase gas limit in MetaMask

### Issue 3: "Invalid signature"
**Solution**: Make sure you're on Sei EVM testnet

### Issue 4: "Insufficient funds"
**Solution**: Get more SEI from faucet

## 📊 Contract Functions Overview

### User Functions:
- `registerUser(riskLevel)` - Register new user
- `updateUserAllocations(categories, percentages)` - Update portfolio
- `rebalancePortfolio()` - Trigger rebalancing
- `toggleAutoRebalance()` - Toggle auto-rebalance

### Read Functions:
- `getUserAllocations(user)` - Get user's portfolio
- `getAllAISignals()` - Get AI trading signals
- `getActiveTradingBots()` - Get active bots
- `getPortfolioSummary(user)` - Get portfolio summary
- `getTotalUsers()` - Get total users

### Admin Functions:
- `updateAISignal()` - Update AI signals (authorized only)
- `recordWhaleActivity()` - Record whale activity
- `updateTradingBot()` - Update bot status
- `authorizeAI()` - Authorize AI oracle

## 🎯 Testing Checklist

After deployment, test these functions:
- [ ] Register user with risk level 1-10
- [ ] Update user allocations (must sum to 100%)
- [ ] Get AI signals (should return 7 categories)
- [ ] Get trading bots (should return 4 bots)
- [ ] Rebalance portfolio (1 hour cooldown)
- [ ] Get portfolio summary

## 📞 Support

If you encounter issues:
1. Check Remix console for errors
2. Verify network connection
3. Ensure sufficient SEI balance
4. Check contract addresses in .env

## 🎉 Success!

Once deployed successfully:
1. Update your frontend with new contract address
2. Test all UI interactions
3. Deploy on mainnet when ready
4. Submit for competition!

The contracts are now optimized for deployment on Sei EVM with minimal gas usage and maximum functionality!
