import { combineReducers } from "redux";
import authReducer from "./authReducer";
import storeReducer from "./storeReducer";

export const rootReducer = combineReducers({
  auth: authReducer,
  store: storeReducer
});