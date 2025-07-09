// src/components/WhaleActivitySummary.tsx
// Compact whale activity summary for the main dashboard

import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Waves, AlertTriangle, Eye, Brain } from 'lucide-react';
import { whaleTrackerService, WhaleTransaction, WhaleInsight } from '../services/whaleTrackerService';

const WhaleActivitySummary: React.FC = () => {
  const [recentTransactions, setRecentTransactions] = useState<WhaleTransaction[]>([]);
  const [insights, setInsights] = useState<WhaleInsight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSummaryData();
  }, []);

  const loadSummaryData = async () => {
    try {
      setLoading(true);
      const [transactions, whaleInsights] = await Promise.all([
        whaleTrackerService.getRecentWhaleTransactions(5),
        whaleTrackerService.getWhaleInsights(),
      ]);

      setRecentTransactions(transactions);
      setInsights(whaleInsights.slice(0, 3)); // Show top 3 insights
    } catch (error) {
      console.error('Error loading whale summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(2)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(2)}K`;
    return `$${amount.toFixed(2)}`;
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (hours > 0) return `${hours}h ago`;
    return `${minutes}m ago`;
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      default: return 'text-green-600';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'accumulation': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'distribution': return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'smart_money': return <Brain className="h-4 w-4 text-purple-500" />;
      case 'manipulation': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Waves className="h-4 w-4 text-blue-500" />;
    }
  };

  if (loading) {
    return (
      <div className="glass-panel p-6 rounded-2xl">
        <div className="flex items-center space-x-3 mb-4">
          <Waves className="h-5 w-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            🐋 Whale Activity
          </h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel p-6 rounded-2xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Waves className="h-5 w-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            🐋 Whale Activity
          </h3>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <div className={`w-2 h-2 rounded-full ${whaleTrackerService.isUsingMockData() ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
          <span className="text-xs">
            {whaleTrackerService.isUsingMockData() ? 'Mock Data' : 'Live Data'}
          </span>
        </div>
      </div>

      {/* Recent Large Transactions */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Recent Large Transfers
        </h4>
        <div className="space-y-2">
          {recentTransactions.slice(0, 3).map((tx, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${getImpactColor(tx.impact)}`}></div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">
                    {formatCurrency(tx.amountUSD)} {tx.tokenSymbol}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatAddress(tx.from)} → {formatAddress(tx.to)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {formatTimeAgo(tx.timestamp)}
                </p>
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${getImpactColor(tx.impact)} bg-opacity-10`}>
                  {tx.impact}
                </span>
              </div>
            </div>
          ))}
          
          {recentTransactions.length === 0 && (
            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
              <p className="text-sm">No large transfers detected recently</p>
            </div>
          )}
        </div>
      </div>

      {/* AI Insights */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          AI Insights
        </h4>
        <div className="space-y-2">
          {insights.map((insight, index) => (
            <div key={index} className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
              <div className="flex items-start space-x-2">
                {getInsightIcon(insight.type)}
                <div className="flex-1 min-w-0">
                  <h5 className="font-medium text-gray-900 dark:text-white text-sm">
                    {insight.title}
                  </h5>
                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                    {insight.description}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Confidence: {insight.confidence}%
                    </span>
                    {insight.tradingSignal && (
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        insight.tradingSignal === 'buy' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                        insight.tradingSignal === 'sell' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                        insight.tradingSignal === 'caution' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {insight.tradingSignal.toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {insights.length === 0 && (
            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
              <p className="text-sm">No AI insights available</p>
            </div>
          )}
        </div>
      </div>

      {/* View Full Whale Tracker Link */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button className="w-full flex items-center justify-center space-x-2 py-2 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 text-sm">
          <Eye className="h-4 w-4" />
          <span>View Full Whale Tracker</span>
        </button>
      </div>
    </div>
  );
};

export default WhaleActivitySummary;
