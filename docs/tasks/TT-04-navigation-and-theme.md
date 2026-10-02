# TT-04: Navigation and theme

Status: Todo

## Goal

A typed navigation skeleton with two screens and the shared visual language.

## Scope

- FSD placement: navigator and routes in `app/`, screens in `screens/`, theme in `shared/`.
- Native stack navigator with `PostsScreen` and `DetailsScreen` (placeholders at this stage).
- Typed routes and params; `DetailsScreen` receives a post id.
- Theme: dark palette — dark grey, dark navy, dark red for favorites — plus spacing, radii and typography.
- Soft shadows for cards and buttons, looking the same on iOS and Android.

## Out of scope

- Screen content (TT-05, TT-06).
- Light theme and theme switching.

## Acceptance criteria

- Navigation between the two screens works on both platforms, including the back gesture.
- Route names and params are type-checked.
- Colors, spacing and shadows come from the theme, not from literals in components.

## Dependencies

TT-01.
