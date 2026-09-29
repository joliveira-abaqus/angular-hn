import { beforeEach, describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '../test/helpers';
import { useSettings } from './useSettings';

function Probe() {
    const { settings, toggleSettings, setTheme, setFont, setSpacing, toggleOpenLinksInNewTab } = useSettings();
    return (
        <div>
            <span data-testid="theme">{settings.theme}</span>
            <span data-testid="show">{String(settings.showSettings)}</span>
            <span data-testid="newtab">{String(settings.openLinkInNewTab)}</span>
            <span data-testid="font">{settings.titleFontSize}</span>
            <span data-testid="spacing">{settings.listSpacing}</span>
            <button onClick={toggleSettings}>toggle</button>
            <button onClick={toggleOpenLinksInNewTab}>newtab</button>
            <button onClick={() => setTheme('night')}>night</button>
            <button onClick={() => setFont('20')}>font</button>
            <button onClick={() => setSpacing('8')}>spacing</button>
        </div>
    );
}

describe('useSettings', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('exposes defaults', () => {
        renderWithProviders(<Probe />);

        expect(screen.getByTestId('theme')).toHaveTextContent('default');
        expect(screen.getByTestId('show')).toHaveTextContent('false');
        expect(screen.getByTestId('newtab')).toHaveTextContent('false');
        expect(screen.getByTestId('font')).toHaveTextContent('16');
        expect(screen.getByTestId('spacing')).toHaveTextContent('0');
    });

    it('toggles the settings dialog', async () => {
        const user = userEvent.setup();
        renderWithProviders(<Probe />);

        await user.click(screen.getByText('toggle'));
        expect(screen.getByTestId('show')).toHaveTextContent('true');
    });

    it('persists theme, font, spacing and link preference', async () => {
        const user = userEvent.setup();
        renderWithProviders(<Probe />);

        await user.click(screen.getByText('night'));
        await user.click(screen.getByText('font'));
        await user.click(screen.getByText('spacing'));
        await user.click(screen.getByText('newtab'));

        expect(screen.getByTestId('theme')).toHaveTextContent('night');
        expect(localStorage.getItem('theme')).toBe('night');
        expect(localStorage.getItem('titleFontSize')).toBe('20');
        expect(localStorage.getItem('listSpacing')).toBe('8');
        expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
    });

    it('reads persisted values on mount', () => {
        localStorage.setItem('theme', 'night');
        localStorage.setItem('titleFontSize', '20');
        renderWithProviders(<Probe />);

        expect(screen.getByTestId('theme')).toHaveTextContent('night');
        expect(screen.getByTestId('font')).toHaveTextContent('20');
    });
});
