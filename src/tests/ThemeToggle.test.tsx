import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useTheme } from "@/hooks/useTheme";

// Mock the useTheme hook
vi.mock("@/hooks/useTheme");

describe("ThemeToggle", () => {
  it("renders with sun icon for light theme", () => {
    vi.mocked(useTheme).mockReturnValue({
      theme: "light",
      effectiveTheme: "light",
      setTheme: vi.fn(),
      toggleTheme: vi.fn(),
      mounted: true,
    });

    render(<ThemeToggle />);

    expect(screen.getByLabelText("Switch to dark mode")).toBeInTheDocument();
    // Assuming Sun icon is rendered, you might need a better way to check this, e.g., data-testid on the icon
  });

  it("renders with moon icon for dark theme", () => {
    vi.mocked(useTheme).mockReturnValue({
      theme: "dark",
      effectiveTheme: "dark",
      setTheme: vi.fn(),
      toggleTheme: vi.fn(),
      mounted: true,
    });

    render(<ThemeToggle />);

    expect(screen.getByLabelText("Switch to light mode")).toBeInTheDocument();
    // Assuming Moon icon is rendered
  });

  it("calls toggleTheme on click", () => {
    const toggleTheme = vi.fn();
    vi.mocked(useTheme).mockReturnValue({
      theme: "light",
      effectiveTheme: "light",
      setTheme: vi.fn(),
      toggleTheme,
      mounted: true,
    });

    render(<ThemeToggle />);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(toggleTheme).toHaveBeenCalledTimes(1);
  });

  it("is disabled when not mounted", () => {
    vi.mocked(useTheme).mockReturnValue({
      theme: "light",
      effectiveTheme: "light",
      setTheme: vi.fn(),
      toggleTheme: vi.fn(),
      mounted: false,
    });

    render(<ThemeToggle />);

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });
});
