// src/components/PortfolioOverview.tsx
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Sector } from 'recharts';
import { 
  useUserAllocations,
  usePortfolioSummary,
  useSupportedCategories,
  useUSDCBalance,
  useUSDCInfo,
  useUSDCFaucet,
  formatUSDCAmount,
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
  Target,
  DollarSign,
  Wallet,
  Bot,
  Settings,
  Zap,
  ExternalLink,
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
  const { toast } = useToast();
  
  // AI Management state
  const [isAIActive, setIsAIActive] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [seiPrice, setSeiPrice] = useState(0.45);
  const [isPriceLoading, setIsPriceLoading] = useState(false);
  
  // Balances
  const { data: seiBalance } = useBalance({ address });
  const { data: usdcBalance, isLoading: usdcBalanceLoading, refetch: refetchUSDC } = useUSDCBalance(address);
  const usdcInfo = useUSDCInfo();
  const { claimFaucet, isPending: isFaucetPending } = useUSDCFaucet();
  
  // Contract data
  const { data: userAllocations, isLoading: allocationsLoading, refetch: refetchAllocations } = useUserAllocations();
  const { data: portfolioSummary, isLoading: summaryLoading, refetch: refetchSummary } = usePortfolioSummary();
  const { data: supportedCategories } = useSupportedCategories();

  // Calculate portfolio values first
  const seiValue = seiBalance ? parseFloat(seiBalance.formatted) : 0;
  const usdcBalanceFormatted = usdcBalance ? formatUSDCAmount(usdcBalance as bigint, usdcInfo?.decimals as number || 6) : '0.00';
  const usdcBalanceNumber = parseFloat(usdcBalanceFormatted);
  const contractValue = portfolioSummary?.totalValue || 0;
  const totalValue = (seiValue * seiPrice) + usdcBalanceNumber + contractValue;

  // Process allocations data with enhanced contract integration
  const allocations = useMemo(() => {
    // If we have real contract data, use it
    if (userAllocations?.categories && userAllocations?.percentages && userAllocations.categories.length > 0) {
      const contractAllocations = formatAllocationsForUI(userAllocations.categories, userAllocations.percentages);
      // Add value calculations to contract data
      return contractAllocations.map(allocation => ({
        ...allocation,
        value: parseFloat(usdcBalanceFormatted) * (allocation.allocation / 100),
        description: getDescriptionForCategory(allocation.id)
      }));
    }
    
    // Fallback to demo data with realistic values based on USDC balance
    const usdcValue = parseFloat(usdcBalanceFormatted) || 10000;
    return [
      { id: 'bigcap', name: 'Big Cap', color: '#10B981', allocation: 25, value: usdcValue * 0.25, description: 'Large-cap established cryptocurrency assets' },
      { id: 'ai', name: 'AI & DeFi', color: '#8B5CF6', allocation: 20, value: usdcValue * 0.20, description: 'AI-powered protocols and machine learning tokens' },
      { id: 'defi', name: 'DeFi', color: '#F59E0B', allocation: 15, value: usdcValue * 0.15, description: 'Decentralized finance protocols and yield farming' },
      { id: 'l1', name: 'Layer 1', color: '#EF4444', allocation: 15, value: usdcValue * 0.15, description: 'Layer 1 blockchain infrastructure tokens' },
      { id: 'rwa', name: 'RWA', color: '#0EA5E9', allocation: 15, value: usdcValue * 0.15, description: 'Real-world asset tokenization projects' },
      { id: 'meme', name: 'Meme & NFT', color: '#EC4899', allocation: 10, value: usdcValue * 0.10, description: 'Community-driven meme tokens and social coins' }
    ];
  }, [userAllocations, usdcBalanceFormatted]);

  // Helper function for category descriptions
  const getDescriptionForCategory = (categoryId: string): string => {
    const descriptions: Record<string, string> = {
      'bigcap': 'Large-cap established cryptocurrency assets',
      'ai': 'AI-powered protocols and machine learning tokens',
      'defi': 'Decentralized finance protocols and yield farming',
      'l1': 'Layer 1 blockchain infrastructure tokens',
      'rwa': 'Real-world asset tokenization projects',
      'meme': 'Community-driven meme tokens and social coins',
      'stablecoin': 'USD-pegged stable cryptocurrencies'
    };
    return descriptions[categoryId] || `${categoryId} portfolio allocation`;
  };

  // Enhanced portfolio data for interactive pie chart
  const portfolioData = allocations.map((allocation, index) => ({
    name: categoryNames[allocation.id] || allocation.name,
    value: allocation.allocation,
    color: categoryColors[allocation.id] || allocation.color,
    category: allocation.id,
    usdValue: allocation.value || (totalValue * allocation.allocation / 100),
    description: allocation.description || `${allocation.name} portfolio allocation`,
    index
  }));

  // Calculate total allocated value for center display
  const totalAllocatedValue = portfolioData.reduce((sum, item) => sum + item.usdValue, 0);

  // Performance data
  const performanceData = {
    totalGain: 12.45,
    totalGainPercent: 8.2,
    dailyChange: 2.1,
    weeklyChange: 5.8,
    monthlyChange: 12.4
  };

  const handleRefresh = useCallback(async () => {
    try {
      await Promise.all([refetchAllocations(), refetchSummary(), refetchUSDC()]);
      toast({
        title: "Portfolio Refreshed",
        description: "Latest allocations and balances updated",
      });
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Could not update portfolio data",
        variant: "destructive"
      });
    }
  }, [refetchAllocations, refetchSummary, refetchUSDC, toast]);

  const handleAIToggle = useCallback((checked: boolean) => {
    setIsAIActive(checked);
    toast({
      title: checked ? "AI Management Activated" : "Manual Mode Activated",
      description: checked 
        ? "AI will now optimize your portfolio automatically" 
        : "You're now in manual portfolio management mode",
    });
  }, [toast]);

  const handleClaimUSDC = async () => {
    try {
      await claimFaucet();
      toast({
        title: "USDC Claimed!",
        description: "1000 USDC has been added to your wallet",
      });
      setTimeout(() => refetchUSDC(), 2000);
    } catch (error) {
      toast({
        title: "Claim Failed",
        description: error instanceof Error ? error.message : "Could not claim USDC from faucet",
        variant: "destructive"
      });
    }
  };

  // Enhanced pie chart active shape with center value display
  const renderActiveShape = (props: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent } = props;
    const RADIAN = Math.PI / 180;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    return (
      <g>
        {/* Center value display */}
        <text x={cx} y={cy - 10} textAnchor="middle" className="text-2xl font-bold fill-current">
          ${payload.usdValue?.toFixed(0) || '0'}
        </text>
        <text x={cx} y={cy + 8} textAnchor="middle" className="text-sm fill-muted-foreground">
          {payload.name}
        </text>
        <text x={cx} y={cy + 25} textAnchor="middle" className="text-xs fill-muted-foreground">
          {(percent * 100).toFixed(1)}% of portfolio
        </text>
        
        {/* Active sector */}
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={fill}
        />
        
        {/* Leader line and label */}
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" strokeWidth="2"/>
        <circle cx={ex} cy={ey} r={3} fill={fill} stroke="white" strokeWidth="2"/>
        <text 
          x={ex + (cos >= 0 ? 1 : -1) * 12} 
          y={ey - 5} 
          textAnchor={textAnchor} 
          className="text-sm font-semibold fill-current"
        >
          {payload.name}
        </text>
        <text 
          x={ex + (cos >= 0 ? 1 : -1) * 12} 
          y={ey + 10} 
          textAnchor={textAnchor} 
          className="text-xs fill-muted-foreground"
        >
          ${payload.usdValue?.toFixed(2) || '0.00'}
        </text>
      </g>
    );
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg shadow-lg p-4 max-w-xs">
          <div className="flex items-center gap-3 mb-2">
            <div 
              className="w-4 h-4 rounded-full border-2 border-background shadow-sm" 
              style={{ backgroundColor: data.color }}
            />
            <span className="font-semibold text-card-foreground">{data.name}</span>
          </div>
          <div className="space-y-1 text-sm">
            <p className="text-muted-foreground">{data.description}</p>
            <div className="flex justify-between pt-2 border-t border-border">
              <span className="text-muted-foreground">Allocation:</span>
              <span className="font-medium">{data.value}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Value:</span>
              <span className="font-medium text-primary">${data.usdValue.toFixed(2)}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Debug logging for contract data
  useEffect(() => {
    console.log('🔍 Contract Debug Info:', {
      isConnected,
      address,
      userAllocations,
      allocationsLoading,
      usdcBalance: usdcBalanceFormatted,
      totalValue,
      allocationsData: allocations
    });
  }, [isConnected, address, userAllocations, allocationsLoading, usdcBalanceFormatted, totalValue, allocations]);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Portfolio Overview</h1>
          <p className="text-muted-foreground">
            Manage your automated portfolio allocations and track performance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          {isConnected && (
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              <Settings className="h-3 w-3 mr-1" />
              Connected
            </Badge>
          )}
        </div>
      </div>

      {/* AI Management Toggle */}
      <Card className="border-2 border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">AI Portfolio Management</CardTitle>
                <CardDescription>
                  {isAIActive ? "AI is actively managing your portfolio" : "Manual portfolio management mode"}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-muted-foreground">
                {isAIActive ? "AI Active" : "Manual"}
              </span>
              <Switch
                checked={isAIActive}
                onCheckedChange={handleAIToggle}
                className="data-[state=checked]:bg-primary"
              />
            </div>
          </div>
        </CardHeader>
        {isAIActive && (
          <CardContent className="pt-0">
            <div className="flex items-center gap-2 text-sm text-primary">
              <Zap className="h-4 w-4" />
              <span>AI is monitoring market conditions and will rebalance when optimal</span>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Portfolio Value & Performance */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              +${performanceData.totalGain.toFixed(2)} ({performanceData.totalGainPercent.toFixed(1)}%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SEI Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{seiValue.toFixed(4)} SEI</div>
            <p className="text-xs text-muted-foreground">
              ${(seiValue * seiPrice).toFixed(2)} USD
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">USDC Balance</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {usdcBalanceLoading ? (
                <RefreshCw className="h-5 w-5 animate-spin" />
              ) : (
                `${usdcBalanceFormatted} USDC`
              )}
            </div>
            <Button
              size="sm"
              variant="outline"
              className="mt-2 h-6 text-xs"
              onClick={handleClaimUSDC}
              disabled={isFaucetPending || !isConnected}
            >
              {isFaucetPending ? (
                <RefreshCw className="h-3 w-3 animate-spin" />
              ) : (
                'Claim 1000 USDC'
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">24h Change</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+{performanceData.dailyChange}%</div>
            <p className="text-xs text-muted-foreground">
              Above market average
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Asset Allocation Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Interactive Pie Chart - Takes up 2 columns */}
        <Card className="lg:col-span-2 border-2 border-primary/10 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">Portfolio Allocation</CardTitle>
                  <CardDescription className="text-sm">
                    Interactive view of your asset distribution • ${(totalAllocatedValue || parseFloat(usdcBalanceFormatted)).toFixed(2)} total
                  </CardDescription>
                </div>
              </div>
              <Badge variant="secondary" className="bg-primary/10 text-primary font-medium">
                {portfolioData.length} Assets • {userAllocations ? 'Contract' : 'Demo'} Data
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {allocationsLoading ? (
              <div className="h-[420px] flex items-center justify-center">
                <div className="text-center space-y-3">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary" />
                  <p className="text-muted-foreground">Loading portfolio data...</p>
                </div>
              </div>
            ) : (
              <div className="h-[420px] relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      activeIndex={activeIndex}
                      activeShape={renderActiveShape}
                      data={portfolioData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      innerRadius={60}
                      outerRadius={140}
                      fill="#8884d8"
                      dataKey="value"
                      onMouseEnter={(_, index) => setActiveIndex(index)}
                      animationBegin={0}
                      animationDuration={800}
                    >
                      {portfolioData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color}
                          stroke="white"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Center stats when no hover */}
                {activeIndex === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-foreground">
                        ${(totalAllocatedValue || parseFloat(usdcBalanceFormatted)).toFixed(0)}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {allocationsLoading ? 'Loading...' : 'Total Portfolio'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {portfolioData.length} allocations
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Allocation Breakdown Sidebar */}
        <Card className="border-2 border-primary/10">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-secondary/20 to-secondary/10 rounded-lg">
                <Activity className="h-5 w-5 text-secondary-foreground" />
              </div>
              <div>
                <CardTitle className="text-lg">Allocation Details</CardTitle>
                <CardDescription className="text-xs">
                  Breakdown by category
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 max-h-[360px] overflow-y-auto">
            {portfolioData
              .sort((a, b) => b.value - a.value)
              .map((allocation, index) => (
              <div 
                key={allocation.category} 
                className={`group space-y-3 p-3 rounded-lg border transition-all duration-200 hover:shadow-md cursor-pointer ${
                  activeIndex === allocation.index 
                    ? 'border-primary/30 bg-primary/5 shadow-sm' 
                    : 'border-border/50 hover:border-primary/20'
                }`}
                onMouseEnter={() => setActiveIndex(allocation.index)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full border-2 border-background shadow-sm transition-transform group-hover:scale-110" 
                      style={{ backgroundColor: allocation.color }}
                    />
                    <div>
                      <span className="font-semibold text-sm text-foreground">
                        {allocation.name}
                      </span>
                      <div className="text-xs text-muted-foreground">
                        ${allocation.usdValue.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-foreground">
                      {allocation.value}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      allocation
                    </div>
                  </div>
                </div>
                <Progress 
                  value={allocation.value} 
                  className="h-2 transition-all duration-300" 
                  style={{
                    '--progress-background': allocation.color
                  } as React.CSSProperties}
                />
              </div>
            ))}
            
            {/* Summary Stats */}
            <div className="pt-4 border-t border-border/50 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Allocated:</span>
                <span className="font-semibold">{portfolioData.reduce((sum, item) => sum + item.value, 0)}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Available USDC:</span>
                <span className="font-semibold text-primary">{usdcBalanceFormatted}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Portfolio Value:</span>
                <span className="font-bold text-lg">${(totalAllocatedValue || parseFloat(usdcBalanceFormatted)).toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PortfolioOverview;
