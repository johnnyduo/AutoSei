
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1400px'
      }
    },
    extend: {
      fontFamily: {
        'space': ['Space Grotesk', 'sans-serif'],
        'roboto-mono': ['Roboto Mono', 'monospace'],
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        nebula: {
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
          800: '#5B21B6',
          900: '#4C1D95',
        },
        cosmic: {
          100: '#E0F2FE',
          200: '#BAE6FD',
          300: '#7DD3FC',
          400: '#38BDF8',
          500: '#0EA5E9',
          600: '#0284C7',
          700: '#0369A1',
          800: '#075985',
          900: '#0C4A6E',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      keyframes: {
        "accordion-down": {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        "accordion-up": {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        "pulse-glow": {
          "0%, 100%": {
            opacity: "0.6",
            transform: "scale(1)",
          },
          "50%": {
            opacity: "1",
            transform: "scale(1.05)",
          },
        },
        "float": {
          "0%, 100%": {
            transform: "translateY(0px) rotate(0deg)",
          },
          "33%": {
            transform: "translateY(-10px) rotate(1deg)",
          },
          "66%": {
            transform: "translateY(5px) rotate(-1deg)",
          },
        },
        "micro-bounce": {
          "0%": {
            transform: "scale(1)",
          },
          "50%": {
            transform: "scale(1.1)",
          },
          "100%": {
            transform: "scale(1)",
          },
        },
        "shimmer": {
          "0%": {
            transform: "translateX(-100%)",
          },
          "100%": {
            transform: "translateX(100%)",
          },
        },
        "glass-shine": {
          "0%": {
            opacity: "0",
            transform: "translateX(-100%) skewX(-45deg)",
          },
          "50%": {
            opacity: "1",
          },
          "100%": {
            opacity: "0",
            transform: "translateX(200%) skewX(-45deg)",
          },
        },
        "neuro-press": {
          "0%": {
            transform: "scale(1)",
          },
          "50%": {
            transform: "scale(0.98)",
          },
          "100%": {
            transform: "scale(1)",
          },
        },
        "clay-bounce": {
          "0%": {
            transform: "translateY(0) scale(1)",
          },
          "25%": {
            transform: "translateY(-5px) scale(1.02)",
          },
          "50%": {
            transform: "translateY(-2px) scale(1.01)",
          },
          "100%": {
            transform: "translateY(0) scale(1)",
          },
        },
        "data-flow": {
          "0%": {
            transform: "translateX(-100%) scaleX(0)",
          },
          "50%": {
            transform: "translateX(0%) scaleX(1)",
          },
          "100%": {
            transform: "translateX(100%) scaleX(0)",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "micro-bounce": "micro-bounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        "shimmer": "shimmer 2s infinite",
        "glass-shine": "glass-shine 3s ease-in-out infinite",
        "neuro-press": "neuro-press 0.2s ease-in-out",
        "clay-bounce": "clay-bounce 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        "data-flow": "data-flow 2s ease-in-out infinite",
        "spin-slow": "spin 3s linear infinite",
        "bounce-gentle": "bounce 2s infinite",
      },
      backgroundImage: {
        'gradient-nebula': 'linear-gradient(135deg, #7C3AED 0%, #0EA5E9 100%)',
        'gradient-cosmic': 'linear-gradient(180deg, #0369A1 0%, #4C1D95 100%)',
        'gradient-card': 'linear-gradient(90deg, rgba(15, 23, 42, 0.6) 0%, rgba(15, 23, 42, 0.3) 100%)',
        'gradient-button': 'linear-gradient(45deg, #7C3AED 0%, #0EA5E9 100%)',
      },
      boxShadow: {
        'glow': '0 0 15px rgba(124, 58, 237, 0.5)',
        'cosmic': '0 0 20px rgba(14, 165, 233, 0.5)',
      },
    }
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
