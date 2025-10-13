import { dismissDialogs } from "./helpers";
import { test, expect } from '@playwright/test';

test.describe.skip('Legal and Content Field Types', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/user/register');
    
    const timestamp = Date.now();
    const email = `test${timestamp}@example.com`;
    
    await page.getByRole('textbox', { name: 'Name' }).fill('Test User');
    await page.getByRole('textbox', { name: 'Email address' }).fill(email);
    await page.getByRole('textbox', { name: 'Password' }).first().fill('password123');
    await page.getByRole('textbox', { name: 'Confirm Password' }).fill('password123');
    await page.getByRole('button', { name: 'Create Account' }).click();
    
    await page.waitForURL(url => url.pathname === '/dashboard' || url.pathname === '/user/login', { timeout: 10000 });
    
    if (page.url().includes('/user/login')) {
      await page.getByRole('textbox', { name: 'Email address' }).fill(email);
      await page.getByRole('textbox', { name: 'Password' }).fill('password123');
      await page.getByRole('button', { name: 'Log in' }).click();
      await page.waitForURL('/dashboard', { timeout: 10000 });
    }
    
    await dismissDialogs(page);
    
    await page.goto('/forms/create');
    const formTitle = `Legal Fields Test ${Date.now()}`;
    await page.getByRole('textbox', { name: 'Form Title *' }).fill(formTitle);
    await page.getByRole('button', { name: 'Create Form & Start Building' }).click();
    
    await page.waitForURL(/\/forms\/\d+\/edit/);
  });

  test('should add and configure legal consent checkbox', async ({ page }) => {
    await page.getByRole('heading', { name: 'Legal Consent' }).click();
    
    await expect(page.getByRole('heading', { name: 'Field Settings' })).toBeVisible();
    
    await page.getByRole('textbox', { name: 'Question Title *' }).fill('Terms and Conditions');
    await page.getByRole('textbox', { name: 'Description (optional)' }).fill('Please review and accept our terms');
    
    await page.getByRole('switch', { name: 'Required Field' }).click();
    
    await page.getByRole('button', { name: 'Save' }).click();
    await page.waitForTimeout(500);
    
    await expect(page.getByRole('heading', { name: /^Terms and Conditions/ })).toBeVisible();
    await expect(page.getByText('I agree to the terms and conditions')).toBeVisible();
  });

  test('should add and configure statement field', async ({ page }) => {
    await page.getByRole('heading', { name: 'Statement' }).click();
    
    await expect(page.getByRole('heading', { name: 'Field Settings' })).toBeVisible();
    
    await page.getByRole('textbox', { name: 'Question Title *' }).fill('Important Notice');
    await page.getByRole('textbox', { name: 'Description (optional)' }).fill('Please read this carefully before proceeding');
    
    await page.getByRole('button', { name: 'Save' }).click();
    await page.waitForTimeout(500);
    
    await expect(page.getByText('Important Notice')).toBeVisible();
    await expect(page.getByText('This is informational text. No answer required.')).toBeVisible();
  });

  test('should verify legal consent field preview shows checkbox and text', async ({ page }) => {
    await page.getByRole('heading', { name: 'Legal Consent' }).click();
    
    await page.getByRole('textbox', { name: 'Question Title *' }).fill('GDPR Consent');
    
    await page.getByRole('button', { name: 'Save' }).click();
    await page.waitForTimeout(500);
    
    await expect(page.getByText('GDPR Consent')).toBeVisible();
    await expect(page.getByText('I agree to the terms and conditions')).toBeVisible();
    
    const checkbox = page.getByRole('checkbox').first();
    await expect(checkbox).toBeVisible();
  });

  test('should verify statement field shows informational styling', async ({ page }) => {
    await page.getByRole('heading', { name: 'Statement' }).click();
    
    await page.getByRole('textbox', { name: 'Question Title *' }).fill('Privacy Notice');
    
    await page.getByRole('button', { name: 'Save' }).click();
    await page.waitForTimeout(500);
    
    const statementBox = page.locator('div.border-l-4.border-blue-500').first();
    await expect(statementBox).toBeVisible();
  });

  test('should verify legal consent and statement are in CONTENT category', async ({ page }) => {
    const contentSection = page.locator('h3:has-text("CONTENT")').locator('..');
    
    await expect(contentSection.getByRole('heading', { name: 'Statement' })).toBeVisible();
    await expect(contentSection.getByRole('heading', { name: 'Legal Consent' })).toBeVisible();
  });

  test('should not show placeholder field for statement type', async ({ page }) => {
    await page.getByRole('heading', { name: 'Statement' }).click();
    
    await expect(page.getByRole('heading', { name: 'Field Settings' })).toBeVisible();
    
    await expect(page.getByRole('textbox', { name: 'Placeholder Text (optional)' })).not.toBeVisible();
  });

  test('should not show placeholder field for legal consent type', async ({ page }) => {
    await page.getByRole('heading', { name: 'Legal Consent' }).click();
    
    await expect(page.getByRole('heading', { name: 'Field Settings' })).toBeVisible();
    
    await expect(page.getByRole('textbox', { name: 'Placeholder Text (optional)' })).not.toBeVisible();
  });
});
