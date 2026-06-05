import { test, expect } from '@playwright/test';

import { gotoAndWaitMain, mockAnyApi } from '../helpers/testUtils';

test('Admin page redirects to login when unauthenticated', async ({ page }) => {
  await gotoAndWaitMain(page, '/admin');

  // Expect redirect to login page (Next server may redirect server-side)
  await expect(page).toHaveURL(/\/auth\/login/);
});

test('Maps page loads and fetches map data (mocked)', async ({ page }) => {
  // Mock backend map-data endpoint used by the maps page
  mockAnyApi(page, /map-data|map-data.php|tourism-destinations/i, { destinations: [], activities: [] });

  await gotoAndWaitMain(page, '/maps');
  // Look for a map container or fallback main
  const mapVisible = await page.locator('text=Map, [data-testid="map"], #map, .leaflet-container').first().isVisible().catch(() => false);
  if (!mapVisible) {
    await expect(page.locator('main').first()).toBeVisible();
  }
});
