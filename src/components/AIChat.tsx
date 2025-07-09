import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, User, BarChart2, ArrowRight, TrendingUp, Search, Shield, Target, ThumbsUp, MessageSquare, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import AdjustmentModal from './AdjustmentModal';
import { fetchTokenInsights } from '@/lib/tokenService';
import { generateChatResponse, isGeminiAvailable } from '@/lib/geminiService';
import { useAccount } from 'wagmi';
import { useBlockchain } from '@/contexts/BlockchainContext';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  content: string;
  timestamp: Date;
  action?: {
    type: string;
    description: string;
    changes?: {
      category: string;
      name: string;
      from: number;
      to: number;
    }[];
  };
}

// Storage key for chat messages in localStorage
const CHAT_STORAGE_KEY = 'autosei_chat_messages';
const USER_PREFERENCES_KEY = 'autosei_user_preferences';
const INTERACTION_PATTERNS_KEY = 'autosei_interaction_patterns';

// Utility function to generate unique message IDs
const generateUniqueMessageId = (prefix: string = 'msg'): string => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${performance.now().toString(36)}`;
};

// Chat analytics service for localStorage management
class ChatAnalyticsService {
  static saveMessage(message: ChatMessage): void {
    const messages = this.getMessages();
    
    // Check if message with this ID already exists to prevent duplicates
    const existingIndex = messages.findIndex(m => m.id === message.id);
    if (existingIndex >= 0) {
      // Update existing message instead of adding duplicate
      messages[existingIndex] = message;
    } else {
      // Add new message
      messages.push(message);
    }
    
    // Keep only last 100 messages to prevent localStorage bloat
    const recentMessages = messages.slice(-100);
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(recentMessages));
  }

  static getMessages(): ChatMessage[] {
    try {
      const saved = localStorage.getItem(CHAT_STORAGE_KEY);
      if (!saved) return [];
      
      const messages = JSON.parse(saved, (key, value) => {
        if (key === 'timestamp') return new Date(value);
        return value;
      });
      
      // Ensure all messages have unique IDs, remove duplicates
      const uniqueMessages = messages.filter((message: ChatMessage, index: number, array: ChatMessage[]) => 
        array.findIndex(m => m.id === message.id) === index
      );
      
      // If we found duplicates, update localStorage with cleaned data
      if (uniqueMessages.length !== messages.length) {
        console.warn('Found and removed duplicate messages from localStorage');
        localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(uniqueMessages));
      }
      
      return uniqueMessages;
    } catch (error) {
      console.error('Error loading chat messages:', error);
      // Clear corrupted localStorage
      localStorage.removeItem(CHAT_STORAGE_KEY);
      return [];
    }
  }

  static saveUserInteraction(actionType: string, accepted: boolean): void {
    try {
      const patterns = this.getInteractionPatterns();
      patterns.push({
        actionType,
        accepted,
        timestamp: new Date().toISOString(),
        userId: 'current_user'
      });
      // Keep only last 50 interactions
      const recentPatterns = patterns.slice(-50);
      localStorage.setItem(INTERACTION_PATTERNS_KEY, JSON.stringify(recentPatterns));
    } catch (error) {
      console.error('Error saving interaction pattern:', error);
    }
  }

  static getInteractionPatterns(): any[] {
    try {
      const saved = localStorage.getItem(INTERACTION_PATTERNS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading interaction patterns:', error);
      return [];
    }
  }

  static getUserPreferences(): any {
    try {
      const saved = localStorage.getItem(USER_PREFERENCES_KEY);
      return saved ? JSON.parse(saved) : {
        favoriteCategories: [],
        riskTolerance: 'medium',
        preferredActions: []
      };
    } catch (error) {
      console.error('Error loading user preferences:', error);
      return { favoriteCategories: [], riskTolerance: 'medium', preferredActions: [] };
    }
  }

  static saveUserPreferences(preferences: any): void {
    try {
      localStorage.setItem(USER_PREFERENCES_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error('Error saving user preferences:', error);
    }
  }
}

// Enhanced typing indicator component
const TypingIndicator = () => (
  <div className="flex justify-start">
    <div className="bg-cosmic-700 rounded-2xl p-4 max-w-[80%]">
      <div className="flex items-center mb-2">
        <div className="h-8 w-8 rounded-full bg-gradient-orange-coral flex items-center justify-center">
          <Bot className="h-4 w-4 animate-pulse" />
        </div>
        <span className="ml-2 font-medium text-sm">AutoSei Assistant</span>
        <Badge variant="outline" className="ml-auto text-xs bg-primary/10 text-primary border-primary/30">
          <Sparkles className="w-3 h-3 mr-1" />
          Analyzing
        </Badge>
      </div>
      <div className="flex items-center space-x-2">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <span className="text-xs text-muted-foreground ml-2">AutoSei is thinking...</span>
      </div>
    </div>
  </div>
);

// Interactive action button component
const ActionButton = ({ action, onClick, variant = 'outline' }: { action: any; onClick: () => void; variant?: string }) => {
  const getIcon = () => {
    switch (action.type) {
      case 'rebalance': return <BarChart2 className="w-4 h-4" />;
      case 'analysis': return <Search className="w-4 h-4" />;
      case 'trade': return <TrendingUp className="w-4 h-4" />;
      case 'protection': return <Shield className="w-4 h-4" />;
      default: return <ArrowRight className="w-4 h-4" />;
    }
  };

  const getButtonText = () => {
    switch (action.type) {
      case 'rebalance': return 'Apply Rebalancing';
      case 'analysis': return 'View Analysis';
      case 'trade': return 'Execute Trade';
      case 'protection': return 'Apply Protection';
      default: return action.description || 'Take Action';
    }
  };

  return (
    <Button 
      variant={variant as any}
      size="sm" 
      className="mt-3 group hover:scale-105 transition-all duration-200 bg-white/10 hover:bg-white/20 text-xs border-white/20"
      onClick={onClick}
    >
      {getIcon()}
      <span className="ml-2">{getButtonText()}</span>
      <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
    </Button>
  );
};

// Quick action panel for frequent operations
const QuickActionPanel = ({ onAction, onAIInsight, isGeminiEnabled }: { 
  onAction: (action: any) => void; 
  onAIInsight: () => void;
  isGeminiEnabled: boolean;
}) => {
  const quickActions = [
    { 
      id: 'optimize', 
      label: 'Optimize Portfolio', 
      icon: <Target className="w-4 h-4" />,
      color: 'bg-green-500/20 hover:bg-green-500/30 border-green-500/30',
      prompt: 'Please analyze my portfolio and suggest optimizations for better performance.'
    },
    { 
      id: 'risk', 
      label: 'Risk Assessment', 
      icon: <Shield className="w-4 h-4" />,
      color: 'bg-orange-500/20 hover:bg-orange-500/30 border-orange-500/30',
      prompt: 'Assess the risk level of my current portfolio and suggest improvements.'
    },
    { 
      id: 'trends', 
      label: 'Hot Trends', 
      icon: <TrendingUp className="w-4 h-4" />,
      color: 'bg-purple-500/20 hover:bg-purple-500/30 border-purple-500/30',
      prompt: 'What are the hottest trends and opportunities in crypto right now?'
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-2 p-4 border-t border-white/10">
      <div className="col-span-2 mb-2">
        <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">
          <Sparkles className="w-3 h-3 mr-1" />
          Quick Actions
        </Badge>
      </div>
      
      {/* First row - Optimize Portfolio and Risk Assessment */}
      <Button
        key={quickActions[0].id}
        variant="ghost"
        size="sm"
        className={`${quickActions[0].color} text-xs h-12 border transition-all duration-200 hover:scale-105`}
        onClick={() => onAction(quickActions[0])}
      >
        <div className="flex flex-col items-center gap-1">
          {quickActions[0].icon}
          <span className="text-xs font-medium">{quickActions[0].label}</span>
        </div>
      </Button>
      
      <Button
        key={quickActions[1].id}
        variant="ghost"
        size="sm"
        className={`${quickActions[1].color} text-xs h-12 border transition-all duration-200 hover:scale-105`}
        onClick={() => onAction(quickActions[1])}
      >
        <div className="flex flex-col items-center gap-1">
          {quickActions[1].icon}
          <span className="text-xs font-medium">{quickActions[1].label}</span>
        </div>
      </Button>
      
      {/* Second row - Hot Trends and AI Intelligence */}
      <Button
        key={quickActions[2].id}
        variant="ghost"
        size="sm"
        className={`${quickActions[2].color} text-xs h-12 border transition-all duration-200 hover:scale-105`}
        onClick={() => onAction(quickActions[2])}
      >
        <div className="flex flex-col items-center gap-1">
          {quickActions[2].icon}
          <span className="text-xs font-medium">{quickActions[2].label}</span>
        </div>
      </Button>
      
      {/* Dynamic AI Intelligence Button - same size as others */}
      <Button
        variant="ghost"
        size="sm"
        className="bg-blue-500/20 hover:bg-blue-500/30 border-blue-500/30 text-xs h-12 border transition-all duration-200 hover:scale-105"
        onClick={onAIInsight}
      >
        <div className="flex flex-col items-center gap-1">
          <BarChart2 className="w-4 h-4" />
          <span className="text-xs font-medium">
            {isGeminiEnabled ? 'AI Rebalance' : 'Trend Analysis'}
          </span>
        </div>
      </Button>
    </div>
  );
};

// Enhanced message bubble component
const MessageBubble = ({ message, onActionClick, onFeedback }: { 
  message: ChatMessage; 
  onActionClick: (action: any) => void;
  onFeedback: (messageId: string, helpful: boolean) => void;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  
  const handleFeedback = (helpful: boolean) => {
    onFeedback(message.id, helpful);
    setFeedbackGiven(true);
    
    // Save interaction pattern
    if (message.action) {
      ChatAnalyticsService.saveUserInteraction(message.action.type, helpful);
    }
  };

  return (
    <div 
      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`max-w-[80%] ${
        message.sender === 'user' 
          ? 'bg-gradient-to-r from-primary/90 to-primary text-primary-foreground' 
          : 'bg-card/80 backdrop-blur-sm border border-border/20'
      } rounded-2xl p-4 shadow-lg transition-all duration-200 ${
        isHovered ? 'shadow-xl transform scale-[1.02]' : ''
      }`}>
        {/* Message header with better styling and balanced layout */}
        <div className={`flex items-center ${message.sender === 'user' ? 'justify-between' : 'justify-start'} mb-2`}>
          <div className="flex items-center">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
              message.sender === 'user' 
                ? 'bg-white/20' 
                : 'bg-gradient-to-r from-primary to-primary/80'
            }`}>
              {message.sender === 'user' ? 
                <User className="h-4 w-4" /> : 
                <Bot className="h-4 w-4 text-white" />
              }
            </div>
            <span className="ml-2 font-medium text-sm">
              {message.sender === 'user' ? 'You' : 'AutoSei Assistant'}
            </span>
          </div>
          <Badge variant="outline" className={`text-xs ${
            message.sender === 'user' 
              ? 'bg-white/10 border-white/20 text-white/80' 
              : 'bg-background/50 border-border/30'
          } ${message.sender === 'user' ? 'ml-3' : 'ml-auto'}`}>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Badge>
        </div>
        
        {/* Enhanced message content */}
        <div className="text-sm whitespace-pre-wrap leading-relaxed">
          {message.content}
        </div>
        
        {/* Interactive action buttons */}
        {message.action && (
          <div className="mt-4 space-y-2">
            <ActionButton 
              action={message.action}
              onClick={() => onActionClick(message.action)}
              variant="outline"
            />
          </div>
        )}

        {/* Feedback buttons for AI messages */}
        {message.sender === 'ai' && (
          <div className="flex gap-2 mt-3 pt-2 border-t border-border/20">
            {!feedbackGiven ? (
              <>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="text-xs h-6 px-2 hover:bg-green-500/20"
                  onClick={() => handleFeedback(true)}
                >
                  <ThumbsUp className="w-3 h-3 mr-1" />
                  Helpful
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="text-xs h-6 px-2 hover:bg-blue-500/20"
                  onClick={() => handleFeedback(false)}
                >
                  <MessageSquare className="w-3 h-3 mr-1" />
                  More Info
                </Button>
              </>
            ) : (
              <Badge variant="outline" className="text-xs bg-green-500/10 text-green-400 border-green-500/30">
                Thanks for your feedback!
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Enhanced market intelligence data for AI suggestions with realistic allocation changes
const marketInsights = [
  {
    type: 'trending',
    content: "Based on on-chain data analysis, DEEP (AI) is showing a significant increase in whale accumulation. Three addresses have accumulated over $2.7M in the last 48 hours. Consider increasing your AI allocation by 5%.",
    action: {
      type: 'rebalance',
      description: 'Increase AI allocation based on whale accumulation data',
      changes: [
        { category: 'ai', name: 'AI & DeFi', from: 15, to: 20 },
        { category: 'meme', name: 'Meme & NFT', from: 10, to: 5 }
      ]
    }
  },
  {
    type: 'volume',
    content: "HODLHamster is experiencing abnormal trading volume, up 320% in the last 24 hours. Social sentiment analysis shows this meme coin trending across major platforms. Consider a small speculative position of 2%.",
    action: {
      type: 'trade',
      description: 'Add HODLHamster position based on volume and sentiment analysis',
      changes: [
        { category: 'meme', name: 'Meme & NFT', from: 10, to: 12 },
        { category: 'stablecoin', name: 'Stablecoins', from: 5, to: 3 }
      ]
    }
  },
  {
    type: 'news',
    content: "Breaking: ShimmerSea DEX volume has increased 78% following the SMR price rally. According to our technical analysis, the MLUM token is currently undervalued based on TVL metrics. Consider increasing your DeFi exposure.",
    action: {
      type: 'rebalance',
      description: 'Increase DeFi exposure based on ShimmerSea metrics',
      changes: [
        { category: 'defi', name: 'DeFi', from: 15, to: 18 },
        { category: 'stablecoin', name: 'Stablecoins', from: 5, to: 2 }
      ]
    }
  },
  {
    type: 'technical',
    content: "Technical analysis suggests wBTC is forming a bullish consolidation pattern with decreasing sell pressure. With traditional markets showing uncertainty, increasing your Bitcoin exposure may provide a hedge. Recommend 3% allocation shift from stablecoins to wBTC.",
    action: {
      type: 'rebalance',
      description: 'Shift allocation from stablecoins to Bitcoin based on technical analysis',
      changes: [
        { category: 'bigcap', name: 'Big Cap', from: 25, to: 28 },
        { category: 'stablecoin', name: 'Stablecoins', from: 5, to: 2 }
      ]
    }
  },
  {
    type: 'risk',
    content: "Risk assessment alert: Your portfolio exposure to meme tokens (22%) exceeds recommended thresholds. Consider rebalancing to reduce volatility, particularly with BEAST token showing signs of distribution by early investors.",
    action: {
      type: 'protection',
      description: 'Reduce meme token exposure to mitigate volatility risk',
      changes: [
        { category: 'meme', name: 'Meme & NFT', from: 22, to: 15 },
        { category: 'bigcap', name: 'Big Cap', from: 25, to: 28 },
        { category: 'stablecoin', name: 'Stablecoins', from: 5, to: 9 }
      ]
    }
  },
  {
    type: 'defi',
    content: "DeFi yield opportunities analysis: AAVE protocol has increased lending yields to 8.2% APY for stablecoins. Consider shifting 3% from your Layer 1 allocation to DeFi to capitalize on this yield opportunity.",
    action: {
      type: 'rebalance',
      description: 'Increase DeFi allocation to capture higher yields',
      changes: [
        { category: 'defi', name: 'DeFi', from: 15, to: 18 },
        { category: 'l1', name: 'Layer 1', from: 15, to: 12 }
      ]
    }
  },
  {
    type: 'layer1',
    content: "On-chain metrics for SMR are showing strong growth with daily active addresses up 34% this month. The upcoming protocol upgrade could drive further adoption. Consider increasing your Layer 1 exposure.",
    action: {
      type: 'rebalance',
      description: 'Increase Layer 1 allocation based on SMR metrics',
      changes: [
        { category: 'l1', name: 'Layer 1', from: 15, to: 18 },
        { category: 'rwa', name: 'RWA', from: 15, to: 12 }
      ]
    }
  },
  {
    type: 'rwa',
    content: "Real World Assets (RWA) tokens are showing increased institutional adoption. Tokenized real estate platform REALT has onboarded three new institutional investors. Consider increasing your RWA allocation for portfolio stability.",
    action: {
      type: 'rebalance',
      description: 'Increase RWA allocation for portfolio stability',
      changes: [
        { category: 'rwa', name: 'RWA', from: 15, to: 18 },
        { category: 'meme', name: 'Meme & NFT', from: 10, to: 7 }
      ]
    }
  },
  {
    type: 'bigcap',
    content: "Bitcoin's correlation with traditional markets has decreased to a 6-month low (0.32), suggesting improved diversification benefits. Consider increasing your Big Cap allocation as a hedge against market uncertainty.",
    action: {
      type: 'rebalance',
      description: 'Increase Bitcoin allocation as market hedge',
      changes: [
        { category: 'bigcap', name: 'Big Cap', from: 25, to: 30 },
        { category: 'meme', name: 'Meme & NFT', from: 10, to: 5 }
      ]
    }
  },
  {
    type: 'stablecoin',
    content: "Market volatility indicators are flashing warning signals with the Crypto Fear & Greed Index at 82 (Extreme Greed). Consider increasing your stablecoin reserves to prepare for potential market corrections.",
    action: {
      type: 'protection',
      description: 'Increase stablecoin reserves as volatility hedge',
      changes: [
        { category: 'stablecoin', name: 'Stablecoins', from: 5, to: 10 },
        { category: 'meme', name: 'Meme & NFT', from: 10, to: 5 }
      ]
    }
  },
  {
    type: 'balanced',
    content: "Portfolio analysis indicates your current allocation is suboptimal based on risk-adjusted return metrics. A more balanced approach across sectors could improve your Sharpe ratio by an estimated 0.4 points.",
    action: {
      type: 'rebalance',
      description: 'Optimize portfolio for better risk-adjusted returns',
      changes: [
        { category: 'ai', name: 'AI & DeFi', from: 15, to: 18 },
        { category: 'bigcap', name: 'Big Cap', from: 25, to: 28 },
        { category: 'meme', name: 'Meme & NFT', from: 10, to: 5 },
        { category: 'defi', name: 'DeFi', from: 15, to: 17 },
        { category: 'l1', name: 'Layer 1', from: 15, to: 12 },
        { category: 'rwa', name: 'RWA', from: 15, to: 15 },
        { category: 'stablecoin', name: 'Stablecoins', from: 5, to: 5 }
      ]
    }
  },
  {
    type: 'security',
    content: "Security analysis of your portfolio indicates high exposure to newer, less audited protocols. Consider shifting 5% from AI tokens to more established projects with stronger security track records.",
    action: {
      type: 'protection',
      description: 'Reduce exposure to less secure protocols',
      changes: [
        { category: 'ai', name: 'AI & DeFi', from: 15, to: 10 },
        { category: 'bigcap', name: 'Big Cap', from: 25, to: 30 }
      ]
    }
  },
  {
    type: 'regulatory',
    content: "Regulatory developments in the EU suggest increased scrutiny of meme tokens. To mitigate regulatory risk, consider reducing your meme token exposure and increasing allocation to compliant assets.",
    action: {
      type: 'protection',
      description: 'Reduce regulatory risk exposure',
      changes: [
        { category: 'meme', name: 'Meme & NFT', from: 10, to: 5 },
        { category: 'rwa', name: 'RWA', from: 15, to: 20 }
      ]
    }
  },
  {
    type: 'yield',
    content: "Yield analysis shows SMR staking returns have increased to 9.3% APY following the latest protocol upgrade. Consider increasing your Layer 1 allocation to capture these enhanced staking rewards.",
    action: {
      type: 'rebalance',
      description: 'Increase Layer 1 allocation for higher staking yields',
      changes: [
        { category: 'l1', name: 'Layer 1', from: 15, to: 20 },
        { category: 'stablecoin', name: 'Stablecoins', from: 5, to: 0 }
      ]
    }
  },
  {
    type: 'innovation',
    content: "The AI token sector is experiencing accelerated innovation with DEEP launching a new neural network marketplace. Early adopters could benefit from significant growth. Consider increasing your AI allocation.",
    action: {
      type: 'rebalance',
      description: 'Increase AI allocation to capture innovation growth',
      changes: [
        { category: 'ai', name: 'AI & DeFi', from: 15, to: 20 },
        { category: 'defi', name: 'DeFi', from: 15, to: 10 }
      ]
    }
  }
];

const AIChat = () => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [adjustmentOpen, setAdjustmentOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState<any>(null);
  const [isGeminiEnabled, setIsGeminiEnabled] = useState(false);
  const [userInteractionCount, setUserInteractionCount] = useState(0);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { isConnected, address } = useAccount();
  const { allocations, pendingAllocations } = useBlockchain();
  
  // Load chat messages from localStorage on component mount
  useEffect(() => {
    const savedMessages = ChatAnalyticsService.getMessages();
    
    if (savedMessages.length > 0) {
      // Ensure all messages have unique IDs and filter out any duplicates
      const uniqueMessages = savedMessages.filter((message, index, array) => 
        array.findIndex(m => m.id === message.id) === index
      );
      
      // If we found duplicates, clean up localStorage
      if (uniqueMessages.length !== savedMessages.length) {
        console.warn('Found duplicate messages in localStorage, cleaning up...');
        localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(uniqueMessages));
      }
      
      setMessages(uniqueMessages);
    } else {
      // If no saved messages, initialize with the default welcome message
      initializeDefaultMessage();
    }
  }, []);
  
  // Initialize with default welcome message
  const initializeDefaultMessage = () => {
    const welcomeMessage: ChatMessage = {
      id: generateUniqueMessageId('welcome'),
      sender: 'ai',
      content: 'Hello! I\'m your AutoSei assistant. I can help you manage your portfolio, provide market insights, and suggest optimal allocations. How can I assist you today?',
      timestamp: new Date(),
    };
    
    setMessages([welcomeMessage]);
    ChatAnalyticsService.saveMessage(welcomeMessage);
  };
  
  // Save messages to localStorage whenever they change (but don't save duplicates)
  useEffect(() => {
    if (messages.length > 1) { // Don't save just the welcome message
      // Only save new messages that aren't already in localStorage
      const savedMessages = ChatAnalyticsService.getMessages();
      const savedIds = new Set(savedMessages.map(m => m.id));
      
      messages.forEach(msg => {
        if (!savedIds.has(msg.id)) {
          ChatAnalyticsService.saveMessage(msg);
        }
      });
    }
  }, [messages]);
  
  // Auto-send an AI insight after component mount if there are few messages
  useEffect(() => {
    if (messages.length <= 1 && userInteractionCount === 0) {
      const timer = setTimeout(() => {
        const randomInsight = marketInsights[Math.floor(Math.random() * marketInsights.length)];
        triggerAIInsight(randomInsight);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [messages.length, userInteractionCount]);
  
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Check if Gemini API is available
  useEffect(() => {
    const checkGeminiAvailability = async () => {
      try {
        const available = await isGeminiAvailable();
        setIsGeminiEnabled(available);
      } catch (error) {
        console.error('Error checking Gemini availability:', error);
        setIsGeminiEnabled(false);
      }
    };
    
    checkGeminiAvailability();
  }, []);
  
  // Helper function to adapt AI suggestions to current portfolio allocations
  const adaptSuggestionToCurrentAllocations = useCallback((suggestion: any) => {
    if (!suggestion.action?.changes || !allocations.length) return suggestion;
    
    const currentAllocationMap = Object.fromEntries(
      allocations.map(a => [a.id, a.allocation])
    );
    
    // Create a deep copy of the suggestion
    const adaptedSuggestion = JSON.parse(JSON.stringify(suggestion));
    
    // Adapt the changes to current allocations
    adaptedSuggestion.action.changes = adaptedSuggestion.action.changes.map((change: any) => {
      const currentValue = currentAllocationMap[change.category] || change.from;
      const difference = change.to - change.from; // Original intended change
      
      return {
        ...change,
        from: currentValue,
        to: Math.max(0, Math.min(100, currentValue + difference)) // Ensure values are between 0-100
      };
    });
    
    return adaptedSuggestion;
  }, [allocations]);
  
  const triggerAIInsight = (insight: any) => {
    setIsTyping(true);
    
    // Adapt the insight to current allocations
    const adaptedInsight = adaptSuggestionToCurrentAllocations(insight);
    
    // Simulate AI working on analysis with more realistic timing
    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: generateUniqueMessageId('ai_insight'),
        sender: 'ai',
        content: `📊 **AI Market Intelligence Alert**\n\n${adaptedInsight.content}`,
        timestamp: new Date(),
        action: adaptedInsight.action
      };
      
      setMessages(prev => {
        const existsInCurrent = prev.some(m => m.id === aiMessage.id);
        if (existsInCurrent) {
          console.warn('Duplicate AI insight ID detected, regenerating:', aiMessage.id);
          aiMessage.id = generateUniqueMessageId('ai_insight_retry');
        }
        return [...prev, aiMessage];
      });
      ChatAnalyticsService.saveMessage(aiMessage);
      setIsTyping(false);
      
      // Show toast notification
      toast({
        title: "🎯 AI Portfolio Intelligence",
        description: "Analysis complete with actionable rebalancing suggestions",
      });
    }, 2000); // Increased to 2 seconds for better UX
  };
  
  // Function to get a random rule-based response when Gemini fails
  const getRandomRuleBasedResponse = (userMessage: string) => {
    // Analyze the user message for keywords to provide more relevant responses
    const lowerCaseMsg = userMessage.toLowerCase();
    
    // Check for specific topics in the user message
    if (lowerCaseMsg.includes('bitcoin') || lowerCaseMsg.includes('btc')) {
      return marketInsights.find(insight => insight.type === 'bigcap') || marketInsights[8];
    } else if (lowerCaseMsg.includes('ai') || lowerCaseMsg.includes('artificial intelligence')) {
      return marketInsights.find(insight => insight.type === 'innovation') || marketInsights[14];
    } else if (lowerCaseMsg.includes('defi') || lowerCaseMsg.includes('yield')) {
      return marketInsights.find(insight => insight.type === 'yield') || marketInsights[5];
    } else if (lowerCaseMsg.includes('risk') || lowerCaseMsg.includes('safe')) {
      return marketInsights.find(insight => insight.type === 'security') || marketInsights[11];
    } else if (lowerCaseMsg.includes('meme') || lowerCaseMsg.includes('nft')) {
      return marketInsights.find(insight => insight.type === 'risk') || marketInsights[4];
    } else if (lowerCaseMsg.includes('layer 1') || lowerCaseMsg.includes('l1') || lowerCaseMsg.includes('blockchain')) {
      return marketInsights.find(insight => insight.type === 'layer1') || marketInsights[6];
    } else if (lowerCaseMsg.includes('stable') || lowerCaseMsg.includes('usdt') || lowerCaseMsg.includes('usdc')) {
      return marketInsights.find(insight => insight.type === 'stablecoin') || marketInsights[9];
    } else if (lowerCaseMsg.includes('rwa') || lowerCaseMsg.includes('real world')) {
      return marketInsights.find(insight => insight.type === 'rwa') || marketInsights[7];
    }     else if (lowerCaseMsg.includes('rebalance') || lowerCaseMsg.includes('portfolio')) {
      return marketInsights.find(insight => insight.type === 'balanced') || marketInsights[10];
    } else if (lowerCaseMsg.includes('regulation') || lowerCaseMsg.includes('compliance')) {
      return marketInsights.find(insight => insight.type === 'regulatory') || marketInsights[12];
    }
    
    // If no specific topic is detected, return a random insight
    return marketInsights[Math.floor(Math.random() * marketInsights.length)];
  };
  
  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    const userMessage: ChatMessage = {
      id: generateUniqueMessageId('user'),
      sender: 'user',
      content: message,
      timestamp: new Date(),
    };
    
    setMessages(prev => {
      // Check if a message with this ID already exists
      const existsInCurrent = prev.some(m => m.id === userMessage.id);
      if (existsInCurrent) {
        console.warn('Duplicate message ID detected, regenerating:', userMessage.id);
        userMessage.id = generateUniqueMessageId('user_retry');
      }
      return [...prev, userMessage];
    });
    ChatAnalyticsService.saveMessage(userMessage);
    
    const currentMessage = message;
    setMessage('');
    setIsTyping(true);
    setUserInteractionCount(prev => prev + 1);
    
    // Process the AI response
    await processAIResponse(currentMessage);
  };
  
  const handleActionClick = async (action: any) => {
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to apply portfolio changes.",
      });
      return;
    }
    
    // Save user interaction
    ChatAnalyticsService.saveUserInteraction(action.type, true);
    
    if (action.changes) {
      // If the action has changes, we need to prepare them for the modal
      // First, get the current allocations from the blockchain context
      const currentAllocations = pendingAllocations || allocations;
      
      // Create a deep copy to avoid reference issues
      const currentAllocationsCopy = JSON.parse(JSON.stringify(currentAllocations));
      
      // For each change in the action, update the 'from' value to match current allocation
      const updatedChanges = action.changes.map((change: any) => {
        const currentAllocation = currentAllocationsCopy.find((a: any) => a.id === change.category);
        return {
          ...change,
          from: currentAllocation ? currentAllocation.allocation : change.from
        };
      });
      
      // Create an updated action with the correct 'from' values
      const updatedAction = {
        ...action,
        changes: updatedChanges
      };
      
      console.log('Setting current action for modal:', updatedAction);
      
      // Set the current action and open the modal
      setCurrentAction(updatedAction);
      setAdjustmentOpen(true);
    } else if (action.type === 'analysis') {
      toast({
        title: "📊 Analysis in Progress",
        description: "Generating detailed market analysis...",
      });
      
      // If it's a market analysis action, send another insight after a delay
      setTimeout(() => {
        const randomInsight = marketInsights[Math.floor(Math.random() * marketInsights.length)];
        const adaptedInsight = adaptSuggestionToCurrentAllocations(randomInsight);
        triggerAIInsight(adaptedInsight);
      }, 4000);
    } else {
      toast({
        title: "🚀 Action Triggered",
        description: action.description,
      });
    }
  };

  // Handle user feedback
  const handleFeedback = useCallback((messageId: string, helpful: boolean) => {
    const message = messages.find(m => m.id === messageId);
    if (message?.action) {
      ChatAnalyticsService.saveUserInteraction(message.action.type, helpful);
      
      // Update user preferences based on feedback
      const preferences = ChatAnalyticsService.getUserPreferences();
      if (helpful && message.action.type) {
        preferences.preferredActions.push(message.action.type);
      }
      ChatAnalyticsService.saveUserPreferences(preferences);
      
      toast({
        title: helpful ? "👍 Thanks for your feedback!" : "📝 Feedback noted",
        description: helpful 
          ? "We'll suggest similar insights in the future." 
          : "We'll improve our suggestions based on your feedback.",
      });
    }
  }, [messages]);

  // Handle quick actions - execute immediately for better UX
  const handleQuickAction = useCallback(async (action: any) => {
    // Create a user message for the action
    const userMessage: ChatMessage = {
      id: generateUniqueMessageId('user_quick'),
      sender: 'user',
      content: action.prompt,
      timestamp: new Date(),
    };
    
    setMessages(prev => {
      const existsInCurrent = prev.some(m => m.id === userMessage.id);
      if (existsInCurrent) {
        console.warn('Duplicate quick action message ID detected, regenerating:', userMessage.id);
        userMessage.id = generateUniqueMessageId('user_quick_retry');
      }
      return [...prev, userMessage];
    });
    
    ChatAnalyticsService.saveMessage(userMessage);
    setIsTyping(true);
    setUserInteractionCount(prev => prev + 1);
    
    // Process the quick action immediately
    await processAIResponse(action.prompt);
  }, []);

  // Handle AI Intelligence button click
  const handleAIInsight = useCallback(() => {
    if (isGeminiEnabled) {
      // Use Gemini to generate a personalized market intelligence alert with actionable suggestions
      const intelligencePrompts = [
        "Analyze current crypto market trends and provide a specific portfolio rebalancing recommendation with percentage allocations.",
        "Based on recent DeFi yield opportunities and market sentiment, suggest optimal portfolio adjustments with exact allocation changes.",
        "Review on-chain whale activity and market indicators to recommend strategic portfolio rebalancing for the next 30 days.",
        "Assess current market volatility and emerging trends to suggest defensive or aggressive portfolio rebalancing strategies.",
        "Evaluate recent protocol upgrades, token launches, and market momentum to provide actionable portfolio optimization recommendations."
      ];
      const randomPrompt = intelligencePrompts[Math.floor(Math.random() * intelligencePrompts.length)];
      handleQuickAction({ prompt: randomPrompt });
    } else {
      // Use rule-based insight with trend-based rebalancing suggestions
      const trendBasedInsights = marketInsights.filter(insight => 
        insight.action && insight.action.changes && insight.action.changes.length > 0
      );
      const randomInsight = trendBasedInsights[Math.floor(Math.random() * trendBasedInsights.length)];
      
      // Enhance the insight with trend-based language
      const enhancedInsight = {
        ...randomInsight,
        content: `📈 **Market Trend Analysis**\n\n${randomInsight.content}\n\n💡 **Recommended Action**: Apply the suggested rebalancing to capitalize on current market trends and optimize your portfolio performance.`,
        action: {
          ...randomInsight.action,
          type: 'rebalance',
          description: `Apply trend-based rebalancing - ${randomInsight.action.description}`
        }
      };
      
      triggerAIInsight(enhancedInsight);
    }
  }, [isGeminiEnabled, handleQuickAction]);

  // Extract AI response processing into a separate function for reuse
  const processAIResponse = async (messageContent: string) => {
    // Check if the message is asking about a specific token price
    const tokenPriceMatch = messageContent.toLowerCase().match(/price\s+of\s+([a-z0-9]+)|([a-z0-9]+)\s+price|about\s+([a-z0-9]+)/i);
    const tokenSymbol = tokenPriceMatch ? (tokenPriceMatch[1] || tokenPriceMatch[2] || tokenPriceMatch[3]).toUpperCase() : null;
    
    // If asking about a specific token and Gemini is enabled
    if (tokenSymbol && isGeminiEnabled) {
      try {
        // Fetch token insights
        const insights = await fetchTokenInsights(tokenSymbol);
        
        // Check if the response is an error message
        const isErrorResponse = insights.startsWith('Unable to retrieve token insights');
        
        const aiResponse: ChatMessage = {
          id: generateUniqueMessageId('ai_token'),
          sender: 'ai',
          content: insights,
          timestamp: new Date(),
        };
        
        setMessages(prev => {
          const existsInCurrent = prev.some(m => m.id === aiResponse.id);
          if (existsInCurrent) {
            console.warn('Duplicate AI token response ID detected, regenerating:', aiResponse.id);
            aiResponse.id = generateUniqueMessageId('ai_token_retry');
          }
          return [...prev, aiResponse];
        });
        ChatAnalyticsService.saveMessage(aiResponse);
        setIsTyping(false);
        
        // If we got an error response, also show a toast
        if (isErrorResponse) {
          toast({
            title: "⚠️ Gemini API Issue",
            description: "There was a problem with the Gemini API. Using fallback responses.",
          });
        }
        
        return;
      } catch (error) {
        console.error('Error fetching token insights:', error);
        // Fall back to pattern matching if API call fails
      }
    }
    
    // Try using Gemini for general chat responses
    if (isGeminiEnabled) {
      try {
        // Get last 5 messages for context
        const recentMessages = messages.slice(-5).map(msg => ({
          sender: msg.sender,
          content: msg.content
        }));
        
        // Generate response using Gemini
        const { content, action } = await generateChatResponse(messageContent, recentMessages);
        
        // If this is an AI Intelligence request, ensure we have actionable rebalancing suggestions
        const isIntelligenceRequest = messageContent.toLowerCase().includes('rebalancing') || 
                                    messageContent.toLowerCase().includes('portfolio') ||
                                    messageContent.toLowerCase().includes('allocation');
        
        // If action contains changes, adapt them to current allocations
        let adaptedAction = action;
        if (action?.changes) {
          adaptedAction = {
            ...action,
            changes: action.changes.map((change: any) => {
              const currentAllocation = allocations.find(a => a.id === change.category);
              const currentValue = currentAllocation ? currentAllocation.allocation : change.from;
              const difference = change.to - change.from; // Original intended change
              
              return {
                ...change,
                from: currentValue,
                to: Math.max(0, Math.min(100, currentValue + difference)) // Ensure values are between 0-100
              };
            })
          };
        } else if (isIntelligenceRequest && !action) {
          // If it's an intelligence request but no action was generated, create a default rebalancing action
          const randomTrendInsight = marketInsights[Math.floor(Math.random() * marketInsights.length)];
          adaptedAction = randomTrendInsight.action ? {
            type: 'rebalance',
            description: 'Apply AI-recommended trend-based portfolio rebalancing',
            changes: randomTrendInsight.action.changes
          } : null;
        }
        
        const aiResponse: ChatMessage = {
          id: generateUniqueMessageId('ai_gemini'),
          sender: 'ai',
          content: content,
          timestamp: new Date(),
          action: adaptedAction
        };
        
        setMessages(prev => {
          const existsInCurrent = prev.some(m => m.id === aiResponse.id);
          if (existsInCurrent) {
            console.warn('Duplicate AI Gemini response ID detected, regenerating:', aiResponse.id);
            aiResponse.id = generateUniqueMessageId('ai_gemini_retry');
          }
          return [...prev, aiResponse];
        });
        ChatAnalyticsService.saveMessage(aiResponse);
        setIsTyping(false);
        return;
      } catch (error) {
        console.error('Error generating chat response with Gemini:', error);
        
        // Show a toast notification about the API issue
        toast({
          title: "⚠️ Gemini API Issue",
          description: error instanceof Error 
            ? error.message 
            : "There was a problem with the Gemini API. Using fallback responses.",
          variant: "destructive"
        });
        
        // Fall back to rule-based responses
        const ruleBasedResponse = getRandomRuleBasedResponse(messageContent);
        const adaptedResponse = adaptSuggestionToCurrentAllocations(ruleBasedResponse);
        
        setTimeout(() => {
          const aiResponse: ChatMessage = {
            id: generateUniqueMessageId('ai_fallback'),
            sender: 'ai',
            content: `Based on your query, I've analyzed the current market conditions:\n\n${adaptedResponse.content}`,
            timestamp: new Date(),
            action: adaptedResponse.action
          };
          
          setMessages(prev => {
            const existsInCurrent = prev.some(m => m.id === aiResponse.id);
            if (existsInCurrent) {
              console.warn('Duplicate AI fallback response ID detected, regenerating:', aiResponse.id);
              aiResponse.id = generateUniqueMessageId('ai_fallback_retry');
            }
            return [...prev, aiResponse];
          });
          ChatAnalyticsService.saveMessage(aiResponse);
          setIsTyping(false);
        }, 1500);
        
        return;
      }
    }
    
    // Fallback to rule-based responses if Gemini is not enabled
    setTimeout(() => {
      const ruleBasedResponse = getRandomRuleBasedResponse(messageContent);
      const adaptedResponse = adaptSuggestionToCurrentAllocations(ruleBasedResponse);
      
      const aiResponse: ChatMessage = {
        id: generateUniqueMessageId('ai_rule'),
        sender: 'ai',
        content: `Based on your query, I've analyzed the current market conditions:\n\n${adaptedResponse.content}`,
        timestamp: new Date(),
        action: adaptedResponse.action
      };
      
      setMessages(prev => {
        const existsInCurrent = prev.some(m => m.id === aiResponse.id);
        if (existsInCurrent) {
          console.warn('Duplicate AI rule response ID detected, regenerating:', aiResponse.id);
          aiResponse.id = generateUniqueMessageId('ai_rule_retry');
        }
        return [...prev, aiResponse];
      });
      ChatAnalyticsService.saveMessage(aiResponse);
      setIsTyping(false);
    }, 1500);
  };

  // Personalized suggestions based on user history
  const getPersonalizedSuggestion = useCallback(() => {
    const patterns = ChatAnalyticsService.getInteractionPatterns();
    const preferences = ChatAnalyticsService.getUserPreferences();
    
    // Filter insights based on user preferences
    const acceptedActionTypes = patterns
      .filter(p => p.accepted)
      .map(p => p.actionType);
    
    const personalizedInsights = marketInsights.filter(insight => 
      acceptedActionTypes.includes(insight.type) || 
      preferences.preferredActions.includes(insight.type)
    );
    
    return personalizedInsights.length > 0 
      ? personalizedInsights[Math.floor(Math.random() * personalizedInsights.length)]
      : marketInsights[Math.floor(Math.random() * marketInsights.length)];
  }, []);
  
  return (
    <>
      <Card className="card-glass overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl flex items-center">
              <Bot className="mr-2 h-6 w-6 text-nebula-400" />
              AutoSei Assistant
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">
                <Sparkles className="w-3 h-3 mr-1" />
                {isGeminiEnabled ? 'AI Enhanced' : 'Rule-based'}
              </Badge>
              {userInteractionCount > 0 && (
                <Badge variant="outline" className="text-xs bg-green-500/10 text-green-400 border-green-500/30">
                  {userInteractionCount} interactions
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[400px] p-6" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  onActionClick={handleActionClick}
                  onFeedback={handleFeedback}
                />
              ))}
              {isTyping && <TypingIndicator />}
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter className="p-0">
          <div className="w-full">
            <QuickActionPanel 
              onAction={handleQuickAction} 
              onAIInsight={handleAIInsight}
              isGeminiEnabled={isGeminiEnabled}
            />
            <div className="flex w-full space-x-2 p-4 border-t border-[#ffffff1a]">
              <Input
                placeholder="Ask AutoSei assistant about market trends, tokens, or portfolio advice..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                className="input-dark"
                disabled={isTyping}
              />
              <Button 
                className="bg-gradient-button hover:opacity-90" 
                size="icon" 
                onClick={handleSendMessage}
                disabled={isTyping || !message.trim()}
              >
                {isTyping ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>

      <AdjustmentModal 
        open={adjustmentOpen} 
        onOpenChange={setAdjustmentOpen} 
        action={currentAction}
      />
    </>
  );
};

export default AIChat;