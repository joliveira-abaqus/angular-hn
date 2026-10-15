// Os temas globais precisam vir antes dos estilos dos componentes na ordem do CSS.
import './styles.scss';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

import { SettingsProvider } from './context/SettingsContext';
import { createQueryClient } from './queryClient';
import { AppRoutes } from './routes';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <QueryClientProvider client={createQueryClient()}>
            <SettingsProvider>
                <BrowserRouter>
                    <AppRoutes />
                </BrowserRouter>
            </SettingsProvider>
        </QueryClientProvider>
    </StrictMode>
);
