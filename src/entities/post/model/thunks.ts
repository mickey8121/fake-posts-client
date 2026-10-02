import { createAsyncThunk } from '@reduxjs/toolkit';
import { getPost, getPosts } from '../api/postApi';
import {
  selectDetailRequested,
  selectListRequest,
  selectListRequested,
  selectPostRequest,
} from './selectors';
import type { Post, PostRootState } from './types';

const createThunk = createAsyncThunk.withTypes<{ state: PostRootState }>();

export const loadPosts = createThunk<Post[]>('posts/loadList', getPosts, {
  condition: (_, { getState }) => {
    const state = getState();
    return (
      !selectListRequested(state) &&
      selectListRequest(state).status !== 'pending'
    );
  },
});

export const loadPost = createThunk<Post, number>('posts/loadOne', getPost, {
  condition: (id, { getState }) => {
    const state = getState();
    return (
      !selectDetailRequested(state, id) &&
      selectPostRequest(state, id).status !== 'pending'
    );
  },
});
