import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorMessageComponent } from './error-message.component';

describe('ErrorMessageComponent', () => {
  let fixture: ComponentFixture<ErrorMessageComponent>;
  let component: ErrorMessageComponent;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ErrorMessageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ErrorMessageComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
  });

  it('deve ser criado', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('deve exibir a mensagem recebida via @Input', () => {
    fixture.componentRef.setInput('message', 'Could not load news stories.');
    fixture.detectChanges();
    expect(element.querySelector('p.strong').textContent.trim()).toBe('Could not load news stories.');
  });

  it('deve renderizar vazio quando a mensagem é undefined', () => {
    fixture.detectChanges();
    expect(element.querySelector('p.strong').textContent.trim()).toBe('');
  });

  it('deve renderizar vazio quando a mensagem é uma string vazia', () => {
    fixture.componentRef.setInput('message', '');
    fixture.detectChanges();
    expect(element.querySelector('p.strong').textContent.trim()).toBe('');
  });

  it('deve atualizar o texto quando o @Input muda', () => {
    fixture.componentRef.setInput('message', 'primeira');
    fixture.detectChanges();
    fixture.componentRef.setInput('message', 'segunda');
    fixture.detectChanges();
    expect(element.querySelector('p.strong').textContent.trim()).toBe('segunda');
  });

  it('deve renderizar a caveira e a dica de uso offline', () => {
    fixture.detectChanges();
    expect(element.querySelector('.error-section .skull')).not.toBeNull();
    expect(element.textContent).toContain('If you are offline viewing');
  });
});
