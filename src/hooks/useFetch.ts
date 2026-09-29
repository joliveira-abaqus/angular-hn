import { useEffect, useState } from 'react';

interface UseFetchResult<T> {
    data: T | undefined;
    error: boolean;
}

/**
 * Fetches with useEffect/useState. When the inputs change (page, id, ...),
 * stale results are dropped so the loader shows while the new request is
 * in flight, and a superseded request can never overwrite newer data
 * (the equivalent of the old RxJS switchMap).
 */
export function useFetch<T>(fetcher: () => Promise<T>, deps: unknown[]): UseFetchResult<T> {
    const [data, setData] = useState<T | undefined>(undefined);
    const [error, setError] = useState(false);

    useEffect(() => {
        let cancelled = false;
        setData(undefined);
        setError(false);
        fetcher()
            .then((result) => {
                if (!cancelled) {
                    setData(result);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setError(true);
                }
            });
        return () => {
            cancelled = true;
        };
    }, deps);

    return { data, error };
}
