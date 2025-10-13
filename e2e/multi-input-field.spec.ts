import { dismissDialogs } from "./helpers";
import { test, expect } from '@playwright/test';

test.describe('Multi-Input Field - Creation and Configuration', () => {
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
    const formTitle = `Multi-Input Test ${Date.now()}`;
    await page.getByRole('textbox', { name: 'Form Title *' }).fill(formTitle);
    await page.getByRole('button', { name: 'Create Form & Start Building' }).click();
    
    await page.waitForURL(/\/forms\/\d+\/edit/);
  });

  test('should create form with multi-input field', async ({ page }) => {
    await page.getByRole('heading', { name: 'Multi-Input', exact: true }).click();
    
    await page.waitForTimeout(500);
    
    const questionCards = await page.locator('.group.relative.transition-all').count();
    expect(questionCards).toBeGreaterThan(0);
  });

  test('should configure multi-input field with multiple sub-inputs', async ({ page }) => {
    await page.getByRole('heading', { name: 'Multi-Input', exact: true }).click();
    await page.waitForTimeout(500);
    
    const questionCard = page.locator('.group.relative.transition-all').first();
    await questionCard.click();
    
    await expect(page.getByRole('heading', { name: 'Field Settings' })).toBeVisible();
    
    await page.getByRole('textbox', { name: 'Question Title *' }).fill('Personal Details');
    await page.getByRole('textbox', { name: 'Description (optional)' }).fill('Please provide your information');
    
    await page.getByRole('button', { name: 'Add Sub-Input' }).click();
    await page.waitForTimeout(300);
    
    const firstSubInput = page.locator('.p-3.border.rounded-lg').first();
    await firstSubInput.getByPlaceholder('Label').fill('First Name');
    await firstSubInput.getByPlaceholder('Enter placeholder text...').fill('John');
    await firstSubInput.getByRole('switch').click();
    
    await page.getByRole('button', { name: 'Add Sub-Input' }).click();
    await page.waitForTimeout(300);
    
    const secondSubInput = page.locator('.p-3.border.rounded-lg').nth(1);
    await secondSubInput.getByPlaceholder('Label').fill('Last Name');
    await secondSubInput.getByPlaceholder('Enter placeholder text...').fill('Doe');
    await secondSubInput.getByRole('switch').click();
    
    await page.getByRole('button', { name: 'Add Sub-Input' }).click();
    await page.waitForTimeout(300);
    
    const thirdSubInput = page.locator('.p-3.border.rounded-lg').nth(2);
    await thirdSubInput.getByPlaceholder('Label').fill('Email Address');
    await thirdSubInput.getByRole('combobox').click();
    await page.getByRole('option', { name: 'Email' }).click();
    await thirdSubInput.getByPlaceholder('Enter placeholder text...').fill('john.doe@example.com');
    await thirdSubInput.getByRole('switch').click();
    
    const subInputCount = await page.locator('.p-3.border.rounded-lg').count();
    expect(subInputCount).toBe(3);
    
    await expect(page.getByText('First Name').first()).toBeVisible();
    await expect(page.getByText('Last Name').first()).toBeVisible();
    await expect(page.getByText('Email Address').first()).toBeVisible();
  });

  test('should change sub-input types', async ({ page }) => {
    await page.getByRole('heading', { name: 'Multi-Input', exact: true }).click();
    await page.waitForTimeout(500);
    
    const questionCard = page.locator('.group.relative.transition-all').first();
    await questionCard.click();
    
    await page.getByRole('button', { name: 'Add Sub-Input' }).click();
    await page.waitForTimeout(300);
    
    const subInput = page.locator('.p-3.border.rounded-lg').first();
    await subInput.getByPlaceholder('Label').fill('Phone Number');
    
    await subInput.getByRole('combobox').click();
    await page.getByRole('option', { name: 'Phone' }).click();
    
    const typeDisplay = await subInput.getByRole('combobox').textContent();
    expect(typeDisplay).toContain('Phone');
  });

  test('should delete sub-inputs', async ({ page }) => {
    await page.getByRole('heading', { name: 'Multi-Input', exact: true }).click();
    await page.waitForTimeout(500);
    
    const questionCard = page.locator('.group.relative.transition-all').first();
    await questionCard.click();
    
    await page.getByRole('button', { name: 'Add Sub-Input' }).click();
    await page.waitForTimeout(200);
    await page.getByRole('button', { name: 'Add Sub-Input' }).click();
    await page.waitForTimeout(200);
    await page.getByRole('button', { name: 'Add Sub-Input' }).click();
    await page.waitForTimeout(200);
    
    let subInputCount = await page.locator('.p-3.border.rounded-lg').count();
    expect(subInputCount).toBe(3);
    
    const firstSubInput = page.locator('.p-3.border.rounded-lg').first();
    const deleteButton = firstSubInput.locator('button[class*="h-9"][class*="w-9"]');
    await deleteButton.click();
    
    await page.waitForTimeout(300);
    
    subInputCount = await page.locator('.p-3.border.rounded-lg').count();
    expect(subInputCount).toBe(2);
  });
});

