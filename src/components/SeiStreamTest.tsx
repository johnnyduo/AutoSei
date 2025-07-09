// src/components/SeiStreamTest.tsx
import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, Activity, Wallet, BarChart3, Clock } from 'lucide-react';
import { seiStreamService, WhaleData, SeiStreamAccount } from '../services/seiStreamService';

interface TestState {
  isRunning: boolean;
  serviceStatus: { isOnline: boolean; responseTime: number } | null;
  accountData: SeiStreamAccount | null;
  whaleAnalysis: WhaleData[];
  testAddress: string;
  error: string | null;
}

const SeiStreamTest: React.FC = () => {
  const [testState, setTestState] = useState<TestState>({
    isRunning: false,
    serviceStatus: null,
    accountData: null,
    whaleAnalysis: [],
    testAddress: '0x5B17a453b715F628Bb839835E47a4394FF32976C',
    error: null,
  });

  const runServiceTest = async () => {
    setTestState(prev => ({ ...prev, isRunning: true, error: null }));

    try {
      console.log('🧪 Starting SeiStream service test...');
      
      // Test service status
      const serviceStatus = await seiStreamService.checkServiceStatus();
      console.log('Service status:', serviceStatus);

      // Test account info
      const accountData = await seiStreamService.getAccountInfo(testState.testAddress);
      console.log('Account data:', accountData);

      // Generate comprehensive test data
      const testData = await seiStreamService.generateTestData();
      console.log('Test data:', testData);

      setTestState(prev => ({
        ...prev,
        isRunning: false,
        serviceStatus: testData.serviceStatus,
        accountData,
        whaleAnalysis: testData.whaleAnalysis,
      }));
    } catch (error) {
      console.error('Test failed:', error);
      setTestState(prev => ({
        ...prev,
        isRunning: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }));
    }
  };

  const testCustomAddress = async () => {
    if (!testState.testAddress) return;

    setTestState(prev => ({ ...prev, isRunning: true, error: null }));

    try {
      const [accountData, whaleData] = await Promise.all([
        seiStreamService.getAccountInfo(testState.testAddress),
        seiStreamService.analyzeWhaleStatus(testState.testAddress),
      ]);

      setTestState(prev => ({
        ...prev,
        isRunning: false,
        accountData,
        whaleAnalysis: whaleData ? [whaleData] : [],
      }));
    } catch (error) {
      setTestState(prev => ({
        ...prev,
        isRunning: false,
        error: error instanceof Error ? error.message : 'Failed to test address',
      }));
    }
  };

  const formatResponseTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatBalance = (balance: number) => {
    return `${balance.toFixed(4)} SEI`;
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getWhaleStatusColor = (isWhale: boolean) => {
    return isWhale ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400';
  };

  const getWhaleScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600 dark:text-green-400';
    if (score >= 40) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          SeiStream API Test Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Test the working SeiStream API for whale tracking (No API key required)
        </p>
      </div>

      {/* Service Status */}
      {testState.serviceStatus && (
        <div className="glass-panel p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Service Status
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              {testState.serviceStatus.isOnline ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-500" />
              )}
              <span className={testState.serviceStatus.isOnline ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                {testState.serviceStatus.isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600 dark:text-gray-400">
                Response Time: {formatResponseTime(testState.serviceStatus.responseTime)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <span className="text-yellow-600 dark:text-yellow-400">
                {seiStreamService.getServiceMode()}
              </span>
            </div>
          </div>
          
          {seiStreamService.isUsingMockData() && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm text-blue-800 dark:text-blue-200 font-medium">
                  Using Mock Data
                </span>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                The SeiStream API blocks browser requests due to CORS policy. Using realistic mock data based on your project addresses for development. 
                This provides the same whale tracking functionality with your actual wallet and contract addresses.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Test Controls */}
      <div className="glass-panel p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Test Controls
        </h2>
        
        <div className="space-y-4">
          {/* Full Service Test */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Full Service Test</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Test all endpoints and analyze your project addresses
              </p>
            </div>
            <button
              onClick={runServiceTest}
              disabled={testState.isRunning}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
            >
              {testState.isRunning ? 'Testing...' : 'Run Full Test'}
            </button>
          </div>

          {/* Custom Address Test */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 dark:text-white">Test Custom Address</h3>
              <input
                type="text"
                placeholder="Enter EVM address (0x...)"
                value={testState.testAddress}
                onChange={(e) => setTestState(prev => ({ ...prev, testAddress: e.target.value }))}
                className="mt-2 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <button
              onClick={testCustomAddress}
              disabled={testState.isRunning || !testState.testAddress}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
            >
              Test Address
            </button>
          </div>
        </div>
      </div>

      {/* Account Data */}
      {testState.accountData && (
        <div className="glass-panel p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Account Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Address</p>
              <p className="font-mono text-sm text-gray-900 dark:text-white break-all">
                {testState.accountData.address}
              </p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Balance</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatBalance(testState.accountData.balance)}
              </p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Transactions</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {testState.accountData.txsCount.toLocaleString()}
              </p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">ERC20 Tokens</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {testState.accountData.erc20TokensCount}
              </p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">NFTs</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {testState.accountData.erc721TokensCount + testState.accountData.erc1155TokensCount}
              </p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Last Activity</p>
              <p className="text-sm text-gray-900 dark:text-white">
                {formatDate(testState.accountData.timestamp)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Whale Analysis */}
      {testState.whaleAnalysis.length > 0 && (
        <div className="glass-panel p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Whale Analysis
          </h2>
          <div className="space-y-4">
            {testState.whaleAnalysis.map((whale, index) => (
              <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-sm text-gray-600 dark:text-gray-400">
                    {whale.address.substring(0, 10)}...{whale.address.substring(whale.address.length - 8)}
                  </span>
                  <div className="flex items-center gap-4">
                    <span className={`font-medium ${getWhaleStatusColor(whale.isWhale)}`}>
                      {whale.isWhale ? '🐋 Whale' : '🐟 Regular'}
                    </span>
                    <span className={`font-bold ${getWhaleScoreColor(whale.whaleScore)}`}>
                      Score: {whale.whaleScore}/100
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Balance: </span>
                    <span className="font-medium">{formatBalance(whale.accountInfo.balance)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Txs: </span>
                    <span className="font-medium">{whale.accountInfo.txsCount}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Tokens: </span>
                    <span className="font-medium">
                      {whale.accountInfo.erc20TokensCount + whale.accountInfo.erc721TokensCount + whale.accountInfo.erc1155TokensCount}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Active: </span>
                    <span className="font-medium">{formatDate(whale.lastActivity)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Display */}
      {testState.error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <span className="font-medium text-red-800 dark:text-red-200">Error</span>
          </div>
          <p className="text-sm text-red-700 dark:text-red-300 mt-1">{testState.error}</p>
        </div>
      )}

      {/* Loading State */}
      {testState.isRunning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-900 dark:text-white">Testing SeiStream API...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeiStreamTest;
