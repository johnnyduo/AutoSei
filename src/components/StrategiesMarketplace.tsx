import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from '@/hooks/use-toast';
import { 
  Search, 
  Star, 
  Download, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Shield, 
  Activity,
  Users,
  Zap,
  Award,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  DollarSign,
  Play,
  Settings,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Bot,
  Rocket,
  TestTube
} from 'lucide-react';
import { tradingBotService, type BotConfig, type StrategyType, type RiskLevel } from '@/services/tradingBotService';
import { strategyService, type StrategyDeployment } from '@/services/strategyService';
import { useUSDCBalance, formatUSDCAmount, payForStrategy, useUSDCInfo } from '@/lib/contractService';
import { useAccount, useConnect } from 'wagmi';

interface Strategy {
  id: string;
  name: string;
  description: string;
  creator: string;
  category: string;
  risk: 'low' | 'medium' | 'high';
  rating: number;
  reviews: number;
  users: number;
  performance: {
    monthly: number;
    quarterly: number;
    yearly: number;
    maxDrawdown: number;
    sharpeRatio: number;
    winRate: number;
  };
  features: string[];
  price: number;
  isPremium: boolean;
  tags: string[];
  minInvestment: number;
  timeframe: string;
  complexity: 'beginner' | 'intermediate' | 'advanced';
  backtestPeriod: string;
  strategyType: StrategyType;
  defaultConfig: Partial<BotConfig>;
  targetAssets: string[];
}

interface DeploymentState {
  isDeploying: boolean;
  step: 'config' | 'deploying' | 'complete';
  progress: number;
  error?: string;
}

