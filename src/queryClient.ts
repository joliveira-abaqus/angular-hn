import { QueryClient } from '@tanstack/react-query';

import { CACHE_TTL_MS } from './api/hackernews';

export function createQueryClient(): QueryClient {
    return new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: CACHE_TTL_MS,
                retry: 1,
                refetchOnWindowFocus: false,
            },
        },
    });
}
