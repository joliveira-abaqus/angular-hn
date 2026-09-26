import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FooterComponent } from './footer.component';

describe('FooterComponent', () => {
  let fixture: ComponentFixture<FooterComponent>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FooterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FooterComponent);
    element = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('deve ser criado', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('deve renderizar o container #footer', () => {
    expect(element.querySelector('#footer')).not.toBeNull();
  });

  it('deve exibir um link para o GitHub aberto em nova aba com rel=noopener', () => {
    const link = element.querySelector('a') as HTMLAnchorElement;
    expect(link).not.toBeNull();
    expect(link.href).toBe('https://github.com/hdjirdeh/angular2-hn');
    expect(link.target).toBe('_blank');
    expect(link.rel).toBe('noopener');
    expect(link.textContent.trim()).toBe('GitHub');
  });
});
