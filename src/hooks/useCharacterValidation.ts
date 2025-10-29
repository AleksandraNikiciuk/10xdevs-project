import { useMemo } from "react";
import { validateSourceText, getValidationColorClass } from "@/lib/utils/validation";
import type { CharacterValidation } from "@/components/generate/types";

export function useCharacterValidation(text: string): CharacterValidation & {
  colorClass: string;
} {
  const validation = useMemo(() => validateSourceText(text), [text]);

  const colorClass = useMemo(() => getValidationColorClass(validation.state), [validation.state]);

  return {
    ...validation,
    colorClass,
  };
}
