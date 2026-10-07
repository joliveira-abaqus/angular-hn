import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';
import { Story } from '../../shared/models/story';

import { SettingsService } from '../../shared/services/settings.service';
import { AuthService } from '../../shared/services/auth.service';
import { FavoritesService } from '../../shared/services/favorites.service';

@Component({
  selector: 'item',
  standalone: false,
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemComponent {
  @Input() item: Story;
  readonly settings = inject(SettingsService).settings;
  readonly isLoggedIn = inject(AuthService).isLoggedIn;
  private _favoritesService = inject(FavoritesService);

  get isFavorite(): boolean {
    return this._favoritesService.isFavorite(this.item.id);
  }

  toggleFavorite() {
    this._favoritesService.toggle(this.item.id);
  }

  get hasUrl(): boolean {
    return this.item.url.indexOf('http') === 0;
  }

}
