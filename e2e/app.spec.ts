import { expect, test } from '@playwright/test';

import { mockHnApi } from './fixtures';

test.beforeEach(async ({ page }) => {
    await mockHnApi(page);
});

test('redirects / to /news/1 and lists stories', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveURL(/\/news\/1$/);
    await expect(page.getByRole('link', { name: 'E2E Story 1', exact: true })).toBeVisible();
    await expect(page.getByText('101 points by', { exact: false }).first()).toBeVisible();
});

test('navigates between feeds via the header', async ({ page }) => {
    await page.goto('/news/1');

    await page.getByRole('link', { name: 'new', exact: true }).click();
    await expect(page).toHaveURL(/\/newest\/1$/);
    await expect(page.getByRole('link', { name: 'E2E Story 1', exact: true })).toBeVisible();

    await page.getByRole('link', { name: 'ask', exact: true }).click();
    await expect(page).toHaveURL(/\/ask\/1$/);

    await page.getByRole('link', { name: 'jobs', exact: true }).click();
    await expect(page).toHaveURL(/\/jobs\/1$/);
    await expect(page.getByText('jobs at startups', { exact: false })).toBeVisible();
});

test('paginates with More and Prev', async ({ page }) => {
    await page.goto('/news/1');

    await page.getByRole('link', { name: 'More ›' }).click();
    await expect(page).toHaveURL(/\/news\/2$/);
    await expect(page.getByRole('link', { name: 'E2E Story 31', exact: true })).toBeVisible();

    await page.getByRole('link', { name: '‹ Prev' }).click();
    await expect(page).toHaveURL(/\/news\/1$/);
    await expect(page.getByRole('link', { name: 'E2E Story 1', exact: true })).toBeVisible();
});

test('opens an item and shows nested comments', async ({ page }) => {
    await page.goto('/news/1');

    await page.getByRole('link', { name: '1 comment' }).first().click();
    await expect(page).toHaveURL(/\/item\/1$/);
    await expect(page.getByText('item content')).toBeVisible();
    await expect(page.getByText('top-level comment')).toBeVisible();
    await expect(page.getByText('nested reply')).toBeVisible();
});

test('collapses a comment thread', async ({ page }) => {
    await page.goto('/item/1');

    await expect(page.getByText('nested reply')).toBeVisible();
    await page.getByText('[-]').first().click();
    await expect(page.getByText('nested reply')).not.toBeVisible();
    await page.getByText('[+]', { exact: true }).first().click();
    await expect(page.getByText('nested reply')).toBeVisible();
});

test('opens a user profile', async ({ page }) => {
    await page.goto('/item/1');

    await page.getByRole('link', { name: 'commenter' }).click();
    await expect(page).toHaveURL(/\/user\/commenter$/);
    await expect(page.getByText('1234 ★')).toBeVisible();
    await expect(page.getByText('Created January 1, 2020')).toBeVisible();
    await expect(page.getByText('about me')).toBeVisible();
});

test('opens and closes the settings dialog', async ({ page }) => {
    await page.goto('/news/1');

    await page.getByAltText('Settings').click();
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();

    await page.getByRole('radio', { name: 'Night' }).check();
    await page.getByText('×').click();
    await expect(page.getByRole('heading', { name: 'Settings' })).not.toBeVisible();
});
