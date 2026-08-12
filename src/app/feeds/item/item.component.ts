import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';
import { Story } from '../../shared/models/story';

import { SettingsService } from '../../shared/services/settings.service';

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

  get hasUrl(): boolean {
    return this.item.url.indexOf('http') === 0;
  }

}
