import { Injectable, signal } from '@angular/core';

import { Settings } from '../models/settings';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private _settings = signal<Settings>({
    showSettings : false,
    openLinkInNewTab: localStorage.getItem("openLinkInNewTab") ? JSON.parse(localStorage.getItem("openLinkInNewTab")) : false,
    theme: 'default',
    titleFontSize: localStorage.getItem("titleFontSize") ? localStorage.getItem("titleFontSize") : '16',
    listSpacing: localStorage.getItem("listSpacing") ? localStorage.getItem("listSpacing") : '0',
  });

  // Reading this in a template registers a dependency, so OnPush components
  // refresh automatically whenever a setting changes.
  readonly settings = this._settings.asReadonly();

  darkColorSchemeMedia = window.matchMedia('(prefers-color-scheme: dark)');

  constructor() {
    this.subscribeToSystemPreferredColorScheme();
    this.initTheme();
  }

  ngOnDestroy() {
    this.unSubscribeToSystemPrefferedColorScheme();
  }

  handleSystemPreferredColorSchemeChange(event: MediaQueryListEvent) {
    let theme;
    if (event.matches) {
      theme = 'night';
    } else {
      theme = 'default';
    }
    this.setTheme(theme);
  }

  subscribeToSystemPreferredColorScheme() {
    this.darkColorSchemeMedia.addEventListener(
      'change',
      this.handleSystemPreferredColorSchemeChange.bind(this)
    );
  }

  initTheme() {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      this._settings.update(settings => ({ ...settings, theme: savedTheme }));
    } else {
      this.darkColorSchemeMedia.dispatchEvent(
        new MediaQueryListEvent('change', {
          media: this.darkColorSchemeMedia.media,
          matches: this.darkColorSchemeMedia.matches
        })
      );
    }
  }

  unSubscribeToSystemPrefferedColorScheme() {
    this.darkColorSchemeMedia.removeEventListener(
      'change',
      this.handleSystemPreferredColorSchemeChange.bind(this)
    );
  }

  toggleSettings() {
    this._settings.update(settings => ({ ...settings, showSettings: !settings.showSettings }));
  }

  toggleOpenLinksInNewTab() {
    const openLinkInNewTab = !this._settings().openLinkInNewTab;
    this._settings.update(settings => ({ ...settings, openLinkInNewTab }));
    localStorage.setItem("openLinkInNewTab", JSON.stringify(openLinkInNewTab));
  }

  setTheme(theme) {
    this._settings.update(settings => ({ ...settings, theme }));
    localStorage.setItem("theme", theme);
  }

  setFont(fontSize){
    this._settings.update(settings => ({ ...settings, titleFontSize: fontSize }));
    localStorage.setItem("titleFontSize", fontSize);
  }

  setSpacing(listSpace){
    this._settings.update(settings => ({ ...settings, listSpacing: listSpace }));
    localStorage.setItem("listSpacing", listSpace);
  }
}
