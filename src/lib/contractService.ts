// src/lib/contractService.ts
import { useContractRead, useWriteContract, useWaitForTransactionReceipt, useAccount, useChainId } from 'wagmi';
import { ethers, BrowserProvider, Contract } from 'ethers'; // Import from ethers v6
import AutoSeiPortfolioCoreABI from '../abi/AutoSeiPortfolioCore.json';
import AutoSeiPortfolioABI from '../abi/AutoSeiPortfolio.json';
import { seiTestnet } from './chains';

// Contract addresses from environment variables
export const AUTOSEI_PORTFOLIO_CORE_ADDRESS = (import.meta.env.VITE_AUTOSEI_PORTFOLIO_CORE_ADDRESS || '0x0000000000000000000000000000000000000000') as `0x${string}`;
export const AUTOSEI_PORTFOLIO_FULL_ADDRESS = (import.meta.env.VITE_AUTOSEI_PORTFOLIO_FULL_ADDRESS || '0x0000000000000000000000000000000000000000') as `0x${string}`;

// Contract configurations
export const CONTRACT_CONFIGS = {
  core: {
    address: AUTOSEI_PORTFOLIO_CORE_ADDRESS,
    abi: AutoSeiPortfolioCoreABI,
    name: 'AutoSeiPortfolioCore'
  },
  full: {
    address: AUTOSEI_PORTFOLIO_FULL_ADDRESS,
    abi: AutoSeiPortfolioABI,
    name: 'AutoSeiPortfolio'
  }
};

// Function to get the appropriate contract config based on feature requirements
export const getContractConfig = (feature: 'basic' | 'advanced' = 'basic') => {
  // Use the full contract for advanced features, core for basic operations
  return feature === 'advanced' ? CONTRACT_CONFIGS.full : CONTRACT_CONFIGS.core;
};

// Interface for portfolio allocation
export interface Allocation {
  id: string;
  name: string;
  color: string;
  allocation: number;
}

// Interface for AI Signal
export interface AISignal {
  category: string;
  signal: number; // 0 = SELL, 1 = HOLD, 2 = BUY
  confidence: number; // 0-100
  timestamp: number;
  reasoning: string;
}

// Interface for Trading Bot
export interface TradingBot {
  id: number;
  name: string;
  strategy: string;
  isActive: boolean;
  allocation: number;
  performance: number;
  trades: number;
  lastActive: number;
}

// Interface for Whale Activity
export interface WhaleActivity {
  whale: string;
  token: string;
  amount: number;
  actionType: number; // 0 = BUY, 1 = SELL
  timestamp: number;
  priceImpact: number;
}

// Interface for User Portfolio
export interface UserPortfolio {
  totalValue: number;
  performanceScore: number;
  riskLevel: number;
  autoRebalance: boolean;
  lastRebalance: number;
}

// Default category colors and names for UI display
export const categoryColors: Record<string, string> = {
  'ai': '#8B5CF6',
  'meme': '#EC4899',
  'rwa': '#0EA5E9',
  'bigcap': '#10B981',
  'defi': '#F59E0B',
  'l1': '#EF4444',
  'stablecoin': '#14B8A6',
};

export const categoryNames: Record<string, string> = {
  'ai': 'AI & DeFi',
  'meme': 'Meme & NFT',
  'rwa': 'RWA',
  'bigcap': 'Big Cap',
  'defi': 'DeFi',
  'l1': 'Layer 1',
  'stablecoin': 'Stablecoins',
};

