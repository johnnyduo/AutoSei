// src/components/WhaleTracker.tsx
// Professional Whale Tracker Dashboard with AI Analysis

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Eye, 
  Activity, 
  DollarSign, 
  Target, 
  Brain,
  Waves,
  Shield,
  Clock,
  Users,
  BarChart3,
  Zap,
  AlertCircle,
  Info,
  Filter,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { whaleTrackerService, WhaleTransaction, WhaleInsight, WhaleAlerts, TokenWhaleAnalysis } from '../services/whaleTrackerService';

const WhaleTracker: React.FC = () => {
  const [whaleAlerts, setWhaleAlerts] = useState<WhaleAlerts>({
    largeTransfers: [],
    newWhales: [],
    unusualActivity: [],
    riskAlerts: [],
  });
  const [recentTransactions, setRecentTransactions] = useState<WhaleTransaction[]>([]);
  const [insights, setInsights] = useState<WhaleInsight[]>([]);
  const [tokenAnalysis, setTokenAnalysis] = useState<TokenWhaleAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'insights' | 'analysis'>('overview');
  const [filterType, setFilterType] = useState<'all' | 'critical' | 'high' | 'medium'>('all');
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadWhaleData();
    
    if (autoRefresh) {
      const interval = setInterval(loadWhaleData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const loadWhaleData = async () => {
    try {
      setLoading(true);
      
      const [alerts, transactions, whaleInsights] = await Promise.all([
        whaleTrackerService.getWhaleAlerts(),
        whaleTrackerService.getRecentWhaleTransactions(50),
        whaleTrackerService.getWhaleInsights(),
      ]);

      setWhaleAlerts(alerts);
      setRecentTransactions(transactions);
      setInsights(whaleInsights);

      // Load token analysis for USDC
      const usdcAddress = (import.meta as any).env.VITE_MOCK_USDC_ADDRESS;
      if (usdcAddress) {
        const analysis = await whaleTrackerService.getTokenWhaleAnalysis(usdcAddress);
        setTokenAnalysis(analysis);
      }
    } catch (error) {
      console.error('Error loading whale data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = recentTransactions.filter(tx => {
    if (filterType === 'all') return true;
    return tx.impact === filterType;
  });

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'high': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      default: return 'text-green-600 bg-green-100 dark:bg-green-900/20';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'warning': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20';
      default: return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return `${minutes}m ago`;
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(2)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(2)}K`;
    return `$${amount.toFixed(2)}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold cosmic-text">🐋 Whale Tracker</h2>
          <p className="text-muted-foreground">AI-Powered On-Chain Whale Activity Monitor</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${whaleTrackerService.isUsingMockData() ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
              <span>{whaleTrackerService.getApiKeyStatus()}</span>
            </div>
          </div>
          
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`p-2 rounded-lg ${autoRefresh ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'} hover:bg-opacity-80 transition-colors`}
          >
            <RefreshCw className={`h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
          </button>
          
          <button
            onClick={loadWhaleData}
            disabled={loading}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-200 disabled:opacity-50 flex items-center space-x-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Large Transfers</p>
                <p className="text-2xl font-bold">{whaleAlerts.largeTransfers.length}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">New Whales</p>
                <p className="text-2xl font-bold">{whaleAlerts.newWhales.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-orange-500 to-red-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Risk Alerts</p>
                <p className="text-2xl font-bold">{whaleAlerts.riskAlerts.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-purple-500 to-pink-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">AI Insights</p>
                <p className="text-2xl font-bold">{insights.length}</p>
              </div>
              <Brain className="h-8 w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <Card className="glass-panel">
        <div className="flex flex-wrap gap-2 p-4 border-b">
          {[
            { id: 'overview', label: 'Overview', icon: Eye },
            { id: 'transactions', label: 'Transactions', icon: Activity },
            { id: 'insights', label: 'AI Insights', icon: Brain },
            { id: 'analysis', label: 'Token Analysis', icon: BarChart3 },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'hover:bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span className="hidden md:block">{tab.label}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Large Transfers */}
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                <span>Recent Large Transfers</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {whaleAlerts.largeTransfers.slice(0, 10).map((tx, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${getImpactColor(tx.impact).split(' ')[0]}`}></div>
                      <div>
                        <p className="font-medium">
                          {formatCurrency(tx.amountUSD)} {tx.tokenSymbol}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatAddress(tx.from)} → {formatAddress(tx.to)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {formatTimeAgo(tx.timestamp)}
                      </p>
                      <span className={`text-xs px-2 py-1 rounded-full ${getImpactColor(tx.impact)}`}>
                        {tx.impact}
                      </span>
                    </div>
                  </div>
                ))}
                
                {whaleAlerts.largeTransfers.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No large transfers detected recently</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Risk Alerts */}
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-red-500" />
                <span>Risk Alerts</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {whaleAlerts.riskAlerts.map((alert, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium">
                        {alert.title}
                      </h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${getSeverityColor(alert.severity)}`}>
                        {alert.severity}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {alert.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Confidence: {alert.confidence}%</span>
                      <span>{formatTimeAgo(alert.timestamp)}</span>
                    </div>
                  </div>
                ))}
                
                {whaleAlerts.riskAlerts.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Shield className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No risk alerts at this time</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'transactions' && (
        <Card className="glass-panel">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Whale Transactions</CardTitle>
              
              <div className="flex items-center space-x-3">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="px-3 py-2 border rounded-lg bg-background text-sm"
                >
                  <option value="all">All Impact Levels</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                </select>
                
                <Filter className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Transaction</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">From/To</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Impact</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Time</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.slice(0, 20).map((tx, index) => (
                    <tr key={index} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${getImpactColor(tx.impact).split(' ')[0]}`}></div>
                          <span className="font-mono text-sm text-muted-foreground">
                            {tx.hash.slice(0, 10)}...
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">
                            {formatCurrency(tx.amountUSD)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {parseFloat(tx.amount).toFixed(2)} {tx.tokenSymbol}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          <p className="text-muted-foreground">
                            From: {formatAddress(tx.from)}
                          </p>
                          <p className="text-muted-foreground">
                            To: {formatAddress(tx.to)}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${getImpactColor(tx.impact)}`}>
                          {tx.impact}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {formatTimeAgo(tx.timestamp)}
                      </td>
                      <td className="py-3 px-4">
                        <button className="p-1 text-muted-foreground hover:text-primary transition-colors">
                          <ExternalLink className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredTransactions.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No transactions found with the selected filter</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'insights' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {insights.map((insight, index) => (
            <Card key={index} className="glass-panel">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${getSeverityColor(insight.severity)}`}>
                      {insight.type === 'accumulation' && <TrendingUp className="h-5 w-5" />}
                      {insight.type === 'distribution' && <TrendingDown className="h-5 w-5" />}
                      {insight.type === 'smart_money' && <Brain className="h-5 w-5" />}
                      {insight.type === 'manipulation' && <AlertTriangle className="h-5 w-5" />}
                      {insight.type === 'liquidity_event' && <Waves className="h-5 w-5" />}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{insight.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Confidence: {insight.confidence}%
                      </p>
                    </div>
                  </div>
                  
                  {insight.tradingSignal && (
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      insight.tradingSignal === 'buy' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                      insight.tradingSignal === 'sell' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                      insight.tradingSignal === 'caution' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {insight.tradingSignal.toUpperCase()}
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-foreground mb-4">
                  {insight.description}
                </p>
                
                <div className="bg-muted/50 rounded-lg p-4 mb-4">
                  <h5 className="font-medium mb-2 flex items-center space-x-2">
                    <Brain className="h-4 w-4" />
                    <span>AI Analysis</span>
                  </h5>
                  <p className="text-sm text-muted-foreground">
                    {insight.aiReasoning}
                  </p>
                </div>
                
                {insight.expectedImpact && (
                  <div className="border-t pt-4">
                    <p className="text-sm text-muted-foreground">
                      <strong>Expected Impact:</strong> {insight.expectedImpact}
                    </p>
                  </div>
                )}
                
                <div className="flex items-center justify-between text-xs text-muted-foreground mt-4">
                  <span>{insight.relatedAddresses.length} addresses involved</span>
                  <span>{formatTimeAgo(insight.timestamp)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {insights.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              <Brain className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No AI insights available at this time</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'analysis' && tokenAnalysis && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Token Overview */}
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Token Overview</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Token</p>
                  <p className="font-semibold">
                    {tokenAnalysis.tokenName} ({tokenAnalysis.tokenSymbol})
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Whale Count</p>
                  <p className="font-semibold">
                    {tokenAnalysis.whaleCount} whales
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Whale Concentration</p>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                        style={{ width: `${Math.min(100, tokenAnalysis.whaleConcentration)}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">
                      {tokenAnalysis.whaleConcentration.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Risk Assessment */}
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Risk Assessment</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Price Impact Risk</p>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    tokenAnalysis.priceImpactRisk === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                    tokenAnalysis.priceImpactRisk === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400' :
                    tokenAnalysis.priceImpactRisk === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                    'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                  }`}>
                    {tokenAnalysis.priceImpactRisk.toUpperCase()}
                  </span>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Manipulation Risk</p>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          tokenAnalysis.manipulationRisk > 70 ? 'bg-red-500' :
                          tokenAnalysis.manipulationRisk > 40 ? 'bg-orange-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${tokenAnalysis.manipulationRisk}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">
                      {tokenAnalysis.manipulationRisk.toFixed(0)}%
                    </span>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Liquidity Health</p>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    tokenAnalysis.liquidityHealth === 'excellent' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                    tokenAnalysis.liquidityHealth === 'good' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                    tokenAnalysis.liquidityHealth === 'fair' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                    'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                  }`}>
                    {tokenAnalysis.liquidityHealth.toUpperCase()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Recent Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {tokenAnalysis.recentWhaleActivity.slice(0, 5).map((tx, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">
                        {formatCurrency(tx.amountUSD)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatAddress(tx.from)} → {formatAddress(tx.to)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-2 py-1 rounded-full ${getImpactColor(tx.impact)}`}>
                        {tx.impact}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default WhaleTracker;
