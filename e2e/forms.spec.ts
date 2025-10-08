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
    
    const textFieldHeading = page.getByRole('heading', { name: /^(Text Input|Short Text)$/ });
    await expect(textFieldHeading).toBeVisible();
    await textFieldHeading.click();
    
    await expect(page.getByRole('heading', { name: 'Field Settings' })).toBeVisible();
  });

  test('should add field to form', async ({ page }) => {
    await page.goto('/forms/create');
    
    const formTitle = `Add Field Test ${Date.now()}`;
    await page.getByRole('textbox', { name: 'Form Title *' }).fill(formTitle);
    await page.getByRole('button', { name: 'Create Form & Start Building' }).click();
    
    await page.waitForURL(/\/forms\/\d+\/edit/);
    
    await page.getByRole('heading', { name: /^(Text Input|Short Text)$/ }).click();
    
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
    await page.waitForTimeout(500);
    
    const formCard = page.locator('.group.relative').first();
    const editButton = formCard.locator('a[href*="/forms/"][href*="/edit"]').first();
    await editButton.click();
    
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
    
    await expect(page.getByText(formTitle)).toBeVisible();
    
    const formCard = page.locator(`text=${formTitle}`).locator('..').locator('..').locator('..');
    await expect(formCard.locator('button').first()).toBeVisible(); // Settings button
  });

  test('should disable preview button when form has no questions', async ({ page }) => {
    await page.goto('/forms/create');
    
    const formTitle = `No Questions Test ${Date.now()}`;
    await page.getByRole('textbox', { name: 'Form Title *' }).fill(formTitle);
    await page.getByRole('button', { name: 'Create Form & Start Building' }).click();
    
    await page.waitForURL(/\/forms\/\d+\/edit/);
    
    const previewButton = page.getByRole('button', { name: 'Preview' });
    await expect(previewButton).toBeVisible();
    await expect(previewButton).toBeDisabled();
  });

  test('should enable preview button when form has questions', async ({ page }) => {
    await page.goto('/forms/create');
    
    const formTitle = `With Questions Test ${Date.now()}`;
    await page.getByRole('textbox', { name: 'Form Title *' }).fill(formTitle);
    await page.getByRole('button', { name: 'Create Form & Start Building' }).click();
    
    await page.waitForURL(/\/forms\/\d+\/edit/);
    
    await page.getByRole('heading', { name: /^(Text Input|Short Text)$/ }).click();
    await page.getByRole('textbox', { name: 'Question Title *' }).fill('Test Question');
    await page.getByRole('button', { name: 'Save' }).click();
    await page.waitForTimeout(500);
    
    const previewButton = page.getByRole('button', { name: 'Preview' });
    await expect(previewButton).toBeVisible();
    await expect(previewButton).toBeEnabled();
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
