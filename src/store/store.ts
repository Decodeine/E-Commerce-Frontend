import { configureStore } from '@reduxjs/toolkit';
import { rootReducer } from './reducers';
import { loadState, saveState } from '../localStorage';

const preloadedState = loadState();

export const store = configureStore({
  reducer: rootReducer,
  preloadedState,
  devTools: import.meta.env.MODE !== 'production',
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types that might contain functions or non-serializable data
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.timestamp', 'meta.baseQueryMeta', 'error'],
        // Ignore these paths in the state
        ignoredPaths: ['store.error', 'auth.error'],
      },
    }),
});

store.subscribe(() => {
  saveState(store.getState());
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export default store;
