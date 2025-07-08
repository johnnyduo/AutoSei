// Test USDC Contract - Quick Debug
import { ethers } from 'ethers';

const MOCK_USDC_ADDRESS = '0x9d5F1273002Cc4DAC76B72249ed59B21Ba41D526';
const SEI_TESTNET_RPC = 'https://evm-rpc.sei-apis.com';

// Simple ERC20 ABI for testing
const SIMPLE_USDC_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)", 
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address owner) view returns (uint256)",
  "function faucet() external"
];

async function testUSDCContract() {
  try {
    console.log('Testing USDC contract at:', MOCK_USDC_ADDRESS);
    
    // Create provider
    const provider = new ethers.JsonRpcProvider(SEI_TESTNET_RPC);
    
    // Create contract instance
    const contract = new ethers.Contract(MOCK_USDC_ADDRESS, SIMPLE_USDC_ABI, provider);
    
    // Test basic read functions
    const name = await contract.name();
    const symbol = await contract.symbol();
    const decimals = await contract.decimals();
    const totalSupply = await contract.totalSupply();
    
    console.log('Contract Details:');
    console.log('Name:', name);
    console.log('Symbol:', symbol);
    console.log('Decimals:', decimals);
    console.log('Total Supply:', totalSupply.toString());
    
    return {
      isValid: true,
      name,
      symbol,
      decimals,
      totalSupply: totalSupply.toString()
    };
    
  } catch (error) {
    console.error('Contract test failed:', error);
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Export for testing
export { testUSDCContract, MOCK_USDC_ADDRESS, SIMPLE_USDC_ABI };
