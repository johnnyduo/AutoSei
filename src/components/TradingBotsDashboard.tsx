import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { 
  Bot, 
  Play, 
  Pause, 
  Settings, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Zap,
  Activity,
  DollarSign,
  BarChart3,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TradingBot {
  id: string;
  name: string;
  strategy: string;
  status: 'active' | 'inactive' | 'paused' | 'error';
  profitLoss: number;
  profitLossPercentage: number;
  totalTrades: number;
  winRate: number;
  allocation: number;
  lastActive: string;
  description: string;
  riskLevel: 'low' | 'medium' | 'high';
  targetAssets: string[];
  performance24h: number;
  maxDrawdown: number;
}

const mockTradingBots: TradingBot[] = [
  {
    id: '1',
    name: 'Grid Trading Pro',
    strategy: 'Grid Trading',
    status: 'active',
    profitLoss: 2847.32,
    profitLossPercentage: 12.4,
    totalTrades: 156,
    winRate: 68.2,
    allocation: 15000,
    lastActive: '2 min ago',
    description: 'Automated grid trading strategy for sideways markets',
    riskLevel: 'medium',
    targetAssets: ['ETH', 'wBTC', 'USDC'],
    performance24h: 3.2,
    maxDrawdown: -4.8
  },
  {
    id: '2',
    name: 'DCA Maximizer',
    strategy: 'Dollar Cost Averaging',
    status: 'active',
    profitLoss: 1523.84,
    profitLossPercentage: 8.7,
    totalTrades: 89,
    winRate: 74.1,
    allocation: 12500,
    lastActive: '5 min ago',
    description: 'Smart DCA with dynamic intervals based on volatility',
    riskLevel: 'low',
    targetAssets: ['sIOTA', 'SMR', 'AVAX'],
    performance24h: 1.8,
    maxDrawdown: -2.1
  },
  {
    id: '3',
    name: 'Arbitrage Hunter',
    strategy: 'Cross-DEX Arbitrage',
    status: 'paused',
    profitLoss: 934.71,
    profitLossPercentage: 6.2,
    totalTrades: 203,
    winRate: 82.3,
    allocation: 8000,
    lastActive: '1 hour ago',
    description: 'Exploits price differences across multiple DEXs',
    riskLevel: 'high',
    targetAssets: ['USDT', 'USDC', 'DAI'],
    performance24h: -0.5,
    maxDrawdown: -8.3
  },
  {
    id: '4',
    name: 'Momentum Rider',
    strategy: 'Trend Following',
    status: 'active',
    profitLoss: -247.93,
    profitLossPercentage: -1.8,
    totalTrades: 67,
    winRate: 45.2,
    allocation: 10000,
    lastActive: '30 sec ago',
    description: 'Follows strong momentum signals with stop-loss protection',
    riskLevel: 'high',
    targetAssets: ['DEEP', 'FISH', 'BEAST'],
    performance24h: -2.1,
    maxDrawdown: -12.4
  },
  {
    id: '5',
    name: 'Yield Optimizer',
    strategy: 'Liquidity Farming',
    status: 'active',
    profitLoss: 4201.18,
    profitLossPercentage: 18.3,
    totalTrades: 34,
    winRate: 91.2,
    allocation: 25000,
    lastActive: '10 min ago',
    description: 'Automatically compounds yield farming rewards',
    riskLevel: 'medium',
    targetAssets: ['LUM', 'MLUM', 'FUSE'],
    performance24h: 4.7,
    maxDrawdown: -3.2
  }
];

const TradingBotsDashboard: React.FC = () => {
  const [bots, setBots] = useState<TradingBot[]>(mockTradingBots);
  const [selectedBot, setSelectedBot] = useState<TradingBot | null>(null);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  const totalProfitLoss = bots.reduce((sum, bot) => sum + bot.profitLoss, 0);
  const totalAllocation = bots.reduce((sum, bot) => sum + bot.allocation, 0);
  const activeBots = bots.filter(bot => bot.status === 'active').length;
  const avgWinRate = bots.reduce((sum, bot) => sum + bot.winRate, 0) / bots.length;

  const toggleBotStatus = (botId: string) => {
    setBots(prev => prev.map(bot => {
      if (bot.id === botId) {
        const newStatus = bot.status === 'active' ? 'paused' : 'active';
        toast({
          title: `Bot ${newStatus}`,
          description: `${bot.name} has been ${newStatus}`,
        });
        return { ...bot, status: newStatus };
      }
      return bot;
    }));
  };

  const refreshData = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Update some random values to simulate real-time data
    setBots(prev => prev.map(bot => ({
      ...bot,
      profitLoss: bot.profitLoss + (Math.random() - 0.5) * 100,
      performance24h: bot.performance24h + (Math.random() - 0.5) * 2,
      lastActive: bot.status === 'active' ? 'Just now' : bot.lastActive
    })));
    
    setRefreshing(false);
    toast({
      title: 'Data refreshed',
      description: 'Bot performance data has been updated',
    });
  };

  const getStatusBadge = (status: TradingBot['status']) => {
    const statusConfig = {
      active: { className: 'bot-status-active', icon: CheckCircle2 },
      inactive: { className: 'bot-status-inactive', icon: Clock },
      paused: { className: 'bg-yellow-500/20 border border-yellow-500/30 text-yellow-400', icon: Pause },
      error: { className: 'bg-red-500/20 border border-red-500/30 text-red-400', icon: AlertTriangle }
    };
    
    const config = statusConfig[status];
    const Icon = config.icon;
    
    return (
      <Badge className={`${config.className} flex items-center gap-1 micro-bounce`}>
        <Icon className="h-3 w-3" />
        {status.toUpperCase()}
      </Badge>
    );
  };

  const getRiskBadge = (risk: TradingBot['riskLevel']) => {
    const riskConfig = {
      low: 'bg-green-500/20 text-green-400 border-green-500/30',
      medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      high: 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    
    return (
      <Badge className={`${riskConfig[risk]} border`}>
        {risk.toUpperCase()} RISK
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-panel p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total P&L</p>
              <p className={`text-2xl font-bold ${totalProfitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ${totalProfitLoss.toFixed(2)}
              </p>
            </div>
            <div className={`p-3 rounded-full ${totalProfitLoss >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
              {totalProfitLoss >= 0 ? 
                <TrendingUp className="h-6 w-6 text-green-400" /> : 
                <TrendingDown className="h-6 w-6 text-red-400" />
              }
            </div>
          </div>
        </Card>

        <Card className="glass-panel p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Bots</p>
              <p className="text-2xl font-bold text-primary">{activeBots}/{bots.length}</p>
            </div>
            <div className="p-3 rounded-full bg-primary/20">
              <Bot className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="glass-panel p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Allocation</p>
              <p className="text-2xl font-bold text-foreground">${totalAllocation.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-full bg-cosmic-500/20">
              <DollarSign className="h-6 w-6 text-cosmic-500" />
            </div>
          </div>
        </Card>

        <Card className="glass-panel p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Avg Win Rate</p>
              <p className="text-2xl font-bold text-secondary">{avgWinRate.toFixed(1)}%</p>
            </div>
            <div className="p-3 rounded-full bg-secondary/20">
              <Target className="h-6 w-6 text-secondary" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Dashboard */}
      <Card className="glass-panel">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            Trading Bots Dashboard
          </CardTitle>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshData}
              disabled={refreshing}
              className="neuro-button"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
              <DialogTrigger asChild>
                <Button className="neuro-button">
                  <Settings className="h-4 w-4 mr-2" />
                  Configure Bot
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl glass-overlay">
                <DialogHeader>
                  <DialogTitle>Configure Trading Bot</DialogTitle>
                </DialogHeader>
                {/* Bot configuration form would go here */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Bot Name</Label>
                      <Input className="neuro-input" placeholder="Enter bot name" />
                    </div>
                    <div>
                      <Label>Strategy</Label>
                      <Select>
                        <SelectTrigger className="neuro-input">
                          <SelectValue placeholder="Select strategy" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="grid">Grid Trading</SelectItem>
                          <SelectItem value="dca">Dollar Cost Averaging</SelectItem>
                          <SelectItem value="arbitrage">Arbitrage</SelectItem>
                          <SelectItem value="trend">Trend Following</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>Allocation Amount: $5,000</Label>
                    <Slider defaultValue={[5000]} max={50000} step={1000} className="mt-2" />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsConfigOpen(false)}>
                      Cancel
                    </Button>
                    <Button className="neuro-button">
                      Create Bot
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {bots.map((bot) => (
              <div
                key={bot.id}
                className="glass-interactive p-6 rounded-xl cursor-pointer group"
                onClick={() => setSelectedBot(bot)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20">
                      <Bot className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                        {bot.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">{bot.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(bot.status)}
                    {getRiskBadge(bot.riskLevel)}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">P&L</p>
                    <p className={`font-semibold ${bot.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      ${bot.profitLoss.toFixed(2)}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      {bot.profitLossPercentage >= 0 ? 
                        <ArrowUpRight className="h-3 w-3 text-green-400" /> :
                        <ArrowDownRight className="h-3 w-3 text-red-400" />
                      }
                      <span className={`text-xs ${bot.profitLossPercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {bot.profitLossPercentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">Win Rate</p>
                    <p className="font-semibold">{bot.winRate.toFixed(1)}%</p>
                    <Progress value={bot.winRate} className="mt-1 h-1" />
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">Trades</p>
                    <p className="font-semibold">{bot.totalTrades}</p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">Allocation</p>
                    <p className="font-semibold">${bot.allocation.toLocaleString()}</p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">24h Performance</p>
                    <p className={`font-semibold ${bot.performance24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {bot.performance24h >= 0 ? '+' : ''}{bot.performance24h.toFixed(1)}%
                    </p>
                  </div>

                  <div className="flex items-center justify-end">
                    <Switch
                      checked={bot.status === 'active'}
                      onCheckedChange={() => toggleBotStatus(bot.id)}
                      className="neuro-button"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Assets:</span>
                    {bot.targetAssets.map((asset, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {asset}
                      </Badge>
                    ))}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Last active: {bot.lastActive}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TradingBotsDashboard;