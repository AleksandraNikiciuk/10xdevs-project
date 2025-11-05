import { render, fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, beforeEach, vi } from "vitest";
import React from "react";

import { GenerationForm } from "@/components/generate/GenerationForm";
import { useCharacterValidation } from "@/hooks/useCharacterValidation";

vi.mock("@/hooks/useCharacterValidation");

const { SourceTextInputMock } = vi.hoisted(() => ({
  SourceTextInputMock: vi.fn(),
}));

vi.mock("@/components/generate/SourceTextInput", () => {
  const SourceTextInput = ({
    value,
    onChange,
    disabled,
  }: {
    value: string;
    onChange: (value: string) => void;
    disabled: boolean;
  }) => {
    SourceTextInputMock({ value, onChange, disabled });
    return (
      <div data-testid="source-text-input">
        <span data-testid="current-value">{value}</span>
        <button type="button" data-testid="change-value" disabled={disabled} onClick={() => onChange("updated value")}>
          change
        </button>
      </div>
    );
  };

  return { SourceTextInput };
});

const mockValidation = (overrides: Partial<ReturnType<typeof useCharacterValidation>> = {}) => {
  vi.mocked(useCharacterValidation).mockReturnValue({
    count: 0,
    state: "valid",
    isValid: true,
    message: "",
    colorClass: "",
    ...overrides,
  } as ReturnType<typeof useCharacterValidation>);
};

describe("GenerationForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockValidation();
  });

  it("passes value and change handler to SourceTextInput", () => {
    const handleChange = vi.fn();

    render(
      <GenerationForm sourceText="initial" onSourceTextChange={handleChange} onSubmit={vi.fn()} isDisabled={false} />
    );

    expect(SourceTextInputMock).toHaveBeenCalledWith(expect.objectContaining({ value: "initial", disabled: false }));

    const changeButton = screen.getByTestId("change-value") as HTMLButtonElement;
    fireEvent.click(changeButton);
    expect(handleChange).toHaveBeenCalledWith("updated value");
  });

  it("submits when validation passes", () => {
    const handleSubmit = vi.fn();

    render(
      <GenerationForm sourceText="valid" onSourceTextChange={vi.fn()} onSubmit={handleSubmit} isDisabled={false} />
    );

    const form = document.querySelector("form");
    expect(form).not.toBeNull();
    if (!form) return;

    fireEvent.submit(form);

    expect(handleSubmit).toHaveBeenCalledTimes(1);
  });

  it("does not submit when validation fails", () => {
    mockValidation({ isValid: false });
    const handleSubmit = vi.fn();

    render(
      <GenerationForm sourceText="invalid" onSourceTextChange={vi.fn()} onSubmit={handleSubmit} isDisabled={false} />
    );

    const form = document.querySelector("form");
    if (!form) throw new Error("Form not found");
    fireEvent.submit(form);

    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it("does not submit when form is disabled", () => {
    const handleSubmit = vi.fn();

    render(
      <GenerationForm sourceText="valid" onSourceTextChange={vi.fn()} onSubmit={handleSubmit} isDisabled={true} />
    );

    const form = document.querySelector("form");
    if (!form) throw new Error("Form not found");
    fireEvent.submit(form);

    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it("forwards ref to hidden submit button", () => {
    const ref = React.createRef<HTMLButtonElement>();

    render(
      <GenerationForm ref={ref} sourceText="valid" onSourceTextChange={vi.fn()} onSubmit={vi.fn()} isDisabled={false} />
    );

    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    expect(ref.current?.type).toBe("submit");
  });
});
