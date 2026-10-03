# Mobile review

`/mobile-review src/` run in TT-07 over the whole app: 40 files, three lenses (performance, platform parity, conformance to [`.claude/rules/mobile.md`](../.claude/rules/mobile.md)), each by an unprimed `mobile-reviewer` agent. The report is findings only; the fixes were applied afterwards in the same task.

Findings are ordered by cost. `make check` and `make test` pass after the fixes.

## Findings

| # | Where | Lens | Finding | Status |
|---|---|---|---|---|
| 1 | `entities/post/lib/getDetailView.ts`, `entities/post/model/hooks.ts` | performance | The details screen waits for `GET /posts/{id}` on the first open of each post, although the post is already in the store from the list. If the request fails, the user sees an alert for data that is on screen. | **Kept by design** |
| 2 | `widgets/post-list/ui/PostList.tsx`, `screens/details/ui/DetailsScreen.tsx` | platform parity | Neither scroll container reserved the bottom safe-area inset. With edge-to-edge on Android, and the home indicator on notched iPhones, the last card or the favorite button could sit under the system bar. | **Fixed** |
| 3 | `entities/post/model/hooks.ts` | conformance | The action hook was named `useFavoriteToggle`; the rules name action hooks verb-first. The feature's `useToggleFavorite` only forwarded to it. | **Fixed** |
| 4 | `entities/post/lib/getDetailView.ts`, `getListView.ts` | conformance | The `DetailView` and `ListView` types lived in `lib/`; the rules keep slice types in `model/types.ts`. | **Fixed** |
| 5 | `widgets/post-list/ui/PostList.tsx` | conformance | A second component, `Separator`, in the same file; the rules say one component per file. | **Fixed** |

### 1. Details loader — kept by design

The wait is the spec: the details screen requests the post on its first open, stores it, and never requests it again, with the loader shown until the request returns ([kickoff decision 3](kickoff.md), [TT-06](tasks/TT-06-details-screen.md)). Gating on the stored post would skip the request the spec asks for.

The review is right about the cost, and it is the cost of that decision. The README already notes that `GET /posts/{id}` is redundant.

### 2. Safe-area inset — fixed

Both scroll containers add `useSafeAreaInsets().bottom` to their bottom padding. `SafeAreaProvider` was already mounted in `App.tsx`. Not verified on a device: it is on the [manual pass](manual-pass.md) — scroll to the end of the list and of a long post on both platforms.

### 3–5. Conformance — fixed

- `useFavoriteToggle` is now `useToggleFavorite` in `entities/post`. The feature's forwarding hook is gone, and `ToggleFavoriteButton` uses `useIsFavorite` and `useToggleFavorite` from `@entities/post` directly. `features/toggle-favorite` now holds only the button, as the rules say.
- `DetailView` and `ListView` moved to `entities/post/model/types.ts` and are exported from the slice's `index.ts` as before.
- `Separator` moved to `widgets/post-list/ui/PostListSeparator.tsx`.

## Notes recorded, not fixed

- **Dead code.** `app/hooks.ts` declares `useAppDispatch` and `useAppSelector`, and nothing imports them: the layers below `app/` cannot use them, so the entity keeps its own typed hooks. Left in place as the store's typed hooks for `app/`.
- **`getItemLayout` ignores the list padding.** Offsets do not include the content padding, and the last row counts a separator that is not rendered. Invisible at the current `windowSize`; it would matter if `scrollToIndex` or `initialScrollIndex` is ever added.
- **One re-sort per first details visit.** `loadPost.fulfilled` writes a new entity, which re-runs the sort selector and re-renders one row. Negligible at 100 posts.
- **Shadows below Android API 28.** `boxShadow` follows the rules file, which states the API 28+ requirement. The project's `minSdkVersion` is 24, so on Android 7.0–8.1 the card and button shadows do not render. A documented trade-off.
- **Non-cancelable alerts.** Android's back button cannot dismiss the error alerts. Intentional: each has a button that leaves the state.

## Not covered by the review

- `tsconfig.json` and `babel.config.js`: the rule that every alias is declared in both files was not checked by the agents. Checked by hand: both files declare the same six aliases.
- `__tests__/`: the logic-only testing rule was not judged. Two points seen by hand: tests import `@app/store`, because `app/` has no `index.ts`, and `shared/ui` imports `@shared/theme` through the alias rather than a relative path. Neither is called out by the rules.
- The Android manifest and `Info.plist`: only confirmed that no code in `src/` requests a permission.

## Layer check

A grep over `src/` and `__tests__/` found no import against the layer direction, no import between slices of one layer, no deep path past a slice's `index.ts`, and no `@app/*` import below `app/`.
