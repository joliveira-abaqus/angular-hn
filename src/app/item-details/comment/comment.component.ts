import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { Comment } from '../../shared/models/comment';

@Component({
  selector: 'app-comment',
  standalone: false,
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommentComponent {
  @Input() comment: Comment;
  collapse = false;

  trackById(index: number, comment: Comment): number {
    return comment.id;
  }
}
