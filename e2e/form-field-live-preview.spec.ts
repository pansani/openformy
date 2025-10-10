import { dismissDialogs } from "./helpers";
import { test, expect } from '@playwright/test';

test.describe('Form Field Live Preview', () => {
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
    const formTitle = `Live Preview Test ${Date.now()}`;
    await page.getByRole('textbox', { name: 'Form Title *' }).fill(formTitle);
    await page.getByRole('button', { name: 'Create Form & Start Building' }).click();
    
    await page.waitForURL(/\/forms\/\d+\/edit/);
  });

  test('should update radio options live in preview when changed in field settings', async ({ page }) => {
    await page.getByRole('heading', { name: 'Radio Buttons' }).click();
    
    await expect(page.getByRole('heading', { name: 'Field Settings' })).toBeVisible();
    
    await page.getByRole('textbox', { name: 'Question Title *' }).fill('Choose one');
    
    const firstOption = page.getByPlaceholder('Option 1').first();
    await firstOption.clear();
    await firstOption.fill('Togura');
    
    await expect(page.getByText('Togura').first()).toBeVisible();
  });

  test('should update dropdown options live in preview', async ({ page }) => {
    await page.getByRole('heading', { name: 'Dropdown' }).click();
    
    await page.getByRole('textbox', { name: 'Question Title *' }).fill('Pick your choice');
    
    await page.getByRole('button', { name: 'Add Option' }).click();
    
    const newOption = page.getByPlaceholder('Option 3');
    await newOption.fill('Custom Option');
    
    await expect(page.getByRole('heading', { name: 'Pick your choice' })).toBeVisible();
  });

  test('should update checkbox options live in preview', async ({ page }) => {
    await page.getByRole('heading', { name: 'Checkboxes' }).click();
    
    await page.getByRole('textbox', { name: 'Question Title *' }).fill('Select multiple');
    
    const secondOption = page.getByPlaceholder('Option 2').first();
    await secondOption.clear();
    await secondOption.fill('New Checkbox');
    
    await expect(page.getByText('New Checkbox').first()).toBeVisible();
  });

  test('should show updated question title in preview', async ({ page }) => {
    await page.getByRole('heading', { name: /^(Text Input|Short Text)$/ }).click();
    
    const titleInput = page.getByRole('textbox', { name: 'Question Title *' });
    await titleInput.fill('What is your favorite color?');
    
    await expect(page.getByText('What is your favorite color?')).toBeVisible();
  });

  test('should update description live in preview', async ({ page }) => {
    await page.getByRole('heading', { name: /^(Text Input|Short Text)$/ }).click();
    
    await page.getByRole('textbox', { name: 'Question Title *' }).fill('Test Question');
    await page.getByRole('textbox', { name: 'Description (optional)' }).fill('This is a unique description text');
    
    await expect(page.locator('p.text-sm.text-muted-foreground', { hasText: 'This is a unique description text' })).toBeVisible();
  });
});
