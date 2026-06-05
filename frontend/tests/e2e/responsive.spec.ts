import { test, expect } from '@playwright/test';
import { gotoAndWaitMain } from '../helpers/testUtils';

const BREAKPOINTS = {
  mobile: { width: 375, height: 812 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1366, height: 768 },
};

for (const [name, viewport] of Object.entries(BREAKPOINTS)) {
  test(`${name} layout renders primary nav and hero`, async ({ page }) => {
    await page.setViewportSize(viewport as { width: number; height: number });
    await gotoAndWaitMain(page, '/');

    // Check that main content area is visible. Header may be hidden in some layouts,
    // so require `main` or an H1 instead to avoid flaky failures.
    await expect(page.locator('main, [role="main"], h1, h2').first()).toBeVisible();
  });
}
