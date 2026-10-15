import { test as base, type Page } from '@playwright/test';

const API = 'https://node-hnapi.herokuapp.com';

function story(id: number, overrides: Record<string, unknown> = {}) {
    return {
        id,
        title: `Story ${id}`,
        points: 100 + id,
        user: `user${id}`,
        time: 0,
        time_ago: '1 hour ago',
        type: 'link',
        url: `https://example.com/${id}`,
        domain: 'example.com',
        comments_count: 2,
        ...overrides,
    };
}

function feed(page: number, size = 30) {
    return Array.from({ length: size }, (_, i) => story((page - 1) * 30 + i + 1));
}

/** Respostas fixas da node-hnapi para os testes não dependerem da API real. */
export async function mockHnApi(page: Page) {
    await page.route(`${API}/**`, async route => {
        const url = new URL(route.request().url());
        const path = url.pathname;
        const pageNum = Number(url.searchParams.get('page') ?? '1');
        let body: unknown;

        if (/^\/(news|newest|show|ask|jobs)$/.test(path)) {
            body = path === '/jobs' ? feed(pageNum, 5).map(s => ({ ...s, type: 'job' })) : feed(pageNum);
        } else if (path === '/item/1') {
            body = {
                ...story(1),
                content: '<p>Texto da story</p>',
                comments: [
                    {
                        id: 11,
                        level: 0,
                        user: 'alice',
                        time_ago: '50 minutes ago',
                        content: '<p>Comentário raiz</p>',
                        comments: [
                            {
                                id: 12,
                                level: 1,
                                user: 'bob',
                                time_ago: '40 minutes ago',
                                content: '<p>Resposta aninhada</p>',
                                comments: [],
                            },
                        ],
                    },
                ],
            };
        } else if (path === '/item/500') {
            body = { ...story(500), type: 'poll', url: 'item?id=500', title: 'Poll: melhor framework?', poll: [{}, {}], comments: [] };
        } else if (path === '/item/501') {
            body = { points: 30, content: 'React' };
        } else if (path === '/item/502') {
            body = { points: 10, content: 'Angular' };
        } else if (path.startsWith('/user/')) {
            body = { id: path.slice(6), karma: 1234, created: '10 years ago', about: '<p>Sobre mim</p>' };
        } else {
            return route.fulfill({ status: 404, body: '{}' });
        }
        await route.fulfill({ json: body, headers: { 'access-control-allow-origin': '*' } });
    });
}

export const test = base.extend<{ mockApi: void }>({
    mockApi: [
        async ({ page }, use) => {
            await mockHnApi(page);
            await use();
        },
        { auto: true },
    ],
});

export { expect } from '@playwright/test';
