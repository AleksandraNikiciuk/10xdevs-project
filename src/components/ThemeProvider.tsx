import type { ReactNode } from "react";

interface ThemeProviderProps {
  children: ReactNode;
}

// Provider nie jest już potrzebny, ponieważ używamy prostego hooka
// Ale zachowujemy komponent dla kompatybilności z Layout
export function ThemeProvider({ children }: ThemeProviderProps) {
  return <>{children}</>;
}
