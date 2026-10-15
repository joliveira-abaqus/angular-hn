import { useQuery } from '@tanstack/react-query';

import { fetchFeed, fetchItemContent, fetchUser, type FeedName } from '../api/hackernews';

export function useFeed(feedType: FeedName, page: number) {
    return useQuery({
        queryKey: ['feed', feedType, page],
        queryFn: ({ signal }) => fetchFeed(feedType, page, signal),
    });
}

export function useItem(id: number) {
    return useQuery({
        queryKey: ['item', id],
        queryFn: ({ signal }) => fetchItemContent(id, signal),
    });
}

export function useUser(id: string) {
    return useQuery({
        queryKey: ['user', id],
        queryFn: ({ signal }) => fetchUser(id, signal),
    });
}
