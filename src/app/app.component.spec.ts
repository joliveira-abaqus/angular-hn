import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { Subject } from 'rxjs';

import { AppComponent } from './app.component';
import { SettingsService } from './shared/services/settings.service';
import { MockSettingsService } from './shared/testing/fixtures';

@Component({ selector: 'app-header', standalone: false, template: '<div class="stub-header"></div>' })
class HeaderStubComponent {}

@Component({ selector: 'app-footer', standalone: false, template: '<div class="stub-footer"></div>' })
class FooterStubComponent {}

@Component({ selector: 'router-outlet', standalone: false, template: '' })
class RouterOutletStubComponent {}

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;
  let element: HTMLElement;
  let settingsService: MockSettingsService;
  let routerEvents$: Subject<unknown>;
  let ga: jasmine.Spy;

  beforeEach(async () => {
    settingsService = new MockSettingsService();
    routerEvents$ = new Subject();
    ga = jasmine.createSpy('ga');
    (window as any).ga = ga;

    await TestBed.configureTestingModule({
      declarations: [AppComponent, HeaderStubComponent, FooterStubComponent, RouterOutletStubComponent],
      providers: [
        { provide: SettingsService, useValue: settingsService },
        { provide: Router, useValue: { events: routerEvents$.asObservable() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
    fixture.detectChanges();
  });

  afterEach(() => {
    delete (window as any).ga;
  });

  it('deve ser criado', () => {
    expect(component).toBeTruthy();
  });

  it('deve renderizar o shell com header, router-outlet e footer', () => {
    const wrapper = element.querySelector('.wrapper');
    expect(wrapper).not.toBeNull();
    expect(wrapper.querySelector('app-header .stub-header')).not.toBeNull();
    expect(wrapper.querySelector('router-outlet')).not.toBeNull();
    expect(wrapper.querySelector('app-footer .stub-footer')).not.toBeNull();
    expect(element.querySelector('.body-cover')).not.toBeNull();
  });

  it('deve aplicar o tema atual como classe do container raiz', () => {
    expect(element.firstElementChild.className).toBe('default');
  });

  it('deve atualizar a classe do tema quando as settings mudam', () => {
    settingsService.set({ theme: 'night' });
    fixture.detectChanges();
    expect(element.firstElementChild.className).toBe('night');

    settingsService.set({ theme: 'amoledblack' });
    fixture.detectChanges();
    expect(element.firstElementChild.className).toBe('amoledblack');
  });

  describe('analytics', () => {
    it('deve registrar pageview no Google Analytics a cada NavigationEnd', () => {
      routerEvents$.next(new NavigationEnd(1, '/news/1', '/news/1'));

      expect(ga).toHaveBeenCalledWith('set', 'page', '/news/1');
      expect(ga).toHaveBeenCalledWith('send', 'pageview');
      expect(ga).toHaveBeenCalledTimes(2);
    });

    it('deve usar urlAfterRedirects, e não a URL original', () => {
      routerEvents$.next(new NavigationEnd(1, '/', '/news/1'));
      expect(ga).toHaveBeenCalledWith('set', 'page', '/news/1');
    });

    it('deve ignorar eventos de navegação que não sejam NavigationEnd', () => {
      routerEvents$.next(new NavigationStart(1, '/news/1'));
      expect(ga).not.toHaveBeenCalled();
    });
  });
});
