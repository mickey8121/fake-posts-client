import { REQUEST_TIMEOUT_MS, request } from '@shared/api';

const mockFetch = jest.fn();

beforeEach(() => {
  jest.useFakeTimers();
  mockFetch.mockReset();
  globalThis.fetch = mockFetch as unknown as typeof fetch;
});

afterEach(() => {
  jest.useRealTimers();
});

describe('request', () => {
  it('returns the parsed json', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => [1, 2] });
    await expect(request('/posts')).resolves.toEqual([1, 2]);
    expect(mockFetch.mock.calls[0][0]).toBe(
      'https://jsonplaceholder.typicode.com/posts',
    );
  });

  it('fails on a non-2xx status', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 500 });
    await expect(request('/posts')).rejects.toThrow(
      'Request failed with status 500',
    );
  });

  it('aborts and fails after the timeout', async () => {
    mockFetch.mockImplementation(
      (_url: string, { signal }: { signal: AbortSignal }) =>
        new Promise((_resolve, reject) => {
          signal.addEventListener('abort', () => reject(new Error('aborted')));
        }),
    );

    const outcome = request('/posts').then(
      () => 'resolved',
      (error: Error) => error.message,
    );
    jest.advanceTimersByTime(REQUEST_TIMEOUT_MS - 1);
    expect(mockFetch.mock.calls[0][1].signal.aborted).toBe(false);
    jest.advanceTimersByTime(1);
    expect(await outcome).toMatch(/timed out/);
  });
});
