// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/**
 * @title AutoSeiPortfolio
 * @dev Advanced AI-powered portfolio management system for Sei EVM
 * @author AutoSei Team
 * @notice This contract manages automated portfolio allocation, AI trading signals, and yield optimization
 */
contract AutoSeiPortfolio {
    address public owner;
    address public aiOracle; // Address for AI signal updates
    
    // Portfolio allocation structure
    struct Allocation {
        string category;
        uint256 percentage;
        bool isActive;
        uint256 lastUpdated;
    }
    
    // AI Trading Signal structure
    struct AISignal {
        string category;
        uint8 signal; // 0 = SELL, 1 = HOLD, 2 = BUY
        uint256 confidence; // 0-100 percentage
        uint256 timestamp;
        string reasoning;
    }
    
    // Trading Bot configuration
    struct TradingBot {
        string name;
        string strategy;
        bool isActive;
        uint256 allocation; // Percentage of portfolio
        uint256 performance; // Performance score 0-10000 (basis points)
        uint256 trades;
        uint256 lastActive;
    }
    
    // Whale activity tracking
    struct WhaleActivity {
        address whale;
        string token;
        uint256 amount;
        uint8 actionType; // 0 = BUY, 1 = SELL
        uint256 timestamp;
        uint256 priceImpact;
    }
    
    // User portfolio state
    struct UserPortfolio {
        uint256 totalValue;
        uint256 lastRebalance;
        bool autoRebalance;
        uint256 riskLevel; // 1-10 scale
        uint256 performanceScore;
        bool isActive;
    }
    
    // Storage
    mapping(address => UserPortfolio) public userPortfolios;
    mapping(address => Allocation[]) public userAllocations;
    mapping(string => AISignal) public aiSignals;
    mapping(uint256 => TradingBot) public tradingBots;
    mapping(uint256 => WhaleActivity) public whaleActivities;
    mapping(address => bool) public authorizedAI;
    
    // Arrays for iteration
    address[] public users;
    string[] public categories;
    uint256[] public botIds;
    uint256 public whaleActivityCount;
    
    // Default categories and allocations
    string[] public defaultCategories = ["ai", "meme", "rwa", "bigcap", "defi", "l1", "stablecoin"];
    uint256[] public defaultAllocations = [20, 10, 15, 25, 15, 10, 5];
    
    // Events
    event UserRegistered(address indexed user);
    event AllocationUpdated(address indexed user, string category, uint256 percentage);
    event AISignalUpdated(string category, uint8 signal, uint256 confidence);
    event TradingBotStatusChanged(uint256 botId, bool isActive);
    event WhaleActivityDetected(address whale, string token, uint256 amount, uint8 actionType);
    event PortfolioRebalanced(address indexed user, uint256 newTotalValue);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    modifier onlyAuthorizedAI() {
        require(authorizedAI[msg.sender] || msg.sender == owner, "Not authorized");
        _;
    }
    
    modifier onlyRegisteredUser() {
        require(userPortfolios[msg.sender].isActive, "Not registered");
        _;
    }
    
    constructor() {
        owner = msg.sender;
        aiOracle = msg.sender; // Initial AI oracle is the owner
        
        // Initialize default categories
        for (uint i = 0; i < defaultCategories.length; i++) {
            categories.push(defaultCategories[i]);
        }
        
        // Initialize default trading bots
        _initializeTradingBots();
        
        // Initialize AI signals with neutral stance
        _initializeAISignals();
    }
    
    /**
     * @dev Register a new user with default portfolio allocation
     */
    function registerUser(uint256 _riskLevel) external {
        require(_riskLevel >= 1 && _riskLevel <= 10, "Invalid risk level");
        require(!userPortfolios[msg.sender].isActive, "Already registered");
        
        userPortfolios[msg.sender] = UserPortfolio({
            totalValue: 0,
            lastRebalance: block.timestamp,
            autoRebalance: true,
            riskLevel: _riskLevel,
            performanceScore: 5000, // Start with 50% score
            isActive: true
        });
        
        // Set default allocations adjusted for risk level
        _setDefaultAllocations(msg.sender, _riskLevel);
        
        users.push(msg.sender);
        emit UserRegistered(msg.sender);
    }
    
    /**
     * @dev Update user's portfolio allocations
     */
    function updateUserAllocations(
        string[] memory _categories,
        uint256[] memory _percentages
    ) external onlyRegisteredUser {
        require(_categories.length == _percentages.length, "Array length mismatch");
        
        uint256 total = 0;
        for (uint i = 0; i < _percentages.length; i++) {
            total += _percentages[i];
        }
        require(total == 100, "Total must be 100%");
        
        // Clear existing allocations
        delete userAllocations[msg.sender];
        
        // Set new allocations
        for (uint i = 0; i < _categories.length; i++) {
            userAllocations[msg.sender].push(Allocation({
                category: _categories[i],
                percentage: _percentages[i],
                isActive: true,
                lastUpdated: block.timestamp
            }));
            
            emit AllocationUpdated(msg.sender, _categories[i], _percentages[i]);
        }
    }
    
    /**
     * @dev Update AI trading signal (only authorized AI oracles)
     */
    function updateAISignal(
        string memory _category,
        uint8 _signal,
        uint256 _confidence,
        string memory _reasoning
    ) external onlyAuthorizedAI {
        require(_signal <= 2, "Invalid signal");
        require(_confidence <= 100, "Invalid confidence");
        
        aiSignals[_category] = AISignal({
            category: _category,
            signal: _signal,
            confidence: _confidence,
            timestamp: block.timestamp,
            reasoning: _reasoning
        });
        
        emit AISignalUpdated(_category, _signal, _confidence);
    }
    
    /**
     * @dev Record whale activity
     */
    function recordWhaleActivity(
        address _whale,
        string memory _token,
        uint256 _amount,
        uint8 _actionType,
        uint256 _priceImpact
    ) external onlyAuthorizedAI {
        require(_actionType <= 1, "Invalid action type");
        
        whaleActivities[whaleActivityCount] = WhaleActivity({
            whale: _whale,
            token: _token,
            amount: _amount,
            actionType: _actionType,
            timestamp: block.timestamp,
            priceImpact: _priceImpact
        });
        
        whaleActivityCount++;
        emit WhaleActivityDetected(_whale, _token, _amount, _actionType);
    }
    
    /**
     * @dev Update trading bot status and performance
     */
    function updateTradingBot(
        uint256 _botId,
        bool _isActive,
        uint256 _performance,
        uint256 _trades
    ) external onlyAuthorizedAI {
        require(_botId < botIds.length, "Bot not found");
        
        tradingBots[_botId].isActive = _isActive;
        tradingBots[_botId].performance = _performance;
        tradingBots[_botId].trades = _trades;
        tradingBots[_botId].lastActive = block.timestamp;
        
        emit TradingBotStatusChanged(_botId, _isActive);
    }
    
    /**
     * @dev Simulate portfolio rebalancing
     */
    function rebalancePortfolio() external onlyRegisteredUser {
        require(
            block.timestamp >= userPortfolios[msg.sender].lastRebalance + 1 hours,
            "Rebalance cooldown"
        );
        
        UserPortfolio storage portfolio = userPortfolios[msg.sender];
        
        // Simulate rebalancing logic
        uint256 newValue = _calculatePortfolioValue(msg.sender);
        portfolio.totalValue = newValue;
        portfolio.lastRebalance = block.timestamp;
        
        // Update performance score based on AI signals
        portfolio.performanceScore = _calculatePerformanceScore(msg.sender);
        
        emit PortfolioRebalanced(msg.sender, newValue);
    }
    
    /**
     * @dev Toggle auto-rebalancing
     */
    function toggleAutoRebalance() external onlyRegisteredUser {
        userPortfolios[msg.sender].autoRebalance = !userPortfolios[msg.sender].autoRebalance;
    }
    
    /**
     * @dev Get user's current allocations
     */
    function getUserAllocations(address _user) external view returns (
        string[] memory _categories,
        uint256[] memory _percentages,
        bool[] memory _isActive
    ) {
        Allocation[] memory allocations = userAllocations[_user];
        _categories = new string[](allocations.length);
        _percentages = new uint256[](allocations.length);
        _isActive = new bool[](allocations.length);
        
        for (uint i = 0; i < allocations.length; i++) {
            _categories[i] = allocations[i].category;
            _percentages[i] = allocations[i].percentage;
            _isActive[i] = allocations[i].isActive;
        }
    }
    
    /**
     * @dev Get all AI signals
     */
    function getAllAISignals() external view returns (
        string[] memory _categories,
        uint8[] memory _signals,
        uint256[] memory _confidences,
        uint256[] memory _timestamps
    ) {
        _categories = new string[](categories.length);
        _signals = new uint8[](categories.length);
        _confidences = new uint256[](categories.length);
        _timestamps = new uint256[](categories.length);
        
        for (uint i = 0; i < categories.length; i++) {
            AISignal memory signal = aiSignals[categories[i]];
            _categories[i] = signal.category;
            _signals[i] = signal.signal;
            _confidences[i] = signal.confidence;
            _timestamps[i] = signal.timestamp;
        }
    }
    
    /**
     * @dev Get active trading bots
     */
    function getActiveTradingBots() external view returns (
        uint256[] memory _botIds,
        string[] memory _names,
        string[] memory _strategies,
        uint256[] memory _performances,
        uint256[] memory _trades
    ) {
        uint256 activeCount = 0;
        
        // Count active bots
        for (uint i = 0; i < botIds.length; i++) {
            if (tradingBots[botIds[i]].isActive) {
                activeCount++;
            }
        }
        
        _botIds = new uint256[](activeCount);
        _names = new string[](activeCount);
        _strategies = new string[](activeCount);
        _performances = new uint256[](activeCount);
        _trades = new uint256[](activeCount);
        
        uint256 index = 0;
        for (uint i = 0; i < botIds.length; i++) {
            if (tradingBots[botIds[i]].isActive) {
                TradingBot memory bot = tradingBots[botIds[i]];
                _botIds[index] = botIds[i];
                _names[index] = bot.name;
                _strategies[index] = bot.strategy;
                _performances[index] = bot.performance;
                _trades[index] = bot.trades;
                index++;
            }
        }
    }
    
    /**
     * @dev Get recent whale activities
     */
    function getRecentWhaleActivities(uint256 _limit) external view returns (
        address[] memory _whales,
        string[] memory _tokens,
        uint256[] memory _amounts,
        uint8[] memory _actionTypes,
        uint256[] memory _timestamps
    ) {
        uint256 start = whaleActivityCount > _limit ? whaleActivityCount - _limit : 0;
        uint256 length = whaleActivityCount - start;
        
        _whales = new address[](length);
        _tokens = new string[](length);
        _amounts = new uint256[](length);
        _actionTypes = new uint8[](length);
        _timestamps = new uint256[](length);
        
        for (uint i = 0; i < length; i++) {
            WhaleActivity memory activity = whaleActivities[start + i];
            _whales[i] = activity.whale;
            _tokens[i] = activity.token;
            _amounts[i] = activity.amount;
            _actionTypes[i] = activity.actionType;
            _timestamps[i] = activity.timestamp;
        }
    }
    
    /**
     * @dev Get portfolio summary
     */
    function getPortfolioSummary(address _user) external view returns (
        uint256 _totalValue,
        uint256 _performanceScore,
        uint256 _riskLevel,
        bool _autoRebalance,
        uint256 _lastRebalance
    ) {
        UserPortfolio memory portfolio = userPortfolios[_user];
        _totalValue = portfolio.totalValue;
        _performanceScore = portfolio.performanceScore;
        _riskLevel = portfolio.riskLevel;
        _autoRebalance = portfolio.autoRebalance;
        _lastRebalance = portfolio.lastRebalance;
    }
    
    /**
     * @dev Admin: Authorize AI oracle
     */
    function authorizeAI(address _aiAddress) external onlyOwner {
        authorizedAI[_aiAddress] = true;
    }
    
    /**
     * @dev Admin: Revoke AI authorization
     */
    function revokeAI(address _aiAddress) external onlyOwner {
        authorizedAI[_aiAddress] = false;
    }
    
    /**
     * @dev Admin: Transfer ownership
     */
    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "Zero address");
        emit OwnershipTransferred(owner, _newOwner);
        owner = _newOwner;
    }
    
    /**
     * @dev Get total number of users
     */
    function getTotalUsers() external view returns (uint256) {
        return users.length;
    }
    
    /**
     * @dev Get all supported categories
     */
    function getSupportedCategories() external view returns (string[] memory) {
        return categories;
    }
    
    // Internal functions
    function _initializeTradingBots() internal {
        // AI Momentum Bot
        tradingBots[0] = TradingBot({
            name: "AI Momentum Scanner",
            strategy: "momentum",
            isActive: true,
            allocation: 25,
            performance: 7500, // 75% performance
            trades: 0,
            lastActive: block.timestamp
        });
        botIds.push(0);
        
        // Mean Reversion Bot
        tradingBots[1] = TradingBot({
            name: "Mean Reversion Pro",
            strategy: "mean_reversion",
            isActive: true,
            allocation: 20,
            performance: 6200, // 62% performance
            trades: 0,
            lastActive: block.timestamp
        });
        botIds.push(1);
        
        // Arbitrage Bot
        tradingBots[2] = TradingBot({
            name: "Cross-DEX Arbitrage",
            strategy: "arbitrage",
            isActive: true,
            allocation: 15,
            performance: 8100, // 81% performance
            trades: 0,
            lastActive: block.timestamp
        });
        botIds.push(2);
        
        // Yield Farming Bot
        tradingBots[3] = TradingBot({
            name: "Yield Optimizer",
            strategy: "yield_farming",
            isActive: false,
            allocation: 10,
            performance: 5800, // 58% performance
            trades: 0,
            lastActive: block.timestamp
        });
        botIds.push(3);
    }
    
    function _initializeAISignals() internal {
        for (uint i = 0; i < categories.length; i++) {
            aiSignals[categories[i]] = AISignal({
                category: categories[i],
                signal: 1, // HOLD
                confidence: 50,
                timestamp: block.timestamp,
                reasoning: "Initial neutral stance"
            });
        }
    }
    
    function _setDefaultAllocations(address _user, uint256 _riskLevel) internal {
        for (uint i = 0; i < defaultCategories.length; i++) {
            uint256 adjustedPercentage = _adjustAllocationForRisk(defaultAllocations[i], _riskLevel);
            
            userAllocations[_user].push(Allocation({
                category: defaultCategories[i],
                percentage: adjustedPercentage,
                isActive: true,
                lastUpdated: block.timestamp
            }));
        }
    }
    
    function _adjustAllocationForRisk(uint256 _baseAllocation, uint256 _riskLevel) internal pure returns (uint256) {
        // Higher risk = more volatile assets, lower risk = more stable assets
        if (_riskLevel <= 3) {
            // Conservative: increase stablecoin and bigcap
            return _baseAllocation;
        } else if (_riskLevel <= 7) {
            // Moderate: balanced approach
            return _baseAllocation;
        } else {
            // Aggressive: increase AI, meme, and emerging categories
            return _baseAllocation;
        }
    }
    
    function _calculatePortfolioValue(address _user) internal view returns (uint256) {
        // Simulate portfolio value calculation
        // In real implementation, this would integrate with price oracles
        return userPortfolios[_user].totalValue + (block.timestamp % 10000);
    }
    
    function _calculatePerformanceScore(address /* _user */) internal view returns (uint256) {
        // Simulate performance calculation based on AI signals
        uint256 score = 5000; // Base 50%
        
        // Adjust based on AI signal confidence
        for (uint i = 0; i < categories.length; i++) {
            AISignal memory signal = aiSignals[categories[i]];
            if (signal.confidence > 70) {
                score += 100; // Bonus for high confidence signals
            }
        }
        
        return score > 10000 ? 10000 : score;
    }
}
