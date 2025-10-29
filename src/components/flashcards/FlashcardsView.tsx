import React, { useState } from "react";
import type { FlashcardDTO } from "../../../types";
import FlashcardList from "./FlashcardList";
import { Layers, ArrowLeft } from "lucide-react";
import { deleteFlashcard } from "@/lib/api/flashcards.api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface FlashcardsViewProps {
  flashcards: FlashcardDTO[];
  error: string | null;
}

const FlashcardsView: React.FC<FlashcardsViewProps> = ({ flashcards: initialFlashcards, error }) => {
  const [flashcards, setFlashcards] = useState<FlashcardDTO[]>(initialFlashcards);

  const handleDeleteFlashcard = async (flashcardId: number) => {
    try {
      await deleteFlashcard(flashcardId);
      setFlashcards((prevFlashcards) => prevFlashcards.filter((f) => f.id !== flashcardId));
      toast.success("Flashcard deleted successfully!");
    } catch (error) {
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
        <div className="text-lg font-semibold">Total: {flashcards.length}</div>
      </div>
      {error && <p className="text-red-500">{error}</p>}
      {!error && <FlashcardList flashcards={flashcards} onDelete={handleDeleteFlashcard} />}
    </div>
  );
};

export default FlashcardsView;
