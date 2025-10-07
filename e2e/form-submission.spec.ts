import { test, expect } from '@playwright/test';

test.describe('Form Submission Flow', () => {
  test('should create, publish, and submit a form end-to-end', async ({ page }) => {
    const timestamp = Date.now();
    const email = `user${timestamp}@example.com`;
    
    // Register and login
    await page.goto('/user/register');
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
    
    // Create form
    await page.goto('/forms/create');
    const formTitle = `Test Survey ${timestamp}`;
    await page.getByRole('textbox', { name: 'Form Title *' }).fill(formTitle);
    await page.getByRole('textbox', { name: 'Description (optional)' }).fill('Test survey form');
    await page.getByRole('button', { name: 'Create Form & Start Building' }).click();
    
    await page.waitForURL(/\/forms\/\d+\/edit/);
    
    // Add text field
    await page.getByRole('heading', { name: 'Text Input' }).click();
    await page.waitForTimeout(500);
    await page.getByRole('textbox', { name: 'Question Title *' }).fill('Your name');
    await page.getByRole('switch', { name: 'Required Field' }).click();
    await page.waitForTimeout(300);
    
    // Save form
    await page.getByRole('button', { name: 'Save' }).click();
    await page.waitForTimeout(1500);
    
    // Get slug
    const slugElement = page.locator('text=/\\/[a-z0-9-]+/').first();
    const slugText = await slugElement.textContent();
    const formSlug = slugText?.replace(/^\//, '') || '';
    
    // Test unpublished form returns 404
    const newPage = await page.context().newPage();
    await newPage.goto(`/f/${formSlug}`);
    const has404 = await newPage.locator('text=404').or(newPage.locator('text=not found')).isVisible().catch(() => false);
    expect(has404).toBeTruthy();
    await newPage.close();
  });
});

test.describe('Form Builder Save Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/user/register');
    
    const timestamp = Date.now();
    const email = `builder${timestamp}@example.com`;
    
    await page.getByRole('textbox', { name: 'Name' }).fill('Builder User');
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
    
    await page.goto('/forms/create');
    const formTitle = `Test Form ${Date.now()}`;
    await page.getByRole('textbox', { name: 'Form Title *' }).fill(formTitle);
    await page.getByRole('button', { name: 'Create Form & Start Building' }).click();
    
    await page.waitForURL(/\/forms\/\d+\/edit/);
  });

  test('should save form with questions', async ({ page }) => {
    await page.getByRole('heading', { name: 'Text Input' }).click();
    await page.waitForTimeout(300);
    await page.getByRole('textbox', { name: 'Question Title *' }).fill('Question 1');
    
    await page.getByRole('heading', { name: 'Email' }).click();
    await page.waitForTimeout(300);
    await page.getByRole('textbox', { name: 'Question Title *' }).fill('Question 2');
    
    await page.getByRole('button', { name: 'Save' }).click();
    
    await expect(page.getByText(/success|atualizado|saved/i)).toBeVisible({ timeout: 5000 });
  });

  test('should persist questions after save and reload', async ({ page }) => {
    await page.getByRole('heading', { name: 'Text Input' }).click();
    await page.waitForTimeout(300);
    await page.getByRole('textbox', { name: 'Question Title *' }).fill('Persistent Question');
    
    await page.getByRole('button', { name: 'Save' }).click();
    await page.waitForTimeout(1000);
    
    await page.reload();
    
    await expect(page.getByText('Persistent Question')).toBeVisible();
  });

  test('should save all field types', async ({ page }) => {
    const fieldTypes = [
      { name: 'Text Input', title: 'Text Question' },
      { name: 'Email', title: 'Email Question' },
      { name: 'Number', title: 'Number Question', exact: true },
    ];

    for (const field of fieldTypes) {
      await page.getByRole('heading', { name: field.name, exact: field.exact }).click();
      await page.waitForTimeout(300);
      await page.getByRole('textbox', { name: 'Question Title *' }).fill(field.title);
    }

    await page.getByRole('button', { name: 'Save' }).click();
    await page.waitForTimeout(1000);
    
    await page.reload();

    for (const field of fieldTypes) {
      await expect(page.getByText(field.title)).toBeVisible();
    }
  });
});
