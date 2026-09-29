import fetch from 'unfetch';

import type { PollResult, Story, User } from '../types';

// How long a cached response stays fresh before we hit the network again.
const CACHE_TTL_MS = 60 * 1000;

interface CacheEntry {
    promise: Promise<unknown>;
    expiresAt: number;
}

const BASE_URL = 'https://node-hnapi.herokuapp.com';

const cache = new Map<string, CacheEntry>();

/**
 * Shares a single in-flight request between concurrent callers and replays
 * the result to anyone requesting the same URL within CACHE_TTL_MS.
 * Failed requests are evicted so an error is never served from cache.
 */
export function cachedFetch<T>(url: string): Promise<T> {
    const cached = cache.get(url);
    if (cached && cached.expiresAt > Date.now()) {
        return cached.promise as Promise<T>;
    }

    const promise = fetch(url).then((res) => {
        if (!res.ok) {
            throw new Error(`Request failed with status ${res.status}`);
        }
        return res.json() as Promise<T>;
    });

    promise.catch(() => cache.delete(url));
    cache.set(url, { promise, expiresAt: Date.now() + CACHE_TTL_MS });
    return promise;
}

export function fetchFeed(feedType: string, page: number): Promise<Story[]> {
    return cachedFetch<Story[]>(`${BASE_URL}/${feedType}?page=${page}`);
}

export function fetchPollContent(id: number): Promise<PollResult> {
    return cachedFetch<PollResult>(`${BASE_URL}/item/${id}`);
}

export async function fetchItemContent(id: number): Promise<Story> {
    const story = await cachedFetch<Story>(`${BASE_URL}/item/${id}`);
    if (story.type === 'poll' && story.poll_votes_count === undefined) {
        const numberOfPollOptions = story.poll.length;
        const results = await Promise.all(
            story.poll.map((_, i) => fetchPollContent(story.id + i + 1))
        );
        story.poll_votes_count = 0;
        for (let i = 0; i < numberOfPollOptions; i++) {
            story.poll[i] = results[i];
            story.poll_votes_count += results[i].points;
        }
    }
    return story;
}

export function fetchUser(id: string): Promise<User> {
    return cachedFetch<User>(`${BASE_URL}/user/${id}`);
}