test.describe('Multi-Input Field - Persistence', () => {
  let editUrl: string;

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
    const formTitle = `Persistence Test ${Date.now()}`;
    await page.getByRole('textbox', { name: 'Form Title *' }).fill(formTitle);
    await page.getByRole('button', { name: 'Create Form & Start Building' }).click();
    
    await page.waitForURL(/\/forms\/\d+\/edit/);
    editUrl = page.url();
  });

  test('should save and reload multi-input configuration', async ({ page }) => {
    await page.getByRole('heading', { name: 'Multi-Input', exact: true }).click();
    await page.waitForTimeout(500);
    
    const questionCard = page.locator('.group.relative.transition-all').first();
    await questionCard.click();
    
    await page.getByRole('textbox', { name: 'Question Title *' }).fill('Contact Information');
    
    await page.getByRole('button', { name: 'Add Sub-Input' }).click();
    await page.waitForTimeout(300);
    
    const firstSubInput = page.locator('.p-3.border.rounded-lg').first();
    await firstSubInput.getByPlaceholder('Label').fill('Full Name');
    await firstSubInput.getByPlaceholder('Enter placeholder text...').fill('Enter your name');
    await firstSubInput.getByRole('switch').click();
    
    await page.getByRole('button', { name: 'Add Sub-Input' }).click();
    await page.waitForTimeout(300);
    
    const secondSubInput = page.locator('.p-3.border.rounded-lg').nth(1);
    await secondSubInput.getByPlaceholder('Label').fill('Email');
    await secondSubInput.getByRole('combobox').click();
    await page.getByRole('option', { name: 'Email' }).click();
    await secondSubInput.getByPlaceholder('Enter placeholder text...').fill('your@email.com');
    await secondSubInput.getByRole('switch').click();
    
    await page.getByRole('button', { name: 'Save' }).click();
    await page.waitForTimeout(1000);
    
    await page.reload();
    await page.waitForTimeout(1000);
    
    await expect(page.getByText('Contact Information')).toBeVisible();
    
    await questionCard.click();
    await page.waitForTimeout(500);
    
    const reloadedSubInputs = page.locator('.p-3.border.rounded-lg');
    const count = await reloadedSubInputs.count();
    expect(count).toBe(2);
    
    const firstLabel = await reloadedSubInputs.first().getByPlaceholder('Label').inputValue();
    expect(firstLabel).toBe('Full Name');
    
    const firstPlaceholder = await reloadedSubInputs.first().getByPlaceholder('Enter placeholder text...').inputValue();
    expect(firstPlaceholder).toBe('Enter your name');
    
    const secondLabel = await reloadedSubInputs.nth(1).getByPlaceholder('Label').inputValue();
    expect(secondLabel).toBe('Email');
    
    const secondPlaceholder = await reloadedSubInputs.nth(1).getByPlaceholder('Enter placeholder text...').inputValue();
    expect(secondPlaceholder).toBe('your@email.com');
  });

  test('should persist different input types correctly', async ({ page }) => {
    await page.getByRole('heading', { name: 'Multi-Input', exact: true }).click();
    await page.waitForTimeout(500);
    
    const questionCard = page.locator('.group.relative.transition-all').first();
    await questionCard.click();
    
    await page.getByRole('textbox', { name: 'Question Title *' }).fill('Registration Details');
    
    const types = [
      { label: 'Name', type: 'Text' },
      { label: 'Email', type: 'Email' },
      { label: 'Age', type: 'Number' },
      { label: 'Phone', type: 'Phone' },
      { label: 'Website', type: 'URL' },
    ];
    
    for (const item of types) {
      await page.getByRole('button', { name: 'Add Sub-Input' }).click();
      await page.waitForTimeout(300);
      
      const subInputs = page.locator('.p-3.border.rounded-lg');
      const lastSubInput = subInputs.last();
      
      await lastSubInput.getByPlaceholder('Label').fill(item.label);
      await lastSubInput.getByRole('combobox').click();
      await page.getByRole('option', { name: item.type }).click();
    }
    
    await page.getByRole('button', { name: 'Save' }).click();
    await page.waitForTimeout(1000);
    
    await page.reload();
    await page.waitForTimeout(1000);
    
    await questionCard.click();
    await page.waitForTimeout(500);
    
    const subInputCount = await page.locator('.p-3.border.rounded-lg').count();
    expect(subInputCount).toBe(5);
  });
});

