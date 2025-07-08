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
      github: 'https://github.com/autosei',
      twitter: 'https://twitter.com/autosei',
      discord: 'https://discord.gg/autosei'
    };
    window.open(urls[platform as keyof typeof urls], '_blank', 'noopener,noreferrer');
  };

  const features = [
    {
      icon: Bot,
      title: 'AI Trading Bots',
      description: 'Automated trading strategies powered by advanced AI algorithms',
      details: 'Deploy intelligent trading bots that analyze market conditions 24/7 and execute trades based on proven strategies.',
      color: 'from-blue-500 to-purple-500'
    },
    {
      icon: TrendingUp,
      title: 'Portfolio Analytics',
      description: 'Real-time performance tracking with detailed insights',
      details: 'Monitor your portfolio performance with comprehensive analytics, risk assessments, and actionable insights.',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Shield,
      title: 'Risk Management',
      description: 'Advanced security and risk assessment tools',
      details: 'Protect your investments with sophisticated risk management tools and security protocols.',
      color: 'from-red-500 to-pink-500'
    },
    {
      icon: Star,
      title: 'Strategy Marketplace',
      description: 'Discover and deploy proven trading strategies',
      details: 'Access a curated marketplace of battle-tested trading strategies from experienced traders.',
      color: 'from-yellow-500 to-orange-500'
    }
  ];

  const stats = [
    { value: '$10M+', label: 'Total Volume Traded' },
    { value: '500+', label: 'Active Traders' },
    { value: '25+', label: 'Trading Strategies' },
    { value: '99.9%', label: 'Uptime' }
  ];

  const benefits = [
    'No coding required - user-friendly interface',
    'Advanced AI algorithms for optimal performance',
    'Real-time market analysis and insights',
    'Comprehensive risk management tools',
    'Transparent fee structure with no hidden costs',
    '24/7 customer support and community'
  ];

  return (
    <>
      <Helmet>
        <title>AutoSei - AI-Powered DeFi Trading Platform for Sei EVM</title>
        <meta 
          name="description" 
          content="Revolutionary AI-powered DeFi investment platform for Sei EVM network. Automated trading, portfolio management, and advanced analytics." 
        />
        <meta name="keywords" content="DeFi, Sei EVM, AI trading, portfolio management, automated trading, cryptocurrency" />
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
                  className="neuro-button hover:scale-105 transition-all"
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
                The Future of
                <br />
                DeFi Trading
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Experience the next generation of decentralized finance with AI-powered trading bots, 
                advanced portfolio management, and real-time market analytics on the Sei EVM network.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Button 
                  size="lg" 
                  onClick={handleLaunchApp}
                  disabled={isLoading}
                  className="neuro-button text-lg px-8 py-6 animate-pulse-glow hover:scale-105 transition-all"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <Rocket className="w-5 h-5 mr-2" />
                      Launch Trading Platform
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
              <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Everything you need to succeed in DeFi trading, powered by cutting-edge AI technology
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
              <div className="glass-panel p-8 rounded-2xl animate-float">
                <div className="text-center mb-6">
                  <div className={`inline-flex p-4 rounded-full bg-gradient-to-r ${features[activeFeature].color} text-white mb-4`}>
                    {React.createElement(features[activeFeature].icon, { className: "w-12 h-12" })}
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{features[activeFeature].title}</h3>
                  <p className="text-muted-foreground">{features[activeFeature].description}</p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                    <span className="text-sm">AI Analysis</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium">Active</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                    <span className="text-sm">Risk Assessment</span>
                    <Badge variant="secondary">Low Risk</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                    <span className="text-sm">Performance</span>
                    <span className="text-sm font-medium text-green-500">+24.5%</span>
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
                  Built for traders, by traders. Experience the advantages of our platform.
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
              <h2 className="text-4xl font-bold mb-6">Ready to Start Trading?</h2>
              <p className="text-xl mb-8 opacity-90">
                Join thousands of traders who trust AutoSei for their DeFi investment needs.
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
                      Launch Platform Now
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
                AI-powered DeFi trading platform for the Sei EVM network
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
                All trading involves risk. Never invest more than you can afford to lose.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default LandingPage;
