import { getDetailView, type RequestState } from '@entities/post';

const request = (status: RequestState['status']): RequestState => ({
  status,
  error: status === 'failed' ? 'Network request failed' : null,
});

describe('getDetailView', () => {
  it.each(['idle', 'pending'] as const)(
    'shows the loader while the request is %s and the detail is not stored',
    status => {
      expect(getDetailView(request(status), false)).toBe('loading');
    },
  );

  it('shows the error when the request failed and the detail is not stored', () => {
    expect(getDetailView(request('failed'), false)).toBe('error');
  });

  it.each(['idle', 'pending', 'succeeded', 'failed'] as const)(
    'shows the post once the detail is stored (request %s)',
    status => {
      expect(getDetailView(request(status), true)).toBe('ready');
    },
  );
});
