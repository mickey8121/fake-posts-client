import {
  favoritesReducer,
  postLoaded,
  postsLoaded,
  postsReducer,
  toggleFavorite,
} from '@entities/post';
import { makePost } from '../../__fixtures__/post';

describe('favoritesReducer', () => {
  it('adds and removes an id', () => {
    const added = favoritesReducer([], toggleFavorite(2));
    expect(added).toEqual([2]);
    expect(favoritesReducer(added, toggleFavorite(2))).toEqual([]);
  });

  it('returns to the initial state after two toggles of any id', () => {
    const initial = [1, 3, 5];
    [1, 2, 3, 6].forEach(id => {
      const twice = favoritesReducer(
        favoritesReducer(initial, toggleFavorite(id)),
        toggleFavorite(id),
      );
      expect(twice).toEqual(initial);
    });
  });
});

describe('postsReducer', () => {
  const initial = postsReducer(undefined, { type: '@@init' });

  it('starts with nothing requested', () => {
    expect(initial).toEqual({
      ids: [],
      entities: {},
      listRequested: false,
      detailRequestedIds: [],
    });
  });

  it('normalizes the list by id and marks it requested', () => {
    const state = postsReducer(
      initial,
      postsLoaded([makePost(2), makePost(1)]),
    );
    expect(state.ids).toEqual([2, 1]);
    expect(state.entities[1]).toEqual(makePost(1));
    expect(state.listRequested).toBe(true);
  });

  it('records a loaded detail once', () => {
    const once = postsReducer(initial, postLoaded(makePost(4)));
    const twice = postsReducer(once, postLoaded(makePost(4)));
    expect(twice.detailRequestedIds).toEqual([4]);
    expect(twice.ids).toEqual([4]);
    expect(twice.listRequested).toBe(false);
  });
});
