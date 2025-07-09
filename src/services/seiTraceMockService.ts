// src/services/seiTraceMockService.ts
// Mock service for SeiTrace API development when API key is unavailable

export interface MockSeiTraceTransfer {
  hash: string;
  blockNumber: number;
  timestamp: number;
  from: string;
  to: string;
  value: string;
  tokenAddress: string;
  tokenSymbol: string;
  tokenName: string;
  gasUsed: string;
  gasPrice: string;
  valueUSD?: number;
}

export interface MockSeiTraceHolder {
  address: string;
  balance: string;
  percentage: number;
  rank: number;
  isWhale: boolean;
}

export interface MockSeiTraceToken {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  holders: number;
  price?: number;
  marketCap?: number;
}

export interface MockWhaleActivity {
  address: string;
  type: 'buy' | 'sell' | 'transfer';
  token: string;
  amount: string;
  amountUSD: number;
  timestamp: number;
  hash: string;
  impact: 'high' | 'medium' | 'low';
}

class SeiTraceMockService {
  // Your actual project addresses for realistic mock data
  private projectAddresses = {
    yourWallet: '0x5ebaddf71482d40044391923BE1fC42938129988',
    portfolioCore: '0x2921dbEd807E9ADfF57885a6666d82d6e6596AC2',
    portfolioFull: '0xF76Bb2A92d288f15bF17C405Ae715f8d1cedB058',
    mockUSDC: '0x9d5F1273002Cc4DAC76B72249ed59B21Ba41D526',
  };

  // Mock whale addresses (including your addresses)
  private mockWhaleAddresses = [
    '0x5ebaddf71482d40044391923BE1fC42938129988', // Your wallet (whale)
    '0x2921dbEd807E9ADfF57885a6666d82d6e6596AC2', // Your contract (whale)
    '0x8315177aB297bA92A06054cE80a67Ed4DBd7ed3a', // Mock whale 1
    '0xBE0eB53F46cd790Cd13851d5EFf43D12404d33E8', // Mock whale 2
    '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // Mock whale 3
    '0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503', // Mock whale 4
    '0x1111111254fb6c44bAC0beD2854e76F90643097d', // Mock whale 5
    '0x40aa958dd87fc8305b97f2ba922cddca374bcd7f', // Mock whale 6
  ];

  // Enhanced token data including your USDC
  private mockTokens = {
    [this.projectAddresses.mockUSDC]: { 
      symbol: 'USDC', 
      name: 'Mock USD Coin', 
      decimals: 6, 
      price: 1.00,
      totalSupply: '1000000000',
      isProjectToken: true
    },
    '0x3f56e0c36d275367b8c502090edf38289b3dea83': { 
      symbol: 'MAI', 
      name: 'Mai Stablecoin', 
      decimals: 18, 
      price: 1.00,
      totalSupply: '500000000'
    },
    '0x4a81f8796e0c6ad4877a51c86693b0de8093f2ef': { 
      symbol: 'CVX', 
      name: 'Convex Token', 
      decimals: 18, 
      price: 2.45,
      totalSupply: '100000000'
    },
    '0x8290333cef9e6d528dd5618fb97a76f268f3edd4': { 
      symbol: 'ANKR', 
      name: 'Ankr Network', 
      decimals: 18, 
      price: 0.032,
      totalSupply: '10000000000'
    },
    '0xa0b86a33e6d8f8c6b1d0a7e4d5f1a3c2b4f6789a': { 
      symbol: 'MOCK', 
      name: 'Mock Token', 
      decimals: 18, 
      price: 15.67,
      totalSupply: '50000000'
    },
  };

