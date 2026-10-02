# Fake Posts Client

A small React Native app for iOS and Android: a list of posts from [JSONPlaceholder](https://jsonplaceholder.typicode.com), each enriched with a FakerJS image, with a details screen and favorites that float to the top of the list.

Built as a test task with an AI-only workflow — see [AI workflow](#ai-workflow).

## Features

- **PostsScreen** — the list of posts with a 32×32 image; favorites are highlighted and listed first.
- **DetailsScreen** — a single post with a 300×300 image and a button that adds it to or removes it from favorites.
- **Fetch once** — the list and each post are requested a single time; images are generated a single time.
- **Persistence** — posts, images and favorites survive an app restart; nothing is requested again.

## Requirements

- Node.js ≥ 22.11
- Yarn through Corepack (ships with Node)
- Ruby ≥ 2.6.10 with Bundler — for CocoaPods
- Xcode with an iOS simulator — for iOS
- Android SDK, JDK 17 and an emulator or device — for Android

The general environment setup is described in the [React Native guide](https://reactnative.dev/docs/set-up-your-environment).

## Getting started

Enable Corepack once per machine, so `yarn` resolves to the version pinned in `package.json`:

```sh
corepack enable
```

Install:

```sh
yarn install
```

Run:

```sh
yarn run:ios
```

```sh
yarn run:android
```

`run:ios` installs the CocoaPods dependencies and then builds and launches the app, so no separate pods step is needed.

## Scripts

| Script | What it does |
|---|---|
| `yarn run:ios` | Installs pods, builds and launches the app on the iOS simulator |
| `yarn run:android` | Builds and launches the app on an Android emulator or device |
| `yarn start` | Starts the Metro bundler |
| `yarn pods` | Installs the Ruby gems and CocoaPods dependencies |
| `yarn typecheck` | Type-checks the project with `tsc` |
| `yarn lint` | Runs ESLint |
| `yarn test` | Runs the Jest tests |

## Stack

| Area | Choice |
|---|---|
| Framework | React Native 0.87 (bare, no Expo), TypeScript |
| Navigation | React Navigation 7, native stack |
| State | Redux Toolkit, `react-redux` |
| Persistence | `redux-persist` over `react-native-mmkv` |
| Network | `fetch` + `createAsyncThunk` |
| Fake data | `@faker-js/faker` |
| Tests | Jest |
| Package manager | Yarn 3 (Corepack) |

### Why these choices

- **Redux Toolkit.** The spec requires a state manager, and the app's whole behavior is persisted client state: posts that are loaded once, and a set of favorites that reorders the list. RTK keeps that state normalized, and the list order is a memoized selector over it.
- **Plain `fetch` instead of React Query.** React Query is a server-state cache built around staleness, refetching and invalidation. The spec asks for the opposite: request once, never update, survive restarts. That is persisted state, not a cache — using React Query would mean switching its core features off. Two endpoints do not need more than a thin `fetch` client and thunks.
- **MMKV instead of AsyncStorage.** Synchronous and considerably faster, which keeps rehydration on startup short.
- **Yarn.** It is the package manager the React Native template is set up for, so the project needs no extra configuration. The version is pinned in `package.json` and resolved by Corepack, so every machine installs with the same Yarn.
- **React Navigation native stack.** Required by the spec; the native stack gives platform-native transitions and gestures.

## Architecture

The code follows [Feature-Sliced Design](https://feature-sliced.design): `src/` is split into layers, and a module may import only from the layers below it.

| Layer | Contents |
|---|---|
| `app` | Providers, store setup, navigation root |
| `screens` | `PostsScreen`, `DetailsScreen` — the FSD `pages` layer |
| `widgets` | Composed blocks, such as the post list |
| `features` | User actions, such as toggling a favorite |
| `entities` | The post: types, state, selectors, API, card |
| `shared` | API client, storage, theme, UI kit |

Slices of one layer do not import each other, and a slice is used only through its `index.ts`. This is what separates UI, logic and state: components live in `ui`, state and selectors in `model`, requests in `api`.

## Notes on the spec

- **`GET /posts/{id}` is redundant.** `GET /posts` already returns the full content of every post. The spec asks for the single-post endpoint explicitly, so the app calls it on the first open of a post and never again.
- **Ordering.** JSONPlaceholder posts carry no timestamps, so the list is ordered by `id`: favorites first, then the rest.
- **One image per post.** The thumbnail and the details image are the same picture at two resolutions.

## Project docs

- [`docs/kickoff.md`](docs/kickoff.md) — decisions on the open points of the spec, stack, process, plan.
- [`docs/tasks/`](docs/tasks) — one file per task, `TT-01` … `TT-07`.
- [`docs/ai/logs/`](docs/ai/logs) — the AI sessions, per task: a short summary and a session log.
- [`docs/ai/harness/`](docs/ai/harness) — the prompts, skills and rules used.

## AI workflow

The project was built with [Claude Code](https://claude.com/claude-code). Planning, setup, implementation and review were done by the agent, under human direction and review, using a personal harness of skills and hooks.

The only manual step was creating the project: three commands — `corepack enable`, the React Native CLI `init`, and `git init` — produced in the planning session and run by hand.
