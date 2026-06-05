import { test, expect } from '@playwright/test';
import { mockLoginResponse, mockSignupResponse } from '../helpers/mockResponses';
import { gotoAndWaitMain, mockAnyApi } from '../helpers/testUtils';

test.describe('Auth forms', () => {
  test.beforeEach(async ({ page }) => {
    // Mock any API login/signup POSTs to prevent backend dependency
    mockAnyApi(page, /login/i, mockLoginResponse);
    mockAnyApi(page, /signup|register/i, mockSignupResponse);
  });

  test('Login form submits and navigates', async ({ page }) => {
    await gotoAndWaitMain(page, '/auth/login');

    await page.fill('input[name="email"], input[type="email"], input[placeholder*=Email]', 'test@example.com');
    await page.fill('input[name="password"], input[type="password"], input[placeholder*=Password]', 'Password123!');

    // Click submit and wait for navigation or success toast
    await Promise.all([
      page.waitForResponse((r) => /login/i.test(r.url()) && r.status() === 200, { timeout: 5000 }).catch(() => null),
      page.click('button[type="submit"]'),
    ]);

    // Either navigate away or show success text
    // Accept either a redirect or a stored auth token in localStorage.
    await page.waitForTimeout(400);
    const token = await page.evaluate(() => window.localStorage.getItem('authToken'));
    expect(token).toBeTruthy();
  });

  test('Signup form submits and shows success', async ({ page }) => {
    await gotoAndWaitMain(page, '/auth/signup');

    // Fill fields - try multiple common selectors to be robust
    await page.fill('input[name="firstName"], input[placeholder*=First]', 'Test').catch(() => {});
    await page.fill('input[name="lastName"], input[placeholder*=Last]', 'User').catch(() => {});
    await page.fill('input[name="email"], input[type="email"], input[placeholder*=Email]', 'new@example.com');
    await page.fill('input[name="password"], input[type="password"], input[placeholder*=Password]', 'Password123!');
    await page.fill('input[name="confirmPassword"], input[placeholder*=Confirm]', 'Password123!').catch(() => {});

    await Promise.all([
      page.waitForResponse((r) => /signup|register/i.test(r.url()) && r.status() === 200, { timeout: 5000 }).catch(() => null),
      page.click('button[type="submit"]'),
    ]);

    // Accept either a success message, redirect, or stored token
    const success = await page.locator('text=success, text=Signed up, text=Welcome').first().isVisible().catch(() => false);
    const token = await page.evaluate(() => window.localStorage.getItem('authToken'));
    if (!success) {
      expect(token || !page.url().includes('/auth/signup')).toBeTruthy();
    }
  });
});
