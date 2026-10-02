type GoogleAnalytics = (command: string, ...fields: string[]) => void;

declare global {
    interface Window {
        ga?: GoogleAnalytics;
    }
}

/** Registra uma visualização de página no Google Analytics (analytics.js carregado em index.html). */
export function trackPageView(url: string): void {
    window.ga?.('set', 'page', url);
    window.ga?.('send', 'pageview');
}
