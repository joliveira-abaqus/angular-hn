import { Component, Input } from '@angular/core';
import { Location } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, RouterModule, provideRouter } from '@angular/router';
import { Subject, of, throwError } from 'rxjs';

import { ItemDetailsComponent } from './item-details.component';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { SettingsService } from '../shared/services/settings.service';
import { CommentPipe } from '../shared/pipes/comment.pipe';
import { LoaderComponent } from '../shared/components/loader/loader.component';
import { ErrorMessageComponent } from '../shared/components/error-message/error-message.component';
import { Comment } from '../shared/models/comment';
import { Story } from '../shared/models/story';
import { MockSettingsService, createComment, createPollResult, createStory } from '../shared/testing/fixtures';

@Component({ selector: 'app-comment', standalone: false, template: '<span class="stub-comment">{{ comment.user }}</span>' })
class CommentStubComponent {
  @Input() comment: Comment;
}

describe('ItemDetailsComponent', () => {
  let fixture: ComponentFixture<ItemDetailsComponent>;
  let component: ItemDetailsComponent;
  let element: HTMLElement;
  let api: jasmine.SpyObj<HackerNewsAPIService>;
  let location: jasmine.SpyObj<Location>;
  let settingsService: MockSettingsService;
  let params$: Subject<{ id: string }>;

  const laptopTitle = () => element.querySelector('.laptop a.title') as HTMLAnchorElement;
  const stubComments = () => Array.from(element.querySelectorAll('.stub-comment')).map(el => el.textContent);

  beforeEach(async () => {
    api = jasmine.createSpyObj<HackerNewsAPIService>('HackerNewsAPIService', ['fetchItemContent']);
    location = jasmine.createSpyObj<Location>('Location', ['back']);
    settingsService = new MockSettingsService();
    params$ = new Subject();
    spyOn(window, 'scrollTo');

    await TestBed.configureTestingModule({
      declarations: [ItemDetailsComponent, CommentStubComponent, CommentPipe, LoaderComponent, ErrorMessageComponent],
      imports: [RouterModule],
      providers: [
        provideRouter([]),
        { provide: HackerNewsAPIService, useValue: api },
        { provide: Location, useValue: location },
        { provide: SettingsService, useValue: settingsService },
        { provide: ActivatedRoute, useValue: { params: params$.asObservable() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ItemDetailsComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
  });

  function load(story: Story, id = String(story.id)) {
    api.fetchItemContent.and.returnValue(of(story));
    fixture.detectChanges();
    params$.next({ id });
    fixture.detectChanges();
  }

  it('deve ser criado', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('deve exibir o loader antes de o item chegar', () => {
    fixture.detectChanges();
    expect(element.querySelector('app-loader')).not.toBeNull();
    expect(element.querySelector('.item')).toBeNull();
  });

  describe('carregamento', () => {
    it('deve buscar o item convertendo o id da rota para número', () => {
      load(createStory({ id: 8863 }), '8863');
      expect(api.fetchItemContent).toHaveBeenCalledWith(8863);
      expect(component.item.id).toBe(8863);
    });

    it('deve rolar para o topo ao trocar de item', () => {
      load(createStory());
      expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    });

    it('deve limpar o item anterior ao navegar para outro id', () => {
      const pending = new Subject<Story>();
      api.fetchItemContent.and.returnValues(of(createStory({ id: 1 })), pending.asObservable());
      fixture.detectChanges();
      params$.next({ id: '1' });
      fixture.detectChanges();
      expect(element.querySelector('.item')).not.toBeNull();

      params$.next({ id: '2' });
      fixture.detectChanges();
      expect(component.item).toBeUndefined();
      expect(element.querySelector('app-loader')).not.toBeNull();

      pending.next(createStory({ id: 2, title: 'Segundo' }));
      fixture.detectChanges();
      expect(laptopTitle().textContent.trim()).toBe('Segundo');
    });
  });

  describe('renderização da story', () => {
    it('deve renderizar título com link externo, domínio e subtexto', () => {
      load(createStory({ title: 'Título', url: 'https://ex.com/a', domain: 'ex.com', points: 10, user: 'zed', comments_count: 2 }));

      expect(laptopTitle().textContent.trim()).toBe('Título');
      expect(laptopTitle().getAttribute('href')).toBe('https://ex.com/a');
      expect(element.querySelector('.laptop .domain').textContent).toBe('(ex.com)');
      expect(element.querySelector('.subtext').textContent).toContain('10 points by');
      expect(element.querySelector('.subtext').textContent).toContain('zed');
      expect(element.querySelector('.subtext').textContent).toContain('2 comments');
    });

    it('deve renderizar título como routerLink quando não há URL externa', () => {
      load(createStory({ id: 5, url: 'item?id=5' }));
      expect(laptopTitle().getAttribute('href')).toBe('/item/5');
      expect(element.querySelector('.laptop .domain')).toBeNull();
    });

    it('deve honrar openLinkInNewTab nos links externos (mobile e laptop)', () => {
      settingsService.set({ openLinkInNewTab: true });
      load(createStory());

      const links = Array.from(element.querySelectorAll('a.title[href^="http"]'));
      expect(links.length).toBe(2);
      links.forEach(l => {
        expect(l.getAttribute('target')).toBe('_blank');
        expect(l.getAttribute('rel')).toBe('noopener');
      });
    });

    it('não deve definir target/rel quando openLinkInNewTab está desligado', () => {
      load(createStory());
      expect(laptopTitle().getAttribute('target')).toBeNull();
      expect(laptopTitle().getAttribute('rel')).toBeNull();
    });

    it('deve renderizar o conteúdo textual do item como HTML', () => {
      load(createStory({ content: '<p>Texto <i>rico</i></p>' }));
      expect(element.querySelector('.subject').innerHTML).toBe('<p>Texto <i>rico</i></p>');
    });

    it('deve aplicar item-header quando há comentários e head-margin quando há texto', () => {
      load(createStory({ comments_count: 3, text: 'algo' }));
      const laptop = element.querySelector('.laptop');
      expect(laptop.classList.contains('item-header')).toBeTrue();
      expect(laptop.classList.contains('head-margin')).toBeTrue();
    });

    it('não deve aplicar item-header sem comentários em uma story comum', () => {
      load(createStory({ comments_count: 0, text: '' }));
      const laptop = element.querySelector('.laptop');
      expect(laptop.classList.contains('item-header')).toBeFalse();
      expect(laptop.classList.contains('head-margin')).toBeFalse();
    });

    it('deve omitir pontos/autor/comentários para jobs, mas manter item-header', () => {
      load(createStory({ type: 'job', comments_count: 0 }));
      expect(element.querySelector('.subtext').textContent).not.toContain('points by');
      expect(element.querySelector('.subtext .item-details')).toBeNull();
      expect(element.querySelector('.laptop').classList.contains('item-header')).toBeTrue();
    });
  });

  describe('hasUrl', () => {
    it('deve ser true para http/https e false para links internos', () => {
      component.item = createStory({ url: 'https://a.b' });
      expect(component.hasUrl).toBeTrue();
      component.item = createStory({ url: 'item?id=1' });
      expect(component.hasUrl).toBeFalse();
    });
  });

  describe('comentários', () => {
    it('deve renderizar um app-comment por comentário de primeiro nível', () => {
      load(createStory({
        comments: [createComment({ id: 1, user: 'a' }), createComment({ id: 2, user: 'b' }), createComment({ id: 3, user: 'c' })],
      }));
      expect(stubComments()).toEqual(['a', 'b', 'c']);
    });

    it('deve renderizar lista vazia quando não há comentários', () => {
      load(createStory({ comments: [] }));
      expect(element.querySelectorAll('.comment-list li').length).toBe(0);
    });

    it('trackById deve retornar o id do comentário', () => {
      expect(component.trackById(0, createComment({ id: 321 }))).toBe(321);
    });
  });

  describe('poll', () => {
    it('deve renderizar as opções com pontos e largura da barra proporcional', () => {
      load(createStory({
        type: 'poll',
        url: 'item?id=9',
        poll: [createPollResult({ content: 'Sim', points: 30 }), createPollResult({ content: 'Não', points: 10 })],
        poll_votes_count: 40,
      }));

      const options = element.querySelectorAll('.pollResults .pollContent');
      expect(options.length).toBe(2);
      expect(options[0].querySelector('div').innerHTML).toBe('Sim');
      expect(options[0].querySelector('.subtext').textContent).toBe('30 points');
      expect((options[0].querySelector('.pollBar') as HTMLElement).style.width).toBe('75%');
      expect((options[1].querySelector('.pollBar') as HTMLElement).style.width).toBe('25%');
    });

    it('não deve renderizar a seção de poll para stories comuns', () => {
      load(createStory({ type: 'story', poll: [createPollResult()] }));
      expect(element.querySelector('.pollResults')).toBeNull();
    });

    it('deve renderizar poll sem opções sem quebrar', () => {
      load(createStory({ type: 'poll', poll: [], poll_votes_count: 0 }));
      expect(element.querySelector('.pollResults')).not.toBeNull();
      expect(element.querySelectorAll('.pollContent').length).toBe(0);
    });
  });

  describe('erros', () => {
    it('deve exibir mensagem de erro quando a API falha', () => {
      api.fetchItemContent.and.returnValue(throwError(() => new Error('fail')));
      fixture.detectChanges();
      params$.next({ id: '1' });
      fixture.detectChanges();

      expect(component.errorMessage).toBe('Could not load item comments.');
      expect(element.querySelector('app-error-message').textContent).toContain('Could not load item comments.');
      expect(element.querySelector('app-loader')).toBeNull();
      expect(element.querySelector('.item')).toBeNull();
    });

    it('deve se recuperar de um erro ao navegar para outro item', () => {
      api.fetchItemContent.and.returnValues(throwError(() => new Error('fail')), of(createStory({ id: 2 })));
      fixture.detectChanges();
      params$.next({ id: '1' });
      fixture.detectChanges();
      params$.next({ id: '2' });
      fixture.detectChanges();

      expect(component.errorMessage).toBe('');
      expect(element.querySelector('app-error-message')).toBeNull();
      expect(element.querySelector('.item')).not.toBeNull();
    });
  });

  describe('navegação', () => {
    it('goBack deve chamar Location.back()', () => {
      component.goBack();
      expect(location.back).toHaveBeenCalledTimes(1);
    });

    it('deve chamar goBack ao clicar no botão de voltar (mobile)', () => {
      load(createStory());
      (element.querySelector('.back-button') as HTMLElement).click();
      expect(location.back).toHaveBeenCalledTimes(1);
    });
  });

  describe('ciclo de vida', () => {
    it('deve cancelar a inscrição ao destruir', () => {
      fixture.detectChanges();
      expect(params$.observers.length).toBe(1);
      fixture.destroy();
      expect(params$.observers.length).toBe(0);
    });

    it('ngOnDestroy deve tolerar ausência de subscription', () => {
      component.sub = undefined;
      expect(() => component.ngOnDestroy()).not.toThrow();
    });
  });
});
