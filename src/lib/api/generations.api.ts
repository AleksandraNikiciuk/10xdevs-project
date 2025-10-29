import type { CreateGenerationCommand, CreateGenerationResultDTO } from "@/types";
import type { ErrorState } from "@/components/generate/types";
import { supabaseClient } from "@/db/supabase.client";

async function getAuthHeaders(): Promise<HeadersInit> {
  if (import.meta.env.PUBLIC_MOCK_AUTH === "true") {
    return {
      Authorization: "Bearer mock-token-for-testing",
      "Content-Type": "application/json",
    };
  }

  const {
    data: { session },
  } = await supabaseClient.auth.getSession();

  if (!session?.access_token) {
    throw new Error("Unauthorized");
  }

  return {
    Authorization: `Bearer ${session.access_token}`,
    "Content-Type": "application/json",
  };
}

function mapErrorToState(status: number, message?: string): ErrorState {
  switch (status) {
    case 400:
      return {
        message: "Invalid data provided. Please check your input and try again.",
        canRetry: true,
      };
    case 401:
      return {
        message: "Your session has expired. Please log in again.",
        canRetry: false,
        shouldRedirect: true,
        redirectUrl: "/login",
      };
    case 422:
      return {
        message: "AI couldn't process this text. Please try with different content.",
        canRetry: true,
      };
    case 500:
      return {
        message: "Server error occurred. Please try again.",
        canRetry: true,
      };
    case 503:
      return {
        message: "AI service is currently unavailable. Please try again or use shorter text.",
        canRetry: true,
      };
    default:
      return {
        message: message || "An unexpected error occurred. Please try again.",
        canRetry: true,
      };
  }
}

export async function generateFlashcards(command: CreateGenerationCommand): Promise<CreateGenerationResultDTO> {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch("/api/generations", {
      method: "POST",
      headers,
      body: JSON.stringify(command),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorState = mapErrorToState(response.status, errorData.message);
      throw errorState;
    }

    const data: CreateGenerationResultDTO = await response.json();
    return data;
  } catch (error) {
    if (error && typeof error === "object" && "message" in error && "canRetry" in error) {
      throw error;
    }

    if (error instanceof TypeError) {
      throw {
        message: "Network error. Please check your connection and try again.",
        canRetry: true,
      } as ErrorState;
    }

    if (error instanceof Error && error.message === "Unauthorized") {
      throw {
        message: "Your session has expired. Please log in again.",
        canRetry: false,
        shouldRedirect: true,
        redirectUrl: "/login",
      } as ErrorState;
    }

    throw {
      message: "An unexpected error occurred. Please try again.",
      canRetry: true,
    } as ErrorState;
  }
}
