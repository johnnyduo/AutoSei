# AutoSei Portfolio Smart Contract

## Overview

The **AutoSeiPortfolio** smart contract is a comprehensive, AI-powered portfolio management system designed for the Sei EVM blockchain. This contract represents the core functionality of the AutoSei project for the competition, integrating advanced features for automated trading, AI-driven signals, whale activity tracking, and personalized portfolio management.

## 🏗️ Contract Architecture

### Core Components

1. **User Portfolio Management**
   - Individual user portfolios with risk levels (1-10)
   - Custom allocation strategies
   - Performance tracking and scoring
   - Auto-rebalancing capabilities

2. **AI Trading Signals**
   - Real-time AI-generated trading signals (BUY/HOLD/SELL)
   - Confidence levels (0-100%)
   - Reasoning explanations
   - Category-based signal management

3. **Trading Bots System**
   - Multiple trading strategies (Momentum, Mean Reversion, Arbitrage, Yield Farming)
   - Performance tracking and trade counting
   - Dynamic bot activation/deactivation
   - Allocation management per bot

4. **Whale Activity Tracking**
   - Real-time whale transaction monitoring
   - Price impact analysis
   - Buy/sell activity classification
   - Historical activity storage

5. **Portfolio Allocation Management**
   - 7 default categories: AI, Meme, RWA, BigCap, DeFi, L1, Stablecoin
   - Risk-adjusted default allocations
   - Custom allocation updates
   - Real-time rebalancing

## 🔧 Key Features

### User Management
- **User Registration**: `registerUser(riskLevel)` - Register with personalized risk profile
- **Portfolio Summary**: Get comprehensive portfolio metrics
- **Auto-Rebalancing**: Toggle automatic portfolio rebalancing

### AI Integration
- **Signal Updates**: AI oracles can update trading signals
- **Confidence Tracking**: Each signal includes confidence percentage
- **Reasoning**: AI provides explanations for trading decisions
- **Category Coverage**: Signals for all asset categories

### Trading Bots
- **Multi-Strategy Support**: Different bot strategies for various market conditions
- **Performance Monitoring**: Track bot success rates and trade counts
- **Dynamic Allocation**: Bots can be assigned portfolio percentages
- **Real-time Status**: Active/inactive bot management

### Whale Tracking
- **Transaction Monitoring**: Track large transactions
- **Price Impact Analysis**: Measure market impact of whale activities
- **Historical Data**: Store and query past whale activities
- **Alert System**: Real-time whale activity notifications

## 📊 Default Portfolio Allocations

| Category | Default % | Risk Adjustment |
|----------|-----------|----------------|
| AI & DeFi | 20% | Higher risk = more allocation |
| Big Cap | 25% | Lower risk = more allocation |
| RWA | 15% | Stable across risk levels |
| DeFi | 15% | Moderate risk adjustment |
| Layer 1 | 10% | Stable allocation |
| Meme | 10% | Higher risk = more allocation |
| Stablecoin | 5% | Lower risk = more allocation |

## 🎯 Smart Contract Functions

### User Functions
```solidity
registerUser(uint256 _riskLevel) // Register with risk profile
updateUserAllocations(string[] _categories, uint256[] _percentages) // Update allocations
rebalancePortfolio() // Trigger manual rebalancing
toggleAutoRebalance() // Enable/disable auto-rebalancing
```

### Read Functions
```solidity
getUserAllocations(address _user) // Get user's current allocations
getAllAISignals() // Get all AI trading signals
getActiveTradingBots() // Get active trading bots
getRecentWhaleActivities(uint256 _limit) // Get recent whale activities
getPortfolioSummary(address _user) // Get portfolio summary
getSupportedCategories() // Get all supported categories
getTotalUsers() // Get total registered users
```

### AI Oracle Functions (Authorized Only)
```solidity
updateAISignal(string _category, uint8 _signal, uint256 _confidence, string _reasoning)
recordWhaleActivity(address _whale, string _token, uint256 _amount, uint8 _actionType, uint256 _priceImpact)
updateTradingBot(uint256 _botId, bool _isActive, uint256 _performance, uint256 _trades)
```

### Admin Functions
```solidity
authorizeAI(address _aiAddress) // Authorize AI oracle
revokeAI(address _aiAddress) // Revoke AI authorization
transferOwnership(address _newOwner) // Transfer contract ownership
```

## 🔐 Security Features

1. **Access Control**
   - Owner-only admin functions
   - Authorized AI oracle system
   - User-specific data protection

2. **Input Validation**
   - Risk level bounds (1-10)
   - Allocation sum validation (must equal 100%)
   - Signal type validation (0-2)
   - Confidence bounds (0-100%)

3. **Cooldown Mechanisms**
   - 1-hour cooldown between rebalancing
   - Timestamp tracking for all activities

4. **Data Integrity**
   - Struct-based data organization
   - Event logging for all major actions
   - Array bounds checking

## 🚀 Integration with UI/UX

The contract is designed to work seamlessly with the AutoSei frontend:

### Dashboard Integration
- Real-time portfolio value display
- Performance score visualization
- Risk level indicators
- Auto-rebalancing status

### AI Chat Integration
- Live AI signal display
- Confidence level indicators
- Reasoning explanations
- Category-specific recommendations

### Trading Bots Dashboard
- Bot performance charts
- Strategy comparison
- Trade count tracking
- Activation controls

### Whale Tracker
- Real-time whale activity feed
- Price impact visualization
- Historical activity charts
- Alert notifications

## 📈 Performance Optimization

1. **Gas Efficiency**
   - Efficient array operations
   - Minimal storage updates
   - Optimized function calls

2. **Scalability**
   - Modular design
   - Upgradeable components
   - Efficient data structures

3. **Monitoring**
   - Comprehensive event system
   - Performance tracking
   - Error handling

## 🎯 Competition Advantages

1. **Comprehensive Feature Set**: All major DeFi portfolio management features
2. **AI Integration**: Advanced AI-powered trading signals and analysis
3. **Real-time Monitoring**: Live whale tracking and bot performance
4. **User-Centric Design**: Personalized risk profiles and allocations
5. **Professional Architecture**: Enterprise-grade smart contract design
6. **Sei EVM Optimized**: Specifically designed for Sei blockchain performance

## 📝 Deployment Instructions

1. **Compile Contract**: Use Solidity ^0.8.20
2. **Deploy to Sei EVM**: Use Sei testnet for testing
3. **Verify Contract**: Upload source code for verification
4. **Update Environment**: Set contract address in `.env`
5. **Configure AI Oracles**: Authorize AI addresses
6. **Initialize Data**: Set up initial trading bots and signals

## 🔧 Environment Variables

Add to your `.env` file:
```
VITE_PORTFOLIO_CONTRACT_ADDRESS=YOUR_DEPLOYED_CONTRACT_ADDRESS
VITE_AI_ORACLE_ADDRESS=YOUR_AI_ORACLE_ADDRESS
```

## 🌟 Next Steps

1. Deploy contract to Sei EVM testnet
2. Update frontend with new contract address
3. Test all contract functions
4. Configure AI oracle integration
5. Set up whale tracking monitoring
6. Deploy to Sei mainnet for production

This comprehensive smart contract represents a complete portfolio management solution that perfectly aligns with the AutoSei project vision and provides all the features needed for the competition.
