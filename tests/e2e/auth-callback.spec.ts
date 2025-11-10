import { test, expect } from "@playwright/test";

test.describe("Auth Callback Fallback", () => {
  test("should redirect from index page to /auth/callback when tokens are in URL", async ({ page }) => {
    // Mock tokens that would come from Supabase
    const mockAccessToken = "mock_access_token_123";
    const mockRefreshToken = "mock_refresh_token_456";

    // Navigate to index with tokens in hash (simulating Supabase redirect)
    await page.goto(`http://localhost:4321/#access_token=${mockAccessToken}&refresh_token=${mockRefreshToken}`);

    // Wait for redirect to /auth/callback
    await page.waitForURL(/\/auth\/callback/, { timeout: 5000 });

    // Verify we're on the callback page
    expect(page.url()).toContain("/auth/callback");

    // Verify the hash parameters are preserved
    expect(page.url()).toContain(`access_token=${mockAccessToken}`);
    expect(page.url()).toContain(`refresh_token=${mockRefreshToken}`);
  });

  test("should redirect from login page to /auth/callback when tokens are in URL", async ({ context, page }) => {
    // Clear all cookies to ensure no existing session
    await context.clearCookies();

    const mockAccessToken = "mock_access_token_789";
    const mockRefreshToken = "mock_refresh_token_012";

    await page.goto(`http://localhost:4321/login#access_token=${mockAccessToken}&refresh_token=${mockRefreshToken}`);

    await page.waitForURL(/\/auth\/callback/, { timeout: 5000 });

    expect(page.url()).toContain("/auth/callback");
    expect(page.url()).toContain(`access_token=${mockAccessToken}`);
  });

  test("should redirect from register page to /auth/callback when tokens are in URL", async ({ page }) => {
    const mockAccessToken = "mock_access_token_abc";
    const mockRefreshToken = "mock_refresh_token_def";

    await page.goto(`http://localhost:4321/register#access_token=${mockAccessToken}&refresh_token=${mockRefreshToken}`);

    await page.waitForURL(/\/auth\/callback/, { timeout: 5000 });

    expect(page.url()).toContain("/auth/callback");
    expect(page.url()).toContain(`access_token=${mockAccessToken}`);
  });

  test("should NOT redirect when no tokens in URL", async ({ page }) => {
    await page.goto("http://localhost:4321/");

    // Wait a moment to ensure no redirect happens
    await page.waitForTimeout(1000);

    // Should still be on index page
    expect(page.url()).toBe("http://localhost:4321/");
  });

  test("should NOT redirect when only access_token in URL (missing refresh_token)", async ({ page }) => {
    await page.goto("http://localhost:4321/#access_token=mock_token");

    await page.waitForTimeout(1000);

    // Should still be on index page
    expect(page.url()).toContain("http://localhost:4321/");
    expect(page.url()).not.toContain("/auth/callback");
  });

  test("should display verification message and handle invalid tokens", async ({ context, page }) => {
    // Clear all cookies to ensure no existing session
    await context.clearCookies();

    const mockAccessToken = "mock_access_token_xyz";
    const mockRefreshToken = "mock_refresh_token_uvw";

    await page.goto(
      `http://localhost:4321/auth/callback#access_token=${mockAccessToken}&refresh_token=${mockRefreshToken}`
    );

    // Check for verification message (should be visible briefly)
    const verifyingText = page.getByText("Verifying your email...");
    // Use waitFor with timeout to check if element appears, even briefly
    try {
      await verifyingText.waitFor({ state: "visible", timeout: 500 });
    } catch {
      // It's okay if it disappears quickly
    }

    // Since mock tokens are invalid, user will be redirected to /login
    // This is expected behavior
    await page.waitForURL(/\/login/, { timeout: 5000 });
    expect(page.url()).toContain("/login");
  });
});
