import { Navigate, type RouteObject } from 'react-router';

import { App } from './App';
import { Feed } from './feeds/Feed';
import { ItemDetailsPage, UserPage } from './LazyPages';
import { FEED_NAMES } from './shared/models/feed-type.type';

export const routes: RouteObject[] = [
    {
        path: '/',
        element: <App />,
        children: [
            { index: true, element: <Navigate to="/news/1" replace /> },
            ...FEED_NAMES.map((feedType) => ({
                path: `${feedType}/:page`,
                element: <Feed key={feedType} feedType={feedType} />,
            })),
            { path: 'item/:id', element: <ItemDetailsPage /> },
            { path: 'user/:id', element: <UserPage /> },
            { path: '*', element: <Navigate to="/news/1" replace /> },
        ],
    },
];
