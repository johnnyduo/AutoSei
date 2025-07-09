// src/components/SeiTraceAPITest.tsx
import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { seiTraceTestService, TestResult } from '../services/seiTraceTestService';

interface TestState {
  isRunning: boolean;
  results: TestResult[];
  startTime: number | null;
  endTime: number | null;
}

const SeiTraceAPITest: React.FC = () => {
  const [testState, setTestState] = useState<TestState>({
    isRunning: false,
    results: [],
    startTime: null,
    endTime: null,
  });
  
  const [customTokenAddress, setCustomTokenAddress] = useState('');
  const [customAddress, setCustomAddress] = useState('');

  const runFullTestSuite = async () => {
    setTestState(prev => ({
      ...prev,
      isRunning: true,
      startTime: Date.now(),
      results: [],
    }));

    try {
      const results = await seiTraceTestService.runTestSuite();
      setTestState(prev => ({
        ...prev,
        isRunning: false,
        results,
        endTime: Date.now(),
      }));
    } catch (error) {
      console.error('Test suite failed:', error);
      setTestState(prev => ({
        ...prev,
        isRunning: false,
        endTime: Date.now(),
      }));
    }
  };

  const runCustomTokenTest = async () => {
    if (!customTokenAddress) return;

    setTestState(prev => ({ ...prev, isRunning: true }));

    try {
      const results = await Promise.all([
        seiTraceTestService.testGetTokenInfo(customTokenAddress),
        seiTraceTestService.testGetTokenTransfers(customTokenAddress, 1, 5),
        seiTraceTestService.testGetTokenHolders(customTokenAddress, 1, 5),
      ]);

      setTestState(prev => ({
        ...prev,
        isRunning: false,
        results,
      }));
    } catch (error) {
      console.error('Custom token test failed:', error);
      setTestState(prev => ({ ...prev, isRunning: false }));
    }
  };

  const runCustomAddressTest = async () => {
    if (!customAddress) return;

    setTestState(prev => ({ ...prev, isRunning: true }));

    try {
      const results = await Promise.all([
        seiTraceTestService.testGetAddressInfo(customAddress),
        seiTraceTestService.testGetAddressTransactions(customAddress, 1, 5),
        seiTraceTestService.testGetAddressTokenTransfers(customAddress, 1, 5),
      ]);

      setTestState(prev => ({
        ...prev,
        isRunning: false,
        results,
      }));
    } catch (error) {
      console.error('Custom address test failed:', error);
      setTestState(prev => ({ ...prev, isRunning: false }));
    }
  };

  const clearResults = () => {
    setTestState({
      isRunning: false,
      results: [],
      startTime: null,
      endTime: null,
    });
  };

  const formatResponseTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const getStatusColor = (success: boolean) => {
    return success ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
  };

  const getStatusBg = (success: boolean) => {
    return success 
      ? 'bg-green-100 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
      : 'bg-red-100 dark:bg-red-900/20 border-red-200 dark:border-red-800';
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          SeiTrace API Test Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Test the SeiTrace API endpoints before implementing WhaleTracker
        </p>
      </div>

      {/* API Status */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          API Configuration Status
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Status: </span>
            <span className={seiTraceTestService.isConfigured() ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
              {seiTraceTestService.isConfigured() ? 'Configured' : 'Not Configured'}
            </span>
          </div>
          <div>
            <span className="text-sm text-gray-600 dark:text-gray-400">API Key: </span>
            <span className="font-mono text-sm">
              {seiTraceTestService.getApiKeyStatus()}
            </span>
          </div>
        </div>
        
        {/* Mock Data Warning */}
        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            <span className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
              API Key Issue Detected
            </span>
          </div>
          <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
            The SeiTrace API key appears to be suspended or expired. The system will automatically fall back to mock data for development and testing purposes.
          </p>
        </div>
      </div>

      {/* Test Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Test Controls
        </h2>
        
        <div className="space-y-4">
          {/* Full Test Suite */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Full Test Suite</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Run all API endpoint tests with default parameters
              </p>
            </div>
            <button
              onClick={runFullTestSuite}
              disabled={testState.isRunning || !seiTraceTestService.isConfigured()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
            >
              {testState.isRunning ? 'Running...' : 'Run Full Suite'}
            </button>
          </div>

          {/* Custom Token Test */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 dark:text-white">Custom Token Test</h3>
              <input
                type="text"
                placeholder="Enter token contract address (0x...)"
                value={customTokenAddress}
                onChange={(e) => setCustomTokenAddress(e.target.value)}
                className="mt-2 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <button
              onClick={runCustomTokenTest}
              disabled={testState.isRunning || !customTokenAddress || !seiTraceTestService.isConfigured()}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
            >
              Test Token
            </button>
          </div>

          {/* Custom Address Test */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 dark:text-white">Custom Address Test</h3>
              <input
                type="text"
                placeholder="Enter wallet address (0x...)"
                value={customAddress}
                onChange={(e) => setCustomAddress(e.target.value)}
                className="mt-2 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <button
              onClick={runCustomAddressTest}
              disabled={testState.isRunning || !customAddress || !seiTraceTestService.isConfigured()}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
            >
              Test Address
            </button>
          </div>

          {/* Clear Results */}
          {testState.results.length > 0 && (
            <div className="flex justify-end">
              <button
                onClick={clearResults}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Clear Results
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Test Results */}
      {testState.results.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Test Results
            </h2>
            {testState.startTime && testState.endTime && (
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Total time: {formatResponseTime(testState.endTime - testState.startTime)}
              </span>
            )}
          </div>

          <div className="space-y-4">
            {testState.results.map((result, index) => (
              <div
                key={index}
                className={`border rounded-lg p-4 ${getStatusBg(result.success)}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {result.endpoint}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className={`font-medium ${getStatusColor(result.success)}`}>
                      {result.success ? '✓ Success' : '✗ Failed'}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {formatResponseTime(result.responseTime)}
                    </span>
                  </div>
                </div>

                {result.error && (
                  <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
                    <p className="text-sm text-red-700 dark:text-red-300 font-mono">
                      {result.error}
                    </p>
                  </div>
                )}

                {result.data && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
                      View Response Data
                    </summary>
                    <pre className="mt-2 p-3 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded text-xs overflow-x-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Total Tests: </span>
                <span className="font-medium">{testState.results.length}</span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Successful: </span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  {testState.results.filter(r => r.success).length}
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Failed: </span>
                <span className="font-medium text-red-600 dark:text-red-400">
                  {testState.results.filter(r => !r.success).length}
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Avg Response: </span>
                <span className="font-medium">
                  {formatResponseTime(
                    testState.results.reduce((acc, r) => acc + r.responseTime, 0) / testState.results.length
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {testState.isRunning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-900 dark:text-white">Running API tests...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeiTraceAPITest;
