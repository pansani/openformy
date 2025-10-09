import { test, expect } from '@playwright/test';

test.describe('Dashboard Analytics', () => {
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

  test('should display dashboard for new user with empty state', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Dashboard', exact: true })).toBeVisible();
    await expect(page.getByText('Overview of your forms and responses')).toBeVisible();
    
    await expect(page.locator('div[data-slot="card-title"]').filter({ hasText: 'Total Forms' })).toBeVisible();
    await expect(page.locator('div[data-slot="card-title"]').filter({ hasText: 'Total Responses' })).toBeVisible();
    await expect(page.locator('div[data-slot="card-title"]').filter({ hasText: 'Active Forms' })).toBeVisible();
    await expect(page.locator('div[data-slot="card-title"]').filter({ hasText: 'Avg. Completion' })).toBeVisible();
    
    await expect(page.getByText('No responses yet')).toBeVisible();
    await expect(page.getByText('No forms yet')).toBeVisible();
    
    await expect(page.getByRole('button', { name: 'Create Your First Form' })).toBeVisible();
  });

  test('should navigate to form creation from empty state', async ({ page }) => {
    const createButton = page.getByRole('button', { name: 'Create Your First Form' });
    await expect(createButton).toBeVisible();
    await createButton.click();
    
    await expect(page).toHaveURL('/forms/create');
    await expect(page.getByRole('heading', { name: 'Create New Form' })).toBeVisible();
  });

  test('should display stats after creating a form', async ({ page }) => {
    await page.goto('/forms/create');
    
    const formTitle = `Dashboard Test Form ${Date.now()}`;
    await page.getByRole('textbox', { name: 'Form Title *' }).fill(formTitle);
    await page.getByRole('button', { name: 'Create Form & Start Building' }).click();
    
    await page.waitForURL(/\/forms\/\d+\/edit/);
    
    await page.goto('/dashboard');
    
    await expect(page.locator('div[data-slot="card-title"]').filter({ hasText: 'Total Forms' })).toBeVisible();
    
    await expect(page.getByText(formTitle)).toBeVisible();
    await expect(page.getByText('Draft')).toBeVisible();
  });

  test('should display chart component', async ({ page }) => {
    await expect(page.getByText('Responses Over Time')).toBeVisible();
    await expect(page.getByText('Last 30 days')).toBeVisible();
  });

  test('should show forms table with correct data', async ({ page }) => {
    await page.goto('/forms/create');
    
    const formTitle = `Table Test Form ${Date.now()}`;
    await page.getByRole('textbox', { name: 'Form Title *' }).fill(formTitle);
    await page.getByRole('button', { name: 'Create Form & Start Building' }).click();
    
    await page.waitForURL(/\/forms\/\d+\/edit/);
    
    await page.goto('/dashboard');
    
    await expect(page.locator('div[data-slot="card-title"]').filter({ hasText: 'Your Forms' })).toBeVisible();
    await expect(page.getByText(formTitle)).toBeVisible();
    await expect(page.getByText('0 responses')).toBeVisible();
    await expect(page.getByText('Draft')).toBeVisible();
  });

  test('should navigate from dashboard to form editor', async ({ page }) => {
    await page.goto('/forms/create');
    
    const formTitle = `Navigate Test ${Date.now()}`;
    await page.getByRole('textbox', { name: 'Form Title *' }).fill(formTitle);
    await page.getByRole('button', { name: 'Create Form & Start Building' }).click();
    
    await page.waitForURL(/\/forms\/\d+\/edit/);
    
    await page.goto('/dashboard');
    
    await expect(page.getByText(formTitle)).toBeVisible();
    const formLink = page.locator('a').filter({ hasText: formTitle }).first();
    await formLink.click();
    
    await expect(page).toHaveURL(/\/forms\/\d+\/edit/);
  });

  test('should show recent activity section', async ({ page }) => {
    await expect(page.locator('div[data-slot="card-title"]').filter({ hasText: 'Recent Activity' })).toBeVisible();
  });

  test('should display breadcrumbs', async ({ page }) => {
    await expect(page.locator('nav[aria-label="breadcrumb"]')).toBeVisible();
  });
});

test.describe('Dashboard Authorization', () => {
  test('should redirect unauthenticated users to login', async ({ page }) => {
    await page.goto('/dashboard');
    
    await expect(page.getByRole('heading', { name: '401' })).toBeVisible();
  });
});
