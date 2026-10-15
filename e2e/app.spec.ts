import { expect, test } from './fixtures';

// O service worker interceptaria os requests antes do page.route; o PWA é testado em pwa.spec.ts.
test.use({ serviceWorkers: 'block' });

test('navega entre os feeds e pagina', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/news\/1$/);
    await expect(page.locator('ol > li')).toHaveCount(30);
    await expect(page.getByRole('link', { name: 'Story 1', exact: true })).toBeVisible();

    await page.getByRole('link', { name: /More/ }).click();
    await expect(page).toHaveURL(/\/news\/2$/);
    await expect(page.getByRole('link', { name: 'Story 31', exact: true })).toBeVisible();
    await expect(page.locator('ol')).toHaveAttribute('start', '31');

    await page.getByRole('link', { name: /Prev/ }).click();
    await expect(page).toHaveURL(/\/news\/1$/);

    for (const [label, path] of [
        ['new', 'newest'],
        ['show', 'show'],
        ['ask', 'ask'],
    ]) {
        await page.locator('.header-nav').getByRole('link', { name: label, exact: true }).click();
        await expect(page).toHaveURL(new RegExp(`/${path}/1$`));
        await expect(page.locator('ol > li')).toHaveCount(30);
    }

    await page.locator('.header-nav').getByRole('link', { name: 'jobs' }).click();
    await expect(page).toHaveURL(/\/jobs\/1$/);
    await expect(page.getByText(/funded by Y Combinator/)).toBeVisible();
    await expect(page.getByRole('link', { name: /More/ })).toHaveCount(0);
});

test('abre um item com comentários aninhados e colapsa a thread', async ({ page }) => {
    await page.goto('/news/1');
    await page.locator('.subtext-laptop').first().getByRole('link', { name: '2 comments' }).click();
    await expect(page).toHaveURL(/\/item\/1$/);
    await expect(page.getByText('Texto da story')).toBeVisible();
    await expect(page.getByText('Comentário raiz')).toBeVisible();
    await expect(page.getByText('Resposta aninhada')).toBeVisible();

    await page.locator('.comment .collapse').first().click();
    await expect(page.getByText('Resposta aninhada')).toBeHidden();
    await page.locator('.comment .collapse').first().click();
    await expect(page.getByText('Resposta aninhada')).toBeVisible();
});

test('no mobile o título do item não fica sob o botão de voltar', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await page.goto('/item/1');
    const back = await page.locator('.mobile .back-button').boundingBox();
    const title = await page.locator('.mobile .title-block').boundingBox();
    expect(title!.x).toBeGreaterThanOrEqual(back!.x + back!.width);
});

test('mostra a contagem de votos de um poll', async ({ page }) => {
    await page.goto('/item/500');
    await expect(page.getByText('30 points')).toBeVisible();
    await expect(page.getByText('10 points')).toBeVisible();
    const bars = page.locator('.pollBar');
    await expect(bars.nth(0)).toHaveAttribute('style', /width: 75%/);
    await expect(bars.nth(1)).toHaveAttribute('style', /width: 25%/);
});

test('abre o perfil de um usuário', async ({ page }) => {
    await page.goto('/news/1');
    await page.locator('.subtext-laptop').first().getByRole('link', { name: 'user1' }).click();
    await expect(page).toHaveURL(/\/user\/user1$/);
    await expect(page.locator('.main-details .name')).toHaveText('user1');
    await expect(page.getByText('1234 ★')).toBeVisible();
    await expect(page.getByText('Sobre mim')).toBeVisible();
});

test('troca o tema e as preferências persistem após recarregar', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/news/1');
    const root = page.locator('#root > div').first();
    await expect(root).toHaveClass('default');

    await page.getByAltText('Settings').click();
    await page.getByLabel('Night').check();
    await expect(root).toHaveClass('night');
    await expect(page.locator('#header')).toHaveCSS('background-color', 'rgb(38, 50, 56)');

    await page.getByLabel('Black (AMOLED)').check();
    await expect(root).toHaveClass('amoledblack');
    await page.getByLabel('Open links in a new tab').check();
    await page.getByLabel('Font size:').fill('22');
    await page.locator('.close').click();

    await page.reload();
    await expect(root).toHaveClass('amoledblack');
    const title = page.getByRole('link', { name: 'Story 1', exact: true });
    await expect(title).toHaveAttribute('target', '_blank');
    await expect(title).toHaveCSS('font-size', '22px');
});

test('segue o modo escuro do sistema quando não há tema salvo', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/news/1');
    await expect(page.locator('#root > div').first()).toHaveClass('night');
});
