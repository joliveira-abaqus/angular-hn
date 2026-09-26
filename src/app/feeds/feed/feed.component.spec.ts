import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink, RouterModule, provideRouter } from '@angular/router';
import { Subject, of, throwError } from 'rxjs';

import { FeedComponent } from './feed.component';
import { HackerNewsAPIService } from '../../shared/services/hackernews-api.service';
import { LoaderComponent } from '../../shared/components/loader/loader.component';
import { ErrorMessageComponent } from '../../shared/components/error-message/error-message.component';
import { Story } from '../../shared/models/story';
import { createStories } from '../../shared/testing/fixtures';

@Component({ selector: 'item', standalone: false, template: '<span class="stub-item">{{ item.title }}</span>' })
class ItemStubComponent {
  @Input() item: Story;
}

describe('FeedComponent', () => {
  let fixture: ComponentFixture<FeedComponent>;
  let component: FeedComponent;
  let element: HTMLElement;
  let api: jasmine.SpyObj<HackerNewsAPIService>;
  let params$: Subject<{ [key: string]: string }>;
  let routeData: { feedType: string };

  const stubItems = () => Array.from(element.querySelectorAll('.stub-item')).map(el => el.textContent);
  const routerLinkHrefs = () =>
    fixture.debugElement.queryAll(By.directive(RouterLink)).map(de => de.injector.get(RouterLink).href);

  beforeEach(async () => {
    api = jasmine.createSpyObj<HackerNewsAPIService>('HackerNewsAPIService', ['fetchFeed']);
    params$ = new Subject();
    routeData = { feedType: 'news' };
    spyOn(window, 'scrollTo');

    await TestBed.configureTestingModule({
      declarations: [FeedComponent, ItemStubComponent, LoaderComponent, ErrorMessageComponent],
      imports: [RouterModule],
      providers: [
        provideRouter([]),
        { provide: HackerNewsAPIService, useValue: api },
        { provide: ActivatedRoute, useValue: { params: params$.asObservable(), snapshot: { data: routeData } } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FeedComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
  });

  function navigate(page: string | undefined, feedType = 'news') {
    routeData.feedType = feedType;
    params$.next(page === undefined ? {} : { page });
    fixture.detectChanges();
  }

  it('deve ser criado', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('deve exibir o loader enquanto não há itens nem erro', () => {
    fixture.detectChanges();
    expect(element.querySelector('app-loader')).not.toBeNull();
    expect(element.querySelector('app-error-message')).toBeNull();
    expect(element.querySelector('ol')).toBeNull();
  });

  describe('carregamento de stories', () => {
    it('deve buscar o feed com o tipo da rota e a página dos params', () => {
      api.fetchFeed.and.returnValue(of(createStories(2)));
      fixture.detectChanges();
      navigate('3', 'show');

      expect(api.fetchFeed).toHaveBeenCalledWith('show', 3);
      expect(component.feedType).toBe('show');
      expect(component.pageNum).toBe(3);
    });

    it('deve usar a página 1 quando o param não existe', () => {
      api.fetchFeed.and.returnValue(of(createStories(1)));
      fixture.detectChanges();
      navigate(undefined);

      expect(api.fetchFeed).toHaveBeenCalledWith('news', 1);
      expect(component.pageNum).toBe(1);
      expect(component.listStart).toBe(1);
    });

    it('deve renderizar um <item> por story e esconder o loader', () => {
      api.fetchFeed.and.returnValue(of(createStories(3)));
      fixture.detectChanges();
      navigate('1');

      expect(element.querySelector('app-loader')).toBeNull();
      expect(stubItems()).toEqual(['Story 1', 'Story 2', 'Story 3']);
      expect(element.querySelectorAll('li.post').length).toBe(3);
    });

    it('deve rolar para o topo ao receber os itens', () => {
      api.fetchFeed.and.returnValue(of(createStories(1)));
      fixture.detectChanges();
      navigate('1');
      expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    });

    it('deve limpar os itens anteriores enquanto carrega a próxima página', () => {
      const pending = new Subject<Story[]>();
      api.fetchFeed.and.returnValues(of(createStories(2)), pending.asObservable());
      fixture.detectChanges();
      navigate('1');
      expect(stubItems().length).toBe(2);

      navigate('2');
      expect(component.items).toBeUndefined();
      expect(element.querySelector('app-loader')).not.toBeNull();

      pending.next(createStories(1, 31));
      fixture.detectChanges();
      expect(stubItems()).toEqual(['Story 31']);
    });

    it('deve descartar a resposta antiga quando a rota muda antes dela chegar (switchMap)', () => {
      const slow = new Subject<Story[]>();
      const fast = new Subject<Story[]>();
      api.fetchFeed.and.returnValues(slow.asObservable(), fast.asObservable());
      fixture.detectChanges();

      navigate('1');
      navigate('2');
      fast.next(createStories(1, 31));
      slow.next(createStories(1, 1));
      fixture.detectChanges();

      expect(stubItems()).toEqual(['Story 31']);
    });

    it('trackById deve retornar o id da story', () => {
      expect(component.trackById(0, createStories(1, 42)[0])).toBe(42);
    });
  });

  describe('paginação', () => {
    it('deve calcular listStart a partir da página', () => {
      api.fetchFeed.and.returnValue(of(createStories(30)));
      fixture.detectChanges();
      navigate('3');

      expect(component.listStart).toBe(61);
      expect(element.querySelector('ol').getAttribute('start')).toBe('61');
    });

    it('não deve exibir "Prev" na primeira página', () => {
      api.fetchFeed.and.returnValue(of(createStories(30)));
      fixture.detectChanges();
      navigate('1');

      expect(element.querySelector('a.prev')).toBeNull();
      expect(element.querySelector('a.more')).not.toBeNull();
      expect(routerLinkHrefs()).toEqual(['/news/2']);
    });

    it('deve exibir "Prev" e "More" em páginas intermediárias com 30 itens', () => {
      api.fetchFeed.and.returnValue(of(createStories(30)));
      fixture.detectChanges();
      navigate('2', 'ask');

      expect(element.querySelector('a.prev')).not.toBeNull();
      expect(element.querySelector('a.more')).not.toBeNull();
      expect(routerLinkHrefs()).toEqual(['/ask/1', '/ask/3']);
    });

    it('não deve exibir "More" quando a página tem menos de 30 itens', () => {
      api.fetchFeed.and.returnValue(of(createStories(12)));
      fixture.detectChanges();
      navigate('4');

      expect(element.querySelector('a.prev')).not.toBeNull();
      expect(element.querySelector('a.more')).toBeNull();
    });

    it('não deve exibir navegação alguma para uma única página curta', () => {
      api.fetchFeed.and.returnValue(of(createStories(5)));
      fixture.detectChanges();
      navigate('1');

      expect(element.querySelector('.nav a')).toBeNull();
    });
  });

  describe('feed de jobs', () => {
    it('deve exibir o cabeçalho de jobs e remover a margem da lista', () => {
      api.fetchFeed.and.returnValue(of(createStories(2)));
      fixture.detectChanges();
      navigate('1', 'jobs');

      expect(element.querySelector('.job-header')).not.toBeNull();
      expect(element.querySelector('ol').classList.contains('list-margin')).toBeFalse();
    });

    it('não deve exibir o cabeçalho de jobs em outros feeds', () => {
      api.fetchFeed.and.returnValue(of(createStories(2)));
      fixture.detectChanges();
      navigate('1', 'news');

      expect(element.querySelector('.job-header')).toBeNull();
      expect(element.querySelector('ol').classList.contains('list-margin')).toBeTrue();
    });
  });

  describe('erros', () => {
    it('deve exibir a mensagem de erro quando a API falha', () => {
      api.fetchFeed.and.returnValue(throwError(() => new Error('offline')));
      fixture.detectChanges();
      navigate('1', 'newest');

      expect(component.errorMessage).toBe('Could not load newest stories.');
      expect(element.querySelector('app-loader')).toBeNull();
      expect(element.querySelector('app-error-message').textContent).toContain('Could not load newest stories.');
      expect(element.querySelector('ol')).toBeNull();
    });

    it('deve continuar reagindo a novas rotas após um erro', () => {
      api.fetchFeed.and.returnValues(throwError(() => new Error('x')), of(createStories(1)));
      fixture.detectChanges();
      navigate('1');
      expect(component.errorMessage).not.toBe('');

      navigate('2');
      expect(component.errorMessage).toBe('');
      expect(stubItems()).toEqual(['Story 1']);
      expect(element.querySelector('app-error-message')).toBeNull();
    });
  });

  describe('ciclo de vida', () => {
    it('deve cancelar a inscrição na rota ao destruir', () => {
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
