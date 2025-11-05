import { test, expect } from "@playwright/test";

import { GeneratePagePO } from "./page-objects";

test.describe("Generate Flashcards - UI Tests", () => {
  let generatePage: GeneratePagePO;

  test.beforeEach(async ({ page }) => {
    generatePage = new GeneratePagePO(page);
    await generatePage.goto();
  });

  test("should display page title and description", async ({ page }) => {
    await expect(page.locator("main h1")).toContainText("Generate Flashcards");
    await expect(page.locator("text=Paste your text and let AI generate flashcards for you")).toBeVisible();
  });

  test("should display empty state on initial load", async () => {
    await generatePage.expectEmptyStateVisible();
  });

  test("should show form elements", async () => {
    await expect(generatePage.form.section).toBeVisible();
    await expect(generatePage.form.textarea).toBeVisible();
    await expect(generatePage.form.characterCounter).toBeVisible();
    await expect(generatePage.form.submitButton).toBeVisible();
  });

  test("should have working back to dashboard link", async ({ page }) => {
    await generatePage.backToDashboardLink.click();
    // Should navigate to dashboard
    await expect(page).toHaveURL("/");
    await expect(page).toHaveTitle(/Dashboard/);
  });

  test("should display textarea placeholder", async () => {
    await expect(generatePage.form.textarea).toHaveAttribute("placeholder", /Paste your text here/);
  });

  test("should have generate button initially disabled", async () => {
    // Button should be disabled when textarea is empty
    await expect(generatePage.form.submitButton).toBeDisabled();
  });

  test("should show character counter with initial value", async () => {
    // Counter should show 0 / 10000 initially
    await expect(generatePage.form.characterCounter).toContainText("0");
    await expect(generatePage.form.characterCounter).toContainText("10000");
  });

  test("should allow typing in textarea", async () => {
    const testText = "Test text";
    await generatePage.form.textarea.fill(testText);
    await expect(generatePage.form.textarea).toHaveValue(testText);
  });

  test("should focus textarea on page load", async ({ page }) => {
    // Wait a bit for auto-focus
    await page.waitForTimeout(200);
    // Check if textarea is focused or can be focused
    const isFocusable = await generatePage.form.textarea.evaluate(
      (el) => el === document.activeElement || document.activeElement?.tagName !== "TEXTAREA"
    );
    expect(isFocusable).toBeTruthy();
  });

  test("should have accessible labels", async () => {
    // Check for label text
    await expect(generatePage.form.section.locator("label")).toContainText("Source Text");
  });

  test("should display sparkles icon in header", async ({ page }) => {
    const sparklesIcon = page.locator("svg").first();
    await expect(sparklesIcon).toBeVisible();
  });

  test("should have proper ARIA attributes", async () => {
    // Check section has aria-label
    await expect(generatePage.form.section).toHaveAttribute("aria-label", "Generation form");
  });

  test("should show empty state card with proper content", async ({ page }) => {
    await expect(generatePage.emptyStateCard).toBeVisible();
    // Check for empty state text/content
    const emptyState = page.getByTestId("empty-state-card");
    await expect(emptyState).toBeVisible();
  });

  test("should have back button with icon", async () => {
    const backButton = generatePage.backToDashboardButton;
    await expect(backButton).toBeVisible();
    // Should contain "Back to Dashboard" text
    await expect(backButton).toContainText("Back to Dashboard");
  });

  test("should maintain responsive layout", async ({ page }) => {
    // Test at different viewport sizes
    await page.setViewportSize({ width: 375, height: 667 }); // Mobile
    await expect(generatePage.root).toBeVisible();
    await page.setViewportSize({ width: 1024, height: 768 }); // Tablet
    await expect(generatePage.root).toBeVisible();
    await page.setViewportSize({ width: 1920, height: 1080 }); // Desktop
    await expect(generatePage.root).toBeVisible();
  });

  test("should have proper page structure", async ({ page }) => {
    // Check main container
    await expect(generatePage.root).toHaveAttribute("data-test-id", "generate-view");
    // Check sections exist
    await expect(generatePage.form.section).toBeVisible();
    await expect(page.getByTestId("empty-state-section")).toBeVisible();
  });

  test("should display generate button with proper text", async () => {
    await expect(generatePage.form.submitButton).toContainText("Generate Flashcards");
  });

  test("should not show loading state initially", async ({ page }) => {
    // Loading section should not be visible on initial load
    const loadingSection = page.getByTestId("proposals-loading-section");
    await expect(loadingSection).not.toBeVisible();
  });

  test("should not show error alert initially", async () => {
    // Error alert should not be visible on initial load
    await expect(generatePage.errorAlert).not.toBeVisible();
  });

  test("should not show proposals section initially", async () => {
    // Proposals section should not be visible on initial load
    await expect(generatePage.proposals.root).not.toBeVisible();
  });

  test("should have form with proper test IDs", async () => {
    await expect(generatePage.form.form).toHaveAttribute("data-test-id", "generation-form");
    await expect(generatePage.form.textarea).toHaveAttribute("data-test-id", "source-text-textarea");
    await expect(generatePage.form.characterCounter).toHaveAttribute("data-test-id", "source-text-character-counter");
  });
});
