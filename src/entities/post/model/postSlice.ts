import { createSlice } from '@reduxjs/toolkit';
import { postsAdapter } from './postAdapter';
import { loadPost, loadPosts } from './thunks';
import type { Post, PostsState } from './types';

const initialState: PostsState = postsAdapter.getInitialState({
  listRequested: false,
  detailRequestedIds: [],
});

const keepImages = (state: PostsState, post: Post): Post => {
  const existing = state.entities[post.id];
  return existing
    ? {
        ...post,
        thumbnailUrl: existing.thumbnailUrl,
        imageUrl: existing.imageUrl,
      }
    : post;
};

const postSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(loadPosts.fulfilled, (state, { payload }) => {
        postsAdapter.upsertMany(
          state,
          payload.map(post => keepImages(state as PostsState, post)),
        );
        state.listRequested = true;
      })
      .addCase(loadPost.fulfilled, (state, { payload }) => {
        postsAdapter.upsertOne(state, keepImages(state as PostsState, payload));
        if (!state.detailRequestedIds.includes(payload.id)) {
          state.detailRequestedIds.push(payload.id);
        }
      });
  },
});

export const postsReducer = postSlice.reducer;
