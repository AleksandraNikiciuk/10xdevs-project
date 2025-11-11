import { z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";

/**
 * Configuration error thrown when OPENROUTER_API_KEY is missing
 */
export class ConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConfigurationError";
  }
}

/**
 * Error thrown when OpenRouter API returns an error response
 */
export class OpenRouterApiError extends Error {
  public readonly statusCode: number;
  public readonly responseBody: unknown;

  constructor(message: string, statusCode: number, responseBody: unknown) {
    super(message);
    this.name = "OpenRouterApiError";
    this.statusCode = statusCode;
    this.responseBody = responseBody;
  }
}

/**
 * Error thrown when network connection fails
 */
export class NetworkError extends Error {
  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = "NetworkError";
    this.cause = cause;
  }
}

/**
 * Error thrown when model response cannot be parsed as JSON
 */
export class InvalidResponseJsonError extends Error {
  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = "InvalidResponseJsonError";
    this.cause = cause;
  }
}

/**
 * Error thrown when parsed JSON doesn't match the expected Zod schema
 */
export class SchemaValidationError extends Error {
  public readonly validationIssues: string;

  constructor(validationIssues: string) {
    super(`Schema validation failed: ${validationIssues}`);
    this.name = "SchemaValidationError";
    this.validationIssues = validationIssues;
  }
}

/**
 * Message type for chat completion
 */
interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

/**
 * Parameters for structured chat completion
 */
interface StructuredChatCompletionParams<T extends z.ZodTypeAny> {
  schema: T;
  messages: Message[];
  model: string;
  params?: Record<string, unknown>;
}

/**
 * OpenRouter API response structure
 */
interface OpenRouterApiResponse {
  choices?: {
    message?: {
      content?: string;
      role?: string;
    };
  }[];
}

/**
 * OpenRouterService is a reusable client for interacting with OpenRouter API.
 * It simplifies the process of sending requests to language models and receiving
 * structured, fully-typed JSON responses.
 *
 * Key features:
 * - Type-safe responses validated against Zod schemas
 * - Comprehensive error handling with custom error types
 * - Automatic JSON schema generation from Zod schemas
 * - Fail-fast configuration validation
 */
export class OpenRouterService {
  private readonly apiKey: string;
  private readonly baseUrl: string = "https://openrouter.ai/api/v1/chat/completions";
  private readonly siteUrl: string;
  private readonly siteName: string;

  /**
   * Creates a new OpenRouterService instance.
   * @param apiKey - OpenRouter API key (optional, will try to read from env if not provided)
   * @param siteUrl - Site URL for HTTP-Referer header (optional, defaults to appropriate value)
   * @param siteName - Site name for X-Title header (optional, defaults to "10xdevs-project")
   * @throws {ConfigurationError} If OPENROUTER_API_KEY is not provided and not set in environment variables
   */
  constructor(apiKey?: string, siteUrl?: string, siteName?: string) {
    const key =
      apiKey ||
      (typeof import.meta !== "undefined" ? import.meta.env.OPENROUTER_API_KEY : undefined) ||
      (typeof process !== "undefined" ? process.env.OPENROUTER_API_KEY : undefined);

    if (!key) {
      throw new ConfigurationError("OPENROUTER_API_KEY is not set in environment variables.");
    }

    this.apiKey = key;
    this.siteUrl = siteUrl || "https://10xdevs-project-7p0.pages.dev";
    this.siteName = siteName || "10xdevs-project";
  }

  /**
   * Sends a structured chat completion request to OpenRouter API.
   * Returns a fully-typed response validated against the provided Zod schema.
   *
   * @template T - The Zod schema type
   * @param {StructuredChatCompletionParams<T>} params - Request parameters
   * @returns {Promise<z.infer<T>>} Typed response matching the schema
   * @throws {ConfigurationError} If API key is missing
   * @throws {OpenRouterApiError} If API returns an error response
   * @throws {NetworkError} If network connection fails
   * @throws {InvalidResponseJsonError} If response cannot be parsed as JSON
   * @throws {SchemaValidationError} If response doesn't match the schema
   */
  public async structuredChatCompletion<T extends z.ZodTypeAny>(
    params: StructuredChatCompletionParams<T>
  ): Promise<z.infer<T>> {
    try {
      const payload = this._buildRequestPayload(params);
      const apiResponse = await this._makeApiCall(payload);
      return this._parseAndValidateResponse(apiResponse, params.schema);
    } catch (error) {
      // Re-throw known errors as-is
      if (
        error instanceof ConfigurationError ||
        error instanceof OpenRouterApiError ||
        error instanceof NetworkError ||
        error instanceof InvalidResponseJsonError ||
        error instanceof SchemaValidationError
      ) {
        throw error;
      }

      // Wrap unknown errors as NetworkError
      if (error instanceof TypeError || error instanceof Error) {
        throw new NetworkError(`Unexpected error during API call: ${error.message}`, error);
      }

      throw error;
    }
  }

