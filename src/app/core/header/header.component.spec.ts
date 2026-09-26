import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterLink, RouterModule, provideRouter } from '@angular/router';

import { HeaderComponent } from './header.component';
import { SettingsComponent } from '../settings/settings.component';
import { SettingsService } from '../../shared/services/settings.service';
import { MockSettingsService } from '../../shared/testing/fixtures';

describe('HeaderComponent', () => {
  let fixture: ComponentFixture<HeaderComponent>;
  let component: HeaderComponent;
  let element: HTMLElement;
  let settingsService: MockSettingsService;

  beforeEach(async () => {
    settingsService = new MockSettingsService();

    await TestBed.configureTestingModule({
      declarations: [HeaderComponent, SettingsComponent],
      imports: [RouterModule],
      providers: [provideRouter([]), { provide: SettingsService, useValue: settingsService }],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('deve ser criado', () => {
    expect(component).toBeTruthy();
  });

  it('deve expor o signal de settings do serviço', () => {
    expect(component.settings).toBe(settingsService.settings);
  });

  it('deve renderizar os links de navegação para cada feed', () => {
    const routerLinks = fixture.debugElement
      .queryAll(By.directive(RouterLink))
      .map(de => de.injector.get(RouterLink).href);

    expect(routerLinks).toEqual(['/news/1', '/newest/1', '/show/1', '/ask/1', '/jobs/1']);
  });

  it('deve exibir os rótulos de navegação', () => {
    const labels = Array.from(element.querySelectorAll('.header-nav a')).map(a => a.textContent.trim());
    expect(labels).toEqual(['new', 'show', 'ask', 'jobs']);
  });

  it('não deve renderizar o painel de settings por padrão', () => {
    expect(element.querySelector('app-settings')).toBeNull();
  });

  it('deve chamar toggleSettings ao clicar no ícone de engrenagem', () => {
    (element.querySelector('img.settings') as HTMLElement).click();
    expect(settingsService.toggleSettings).toHaveBeenCalledTimes(1);
  });

  it('deve renderizar o painel de settings quando showSettings é true', () => {
    settingsService.set({ showSettings: true });
    fixture.detectChanges();
    expect(element.querySelector('app-settings')).not.toBeNull();
  });

  it('deve esconder o painel novamente quando showSettings volta a false', () => {
    settingsService.set({ showSettings: true });
    fixture.detectChanges();
    settingsService.set({ showSettings: false });
    fixture.detectChanges();
    expect(element.querySelector('app-settings')).toBeNull();
  });

  it('deve rolar para o topo ao clicar em um link de navegação', () => {
    const scrollSpy = spyOn(window, 'scrollTo');
    const link = element.querySelector('.header-nav a') as HTMLAnchorElement;
    link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    expect(scrollSpy).toHaveBeenCalledWith(0, 0);
  });

  it('scrollTop deve chamar window.scrollTo(0, 0)', () => {
    const scrollSpy = spyOn(window, 'scrollTo');
    component.scrollTop();
    expect(scrollSpy).toHaveBeenCalledWith(0, 0);
  });
});
