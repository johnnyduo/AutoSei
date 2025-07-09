// src/services/tradingBotService.ts
import { updateAllocations, Allocation } from '@/lib/contractService';

export interface TradingBot {
  id: string;
  name: string;
  strategy: StrategyType;
  status: BotStatus;
  profitLoss: number;
  profitLossPercentage: number;
  totalTrades: number;
  winRate: number;
  allocation: number;
  lastActive: Date;
  description: string;
  riskLevel: RiskLevel;
  targetAssets: string[];
  performance24h: number;
  maxDrawdown: number;
  createdAt: Date;
  updatedAt: Date;
  config: BotConfig;
  executionHistory: TradeExecution[];
}

export type StrategyType = 'grid' | 'dca' | 'arbitrage' | 'trend' | 'momentum' | 'rebalance' | 'yield';
export type BotStatus = 'active' | 'inactive' | 'paused' | 'error';
export type RiskLevel = 'low' | 'medium' | 'high';

export interface BotConfig {
  allocation: number;
  maxDrawdown: number;
  stopLoss: number;
  takeProfit: number;
  interval: string; // '1m', '5m', '1h', '1d'
  targetCategories: string[];
  rebalanceThreshold: number;
  maxPositionSize: number;
}

export interface TradeExecution {
  id: string;
  botId: string;
  timestamp: Date;
  type: 'buy' | 'sell' | 'rebalance';
  amount: number;
  price: number;
  profit: number;
  success: boolean;
  txHash?: string;
  error?: string;
}

export interface BotAnalytics {
  totalProfitLoss: number;
  totalAllocation: number;
  activeBots: number;
  avgWinRate: number;
  totalTrades: number;
  bestPerformer: TradingBot | null;
  worstPerformer: TradingBot | null;
  dailyPnL: Array<{ date: string; pnl: number }>;
}

class TradingBotService {
  private readonly STORAGE_KEY = 'autosei_trading_bots';
  private readonly EXECUTION_KEY = 'autosei_bot_executions';
  private readonly ANALYTICS_KEY = 'autosei_bot_analytics';

