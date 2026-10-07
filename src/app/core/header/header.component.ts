import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import { SettingsService } from '../../shared/services/settings.service';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {
  private _settingsService = inject(SettingsService);
  private _authService = inject(AuthService);
  private _router = inject(Router);
  readonly settings = this._settingsService.settings;
  readonly authReady = this._authService.ready;
  readonly isLoggedIn = this._authService.isLoggedIn;
  readonly displayName = this._authService.displayName;

  toggleSettings() {
    this._settingsService.toggleSettings();
  }

  async logout() {
    await this._authService.logout();
    await this._router.navigateByUrl('/news/1');
  }

  scrollTop() {
    window.scrollTo(0, 0);
  }
}