  private generateRandomAddress(): string {
    return '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  }

  private generateRandomHash(): string {
    return '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  }

  async getTokenInfo(contractAddress: string): Promise<MockSeiTraceToken> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    const token = this.mockTokens[contractAddress as keyof typeof this.mockTokens];
    
    if (token) {
      // Return detailed info for known tokens
      return {
        address: contractAddress,
        name: token.name,
        symbol: token.symbol,
        decimals: token.decimals,
        totalSupply: token.totalSupply || (Math.random() * 1000000000).toFixed(0),
        holders: token.isProjectToken ? 1500 + Math.floor(Math.random() * 500) : Math.floor(Math.random() * 10000) + 100,
        price: token.price,
        marketCap: token.price * parseFloat(token.totalSupply || '1000000'),
      };
    } else {
      // Generate data for unknown tokens
      return {
        address: contractAddress,
        name: 'Unknown Token',
        symbol: 'UNK',
        decimals: 18,
        totalSupply: (Math.random() * 1000000000).toFixed(0),
        holders: Math.floor(Math.random() * 1000) + 50,
        price: Math.random() * 100,
        marketCap: Math.random() * 10000000,
      };
    }
  }

  async getTokenTransfers(contractAddress: string, limit = 10): Promise<MockSeiTraceTransfer[]> {
    await new Promise(resolve => setTimeout(resolve, 700 + Math.random() * 800));

    const token = this.mockTokens[contractAddress as keyof typeof this.mockTokens] || {
      symbol: 'UNK',
      name: 'Unknown Token',
      decimals: 18,
      price: Math.random() * 100
    };

    return Array.from({ length: limit }, (_, i) => {
      const amount = (Math.random() * 1000000).toFixed(2);
      const isWhaleTransfer = Math.random() > 0.7;
      
      return {
        hash: this.generateRandomHash(),
        blockNumber: 15000000 + Math.floor(Math.random() * 100000),
        timestamp: Date.now() - (i * 3600000) - Math.random() * 3600000,
        from: isWhaleTransfer ? this.mockWhaleAddresses[Math.floor(Math.random() * this.mockWhaleAddresses.length)] : this.generateRandomAddress(),
        to: isWhaleTransfer ? this.mockWhaleAddresses[Math.floor(Math.random() * this.mockWhaleAddresses.length)] : this.generateRandomAddress(),
        value: amount,
        tokenAddress: contractAddress,
        tokenSymbol: token.symbol,
        tokenName: token.name,
        gasUsed: (21000 + Math.random() * 100000).toFixed(0),
        gasPrice: (Math.random() * 50).toFixed(9),
        valueUSD: parseFloat(amount) * token.price,
      };
    });
  }

  async getTokenHolders(contractAddress: string, limit = 10): Promise<MockSeiTraceHolder[]> {
    await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 900));

    // Include some whale addresses
    const holders = [...this.mockWhaleAddresses.slice(0, Math.min(limit / 2, this.mockWhaleAddresses.length))]
      .concat(Array.from({ length: Math.max(0, limit - this.mockWhaleAddresses.length) }, () => this.generateRandomAddress()));

