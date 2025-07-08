
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
  categoryColors,
  categoryNames,
  formatAllocationsForUI
} from '@/lib/contractService';
import { useAccount, useBalance } from 'wagmi';
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
  Wallet
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
  const [selectedToken, setSelectedToken] = useState<TokenHolding | null>(null);
  const [tokenInsight, setTokenInsight] = useState<string | null>(null);
  const [isInsightLoading, setIsInsightLoading] = useState(false);
  const [isGeminiEnabled, setIsGeminiEnabled] = useState(false);
  const [seiPrice, setSeiPrice] = useState(0.45); // Will be updated with real price
  const [isPriceLoading, setIsPriceLoading] = useState(false);
  const { toast } = useToast();
  
  // Fetch SEI balance from connected wallet
  const { data: balanceData, isLoading: balanceLoading, refetch: refetchBalance } = useBalance({
    address: address,
    query: {
      enabled: !!address && isConnected
    }
  });
  
  // Fetch real contract data
  const { data: userAllocations, isLoading: allocationsLoading, refetch: refetchAllocations } = useUserAllocations();
  const { data: portfolioSummary, isLoading: summaryLoading, refetch: refetchSummary } = usePortfolioSummary();
  const { data: supportedCategories } = useSupportedCategories();
  
  // Process real allocations from contract
  const allocations = userAllocations?.categories && userAllocations?.percentages ? 
    formatAllocationsForUI(userAllocations.categories, userAllocations.percentages) : 
    [];
  
  // Calculate real portfolio metrics
  const seiBalance = balanceData ? parseFloat(balanceData.formatted) : 0;
  const seiValue = seiBalance * seiPrice;
  
  // Contract portfolio value (this could be enhanced with real token price fetching)
  const contractValue = portfolioSummary?.totalValue || 0;
  const totalPortfolioValue = seiValue + contractValue;
  
  // Real performance from contract
  const performanceScore = portfolioSummary?.performanceScore || 0;
  const riskLevel = portfolioSummary?.riskLevel || 0;
  const autoRebalanceEnabled = portfolioSummary?.autoRebalance || false;
  const lastRebalance = portfolioSummary?.lastRebalance || 0;
  
  // Convert contract allocations to token holdings with enhanced data
  const tokenHoldings: TokenHolding[] = allocations.map((allocation) => ({
    id: allocation.id,
    symbol: allocation.name.split(' ')[0], // Extract symbol from name
    name: allocation.name,
    allocation: allocation.allocation,
    category: allocation.id,
    value: (allocation.allocation / 100) * contractValue, // Calculate value based on allocation
    color: allocation.color,
    description: getCategoryDescription(allocation.id)
  }));
  
  const hasHoldings = tokenHoldings.length > 0;
  const activeCategories = tokenHoldings.length;
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

  // Fetch real SEI price on component mount
  useEffect(() => {
    const loadSeiPrice = async () => {
      setIsPriceLoading(true);
      try {
        const realSeiPrice = await fetchSeiPrice();
        setSeiPrice(realSeiPrice);
      } catch (error) {
        console.error('Failed to fetch SEI price:', error);
        // Keep the default price of 0.45
      } finally {
        setIsPriceLoading(false);
      }
    };

    loadSeiPrice();
    setIsGeminiEnabled(typeof isGeminiAvailable === 'function' ? isGeminiAvailable() : false);
  }, []);

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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const getPerformanceIcon = (score: number) => {
    if (score > 50) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (score < 30) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Activity className="h-4 w-4 text-yellow-500" />;
  };

  const getPerformanceColor = (score: number) => {
    if (score > 50) return 'text-green-500';
    if (score < 30) return 'text-red-500';
    return 'text-yellow-500';
  };

  const refreshAllData = async () => {
    setIsPriceLoading(true);
    try {
      // Refresh contract data and SEI price in parallel
      const [seiPriceResult] = await Promise.all([
        fetchSeiPrice(),
        refetchBalance(),
        refetchAllocations(),
        refetchSummary()
      ]);
      
      setSeiPrice(seiPriceResult);
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
        {/* Professional Portfolio Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Real Portfolio Value with SEI Balance */}
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
                  Performance Score: {performanceScore.toFixed(1)}%
                </span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                SEI: {seiBalance.toFixed(4)} SEI (${formatCurrency(seiValue).replace('$', '')}) 
                {isPriceLoading && <RefreshCw className="h-3 w-3 animate-spin inline ml-1" />}
              </div>
              <div className="text-xs text-muted-foreground">
                SEI Price: {formatCurrency(seiPrice).replace('$', '')} USD
                {contractValue > 0 && ` | Contract: ${formatCurrency(contractValue)}`}
              </div>
            </CardContent>
          </Card>

          {/* Active Asset Categories */}
          <Card className="card-glass">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Asset Categories</CardTitle>
              <PieChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeCategories}</div>
              <p className="text-xs text-muted-foreground">
                of {totalCategories} supported categories
              </p>
              <div className="text-xs text-muted-foreground mt-1">
                Risk Level: {riskLevel}/10
              </div>
            </CardContent>
          </Card>

          {/* AI Portfolio Management */}
          <Card className="card-glass">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Portfolio Management</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {autoRebalanceEnabled ? 'Active' : 'Manual'}
              </div>
              <p className="text-xs text-muted-foreground">
                {autoRebalanceEnabled ? 'Auto-rebalancing enabled' : 'Manual management mode'}
              </p>
              {lastRebalance > 0 && (
                <div className="text-xs text-muted-foreground mt-1">
                  Last rebalanced: {new Date(lastRebalance * 1000).toLocaleDateString()}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Real Asset Allocation from Contract */}
        <Card className="card-glass">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl">Asset Allocation</CardTitle>
              <CardDescription>
                Your current portfolio allocation from smart contract
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
              <div className="space-y-4">
                {tokenHoldings.map((token) => (
                  <div
                    key={token.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:border-border transition-colors group cursor-pointer"
                    onClick={() => getTokenInsights(token)}
                  >
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: token.color }}
                      >
                        {token.symbol.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-medium">{token.name}</p>
                          <Badge variant="secondary" className="text-xs">
                            {token.category.toUpperCase()}
                          </Badge>
                          {isGeminiEnabled && (
                            <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Brain className="h-4 w-4 text-purple-500" />
                              <span className="text-xs text-muted-foreground ml-1">AI Insights</span>
                            </div>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {token.description}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(token.value)}</div>
                      <div className="flex items-center space-x-2">
                        <Progress 
                          value={token.allocation} 
                          className="w-20 h-2"
                          style={{ 
                            '--progress-background': token.color,
                          } as React.CSSProperties}
                        />
                        <span className="text-sm text-muted-foreground">{token.allocation.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No portfolio allocations found</p>
                <p className="text-sm text-muted-foreground">
                  {isConnected ? 'Set up your first allocation to get started' : 'Connect your wallet to view allocations'}
                </p>
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
