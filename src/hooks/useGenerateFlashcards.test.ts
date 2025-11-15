import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CreateGenerationResultDTO, CreateFlashcardsResultDTO } from "@/types";
import type { ErrorState } from "@/components/generate/types";

vi.mock("@/lib/api/generations.api", () => ({
  generateFlashcards: vi.fn(),
}));

vi.mock("@/lib/api/flashcards.api", () => ({
  saveFlashcards: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import { useGenerateFlashcards } from "@/hooks/useGenerateFlashcards";
import { generateFlashcards } from "@/lib/api/generations.api";
import { saveFlashcards } from "@/lib/api/flashcards.api";
import { toast } from "sonner";

const generateFlashcardsMock = vi.mocked(generateFlashcards);
const saveFlashcardsMock = vi.mocked(saveFlashcards);
const toastSuccessMock = vi.mocked(toast.success);
const toastErrorMock = vi.mocked(toast.error);

function createGenerationResult(
  overrides: Partial<NonNullable<CreateGenerationResultDTO["generation"]>> & {
    flashcardsProposals?: CreateGenerationResultDTO["flashcardsProposals"];
    saved?: boolean;
  } = {}
): CreateGenerationResultDTO {
  const flashcardsProposals = overrides.flashcardsProposals ?? [
    {
      id: 1,
      question: "Default question",
      answer: "Default answer",
      source: "ai-full" as const,
      generation_id: overrides.id ?? 101,
      created_at: "2024-01-01T00:00:00.000Z",
    },
  ];

  return {
    generation: {
      id: overrides.id ?? 101,
      user_id: overrides.user_id ?? "user-1",
      model: overrides.model ?? "gpt-4o-mini",
      source_text_length: overrides.source_text_length ?? 120,
      source_text_hash: overrides.source_text_hash ?? "hash-value",
      generated_count: overrides.generated_count ?? flashcardsProposals.length,
      generation_duration: overrides.generation_duration ?? 2.5,
      created_at: overrides.created_at ?? "2024-01-01T00:00:00.000Z",
      flashcardsProposals,
    },
    flashcardsProposals, // Top-level array for both authenticated and anonymous users
    saved: overrides.saved ?? true, // Default to true (authenticated user scenario)
  };
}

describe("useGenerateFlashcards", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns the expected initial state", () => {
    const { result } = renderHook(() => useGenerateFlashcards());

    expect(result.current.viewState).toBe("idle");
    expect(result.current.sourceText).toBe("");
    expect(result.current.proposals).toEqual([]);
    expect(result.current.selectedCount).toBe(0);
    expect(result.current.error).toBeNull();
    expect(result.current.generationId).toBeNull();
  });

  it("handles successful generation flow", async () => {
    const generationResult = createGenerationResult({
      flashcardsProposals: [
        {
          id: 1,
          question: "What is Astro?",
          answer: "A web framework",
          source: "ai-full",
          generation_id: 101,
          created_at: "2024-01-01T00:00:00.000Z",
        },
        {
          id: 2,
          question: "What is React?",
          answer: "A UI library",
          source: "ai-full",
          generation_id: 101,
          created_at: "2024-01-01T00:00:00.000Z",
        },
      ],
    });

    generateFlashcardsMock.mockResolvedValueOnce(generationResult);

    const { result } = renderHook(() => useGenerateFlashcards());

    act(() => {
      result.current.setSourceText("Sample content");
    });

    await act(async () => {
      await result.current.handleGenerate();
    });

    expect(generateFlashcardsMock).toHaveBeenCalledWith({ source_text: "Sample content" });
    expect(result.current.viewState).toBe("reviewing");
    expect(result.current.generationId).toBe(101);
    expect(result.current.proposals).toHaveLength(2);
    expect(result.current.selectedCount).toBe(2);
    expect(result.current.error).toBeNull();
    expect(result.current.proposals.every((proposal) => proposal.isSelected)).toBe(true);
  });

  it("handles generation errors with optional redirect", async () => {
    const errorState: ErrorState = {
      message: "Unauthorized",
      canRetry: false,
      shouldRedirect: true,
      redirectUrl: "/login",
    };

    vi.useFakeTimers();
    const setTimeoutSpy = vi.spyOn(globalThis, "setTimeout");

    generateFlashcardsMock.mockRejectedValueOnce(errorState);

    const { result } = renderHook(() => useGenerateFlashcards());

    act(() => {
      result.current.setSourceText("Sample content");
    });

    await act(async () => {
      await result.current.handleGenerate();
    });

    expect(result.current.viewState).toBe("error");
    expect(result.current.error).toEqual(errorState);
    expect(result.current.proposals).toEqual([]);
    expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 2000);

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
    expect(result.current.viewState).toBe("idle");

    setTimeoutSpy.mockRestore();
  });

  it("does not attempt to save when no proposals are selected", async () => {
    const { result } = renderHook(() => useGenerateFlashcards());

    await act(async () => {
      await result.current.handleSaveSelected();
    });

    expect(saveFlashcardsMock).not.toHaveBeenCalled();
    expect(result.current.viewState).toBe("idle");
  });

  it("saves selected proposals and resets state on success", async () => {
    const generationResult = createGenerationResult();
    const saveResult: CreateFlashcardsResultDTO = {
      created_count: 1,
      flashcards: [],
    };

    generateFlashcardsMock.mockResolvedValueOnce(generationResult);
    saveFlashcardsMock.mockResolvedValueOnce(saveResult);

    const { result } = renderHook(() => useGenerateFlashcards());

    act(() => {
      result.current.setSourceText("Sample content");
    });

    await act(async () => {
      await result.current.handleGenerate();
    });

    await act(async () => {
      await result.current.handleSaveSelected();
    });

    expect(saveFlashcardsMock).toHaveBeenCalledWith({
      generation_id: 101,
      flashcards: [
        {
          question: "Default question",
          answer: "Default answer",
          source: "ai-full",
        },
      ],
    });
    expect(result.current.viewState).toBe("idle");
    expect(result.current.proposals).toEqual([]);
    expect(result.current.sourceText).toBe("");
    expect(result.current.generationId).toBeNull();

    expect(toastSuccessMock).toHaveBeenCalledWith(
      "Successfully saved 1 flashcards!",
      expect.objectContaining({
        description: expect.stringContaining("Flashcards page"),
        action: expect.objectContaining({ label: "View Flashcards", onClick: expect.any(Function) }),
      })
    );
  });

  it(" surfaces save errors and keeps proposals for retry", async () => {
    const generationResult = createGenerationResult({
      flashcardsProposals: [
        {
          id: 5,
          question: "Q1",
          answer: "A1",
          source: "ai-full",
          generation_id: 500,
          created_at: "2024-01-01T00:00:00.000Z",
        },
      ],
    });

    const errorState: ErrorState = {
      message: "Database unavailable",
      canRetry: true,
    };

    generateFlashcardsMock.mockResolvedValueOnce(generationResult);
    saveFlashcardsMock.mockRejectedValueOnce(errorState);

    const { result } = renderHook(() => useGenerateFlashcards());

    act(() => {
      result.current.setSourceText("Sample content");
    });

    await act(async () => {
      await result.current.handleGenerate();
    });

    await act(async () => {
      await result.current.handleSaveSelected();
    });

    expect(result.current.viewState).toBe("error");
    expect(result.current.error).toEqual(errorState);
    expect(result.current.proposals).toHaveLength(1);
    expect(toastErrorMock).toHaveBeenCalledWith(
      "Failed to save flashcards",
      expect.objectContaining({ description: "Database unavailable" })
    );

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
    expect(result.current.viewState).toBe("reviewing");
  });

  it("toggles proposal selection state", async () => {
    const generationResult = createGenerationResult({
      flashcardsProposals: [
        {
          id: 1,
          question: "Question",
          answer: "Answer",
          source: "ai-full",
          generation_id: 101,
          created_at: "2024-01-01T00:00:00.000Z",
        },
      ],
    });

    generateFlashcardsMock.mockResolvedValueOnce(generationResult);

    const { result } = renderHook(() => useGenerateFlashcards());

    act(() => {
      result.current.setSourceText("Sample content");
    });

    await act(async () => {
      await result.current.handleGenerate();
    });

    expect(result.current.selectedCount).toBe(1);

    act(() => {
      result.current.toggleProposal(1);
    });

    expect(result.current.selectedCount).toBe(0);
    expect(result.current.proposals[0]?.isSelected).toBe(false);

    act(() => {
      result.current.toggleProposal(1);
    });

    expect(result.current.selectedCount).toBe(1);
    expect(result.current.proposals[0]?.isSelected).toBe(true);
  });

  it("tracks proposal edits and source changes", async () => {
    const generationResult = createGenerationResult();

    generateFlashcardsMock.mockResolvedValueOnce(generationResult);

    const { result } = renderHook(() => useGenerateFlashcards());

    act(() => {
      result.current.setSourceText("Sample content");
    });

    await act(async () => {
      await result.current.handleGenerate();
    });

    const originalQuestion = result.current.proposals[0]?.originalQuestion ?? "";

    act(() => {
      result.current.editProposal(1, "question", "Edited question");
    });

    expect(result.current.proposals[0]).toMatchObject({
      question: "Edited question",
      isModified: true,
      source: "ai-edited",
    });

    act(() => {
      result.current.editProposal(1, "question", originalQuestion);
    });

    expect(result.current.proposals[0]).toMatchObject({
      question: originalQuestion,
      isModified: false,
      source: "ai-full",
    });
  });

  it("resets state when cancelling review", async () => {
    const generationResult = createGenerationResult();

    generateFlashcardsMock.mockResolvedValueOnce(generationResult);

    const { result } = renderHook(() => useGenerateFlashcards());

    act(() => {
      result.current.setSourceText("Sample content");
    });

    await act(async () => {
      await result.current.handleGenerate();
    });

    act(() => {
      result.current.handleCancel();
    });

    expect(result.current.viewState).toBe("idle");
    expect(result.current.sourceText).toBe("");
    expect(result.current.proposals).toEqual([]);
    expect(result.current.error).toBeNull();
    expect(result.current.generationId).toBeNull();
    expect(result.current.selectedCount).toBe(0);
  });
});
