<p align="center">
  <a href="https://angular2-hn.firebaseapp.com">
    <img alt="React HN" title="React HN" src="http://i.imgur.com/J303pQ4.png" width="150">
  </a>
</p>

<p align="center">
  A progressive Hacker News client built with React, TypeScript and Vite
</p>

<p align="center">
  <a href="https://angular2-hn.firebaseapp.com">View App</a>
</p>

<p align="center">
  <a href="/CONTRIBUTING.md"><img alt="PRs Welcome" src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg"></a>
  <a href="https://travis-ci.org/housseindjirdeh/angular2-hn"><img alt="Build Status" src="https://travis-ci.org/housseindjirdeh/angular2-hn.svg?branch=master"></a>
</p>

---

:zap: **Fast:** Service Worker App Shell + Dynamic Content model to achieve faster load times with and without a network.

:iphone: **Responsive:** Completely responsive UI that can be installed to your mobile home screen to provide a native feel.

:rocket: **Progressive:** [Lighthouse](https://github.com/GoogleChrome/lighthouse) score of 87/100.

<p align="center">
  <img src = "http://i.imgur.com/fzJzLFO.png" width=500>
</p>

## Mobile Preview

<p align="center">
  <img src = "http://i.imgur.com/ZloA1hn.gif">
</p>

## Laptop Preview

<p align="center">
  <img src = "http://i.imgur.com/MrKHaln.gif">
</p>

## Offline Support

This app uses [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) ([Workbox](https://developer.chrome.com/docs/workbox)) to generate a service worker as part of the build step: the app shell is precached and responses from the [node-hnapi](https://node-hnapi.herokuapp.com) API are cached at runtime (network first), so visited pages keep working offline.

## Manifest

With Chromium based browsers for Android (Chrome, Opera, etc...), React HN includes a Web App Manifest that allows you to install to your homescreen.

<p align="center">
  <img src = "http://i.imgur.com/1RaaNkr.png">
</p>

## Themes

Built in theme engine!

Current themes:
* Default
* Night
* Black (AMOLED)

More to come!

## Areas of improvement

 - Realtime updating using the Firebase SDK (may need to add option to settings so service worker can still rely on REST endpoints)
 - Server side rendering

Feel free to send me feedback on [twitter](https://twitter.com/hdjirdeh) or [file an issue](https://github.com/hdjirdeh/angular2-hn/issues/new)! Feature requests are always welcome.

## Build process

Requires Node.js 22+.

 - Clone or download the repo
 - `npm install`
 - `npm run dev` to start the Vite dev server on http://localhost:4200
 - `npm run build` to type-check and create a production build in `dist/` (including the service worker)
 - `npm run preview` to serve the production build locally (the service worker is only registered in production builds)

## Tests and lint

 - `npm test` runs the unit tests (Vitest + React Testing Library)
 - `npm run e2e` runs the end-to-end tests (Playwright) against a production build; run `npx playwright install chromium` once before
 - `npm run lint` runs ESLint (typescript-eslint + eslint-plugin-react)
 - `npm run typecheck` runs the TypeScript compiler

## Project structure

 - `src/api/hackernews.ts` – API client (`fetchFeed`, `fetchItemContent`, `fetchPollContent`, `fetchUser`), cached for 60s with React Query
 - `src/context/SettingsContext.tsx` – user preferences (theme, font size, list spacing, links in new tab) persisted to `localStorage`
 - `src/pages/` – route pages (`FeedPage`, `ItemDetailsPage`, `UserPage`); `src/components/` – shared UI
 - `src/styles/` – theme engine (SCSS)

Deploy is done with Firebase Hosting (`firebase deploy`), serving `dist/`.

## Contributors

A million thanks to some awesome people :)

* [Ashwin Sureshkumar](https://github.com/ashwin-sureshkumar)
* [Mateusz](https://github.com/mateuszwitkowski)
* [Jordi Collell](https://github.com/jordic)
* [Ben Brooks](https://github.com/bbrks)
* [Zach Berger](https://github.com/zachberger)
* [blAck PR](https://github.com/blackpr)
* [Bram Borggreve](https://github.com/beeman)
* [Antonio Indrianjafy](https://github.com/Antogin)
* [Addy Osmani](https://github.com/addyosmani)
* [Majid Hajian](https://github.com/mhadaily)
* [Jeff Cross](https://github.com/jeffbcross)
* [Minko Gechev](https://github.com/mgechev)
