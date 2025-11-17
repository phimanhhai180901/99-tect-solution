// Lazy load SVGs from assets/tokens folder
const modules = import.meta.glob<{ default: string }>("../assets/tokens/*.svg");

// Lazy load a token icon by symbol
export const getTokenIcon = async (symbol: string): Promise<string | null> => {
  const normalizedSymbol = symbol.toUpperCase();
  const path = `../assets/tokens/${normalizedSymbol}.svg`;
  
  const loader = modules[path];
  if (!loader) {
    console.warn(`Token icon not found: ${symbol}`);
    return null;
  }

  try {
    const mod = await loader();
    return mod.default;
  } catch (error) {
    console.error(`Failed to load token icon: ${symbol}`, error);
    return null;
  }
};
