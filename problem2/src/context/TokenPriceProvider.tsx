import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

interface TokenPriceResponse {
  currency: string;
  date: string;
  price: number;
}

export async function fetchTokenPrices(): Promise<Record<string, number>> {
  const response = await fetch("https://interview.switcheo.com/prices.json");
  
  if (!response.ok) {
    throw new Error(`Failed to fetch token prices: ${response.statusText}`);
  }

  const data: TokenPriceResponse[] = await response.json();

  // Handle duplicates
  const priceMap = new Map<string, { price: number; date: Date }>();

  for (const item of data) {
    const currency = item.currency;
    const date = new Date(item.date);
    const existing = priceMap.get(currency);

    if (!existing || date > existing.date) {
      priceMap.set(currency, { price: item.price, date });
    }
  }

  const prices: Record<string, number> = {};
  for (const [currency, { price }] of priceMap.entries()) {
    prices[currency] = price;
  }

  return prices;
}

type TokenPriceContextType = {
  prices: Record<string, number>;
  isLoading: boolean;
  isRefetching: boolean;
  error: string | null;
  refreshPrices: () => Promise<void>;
};

const TokenPriceContext = createContext<TokenPriceContextType | null>(null);

export function TokenPriceProvider({ children }: { children: React.ReactNode }) {
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isRefetching, setIsRefetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mounted = useRef(true);

  const refreshPrices = useCallback(async () => {
    try {
      setError(null);
      setIsRefetching(true);
      const data = await fetchTokenPrices();

      if (!mounted.current) return;
      setPrices(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      if (mounted.current) setIsRefetching(false);
    }
  }, []);

  useEffect(() => {
    refreshPrices().finally(() => {
      if (mounted.current) setIsLoading(false);
    });

    return () => {
      mounted.current = false;
    };
  }, [refreshPrices]);

  useEffect(() => {
    const id = setInterval(() => {
      refreshPrices();
    }, 15000);

    return () => clearInterval(id);
  }, [refreshPrices]);

  const value: TokenPriceContextType = {
    prices,
    isLoading,
    isRefetching,
    error,
    refreshPrices,
  };

  return (
    <TokenPriceContext.Provider value={value}>
      {children}
    </TokenPriceContext.Provider>
  );
}

export function useTokenPrices() {
  const ctx = useContext(TokenPriceContext);
  if (!ctx) throw new Error("useTokenPrices must be used inside TokenPriceProvider");
  return ctx;
}

//
