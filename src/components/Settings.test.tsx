import { beforeEach, describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '../test/helpers';
import Settings from './Settings';

describe('Settings', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('changes the theme', async () => {
        const user = userEvent.setup();
        renderWithProviders(<Settings />);

        await user.click(screen.getByRole('radio', { name: 'Night' }));
        expect(localStorage.getItem('theme')).toBe('night');
        expect(screen.getByRole('radio', { name: 'Night' })).toBeChecked();
    });

    it('toggles opening links in a new tab', async () => {
        const user = userEvent.setup();
        renderWithProviders(<Settings />);

        await user.click(screen.getByRole('checkbox'));
        expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
        expect(screen.getByRole('checkbox')).toBeChecked();
    });

    it('updates font size and list spacing', async () => {
        const user = userEvent.setup();
        renderWithProviders(<Settings />);

        const font = screen.getByLabelText(/Font size:/);
        await user.clear(font);
        await user.type(font, '20');
        expect(localStorage.getItem('titleFontSize')).toBe('20');

        const spacing = screen.getByLabelText(/List spacing:/);
        await user.clear(spacing);
        await user.type(spacing, '8');
        expect(localStorage.getItem('listSpacing')).toBe('8');
    });
});
