import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoaderComponent } from './loader.component';

describe('LoaderComponent', () => {
  let fixture: ComponentFixture<LoaderComponent>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoaderComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LoaderComponent);
    element = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('deve ser criado', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('deve renderizar a seção de loading com o texto acessível', () => {
    expect(element.querySelector('.loading-section .loader')).not.toBeNull();
    expect(element.textContent.trim()).toBe('Loading...');
  });
});
