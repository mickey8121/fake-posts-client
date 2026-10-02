# fake-posts-client — kickoff

Recorded 2026-10-02. Moves to `docs/kickoff.md` once the project exists.

Location: `~/Documents/GitHub/fake-posts-client`

**Language: everything in this project is English** — code, comments, docs, task files, AI log summaries, commits, PRs and the README.

## Spec decisions

| # | Topic | Decision |
|---|---|---|
| 1 | FakerJS image | The URL is generated once; the post is cached as a whole — content + image |
| 2 | Image fields | `thumbnailUrl` (32×32) and `imageUrl` (300×300) — the same picture at two resolutions |
| 3 | `/posts/{id}` | Requested on the first open of a post, stored, never requested again. The root README notes that the endpoint is redundant |
| 4 | Sorting | By `id`, no timestamps (jsonplaceholder has none): favorites grouped on top, both groups ordered by `id` |
| 5 | Loading / errors | Loading — the default `ActivityIndicator`. Any request error — an `Alert` with a refetch button |
| 6 | Image states | Loading — a grey, slightly shimmering block; error — the word "error" centered in the block |
| 7 | Install and run | `yarn install`, then `yarn run:ios` — the script installs pods and launches the app |
| 8 | Design | Custom and tidy: small soft shadows on cards and buttons, simple soft colors. Dark palette: dark grey / dark navy / dark red for favorites |

## Stack

- React Native 0.87.1 (bare, not Expo), TypeScript
- React Navigation 7: `native` + `native-stack`, `react-native-screens`, `react-native-safe-area-context`
- Redux Toolkit + `react-redux` + `redux-persist`
- Storage: `react-native-mmkv` 4.x + its peer `react-native-nitro-modules` (instead of AsyncStorage)
- Network: plain `fetch` + `createAsyncThunk`; no react-query
- `@faker-js/faker`
- jest — unit tests for selectors and sorting
- Package manager: Yarn — the version from the RN template, via corepack (rationale in the README)
- Ruby 3.3.12 (already updated)

## Architecture

**Rule: the app follows Feature-Sliced Design (FSD).** All application code lives in `src/`, split into layers, slices and segments.

```
src/
  app/        providers, store setup, navigation root
  screens/    PostsScreen, DetailsScreen — the FSD `pages` layer under its React Native name
  widgets/    self-contained blocks composed of features and entities (post list)
  features/   user actions (toggle-favorite)
  entities/   business entities (post: types, state, selectors, API, card)
  shared/     API client, storage, theme, UI kit, helpers — no business logic
```

- **Import direction.** A module imports only from layers below its own: `app → screens → widgets → features → entities → shared`.
- **No cross-imports.** Slices of one layer do not import each other.
- **Public API.** A slice is imported only through its `index.ts`, never by a deep path.
- **Segments.** Inside a slice: `ui/`, `model/` (state, selectors, thunks, types), `api/`, `lib/`. A segment is created when it is needed, not in advance.
- **Favorites belong to the post entity.** The favorite ids and the list ordering live in `entities/post/model`; the `toggle-favorite` feature holds only the button and the action it dispatches.
- **A layer is created when it has a slice.** No empty folders for the sake of the pattern.
- **Aliases.** Layers are imported through a path alias, declared in both `tsconfig.json` and `babel.config.js`.

These rules are what `/mobile-rules` is answered with; `.claude/rules/mobile.md` is their enforceable form.

## Process

- Tasks: local ids `TT-NN`, one file per task in `docs/tasks/`. No Linear.
- Branches: `<type>/tt-nn-<slug>`; PRs: `TT-NN: <task-name>`; squash-merge; the branch is deleted after merge.
- No Claude attribution in commits or PRs.
- The `mickey-kit` harness (`core` + `mobile-rn`) is installed the standard way, through the marketplace.
- For the reviewer, the harness parts actually used are copied into a separate directory next to the logs.
- Logs: per task, a short markdown summary linked to the task id, plus a sanitized `.jsonl` session log with the same file name. The kickoff session has a summary only.
- `docs/ai/` is committed: a sanitized session log is about 0.2 MB.
- The agent never launches the app on a simulator or emulator. It verifies with compile-only builds, type check, lint and tests; live checks are done by the human, by hand.
- One task — one Claude Code session, so a session log maps to a task.
- The README is created during setup: description, scripts, the stack and the reasoning behind it (why RTK, why `fetch` over react-query, why Yarn, etc.), and the note about `/posts/{id}`.

## Task files

- All seven files are written in TT-01, from this document, before any feature code.
- Each file: goal, scope, out of scope, acceptance criteria, dependencies, status.
- A task file is refined at the start of its task, when the implementation plan is agreed; the status is updated when its PR merges.

## Docs layout

```
docs/
  kickoff.md
  tasks/        TT-NN-<slug>.md
  adr/          decisions, via /adr
  ai/
    export-log.py   session transcript → sanitized jsonl
    logs/           TT-NN-<slug>.md summary + TT-NN-<slug>.jsonl session log
    harness/        copies of the skills, hooks and rules used
```

## Plan

### Manual part (outside the plan, no task id)

1. Create `~/Documents/GitHub/fake-posts-client`.
2. `rn init` — RN 0.87.1, Yarn.
3. `git init`.

### TT-01 — project setup

1. First build of the untouched template on iOS and Android.
2. Yarn: check `packageManager` in `package.json` and the template's `.yarnrc.yml` (`nodeLinker: node-modules`), commit `yarn.lock`.
3. Install the stack dependencies and pods.
4. Scripts `run:ios` (pods + launch) and `run:android`.
5. Harness: marketplace + `core` and `mobile-rn` in `.claude/settings.json`, then `/bootstrap` and `/mobile-rules` (greenfield).
6. `docs/`: kickoff, `tasks/` with files TT-01…TT-07, `ai/logs/`, `ai/harness/`.
7. README: description, scripts, stack with reasoning.
8. GitHub repository, first push.

### Implementation

- **TT-02 — store and persistence.** RTK store in `app/`, `redux-persist` over MMKV in `shared/`, post types, state and favorites in `entities/post`.
- **TT-03 — API and faker.** `fetch` client in `shared/api`, post requests in `entities/post/api`; thunks for the list and a single post, enrichment with `thumbnailUrl` / `imageUrl`, "already requested" flags.
- **TT-04 — navigation and theme.** Native stack and typed routes in `app/`, palette and shadows in `shared/`.
- **TT-05 — PostsScreen.** List, card, favorite highlight, sorting, loader, alert with refetch, image component with skeleton and error states.
- **TT-06 — DetailsScreen.** Post loaded once, 300×300 image, favorite toggle button.
- **TT-07 — wrap-up.** Selector tests, `/mobile-review`, check on both platforms, README, log summaries, harness copy, screenshots.

## Assumptions to confirm

1. **"Content + image" in the cache.** MMKV stores the post with its image URLs; the bytes are cached by the native `Image`. Showing images offline after a restart is not guaranteed by this.
2. **Android script.** `run:android` is added for symmetry with `run:ios`.

## Risks

- **Harness.** `/bootstrap`, `/mobile-rules` and `/ship` run only as a slash command typed by the user. This is the first live run of the `mobile-rn` plugin, so rough edges are possible.
- **One picture at two sizes.** Faker generates a URL with the size baked in. One seed per post and two URLs derived from it are needed; the exact faker 10 API is checked in TT-03.
