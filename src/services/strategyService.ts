// src/services/strategyService.ts
export interface StrategyDeployment {
  id: string;
  strategyId: string;
  strategyName: string;
  botId: string;
  deployedAt: Date;
  isDemo: boolean;
  status: 'active' | 'paused' | 'stopped' | 'error';
  totalReturn: number;
  config: {
    allocation: number;
    maxDrawdown: number;
    stopLoss: number;
    takeProfit: number;
    interval: string;
  };
}

export interface StrategyAnalytics {
  strategyId: string;
  totalDeployments: number;
  activeDeployments: number;
  totalVolume: number;
  averageReturn: number;
  successRate: number;
  lastDeployed: Date | null;
}

class StrategyService {
  private readonly DEPLOYMENTS_KEY = 'strata_strategy_deployments';
  private readonly ANALYTICS_KEY = 'strata_strategy_analytics';

  // Get all strategy deployments
  getDeployments(): StrategyDeployment[] {
    try {
      const data = localStorage.getItem(this.DEPLOYMENTS_KEY);
      if (!data) return [];
      return JSON.parse(data).map((deployment: any) => ({
        ...deployment,
        deployedAt: new Date(deployment.deployedAt)
      }));
    } catch (error) {
      console.error('Failed to load strategy deployments:', error);
      return [];
    }
  }

  // Save strategy deployment
  saveDeployment(deployment: StrategyDeployment): void {
    try {
      const deployments = this.getDeployments();
      const existingIndex = deployments.findIndex(d => d.id === deployment.id);
      
      if (existingIndex >= 0) {
        deployments[existingIndex] = deployment;
      } else {
        deployments.push(deployment);
      }
      
      localStorage.setItem(this.DEPLOYMENTS_KEY, JSON.stringify(deployments));
      this.updateAnalytics(deployment.strategyId);
    } catch (error) {
      console.error('Failed to save strategy deployment:', error);
      throw new Error('Failed to save strategy deployment');
    }
  }

  // Get deployments for a specific strategy
  getStrategyDeployments(strategyId: string): StrategyDeployment[] {
    return this.getDeployments().filter(d => d.strategyId === strategyId);
  }

  // Get strategy analytics
  getStrategyAnalytics(strategyId: string): StrategyAnalytics {
    try {
      const data = localStorage.getItem(this.ANALYTICS_KEY);
      const analytics = data ? JSON.parse(data) : {};
      
      return analytics[strategyId] || {
        strategyId,
        totalDeployments: 0,
        activeDeployments: 0,
        totalVolume: 0,
        averageReturn: 0,
        successRate: 0,
        lastDeployed: null
      };
    } catch (error) {
      console.error('Failed to load strategy analytics:', error);
      return {
        strategyId,
        totalDeployments: 0,
        activeDeployments: 0,
        totalVolume: 0,
        averageReturn: 0,
        successRate: 0,
        lastDeployed: null
      };
    }
  }

  // Update strategy analytics
  private updateAnalytics(strategyId: string): void {
    try {
      const deployments = this.getStrategyDeployments(strategyId);
      const data = localStorage.getItem(this.ANALYTICS_KEY);
      const analytics = data ? JSON.parse(data) : {};
      
      const activeDeployments = deployments.filter(d => d.status === 'active').length;
      const totalVolume = deployments.reduce((sum, d) => sum + d.config.allocation, 0);
      const avgReturn = deployments.length > 0 
        ? deployments.reduce((sum, d) => sum + d.totalReturn, 0) / deployments.length 
        : 0;
      const successRate = deployments.length > 0 
        ? (deployments.filter(d => d.totalReturn > 0).length / deployments.length) * 100
        : 0;
      const lastDeployed = deployments.length > 0 
        ? deployments.sort((a, b) => b.deployedAt.getTime() - a.deployedAt.getTime())[0].deployedAt
        : null;

      analytics[strategyId] = {
        strategyId,
        totalDeployments: deployments.length,
        activeDeployments,
        totalVolume,
        averageReturn: avgReturn,
        successRate,
        lastDeployed
      };

      localStorage.setItem(this.ANALYTICS_KEY, JSON.stringify(analytics));
    } catch (error) {
      console.error('Failed to update strategy analytics:', error);
    }
  }

  // Get all strategy analytics
  getAllAnalytics(): Record<string, StrategyAnalytics> {
    try {
      const data = localStorage.getItem(this.ANALYTICS_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Failed to load all analytics:', error);
      return {};
    }
  }

  // Get deployment by ID
  getDeployment(deploymentId: string): StrategyDeployment | null {
    const deployments = this.getDeployments();
    return deployments.find(d => d.id === deploymentId) || null;
  }

  // Update deployment status
  updateDeploymentStatus(deploymentId: string, status: StrategyDeployment['status']): void {
    const deployments = this.getDeployments();
    const deployment = deployments.find(d => d.id === deploymentId);
    
    if (deployment) {
      deployment.status = status;
      this.saveDeployment(deployment);
    }
  }

  // Record strategy backtest
  recordBacktest(strategyId: string, results: {
    duration: number;
    finalReturn: number;
    maxDrawdown: number;
    winRate: number;
    sharpeRatio: number;
  }): void {
    try {
      const backtestKey = `strata_backtest_${strategyId}`;
      const backtests = localStorage.getItem(backtestKey);
      const history = backtests ? JSON.parse(backtests) : [];
      
      history.push({
        id: Date.now().toString(),
        timestamp: new Date(),
        ...results
      });

      // Keep only last 10 backtests
      if (history.length > 10) {
        history.splice(0, history.length - 10);
      }

      localStorage.setItem(backtestKey, JSON.stringify(history));
    } catch (error) {
      console.error('Failed to record backtest:', error);
    }
  }

  // Get strategy backtest history
  getBacktestHistory(strategyId: string): any[] {
    try {
      const backtestKey = `strata_backtest_${strategyId}`;
      const data = localStorage.getItem(backtestKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to load backtest history:', error);
      return [];
    }
  }

  // Clear all strategy data (for development/testing)
  clearAllData(): void {
    localStorage.removeItem(this.DEPLOYMENTS_KEY);
    localStorage.removeItem(this.ANALYTICS_KEY);
    
    // Clear all backtest data
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('strata_backtest_')) {
        localStorage.removeItem(key);
      }
    });
  }
}

export const strategyService = new StrategyService();
