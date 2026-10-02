# TT-03: API and faker enrichment

Status: Todo

## Goal

Load posts from jsonplaceholder exactly once, enrich them with faker images exactly once, and keep the result in the store.

## Scope

- FSD placement: the client in `shared/api`, post requests and enrichment in `entities/post`.
- `fetch` client for `GET /posts` and `GET /posts/{id}`.
- Thunk for the list: runs only if the list was never loaded.
- Thunk for a single post: runs only on the first open of that post.
- Enrichment: one picture per post, exposed as `thumbnailUrl` (32×32) and `imageUrl` (300×300).
- Request status and error per request, so the UI can show a loader and an alert.

## Out of scope

- Refreshing, pagination, cache invalidation — the spec forbids re-requesting.
- UI for loading and errors (TT-05, TT-06).

## Acceptance criteria

- The list request is sent once across app restarts.
- A post's detail request is sent once across app restarts.
- Image URLs of a post never change after they are generated.
- A failed request leaves the "already requested" flag unset, so a retry is possible.
- The thumbnail and the detail image of a post show the same picture.

## Dependencies

TT-02.
