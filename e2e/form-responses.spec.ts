import { test, expect } from '@playwright/test';

test.describe('Form Responses Dashboard', () => {
  test('should view responses after form submission', async ({ page, context }) => {
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
    const formTitle = `Customer Survey ${timestamp}`;
    await page.getByRole('textbox', { name: 'Form Title *' }).fill(formTitle);
    await page.getByRole('textbox', { name: 'Description (optional)' }).fill('Customer feedback form');
    await page.getByRole('button', { name: 'Create Form & Start Building' }).click();
    
    await page.waitForURL(/\/forms\/\d+\/edit/);
    
    // Add text field
    await page.getByRole('heading', { name: 'Text Input' }).click();
    await page.waitForTimeout(800);
    
    // Wait for the field settings panel to appear
    await expect(page.getByRole('textbox', { name: 'Question Title *' })).toBeVisible();
    await page.getByRole('textbox', { name: 'Question Title *' }).fill('Your name');
    await page.getByRole('switch', { name: 'Required Field' }).click();
    await page.waitForTimeout(500);
    
    // Add email field
    await page.getByRole('heading', { name: 'Email' }).click();
    await page.waitForTimeout(800);
    await expect(page.getByRole('textbox', { name: 'Question Title *' })).toBeVisible();
    await page.getByRole('textbox', { name: 'Question Title *' }).fill('Your email');
    await page.getByRole('switch', { name: 'Required Field' }).click();
    await page.waitForTimeout(500);
    
    // Publish form
    await page.getByRole('switch', { name: /Published|Draft/ }).click();
    await page.waitForTimeout(500);
    
    // Save and publish
    await page.getByRole('button', { name: 'Save' }).click();
    await page.waitForTimeout(3000);
    
    // Get form slug
    const slugElement = page.locator('text=/\\/[a-z0-9-]+/').first();
    const slugText = await slugElement.textContent();
    const formSlug = slugText?.replace(/^\//, '') || '';
    
    // Get form ID from URL
    const urlMatch = page.url().match(/\/forms\/(\d+)\/edit/);
    const formId = urlMatch ? urlMatch[1] : '';
    
    // Submit form in new page (anonymous user)
    const newPage = await context.newPage();
    await newPage.goto(`/f/${formSlug}`);
    
    await newPage.waitForSelector('h1');
    const formTitleOnPage = await newPage.locator('h1').first().textContent();
    expect(formTitleOnPage).toBe(formTitle);
    
    // Fill and submit form
    await newPage.getByRole('textbox', { name: 'Your name *' }).fill('John Doe');
    await newPage.getByRole('textbox', { name: 'Your email *' }).fill('john@example.com');
    await newPage.getByRole('button', { name: 'Submit' }).click();
    await newPage.waitForTimeout(2000);
    
    await newPage.close();
    
    // Go to responses page
    await page.goto(`/forms/${formId}/responses`);
    await page.waitForTimeout(1000);
    
    // Verify analytics cards
    const totalResponsesCard = page.locator('text=Total Responses').locator('..').locator('p').last();
    await expect(totalResponsesCard).toHaveText('1');
    
    const completionRateCard = page.locator('text=Completion Rate').locator('..').locator('p').last();
    await expect(completionRateCard).toContainText('100');
    
    // Verify response in table
    await expect(page.getByText('John Doe')).toBeVisible();
    await expect(page.getByText('Completed')).toBeVisible();
    
    // Click view response
    await page.getByRole('button', { name: 'View' }).click();
    await page.waitForURL(/\/forms\/\d+\/responses\/\d+/);
    
    // Verify response details
    await expect(page.getByText('Your name')).toBeVisible();
    await expect(page.getByText('John Doe')).toBeVisible();
    await expect(page.getByText('Your email')).toBeVisible();
    await expect(page.getByText('john@example.com')).toBeVisible();
    await expect(page.locator('text=Completed').first()).toBeVisible();
  });

  test('should handle multiple responses and show correct stats', async ({ page, context }) => {
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
    const formTitle = `Multi Response Survey ${timestamp}`;
    await page.getByRole('textbox', { name: 'Form Title *' }).fill(formTitle);
    await page.getByRole('button', { name: 'Create Form & Start Building' }).click();
    
    await page.waitForURL(/\/forms\/\d+\/edit/);
    
    // Add text field
    await page.getByRole('heading', { name: 'Text Input' }).click();
    await page.waitForTimeout(800);
    await expect(page.getByRole('textbox', { name: 'Question Title *' })).toBeVisible();
    await page.getByRole('textbox', { name: 'Question Title *' }).fill('Your name');
    await page.waitForTimeout(500);
    
    // Publish form
    await page.getByRole('switch', { name: /Published|Draft/ }).click();
    await page.waitForTimeout(500);
    
    // Save and publish
    await page.getByRole('button', { name: 'Save' }).click();
    await page.waitForTimeout(3000);
    
    // Get form slug and ID
    const slugElement = page.locator('text=/\\/[a-z0-9-]+/').first();
    const slugText = await slugElement.textContent();
    const formSlug = slugText?.replace(/^\//, '') || '';
    
    const urlMatch = page.url().match(/\/forms\/(\d+)\/edit/);
    const formId = urlMatch ? urlMatch[1] : '';
    
    // Submit form 3 times with different names
    const names = ['Alice Smith', 'Bob Johnson', 'Charlie Brown'];
    
    for (const name of names) {
      const newPage = await context.newPage();
      await newPage.goto(`/f/${formSlug}`);
      await newPage.getByRole('textbox', { name: 'Your name' }).fill(name);
      await newPage.getByRole('button', { name: 'Submit' }).click();
      await newPage.waitForTimeout(1500);
      await newPage.close();
    }
    
    // Go to responses page
    await page.goto(`/forms/${formId}/responses`);
    await page.waitForTimeout(1000);
    
    // Verify total responses
    const totalResponsesCard = page.locator('text=Total Responses').locator('..').locator('p').last();
    await expect(totalResponsesCard).toHaveText('3');
    
    // Verify all responses appear in table
    await expect(page.getByText('Alice Smith')).toBeVisible();
    await expect(page.getByText('Bob Johnson')).toBeVisible();
    await expect(page.getByText('Charlie Brown')).toBeVisible();
  });

  test('should search responses by IP and user agent', async ({ page, context }) => {
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
    
    // Create and publish form
    await page.goto('/forms/create');
    await page.getByRole('textbox', { name: 'Form Title *' }).fill(`Search Test ${timestamp}`);
    await page.getByRole('button', { name: 'Create Form & Start Building' }).click();
    
    await page.waitForURL(/\/forms\/\d+\/edit/);
    
    await page.getByRole('heading', { name: 'Text Input' }).click();
    await page.waitForTimeout(800);
    await expect(page.getByRole('textbox', { name: 'Question Title *' })).toBeVisible();
    await page.getByRole('textbox', { name: 'Question Title *' }).fill('Name');
    await page.waitForTimeout(500);
    
    await page.getByRole('switch', { name: /Published|Draft/ }).click();
    await page.waitForTimeout(500);
    
    await page.getByRole('button', { name: 'Save' }).click();
    await page.waitForTimeout(3000);
    
    const slugElement = page.locator('text=/\\/[a-z0-9-]+/').first();
    const slugText = await slugElement.textContent();
    const formSlug = slugText?.replace(/^\//, '') || '';
    
    const urlMatch = page.url().match(/\/forms\/(\d+)\/edit/);
    const formId = urlMatch ? urlMatch[1] : '';
    
    // Submit form
    const newPage = await context.newPage();
    await newPage.goto(`/f/${formSlug}`);
    await newPage.getByRole('textbox', { name: 'Name' }).fill('Search Test User');
    await newPage.getByRole('button', { name: 'Submit' }).click();
    await newPage.waitForTimeout(1500);
    await newPage.close();
    
    // Go to responses and test search
    await page.goto(`/forms/${formId}/responses`);
    await page.waitForTimeout(1000);
    
    // Verify response is visible
    await expect(page.getByText('Search Test User')).toBeVisible();
    
    // Search for non-existent term
    const searchBox = page.getByPlaceholder('Search by IP, user agent, or date...');
    await searchBox.fill('nonexistent-search-term');
    await page.waitForTimeout(500);
    
    // Should show "No responses found"
    await expect(page.getByText('No responses found')).toBeVisible();
    
    // Clear search
    await page.getByRole('button', { name: 'Clear search' }).click();
    await page.waitForTimeout(500);
    
    // Response should be visible again
    await expect(page.getByText('Search Test User')).toBeVisible();
  });

  test('should access responses from form card', async ({ page }) => {
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
    await page.getByRole('textbox', { name: 'Form Title *' }).fill(`Card Test ${timestamp}`);
    await page.getByRole('button', { name: 'Create Form & Start Building' }).click();
    await page.waitForURL(/\/forms\/\d+\/edit/);
    
    // Get form ID from URL
    const urlMatch = page.url().match(/\/forms\/(\d+)\/edit/);
    const formId = urlMatch ? urlMatch[1] : '';
    
    // Go back to forms list
    await page.goto('/forms');
    await page.waitForTimeout(1000);
    
    // Navigate directly to responses page
    await page.goto(`/forms/${formId}/responses`);
    await page.waitForTimeout(1000);
    
    // Should see empty state
    await expect(page.getByText('No responses yet')).toBeVisible();
    await expect(page.getByText('Share your form to start collecting responses')).toBeVisible();
  });
});
