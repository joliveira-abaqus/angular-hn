import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { FavoritesService } from '../shared/services/favorites.service';
import { Story } from '../shared/models/story';

@Component({
  selector: 'app-favorites',
  standalone: false,
  templateUrl: './favorites.component.html',
  styleUrls: ['../feeds/feed/feed.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FavoritesComponent {
  private _hackerNewsAPIService = inject(HackerNewsAPIService);
  private _favoritesService = inject(FavoritesService);

  readonly items = signal<Story[] | undefined>(undefined);
  readonly errorMessage = signal('');

  constructor() {
    toObservable(this._favoritesService.favorites).pipe(
      switchMap(ids => this._hackerNewsAPIService.fetchFavorites(ids).pipe(
        catchError(() => {
          this.errorMessage.set('Could not load your favorite stories.');
          return of(undefined);
        })
      )),
      takeUntilDestroyed()
    ).subscribe(items => this.items.set(items));
  }

  trackById(index: number, item: Story): number {
    return item.id;
  }
}
