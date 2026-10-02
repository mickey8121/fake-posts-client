import { createSelector } from '@reduxjs/toolkit';
import { sortPosts } from '../lib/sortPosts';
import { postsAdapter } from './postAdapter';
import type { PostRootState, RequestState } from './types';

const postSelectors = postsAdapter.getSelectors(
  (state: PostRootState) => state.posts,
);

export const selectPostById = postSelectors.selectById;
export const selectAllPosts = postSelectors.selectAll;

export const selectFavoriteIds = (state: PostRootState) => state.favorites;

export const selectIsFavorite = (state: PostRootState, id: number) =>
  state.favorites.includes(id);

export const selectListRequested = (state: PostRootState) =>
  state.posts.listRequested;

export const selectDetailRequested = (state: PostRootState, id: number) =>
  state.posts.detailRequestedIds.includes(id);

export const selectSortedPosts = createSelector(
  [selectAllPosts, selectFavoriteIds],
  sortPosts,
);

const idleRequest: RequestState = { status: 'idle', error: null };

export const selectListRequest = (state: PostRootState) =>
  state.postRequests.list;

export const selectPostRequest = (state: PostRootState, id: number) =>
  state.postRequests.details[id] ?? idleRequest;
