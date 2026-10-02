import type { EntityState } from '@reduxjs/toolkit';

export type Post = {
  id: number;
  userId: number;
  title: string;
  body: string;
  thumbnailUrl: string;
  imageUrl: string;
};

export type PostsState = EntityState<Post, number> & {
  listRequested: boolean;
  detailRequestedIds: number[];
};

export type FavoritesState = number[];

export type PostRootState = {
  posts: PostsState;
  favorites: FavoritesState;
};
