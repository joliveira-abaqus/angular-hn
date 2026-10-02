import { test as base, type BrowserContext, type Page } from '@playwright/test';

const API = 'https://node-hnapi.herokuapp.com';

export function story(id: number, overrides: Record<string, unknown> = {}) {
    return {
        id,
        title: `Story ${id}`,
        points: 10 + id,
        user: 'pg',
        time: 0,
        time_ago: '1 hour ago',
        type: 'link',
        url: `https://example.com/${id}`,
        domain: 'example.com',
        comments_count: 2,
        ...overrides,
    };
}

const page1 = Array.from({ length: 30 }, (_, i) => story(i + 1));
const page2 = Array.from({ length: 5 }, (_, i) => story(i + 31));

export const item = {
    ...story(1, { content: '<p>Item body</p>' }),
    comments: [
        {
            id: 101,
            level: 0,
            user: 'alice',
            time_ago: '1 hour ago',
            content: '<p>Top level comment</p>',
            comments: [
                {
                    id: 102,
                    level: 1,
                    user: 'bob',
                    time_ago: '30 minutes ago',
                    content: '<p>Nested reply</p>',
                    comments: [],
                },
            ],
        },
    ],
};

export const user = { id: 'pg', created: '19 years ago', created_time: 0, karma: 157000, about: 'Bug fixer.' };

/** Respostas determinísticas da node-hnapi para os testes e2e. */
export async function mockApi(target: Page | BrowserContext) {
    await target.route(`${API}/**`, async (route) => {
        const url = new URL(route.request().url());
        const key = url.pathname + url.search;
        const feeds = ['/news', '/newest', '/show', '/ask', '/jobs'];
        let body: unknown;
        if (feeds.includes(url.pathname)) {
            const pageNum = url.searchParams.get('page');
            body = pageNum === '2' ? page2 : page1.map((s) => ({ ...s, title: `${url.pathname.slice(1)} ${s.title}` }));
        } else if (key === '/item/1') {
            body = item;
        } else if (key === '/user/pg') {
            body = user;
        }
        if (body === undefined) {
            return route.fulfill({ status: 404, body: 'Not found' });
        }
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
    });
}

export const test = base.extend<{ mockedPage: Page }>({
    mockedPage: async ({ page }, provide) => {
        await mockApi(page);
        await provide(page);
    },
});

export { expect } from '@playwright/test';
