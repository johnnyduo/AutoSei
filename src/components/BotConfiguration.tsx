// src/components/BotConfiguration.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { 
  Bot, 
  TrendingUp, 
  Shield, 
  Target, 
  Clock, 
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Info
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { TradingBot, StrategyType, RiskLevel, tradingBotService } from '@/services/tradingBotService';

interface BotConfigurationProps {
  bot?: TradingBot;
  onSave: (bot: TradingBot) => void;
  onCancel: () => void;
}

const strategyDescriptions = {
  grid: {
    name: 'Grid Trading',
    description: 'Places buy and sell orders at regular intervals around the current price',
    riskLevel: 'medium',
    timeframe: '1h - 24h',
    bestFor: 'Sideways markets with high volatility'
  },
  dca: {
    name: 'Dollar Cost Averaging',
    description: 'Invests a fixed amount at regular intervals regardless of price',
    riskLevel: 'low',
    timeframe: '1d - 7d',
    bestFor: 'Long-term accumulation strategy'
  },
  arbitrage: {
    name: 'Cross-DEX Arbitrage',
    description: 'Exploits price differences across multiple decentralized exchanges',
    riskLevel: 'high',
    timeframe: '1m - 5m',
    bestFor: 'High-frequency trading with instant execution'
  },
  trend: {
    name: 'Trend Following',
    description: 'Follows momentum signals with technical indicators',
    riskLevel: 'high',
    timeframe: '15m - 4h',
    bestFor: 'Strong trending markets'
  },
  momentum: {
    name: 'Momentum Trading',
    description: 'Rides strong price movements with quick entry/exit',
    riskLevel: 'high',
    timeframe: '5m - 1h',
    bestFor: 'High volatility periods'
  },
  rebalance: {
    name: 'Portfolio Rebalance',
    description: 'Maintains target allocation percentages automatically',
    riskLevel: 'low',
    timeframe: '1d - 7d',
    bestFor: 'Passive portfolio management'
  },
  yield: {
    name: 'Yield Optimization',
    description: 'Automatically compounds DeFi yields and farming rewards',
    riskLevel: 'medium',
    timeframe: '6h - 24h',
    bestFor: 'DeFi yield farming strategies'
  }
};

const availableAssets = ['ETH', 'wBTC', 'USDC', 'USDT', 'SEI', 'SMR', 'AVAX', 'LUM', 'MLUM', 'FUSE', 'DAI', 'DEEP', 'FISH', 'BEAST'];

