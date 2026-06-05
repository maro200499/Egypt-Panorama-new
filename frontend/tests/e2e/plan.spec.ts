import { test, expect } from '@playwright/test';
import { mockPlanResponse } from '../helpers/mockResponses';
import { gotoAndWaitMain, mockApiPost } from '../helpers/testUtils';

test('Trip planner generates and shows plan', async ({ page }) => {
  // Mock the API endpoint used by the trip planner
  mockApiPost(page, 'generate-plan', mockPlanResponse);

  await gotoAndWaitMain(page, '/plan');

  // Fill form values - tolerant selectors. The destination input uses an example placeholder.
  await page.fill('input[placeholder*="e.g."], input[placeholder*=مثال], input[type="text"]', 'Cairo');
  await page.fill('input[name="nights"], input[placeholder*=nights], input[type=number]', '3').catch(() => {});
  await page.selectOption('select[name="budget"]', 'Standard').catch(() => {});
  await page.selectOption('select[name="style"]', 'Mixed').catch(() => {});

  await Promise.all([
    page.waitForResponse((r) => /generate-plan/.test(r.url()) && r.status() === 200, { timeout: 5000 }).catch(() => null),
    page.click('button:has-text("Generate"), button:has-text("Create Plan")'),
  ]);

  // Wait for UI to show the generated plan
  await expect(page.locator('text=Day 1, text=Day 1').first()).toBeVisible({ timeout: 5000 });
});
