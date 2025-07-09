// src/services/seiTraceTestService.ts
import { seiTraceMockService } from './seiTraceMockService';

export interface SeiTraceToken {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  holders: number;
  description?: string;
  website?: string;
  twitter?: string;
  telegram?: string;
}

export interface SeiTraceTransfer {
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
}

export interface SeiTraceHolder {
  address: string;
  balance: string;
  percentage: number;
  rank: number;
}

export interface SeiTraceAddressInfo {
  address: string;
  balance: string;
  tokenCount: number;
  txCount: number;
  firstTxDate: number;
  lastTxDate: number;
  isContract: boolean;
  tags?: string[];
}

export interface TestResult {
  endpoint: string;
  success: boolean;
  data?: any;
  error?: string;
  responseTime: number;
  usingMockData?: boolean;
}

class SeiTraceTestService {
  private apiKey: string;
  private baseUrl = 'https://seitrace.com/insights/api/v2';
  private useMockData = false;

  constructor() {
    this.apiKey = import.meta.env.VITE_SEI_EXPLORER_API_KEY;
    if (!this.apiKey) {
      console.warn('SeiTrace API key not found, using mock data');
      this.useMockData = true;
    }
  }

  private async makeRequest(endpoint: string, params: Record<string, any> = {}): Promise<any> {
    // If no API key or mock mode is forced, use mock service
    if (this.useMockData) {
      return this.getMockResponse(endpoint, params);
    }

    const url = new URL(`${this.baseUrl}${endpoint}`);
    
    // Add API key and parameters  
    url.searchParams.append('X-Api-Key', this.apiKey);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, value.toString());
      }
    });

    const startTime = Date.now();
    
    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'X-Api-Key': this.apiKey,
        },
      });

      const responseTime = Date.now() - startTime;

      if (!response.ok) {
        // If API fails, fall back to mock data
        console.warn(`API request failed (${response.status}), falling back to mock data`);
        this.useMockData = true;
        return this.getMockResponse(endpoint, params);
      }

      const data = await response.json();
      
      return {
        success: true,
        data,
        responseTime,
        usingMockData: false,
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      console.warn('API request failed, falling back to mock data:', error);
      this.useMockData = true;
      return this.getMockResponse(endpoint, params);
    }
  }

  private async getMockResponse(endpoint: string, params: Record<string, any>): Promise<any> {
    const startTime = Date.now();
    
    try {
      let data;
      
      if (endpoint.includes('/token/erc20') && !endpoint.includes('/transfers') && !endpoint.includes('/holders')) {
        // Token info endpoint
        data = await seiTraceMockService.getTokenInfo(params.contract_address || params.contractaddress || '0x0');
      } else if (endpoint.includes('/token/erc20/transfers') || (endpoint.includes('/tokentx') && params.contractaddress)) {
        // Token transfers endpoint
        data = { items: await seiTraceMockService.getTokenTransfers(params.contract_address || params.contractaddress || '0x0', 10) };
      } else if (endpoint.includes('/token/erc20/holders') || endpoint.includes('/tokenholders')) {
        // Token holders endpoint
        data = { items: await seiTraceMockService.getTokenHolders(params.contract_address || params.contractaddress || '0x0', 10) };
      } else if (endpoint.includes('/addresses') || endpoint.includes('/account')) {
        // Address info endpoint
        data = await seiTraceMockService.getAddressInfo(params.address || '0x0');
      } else {
        // Default mock response
        data = { message: 'Mock data for ' + endpoint, timestamp: Date.now() };
      }

      const responseTime = Date.now() - startTime;
      
      return {
        success: true,
        data,
        responseTime,
        usingMockData: true,
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Mock service error',
        responseTime,
        usingMockData: true,
      };
    }
  }

  // Test getting token information
  async testGetTokenInfo(tokenAddress: string): Promise<TestResult> {
    const result = await this.makeRequest('/token', {
      contractaddress: tokenAddress,
    });

    return {
      endpoint: `/token?contractaddress=${tokenAddress}`,
      ...result,
    };
  }

  // Test getting token transfers
  async testGetTokenTransfers(tokenAddress: string, page = 1, offset = 10): Promise<TestResult> {
    const result = await this.makeRequest('/tokentx', {
      contractaddress: tokenAddress,
      page,
      offset,
      sort: 'desc',
    });

    return {
      endpoint: `/tokentx?contractaddress=${tokenAddress}&page=${page}&offset=${offset}`,
      ...result,
    };
  }

  // Test getting token holders
  async testGetTokenHolders(tokenAddress: string, page = 1, offset = 10): Promise<TestResult> {
    const result = await this.makeRequest('/tokenholders', {
      contractaddress: tokenAddress,
      page,
      offset,
    });

    return {
      endpoint: `/tokenholders?contractaddress=${tokenAddress}&page=${page}&offset=${offset}`,
      ...result,
    };
  }

  // Test getting address information
  async testGetAddressInfo(address: string): Promise<TestResult> {
    const result = await this.makeRequest('/account', {
      address,
    });

    return {
      endpoint: `/account?address=${address}`,
      ...result,
    };
  }

  // Test getting address transactions
  async testGetAddressTransactions(address: string, page = 1, offset = 10): Promise<TestResult> {
    const result = await this.makeRequest('/txlist', {
      address,
      page,
      offset,
      sort: 'desc',
    });

    return {
      endpoint: `/txlist?address=${address}&page=${page}&offset=${offset}`,
      ...result,
    };
  }

  // Test getting address token transfers
  async testGetAddressTokenTransfers(address: string, page = 1, offset = 10): Promise<TestResult> {
    const result = await this.makeRequest('/tokentx', {
      address,
      page,
      offset,
      sort: 'desc',
    });

    return {
      endpoint: `/tokentx?address=${address}&page=${page}&offset=${offset}`,
      ...result,
    };
  }

  // Run comprehensive test suite
  async runTestSuite(): Promise<TestResult[]> {
    const results: TestResult[] = [];

    // Test with USDC token address from env
    const usdcAddress = import.meta.env.VITE_MOCK_USDC_ADDRESS;
    
    // Test with a known Sei address (you can update this with a real address)
    const testAddress = '0x742d35cc1ba87ed2b1b9e5c6c9c8b3b4b4b4b4b4'; // Placeholder

    console.log('Running SeiTrace API Test Suite...');

    // Test 1: Token Information
    console.log('Testing token information...');
    if (usdcAddress) {
      const tokenInfoResult = await this.testGetTokenInfo(usdcAddress);
      results.push(tokenInfoResult);
    }

    // Test 2: Token Transfers
    console.log('Testing token transfers...');
    if (usdcAddress) {
      const tokenTransfersResult = await this.testGetTokenTransfers(usdcAddress, 1, 5);
      results.push(tokenTransfersResult);
    }

    // Test 3: Token Holders
    console.log('Testing token holders...');
    if (usdcAddress) {
      const tokenHoldersResult = await this.testGetTokenHolders(usdcAddress, 1, 5);
      results.push(tokenHoldersResult);
    }

    // Test 4: Address Information
    console.log('Testing address information...');
    const addressInfoResult = await this.testGetAddressInfo(testAddress);
    results.push(addressInfoResult);

    // Test 5: Address Transactions
    console.log('Testing address transactions...');
    const addressTxResult = await this.testGetAddressTransactions(testAddress, 1, 5);
    results.push(addressTxResult);

    // Test 6: Address Token Transfers
    console.log('Testing address token transfers...');
    const addressTokenTxResult = await this.testGetAddressTokenTransfers(testAddress, 1, 5);
    results.push(addressTokenTxResult);

    return results;
  }

  // Utility method to check if API key is configured
  isConfigured(): boolean {
    return !!this.apiKey;
  }

  // Get API key status (masked for security)
  getApiKeyStatus(): string {
    if (!this.apiKey) {
      return 'Not configured';
    }
    return `Configured (${this.apiKey.substring(0, 8)}...)`;
  }
}

export const seiTraceTestService = new SeiTraceTestService();
