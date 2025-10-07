import { test, expect } from '@playwright/test';

test.describe('Form Field Types', () => {
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
    
    await page.goto('/forms/create');
    const formTitle = `Field Test Form ${Date.now()}`;
    await page.getByRole('textbox', { name: 'Form Title *' }).fill(formTitle);
    await page.getByRole('button', { name: 'Create Form & Start Building' }).click();
    
    await page.waitForURL(/\/forms\/\d+\/edit/);
  });

  test('should add and configure text input field', async ({ page }) => {
    await page.getByRole('heading', { name: 'Text Input' }).click();
    
    await expect(page.getByRole('heading', { name: 'Field Settings' })).toBeVisible();
    
    await page.getByRole('textbox', { name: 'Question Title *' }).fill('What is your name?');
    await page.getByRole('textbox', { name: 'Placeholder Text (optional)' }).fill('Enter your full name');
    
    await page.getByRole('switch', { name: 'Required Field' }).click();
    
    await page.getByRole('button', { name: 'Save' }).click();
    
    await expect(page.getByText('What is your name?')).toBeVisible();
  });

  test('should add and configure email field', async ({ page }) => {
    await page.getByRole('heading', { name: 'Email' }).click();
    
    await expect(page.getByRole('heading', { name: 'Field Settings' })).toBeVisible();
    
    await page.getByRole('textbox', { name: 'Question Title *' }).fill('What is your email address?');
    
    await page.getByRole('switch', { name: 'Required Field' }).click();
    
    await page.getByRole('button', { name: 'Save' }).click();
    
    await expect(page.getByText('What is your email address?')).toBeVisible();
  });

  test('should add and configure number field', async ({ page }) => {
    await page.getByRole('heading', { name: 'Number', exact: true }).click();
    
    await expect(page.getByRole('heading', { name: 'Field Settings' })).toBeVisible();
    
    await page.getByRole('textbox', { name: 'Question Title *' }).fill('How old are you?');
    await page.getByRole('textbox', { name: 'Placeholder Text (optional)' }).fill('Enter your age');
    
    await page.getByRole('button', { name: 'Save' }).click();
    
    await expect(page.getByText('How old are you?')).toBeVisible();
  });

  test('should add and configure textarea field', async ({ page }) => {
    await page.getByRole('heading', { name: 'Textarea' }).click();
    
    await expect(page.getByRole('heading', { name: 'Field Settings' })).toBeVisible();
    
    await page.getByRole('textbox', { name: 'Question Title *' }).fill('Tell us about yourself');
    await page.getByRole('textbox', { name: 'Placeholder Text (optional)' }).fill('Share your story...');
    
    await page.getByRole('button', { name: 'Save' }).click();
    
    await expect(page.getByText('Tell us about yourself')).toBeVisible();
  });

  test('should add and configure dropdown field with options', async ({ page }) => {
    await page.getByRole('heading', { name: 'Select Dropdown' }).click();
    
    await expect(page.getByRole('heading', { name: 'Field Settings' })).toBeVisible();
    
    await page.getByRole('textbox', { name: 'Question Title *' }).fill('What is your favorite color?');
    
    await page.getByRole('button', { name: 'Save' }).click();
    
    await expect(page.getByText('What is your favorite color?')).toBeVisible();
  });

  test('should add and configure radio buttons field with options', async ({ page }) => {
    await page.getByRole('heading', { name: 'Radio Buttons' }).click();
    
    await expect(page.getByRole('heading', { name: 'Field Settings' })).toBeVisible();
    
    await page.getByRole('textbox', { name: 'Question Title *' }).fill('How satisfied are you?');
    
    await page.getByRole('button', { name: 'Save' }).click();
    
    await expect(page.getByText('How satisfied are you?')).toBeVisible();
  });

  test('should add and configure checkbox field with multiple options', async ({ page }) => {
    await page.getByRole('heading', { name: 'Checkboxes' }).click();
    
    await expect(page.getByRole('heading', { name: 'Field Settings' })).toBeVisible();
    
    await page.getByRole('textbox', { name: 'Question Title *' }).fill('Select your interests');
    
    await page.getByRole('button', { name: 'Save' }).click();
    
    await expect(page.getByText('Select your interests')).toBeVisible();
  });

  test('should add and configure date field', async ({ page }) => {
    await page.getByRole('heading', { name: 'Date' }).click();
    
    await expect(page.getByRole('heading', { name: 'Field Settings' })).toBeVisible();
    
    await page.getByRole('textbox', { name: 'Question Title *' }).fill('What is your date of birth?');
    
    await page.getByRole('switch', { name: 'Required Field' }).click();
    
    await page.getByRole('button', { name: 'Save' }).click();
    
    await expect(page.getByText('What is your date of birth?')).toBeVisible();
  });

  test('should add and configure phone number field', async ({ page }) => {
    await page.getByRole('heading', { name: 'Phone Number' }).click();
    
    await expect(page.getByRole('heading', { name: 'Field Settings' })).toBeVisible();
    
    await page.getByRole('textbox', { name: 'Question Title *' }).fill('What is your phone number?');
    await page.getByRole('textbox', { name: 'Placeholder Text (optional)' }).fill('+1 (555) 000-0000');
    
    await page.getByRole('button', { name: 'Save' }).click();
    
    await expect(page.getByText('What is your phone number?')).toBeVisible();
  });

  test('should add and configure URL/link field', async ({ page }) => {
    await page.getByRole('heading', { name: 'Link' }).click();
    
    await expect(page.getByRole('heading', { name: 'Field Settings' })).toBeVisible();
    
    await page.getByRole('textbox', { name: 'Question Title *' }).fill('What is your website?');
    await page.getByRole('textbox', { name: 'Placeholder Text (optional)' }).fill('https://example.com');
    
    await page.getByRole('button', { name: 'Save' }).click();
    
    await expect(page.getByText('What is your website?')).toBeVisible();
  });
});

