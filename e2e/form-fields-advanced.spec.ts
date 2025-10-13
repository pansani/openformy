import { dismissDialogs } from "./helpers";
import { test, expect } from '@playwright/test';

test.describe('Advanced Field Types', () => {
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
    const formTitle = `Advanced Fields Test ${Date.now()}`;
    await page.getByRole('textbox', { name: 'Form Title *' }).fill(formTitle);
    await page.getByRole('button', { name: 'Create Form & Start Building' }).click();
    
    await page.waitForURL(/\/forms\/\d+\/edit/);
  });

  test('should add and configure picture choice field', async ({ page }) => {
    await page.getByRole('heading', { name: 'Picture Choice' }).click();
    
    await expect(page.getByRole('heading', { name: 'Field Settings' })).toBeVisible();
    
    await page.getByRole('textbox', { name: 'Question Title *' }).fill('Which design do you prefer?');
    await page.getByRole('textbox', { name: 'Description (optional)' }).fill('Select your favorite design');
    
    await page.getByRole('button', { name: 'Save' }).click();
    await page.waitForTimeout(500);
    
    await expect(page.getByText('Which design do you prefer?')).toBeVisible();
    await expect(page.getByText('Option 1')).toBeVisible();
    await expect(page.getByText('Option 2')).toBeVisible();
    await expect(page.getByText('Option 3')).toBeVisible();
    await expect(page.getByText('Option 4')).toBeVisible();
  });

  test('should add and configure multi-select field', async ({ page }) => {
    await page.getByRole('heading', { name: 'Multi-Select' }).click();
    
    await expect(page.getByRole('heading', { name: 'Field Settings' })).toBeVisible();
    
    await page.getByRole('textbox', { name: 'Question Title *' }).fill('Select all that apply');
    await page.getByRole('textbox', { name: 'Description (optional)' }).fill('You can select multiple options');
    
    await page.getByRole('switch', { name: 'Required Field' }).click();
    
    await expect(page.getByText('Select all that apply')).toBeVisible();
  });

  test('should add and configure signature field', async ({ page }) => {
    await page.getByRole('heading', { name: 'Signature' }).click();
    
    await expect(page.getByRole('heading', { name: 'Field Settings' })).toBeVisible();
    
    await page.getByRole('textbox', { name: 'Question Title *' }).fill('Please sign below');
    await page.getByRole('textbox', { name: 'Description (optional)' }).fill('By signing, you agree to the terms');
    
    await page.getByRole('switch', { name: 'Required Field' }).click();
    
    await page.getByRole('button', { name: 'Save' }).click();
    await page.waitForTimeout(500);
    
    await expect(page.getByText('Please sign below')).toBeVisible();
    await expect(page.getByText('Sign here')).toBeVisible();
  });

  test.skip('should add and configure hidden field', async ({ page }) => {
    await page.getByRole('heading', { name: 'Hidden Field' }).click();
    
    await expect(page.getByRole('heading', { name: 'Field Settings' })).toBeVisible();
    
    await page.getByRole('textbox', { name: 'Question Title *' }).fill('utm_source');
    await page.getByRole('textbox', { name: 'Description (optional)' }).fill('Tracks referral source');
    
    await page.getByRole('button', { name: 'Save' }).click();
    await page.waitForTimeout(500);
    
    await expect(page.getByText('utm_source')).toBeVisible();
    await expect(page.getByText('Hidden field - not visible to users')).toBeVisible();
  });

  test('should verify picture choice is in SELECTION FIELDS category', async ({ page }) => {
    const selectionSection = page.locator('h3:has-text("SELECTION FIELDS")').locator('..');
    await expect(selectionSection.getByRole('heading', { name: 'Picture Choice' })).toBeVisible();
  });

  test('should verify multi-select is in SELECTION FIELDS category', async ({ page }) => {
    const selectionSection = page.locator('h3:has-text("SELECTION FIELDS")').locator('..');
    await expect(selectionSection.getByRole('heading', { name: 'Multi-Select' })).toBeVisible();
  });

  test('should verify signature is in INPUT FIELDS category', async ({ page }) => {
    const inputSection = page.locator('h3:has-text("INPUT FIELDS")').locator('..');
    await expect(inputSection.getByRole('heading', { name: 'Signature' })).toBeVisible();
  });

  test.skip('should verify hidden field is in CONTENT category', async ({ page }) => {
    const contentSection = page.locator('h3:has-text("CONTENT")').locator('..');
    await expect(contentSection.getByRole('heading', { name: 'Hidden Field' })).toBeVisible();
  });
});