const mockStrategies: Strategy[] = [
  {
    id: '1',
    name: 'Adaptive Grid Master',
    description: 'Dynamic grid trading with AI-powered interval adjustment based on market volatility and trend analysis',
    creator: 'AlgoMaster Pro',
    category: 'Grid Trading',
    risk: 'medium',
    rating: 4.8,
    reviews: 234,
    users: 1205,
    performance: {
      monthly: 8.4,
      quarterly: 24.7,
      yearly: 89.3,
      maxDrawdown: -5.2,
      sharpeRatio: 2.1,
      winRate: 72.3
    },
    features: [
      'AI-powered grid adjustment',
      'Multi-pair support',
      'Stop-loss protection',
      'Real-time optimization'
    ],
    price: 99,
    isPremium: true,
    tags: ['AI', 'Grid', 'Adaptive', 'Multi-pair'],
    minInvestment: 1000,
    timeframe: '24/7',
    complexity: 'intermediate',
    backtestPeriod: '2 years',
    strategyType: 'grid',
    targetAssets: ['BTC', 'ETH', 'SEI', 'USDC'],
    defaultConfig: {
      allocation: 1000,
      maxDrawdown: 5,
      stopLoss: 3,
      takeProfit: 8,
      interval: '1h',
      targetCategories: ['Large Cap', 'DeFi'],
      rebalanceThreshold: 0.05,
      maxPositionSize: 0.25
    }
  },
  {
    id: '2',
    name: 'DeFi Yield Maximizer',
    description: 'Automated yield farming strategy that finds and compounds the highest APY opportunities across protocols',
    creator: 'YieldNinja',
    category: 'Yield Farming',
    risk: 'low',
    rating: 4.6,
    reviews: 189,
    users: 856,
    performance: {
      monthly: 12.1,
      quarterly: 38.4,
      yearly: 145.2,
      maxDrawdown: -2.8,
      sharpeRatio: 3.4,
      winRate: 89.1
    },
    features: [
      'Auto-compounding',
      'Risk assessment',
      'Protocol diversification',
      'Gas optimization'
    ],
    price: 0,
    isPremium: false,
    tags: ['DeFi', 'Yield', 'Compound', 'Low-risk'],
    minInvestment: 500,
    timeframe: 'Daily rebalance',
    complexity: 'beginner',
    backtestPeriod: '18 months',
    strategyType: 'yield',
    targetAssets: ['USDC', 'USDT', 'SEI', 'ETH'],
    defaultConfig: {
      allocation: 500,
      maxDrawdown: 3,
      stopLoss: 2,
      takeProfit: 12,
      interval: '1d',
      targetCategories: ['Stablecoins', 'DeFi'],
      rebalanceThreshold: 0.1,
      maxPositionSize: 0.5
    }
  },
  {
    id: '3',
    name: 'Momentum Scalper Elite',
    description: 'High-frequency momentum trading with advanced technical indicators and machine learning predictions',
    creator: 'QuantumTrade',
    category: 'Scalping',
    risk: 'high',
    rating: 4.9,
    reviews: 156,
    users: 423,
    performance: {
      monthly: 15.7,
      quarterly: 52.3,
      yearly: 234.8,
      maxDrawdown: -12.4,
      sharpeRatio: 1.8,
      winRate: 64.2
    },
    features: [
      'ML predictions',
      'Sub-second execution',
      'Risk management',
      'Market scanning'
    ],
    price: 299,
    isPremium: true,
    tags: ['Scalping', 'ML', 'High-freq', 'Advanced'],
    minInvestment: 5000,
    timeframe: 'Seconds',
    complexity: 'advanced',
    backtestPeriod: '3 years',
    strategyType: 'momentum',
    targetAssets: ['BTC', 'ETH', 'SEI', 'ATOM'],
    defaultConfig: {
      allocation: 5000,
      maxDrawdown: 12,
      stopLoss: 5,
      takeProfit: 15,
      interval: '5m',
      targetCategories: ['Large Cap', 'High Vol'],
      rebalanceThreshold: 0.02,
      maxPositionSize: 0.2
    }
  },
  {
    id: '4',
    name: 'Cross-Chain Arbitrage',
    description: 'Exploits price differences across multiple blockchains and DEXs with automated execution',
    creator: 'BridgeBot',
    category: 'Arbitrage',
    risk: 'medium',
    rating: 4.4,
    reviews: 98,
    users: 267,
    performance: {
      monthly: 6.2,
      quarterly: 19.1,
      yearly: 78.4,
      maxDrawdown: -4.1,
      sharpeRatio: 2.3,
      winRate: 81.7
    },
    features: [
      'Cross-chain support',
      'MEV protection',
      'Flash loan integration',
      'Slippage optimization'
    ],
    price: 149,
    isPremium: true,
    tags: ['Arbitrage', 'Cross-chain', 'MEV', 'Flash-loans'],
    minInvestment: 2000,
    timeframe: 'Real-time',
    complexity: 'advanced',
    backtestPeriod: '1.5 years',
    strategyType: 'arbitrage',
    targetAssets: ['ETH', 'USDC', 'SEI', 'ATOM'],
    defaultConfig: {
      allocation: 2000,
      maxDrawdown: 4,
      stopLoss: 2,
      takeProfit: 6,
      interval: '1m',
      targetCategories: ['Cross-chain', 'Stablecoins'],
      rebalanceThreshold: 0.01,
      maxPositionSize: 0.3
    }
  },
  {
    id: '5',
    name: 'Smart DCA Pro',
    description: 'Intelligent dollar-cost averaging with dynamic intervals based on market conditions and volatility',
    creator: 'SteadyGains',
    category: 'DCA',
    risk: 'low',
    rating: 4.7,
    reviews: 312,
    users: 1567,
    performance: {
      monthly: 4.8,
      quarterly: 14.6,
      yearly: 58.2,
      maxDrawdown: -1.9,
      sharpeRatio: 2.8,
      winRate: 85.4
    },
    features: [
      'Dynamic intervals',
      'Volatility analysis',
      'Portfolio rebalancing',
      'Tax optimization'
    ],
    price: 49,
    isPremium: false,
    tags: ['DCA', 'Smart', 'Portfolio', 'Tax-friendly'],
    minInvestment: 100,
    timeframe: 'Weekly',
    complexity: 'beginner',
    backtestPeriod: '4 years',
    strategyType: 'dca',
    targetAssets: ['BTC', 'ETH', 'SEI'],
    defaultConfig: {
      allocation: 100,
      maxDrawdown: 2,
      stopLoss: 1,
      takeProfit: 5,
      interval: '1d',
      targetCategories: ['Large Cap'],
      rebalanceThreshold: 0.15,
      maxPositionSize: 0.4
    }
  },
  {
    id: '6',
    name: 'Portfolio Rebalancer Pro',
    description: 'Systematic portfolio rebalancing strategy with risk-adjusted allocations and trend analysis',
    creator: 'BalanceBot',
    category: 'Rebalancing',
    risk: 'medium',
    rating: 4.5,
    reviews: 127,
    users: 389,
    performance: {
      monthly: 7.3,
      quarterly: 22.4,
      yearly: 96.7,
      maxDrawdown: -6.8,
      sharpeRatio: 1.9,
      winRate: 76.2
    },
    features: [
      'Systematic rebalancing',
      'Risk analysis',
      'Trend following',
      'Portfolio optimization'
    ],
    price: 199,
    isPremium: true,
    tags: ['Rebalance', 'Portfolio', 'Risk', 'Systematic'],
    minInvestment: 1000,
    timeframe: 'Weekly',
    complexity: 'intermediate',
    backtestPeriod: '2.5 years',
    strategyType: 'rebalance',
    targetAssets: ['BTC', 'ETH', 'SEI', 'USDC', 'ATOM'],
    defaultConfig: {
      allocation: 1000,
      maxDrawdown: 7,
      stopLoss: 4,
      takeProfit: 10,
      interval: '1d',
      targetCategories: ['Large Cap', 'DeFi', 'Stablecoins'],
      rebalanceThreshold: 0.1,
      maxPositionSize: 0.3
    }
  }
];

