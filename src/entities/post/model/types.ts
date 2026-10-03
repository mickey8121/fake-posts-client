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

export type RequestStatus = 'idle' | 'pending' | 'succeeded' | 'failed';

export type RequestState = {
  status: RequestStatus;
  error: string | null;
};

export type PostRequestsState = {
  list: RequestState;
  details: Record<number, RequestState>;
};

export type ListView = 'loading' | 'error' | 'ready';

export type DetailView = 'loading' | 'error' | 'ready';

export type PostRootState = {
  posts: PostsState;
  favorites: FavoritesState;
  postRequests: PostRequestsState;
};
