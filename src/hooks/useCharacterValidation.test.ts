import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useCharacterValidation } from "@/hooks/useCharacterValidation";
import { SOURCE_TEXT_MIN, SOURCE_TEXT_MAX } from "@/lib/utils/validation";

describe("useCharacterValidation", () => {
  const repeat = (char: string, count: number) => char.repeat(count);

  it("flags text below minimum length", () => {
    const belowMinText = repeat("a", SOURCE_TEXT_MIN - 1);

    const { result } = renderHook(() => useCharacterValidation(belowMinText));

    expect(result.current).toMatchObject({
      count: SOURCE_TEXT_MIN - 1,
      state: "below-min",
      isValid: false,
      colorClass: "text-muted-foreground",
      message: `Minimum ${SOURCE_TEXT_MIN} characters required`,
    });
  });

  it("returns valid state for text within bounds", () => {
    const validText = repeat("a", SOURCE_TEXT_MIN);

    const { result } = renderHook(() => useCharacterValidation(validText));

    expect(result.current).toMatchObject({
      count: SOURCE_TEXT_MIN,
      state: "valid",
      isValid: true,
      colorClass: "text-green-600 dark:text-green-500",
      message: `${SOURCE_TEXT_MIN} / ${SOURCE_TEXT_MAX} characters`,
    });
  });

  it("flags text above maximum length", () => {
    const aboveMaxText = repeat("a", SOURCE_TEXT_MAX + 1);

    const { result } = renderHook(() => useCharacterValidation(aboveMaxText));

    expect(result.current).toMatchObject({
      count: SOURCE_TEXT_MAX + 1,
      state: "above-max",
      isValid: false,
      colorClass: "text-destructive",
      message: `Maximum ${SOURCE_TEXT_MAX} characters allowed`,
    });
  });

  it("trims leading and trailing whitespace before validating", () => {
    const nearlyValidLength = SOURCE_TEXT_MIN - 2;
    const textWithWhitespace = `  ${repeat("a", nearlyValidLength)}   `;

    const { result } = renderHook(() => useCharacterValidation(textWithWhitespace));

    expect(result.current.count).toBe(nearlyValidLength);
    expect(result.current.state).toBe("below-min");
  });

  it("updates validation state when the input changes", () => {
    const { result, rerender } = renderHook(({ value }: { value: string }) => useCharacterValidation(value), {
      initialProps: { value: repeat("a", SOURCE_TEXT_MIN - 10) },
    });

    expect(result.current.state).toBe("below-min");

    rerender({ value: repeat("a", SOURCE_TEXT_MIN) });
    expect(result.current.state).toBe("valid");

    rerender({ value: repeat("a", SOURCE_TEXT_MAX + 5) });
    expect(result.current.state).toBe("above-max");
  });
});


