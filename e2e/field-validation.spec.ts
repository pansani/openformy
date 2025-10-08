import { test, expect } from '@playwright/test';

test.describe('Field Validation', () => {
  test('should prevent advancing with invalid email', async ({ page }) => {
    await page.goto('/demo/contact-us');
    await page.waitForTimeout(1000);
    
    const emailInput = page.locator('input[type="email"]').first();
    await expect(emailInput).toBeVisible();
    
    await emailInput.fill('jc');
    
    const nextButton = page.getByRole('button', { name: /next|submit/i });
    
    await expect(nextButton).toBeDisabled();
  });

  test('should prevent required email field from being empty', async ({ page }) => {
    await page.goto('/demo/contact-us');
    await page.waitForTimeout(1000);
    
    const nextButton = page.getByRole('button', { name: /next|submit/i });
    
    await expect(nextButton).toBeDisabled();
  });

  test('should allow advancing with valid email', async ({ page }) => {
    await page.goto('/demo/contact-us');
    await page.waitForTimeout(1000);
    
    const emailInput = page.locator('input[type="email"]').first();
    await emailInput.fill('valid@example.com');
    
    const nextButton = page.getByRole('button', { name: /next|submit/i });
    
    await expect(nextButton).toBeEnabled();
    await nextButton.click();
    await page.waitForTimeout(1000);
    
    await expect(page.locator('text=2 /')).toBeVisible();
  });

  test('should prevent advancing with invalid URL', async ({ page }) => {
    await page.goto('/demo/contact-us');
    await page.waitForTimeout(1000);
    
    const emailInput = page.locator('input[type="email"]').first();
    await emailInput.fill('valid@email.com');
    
    let nextButton = page.getByRole('button', { name: /next|submit/i });
    await nextButton.click();
    await page.waitForTimeout(1000);
    
    const phoneInput = page.locator('input[type="tel"]').first();
    const phoneVisible = await phoneInput.isVisible().catch(() => false);
    if (phoneVisible) {
      await phoneInput.fill('1234567890');
      nextButton = page.getByRole('button', { name: /next|submit/i });
      await nextButton.click();
      await page.waitForTimeout(1000);
    }
    
    const urlInput = page.locator('input[type="url"]').first();
    const urlVisible = await urlInput.isVisible().catch(() => false);
    
    if (urlVisible) {
      await urlInput.fill('notavalidurl');
      await page.waitForTimeout(500);
      
      nextButton = page.getByRole('button', { name: /next|submit/i });
      await expect(nextButton).toBeDisabled();
    } else {
      test.skip();
    }
  });

  test('should allow advancing with valid URL', async ({ page }) => {
    await page.goto('/demo/contact-us');
    await page.waitForTimeout(1000);
    
    const emailInput = page.locator('input[type="email"]').first();
    await emailInput.fill('valid@email.com');
    
    let nextButton = page.getByRole('button', { name: /next|submit/i });
    await nextButton.click();
    await page.waitForTimeout(1000);
    
    const phoneInput = page.locator('input[type="tel"]').first();
    const phoneVisible = await phoneInput.isVisible().catch(() => false);
    if (phoneVisible) {
      await phoneInput.fill('1234567890');
      nextButton = page.getByRole('button', { name: /next|submit/i });
      await nextButton.click();
      await page.waitForTimeout(1000);
    }
    
    const urlInput = page.locator('input[type="url"]').first();
    const urlVisible = await urlInput.isVisible().catch(() => false);
    
    if (urlVisible) {
      await urlInput.fill('https://example.com');
      await page.waitForTimeout(500);
      
      nextButton = page.getByRole('button', { name: /next|submit/i });
      await expect(nextButton).toBeEnabled();
    } else {
      test.skip();
    }
  });
});
