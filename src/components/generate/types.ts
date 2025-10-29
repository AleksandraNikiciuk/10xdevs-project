import type { FlashcardSource } from "@/types";

export type ViewState = "idle" | "generating" | "reviewing" | "saving" | "error";

export type ValidationState = "below-min" | "valid" | "above-max";

export interface CharacterValidation {
  count: number;
  state: ValidationState;
  isValid: boolean;
  message: string;
}

export interface ProposalViewModel {
  id: number;
  question: string;
  answer: string;
  source: FlashcardSource;
  generation_id: number | null;
  created_at: string;
  isSelected: boolean;
  isEditing: boolean;
  isModified: boolean;
  originalQuestion: string;
  originalAnswer: string;
}

export interface ErrorState {
  message: string;
  canRetry: boolean;
  shouldRedirect?: boolean;
  redirectUrl?: string;
}

export interface FieldValidation {
  isValid: boolean;
  error?: string;
  count: number;
  min: number;
  max: number;
}
