import { render } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { vi } from 'vitest';

import { createQueryClient } from '../api/queries';
import { routes } from '../routes';
import { SettingsProvider } from '../settings/SettingsContext';

export function renderApp(path: string) {
    const router = createMemoryRouter(routes, { initialEntries: [path] });
    const queryClient = createQueryClient();
    const utils = render(
        <QueryClientProvider client={queryClient}>
            <SettingsProvider>
                <RouterProvider router={router} />
            </SettingsProvider>
        </QueryClientProvider>
    );
    return { ...utils, router, queryClient };
}

/** Simula o fetch respondendo conforme o pathname+search da URL da API. */
export function mockApi(responses: Record<string, unknown>) {
    return vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
        const url = new URL(typeof input === 'string' ? input : input instanceof URL ? input.href : input.url);
        const key = url.pathname + url.search;
        if (key in responses) {
            return new Response(JSON.stringify(responses[key]), { status: 200 });
        }
        return new Response('Not found', { status: 404 });
    });
}
