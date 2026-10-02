import { createMMKV } from 'react-native-mmkv';
import { createAppStore } from '@app/store';
import {
  loadPost,
  loadPosts,
  selectSortedPosts,
  toggleFavorite,
} from '@entities/post';
import { createMmkvStorage } from '@shared/storage';
import { makePost } from '../../__fixtures__/post';

const rehydrate = (storage: ReturnType<typeof createMmkvStorage>) => {
  const app = createAppStore(storage);
  return new Promise<typeof app>(resolve => {
    const unsubscribe = app.persistor.subscribe(() => {
      if (app.persistor.getState().bootstrapped) {
        unsubscribe();
        resolve(app);
      }
    });
  });
};

describe('persistence', () => {
  it('restores written state in a fresh store', async () => {
    const storage = createMmkvStorage(createMMKV({ id: 'persistence-test' }));

    const first = await rehydrate(storage);
    first.store.dispatch(
      loadPosts.fulfilled([makePost(2), makePost(1)], 'request'),
    );
    first.store.dispatch(loadPost.fulfilled(makePost(3), 'request', 3));
    first.store.dispatch(toggleFavorite(2));
    await first.persistor.flush();

    const second = await rehydrate(storage);
    const state = second.store.getState();

    expect(state.favorites).toEqual([2]);
    expect(state.posts.listRequested).toBe(true);
    expect(state.posts.detailRequestedIds).toEqual([3]);
    expect(selectSortedPosts(state).map(post => post.id)).toEqual([2, 1, 3]);
  });

  it('does not persist request status', async () => {
    const storage = createMmkvStorage(createMMKV({ id: 'status-test' }));

    const first = await rehydrate(storage);
    first.store.dispatch(loadPosts.rejected(new Error('boom'), 'request'));
    await first.persistor.flush();
    expect(first.store.getState().postRequests.list.status).toBe('failed');

    const second = await rehydrate(storage);
    expect(second.store.getState().postRequests.list).toEqual({
      status: 'idle',
      error: null,
    });
  });
});
