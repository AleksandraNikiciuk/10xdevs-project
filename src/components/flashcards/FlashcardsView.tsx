import React, { useState, useEffect, useRef, useCallback } from "react";
import type { FlashcardDTO } from "../../types";
import FlashcardList from "./FlashcardList";
import { Layers, ArrowLeft, Loader2 } from "lucide-react";
import { deleteFlashcard, listFlashcards } from "@/lib/api/flashcards.api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface FlashcardsViewProps {
  flashcards: FlashcardDTO[];
  error: string | null;
  totalCount: number;
}

const FlashcardsView: React.FC<FlashcardsViewProps> = ({
  flashcards: initialFlashcards,
  error,
  totalCount: initialTotalCount,
}) => {
  const [flashcards, setFlashcards] = useState<FlashcardDTO[]>(initialFlashcards);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialFlashcards.length < initialTotalCount);
  const [totalCount, setTotalCount] = useState(initialTotalCount);
  const observerTarget = useRef<HTMLDivElement>(null);

  const loadMoreFlashcards = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const nextPage = page + 1;
      const result = await listFlashcards({ page: nextPage, limit: 20 });

      setFlashcards((prev) => [...prev, ...result.data]);
      setPage(nextPage);
      setTotalCount(result.pagination.total);
      setHasMore(result.data.length > 0 && flashcards.length + result.data.length < result.pagination.total);
    } catch (error) {
      console.error("Error loading more flashcards:", error);
      toast.error("Failed to load more flashcards");
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page, flashcards.length]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMoreFlashcards();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loading, loadMoreFlashcards]);

  const handleDeleteFlashcard = async (flashcardId: number) => {
    try {
      await deleteFlashcard(flashcardId);
      setFlashcards((prevFlashcards) => prevFlashcards.filter((f) => f.id !== flashcardId));
      setTotalCount((prev) => prev - 1);
      toast.success("Flashcard deleted successfully!");
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Failed to delete flashcard.");
    }
  };

  return (
    <div>
      <a href="/" className="inline-block mb-4">
        <Button variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
      </a>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold flex items-center">
          <Layers className="mr-3" size={32} />
          Your Flashcards
        </h1>
        <div className="text-lg font-semibold">Total: {totalCount}</div>
      </div>
      {error && <p className="text-red-500">{error}</p>}
      {!error && (
        <>
          <FlashcardList flashcards={flashcards} onDelete={handleDeleteFlashcard} />
          {hasMore && (
            <div ref={observerTarget} className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-md-primary" />
            </div>
          )}
          {!hasMore && flashcards.length > 0 && (
            <div className="text-center py-8 text-md-on-surface-variant">
              All flashcards loaded
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FlashcardsView;
