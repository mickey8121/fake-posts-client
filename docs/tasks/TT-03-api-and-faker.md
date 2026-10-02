# TT-03: API and faker enrichment

Status: Done

## Goal

Load posts from jsonplaceholder exactly once, enrich them with faker images exactly once, and keep the result in the store.

## Scope

- FSD placement: the client in `shared/api`, post requests and enrichment in `entities/post`.
- `fetch` client for `GET /posts` and `GET /posts/{id}`.
- Request timeout of 20 seconds in the client. A timeout is an ordinary request failure: the request ends as `failed` with a readable message, and the UI shows it as an `Alert` with a refetch button like any other error (UI in TT-05, TT-06).
- Thunk for the list: runs only if the list was never loaded and is not already in flight.
- Thunk for a single post: runs only on the first open of that post and is not already in flight.
- Enrichment: one picture per post, exposed as `thumbnailUrl` (32×32) and `imageUrl` (300×300). Both URLs come from a Faker instance seeded with the post id, so they carry the same picsum seed at two sizes. Faker is imported as a minimal instance (`base` locale), not the root `faker`.
- The posts reducers keep the image URLs already in the cache; a response only refreshes the API fields, so `/posts/{id}` can never change a picture.
- Request status and error per request, so the UI can show a loader and an alert. They live in a separate, non-persisted `postRequests` slice; the persist whitelist (`posts`, `favorites`) stays as it is.

## Out of scope

- Refreshing, pagination, cache invalidation — the spec forbids re-requesting.
- UI for loading and errors, including the `Alert` and the refetch button (TT-05, TT-06).

## Acceptance criteria

- The list request is sent once across app restarts.
- A post's detail request is sent once across app restarts.
- Image URLs of a post never change after they are generated.
- A failed request, including a timeout after 20 seconds, leaves the "already requested" flag unset, so a retry is possible.
- The thumbnail and the detail image of a post show the same picture.
- Request status and errors are not persisted.
- Logic is unit-tested (enrichment, reducers, thunks with a mocked `fetch`); the real restart check on iOS and Android is done by the human.

## Dependencies

TT-02.
