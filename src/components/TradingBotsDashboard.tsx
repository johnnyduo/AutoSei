import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
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
  ArrowDownRight,
  Plus,
  Trash2,
  Edit,
  MoreVertical,
  LineChart,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  TradingBot as ServiceTradingBot, 
  BotAnalytics, 
  TradeExecution,
  tradingBotService 
} from '@/services/tradingBotService';
import BotConfiguration from '@/components/BotConfiguration';

const TradingBotsDashboard: React.FC = () => {
  const [bots, setBots] = useState<ServiceTradingBot[]>([]);
  const [analytics, setAnalytics] = useState<BotAnalytics | null>(null);
  const [executions, setExecutions] = useState<TradeExecution[]>([]);
  const [selectedBot, setSelectedBot] = useState<ServiceTradingBot | null>(null);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isExecuting, setIsExecuting] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const { toast } = useToast();

  // Load data on mount
  useEffect(() => {
    loadData();
    
    // Set up periodic refresh for demo
    const interval = setInterval(() => {
      tradingBotService.simulateMarketUpdate();
      loadData();
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const loadData = () => {
    try {
      const botsData = tradingBotService.getBots();
      const analyticsData = tradingBotService.getAnalytics();
      const executionsData = tradingBotService.getExecutions();
      
      setBots(botsData);
      setAnalytics(analyticsData);
      setExecutions(executionsData);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast({
        title: 'Error loading data',
        description: 'Failed to load trading bot data. Please refresh the page.',
        variant: 'destructive'
      });
    }
  };

  const toggleBotStatus = async (botId: string) => {
    try {
      const updatedBot = tradingBotService.toggleBotStatus(botId);
      setBots(prev => prev.map(bot => bot.id === botId ? updatedBot : bot));
      
      toast({
        title: `Bot ${updatedBot.status}`,
        description: `${updatedBot.name} has been ${updatedBot.status}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to toggle bot status',
        variant: 'destructive'
      });
    }
  };

  const executeBot = async (botId: string) => {
    const bot = bots.find(b => b.id === botId);
    if (!bot) return;

    setIsExecuting(botId);
    try {
      const execution = await tradingBotService.executeBot(botId);
      
      // Refresh data
      loadData();
      
      toast({
        title: 'Bot executed successfully',
        description: `${bot.name} executed trade. ${execution.success ? 'Success!' : 'Failed'}`,
      });
    } catch (error) {
      toast({
        title: 'Execution failed',
        description: error instanceof Error ? error.message : 'Failed to execute bot',
        variant: 'destructive'
      });
    } finally {
      setIsExecuting(null);
    }
  };

  const deleteBot = (botId: string) => {
    try {
      tradingBotService.deleteBot(botId);
      setBots(prev => prev.filter(bot => bot.id !== botId));
      
      toast({
        title: 'Bot deleted',
        description: 'Trading bot has been successfully deleted',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete bot',
        variant: 'destructive'
      });
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    try {
      // Simulate real-time data update
      tradingBotService.simulateMarketUpdate();
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      loadData();
      
      toast({
        title: 'Data refreshed',
        description: 'Bot performance data has been updated',
      });
    } catch (error) {
      toast({
        title: 'Refresh failed',
        description: 'Failed to refresh data',
        variant: 'destructive'
      });
    } finally {
      setRefreshing(false);
    }
  };

  const handleBotSave = (savedBot: ServiceTradingBot) => {
    loadData(); // Reload all data
    setIsConfigOpen(false);
    setSelectedBot(null);
    
    toast({
      title: selectedBot ? 'Bot updated' : 'Bot created',
      description: `${savedBot.name} has been successfully ${selectedBot ? 'updated' : 'created'}`,
    });
  };

  const getStatusBadge = (status: ServiceTradingBot['status']) => {
    const statusConfig = {
      active: { 
        className: 'bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30', 
        icon: CheckCircle2 
      },
      inactive: { 
        className: 'bg-gray-500/20 border border-gray-500/30 text-gray-400 hover:bg-gray-500/30', 
        icon: Clock 
      },
      paused: { 
        className: 'bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/30', 
        icon: Pause 
      },
      error: { 
        className: 'bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30', 
        icon: AlertTriangle 
      }
    };
    
    const config = statusConfig[status];
    const Icon = config.icon;
    
    return (
      <Badge className={`${config.className} flex items-center gap-1 transition-all duration-200`}>
        <Icon className="h-3 w-3" />
        {status.toUpperCase()}
      </Badge>
    );
  };

  const getRiskBadge = (risk: ServiceTradingBot['riskLevel']) => {
    const riskConfig = {
      low: 'bg-green-500/20 border border-green-500/30 text-green-400',
      medium: 'bg-yellow-500/20 border border-yellow-500/30 text-yellow-400',
      high: 'bg-red-500/20 border border-red-500/30 text-red-400'
    };
    
    return (
      <Badge className={riskConfig[risk]}>
        {risk.toUpperCase()} RISK
      </Badge>
    );
  };

  const formatLastActive = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const strategyDisplayNames = {
    grid: 'Grid Trading',
    dca: 'Dollar Cost Averaging', 
    arbitrage: 'Cross-DEX Arbitrage',
    trend: 'Trend Following',
    momentum: 'Momentum Trading',
    rebalance: 'Portfolio Rebalance',
    yield: 'Yield Optimization'
  };

  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2">Loading trading bots...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="strategy-card performance-metric p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total P&L</p>
              <p className={`text-2xl font-bold ${analytics.totalProfitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ${analytics.totalProfitLoss.toFixed(2)}
              </p>
            </div>
            <div className={`p-3 rounded-full ${analytics.totalProfitLoss >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
              {analytics.totalProfitLoss >= 0 ? 
                <TrendingUp className="h-6 w-6 text-green-400" /> : 
                <TrendingDown className="h-6 w-6 text-red-400" />
              }
            </div>
          </div>
        </Card>

        <Card className="strategy-card performance-metric p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Bots</p>
              <p className="text-2xl font-bold text-primary">{analytics.activeBots}/{bots.length}</p>
            </div>
            <div className="p-3 rounded-full bg-primary/20">
              <Bot className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="strategy-card performance-metric p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Allocation</p>
              <p className="text-2xl font-bold text-foreground">${analytics.totalAllocation.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-500/20">
              <DollarSign className="h-6 w-6 text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="strategy-card performance-metric p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Avg Win Rate</p>
              <p className="text-2xl font-bold text-secondary">{analytics.avgWinRate.toFixed(1)}%</p>
            </div>
            <div className="p-3 rounded-full bg-secondary/20">
              <Target className="h-6 w-6 text-secondary" />
            </div>
          </div>
        </Card>
      </div>

      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold cosmic-text">🤖 Trading Bots</h2>
          <p className="text-muted-foreground">Automated trading strategies and portfolio management</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={refreshData} 
            disabled={refreshing}
            className="strategy-card border-[#FF5723]/30 hover:border-[#FF5723]/50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
            <DialogTrigger asChild>
              <Button 
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={() => {
                  setSelectedBot(null);
                  setIsConfigOpen(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Bot
              </Button>
            </DialogTrigger>
            <DialogContent 
              className="max-w-4xl max-h-[80vh] overflow-y-auto bg-background/95 backdrop-blur-sm border border-border/20 rounded-xl shadow-2xl"
              style={{ transform: 'none !important' }}
            >
              <DialogHeader>
                <DialogTitle>
                  {selectedBot ? 'Edit Trading Bot' : 'Create New Trading Bot'}
                </DialogTitle>
                <DialogDescription>
                  {selectedBot 
                    ? 'Modify your trading bot configuration and strategy settings.' 
                    : 'Configure a new automated trading bot with custom strategies and risk management.'
                  }
                </DialogDescription>
              </DialogHeader>
              <BotConfiguration
                bot={selectedBot || undefined}
                onSave={handleBotSave}
                onCancel={() => {
                  setIsConfigOpen(false);
                  setSelectedBot(null);
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="strategy-card p-1">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="history">Execution History</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Bot Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {bots.map((bot) => (
              <Card key={bot.id} className="strategy-card hover:border-[#FF5723]/40 transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg font-semibold text-foreground">{bot.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{strategyDisplayNames[bot.strategy]}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(bot.status)}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent 
                          className="bg-background/95 backdrop-blur-sm border border-border/20 rounded-xl shadow-xl"
                          style={{ transform: 'none !important' }}
                        >
                          <DialogHeader>
                            <DialogTitle>Bot Actions</DialogTitle>
                            <DialogDescription>
                              Choose an action to perform on this trading bot.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-3">
                            <Button
                              onClick={() => {
                                setSelectedBot(bot);
                                setIsConfigOpen(true);
                              }}
                              className="w-full justify-start"
                              variant="ghost"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Configuration
                            </Button>
                            <Button
                              onClick={() => executeBot(bot.id)}
                              disabled={bot.status !== 'active' || isExecuting === bot.id}
                              className="w-full justify-start"
                              variant="ghost"
                            >
                              <Play className="h-4 w-4 mr-2" />
                              {isExecuting === bot.id ? 'Executing...' : 'Execute Now'}
                            </Button>
                            <Button
                              onClick={() => deleteBot(bot.id)}
                              variant="ghost"
                              className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/20"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Bot
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{bot.description}</p>
                  
                  {/* Performance Metrics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">P&L</p>
                      <p className={`text-lg font-bold ${bot.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        ${bot.profitLoss.toFixed(2)}
                      </p>
                      <p className={`text-xs ${bot.profitLossPercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {bot.profitLossPercentage >= 0 ? '+' : ''}{bot.profitLossPercentage.toFixed(2)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Win Rate</p>
                      <p className="text-lg font-bold text-foreground">{bot.winRate.toFixed(1)}%</p>
                      <p className="text-xs text-muted-foreground">{bot.totalTrades} trades</p>
                    </div>
                  </div>

                  {/* Performance Bars */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Allocation</span>
                      <span className="text-foreground">${bot.allocation.toLocaleString()}</span>
                    </div>
                    <Progress 
                      value={(bot.allocation / analytics.totalAllocation) * 100} 
                      className="h-2 bg-muted"
                    />
                  </div>

                  {/* Risk and Assets */}
                  <div className="flex items-center justify-between">
                    {getRiskBadge(bot.riskLevel)}
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-muted-foreground">Assets:</span>
                      <span className="text-xs text-foreground">{bot.targetAssets.slice(0, 3).join(', ')}</span>
                      {bot.targetAssets.length > 3 && (
                        <span className="text-xs text-muted-foreground">+{bot.targetAssets.length - 3}</span>
                      )}
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#FF5723]/30">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={bot.status === 'active'}
                        onCheckedChange={() => toggleBotStatus(bot.id)}
                        disabled={isExecuting === bot.id}
                      />
                      <span className="text-sm text-muted-foreground">
                        {bot.status === 'active' ? 'Active' : 'Paused'}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Last active: {formatLastActive(bot.lastActive)}
                    </div>
                  </div>

                  <Button 
                    onClick={() => executeBot(bot.id)}
                    disabled={bot.status !== 'active' || isExecuting === bot.id}
                    className="w-full bg-[#FF5723]/20 hover:bg-[#FF5723]/30 text-[#FF5723] border border-[#FF5723]/30"
                    variant="outline"
                  >
                    {isExecuting === bot.id ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Executing...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Execute Now
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card className="strategy-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Execution History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {executions.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No execution history yet</p>
                  <p className="text-sm text-muted-foreground">Execute a bot to see the history here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {executions.slice(-10).reverse().map((execution) => {
                    const bot = bots.find(b => b.id === execution.botId);
                    return (
                      <div key={execution.id} className="flex items-center justify-between p-3 border border-[#FF5723]/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${execution.success ? 'bg-green-400' : 'bg-red-400'}`} />
                          <div>
                            <p className="font-medium text-foreground">{bot?.name || 'Unknown Bot'}</p>
                            <p className="text-sm text-muted-foreground">
                              {execution.type} • {execution.timestamp.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-medium ${execution.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {execution.profit >= 0 ? '+' : ''}${execution.profit.toFixed(2)}
                          </p>
                          <p className="text-sm text-muted-foreground">${execution.amount.toLocaleString()}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="strategy-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Performance Analytics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Trades</p>
                    <p className="text-2xl font-bold text-foreground">{analytics.totalTrades}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Best Performer</p>
                    <p className="text-sm font-medium text-green-400">
                      {analytics.bestPerformer?.name || 'N/A'}
                    </p>
                    {analytics.bestPerformer && (
                      <p className="text-xs text-green-400">
                        +{analytics.bestPerformer.profitLossPercentage.toFixed(2)}%
                      </p>
                    )}
                  </div>
                </div>
                
                {analytics.worstPerformer && (
                  <div>
                    <p className="text-sm text-muted-foreground">Needs Attention</p>
                    <p className="text-sm font-medium text-red-400">
                      {analytics.worstPerformer.name}
                    </p>
                    <p className="text-xs text-red-400">
                      {analytics.worstPerformer.profitLossPercentage.toFixed(2)}%
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="strategy-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5" />
                  Daily P&L Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics.dailyPnL.slice(-7).map((day, index) => (
                    <div key={day.date} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                      <span className={`text-sm font-medium ${day.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {day.pnl >= 0 ? '+' : ''}${day.pnl.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TradingBotsDashboard;