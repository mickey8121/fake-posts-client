import { useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { ThunkDispatch, UnknownAction } from '@reduxjs/toolkit';
import { getListView } from '../lib/getListView';
import {
  selectFavoriteIds,
  selectListRequest,
  selectSortedPosts,
} from './selectors';
import { loadPosts } from './thunks';
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
