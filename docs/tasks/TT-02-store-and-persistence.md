# TT-02: Store and persistence

Status: Todo

## Goal

A Redux store whose state survives an app restart, with the post model and favorites in place.

## Scope

- FSD placement: store and provider in `app/`, storage adapter in `shared/`, post state and favorites in `entities/post/model`.
- Layer aliases (`@app/*` … `@shared/*`) in `tsconfig.json`, `babel.config.js` (`babel-plugin-module-resolver`) and the Jest config — this task adds the first code under `src/`.
- Redux Toolkit store, typed hooks, provider at the app root.
- `redux-persist` with an MMKV storage adapter; the app renders only after rehydration.
- Post type: API fields plus `thumbnailUrl` and `imageUrl`.
- `posts` state: normalized by `id`, with flags that record what has already been requested.
- `favorites` state: the set of favorite post ids, with a toggle action.
- Selector for the list order: favorites first, both groups ordered by `id`.

## Out of scope

- Network requests and faker enrichment (TT-03).
- Screens.

## Acceptance criteria

- State written before a restart is present after it, on both platforms.
- Toggling a favorite twice returns the state to where it started.
- The ordering selector is memoized and covered by unit tests.

## Dependencies

TT-01.
