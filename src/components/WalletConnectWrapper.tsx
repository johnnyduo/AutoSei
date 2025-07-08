
import React from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Wallet, Copy, LogOut } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const WalletConnectWrapper = () => {
  const { address, isConnected, isConnecting } = useAccount();
  const { disconnect } = useDisconnect();
  const { open } = useAppKit();

  const handleConnect = () => {
    try {
      open();
    } catch (error) {
      console.error('Failed to open wallet modal:', error);
      toast.error('Failed to open wallet connection');
    }
  };

  const handleDisconnect = () => {
    try {
      disconnect();
      toast.success('Wallet Disconnected', {
        description: 'Your wallet has been disconnected successfully.'
      });
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
      toast.error('Failed to disconnect wallet');
    }
  };

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast.success('Address Copied', {
        description: 'Wallet address copied to clipboard'
      });
    }
  };

  const formatAddress = (address?: string) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  if (isConnecting) {
    return (
      <Button variant="outline" size="sm" disabled>
        <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        Connecting...
      </Button>
    );
  }

  if (!isConnected) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              onClick={handleConnect}
              variant="outline" 
              size="sm"
              className="bg-gradient-orange-coral text-white border-none hover:opacity-90 transition-all"
            >
              <Wallet className="w-4 h-4 mr-2" />
              Connect Wallet
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Connect your Web3 wallet</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyAddress}
              className="bg-gradient-orange-coral text-white border-none hover:opacity-90 transition-all"
            >
              <Copy className="w-4 h-4 mr-2" />
              <span className="font-mono">{formatAddress(address)}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Copy wallet address</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDisconnect}
              className="bg-gradient-coral-burgundy text-white border-none hover:opacity-90 transition-all"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Disconnect wallet</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
};

export default WalletConnectWrapper;
