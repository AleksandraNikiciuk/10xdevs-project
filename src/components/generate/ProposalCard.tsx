import { CheckCircle2, Circle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CharacterCounter } from "./CharacterCounter";
import type { ProposalViewModel } from "./types";
import { validateQuestion, validateAnswer } from "@/lib/utils/validation";

interface ProposalCardProps {
  proposal: ProposalViewModel;
  onToggle: (id: number) => void;
  onEdit: (id: number, field: "question" | "answer", value: string) => void;
}

export function ProposalCard({ proposal, onToggle, onEdit }: ProposalCardProps) {
  const questionValidation = validateQuestion(proposal.question);
  const answerValidation = validateAnswer(proposal.answer);

  const getBadgeText = () => {
    if (proposal.source === "ai-edited") return "AI edited";
    if (proposal.source === "ai-full") return "AI";
    return "Manual";
  };

  const getBadgeVariant = () => {
    if (proposal.source === "ai-edited") return "secondary";
    if (proposal.source === "ai-full") return "default";
    return "outline";
  };

  return (
    <Card className={!proposal.isSelected ? "opacity-60 transition-opacity duration-medium-2" : ""}>
      <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-4 sm:gap-4">
        <button
          type="button"
          onClick={() => onToggle(proposal.id)}
          className="shrink-0 group transition-all duration-medium-2 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-md-primary focus-visible:ring-offset-2 rounded-full"
          aria-label={`Select flashcard: ${proposal.question.substring(0, 50)}...`}
          aria-pressed={proposal.isSelected}
        >
          {proposal.isSelected ? (
            <CheckCircle2 className="h-7 w-7 text-md-primary transition-colors" />
          ) : (
            <Circle className="h-7 w-7 text-md-outline transition-colors group-hover:text-md-primary/60" />
          )}
        </button>
        <div className="flex-1 space-y-1">
          <Badge variant={getBadgeVariant()}>{getBadgeText()}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-0 pl-[52px]">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor={`question-${proposal.id}`}>Question</Label>
            <CharacterCounter
              count={questionValidation.count}
              max={questionValidation.max}
              className={`text-label-small ${questionValidation.isValid ? "text-md-on-surface-variant" : "text-md-error"}`}
            />
          </div>
          <Textarea
            id={`question-${proposal.id}`}
            value={proposal.question}
            onChange={(e) => onEdit(proposal.id, "question", e.target.value)}
            className="min-h-[60px] max-h-[200px] resize-y"
            disabled={!proposal.isSelected}
            aria-invalid={!questionValidation.isValid}
            aria-describedby={!questionValidation.isValid ? `question-error-${proposal.id}` : undefined}
          />
          {!questionValidation.isValid && (
            <p id={`question-error-${proposal.id}`} className="text-label-small text-md-error" role="alert">
              {questionValidation.error}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor={`answer-${proposal.id}`}>Answer</Label>
            <CharacterCounter
              count={answerValidation.count}
              max={answerValidation.max}
              className={`text-label-small ${answerValidation.isValid ? "text-md-on-surface-variant" : "text-md-error"}`}
            />
          </div>
          <Textarea
            id={`answer-${proposal.id}`}
            value={proposal.answer}
            onChange={(e) => onEdit(proposal.id, "answer", e.target.value)}
            className="min-h-[80px] max-h-[300px] resize-y sm:min-h-[100px]"
            disabled={!proposal.isSelected}
            aria-invalid={!answerValidation.isValid}
            aria-describedby={!answerValidation.isValid ? `answer-error-${proposal.id}` : undefined}
          />
          {!answerValidation.isValid && (
            <p id={`answer-error-${proposal.id}`} className="text-label-small text-md-error" role="alert">
              {answerValidation.error}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