  /**
   * Builds the request payload for OpenRouter API.
   * Uses response_format: json_object for structured output.
   * Schema is embedded in the system message as instructions.
   *
   * @private
   */
  private _buildRequestPayload<T extends z.ZodTypeAny>({
    schema,
    messages,
    model,
    params,
  }: StructuredChatCompletionParams<T>) {
    // Convert Zod schema to JSON Schema
    const fullJsonSchema = zodToJsonSchema(schema, "responseSchema");

    // Extract the actual schema definition (remove $schema and other meta fields)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { $schema, definitions, ...jsonSchema } = fullJsonSchema as Record<string, unknown>;

    // Add instruction to return JSON in system message
    const enhancedMessages = [...messages];
    if (enhancedMessages.length > 0 && enhancedMessages[0].role === "system") {
      enhancedMessages[0] = {
        ...enhancedMessages[0],
        content: `${enhancedMessages[0].content}\n\nIMPORTANT: You must respond with ONLY valid JSON that matches this exact schema:\n${JSON.stringify(jsonSchema, null, 2)}\n\nDo not include any explanatory text, markdown formatting, or code blocks. Return only raw JSON.`,
      };
    }

    return {
      model,
      messages: enhancedMessages,
      response_format: { type: "json_object" },
      ...params,
    };
  }

  /**
   * Makes the actual API call to OpenRouter.
   * Handles network errors and API error responses.
   *
   * @private
   * @throws {NetworkError} If fetch fails or network issues occur
   * @throws {OpenRouterApiError} If API returns non-2xx status code
   */
  private async _makeApiCall(payload: object): Promise<OpenRouterApiResponse> {
    let response: Response;

    try {
      response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": this.siteUrl,
          "X-Title": this.siteName,
        },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      throw new NetworkError(
        `Failed to connect to OpenRouter API: ${error instanceof Error ? error.message : "Unknown error"}`,
        error
      );
    }

    if (!response.ok) {
      let errorData: unknown;
      try {
        errorData = await response.json();
      } catch {
        errorData = await response.text();
      }

      // Log detailed error for debugging
      console.error("OpenRouter API Error:", {
        status: response.status,
        statusText: response.statusText,
        errorData,
        requestPayload: payload,
      });

      throw new OpenRouterApiError(
        `OpenRouter API error: ${response.status} ${response.statusText}`,
        response.status,
        errorData
      );
    }

    try {
      return await response.json();
    } catch (error) {
      throw new InvalidResponseJsonError("Failed to parse API response as JSON", error);
    }
  }

  /**
   * Parses and validates the API response against the provided Zod schema.
   * Extracts JSON from message content and validates it.
   *
   * @private
   * @throws {InvalidResponseJsonError} If message content cannot be parsed as JSON
   * @throws {SchemaValidationError} If parsed data doesn't match the schema
   */
  private _parseAndValidateResponse<T extends z.ZodTypeAny>(apiResponse: OpenRouterApiResponse, schema: T): z.infer<T> {
    // Get the message content
    const messageContent = apiResponse.choices?.[0]?.message?.content;

    if (!messageContent) {
      throw new InvalidResponseJsonError("Invalid response structure: No message content found in API response.");
    }

    // Parse JSON from message content
    let parsedData: unknown;
    try {
      parsedData = JSON.parse(messageContent);
    } catch (error) {
      throw new InvalidResponseJsonError(
        `Failed to parse model response as JSON. Content: ${messageContent.substring(0, 200)}`,
        error
      );
    }

    // Validate against Zod schema
    const validationResult = schema.safeParse(parsedData);
    if (!validationResult.success) {
      console.error("Schema validation failed:", {
        errors: validationResult.error.issues,
        receivedData: parsedData,
      });
      throw new SchemaValidationError(JSON.stringify(validationResult.error.issues));
    }

    return validationResult.data;
  }
}
