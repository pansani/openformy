import { test, expect } from '@playwright/test';

test.describe('Forms Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/user/register');
    
    const timestamp = Date.now();
    const email = `test${timestamp}@example.com`;
    
    await page.getByRole('textbox', { name: 'Name' }).fill('Test User');
    await page.getByRole('textbox', { name: 'Email address' }).fill(email);
    await page.getByRole('textbox', { name: 'Password' }).first().fill('password123');
    await page.getByRole('textbox', { name: 'Confirm Password' }).fill('password123');
    await page.getByRole('button', { name: 'Create Account' }).click();
    
    await page.waitForURL('/dashboard', { timeout: 10000 });
  });

  test('should create a new form', async ({ page }) => {
    await page.goto('/forms/create');
    
    await expect(page.getByRole('heading', { name: 'Create New Form' })).toBeVisible();
    
    const formTitle = `Test Form ${Date.now()}`;
    await page.getByRole('textbox', { name: 'Form Title *' }).fill(formTitle);
    await page.getByRole('textbox', { name: 'Description (optional)' }).fill('This is a test form description');
    
    await page.getByRole('button', { name: 'Create Form & Start Building' }).click();
    
    await page.waitForURL(/\/forms\/\d+\/edit/);
    
    await expect(page.getByRole('heading', { level: 1 }).first()).toContainText(formTitle);
  });

  test('should list all forms', async ({ page }) => {
    await page.goto('/forms/create');
    
    const formTitle = `List Test Form ${Date.now()}`;
    await page.getByRole('textbox', { name: 'Form Title *' }).fill(formTitle);
    await page.getByRole('textbox', { name: 'Description (optional)' }).fill('Description for listing');
    await page.getByRole('button', { name: 'Create Form & Start Building' }).click();
    
    await page.waitForURL(/\/forms\/\d+\/edit/);
    
    await page.goto('/forms');
    
    await expect(page.getByText(formTitle)).toBeVisible();
  });

  test('should edit form in form builder', async ({ page }) => {
    await page.goto('/forms/create');
    
    const formTitle = `Edit Test Form ${Date.now()}`;
    await page.getByRole('textbox', { name: 'Form Title *' }).fill(formTitle);
    await page.getByRole('textbox', { name: 'Description (optional)' }).fill('Form to edit');
    await page.getByRole('button', { name: 'Create Form & Start Building' }).click();
    
    await page.waitForURL(/\/forms\/\d+\/edit/);
    
    await expect(page.getByRole('heading', { name: 'INPUT FIELDS' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Text Input' })).toBeVisible();
    
    await page.getByRole('heading', { name: 'Text Input' }).click();
    
    await expect(page.getByRole('heading', { name: 'Field Settings' })).toBeVisible();
  });

  test('should add field to form', async ({ page }) => {
    await page.goto('/forms/create');
    
    const formTitle = `Add Field Test ${Date.now()}`;
    await page.getByRole('textbox', { name: 'Form Title *' }).fill(formTitle);
    await page.getByRole('button', { name: 'Create Form & Start Building' }).click();
    
    await page.waitForURL(/\/forms\/\d+\/edit/);
    
    await page.getByRole('heading', { name: 'Text Input' }).click();
    
    await expect(page.getByRole('heading', { name: 'Field Settings' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Question Title *' })).toBeVisible();
  });

  test('should navigate between forms list and form builder', async ({ page }) => {
    await page.goto('/forms/create');
    
    const formTitle = `Navigation Test ${Date.now()}`;
    await page.getByRole('textbox', { name: 'Form Title *' }).fill(formTitle);
    await page.getByRole('button', { name: 'Create Form & Start Building' }).click();
    
    await page.waitForURL(/\/forms\/\d+\/edit/);
    
    await page.getByRole('button', { name: 'Back' }).click();
    
    await expect(page).toHaveURL('/forms');
    
    await page.getByRole('link', { name: 'Configure' }).first().click();
    
    await expect(page).toHaveURL(/\/forms\/\d+\/edit/);
  });

  test('should display form slug', async ({ page }) => {
    await page.goto('/forms/create');
    
    const formTitle = `Slug Test Form ${Date.now()}`;
    await page.getByRole('textbox', { name: 'Form Title *' }).fill(formTitle);
    await page.getByRole('button', { name: 'Create Form & Start Building' }).click();
    
    await page.waitForURL(/\/forms\/\d+\/edit/);
    
    await expect(page.getByText(/\/slug-test-form/)).toBeVisible();
  });

  test('should show form action buttons in card', async ({ page }) => {
    await page.goto('/forms/create');
    
    const formTitle = `Buttons Test ${Date.now()}`;
    await page.getByRole('textbox', { name: 'Form Title *' }).fill(formTitle);
    await page.getByRole('button', { name: 'Create Form & Start Building' }).click();
    
    await page.waitForURL(/\/forms\/\d+\/edit/);
    
    await page.goto('/forms');
    await page.waitForTimeout(1000);
    
    // The form card should be visible
    await expect(page.getByText(formTitle)).toBeVisible();
    
    // Form card has 3 icon buttons: Configure (settings), Responses (chart), View (eye)
    const formCard = page.locator(`text=${formTitle}`).locator('..').locator('..').locator('..');
    await expect(formCard.locator('button').first()).toBeVisible(); // Settings button
  });
});

test.describe('Forms Authorization', () => {
  test('should show 401 error for unauthenticated users', async ({ page }) => {
    await page.goto('/forms');
    
    await expect(page.getByRole('heading', { name: '401' })).toBeVisible();
  });

  test('should show 401 error for unauthenticated users trying to create form', async ({ page }) => {
    await page.goto('/forms/create');
    
    await expect(page.getByRole('heading', { name: '401' })).toBeVisible();
  });
});
