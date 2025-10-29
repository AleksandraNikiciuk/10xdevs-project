/**
 * Validation schemas for generation endpoints
 */

import { z } from "zod";

/**
 * Validation schema for POST /api/generations
 * Ensures source_text is between 1000-10000 characters
 */
export const createGenerationSchema = z.object({
  source_text: z
    .string()
    .min(1000, "Tekst źródłowy musi zawierać co najmniej 1000 znaków")
    .max(10000, "Tekst źródłowy nie może przekraczać 10000 znaków")
    .trim(),
});

export type CreateGenerationInput = z.infer<typeof createGenerationSchema>;
