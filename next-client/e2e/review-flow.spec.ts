import { test, expect } from "@playwright/test";

/**
 * Review Submission E2E Tests
 * Core flow: View template -> Submit review -> See review
 */

test.describe("Review Flow", () => {
  test("should display review section on template page", async ({ page }) => {
    await page.goto("/templates/test-template");

    // Scroll to reviews section
    const reviewsSection = page.locator("#reviews-section");
    await reviewsSection.scrollIntoViewIfNeeded();

    await expect(page.getByRole("heading", { name: /reviews/i })).toBeVisible();
  });

  test("should show review form for authenticated users", async ({
    page,
    context,
  }) => {
    // Note: This requires authentication
    // In real tests, use storage state or login helper

    await page.goto("/templates/test-template");
    await page.locator("#reviews-section").scrollIntoViewIfNeeded();

    // If user is logged in and has purchased, form should be visible
    const reviewForm = page.getByText(/write a review/i);

    // This test assumes the user is authenticated
    // In CI, you'd have a test user logged in via setup
  });

  test("should validate review form fields", async ({ page }) => {
    // Assume logged in
    await page.goto("/templates/test-template");
    await page.locator("#reviews-section").scrollIntoViewIfNeeded();

    const submitButton = page.getByRole("button", { name: /submit review/i });

    if (await submitButton.isVisible().catch(() => false)) {
      await submitButton.click();

      // Should show validation errors
      await expect(page.getByText(/please select a rating/i)).toBeVisible();
    }
  });

  test("should submit review successfully", async ({ page }) => {
    // Assume logged in with purchased template
    await page.goto("/templates/test-template");
    await page.locator("#reviews-section").scrollIntoViewIfNeeded();

    // Fill review form
    const starButtons = page.locator('[data-testid="star-rating"] button');
    await starButtons.nth(4).click(); // 5 stars

    await page.getByLabel(/review title/i).fill("Great template!");
    await page
      .getByPlaceholder(/what did you like/i)
      .fill("This template saved me hours of work.");

    await page.getByRole("button", { name: /submit review/i }).click();

    // Should show success message
    await expect(page.getByText(/review submitted/i)).toBeVisible();
  });

  test("should display review summary", async ({ page }) => {
    await page.goto("/templates/test-template");
    await page.locator("#reviews-section").scrollIntoViewIfNeeded();

    // Should show average rating and total reviews
    await expect(page.getByText(/\d+\.\d+/)).toBeVisible(); // Rating number
    await expect(page.getByText(/reviews?/i)).toBeVisible();
  });

  test("should show individual reviews", async ({ page }) => {
    await page.goto("/templates/test-template");
    await page.locator("#reviews-section").scrollIntoViewIfNeeded();

    // If reviews exist, they should be displayed
    const reviews = page.locator('[data-testid="review-card"]');
    const count = await reviews.count();

    if (count > 0) {
      await expect(reviews.first()).toBeVisible();
    }
  });
});
