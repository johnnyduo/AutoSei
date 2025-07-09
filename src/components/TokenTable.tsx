import { useState, useEffect, useMemo } from 'react';
import { ArrowUpRight, ArrowDownRight, MoveVertical, RefreshCw, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationNext, 
  PaginationPrevious,
  PaginationLink
} from '@/components/ui/pagination';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { fetchTokenPrices, cacheTokenData, getCachedTokenData, TokenPrice, fetchTokenInsights } from '@/lib/tokenService';
import { isGeminiAvailable } from '@/lib/geminiService';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';

interface Token {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  tvl: number;
  volume: number;
  allocation: number;
  category: string;
}

const categoryColors: { [key: string]: string } = {
  meme: '#EC4899',     // Pink
  rwa: '#0EA5E9',      // Blue
  bigcap: '#10B981',   // Green
  defi: '#F97316',     // Orange
  l1: '#8B5CF6',       // Purple
  stablecoin: '#14B8A6', // Teal
  ai: '#D946EF'        // Magenta
};

// Updated token data based on the provided list
const mockTokens: Token[] = [
  { id: '1', name: 'SEI', symbol: 'SEI', price: 0.26, change24h: 2.3, tvl: 35200000, volume: 4500000, allocation: 15, category: 'l1' },
  { id: '2', name: 'Dragonswap Token', symbol: 'DRG', price: 0.041, change24h: 47.22, tvl: 296731.77, volume: 150000, allocation: 2, category: 'defi' },
  { id: '2', name: 'Wrapped SEI', symbol: 'WSEI', price: 0.26, change24h: 2.17, tvl: 14369779.25, volume: 3200000, allocation: 8, category: 'l1' },
  { id: '3', name: 'iSEI', symbol: 'iSEI', price: 0.27, change24h: 2.27, tvl: 5972607.56, volume: 1800000, allocation: 6, category: 'defi' },
  { id: '4', name: 'USDC', symbol: 'USDC', price: 1, change24h: 0, tvl: 5548483.47, volume: 1600000, allocation: 3, category: 'stablecoin' },
  { id: '5', name: 'fastUSD', symbol: 'fastUSD', price: 1, change24h: 0, tvl: 4080569.25, volume: 950000, allocation: 3, category: 'stablecoin' },
  { id: '6', name: 'Synnax Stablecoin', symbol: 'syUSD', price: 1, change24h: -0.28, tvl: 1379011.05, volume: 320000, allocation: 3, category: 'stablecoin' },
  { id: '7', name: 'Staked fastUSD', symbol: 'sfastUSD', price: 1.01, change24h: -0.07, tvl: 866612.14, volume: 200000, allocation: 3, category: 'stablecoin' },
  { id: '8', name: 'Wrapped BTC', symbol: 'WBTC', price: 108708.99, change24h: 0.84, tvl: 530062.77, volume: 850000, allocation: 10, category: 'bigcap' },
  { id: '9', name: 'USD₮0', symbol: 'USDT', price: 1, change24h: 0.2, tvl: 283219.92, volume: 65000, allocation: 3, category: 'stablecoin' },
  { id: '10', name: 'WETH', symbol: 'WETH', price: 2599.88, change24h: 2.46, tvl: 95178.47, volume: 180000, allocation: 9, category: 'bigcap' },
  { id: '11', name: 'SEIYAN', symbol: 'SEIYAN', price: 0.0038, change24h: -7.66, tvl: 58886.34, volume: 14000, allocation: 2, category: 'meme' },
  { id: '12', name: 'MILLI', symbol: 'MILLI', price: 0.05988, change24h: 12.36, tvl: 44648.77, volume: 11000, allocation: 2, category: 'meme' },
  { id: '13', name: 'Froggy', symbol: 'Frog', price: 0.00013, change24h: 1.25, tvl: 26773.1, volume: 6500, allocation: 2, category: 'meme' },
  { id: '14', name: 'Popo The Cat', symbol: 'POPO', price: 0.06411, change24h: -1.52, tvl: 19536.47, volume: 4800, allocation: 2, category: 'meme' },
  { id: '15', name: 'Shenron', symbol: 'SHENRN', price: 0.00035, change24h: -3.83, tvl: 19491.76, volume: 4700, allocation: 2, category: 'meme' },
  { id: '16', name: 'CHIP$ on SEI', symbol: 'CHIPS', price: 0.00015, change24h: 1.96, tvl: 17976.09, volume: 4200, allocation: 2, category: 'meme' },
  { id: '17', name: 'xSEIYAN', symbol: 'xSEIYAN', price: 0.0047, change24h: 0, tvl: 9397.05, volume: 2300, allocation: 2, category: 'meme' },
  { id: '18', name: 'Burger', symbol: 'SUPERSEIZ', price: 0.06326, change24h: 1.11, tvl: 8448.75, volume: 2100, allocation: 2, category: 'meme' },
  { id: '19', name: 'SEITAN', symbol: 'S8N', price: 0.00018, change24h: 1.36, tvl: 8064.71, volume: 1900, allocation: 2, category: 'meme' },
  { id: '20', name: 'Master', symbol: 'SENSEI', price: 0.04115, change24h: -11.92, tvl: 7980.64, volume: 1800, allocation: 2, category: 'meme' },
  { id: '21', name: 'USDT', symbol: 'kavaUSDT', price: 1, change24h: 0, tvl: 7558.24, volume: 1700, allocation: 3, category: 'stablecoin' },
  { id: '22', name: 'INSPECTOR', symbol: 'REX', price: 0.05981, change24h: 1.23, tvl: 6378.64, volume: 1500, allocation: 2, category: 'meme' },
  { id: '23', name: 'gonad', symbol: '$gonad', price: 0.04772, change24h: -16.97, tvl: 5514.3, volume: 1300, allocation: 2, category: 'meme' },
  { id: '24', name: 'SEIFUN', symbol: 'SFN', price: 0.04137, change24h: 29.08, tvl: 4348.01, volume: 1000, allocation: 2, category: 'meme' },
  { id: '25', name: 'Sei Less', symbol: 'LESS', price: 0.04398, change24h: -8.12, tvl: 4343.81, volume: 950, allocation: 2, category: 'meme' },
  { id: '26', name: 'Jelly', symbol: 'JELLY', price: 0.04120, change24h: 3.05, tvl: 3558.39, volume: 800, allocation: 2, category: 'meme' },
  { id: '27', name: 'SEIS AI', symbol: '$SEIS', price: 0.04198, change24h: -1.7, tvl: 3468.42, volume: 750, allocation: 2, category: 'ai' },
  { id: '28', name: 'Sei Dog', symbol: 'SDOG', price: 0.04111, change24h: 0, tvl: 3262.6, volume: 700, allocation: 2, category: 'meme' },
  { id: '29', name: 'Seibacca', symbol: 'SBC', price: 0.04295, change24h: -20.7, tvl: 2911.05, volume: 650, allocation: 2, category: 'meme' },
  { id: '30', name: 'BullionX Herd', symbol: 'BULLX', price: 0.04356, change24h: -19.89, tvl: 2831.37, volume: 600, allocation: 2, category: 'meme' },
  { id: '31', name: 'Frax Share', symbol: 'FXS', price: 1.91, change24h: 3.49, tvl: 2790.1, volume: 580, allocation: 4, category: 'defi' },
  { id: '32', name: 'WILSON', symbol: 'WILSON', price: 0.05854, change24h: -2.03, tvl: 2774.3, volume: 550, allocation: 2, category: 'meme' },
  { id: '33', name: 'Mushvro', symbol: 'VROS', price: 0.29, change24h: 0, tvl: 2754.7, volume: 520, allocation: 3, category: 'meme' },
  { id: '34', name: 'KOSEI', symbol: 'KOSEI', price: 0.05707, change24h: -15.51, tvl: 2631.74, volume: 500, allocation: 2, category: 'meme' },
  { id: '35', name: 'NAPCAT', symbol: 'NAPCAT', price: 0.05739, change24h: -4.55, tvl: 1942.93, volume: 450, allocation: 2, category: 'meme' },
  { id: '36', name: 'LORD SHISHO', symbol: 'SHISHO', price: 0.05275, change24h: -1.72, tvl: 1939.27, volume: 420, allocation: 2, category: 'meme' },
  { id: '37', name: 'SeiBallz', symbol: 'BALLZ', price: 0.00013, change24h: -28.06, tvl: 1836.46, volume: 400, allocation: 2, category: 'meme' },
  { id: '38', name: 'UMI', symbol: 'UMI', price: 0.05357, change24h: -1.33, tvl: 1744.89, volume: 380, allocation: 2, category: 'meme' },
  { id: '39', name: 'Jay jeo', symbol: 'JAYJEO', price: 0.05981, change24h: -0.62, tvl: 1734.29, volume: 360, allocation: 2, category: 'meme' },
  { id: '40', name: 'WAIT', symbol: 'WAIT', price: 0.05249, change24h: -30.9, tvl: 1519.58, volume: 340, allocation: 2, category: 'meme' },
  { id: '41', name: 'Happy Ape', symbol: 'HAPE', price: 0.05285, change24h: 0, tvl: 1511.63, volume: 320, allocation: 2, category: 'meme' },
  { id: '42', name: 'BOOBLE', symbol: 'BOOBLE', price: 0.04110, change24h: 0.89, tvl: 1476.32, volume: 300, allocation: 2, category: 'meme' },
  { id: '43', name: 'Goku', symbol: 'GOKU', price: 0.05238, change24h: -7.56, tvl: 1420.06, volume: 280, allocation: 2, category: 'meme' },
  { id: '44', name: 'POCHITA', symbol: 'POCHITA', price: 0.05689, change24h: -27.96, tvl: 1367.86, volume: 260, allocation: 2, category: 'meme' },
  { id: '45', name: 'OpenSei', symbol: 'OS', price: 0.05203, change24h: 0, tvl: 1361.31, volume: 240, allocation: 2, category: 'defi' },
  { id: '46', name: 'Spectre AI', symbol: 'SPECTRE', price: 0.05217, change24h: 0, tvl: 1349.77, volume: 220, allocation: 2, category: 'ai' },
  { id: '47', name: 'WARP', symbol: 'WARP', price: 0.05234, change24h: 0, tvl: 1345.14, volume: 200, allocation: 2, category: 'meme' },
  { id: '48', name: 'SEIYUN COIN', symbol: 'SEIYUN', price: 0.04172, change24h: -18.13, tvl: 1314.92, volume: 180, allocation: 2, category: 'meme' },
  { id: '49', name: 'Seiro', symbol: 'SEIRO', price: 0.05338, change24h: -3.17, tvl: 1311.58, volume: 160, allocation: 2, category: 'meme' },
  { id: '50', name: 'HARD.on.sei', symbol: 'HARD', price: 0.05531, change24h: -2.54, tvl: 1272.81, volume: 140, allocation: 2, category: 'meme' }
];

