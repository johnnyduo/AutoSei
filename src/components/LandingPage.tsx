import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ThemeToggle from '@/components/ThemeToggle';
import { 
  Rocket, 
  Wallet, 
  Bot, 
  TrendingUp, 
  Shield, 
  Star, 
  Globe,
  ChevronRight,
  Sparkles,
  Target,
  Zap,
  BarChart3,
  Users,
  Lock,
  ArrowRight,
  CheckCircle,
  Github,
  Twitter,
  MessageCircle
} from 'lucide-react';

interface LandingPageProps {
  onLaunchApp: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLaunchApp }) => {
  const [activeFeature, setActiveFeature] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const handleLaunchApp = async () => {
    setIsLoading(true);
    // Add a small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));
    onLaunchApp();
    setIsLoading(false);
  };

  const handleSocialClick = (platform: string) => {
    const urls = {
      github: 'https://github.com/johnnyduo/AutoSei',
      twitter: 'https://twitter.com/autosei',
      discord: 'https://discord.gg/autosei'
    };
    window.open(urls[platform as keyof typeof urls], '_blank', 'noopener,noreferrer');
  };

  const features = [
    {
      icon: Bot,
      title: 'AI Portfolio Navigator',
      description: 'Intelligent portfolio optimization with conversational AI interface',
      details: 'Get personalized allocation suggestions, risk assessments, and market insights through natural language conversations with our AI assistant.',
      color: 'from-blue-500 to-purple-500'
    },
    {
      icon: TrendingUp,
      title: 'Whale Activity Tracker',
      description: 'Monitor large transactions and market movements in real-time',
      details: 'Track whale activities, price impacts, and market movements with advanced analytics and predictive insights on the Sei EVM network.',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Shield,
      title: 'Smart Contract Integration',
      description: 'On-chain portfolio management with automated rebalancing',
      details: 'Secure smart contract-based portfolio management with 7 asset categories, risk-adjusted allocations, and automated rebalancing.',
      color: 'from-red-500 to-pink-500'
    },
    {
      icon: Star,
      title: 'Trading Strategies Hub',
      description: 'Access multiple trading strategies and market intelligence',
      details: 'Deploy various trading strategies including momentum, mean reversion, arbitrage, and yield farming with AI-powered signals.',
      color: 'from-yellow-500 to-orange-500'
    }
  ];

  const stats = [
    { value: '50+', label: 'Supported Tokens' },
    { value: '7', label: 'Asset Categories' },
    { value: '4+', label: 'Trading Strategies' },
    { value: 'Sei EVM', label: 'Native Network' }
  ];

  const benefits = [
    'Conversational AI interface - no technical expertise required',
    'On-chain portfolio management with smart contracts',
    'Real-time whale activity monitoring and market insights',
    'Multi-strategy trading with risk-adjusted allocations',
    '7 asset categories: AI, Meme, RWA, BigCap, DeFi, L1, Stablecoin',
    'Powered by Google Gemini 2.5 Pro and SeiTrace integration'
  ];

  return (
    <>
      <Helmet>
        <title>AutoSei - AI-Powered DeFi Portfolio Navigator for Sei EVM</title>
        <meta 
          name="description" 
          content="Intelligent DeFi portfolio navigator for Sei EVM network. AI-powered portfolio management, whale tracking, and conversational interface for optimal DeFi investments." 
        />
        <meta name="keywords" content="DeFi, Sei EVM, AI portfolio, whale tracker, portfolio management, smart contracts, cryptocurrency navigation" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Helmet>

      <div className="min-h-screen bg-background text-foreground">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-gradient-banner flex items-center justify-center">
                  <Rocket className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold cosmic-text">AutoSei</span>
              </div>
              <div className="flex items-center gap-4">
                <ThemeToggle />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleSocialClick('github')}
                  className="hover:bg-accent transition-colors"
                >
                  <Github className="w-4 h-4 mr-2" />
                  GitHub
                </Button>
                <Button 
                  onClick={handleLaunchApp} 
                  disabled={isLoading}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 border-primary hover:scale-105 transition-all"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Loading...
                    </>
                  ) : (
                    <>
                      Launch App
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="landing-hero py-20 relative">
          <div className="container mx-auto px-4 text-center relative z-10">
            <div className="max-w-4xl mx-auto">
              <Badge variant="secondary" className="mb-6 animate-pulse-glow">
                <Sparkles className="w-4 h-4 mr-2" />
                Powered by AI on Sei EVM Network
              </Badge>
              <h1 className="text-5xl md:text-7xl font-bold mb-6 cosmic-text">
                AI-Powered DeFi
                <br />
                Portfolio Navigator
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Navigate the Sei EVM ecosystem with intelligent portfolio management, whale tracking, 
                and conversational AI. Optimize your DeFi investments with smart contract automation 
                and real-time market intelligence.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Button 
                  size="lg" 
                  onClick={handleLaunchApp}
                  disabled={isLoading}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 border-primary text-lg px-8 py-6 animate-pulse-glow hover:scale-105 transition-all"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <Rocket className="w-5 h-5 mr-2" />
                      Launch Portfolio Navigator
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  onClick={() => handleSocialClick('discord')}
                  className="text-lg px-8 py-6 hover:bg-accent transition-colors"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Join Community
                </Button>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-3xl font-bold cosmic-text mb-2">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-muted/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Intelligent DeFi Features</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Comprehensive tools for navigating the Sei EVM ecosystem with AI-powered insights and automation
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {/* Feature List */}
              <div className="space-y-4">
                {features.map((feature, index) => (
                  <Card 
                    key={index}
                    className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                      activeFeature === index ? 'ring-2 ring-primary shadow-lg' : 'hover:ring-1 hover:ring-primary/50'
                    }`}
                    onClick={() => setActiveFeature(index)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg bg-gradient-to-r ${feature.color} text-white transition-transform ${
                          activeFeature === index ? 'scale-110' : 'group-hover:scale-105'
                        }`}>
                          <feature.icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                          <p className="text-muted-foreground mb-3">{feature.description}</p>
                          <p className="text-sm text-muted-foreground">{feature.details}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {/* Feature Visualization */}
              <div className="border border-border bg-card p-8 rounded-2xl animate-float">
                <div className="text-center mb-6">
                  <div className={`inline-flex p-4 rounded-full bg-gradient-to-r ${features[activeFeature].color} text-white mb-4`}>
                    {React.createElement(features[activeFeature].icon, { className: "w-12 h-12" })}
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{features[activeFeature].title}</h3>
                  <p className="text-muted-foreground">{features[activeFeature].description}</p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                    <span className="text-sm">AI Assistant</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium">Online</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                    <span className="text-sm">Portfolio Health</span>
                    <Badge variant="secondary">Optimized</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                    <span className="text-sm">Whale Activity</span>
                    <span className="text-sm font-medium text-blue-500">Monitoring</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold mb-4">Why Choose AutoSei?</h2>
                <p className="text-xl text-muted-foreground">
                  Built for the Sei EVM ecosystem with cutting-edge AI and blockchain technology.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-lg">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-banner text-white">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-4xl font-bold mb-6">Ready to Navigate DeFi?</h2>
              <p className="text-xl mb-8 opacity-90">
                Join the next generation of intelligent DeFi portfolio management on Sei EVM.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  onClick={handleLaunchApp}
                  disabled={isLoading}
                  className="bg-white text-black hover:bg-gray-100 text-lg px-8 py-6 hover:scale-105 transition-all"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 mr-2 animate-spin rounded-full border-2 border-black border-t-transparent" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5 mr-2" />
                      Launch Navigator Now
                    </>
                  )}
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  onClick={() => handleSocialClick('discord')}
                  className="border-white text-white hover:bg-white/10 text-lg px-8 py-6 transition-colors"
                >
                  <Users className="w-5 h-5 mr-2" />
                  Join Community
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 border-t border-border">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-gradient-banner flex items-center justify-center">
                  <Rocket className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold cosmic-text">AutoSei</span>
              </div>
              <p className="text-muted-foreground mb-6">
                AI-powered DeFi portfolio navigator for the Sei EVM network
              </p>
              <div className="flex justify-center gap-6 mb-6">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => handleSocialClick('twitter')}
                  className="hover:bg-accent transition-colors"
                >
                  <Twitter className="w-5 h-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => handleSocialClick('github')}
                  className="hover:bg-accent transition-colors"
                >
                  <Github className="w-5 h-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => handleSocialClick('discord')}
                  className="hover:bg-accent transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                © 2025 AutoSei. All rights reserved. 
                <br />
                DeFi investments carry risk. Always do your own research and never invest more than you can afford to lose.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default LandingPage;
