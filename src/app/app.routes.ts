import { Routes, RouterModule } from '@angular/router';

import { FeedComponent } from './feeds/feed/feed.component';
import { FavoritesComponent } from './favorites/favorites.component';
import { ProfileComponent } from './profile/profile.component';
import { authGuard } from './shared/guards/auth.guard';

const feedRoutes = [{
  path: ':page',
  component: FeedComponent
}];

const routes: Routes = [
  {path: '', redirectTo: 'news/1', pathMatch: 'full'},
  {
    path: 'news',
    children: feedRoutes,
    data: {feedType: 'news'}
  },
  {
    path: 'newest',
    children: feedRoutes,
    data: {feedType: 'newest'}
  },
  {
    path: 'show',
    children: feedRoutes,
    data: {feedType: 'show'}
  },
  {
    path: 'ask',
    children: feedRoutes,
    data: {feedType: 'ask'}
  },
  {
    path: 'jobs',
    children: feedRoutes,
    data: {feedType: 'jobs'}
  },
  {path: 'item', loadChildren: () => import('./item-details/item-details.module').then(m => m.ItemDetailsModule)},
  {path: 'user', loadChildren: () => import('./user/user.module').then(m => m.UserModule)},
  {path: 'login', loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)},
  {path: 'favorites', component: FavoritesComponent, canActivate: [authGuard]},
  {path: 'profile', component: ProfileComponent, canActivate: [authGuard]}
];


// - Updated Export
export const routing = RouterModule.forRoot(routes);
