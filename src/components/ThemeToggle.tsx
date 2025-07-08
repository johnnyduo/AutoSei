import React, { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toggleThemeWithEffects } from '@/lib/themeTransitions';

const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [mounted, setMounted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Get saved theme or use system preference
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    setTheme(initialTheme);
    
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        const systemTheme = e.matches ? 'dark' : 'light';
        setTheme(systemTheme);
        // Apply theme change with effects
        toggleThemeWithEffects(theme === systemTheme ? (systemTheme === 'light' ? 'dark' : 'light') : theme);
      }
    };
    
    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, [theme]);

  const toggleTheme = () => {
    if (isAnimating) return; // Prevent multiple clicks during animation
    
    setIsAnimating(true);
    
    // Use enhanced theme toggle with visual effects
    const newTheme = toggleThemeWithEffects(theme);
    
    // Update local state after a delay to sync with the animation
    setTimeout(() => {
      setTheme(newTheme);
      setTimeout(() => {
        setIsAnimating(false);
      }, 300);
    }, 150);
  };

  // Don't render on server-side
  if (!mounted) {
    return (
      <Button
        variant="ghost"
        className="w-9 h-9 p-0 rounded-full border border-border hover:border-primary/40 transition-all duration-300 flex items-center justify-center"
        disabled
      >
        <Sun className="h-4 w-4 text-primary" />
      </Button>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            onClick={toggleTheme}
            disabled={isAnimating}
            className={`
              w-9 h-9 p-0 rounded-full border border-border hover:border-primary/40 
              hover:bg-primary/10 transition-all duration-300 overflow-hidden flex items-center justify-center
              ${isAnimating ? 'animate-pulse' : ''}
            `}
          >
            {/* Icon container with simple animations */}
            <div className="relative w-4 h-4">
              <Sun className={`
                absolute inset-0 w-4 h-4 text-primary transition-all duration-500
                ${theme === 'dark' ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'}
              `} />
              <Moon className={`
                absolute inset-0 w-4 h-4 text-primary transition-all duration-500
                ${theme === 'light' ? '-rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'}
              `} />
            </div>
            
            <span className="sr-only">Toggle theme</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Switch to {theme === 'light' ? 'dark' : 'light'} mode</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ThemeToggle;
