import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ProposalsHeader } from "./ProposalsHeader";
import { ProposalsList } from "./ProposalsList";
import type { FlashcardProposal } from "./types";

interface ProposalsSectionProps {
  proposals: FlashcardProposal[];
  selectedCount: number;
  onToggle: (id: string) => void;
  onEdit: (id: string, front: string, back: string) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
  isUserLoggedIn: boolean;
}

export function ProposalsSection({
  proposals,
  selectedCount,
  onToggle,
  onEdit,
  onSave,
  onCancel,
  isSaving,
  isUserLoggedIn,
}: ProposalsSectionProps) {
  const canSave = selectedCount > 0;

  return (
    <>
      <ProposalsHeader
        totalCount={proposals.length}
        selectedCount={selectedCount}
        onSave={onSave}
        onCancel={onCancel}
        isSaving={isSaving}
        isSaveDisabled={selectedCount === 0}
      />
      <div className="mb-8">
        <ProposalsList proposals={proposals} onToggle={onToggle} onEdit={onEdit} />
      </div>
      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={onCancel} disabled={isSaving}>
          Cancel
        </Button>
        {isUserLoggedIn ? (
          <Button onClick={onSave} disabled={selectedCount === 0 || isSaving}>
            {isSaving ? `Saving ${selectedCount} flashcards...` : `Save ${selectedCount} selected`}
          </Button>
        ) : (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button disabled className="pointer-events-none">
                    Save selected
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>You must be logged in to save flashcards.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </>
  );
}
