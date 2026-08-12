import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { SettingsService } from '../../shared/services/settings.service';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {
  private _settingsService = inject(SettingsService);
  readonly settings = this._settingsService.settings;

  toggleSettings() {
    this._settingsService.toggleSettings();
  }

  scrollTop() {
    window.scrollTo(0, 0);
  }
}
