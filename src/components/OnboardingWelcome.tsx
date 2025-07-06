import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Rocket, 
  Wallet, 
  Target, 
  Zap, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles,
  TrendingUp,
  Shield,
  Bot,
  Star,
  Globe,
  ChevronRight
} from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  completed: boolean;
  action?: string;
}

const OnboardingWelcome: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to AToIoTA',
      description: 'Your AI-powered DeFi investment portfolio navigator for the IOTA EVM network',
      icon: Rocket,
      completed: false,
      action: 'Get Started'
    },
    {
      id: 'connect',
      title: 'Connect Your Wallet',
      description: 'Connect your Web3 wallet to start managing your portfolio and access trading features',
      icon: Wallet,
      completed: false,
      action: 'Connect Wallet'
    },
    {
      id: 'explore',
      title: 'Explore Features',
      description: 'Discover our advanced trading bots, strategies marketplace, and AI-powered insights',
      icon: Target,
      completed: false,
      action: 'Start Exploring'
    }
  ];

  const [onboardingSteps, setOnboardingSteps] = useState(steps);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 2;
        if (newProgress >= 100) {
          clearInterval(timer);
          return 100;
        }
        return newProgress;
      });
    }, 50);

    return () => clearInterval(timer);
  }, [currentStep]);

  const nextStep = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setOnboardingSteps(prev => 
        prev.map((step, index) => 
          index === currentStep ? { ...step, completed: true } : step
        )
      );
      setCurrentStep(prev => prev + 1);
      setProgress(0);
    } else {
      completeOnboarding();
    }
  };

  const completeOnboarding = () => {
    setOnboardingSteps(prev => 
      prev.map(step => ({ ...step, completed: true }))
    );
    
    setTimeout(() => {
      setIsVisible(false);
      onComplete();
    }, 1000);
  };

  const skipOnboarding = () => {
    setIsVisible(false);
    onComplete();
  };

  const features = [
    {
      icon: Bot,
      title: 'AI Trading Bots',
      description: 'Automated trading with intelligent strategies'
    },
    {
      icon: TrendingUp,
      title: 'Portfolio Analytics',
      description: 'Real-time performance tracking and insights'
    },
    {
      icon: Shield,
      title: 'Risk Management',
      description: 'Advanced security and risk assessment tools'
    },
    {
      icon: Star,
      title: 'Strategy Marketplace',
      description: 'Discover and deploy proven trading strategies'
    }
  ];

  if (!isVisible) return null;

  return (
    <Dialog open={isVisible} onOpenChange={() => {}}>
      <DialogContent className="max-w-4xl border-none p-0 bg-transparent">
        <div className="clay-card p-8 mx-auto max-w-3xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 mb-4 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 animate-pulse-glow">
              <Sparkles className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-4xl font-bold cosmic-text mb-2">Welcome to AToIoTA</h1>
            <p className="text-lg text-muted-foreground">
              AI-powered DeFi investment portfolio navigator for IOTA EVM
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            {onboardingSteps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center">
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300
                    ${index === currentStep 
                      ? 'border-primary bg-primary/20 animate-pulse-glow' 
                      : step.completed 
                        ? 'border-green-400 bg-green-400/20' 
                        : 'border-muted bg-muted/20'
                    }
                  `}>
                    {step.completed ? (
                      <CheckCircle2 className="w-6 h-6 text-green-400" />
                    ) : (
                      <step.icon className={`w-6 h-6 ${index === currentStep ? 'text-primary' : 'text-muted-foreground'}`} />
                    )}
                  </div>
                  <span className={`text-sm mt-2 ${index === currentStep ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                    Step {index + 1}
                  </span>
                </div>
                {index < onboardingSteps.length - 1 && (
                  <div className={`
                    w-16 h-0.5 mx-4 transition-colors duration-300
                    ${step.completed ? 'bg-green-400' : 'bg-muted'}
                  `} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Current Step Content */}
          <div className="text-center mb-8">
            <div className="mb-6">
              <Progress value={progress} className="w-full h-2 mb-4" />
              <h2 className="text-2xl font-bold mb-2">{onboardingSteps[currentStep].title}</h2>
              <p className="text-muted-foreground text-lg">
                {onboardingSteps[currentStep].description}
              </p>
            </div>

            {/* Step-specific content */}
            {currentStep === 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {features.map((feature, index) => (
                  <div key={index} className="glass-panel p-4 rounded-xl text-left">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/20">
                        <feature.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">{feature.title}</h3>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {currentStep === 1 && (
              <div className="glass-panel p-6 rounded-xl mb-6">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <Wallet className="w-8 h-8 text-primary" />
                  <ArrowRight className="w-6 h-6 text-muted-foreground" />
                  <Globe className="w-8 h-8 text-secondary" />
                </div>
                <h3 className="font-semibold mb-2">Connect to IOTA EVM Network</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Connect your wallet to access DeFi features, manage your portfolio, and deploy trading strategies.
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  <Badge variant="outline">MetaMask</Badge>
                  <Badge variant="outline">WalletConnect</Badge>
                  <Badge variant="outline">Web3 Wallets</Badge>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="glass-panel p-4">
                  <div className="text-center">
                    <Bot className="w-8 h-8 text-primary mx-auto mb-2" />
                    <h3 className="font-semibold mb-1">Trading Bots</h3>
                    <p className="text-xs text-muted-foreground">Automated trading strategies</p>
                  </div>
                </Card>
                <Card className="glass-panel p-4">
                  <div className="text-center">
                    <Star className="w-8 h-8 text-secondary mx-auto mb-2" />
                    <h3 className="font-semibold mb-1">Strategies</h3>
                    <p className="text-xs text-muted-foreground">Proven trading strategies</p>
                  </div>
                </Card>
                <Card className="glass-panel p-4">
                  <div className="text-center">
                    <TrendingUp className="w-8 h-8 text-cosmic-500 mx-auto mb-2" />
                    <h3 className="font-semibold mb-1">Analytics</h3>
                    <p className="text-xs text-muted-foreground">Performance insights</p>
                  </div>
                </Card>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={skipOnboarding} className="text-muted-foreground">
              Skip Tour
            </Button>
            <div className="flex items-center gap-3">
              {currentStep < onboardingSteps.length - 1 ? (
                <Button onClick={nextStep} className="neuro-button group">
                  {onboardingSteps[currentStep].action || 'Next'}
                  <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              ) : (
                <Button onClick={completeOnboarding} className="neuro-button group animate-pulse-glow">
                  <Zap className="w-4 h-4 mr-2" />
                  Start Trading
                  <Sparkles className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-xs text-muted-foreground">
              By continuing, you agree to our terms of service and privacy policy.
              <br />
              All trading involves risk. Never invest more than you can afford to lose.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingWelcome;