import { Page, APIRequestContext } from '@playwright/test';

export async function gotoAndWaitMain(page: Page, path: string) {
  const url = page.context()._options.baseURL ? new URL(path, (page.context()._options.baseURL as string)).toString() : path;
  try {
    await page.goto(url, { waitUntil: 'networkidle' });
  } catch (err) {
    // retry once with domcontentloaded if networkidle fails on dev server
    await page.goto(url, { waitUntil: 'domcontentloaded' });
  }

  // Wait for main app shell or header to be visible
  await page.waitForSelector('main, [role="main"], header, h1, h2', { timeout: 10000 });
}

export function mockApiPost(page: Page, pathFragment: string, responseBody: unknown, status = 200) {
  page.route(`**/api/**${pathFragment}**`, async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(responseBody) });
    } else {
      route.fallback();
    }
  });
}

export function mockAnyApi(page: Page, matcher: string | RegExp, responseBody: unknown, status = 200) {
  page.route('**/api/**', async (route) => {
    const url = route.request().url();
    const matches = typeof matcher === 'string' ? url.includes(matcher) : matcher.test(url);
    if (matches) {
      await route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(responseBody) });
    } else {
      route.fallback();
    }
  });
}

export async function setAuthCookie(page: Page, token: string, cookieName = 'auth_token') {
  const url = page.context()._options.baseURL ? page.context()._options.baseURL as string : 'http://localhost:3000';
  await page.context().addCookies([{ name: cookieName, value: token, domain: new URL(url).hostname, path: '/' }]);
}

// Small helper: safe click with wait
export async function clickAndWaitNavigation(page: Page, selector: string) {
  const [response] = await Promise.all([page.waitForNavigation({ waitUntil: 'networkidle', timeout: 10000 }).catch(() => null), page.click(selector).catch(() => null)]);
  return response;
}
