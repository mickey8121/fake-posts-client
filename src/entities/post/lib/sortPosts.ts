import type { Post } from '../model/types';

export const sortPosts = (posts: Post[], favoriteIds: number[]): Post[] => {
  const favorites = new Set(favoriteIds);
  return [...posts].sort(
    (a, b) =>
      Number(favorites.has(b.id)) - Number(favorites.has(a.id)) || a.id - b.id,
  );
};
