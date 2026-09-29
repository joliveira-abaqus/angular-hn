import type { ReactElement } from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { SettingsProvider } from '../hooks/useSettings';

export function renderWithProviders(ui: ReactElement, initialEntries = ['/']) {
    return render(
        <MemoryRouter initialEntries={initialEntries}>
            <SettingsProvider>{ui}</SettingsProvider>
        </MemoryRouter>
    );
}
