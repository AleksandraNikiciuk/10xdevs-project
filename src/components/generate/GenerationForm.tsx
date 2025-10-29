import { Button } from "@/components/ui/button";
import { SourceTextInput } from "./SourceTextInput";
import { useCharacterValidation } from "@/hooks/useCharacterValidation";

interface GenerationFormProps {
  sourceText: string;
  onSourceTextChange: (text: string) => void;
  onSubmit: () => void;
  isDisabled: boolean;
}

export function GenerationForm({ sourceText, onSourceTextChange, onSubmit, isDisabled }: GenerationFormProps) {
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
      <div className="flex justify-end">
        <Button type="submit" disabled={!validation.isValid || isDisabled}>
          {isDisabled ? "Generating..." : "Generate Flashcards"}
        </Button>
      </div>
    </form>
  );
}
