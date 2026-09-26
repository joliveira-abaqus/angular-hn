import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterLink, RouterModule, provideRouter } from '@angular/router';

import { ItemComponent } from './item.component';
import { CommentPipe } from '../../shared/pipes/comment.pipe';
import { SettingsService } from '../../shared/services/settings.service';
import { MockSettingsService, createStory } from '../../shared/testing/fixtures';

describe('ItemComponent', () => {
  let fixture: ComponentFixture<ItemComponent>;
  let component: ItemComponent;
  let element: HTMLElement;
  let settingsService: MockSettingsService;

  const titleLink = () => element.querySelector('a.title') as HTMLAnchorElement;
  const routerLinkHrefs = () =>
    fixture.debugElement.queryAll(By.directive(RouterLink)).map(de => de.injector.get(RouterLink).href);

  beforeEach(async () => {
    settingsService = new MockSettingsService();

    await TestBed.configureTestingModule({
      declarations: [ItemComponent, CommentPipe],
      imports: [RouterModule],
      providers: [provideRouter([]), { provide: SettingsService, useValue: settingsService }],
    }).compileComponents();

    fixture = TestBed.createComponent(ItemComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
  });

  function render(storyOverrides = {}) {
    fixture.componentRef.setInput('item', createStory(storyOverrides));
    fixture.detectChanges();
  }

  it('deve ser criado', () => {
    render();
    expect(component).toBeTruthy();
  });

  describe('hasUrl', () => {
    it('deve ser true para URLs http/https', () => {
      component.item = createStory({ url: 'https://example.com' });
      expect(component.hasUrl).toBeTrue();
      component.item = createStory({ url: 'http://example.com' });
      expect(component.hasUrl).toBeTrue();
    });

    it('deve ser false para URLs internas (item?id=...)', () => {
      component.item = createStory({ url: 'item?id=1' });
      expect(component.hasUrl).toBeFalse();
    });

    it('deve ser false para string vazia', () => {
      component.item = createStory({ url: '' });
      expect(component.hasUrl).toBeFalse();
    });
  });

  describe('story com URL externa', () => {
    it('deve renderizar o título como link externo com o domínio', () => {
      render({ title: 'Título externo', url: 'https://angular.dev/x', domain: 'angular.dev' });
      expect(titleLink().textContent.trim()).toBe('Título externo');
      expect(titleLink().getAttribute('href')).toBe('https://angular.dev/x');
      expect(element.querySelector('.domain').textContent).toBe('(angular.dev)');
    });

    it('não deve renderizar o domínio quando ausente', () => {
      render({ domain: undefined });
      expect(element.querySelector('.domain')).toBeNull();
    });

    it('não deve abrir em nova aba por padrão', () => {
      render();
      expect(titleLink().getAttribute('target')).toBeNull();
      expect(titleLink().getAttribute('rel')).toBeNull();
    });

    it('deve abrir em nova aba com rel=noopener quando a configuração está ativa', () => {
      settingsService.set({ openLinkInNewTab: true });
      render();
      expect(titleLink().getAttribute('target')).toBe('_blank');
      expect(titleLink().getAttribute('rel')).toBe('noopener');
    });

    it('deve reagir à mudança da configuração após renderizado', () => {
      render();
      settingsService.set({ openLinkInNewTab: true });
      fixture.detectChanges();
      expect(titleLink().getAttribute('target')).toBe('_blank');
    });
  });

  describe('story sem URL externa (Ask HN)', () => {
    it('deve renderizar o título como routerLink para os detalhes do item', () => {
      render({ id: 77, url: 'item?id=77', title: 'Ask HN: algo?' });
      expect(titleLink().textContent.trim()).toBe('Ask HN: algo?');
      expect(titleLink().getAttribute('href')).toBe('/item/77');
      expect(element.querySelector('.domain')).toBeNull();
    });
  });

  describe('subtexto', () => {
    it('deve exibir pontos, usuário, tempo e contagem de comentários', () => {
      render({ points: 99, user: 'carol', time_ago: 5, comments_count: 3 });
      const laptop = element.querySelector('.subtext-laptop');
      expect(laptop.textContent).toContain('99 points by');
      expect(laptop.textContent).toContain('carol');
      expect(laptop.textContent).toContain('5');
      expect(laptop.textContent).toContain('3 comments');
    });

    it('deve usar o CommentPipe (singular / discuss)', () => {
      render({ comments_count: 1 });
      expect(element.querySelector('.subtext-palm .comment-number').textContent).toContain('1 comment');

      render({ comments_count: 0 });
      expect(element.querySelector('.subtext-palm .comment-number').textContent).toContain('discuss');
    });

    it('deve apontar routerLinks para usuário e item', () => {
      render({ id: 5, user: 'dave', url: 'https://x.y' });
      const hrefs = routerLinkHrefs();
      expect(hrefs).toContain('/user/dave');
      expect(hrefs).toContain('/item/5');
    });

    it('não deve exibir pontos, autor nem comentários para jobs', () => {
      render({ type: 'job', points: undefined, user: undefined, comments_count: undefined });
      expect(element.querySelector('.subtext-palm .details .name')).toBeNull();
      expect(element.querySelector('.comment-number')).toBeNull();
      expect(element.querySelector('.subtext-laptop').textContent).not.toContain('points by');
      expect(element.querySelector('.subtext-laptop .item-details')).toBeNull();
    });
  });

  describe('configurações de aparência', () => {
    it('deve aplicar o tamanho da fonte do título', () => {
      settingsService.set({ titleFontSize: '22' });
      render();
      expect(titleLink().style.fontSize).toBe('22px');
    });

    it('deve aplicar o espaçamento da lista como margin-bottom', () => {
      settingsService.set({ listSpacing: '14' });
      render();
      expect((element.firstElementChild as HTMLElement).style.marginBottom).toBe('14px');
    });
  });
});
