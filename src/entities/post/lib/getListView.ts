import type { ListView, RequestState } from '../model/types';

export const getListView = (
  request: RequestState,
  postCount: number,
): ListView => {
  if (postCount > 0) {
    return 'ready';
  }
  return request.status === 'failed' ? 'error' : 'loading';
};
