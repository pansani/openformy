import { dismissDialogs } from "./helpers";
import { test, expect } from '@playwright/test';

test.describe('Date and Time Field Types', () => {
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
    const formTitle = `DateTime Fields Test ${Date.now()}`;
    await page.getByRole('textbox', { name: 'Form Title *' }).fill(formTitle);
    await page.getByRole('button', { name: 'Create Form & Start Building' }).click();
    
    await page.waitForURL(/\/forms\/\d+\/edit/);
  });

  test('should add and configure date field', async ({ page }) => {
    await page.getByRole('heading', { name: 'Date', exact: true }).click();
    
    await expect(page.getByRole('heading', { name: 'Field Settings' })).toBeVisible();
    
    await page.getByRole('textbox', { name: 'Question Title *' }).fill('What is your date of birth?');
    await page.getByRole('textbox', { name: 'Description (optional)' }).fill('Please select your birthdate');
    
    await page.getByRole('switch', { name: 'Required Field' }).click();
    
    await page.getByRole('button', { name: 'Save' }).click();
    await page.waitForTimeout(500);
    
    await expect(page.getByText('What is your date of birth?')).toBeVisible();
    await expect(page.locator('p.text-sm.text-muted-foreground', { hasText: 'Please select your birthdate' })).toBeVisible();
  });

  test('should add and configure time picker field', async ({ page }) => {
    await page.getByRole('heading', { name: 'Time', exact: true }).click();
    
    await expect(page.getByRole('heading', { name: 'Field Settings' })).toBeVisible();
    
    await page.getByRole('textbox', { name: 'Question Title *' }).fill('What time works best for you?');
    await page.getByRole('textbox', { name: 'Description (optional)' }).fill('Select your preferred meeting time');
    
    await page.getByRole('switch', { name: 'Required Field' }).click();
    
    await page.getByRole('button', { name: 'Save' }).click();
    await page.waitForTimeout(500);
    
    await expect(page.getByText('What time works best for you?')).toBeVisible();
  });

  test('should add and configure date range field', async ({ page }) => {
    await page.getByRole('heading', { name: 'Date Range' }).click();
    
    await expect(page.getByRole('heading', { name: 'Field Settings' })).toBeVisible();
    
    await page.getByRole('textbox', { name: 'Question Title *' }).fill('When are you available?');
    await page.getByRole('textbox', { name: 'Description (optional)' }).fill('Select your availability window');
    
    await page.getByRole('switch', { name: 'Required Field' }).click();
    
    await page.getByRole('button', { name: 'Save' }).click();
    await page.waitForTimeout(500);
    
    await expect(page.getByText('When are you available?')).toBeVisible();
    await expect(page.getByText('Start Date', { exact: true })).toBeVisible();
    await expect(page.getByText('End Date', { exact: true })).toBeVisible();
  });

  test('should verify all datetime fields are in INPUT FIELDS category', async ({ page }) => {
    const inputSection = page.locator('h3:has-text("INPUT FIELDS")').locator('..');
    
    await expect(inputSection.getByRole('heading', { name: 'Date', exact: true })).toBeVisible();
    await expect(inputSection.getByRole('heading', { name: 'Time', exact: true })).toBeVisible();
    await expect(inputSection.getByRole('heading', { name: 'Date Range' })).toBeVisible();
  });

  test('should show date input preview with proper type', async ({ page }) => {
    await page.getByRole('heading', { name: 'Date', exact: true }).click();
    
    await page.getByRole('textbox', { name: 'Question Title *' }).fill('Select a date');
    
    await page.getByRole('button', { name: 'Save' }).click();
    await page.waitForTimeout(500);
    
    const dateInput = page.locator('input[type="date"]').first();
    await expect(dateInput).toBeVisible();
    await expect(dateInput).toBeDisabled();
  });

  test('should show time input preview with proper type', async ({ page }) => {
    await page.getByRole('heading', { name: 'Time', exact: true }).click();
    
    await page.getByRole('textbox', { name: 'Question Title *' }).fill('Select a time');
    
    await page.getByRole('button', { name: 'Save' }).click();
    await page.waitForTimeout(500);
    
    const timeInput = page.locator('input[type="time"]').first();
    await expect(timeInput).toBeVisible();
    await expect(timeInput).toBeDisabled();
  });

  test('should show two date inputs for date range field', async ({ page }) => {
    await page.getByRole('heading', { name: 'Date Range' }).click();
    
    await page.getByRole('textbox', { name: 'Question Title *' }).fill('Select date range');
    
    await page.getByRole('button', { name: 'Save' }).click();
    await page.waitForTimeout(500);
    
    const dateInputs = page.locator('input[type="date"]');
    await expect(dateInputs).toHaveCount(2);
  });
});
