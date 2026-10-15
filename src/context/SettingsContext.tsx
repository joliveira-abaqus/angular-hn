import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react';

import type { Settings } from '../models/settings';

export type Theme = 'default' | 'night' | 'amoledblack';

const DARK_SCHEME_QUERY = '(prefers-color-scheme: dark)';

type Action =
    | { type: 'toggleSettings' }
    | { type: 'toggleOpenLinkInNewTab' }
    | { type: 'setTheme'; theme: string }
    | { type: 'setFont'; fontSize: string }
    | { type: 'setSpacing'; listSpacing: string };

function systemTheme(): Theme {
    return window.matchMedia(DARK_SCHEME_QUERY).matches ? 'night' : 'default';
}

/** Lê o estado inicial do localStorage com as mesmas chaves e defaults do SettingsService Angular. */
export function loadInitialSettings(): Settings {
    const openLinkInNewTab = localStorage.getItem('openLinkInNewTab');
    return {
        showSettings: false,
        openLinkInNewTab: openLinkInNewTab ? JSON.parse(openLinkInNewTab) : false,
        theme: localStorage.getItem('theme') || systemTheme(),
        titleFontSize: localStorage.getItem('titleFontSize') || '16',
        listSpacing: localStorage.getItem('listSpacing') || '0',
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

export interface SettingsContextValue {
    settings: Settings;
    toggleSettings: () => void;
    toggleOpenLinksInNewTab: () => void;
    setTheme: (theme: string) => void;
    setFont: (fontSize: string) => void;
    setSpacing: (listSpacing: string) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, dispatch] = useReducer(reducer, undefined, loadInitialSettings);

    // Persiste as preferências (exceto showSettings) sempre que mudam.
    useEffect(() => {
        localStorage.setItem('openLinkInNewTab', JSON.stringify(settings.openLinkInNewTab));
    }, [settings.openLinkInNewTab]);
    useEffect(() => {
        localStorage.setItem('theme', settings.theme);
    }, [settings.theme]);
    useEffect(() => {
        localStorage.setItem('titleFontSize', settings.titleFontSize);
    }, [settings.titleFontSize]);
    useEffect(() => {
        localStorage.setItem('listSpacing', settings.listSpacing);
    }, [settings.listSpacing]);

    // Acompanha a preferência de cor do sistema, como o SettingsService fazia.
    useEffect(() => {
        const media = window.matchMedia(DARK_SCHEME_QUERY);
        const onChange = (event: MediaQueryListEvent) =>
            dispatch({ type: 'setTheme', theme: event.matches ? 'night' : 'default' });
        media.addEventListener('change', onChange);
        return () => media.removeEventListener('change', onChange);
    }, []);

    const toggleSettings = useCallback(() => dispatch({ type: 'toggleSettings' }), []);
    const toggleOpenLinksInNewTab = useCallback(() => dispatch({ type: 'toggleOpenLinkInNewTab' }), []);
    const setTheme = useCallback((theme: string) => dispatch({ type: 'setTheme', theme }), []);
    const setFont = useCallback((fontSize: string) => dispatch({ type: 'setFont', fontSize }), []);
    const setSpacing = useCallback((listSpacing: string) => dispatch({ type: 'setSpacing', listSpacing }), []);

    const value = useMemo(
        () => ({ settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing }),
        [settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing]
    );

    return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings precisa ser usado dentro de <SettingsProvider>');
    }
    return context;
}
