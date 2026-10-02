import { createMMKV } from 'react-native-mmkv';
import { createAppStore } from '@app/store';
import {
  postLoaded,
  postsLoaded,
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
    first.store.dispatch(postsLoaded([makePost(2), makePost(1)]));
    first.store.dispatch(postLoaded(makePost(3)));
    first.store.dispatch(toggleFavorite(2));
    await first.persistor.flush();

    const second = await rehydrate(storage);
    const state = second.store.getState();

    expect(state.favorites).toEqual([2]);
    expect(state.posts.listRequested).toBe(true);
    expect(state.posts.detailRequestedIds).toEqual([3]);
    expect(selectSortedPosts(state).map(post => post.id)).toEqual([2, 1, 3]);
  });
});
