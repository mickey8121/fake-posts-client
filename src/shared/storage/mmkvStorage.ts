import { createMMKV, type MMKV } from 'react-native-mmkv';

export type PersistStorage = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
};

export const createMmkvStorage = (mmkv: MMKV): PersistStorage => ({
  getItem: key => Promise.resolve(mmkv.getString(key) ?? null),
  setItem: (key, value) => {
    mmkv.set(key, value);
    return Promise.resolve();
  },
  removeItem: key => {
    mmkv.remove(key);
    return Promise.resolve();
  },
});

export const mmkvStorage = createMmkvStorage(createMMKV({ id: 'app-state' }));
