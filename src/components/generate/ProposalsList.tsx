import { ProposalCard } from "./ProposalCard";
import type { ProposalViewModel } from "./types";

interface ProposalsListProps {
  proposals: ProposalViewModel[];
  onToggle: (id: number) => void;
  onEdit: (id: number, field: "question" | "answer", value: string) => void;
}

export function ProposalsList({ proposals, onToggle, onEdit }: ProposalsListProps) {
  if (proposals.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-muted-foreground sm:text-base" role="status">
        No flashcard proposals generated.
      </div>
    );
  }

  return (
    <div
      className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2"
      role="list"
      aria-label="Flashcard proposals"
      data-test-id="proposals-list"
    >
      {proposals.map((proposal) => (
        <div key={proposal.id} role="listitem" data-test-id={`proposal-list-item-${proposal.id}`}>
          <ProposalCard proposal={proposal} onToggle={onToggle} onEdit={onEdit} />
        </div>
      ))}
    </div>
  );
}
