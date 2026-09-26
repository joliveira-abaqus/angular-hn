import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterLink, RouterModule, provideRouter } from '@angular/router';

import { CommentComponent } from './comment.component';
import { Comment } from '../../shared/models/comment';
import { createComment } from '../../shared/testing/fixtures';

describe('CommentComponent', () => {
  let fixture: ComponentFixture<CommentComponent>;
  let component: CommentComponent;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CommentComponent],
      imports: [RouterModule],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(CommentComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
  });

  function render(comment: Comment) {
    fixture.componentRef.setInput('comment', comment);
    fixture.detectChanges();
  }

  it('deve ser criado', () => {
    render(createComment());
    expect(component).toBeTruthy();
  });

  describe('comentário simples', () => {
    it('deve renderizar autor, tempo e conteúdo HTML', () => {
      render(createComment({ user: 'alice', time_ago: '3 hours ago', content: '<b>negrito</b>' }));

      expect(element.querySelector('.meta a').textContent).toBe('alice');
      expect(element.querySelector('.time').textContent).toBe('3 hours ago');
      expect(element.querySelector('.comment-text').innerHTML).toBe('<b>negrito</b>');
      expect(element.querySelector('.deleted-meta')).toBeNull();
    });

    it('deve apontar o routerLink do autor para /user/<user>', () => {
      render(createComment({ user: 'alice' }));
      const link = fixture.debugElement.query(By.directive(RouterLink)).injector.get(RouterLink);
      expect(link.href).toBe('/user/alice');
    });

    it('deve iniciar expandido com o marcador [-]', () => {
      render(createComment());
      expect(component.collapse).toBeFalse();
      expect(element.querySelector('.collapse').textContent).toBe('[-]');
      expect((element.querySelector('.comment-tree > div') as HTMLElement).hidden).toBeFalse();
    });

    it('deve renderizar conteúdo vazio sem quebrar', () => {
      render(createComment({ content: '' }));
      expect(element.querySelector('.comment-text').innerHTML).toBe('');
    });
  });

  describe('colapsar', () => {
    it('deve esconder o conteúdo e mostrar [+] ao clicar', () => {
      render(createComment());
      (element.querySelector('.collapse') as HTMLElement).click();
      fixture.detectChanges();

      expect(component.collapse).toBeTrue();
      expect(element.querySelector('.collapse').textContent).toBe('[+]');
      expect(element.querySelector('.meta').classList.contains('meta-collapse')).toBeTrue();
      expect((element.querySelector('.comment-tree > div') as HTMLElement).hidden).toBeTrue();
    });

    it('deve expandir novamente ao clicar de novo', () => {
      render(createComment());
      const toggle = element.querySelector('.collapse') as HTMLElement;
      toggle.click();
      fixture.detectChanges();
      toggle.click();
      fixture.detectChanges();

      expect(component.collapse).toBeFalse();
      expect(element.querySelector('.collapse').textContent).toBe('[-]');
      expect((element.querySelector('.comment-tree > div') as HTMLElement).hidden).toBeFalse();
    });
  });

  describe('árvore de comentários', () => {
    it('deve renderizar recursivamente as respostas', () => {
      const tree = createComment({
        id: 1,
        user: 'root',
        comments: [
          createComment({ id: 2, user: 'child-a', comments: [createComment({ id: 3, user: 'grandchild' })] }),
          createComment({ id: 4, user: 'child-b' }),
        ],
      });
      render(tree);

      const nested = element.querySelectorAll('app-comment');
      expect(nested.length).toBe(3);

      const authors = Array.from(element.querySelectorAll('.meta a')).map(a => a.textContent);
      expect(authors).toEqual(['root', 'child-a', 'grandchild', 'child-b']);
    });

    it('deve renderizar uma lista vazia quando não há respostas', () => {
      render(createComment({ comments: [] }));
      expect(element.querySelectorAll('.subtree li').length).toBe(0);
    });

    it('deve esconder as respostas ao colapsar o pai', () => {
      render(createComment({ comments: [createComment({ id: 2 })] }));
      (element.querySelector('.collapse') as HTMLElement).click();
      fixture.detectChanges();

      const subtreeWrapper = element.querySelector('.comment-tree > div') as HTMLElement;
      expect(subtreeWrapper.hidden).toBeTrue();
      expect(subtreeWrapper.querySelectorAll('app-comment').length).toBe(1);
    });

    it('trackById deve retornar o id do comentário', () => {
      expect(component.trackById(0, createComment({ id: 99 }))).toBe(99);
    });
  });

  describe('comentário apagado', () => {
    it('deve exibir apenas o aviso de removido', () => {
      render(createComment({ deleted: true, content: 'não deve aparecer', comments: [createComment({ id: 2 })] }));

      expect(element.querySelector('.deleted-meta').textContent).toContain('[deleted]');
      expect(element.querySelector('.deleted-meta').textContent).toContain('Comment Deleted');
      expect(element.querySelector('.meta')).toBeNull();
      expect(element.querySelector('.comment-text')).toBeNull();
      expect(element.querySelectorAll('app-comment').length).toBe(0);
    });
  });
});
