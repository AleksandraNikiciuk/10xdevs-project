/**
 * Test endpoint for OpenRouter service
 * GET /api/test-openrouter
 *
 * This endpoint is for development/testing purposes only.
 * Tests the OpenRouter integration with a simple example.
 */

import type { APIRoute } from "astro";
import { z } from "zod";
import { OpenRouterService } from "../../lib/services/openrouter.service";

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
  try {
    // Get OpenRouter API key from runtime env (Cloudflare) or import.meta.env (dev)
    const openrouterApiKey = locals.runtime?.env?.OPENROUTER_API_KEY || import.meta.env.OPENROUTER_API_KEY;
    
    // Initialize service
    const openRouter = new OpenRouterService(openrouterApiKey);

    // Define a simple test schema
    const testSchema = z.object({
      summary: z.string(),
      keywords: z.array(z.string()),
      sentiment: z.enum(["positive", "neutral", "negative"]),
    });

    // Test text
    const testText =
      "Artificial Intelligence is transforming the world of technology. Machine learning algorithms are becoming more sophisticated every day. The future of AI looks very promising and exciting.";

    // Make API call
    const result = await openRouter.structuredChatCompletion({
      schema: testSchema,
      model: "anthropic/claude-3.5-sonnet",
      messages: [
        {
          role: "system",
          content:
            "You are a text analysis assistant. Analyze the given text and provide a summary, keywords, and sentiment.",
        },
        {
          role: "user",
          content: `Analyze this text: ${testText}`,
        },
      ],
      params: {
        temperature: 0.3,
        max_tokens: 500,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "OpenRouter service is working correctly",
        test_input: testText,
        result,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("OpenRouter test error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        error_type: error?.constructor?.name || "Unknown",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
};
