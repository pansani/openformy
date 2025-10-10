import { dismissDialogs } from "./helpers";
import { test, expect } from '@playwright/test';

test.describe('Multi-Select Field Options', () => {
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
    const formTitle = `Multi-Select Test ${Date.now()}`;
    await page.getByRole('textbox', { name: 'Form Title *' }).fill(formTitle);
    await page.getByRole('button', { name: 'Create Form & Start Building' }).click();
    
    await page.waitForURL(/\/forms\/\d+\/edit/);
  });

  test('should initialize multi-select with default options', async ({ page }) => {
    await page.getByRole('heading', { name: 'Multi-Select', exact: true }).click();
    
    await expect(page.getByRole('heading', { name: 'Field Settings' })).toBeVisible();
    
    const optionsSection = page.locator('label:has-text("Options")').locator('..');
    const options = optionsSection.locator('input[type="text"]');
    
    const count = await options.count();
    expect(count).toBe(2);
    
    await expect(options.first()).toHaveValue('Option 1');
    await expect(options.last()).toHaveValue('Option 2');
  });

  test('should display multi-select options in preview', async ({ page }) => {
    await page.getByRole('heading', { name: 'Multi-Select', exact: true }).click();
    
    await page.waitForTimeout(500);
    
    const previewArea = page.locator('div:has(> h1)').filter({ hasText: /Multi-Select Test/ });
    const checkboxes = previewArea.locator('input[type="checkbox"]');
    
    const count = await checkboxes.count();
    expect(count).toBe(2);
    
    await expect(previewArea.getByText('Option 1')).toBeVisible();
    await expect(previewArea.getByText('Option 2')).toBeVisible();
  });

  test('should add new option to multi-select', async ({ page }) => {
    await page.getByRole('heading', { name: 'Multi-Select', exact: true }).click();
    
    await page.getByRole('button', { name: 'Add Option' }).click();
    
    const optionsSection = page.locator('label:has-text("Options")').locator('..');
    const options = optionsSection.locator('input[type="text"]');
    
    const count = await options.count();
    expect(count).toBe(3);
    
    await expect(options.last()).toHaveValue('Option 3');
  });

  test('should update preview when editing multi-select options', async ({ page }) => {
    await page.getByRole('heading', { name: 'Multi-Select', exact: true }).click();
    
    const optionsSection = page.locator('label:has-text("Options")').locator('..');
    const firstOption = optionsSection.locator('input[type="text"]').first();
    
    await firstOption.clear();
    await firstOption.fill('Custom Choice');
    
    await page.waitForTimeout(300);
    
    const previewArea = page.locator('div:has(> h1)').filter({ hasText: /Multi-Select Test/ });
    await expect(previewArea.getByText('Custom Choice')).toBeVisible();
  });

  test('should save and load multi-select options correctly', async ({ page }) => {
    await page.getByRole('heading', { name: 'Multi-Select', exact: true }).click();
    
    const optionsSection = page.locator('label:has-text("Options")').locator('..');
    const firstOption = optionsSection.locator('input[type="text"]').first();
    const secondOption = optionsSection.locator('input[type="text"]').nth(1);
    
    await firstOption.clear();
    await firstOption.fill('First Choice');
    await secondOption.clear();
    await secondOption.fill('Second Choice');
    
    await page.getByRole('textbox', { name: 'Question Title *' }).fill('Select Your Preferences');
    
    await page.getByRole('button', { name: 'Save' }).click();
    
    await page.waitForTimeout(1000);
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    await page.locator('h3:has-text("Select Your Preferences")').click();
    
    await page.waitForTimeout(500);
    
    const reloadedOptionsSection = page.locator('label:has-text("Options")').locator('..');
    const reloadedOptions = reloadedOptionsSection.locator('input[type="text"]');
    
    await expect(reloadedOptions.first()).toHaveValue('First Choice');
    await expect(reloadedOptions.nth(1)).toHaveValue('Second Choice');
  });

  test('should handle options in database object format', async ({ page }) => {
    await page.getByRole('heading', { name: 'Multi-Select', exact: true }).click();
    
    const optionsSection = page.locator('label:has-text("Options")').locator('..');
    const firstOption = optionsSection.locator('input[type="text"]').first();
    
    await firstOption.clear();
    await firstOption.fill('Database Option');
    
    await page.getByRole('button', { name: 'Save' }).click();
    await page.waitForTimeout(1000);
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    const previewArea = page.locator('div:has(> h1)').filter({ hasText: /Multi-Select Test/ });
    await expect(previewArea.getByText('Database Option')).toBeVisible();
  });

  test('should show multi-select in options editor list', async ({ page }) => {
    const selectionFields = ['Select Dropdown', 'Radio Buttons', 'Checkboxes', 'Multi-Select'];
    
    for (const fieldName of selectionFields) {
      await page.getByRole('heading', { name: fieldName }).click();
      await expect(page.getByRole('heading', { name: 'Field Settings' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Add Option' })).toBeVisible();
      
      const fieldSettingsPanel = page.locator('div:has(> div > h2:has-text("Field Settings"))');
      const closeButton = fieldSettingsPanel.locator('button').filter({ has: page.locator('svg.lucide-x') }).first();
      await closeButton.click();
      await page.waitForTimeout(500);
    }
  });

  test('should remove option from multi-select', async ({ page }) => {
    await page.getByRole('heading', { name: 'Multi-Select', exact: true }).click();
    
    await page.getByRole('button', { name: 'Add Option' }).click();
    
    const optionsSection = page.locator('label:has-text("Options")').locator('..');
    const deleteButtons = optionsSection.locator('button').filter({ has: page.locator('svg.lucide-x') });
    
    const initialCount = await optionsSection.locator('input[type="text"]').count();
    
    await deleteButtons.last().click();
    
    const updatedCount = await optionsSection.locator('input[type="text"]').count();
    expect(updatedCount).toBe(initialCount - 1);
  });

  test('should not show map error with array safety checks', async ({ page }) => {
    page.on('pageerror', (error) => {
      expect(error.message).not.toContain('.map is not a function');
    });

    await page.getByRole('heading', { name: 'Multi-Select', exact: true }).click();
    
    await page.waitForTimeout(500);
    
    const previewArea = page.locator('div:has(> h1)').filter({ hasText: /Multi-Select Test/ });
    const checkboxes = previewArea.locator('input[type="checkbox"]');
    
    await expect(checkboxes.first()).toBeVisible();
  });
});
