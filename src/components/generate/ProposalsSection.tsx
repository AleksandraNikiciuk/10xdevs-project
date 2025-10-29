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
}

export function ProposalsSection({
  proposals,
  selectedCount,
  onToggle,
  onEdit,
  onSave,
  onCancel,
  isSaving,
}: ProposalsSectionProps) {
  const canSave = selectedCount > 0;

  return (
    <div className="space-y-4 sm:space-y-6">
      <ProposalsHeader
        totalCount={proposals.length}
        selectedCount={selectedCount}
        onSave={onSave}
        onCancel={onCancel}
        isSaving={isSaving}
        canSave={canSave}
      />
      <ProposalsList proposals={proposals} onToggle={onToggle} onEdit={onEdit} />
      {canSave && (
        <div className="text-xs text-muted-foreground text-center sm:text-sm">
          <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-xs">Ctrl+S</kbd> to save,{" "}
          <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-xs">Esc</kbd> to cancel
        </div>
      )}
    </div>
  );
}
