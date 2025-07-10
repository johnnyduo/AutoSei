// src/services/whaleTrackerService.ts
// Professional Whale Tracker Service with AI Analysis for SeiTrace API

import { GoogleGenerativeAI } from '@google/generative-ai';

export interface WhaleTransaction {
  hash: string;
  from: string;
  to: string;
  amount: string;
  amountUSD: number;
  timestamp: number;
  blockNumber: number;
  tokenAddress: string;
  tokenSymbol: string;
  tokenName: string;
  tokenDecimals: number;
  type: 'buy' | 'sell' | 'transfer';
  impact: 'critical' | 'high' | 'medium' | 'low';
  gasUsed: string;
  gasPrice: string;
  isWhale: boolean;
  whaleType: 'mega' | 'large' | 'medium' | 'small';
  confidenceScore: number;
}

export interface WhaleAddress {
  address: string;
  balance: string;
  balanceUSD: number;
  tokenCount: number;
  transactionCount: number;
  firstSeenDate: number;
  lastActiveDate: number;
  isContract: boolean;
  whaleRank: number;
  tags: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  activityPattern: 'accumulator' | 'distributor' | 'trader' | 'holder';
  influence: number; // 0-100 scale
}

export interface TokenWhaleAnalysis {
  tokenAddress: string;
  tokenSymbol: string;
  tokenName: string;
  whaleConcentration: number; // Percentage held by top whales
  whaleCount: number;
  averageWhaleHolding: number;
  recentWhaleActivity: WhaleTransaction[];
  priceImpactRisk: 'low' | 'medium' | 'high' | 'critical';
  manipulationRisk: number; // 0-100 percentage
  liquidityHealth: 'poor' | 'fair' | 'good' | 'excellent';
  topWhales: WhaleAddress[];
}

export interface WhaleInsight {
  id: string;
  type: 'accumulation' | 'distribution' | 'smart_money' | 'manipulation' | 'liquidity_event' | 'defi_movement' | 'arbitrage';
  title: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
  confidence: number; // 0-100 percentage
  tradingSignal: 'bullish' | 'bearish' | 'neutral' | 'caution';
  aiReasoning: string;
  expectedImpact: string;
  timeframe?: 'short' | 'medium' | 'long';
  timestamp: number;
  relatedAddresses: string[];
}

export interface RiskAlert {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
  confidence: number;
  timestamp: number;
  relatedTransactions: string[];
}

export interface WhaleAlerts {
  largeTransfers: WhaleTransaction[];
  newWhales: WhaleAddress[];
  unusualActivity: any[];
  riskAlerts: RiskAlert[];
}

// SeiTrace API Response Types
interface SeiTraceTokenTransfer {
  amount: string;
  token_usd_price: string | null;
  total_usd_value: string | null;
  from: {
    address_hash: string;
    address_association: any;
  };
  to: {
    address_hash: string;
    address_association: any;
  };
  timestamp: string;
  raw_amount: string;
  tx_hash: string;
  action: string;
  block_height: string;
  token_info: {
    token_contract?: string;
    token_denom?: string;
    token_symbol: string;
    token_name: string;
    token_id: string;
    token_logo: string | null;
    token_decimals: string;
    token_association: any;
    token_type: string;
  };
}

interface SeiTraceResponse {
  items: SeiTraceTokenTransfer[];
  next_page_params: any;
}

interface SeiTraceTokenHolder {
  wallet_address: {
    address_hash: string;
    address_association: any;
  };
  raw_amount: string;
  amount: string;
  token_usd_price: string | null;
  total_usd_value: string | null;
  token_contract: string;
  token_symbol: string;
  token_name: string;
  token_decimals: string;
  token_logo: string;
  token_type: string;
  token_association: any;
}

class WhaleTrackerService {
  private gemini: GoogleGenerativeAI;
  private mockDataMode = false;
  private rateLimitInfo = {
    requestsUsed: 0,
    requestsRemaining: 1000,
    resetTime: Date.now() + 3600000, // 1 hour from now
  };

