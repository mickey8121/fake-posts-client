import type { RequestState } from '../model/types';

export type ListView = 'loading' | 'error' | 'ready';

export const getListView = (
  request: RequestState,
  postCount: number,
): ListView => {
  if (postCount > 0) {
    return 'ready';
  }
  return request.status === 'failed' ? 'error' : 'loading';
};
