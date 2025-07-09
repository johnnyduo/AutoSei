// src/components/PortfolioOverview.tsx
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  useUserAllocations,
  usePortfolioSummary,
  useSupportedCategories,
  useUSDCBalance,
  useUSDCInfo,
  useUSDCFaucet,
  formatUSDCAmount,
  formatAllocationsForUI
} from '@/lib/contractService';
import { useAccount, useBalance, useChainId } from 'wagmi';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  RefreshCw, 
  BarChart3,
  Sparkles,
  Brain,
  Zap,
  Target,
  PieChart,
  DollarSign,
  TrendingUpIcon,
  Wallet,
  Coins
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { fetchTokenInsights, fetchSeiPrice } from '@/lib/tokenService';
import { isGeminiAvailable } from '@/lib/geminiService';

interface TokenHolding {
  id: string;
  symbol: string;
  name: string;
  allocation: number;
  category: string;
  value: number;
  color: string;
  description: string;
}

const PortfolioOverview = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [selectedToken, setSelectedToken] = useState<TokenHolding | null>(null);
  const [tokenInsight, setTokenInsight] = useState<string | null>(null);
  const [isInsightLoading, setIsInsightLoading] = useState(false);
  const [isGeminiEnabled, setIsGeminiEnabled] = useState(false);
  const [seiPrice, setSeiPrice] = useState(0.45); // Will be updated with real price
  const [isPriceLoading, setIsPriceLoading] = useState(false);
  const [hoveredToken, setHoveredToken] = useState<TokenHolding | null>(null);
  const [isAIActive, setIsAIActive] = useState(false);
  const { toast } = useToast();
  
  // Fetch SEI balance from connected wallet
  const { data: balanceData, isLoading: balanceLoading, refetch: refetchBalance } = useBalance({
    address: address,
    query: {
      enabled: !!address && isConnected
    }
  });
  
  // Fetch USDC balance and info
  const { data: usdcBalance, isLoading: usdcBalanceLoading, refetch: refetchUSDC } = useUSDCBalance(address);
  const usdcInfo = useUSDCInfo();
  const { claimFaucet, isPending: isFaucetPending } = useUSDCFaucet();
  
  // Fetch real contract data
  const { data: userAllocations, isLoading: allocationsLoading, refetch: refetchAllocations } = useUserAllocations();
  const { data: portfolioSummary, isLoading: summaryLoading, refetch: refetchSummary } = usePortfolioSummary();
  const { data: supportedCategories } = useSupportedCategories();
  
  // Process real allocations from contract with fallback to default allocations
  const allocations = (() => {
    // Default 6 categories that should always be shown
    const defaultCategories = [
      { id: 'bigcap', name: 'Big Cap', color: '#10B981', allocation: 25 },
      { id: 'ai', name: 'AI & DeFi', color: '#8B5CF6', allocation: 20 },
      { id: 'defi', name: 'DeFi', color: '#F59E0B', allocation: 20 },
      { id: 'l1', name: 'Layer 1', color: '#EF4444', allocation: 15 },
      { id: 'rwa', name: 'RWA', color: '#0EA5E9', allocation: 12 },
      { id: 'meme', name: 'Meme & NFT', color: '#EC4899', allocation: 8 }
    ];
    
    // If we have contract data, use it but ensure all 6 categories are present
    if (userAllocations?.categories && userAllocations?.percentages && userAllocations.categories.length > 0) {
      const contractAllocations = formatAllocationsForUI(userAllocations.categories, userAllocations.percentages);
      
      // Merge contract data with defaults, giving priority to contract data
      const mergedAllocations = defaultCategories.map(defaultCategory => {
        const contractCategory = contractAllocations.find(c => c.id === defaultCategory.id);
        return contractCategory || { ...defaultCategory, allocation: 0 }; // Set missing categories to 0%
      });
      
      return mergedAllocations;
    }
    
    // Fallback to defaults if no contract data
    return defaultCategories;
  })();
  
  // Calculate real portfolio metrics
  const seiBalance = balanceData ? parseFloat(balanceData.formatted) : 0;
  const seiValue = seiBalance * seiPrice;
  
  // USDC balance formatting
  const usdcBalanceFormatted = usdcBalance ? formatUSDCAmount(usdcBalance as bigint, usdcInfo?.decimals as number || 6) : '0.00';
  const usdcBalanceNumber = parseFloat(usdcBalanceFormatted);
  
  // Contract portfolio value with enhanced calculation - Fixed double counting
  const contractValue = portfolioSummary?.totalValue ? Number(portfolioSummary.totalValue) : 0; // Convert BigInt to number
  const totalPortfolioValue = seiValue + contractValue + usdcBalanceNumber;
  
  // Real performance from contract - Convert BigInt values to numbers
  const performanceScore = portfolioSummary?.performanceScore ? Number(portfolioSummary.performanceScore) : 0;
  
  // Convert contract allocations to token holdings with enhanced data
  const tokenHoldings: TokenHolding[] = allocations.map((allocation) => ({
    id: allocation.id,
    symbol: allocation.name.split(' ')[0], // Extract symbol from name
    name: allocation.name,
    allocation: allocation.allocation,
    category: allocation.id,
    value: (allocation.allocation / 100) * Math.max(totalPortfolioValue, 10000), // Use total portfolio or minimum $10k for demo
    color: allocation.color,
    description: getCategoryDescription(allocation.id)
  }));
  
  const hasHoldings = allocations.length > 0; // Changed from tokenHoldings to allocations
  const activeCategories = allocations.length; // Changed from tokenHoldings to allocations
  const totalCategories = supportedCategories?.length || 7;

  // Enhanced category descriptions
  function getCategoryDescription(categoryId: string): string {
    const descriptions: { [key: string]: string } = {
      'ai': 'AI-powered protocols and machine learning tokens',
      'meme': 'Community-driven meme tokens and social coins',
      'rwa': 'Real-world asset tokenization projects',
      'bigcap': 'Large-cap established cryptocurrency assets',
      'defi': 'Decentralized finance protocols and yield farming',
      'l1': 'Layer 1 blockchain infrastructure tokens',
      'stablecoin': 'Price-stable digital assets and algorithmic stablecoins',
    };
    return descriptions[categoryId] || 'Digital asset category';
  }

  // Fetch real SEI price on component mount with improved caching
  useEffect(() => {
    const loadSeiPrice = async () => {
      setIsPriceLoading(true);
      try {
        const realSeiPrice = await fetchSeiPrice(); // Now uses caching and rate limiting
        setSeiPrice(realSeiPrice);
      } catch (error) {
        console.error('Failed to fetch SEI price:', error);
        // Keep the default price of 0.45
      } finally {
        setIsPriceLoading(false);
      }
    };

    // Only fetch if we don't have a cached price or if the component mounts for the first time
    loadSeiPrice();
    setIsGeminiEnabled(typeof isGeminiAvailable === 'function' ? isGeminiAvailable() : false);
  }, []); // Empty dependency array - only run once on mount

  // Enhanced token insights function
  const getTokenInsights = async (token: TokenHolding) => {
    if (!isGeminiEnabled) {
      toast({
        title: "AI Insights Unavailable",
        description: "Gemini API key is not configured. Please add it to your environment variables.",
        variant: "destructive"
      });
      return;
    }
    
    setSelectedToken(token);
    setTokenInsight(null);
    setIsInsightLoading(true);
    
    try {
      const insights = await fetchTokenInsights(token.symbol);
      setTokenInsight(insights);
    } catch (error) {
      console.error('Error fetching token insights:', error);
      toast({
        title: "Failed to Load Insights",
        description: error instanceof Error ? error.message : "Could not fetch AI insights for this token. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsInsightLoading(false);
    }
  };

  // USDC Faucet function with enhanced validation
  const handleClaimUSDC = async () => {
    // Check if contract address is configured
    const mockUSDCAddress = import.meta.env.VITE_MOCK_USDC_ADDRESS;
    if (!mockUSDCAddress || mockUSDCAddress === '0x0000000000000000000000000000000000000000') {
      toast({
        title: "Configuration Error",
        description: "USDC contract address is not configured. Contract should be deployed at 0x9d5F1273002Cc4DAC76B72249ed59B21Ba41D526",
        variant: "destructive"
      });
      return;
    }

    // Check wallet connection
    if (!isConnected || !address) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first to claim USDC.",
        variant: "destructive"
      });
      return;
    }

    // Check network
    if (chainId !== 1328) {
      toast({
        title: "Wrong Network",
        description: "Please switch to Sei Testnet (Chain ID: 1328) to claim USDC.",
        variant: "destructive"
      });
      return;
    }

    // Check if user already has enough USDC (reduced for testing)
    if (usdcBalanceNumber >= 500) {
      toast({
        title: "Cannot Claim USDC",
        description: "You already have 500+ USDC. The faucet is only available for accounts with less than 500 USDC.",
        variant: "destructive"
      });
      return;
    }

    try {
      const result = await claimFaucet();
      
      toast({
        title: "USDC Claimed Successfully! 🎉",
        description: "100 USDC has been added to your wallet. It may take a moment to appear in your balance.",
      });
      
      // Refresh USDC balance after a delay to allow transaction to confirm
      setTimeout(() => {
        refetchUSDC();
      }, 5000);
      
    } catch (error) {
      console.error('❌ Faucet claim error:', error);
      
      // Provide more specific error messages
      let errorMessage = "Could not claim USDC from faucet";
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Add helpful hints for common errors
        if (errorMessage.includes('awaiting_internal_transactions')) {
          errorMessage += "\n\nTip: The transaction may still be processing. Please wait a moment and check your balance.";
        } else if (errorMessage.includes('Already has enough tokens')) {
          errorMessage = "You already have enough USDC (500+). The faucet is limited to users with less than 500 USDC.";
        }
      }
      
      toast({
        title: "Claim Failed",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const getPerformanceIcon = (score: number) => {
    const numScore = Number(score) || 0; // Ensure it's a number with fallback
    if (numScore > 50) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (numScore < 30) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Activity className="h-4 w-4 text-yellow-500" />;
  };

  const getPerformanceColor = (score: number) => {
    const numScore = Number(score) || 0; // Ensure it's a number with fallback
    if (numScore > 50) return 'text-green-500';
    if (numScore < 30) return 'text-red-500';
    return 'text-yellow-500';
  };

  const refreshAllData = async () => {
    setIsPriceLoading(true);
    try {
      // Refresh contract data and SEI price in parallel
      // Note: fetchSeiPrice now uses caching, so it won't spam the API
      const [seiPriceResult] = await Promise.all([
        fetchSeiPrice(),
        refetchBalance(),
        refetchUSDC(),
        refetchAllocations(),
        refetchSummary()
      ]);
      
      setSeiPrice(seiPriceResult);
      
      toast({
        title: "Data Refreshed",
        description: "Portfolio data has been updated successfully.",
      });
      
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast({
        title: "Refresh Failed", 
        description: "Failed to refresh some data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsPriceLoading(false);
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Enhanced Portfolio Summary Cards with USDC */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Real Portfolio Value with SEI + USDC Balance */}
          <Card className="card-glass">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isPriceLoading ? (
                  <div className="flex items-center space-x-2">
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    <span>Loading...</span>
                  </div>
                ) : (
                  formatCurrency(totalPortfolioValue)
                )}
              </div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                {getPerformanceIcon(performanceScore)}
                <span className={`ml-1 ${getPerformanceColor(performanceScore)}`}>
                  Performance Score: {(Number(performanceScore) || 0).toFixed(1)}%
                </span>
              </div>
            </CardContent>
          </Card>

          {/* SEI Balance */}
          <Card className="card-glass">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">SEI Balance</CardTitle>
              <Coins className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{seiBalance.toFixed(4)} SEI</div>
              <div className="text-xs text-muted-foreground mt-1">
                ${formatCurrency(seiValue).replace('$', '')} USD
                {isPriceLoading && <RefreshCw className="h-3 w-3 animate-spin inline ml-1" />}
              </div>
              <div className="text-xs text-muted-foreground">
                Price: {formatCurrency(seiPrice)}
              </div>
            </CardContent>
          </Card>

          {/* USDC Balance */}
          <Card className="card-glass">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">USDC Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {usdcBalanceLoading ? (
                  <RefreshCw className="h-5 w-5 animate-spin" />
                ) : (
                  `${usdcBalanceFormatted} USDC`
                )}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Stablecoin Balance
              </div>
              
              {/* Faucet Button with Better Logic */}
              {usdcBalanceNumber >= 500 ? (
                <div className="mt-2 text-xs text-green-600 dark:text-green-400">
                  ✓ Faucet limit reached (500+ USDC)
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-2 h-6 text-xs"
                  onClick={handleClaimUSDC}
                  disabled={isFaucetPending || !isConnected || usdcBalanceNumber >= 500}
                >
                  {isFaucetPending ? (
                    <RefreshCw className="h-3 w-3 animate-spin" />
                  ) : (
                    `Claim 100 USDC`
                  )}
                </Button>
              )}
              
              {!isConnected && (
                <div className="mt-2 text-xs text-muted-foreground">
                  Connect wallet to claim
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Portfolio Management */}
          <Card className="card-glass">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Portfolio Management</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <div className="flex-1">
                  <div className={`text-lg font-semibold mb-1 transition-colors duration-300 ${
                    isAIActive ? 'text-purple-600 dark:text-purple-400' : ''
                  }`}>
                    {isAIActive ? 'AI Enabled' : 'Manual Mode'}
                  </div>
                  <p className={`text-xs transition-colors duration-300 ${
                    isAIActive ? 'text-purple-500 dark:text-purple-300' : 'text-muted-foreground'
                  }`}>
                    {isAIActive ? 'AI managing portfolio' : 'Manual control'}
                  </p>
                </div>
                
                {/* Toggle Switch */}
                <button
                  onClick={() => setIsAIActive(!isAIActive)}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                    isAIActive ? 'bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                  aria-pressed={isAIActive}
                  aria-label="Toggle AI Portfolio Management"
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-all duration-300 ${
                      isAIActive ? 'translate-x-7 shadow-purple-200' : 'translate-x-1'
                    }`}
                  >
                    {isAIActive && (
                      <Sparkles className="h-4 w-4 text-purple-500 m-1" />
                    )}
                  </span>
                </button>
              </div>
              
              <div className={`text-xs transition-colors duration-300 ${
                isAIActive ? 'text-purple-600 dark:text-purple-400' : 'text-muted-foreground'
              }`}>
                Active Categories: {activeCategories}/{totalCategories}
                {isAIActive && (
                  <span className="ml-2 inline-flex items-center">
                    <Zap className="h-3 w-3 mr-1" />
                    Auto-rebalancing • Market analysis • Smart optimization
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Real Asset Allocation from Contract with Interactive Pie Chart */}
        <Card className="card-glass">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl">Asset Allocation</CardTitle>
              <CardDescription>
                Your portfolio allocation across different asset categories
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshAllData}
              disabled={allocationsLoading || summaryLoading || isPriceLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${allocationsLoading || summaryLoading || isPriceLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </CardHeader>
          <CardContent>
            {allocationsLoading || summaryLoading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Loading portfolio data from contract...</span>
              </div>
            ) : hasHoldings ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Interactive Pie Chart */}
                <div className="flex flex-col items-center justify-center">
                  <div className="relative">
                    <svg width="400" height="400" viewBox="0 0 400 400" className="transform -rotate-90">
                      {/* Pie Chart Segments */}
                      {(() => {
                        let cumulativePercentage = 0;
                        return tokenHoldings.map((token, index) => {
                          const startAngle = cumulativePercentage * 3.6; // Convert percentage to degrees
                          const endAngle = (cumulativePercentage + token.allocation) * 3.6;
                          cumulativePercentage += token.allocation;
                          
                          // Calculate path for pie slice
                          const centerX = 200;
                          const centerY = 200;
                          const radius = hoveredToken?.id === token.id ? 165 : 160; // Expand on hover
                          const innerRadius = 80;
                          
                          const startAngleRad = (startAngle * Math.PI) / 180;
                          const endAngleRad = (endAngle * Math.PI) / 180;
                          
                          const x1 = centerX + radius * Math.cos(startAngleRad);
                          const y1 = centerY + radius * Math.sin(startAngleRad);
                          const x2 = centerX + radius * Math.cos(endAngleRad);
                          const y2 = centerY + radius * Math.sin(endAngleRad);
                          
                          const x3 = centerX + innerRadius * Math.cos(startAngleRad);
                          const y3 = centerY + innerRadius * Math.sin(startAngleRad);
                          const x4 = centerX + innerRadius * Math.cos(endAngleRad);
                          const y4 = centerY + innerRadius * Math.sin(endAngleRad);
                          
                          const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
                          
                          const pathData = [
                            `M ${x1} ${y1}`,
                            `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                            `L ${x4} ${y4}`,
                            `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x3} ${y3}`,
                            'Z'
                          ].join(' ');
                          
                          const isHovered = hoveredToken?.id === token.id;
                          
                          return (
                            <path
                              key={token.id}
                              d={pathData}
                              fill={token.color}
                              stroke="rgba(255,255,255,0.2)"
                              strokeWidth={isHovered ? "3" : "2"}
                              className="transition-all duration-300 cursor-pointer"
                              style={{
                                filter: isHovered ? 'brightness(1.2) drop-shadow(0 0 10px rgba(255,255,255,0.3))' : 'brightness(1)',
                                transformOrigin: '200px 200px'
                              }}
                              onClick={() => getTokenInsights(token)}
                              onMouseEnter={() => setHoveredToken(token)}
                              onMouseLeave={() => setHoveredToken(null)}
                            />
                          );
                        });
                      })()}
                    </svg>
                    
                    {/* Center Portfolio Value - Dynamic based on hover */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <div className="text-center transform rotate-0">
                        {hoveredToken ? (
                          <>
                            <div className="text-xs text-muted-foreground">{hoveredToken.name}</div>
                            <div className="text-xl font-bold text-foreground" style={{ color: hoveredToken.color }}>
                              {formatCurrency(hoveredToken.value)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {hoveredToken.allocation.toFixed(1)}% allocation
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="text-sm text-muted-foreground">Portfolio Value</div>
                            <div className="text-2xl font-bold text-foreground">
                              {formatCurrency(totalPortfolioValue)}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Asset Breakdown */}
                <div className="space-y-4">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">Asset Breakdown</h3>
                    <div className="text-sm text-muted-foreground">
                      {activeCategories} categories • {formatCurrency(totalPortfolioValue)} total
                    </div>
                  </div>
                  
                  {tokenHoldings.map((token) => (
                    <div
                      key={token.id}
                      className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-300 group cursor-pointer ${
                        hoveredToken?.id === token.id 
                          ? 'border-opacity-80 shadow-lg scale-[1.02] bg-opacity-50' 
                          : 'border-border/50 hover:border-border'
                      }`}
                      style={{
                        borderColor: hoveredToken?.id === token.id ? token.color : undefined,
                        backgroundColor: hoveredToken?.id === token.id ? `${token.color}15` : undefined
                      }}
                      onClick={() => getTokenInsights(token)}
                      onMouseEnter={() => setHoveredToken(token)}
                      onMouseLeave={() => setHoveredToken(null)}
                    >
                      <div className="flex items-center space-x-3">
                        <div 
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm transition-all duration-300 ${
                            hoveredToken?.id === token.id ? 'scale-110 shadow-lg' : ''
                          }`}
                          style={{ backgroundColor: token.color }}
                        >
                          {token.symbol.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className={`font-medium transition-colors duration-300 ${
                              hoveredToken?.id === token.id ? 'text-foreground' : ''
                            }`}>
                              {token.name}
                            </p>
                            <Badge variant="secondary" className="text-xs">
                              {token.category.toUpperCase()}
                            </Badge>
                            {isGeminiEnabled && (
                              <div className={`flex items-center transition-opacity duration-300 ${
                                hoveredToken?.id === token.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                              }`}>
                                <Brain className="h-3 w-3 text-purple-500" />
                              </div>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {token.description}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-semibold transition-all duration-300 ${
                          hoveredToken?.id === token.id ? 'text-lg scale-105' : ''
                        }`} style={{ color: hoveredToken?.id === token.id ? token.color : undefined }}>
                          {formatCurrency(token.value)}
                        </div>
                        <div className="text-sm text-muted-foreground">{token.allocation.toFixed(1)}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              // This section should now never be reached since we always have default allocations
              <div className="text-center py-8">
                <PieChart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Loading default allocations...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Token Insights Dialog with Gemini 2.5 Pro Branding */}
      <Dialog open={!!selectedToken} onOpenChange={(open) => !open && setSelectedToken(null)}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto bg-background border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center">
                {selectedToken && (
                  <>
                    <div 
                      className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold mr-3"
                      style={{ backgroundColor: selectedToken.color }}
                    >
                      {selectedToken.symbol.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span>{selectedToken.name}</span>
                        <Badge variant="secondary">{selectedToken.symbol}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {selectedToken.category.toUpperCase()} • {selectedToken.allocation.toFixed(1)}% allocation
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Sparkles className="h-4 w-4 text-purple-500" />
                <span>Powered by Gemini 2.5 Pro</span>
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {isInsightLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin"></div>
                  <Brain className="h-8 w-8 text-purple-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                </div>
                <p className="text-muted-foreground mt-4 text-center">
                  Analyzing {selectedToken?.symbol} with AI insights...
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Powered by Gemini 2.5 Pro
                </p>
              </div>
            ) : tokenInsight ? (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg p-4 border border-purple-200/20">
                  <div className="flex items-center space-x-2 mb-2">
                    <Brain className="h-5 w-5 text-purple-500" />
                    <span className="font-medium">AI Analysis</span>
                    <Badge variant="outline" className="text-xs">
                      Gemini 2.5 Pro
                    </Badge>
                  </div>
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {tokenInsight}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                  <span>Analysis generated by Google's Gemini 2.5 Pro</span>
                  <span>{new Date().toLocaleTimeString()}</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No insights available</p>
                <p className="text-sm text-muted-foreground">
                  {isGeminiEnabled ? 'Failed to generate insights' : 'Gemini API not configured'}
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PortfolioOverview;
