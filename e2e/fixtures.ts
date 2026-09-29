import type { Page } from '@playwright/test';

const API = 'https://node-hnapi.herokuapp.com';

export function makeStory(id: number, overrides: Record<string, unknown> = {}) {
    return {
        id,
        title: `E2E Story ${id}`,
        points: 100 + id,
        user: `user${id}`,
        time: 1700000000,
        time_ago: `${id} hours ago`,
        type: 'story',
        url: 'https://example.com/story',
        domain: 'example.com',
        comments: [],
        comments_count: id,
        deleted: false,
        dead: false,
        ...overrides,
    };
}

function feed(length: number, offset = 0) {
    return Array.from({ length }, (_, i) => makeStory(offset + i + 1));
}

/**
 * Intercepts the HN API so e2e specs are deterministic and offline-friendly.
 */
export async function mockHnApi(page: Page) {
    await page.route(`${API}/**`, async (route) => {
        const url = new URL(route.request().url());
        const path = url.pathname;

        if (path.startsWith('/item/')) {
            const id = Number(path.split('/')[2]);
            return route.fulfill({
                json: makeStory(id, {
                    title: `Item ${id} title`,
                    content: '<p>item content</p>',
                    comments: [
                        {
                            id: id * 1000 + 1,
                            level: 0,
                            user: 'commenter',
                            time: 1700000001,
                            time_ago: '10 minutes ago',
                            content: 'top-level comment',
                            deleted: false,
                            comments: [
                                {
                                    id: id * 1000 + 2,
                                    level: 1,
                                    user: 'replier',
                                    time: 1700000002,
                                    time_ago: '5 minutes ago',
                                    content: 'nested reply',
                                    deleted: false,
                                    comments: [],
                                },
                            ],
                        },
                    ],
                    comments_count: 2,
                }),
            });
        }

        if (path.startsWith('/user/')) {
            const id = path.split('/')[2];
            return route.fulfill({
                json: {
                    id,
                    created: 'January 1, 2020',
                    karma: 1234,
                    avg: 2.5,
                    about: '<p>about me</p>',
                },
            });
        }

        // Feed endpoints: /news?page=N etc.
        const pageParam = Number(url.searchParams.get('page') ?? '1');
        const items = pageParam === 1 ? feed(30) : feed(10, 30);
        return route.fulfill({ json: items });
    });
}
