import { test, expect } from "@playwright/test";

/**
 * Authentication E2E Tests
 * Core flows: Login, Register, Password Reset
 */

test.describe("Authentication", () => {
  test.describe("Login Flow", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/login");
    });

    test("should display login form", async ({ page }) => {
      await expect(
        page.getByRole("heading", { name: /sign in/i }),
      ).toBeVisible();
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByLabel(/password/i)).toBeVisible();
      await expect(
        page.getByRole("button", { name: /sign in/i }),
      ).toBeVisible();
    });

    test("should show error for invalid credentials", async ({ page }) => {
      await page.getByLabel(/email/i).fill("invalid@example.com");
      await page.getByLabel(/password/i).fill("wrongpassword");
      await page.getByRole("button", { name: /sign in/i }).click();

      await expect(page.getByText(/invalid/i)).toBeVisible();
    });

    test("should show validation errors for empty fields", async ({ page }) => {
      await page.getByRole("button", { name: /sign in/i }).click();

      await expect(page.getByText(/email is required/i)).toBeVisible();
    });

    test("should navigate to forgot password", async ({ page }) => {
      await page.getByRole("link", { name: /forgot password/i }).click();
      await expect(page).toHaveURL(/forgot-password/);
    });

    test("should navigate to register", async ({ page }) => {
      await page.getByRole("link", { name: /sign up/i }).click();
      await expect(page).toHaveURL(/register/);
    });
  });

  test.describe("Register Flow", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/register");
    });

    test("should display registration form", async ({ page }) => {
      await expect(
        page.getByRole("heading", { name: /create account/i }),
      ).toBeVisible();
      await expect(page.getByLabel(/name/i)).toBeVisible();
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByLabel(/password/i)).toBeVisible();
    });

    test("should validate password requirements", async ({ page }) => {
      await page.getByLabel(/password/i).fill("short");
      await page.getByRole("button", { name: /create account/i }).click();

      await expect(page.getByText(/password must be at least/i)).toBeVisible();
    });

    test("should show error for existing email", async ({ page }) => {
      // This would need a known existing user in the test DB
      await page.getByLabel(/name/i).fill("Test User");
      await page.getByLabel(/email/i).fill("existing@example.com");
      await page.getByLabel(/password/i).fill("Password123!");
      await page.getByRole("button", { name: /create account/i }).click();

      // Error message depends on backend response
      await expect(
        page.getByText(/already exists|email already/i),
      ).toBeVisible();
    });
  });

  test.describe("Forgot Password Flow", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/forgot-password");
    });

    test("should display forgot password form", async ({ page }) => {
      await expect(
        page.getByRole("heading", { name: /reset password/i }),
      ).toBeVisible();
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(
        page.getByRole("button", { name: /send reset link/i }),
      ).toBeVisible();
    });

    test("should show success message after submission", async ({ page }) => {
      await page.getByLabel(/email/i).fill("test@example.com");
      await page.getByRole("button", { name: /send reset link/i }).click();

      await expect(
        page.getByText(/check your email|reset link sent/i),
      ).toBeVisible();
    });
  });
});
