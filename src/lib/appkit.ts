
// src/lib/appkit.ts
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { createAppKit, useAppKit, useAppKitAccount, useAppKitEvents, useAppKitNetwork, useAppKitState, useAppKitTheme, useDisconnect, useWalletInfo } from '@reown/appkit/react'

// Define our own AppKitNetwork type since it's not exported from @reown/appkit
type AppKitNetwork = {
  id: number;
  name: string;
  network: string;
  nativeCurrency: {
    decimals: number;
    name: string;
    symbol: string;
  };
  rpcUrls: {
    default: {
      http: string[];
    };
    public: {
      http: string[];
    };
  };
  blockExplorers: {
    default: {
      name: string;
      url: string;
    };
  };
};

// Define Sei EVM Testnet
export const seiTestnet = {
  id: 1328,
  name: 'Sei EVM Testnet',
  network: 'sei-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'SEI',
    symbol: 'SEI',
  },
  rpcUrls: {
    default: {
      http: ['https://evm-rpc-testnet.sei-apis.com'],
    },
    public: {
      http: ['https://evm-rpc-testnet.sei-apis.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'SeiTrace',
      url: 'https://seitrace.com/?chain=atlantic-2',
    },
  },
};

// Get Project ID from environment variables
// Use a function to safely access environment variables
const getProjectId = () => {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined') {
    // Try to get from import.meta.env (Vite)
    if (import.meta.env && import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID) {
      return import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID;
    }
    
    // Check if it's available in window.ENV (if you set it that way)
    if ((window as any).ENV && (window as any).ENV.WALLET_CONNECT_PROJECT_ID) {
      return (window as any).ENV.WALLET_CONNECT_PROJECT_ID;
    }
  }
  
  // Fallback for development or if env var is missing
  return '09fc7dba755d62670df0095c041ed441';
};

// Get the project ID
export const projectId = getProjectId();

// Log the project ID (masked for security)
if (typeof window !== 'undefined') {
  const maskedId = projectId ? 
    `${projectId.substring(0, 4)}...${projectId.substring(projectId.length - 4)}` : 
    'undefined';
  console.log('Using WalletConnect Project ID:', maskedId);
}

// Setup wagmi adapter with correct type handling
export const wagmiAdapter = new WagmiAdapter({
  networks: [seiTestnet] as AppKitNetwork[],
  projectId
});

// Create modal with proper type handling
export const modal = createAppKit({
  adapters: [wagmiAdapter],
  networks: [seiTestnet] as unknown as [AppKitNetwork, ...AppKitNetwork[]],
  metadata: {
    name: 'AutoSei',
    description: 'AI-Powered Portfolio Allocation on Sei',
    url: typeof window !== 'undefined' ? window.location.origin : 'https://autosei.xyz',
    icons: ['https://img.icons8.com/3d-fluency/94/globe-africa.png']
  },
  projectId,
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': '#8B5CF6',
  },
  features: {
    analytics: true
  }
});

// Re-export hooks from @reown/appkit/react
export {
  useAppKit,
  useAppKitState,
  useAppKitTheme,
  useAppKitEvents,
  useAppKitAccount,
  useAppKitNetwork,
  useWalletInfo,
  useDisconnect
}
