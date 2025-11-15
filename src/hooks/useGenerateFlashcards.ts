import { useState, useCallback } from "react";
import { toast } from "sonner";
import type { ViewState, ProposalViewModel, ErrorState } from "@/components/generate/types";
import type { CreateGenerationResultDTO, FlashcardSource } from "@/types";
import { generateFlashcards } from "@/lib/api/generations.api";
import { saveFlashcards } from "@/lib/api/flashcards.api";

interface UseGenerateFlashcardsReturn {
  viewState: ViewState;
  sourceText: string;
  proposals: ProposalViewModel[];
  selectedCount: number;
  error: ErrorState | null;
  generationId: number | null;
  setSourceText: (text: string) => void;
  handleGenerate: () => Promise<void>;
  handleSaveSelected: () => Promise<void>;
  toggleProposal: (id: number) => void;
  editProposal: (id: number, field: "question" | "answer", value: string) => void;
  handleCancel: () => void;
  clearError: () => void;
}

function transformToProposalViewModels(result: CreateGenerationResultDTO): ProposalViewModel[] {
  // Use flashcardsProposals array directly (present for both authenticated and anonymous users)
  return result.flashcardsProposals.map((proposal, index) => {
    return {
      id: proposal.id || index, // Use database ID if available, otherwise use index
      question: proposal.question,
      answer: proposal.answer,
      source: proposal.source as FlashcardSource,
      generation_id: proposal.generation_id,
      created_at: proposal.created_at,
      isSelected: true,
      isEditing: false,
      isModified: false,
      originalQuestion: proposal.question,
      originalAnswer: proposal.answer,
    } as ProposalViewModel;
  });
}

export function useGenerateFlashcards(): UseGenerateFlashcardsReturn {
  const [viewState, setViewState] = useState<ViewState>("idle");
  const [sourceText, setSourceText] = useState("");
  const [proposals, setProposals] = useState<ProposalViewModel[]>([]);
  const [error, setError] = useState<ErrorState | null>(null);
  const [generationId, setGenerationId] = useState<number | null>(null);

  const selectedCount = proposals.filter((p) => p.isSelected).length;

  const handleGenerate = useCallback(async () => {
    setViewState("generating");
    setError(null);

    try {
      // eslint-disable-next-line no-console
      console.log("[useGenerateFlashcards] Starting generation...");
      // eslint-disable-next-line no-console
      console.log("- Text length:", sourceText.length);
      // eslint-disable-next-line no-console
      console.log("- Trimmed length:", sourceText.trim().length);

      const result = await generateFlashcards({ source_text: sourceText });
      // eslint-disable-next-line no-console
      console.log("[useGenerateFlashcards] Generation successful:", result);
      // eslint-disable-next-line no-console
      console.log("[useGenerateFlashcards] Flashcards saved:", result.saved);

      const proposalViewModels = transformToProposalViewModels(result);

      setProposals(proposalViewModels);
      setGenerationId(result.generation?.id || null);
      setViewState("reviewing");
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("[useGenerateFlashcards] Generation failed:");
      // eslint-disable-next-line no-console
      console.error("- Error object:", err);
      // eslint-disable-next-line no-console
      console.error("- Error type:", typeof err);
      // eslint-disable-next-line no-console
      console.error("- Error keys:", err && typeof err === "object" ? Object.keys(err) : "N/A");

      const errorState = err as ErrorState;
      setError(errorState);
      setViewState("error");

      if (errorState.shouldRedirect && errorState.redirectUrl) {
        const url = errorState.redirectUrl;
        setTimeout(() => {
          // eslint-disable-next-line react-compiler/react-compiler
          window.location.href = url;
        }, 2000);
      }
    }
  }, [sourceText]);

  const handleSaveSelected = useCallback(async () => {
    const selectedProposals = proposals.filter((p) => p.isSelected);

    if (selectedProposals.length === 0) return;

    setViewState("saving");
    setError(null);

    try {
      const flashcardsToSave = selectedProposals.map((p) => ({
        question: p.question,
        answer: p.answer,
        source: p.source,
      }));

      const result = await saveFlashcards({
        generation_id: generationId,
        flashcards: flashcardsToSave,
      });

      toast.success(`Successfully saved ${result.created_count} flashcards!`, {
        description: "You can view them on the Flashcards page",
        action: {
          label: "View Flashcards",
          onClick: () => {
            window.location.href = "/flashcards";
          },
        },
      });

      setViewState("idle");
      setSourceText("");
      setProposals([]);
      setGenerationId(null);
    } catch (err) {
      const errorState = err as ErrorState;
      setError(errorState);
      setViewState("error");
      toast.error("Failed to save flashcards", {
        description: errorState.message,
      });

      if (errorState.shouldRedirect && errorState.redirectUrl) {
        const url = errorState.redirectUrl;
        setTimeout(() => {
          window.location.href = url;
        }, 2000);
      }
    }
  }, [proposals, generationId]);

  const toggleProposal = useCallback((id: number) => {
    setProposals((prev) => prev.map((p) => (p.id === id ? { ...p, isSelected: !p.isSelected } : p)));
  }, []);

  const editProposal = useCallback((id: number, field: "question" | "answer", value: string) => {
    setProposals((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;

        const isQuestionModified =
          field === "question" ? value !== p.originalQuestion : p.question !== p.originalQuestion;
        const isAnswerModified = field === "answer" ? value !== p.originalAnswer : p.answer !== p.originalAnswer;
        const isModified = isQuestionModified || isAnswerModified;

        return {
          ...p,
          [field]: value,
          isModified,
          source: isModified ? ("ai-edited" as const) : ("ai-full" as const),
        };
      })
    );
  }, []);

  const handleCancel = useCallback(() => {
    setViewState("idle");
    setSourceText("");
    setProposals([]);
    setError(null);
    setGenerationId(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
    if (viewState === "error") {
      setViewState(proposals.length > 0 ? "reviewing" : "idle");
    }
  }, [viewState, proposals.length]);

  return {
    viewState,
    sourceText,
    proposals,
    selectedCount,
    error,
    generationId,
    setSourceText,
    handleGenerate,
    handleSaveSelected,
    toggleProposal,
    editProposal,
    handleCancel,
    clearError,
  };
}
