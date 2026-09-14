<p align="center">
  <img alt="Angular HN" title="Angular HN" src="src/assets/images/logo.svg" width="120">
</p>

<h1 align="center">Angular HN</h1>

<p align="center">
  Um cliente do <a href="https://news.ycombinator.com">Hacker News</a> feito em Angular, com suporte a PWA e temas.
</p>

---

Este repositório é um **fork modernizado** do [angular2-hn](https://github.com/hdjirdeh/angular2-hn), de Houssein Djirdeh.
O código foi migrado do build ejetado com Webpack para o **Angular CLI atual (Angular 21)**, com service worker nativo
do Angular e uma camada de cache na chamada da API.

## Pré-requisitos

| Ferramenta | Versão |
|---|---|
| Node.js | `^20.19.0` \|\| `^22.12.0` \|\| `>=24.0.0` |
| npm | `>=8` |

## Como rodar

```bash
npm install
npm start
```

A aplicação sobe em <http://localhost:4200> com recarregamento automático.

### Build de produção

```bash
npm run build
```

O resultado vai para `dist/angular-hnpwa/browser/`.

## Testando o service worker

O service worker só é registrado quando `environment.production` é `true` (veja `src/app/app.module.ts`), ou seja,
**ele não funciona no `npm start`**. Para testá-lo, gere o build e sirva a pasta de saída com qualquer servidor estático:

```bash
npm run build
npx http-server dist/angular-hnpwa/browser -p 8080
```

Depois abra <http://localhost:8080> e verifique em *DevTools → Application → Service Workers*. O build de produção
gera `ngsw-worker.js` e `ngsw.json` a partir do `ngsw-config.json`.

## Funcionalidades

- **Feeds** do Hacker News com paginação de 30 itens: `news`, `newest`, `show`, `ask` e `jobs`
- **Detalhe do item** com comentários aninhados e resultado de enquetes (rota carregada sob demanda)
- **Perfil de usuário** (rota carregada sob demanda)
- **Configurações** persistidas em `localStorage`: tema, tamanho da fonte do título, espaçamento da lista e abrir
  links em nova aba
- **PWA** instalável, com manifest e ícones para Android e iOS

### Temas

Três temas disponíveis no painel de configurações:

- Default
- Night
- Black (AMOLED)

Um quarto tema, **Dark Green**, está em desenvolvimento na branch `feature/tema-dark-green`.

Na primeira visita o tema segue a preferência do sistema (`prefers-color-scheme`); depois disso, a escolha salva
em `localStorage` tem prioridade.

## Rotas

| Rota | Descrição |
|---|---|
| `/` | Redireciona para `/news/1` |
| `/news/:page`, `/newest/:page`, `/show/:page`, `/ask/:page`, `/jobs/:page` | Feeds paginados |
| `/item/:id` | Detalhe do item com comentários (lazy) |
| `/user/:id` | Perfil do usuário (lazy) |

## Estrutura do projeto

```
src/app/
├── core/            # header, footer e painel de configurações
├── feeds/           # lista de feed e item individual
├── item-details/    # detalhe do item e comentários (módulo lazy)
├── user/            # perfil de usuário (módulo lazy)
└── shared/
    ├── components/  # loader e mensagem de erro
    ├── models/      # Story, User, Comment, Settings, PollResult
    ├── pipes/
    ├── services/    # HackerNewsAPIService, SettingsService
    └── scss/        # variáveis de tema, temas e media queries
```

## Dados e cache

Os dados vêm da API pública [node-hnapi](https://github.com/cheeaun/node-hnapi)
(`https://node-hnapi.herokuapp.com`), configurada em `src/app/shared/services/hackernews-api.service.ts`.

O serviço mantém um cache em memória com TTL de 60 segundos usando `shareReplay`, o que:

- compartilha uma única requisição entre assinantes simultâneos, em vez de disparar chamadas duplicadas;
- responde instantaneamente ao voltar para um feed já visitado dentro da janela de 60s;
- remove a entrada do cache quando a requisição falha, para que um erro nunca seja servido de novo.

Os componentes usam `ChangeDetectionStrategy.OnPush`, e as configurações são expostas via *signals*.

## Stack

Angular 21 · TypeScript 5.9 · RxJS 7.8 · SCSS · `@angular/service-worker`

## Pontos conhecidos em aberto

Itens herdados do fork que ainda não foram tratados — contribuições são bem-vindas:

- `npm test` **não roda**: `src/test.ts` ainda importa `zone.js/dist/zone-testing` (caminho antigo, hoje
  `zone.js/testing`) e `tsconfig.spec.json` aponta para um `src/polyfills.ts` que não existe. Também não há
  nenhum arquivo `.spec.ts` no projeto.
- `npm run e2e` **não roda**: a configuração usa Protractor, que foi descontinuado e não está instalado.
- `npm run lint` **não roda**: `angular.json` ainda usa o builder `@angular-devkit/build-angular:tslint`, removido do
  Angular CLI; a migração para ESLint (`angular-eslint`) está pendente.
- Deploy: existe configuração de Firebase Hosting, mas `firebase.json` publica `dist`, enquanto o build gera
  `dist/angular-hnpwa/browser`. O `.travis.yml` também está obsoleto (Node 6.9).
- `src/index.html` referencia um `manifest.webmanifest` que não existe no projeto (o manifest usado é
  `src/manifest.json`).
- O build emite avisos de depreciação do Sass (`@import` e divisão com `/`).

## Créditos

Projeto original criado por [Houssein Djirdeh](https://github.com/hdjirdeh), com contribuições de:

[Ashwin Sureshkumar](https://github.com/ashwin-sureshkumar) ·
[Mateusz](https://github.com/mateuszwitkowski) ·
[Jordi Collell](https://github.com/jordic) ·
[Ben Brooks](https://github.com/bbrks) ·
[Zach Berger](https://github.com/zachberger) ·
[blAck PR](https://github.com/blackpr) ·
[Bram Borggreve](https://github.com/beeman) ·
[Antonio Indrianjafy](https://github.com/Antogin) ·
[Addy Osmani](https://github.com/addyosmani) ·
[Majid Hajian](https://github.com/mhadaily) ·
[Jeff Cross](https://github.com/jeffbcross) ·
[Minko Gechev](https://github.com/mgechev)

## Licença

[MIT](LICENSE.md)