const ITEMS_PER_PAGE = 10;
const REFRESH_INTERVALS = {
  AUTO: 300000, // 5 minutes auto-refresh
  MANUAL: null  // Manual refresh only
};

const TokenTable = ({ category = "all" }: { category?: string }) => {
  const [sortField, setSortField] = useState<keyof Token>('allocation');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [liveTokenData, setLiveTokenData] = useState<TokenPrice[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshInterval, setRefreshInterval] = useState<number | null>(REFRESH_INTERVALS.AUTO);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [tokenInsight, setTokenInsight] = useState<string | null>(null);
  const [isInsightLoading, setIsInsightLoading] = useState(false);
  const [isGeminiEnabled, setIsGeminiEnabled] = useState(false);
  const { toast } = useToast();
  
  // Auto-refresh effect
  useEffect(() => {
    if (!refreshInterval) return;
    
    const intervalId = setInterval(() => {
      refreshTokenData();
    }, refreshInterval);
    
    return () => clearInterval(intervalId);
  }, [refreshInterval]);
  
  // Toggle auto-refresh
  const toggleAutoRefresh = () => {
    const newState = !autoRefreshEnabled;
    setAutoRefreshEnabled(newState);
    setRefreshInterval(newState ? REFRESH_INTERVALS.AUTO : REFRESH_INTERVALS.MANUAL);
    
    toast({
      title: newState ? 'Auto-refresh enabled' : 'Auto-refresh disabled',
      description: newState 
        ? 'Prices will update every 5 minutes' 
        : 'Prices will only update when you click refresh',
    });
  };
  
  // Fetch token prices on component mount
  useEffect(() => {
    const loadTokenData = async () => {
      // Check if we have cached data that's less than 5 minutes old
      const { data: cachedData, timestamp } = getCachedTokenData();
      const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
      
      if (cachedData.length > 0) {
        setLiveTokenData(cachedData);
        setLastUpdated(new Date(timestamp));
        
        // Only fetch new data if cached data is older than 5 minutes
        if (timestamp < fiveMinutesAgo) {
          await refreshTokenData(false); // Silent refresh
        }
        return;
      }
      
      // Otherwise fetch fresh data
      await refreshTokenData(false); // Silent refresh
    };
    
    loadTokenData();
  }, []);
  
  // Check if Gemini API is available
  useEffect(() => {
    setIsGeminiEnabled(typeof isGeminiAvailable === 'function' ? isGeminiAvailable() : false);
  }, []);

  // Function to fetch token insights
  const getTokenInsights = async (token: Token) => {
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

  // Function to refresh token data manually
  const refreshTokenData = async (showToast = true) => {
    setIsLoading(true);
    try {
      const data = await fetchTokenPrices();
      if (data.length > 0) {
        setLiveTokenData(data);
        cacheTokenData(data);
        setLastUpdated(new Date());
        
        if (showToast) {
          toast({
            title: 'Token prices updated',
            description: 'Latest market data has been loaded successfully.',
          });
        }
      }
    } catch (error: any) {
      console.error('Error refreshing token data:', error);
      
      // Handle rate limiting specifically
      if (error.response && error.response.status === 429) {
        toast({
          title: 'Rate limit exceeded',
          description: 'Please wait a moment before refreshing again.',
          variant: 'destructive',
        });
      } else if (showToast) {
        toast({
          title: 'Update failed',
          description: 'Could not refresh token prices. Please try again later.',
          variant: 'destructive',
        });
      }
      
      // If fetch fails but we have cached data, keep using it
      const { data: cachedData, timestamp } = getCachedTokenData();
      if (cachedData.length > 0 && !liveTokenData.length) {
        setLiveTokenData(cachedData);
        setLastUpdated(new Date(timestamp));
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Merge live token data with mock data
  const mergedTokenData = () => {
    if (liveTokenData.length === 0) return mockTokens;
    
    // Create a map of symbols to live data
    const liveDataMap = new Map(liveTokenData.map(token => [
      token.symbol.toUpperCase(),
      token
    ]));
    
    // Update mock tokens with live data where available
    return mockTokens.map(token => {
      const liveToken = liveDataMap.get(token.symbol.toUpperCase());
      if (liveToken) {
        return {
          ...token,
          price: liveToken.current_price,
          change24h: liveToken.price_change_percentage_24h,
          tvl: liveToken.market_cap,
          volume: liveToken.total_volume
        };
      }
      return token;
    });
  };
  
  // Filter tokens based on category
  const filteredTokens = useMemo(() => {
    return category === 'all' 
      ? mergedTokenData() 
      : mergedTokenData().filter(token => {
          const tokenCategories = token.category.split('/');
          return tokenCategories.some(cat => cat.toLowerCase() === category.toLowerCase());
        });
  }, [category, liveTokenData]);
  
  // Sort tokens based on current sort field and direction
  const sortedTokens = useMemo(() => {
    return [...filteredTokens].sort((a, b) => {
      if (sortDirection === 'asc') {
        return a[sortField] > b[sortField] ? 1 : -1;
      } else {
        return a[sortField] < b[sortField] ? 1 : -1;
      }
    });
  }, [filteredTokens, sortField, sortDirection]);

  const totalPages = Math.ceil(sortedTokens.length / ITEMS_PER_PAGE);
  const paginatedTokens = sortedTokens.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSort = (field: keyof Token) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };
  
  const formatNumber = (num: number) => {
    if (num >= 1000000000) {
      return `$${(num / 1000000000).toFixed(1)}B`;
    } else if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(1)}M`;
    } else {
      return `$${num.toLocaleString()}`;
    }
  };

  const getCategoryTitle = () => {
    switch(category) {
      case 'ai': return 'AI & DeFi Tokens';
      case 'meme': return 'Meme & NFT Tokens';
      case 'rwa': return 'Real World Assets';
      case 'bigcap': return 'Big Cap Tokens';
      case 'defi': return 'DeFi Protocols';
      case 'l1': return 'Layer 1 Protocols';
      case 'stablecoin': return 'Stablecoins';
      default: return 'All Tokens';
    }
  };

  const goToPreviousPage = () => {
    setCurrentPage(p => Math.max(1, p - 1));
  };

  const goToNextPage = () => {
    setCurrentPage(p => Math.min(totalPages, p + 1));
  };
  
    // Format the last updated time
    const getLastUpdatedText = () => {
      if (!lastUpdated) return 'Never updated';
      
      // If updated less than a minute ago, show "Just now"
      const secondsAgo = Math.floor((Date.now() - lastUpdated.getTime()) / 1000);
      if (secondsAgo < 60) return 'Just now';
      
      // If updated less than an hour ago, show minutes
      const minutesAgo = Math.floor(secondsAgo / 60);
      if (minutesAgo < 60) return `${minutesAgo} minute${minutesAgo === 1 ? '' : 's'} ago`;
      
      // Otherwise show the time
      return lastUpdated.toLocaleTimeString();
    };
    
    return (
      <>
        <Card className="card-glass">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{getCategoryTitle()}</CardTitle>
              <div className="flex items-center space-x-4 mt-1">
                {isGeminiEnabled && (
                  <p className="text-xs text-muted-foreground">
                    Click on any token to view AI-powered insights
                  </p>
                )}
                <div className="flex items-center text-xs text-muted-foreground">
                  <span className="mr-1">Powered by</span>
                  <span className="font-medium text-[#F97316]">DragonSwap</span>
                  <span className="ml-1 text-orange-500">🐉</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>{getLastUpdatedText()}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Last updated: {lastUpdated?.toLocaleString() || 'Never'}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-xs">Auto</span>
                <Switch 
                  checked={autoRefreshEnabled} 
                  onCheckedChange={toggleAutoRefresh} 
                  aria-label="Toggle auto-refresh"
                />
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => refreshTokenData(true)} 
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Updating...' : 'Refresh'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[150px]">Name</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="font-medium p-0" 
                        onClick={() => handleSort('change24h')}
                        aria-sort={sortField === 'change24h' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                      >
                        24h Change 
                        <MoveVertical className="ml-1 h-3 w-3" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">TVL</TableHead>
                    <TableHead className="text-right">Volume (24h)</TableHead>
                    <TableHead className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="font-medium p-0" 
                        onClick={() => handleSort('allocation')}
                        aria-sort={sortField === 'allocation' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                      >
                        Allocation
                        <MoveVertical className="ml-1 h-3 w-3" />
                      </Button>
                    </TableHead>
                  </TableRow>
                </TableHeader>
  
                <TableBody>
                  {paginatedTokens.map((token) => (
                    <TableRow 
                      key={token.id} 
                      className="cursor-pointer hover:bg-white/5"
                      onClick={() => getTokenInsights(token)}
                    >
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="h-8 w-8 rounded-full bg-gradient-orange-coral flex items-center justify-center">
                            <span className="font-medium text-xs">{token.symbol.substring(0, 2)}</span>
                          </div>
                          <div>
                            <div className="font-medium">{token.name}</div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-muted-foreground font-roboto-mono">{token.symbol}</span>
                              <span 
                                className="text-xs px-2 py-0.5 rounded-full font-medium"
                                style={{ 
                                  backgroundColor: `${categoryColors[token.category]}20`,
                                  color: categoryColors[token.category]
                                }}
                              >
                                {token.category.toUpperCase()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-roboto-mono">
                        ${token.price < 0.01 ? token.price.toFixed(6) : token.price.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className={`inline-flex items-center ${token.change24h > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {token.change24h > 0 ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                          <span className="font-roboto-mono">{token.change24h > 0 ? '+' : ''}{token.change24h.toFixed(2)}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-roboto-mono">
                        {formatNumber(token.tvl)}
                      </TableCell>
                      <TableCell className="text-right font-roboto-mono">
                        {formatNumber(token.volume)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge className="bg-gradient-button">{token.allocation}%</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  
                  {paginatedTokens.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No tokens found for this category
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
  
              {totalPages > 1 && (
                <div className="mt-4 flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        {currentPage === 1 ? (
                          <PaginationLink
                            aria-disabled="true"
                            className="opacity-50 pointer-events-none"
                          >
                            Previous
                          </PaginationLink>
                        ) : (
                          <PaginationPrevious onClick={goToPreviousPage} />
                        )}
                      </PaginationItem>
                      <PaginationItem>
                        <span className="px-4 py-2">
                          Page {currentPage} of {totalPages}
                        </span>
                      </PaginationItem>
                      <PaginationItem>
                        {currentPage === totalPages ? (
                          <PaginationLink
                            aria-disabled="true"
                            className="opacity-50 pointer-events-none"
                          >
                            Next
                          </PaginationLink>
                        ) : (
                          <PaginationNext onClick={goToNextPage} />
                        )}
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        {/* Token Insights Dialog */}
        <Dialog open={!!selectedToken} onOpenChange={(open) => !open && setSelectedToken(null)}>
          <DialogContent className="sm:max-w-[600px] bg-cosmic-900 border-cosmic-700">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                {selectedToken && (
                  <>
                    <div className="h-8 w-8 rounded-full bg-gradient-orange-coral flex items-center justify-center mr-2">
                      <span className="font-medium text-xs">{selectedToken.symbol.substring(0, 2)}</span>
                    </div>
                    {selectedToken.name} ({selectedToken.symbol}) Insights
                  </>
                )}
              </DialogTitle>
            </DialogHeader>
            <div className="py-4 px-2">
              {isInsightLoading ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin mb-4 text-nebula-400" />
                  <p className="text-muted-foreground">Generating AI insights...</p>
                </div>
              ) : tokenInsight ? (
                <div className="prose prose-invert max-w-none">
                  <div className="whitespace-pre-wrap">{tokenInsight}</div>
                </div>
              ) : (
                <p className="text-center text-muted-foreground">No insights available</p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  };
  
  export default TokenTable;