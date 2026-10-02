import { combineReducers, configureStore } from '@reduxjs/toolkit';
import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
} from 'redux-persist';
import {
  favoritesReducer,
  postRequestsReducer,
  postsReducer,
} from '@entities/post';
import { mmkvStorage, type PersistStorage } from '@shared/storage';

const rootReducer = combineReducers({
  posts: postsReducer,
  favorites: favoritesReducer,
  postRequests: postRequestsReducer,
});

export const createAppStore = (storage: PersistStorage) => {
  const store = configureStore({
    reducer: persistReducer(
      {
        key: 'root',
        version: 1,
        // MMKV reads are synchronous, so the rehydration fallback timer is not needed
        timeout: 0,
        storage,
        whitelist: ['posts', 'favorites'],
      },
      rootReducer,
    ),
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
      }),
  });
  return { store, persistor: persistStore(store) };
};

export const { store, persistor } = createAppStore(mmkvStorage);

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