  // Whale thresholds in USD
  private thresholds = {
    small: 10000,    // $10K
    medium: 50000,   // $50K  
    large: 250000,   // $250K
    mega: 1000000    // $1M
  };

  // Major token contracts on Sei for whale tracking
  private readonly MAJOR_TOKEN_CONTRACTS = {
    // ERC20 tokens on Sei EVM - these are real contracts on Sei pacific-1 mainnet
    erc20: [
      '0x3894085Ef7Ff0f0aeDf52E2A2704928d259C2fc7', // WSEI (Wrapped SEI)
      '0x0c78d371EB4F8c082E8CD23c2Fa321b915E1BBfA', // Example token from docs
    ],
  };

  constructor() {
    const apiKey = typeof window !== 'undefined' 
      ? (window as any).ENV?.VITE_GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY
      : process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    
    this.gemini = new GoogleGenerativeAI(apiKey || '');
  }

  private async makeRequest(url: string, options: RequestInit = {}): Promise<any> {
    try {
      console.log('Making SeiTrace request to:', url);
      
      const apiKey = typeof window !== 'undefined' 
        ? (window as any).ENV?.VITE_SEITRACE_API_KEY || import.meta.env.VITE_SEITRACE_API_KEY
        : process.env.NEXT_PUBLIC_SEITRACE_API_KEY || process.env.VITE_SEITRACE_API_KEY;

      if (!apiKey) {
        throw new Error('SeiTrace API key not found');
      }

      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': apiKey,
          ...options.headers,
        },
      });

      this.rateLimitInfo.requestsUsed++;
      this.rateLimitInfo.requestsRemaining = Math.max(0, this.rateLimitInfo.requestsRemaining - 1);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`SeiTrace API error: ${response.status}`, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('SeiTrace response received:', data?.items?.length || 0, 'items');
      return data;
    } catch (error) {
      console.error('SeiTrace request failed:', error);
      throw error;
    }
  }

  private mapSeiTraceToWhaleTransaction(transfer: SeiTraceTokenTransfer): WhaleTransaction {
    const usdValue = transfer.total_usd_value ? parseFloat(transfer.total_usd_value) : 0;
    const amount = transfer.amount || '0';
    const decimals = parseInt(transfer.token_info.token_decimals || '18');
    
    return {
      hash: transfer.tx_hash,
      from: transfer.from.address_hash,
      to: transfer.to.address_hash,
      amount,
      amountUSD: usdValue,
      timestamp: new Date(transfer.timestamp).getTime(),
      blockNumber: parseInt(transfer.block_height || '0'),
      tokenAddress: transfer.token_info.token_contract || transfer.token_info.token_denom || '',
      tokenSymbol: transfer.token_info.token_symbol || 'UNKNOWN',
      tokenName: transfer.token_info.token_name || 'Unknown Token',
      tokenDecimals: decimals,
      type: this.determineTransactionType(transfer),
      impact: this.calculateImpact(usdValue),
      gasUsed: '0', // Not available in token transfer data
      gasPrice: '0',
      isWhale: usdValue >= this.thresholds.small,
      whaleType: this.getWhaleType(usdValue),
      confidenceScore: this.calculateConfidenceScore(transfer, usdValue),
    };
  }

  private determineTransactionType(transfer: SeiTraceTokenTransfer): 'buy' | 'sell' | 'transfer' {
    return 'transfer';
  }

  private calculateImpact(usdValue: number): 'critical' | 'high' | 'medium' | 'low' {
    if (usdValue >= this.thresholds.mega) return 'critical';
    if (usdValue >= this.thresholds.large) return 'high';
    if (usdValue >= this.thresholds.medium) return 'medium';
    return 'low';
  }

  private getWhaleType(usdValue: number): 'mega' | 'large' | 'medium' | 'small' {
    if (usdValue >= this.thresholds.mega) return 'mega';
    if (usdValue >= this.thresholds.large) return 'large';
    if (usdValue >= this.thresholds.medium) return 'medium';
    return 'small';
  }

  private calculateConfidenceScore(transfer: SeiTraceTokenTransfer, usdValue: number): number {
    let confidence = 50; // Base confidence
    
    // Higher confidence for larger USD values
    if (usdValue >= this.thresholds.mega) confidence += 30;
    else if (usdValue >= this.thresholds.large) confidence += 20;
    else if (usdValue >= this.thresholds.medium) confidence += 10;
    
    // Higher confidence if we have USD price data
    if (transfer.token_usd_price) confidence += 20;
    
    return Math.min(100, confidence);
  }

  async getRecentWhaleTransactions(limit: number = 20): Promise<WhaleTransaction[]> {
    try {
      console.log('Fetching recent whale transactions...');
      const allTransactions: WhaleTransaction[] = [];
      
      // 1. Fetch large batch of recent transactions from major ERC20 contracts using pagination
      for (const contractAddress of this.MAJOR_TOKEN_CONTRACTS.erc20.slice(0, 2)) {
        try {
          // Fetch multiple pages to get more transactions to analyze
          const maxPages = 4; // Fetch up to 200 transactions (50 * 4)
          for (let page = 0; page < maxPages; page++) {
            const offset = page * 50;
            const url = `https://seitrace.com/insights/api/v2/token/erc20/transfers?chain_id=pacific-1&contract_address=${contractAddress}&limit=50&offset=${offset}`;
            
            try {
              const data: SeiTraceResponse = await this.makeRequest(url);
              
              if (data && data.items && data.items.length > 0) {
                // Filter for whale transactions based on USD value
                const whaleTransfers = data.items
                  .filter(transfer => {
                    const usdValue = transfer.total_usd_value ? parseFloat(transfer.total_usd_value) : 0;
                    return usdValue >= this.thresholds.small; // Only include whale-sized transactions
                  })
                  .map(transfer => this.mapSeiTraceToWhaleTransaction(transfer));
                
                allTransactions.push(...whaleTransfers);
                
                // If we found fewer than 50 transactions, we've reached the end
                if (data.items.length < 50) {
                  break;
                }
              } else {
                break; // No more data
              }
            } catch (pageError) {
              console.error(`Error fetching page ${page} for ${contractAddress}:`, pageError);
              break; // Stop pagination on error
            }
            
            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        } catch (error) {
          console.error(`Error fetching ERC20 transfers for ${contractAddress}:`, error);
        }
      }

      // 2. Also check recent transactions from major whale addresses if we have them
      if (allTransactions.length > 0) {
        const knownWhaleAddresses = Array.from(new Set(allTransactions.map(tx => tx.from))).slice(0, 3);
        const additionalTransactions = await this.getWhalesByAddress(knownWhaleAddresses);
        allTransactions.push(...additionalTransactions);
      }

      // 3. Add fallback mock data if no real data found
      if (allTransactions.length === 0) {
        console.log('No ERC20 whale transfers found, generating sample data');
        allTransactions.push(...this.generateMockTransactions(Math.min(limit, 20)));
      }

      // Remove duplicates and sort by USD value and timestamp
      const uniqueTransactions = Array.from(
        new Map(allTransactions.map(tx => [tx.hash, tx])).values()
      );

      const sortedTransactions = uniqueTransactions
        .sort((a, b) => {
          // Primary sort: USD value (descending)
          if (b.amountUSD !== a.amountUSD) {
            return b.amountUSD - a.amountUSD;
          }
          // Secondary sort: timestamp (most recent first)
          return b.timestamp - a.timestamp;
        })
        .slice(0, limit);

      if (sortedTransactions.length > 0) {
        this.mockDataMode = allTransactions.every(tx => tx.hash.startsWith('0x0'));
        console.log(`Found ${sortedTransactions.length} whale transactions from ${this.mockDataMode ? 'mock data' : 'SeiTrace API'}`);
        console.log(`Total transactions scanned: ${uniqueTransactions.length}, Whales found: ${sortedTransactions.length}`);
        return sortedTransactions;
      }

      throw new Error('No whale transactions found');

    } catch (error) {
      console.error('SeiTrace API error, falling back to mock data:', error);
      this.mockDataMode = true;
      return this.generateMockTransactions(limit);
    }
  }

  async getWhalesByAddress(addresses: string[]): Promise<WhaleTransaction[]> {
    try {
      const whaleTransactions: WhaleTransaction[] = [];
      
      // Check each address for recent large transactions
      for (const address of addresses.slice(0, 3)) { // Limit to avoid rate limits
        try {
          const url = `https://seitrace.com/insights/api/v2/addresses/token-transfers?chain_id=pacific-1&address=${address}&limit=10`;
          const data: SeiTraceResponse = await this.makeRequest(url);
          
          if (data && data.items) {
            const transfers = data.items
              .filter(transfer => {
                const usdValue = transfer.total_usd_value ? parseFloat(transfer.total_usd_value) : 0;
                return usdValue >= this.thresholds.small;
              })
              .map(transfer => this.mapSeiTraceToWhaleTransaction(transfer));
            
            whaleTransactions.push(...transfers);
          }
        } catch (addressError) {
          console.error(`Error fetching transfers for address ${address}:`, addressError);
        }
      }
      
      return whaleTransactions
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 20);
      
    } catch (error) {
      console.error('Error fetching whale transactions by address:', error);
      return [];
    }
  }

  async getTokenHolders(contractAddress: string): Promise<WhaleAddress[]> {
    try {
      const url = `https://seitrace.com/insights/api/v2/token/erc20/holders?chain_id=pacific-1&contract_address=${contractAddress}&limit=50`;
      const data = await this.makeRequest(url);
      
      if (data && data.items) {
        return data.items
          .filter((holder: SeiTraceTokenHolder) => {
            const usdValue = holder.total_usd_value ? parseFloat(holder.total_usd_value) : 0;
            return usdValue >= this.thresholds.small;
          })
          .map((holder: SeiTraceTokenHolder, index: number) => ({
            address: holder.wallet_address.address_hash,
            balance: holder.amount,
            balanceUSD: parseFloat(holder.total_usd_value || '0'),
            tokenCount: 1,
            transactionCount: 0,
            firstSeenDate: Date.now() - 86400000,
            lastActiveDate: Date.now(),
            isContract: false,
            whaleRank: index + 1,
            tags: [],
            riskLevel: this.calculateRiskLevel(parseFloat(holder.total_usd_value || '0')),
            activityPattern: 'holder',
            influence: Math.min(100, (parseFloat(holder.total_usd_value || '0') / 1000000) * 100),
          }));
      }
      
      return [];
      
    } catch (error) {
      console.error('Error fetching token holders:', error);
      return [];
    }
  }

  private calculateRiskLevel(usdValue: number): 'low' | 'medium' | 'high' | 'critical' {
    if (usdValue >= this.thresholds.mega) return 'critical';
    if (usdValue >= this.thresholds.large) return 'high';
    if (usdValue >= this.thresholds.medium) return 'medium';
    return 'low';
  }

  async getWhaleAlerts(): Promise<WhaleAlerts> {
    try {
      const recentTransactions = await this.getRecentWhaleTransactions(50);
      
      const largeTransfers = recentTransactions.filter(tx => tx.amountUSD >= this.thresholds.small);
      const criticalTransfers = recentTransactions.filter(tx => tx.amountUSD >= this.thresholds.mega);
      
      const riskAlerts = await this.generateRiskAlerts(criticalTransfers.slice(0, 5));
      const unusualActivity = await this.detectUnusualActivity(recentTransactions);
      
      return {
        largeTransfers: largeTransfers.slice(0, 20),
        newWhales: [],
        unusualActivity: unusualActivity.slice(0, 10),
        riskAlerts: riskAlerts,
      };
      
    } catch (error) {
      console.error('Error getting whale alerts:', error);
      return {
        largeTransfers: [],
        newWhales: [],
        unusualActivity: [],
        riskAlerts: [],
      };
    }
  }

  private async detectUnusualActivity(transactions: WhaleTransaction[]): Promise<any[]> {
    const addressActivity = new Map<string, WhaleTransaction[]>();
    
    transactions.forEach(tx => {
      if (!addressActivity.has(tx.from)) {
        addressActivity.set(tx.from, []);
      }
      addressActivity.get(tx.from)!.push(tx);
    });
    
    const unusual: any[] = [];
    
    addressActivity.forEach((txs, address) => {
      if (txs.length >= 3) { // 3+ large transactions from same address
        const totalVolume = txs.reduce((sum, tx) => sum + tx.amountUSD, 0);
        unusual.push({
          type: 'high_frequency',
          address,
          transactionCount: txs.length,
          totalVolume,
          description: `${txs.length} large transactions totaling $${totalVolume.toLocaleString()}`,
          severity: totalVolume > this.thresholds.mega ? 'critical' : 'warning',
          timestamp: Math.max(...txs.map(tx => tx.timestamp)),
        });
      }
    });
    
    return unusual;
  }

  private async generateRiskAlerts(criticalTransactions: WhaleTransaction[]): Promise<RiskAlert[]> {
    if (criticalTransactions.length === 0) return [];
    
    try {
      const prompt = `Analyze these large cryptocurrency transactions on Sei network and identify potential risks:

${criticalTransactions.slice(0, 5).map(tx => 
  `- $${tx.amountUSD.toLocaleString()} ${tx.tokenSymbol} transfer from ${tx.from} to ${tx.to} (Hash: ${tx.hash})`
).join('\n')}

Focus on:
1. Market manipulation risks
2. Liquidity impact
3. Whale accumulation/distribution patterns
4. Potential security risks

Provide 2-3 specific risk alerts with titles, descriptions, and severity levels (critical/warning/info).
Format as JSON array with fields: title, description, severity, confidence (0-100).`;

      const model = this.gemini.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      try {
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const alerts = JSON.parse(jsonMatch[0]);
          return alerts.map((alert: any, index: number) => ({
            id: `risk_${Date.now()}_${index}`,
            title: alert.title || 'Risk Alert',
            description: alert.description || 'Unusual whale activity detected',
            severity: alert.severity || 'warning',
            confidence: alert.confidence || 75,
            timestamp: Date.now(),
            relatedTransactions: criticalTransactions.slice(0, 3).map(tx => tx.hash),
          }));
        }
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
      }
      
      return [{
        id: `risk_${Date.now()}`,
        title: 'Large Whale Activity Detected',
        description: `${criticalTransactions.length} critical transactions worth over $${this.thresholds.mega.toLocaleString()} detected`,
        severity: 'warning' as const,
        confidence: 80,
        timestamp: Date.now(),
        relatedTransactions: criticalTransactions.map(tx => tx.hash),
      }];
      
    } catch (error) {
      console.error('Error generating risk alerts:', error);
      return [];
    }
  }

  async getWhaleInsights(): Promise<WhaleInsight[]> {
    try {
      const recentTransactions = await this.getRecentWhaleTransactions(30);
      
      if (recentTransactions.length === 0) {
        return [];
      }
      
      const prompt = `Analyze these whale transactions on Sei network and provide market insights:

Recent Large Transactions:
${recentTransactions.slice(0, 10).map(tx => 
  `- $${tx.amountUSD.toLocaleString()} ${tx.tokenSymbol} ${tx.type} (${tx.impact} impact)`
).join('\n')}

Statistics:
- Total transactions: ${recentTransactions.length}
- Average transaction: $${(recentTransactions.reduce((sum, tx) => sum + tx.amountUSD, 0) / recentTransactions.length).toLocaleString()}
- Largest transaction: $${Math.max(...recentTransactions.map(tx => tx.amountUSD)).toLocaleString()}

Provide 2-3 market insights with:
1. Pattern analysis (accumulation, distribution, smart money, etc.)
2. Trading signals (bullish, bearish, neutral, caution)  
3. Expected market impact
4. Confidence level (0-100)

Format as JSON array with fields: type, title, description, severity, confidence, tradingSignal, aiReasoning, expectedImpact.`;

      const model = this.gemini.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      try {
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const insights = JSON.parse(jsonMatch[0]);
          return insights.map((insight: any, index: number) => ({
            id: `insight_${Date.now()}_${index}`,
            type: insight.type || 'smart_money',
            title: insight.title || 'Whale Activity Analysis',
            description: insight.description || 'Significant whale activity detected',
            severity: insight.severity || 'info',
            confidence: Math.min(100, Math.max(0, insight.confidence || 70)),
            tradingSignal: insight.tradingSignal || 'neutral',
            aiReasoning: insight.aiReasoning || insight.description || 'AI analysis of whale patterns',
            expectedImpact: insight.expectedImpact || 'Market impact assessment pending',
            timestamp: Date.now(),
            relatedAddresses: recentTransactions.slice(0, 5).map(tx => tx.from),
          }));
        }
      } catch (parseError) {
        console.error('Error parsing AI insights:', parseError);
      }
      
      const avgAmount = recentTransactions.reduce((sum, tx) => sum + tx.amountUSD, 0) / recentTransactions.length;
      const criticalCount = recentTransactions.filter(tx => tx.impact === 'critical').length;
      
      return [{
        id: `insight_${Date.now()}`,
        type: 'smart_money' as const,
        title: 'Whale Activity Summary',
        description: `${recentTransactions.length} whale transactions detected with average value of $${avgAmount.toLocaleString()}`,
        severity: criticalCount > 3 ? 'critical' : 'info' as const,
        confidence: 75,
        tradingSignal: criticalCount > 5 ? 'caution' : 'neutral' as const,
        aiReasoning: 'Analysis based on transaction volume and frequency patterns',
        expectedImpact: criticalCount > 3 ? 'High potential for market volatility' : 'Moderate market activity',
        timestamp: Date.now(),
        relatedAddresses: recentTransactions.slice(0, 5).map(tx => tx.from),
      }];
      
    } catch (error) {
      console.error('Error generating whale insights:', error);
      return [];
    }
  }

  async getTokenWhaleAnalysis(tokenAddress: string): Promise<TokenWhaleAnalysis | null> {
    try {
      const holders = await this.getTokenHolders(tokenAddress);
      const recentActivity = await this.getRecentWhaleTransactions(20);
      
      const tokenActivity = recentActivity.filter(tx => 
        tx.tokenAddress.toLowerCase() === tokenAddress.toLowerCase()
      );
      
      if (holders.length === 0 && tokenActivity.length === 0) {
        return null;
      }
      
      const totalHoldings = holders.reduce((sum, holder) => sum + holder.balanceUSD, 0);
      const top10Holdings = holders.slice(0, 10).reduce((sum, holder) => sum + holder.balanceUSD, 0);
      const whaleConcentration = totalHoldings > 0 ? (top10Holdings / totalHoldings) * 100 : 0;
      
      const tokenInfo = tokenActivity[0] || {
        tokenSymbol: 'UNKNOWN',
        tokenName: 'Unknown Token',
      };
      
      return {
        tokenAddress,
        tokenSymbol: tokenInfo.tokenSymbol,
        tokenName: tokenInfo.tokenName,
        whaleConcentration,
        whaleCount: holders.length,
        averageWhaleHolding: totalHoldings / Math.max(1, holders.length),
        recentWhaleActivity: tokenActivity.slice(0, 10),
        priceImpactRisk: this.calculatePriceImpactRisk(whaleConcentration, tokenActivity),
        manipulationRisk: this.calculateManipulationRisk(tokenActivity),
        liquidityHealth: this.calculateLiquidityHealth(totalHoldings, tokenActivity.length),
        topWhales: holders.slice(0, 10),
      };
      
    } catch (error) {
      console.error('Error getting token whale analysis:', error);
      return null;
    }
  }

  private calculatePriceImpactRisk(whaleConcentration: number, transactions: WhaleTransaction[]): 'low' | 'medium' | 'high' | 'critical' {
    if (whaleConcentration > 70 && transactions.length > 5) return 'critical';
    if (whaleConcentration > 50 || transactions.filter(tx => tx.impact === 'critical').length > 2) return 'high';
    if (whaleConcentration > 30 || transactions.length > 3) return 'medium';
    return 'low';
  }

  private calculateManipulationRisk(transactions: WhaleTransaction[]): number {
    let risk = 0;
    
    risk += Math.min(50, transactions.length * 5);
    
    const timeSpan = transactions.length > 1 ? 
      Math.max(...transactions.map(tx => tx.timestamp)) - Math.min(...transactions.map(tx => tx.timestamp)) : 
      86400000;
    
    if (timeSpan < 3600000 && transactions.length > 3) risk += 30;
    
    const uniqueAddresses = new Set(transactions.map(tx => tx.from)).size;
    if (uniqueAddresses < 3 && transactions.length > 5) risk += 25;
    
    return Math.min(100, risk);
  }

  private calculateLiquidityHealth(totalUSD: number, transactionCount: number): 'poor' | 'fair' | 'good' | 'excellent' {
    const liquidityScore = Math.log10(totalUSD + 1) * 10 + transactionCount;
    
    if (liquidityScore > 100) return 'excellent';
    if (liquidityScore > 60) return 'good';
    if (liquidityScore > 30) return 'fair';
    return 'poor';
  }

  private generateMockTransactions(limit: number): WhaleTransaction[] {
    const transactions: WhaleTransaction[] = [];
    const tokens = [
      { symbol: 'SEI', name: 'Sei', address: 'usei', decimals: 6 },
      { symbol: 'WSEI', name: 'Wrapped SEI', address: '0x3894085Ef7Ff0f0aeDf52E2A2704928d259C2fc7', decimals: 18 },
      { symbol: 'USDC', name: 'USD Coin', address: '0x1234567890123456789012345678901234567890', decimals: 6 },
    ];
    
    for (let i = 0; i < limit; i++) {
      const token = tokens[Math.floor(Math.random() * tokens.length)];
      const amountUSD = Math.random() * 2000000 + this.thresholds.small;
      const amount = (amountUSD / (Math.random() * 100 + 1)).toFixed(token.decimals);
      
      transactions.push({
        hash: `0x0${Math.random().toString(16).substr(2, 63)}`,
        from: `0x${Math.random().toString(16).substr(2, 40)}`,
        to: `0x${Math.random().toString(16).substr(2, 40)}`,
        amount,
        amountUSD,
        timestamp: Date.now() - Math.random() * 86400000,
        blockNumber: Math.floor(Math.random() * 1000000 + 10000000),
        tokenAddress: token.address,
        tokenSymbol: token.symbol,
        tokenName: token.name,
        tokenDecimals: token.decimals,
        type: 'transfer',
        impact: this.calculateImpact(amountUSD),
        gasUsed: Math.floor(Math.random() * 100000 + 21000).toString(),
        gasPrice: (Math.random() * 50 + 10).toString(),
        isWhale: true,
        whaleType: this.getWhaleType(amountUSD),
        confidenceScore: Math.floor(Math.random() * 40 + 60),
      });
    }
    
    return transactions.sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Scans recent transactions across the network to find whale activity
   * @param scanLimit - Number of recent transactions to scan (up to 1000)
   * @param whaleLimit - Number of whale transactions to return
   */
  async scanForWhaleTransactions(scanLimit: number = 1000, whaleLimit: number = 50): Promise<{
    totalScanned: number;
    whalesFound: number;
    transactions: WhaleTransaction[];
  }> {
    try {
      console.log(`Scanning up to ${scanLimit} recent transactions for whale activity...`);
      const allScannedTransactions: SeiTraceTokenTransfer[] = [];
      const whaleTransactions: WhaleTransaction[] = [];
      
      // Calculate how many pages we need (50 per page max)
      const maxTransactionsPerPage = 50;
      const totalPages = Math.min(Math.ceil(scanLimit / maxTransactionsPerPage), 20); // Cap at 20 pages (1000 transactions)
      
      // Scan transactions from multiple major contracts
      for (const contractAddress of this.MAJOR_TOKEN_CONTRACTS.erc20) {
        try {
          console.log(`Scanning contract ${contractAddress}...`);
          
          for (let page = 0; page < totalPages; page++) {
            const offset = page * maxTransactionsPerPage;
            const pageLimit = Math.min(maxTransactionsPerPage, scanLimit - allScannedTransactions.length);
            
            if (pageLimit <= 0) break;
            
            const url = `https://seitrace.com/insights/api/v2/token/erc20/transfers?chain_id=pacific-1&contract_address=${contractAddress}&limit=${pageLimit}&offset=${offset}`;
            
            try {
              const data: SeiTraceResponse = await this.makeRequest(url);
              
              if (data && data.items && data.items.length > 0) {
                allScannedTransactions.push(...data.items);
                
                // Check each transaction against whale thresholds
                for (const transfer of data.items) {
                  const usdValue = transfer.total_usd_value ? parseFloat(transfer.total_usd_value) : 0;
                  
                  if (usdValue >= this.thresholds.small) {
                    const whaleTransaction = this.mapSeiTraceToWhaleTransaction(transfer);
                    whaleTransactions.push(whaleTransaction);
                    
                    console.log(`🐋 Whale found: $${usdValue.toLocaleString()} ${transfer.token_info.token_symbol}`);
                  }
                }
                
                // If we found fewer than requested, we've reached the end
                if (data.items.length < pageLimit) {
                  break;
                }
              } else {
                break; // No more data
              }
            } catch (pageError) {
              console.error(`Error scanning page ${page} for ${contractAddress}:`, pageError);
              break;
            }
            
            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 150));
            
            // Stop if we've scanned enough transactions
            if (allScannedTransactions.length >= scanLimit) {
              break;
            }
          }
        } catch (contractError) {
          console.error(`Error scanning contract ${contractAddress}:`, contractError);
          continue; // Try next contract
        }
        
        // Stop if we've found enough whales
        if (whaleTransactions.length >= whaleLimit) {
          break;
        }
      }
      
      // Remove duplicates and sort by USD value
      const uniqueWhales = Array.from(
        new Map(whaleTransactions.map(tx => [tx.hash, tx])).values()
      );
      
      const sortedWhales = uniqueWhales
        .sort((a, b) => {
          if (b.amountUSD !== a.amountUSD) {
            return b.amountUSD - a.amountUSD;
          }
          return b.timestamp - a.timestamp;
        })
        .slice(0, whaleLimit);
      
      const result = {
        totalScanned: allScannedTransactions.length,
        whalesFound: sortedWhales.length,
        transactions: sortedWhales
      };
      
      console.log(`Scan complete: ${result.totalScanned} transactions scanned, ${result.whalesFound} whales found`);
      
      return result;
      
    } catch (error) {
      console.error('Error scanning for whale transactions:', error);
      return {
        totalScanned: 0,
        whalesFound: 0,
        transactions: []
      };
    }
  }

  getWhaleThresholds() {
    return { ...this.thresholds };
  }

  setWhaleThresholds(newThresholds: Partial<typeof this.thresholds>) {
    this.thresholds = { ...this.thresholds, ...newThresholds };
  }

  getMinWhaleTransaction(): number {
    return this.thresholds.small;
  }

  isUsingMockData(): boolean {
    return this.mockDataMode;
  }

  getApiKeyStatus(): string {
    const apiKey = typeof window !== 'undefined' 
      ? (window as any).ENV?.VITE_SEITRACE_API_KEY || import.meta.env.VITE_SEITRACE_API_KEY
      : process.env.NEXT_PUBLIC_SEITRACE_API_KEY || process.env.VITE_SEITRACE_API_KEY;

    if (!apiKey) return 'API Key Missing';
    if (this.mockDataMode) return 'Using Mock Data';
    return 'Connected to SeiTrace';
  }

  getRateLimitStatus() {
    return { ...this.rateLimitInfo };
  }
}

// Export singleton instance
export const whaleTrackerService = new WhaleTrackerService();
export default whaleTrackerService;
