// Theme transition utility
export const initializeThemeTransitions = () => {
  // Prevent transition on initial load
  document.documentElement.classList.add('preload');
  
  // Remove preload class after a short delay
  setTimeout(() => {
    document.documentElement.classList.remove('preload');
  }, 100);
};

// Add theme transition class during theme changes
export const enableThemeTransition = () => {
  document.documentElement.classList.add('theme-transition');
};

// Remove theme transition class after animation completes
export const disableThemeTransition = () => {
  setTimeout(() => {
    document.documentElement.classList.remove('theme-transition');
  }, 500);
};

// Create ripple effect for theme transitions
export const createThemeRipple = (theme: 'light' | 'dark') => {
  const ripple = document.createElement('div');
  ripple.className = 'theme-ripple';
  
  const isLight = theme === 'light';
  ripple.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: ${isLight 
      ? 'radial-gradient(circle at center, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.4) 30%, transparent 70%)' 
      : 'radial-gradient(circle at center, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 30%, transparent 70%)'
    };
    pointer-events: none;
    z-index: 9999;
    opacity: 0;
    transform: scale(0);
    transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  `;
  
  document.body.appendChild(ripple);
  
  // Trigger animation
  requestAnimationFrame(() => {
    ripple.style.opacity = '1';
    ripple.style.transform = 'scale(3)';
  });
  
  // Remove ripple after animation
  setTimeout(() => {
    ripple.style.opacity = '0';
    setTimeout(() => {
      if (document.body.contains(ripple)) {
        document.body.removeChild(ripple);
      }
    }, 600);
  }, 400);
};

// Initialize theme system
export const initializeTheme = () => {
  const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
  
  // Apply theme immediately to prevent flash
  document.documentElement.classList.remove('light', 'dark');
  document.documentElement.classList.add(initialTheme);
  document.documentElement.setAttribute('data-theme', initialTheme);
  document.documentElement.style.colorScheme = initialTheme;
  
  return initialTheme;
};

// Enhanced theme toggle with visual effects
export const toggleThemeWithEffects = (currentTheme: 'light' | 'dark') => {
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  
  // Enable smooth transitions
  enableThemeTransition();
  
  // Create ripple effect
  createThemeRipple(newTheme);
  
  // Apply theme after a slight delay for visual effect
  setTimeout(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    document.documentElement.style.colorScheme = newTheme;
    
    // Save to localStorage
    localStorage.setItem('theme', newTheme);
    
    // Disable transitions after animation
    disableThemeTransition();
  }, 150);
  
  return newTheme;
};
