import { lazy, Suspense, useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import Feed from './components/Feed';
import Footer from './components/Footer';
import Header from './components/Header';
import Loader from './components/Loader';
import { useSettings } from './hooks/useSettings';
import './App.scss';

const ItemDetails = lazy(() => import('./components/ItemDetails'));
const UserProfile = lazy(() => import('./components/UserProfile'));

declare global {
    interface Window {
        ga?: (...args: string[]) => void;
    }
}

const FEED_TYPES = ['news', 'newest', 'show', 'ask', 'jobs'] as const;

export default function App() {
    const { settings } = useSettings();
    const location = useLocation();

    useEffect(() => {
        window.ga?.('set', 'page', location.pathname + location.search);
        window.ga?.('send', 'pageview');
    }, [location]);

    return (
        <div className={settings.theme}>
            <div className="body-cover"></div>
            <div className="wrapper">
                <Header />
                <Suspense fallback={<Loader />}>
                    <Routes>
                        <Route path="/" element={<Navigate to="/news/1" replace />} />
                        {FEED_TYPES.map((feedType) => (
                            <Route key={feedType} path={`/${feedType}/:page`} element={<Feed feedType={feedType} />} />
                        ))}
                        <Route path="/item/:id" element={<ItemDetails />} />
                        <Route path="/user/:id" element={<UserProfile />} />
                    </Routes>
                </Suspense>
                <Footer />
            </div>
        </div>
    );
}
