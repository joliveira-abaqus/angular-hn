# Angular HN

Cliente do [Hacker News](https://news.ycombinator.com) em Angular 21, com PWA, quatro temas e cache de 60s na API — fork modernizado do [angular2-hn](https://github.com/hdjirdeh/angular2-hn), de Houssein Djirdeh.
Rodar: `npm install && npm start` (<http://localhost:4200>); build de produção: `npm run build`.
Testes: `npm test` (Karma/Jasmine) e e2e com `npm run e2e`.
Licença [MIT](LICENSE.md).

## Autenticação (Firebase)

Login/logout via Firebase Authentication (e-mail e senha). As rotas `/favorites` e `/profile` exigem login.

- **Desenvolvimento:** `npm run emulators` sobe o Firebase Auth Emulator em `127.0.0.1:9099` (projeto `demo-angular-hn`, requer Java). Em outro terminal, `npm start`. Crie um usuário de teste:

  ```bash
  curl -X POST "http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo-api-key" \
    -H 'Content-Type: application/json' \
    -d '{"email":"demo@angular-hn.dev","password":"demo1234"}'
  ```

- **Produção:** preencha `firebase` em `src/environments/environment.prod.ts` com a configuração do app Web do seu projeto Firebase e habilite o provedor "E-mail/senha" no console.

