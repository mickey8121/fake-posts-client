import { createAppStore } from '@app/store';
import {
  loadPost,
  loadPosts,
  selectListRequest,
  selectPostById,
  selectPostRequest,
} from '@entities/post';
import type { PersistStorage } from '@shared/storage';

const memoryStorage = (): PersistStorage => {
  const data = new Map<string, string>();
  return {
    getItem: async key => data.get(key) ?? null,
    setItem: async (key, value) => {
      data.set(key, value);
    },
    removeItem: async key => {
      data.delete(key);
    },
  };
};

const dto = (id: number) => ({
  id,
  userId: 1,
  title: `title ${id}`,
  body: `body ${id}`,
});

const mockFetch = jest.fn();

const respondWith = (body: unknown) =>
  mockFetch.mockResolvedValueOnce({ ok: true, json: async () => body });

const newStore = () => createAppStore(memoryStorage()).store;

beforeEach(() => {
  mockFetch.mockReset();
  globalThis.fetch = mockFetch as unknown as typeof fetch;
});

describe('loadPosts', () => {
  it('loads and enriches the list once', async () => {
    const store = newStore();
    respondWith([dto(2), dto(1)]);

    await store.dispatch(loadPosts());
    await store.dispatch(loadPosts());

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const state = store.getState();
    expect(state.posts.listRequested).toBe(true);
    expect(selectListRequest(state).status).toBe('succeeded');
    expect(selectPostById(state, 1)).toMatchObject({
      thumbnailUrl: expect.stringMatching(/\/32\/32$/),
      imageUrl: expect.stringMatching(/\/300\/300$/),
    });
  });

  it('skips a duplicate dispatch while the request is in flight', async () => {
    const store = newStore();
    respondWith([dto(1)]);

    await Promise.all([
      store.dispatch(loadPosts()),
      store.dispatch(loadPosts()),
    ]);

    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('leaves the flag unset on failure and succeeds on retry', async () => {
    const store = newStore();
    mockFetch.mockRejectedValueOnce(new Error('offline'));

    await store.dispatch(loadPosts());
    let state = store.getState();
    expect(state.posts.listRequested).toBe(false);
    expect(selectListRequest(state)).toEqual({
      status: 'failed',
      error: 'offline',
    });

    respondWith([dto(1)]);
    await store.dispatch(loadPosts());
    state = store.getState();
    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(state.posts.listRequested).toBe(true);
    expect(selectListRequest(state)).toEqual({
      status: 'succeeded',
      error: null,
    });
  });
});

describe('loadPost', () => {
  it('requests each post once and keeps its picture', async () => {
    const store = newStore();
    respondWith([dto(1), dto(2)]);
    await store.dispatch(loadPosts());
    const before = selectPostById(store.getState(), 2);

    respondWith({ ...dto(2), title: 'fresh' });
    await store.dispatch(loadPost(2));
    await store.dispatch(loadPost(2));

    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockFetch.mock.calls[1][0]).toMatch(/\/posts\/2$/);
    const after = selectPostById(store.getState(), 2);
    expect(after?.title).toBe('fresh');
    expect(after?.thumbnailUrl).toBe(before?.thumbnailUrl);
    expect(after?.imageUrl).toBe(before?.imageUrl);
    expect(selectPostRequest(store.getState(), 2).status).toBe('succeeded');
  });

  it('tracks status per post and allows a retry after a failure', async () => {
    const store = newStore();
    mockFetch.mockRejectedValueOnce(new Error('offline'));

    await store.dispatch(loadPost(5));
    expect(store.getState().posts.detailRequestedIds).toEqual([]);
    expect(selectPostRequest(store.getState(), 5).status).toBe('failed');
    expect(selectPostRequest(store.getState(), 6).status).toBe('idle');

    respondWith(dto(5));
    await store.dispatch(loadPost(5));
    expect(store.getState().posts.detailRequestedIds).toEqual([5]);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
});
