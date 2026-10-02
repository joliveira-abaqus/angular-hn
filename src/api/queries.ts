import { QueryClient, useQuery } from '@tanstack/react-query';

import type { FeedName } from '../shared/models/feed-type.type';
import { fetchFeed, fetchItemContent, fetchUser } from './hackernews';

/** Tempo em que uma resposta em cache é considerada fresca antes de voltar à rede. */
export const CACHE_TTL_MS = 60 * 1000;

export function createQueryClient(): QueryClient {
    return new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: CACHE_TTL_MS,
                retry: false,
                refetchOnWindowFocus: false,
                // Sempre dispara a requisição, mesmo offline, para que o service worker responda com o cache hnapi.
                networkMode: 'offlineFirst',
            },
        },
    });
}

export const queryKeys = {
    feed: (feedType: FeedName, page: number) => ['feed', feedType, page] as const,
    item: (id: number) => ['item', id] as const,
    user: (id: string) => ['user', id] as const,
};

export function useFeed(feedType: FeedName, page: number) {
    return useQuery({
        queryKey: queryKeys.feed(feedType, page),
        queryFn: ({ signal }) => fetchFeed(feedType, page, signal),
    });
}

export function useItem(id: number) {
    return useQuery({
        queryKey: queryKeys.item(id),
        queryFn: ({ signal }) => fetchItemContent(id, signal),
    });
}

export function useUser(id: string) {
    return useQuery({
        queryKey: queryKeys.user(id),
        queryFn: ({ signal }) => fetchUser(id, signal),
    });
}
