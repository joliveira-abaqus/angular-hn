import { act, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { setSystemDarkMode } from '../test/setup';
import { SettingsProvider, useSettings, type SettingsContextValue } from './SettingsContext';

function renderSettings() {
    const ref: { current: SettingsContextValue | null } = { current: null };
    function Probe() {
        ref.current = useSettings();
        return <span data-testid="theme">{ref.current.settings.theme}</span>;
    }
    render(
        <SettingsProvider>
            <Probe />
        </SettingsProvider>
    );
    return ref as { current: SettingsContextValue };
}

describe('SettingsContext', () => {
    it('usa os defaults quando não há nada salvo', () => {
        const ctx = renderSettings();
        expect(ctx.current.settings).toEqual({
            showSettings: false,
            openLinkInNewTab: false,
            theme: 'default',
            titleFontSize: '16',
            listSpacing: '0',
        });
    });

    it('lê as preferências salvas no localStorage (mesmas chaves do app Angular)', () => {
        localStorage.setItem('openLinkInNewTab', 'true');
        localStorage.setItem('theme', 'amoledblack');
        localStorage.setItem('titleFontSize', '20');
        localStorage.setItem('listSpacing', '8');
        const ctx = renderSettings();
        expect(ctx.current.settings).toMatchObject({
            openLinkInNewTab: true,
            theme: 'amoledblack',
            titleFontSize: '20',
            listSpacing: '8',
        });
    });

    it('persiste as alterações', () => {
        const ctx = renderSettings();
        act(() => {
            ctx.current.toggleOpenLinksInNewTab();
            ctx.current.setTheme('night');
            ctx.current.setFont('22');
            ctx.current.setSpacing('4');
        });
        expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
        expect(localStorage.getItem('theme')).toBe('night');
        expect(localStorage.getItem('titleFontSize')).toBe('22');
        expect(localStorage.getItem('listSpacing')).toBe('4');
    });

    it('alterna a visibilidade do painel de settings sem persistir', () => {
        const ctx = renderSettings();
        act(() => ctx.current.toggleSettings());
        expect(ctx.current.settings.showSettings).toBe(true);
        expect(localStorage.getItem('showSettings')).toBeNull();
    });

    it('usa o tema night quando o sistema está em modo escuro e não há tema salvo', () => {
        setSystemDarkMode(true, false);
        renderSettings();
        expect(screen.getByTestId('theme')).toHaveTextContent('night');
    });

    it('acompanha mudanças de prefers-color-scheme', () => {
        renderSettings();
        act(() => setSystemDarkMode(true));
        expect(screen.getByTestId('theme')).toHaveTextContent('night');
        act(() => setSystemDarkMode(false));
        expect(screen.getByTestId('theme')).toHaveTextContent('default');
    });
});
