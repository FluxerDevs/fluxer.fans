import { expect, test } from '@playwright/test';

test('shows the unofficial disclaimer before anything else', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByText('Unofficial fan project.')).toBeVisible();
	await expect(page.getByRole('heading', { name: 'The not-so-fine print' })).toBeVisible();
});

test('fan speed keys and the cheer box respond', async ({ page }) => {
	await page.goto('/');
	await page.getByText('Whoosh').click();
	await expect(page.locator('input[name="fan-speed"][value="3"]')).toBeChecked();

	await page.getByRole('button', { name: 'Send it with the wind' }).click();
	await expect(page.locator('#cheer-status')).toHaveText(/Type something first/);

	await page.getByLabel('Send a cheer to #fan-club').fill('Go Fluxer');
	await page.getByRole('button', { name: 'Send it with the wind' }).click();
	await expect(page.locator('#cheer-status')).toHaveText(/Whoosh/);
});

test('serves Spanish under /es', async ({ page }) => {
	await page.goto('/es');
	await expect(page.locator('html')).toHaveAttribute('lang', 'es');
	await expect(page.getByRole('heading', { level: 1 })).toContainText('Un club de fans');
});
