import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

type Listener = (event: MediaQueryListEvent) => void;

/** matchMedia controlável nos testes: `setSystemDarkMode(true)` dispara o evento "change". */
const listeners = new Set<Listener>();
let systemDark = false;

export function setSystemDarkMode(dark: boolean, notify = true) {
    systemDark = dark;
    if (notify) {
        listeners.forEach(listener => listener({ matches: dark } as MediaQueryListEvent));
    }
}

Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn((query: string) => ({
        get matches() {
            return query.includes('dark') && systemDark;
        },
        media: query,
        addEventListener: (_: string, listener: Listener) => listeners.add(listener),
        removeEventListener: (_: string, listener: Listener) => listeners.delete(listener),
        dispatchEvent: () => true,
    })),
});

window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;

afterEach(() => {
    cleanup();
    localStorage.clear();
    listeners.clear();
    systemDark = false;
    vi.unstubAllGlobals();
});
