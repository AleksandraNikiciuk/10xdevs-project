import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ProposalsHeader } from "./ProposalsHeader";
import { ProposalsList } from "./ProposalsList";
import type { ProposalViewModel } from "./types";

interface ProposalsSectionProps {
  proposals: ProposalViewModel[];
  selectedCount: number;
  onToggle: (id: number) => void;
  onEdit: (id: number, field: "question" | "answer", value: string) => void;
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
      <div className="mt-8">
        <ProposalsList proposals={proposals} onToggle={onToggle} onEdit={onEdit} />
      </div>
    </>
  );
}
