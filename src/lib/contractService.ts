// src/lib/contractService.ts
import { useContractRead, useWriteContract, useWaitForTransactionReceipt, useAccount, useChainId } from 'wagmi';
import { ethers, BrowserProvider, Contract } from 'ethers'; // Import from ethers v6
import AutoSeiPortfolioCoreABI from '../abi/AutoSeiPortfolioCore.json';
import AutoSeiPortfolioABI from '../abi/AutoSeiPortfolio.json';
import MockUSDCABI from '../abi/MockUSDC.json';
import { seiTestnet } from './chains';

// Contract addresses from environment variables
export const AUTOSEI_PORTFOLIO_CORE_ADDRESS = (import.meta.env.VITE_AUTOSEI_PORTFOLIO_CORE_ADDRESS || '0x0000000000000000000000000000000000000000') as `0x${string}`;
export const AUTOSEI_PORTFOLIO_FULL_ADDRESS = (import.meta.env.VITE_AUTOSEI_PORTFOLIO_FULL_ADDRESS || '0x0000000000000000000000000000000000000000') as `0x${string}`;
export const MOCK_USDC_ADDRESS = (import.meta.env.VITE_MOCK_USDC_ADDRESS || '0x0000000000000000000000000000000000000000') as `0x${string}`;

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
  },
  usdc: {
    address: MOCK_USDC_ADDRESS,
    abi: MockUSDCABI,
    name: 'MockUSDC'
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
    
    console.log('Contract config:', {
      address: contractConfig.address,
      name: contractConfig.name,
      abiLength: contractConfig.abi.length
    });
    
    // Validate contract address
    if (!contractConfig.address || contractConfig.address === '0x0000000000000000000000000000000000000000') {
      throw new Error(`Invalid contract address: ${contractConfig.address}. Please check your environment variables.`);
    }
    
    // Create contract instance - ethers v6 syntax
    const contract = new Contract(
      contractConfig.address,
      contractConfig.abi,
      signer
    );
    
    console.log('Contract instance created:', {
      address: await contract.getAddress(),
      hasUpdateUserAllocations: typeof contract.updateUserAllocations === 'function'
    });
    
    // Check if the function exists
    if (typeof contract.updateUserAllocations !== 'function') {
      console.error('updateUserAllocations function not found on contract');
      console.log('Available functions:', Object.keys(contract.interface.fragments.filter(f => f.type === 'function')));
      throw new Error('updateUserAllocations function not found on contract');
    }
    
    // Check if user is registered by calling userPortfolios
    console.log('Checking if user is registered...');
    let isRegistered = false;
    try {
      const userPortfolio = await contract.userPortfolios(userAddress);
      isRegistered = userPortfolio.isActive;
      console.log('User portfolio status:', {
        isActive: userPortfolio.isActive,
        totalValue: userPortfolio.totalValue.toString(),
        riskLevel: userPortfolio.riskLevel.toString()
      });
    } catch (error) {
      console.log('Error checking user portfolio, assuming not registered:', error);
      isRegistered = false;
    }
    
    // If user is not registered, register them first
    if (!isRegistered) {
      console.log('User not registered, registering with default risk level...');
      try {
        const registerTx = await contract.registerUser(3); // Medium risk level (1-5 scale)
        console.log('Registration transaction sent:', registerTx.hash);
        
        // Wait for registration to complete
        console.log('Waiting for registration to confirm...');
        const registerReceipt = await registerTx.wait();
        console.log('Registration confirmed:', registerReceipt);
        
        // Double-check registration was successful
        const userPortfolioAfter = await contract.userPortfolios(userAddress);
        if (!userPortfolioAfter.isActive) {
          throw new Error('Registration appeared to succeed but user is still not active');
        }
        console.log('Registration verified successful');
      } catch (registerError) {
        console.error('Failed to register user:', registerError);
        throw new Error(`Failed to register user: ${registerError instanceof Error ? registerError.message : 'Unknown error'}`);
      }
    }
    
    // Prepare the data for the contract call
    const categories = allocations.map(a => a.id);
    const percentages = allocations.map(a => a.allocation);
    
    // Validate total is exactly 100
    const total = percentages.reduce((sum, p) => sum + p, 0);
    if (total !== 100) {
      throw new Error(`Total allocation must be exactly 100%, got ${total}%`);
    }
    
    // Filter out any allocations with 0% to avoid contract issues
    const filteredAllocations = allocations.filter(a => a.allocation > 0);
    const filteredCategories = filteredAllocations.map(a => a.id);
    const filteredPercentages = filteredAllocations.map(a => a.allocation);
    
    // Validate filtered total is still 100
    const filteredTotal = filteredPercentages.reduce((sum, p) => sum + p, 0);
    if (filteredTotal !== 100) {
      throw new Error(`Filtered allocation total must be exactly 100%, got ${filteredTotal}%`);
    }
    
    console.log('Calling contract with (filtered):', {
      userAddress,
      contractAddress: contractConfig.address,
      contractName: contractConfig.name,
      categories: filteredCategories,
      percentages: filteredPercentages,
      totalPercentage: filteredTotal
    });
    
    // Estimate gas first to check if the transaction will succeed
    try {
      const gasEstimate = await contract.updateUserAllocations.estimateGas(filteredCategories, filteredPercentages);
      console.log('Gas estimate:', gasEstimate.toString());
    } catch (gasError) {
      console.error('Gas estimation failed:', gasError);
      throw new Error(`Transaction would fail: ${gasError instanceof Error ? gasError.message : 'Unknown error'}`);
    }
    
    // Call the contract function with explicit gas limit - ethers v6 syntax
    const tx = await contract.updateUserAllocations(filteredCategories, filteredPercentages, {
      gasLimit: 500000 // Increased gas limit for more complex operations
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
  const { address } = useAccount();
  
  const { data, isLoading, isError, refetch } = useContractRead({
    address: contractConfig.address,
    abi: contractConfig.abi,
    functionName: 'getUserAllocations',
    args: [address],
    query: {
      enabled: contractConfig.address !== '0x0000000000000000000000000000000000000000' && !!address,
    }
  });
  
  // Map contract data to our application format
  const processData = () => {
    if (!data) return [];
    
    try {
      const [categories, percentages, isActive] = data as [string[], bigint[], boolean[]];
      
      return categories.map((category, index) => ({
        id: category,
        name: categoryNames[category] || category,
        color: categoryColors[category] || '#6B7280',
        allocation: Number(percentages[index])
      })).filter((_, index) => isActive[index]); // Only include active allocations
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
        functionName: 'updateUserAllocations',
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
      percentages: (data[1] as any[]).map(p => Number(p)), // Convert BigInt array to number array
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
      totalValue: Number(data[0]),  // Convert BigInt to number safely
      performanceScore: Number(data[1]),  // Convert BigInt to number safely
      riskLevel: Number(data[2]),  // Convert BigInt to number safely
      autoRebalance: data[3] as boolean,
      lastRebalance: Number(data[4])  // Convert BigInt to number safely
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

// Check if user is registered with the contract
export const checkUserRegistration = async (userAddress: string) => {
  if (!(window as any).ethereum) {
    throw new Error('No Ethereum provider found. Please install MetaMask or another wallet.');
  }
  
  try {
    const provider = new BrowserProvider((window as any).ethereum);
    const contractConfig = getContractConfig('basic');
    
    const contract = new Contract(
      contractConfig.address,
      contractConfig.abi,
      provider // Read-only, no signer needed
    );
    
    console.log('Checking registration for address:', userAddress);
    
    const userPortfolio = await contract.userPortfolios(userAddress);
    const isRegistered = userPortfolio.isActive;
    
    console.log('User registration status:', {
      address: userAddress,
      isRegistered,
      totalValue: userPortfolio.totalValue.toString(),
      riskLevel: userPortfolio.riskLevel.toString(),
      lastRebalance: userPortfolio.lastRebalance.toString()
    });
    
    return {
      isRegistered,
      portfolio: {
        totalValue: Number(userPortfolio.totalValue),
        riskLevel: Number(userPortfolio.riskLevel),
        lastRebalance: Number(userPortfolio.lastRebalance),
        autoRebalance: userPortfolio.autoRebalance,
        performanceScore: Number(userPortfolio.performanceScore)
      }
    };
  } catch (error) {
    console.error('Error checking user registration:', error);
    return {
      isRegistered: false,
      portfolio: null
    };
  }
};

// Register user with the contract
export const registerUserWithContract = async (riskLevel: number = 3) => {
  if (!(window as any).ethereum) {
    throw new Error('No Ethereum provider found. Please install MetaMask or another wallet.');
  }
  
  try {
    await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
    
    const provider = new BrowserProvider((window as any).ethereum);
    const signer = await provider.getSigner();
    const userAddress = await signer.getAddress();
    
    const contractConfig = getContractConfig('basic');
    const contract = new Contract(
      contractConfig.address,
      contractConfig.abi,
      signer
    );
    
    console.log('Registering user with contract:', {
      address: userAddress,
      riskLevel,
      contractAddress: contractConfig.address
    });
    
    // Call registerUser function
    const tx = await contract.registerUser(riskLevel, {
      gasLimit: 200000
    });
    
    console.log('Registration transaction sent:', tx.hash);
    
    // Wait for transaction confirmation
    const receipt = await tx.wait();
    console.log('Registration confirmed:', receipt);
    
    return {
      hash: tx.hash as `0x${string}`,
      receipt
    };
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

// Public function to manually register a user with a chosen risk level
export const registerUserManually = async (riskLevel: number = 3): Promise<{ hash: `0x${string}` }> => {
  try {
    const contractConfig = getContractConfig('basic');
    
    // Get the provider and signer
    const provider = new BrowserProvider((window as any).ethereum);
    const signer = await provider.getSigner();
    const userAddress = await signer.getAddress();
    
    console.log('Manual registration for user:', userAddress, 'with risk level:', riskLevel);
    
    // Create contract instance
    const contract = new Contract(
      contractConfig.address,
      contractConfig.abi,
      signer
    );
    
    // Check if user is already registered
    try {
      const userPortfolio = await contract.userPortfolios(userAddress);
      if (userPortfolio.isActive) {
        console.log('User is already registered');
        throw new Error('User is already registered');
      }
    } catch (error) {
      // If error checking, assume not registered and continue
      console.log('Proceeding with registration...');
    }
    
    // Register the user
    const registerTx = await contract.registerUser(riskLevel);
    console.log('Manual registration transaction sent:', registerTx.hash);
    
    // Wait for registration to complete
    const registerReceipt = await registerTx.wait();
    console.log('Manual registration confirmed:', registerReceipt);
    
    // Verify registration was successful
    const userPortfolioAfter = await contract.userPortfolios(userAddress);
    if (!userPortfolioAfter.isActive) {
      throw new Error('Registration appeared to succeed but user is still not active');
    }
    console.log('Manual registration verified successful');
    
    return {
      hash: registerTx.hash as `0x${string}`
    };
  } catch (error) {
    console.error('Error in manual registration:', error);
    throw error;
  }
};

// Function to check user registration status
export const checkUserRegistrationStatus = async (): Promise<{
  isRegistered: boolean;
  userAddress: string;
  riskLevel?: number;
  totalValue?: string;
}> => {
  try {
    const contractConfig = getContractConfig('basic');
    
    // Get the provider and signer
    const provider = new BrowserProvider((window as any).ethereum);
    const signer = await provider.getSigner();
    const userAddress = await signer.getAddress();
    
    // Create contract instance
    const contract = new Contract(
      contractConfig.address,
      contractConfig.abi,
      signer
    );
    
    // Check user portfolio
    const userPortfolio = await contract.userPortfolios(userAddress);
    
    return {
      isRegistered: userPortfolio.isActive,
      userAddress,
      riskLevel: userPortfolio.isActive ? Number(userPortfolio.riskLevel) : undefined,
      totalValue: userPortfolio.isActive ? userPortfolio.totalValue.toString() : undefined
    };
  } catch (error) {
    console.error('Error checking user registration status:', error);
    throw error;
  }
};

// Make manual functions available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).registerUserManually = registerUserManually;
  (window as any).checkUserRegistrationStatus = checkUserRegistrationStatus;
}

// USDC-related hooks and functions
export function useUSDCBalance(address?: `0x${string}`) {
  const { data, isLoading, refetch } = useContractRead({
    address: MOCK_USDC_ADDRESS,
    abi: MockUSDCABI,
    functionName: 'balanceOf',
    args: [address],
    query: {
      enabled: MOCK_USDC_ADDRESS !== '0x0000000000000000000000000000000000000000' && !!address,
    }
  });

  return {
    data: data ? (data as bigint) : BigInt(0),
    isLoading,
    refetch
  };
}

export function useUSDCInfo() {
  const { data: name } = useContractRead({
    address: MOCK_USDC_ADDRESS,
    abi: MockUSDCABI,
    functionName: 'name',
    query: {
      enabled: MOCK_USDC_ADDRESS !== '0x0000000000000000000000000000000000000000',
    }
  });

  const { data: symbol } = useContractRead({
    address: MOCK_USDC_ADDRESS,
    abi: MockUSDCABI,
    functionName: 'symbol',
    query: {
      enabled: MOCK_USDC_ADDRESS !== '0x0000000000000000000000000000000000000000',
    }
  });

  const { data: decimals } = useContractRead({
    address: MOCK_USDC_ADDRESS,
    abi: MockUSDCABI,
    functionName: 'decimals',
    query: {
      enabled: MOCK_USDC_ADDRESS !== '0x0000000000000000000000000000000000000000',
    }
  });

  return {
    name: name as string,
    symbol: symbol as string,
    decimals: decimals as number,
    address: MOCK_USDC_ADDRESS
  };
}

export function useUSDCFaucet() {
  const { address } = useAccount();
  
  const claimFaucet = async () => {
    if (!address) {
      throw new Error('Wallet not connected');
    }
    
    // Get the provider and signer
    const provider = new BrowserProvider((window as any).ethereum);
    const signer = await provider.getSigner();
    
    // Create contract instance
    const contract = new Contract(
      MOCK_USDC_ADDRESS,
      MockUSDCABI,
      signer
    );
    
    // 100 USDC = 100 * 10^6 (6 decimals for USDC)
    const amount = BigInt(100 * 10**6);
    
    console.log('Claiming USDC faucet:', {
      address,
      amount: amount.toString(),
      amountFormatted: '100 USDC'
    });
    
    // Call the mint function
    const tx = await contract.mint(address, amount);
    console.log('USDC faucet transaction:', tx.hash);
    
    // Wait for confirmation
    const receipt = await tx.wait();
    console.log('USDC faucet confirmed:', receipt);
    
    return {
      hash: tx.hash,
      receipt
    };
  };

  return {
    claimFaucet,
    isPending: false
  };
}

// Utility function to format USDC amounts
export const formatUSDCAmount = (amount: bigint, decimals: number = 6): string => {
  const divisor = BigInt(10 ** decimals);
  const wholePart = amount / divisor;
  const fractionalPart = amount % divisor;
  
  if (fractionalPart === BigInt(0)) {
    return wholePart.toString();
  }
  
  const fractionalStr = fractionalPart.toString().padStart(decimals, '0');
  const trimmedFractional = fractionalStr.replace(/0+$/, '');
  
  if (trimmedFractional === '') {
    return wholePart.toString();
  }
  
  return `${wholePart}.${trimmedFractional}`;
};

// Convert dollar amount to USDC wei (6 decimals)
export const dollarToUSDCWei = (dollarAmount: number): bigint => {
  return BigInt(Math.floor(dollarAmount * 10**6));
};

// USDC Transfer function for strategy payments
export function useUSDCTransfer() {
  const { address } = useAccount();
  
  const transferUSDC = async (to: `0x${string}`, amount: bigint) => {
    if (!address) {
      throw new Error('Wallet not connected');
    }
    
    // Get the provider and signer
    const provider = new BrowserProvider((window as any).ethereum);
    const signer = await provider.getSigner();
    
    // Create contract instance
    const contract = new Contract(
      MOCK_USDC_ADDRESS,
      MockUSDCABI,
      signer
    );
    
    console.log('Transferring USDC:', {
      from: address,
      to,
      amount: amount.toString(),
      amountFormatted: formatUSDCAmount(amount)
    });
    
    // Call the transfer function
    const tx = await contract.transfer(to, amount);
    console.log('USDC transfer transaction:', tx.hash);
    
    // Wait for confirmation
    const receipt = await tx.wait();
    console.log('USDC transfer confirmed:', receipt);
    
    return {
      hash: tx.hash,
      receipt
    };
  };

  return {
    transferUSDC,
    isPending: false
  };
}

// USDC Approval function for spending
export function useUSDCApproval() {
  const { address } = useAccount();
  
  const approveUSDC = async (spender: `0x${string}`, amount: bigint) => {
    if (!address) {
      throw new Error('Wallet not connected');
    }
    
    // Get the provider and signer
    const provider = new BrowserProvider((window as any).ethereum);
    const signer = await provider.getSigner();
    
    // Create contract instance
    const contract = new Contract(
      MOCK_USDC_ADDRESS,
      MockUSDCABI,
      signer
    );
    
    console.log('Approving USDC:', {
      owner: address,
      spender,
      amount: amount.toString(),
      amountFormatted: formatUSDCAmount(amount)
    });
    
    // Call the approve function
    const tx = await contract.approve(spender, amount);
    console.log('USDC approval transaction:', tx.hash);
    
    // Wait for confirmation
    const receipt = await tx.wait();
    console.log('USDC approval confirmed:', receipt);
    
    return {
      hash: tx.hash,
      receipt
    };
  };

  return {
    approveUSDC,
    isPending: false
  };
}

// Strategy payment destination (treasury/DAO address)
export const STRATEGY_PAYMENT_ADDRESS = '0x1234567890123456789012345678901234567890' as `0x${string}`;

// Function to handle strategy purchase payment
export async function payForStrategy(strategyPrice: number): Promise<{ hash: string; receipt: any }> {
  const provider = new BrowserProvider((window as any).ethereum);
  const signer = await provider.getSigner();
  const address = await signer.getAddress();
  
  if (!address) {
    throw new Error('Wallet not connected');
  }
  
  // Convert price to USDC wei
  const amountWei = dollarToUSDCWei(strategyPrice);
  
  // Create contract instance
  const contract = new Contract(
    MOCK_USDC_ADDRESS,
    MockUSDCABI,
    signer
  );
  
  console.log('Paying for strategy:', {
    from: address,
    to: STRATEGY_PAYMENT_ADDRESS,
    price: strategyPrice,
    amount: amountWei.toString(),
    amountFormatted: formatUSDCAmount(amountWei)
  });
  
  // Transfer USDC to treasury
  const tx = await contract.transfer(STRATEGY_PAYMENT_ADDRESS, amountWei);
  console.log('Strategy payment transaction:', tx.hash);
  
  // Wait for confirmation
  const receipt = await tx.wait();
  console.log('Strategy payment confirmed:', receipt);
  
  return {
    hash: tx.hash,
    receipt
  };
}


