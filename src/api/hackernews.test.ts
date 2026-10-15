import { describe, expect, it } from 'vitest';

import { mockApi } from '../test/utils';
import { makeStory } from '../test/fixtures';
import { BASE_URL, fetchFeed, fetchItemContent, fetchPollContent, fetchUser } from './hackernews';

describe('hackernews api', () => {
    it('fetchFeed busca o feed e a página corretos', async () => {
        const fetchMock = mockApi({ '/newest?page=2': [makeStory()] });
        const feed = await fetchFeed('newest', 2);
        expect(feed).toHaveLength(1);
        expect(String(fetchMock.mock.calls[0][0])).toBe(`${BASE_URL}/newest?page=2`);
    });

    it('fetchUser e fetchPollContent usam os endpoints de user e item', async () => {
        mockApi({ '/user/pg': { id: 'pg', karma: 10 }, '/item/7': { points: 3, content: 'opção' } });
        await expect(fetchUser('pg')).resolves.toMatchObject({ id: 'pg', karma: 10 });
        await expect(fetchPollContent(7)).resolves.toEqual({ points: 3, content: 'opção' });
    });

    it('fetchItemContent agrega os votos das opções de um poll', async () => {
        const poll = makeStory({ id: 100, type: 'poll', poll: [{}, {}, {}] as never });
        const fetchMock = mockApi({
            '/item/100': poll,
            '/item/101': { points: 10, content: 'A' },
            '/item/102': { points: 5, content: 'B' },
            '/item/103': { points: 1, content: 'C' },
        });

        const story = await fetchItemContent(100);

        expect(fetchMock).toHaveBeenCalledTimes(4);
        expect(story.poll.map(p => p.content)).toEqual(['A', 'B', 'C']);
        expect(story.poll_votes_count).toBe(16);
    });

    it('fetchItemContent não busca opções para items que não são poll', async () => {
        const fetchMock = mockApi({ '/item/1': makeStory() });
        const story = await fetchItemContent(1);
        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(story.poll_votes_count).toBeUndefined();
    });

    it('rejeita quando a API responde com erro HTTP', async () => {
        mockApi({});
        await expect(fetchUser('ninguem')).rejects.toThrow('HTTP 404');
    });
});
