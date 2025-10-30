import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ErrorAlert } from "@/components/generate/ErrorAlert";

const makeError = (overrides: Partial<Parameters<typeof ErrorAlert>[0]["error"]> = {}) => ({
  message: "Something went wrong",
  canRetry: false,
  ...overrides,
});

describe("ErrorAlert", () => {
  it("renders message and basic layout", () => {
    const error = makeError();

    render(<ErrorAlert error={error} />);

    expect(screen.getByText("Error")).toBeInTheDocument();
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Try Again" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Dismiss" })).not.toBeInTheDocument();
  });

  it("shows retry button only when retry is allowed and handler provided", () => {
    const retry = vi.fn();
    const error = makeError({ canRetry: true });

    render(<ErrorAlert error={error} onRetry={retry} />);

    const retryButton = screen.getByRole("button", { name: "Try Again" });
    fireEvent.click(retryButton);

    expect(retry).toHaveBeenCalledTimes(1);
  });

  it("does not show retry button if canRetry is false even when handler exists", () => {
    const retry = vi.fn();
    const error = makeError({ canRetry: false });

    render(<ErrorAlert error={error} onRetry={retry} />);

    expect(screen.queryByRole("button", { name: "Try Again" })).not.toBeInTheDocument();
  });

  it("renders dismiss button when handler provided", () => {
    const dismiss = vi.fn();
    const error = makeError();

    render(<ErrorAlert error={error} onDismiss={dismiss} />);

    const dismissButton = screen.getByRole("button", { name: "Dismiss" });
    fireEvent.click(dismissButton);

    expect(dismiss).toHaveBeenCalledTimes(1);
  });

  it("renders both buttons when retry and dismiss are available", () => {
    const retry = vi.fn();
    const dismiss = vi.fn();
    const error = makeError({ canRetry: true });

    render(<ErrorAlert error={error} onRetry={retry} onDismiss={dismiss} />);

    expect(screen.getByRole("button", { name: "Try Again" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Dismiss" })).toBeInTheDocument();
  });
});
