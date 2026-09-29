import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockFetch = vi.fn();

vi.mock('unfetch', () => ({
    default: (...args: unknown[]) => mockFetch(...args),
}));

import { cachedFetch, fetchFeed, fetchItemContent, fetchUser } from './hackerNewsApi';

function jsonResponse(data: unknown) {
    return Promise.resolve({ ok: true, json: () => Promise.resolve(data) });
}

describe('hackerNewsApi', () => {
    beforeEach(() => {
        mockFetch.mockReset();
    });

    it('fetches a feed page', async () => {
        const stories = [{ id: 1, title: 'Hello' }];
        mockFetch.mockReturnValueOnce(jsonResponse(stories));

        await expect(fetchFeed('news', 2)).resolves.toEqual(stories);
        expect(mockFetch).toHaveBeenCalledWith('https://node-hnapi.herokuapp.com/news?page=2');
    });

    it('fetches a user', async () => {
        const user = { id: 'pg', karma: 100 };
        mockFetch.mockReturnValueOnce(jsonResponse(user));

        await expect(fetchUser('pg')).resolves.toEqual(user);
        expect(mockFetch).toHaveBeenCalledWith('https://node-hnapi.herokuapp.com/user/pg');
    });

    it('rejects on a non-ok response', async () => {
        mockFetch.mockReturnValueOnce(Promise.resolve({ ok: false, status: 500 }));

        await expect(fetchUser('nope')).rejects.toThrow('500');
    });

    it('caches responses within the TTL', async () => {
        const url = 'https://node-hnapi.herokuapp.com/cached-thing';
        mockFetch.mockReturnValue(jsonResponse({ ok: 1 }));

        await cachedFetch(url);
        await cachedFetch(url);
        expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('does not serve errors from cache', async () => {
        const url = 'https://node-hnapi.herokuapp.com/flaky-thing';
        mockFetch
            .mockReturnValueOnce(Promise.resolve({ ok: false, status: 500 }))
            .mockReturnValueOnce(jsonResponse({ fixed: true }));

        await expect(cachedFetch(url)).rejects.toThrow();
        await expect(cachedFetch(url)).resolves.toEqual({ fixed: true });
        expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('aggregates poll votes when poll_votes_count is missing', async () => {
        const story = {
            id: 100,
            type: 'poll',
            poll: [{ content: 'a' }, { content: 'b' }],
        };
        mockFetch.mockImplementation((url: string) => {
            if (url.endsWith('/item/100')) return jsonResponse(story);
            if (url.endsWith('/item/101')) return jsonResponse({ points: 10, content: 'a' });
            if (url.endsWith('/item/102')) return jsonResponse({ points: 5, content: 'b' });
            return Promise.resolve({ ok: false, status: 404 });
        });

        const result = await fetchItemContent(100);
        expect(result.poll_votes_count).toBe(15);
        expect(result.poll[0]).toEqual({ points: 10, content: 'a' });
    });
});
