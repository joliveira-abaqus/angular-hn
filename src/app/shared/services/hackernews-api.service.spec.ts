import { HackerNewsAPIService } from './hackernews-api.service';
import { createPollResult, createStory, createUser } from '../testing/fixtures';

/**
 * O serviço usa `unfetch`, que é implementado sobre XMLHttpRequest (não usa
 * HttpClient). Por isso, em vez de HttpTestingController, substituímos o
 * XMLHttpRequest global por um fake que registra as requisições abertas e
 * permite resolvê-las/rejeitá-las manualmente, no mesmo espírito do
 * `HttpTestingController.expectOne`/`flush`.
 */
class FakeXMLHttpRequest {
  static requests: FakeXMLHttpRequest[] = [];

  method: string;
  url: string;
  status = 0;
  statusText = '';
  responseText = '';
  response = '';
  responseURL = '';
  withCredentials = false;
  sent = false;
  body: any;
  onload: () => void;
  onerror: (err: any) => void;

  constructor() {
    FakeXMLHttpRequest.requests.push(this);
  }

  open(method: string, url: string) {
    this.method = method;
    this.url = url;
    this.responseURL = url;
  }

  setRequestHeader() {}

  getAllResponseHeaders() {
    return 'content-type: application/json\r\n';
  }

  send(body: any) {
    this.sent = true;
    this.body = body;
  }

  flush(data: any, status = 200) {
    this.status = status;
    this.statusText = status === 200 ? 'OK' : 'Error';
    this.responseText = JSON.stringify(data);
    this.response = this.responseText;
    this.onload();
  }

  fail(err: any = new Error('network error')) {
    this.onerror(err);
  }

  static reset() {
    FakeXMLHttpRequest.requests = [];
  }

  static expectOne(url: string): FakeXMLHttpRequest {
    const matches = FakeXMLHttpRequest.requests.filter(r => r.url === url);
    expect(matches.length).withContext(`esperada 1 requisição para ${url}`).toBe(1);
    return matches[0];
  }
}

/** Aguarda a fila de microtasks (promises internas do unfetch) esvaziar. */
const flushPromises = () => new Promise<void>(resolve => setTimeout(resolve, 0));

