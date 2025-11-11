import type { CreateFlashcardsCommand, CreateFlashcardsResultDTO, ListFlashcardsResultDTO } from "@/types";
import type { ErrorState } from "@/components/generate/types";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
}

async function getAuthHeaders(): Promise<HeadersInit> {
  if (import.meta.env.PUBLIC_MOCK_AUTH === "true") {
    return {
      Authorization: "Bearer mock-token-for-testing",
      "Content-Type": "application/json",
    };
  }

  const accessToken = getCookie("sb-access-token");

  if (!accessToken) {
    throw new Error("Unauthorized");
  }

  return {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };
}

async function getOptionalAuthHeaders(): Promise<HeadersInit> {
  if (import.meta.env.PUBLIC_MOCK_AUTH === "true") {
    return {
      Authorization: "Bearer mock-token-for-testing",
      "Content-Type": "application/json",
    };
  }

  const accessToken = getCookie("sb-access-token");
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  return headers;
}

function mapErrorToState(status: number, message?: string): ErrorState {
  switch (status) {
    case 400:
      return {
        message: "Invalid flashcard data. Please check and try again.",
        canRetry: true,
      };
    case 401:
      return {
        message: "Your session has expired. Please log in again.",
        canRetry: false,
        shouldRedirect: true,
        redirectUrl: "/login",
      };
    case 404:
      return {
        message: "Generation not found. Please try generating flashcards again.",
        canRetry: false,
      };
    case 500:
      return {
        message: "Server error occurred while saving. Please try again.",
        canRetry: true,
      };
    default:
      return {
        message: message || "Failed to save flashcards. Please try again.",
        canRetry: true,
      };
  }
}

export async function saveFlashcards(command: CreateFlashcardsCommand): Promise<CreateFlashcardsResultDTO> {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch("/api/flashcards", {
      method: "POST",
      headers,
      body: JSON.stringify(command),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorState = mapErrorToState(response.status, errorData.message);
      throw errorState;
    }

    const data: CreateFlashcardsResultDTO = await response.json();
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
      message: "Failed to save flashcards. Please try again.",
      canRetry: true,
    } as ErrorState;
  }
}

export async function deleteFlashcard(flashcardId: number): Promise<void> {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(`/api/flashcards/${flashcardId}`, {
      method: "DELETE",
      headers,
    });

    if (!response.ok) {
      // For simplicity, using a generic error message for delete
      throw new Error("Failed to delete flashcard. Please try again.");
    }

    // DELETE should not have a body, so we don't expect JSON
    return;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error deleting flashcard:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("An unexpected error occurred.");
  }
}

export async function listFlashcards(params: { page: number; limit: number }): Promise<ListFlashcardsResultDTO> {
  try {
    const headers = await getOptionalAuthHeaders();

    const url = new URL("/api/flashcards", window.location.origin);
    url.searchParams.set("page", params.page.toString());
    url.searchParams.set("limit", params.limit.toString());

    const response = await fetch(url.toString(), {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      throw new Error("Failed to load flashcards. Please try again.");
    }

    const data: ListFlashcardsResultDTO = await response.json();
    return data;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error listing flashcards:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("An unexpected error occurred.");
  }
}
