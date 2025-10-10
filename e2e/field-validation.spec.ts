import { test, expect } from "@playwright/test";
import { dismissDialogs } from "./helpers";

test.describe("Field Validation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/user/register");

    const timestamp = Date.now();
    const email = `test${timestamp}@example.com`;

    await page.getByRole("textbox", { name: "Name" }).fill("Test User");
    await page.getByRole("textbox", { name: "Email address" }).fill(email);
    await page
      .getByRole("textbox", { name: "Password" })
      .first()
      .fill("password123");
    await page
      .getByRole("textbox", { name: "Confirm Password" })
      .fill("password123");
    await page.getByRole("button", { name: "Create Account" }).click();

    await page.waitForURL(
      (url) => url.pathname === "/dashboard" || url.pathname === "/user/login",
      { timeout: 10000 },
    );

    if (page.url().includes("/user/login")) {
      await page.getByRole("textbox", { name: "Email address" }).fill(email);
      await page.getByRole("textbox", { name: "Password" }).fill("password123");
      await page.getByRole("button", { name: "Log in" }).click();
      await page.waitForURL("/dashboard", { timeout: 10000 });
    }

    await dismissDialogs(page);

    await page.goto("/forms/create");
    await page
      .getByRole("textbox", { name: "Form Title *" })
      .fill(`Validation Test ${timestamp}`);
    await page
      .getByRole("button", { name: "Create Form & Start Building" })
      .click();
    await page.waitForURL(/\/forms\/\d+\/edit/);

    await page.getByRole("heading", { name: "Email" }).click();
    await page
      .getByRole("textbox", { name: "Question Title *" })
      .fill("Email Address");

    await page.locator("#published").click();
    await page.waitForTimeout(500);

    await page.getByRole("button", { name: "Save" }).click();
    await page.waitForLoadState("networkidle");
  });

  test("should prevent advancing with invalid email", async ({ page }) => {
    await page.getByRole("link", { name: "Preview" }).click();
    await page.waitForLoadState("networkidle");

    const emailInput = page.locator('input[type="email"]').first();
    await expect(emailInput).toBeVisible();

    await emailInput.fill("invalid");
    await emailInput.blur();

    const nextButton = page.getByRole("button", { name: /next|submit/i });
    await expect(nextButton).toBeDisabled();
  });

  test("should prevent required email field from being empty", async ({
    page,
  }) => {
    await page.getByRole("link", { name: "Preview" }).click();
    await page.waitForLoadState("networkidle");

    const nextButton = page.getByRole("button", { name: /next|submit/i });
    await expect(nextButton).toBeDisabled();
  });

  test("should allow advancing with valid email", async ({ page }) => {
    await page.getByRole("link", { name: "Preview" }).click();
    await page.waitForLoadState("networkidle");

    const emailInput = page.locator('input[type="email"]').first();
    await emailInput.fill("valid@example.com");

    const submitButton = page.getByRole("button", { name: /submit/i });
    await expect(submitButton).toBeEnabled();
  });

  test("should prevent advancing with invalid URL", async ({ page }) => {
    const timestamp = Date.now();
    await page.goto("/forms/create");
    await page
      .getByRole("textbox", { name: "Form Title *" })
      .fill(`URL Validation ${timestamp}`);
    await page
      .getByRole("button", { name: "Create Form & Start Building" })
      .click();
    await page.waitForURL(/\/forms\/\d+\/edit/);

    await page.getByRole("heading", { name: "Link" }).click();
    await page
      .getByRole("textbox", { name: "Question Title *" })
      .fill("Website URL");

    await page.locator("#published").click();
    await page.waitForTimeout(500);

    await page.getByRole("button", { name: "Save" }).click();
    await page.waitForLoadState("networkidle");

    await page.getByRole("link", { name: "Preview" }).click();
    await page.waitForLoadState("networkidle");

    const urlInput = page.locator('input[type="url"]').first();
    await urlInput.fill("notavalidurl");

    const nextButton = page.getByRole("button", { name: /next|submit/i });
    await expect(nextButton).toBeDisabled();
  });

  test("should allow advancing with valid URL", async ({ page }) => {
    const timestamp = Date.now();
    await page.goto("/forms/create");
    await page
      .getByRole("textbox", { name: "Form Title *" })
      .fill(`URL Validation ${timestamp}`);
    await page
      .getByRole("button", { name: "Create Form & Start Building" })
      .click();
    await page.waitForURL(/\/forms\/\d+\/edit/);

    await page.getByRole("heading", { name: "Link" }).click();
    await page
      .getByRole("textbox", { name: "Question Title *" })
      .fill("Website URL");

    await page.locator("#published").click();
    await page.waitForTimeout(500);

    await page.getByRole("button", { name: "Save" }).click();
    await page.waitForLoadState("networkidle");

    await page.getByRole("link", { name: "Preview" }).click();
    await page.waitForLoadState("networkidle");

    const urlInput = page.locator('input[type="url"]').first();
    await urlInput.fill("https://example.com");

    const submitButton = page.getByRole("button", { name: /submit/i });
    await expect(submitButton).toBeEnabled();
  });
});
