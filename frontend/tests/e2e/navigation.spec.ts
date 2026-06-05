import { test, expect } from '@playwright/test';
import { gotoAndWaitMain } from '../helpers/testUtils';

const PAGES = [
  '/',
  '/destinations',
  '/plan',
  '/auth/login',
  '/auth/signup',
  '/maps',
  '/tourism-companies',
  '/pricing',
];

for (const route of PAGES) {
  test(`Page ${route} loads and renders main content`, async ({ page }) => {
    await gotoAndWaitMain(page, route);

    await expect(page.locator('main, [role="main"], header, h1, h2').first()).toBeVisible();
  });
}
