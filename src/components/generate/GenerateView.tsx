import { useEffect, useRef } from "react";
import { Sparkles } from "lucide-react";
import { useGenerateFlashcards } from "@/hooks/useGenerateFlashcards";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { GenerationForm } from "./GenerationForm";
import { ProposalsSection } from "./ProposalsSection";
import { ProposalsSkeletonLoader } from "./ProposalsSkeletonLoader";
import { ErrorAlert } from "./ErrorAlert";
import { EmptyState } from "./EmptyState";
import { Button } from "../ui/button";
import { ArrowLeft } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { useCharacterValidation } from "@/hooks/useCharacterValidation";

export function GenerateView() {
  const {
    viewState,
    sourceText,
    proposals,
    selectedCount,
    error,
    setSourceText,
    handleGenerate,
    handleSaveSelected,
    toggleProposal,
    editProposal,
    handleCancel,
    clearError,
  } = useGenerateFlashcards();

  const formRef = useRef<HTMLDivElement>(null);
  const proposalsRef = useRef<HTMLDivElement>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const validation = useCharacterValidation(sourceText);

  const isIdle = viewState === "idle";
  const isGenerating = viewState === "generating";
  const isReviewing = viewState === "reviewing";
  const isSaving = viewState === "saving";
  const isError = viewState === "error";
  const isFormDisabled = isGenerating || isSaving;

  useKeyboardShortcuts([
    {
      key: "s",
      ctrlOrCmd: true,
      handler: handleSaveSelected,
      disabled: !isReviewing || selectedCount === 0,
    },
    {
      key: "Escape",
      handler: handleCancel,
      disabled: !isReviewing && !isSaving,
    },
  ]);

  useEffect(() => {
    if (isReviewing && proposalsRef.current) {
      proposalsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [isReviewing]);

  useEffect(() => {
    if (viewState === "idle" && formRef.current) {
      const textarea = formRef.current.querySelector("textarea");
      textarea?.focus();
    }
  }, [viewState]);

  const triggerFormSubmit = () => {
    submitButtonRef.current?.click();
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <a href="/" className="inline-block mb-4">
        <Button variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </a>
      <header className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3">
              <Sparkles className="h-7 w-7 text-md-primary sm:h-8 sm:w-8" />
              <h1 className="text-headline-medium text-md-on-surface sm:text-headline-large">Generate Flashcards</h1>
            </div>
            <p className="text-body-large text-md-on-surface-variant">
              Paste your text and let AI generate flashcards for you
            </p>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {isError && error && (
        <ErrorAlert error={error} onRetry={error.canRetry ? handleGenerate : undefined} onDismiss={clearError} />
      )}

      <section aria-label="Generation form" ref={formRef}>
        <GenerationForm
          ref={submitButtonRef}
          sourceText={sourceText}
          onSourceTextChange={setSourceText}
          onSubmit={handleGenerate}
          isDisabled={isFormDisabled}
        />
      </section>

      {!isReviewing && !isSaving && (
        <div className="mt-4 mb-4 flex justify-end">
          <Button onClick={triggerFormSubmit} disabled={!validation.isValid || isFormDisabled}>
            {isGenerating ? "Generating..." : "Generate Flashcards"}
          </Button>
        </div>
      )}

      {isIdle && !isError && (
        <section aria-label="Empty state">
          <EmptyState />
        </section>
      )}

      {isGenerating && (
        <section aria-label="Loading proposals" aria-busy="true">
          <ProposalsSkeletonLoader />
        </section>
      )}

      {(isReviewing || isSaving) && (
        <section aria-label="Flashcard proposals" ref={proposalsRef}>
          <ProposalsSection
            proposals={proposals}
            selectedCount={selectedCount}
            onToggle={toggleProposal}
            onEdit={editProposal}
            onSave={handleSaveSelected}
            onCancel={handleCancel}
            isSaving={isSaving}
          />
        </section>
      )}

      {isReviewing && (
        <div className="sr-only" role="status" aria-live="polite">
          {proposals.length} flashcard proposals loaded. {selectedCount} selected.
        </div>
      )}
      <Toaster />
    </main>
  );
}
