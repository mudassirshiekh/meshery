import { expect, test as setup } from './fixtures/project';
import { ENV } from './env';

/**
 * This function is called only once before any tests are run.
 * It performs the authentication steps.
 * It logs in to Meshery and saves the cookies and browser context to a file.
 * The cookies are used in the subsequent tests to authenticate the user.
 * @param {import("@playwright/test").TestModifier} param0
 */
setup('authenticate', async ({ page, provider }) => {
  // Perform authentication steps. Replace these actions with your own.

  await page.goto(ENV.PROVIDER_SELECTION_URL);
  await page.getByLabel('Select Provider').click();
  await page.getByRole('menuitem', { name: provider }).click();

  if (provider === 'Meshery') {
    await page.getByLabel('E-Mail').fill(ENV.REMOTE_PROVIDER_USER.email);
    await page.getByLabel('Password').fill(ENV.REMOTE_PROVIDER_USER.password);
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  }

  // Wait until the page receives the cookies.
  // Sometimes login flow sets cookies in the process of several redirects.
  // Wait for the final URL to ensure that the cookies are actually set.

  await expect(async () => {
    const url = page.url();

    const redirect_urls = new Set([
      ENV.MESHERY_SERVER_URL + '/',
      ENV.REMOTE_PROVIDER_URL + '/',
      ENV.REMOTE_PROVIDER_URL + '/dashboard',
    ]);
    const redirected = redirect_urls.has(url);
    return expect(redirected).toBeTruthy();
  }).toPass();
  // End of authentication steps.
  if (provider === 'Meshery') {
    await page.context().storageState({ path: ENV.AUTHFILEMESHERYPROVIDER });
  }
  if (provider === 'None') {
    await page.context().storageState({ path: ENV.AUTHFILELOCALPROVIDER });
  }
});
