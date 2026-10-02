import {
  createEntityAdapter,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit';
import type { Post, PostsState } from './types';

export const postsAdapter = createEntityAdapter<Post>();

const initialState: PostsState = postsAdapter.getInitialState({
  listRequested: false,
  detailRequestedIds: [],
});

const postSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    postsLoaded: (state, { payload }: PayloadAction<Post[]>) => {
      postsAdapter.upsertMany(state, payload);
      state.listRequested = true;
    },
    postLoaded: (state, { payload }: PayloadAction<Post>) => {
      postsAdapter.upsertOne(state, payload);
      if (!state.detailRequestedIds.includes(payload.id)) {
        state.detailRequestedIds.push(payload.id);
      }
    },
  },
});

export const { postsLoaded, postLoaded } = postSlice.actions;
export const postsReducer = postSlice.reducer;
