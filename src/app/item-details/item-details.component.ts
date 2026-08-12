import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { EMPTY, Subscription } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';

import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { SettingsService } from '../shared/services/settings.service';

import { Story } from '../shared/models/story';
import { Comment } from '../shared/models/comment';

@Component({
  selector: 'app-item-details',
  standalone: false,
  templateUrl: './item-details.component.html',
  styleUrls: ['./item-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemDetailsComponent implements OnInit, OnDestroy {
  private _hackerNewsAPIService = inject(HackerNewsAPIService);
  private route = inject(ActivatedRoute);
  private _location = inject(Location);
  private cdr = inject(ChangeDetectorRef);

  readonly settings = inject(SettingsService).settings;

  sub: Subscription;
  item: Story;
  errorMessage = '';

  ngOnInit() {
    this.sub = this.route.params.pipe(
      tap(() => {
        this.item = undefined;
        this.errorMessage = '';
        this.cdr.markForCheck();
        window.scrollTo(0, 0);
      }),
      switchMap(params => this._hackerNewsAPIService.fetchItemContent(+params['id']).pipe(
        catchError(() => {
          this.errorMessage = 'Could not load item comments.';
          this.cdr.markForCheck();
          return EMPTY;
        })
      ))
    ).subscribe(item => {
      this.item = item;
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  goBack() {
    this._location.back();
  }

  get hasUrl(): boolean {
    return this.item.url.indexOf('http') === 0;
  }

  trackById(index: number, comment: Comment): number {
    return comment.id;
  }
}
