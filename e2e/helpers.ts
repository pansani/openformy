import { Page } from '@playwright/test';

export async function dismissDialogs(page: Page) {
  const skipButton = page.getByRole('button', { name: 'Skip for now' });
  if (await skipButton.isVisible({ timeout: 1000 }).catch(() => false)) {
    await skipButton.click();
    await page.waitForTimeout(300);
  }
  
  const continueButton = page.getByRole('button', { name: 'Continue' });
  if (await continueButton.isVisible({ timeout: 1000 }).catch(() => false)) {
    await continueButton.click();
    await page.waitForTimeout(300);
  }
}
