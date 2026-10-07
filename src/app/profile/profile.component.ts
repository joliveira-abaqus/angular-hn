import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../shared/services/auth.service';
import { FavoritesService } from '../shared/services/favorites.service';

@Component({
  selector: 'app-profile',
  standalone: false,
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  readonly user = this.authService.user;
  readonly displayName = this.authService.displayName;
  readonly favorites = inject(FavoritesService).favorites;

  async logout() {
    await this.authService.logout();
    await this.router.navigateByUrl('/news/1');
  }
}