const StrategiesMarketplace: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { data: usdcBalance, refetch: refetchBalance } = useUSDCBalance(address);
  const { symbol: usdcSymbol, decimals: usdcDecimals } = useUSDCInfo();
  
  const [strategies, setStrategies] = useState<Strategy[]>(mockStrategies);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRisk, setSelectedRisk] = useState('all');
  const [selectedComplexity, setSelectedComplexity] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);
  
  // Deployment states
  const [deploymentState, setDeploymentState] = useState<DeploymentState>({
    isDeploying: false,
    step: 'config',
    progress: 0
  });
  const [deploymentConfig, setDeploymentConfig] = useState<BotConfig>({
    allocation: 0,
    maxDrawdown: 5,
    stopLoss: 3,
    takeProfit: 8,
    interval: '1h',
    targetCategories: [],
    rebalanceThreshold: 0.05,
    maxPositionSize: 0.25
  });
  const [isDemo, setIsDemo] = useState(true);
  const [botName, setBotName] = useState('');
  
  // Payment states
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  
  // Strategy analytics
  const [strategyAnalytics, setStrategyAnalytics] = useState<Record<string, any>>({});

  const categories = [...new Set(strategies.map(s => s.category))];
  const risks = ['low', 'medium', 'high'];
  const complexities = ['beginner', 'intermediate', 'advanced'];

  // Get formatted USDC balance
  const getFormattedUSDCBalance = (): string => {
    if (!usdcBalance || !usdcDecimals) return '0';
    return formatUSDCAmount(usdcBalance, usdcDecimals);
  };

  // Check if user has enough USDC for strategy
  const hasEnoughUSDC = (strategyPrice: number): boolean => {
    if (!usdcBalance || !usdcDecimals) return false;
    const requiredAmount = BigInt(strategyPrice * 10**usdcDecimals);
    return usdcBalance >= requiredAmount;
  };

  // Load strategy analytics on component mount
  React.useEffect(() => {
    const analytics = strategyService.getAllAnalytics();
    setStrategyAnalytics(analytics);
  }, []);

  // Get real-time deployment count for a strategy
  const getStrategyDeploymentCount = (strategyId: string): number => {
    const analytics = strategyAnalytics[strategyId];
    return analytics?.activeDeployments || 0;
  };

  // Get total users (including base users + deployments)
  const getTotalUsers = (strategy: Strategy): number => {
    const deployments = getStrategyDeploymentCount(strategy.id);
    return strategy.users + deployments;
  };

  const filteredStrategies = strategies.filter(strategy => {
    const matchesSearch = strategy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         strategy.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         strategy.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || strategy.category === selectedCategory;
    const matchesRisk = selectedRisk === 'all' || strategy.risk === selectedRisk;
    const matchesComplexity = selectedComplexity === 'all' || strategy.complexity === selectedComplexity;
    
    return matchesSearch && matchesCategory && matchesRisk && matchesComplexity;
  });

  // Deployment functions
  const initializeDeployment = (strategy: Strategy) => {
    setSelectedStrategy(strategy);
    setDeploymentConfig({
      allocation: strategy.defaultConfig.allocation || strategy.minInvestment,
      maxDrawdown: strategy.defaultConfig.maxDrawdown || 5,
      stopLoss: strategy.defaultConfig.stopLoss || 3,
      takeProfit: strategy.defaultConfig.takeProfit || 8,
      interval: strategy.defaultConfig.interval || '1h',
      targetCategories: strategy.defaultConfig.targetCategories || [],
      rebalanceThreshold: strategy.defaultConfig.rebalanceThreshold || 0.05,
      maxPositionSize: strategy.defaultConfig.maxPositionSize || 0.25
    });
    setBotName(`${strategy.name} Bot`);
    setDeploymentState({
      isDeploying: false,
      step: 'config',
      progress: 0
    });
  };

  const deployStrategy = async () => {
    if (!selectedStrategy) return;
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to deploy strategies.",
        variant: "destructive"
      });
      return;
    }

    setDeploymentState({ 
      isDeploying: true, 
      step: 'deploying', 
      progress: 0 
    });
    setPaymentError(null);

    try {
      // Step 1: Handle strategy payment (if not free and not demo)
      if (selectedStrategy.price > 0 && !isDemo) {
        if (!hasEnoughUSDC(selectedStrategy.price)) {
          throw new Error(`Insufficient USDC balance. You need ${selectedStrategy.price} USDC but have ${getFormattedUSDCBalance()} USDC.`);
        }

        setDeploymentState(prev => ({ 
          ...prev, 
          progress: 10
        }));

        console.log('Processing USDC payment for strategy:', selectedStrategy.name, selectedStrategy.price);
        setIsProcessingPayment(true);
        
        // Process USDC payment
        const paymentResult = await payForStrategy(selectedStrategy.price);
        console.log('Payment successful:', paymentResult);
        
        setIsProcessingPayment(false);
        
        // Refresh USDC balance after payment
        refetchBalance();

        toast({
          title: "Payment Successful",
          description: `Paid ${selectedStrategy.price} USDC for ${selectedStrategy.name}`,
        });
      }

      // Step 2: Simulate deployment progress
      const progressSteps = [
        { progress: 30, message: 'Validating configuration...' },
        { progress: 50, message: 'Initializing trading bot...' },
        { progress: 70, message: 'Setting up strategy parameters...' },
        { progress: 90, message: isDemo ? 'Activating demo mode...' : 'Connecting to live trading...' },
        { progress: 100, message: 'Deployment complete!' }
      ];

      for (const step of progressSteps) {
        await new Promise(resolve => setTimeout(resolve, 800));
        setDeploymentState(prev => ({ 
          ...prev, 
          progress: step.progress 
        }));
      }

      // Step 3: Create the trading bot
      const newBot = await tradingBotService.createBot({
        name: botName,
        strategy: selectedStrategy.strategyType,
        description: `${selectedStrategy.name} - ${isDemo ? 'Demo Mode' : 'Live Trading'}`,
        riskLevel: selectedStrategy.risk as RiskLevel,
        targetAssets: selectedStrategy.targetAssets,
        config: deploymentConfig
      });

      // Step 4: Track strategy deployment
      const deployment: StrategyDeployment = {
        id: `deployment_${Date.now()}`,
        strategyId: selectedStrategy.id,
        strategyName: selectedStrategy.name,
        botId: newBot.id,
        deployedAt: new Date(),
        isDemo,
        status: 'active',
        totalReturn: 0,
        config: {
          allocation: deploymentConfig.allocation,
          maxDrawdown: deploymentConfig.maxDrawdown,
          stopLoss: deploymentConfig.stopLoss,
          takeProfit: deploymentConfig.takeProfit,
          interval: deploymentConfig.interval
        }
      };

      strategyService.saveDeployment(deployment);

      // Refresh analytics
      const updatedAnalytics = strategyService.getAllAnalytics();
      setStrategyAnalytics(updatedAnalytics);

      setDeploymentState({ 
        isDeploying: false, 
        step: 'complete', 
        progress: 100 
      });

      toast({
        title: "Strategy Deployed Successfully!",
        description: `${botName} has been created and ${isDemo ? 'is running in demo mode' : 'is ready for live trading'}.`,
      });

      // Reset after success
      setTimeout(() => {
        setSelectedStrategy(null);
        setDeploymentState({ 
          isDeploying: false, 
          step: 'config', 
          progress: 0 
        });
      }, 2000);

    } catch (error) {
      setIsProcessingPayment(false);
      const errorMessage = error instanceof Error ? error.message : 'Deployment failed';
      setPaymentError(errorMessage);
      
      setDeploymentState({
        isDeploying: false,
        step: 'config',
        progress: 0,
        error: errorMessage
      });
      
      toast({
        title: "Deployment Failed",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const runBacktest = async (strategy: Strategy) => {
    toast({
      title: "Backtest Started",
      description: `Running backtest for ${strategy.name} strategy...`,
    });
    
    // Simulate backtest with realistic results
    setTimeout(() => {
      const backtestResults = {
        duration: 30, // 30 days
        finalReturn: Math.random() * 20 - 5, // -5% to +15%
        maxDrawdown: Math.random() * -8, // 0% to -8%
        winRate: 60 + Math.random() * 30, // 60% to 90%
        sharpeRatio: 1 + Math.random() * 2 // 1 to 3
      };

      // Record backtest results
      strategyService.recordBacktest(strategy.id, backtestResults);

      toast({
        title: "Backtest Complete",
        description: `${strategy.name} backtest completed. Return: ${backtestResults.finalReturn.toFixed(2)}%, Win Rate: ${backtestResults.winRate.toFixed(1)}%`,
      });
    }, 3000);
  };

  const sortedStrategies = [...filteredStrategies].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'users':
        return b.users - a.users;
      case 'performance':
        return b.performance.yearly - a.performance.yearly;
      case 'price':
        return a.price - b.price;
      default:
        return 0;
    }
  });

  const getRiskBadge = (risk: Strategy['risk']) => {
    const riskConfig = {
      low: 'bg-green-500/20 text-green-400 border-green-500/30',
      medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      high: 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    
    return (
      <Badge className={`${riskConfig[risk]} border`}>
        {risk.toUpperCase()}
      </Badge>
    );
  };

  const getComplexityBadge = (complexity: Strategy['complexity']) => {
    const complexityConfig = {
      beginner: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      intermediate: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      advanced: 'bg-orange-500/20 text-orange-400 border-orange-500/30'
    };
    
    return (
      <Badge className={`${complexityConfig[complexity]} border`}>
        {complexity.toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold cosmic-text">Strategy Marketplace</h2>
          <p className="text-muted-foreground">Discover and deploy proven trading strategies</p>
        </div>
        <div className="flex items-center gap-3">
          {/* USDC Balance Display */}
          {isConnected && (
            <Card className="px-4 py-2 bg-primary/5 border-primary/20">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                  <DollarSign className="w-3 h-3 text-white" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">USDC Balance</p>
                  <p className="text-sm font-semibold">{getFormattedUSDCBalance()}</p>
                </div>
              </div>
            </Card>
          )}
          
          {/* Wallet Status */}
          {!isConnected ? (
            <Button 
              onClick={() => connectors[0] && connect({ connector: connectors[0] })}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Connect Wallet
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400"></div>
              <span className="text-sm text-muted-foreground">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </span>
            </div>
          )}
          
          <Badge className="bg-primary/20 text-primary border-primary/30">
            {filteredStrategies.length} Strategies Available
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card className="glass-panel p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search strategies, tags, or creators..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-background border-border pl-10"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="bg-background border-border w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedRisk} onValueChange={setSelectedRisk}>
              <SelectTrigger className="bg-background border-border w-32">
                <SelectValue placeholder="Risk" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risk</SelectItem>
                {risks.map(risk => (
                  <SelectItem key={risk} value={risk}>{risk}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedComplexity} onValueChange={setSelectedComplexity}>
              <SelectTrigger className="bg-background border-border w-40">
                <SelectValue placeholder="Complexity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                {complexities.map(complexity => (
                  <SelectItem key={complexity} value={complexity}>{complexity}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="bg-background border-border w-36">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Rating</SelectItem>
                <SelectItem value="users">Users</SelectItem>
                <SelectItem value="performance">Performance</SelectItem>
                <SelectItem value="price">Price</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Strategies Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {sortedStrategies.map((strategy) => (
          <Card key={strategy.id} className="strategy-card group">
            <CardHeader className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                      {strategy.name}
                    </h3>
                    {strategy.isPremium && (
                      <Badge className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 border-yellow-500/30">
                        <Award className="h-3 w-3 mr-1" />
                        Premium
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">by {strategy.creator}</p>
                  <p className="text-sm text-foreground/80 line-clamp-2">{strategy.description}</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getRiskBadge(strategy.risk)}
                  {getComplexityBadge(strategy.complexity)}
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium">{strategy.rating}</span>
                  <span className="text-xs text-muted-foreground">({strategy.reviews})</span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Performance Metrics */}
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <TrendingUp className="h-3 w-3 text-green-400" />
                    <span className="text-xs text-muted-foreground">Annual</span>
                  </div>
                  <p className="text-sm font-semibold text-green-400">
                    +{strategy.performance.yearly.toFixed(1)}%
                  </p>
                </div>
                <div className="text-center p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Target className="h-3 w-3 text-blue-400" />
                    <span className="text-xs text-muted-foreground">Win Rate</span>
                  </div>
                  <p className="text-sm font-semibold text-blue-400">
                    {strategy.performance.winRate.toFixed(1)}%
                  </p>
                </div>
                <div className="text-center p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <TrendingDown className="h-3 w-3 text-red-400" />
                    <span className="text-xs text-muted-foreground">Drawdown</span>
                  </div>
                  <p className="text-sm font-semibold text-red-400">
                    {strategy.performance.maxDrawdown.toFixed(1)}%
                  </p>
                </div>
              </div>

              {/* Features */}
              <div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {strategy.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {strategy.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{strategy.tags.length - 3}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  <span>{getTotalUsers(strategy).toLocaleString()} users</span>
                  {getStrategyDeploymentCount(strategy.id) > 0 && (
                    <Badge variant="outline" className="text-xs ml-1 bg-primary/10 text-primary">
                      +{getStrategyDeploymentCount(strategy.id)} active
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  <span>Min: ${strategy.minInvestment.toLocaleString()}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-primary">
                      {strategy.price === 0 ? 'Free' : `${strategy.price} USDC`}
                    </span>
                  </div>
                  {strategy.price > 0 && isConnected && (
                    <div className="flex items-center gap-1">
                      {hasEnoughUSDC(strategy.price) ? (
                        <Badge className="text-xs bg-green-500/20 text-green-400 border-green-500/30">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Sufficient Balance
                        </Badge>
                      ) : (
                        <Badge className="text-xs bg-red-500/20 text-red-400 border-red-500/30">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Insufficient USDC
                        </Badge>
                      )}
                    </div>
                  )}
                  {strategy.price > 0 && !isConnected && (
                    <Badge className="text-xs bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                      Connect wallet to check balance
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {/* Strategy Details Dialog */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          {strategy.name}
                          {strategy.isPremium && (
                            <Badge className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400">
                              <Award className="h-3 w-3 mr-1" />
                              Premium
                            </Badge>
                          )}
                        </DialogTitle>
                        <DialogDescription>
                          Detailed analysis and performance metrics for {strategy.name}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-semibold mb-3">Performance Metrics</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span>Monthly Return:</span>
                                <span className="text-green-400">+{strategy.performance.monthly}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Quarterly Return:</span>
                                <span className="text-green-400">+{strategy.performance.quarterly}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Annual Return:</span>
                                <span className="text-green-400">+{strategy.performance.yearly}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Sharpe Ratio:</span>
                                <span>{strategy.performance.sharpeRatio}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Win Rate:</span>
                                <span className="text-blue-400">{strategy.performance.winRate}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Max Drawdown:</span>
                                <span className="text-red-400">{strategy.performance.maxDrawdown}%</span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-3">Strategy Details</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span>Category:</span>
                                <span>{strategy.category}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Timeframe:</span>
                                <span>{strategy.timeframe}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Backtest Period:</span>
                                <span>{strategy.backtestPeriod}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Min Investment:</span>
                                <span>${strategy.minInvestment.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Complexity:</span>
                                <span className="capitalize">{strategy.complexity}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Creator:</span>
                                <span>{strategy.creator}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-3">Key Features</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {strategy.features.map((feature, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <Zap className="h-4 w-4 text-primary" />
                                <span className="text-sm">{feature}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-3">Target Assets</h4>
                          <div className="flex flex-wrap gap-2">
                            {strategy.targetAssets.map((asset, index) => (
                              <Badge key={index} variant="outline">
                                {asset}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline"
                            onClick={() => runBacktest(strategy)}
                          >
                            <TestTube className="h-4 w-4 mr-2" />
                            Run Backtest
                          </Button>
                          <Button 
                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                            onClick={() => initializeDeployment(strategy)}
                          >
                            <Rocket className="h-4 w-4 mr-2" />
                            Deploy Strategy
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* Quick Deploy Button */}
                  <Button 
                    size="sm" 
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => initializeDeployment(strategy)}
                  >
                    <Bot className="h-4 w-4 mr-2" />
                    Deploy
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Strategy Deployment Dialog */}
      {selectedStrategy && (
        <Dialog open={selectedStrategy !== null} onOpenChange={() => setSelectedStrategy(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                Deploy {selectedStrategy.name}
              </DialogTitle>
              <DialogDescription>
                Configure and deploy {selectedStrategy.name} as a trading bot
              </DialogDescription>
            </DialogHeader>
            
            {deploymentState.step === 'config' && (
              <div className="space-y-6">
                {/* Wallet Connection Check */}
                {!isConnected && (
                  <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-medium text-yellow-400">Wallet Required</h4>
                        <p className="text-sm text-yellow-300/80 mt-1">
                          Please connect your wallet to deploy strategies and handle payments.
                        </p>
                        <Button 
                          onClick={() => connectors[0] && connect({ connector: connectors[0] })}
                          className="mt-2 bg-yellow-500 text-yellow-950 hover:bg-yellow-400"
                          size="sm"
                        >
                          Connect Wallet
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Payment Information */}
                {selectedStrategy.price > 0 && isConnected && (
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Strategy Payment</Label>
                    <Card className="p-4 bg-blue-500/5 border-blue-500/20">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span>Strategy Price:</span>
                          <span className="font-semibold">{selectedStrategy.price} USDC</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Your USDC Balance:</span>
                          <span className="font-semibold">{getFormattedUSDCBalance()} USDC</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Status:</span>
                          {hasEnoughUSDC(selectedStrategy.price) ? (
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Ready to Pay
                            </Badge>
                          ) : (
                            <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Insufficient USDC
                            </Badge>
                          )}
                        </div>
                        {!hasEnoughUSDC(selectedStrategy.price) && (
                          <div className="pt-2 border-t border-blue-500/20">
                            <p className="text-xs text-muted-foreground">
                              You need {selectedStrategy.price - parseFloat(getFormattedUSDCBalance())} more USDC. 
                              Use the USDC faucet to get test tokens.
                            </p>
                          </div>
                        )}
                      </div>
                    </Card>
                  </div>
                )}

                {/* Payment Processing */}
                {isProcessingPayment && (
                  <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <div className="flex items-center gap-3">
                      <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
                      <div>
                        <h4 className="font-medium text-blue-400">Processing Payment</h4>
                        <p className="text-sm text-blue-300/80">
                          Transferring {selectedStrategy.price} USDC for strategy purchase...
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Payment Error */}
                {paymentError && (
                  <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-red-400">Payment Failed</h4>
                        <p className="text-sm text-red-300/80 mt-1">
                          {paymentError}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Mode Selection */}
                <div className="space-y-4">
                  <Label className="text-base font-semibold">Trading Mode</Label>
                  <RadioGroup 
                    value={isDemo ? 'demo' : 'live'} 
                    onValueChange={(value) => setIsDemo(value === 'demo')}
                  >
                    <div className="flex items-center space-x-2 p-4 rounded-lg border border-border">
                      <RadioGroupItem value="demo" id="demo" />
                      <div className="flex-1">
                        <Label htmlFor="demo" className="font-medium cursor-pointer">
                          Demo Mode (Paper Trading)
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Test the strategy with virtual funds. No real money at risk.
                          {selectedStrategy.price > 0 && ' Strategy payment still required.'}
                        </p>
                      </div>
                      <Badge className="bg-blue-500/20 text-blue-400">
                        <TestTube className="h-3 w-3 mr-1" />
                        Safe
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2 p-4 rounded-lg border border-border">
                      <RadioGroupItem value="live" id="live" />
                      <div className="flex-1">
                        <Label htmlFor="live" className="font-medium cursor-pointer">
                          Live Trading
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Deploy with real funds. Real profits and losses apply.
                        </p>
                      </div>
                      <Badge className="bg-red-500/20 text-red-400">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Risk
                      </Badge>
                    </div>
                  </RadioGroup>
                </div>

                {/* Bot Configuration */}
                <div className="space-y-4">
                  <Label className="text-base font-semibold">Bot Configuration</Label>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bot-name">Bot Name</Label>
                      <Input
                        id="bot-name"
                        value={botName}
                        onChange={(e) => setBotName(e.target.value)}
                        placeholder="Enter bot name"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="allocation">
                        Investment Amount ({isDemo ? 'Virtual' : 'Real'} $)
                      </Label>
                      <Input
                        id="allocation"
                        type="number"
                        value={deploymentConfig.allocation}
                        onChange={(e) => setDeploymentConfig(prev => ({
                          ...prev,
                          allocation: Number(e.target.value)
                        }))}
                        min={selectedStrategy.minInvestment}
                        placeholder={`Min: $${selectedStrategy.minInvestment}`}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="max-drawdown">Max Drawdown (%)</Label>
                      <Input
                        id="max-drawdown"
                        type="number"
                        value={deploymentConfig.maxDrawdown}
                        onChange={(e) => setDeploymentConfig(prev => ({
                          ...prev,
                          maxDrawdown: Number(e.target.value)
                        }))}
                        min={1}
                        max={50}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="stop-loss">Stop Loss (%)</Label>
                      <Input
                        id="stop-loss"
                        type="number"
                        value={deploymentConfig.stopLoss}
                        onChange={(e) => setDeploymentConfig(prev => ({
                          ...prev,
                          stopLoss: Number(e.target.value)
                        }))}
                        min={0.1}
                        max={20}
                        step={0.1}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="take-profit">Take Profit (%)</Label>
                      <Input
                        id="take-profit"
                        type="number"
                        value={deploymentConfig.takeProfit}
                        onChange={(e) => setDeploymentConfig(prev => ({
                          ...prev,
                          takeProfit: Number(e.target.value)
                        }))}
                        min={1}
                        max={100}
                        step={0.1}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="interval">Trading Interval</Label>
                      <Select 
                        value={deploymentConfig.interval} 
                        onValueChange={(value) => setDeploymentConfig(prev => ({
                          ...prev,
                          interval: value
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1m">1 Minute</SelectItem>
                          <SelectItem value="5m">5 Minutes</SelectItem>
                          <SelectItem value="15m">15 Minutes</SelectItem>
                          <SelectItem value="1h">1 Hour</SelectItem>
                          <SelectItem value="4h">4 Hours</SelectItem>
                          <SelectItem value="1d">1 Day</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Target Assets */}
                  <div className="space-y-2">
                    <Label>Target Assets</Label>
                    <div className="flex flex-wrap gap-2">
                      {selectedStrategy.targetAssets.map((asset, index) => (
                        <Badge key={index} variant="outline" className="text-sm">
                          {asset}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Risk Warning */}
                  {!isDemo && (
                    <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-yellow-400">Live Trading Warning</h4>
                          <p className="text-sm text-yellow-300/80 mt-1">
                            You are about to deploy a bot with real funds. Trading involves risk of loss. 
                            Only invest what you can afford to lose.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setSelectedStrategy(null)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={deployStrategy}
                    disabled={!botName || deploymentConfig.allocation < selectedStrategy.minInvestment}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {isDemo ? (
                      <>
                        <TestTube className="h-4 w-4 mr-2" />
                        Deploy Demo Bot
                      </>
                    ) : (
                      <>
                        <Rocket className="h-4 w-4 mr-2" />
                        Deploy Live Bot
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {deploymentState.step === 'deploying' && (
              <div className="space-y-6 text-center py-8">
                <div className="flex justify-center">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Deploying {selectedStrategy.name}</h3>
                  <p className="text-muted-foreground">
                    {isDemo ? 'Setting up demo environment...' : 'Connecting to live trading...'}
                  </p>
                </div>
                <div className="space-y-2">
                  <Progress value={deploymentState.progress} className="w-full" />
                  <p className="text-sm text-muted-foreground">
                    {deploymentState.progress}% complete
                  </p>
                </div>
              </div>
            )}

            {deploymentState.step === 'complete' && (
              <div className="space-y-6 text-center py-8">
                <div className="flex justify-center">
                  <CheckCircle className="h-12 w-12 text-green-400" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-green-400">
                    Deployment Successful!
                  </h3>
                  <p className="text-muted-foreground">
                    {botName} has been created and is {isDemo ? 'running in demo mode' : 'ready for live trading'}.
                  </p>
                </div>
                <div className="flex flex-col items-center gap-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                      <div className="font-medium text-green-400">Bot Name</div>
                      <div className="text-muted-foreground">{botName}</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <div className="font-medium text-blue-400">Mode</div>
                      <div className="text-muted-foreground">{isDemo ? 'Demo' : 'Live'}</div>
                    </div>
                  </div>
                  <Button 
                    onClick={() => {
                      setSelectedStrategy(null);
                      window.location.href = '#bots'; // Navigate to bots tab
                    }}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Activity className="h-4 w-4 mr-2" />
                    View Bot Dashboard
                  </Button>
                </div>
              </div>
            )}

            {deploymentState.error && (
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-red-400">Deployment Failed</h4>
                    <p className="text-sm text-red-300/80 mt-1">
                      {deploymentState.error}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default StrategiesMarketplace;