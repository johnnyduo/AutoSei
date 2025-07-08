// Simple USDC Test Component
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAccount } from 'wagmi';
import { useUSDCBalance, useUSDCFaucet, MOCK_USDC_ADDRESS } from '@/lib/contractService';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

const USDCTest = () => {
  const { address, isConnected } = useAccount();
  const { data: usdcBalance, isLoading: balanceLoading, refetch } = useUSDCBalance(address);
  const { claimFaucet, isPending, error } = useUSDCFaucet();
  const [status, setStatus] = useState<'checking' | 'success' | 'error'>('checking');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleClaimFaucet = async () => {
    try {
      setErrorMessage('');
      console.log('Starting faucet claim...');
      const result = await claimFaucet();
      console.log('Faucet claim result:', result);
      
      // Wait a bit then refresh balance
      setTimeout(() => {
        refetch();
      }, 3000);
      
    } catch (err) {
      console.error('Faucet claim error:', err);
      setErrorMessage(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  useEffect(() => {
    // Test contract connectivity
    const testContract = async () => {
      try {
        if (MOCK_USDC_ADDRESS && MOCK_USDC_ADDRESS !== '0x0000000000000000000000000000000000000000') {
          setStatus('success');
        } else {
          setStatus('error');
          setErrorMessage('Contract address not configured');
        }
      } catch (err) {
        setStatus('error');
        setErrorMessage(err instanceof Error ? err.message : 'Unknown error');
      }
    };

    testContract();
  }, []);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          USDC Contract Test
          {status === 'checking' && <Loader2 className="h-4 w-4 animate-spin" />}
          {status === 'success' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
          {status === 'error' && <AlertCircle className="h-4 w-4 text-red-500" />}
        </CardTitle>
        <CardDescription>
          Testing Mock USDC contract integration
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Contract Address */}
        <div>
          <label className="text-sm font-medium">Contract Address</label>
          <div className="text-xs font-mono bg-muted p-2 rounded">
            {MOCK_USDC_ADDRESS}
          </div>
        </div>

        {/* Connection Status */}
        <div className="flex items-center gap-2">
          <Badge variant={isConnected ? "default" : "destructive"}>
            {isConnected ? "Wallet Connected" : "Wallet Disconnected"}
          </Badge>
        </div>

        {/* USDC Balance */}
        {isConnected && (
          <div>
            <label className="text-sm font-medium">USDC Balance</label>
            <div className="text-xl font-bold">
              {balanceLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                `${usdcBalance ? (Number(usdcBalance) / 1e6).toFixed(2) : '0.00'} USDC`
              )}
            </div>
          </div>
        )}

        {/* Faucet Button */}
        {isConnected && (
          <Button 
            onClick={handleClaimFaucet}
            disabled={isPending || !isConnected}
            className="w-full"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Claiming...
              </>
            ) : (
              'Claim 1000 USDC'
            )}
          </Button>
        )}

        {/* Error Display */}
        {(error || errorMessage) && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
            <strong>Error:</strong> {errorMessage || (error instanceof Error ? error.message : 'Unknown error')}
          </div>
        )}

        {/* Debug Info */}
        <details className="text-xs">
          <summary className="cursor-pointer text-muted-foreground">Debug Info</summary>
          <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
{JSON.stringify({
  contractAddress: MOCK_USDC_ADDRESS,
  userAddress: address,
  isConnected,
  usdcBalance: usdcBalance?.toString(),
  isPending,
  hasError: !!error
}, null, 2)}
          </pre>
        </details>
      </CardContent>
    </Card>
  );
};

export default USDCTest;
