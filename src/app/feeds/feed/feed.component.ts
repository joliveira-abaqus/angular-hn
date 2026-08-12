import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { EMPTY, Subscription } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';

import { HackerNewsAPIService } from '../../shared/services/hackernews-api.service';
import { Story } from '../../shared/models/story';

@Component({
  selector: 'app-feed',
  standalone: false,
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class FeedComponent implements OnInit, OnDestroy {
  private _hackerNewsAPIService = inject(HackerNewsAPIService);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  sub: Subscription;
  items: Story[];
  feedType: string;
  pageNum: number;
  listStart: number;
  errorMessage = '';

  ngOnInit() {
    this.sub = this.route.params.pipe(
      tap(params => {
        this.pageNum = params['page'] ? +params['page'] : 1;
        this.feedType = this.route.snapshot.data['feedType'];
        // Drop stale results so the loader shows while the new page is fetched.
        this.items = undefined;
        this.errorMessage = '';
        this.cdr.markForCheck();
      }),
      // switchMap cancels the previous page request, so a fast "More" click
      // can never be overtaken by an earlier, slower response.
      switchMap(() => this._hackerNewsAPIService.fetchFeed(this.feedType, this.pageNum).pipe(
        catchError(() => {
          this.errorMessage = 'Could not load ' + this.feedType + ' stories.';
          this.cdr.markForCheck();
          return EMPTY;
        })
      ))
    ).subscribe(items => {
      this.items = items;
      this.listStart = ((this.pageNum - 1) * 30) + 1;
      window.scrollTo(0, 0);
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  trackById(index: number, item: Story): number {
    return item.id;
  }
}
