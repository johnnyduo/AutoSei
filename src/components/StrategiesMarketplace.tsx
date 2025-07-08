import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  DollarSign
} from 'lucide-react';

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
    backtestPeriod: '2 years'
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
    backtestPeriod: '18 months'
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
    backtestPeriod: '3 years'
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
    backtestPeriod: '1.5 years'
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
    backtestPeriod: '4 years'
  },
  {
    id: '6',
    name: 'Options Wheel Strategy',
    description: 'Systematic options selling strategy generating income through covered calls and cash-secured puts',
    creator: 'OptionsGuru',
    category: 'Options',
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
      'Systematic execution',
      'Premium collection',
      'Delta hedging',
      'Risk monitoring'
    ],
    price: 199,
    isPremium: true,
    tags: ['Options', 'Income', 'Systematic', 'Hedging'],
    minInvestment: 10000,
    timeframe: 'Weekly',
    complexity: 'advanced',
    backtestPeriod: '2.5 years'
  }
];

const StrategiesMarketplace: React.FC = () => {
  const [strategies, setStrategies] = useState<Strategy[]>(mockStrategies);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRisk, setSelectedRisk] = useState('all');
  const [selectedComplexity, setSelectedComplexity] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);

  const categories = [...new Set(strategies.map(s => s.category))];
  const risks = ['low', 'medium', 'high'];
  const complexities = ['beginner', 'intermediate', 'advanced'];

  const filteredStrategies = strategies.filter(strategy => {
    const matchesSearch = strategy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         strategy.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         strategy.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || strategy.category === selectedCategory;
    const matchesRisk = selectedRisk === 'all' || strategy.risk === selectedRisk;
    const matchesComplexity = selectedComplexity === 'all' || strategy.complexity === selectedComplexity;
    
    return matchesSearch && matchesCategory && matchesRisk && matchesComplexity;
  });

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
        <div className="flex items-center gap-2">
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
                  <span>{strategy.users.toLocaleString()} users</span>
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  <span>Min: ${strategy.minInvestment.toLocaleString()}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-primary">
                    {strategy.price === 0 ? 'Free' : `$${strategy.price}`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 border-primary">
                        Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl glass-overlay">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          {strategy.name}
                          {strategy.isPremium && (
                            <Badge className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400">
                              Premium
                            </Badge>
                          )}
                        </DialogTitle>
                      </DialogHeader>
                      {/* Detailed strategy view would go here */}
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
                        <div className="flex justify-end gap-2">
                          <Button variant="outline">
                            Backtest
                          </Button>
                          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 border-primary">
                            <Download className="h-4 w-4 mr-2" />
                            Deploy Strategy
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 border-primary">
                    <Download className="h-4 w-4 mr-2" />
                    Deploy
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default StrategiesMarketplace;