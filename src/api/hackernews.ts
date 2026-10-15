import type { Story } from '../models/story';
import type { User } from '../models/user';
import type { PollResult } from '../models/poll-result';

export const BASE_URL = 'https://node-hnapi.herokuapp.com';

// Tempo em que uma resposta é considerada "fresca" pelo React Query antes de buscar de novo.
export const CACHE_TTL_MS = 60 * 1000;

export type FeedName = 'news' | 'newest' | 'show' | 'ask' | 'jobs';

async function getJson<T>(url: string, signal?: AbortSignal): Promise<T> {
    const res = await fetch(url, { signal });
    if (!res.ok) {
        throw new Error(`Falha ao buscar ${url}: HTTP ${res.status}`);
    }
    return (await res.json()) as T;
}

export function fetchFeed(feedType: FeedName, page: number, signal?: AbortSignal): Promise<Story[]> {
    return getJson<Story[]>(`${BASE_URL}/${feedType}?page=${page}`, signal);
}

export function fetchPollContent(id: number, signal?: AbortSignal): Promise<PollResult> {
    return getJson<PollResult>(`${BASE_URL}/item/${id}`, signal);
}

/**
 * Busca um item. Para polls, as opções vêm como itens separados com ids
 * sequenciais (id + 1 ... id + n): cada uma é buscada e os votos são somados
 * em `poll_votes_count`.
 */
export async function fetchItemContent(id: number, signal?: AbortSignal): Promise<Story> {
    const story = await getJson<Story>(`${BASE_URL}/item/${id}`, signal);
    if (story.type === 'poll' && story.poll_votes_count === undefined) {
        // Como no app Angular, uma opção que falhar não impede a exibição do poll.
        const results = await Promise.allSettled(
            story.poll.map((_, i) => fetchPollContent(story.id + i + 1, signal))
        );
        story.poll = results.map((result, i) => (result.status === 'fulfilled' ? result.value : story.poll[i]));
        story.poll_votes_count = results.reduce(
            (total, result) => total + (result.status === 'fulfilled' ? result.value.points : 0),
            0
        );
    }
    return story;
}

export function fetchUser(id: string, signal?: AbortSignal): Promise<User> {
    return getJson<User>(`${BASE_URL}/user/${id}`, signal);
}
