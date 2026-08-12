import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-error-message',
  standalone: false,
  templateUrl: './error-message.component.html',
  styleUrls: ['./error-message.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ErrorMessageComponent {
  @Input() message: string;
}
