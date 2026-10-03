# TT-06: DetailsScreen

Status: Done

## Goal

A single post with its large image and a favorite toggle.

## Scope

- FSD placement: the screen in `screens/`, the toggle button in `features/toggle-favorite`.
- Title, body and the 300×300 image of the post.
- The post comes from `GET /posts/{id}` on the first open and from the store afterwards.
- Toggle button: adds the post to favorites, a second press removes it; label ("Add to favorites" / "Remove from favorites") and color (neutral, dark red when on) follow the state.
- Loading: the default `ActivityIndicator`. Request error: a non-cancelable `Alert` with "Refetch" and "Back" buttons (Back returns to the list, so the user is never stuck offline).
- Image states through the shared image component from TT-05.
- On the first open the loader shows until `GET /posts/{id}` returns, even though the post is already in the store from the list.

## Out of scope

- Editing or deleting posts.
- Comments and author data.

## Acceptance criteria

- Opening a post for the first time sends one request; reopening it sends none, including after a restart.
- The 300×300 image is the same picture as the thumbnail in the list.
- The button state matches the store on open, including after a restart.
- Toggling updates the list order without a reload.
- End-to-end check moved from TT-05: favorite on `DetailsScreen`, go back, the post is highlighted and on top (checked by hand).

## Dependencies

TT-02, TT-03, TT-04.
