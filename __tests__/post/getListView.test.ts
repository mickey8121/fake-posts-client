import { getListView, type RequestState } from '@entities/post';

const request = (status: RequestState['status']): RequestState => ({
  status,
  error: status === 'failed' ? 'Network request failed' : null,
});

describe('getListView', () => {
  it.each(['idle', 'pending'] as const)(
    'shows the loader while the request is %s and nothing is loaded',
    status => {
      expect(getListView(request(status), 0)).toBe('loading');
    },
  );

  it('shows the error when the request failed and nothing is loaded', () => {
    expect(getListView(request('failed'), 0)).toBe('error');
  });

  it.each(['idle', 'pending', 'succeeded', 'failed'] as const)(
    'shows the list whenever posts are in the store (request %s)',
    status => {
      expect(getListView(request(status), 100)).toBe('ready');
    },
  );
});
