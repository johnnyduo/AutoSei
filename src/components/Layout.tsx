
// src/components/Layout.tsx
import { ReactNode, useState } from 'react';
import DashboardHeader from './DashboardHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutDashboard, MessageCircle, Settings, BarChart2, Bot } from 'lucide-react';
import AIChat from './AIChat';
import AllocationAdjuster from './AllocationAdjuster';
import WhaleTracker from './WhaleTracker';
import TradingBotsDashboard from './TradingBotsDashboard';
import StrategiesMarketplace from './StrategiesMarketplace';
import { useIsMobile } from '@/hooks/use-mobile';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen flex flex-col">
      <DashboardHeader />
      
      <main className="flex-1 container mx-auto py-4 md:py-6 px-2 md:px-4 pb-16">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-center mb-4 md:mb-8 overflow-x-auto">
            <TabsList className="bg-background/95 backdrop-blur-sm border border-border rounded-xl p-1.5 shadow-md">
              <TabsTrigger 
                value="dashboard" 
                className="flex items-center px-3 md:px-4 py-2.5 rounded-lg text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all duration-200 hover:bg-accent hover:text-accent-foreground"
              >
                <LayoutDashboard className="h-4 w-4 mr-1 md:mr-2" />
                <span className="text-xs md:text-sm font-medium">Dashboard</span>
              </TabsTrigger>
              
              <TabsTrigger 
                value="bots" 
                className="flex items-center px-3 md:px-4 py-2.5 rounded-lg text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all duration-200 hover:bg-accent hover:text-accent-foreground"
              >
                <Bot className="h-4 w-4 mr-1 md:mr-2" />
                <span className="text-xs md:text-sm font-medium">Trading Bots</span>
              </TabsTrigger>
              
              <TabsTrigger 
                value="strategies" 
                className="flex items-center px-3 md:px-4 py-2.5 rounded-lg text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all duration-200 hover:bg-accent hover:text-accent-foreground"
              >
                <BarChart2 className="h-4 w-4 mr-1 md:mr-2" />
                <span className="text-xs md:text-sm font-medium">Strategies</span>
              </TabsTrigger>
              
              <TabsTrigger 
                value="chat" 
                className="flex items-center px-3 md:px-4 py-2.5 rounded-lg text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all duration-200 hover:bg-accent hover:text-accent-foreground"
              >
                <MessageCircle className="h-4 w-4 mr-1 md:mr-2" />
                <span className="text-xs md:text-sm font-medium">AI Chat</span>
              </TabsTrigger>
              
              <TabsTrigger 
                value="settings" 
                className="flex items-center px-3 md:px-4 py-2.5 rounded-lg text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all duration-200 hover:bg-accent hover:text-accent-foreground"
              >
                <Settings className="h-4 w-4 mr-1 md:mr-2" />
                <span className="text-xs md:text-sm font-medium">Settings</span>
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="dashboard" className="mt-0 outline-none">
            {children}
          </TabsContent>
          
          <TabsContent value="bots" className="mt-0 outline-none">
            <TradingBotsDashboard />
          </TabsContent>
          
          <TabsContent value="strategies" className="mt-0 outline-none">
            <StrategiesMarketplace />
          </TabsContent>
          
          <TabsContent value="chat" className="mt-0 outline-none">
            <div className="max-w-4xl mx-auto">
              <AIChat />
            </div>
          </TabsContent>
          
          <TabsContent value="settings" className="mt-0 outline-none">
            <div className="max-w-4xl mx-auto">
              <AllocationAdjuster />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Layout;
