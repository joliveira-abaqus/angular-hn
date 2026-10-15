import { Suspense, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { Loader } from './components/Loader';
import { useSettings } from './context/SettingsContext';
import './App.scss';

declare global {
    interface Window {
        ga?: (...args: unknown[]) => void;
    }
}

export function App() {
    const { settings } = useSettings();
    const location = useLocation();

    // Equivalente ao NavigationEnd do Angular: registra cada navegação no Google Analytics.
    // "/" é ignorado porque sempre redireciona para /news/1 (como o urlAfterRedirects).
    useEffect(() => {
        if (location.pathname === '/') {
            return;
        }
        window.ga?.('set', 'page', location.pathname + location.search);
        window.ga?.('send', 'pageview');
    }, [location.pathname, location.search]);

    return (
        <div className={settings.theme}>
            <div className="body-cover"></div>
            <div className="wrapper">
                <Header />
                <Suspense fallback={<Loader />}>
                    <Outlet />
                </Suspense>
                <Footer />
            </div>
        </div>
    );
}