const BotConfiguration: React.FC<BotConfigurationProps> = ({ bot, onSave, onCancel }) => {
  const { toast } = useToast();
  const isEditing = !!bot;

  const [formData, setFormData] = useState({
    name: bot?.name || '',
    strategy: bot?.strategy || 'rebalance' as StrategyType,
    description: bot?.description || '',
    riskLevel: bot?.riskLevel || 'medium' as RiskLevel,
    allocation: bot?.allocation || 5000,
    targetAssets: bot?.targetAssets || ['ETH', 'USDC'],
    config: {
      allocation: bot?.allocation || 5000,
      maxDrawdown: bot?.config.maxDrawdown || 10,
      stopLoss: bot?.config.stopLoss || 5,
      takeProfit: bot?.config.takeProfit || 15,
      interval: bot?.config.interval || '1h',
      targetCategories: bot?.config.targetCategories || ['bigcap'],
      rebalanceThreshold: bot?.config.rebalanceThreshold || 5,
      maxPositionSize: bot?.config.maxPositionSize || 2000
    }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Bot name is required';
    }

    if (formData.allocation < 100) {
      newErrors.allocation = 'Minimum allocation is $100';
    }

    if (formData.allocation > 100000) {
      newErrors.allocation = 'Maximum allocation is $100,000';
    }

    if (formData.targetAssets.length === 0) {
      newErrors.targetAssets = 'At least one target asset is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors before saving',
        variant: 'destructive'
      });
      return;
    }

    try {
      let savedBot: TradingBot;

      if (isEditing && bot) {
        savedBot = {
          ...bot,
          ...formData,
          updatedAt: new Date()
        };
        tradingBotService.saveBot(savedBot);
      } else {
        savedBot = tradingBotService.createBot(formData);
      }

      onSave(savedBot);
      
      toast({
        title: isEditing ? 'Bot Updated' : 'Bot Created',
        description: `${formData.name} has been ${isEditing ? 'updated' : 'created'} successfully`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save bot',
        variant: 'destructive'
      });
    }
  };

  const toggleAsset = (asset: string) => {
    setFormData(prev => ({
      ...prev,
      targetAssets: prev.targetAssets.includes(asset)
        ? prev.targetAssets.filter(a => a !== asset)
        : [...prev.targetAssets, asset]
    }));
  };

  const selectedStrategy = strategyDescriptions[formData.strategy];

  return (
    <Card className="bg-background/95 backdrop-blur-sm border border-border/20 rounded-xl shadow-xl max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-6 w-6 text-primary" />
          {isEditing ? 'Edit Trading Bot' : 'Create Trading Bot'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Settings</TabsTrigger>
            <TabsTrigger value="strategy">Strategy Config</TabsTrigger>
            <TabsTrigger value="risk">Risk Management</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Bot Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., My Grid Bot"
                    className={`neuro-input ${errors.name ? 'border-red-500' : ''}`}
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your bot's purpose and strategy"
                    className="neuro-input"
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Allocation Amount *</Label>
                  <div className="space-y-2">
                    <Slider
                      value={[formData.allocation]}
                      onValueChange={(value) => setFormData(prev => ({ 
                        ...prev, 
                        allocation: value[0],
                        config: { ...prev.config, allocation: value[0] }
                      }))}
                      max={100000}
                      min={100}
                      step={100}
                      className="mt-2"
                    />
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-lg font-semibold">{formData.allocation.toLocaleString()}</span>
                    </div>
                  </div>
                  {errors.allocation && <p className="text-red-500 text-xs mt-1">{errors.allocation}</p>}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="strategy">Trading Strategy *</Label>
                  <Select
                    value={formData.strategy}
                    onValueChange={(value: StrategyType) => setFormData(prev => ({ ...prev, strategy: value }))}
                  >
                    <SelectTrigger className="neuro-input">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(strategyDescriptions).map(([key, strategy]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <span>{strategy.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {strategy.riskLevel}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Strategy Info Card */}
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 text-primary mt-0.5" />
                      <div className="space-y-2">
                        <h4 className="font-semibold text-primary">{selectedStrategy.name}</h4>
                        <p className="text-sm text-muted-foreground">{selectedStrategy.description}</p>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">
                            <Clock className="h-3 w-3 mr-1" />
                            {selectedStrategy.timeframe}
                          </Badge>
                          <Badge variant="outline">
                            <Shield className="h-3 w-3 mr-1" />
                            {selectedStrategy.riskLevel} risk
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          <strong>Best for:</strong> {selectedStrategy.bestFor}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div>
                  <Label>Risk Level</Label>
                  <Select
                    value={formData.riskLevel}
                    onValueChange={(value: RiskLevel) => setFormData(prev => ({ ...prev, riskLevel: value }))}
                  >
                    <SelectTrigger className="neuro-input">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          Low Risk
                        </div>
                      </SelectItem>
                      <SelectItem value="medium">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                          Medium Risk
                        </div>
                      </SelectItem>
                      <SelectItem value="high">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-red-500"></div>
                          High Risk
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div>
              <Label>Target Assets *</Label>
              <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 mt-2">
                {availableAssets.map(asset => (
                  <button
                    key={asset}
                    type="button"
                    onClick={() => toggleAsset(asset)}
                    className={`p-2 text-xs font-medium rounded-lg border transition-all ${
                      formData.targetAssets.includes(asset)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background hover:bg-muted border-border'
                    }`}
                  >
                    {asset}
                  </button>
                ))}
              </div>
              {errors.targetAssets && <p className="text-red-500 text-xs mt-1">{errors.targetAssets}</p>}
            </div>
          </TabsContent>

          <TabsContent value="strategy" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label>Execution Interval</Label>
                  <Select
                    value={formData.config.interval}
                    onValueChange={(value) => setFormData(prev => ({
                      ...prev,
                      config: { ...prev.config, interval: value }
                    }))}
                  >
                    <SelectTrigger className="neuro-input">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1m">1 Minute</SelectItem>
                      <SelectItem value="5m">5 Minutes</SelectItem>
                      <SelectItem value="15m">15 Minutes</SelectItem>
                      <SelectItem value="1h">1 Hour</SelectItem>
                      <SelectItem value="4h">4 Hours</SelectItem>
                      <SelectItem value="1d">1 Day</SelectItem>
                      <SelectItem value="7d">1 Week</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Rebalance Threshold: {formData.config.rebalanceThreshold}%</Label>
                  <Slider
                    value={[formData.config.rebalanceThreshold]}
                    onValueChange={(value) => setFormData(prev => ({
                      ...prev,
                      config: { ...prev.config, rebalanceThreshold: value[0] }
                    }))}
                    max={20}
                    min={1}
                    step={1}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Trigger rebalancing when allocation deviates by this percentage
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Max Position Size: ${formData.config.maxPositionSize.toLocaleString()}</Label>
                  <Slider
                    value={[formData.config.maxPositionSize]}
                    onValueChange={(value) => setFormData(prev => ({
                      ...prev,
                      config: { ...prev.config, maxPositionSize: value[0] }
                    }))}
                    max={formData.allocation}
                    min={100}
                    step={100}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Maximum amount to allocate to a single position
                  </p>
                </div>

                <div>
                  <Label>Target Categories</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {['bigcap', 'ai', 'defi', 'l1', 'rwa', 'meme', 'stablecoin'].map(category => (
                      <label key={category} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.config.targetCategories.includes(category)}
                          onChange={(e) => {
                            const categories = e.target.checked
                              ? [...formData.config.targetCategories, category]
                              : formData.config.targetCategories.filter(c => c !== category);
                            setFormData(prev => ({
                              ...prev,
                              config: { ...prev.config, targetCategories: categories }
                            }));
                          }}
                          className="rounded"
                        />
                        <span className="text-sm capitalize">{category}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="risk" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-red-500/5 border-red-500/20">
                <CardHeader>
                  <CardTitle className="text-red-400 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Risk Controls
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Stop Loss: {formData.config.stopLoss}%</Label>
                    <Slider
                      value={[formData.config.stopLoss]}
                      onValueChange={(value) => setFormData(prev => ({
                        ...prev,
                        config: { ...prev.config, stopLoss: value[0] }
                      }))}
                      max={20}
                      min={1}
                      step={0.5}
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Automatically stop trading if losses exceed this percentage
                    </p>
                  </div>

                  <div>
                    <Label>Max Drawdown: {formData.config.maxDrawdown}%</Label>
                    <Slider
                      value={[formData.config.maxDrawdown]}
                      onValueChange={(value) => setFormData(prev => ({
                        ...prev,
                        config: { ...prev.config, maxDrawdown: value[0] }
                      }))}
                      max={50}
                      min={5}
                      step={1}
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Maximum acceptable loss from peak portfolio value
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-green-500/5 border-green-500/20">
                <CardHeader>
                  <CardTitle className="text-green-400 flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Profit Targets
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Take Profit: {formData.config.takeProfit}%</Label>
                    <Slider
                      value={[formData.config.takeProfit]}
                      onValueChange={(value) => setFormData(prev => ({
                        ...prev,
                        config: { ...prev.config, takeProfit: value[0] }
                      }))}
                      max={100}
                      min={5}
                      step={1}
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Take profits when gains reach this percentage
                    </p>
                  </div>

                  <div className="p-4 bg-background rounded-lg">
                    <h4 className="font-medium mb-2">Risk Assessment</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Risk Level:</span>
                        <Badge variant={
                          formData.riskLevel === 'low' ? 'default' :
                          formData.riskLevel === 'medium' ? 'secondary' : 'destructive'
                        }>
                          {formData.riskLevel.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Max Loss:</span>
                        <span className="text-sm font-medium text-red-400">
                          ${(formData.allocation * formData.config.stopLoss / 100).toFixed(0)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Profit Target:</span>
                        <span className="text-sm font-medium text-green-400">
                          ${(formData.allocation * formData.config.takeProfit / 100).toFixed(0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-3 pt-6 border-t">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="neuro-button">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            {isEditing ? 'Update Bot' : 'Create Bot'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BotConfiguration;
