import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsComponent } from './settings.component';
import { SettingsService } from '../../shared/services/settings.service';
import { MockSettingsService } from '../../shared/testing/fixtures';

describe('SettingsComponent', () => {
  let fixture: ComponentFixture<SettingsComponent>;
  let component: SettingsComponent;
  let element: HTMLElement;
  let settingsService: MockSettingsService;

  const radio = (value: string) => element.querySelector(`input[type=radio][value=${value}]`) as HTMLInputElement;
  const numberInputs = () => Array.from(element.querySelectorAll('input[type=number]')) as HTMLInputElement[];

  beforeEach(async () => {
    settingsService = new MockSettingsService();

    await TestBed.configureTestingModule({
      declarations: [SettingsComponent],
      providers: [{ provide: SettingsService, useValue: settingsService }],
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('deve ser criado', () => {
    expect(component).toBeTruthy();
  });

  it('deve renderizar o título e o overlay', () => {
    expect(element.querySelector('h1').textContent).toContain('Settings');
    expect(element.querySelector('.overlay .popup')).not.toBeNull();
  });

  describe('fechar', () => {
    it('deve chamar toggleSettings ao clicar no botão de fechar', () => {
      (element.querySelector('.close') as HTMLElement).click();
      expect(settingsService.toggleSettings).toHaveBeenCalledTimes(1);
    });

    it('closeSettings deve delegar ao serviço', () => {
      component.closeSettings();
      expect(settingsService.toggleSettings).toHaveBeenCalled();
    });
  });

  describe('abrir links em nova aba', () => {
    it('deve refletir o valor atual no checkbox', () => {
      const checkbox = element.querySelector('input[type=checkbox]') as HTMLInputElement;
      expect(checkbox.checked).toBeFalse();

      settingsService.set({ openLinkInNewTab: true });
      fixture.detectChanges();
      expect(checkbox.checked).toBeTrue();
    });

    it('deve chamar toggleOpenLinksInNewTab ao alterar o checkbox', () => {
      const checkbox = element.querySelector('input[type=checkbox]') as HTMLInputElement;
      checkbox.dispatchEvent(new Event('change'));
      expect(settingsService.toggleOpenLinksInNewTab).toHaveBeenCalledTimes(1);
    });
  });

  describe('tema', () => {
    it('deve marcar o rádio do tema atual', () => {
      expect(radio('default').checked).toBeTrue();
      expect(radio('night').checked).toBeFalse();
      expect(radio('amoledblack').checked).toBeFalse();
    });

    it('deve atualizar o rádio marcado quando o tema muda no serviço', () => {
      settingsService.set({ theme: 'night' });
      fixture.detectChanges();
      expect(radio('default').checked).toBeFalse();
      expect(radio('night').checked).toBeTrue();
    });

    it('deve chamar setTheme com o valor do rádio clicado', () => {
      radio('night').click();
      expect(settingsService.setTheme).toHaveBeenCalledWith('night');

      radio('amoledblack').click();
      expect(settingsService.setTheme).toHaveBeenCalledWith('amoledblack');
    });

    it('selectTheme deve delegar ao serviço', () => {
      component.selectTheme('default');
      expect(settingsService.setTheme).toHaveBeenCalledWith('default');
    });
  });

  describe('fonte e espaçamento', () => {
    it('deve preencher os inputs numéricos com os valores atuais', () => {
      const [font, spacing] = numberInputs();
      expect(font.value).toBe('16');
      expect(spacing.value).toBe('0');
    });

    it('deve chamar setFont com o valor digitado no keyup', () => {
      const [font] = numberInputs();
      font.value = '24';
      font.dispatchEvent(new KeyboardEvent('keyup'));
      expect(settingsService.setFont).toHaveBeenCalledWith('24');
    });

    it('deve chamar setSpacing com o valor digitado no keyup', () => {
      const [, spacing] = numberInputs();
      spacing.value = '10';
      spacing.dispatchEvent(new KeyboardEvent('keyup'));
      expect(settingsService.setSpacing).toHaveBeenCalledWith('10');
    });

    it('changeTitleFont e changeSpacing devem delegar ao serviço', () => {
      component.changeTitleFont('18');
      component.changeSpacing('4');
      expect(settingsService.setFont).toHaveBeenCalledWith('18');
      expect(settingsService.setSpacing).toHaveBeenCalledWith('4');
    });
  });
});
