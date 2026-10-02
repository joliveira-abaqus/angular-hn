import { mockApi } from '../test/utils';
import { makeStory } from '../test/fixtures';
import { BASE_URL, fetchFeed, fetchItemContent, fetchUser, HackerNewsAPIError } from './hackernews';

describe('hackernews API', () => {
    it('busca o feed paginado', async () => {
        const fetchSpy = mockApi({ '/news?page=2': [makeStory()] });
        const stories = await fetchFeed('news', 2);
        expect(stories).toHaveLength(1);
        expect(fetchSpy).toHaveBeenCalledWith(`${BASE_URL}/news?page=2`, { signal: undefined });
    });

    it('lança HackerNewsAPIError em respostas não-OK', async () => {
        mockApi({});
        await expect(fetchUser('nobody')).rejects.toBeInstanceOf(HackerNewsAPIError);
    });

    it('agrega as opções e o total de votos das enquetes', async () => {
        mockApi({
            '/item/10': makeStory({ id: 10, type: 'poll', poll: [{}, {}] as never }),
            '/item/11': { points: 3, content: 'Yes' },
            '/item/12': { points: 1, content: 'No' },
        });
        const poll = await fetchItemContent(10);
        expect(poll.poll?.map((p) => p.content)).toEqual(['Yes', 'No']);
        expect(poll.poll_votes_count).toBe(4);
    });

    it('não altera itens que não são enquetes', async () => {
        mockApi({ '/item/1': makeStory() });
        const item = await fetchItemContent(1);
        expect(item.poll_votes_count).toBeUndefined();
    });
});
