// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "./AutoSeiPortfolio.sol";

/**
 * @title AutoSeiPortfolioFactory
 * @dev Factory for deploying AutoSeiPortfolio instances
 */
contract AutoSeiPortfolioFactory {
    address public immutable owner;
    address[] public deployedContracts;
    
    event ContractDeployed(address indexed contractAddress, address indexed deployer);
    
    constructor() {
        owner = msg.sender;
    }
    
    /**
     * @dev Deploy new AutoSeiPortfolio contract
     */
    function deployPortfolioContract() external returns (address) {
        AutoSeiPortfolio newContract = new AutoSeiPortfolio();
        newContract.transferOwnership(msg.sender);
        deployedContracts.push(address(newContract));
        emit ContractDeployed(address(newContract), msg.sender);
        return address(newContract);
    }
    
    /**
     * @dev Get all deployed contracts
     */
    function getDeployedContracts() external view returns (address[] memory) {
        return deployedContracts;
    }
    
    /**
     * @dev Get total deployed contracts
     */
    function getDeployedContractsCount() external view returns (uint256) {
        return deployedContracts.length;
    }
}
