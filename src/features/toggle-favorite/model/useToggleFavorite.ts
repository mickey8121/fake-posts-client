import { useFavoriteToggle, useIsFavorite } from '@entities/post';

export const useToggleFavorite = (postId: number) => ({
  isFavorite: useIsFavorite(postId),
  toggle: useFavoriteToggle(postId),
});
