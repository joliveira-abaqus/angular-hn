import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';

import { trackPageView } from './analytics';
import { Footer } from './core/Footer';
import { Header } from './core/Header';
import { useSettings } from './settings/SettingsContext';
import './App.scss';

export function App() {
    const { settings } = useSettings();
    const location = useLocation();

    useEffect(() => {
        trackPageView(location.pathname + location.search + location.hash);
    }, [location.pathname, location.search, location.hash]);

    return (
        <div className={settings.theme}>
            <div className="body-cover"></div>
            <div className="wrapper">
                <Header />
                <Outlet />
                <Footer />
            </div>
        </div>
    );
}
