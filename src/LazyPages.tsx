import { lazy, Suspense } from 'react';

import { Loader } from './shared/components/Loader';

const ItemDetails = lazy(() => import('./item-details/ItemDetails'));
const User = lazy(() => import('./user/User'));

export function ItemDetailsPage() {
    return (
        <Suspense fallback={<Loader />}>
            <ItemDetails />
        </Suspense>
    );
}

export function UserPage() {
    return (
        <Suspense fallback={<Loader />}>
            <User />
        </Suspense>
    );
}
