import { dismissDialogs } from "./helpers";
import { test, expect } from '@playwright/test';

test.describe.skip('Feedback Field Types', () => {
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
    const formTitle = `Feedback Fields Test ${Date.now()}`;
    await page.getByRole('textbox', { name: 'Form Title *' }).fill(formTitle);
    await page.getByRole('button', { name: 'Create Form & Start Building' }).click();
    
    await page.waitForURL(/\/forms\/\d+\/edit/);
  });

  test('should add and configure rating (stars) field', async ({ page }) => {
    await page.getByRole('heading', { name: 'Rating (Stars)' }).click();
    
    await expect(page.getByRole('heading', { name: 'Field Settings' })).toBeVisible();
    
    await page.getByRole('textbox', { name: 'Question Title *' }).fill('How would you rate our service?');
    await page.getByRole('textbox', { name: 'Description (optional)' }).fill('1 star = poor, 5 stars = excellent');
    
    await page.getByRole('switch', { name: 'Required Field' }).click();
    
    await page.getByRole('button', { name: 'Save' }).click();
    await page.waitForTimeout(500);
    
    await expect(page.getByText('How would you rate our service?')).toBeVisible();
    await expect(page.locator('p.text-sm.text-muted-foreground', { hasText: '1 star = poor, 5 stars = excellent' })).toBeVisible();
  });

  test('should add and configure opinion scale field', async ({ page }) => {
    await page.getByRole('heading', { name: 'Opinion Scale' }).click();
    
    await expect(page.getByRole('heading', { name: 'Field Settings' })).toBeVisible();
    
    await page.getByRole('textbox', { name: 'Question Title *' }).fill('How likely are you to recommend us?');
    await page.getByRole('textbox', { name: 'Description (optional)' }).fill('0 = Not at all likely, 10 = Extremely likely');
    
    await page.getByRole('button', { name: 'Save' }).click();
    await page.waitForTimeout(500);
    
    await expect(page.getByText('How likely are you to recommend us?')).toBeVisible();
    await expect(page.getByText('1 - Not likely')).toBeVisible();
    await expect(page.getByText('10 - Very likely')).toBeVisible();
  });

  test('should add and configure ranking field', async ({ page }) => {
    await page.getByRole('heading', { name: 'Ranking' }).click();
    
    await expect(page.getByRole('heading', { name: 'Field Settings' })).toBeVisible();
    
    await page.getByRole('textbox', { name: 'Question Title *' }).fill('Rank these features by importance');
    
    await page.getByRole('button', { name: 'Save' }).click();
    await page.waitForTimeout(500);
    
    await expect(page.getByText('Rank these features by importance')).toBeVisible();
    await expect(page.getByText('Option 1')).toBeVisible();
    await expect(page.getByText('Option 2')).toBeVisible();
    await expect(page.getByText('Option 3')).toBeVisible();
  });

  test('should add and configure matrix/grid field', async ({ page }) => {
    await page.getByRole('heading', { name: 'Matrix/Grid' }).click();
    
    await expect(page.getByRole('heading', { name: 'Field Settings' })).toBeVisible();
    
    await page.getByRole('textbox', { name: 'Question Title *' }).fill('Rate each feature');
    await page.getByRole('textbox', { name: 'Description (optional)' }).fill('Please rate all features');
    
    await page.getByRole('button', { name: 'Save' }).click();
    await page.waitForTimeout(500);
    
    await expect(page.getByText('Rate each feature')).toBeVisible();
    await expect(page.locator('table')).toBeVisible();
    await expect(page.getByText('Strongly Disagree')).toBeVisible();
    await expect(page.getByText('Strongly Agree')).toBeVisible();
    await expect(page.getByText('Row 1')).toBeVisible();
  });

  test('should verify feedback fields are in FEEDBACK category', async ({ page }) => {
    const feedbackSection = page.locator('h3:has-text("FEEDBACK")').locator('..');
    await expect(feedbackSection.getByRole('heading', { name: 'Rating (Stars)' })).toBeVisible();
    await expect(feedbackSection.getByRole('heading', { name: 'Opinion Scale' })).toBeVisible();
    await expect(feedbackSection.getByRole('heading', { name: 'Ranking' })).toBeVisible();
    await expect(feedbackSection.getByRole('heading', { name: 'Matrix/Grid' })).toBeVisible();
  });
});