// Direct contract interaction using ethers.js v6
export const updateAllocations = async (allocations: Allocation[]) => {
  if (!(window as any).ethereum) {
    throw new Error('No Ethereum provider found. Please install MetaMask or another wallet.');
  }
  
  try {
    console.log('Starting direct contract interaction with allocations:', allocations);
    
    // Request account access explicitly
    await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
    
    // Get the provider and signer - ethers v6 syntax
    const provider = new BrowserProvider((window as any).ethereum);
    const signer = await provider.getSigner();
    const userAddress = await signer.getAddress();
    
    console.log('Connected with address:', userAddress);
    
    // Get contract config for basic allocation updates
    const contractConfig = getContractConfig('basic');
    
    // Create contract instance - ethers v6 syntax
    const contract = new Contract(
      contractConfig.address,
      contractConfig.abi,
      signer
    );
    
    // Prepare the data for the contract call
    const categories = allocations.map(a => a.id);
    const percentages = allocations.map(a => a.allocation);
    
    console.log('Calling contract with:', {
      userAddress,
      contractAddress: contractConfig.address,
      contractName: contractConfig.name,
      categories,
      percentages
    });
    
    // Estimate gas first to check if the transaction will succeed
    try {
      const gasEstimate = await contract.updateAllocations.estimateGas(categories, percentages);
      console.log('Gas estimate:', gasEstimate.toString());
    } catch (gasError) {
      console.error('Gas estimation failed:', gasError);
      throw new Error(`Transaction would fail: ${gasError instanceof Error ? gasError.message : 'Unknown error'}`);
    }
    
    // Call the contract function with explicit gas limit - ethers v6 syntax
    const tx = await contract.updateAllocations(categories, percentages, {
      gasLimit: 300000 // ethers v6 accepts number directly
    });
    
    console.log('Transaction sent:', tx);
    
    return {
      hash: tx.hash as `0x${string}`
    };
  } catch (error) {
    console.error('Error in updateAllocations:', error);
    throw error;
  }
};

// Hook to read allocations from the contract
export function usePortfolioAllocations() {
  const contractConfig = getContractConfig('basic');
  
  const { data, isLoading, isError, refetch } = useContractRead({
    address: contractConfig.address,
    abi: contractConfig.abi,
    functionName: 'getAllocations',
    query: {
      enabled: contractConfig.address !== '0x0000000000000000000000000000000000000000',
    }
  });
  
  // Map contract data to our application format
  const processData = () => {
    if (!data) return [];
    
    try {
      const [categories, percentages] = data as [string[], bigint[]];
      
      return categories.map((category, index) => ({
        id: category,
        name: categoryNames[category] || category,
        color: categoryColors[category] || '#6B7280',
        allocation: Number(percentages[index])
      }));
    } catch (error) {
      console.error('Error processing allocation data:', error);
      return [];
    }
  };
  
  return {
    allocations: processData(),
    isLoading,
    isError,
    refetch
  };
}

// Function to check if an address is the contract owner
export function useIsContractOwner() {
  const { address } = useAccount();
  const contractConfig = getContractConfig('basic');
  
  const { data, isLoading, isError } = useContractRead({
    address: contractConfig.address,
    abi: contractConfig.abi,
    functionName: 'owner',
    query: {
      enabled: !!address && contractConfig.address !== '0x0000000000000000000000000000000000000000',
    }
  });
  
  // Check if the connected address is the owner
  const isOwner = address && data ? address.toLowerCase() === (data as string).toLowerCase() : false;
  
  return {
    isOwner,
    isLoading,
    isError,
    ownerAddress: data as string
  };
}

// Hook to update allocations on the contract (using wagmi)
export function useUpdateAllocations() {
  const { address, isConnected } = useAccount();
  const { isOwner } = useIsContractOwner();
  const chainId = useChainId();
  const contractConfig = getContractConfig('basic');
  
  console.log('useUpdateAllocations init:', {
    address,
    isConnected,
    isOwner,
    contractAddress: contractConfig.address,
    chainId,
  });
  
  // Use the updated wagmi v2 useWriteContract hook
  const { writeContractAsync, isPending, error, isSuccess, data, status } = useWriteContract();

  const updateAllocationsFn = async (allocations: Allocation[]) => {
    console.log('updateAllocations called with:', {
      allocations,
      isConnected,
      address,
      isOwner,
      contractAddress: contractConfig.address
    });

    // Check if wallet is connected
    if (!isConnected || !address) {
      throw new Error('Wallet not connected. Please connect your wallet first.');
    }

    // Check if contract address is valid
    if (!contractConfig.address || contractConfig.address === '0x0000000000000000000000000000000000000000') {
      throw new Error('Invalid contract address. Please check your environment variables.');
    }

    // Check if user is the owner
    if (!isOwner) {
      console.warn('User is not the contract owner:', {
        userAddress: address,
        contractAddress: contractConfig.address
      });
      throw new Error('You are not the owner of this contract. Only the owner can update allocations.');
    }

    // Try direct ethers.js approach if wagmi's write is not available
    if (!writeContractAsync) {
      console.log('wagmi write not available, using direct ethers.js approach');
      return updateAllocations(allocations);
    }

    try {
      // Map allocations to the format expected by the contract
      const categories = allocations.map(a => a.id);
      const percentages = allocations.map(a => BigInt(a.allocation));

      console.log('Calling contract with args:', { categories, percentages });
      
      // Call the contract using wagmi with the writeContractAsync function
      // Include required account and chain properties
      const hash = await writeContractAsync({
        abi: contractConfig.abi,
        address: contractConfig.address,
        functionName: 'updateAllocations',
        args: [categories, percentages],
        chain: seiTestnet, // Use the fully defined chain object
        account: address
      });

      console.log('Transaction submitted:', hash);
      return { hash };
    } catch (error) {
      console.error('Error updating allocations with wagmi:', error);
      // Fall back to direct ethers.js approach if wagmi fails
      console.log('Falling back to direct ethers.js approach');
      return updateAllocations(allocations);
    }
  };

  return {
    updateAllocations: updateAllocationsFn,
    isPending,
    error,
    isSuccess,
    transaction: data,
    isOwner
  };
}

