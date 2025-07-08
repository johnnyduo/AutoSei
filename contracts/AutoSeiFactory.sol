// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "./AutoSeiPortfolioCore.sol";

/**
 * @title AutoSeiFactory
 * @dev Minimal factory for deploying AutoSeiPortfolioCore
 */
contract AutoSeiFactory {
    address public immutable owner;
    address[] public contracts;
    
    event Deployed(address indexed contractAddress, address indexed deployer);
    
    constructor() {
        owner = msg.sender;
    }
    
    function deploy() external returns (address) {
        AutoSeiPortfolioCore newContract = new AutoSeiPortfolioCore();
        newContract.transferOwnership(msg.sender);
        contracts.push(address(newContract));
        emit Deployed(address(newContract), msg.sender);
        return address(newContract);
    }
    
    function getContracts() external view returns (address[] memory) {
        return contracts;
    }
    
    function getCount() external view returns (uint256) {
        return contracts.length;
    }
}
