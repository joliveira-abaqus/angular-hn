import type { ReactElement } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

import { SettingsProvider } from '../context/SettingsContext';
import { createQueryClient } from '../queryClient';

export function renderWithProviders(ui: ReactElement, { route = '/' }: { route?: string } = {}) {
    const client = createQueryClient();
    client.setDefaultOptions({ queries: { ...client.getDefaultOptions().queries, retry: false } });
    return render(
        <QueryClientProvider client={client}>
            <SettingsProvider>
                <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
            </SettingsProvider>
        </QueryClientProvider>
    );
}

/** Substitui o fetch global por respostas fixas por URL (caminho após o host da API). */
export function mockApi(routes: Record<string, unknown>) {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
        const url = new URL(String(input));
        const key = url.pathname + url.search;
        if (key in routes) {
            return new Response(JSON.stringify(routes[key]), { status: 200 });
        }
        return new Response('{}', { status: 404 });
    });
    vi.stubGlobal('fetch', fetchMock);
    return fetchMock;
}
