---
paths:
  - "src/**"
---

# Mobile rules

Conventions for the React Native app under `src/`. Written in greenfield mode: no app code
existed yet, so every rule below is a decision, not an observation. Dimensions nobody has
decided yet are listed under Gaps.

## Layout and layering

Feature-Sliced Design. All application code lives in `src/`:

| Layer | Contents |
|---|---|
| `app/` | providers, store setup, navigation root |
| `screens/` | one slice per screen (the FSD `pages` layer) |
| `widgets/` | self-contained blocks composed of features and entities (post list) |
| `features/` | user actions (toggle-favorite) |
| `entities/` | business entities (post: types, state, selectors, API, card) |
| `shared/` | API client, storage, theme, UI kit, helpers — no business logic |

- **Import direction:** a module imports only from layers below its own:
  `app → screens → widgets → features → entities → shared`.
- **No cross-imports:** slices of one layer never import each other.
- **A layer is created when it has a slice.** No empty folders for the sake of the pattern.
- **Aliases, one per layer**, declared in both `tsconfig.json` (`compilerOptions.paths`) and
  `babel.config.js` (`module-resolver`); an alias in one and not the other is a bug:

  | Alias | Path |
  |---|---|
  | `@app/*` | `src/app/*` |
  | `@screens/*` | `src/screens/*` |
  | `@widgets/*` | `src/widgets/*` |
  | `@features/*` | `src/features/*` |
  | `@entities/*` | `src/entities/*` |
  | `@shared/*` | `src/shared/*` |

  Cross-layer imports go through the alias; imports inside one slice are relative.

## Slice anatomy

- **Segments:** `ui/` (components), `model/` (state, selectors, thunks, types), `api/`
  (requests), `lib/` (pure helpers). A segment is created when it is needed, not in advance.
- **Public API:** every slice has an `index.ts`, and is imported only through it — never by a
  deep path.

  ```ts
  import { PostCard, selectSortedPosts } from '@entities/post';   // yes
  import { PostCard } from '@entities/post/ui/PostCard';          // no
  ```

- **Favorites belong to the post entity.** Favorite ids and the list ordering live in
  `entities/post/model`; `features/toggle-favorite` holds only the button and the action it
  dispatches.
- `shared/` is split by segment directly (`shared/api`, `shared/storage`, `shared/theme`,
  `shared/ui`, `shared/lib`), not by slice.

## Naming

- **Directories:** kebab-case on every layer — slices (`entities/post`,
  `features/toggle-favorite`, `screens/posts`, `screens/details`) and segments.
- **Component files:** PascalCase, one component per file, named after the component
  (`PostCard.tsx`). Screen components are `<Name>Screen` (`PostsScreen` in `screens/posts`).
- **Non-component files:** camelCase (`postSlice.ts`, `selectors.ts`, `sortPosts.ts`).
- **Hooks:** `use<Thing>` for reads (`usePosts`, `usePost`), `use<Verb><Thing>` for
  actions (`useToggleFavorite`). Update actions are `useUpdate<Entity>`, never `usePatch<Entity>`.
- **Types:** in `model/types.ts` of the slice. The API wire shape is a separate DTO type
  (`PostDto`) in `api/`; the domain type (`Post`, with `thumbnailUrl` / `imageUrl`) lives in
  `model/types.ts`, and the mapping between them happens in `api/`.

## Navigation

React Navigation 7, native stack, **static API**:

```ts
const RootStack = createNativeStackNavigator({
  screens: {
    Posts: PostsScreen,
    Details: DetailsScreen,
  },
});

export const Navigation = createStaticNavigation(RootStack);
```

- The navigator is defined in `app/`; screens never register themselves.
- Param types are inferred from the static config — no hand-written `ParamList`. The root
  type is registered once via the `ReactNavigation.RootParamList` global declaration in
  `app/`.

## Data layer

Redux Toolkit; no React Query.

- **Network:** a thin `fetch` client in `shared/api`; entity requests in `<slice>/api`.
- **One `createAsyncThunk` per operation** (list of posts, single post), in `<slice>/model`.
- **State:** a `createSlice` per entity, entities normalized with `createEntityAdapter`.
- **Fetch once:** the slice keeps "already requested" flags; a thunk is not dispatched again
  for data already in the store.
- **Derived data via memoized selectors** (`createSelector`) — e.g. favorites-first ordering
  by `id` — never stored.
- **Persistence:** `redux-persist` over `react-native-mmkv`; the storage adapter lives in
  `shared/storage`, the store and persist config in `app/`.
- **Components read through hooks or selectors**, never `state.x.y` inline.

## Styling

- `StyleSheet.create` from `react-native`; no styling library.
- **Styles live at the bottom of the component file:**

  ```tsx
  export const PostCard = (...) => { ... };

  const styles = StyleSheet.create({ ... });
  ```

- **Tokens** (palette, spacing, shadows) live in `shared/theme`; components use tokens, not
  raw color or spacing literals.
- **Shadows:** use the `boxShadow` style prop through the shadow tokens in `shared/theme`; no
  `shadow*` / `elevation` props and no `Platform.OS` branches. The blur needs Android API 28+.

## Testing

- Jest. **Logic only:** reducers, selectors and pure helpers (e.g. favorites-first sorting).
- No component tests are required.

## Legacy

Empty — greenfield mode: there was no tree to survey, so nothing was found and not chosen.

## Gaps

- **i18n** — dimension: i18n. The manifest declares no i18n library and `src/` does not
  exist. Settled when the project adopts an i18n library or decides strings stay inline.
- **Services** — dimension: services and side effects. No analytics, crash-reporting or
  remote-config SDK is declared. Settled when one is added.
- **Platform branches and permissions** — dimension: platform and native. No
  `Platform.OS` code, no permissions, no `patches/`. Shadows are settled (`boxShadow`, see
  Styling); the rest is settled by the first platform-specific code or permission.
- **Lists, memoization, images** — dimension: performance. No list, animation or image
  library is declared; `FlatList` and `Image` from core are the only candidates. Settled by
  the posts list in TT-05.
- **Assets** — dimension: assets. No svg pipeline, no fonts, no local assets; post images
  are remote (faker URLs). Settled when the first local asset lands.
