import {
  AUTH_START,
  AUTH_SUCCESS,
  AUTH_FAIL,
  AUTH_LOGOUT,
  AUTH_CLEAR_ERRORS
} from "../actions/authActions";
import { updateObject } from "../utility";
import { SerializedError } from "../utils/errorSerializer";

interface AuthState {
  token: string | null;
  error: SerializedError | null;
  loading: boolean;
}

interface AuthAction {
  type: string;
  token?: string | null;
  error?: SerializedError;
}

const initialState: AuthState = {
  token: localStorage.getItem("token") || localStorage.getItem("accessToken"),
  error: null,
  loading: false
};

export default function authReducer(
  state: AuthState = initialState,
  action: AuthAction
): AuthState {
  switch (action.type) {
    case AUTH_START:
      return updateObject(state, { error: null, loading: true });

    case AUTH_SUCCESS:
      return updateObject(state, { token: action.token, error: null, loading: false });

    case AUTH_FAIL:
      return updateObject(state, { error: action.error, loading: false });

    case AUTH_LOGOUT:
      return updateObject(state, { token: null });

    case AUTH_CLEAR_ERRORS:
      return updateObject(state, { error: null, loading: false });

    default:
      return state;
  }
}