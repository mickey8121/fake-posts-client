import type { RequestState } from '../model/types';

export type DetailView = 'loading' | 'error' | 'ready';

export const getDetailView = (
  request: RequestState,
  isRequested: boolean,
): DetailView => {
  if (isRequested) {
    return 'ready';
  }
  return request.status === 'failed' ? 'error' : 'loading';
};
