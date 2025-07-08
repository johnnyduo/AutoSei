// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/**
 * @title AutoSeiPortfolioCore
 * @dev Optimized AI-powered portfolio management for Sei EVM
 */
contract AutoSeiPortfolioCore {
    address public owner;
    address public aiOracle;
    
    struct Allocation {
        string category;
        uint256 percentage;
        bool isActive;
    }
    
    struct AISignal {
        string category;
        uint8 signal; // 0=SELL, 1=HOLD, 2=BUY
        uint256 confidence;
        uint256 timestamp;
    }
    
    struct UserPortfolio {
        uint256 totalValue;
        uint256 lastRebalance;
        bool autoRebalance;
        uint256 riskLevel;
        uint256 performanceScore;
        bool isActive;
    }
    
    mapping(address => UserPortfolio) public userPortfolios;
    mapping(address => Allocation[]) public userAllocations;
    mapping(string => AISignal) public aiSignals;
    mapping(address => bool) public authorizedAI;
    
    address[] public users;
    string[] public categories = ["ai", "meme", "rwa", "bigcap", "defi", "l1", "stablecoin"];
    uint256[] public defaultAllocations = [20, 10, 15, 25, 15, 10, 5];
    
    event UserRegistered(address indexed user);
    event AllocationUpdated(address indexed user, string category, uint256 percentage);
    event AISignalUpdated(string category, uint8 signal, uint256 confidence);
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
        aiOracle = msg.sender;
        
        // Initialize AI signals
        for (uint i = 0; i < categories.length; i++) {
            aiSignals[categories[i]] = AISignal({
                category: categories[i],
                signal: 1,
                confidence: 50,
                timestamp: block.timestamp
            });
        }
    }
    
    function registerUser(uint256 _riskLevel) external {
        require(_riskLevel >= 1 && _riskLevel <= 10, "Invalid risk");
        require(!userPortfolios[msg.sender].isActive, "Registered");
        
        userPortfolios[msg.sender] = UserPortfolio({
            totalValue: 0,
            lastRebalance: block.timestamp,
            autoRebalance: true,
            riskLevel: _riskLevel,
            performanceScore: 5000,
            isActive: true
        });
        
        // Set default allocations
        for (uint i = 0; i < categories.length; i++) {
            userAllocations[msg.sender].push(Allocation({
                category: categories[i],
                percentage: defaultAllocations[i],
                isActive: true
            }));
        }
        
        users.push(msg.sender);
        emit UserRegistered(msg.sender);
    }
    
    function updateUserAllocations(
        string[] memory _categories,
        uint256[] memory _percentages
    ) external onlyRegisteredUser {
        require(_categories.length == _percentages.length, "Length mismatch");
        
        uint256 total = 0;
        for (uint i = 0; i < _percentages.length; i++) {
            total += _percentages[i];
        }
        require(total == 100, "Must equal 100%");
        
        delete userAllocations[msg.sender];
        
        for (uint i = 0; i < _categories.length; i++) {
            userAllocations[msg.sender].push(Allocation({
                category: _categories[i],
                percentage: _percentages[i],
                isActive: true
            }));
            
            emit AllocationUpdated(msg.sender, _categories[i], _percentages[i]);
        }
    }
    
    function updateAISignal(
        string memory _category,
        uint8 _signal,
        uint256 _confidence
    ) external onlyAuthorizedAI {
        require(_signal <= 2, "Invalid signal");
        require(_confidence <= 100, "Invalid confidence");
        
        aiSignals[_category] = AISignal({
            category: _category,
            signal: _signal,
            confidence: _confidence,
            timestamp: block.timestamp
        });
        
        emit AISignalUpdated(_category, _signal, _confidence);
    }
    
    function rebalancePortfolio() external onlyRegisteredUser {
        require(
            block.timestamp >= userPortfolios[msg.sender].lastRebalance + 1 hours,
            "Cooldown active"
        );
        
        UserPortfolio storage portfolio = userPortfolios[msg.sender];
        
        uint256 newValue = portfolio.totalValue + (block.timestamp % 10000);
        portfolio.totalValue = newValue;
        portfolio.lastRebalance = block.timestamp;
        
        // Update performance score
        uint256 score = 5000;
        for (uint i = 0; i < categories.length; i++) {
            if (aiSignals[categories[i]].confidence > 70) {
                score += 100;
            }
        }
        portfolio.performanceScore = score > 10000 ? 10000 : score;
        
        emit PortfolioRebalanced(msg.sender, newValue);
    }
    
    function toggleAutoRebalance() external onlyRegisteredUser {
        userPortfolios[msg.sender].autoRebalance = !userPortfolios[msg.sender].autoRebalance;
    }
    
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
    
    function authorizeAI(address _aiAddress) external onlyOwner {
        authorizedAI[_aiAddress] = true;
    }
    
    function revokeAI(address _aiAddress) external onlyOwner {
        authorizedAI[_aiAddress] = false;
    }
    
    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "Zero address");
        emit OwnershipTransferred(owner, _newOwner);
        owner = _newOwner;
    }
    
    function getTotalUsers() external view returns (uint256) {
        return users.length;
    }
    
    function getSupportedCategories() external view returns (string[] memory) {
        return categories;
    }
}
