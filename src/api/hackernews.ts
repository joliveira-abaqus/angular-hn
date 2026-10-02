import type { FeedName } from '../shared/models/feed-type.type';
import type { PollResult } from '../shared/models/poll-result';
import type { Story } from '../shared/models/story';
import type { User } from '../shared/models/user';

export const BASE_URL = 'https://node-hnapi.herokuapp.com';

export class HackerNewsAPIError extends Error {
    readonly status: number;

    constructor(url: string, status: number) {
        super(`Request to ${url} failed with status ${status}`);
        this.name = 'HackerNewsAPIError';
        this.status = status;
    }
}

async function getJSON<T>(url: string, signal?: AbortSignal): Promise<T> {
    const res = await fetch(url, { signal });
    if (!res.ok) {
        throw new HackerNewsAPIError(url, res.status);
    }
    return (await res.json()) as T;
}

export function fetchFeed(feedType: FeedName, page: number, signal?: AbortSignal): Promise<Story[]> {
    return getJSON<Story[]>(`${BASE_URL}/${feedType}?page=${page}`, signal);
}

export function fetchPollContent(id: number, signal?: AbortSignal): Promise<PollResult> {
    return getJSON<PollResult>(`${BASE_URL}/item/${id}`, signal);
}

/**
 * Busca um item com seus comentários. Para enquetes, as opções vêm como itens
 * separados (ids consecutivos ao da enquete) e são agregadas aqui junto com o
 * total de votos.
 */
export async function fetchItemContent(id: number, signal?: AbortSignal): Promise<Story> {
    const story = await getJSON<Story>(`${BASE_URL}/item/${id}`, signal);
    if (story.type === 'poll' && story.poll && story.poll_votes_count === undefined) {
        const poll = await Promise.all(story.poll.map((_, i) => fetchPollContent(story.id + i + 1, signal)));
        return {
            ...story,
            poll,
            poll_votes_count: poll.reduce((total, option) => total + option.points, 0),
        };
    }
    return story;
}

export function fetchUser(id: string, signal?: AbortSignal): Promise<User> {
    return getJSON<User>(`${BASE_URL}/user/${id}`, signal);
}
