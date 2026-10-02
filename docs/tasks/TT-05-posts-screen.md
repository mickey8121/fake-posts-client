# TT-05: PostsScreen

Status: Todo

## Goal

The list of posts, with favorites highlighted and placed on top.

## Scope

- FSD placement: the screen in `screens/`, the list in `widgets/`, the card in `entities/post/ui`, the image component in `shared/ui`.
- List of post cards: title, body, 32×32 thumbnail.
- Favorites are visually distinct (dark red) and come first; both groups are ordered by `id`.
- Tapping a card opens `DetailsScreen` for that post.
- Loading: the default `ActivityIndicator`.
- Request error: an `Alert` with a refetch button.
- Shared image component: grey shimmering block while loading, the word "error" centered on failure.

## Out of scope

- Pull-to-refresh, pagination, search.
- Toggling favorites from the list.

## Acceptance criteria

- First launch shows the loader, then 100 posts.
- A relaunch shows the list immediately, with no request and the same images.
- A post favorited on `DetailsScreen` is highlighted and on top after going back.
- With no network on first launch, the alert appears and refetch recovers once the network is back.
- The list scrolls smoothly on both platforms.

## Dependencies

TT-02, TT-03, TT-04.