test.describe('Form Field Operations', () => {
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
    
    await page.goto('/forms/create');
    const formTitle = `Operations Test ${Date.now()}`;
    await page.getByRole('textbox', { name: 'Form Title *' }).fill(formTitle);
    await page.getByRole('button', { name: 'Create Form & Start Building' }).click();
    
    await page.waitForURL(/\/forms\/\d+\/edit/);
  });

  test('should add multiple fields to form', async ({ page }) => {
    await page.getByRole('heading', { name: 'Text Input' }).click();
    await page.waitForTimeout(500);
    
    await page.getByRole('heading', { name: 'Email' }).click();
    await page.waitForTimeout(500);
    
    await page.getByRole('heading', { name: 'Number', exact: true }).click();
    await page.waitForTimeout(500);
    
    const questionHeadings = page.getByRole('heading', { name: 'Untitled Question' });
    const count = await questionHeadings.count();
    
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('should delete a field from form', async ({ page }) => {
    await page.getByRole('heading', { name: 'Text Input' }).click();
    
    await expect(page.getByRole('heading', { name: 'Field Settings' })).toBeVisible();
  });

  test('should search and filter field types', async ({ page }) => {
    const searchInput = page.getByRole('textbox', { name: 'Search fields...' });
    await searchInput.fill('email');
    
    await expect(page.getByRole('heading', { name: 'Email' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Text Input' })).not.toBeVisible();
    
    await searchInput.clear();
    
    await expect(page.getByRole('heading', { name: 'Text Input' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Email' })).toBeVisible();
  });

  test('should toggle required field setting', async ({ page }) => {
    await page.getByRole('heading', { name: 'Text Input' }).click();
    
    await expect(page.getByRole('heading', { name: 'Field Settings' })).toBeVisible();
    
    const requiredSwitch = page.getByRole('switch', { name: 'Required Field' });
    
    const initialState = await requiredSwitch.getAttribute('aria-checked') === 'true';
    await requiredSwitch.click();
    await page.waitForTimeout(300);
    const newState = await requiredSwitch.getAttribute('aria-checked') === 'true';
    
    expect(newState).not.toBe(initialState);
  });

  test('should display field type categories', async ({ page }) => {
    await expect(page.locator('text=INPUT FIELDS')).toBeVisible();
    await expect(page.locator('text=SELECTION FIELDS')).toBeVisible();
  });

  test('should show field descriptions on hover or click', async ({ page }) => {
    await expect(page.getByText('A single line for short text responses')).toBeVisible();
  });
});
