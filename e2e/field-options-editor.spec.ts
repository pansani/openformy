import { test, expect } from '@playwright/test';

test.describe('Field Options Editor', () => {
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
    const formTitle = `Options Editor Test ${Date.now()}`;
    await page.getByRole('textbox', { name: 'Form Title *' }).fill(formTitle);
    await page.getByRole('button', { name: 'Create Form & Start Building' }).click();
    
    await page.waitForURL(/\/forms\/\d+\/edit/);
  });

  test('should add new option to dropdown field', async ({ page }) => {
    await page.getByRole('heading', { name: 'Select Dropdown' }).click();
    
    await expect(page.getByRole('heading', { name: 'Field Settings' })).toBeVisible();
    
    const optionsSection = page.locator('label:has-text("Options")').locator('..');
    
    const initialOptions = optionsSection.locator('input[type="text"]');
    const initialCount = await initialOptions.count();
    
    await page.getByRole('button', { name: 'Add Option' }).click();
    
    const updatedOptions = optionsSection.locator('input[type="text"]');
    const updatedCount = await updatedOptions.count();
    
    expect(updatedCount).toBe(initialCount + 1);
  });

  test('should remove option from radio field', async ({ page }) => {
    await page.getByRole('heading', { name: 'Radio Buttons' }).click();
    
    await expect(page.getByRole('heading', { name: 'Field Settings' })).toBeVisible();
    
    await page.getByRole('button', { name: 'Add Option' }).click();
    await page.waitForTimeout(300);
    
    const optionsSection = page.locator('label:has-text("Options")').locator('..');
    const deleteButtons = optionsSection.locator('button').filter({ has: page.locator('svg.lucide-x') });
    
    const initialCount = await optionsSection.locator('input[type="text"]').count();
    
    await deleteButtons.last().click();
    await page.waitForTimeout(300);
    
    const updatedCount = await optionsSection.locator('input[type="text"]').count();
    expect(updatedCount).toBe(initialCount - 1);
  });

  test('should not allow removing last option', async ({ page }) => {
    await page.getByRole('heading', { name: 'Checkboxes' }).click();
    
    await expect(page.getByRole('heading', { name: 'Field Settings' })).toBeVisible();
    
    const optionsSection = page.locator('label:has-text("Options")').locator('..');
    
    const getDeleteButtons = () => optionsSection.locator('button').filter({ has: page.locator('svg.lucide-x') });
    
    const initialCount = await optionsSection.locator('input[type="text"]').count();
    
    await getDeleteButtons().first().click();
    await page.waitForTimeout(300);
    
    const afterFirstDelete = await optionsSection.locator('input[type="text"]').count();
    expect(afterFirstDelete).toBe(initialCount - 1);
    
    if (afterFirstDelete > 1) {
      await getDeleteButtons().first().click();
      await page.waitForTimeout(300);
    }
    
    const finalCount = await optionsSection.locator('input[type="text"]').count();
    expect(finalCount).toBeGreaterThanOrEqual(1);
    
    const deleteButtonsCount = await getDeleteButtons().count();
    if (finalCount === 1) {
      expect(deleteButtonsCount).toBe(0);
    }
  });

  test('should edit option label inline', async ({ page }) => {
    await page.getByRole('heading', { name: 'Select Dropdown' }).click();
    
    await expect(page.getByRole('heading', { name: 'Field Settings' })).toBeVisible();
    
    const optionsSection = page.locator('label:has-text("Options")').locator('..');
    const firstOption = optionsSection.locator('input[type="text"]').first();
    
    await firstOption.clear();
    await firstOption.fill('Custom Option Label');
    
    await expect(firstOption).toHaveValue('Custom Option Label');
  });

  test('should display options in horizontal row layout', async ({ page }) => {
    await page.getByRole('heading', { name: 'Radio Buttons' }).click();
    
    await expect(page.getByRole('heading', { name: 'Field Settings' })).toBeVisible();
    
    const optionsSection = page.locator('label:has-text("Options")').locator('..');
    const optionRow = optionsSection.locator('div.flex.items-center').first();
    
    await expect(optionRow).toBeVisible();
    
    const gripIcon = optionRow.locator('svg').first();
    const input = optionRow.locator('input[type="text"]');
    
    await expect(gripIcon).toBeVisible();
    await expect(input).toBeVisible();
  });

  test('should show grip handle for dragging options', async ({ page }) => {
    await page.getByRole('heading', { name: 'Checkboxes' }).click();
    
    await expect(page.getByRole('heading', { name: 'Field Settings' })).toBeVisible();
    
    const optionsSection = page.locator('label:has-text("Options")').locator('..');
    
    const gripHandles = optionsSection.locator('svg.lucide-grip-vertical');
    const count = await gripHandles.count();
    
    expect(count).toBeGreaterThan(0);
  });

  test('should add multiple options sequentially', async ({ page }) => {
    await page.getByRole('heading', { name: 'Select Dropdown' }).click();
    
    await expect(page.getByRole('heading', { name: 'Field Settings' })).toBeVisible();
    
    const addButton = page.getByRole('button', { name: 'Add Option' });
    
    await addButton.click();
    await page.waitForTimeout(200);
    await addButton.click();
    await page.waitForTimeout(200);
    await addButton.click();
    await page.waitForTimeout(200);
    
    const optionsSection = page.locator('label:has-text("Options")').locator('..');
    const options = await optionsSection.locator('input[type="text"]').count();
    
    expect(options).toBeGreaterThanOrEqual(5);
  });

  test('should show Add Option button for selection fields', async ({ page }) => {
    await page.getByRole('heading', { name: 'Radio Buttons' }).click();
    
    await expect(page.getByRole('heading', { name: 'Field Settings' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add Option' })).toBeVisible();
  });

  test('should not show options editor for text input fields', async ({ page }) => {
    await page.getByRole('heading', { name: 'Short Text' }).click();
    
    await expect(page.getByRole('heading', { name: 'Field Settings' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add Option' })).not.toBeVisible();
  });

  test('should show options editor for all selection fields', async ({ page }) => {
    const selectionFields = ['Select Dropdown', 'Radio Buttons', 'Checkboxes'];
    
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
});
