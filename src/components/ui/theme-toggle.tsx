import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "./button";

export function ThemeToggle() {
  const { effectiveTheme, toggleTheme, mounted } = useTheme();

  // During SSR/initial render, check the actual DOM state to prevent icon flash
  const isDark = mounted
    ? effectiveTheme === "dark"
    : typeof document !== "undefined" && document.documentElement.classList.contains("dark");

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="border-md-primary dark:border-md-outline-variant dark:bg-md-tertiary"
      disabled={!mounted}
    >
      {isDark ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
    </Button>
  );
}
