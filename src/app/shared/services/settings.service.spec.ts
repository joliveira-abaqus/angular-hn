import { SettingsService } from './settings.service';

/** MediaQueryList falso: EventTarget real para suportar add/removeEventListener e dispatchEvent. */
class FakeMediaQueryList extends EventTarget {
  media = '(prefers-color-scheme: dark)';
  constructor(public matches: boolean) {
    super();
  }
}

describe('SettingsService', () => {
  let storage: { [key: string]: string };
  let mediaQuery: FakeMediaQueryList;

  function createService(prefersDark = false): SettingsService {
    mediaQuery = new FakeMediaQueryList(prefersDark);
    spyOn(window, 'matchMedia').and.returnValue(mediaQuery as unknown as MediaQueryList);
    return new SettingsService();
  }

  beforeEach(() => {
    storage = {};
    spyOn(Storage.prototype, 'getItem').and.callFake((key: string) => (key in storage ? storage[key] : null));
    spyOn(Storage.prototype, 'setItem').and.callFake((key: string, value: string) => {
      storage[key] = value;
    });
  });

  describe('valores padrão', () => {
    it('deve ser criado', () => {
      expect(createService()).toBeTruthy();
    });

    it('deve iniciar com as configurações padrão quando o localStorage está vazio', () => {
      const service = createService();
      expect(service.settings()).toEqual({
        showSettings: false,
        openLinkInNewTab: false,
        theme: 'default',
        titleFontSize: '16',
        listSpacing: '0',
      });
    });

    it('deve consultar a media query de tema escuro do sistema', () => {
      createService();
      expect(window.matchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
    });
  });

  describe('persistência em localStorage', () => {
    it('deve restaurar openLinkInNewTab, titleFontSize e listSpacing salvos', () => {
      storage['openLinkInNewTab'] = 'true';
      storage['titleFontSize'] = '20';
      storage['listSpacing'] = '8';

      const service = createService();

      expect(service.settings().openLinkInNewTab).toBeTrue();
      expect(service.settings().titleFontSize).toBe('20');
      expect(service.settings().listSpacing).toBe('8');
    });

    it('deve restaurar openLinkInNewTab=false salvo explicitamente', () => {
      storage['openLinkInNewTab'] = 'false';
      expect(createService().settings().openLinkInNewTab).toBeFalse();
    });

    it('deve restaurar o tema salvo em vez de consultar o sistema', () => {
      storage['theme'] = 'amoledblack';
      const service = createService(true);
      expect(service.settings().theme).toBe('amoledblack');
      expect(localStorage.setItem).not.toHaveBeenCalledWith('theme', jasmine.anything());
    });

    it('deve gravar openLinkInNewTab ao alternar', () => {
      const service = createService();
      service.toggleOpenLinksInNewTab();
      expect(localStorage.setItem).toHaveBeenCalledWith('openLinkInNewTab', 'true');
      service.toggleOpenLinksInNewTab();
      expect(localStorage.setItem).toHaveBeenCalledWith('openLinkInNewTab', 'false');
    });

    it('deve gravar titleFontSize ao alterar a fonte', () => {
      const service = createService();
      service.setFont('22');
      expect(service.settings().titleFontSize).toBe('22');
      expect(localStorage.setItem).toHaveBeenCalledWith('titleFontSize', '22');
    });

    it('deve gravar listSpacing ao alterar o espaçamento', () => {
      const service = createService();
      service.setSpacing('12');
      expect(service.settings().listSpacing).toBe('12');
      expect(localStorage.setItem).toHaveBeenCalledWith('listSpacing', '12');
    });
  });

  describe('tema', () => {
    it('deve usar o tema "night" quando o sistema prefere escuro e nada foi salvo', () => {
      const service = createService(true);
      expect(service.settings().theme).toBe('night');
      expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'night');
    });

    it('deve usar o tema "default" quando o sistema prefere claro e nada foi salvo', () => {
      const service = createService(false);
      expect(service.settings().theme).toBe('default');
      expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'default');
    });

    it('setTheme deve atualizar o signal e persistir', () => {
      const service = createService();
      service.setTheme('amoledblack');
      expect(service.settings().theme).toBe('amoledblack');
      expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'amoledblack');
    });

    it('deve reagir a mudanças da preferência de cor do sistema', () => {
      const service = createService(false);
      expect(service.settings().theme).toBe('default');

      mediaQuery.dispatchEvent(new MediaQueryListEvent('change', { media: mediaQuery.media, matches: true }));
      expect(service.settings().theme).toBe('night');

      mediaQuery.dispatchEvent(new MediaQueryListEvent('change', { media: mediaQuery.media, matches: false }));
      expect(service.settings().theme).toBe('default');
    });

    it('handleSystemPreferredColorSchemeChange deve mapear matches para night/default', () => {
      const service = createService();
      service.handleSystemPreferredColorSchemeChange({ matches: true } as MediaQueryListEvent);
      expect(service.settings().theme).toBe('night');
      service.handleSystemPreferredColorSchemeChange({ matches: false } as MediaQueryListEvent);
      expect(service.settings().theme).toBe('default');
    });

    it('ngOnDestroy deve remover o listener da media query', () => {
      const service = createService();
      const removeSpy = spyOn(mediaQuery, 'removeEventListener').and.callThrough();
      service.ngOnDestroy();
      expect(removeSpy).toHaveBeenCalledWith('change', jasmine.any(Function));
    });
  });

  describe('toggles', () => {
    it('toggleSettings deve alternar showSettings', () => {
      const service = createService();
      expect(service.settings().showSettings).toBeFalse();
      service.toggleSettings();
      expect(service.settings().showSettings).toBeTrue();
      service.toggleSettings();
      expect(service.settings().showSettings).toBeFalse();
    });

    it('toggleSettings não deve persistir nada', () => {
      const service = createService();
      (localStorage.setItem as jasmine.Spy).calls.reset();
      service.toggleSettings();
      expect(localStorage.setItem).not.toHaveBeenCalled();
    });

    it('toggleOpenLinksInNewTab deve alternar o valor', () => {
      const service = createService();
      service.toggleOpenLinksInNewTab();
      expect(service.settings().openLinkInNewTab).toBeTrue();
      service.toggleOpenLinksInNewTab();
      expect(service.settings().openLinkInNewTab).toBeFalse();
    });

    it('deve produzir um novo objeto de settings a cada atualização (imutabilidade)', () => {
      const service = createService();
      const before = service.settings();
      service.toggleSettings();
      expect(service.settings()).not.toBe(before);
      expect(before.showSettings).toBeFalse();
    });
  });
});
