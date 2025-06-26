import { configureStore } from '@reduxjs/toolkit';
import { rootReducer } from './reducers';
import { loadState, saveState } from '../localStorage';

const preloadedState = loadState();

export const store = configureStore({
  reducer: rootReducer,
  preloadedState,
  devTools: import.meta.env.MODE !== 'production',
});

store.subscribe(() => {
  saveState(store.getState());
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export default store;
