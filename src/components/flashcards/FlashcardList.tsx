import React from "react";
import type { FlashcardDTO } from "../../types";
import FlashcardItem from "./FlashcardItem";

interface FlashcardListProps {
  flashcards: FlashcardDTO[];
  onDelete: (flashcardId: number) => void;
}

const FlashcardList: React.FC<FlashcardListProps> = ({ flashcards, onDelete }) => {
  if (flashcards.length === 0) {
    return <p>No flashcards found. Create some first!</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {flashcards.map((flashcard) => (
        <FlashcardItem key={flashcard.id} flashcard={flashcard} onDelete={onDelete} />
      ))}
    </div>
  );
};

export default FlashcardList;
