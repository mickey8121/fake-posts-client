# TT-02: Store and persistence

Status: In progress

## Goal

A Redux store whose state survives an app restart, with the post model and favorites in place.

## Scope

- FSD placement: store and provider in `app/`, storage adapter in `shared/`, post state and favorites in `entities/post/model`.
- Layer aliases (`@app/*` … `@shared/*`) in `tsconfig.json`, `babel.config.js` (`babel-plugin-module-resolver`) and the Jest config — this task adds the first code under `src/`.
- Redux Toolkit store, typed hooks (`app/hooks.ts`), provider at the app root.
- `redux-persist` with an MMKV storage adapter; the app renders nothing until rehydration is done (no loader — loaders are for fetch requests only). The persist config whitelists the `posts` and `favorites` slices; request status and errors added in TT-03 must stay out of the persisted state (TT-03 decides how: a separate slice, or a nested persist config with a blacklist).
- Post type: API fields plus `thumbnailUrl` and `imageUrl`.
- `posts` state: the single cache of all posts, normalized by `id`, with flags that record what has already been requested (`listRequested`, and `detailRequestedIds` for single posts).
- `favorites` state: a plain array of favorite post ids kept sorted ascending, with a toggle action. It is independent of the posts cache; the list order is derived by the selector, never stored.
- Selector for the list order: favorites first, both groups ordered by `id`.

## Out of scope

- Network requests and faker enrichment (TT-03).
- Screens.

## Acceptance criteria

- State written before a restart is present after it, on both platforms.
- Toggling a favorite twice returns the state to where it started (ids are kept sorted, so the array is identical).
- Reducers are unit-tested; persistence is covered by a round-trip test, and the real restart check on iOS and Android is done by the human.
- The ordering selector is memoized and covered by unit tests.

## Dependencies

TT-01.
