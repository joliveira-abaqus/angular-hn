import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import type { Settings } from '../types';

interface SettingsContextValue {
    settings: Settings;
    toggleSettings: () => void;
    toggleOpenLinksInNewTab: () => void;
    setTheme: (theme: string) => void;
    setFont: (fontSize: string) => void;
    setSpacing: (listSpacing: string) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

function readStorage(key: string): string | null {
    return localStorage.getItem(key);
}

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<Settings>(() => ({
        showSettings: false,
        openLinkInNewTab: readStorage('openLinkInNewTab') ? JSON.parse(readStorage('openLinkInNewTab')!) : false,
        theme: readStorage('theme') ?? 'default',
        titleFontSize: readStorage('titleFontSize') ?? '16',
        listSpacing: readStorage('listSpacing') ?? '0',
    }));

    const setTheme = useCallback((theme: string) => {
        setSettings((s) => ({ ...s, theme }));
        localStorage.setItem('theme', theme);
    }, []);

    useEffect(() => {
        const darkColorSchemeMedia = window.matchMedia('(prefers-color-scheme: dark)');
        if (!readStorage('theme') && darkColorSchemeMedia.matches) {
            setTheme('night');
        }

        const onChange = (event: MediaQueryListEvent) => {
            setTheme(event.matches ? 'night' : 'default');
        };
        darkColorSchemeMedia.addEventListener('change', onChange);
        return () => darkColorSchemeMedia.removeEventListener('change', onChange);
    }, [setTheme]);

    const toggleSettings = useCallback(() => {
        setSettings((s) => ({ ...s, showSettings: !s.showSettings }));
    }, []);

    const toggleOpenLinksInNewTab = useCallback(() => {
        setSettings((s) => {
            const openLinkInNewTab = !s.openLinkInNewTab;
            localStorage.setItem('openLinkInNewTab', JSON.stringify(openLinkInNewTab));
            return { ...s, openLinkInNewTab };
        });
    }, []);

    const setFont = useCallback((fontSize: string) => {
        setSettings((s) => ({ ...s, titleFontSize: fontSize }));
        localStorage.setItem('titleFontSize', fontSize);
    }, []);

    const setSpacing = useCallback((listSpacing: string) => {
        setSettings((s) => ({ ...s, listSpacing }));
        localStorage.setItem('listSpacing', listSpacing);
    }, []);

    const value = useMemo(
        () => ({ settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing }),
        [settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing]
    );

    return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
    const ctx = useContext(SettingsContext);
    if (!ctx) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return ctx;
}
