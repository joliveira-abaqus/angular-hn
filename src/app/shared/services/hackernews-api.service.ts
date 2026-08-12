import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import fetch from 'unfetch';
import { catchError, map, shareReplay } from 'rxjs/operators';

import { Story } from '../models/story';
import { User } from '../models/user';
import { PollResult } from '../models/poll-result';

// How long a cached response stays fresh before we hit the network again.
const CACHE_TTL_MS = 60 * 1000;

interface CacheEntry {
  stream: Observable<any>;
  expiresAt: number;
}

// wrap fetch in observable so we can keep it chill
@Injectable()
export class HackerNewsAPIService {
  baseUrl: string;
  private cache = new Map<string, CacheEntry>();

  constructor() {
    this.baseUrl = 'https://node-hnapi.herokuapp.com';
  }

  fetchFeed(feedType: string, page: number): Observable<Story[]> {
    return this.cachedFetch<Story[]>(`${this.baseUrl}/${feedType}?page=${page}`);
  }

  fetchItemContent(id: number): Observable<Story> {
    return this.cachedFetch<Story>(`${this.baseUrl}/item/${id}`).pipe(map((story: Story) => {
      if (story.type === 'poll' && story.poll_votes_count === undefined) {
        let numberOfPollOptions = story.poll.length;
        story.poll_votes_count = 0;
        for (let i = 1; i <= numberOfPollOptions; i++) {
          this.fetchPollContent(story.id + i).subscribe(pollResults => {
            story.poll[i - 1] = pollResults;
            story.poll_votes_count += pollResults.points;
          });
        }
      }
      return story;
    }));
  }

  fetchPollContent(id: number): Observable<PollResult> {
    return this.cachedFetch<PollResult>(`${this.baseUrl}/item/${id}`);
  }

  fetchUser(id: string): Observable<User> {
    return this.cachedFetch<User>(`${this.baseUrl}/user/${id}`);
  }

  /**
   * Shares a single in-flight request between concurrent subscribers and replays
   * the result to anyone subscribing again within CACHE_TTL_MS. Failed requests
   * are evicted so an error is never served from cache.
   */
  private cachedFetch<T>(url: string): Observable<T> {
    const cached = this.cache.get(url);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.stream as Observable<T>;
    }

    const stream = lazyFetch<T>(url).pipe(
      catchError(err => {
        this.cache.delete(url);
        return throwError(() => err);
      }),
      shareReplay({ bufferSize: 1, refCount: false })
    );

    this.cache.set(url, { stream, expiresAt: Date.now() + CACHE_TTL_MS });
    return stream;
  }
}

function lazyFetch<T>(url, options?) {
  return new Observable<T>(fetchObserver => {
    let cancelToken = false;
    fetch(url, options)
      .then(res => {
        if (!cancelToken) {
          return res.json()
            .then(data => {
              fetchObserver.next(data);
              fetchObserver.complete();
            });
        }
      }).catch(err => fetchObserver.error(err));
    return () => {
      cancelToken = true;
    };
  });
}
