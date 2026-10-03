# TT-05: PostsScreen

Status: Done

## Goal

The list of posts, with favorites highlighted and placed on top.

## Scope

- FSD placement: the screen in `screens/posts`, the list in `widgets/post-list`, the card in `entities/post/ui`, the image component in `shared/ui`.
- List of post cards: title (1 line), body (2 lines), 32×32 thumbnail. Text is truncated so every card has the same height and the list can skip layout measurement.
- Favorites are visually distinct (dark red) and come first; both groups are ordered by `id`.
- Tapping a card opens `DetailsScreen` for that post. The widget gets an `onPostPress` callback from the screen and never imports from `screens/`.
- Loading: the default `ActivityIndicator`, shown while the list is empty and the request is idle or pending.
- Request error: an `Alert` with a single "Refetch" button. It is not cancelable, so the user cannot dismiss it into an empty screen.
- Shared image component: grey shimmering block while loading, the word "error" centered on failure. Takes its size from props, so TT-06 reuses it at 300×300.
- The post entity gets a `usePostList` hook with its own typed dispatch/selector hooks: `entities/`, `widgets/` and `screens/` cannot import `app/hooks.ts`.
- The temporary button on the `PostsScreen` placeholder is removed.

## Out of scope

- Pull-to-refresh, pagination, search.
- Toggling favorites from the list.
- The favorite toggle button itself (TT-06).

## Acceptance criteria

- First launch shows the loader, then 100 posts.
- A relaunch shows the list immediately, with no request and the same images.
- With no network on first launch, the alert appears and refetch recovers once the network is back.
- The list scrolls smoothly on both platforms.
- A favorited post is highlighted and on top: the highlight and the ordering are built and unit-tested here; the end-to-end check ("favorite on `DetailsScreen`, go back") moves to TT-06, where the toggle button lands.

## Dependencies

TT-02, TT-03, TT-04.
