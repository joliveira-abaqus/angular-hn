import { Location } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { Subject, of, throwError } from 'rxjs';

import { UserComponent } from './user.component';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { LoaderComponent } from '../shared/components/loader/loader.component';
import { ErrorMessageComponent } from '../shared/components/error-message/error-message.component';
import { User } from '../shared/models/user';
import { createUser } from '../shared/testing/fixtures';

describe('UserComponent', () => {
  let fixture: ComponentFixture<UserComponent>;
  let component: UserComponent;
  let element: HTMLElement;
  let api: jasmine.SpyObj<HackerNewsAPIService>;
  let location: jasmine.SpyObj<Location>;
  let params$: Subject<{ id: string }>;

  beforeEach(async () => {
    api = jasmine.createSpyObj<HackerNewsAPIService>('HackerNewsAPIService', ['fetchUser']);
    location = jasmine.createSpyObj<Location>('Location', ['back']);
    params$ = new Subject();

    await TestBed.configureTestingModule({
      declarations: [UserComponent, LoaderComponent, ErrorMessageComponent],
      providers: [
        { provide: HackerNewsAPIService, useValue: api },
        { provide: Location, useValue: location },
        { provide: ActivatedRoute, useValue: { params: params$.asObservable() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
  });

  function load(user: User, id = user.id) {
    api.fetchUser.and.returnValue(of(user));
    fixture.detectChanges();
    params$.next({ id });
    fixture.detectChanges();
  }

  it('deve ser criado', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('deve exibir o loader enquanto o usuário não chega', () => {
    fixture.detectChanges();
    expect(element.querySelector('app-loader')).not.toBeNull();
    expect(element.querySelector('app-error-message')).toBeNull();
    expect(element.querySelector('.profile')).toBeNull();
  });

  describe('carregamento', () => {
    it('deve buscar o usuário pelo id da rota', () => {
      load(createUser({ id: 'pg' }));
      expect(api.fetchUser).toHaveBeenCalledWith('pg');
      expect(component.user.id).toBe('pg');
    });

    it('deve exibir id, karma, data de criação e "about"', () => {
      load(createUser({ id: 'pg', karma: 155111, created: '17 years ago', about: '<p>Bug fixer.</p>' }));

      expect(element.querySelector('app-loader')).toBeNull();
      expect(element.querySelector('.title-block').textContent).toContain('Profile: pg');
      expect(element.querySelector('.name').textContent).toBe('pg');
      expect(element.querySelector('.right').textContent).toContain('155111');
      expect(element.querySelector('.age').textContent).toBe('Created 17 years ago');
      expect(element.querySelector('.other-details p').innerHTML).toBe('<p>Bug fixer.</p>');
    });

    it('não deve renderizar a seção "about" quando ela está vazia', () => {
      load(createUser({ about: '' }));
      expect(element.querySelector('.other-details')).toBeNull();
    });

    it('não deve renderizar a seção "about" quando ela é undefined', () => {
      load(createUser({ about: undefined }));
      expect(element.querySelector('.other-details')).toBeNull();
    });

    it('deve limpar o usuário anterior ao navegar para outro id', () => {
      const pending = new Subject<User>();
      api.fetchUser.and.returnValues(of(createUser({ id: 'a' })), pending.asObservable());
      fixture.detectChanges();
      params$.next({ id: 'a' });
      fixture.detectChanges();
      expect(element.querySelector('.profile')).not.toBeNull();

      params$.next({ id: 'b' });
      fixture.detectChanges();
      expect(component.user).toBeUndefined();
      expect(element.querySelector('app-loader')).not.toBeNull();

      pending.next(createUser({ id: 'b' }));
      fixture.detectChanges();
      expect(element.querySelector('.name').textContent).toBe('b');
    });
  });

  describe('erros', () => {
    it('deve exibir mensagem de erro com o id quando a API falha', () => {
      api.fetchUser.and.returnValue(throwError(() => new Error('404')));
      fixture.detectChanges();
      params$.next({ id: 'ghost' });
      fixture.detectChanges();

      expect(component.errorMessage).toBe('Could not load user ghost.');
      expect(element.querySelector('app-error-message').textContent).toContain('Could not load user ghost.');
      expect(element.querySelector('app-loader')).toBeNull();
      expect(element.querySelector('.profile')).toBeNull();
    });

    it('deve se recuperar do erro ao navegar para outro usuário', () => {
      api.fetchUser.and.returnValues(throwError(() => new Error('404')), of(createUser({ id: 'ok' })));
      fixture.detectChanges();
      params$.next({ id: 'ghost' });
      fixture.detectChanges();
      params$.next({ id: 'ok' });
      fixture.detectChanges();

      expect(component.errorMessage).toBe('');
      expect(element.querySelector('app-error-message')).toBeNull();
      expect(element.querySelector('.name').textContent).toBe('ok');
    });
  });

  describe('navegação', () => {
    it('goBack deve chamar Location.back()', () => {
      component.goBack();
      expect(location.back).toHaveBeenCalledTimes(1);
    });

    it('deve chamar goBack ao clicar no botão de voltar', () => {
      load(createUser());
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
