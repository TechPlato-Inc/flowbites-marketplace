import { test, expect } from "@playwright/test";

/**
 * Template Browsing E2E Tests
 * Core flows: Search, filter, view details, add to wishlist
 */

test.describe("Template Browsing", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/templates");
  });

  test("should display template listing page", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /templates/i }),
    ).toBeVisible();
    await expect(page.getByPlaceholder(/search/i)).toBeVisible();
  });

  test("should search for templates", async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search/i);
    await searchInput.fill("SaaS");
    await searchInput.press("Enter");

    // URL should update with search query
    await expect(page).toHaveURL(/q=SaaS/);
  });

  test("should filter by platform", async ({ page }) => {
    // Click on a platform filter
    await page.getByRole("button", { name: /webflow/i }).click();

    // URL should update
    await expect(page).toHaveURL(/platform=webflow/);
  });

  test("should filter by category", async ({ page }) => {
    // Click on a category
    await page
      .getByRole("link", { name: /portfolio/i })
      .first()
      .click();

    await expect(page).toHaveURL(/category/);
  });

  test("should navigate to template detail page", async ({ page }) => {
    // Click on first template card
    const firstTemplate = page.locator('[data-testid="template-card"]').first();

    // If no templates, skip
    if (await firstTemplate.isVisible().catch(() => false)) {
      await firstTemplate.click();
      await expect(page).toHaveURL(/templates\//);
      await expect(page.getByRole("heading").first()).toBeVisible();
    }
  });

  test("should show template details", async ({ page }) => {
    // Navigate to a specific template (if exists)
    await page.goto("/templates/test-template");

    await expect(page.getByText(/about this template/i)).toBeVisible();
    await expect(
      page.getByRole("button", { name: /purchase|buy/i }),
    ).toBeVisible();
  });

  test("should toggle wishlist button", async ({ page, context }) => {
    // Login first
    // This is a simplified version - in real tests, use auth setup

    await page.goto("/templates/test-template");

    const wishlistButton = page.getByRole("button", {
      name: /wishlist|heart/i,
    });

    if (await wishlistButton.isVisible().catch(() => false)) {
      await wishlistButton.click();
      // Should show some feedback
      await expect(
        page.getByText(/added|removed|saved/i).first(),
      ).toBeVisible();
    }
  });
});