    return holders.map((address, i) => {
      const isWhale = this.mockWhaleAddresses.includes(address);
      const balance = isWhale 
        ? (Math.random() * 10000000 + 1000000).toFixed(2) // 1M+ for whales
        : (Math.random() * 1000000).toFixed(2);
      
      return {
        address,
        balance,
        percentage: isWhale ? Math.random() * 20 + 5 : Math.random() * 5,
        rank: i + 1,
        isWhale,
      };
    }).sort((a, b) => parseFloat(b.balance) - parseFloat(a.balance));
  }

  async getWhaleActivity(limit = 20): Promise<MockWhaleActivity[]> {
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 700));

    const activities: MockWhaleActivity[] = [];
    const tokenAddresses = Object.keys(this.mockTokens);

    for (let i = 0; i < limit; i++) {
      const tokenAddress = tokenAddresses[Math.floor(Math.random() * tokenAddresses.length)];
      const token = this.mockTokens[tokenAddress as keyof typeof this.mockTokens];
      const whale = this.mockWhaleAddresses[Math.floor(Math.random() * this.mockWhaleAddresses.length)];
      
      const types: ('buy' | 'sell' | 'transfer')[] = ['buy', 'sell', 'transfer'];
      const type = types[Math.floor(Math.random() * types.length)];
      
      const amount = Math.random() * 1000000 + 50000; // $50k+ transactions
      const amountUSD = amount * token.price;
      
      let impact: 'high' | 'medium' | 'low' = 'low';
      if (amountUSD > 500000) impact = 'high';
      else if (amountUSD > 100000) impact = 'medium';

      activities.push({
        address: whale,
        type,
        token: token.symbol,
        amount: amount.toFixed(2),
        amountUSD,
        timestamp: Date.now() - (i * 1800000) - Math.random() * 1800000, // Last 10 hours
        hash: this.generateRandomHash(),
        impact,
      });
    }

    return activities.sort((a, b) => b.timestamp - a.timestamp);
  }

  async getAddressInfo(address: string) {
    await new Promise(resolve => setTimeout(resolve, 400 + Math.random() * 600));

    const isYourWallet = address.toLowerCase() === this.projectAddresses.yourWallet.toLowerCase();
    const isYourContract = Object.values(this.projectAddresses).some(
      addr => addr.toLowerCase() === address.toLowerCase() && addr !== this.projectAddresses.yourWallet
    );
    const isKnownWhale = this.mockWhaleAddresses.includes(address);
    
    if (isYourWallet) {
      // Your wallet - high activity whale
      return {
        address,
        balance: (75.5 + Math.random() * 25).toFixed(4), // 75-100 SEI
        tokenCount: 25 + Math.floor(Math.random() * 10), // 25-35 tokens
        txCount: 850 + Math.floor(Math.random() * 200), // 850-1050 txs
        firstTxDate: Date.now() - (365 * 24 * 60 * 60 * 1000), // 1 year ago
        lastTxDate: Date.now() - Math.random() * 2 * 60 * 60 * 1000, // Last 2 hours
        isContract: false,
        isWhale: true,
        tags: ['whale', 'high-volume', 'project-owner'],
      };
    } else if (isYourContract) {
      // Your contracts - high balance, contract activity
      return {
        address,
        balance: (2000 + Math.random() * 3000).toFixed(4), // 2000-5000 SEI
        tokenCount: 5 + Math.floor(Math.random() * 5), // 5-10 tokens
        txCount: 1200 + Math.floor(Math.random() * 800), // 1200-2000 txs
        firstTxDate: Date.now() - (180 * 24 * 60 * 60 * 1000), // 6 months ago
        lastTxDate: Date.now() - Math.random() * 24 * 60 * 60 * 1000, // Last day
        isContract: true,
        isWhale: true,
        tags: ['contract', 'whale', 'autosei-portfolio'],
      };
    } else if (isKnownWhale) {
      // Other known whales
      return {
        address,
        balance: (20 + Math.random() * 80).toFixed(4), // 20-100 SEI
        tokenCount: Math.floor(Math.random() * 30) + 15, // 15-45 tokens
        txCount: Math.floor(Math.random() * 5000) + 200, // 200-5200 txs
        firstTxDate: Date.now() - Math.random() * 2 * 365 * 24 * 60 * 60 * 1000, // Random date in last 2 years
        lastTxDate: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000, // Random date in last week
        isContract: Math.random() > 0.7,
        isWhale: true,
        tags: ['whale', 'high-volume'],
      };
    } else {
      // Regular users
      return {
        address,
        balance: (Math.random() * 10).toFixed(4), // 0-10 SEI
        tokenCount: Math.floor(Math.random() * 10) + 1, // 1-10 tokens
        txCount: Math.floor(Math.random() * 100) + 5, // 5-105 txs
        firstTxDate: Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000, // Random date in last year
        lastTxDate: Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000, // Random date in last month
        isContract: Math.random() > 0.9,
        isWhale: false,
        tags: undefined,
      };
    }
  }

  // Detect whale activity patterns
  async detectWhaleMovements(): Promise<{
    recentLargeTransfers: MockSeiTraceTransfer[];
    topWhales: MockSeiTraceHolder[];
    activeTokens: string[];
  }> {
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 500));

    const tokenAddresses = Object.keys(this.mockTokens);
    const recentLargeTransfers: MockSeiTraceTransfer[] = [];
    
    // Generate large transfers from whales
    for (let i = 0; i < 15; i++) {
      const tokenAddress = tokenAddresses[Math.floor(Math.random() * tokenAddresses.length)];
      const token = this.mockTokens[tokenAddress as keyof typeof this.mockTokens];
      const whale = this.mockWhaleAddresses[Math.floor(Math.random() * this.mockWhaleAddresses.length)];
      
      const amount = (Math.random() * 5000000 + 100000).toFixed(2); // $100k+ transfers
      
      recentLargeTransfers.push({
        hash: this.generateRandomHash(),
        blockNumber: 15000000 + Math.floor(Math.random() * 1000),
        timestamp: Date.now() - (i * 1200000) - Math.random() * 1200000, // Last 5 hours
        from: whale,
        to: this.generateRandomAddress(),
        value: amount,
        tokenAddress,
        tokenSymbol: token.symbol,
        tokenName: token.name,
        gasUsed: (50000 + Math.random() * 150000).toFixed(0),
        gasPrice: (Math.random() * 100).toFixed(9),
        valueUSD: parseFloat(amount) * token.price,
      });
    }

    // Get top whales across all tokens
    const topWhales: MockSeiTraceHolder[] = this.mockWhaleAddresses.map((address, i) => ({
      address,
      balance: (Math.random() * 20000000 + 1000000).toFixed(2),
      percentage: Math.random() * 15 + 2,
      rank: i + 1,
      isWhale: true,
    })).sort((a, b) => parseFloat(b.balance) - parseFloat(a.balance));

    return {
      recentLargeTransfers: recentLargeTransfers.sort((a, b) => b.timestamp - a.timestamp),
      topWhales: topWhales.slice(0, 10),
      activeTokens: tokenAddresses.slice(0, 5),
    };
  }

  // Check if mock service is being used
  isMockService(): boolean {
    return true;
  }

  getServiceStatus(): string {
    return 'Mock Service (API Key Issue - Using Mock Data)';
  }
}

export const seiTraceMockService = new SeiTraceMockService();
