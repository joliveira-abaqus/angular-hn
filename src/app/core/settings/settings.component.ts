import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { SettingsService } from '../../shared/services/settings.service';

@Component({
  selector: 'app-settings',
  standalone: false,
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsComponent {
  private _settingsService = inject(SettingsService);
  readonly settings = this._settingsService.settings;

  closeSettings() {
    this._settingsService.toggleSettings();
  }

  toggleOpenLinksInNewTab() {
    this._settingsService.toggleOpenLinksInNewTab();
  }

  selectTheme(theme) {
    this._settingsService.setTheme(theme);
  }

  changeTitleFont(val){
    this._settingsService.setFont(val);
  }

  changeSpacing(val){
    this._settingsService.setSpacing(val);
  }
}
