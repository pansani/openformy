import { test, expect } from '@playwright/test';
import { dismissDialogs } from './helpers';
import path from 'path';

test.describe('Logo Upload', () => {
  const logoPath = path.join(__dirname, 'fixtures', 'test-logo.png');

  test('should upload logo during registration', async ({ page }) => {
    await page.goto('/user/register');

    const timestamp = Date.now();
    const email = `logotest${timestamp}@example.com`;

    await page.getByRole('textbox', { name: 'Name' }).fill('Logo Test User');
    await page.getByRole('textbox', { name: 'Email address' }).fill(email);
    await page.getByRole('textbox', { name: 'Password' }).first().fill('password123');
    await page.getByRole('textbox', { name: 'Confirm Password' }).fill('password123');

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(logoPath);

    await expect(page.locator('img[alt="Logo preview"]')).toBeVisible();

    await page.getByRole('button', { name: 'Create Account' }).click();

    await page.waitForURL('/dashboard', { timeout: 10000 });
    await dismissDialogs(page);
  });

  test('should register without logo', async ({ page }) => {
    await page.goto('/user/register');

    const timestamp = Date.now();
    const email = `nologotest${timestamp}@example.com`;

    await page.getByRole('textbox', { name: 'Name' }).fill('No Logo User');
    await page.getByRole('textbox', { name: 'Email address' }).fill(email);
    await page.getByRole('textbox', { name: 'Password' }).first().fill('password123');
    await page.getByRole('textbox', { name: 'Confirm Password' }).fill('password123');

    await page.getByRole('button', { name: 'Create Account' }).click();

    await page.waitForURL('/dashboard', { timeout: 10000 });
    await dismissDialogs(page);
  });

  test('should upload logo in profile settings', async ({ page }) => {
    await page.goto('/user/register');

    const timestamp = Date.now();
    const email = `profilelogo${timestamp}@example.com`;

    await page.getByRole('textbox', { name: 'Name' }).fill('Profile Logo User');
    await page.getByRole('textbox', { name: 'Email address' }).fill(email);
    await page.getByRole('textbox', { name: 'Password' }).first().fill('password123');
    await page.getByRole('textbox', { name: 'Confirm Password' }).fill('password123');
    await page.getByRole('button', { name: 'Create Account' }).click();

    await page.waitForURL('/dashboard', { timeout: 10000 });
    await dismissDialogs(page);

    await page.goto('/profile/info');

    await expect(page.getByRole('heading', { name: 'Profile information' })).toBeVisible();

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(logoPath);

    await expect(page.locator('img[alt="Logo"]')).toBeVisible();

    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText('Saved')).toBeVisible({ timeout: 5000 });
  });

  test('should replace existing logo', async ({ page }) => {
    await page.goto('/user/register');

    const timestamp = Date.now();
    const email = `replacelogo${timestamp}@example.com`;

    await page.getByRole('textbox', { name: 'Name' }).fill('Replace Logo User');
    await page.getByRole('textbox', { name: 'Email address' }).fill(email);
    await page.getByRole('textbox', { name: 'Password' }).first().fill('password123');
    await page.getByRole('textbox', { name: 'Confirm Password' }).fill('password123');

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(logoPath);

    await expect(page.locator('img[alt="Logo preview"]')).toBeVisible();

    await page.getByRole('button', { name: 'Create Account' }).click();

    await page.waitForURL('/dashboard', { timeout: 10000 });
    await dismissDialogs(page);

    await page.goto('/profile/info');

    const fileInputProfile = page.locator('input[type="file"]');
    await fileInputProfile.setInputFiles(logoPath);

    await expect(page.locator('img[alt="Logo"]')).toBeVisible();

    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText('Saved')).toBeVisible({ timeout: 5000 });
  });
});