// Hook to wait for transaction receipt
export function useTransactionReceipt(hash?: `0x${string}`) {
  return useWaitForTransactionReceipt({
    hash,
  });
}

// Function to get explorer URL for a transaction
export function getExplorerUrl(hash: string) {
  const explorerUrl = import.meta.env.VITE_SEI_EXPLORER_URL || 'https://seitrace.com/?chain=atlantic-2';
  return `${explorerUrl}/tx/${hash}`;
}

// Function to get explorer URL for an address
export function getAddressExplorerUrl(address: string) {
  const explorerUrl = import.meta.env.VITE_SEI_EXPLORER_URL || 'https://seitrace.com/?chain=atlantic-2';
  return `${explorerUrl}/address/${address}`;
}

// New functions for AutoSei Portfolio contract

// Register user with risk level
export const registerUser = async (riskLevel: number) => {
  if (!(window as any).ethereum) {
    throw new Error('No Ethereum provider found. Please install MetaMask or another wallet.');
  }
  
  try {
    await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
    
    const provider = new BrowserProvider((window as any).ethereum);
    const signer = await provider.getSigner();
    
    const contractConfig = getContractConfig('basic');
    const contract = new Contract(
      contractConfig.address,
      contractConfig.abi,
      signer
    );
    
    console.log('Registering user with risk level:', riskLevel);
    
    const tx = await contract.registerUser(riskLevel);
    console.log('Transaction hash:', tx.hash);
    
    const receipt = await tx.wait();
    console.log('Transaction confirmed:', receipt);
    
    return receipt;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

// Update user allocations
export const updateUserAllocations = async (categories: string[], percentages: number[]) => {
  if (!(window as any).ethereum) {
    throw new Error('No Ethereum provider found. Please install MetaMask or another wallet.');
  }
  
  try {
    await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
    
    const provider = new BrowserProvider((window as any).ethereum);
    const signer = await provider.getSigner();
    
    const contractConfig = getContractConfig('basic');
    const contract = new Contract(
      contractConfig.address,
      contractConfig.abi,
      signer
    );
    
    console.log('Updating user allocations:', { categories, percentages });
    
    const tx = await contract.updateUserAllocations(categories, percentages);
    console.log('Transaction hash:', tx.hash);
    
    const receipt = await tx.wait();
    console.log('Transaction confirmed:', receipt);
    
    return receipt;
  } catch (error) {
    console.error('Error updating user allocations:', error);
    throw error;
  }
};

// Rebalance portfolio
export const rebalancePortfolio = async () => {
  if (!(window as any).ethereum) {
    throw new Error('No Ethereum provider found. Please install MetaMask or another wallet.');
  }
  
  try {
    await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
    
    const provider = new BrowserProvider((window as any).ethereum);
    const signer = await provider.getSigner();
    
    const contractConfig = getContractConfig('basic');
    const contract = new Contract(
      contractConfig.address,
      contractConfig.abi,
      signer
    );
    
    console.log('Rebalancing portfolio...');
    
    const tx = await contract.rebalancePortfolio();
    console.log('Transaction hash:', tx.hash);
    
    const receipt = await tx.wait();
    console.log('Transaction confirmed:', receipt);
    
    return receipt;
  } catch (error) {
    console.error('Error rebalancing portfolio:', error);
    throw error;
  }
};

// Toggle auto-rebalance
export const toggleAutoRebalance = async () => {
  if (!(window as any).ethereum) {
    throw new Error('No Ethereum provider found. Please install MetaMask or another wallet.');
  }
  
  try {
    await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
    
    const provider = new BrowserProvider((window as any).ethereum);
    const signer = await provider.getSigner();
    
    const contractConfig = getContractConfig('basic');
    const contract = new Contract(
      contractConfig.address,
      contractConfig.abi,
      signer
    );
    
    console.log('Toggling auto-rebalance...');
    
    const tx = await contract.toggleAutoRebalance();
    console.log('Transaction hash:', tx.hash);
    
    const receipt = await tx.wait();
    console.log('Transaction confirmed:', receipt);
    
    return receipt;
  } catch (error) {
    console.error('Error toggling auto-rebalance:', error);
    throw error;
  }
};

// Hooks for reading contract data

// Hook to get user allocations
export function useUserAllocations(userAddress?: string) {
  const { address } = useAccount();
  const targetAddress = userAddress || address;
  const contractConfig = getContractConfig('basic');

  const { data, isLoading, isError, refetch } = useContractRead({
    address: contractConfig.address,
    abi: contractConfig.abi,
    functionName: 'getUserAllocations',
    args: [targetAddress],
    query: {
      enabled: !!targetAddress && contractConfig.address !== '0x0000000000000000000000000000000000000000',
    }
  });

  return {
    data: data ? {
      categories: data[0] as string[],
      percentages: data[1] as number[],
      isActive: data[2] as boolean[]
    } : null,
    isLoading,
    isError,
    refetch
  };
}

// Hook to get AI signals
export function useAISignals() {
  const contractConfig = getContractConfig('advanced'); // Use full contract for AI signals
  
  const { data, isLoading, isError, refetch } = useContractRead({
    address: contractConfig.address,
    abi: contractConfig.abi,
    functionName: 'getAllAISignals',
    query: {
      enabled: contractConfig.address !== '0x0000000000000000000000000000000000000000',
    }
  });

  return {
    data: data ? {
      categories: data[0] as string[],
      signals: data[1] as number[],
      confidences: data[2] as number[],
      timestamps: data[3] as number[]
    } : null,
    isLoading,
    isError,
    refetch
  };
}

// Hook to get active trading bots
export function useActiveTradingBots() {
  const contractConfig = getContractConfig('advanced'); // Use full contract for trading bots
  
  const { data, isLoading, isError, refetch } = useContractRead({
    address: contractConfig.address,
    abi: contractConfig.abi,
    functionName: 'getActiveTradingBots',
    query: {
      enabled: contractConfig.address !== '0x0000000000000000000000000000000000000000',
    }
  });

  return {
    data: data ? {
      botIds: data[0] as number[],
      names: data[1] as string[],
      strategies: data[2] as string[],
      performances: data[3] as number[],
      trades: data[4] as number[]
    } : null,
    isLoading,
    isError,
    refetch
  };
}

// Hook to get recent whale activities
export function useWhaleActivities(limit: number = 10) {
  const contractConfig = getContractConfig('advanced'); // Use full contract for whale activities
  
  const { data, isLoading, isError, refetch } = useContractRead({
    address: contractConfig.address,
    abi: contractConfig.abi,
    functionName: 'getRecentWhaleActivities',
    args: [limit],
    query: {
      enabled: contractConfig.address !== '0x0000000000000000000000000000000000000000',
    }
  });

  return {
    data: data ? {
      whales: data[0] as string[],
      tokens: data[1] as string[],
      amounts: data[2] as number[],
      actionTypes: data[3] as number[],
      timestamps: data[4] as number[]
    } : null,
    isLoading,
    isError,
    refetch
  };
}

// Hook to get portfolio summary
export function usePortfolioSummary(userAddress?: string) {
  const { address } = useAccount();
  const targetAddress = userAddress || address;
  const contractConfig = getContractConfig('basic');

  const { data, isLoading, isError, refetch } = useContractRead({
    address: contractConfig.address,
    abi: contractConfig.abi,
    functionName: 'getPortfolioSummary',
    args: [targetAddress],
    query: {
      enabled: !!targetAddress && contractConfig.address !== '0x0000000000000000000000000000000000000000',
    }
  });

  return {
    data: data ? {
      totalValue: data[0] as number,
      performanceScore: data[1] as number,
      riskLevel: data[2] as number,
      autoRebalance: data[3] as boolean,
      lastRebalance: data[4] as number
    } : null,
    isLoading,
    isError,
    refetch
  };
}

// Hook to get supported categories
export function useSupportedCategories() {
  const contractConfig = getContractConfig('basic');
  
  const { data, isLoading, isError, refetch } = useContractRead({
    address: contractConfig.address,
    abi: contractConfig.abi,
    functionName: 'getSupportedCategories',
    query: {
      enabled: contractConfig.address !== '0x0000000000000000000000000000000000000000',
    }
  });

  return {
    data: data as string[] || [],
    isLoading,
    isError,
    refetch
  };
}

// Hook to get total users
export function useTotalUsers() {
  const contractConfig = getContractConfig('basic');
  
  const { data, isLoading, isError, refetch } = useContractRead({
    address: contractConfig.address,
    abi: contractConfig.abi,
    functionName: 'getTotalUsers',
    query: {
      enabled: contractConfig.address !== '0x0000000000000000000000000000000000000000',
    }
  });

  return {
    data: data as number || 0,
    isLoading,
    isError,
    refetch
  };
}

// Utility functions

// Convert allocation data to UI format
export const formatAllocationsForUI = (categories: string[], percentages: number[]): Allocation[] => {
  return categories.map((category, index) => ({
    id: category,
    name: categoryNames[category] || category,
    color: categoryColors[category] || '#6B7280',
    allocation: percentages[index]
  }));
};

// Convert AI signal number to readable format
export const formatAISignal = (signal: number): string => {
  switch (signal) {
    case 0: return 'SELL';
    case 1: return 'HOLD';
    case 2: return 'BUY';
    default: return 'UNKNOWN';
  }
};

// Convert trading bot performance to percentage
export const formatPerformance = (performance: number): string => {
  return `${(performance / 100).toFixed(1)}%`;
};

// Convert timestamp to readable date
export const formatTimestamp = (timestamp: number): string => {
  return new Date(timestamp * 1000).toLocaleString();
};

// Convert whale action type to readable format
export const formatWhaleAction = (actionType: number): string => {
  return actionType === 0 ? 'BUY' : 'SELL';
};

// Utility functions for contract information
export const getContractInfo = () => {
  return {
    core: {
      address: AUTOSEI_PORTFOLIO_CORE_ADDRESS,
      name: 'AutoSeiPortfolioCore',
      description: 'Core portfolio management functions',
      features: ['Basic allocations', 'User registration', 'Portfolio summary']
    },
    full: {
      address: AUTOSEI_PORTFOLIO_FULL_ADDRESS,
      name: 'AutoSeiPortfolio',
      description: 'Full-featured portfolio management with AI signals',
      features: ['AI signals', 'Trading bots', 'Whale tracking', 'Advanced analytics']
    }
  };
};

// Function to validate contract addresses
export const validateContractAddresses = () => {
  const issues = [];
  
  if (!AUTOSEI_PORTFOLIO_CORE_ADDRESS || AUTOSEI_PORTFOLIO_CORE_ADDRESS === '0x0000000000000000000000000000000000000000') {
    issues.push('Core contract address is not configured');
  }
  
  if (!AUTOSEI_PORTFOLIO_FULL_ADDRESS || AUTOSEI_PORTFOLIO_FULL_ADDRESS === '0x0000000000000000000000000000000000000000') {
    issues.push('Full contract address is not configured');
  }
  
  return {
    isValid: issues.length === 0,
    issues,
    addresses: {
      core: AUTOSEI_PORTFOLIO_CORE_ADDRESS,
      full: AUTOSEI_PORTFOLIO_FULL_ADDRESS
    }
  };
};

// Log contract configuration for debugging
export const logContractConfiguration = () => {
  console.log('=== AutoSei Contract Configuration ===');
  console.log('Core Contract (AutoSeiPortfolioCore):', AUTOSEI_PORTFOLIO_CORE_ADDRESS);
  console.log('Full Contract (AutoSeiPortfolio):', AUTOSEI_PORTFOLIO_FULL_ADDRESS);
  console.log('Contract validation:', validateContractAddresses());
  console.log('=====================================');
};
