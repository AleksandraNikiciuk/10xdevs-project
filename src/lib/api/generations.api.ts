import type { CreateGenerationCommand, CreateGenerationResultDTO } from "@/types";
import type { ErrorState } from "@/components/generate/types";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
}

async function getOptionalAuthHeaders(): Promise<HeadersInit> {
  if (import.meta.env.PUBLIC_MOCK_AUTH === "true") {
    return {
      Authorization: "Bearer mock-token-for-testing",
      "Content-Type": "application/json",
    };
  }

  const accessToken = getCookie("sb-access-token");

  // Optional: include token if available, but don't throw error if not
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
    console.log("[generations.api] Starting fetch to /api/generations");
    console.log("- Command:", command);

    const headers = await getOptionalAuthHeaders();
    console.log("- Headers:", headers);

    const response = await fetch("/api/generations", {
      method: "POST",
      headers,
      body: JSON.stringify(command),
    });

    console.log("[generations.api] Response received:");
    console.log("- Status:", response.status);
    console.log("- OK:", response.ok);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("[generations.api] Error response:", errorData);
      const errorState = mapErrorToState(response.status, errorData.message);
      throw errorState;
    }

    const data: CreateGenerationResultDTO = await response.json();
    // eslint-disable-next-line no-console
    console.log("[generations.api] Success response:", data);
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

    throw {
      message: "An unexpected error occurred. Please try again.",
      canRetry: true,
    } as ErrorState;
  }
}
