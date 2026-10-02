import { expect, mockApi, test } from './fixtures';

test('registra o service worker e serve app e API do cache offline', async ({ page, context }) => {
    // Rotas no contexto também interceptam requisições feitas pelo service worker.
    await mockApi(context);

    await page.goto('/news/1');
    await expect(page.locator('.post')).toHaveCount(30);
    await page.evaluate(async () => {
        await navigator.serviceWorker.ready;
    });
    await page.reload();
    await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
    await expect(page.locator('.post')).toHaveCount(30);

    const manifest = await page.request.get('/manifest.webmanifest');
    expect(manifest.ok()).toBe(true);
    expect((await manifest.json()).icons.length).toBeGreaterThan(0);

    await context.unrouteAll();
    await context.setOffline(true);
    await page.reload();
    await expect(page.locator('#header')).toBeVisible();
    await expect(page.locator('.post')).toHaveCount(30);
    await expect(page.getByText('news Story 1', { exact: true })).toBeVisible();
});
