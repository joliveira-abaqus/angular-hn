import { signal } from '@angular/core';

import { Comment } from '../models/comment';
import { PollResult } from '../models/poll-result';
import { Settings } from '../models/settings';
import { Story } from '../models/story';
import { User } from '../models/user';

// Fixtures reutilizadas pelos specs. Os valores padrão podem ser sobrescritos
// com `overrides` para cobrir casos específicos sem repetir o objeto inteiro.

export function createComment(overrides: Partial<Comment> = {}): Comment {
  return {
    id: 100,
    level: 0,
    user: 'alice',
    time: 1700000000,
    time_ago: '2 hours ago',
    content: '<p>Comentário de teste</p>',
    deleted: false,
    comments: [],
    ...overrides,
  };
}

export function createPollResult(overrides: Partial<PollResult> = {}): PollResult {
  return {
    points: 10,
    content: 'Opção A',
    ...overrides,
  };
}

export function createStory(overrides: Partial<Story> = {}): Story {
  return {
    id: 1,
    title: 'Angular 21 released',
    text: '',
    content: '',
    points: 250,
    user: 'bob',
    time: 1700000000,
    time_ago: 3,
    type: 'story',
    url: 'https://angular.dev/blog',
    domain: 'angular.dev',
    comments: [],
    comments_count: 42,
    poll: [],
    poll_votes_count: 0,
    deleted: false,
    dead: false,
    ...overrides,
  };
}

export function createStories(count: number, startId = 1): Story[] {
  return Array.from({ length: count }, (_, i) =>
    createStory({ id: startId + i, title: `Story ${startId + i}` })
  );
}

export function createUser(overrides: Partial<User> = {}): User {
  return {
    id: 'alice',
    crated_time: 1400000000,
    created: '9 years ago',
    karma: 1234,
    avg: 1.5,
    about: '<p>Sobre a alice</p>',
    ...overrides,
  };
}

export function createSettings(overrides: Partial<Settings> = {}): Settings {
  return {
    showSettings: false,
    openLinkInNewTab: false,
    theme: 'default',
    titleFontSize: '16',
    listSpacing: '0',
    ...overrides,
  };
}

/**
 * Substituto do SettingsService com a mesma API pública, mas sem tocar em
 * `localStorage` nem em `matchMedia`. Os métodos são spies que também aplicam
 * a mudança no signal, para que os templates reajam como no serviço real.
 */
export class MockSettingsService {
  private _settings = signal<Settings>(createSettings());
  readonly settings = this._settings.asReadonly();

  toggleSettings = jasmine.createSpy('toggleSettings').and.callFake(() => {
    this._settings.update(s => ({ ...s, showSettings: !s.showSettings }));
  });

  toggleOpenLinksInNewTab = jasmine.createSpy('toggleOpenLinksInNewTab').and.callFake(() => {
    this._settings.update(s => ({ ...s, openLinkInNewTab: !s.openLinkInNewTab }));
  });

  setTheme = jasmine.createSpy('setTheme').and.callFake((theme: string) => {
    this._settings.update(s => ({ ...s, theme }));
  });

  setFont = jasmine.createSpy('setFont').and.callFake((titleFontSize: string) => {
    this._settings.update(s => ({ ...s, titleFontSize }));
  });

  setSpacing = jasmine.createSpy('setSpacing').and.callFake((listSpacing: string) => {
    this._settings.update(s => ({ ...s, listSpacing }));
  });

  set(overrides: Partial<Settings>) {
    this._settings.update(s => ({ ...s, ...overrides }));
  }
}
