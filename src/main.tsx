import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { createBrowserRouter, RouterProvider } from 'react-router';

import './styles/styles.scss';
import { createQueryClient } from './api/queries';
import { routes } from './routes';
import { SettingsProvider } from './settings/SettingsContext';

const queryClient = createQueryClient();
const router = createBrowserRouter(routes);

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <SettingsProvider>
                <RouterProvider router={router} />
            </SettingsProvider>
        </QueryClientProvider>
    </StrictMode>
);
