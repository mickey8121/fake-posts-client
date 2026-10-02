import { createSlice } from '@reduxjs/toolkit';
import { loadPost, loadPosts } from './thunks';
import type { PostRequestsState, RequestState } from './types';

const initialState: PostRequestsState = {
  list: { status: 'idle', error: null },
  details: {},
};

const pending: RequestState = { status: 'pending', error: null };
const succeeded: RequestState = { status: 'succeeded', error: null };
const failed = (error: string | undefined): RequestState => ({
  status: 'failed',
  error: error ?? 'Request failed',
});

const postRequestsSlice = createSlice({
  name: 'postRequests',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(loadPosts.pending, state => {
        state.list = pending;
      })
      .addCase(loadPosts.fulfilled, state => {
        state.list = succeeded;
      })
      .addCase(loadPosts.rejected, (state, { error }) => {
        state.list = failed(error.message);
      })
      .addCase(loadPost.pending, (state, { meta }) => {
        state.details[meta.arg] = pending;
      })
      .addCase(loadPost.fulfilled, (state, { meta }) => {
        state.details[meta.arg] = succeeded;
      })
      .addCase(loadPost.rejected, (state, { meta, error }) => {
        state.details[meta.arg] = failed(error.message);
      });
  },
});

export const postRequestsReducer = postRequestsSlice.reducer;