describe('HackerNewsAPIService', () => {
  const BASE = 'https://node-hnapi.herokuapp.com';
  let service: HackerNewsAPIService;
  let originalXHR: typeof XMLHttpRequest;

  beforeEach(() => {
    originalXHR = window.XMLHttpRequest;
    FakeXMLHttpRequest.reset();
    (window as any).XMLHttpRequest = FakeXMLHttpRequest;
    service = new HackerNewsAPIService();
  });

  afterEach(() => {
    window.XMLHttpRequest = originalXHR;
  });

  it('deve ser criado com a baseUrl da node-hnapi', () => {
    expect(service).toBeTruthy();
    expect(service.baseUrl).toBe(BASE);
  });

  it('não deve disparar a requisição antes de alguém se inscrever (lazy)', () => {
    service.fetchFeed('news', 1);
    expect(FakeXMLHttpRequest.requests.length).toBe(0);
  });

  describe('fetchFeed', () => {
    it('deve chamar /<feedType>?page=<page> e retornar a lista de stories', async () => {
      const stories = [createStory({ id: 1 }), createStory({ id: 2 })];
      let result;

      service.fetchFeed('news', 2).subscribe(r => (result = r));
      const req = FakeXMLHttpRequest.expectOne(`${BASE}/news?page=2`);
      expect(req.method.toLowerCase()).toBe('get');
      expect(req.sent).toBeTrue();

      req.flush(stories);
      await flushPromises();

      expect(result).toEqual(stories);
    });

    it('deve montar URLs distintas para cada tipo de feed', () => {
      service.fetchFeed('newest', 1).subscribe();
      service.fetchFeed('show', 3).subscribe();
      service.fetchFeed('ask', 1).subscribe();
      service.fetchFeed('jobs', 1).subscribe();

      FakeXMLHttpRequest.expectOne(`${BASE}/newest?page=1`);
      FakeXMLHttpRequest.expectOne(`${BASE}/show?page=3`);
      FakeXMLHttpRequest.expectOne(`${BASE}/ask?page=1`);
      FakeXMLHttpRequest.expectOne(`${BASE}/jobs?page=1`);
    });

    it('deve propagar erro de rede para o subscriber', async () => {
      const networkError = new Error('offline');
      let error;

      service.fetchFeed('news', 1).subscribe({ error: e => (error = e) });
      FakeXMLHttpRequest.expectOne(`${BASE}/news?page=1`).fail(networkError);
      await flushPromises();

      expect(error).toBe(networkError);
    });

    it('deve propagar erro quando o corpo da resposta não é JSON válido', async () => {
      let error;

      service.fetchFeed('news', 1).subscribe({ error: e => (error = e) });
      const req = FakeXMLHttpRequest.expectOne(`${BASE}/news?page=1`);
      req.status = 200;
      req.responseText = '<html>not json</html>';
      req.onload();
      await flushPromises();

      expect(error).toBeInstanceOf(SyntaxError);
    });

    it('deve completar o observable após emitir', async () => {
      let completed = false;

      service.fetchFeed('news', 1).subscribe({ complete: () => (completed = true) });
      FakeXMLHttpRequest.expectOne(`${BASE}/news?page=1`).flush([]);
      await flushPromises();

      expect(completed).toBeTrue();
    });
  });

  describe('cache', () => {
    it('deve compartilhar uma única requisição entre subscribers concorrentes', async () => {
      const stories = [createStory()];
      const results = [];

      service.fetchFeed('news', 1).subscribe(r => results.push(r));
      service.fetchFeed('news', 1).subscribe(r => results.push(r));

      expect(FakeXMLHttpRequest.requests.length).toBe(1);
      FakeXMLHttpRequest.requests[0].flush(stories);
      await flushPromises();

      expect(results).toEqual([stories, stories]);
    });

    it('deve reaproveitar a resposta dentro do TTL sem nova requisição', async () => {
      const stories = [createStory()];
      service.fetchFeed('news', 1).subscribe();
      FakeXMLHttpRequest.requests[0].flush(stories);
      await flushPromises();

      let second;
      service.fetchFeed('news', 1).subscribe(r => (second = r));

      expect(FakeXMLHttpRequest.requests.length).toBe(1);
      expect(second).toEqual(stories);
    });

    it('deve refazer a requisição após o TTL expirar', async () => {
      const now = Date.now();
      spyOn(Date, 'now').and.returnValue(now);

      service.fetchFeed('news', 1).subscribe();
      FakeXMLHttpRequest.requests[0].flush([]);
      await flushPromises();

      (Date.now as jasmine.Spy).and.returnValue(now + 60 * 1000 + 1);
      service.fetchFeed('news', 1).subscribe();

      expect(FakeXMLHttpRequest.requests.length).toBe(2);
    });

    it('não deve servir erros a partir do cache', async () => {
      service.fetchFeed('news', 1).subscribe({ error: () => {} });
      FakeXMLHttpRequest.requests[0].fail();
      await flushPromises();

      service.fetchFeed('news', 1).subscribe({ error: () => {} });

      expect(FakeXMLHttpRequest.requests.length).toBe(2);
    });

    it('deve manter caches independentes para URLs diferentes', () => {
      service.fetchFeed('news', 1).subscribe();
      service.fetchFeed('news', 2).subscribe();

      expect(FakeXMLHttpRequest.requests.length).toBe(2);
    });
  });

  describe('fetchItemContent', () => {
    it('deve chamar /item/<id> e retornar a story', async () => {
      const story = createStory({ id: 123 });
      let result;

      service.fetchItemContent(123).subscribe(r => (result = r));
      FakeXMLHttpRequest.expectOne(`${BASE}/item/123`).flush(story);
      await flushPromises();

      expect(result).toEqual(story);
      expect(FakeXMLHttpRequest.requests.length).toBe(1);
    });

    it('deve buscar cada opção de uma poll e somar os votos', async () => {
      const poll = createStory({
        id: 500,
        type: 'poll',
        poll: [createPollResult({ points: 0 }), createPollResult({ points: 0 })],
        poll_votes_count: undefined,
      });
      let result: any;

      service.fetchItemContent(500).subscribe(r => (result = r));
      FakeXMLHttpRequest.expectOne(`${BASE}/item/500`).flush(poll);
      await flushPromises();

      const opt1 = FakeXMLHttpRequest.expectOne(`${BASE}/item/501`);
      const opt2 = FakeXMLHttpRequest.expectOne(`${BASE}/item/502`);
      opt1.flush(createPollResult({ points: 7, content: 'Sim' }));
      opt2.flush(createPollResult({ points: 3, content: 'Não' }));
      await flushPromises();

      expect(result.poll_votes_count).toBe(10);
      expect(result.poll[0]).toEqual(jasmine.objectContaining({ points: 7, content: 'Sim' }));
      expect(result.poll[1]).toEqual(jasmine.objectContaining({ points: 3, content: 'Não' }));
    });

    it('não deve buscar opções quando a poll já tem poll_votes_count', async () => {
      const poll = createStory({ id: 500, type: 'poll', poll: [createPollResult()], poll_votes_count: 99 });

      service.fetchItemContent(500).subscribe();
      FakeXMLHttpRequest.expectOne(`${BASE}/item/500`).flush(poll);
      await flushPromises();

      expect(FakeXMLHttpRequest.requests.length).toBe(1);
    });

    it('não deve buscar opções para stories que não são poll', async () => {
      service.fetchItemContent(1).subscribe();
      FakeXMLHttpRequest.expectOne(`${BASE}/item/1`).flush(createStory({ type: 'story' }));
      await flushPromises();

      expect(FakeXMLHttpRequest.requests.length).toBe(1);
    });

    it('deve propagar erro ao carregar o item', async () => {
      let error;

      service.fetchItemContent(1).subscribe({ error: e => (error = e) });
      FakeXMLHttpRequest.expectOne(`${BASE}/item/1`).fail(new Error('boom'));
      await flushPromises();

      expect(error).toEqual(new Error('boom'));
    });
  });

  describe('fetchPollContent', () => {
    it('deve chamar /item/<id> e retornar o resultado da opção', async () => {
      const pollResult = createPollResult({ points: 5 });
      let result;

      service.fetchPollContent(77).subscribe(r => (result = r));
      FakeXMLHttpRequest.expectOne(`${BASE}/item/77`).flush(pollResult);
      await flushPromises();

      expect(result).toEqual(pollResult);
    });
  });

  describe('fetchUser', () => {
    it('deve chamar /user/<id> e retornar o usuário', async () => {
      const user = createUser({ id: 'pg' });
      let result;

      service.fetchUser('pg').subscribe(r => (result = r));
      FakeXMLHttpRequest.expectOne(`${BASE}/user/pg`).flush(user);
      await flushPromises();

      expect(result).toEqual(user);
    });

    it('deve propagar erro ao carregar o usuário', async () => {
      let error;

      service.fetchUser('ghost').subscribe({ error: e => (error = e) });
      FakeXMLHttpRequest.expectOne(`${BASE}/user/ghost`).fail(new Error('404'));
      await flushPromises();

      expect(error).toEqual(new Error('404'));
    });
  });

  it('não deve emitir se o subscriber cancelar antes da resposta', async () => {
    let emitted = false;

    const sub = service.fetchUser('x').subscribe(() => (emitted = true));
    const req = FakeXMLHttpRequest.expectOne(`${BASE}/user/x`);
    sub.unsubscribe();
    // shareReplay com refCount=false mantém a fonte viva; o cancelToken do
    // lazyFetch só é acionado quando a fonte é desinscrita. Aqui validamos
    // apenas que o subscriber cancelado não recebe o valor.
    req.flush(createUser());
    await flushPromises();

    expect(emitted).toBeFalse();
  });
});
