// src/lib/tokenService.ts
import { toast } from '@/components/ui/use-toast';
import { generateTokenInsights, isGeminiAvailable } from './geminiService';

// Types for token data
export interface TokenPrice {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
}

/**
 * Fetch token prices from CoinGecko API
 * This is a free public API that doesn't require authentication
 */
export const fetchTokenPrices = async (specificTokens?: string[]): Promise<TokenPrice[]> => {
  try {
    const apiUrl = import.meta.env.VITE_COINGECKO_API_URL || 'https://api.coingecko.com/api/v3';
    const response = await fetch(
      `${apiUrl}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false&price_change_percentage=24h`
    );
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    
    // If specific tokens are requested, filter the results
    if (specificTokens && specificTokens.length > 0) {
      const filteredData = data.filter((token: TokenPrice) => 
        specificTokens.some(symbol => 
          token.symbol.toLowerCase() === symbol.toLowerCase()
        )
      );
      return filteredData;
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching token prices:', error);
    
    // Return empty array if fetch fails
    return [];
  }
};

/**
 * Fetch token insights using Gemini API
 * This requires a valid Gemini API key in the .env file
 */
export const fetchTokenInsights = async (tokenSymbol: string): Promise<string> => {
  try {
    // Check if we have cached insights for this token
    const cachedInsights = localStorage.getItem(`token_insights_${tokenSymbol.toLowerCase()}`);
    const cacheTime = localStorage.getItem(`token_insights_${tokenSymbol.toLowerCase()}_time`);
    
    // If we have cached insights that are less than 1 hour old, use them
    if (cachedInsights && cacheTime) {
      const cacheAge = Date.now() - parseInt(cacheTime);
      if (cacheAge < 60 * 60 * 1000) { // 1 hour
        return cachedInsights;
      }
    }
    
    // Check if Gemini API is available
    if (!isGeminiAvailable()) {
      throw new Error('Gemini API key not configured');
    }
    
    // Get current price data for context
    let priceContext = '';
    try {
      const tokenPrices = await fetchTokenPrices([tokenSymbol]);
      if (tokenPrices.length > 0) {
        const token = tokenPrices[0];
        priceContext = `Current price: $${token.current_price}, 24h change: ${token.price_change_percentage_24h.toFixed(2)}%, Market cap: $${token.market_cap}`;
      }
    } catch (error) {
      console.error('Error fetching price data for insights:', error);
      // Continue without price context
    }
    
    // Generate insights using our geminiService
    const insights = await generateTokenInsights(tokenSymbol, priceContext);
    
    // Cache the insights
    localStorage.setItem(`token_insights_${tokenSymbol.toLowerCase()}`, insights);
    localStorage.setItem(`token_insights_${tokenSymbol.toLowerCase()}_time`, Date.now().toString());
    
    return insights;
  } catch (error) {
    console.error('Error fetching token insights:', error);
    return 'Unable to retrieve token insights at this time. Please try again later.';
  }
};

// Re-export isGeminiAvailable from geminiService
export { isGeminiAvailable } from './geminiService';

/**
 * Cache token data in localStorage
 */
export const cacheTokenData = (data: TokenPrice[]): void => {
  try {
    localStorage.setItem('cached_token_data', JSON.stringify(data));
    localStorage.setItem('token_data_timestamp', Date.now().toString());
  } catch (error) {
    console.error('Error caching token data:', error);
  }
};

/**
 * Get cached token data from localStorage
 */
export const getCachedTokenData = (): { data: TokenPrice[], timestamp: number } => {
  try {
    const cachedData = localStorage.getItem('cached_token_data');
    const timestamp = parseInt(localStorage.getItem('token_data_timestamp') || '0', 10);
    
    if (cachedData) {
      return { 
        data: JSON.parse(cachedData),
        timestamp
      };
    }
  } catch (error) {
    console.error('Error retrieving cached token data:', error);
  }
  
  return { data: [], timestamp: 0 };
};

// Price cache with localStorage persistence and rate limiting
interface PriceCache {
  price: number;
  timestamp: number;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
const RATE_LIMIT_DELAY = 10 * 1000; // 10 seconds minimum between API calls
const SEI_CACHE_KEY = 'sei_price_cache';

let lastApiCall = 0;
let isCurrentlyFetching = false;

/**
 * Get cached SEI price from localStorage
 */
const getCachedSeiPrice = (): PriceCache | null => {
  try {
    const cached = localStorage.getItem(SEI_CACHE_KEY);
    if (cached) {
      const parsedCache: PriceCache = JSON.parse(cached);
      const now = Date.now();
      
      // Check if cache is still valid (within 5 minutes)
      if (now - parsedCache.timestamp < CACHE_DURATION) {
        console.log('📈 Using cached SEI price:', parsedCache.price);
        return parsedCache;
      }
    }
  } catch (error) {
    console.error('Error reading SEI price cache:', error);
  }
  return null;
};

/**
 * Save SEI price to localStorage cache
 */
const cacheSeiPrice = (price: number): void => {
  try {
    const cacheData: PriceCache = {
      price,
      timestamp: Date.now()
    };
    localStorage.setItem(SEI_CACHE_KEY, JSON.stringify(cacheData));
    console.log('💾 Cached SEI price:', price);
  } catch (error) {
    console.error('Error caching SEI price:', error);
  }
};

/**
 * Fetch SEI token price with caching and rate limiting
 */
export const fetchSeiPrice = async (): Promise<number> => {
  // First, try to get from cache
  const cachedPrice = getCachedSeiPrice();
  if (cachedPrice) {
    return cachedPrice.price;
  }

  // Check rate limiting - don't make API calls too frequently
  const now = Date.now();
  if (now - lastApiCall < RATE_LIMIT_DELAY) {
    console.log('⏱️ Rate limited - using fallback SEI price');
    return 0.45; // Return fallback price if we're being rate limited
  }

  // Prevent multiple concurrent API calls
  if (isCurrentlyFetching) {
    console.log('🔄 Already fetching SEI price - using fallback');
    return 0.45;
  }

  isCurrentlyFetching = true;
  lastApiCall = now;

  try {
    console.log('🌐 Fetching fresh SEI price from CoinGecko...');
    const apiUrl = import.meta.env.VITE_COINGECKO_API_URL || 'https://api.coingecko.com/api/v3';
    
    // Try to fetch SEI price from CoinGecko
    const response = await fetch(
      `${apiUrl}/simple/price?ids=sei-network&vs_currencies=usd`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data['sei-network'] && data['sei-network'].usd) {
      const price = data['sei-network'].usd;
      cacheSeiPrice(price); // Cache the fresh price
      console.log('✅ Fresh SEI price fetched:', price);
      return price;
    }
    
    // Fallback: try with symbol search
    const fallbackResponse = await fetch(
      `${apiUrl}/coins/markets?vs_currency=usd&ids=sei-network&order=market_cap_desc&per_page=1&page=1`
    );
    
    if (fallbackResponse.ok) {
      const fallbackData = await fallbackResponse.json();
      if (fallbackData.length > 0 && fallbackData[0].current_price) {
        const price = fallbackData[0].current_price;
        cacheSeiPrice(price);
        console.log('✅ SEI price from fallback API:', price);
        return price;
      }
    }
    
    // If all fails, return a reasonable default
    console.warn('⚠️ Could not fetch SEI price from any API, using fallback');
    return 0.45; // Fallback price
    
  } catch (error) {
    console.error('❌ Error fetching SEI price:', error);
    
    // Even on error, try to return a recently expired cached price if available
    try {
      const expiredCache = localStorage.getItem(SEI_CACHE_KEY);
      if (expiredCache) {
        const parsedCache: PriceCache = JSON.parse(expiredCache);
        console.log('🔄 Using expired cached price due to API error:', parsedCache.price);
        return parsedCache.price;
      }
    } catch (cacheError) {
      console.error('Error reading expired cache:', cacheError);
    }
    
    // Final fallback
    return 0.45;
  } finally {
    isCurrentlyFetching = false;
  }
};