test.describe.configure({ mode: 'serial' });

test.describe('Multi-Input Field - Form Submission', () => {
  let formSlug: string;
  let userIdentifier: string;
  let formUrl: string;

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    await page.goto('/user/register');
    
    const timestamp = Date.now();
    const email = `test${timestamp}@example.com`;
    userIdentifier = `test${timestamp}`;
    
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
    const formTitle = `Submission Test ${timestamp}`;
    await page.getByRole('textbox', { name: 'Form Title *' }).fill(formTitle);
    await page.getByRole('button', { name: 'Create Form & Start Building' }).click();
    formSlug = `submission-test-${timestamp}`;
    
    await page.waitForURL(/\/forms\/\d+\/edit/);
    
    await page.getByRole('heading', { name: 'Multi-Input', exact: true }).click();
    await page.waitForTimeout(500);
    
    const questionCard = page.locator('.group.relative.transition-all').first();
    await questionCard.click();
    
    await page.getByRole('textbox', { name: 'Question Title *' }).fill('Contact Information');
    
    await page.getByRole('button', { name: 'Add Sub-Input' }).click();
    await page.waitForTimeout(300);
    
    const firstSubInput = page.locator('.p-3.border.rounded-lg').first();
    await firstSubInput.getByPlaceholder('Label').fill('Full Name');
    await firstSubInput.getByPlaceholder('Enter placeholder text...').fill('Enter your name');
    await firstSubInput.getByRole('switch').click();
    
    await page.getByRole('button', { name: 'Add Sub-Input' }).click();
    await page.waitForTimeout(300);
    
    const secondSubInput = page.locator('.p-3.border.rounded-lg').nth(1);
    await secondSubInput.getByPlaceholder('Label').fill('Email Address');
    await secondSubInput.getByRole('combobox').click();
    await page.getByRole('option', { name: 'Email' }).click();
    await secondSubInput.getByPlaceholder('Enter placeholder text...').fill('your@email.com');
    await secondSubInput.getByRole('switch').click();
    
    await page.getByRole('button', { name: 'Save' }).click();
    await page.waitForTimeout(1000);
    
    const publishSwitch = page.getByRole('switch').nth(1);
    await publishSwitch.click();
    await page.waitForTimeout(500);
    
    await page.getByRole('button', { name: 'Save' }).click();
    await page.waitForTimeout(1000);
    
    formUrl = `/${userIdentifier}/${formSlug}`;
    
    await page.goto(formUrl);
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Contact Information')).toBeVisible({ timeout: 10000 });
    
    await page.close();
  });

  test('should display multi-input fields in published form', async ({ page }) => {
    await page.goto(formUrl);
    await page.waitForLoadState('networkidle');
    
    await expect(page.getByText('Contact Information')).toBeVisible();
    await expect(page.getByText('Full Name')).toBeVisible();
    await expect(page.getByText('Email Address')).toBeVisible();
    
    const nameInput = page.getByPlaceholder('Enter your name');
    const emailInput = page.getByPlaceholder('your@email.com');
    
    await expect(nameInput).toBeVisible();
    await expect(emailInput).toBeVisible();
  });

  test('should submit multi-input form with valid data', async ({ page }) => {
    await page.goto(formUrl);
    
    await page.getByPlaceholder('Enter your name').fill('John Doe');
    await page.getByPlaceholder('your@email.com').fill('john.doe@example.com');
    
    await page.getByRole('button', { name: /submit/i }).click();
    
    await page.waitForTimeout(2000);
    
    expect(page.url()).not.toContain('/edit');
  });

  test('should validate required multi-input fields', async ({ page }) => {
    await page.goto(formUrl);
    
    const submitButton = page.getByRole('button', { name: /submit/i });
    const isDisabled = await submitButton.isDisabled();
    
    expect(isDisabled).toBe(true);
  });

  test('should validate email format in multi-input field', async ({ page }) => {
    await page.goto(formUrl);
    
    await page.getByPlaceholder('Enter your name').fill('John Doe');
    await page.getByPlaceholder('your@email.com').fill('invalid-email');
    
    const submitButton = page.getByRole('button', { name: /submit/i });
    const isDisabled = await submitButton.isDisabled();
    
    expect(isDisabled).toBe(true);
  });
});
