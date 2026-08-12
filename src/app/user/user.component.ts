import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { EMPTY, Subscription } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';

import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { User } from '../shared/models/user';

@Component({
  selector: 'app-user',
  standalone: false,
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserComponent implements OnInit, OnDestroy {
  private _hackerNewsAPIService = inject(HackerNewsAPIService);
  private route = inject(ActivatedRoute);
  private _location = inject(Location);
  private cdr = inject(ChangeDetectorRef);

  sub: Subscription;
  user: User;
  errorMessage = '';

  ngOnInit() {
    this.sub = this.route.params.pipe(
      tap(() => {
        this.user = undefined;
        this.errorMessage = '';
        this.cdr.markForCheck();
      }),
      switchMap(params => this._hackerNewsAPIService.fetchUser(params['id']).pipe(
        catchError(() => {
          this.errorMessage = 'Could not load user ' + params['id'] + '.';
          this.cdr.markForCheck();
          return EMPTY;
        })
      ))
    ).subscribe(user => {
      this.user = user;
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  goBack() {
    this._location.back();
  }
}
