import { Lightbulb } from "lucide-react";
import { Card } from "@/components/ui/card";

export function EmptyState() {
  return (
    <Card
      className="flex flex-col items-center justify-center gap-4 py-12 text-center sm:py-16"
      data-test-id="empty-state-card"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-md-primary-container sm:h-20 sm:w-20">
        <Lightbulb className="h-8 w-8 text-md-on-primary-container sm:h-10 sm:w-10" />
      </div>
      <div className="space-y-2 px-4">
        <h2 className="text-title-large text-md-on-surface">Ready to create flashcards?</h2>
        <p className="text-body-medium text-md-on-surface-variant max-w-md">
          Paste your text above and click &quot;Generate Flashcards&quot; to get started. AI will create learning cards
          for you in seconds.
        </p>
      </div>
    </Card>
  );
}
