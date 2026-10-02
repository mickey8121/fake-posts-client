# TT-04: Navigation and theme

Status: Done

## Goal

A typed navigation skeleton with two screens and the shared visual language.

## Scope

- FSD placement: navigator and routes in `app/`, screens in `screens/`, theme in `shared/`.
- Native stack navigator (static API) with `PostsScreen` and `DetailsScreen` (placeholders at this stage). The native header is kept and styled from the theme; `PostsScreen` has a temporary button that opens `DetailsScreen` with a hardcoded id, replaced in TT-05.
- Typed routes and params; `DetailsScreen` receives a post id.
- Theme: dark palette — dark grey, dark navy, dark red for favorites — plus spacing, radii and typography.
- Soft shadows for cards and buttons through the `boxShadow` style prop, so they look the same on iOS and Android with no `Platform.OS` branches. On Android the blur needs API 28+; the app's `minSdkVersion` is 24, where the shadow is not drawn.
- The template `NewAppScreen` and the `@react-native/new-app-screen` dependency are removed; the app is dark-only and ignores the system color scheme.

## Out of scope

- Screen content (TT-05, TT-06).
- Light theme and theme switching.

## Acceptance criteria

- Navigation between the two screens works on both platforms, including the back gesture.
- Route names and params are type-checked.
- Colors, spacing and shadows come from the theme, not from literals in components.

## Dependencies

TT-01.
