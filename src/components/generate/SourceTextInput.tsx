import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CharacterCounter } from "./CharacterCounter";
import { useCharacterValidation } from "@/hooks/useCharacterValidation";

interface SourceTextInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function SourceTextInput({ value, onChange, disabled = false }: SourceTextInputProps) {
  const validation = useCharacterValidation(value);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor="source-text">Source Text</Label>
        <CharacterCounter
          count={validation.count}
          max={10000}
          className={`text-xs sm:text-sm ${validation.colorClass}`}
        />
      </div>
      <Textarea
        id="source-text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="Paste your text here (1000-10000 characters)..."
        className="min-h-[150px] max-h-[400px] resize-y sm:min-h-[200px] sm:max-h-[200px]"
        aria-invalid={!validation.isValid}
        aria-describedby={!validation.isValid ? "source-text-error" : undefined}
      />
      {!validation.isValid && (
        <p id="source-text-error" className={`text-xs sm:text-sm ${validation.colorClass}`} role="alert">
          {validation.message}
        </p>
      )}
    </div>
  );
}
