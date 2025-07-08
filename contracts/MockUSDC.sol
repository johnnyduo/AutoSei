// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/**
 * @title MockUSDC
 * @dev A mock USDC token for testing purposes on Sei testnet
 */
contract MockUSDC {
    string public constant name = "USD Coin";
    string public constant symbol = "USDC";
    uint8 public constant decimals = 6; // USDC uses 6 decimals
    
    uint256 public constant MAX_SUPPLY = 200_000_000 * 10**decimals; // 200M USDC
    uint256 public totalSupply;
    
    address public owner;
    
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event Mint(address indexed to, uint256 value);
    event Burn(address indexed from, uint256 value);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    constructor() {
        owner = msg.sender;
        
        // Initial mint of 10,000 USDC to deployer
        uint256 initialMint = 10_000 * 10**decimals;
        totalSupply = initialMint;
        balanceOf[msg.sender] = initialMint;
        emit Transfer(address(0), msg.sender, initialMint);
        emit Mint(msg.sender, initialMint);
    }
    
    function transfer(address to, uint256 value) external returns (bool) {
        require(to != address(0), "Transfer to zero address");
        require(balanceOf[msg.sender] >= value, "Insufficient balance");
        
        balanceOf[msg.sender] -= value;
        balanceOf[to] += value;
        
        emit Transfer(msg.sender, to, value);
        return true;
    }
    
    function transferFrom(address from, address to, uint256 value) external returns (bool) {
        require(to != address(0), "Transfer to zero address");
        require(balanceOf[from] >= value, "Insufficient balance");
        require(allowance[from][msg.sender] >= value, "Insufficient allowance");
        
        balanceOf[from] -= value;
        balanceOf[to] += value;
        allowance[from][msg.sender] -= value;
        
        emit Transfer(from, to, value);
        return true;
    }
    
    function approve(address spender, uint256 value) external returns (bool) {
        allowance[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }
    
    function mint(address to, uint256 value) external onlyOwner {
        require(to != address(0), "Mint to zero address");
        require(totalSupply + value <= MAX_SUPPLY, "Exceeds max supply");
        
        totalSupply += value;
        balanceOf[to] += value;
        
        emit Transfer(address(0), to, value);
        emit Mint(to, value);
    }
    
    function burn(uint256 value) external {
        require(balanceOf[msg.sender] >= value, "Insufficient balance");
        
        totalSupply -= value;
        balanceOf[msg.sender] -= value;
        
        emit Transfer(msg.sender, address(0), value);
        emit Burn(msg.sender, value);
    }
    
    function burnFrom(address from, uint256 value) external {
        require(balanceOf[from] >= value, "Insufficient balance");
        require(allowance[from][msg.sender] >= value, "Insufficient allowance");
        
        totalSupply -= value;
        balanceOf[from] -= value;
        allowance[from][msg.sender] -= value;
        
        emit Transfer(from, address(0), value);
        emit Burn(from, value);
    }
    
    // Utility functions for easy testing
    function faucet() external {
        require(balanceOf[msg.sender] < 1000 * 10**decimals, "Already has enough tokens");
        uint256 faucetAmount = 1000 * 10**decimals; // 1000 USDC
        
        require(totalSupply + faucetAmount <= MAX_SUPPLY, "Exceeds max supply");
        
        totalSupply += faucetAmount;
        balanceOf[msg.sender] += faucetAmount;
        
        emit Transfer(address(0), msg.sender, faucetAmount);
        emit Mint(msg.sender, faucetAmount);
    }
    
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "New owner is zero address");
        owner = newOwner;
    }
}
