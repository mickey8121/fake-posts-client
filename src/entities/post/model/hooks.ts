import { useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { ThunkDispatch, UnknownAction } from '@reduxjs/toolkit';
import { getDetailView } from '../lib/getDetailView';
import { getListView } from '../lib/getListView';
import { toggleFavorite } from './favoritesSlice';
import {
  selectDetailRequested,
  selectFavoriteIds,
  selectIsFavorite,
  selectListRequest,
  selectPostById,
  selectPostRequest,
  selectSortedPosts,
} from './selectors';
import { loadPost, loadPosts } from './thunks';
import type { PostRootState } from './types';

const usePostDispatch =
  useDispatch.withTypes<
    ThunkDispatch<PostRootState, undefined, UnknownAction>
  >();
const usePostSelector = useSelector.withTypes<PostRootState>();

export const usePostList = () => {
  const dispatch = usePostDispatch();
  const posts = usePostSelector(selectSortedPosts);
  const favoriteIds = usePostSelector(selectFavoriteIds);
  const request = usePostSelector(selectListRequest);

  const refetch = useCallback(() => {
    dispatch(loadPosts());
  }, [dispatch]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const favoriteIdSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);

  return {
    posts,
    favoriteIds: favoriteIdSet,
    view: getListView(request, posts.length),
    error: request.error,
    refetch,
  };
};

export const usePost = (id: number) => {
  const dispatch = usePostDispatch();
  const post = usePostSelector(state => selectPostById(state, id));
  const isRequested = usePostSelector(state =>
    selectDetailRequested(state, id),
  );
  const request = usePostSelector(state => selectPostRequest(state, id));

  const refetch = useCallback(() => {
    dispatch(loadPost(id));
  }, [dispatch, id]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return {
    post,
    view: getDetailView(request, isRequested),
    error: request.error,
    refetch,
  };
};

export const useIsFavorite = (id: number) =>
  usePostSelector(state => selectIsFavorite(state, id));

export const useToggleFavorite = (id: number) => {
  const dispatch = usePostDispatch();

  return useCallback(() => {
    dispatch(toggleFavorite(id));
  }, [dispatch, id]);
};
