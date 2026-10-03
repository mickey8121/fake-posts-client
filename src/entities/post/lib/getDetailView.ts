import type { DetailView, RequestState } from '../model/types';

export const getDetailView = (
  request: RequestState,
  isRequested: boolean,
): DetailView => {
  if (isRequested) {
    return 'ready';
  }
  return request.status === 'failed' ? 'error' : 'loading';
};
