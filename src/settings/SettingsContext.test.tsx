import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';

import { SettingsProvider, useSettings } from './SettingsContext';

const wrapper = ({ children }: { children: ReactNode }) => <SettingsProvider>{children}</SettingsProvider>;

describe('SettingsContext', () => {
    it('usa valores padrão', () => {
        const { result } = renderHook(() => useSettings(), { wrapper });
        expect(result.current.settings).toEqual({
            showSettings: false,
            openLinkInNewTab: false,
            theme: 'default',
            titleFontSize: '16',
            listSpacing: '0',
        });
    });

    it('carrega valores persistidos no localStorage', () => {
        localStorage.setItem('openLinkInNewTab', 'true');
        localStorage.setItem('theme', 'amoledblack');
        localStorage.setItem('titleFontSize', '20');
        localStorage.setItem('listSpacing', '5');
        const { result } = renderHook(() => useSettings(), { wrapper });
        expect(result.current.settings).toMatchObject({
            openLinkInNewTab: true,
            theme: 'amoledblack',
            titleFontSize: '20',
            listSpacing: '5',
        });
    });

    it('persiste alterações no localStorage', () => {
        const { result } = renderHook(() => useSettings(), { wrapper });
        act(() => {
            result.current.toggleOpenLinksInNewTab();
            result.current.setTheme('night');
            result.current.setFont('18');
            result.current.setSpacing('10');
            result.current.toggleSettings();
        });
        expect(result.current.settings.showSettings).toBe(true);
        expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
        expect(localStorage.getItem('theme')).toBe('night');
        expect(localStorage.getItem('titleFontSize')).toBe('18');
        expect(localStorage.getItem('listSpacing')).toBe('10');
    });

    it('exige o provider', () => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
        expect(() => renderHook(() => useSettings())).toThrow(/SettingsProvider/);
    });
});
