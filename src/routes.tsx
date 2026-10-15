import { lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import type { FeedName } from './api/hackernews';
import { App } from './App';
import { FeedPage } from './pages/FeedPage';

// Carregadas sob demanda, como os módulos lazy (loadChildren) do Angular.
const ItemDetailsPage = lazy(() => import('./pages/ItemDetailsPage'));
const UserPage = lazy(() => import('./pages/UserPage'));

const FEEDS: FeedName[] = ['news', 'newest', 'show', 'ask', 'jobs'];

export function AppRoutes() {
    return (
        <Routes>
            <Route element={<App />}>
                <Route index element={<Navigate to="/news/1" replace />} />
                {FEEDS.map(feed => (
                    <Route key={feed} path={`${feed}/:page`} element={<FeedPage feedType={feed} />} />
                ))}
                <Route path="item/:id" element={<ItemDetailsPage />} />
                <Route path="user/:id" element={<UserPage />} />
            </Route>
        </Routes>
    );
}
