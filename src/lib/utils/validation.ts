import type { CharacterValidation, FieldValidation } from "@/components/generate/types";

export const SOURCE_TEXT_MIN = 1000;
export const SOURCE_TEXT_MAX = 10000;
export const QUESTION_MIN = 3;
export const QUESTION_MAX = 500;
export const ANSWER_MIN = 3;
export const ANSWER_MAX = 2000;

export function validateSourceText(text: string): CharacterValidation {
  const trimmedCount = text.trim().length;

  let state: CharacterValidation["state"];
  let message: string;

  if (trimmedCount < SOURCE_TEXT_MIN) {
    state = "below-min";
    message = `Minimum ${SOURCE_TEXT_MIN} characters required`;
  } else if (trimmedCount > SOURCE_TEXT_MAX) {
    state = "above-max";
    message = `Maximum ${SOURCE_TEXT_MAX} characters allowed`;
  } else {
    state = "valid";
    message = `${trimmedCount} / ${SOURCE_TEXT_MAX} characters`;
  }

  return {
    count: trimmedCount,
    state,
    isValid: state === "valid",
    message,
  };
}

export function validateQuestion(question: string): FieldValidation {
  const count = question.trim().length;

  if (count < QUESTION_MIN) {
    return {
      isValid: false,
      error: `Question must be at least ${QUESTION_MIN} characters`,
      count,
      min: QUESTION_MIN,
      max: QUESTION_MAX,
    };
  }

  if (count > QUESTION_MAX) {
    return {
      isValid: false,
      error: `Question must not exceed ${QUESTION_MAX} characters`,
      count,
      min: QUESTION_MIN,
      max: QUESTION_MAX,
    };
  }

  return {
    isValid: true,
    count,
    min: QUESTION_MIN,
    max: QUESTION_MAX,
  };
}

export function validateAnswer(answer: string): FieldValidation {
  const count = answer.trim().length;

  if (count < ANSWER_MIN) {
    return {
      isValid: false,
      error: `Answer must be at least ${ANSWER_MIN} characters`,
      count,
      min: ANSWER_MIN,
      max: ANSWER_MAX,
    };
  }

  if (count > ANSWER_MAX) {
    return {
      isValid: false,
      error: `Answer must not exceed ${ANSWER_MAX} characters`,
      count,
      min: ANSWER_MIN,
      max: ANSWER_MAX,
    };
  }

  return {
    isValid: true,
    count,
    min: ANSWER_MIN,
    max: ANSWER_MAX,
  };
}

export function validateProposal(
  question: string,
  answer: string
): {
  isValid: boolean;
  questionValidation: FieldValidation;
  answerValidation: FieldValidation;
} {
  const questionValidation = validateQuestion(question);
  const answerValidation = validateAnswer(answer);

  return {
    isValid: questionValidation.isValid && answerValidation.isValid,
    questionValidation,
    answerValidation,
  };
}

export function getValidationColorClass(state: CharacterValidation["state"]): string {
  switch (state) {
    case "below-min":
      return "text-muted-foreground";
    case "valid":
      return "text-green-600 dark:text-green-500";
    case "above-max":
      return "text-destructive";
  }
}
