import { Button } from "@/components/ui/button";
import { SourceTextInput } from "./SourceTextInput";
import { useCharacterValidation } from "@/hooks/useCharacterValidation";
import { forwardRef } from "react";

interface GenerationFormProps {
  sourceText: string;
  onSourceTextChange: (text: string) => void;
  onSubmit: () => void;
  isDisabled: boolean;
}

export const GenerationForm = forwardRef<HTMLButtonElement, GenerationFormProps>(
  ({ sourceText, onSourceTextChange, onSubmit, isDisabled }, ref) => {
    const validation = useCharacterValidation(sourceText);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (validation.isValid && !isDisabled) {
        onSubmit();
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <SourceTextInput value={sourceText} onChange={onSourceTextChange} disabled={isDisabled} />
        <button type="submit" ref={ref} className="hidden" />
      </form>
    );
  }
);
