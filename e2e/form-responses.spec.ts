import { test, expect } from '@playwright/test';

test.describe.configure({ mode: 'serial' });

test.describe('Form Responses Dashboard', () => {
  test('should view responses after form submission', async ({ page, context }) => {
    const timestamp = Date.now();
    const email = `user${timestamp}@example.com`;
    
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
    
    await page.goto('/forms/create');
    const formTitle = `Customer Survey ${timestamp}`;
    await page.getByRole('textbox', { name: 'Form Title *' }).fill(formTitle);
    await page.getByRole('textbox', { name: 'Description (optional)' }).fill('Customer feedback form');
    await page.getByRole('button', { name: 'Create Form & Start Building' }).click();
    
    await page.waitForURL(/\/forms\/\d+\/edit/);
    
    await page.getByRole('heading', { name: /^(Text Input|Short Text)$/ }).click();
    await page.waitForTimeout(800);
    
    await expect(page.getByRole('textbox', { name: 'Question Title *' })).toBeVisible();
    await page.getByRole('textbox', { name: 'Question Title *' }).fill('Your name');
    await page.getByRole('switch', { name: 'Required Field' }).click();
    await page.waitForTimeout(500);
    
    await page.getByRole('heading', { name: 'Email' }).click();
    await page.waitForTimeout(800);
    await expect(page.getByRole('textbox', { name: 'Question Title *' })).toBeVisible();
    await page.getByRole('textbox', { name: 'Question Title *' }).fill('Your email');
    await page.getByRole('switch', { name: 'Required Field' }).click();
    await page.waitForTimeout(500);
    
    await page.getByRole('switch', { name: /Published|Draft/ }).click();
    await page.waitForTimeout(500);
    
    await page.getByRole('button', { name: 'Save' }).click();
    await page.waitForTimeout(5000);
    
    const urlMatch = page.url().match(/\/forms\/(\d+)\/edit/);
    const formId = urlMatch ? urlMatch[1] : '';
    
    const previewLink = page.getByRole('link', { name: 'Preview' });
    const previewHref = await previewLink.getAttribute('href');
    
    const newPage = await context.newPage();
    await newPage.goto(previewHref || '');
    
    await newPage.waitForLoadState('domcontentloaded');
    await newPage.waitForSelector('h1', { timeout: 10000 });
    const formTitleOnPage = await newPage.locator('h1').first().textContent();
    expect(formTitleOnPage).toBe(formTitle);
    
    await newPage.waitForSelector('form', { timeout: 10000 });
    const nameInput = newPage.locator('input').first();
    const emailInput = newPage.locator('input').nth(1);
    await nameInput.fill('John Doe');
    await emailInput.fill('john@example.com');
    await newPage.getByRole('button', { name: 'Submit' }).click();
    await newPage.waitForURL(/thank-you/, { timeout: 10000 });
    
    await newPage.close();
    
    await page.goto(`/forms/${formId}/responses`);
    await page.waitForTimeout(1000);
    
    const totalResponsesCard = page.locator('text=Total Responses').locator('..').locator('p').last();
    await expect(totalResponsesCard).toHaveText('1');
    
    const completionRateCard = page.locator('text=Completion Rate').locator('..').locator('p').last();
    await expect(completionRateCard).toContainText('100');
    
    await expect(page.getByText('John Doe')).toBeVisible();
    await expect(page.getByText('Completed')).toBeVisible();
    
    await page.getByRole('button', { name: 'View' }).click();
    await page.waitForURL(/\/forms\/\d+\/responses\/\d+/);
    
    await expect(page.getByText('Your name')).toBeVisible();
    await expect(page.getByText('John Doe')).toBeVisible();
    await expect(page.getByText('Your email')).toBeVisible();
    await expect(page.getByText('john@example.com')).toBeVisible();
    await expect(page.locator('text=Completed').first()).toBeVisible();
  });

  test('should handle multiple responses and show correct stats', async ({ page, context }) => {
    const timestamp = Date.now();
    const email = `user${timestamp}@example.com`;
    
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
    
    await page.goto('/forms/create');
    const formTitle = `Multi Response Survey ${timestamp}`;
    await page.getByRole('textbox', { name: 'Form Title *' }).fill(formTitle);
    await page.getByRole('button', { name: 'Create Form & Start Building' }).click();
    
    await page.waitForURL(/\/forms\/\d+\/edit/);
    
    await page.getByRole('heading', { name: /^(Text Input|Short Text)$/ }).click();
    await page.waitForTimeout(800);
    await expect(page.getByRole('textbox', { name: 'Question Title *' })).toBeVisible();
    await page.getByRole('textbox', { name: 'Question Title *' }).fill('Your name');
    await page.waitForTimeout(500);
    
    await page.getByRole('switch', { name: /Published|Draft/ }).click();
    await page.waitForTimeout(500);
    
    await page.getByRole('button', { name: 'Save' }).click();
    await page.waitForTimeout(5000);
    
    const urlMatch = page.url().match(/\/forms\/(\d+)\/edit/);
    const formId = urlMatch ? urlMatch[1] : '';
    
    const names = ['Alice Smith', 'Bob Johnson', 'Charlie Brown'];
    
    const previewLink = page.getByRole('link', { name: 'Preview' });
    const previewHref = await previewLink.getAttribute('href');
    
    for (const name of names) {
      const newPage = await context.newPage();
      await newPage.goto(previewHref || '');
      await newPage.waitForLoadState('domcontentloaded');
      await newPage.waitForSelector('form', { timeout: 10000 });
      await newPage.locator('input').first().fill(name);
      await newPage.getByRole('button', { name: 'Submit' }).click();
      await newPage.waitForTimeout(1500);
      await newPage.close();
    }
    
    await page.goto(`/forms/${formId}/responses`);
    await page.waitForTimeout(1000);
    
    const totalResponsesCard = page.locator('text=Total Responses').locator('..').locator('p').last();
    await expect(totalResponsesCard).toHaveText('3');
    
    await expect(page.getByText('Alice Smith')).toBeVisible();
    await expect(page.getByText('Bob Johnson')).toBeVisible();
    await expect(page.getByText('Charlie Brown')).toBeVisible();
  });

  test('should search responses by IP and user agent', async ({ page, context }) => {
    const timestamp = Date.now();
    const email = `user${timestamp}@example.com`;
    
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
    
    await page.goto('/forms/create');
    await page.getByRole('textbox', { name: 'Form Title *' }).fill(`Search Test ${timestamp}`);
    await page.getByRole('button', { name: 'Create Form & Start Building' }).click();
    
    await page.waitForURL(/\/forms\/\d+\/edit/);
    
    await page.getByRole('heading', { name: /^(Text Input|Short Text)$/ }).click();
    await page.waitForTimeout(800);
    await expect(page.getByRole('textbox', { name: 'Question Title *' })).toBeVisible();
    await page.getByRole('textbox', { name: 'Question Title *' }).fill('Name');
    await page.waitForTimeout(500);
    
    await page.getByRole('switch', { name: /Published|Draft/ }).click();
    await page.waitForTimeout(500);
    
    await page.getByRole('button', { name: 'Save' }).click();
    await page.waitForTimeout(5000);
    
    const urlMatch = page.url().match(/\/forms\/(\d+)\/edit/);
    const formId = urlMatch ? urlMatch[1] : '';
    
    const previewLink = page.getByRole('link', { name: 'Preview' });
    const previewHref = await previewLink.getAttribute('href');
    
    const newPage = await context.newPage();
    await newPage.goto(previewHref || '');
    await newPage.waitForLoadState('domcontentloaded');
    await newPage.waitForSelector('input[type="text"]', { timeout: 10000 });
    await newPage.locator('input[type="text"]').first().fill('Search Test User');
    await newPage.getByRole('button', { name: 'Submit' }).click();
    await newPage.waitForTimeout(1500);
    await newPage.close();
    
    await page.goto(`/forms/${formId}/responses`);
    await page.waitForTimeout(1000);
    
    await expect(page.getByText('Search Test User')).toBeVisible();
    
    const searchBox = page.getByPlaceholder('Search by IP, user agent, or date...');
    await searchBox.fill('nonexistent-search-term');
    await page.waitForTimeout(500);
    
    await expect(page.getByText('No responses found')).toBeVisible();
    
    await page.getByRole('button', { name: 'Clear search' }).click();
    await page.waitForTimeout(500);
    
    await expect(page.getByText('Search Test User')).toBeVisible();
  });

  test('should access responses from form card', async ({ page }) => {
    const timestamp = Date.now();
    const email = `user${timestamp}@example.com`;
    
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
    
    await page.goto('/forms/create');
    await page.getByRole('textbox', { name: 'Form Title *' }).fill(`Card Test ${timestamp}`);
    await page.getByRole('button', { name: 'Create Form & Start Building' }).click();
    await page.waitForURL(/\/forms\/\d+\/edit/);
    
    const urlMatch = page.url().match(/\/forms\/(\d+)\/edit/);
    const formId = urlMatch ? urlMatch[1] : '';
    
    await page.goto('/forms');
    await page.waitForTimeout(1000);
    
    await page.goto(`/forms/${formId}/responses`);
    await page.waitForTimeout(1000);
    
    await expect(page.getByText('No responses yet')).toBeVisible();
    await expect(page.getByText('Share your form to start collecting responses')).toBeVisible();
  });
});
