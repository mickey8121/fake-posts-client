import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { FavoritesState } from './types';

const initialState: FavoritesState = [];

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    toggleFavorite: (state, { payload: id }: PayloadAction<number>) => {
      const index = state.indexOf(id);
      if (index === -1) {
        state.push(id);
        state.sort((a, b) => a - b);
      } else {
        state.splice(index, 1);
      }
    },
  },
});

export const { toggleFavorite } = favoritesSlice.actions;
export const favoritesReducer = favoritesSlice.reducer;
