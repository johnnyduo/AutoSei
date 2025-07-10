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
  ExternalLink,
  Settings,
  Search
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
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'insights' | 'analysis'>('overview');
  const [filterType, setFilterType] = useState<'all' | 'critical' | 'high' | 'medium'>('all');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [hasLoadedData, setHasLoadedData] = useState(false);
  const [showThresholdConfig, setShowThresholdConfig] = useState(false);
  const [thresholds, setThresholds] = useState(whaleTrackerService.getWhaleThresholds());
  const [deepScanLimit, setDeepScanLimit] = useState(500);
  const [deepScanResults, setDeepScanResults] = useState<{
    totalScanned: number;
    whalesFound: number;
    transactions: WhaleTransaction[];
  } | null>(null);
  const [isDeepScanning, setIsDeepScanning] = useState(false);
  const [showDeepScan, setShowDeepScan] = useState(false);

  useEffect(() => {
    // Only load data when component first mounts and we haven't loaded data yet
    if (!hasLoadedData) {
      loadWhaleData();
    }
    
    if (autoRefresh && hasLoadedData) {
      const interval = setInterval(loadWhaleData, 60000); // Refresh every 60 seconds (reduced frequency)
      return () => clearInterval(interval);
    }
  }, [autoRefresh, hasLoadedData]);

  const loadWhaleData = async () => {
    try {
      setLoading(true);
      
      // Load data sequentially to avoid hitting rate limits
      const alerts = await whaleTrackerService.getWhaleAlerts();
      setWhaleAlerts(alerts);
      
      const transactions = await whaleTrackerService.getRecentWhaleTransactions(20); // Reduced from 50
      setRecentTransactions(transactions);
      
      const whaleInsights = await whaleTrackerService.getWhaleInsights();
      setInsights(whaleInsights);

      // Only load token analysis if we have a valid address and haven't loaded it recently
      const usdcAddress = (import.meta as any).env.VITE_MOCK_USDC_ADDRESS;
      if (usdcAddress && !tokenAnalysis) {
        const analysis = await whaleTrackerService.getTokenWhaleAnalysis(usdcAddress);
        setTokenAnalysis(analysis);
      }
      
      setHasLoadedData(true);
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

  const updateThresholds = (newThresholds: Partial<typeof thresholds>) => {
    const updated = { ...thresholds, ...newThresholds };
    setThresholds(updated);
    whaleTrackerService.setWhaleThresholds(updated);
  };

  const performDeepScan = async () => {
    try {
      setIsDeepScanning(true);
      console.log(`Starting deep scan for ${deepScanLimit} transactions...`);
      
      const results = await whaleTrackerService.scanForWhaleTransactions(deepScanLimit, 50);
      setDeepScanResults(results);
      
      console.log(`Deep scan complete: ${results.whalesFound} whales found from ${results.totalScanned} transactions`);
    } catch (error) {
      console.error('Deep scan failed:', error);
    } finally {
      setIsDeepScanning(false);
    }
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
            {!whaleTrackerService.isUsingMockData() && (
              <div className="text-xs text-muted-foreground">
                •{' '}
                {(() => {
                  const status = whaleTrackerService.getRateLimitStatus();
                  return `${status.requestsRemaining}/${status.requestsUsed + status.requestsRemaining} requests`;
                })()}
              </div>
            )}
          </div>
          
          <button
            onClick={() => setShowThresholdConfig(!showThresholdConfig)}
            className="p-2 rounded-lg bg-gray-100 text-gray-600 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            title="Configure whale thresholds"
          >
            <Settings className="h-4 w-4" />
          </button>
          
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`p-2 rounded-lg ${autoRefresh ? 'bg-green-100 text-green-600 dark:bg-green-900/20' : 'bg-gray-100 text-gray-600 dark:bg-gray-700'} hover:bg-opacity-80 transition-colors`}
            title={autoRefresh ? 'Auto-refresh enabled (60s)' : 'Auto-refresh disabled'}
          >
            <RefreshCw className={`h-4 w-4 ${autoRefresh ? 'animate-pulse' : ''}`} />
          </button>
          
          <button
            onClick={loadWhaleData}
            disabled={loading}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-200 disabled:opacity-50 flex items-center space-x-2"
            title="Manually refresh data"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Loading...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Threshold Configuration Panel */}
      {showThresholdConfig && (
        <Card className="strategy-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Whale Threshold Configuration</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm text-muted-foreground">Small Whale ($)</label>
                <input
                  type="number"
                  value={thresholds.small}
                  onChange={(e) => updateThresholds({ small: Number(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 border rounded-lg bg-background text-sm"
                  min="1000"
                  step="1000"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Medium Whale ($)</label>
                <input
                  type="number"
                  value={thresholds.medium}
                  onChange={(e) => updateThresholds({ medium: Number(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 border rounded-lg bg-background text-sm"
                  min="10000"
                  step="10000"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Large Whale ($)</label>
                <input
                  type="number"
                  value={thresholds.large}
                  onChange={(e) => updateThresholds({ large: Number(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 border rounded-lg bg-background text-sm"
                  min="100000"
                  step="100000"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Mega Whale ($)</label>
                <input
                  type="number"
                  value={thresholds.mega}
                  onChange={(e) => updateThresholds({ mega: Number(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 border rounded-lg bg-background text-sm"
                  min="1000000"
                  step="1000000"
                />
              </div>
            </div>
            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Current minimum whale transaction:</strong> ${whaleTrackerService.getMinWhaleTransaction().toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Transactions below this amount will not be considered whale activity.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Large Transfers</p>
                <p className="text-2xl font-bold">{whaleAlerts.largeTransfers.length}</p>
                <p className="text-xs text-green-200 opacity-75">≥${(thresholds.small / 1000).toFixed(0)}K</p>
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

      {/* Show loading state if no data has been loaded yet */}
      {!hasLoadedData && loading && (
        <Card className="strategy-card">
          <CardContent className="p-12">
            <div className="text-center">
              <RefreshCw className="h-12 w-12 mx-auto mb-4 animate-spin text-primary" />
              <h3 className="text-lg font-semibold mb-2">Loading Whale Data</h3>
              <p className="text-muted-foreground">Fetching latest whale activity and insights...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Show empty state if no data and not loading */}
      {!hasLoadedData && !loading && (
        <Card className="strategy-card">
          <CardContent className="p-12">
            <div className="text-center">
              <Waves className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No Whale Data Loaded</h3>
              <p className="text-muted-foreground mb-4">Click the refresh button to load whale activity data</p>
              <button
                onClick={loadWhaleData}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-200 flex items-center space-x-2 mx-auto"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Load Data</span>
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation Tabs - Only show when data is loaded */}
      {hasLoadedData && (
        <Card className="glass-panel p-6">
          <div className="flex flex-wrap gap-2 border-b border-[#FF5723]/30 pb-4">
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
      )}

      {/* Filters - Only show when data is loaded */}
      {hasLoadedData && (
        <Card className="glass-panel p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  placeholder="Search whale addresses, transactions, or insights..."
                  className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
                />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="px-3 py-2 border border-border rounded-lg bg-background text-sm min-w-40"
              >
                <option value="all">All Impact Levels</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
              </select>
              
              <button className="flex items-center space-x-2 px-3 py-2 border border-border rounded-lg bg-background text-sm hover:bg-muted transition-colors">
                <Filter className="h-4 w-4" />
                <span>Filters</span>
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Content - Only show when data is loaded */}
      {hasLoadedData && (
        <>
          {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Large Transfers */}
          <Card className="strategy-card">
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
          <Card className="strategy-card">
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
        <Card className="strategy-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Whale Transactions</CardTitle>
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
            <Card key={index} className="strategy-card">
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
                      insight.tradingSignal === 'bullish' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                      insight.tradingSignal === 'bearish' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
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
          <Card className="strategy-card">
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
          <Card className="strategy-card">
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
          <Card className="strategy-card">
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

      {/* Deep Scan Section - Only show when data is loaded */}
      {hasLoadedData && (
        <Card className="glass-panel p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            <div className="flex-1">
              <h3 className="text-lg font-semibold flex items-center space-x-2 mb-2">
                <Search className="h-5 w-5 text-primary" />
                <span>🔍 Deep Whale Scanner</span>
              </h3>
              <p className="text-sm text-muted-foreground">
                Scan up to {deepScanLimit.toLocaleString()} recent transactions across major tokens to find hidden whale activity
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex items-center space-x-2">
                <label className="text-sm text-muted-foreground">Scan Limit:</label>
                <select
                  value={deepScanLimit}
                  onChange={(e) => setDeepScanLimit(Number(e.target.value))}
                  className="px-3 py-2 border border-border rounded-lg bg-background text-sm"
                  disabled={isDeepScanning}
                >
                  <option value={200}>200 transactions</option>
                  <option value={500}>500 transactions</option>
                  <option value={1000}>1,000 transactions</option>
                </select>
              </div>
              
              <button
                onClick={() => setShowDeepScan(!showDeepScan)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  showDeepScan 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {showDeepScan ? 'Hide Scanner' : 'Show Scanner'}
              </button>
              
              <button
                onClick={performDeepScan}
                disabled={isDeepScanning}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 flex items-center space-x-2"
              >
                <Search className={`h-4 w-4 ${isDeepScanning ? 'animate-pulse' : ''}`} />
                <span>{isDeepScanning ? 'Scanning...' : 'Deep Scan'}</span>
              </button>
            </div>
          </div>
          
          {/* Deep Scan Results */}
          {showDeepScan && deepScanResults && (
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{deepScanResults.totalScanned.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Transactions Scanned</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{deepScanResults.whalesFound}</div>
                  <div className="text-sm text-muted-foreground">Whales Discovered</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {deepScanResults.totalScanned > 0 ? ((deepScanResults.whalesFound / deepScanResults.totalScanned) * 100).toFixed(1) : 0}%
                  </div>
                  <div className="text-sm text-muted-foreground">Whale Ratio</div>
                </div>
              </div>
              
              {deepScanResults.transactions.length > 0 && (
                <div>
                  <h4 className="text-md font-semibold mb-3">Top Whales from Deep Scan:</h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {deepScanResults.transactions.slice(0, 5).map((tx, index) => (
                      <div key={tx.hash} className="flex items-center justify-between p-3 bg-background rounded-lg border">
                        <div className="flex items-center space-x-3">
                          <div className="text-sm font-medium">#{index + 1}</div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getImpactColor(tx.impact)}`}>
                                {tx.whaleType.toUpperCase()}
                              </span>
                              <span className="text-sm font-medium">{formatCurrency(tx.amountUSD)}</span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatAddress(tx.from)} → {formatAddress(tx.to)}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{tx.tokenSymbol}</div>
                          <div className="text-xs text-muted-foreground">{formatTimeAgo(tx.timestamp)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {deepScanResults.transactions.length > 5 && (
                    <button
                      onClick={() => setRecentTransactions(deepScanResults.transactions)}
                      className="mt-3 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 transition-colors"
                    >
                      View All {deepScanResults.transactions.length} Deep Scan Results
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </Card>
      )}
        </>
      )}
    </div>
  );
};

export default WhaleTracker;
