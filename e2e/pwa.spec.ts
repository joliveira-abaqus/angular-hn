import { expect, test } from './fixtures';

test('é instalável e funciona offline após a primeira visita', async ({ page, context }) => {
    await page.goto('/news/1');

    const manifest = await page.evaluate(async () => {
        const href = document.querySelector<HTMLLinkElement>('link[rel="manifest"]')!.href;
        return (await fetch(href)).json();
    });
    expect(manifest.display).toBe('standalone');
    expect(manifest.icons.map((icon: { sizes: string }) => icon.sizes)).toEqual(
        expect.arrayContaining(['192x192', '512x512'])
    );

    // Espera o service worker assumir a página (app shell pré-cacheado).
    await page.evaluate(async () => {
        await navigator.serviceWorker.ready;
        if (!navigator.serviceWorker.controller) {
            await new Promise(resolve => navigator.serviceWorker.addEventListener('controllerchange', resolve));
        }
    });

    await context.setOffline(true);
    await page.goto('/newest/1');
    await expect(page.locator('#header')).toBeVisible();
    await expect(page.locator('.header-nav')).toContainText('new');
});