  // Bot Management
  getBots(): TradingBot[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return this.getDefaultBots();
      
      const bots = JSON.parse(stored);
      return bots.map((bot: any) => ({
        ...bot,
        lastActive: new Date(bot.lastActive),
        createdAt: new Date(bot.createdAt),
        updatedAt: new Date(bot.updatedAt),
        executionHistory: bot.executionHistory?.map((exec: any) => ({
          ...exec,
          timestamp: new Date(exec.timestamp)
        })) || []
      }));
    } catch (error) {
      console.error('Failed to load bots:', error);
      return this.getDefaultBots();
    }
  }

  saveBot(bot: TradingBot): void {
    try {
      const bots = this.getBots();
      const existingIndex = bots.findIndex(b => b.id === bot.id);
      
      const updatedBot = {
        ...bot,
        updatedAt: new Date()
      };

      if (existingIndex >= 0) {
        bots[existingIndex] = updatedBot;
      } else {
        bots.push(updatedBot);
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(bots));
    } catch (error) {
      console.error('Failed to save bot:', error);
      throw new Error('Failed to save trading bot');
    }
  }

  deleteBot(botId: string): void {
    try {
      const bots = this.getBots().filter(bot => bot.id !== botId);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(bots));
    } catch (error) {
      console.error('Failed to delete bot:', error);
      throw new Error('Failed to delete trading bot');
    }
  }

  toggleBotStatus(botId: string): TradingBot {
    const bots = this.getBots();
    const bot = bots.find(b => b.id === botId);
    
    if (!bot) throw new Error('Bot not found');
    
    const newStatus: BotStatus = bot.status === 'active' ? 'paused' : 'active';
    const updatedBot: TradingBot = {
      ...bot,
      status: newStatus,
      lastActive: new Date(),
      updatedAt: new Date()
    };

    this.saveBot(updatedBot);
    return updatedBot;
  }

  // Strategy Execution
  async executeBot(botId: string): Promise<TradeExecution> {
    const bot = this.getBots().find(b => b.id === botId);
    if (!bot) throw new Error('Bot not found');
    if (bot.status !== 'active') throw new Error('Bot is not active');

    try {
      const execution: TradeExecution = {
        id: `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        botId,
        timestamp: new Date(),
        type: 'rebalance',
        amount: bot.allocation,
        price: 1, // Placeholder
        profit: 0,
        success: false
      };

      // Simulate strategy-specific logic
      const allocations = this.generateAllocationsForStrategy(bot);
      
      // Execute the allocation update on the contract
      const tx = await updateAllocations(allocations);
      
      execution.txHash = tx.hash;
      execution.success = true;
      execution.profit = Math.random() * 100 - 50; // Simulated profit

      // Update bot performance
      this.updateBotPerformance(botId, execution);
      
      // Save execution history
      this.saveExecution(execution);

      return execution;
    } catch (error) {
      const failedExecution: TradeExecution = {
        id: `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        botId,
        timestamp: new Date(),
        type: 'rebalance',
        amount: bot.allocation,
        price: 1,
        profit: 0,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };

      this.saveExecution(failedExecution);
      throw error;
    }
  }

  private generateAllocationsForStrategy(bot: TradingBot): Allocation[] {
    // Strategy-specific allocation logic
    switch (bot.strategy) {
      case 'grid':
        return [
          { id: 'bigcap', name: 'Big Cap', color: '#10B981', allocation: 40 },
          { id: 'defi', name: 'DeFi', color: '#F59E0B', allocation: 30 },
          { id: 'l1', name: 'Layer 1', color: '#EF4444', allocation: 30 }
        ];
      case 'dca':
        return [
          { id: 'ai', name: 'AI & DeFi', color: '#8B5CF6', allocation: 50 },
          { id: 'bigcap', name: 'Big Cap', color: '#10B981', allocation: 50 }
        ];
      case 'yield':
        return [
          { id: 'defi', name: 'DeFi', color: '#F59E0B', allocation: 60 },
          { id: 'stablecoin', name: 'Stablecoin', color: '#6B7280', allocation: 40 }
        ];
      default:
        return [
          { id: 'bigcap', name: 'Big Cap', color: '#10B981', allocation: 30 },
          { id: 'ai', name: 'AI & DeFi', color: '#8B5CF6', allocation: 25 },
          { id: 'defi', name: 'DeFi', color: '#F59E0B', allocation: 25 },
          { id: 'l1', name: 'Layer 1', color: '#EF4444', allocation: 20 }
        ];
    }
  }

  private updateBotPerformance(botId: string, execution: TradeExecution): void {
    const bots = this.getBots();
    const bot = bots.find(b => b.id === botId);
    
    if (!bot) return;

    // Update performance metrics
    bot.totalTrades += 1;
    bot.profitLoss += execution.profit;
    bot.profitLossPercentage = (bot.profitLoss / bot.allocation) * 100;
    bot.winRate = execution.success ? 
      ((bot.winRate * (bot.totalTrades - 1)) + 100) / bot.totalTrades :
      ((bot.winRate * (bot.totalTrades - 1)) + 0) / bot.totalTrades;
    bot.performance24h = Math.random() * 10 - 5; // Simulated 24h performance
    bot.lastActive = new Date();

    this.saveBot(bot);
  }

  private saveExecution(execution: TradeExecution): void {
    try {
      const executions = this.getExecutions();
      executions.push(execution);
      
      // Keep only last 1000 executions
      const trimmed = executions.slice(-1000);
      localStorage.setItem(this.EXECUTION_KEY, JSON.stringify(trimmed));
    } catch (error) {
      console.error('Failed to save execution:', error);
    }
  }

  getExecutions(): TradeExecution[] {
    try {
      const stored = localStorage.getItem(this.EXECUTION_KEY);
      if (!stored) return [];
      
      const executions = JSON.parse(stored);
      return executions.map((exec: any) => ({
        ...exec,
        timestamp: new Date(exec.timestamp)
      }));
    } catch (error) {
      console.error('Failed to load executions:', error);
      return [];
    }
  }

  // Analytics
  getAnalytics(): BotAnalytics {
    const bots = this.getBots();
    const executions = this.getExecutions();

    const totalProfitLoss = bots.reduce((sum, bot) => sum + bot.profitLoss, 0);
    const totalAllocation = bots.reduce((sum, bot) => sum + bot.allocation, 0);
    const activeBots = bots.filter(bot => bot.status === 'active').length;
    const avgWinRate = bots.length > 0 ? bots.reduce((sum, bot) => sum + bot.winRate, 0) / bots.length : 0;
    const totalTrades = bots.reduce((sum, bot) => sum + bot.totalTrades, 0);

    const bestPerformer = bots.reduce((best, bot) => 
      !best || bot.profitLossPercentage > best.profitLossPercentage ? bot : best, null as TradingBot | null);

    const worstPerformer = bots.reduce((worst, bot) => 
      !worst || bot.profitLossPercentage < worst.profitLossPercentage ? bot : worst, null as TradingBot | null);

    // Generate daily P&L for last 30 days
    const dailyPnL = this.generateDailyPnL(executions);

    return {
      totalProfitLoss,
      totalAllocation,
      activeBots,
      avgWinRate,
      totalTrades,
      bestPerformer,
      worstPerformer,
      dailyPnL
    };
  }

  private generateDailyPnL(executions: TradeExecution[]): Array<{ date: string; pnl: number }> {
    const dailyData = new Map<string, number>();
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    // Initialize with zeros
    last30Days.forEach(date => dailyData.set(date, 0));

    // Aggregate execution profits by date
    executions.forEach(exec => {
      const date = exec.timestamp.toISOString().split('T')[0];
      if (dailyData.has(date)) {
        dailyData.set(date, (dailyData.get(date) || 0) + exec.profit);
      }
    });

    return Array.from(dailyData.entries()).map(([date, pnl]) => ({ date, pnl }));
  }

  // Default bots for initial showcase
  private getDefaultBots(): TradingBot[] {
    const now = new Date();
    return [
      {
        id: 'bot_1',
        name: 'Grid Trading Pro',
        strategy: 'grid',
        status: 'active',
        profitLoss: 2847.32,
        profitLossPercentage: 12.4,
        totalTrades: 156,
        winRate: 68.2,
        allocation: 15000,
        lastActive: new Date(now.getTime() - 2 * 60 * 1000),
        description: 'Automated grid trading strategy for sideways markets',
        riskLevel: 'medium',
        targetAssets: ['ETH', 'wBTC', 'USDC'],
        performance24h: 3.2,
        maxDrawdown: -4.8,
        createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        updatedAt: now,
        config: {
          allocation: 15000,
          maxDrawdown: 10,
          stopLoss: 5,
          takeProfit: 15,
          interval: '1h',
          targetCategories: ['bigcap', 'defi'],
          rebalanceThreshold: 5,
          maxPositionSize: 5000
        },
        executionHistory: []
      },
      {
        id: 'bot_2',
        name: 'DCA Maximizer',
        strategy: 'dca',
        status: 'active',
        profitLoss: 1523.84,
        profitLossPercentage: 8.7,
        totalTrades: 89,
        winRate: 74.1,
        allocation: 12500,
        lastActive: new Date(now.getTime() - 5 * 60 * 1000),
        description: 'Smart DCA with dynamic intervals based on volatility',
        riskLevel: 'low',
        targetAssets: ['SEI', 'SMR', 'AVAX'],
        performance24h: 1.8,
        maxDrawdown: -2.1,
        createdAt: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000),
        updatedAt: now,
        config: {
          allocation: 12500,
          maxDrawdown: 5,
          stopLoss: 3,
          takeProfit: 10,
          interval: '1d',
          targetCategories: ['ai', 'bigcap'],
          rebalanceThreshold: 3,
          maxPositionSize: 4000
        },
        executionHistory: []
      },
      {
        id: 'bot_3',
        name: 'Yield Optimizer',
        strategy: 'yield',
        status: 'paused',
        profitLoss: 4201.18,
        profitLossPercentage: 18.3,
        totalTrades: 34,
        winRate: 91.2,
        allocation: 25000,
        lastActive: new Date(now.getTime() - 60 * 60 * 1000),
        description: 'Automatically compounds yield farming rewards',
        riskLevel: 'medium',
        targetAssets: ['LUM', 'MLUM', 'FUSE'],
        performance24h: 4.7,
        maxDrawdown: -3.2,
        createdAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
        updatedAt: now,
        config: {
          allocation: 25000,
          maxDrawdown: 8,
          stopLoss: 4,
          takeProfit: 20,
          interval: '6h',
          targetCategories: ['defi', 'stablecoin'],
          rebalanceThreshold: 4,
          maxPositionSize: 8000
        },
        executionHistory: []
      }
    ];
  }

  // Bot creation
  createBot(botData: Partial<TradingBot>): TradingBot {
    const now = new Date();
    const bot: TradingBot = {
      id: `bot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: botData.name || 'New Bot',
      strategy: botData.strategy || 'rebalance',
      status: 'inactive',
      profitLoss: 0,
      profitLossPercentage: 0,
      totalTrades: 0,
      winRate: 0,
      allocation: botData.allocation || 1000,
      lastActive: now,
      description: botData.description || 'Custom trading bot',
      riskLevel: botData.riskLevel || 'medium',
      targetAssets: botData.targetAssets || ['ETH', 'USDC'],
      performance24h: 0,
      maxDrawdown: 0,
      createdAt: now,
      updatedAt: now,
      config: botData.config || {
        allocation: botData.allocation || 1000,
        maxDrawdown: 10,
        stopLoss: 5,
        takeProfit: 15,
        interval: '1h',
        targetCategories: ['bigcap'],
        rebalanceThreshold: 5,
        maxPositionSize: 1000
      },
      executionHistory: []
    };

    this.saveBot(bot);
    return bot;
  }

  // Simulate market data updates
  simulateMarketUpdate(): void {
    const bots = this.getBots();
    const updatedBots = bots.map(bot => ({
      ...bot,
      performance24h: bot.performance24h + (Math.random() - 0.5) * 2,
      profitLoss: bot.profitLoss + (Math.random() - 0.5) * 50,
      lastActive: bot.status === 'active' ? new Date() : bot.lastActive
    }));

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedBots));
  }
}

export const tradingBotService = new TradingBotService();
