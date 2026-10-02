import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react';

import type { Settings, Theme } from '../shared/models/settings';
import { STORAGE_KEYS } from './storageKeys';

const DARK_SCHEME_QUERY = '(prefers-color-scheme: dark)';

type Action =
    | { type: 'toggleSettings' }
    | { type: 'toggleOpenLinkInNewTab' }
    | { type: 'setTheme'; theme: Theme }
    | { type: 'setFont'; fontSize: string }
    | { type: 'setSpacing'; listSpacing: string };

export interface SettingsContextValue {
    settings: Settings;
    toggleSettings: () => void;
    toggleOpenLinksInNewTab: () => void;
    setTheme: (theme: Theme) => void;
    setFont: (fontSize: string) => void;
    setSpacing: (listSpacing: string) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

function systemTheme(): Theme {
    return window.matchMedia(DARK_SCHEME_QUERY).matches ? 'night' : 'default';
}

function loadInitialSettings(): Settings {
    const openLinkInNewTab = localStorage.getItem(STORAGE_KEYS.openLinkInNewTab);
    return {
        showSettings: false,
        openLinkInNewTab: openLinkInNewTab ? (JSON.parse(openLinkInNewTab) as boolean) : false,
        theme: (localStorage.getItem(STORAGE_KEYS.theme) as Theme | null) ?? systemTheme(),
        titleFontSize: localStorage.getItem(STORAGE_KEYS.titleFontSize) || '16',
        listSpacing: localStorage.getItem(STORAGE_KEYS.listSpacing) || '0',
    };
}

function reducer(state: Settings, action: Action): Settings {
    switch (action.type) {
        case 'toggleSettings':
            return { ...state, showSettings: !state.showSettings };
        case 'toggleOpenLinkInNewTab':
            return { ...state, openLinkInNewTab: !state.openLinkInNewTab };
        case 'setTheme':
            return { ...state, theme: action.theme };
        case 'setFont':
            return { ...state, titleFontSize: action.fontSize };
        case 'setSpacing':
            return { ...state, listSpacing: action.listSpacing };
    }
}

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, dispatch] = useReducer(reducer, undefined, loadInitialSettings);

    const setTheme = useCallback((theme: Theme) => dispatch({ type: 'setTheme', theme }), []);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.openLinkInNewTab, JSON.stringify(settings.openLinkInNewTab));
        localStorage.setItem(STORAGE_KEYS.theme, settings.theme);
        localStorage.setItem(STORAGE_KEYS.titleFontSize, settings.titleFontSize);
        localStorage.setItem(STORAGE_KEYS.listSpacing, settings.listSpacing);
    }, [settings.openLinkInNewTab, settings.theme, settings.titleFontSize, settings.listSpacing]);

    useEffect(() => {
        const media = window.matchMedia(DARK_SCHEME_QUERY);
        const onChange = (event: MediaQueryListEvent) => setTheme(event.matches ? 'night' : 'default');
        media.addEventListener('change', onChange);
        return () => media.removeEventListener('change', onChange);
    }, [setTheme]);

    const value = useMemo<SettingsContextValue>(
        () => ({
            settings,
            toggleSettings: () => dispatch({ type: 'toggleSettings' }),
            toggleOpenLinksInNewTab: () => dispatch({ type: 'toggleOpenLinkInNewTab' }),
            setTheme,
            setFont: (fontSize) => dispatch({ type: 'setFont', fontSize }),
            setSpacing: (listSpacing) => dispatch({ type: 'setSpacing', listSpacing }),
        }),
        [settings, setTheme]
    );

    return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSettings(): SettingsContextValue {
    const ctx = useContext(SettingsContext);
    if (!ctx) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return ctx;
}
