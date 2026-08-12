import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

import { SettingsService } from './shared/services/settings.service';

declare let ga: Function;

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class AppComponent {
  readonly settings = inject(SettingsService).settings;
  readonly router = inject(Router);

  constructor() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        ga('set', 'page', event.urlAfterRedirects);
        ga('send', 'pageview');
      }
    });
  }
}
