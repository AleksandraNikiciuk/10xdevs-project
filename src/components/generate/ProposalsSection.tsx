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
    <div data-test-id="proposals-section-content">
      <ProposalsHeader
        totalCount={proposals.length}
        selectedCount={selectedCount}
        onSave={onSave}
        onCancel={onCancel}
        isSaving={isSaving}
        isSaveDisabled={selectedCount === 0}
        isUserLoggedIn={isUserLoggedIn}
      />
      <div className="mt-8" data-test-id="proposals-list-wrapper">
        <ProposalsList proposals={proposals} onToggle={onToggle} onEdit={onEdit} />
      </div>
    </div>
  );
}
