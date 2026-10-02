import { expect, test } from './fixtures';

test.use({ serviceWorkers: 'block' });

test.describe('Hacker News PWA', () => {
    test('redireciona para /news/1 e lista as stories', async ({ mockedPage: page }) => {
        const errors: string[] = [];
        page.on('pageerror', (err) => errors.push(err.message));

        await page.goto('/');
        await expect(page).toHaveURL(/\/news\/1$/);
        await expect(page.locator('.post')).toHaveCount(30);
        await expect(page.getByRole('link', { name: 'news Story 1', exact: true })).toBeVisible();
        expect(errors).toEqual([]);
    });

    for (const feed of ['newest', 'show', 'ask', 'jobs']) {
        test(`navega para o feed ${feed} pelo header`, async ({ mockedPage: page }) => {
            await page.goto('/news/1');
            await page
                .locator('.header-nav')
                .getByRole('link', { name: feed === 'newest' ? 'new' : feed })
                .click();
            await expect(page).toHaveURL(new RegExp(`/${feed}/1$`));
            await expect(page.getByText(`${feed} Story 1`, { exact: true })).toBeVisible();
        });
    }

    test('pagina com More e Prev', async ({ mockedPage: page }) => {
        await page.goto('/news/1');
        await page.getByRole('link', { name: 'More ›' }).click();
        await expect(page).toHaveURL(/\/news\/2$/);
        await expect(page.locator('ol')).toHaveAttribute('start', '31');
        await expect(page.getByRole('link', { name: 'More ›' })).toHaveCount(0);
        await page.getByRole('link', { name: '‹ Prev' }).click();
        await expect(page).toHaveURL(/\/news\/1$/);
    });

    test('abre detalhes do item com comentários aninhados', async ({ mockedPage: page }) => {
        await page.goto('/news/1');
        await page.locator('.subtext-laptop').first().getByRole('link', { name: '2 comments' }).click();
        await expect(page).toHaveURL(/\/item\/1$/);
        await expect(page.getByText('Top level comment')).toBeVisible();
        await expect(page.getByText('Nested reply')).toBeVisible();
        await page.getByText('[-]').first().click();
        await expect(page.getByText('Nested reply')).toBeHidden();
    });

    test('abre o perfil do usuário', async ({ mockedPage: page }) => {
        await page.goto('/user/pg');
        await expect(page.locator('.main-details .name')).toHaveText('pg');
        await expect(page.getByText('157000 ★')).toBeVisible();
        await expect(page.getByText('Bug fixer.')).toBeVisible();
    });

    test('persiste tema, fonte e espaçamento após recarregar', async ({ mockedPage: page }) => {
        await page.goto('/news/1');
        await page.getByAltText('Settings').click();
        await page.getByLabel('Night').check();
        await page.getByLabel('Font size:').fill('20');
        await page.getByLabel('List spacing:').fill('8');
        await page.getByLabel('Open links in a new tab').check();
        await page.locator('.popup .close').click();

        await page.reload();
        await expect(page.locator('#root > div').first()).toHaveClass('night');
        const title = page.getByRole('link', { name: 'news Story 1', exact: true });
        await expect(title).toHaveCSS('font-size', '20px');
        await expect(title).toHaveAttribute('target', '_blank');
    });
});
