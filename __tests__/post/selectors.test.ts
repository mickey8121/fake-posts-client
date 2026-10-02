import {
  favoritesReducer,
  postsLoaded,
  postsReducer,
  selectDetailRequested,
  selectIsFavorite,
  selectSortedPosts,
  toggleFavorite,
  type PostRootState,
} from '@entities/post';
import { makePost } from '../../__fixtures__/post';

const buildState = (ids: number[], favorites: number[]): PostRootState => ({
  posts: postsReducer(undefined, postsLoaded(ids.map(makePost))),
  favorites: favorites.reduce(
    (state, id) => favoritesReducer(state, toggleFavorite(id)),
    favoritesReducer(undefined, { type: '@@init' }),
  ),
});

const sortedIds = (state: PostRootState) =>
  selectSortedPosts(state).map(post => post.id);

describe('selectSortedPosts', () => {
  it('orders by id when nothing is a favorite', () => {
    expect(sortedIds(buildState([3, 1, 2], []))).toEqual([1, 2, 3]);
  });

  it('puts favorites first, both groups ordered by id', () => {
    expect(sortedIds(buildState([5, 4, 3, 2, 1], [4, 2]))).toEqual([
      2, 4, 1, 3, 5,
    ]);
  });

  it('ignores the order in which favorites were added', () => {
    const a = buildState([1, 2, 3, 4], [4, 2]);
    const b = buildState([1, 2, 3, 4], [2, 4]);
    expect(sortedIds(a)).toEqual(sortedIds(b));
  });

  it('ignores favorite ids that have no post', () => {
    expect(sortedIds(buildState([1, 2], [9]))).toEqual([1, 2]);
  });

  it('does not mutate the posts cache order', () => {
    const state = buildState([3, 1, 2], [2]);
    selectSortedPosts(state);
    expect(state.posts.ids).toEqual([3, 1, 2]);
  });

  it('is memoized on posts and favorites', () => {
    const state = buildState([1, 2, 3], [2]);
    const first = selectSortedPosts(state);

    expect(selectSortedPosts(state)).toBe(first);
    expect(selectSortedPosts({ ...state })).toBe(first);
    expect(
      selectSortedPosts({
        ...state,
        posts: { ...state.posts, listRequested: false },
      }),
    ).toBe(first);
  });

  it('recomputes when favorites change', () => {
    const state = buildState([1, 2, 3], [2]);
    const first = selectSortedPosts(state);
    const next = selectSortedPosts({
      ...state,
      favorites: favoritesReducer(state.favorites, toggleFavorite(3)),
    });
    expect(next).not.toBe(first);
    expect(next.map(post => post.id)).toEqual([2, 3, 1]);
  });
});

describe('simple selectors', () => {
  it('reads favorite and detail flags', () => {
    const state = buildState([1, 2], [2]);
    expect(selectIsFavorite(state, 2)).toBe(true);
    expect(selectIsFavorite(state, 1)).toBe(false);
    expect(selectDetailRequested(state, 1)).toBe(false);
  });
});
