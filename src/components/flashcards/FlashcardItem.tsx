import React, { useState } from "react";
import type { FlashcardDTO, FlashcardSource } from "../../../types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import { HelpCircle, CheckCircle, Trash2 } from "lucide-react";
import DeleteConfirmationDialog from "./DeleteConfirmationDialog";
import { Badge } from "@/components/ui/badge";

const sourceMap: Record<FlashcardSource, { text: string; variant: "default" | "secondary" | "outline" }> = {
  "ai-full": { text: "AI", variant: "default" },
  "ai-edited": { text: "AI", variant: "secondary" },
  manual: { text: "Manual", variant: "outline" },
};

interface FlashcardItemProps {
  flashcard: FlashcardDTO;
  onDelete: (flashcardId: number) => void;
}

const FlashcardItem: React.FC<FlashcardItemProps> = ({ flashcard, onDelete }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleCardClick = () => {
    setIsFlipped(!isFlipped);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    setIsPending(true);
    await onDelete(flashcard.id);
    setIsPending(false);
    setIsModalOpen(false);
  };

  const renderDeleteButton = () => (
    <button
      onClick={handleDeleteClick}
      className="absolute top-2 right-2 text-destructive-foreground bg-destructive p-1.5 rounded-full hover:bg-destructive/80 transition-colors"
      aria-label="Delete flashcard"
    >
      <Trash2 size={18} />
    </button>
  );

  const { text, variant } = sourceMap[flashcard.source] || { text: "Unknown", variant: "destructive" };

  return (
    <>
      <div className="flip-card h-[250px]" onClick={handleCardClick}>
        <div className={`flip-card-inner ${isFlipped ? "is-flipped" : ""}`}>
          <div className="flip-card-front">
            <Card className="h-full relative flashcard-question-bg">
              {renderDeleteButton()}
              <CardHeader>
                <CardTitle className="flex items-center">
                  <HelpCircle className="mr-2" />
                  Question
                  <Badge variant={variant} className="ml-2">
                    {text}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>{flashcard.question}</p>
              </CardContent>
            </Card>
          </div>
          <div className="flip-card-back">
            <Card className="h-full relative flashcard-answer-bg">
              {renderDeleteButton()}
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="mr-2" />
                  Answer
                  <Badge variant={variant} className="ml-2">
                    {text}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>{flashcard.answer}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <DeleteConfirmationDialog
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        onConfirm={handleConfirmDelete}
        isPending={isPending}
      />
    </>
  );
};

export default FlashcardItem;
