# Manual pass

A checklist for the human to run on iOS and on Android before hand-over. The agent never launches the app, so none of these items are verified by it.

Built from the decisions in [`kickoff.md`](kickoff.md) and the feature list in the [README](../README.md). The original spec document was not re-read for this list.

Run each section on both platforms. Start from a clean install (delete the app from the simulator or emulator) unless a step says otherwise.

## Setup

- [x] `yarn install` on a clean clone succeeds.
- [x] `yarn run:ios` installs pods, builds and launches the app.
- [x] `yarn run:android` builds and launches the app.

## First launch

- [x] The default `ActivityIndicator` shows while the list loads.
- [x] The list then shows 100 posts, ordered by `id` (1, 2, 3, …).
- [x] Each card shows a 32×32 image, a one-line title and a two-line body, and all cards have the same height.
- [x] While an image loads it is a grey, slightly shimmering block.

## Details screen

- [x] Tapping a card opens the details screen; the loader shows until `GET /posts/{id}` returns.
- [x] Title, body and a 300×300 image are shown; the image is the same picture as the thumbnail in the list.
- [x] The button reads "Add to favorites" and is neutral.
- [x] Pressing it changes the label to "Remove from favorites" and the color to dark red.
- [x] Going back, the post is highlighted in the list and listed first.
- [x] Opening a second favorite puts it after the first one, and both groups stay ordered by `id`.
- [x] Pressing "Remove from favorites" and going back returns the post to its place by `id`.

## Restart scenarios

Kill the app from the app switcher, then relaunch.

- [x] The list shows immediately with no loader and the same images.
- [x] Favorites are still highlighted and on top.
- [x] A post opened before the restart opens without a loader and without a request; the button state matches the list.
- [x] A post never opened before the restart still triggers one request on its first open.
- [x] After a restart in airplane mode the list and the already opened posts still render. Images that were not cached by the native `Image` may show "error" (see the README note).

## Errors

Use airplane mode on a clean install.

- [x] List: the alert has a single "Refetch" button and cannot be dismissed. With the network back, "Refetch" loads the list.
- [x] Details: the alert has "Refetch" and "Back". "Back" returns to the list. With the network back, "Refetch" loads the post.
- [x] An image that fails to load shows the word "error" centered in its block.

## Look and feel

- [x] Cards and buttons have small soft shadows on both platforms.
- [x] The dark palette is used throughout: dark grey, dark navy, dark red for favorites.
- [x] Text is readable and nothing overflows on a small screen.
