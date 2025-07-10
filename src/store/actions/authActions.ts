import axios from "axios";
import { API_PATH } from "../../backend_url";
import { ThunkAction, ThunkDispatch } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { AnyAction } from 'redux';
import { serializeError, SerializedError } from '../utils/errorSerializer';

// Action Types
export const AUTH_START = "AUTH_START";
export const AUTH_SUCCESS = "AUTH_SUCCESS";
export const AUTH_FAIL = "AUTH_FAIL";
export const AUTH_LOGOUT = "AUTH_LOGOUT";
export const AUTH_CLEAR_ERRORS = "AUTH_CLEAR_ERRORS";

// Action Creators
export const authStart = () => ({
  type: AUTH_START
});

export const authSuccess = (token: string, expirationDate: string | Date) => {
  localStorage.setItem("token", token);
  localStorage.setItem("expirationDate", expirationDate.toString());
  return {
    type: AUTH_SUCCESS,
    token
  };
};

export const authFail = (error: SerializedError) => ({
  type: AUTH_FAIL,
  error
});

export const authLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("expirationDate");
  localStorage.removeItem("refreshToken");
  return {
    type: AUTH_LOGOUT
  };
};

export const authClearErrors = () => ({
  type: AUTH_CLEAR_ERRORS
});

export const checkAuthTimeout = (
  expirationTime: number
): ThunkAction<void, RootState, unknown, AnyAction> => {
  return (dispatch: ThunkDispatch<RootState, unknown, AnyAction>) => {
    setTimeout(() => {
      dispatch(authLogout());
    }, expirationTime * 1000);
  };
};

export const authLogin = (
  email: string,
  password: string
): ThunkAction<void, RootState, unknown, AnyAction> => {
  return async (dispatch: ThunkDispatch<RootState, unknown, AnyAction>) => {
    dispatch(authStart());
    try {
      // Use JWT token endpoint instead of dj_rest_auth
      const res = await axios.post(`${API_PATH}accounts/auth/token/`, {
        email,
        password
      });
      
      console.log('🔐 Login response:', res.data);
      
      // JWT returns 'access' and 'refresh' tokens
      const token = res.data.access;
      const refreshToken = res.data.refresh;
      
      // Store both tokens
      localStorage.setItem("refreshToken", refreshToken);
      
      const expirationDate = new Date(new Date().getTime() + 3600 * 1000);
      dispatch(authSuccess(token, expirationDate));
      dispatch(checkAuthTimeout(3600));
    } catch (err) {
      console.error('🔐 Login error:', err);
      dispatch(authFail(serializeError(err)));
    }
  };
};

export const authSignup = (
  email: string,
  password1: string,
  password2: string,
  first_name: string,
  last_name: string
): ThunkAction<void, RootState, unknown, AnyAction> => {
  return async (dispatch: ThunkDispatch<RootState, unknown, AnyAction>) => {
    dispatch(authStart());
    try {
      // First register the user
      await axios.post(`${API_PATH}accounts/auth/register/`, {
        email,
        password1,
        password2,
        first_name,
        last_name
      });
      
      // Then login to get JWT tokens
      const loginRes = await axios.post(`${API_PATH}accounts/auth/token/`, {
        email,
        password: password1
      });
      
      console.log('🔐 Signup/Login response:', loginRes.data);
      
      const token = loginRes.data.access;
      const refreshToken = loginRes.data.refresh;
      
      localStorage.setItem("refreshToken", refreshToken);
      
      const expirationDate = new Date(new Date().getTime() + 3600 * 1000);
      dispatch(authSuccess(token, expirationDate));
      dispatch(checkAuthTimeout(3600));
    } catch (err) {
      console.error('🔐 Signup error:', err);
      dispatch(authFail(serializeError(err)));
    }
  };
};

export const authCheckState = ():
  ThunkAction<void, RootState, unknown, AnyAction> => {
  return (dispatch: ThunkDispatch<RootState, unknown, AnyAction>) => {
    const token = localStorage.getItem("token");
    console.log('🔍 Auth check state - token from localStorage:', token ? `${token.substring(0, 20)}...` : 'null');
    
    if (!token) {
      console.log('❌ No token found, logging out');
      dispatch(authLogout());
    } else {
      const expirationDateStr = localStorage.getItem("expirationDate");
      if (!expirationDateStr) {
        console.log('❌ No expiration date found, logging out');
        dispatch(authLogout());
        return;
      }
      const expirationDate = new Date(expirationDateStr);
      console.log('🔍 Token expiration check:', {
        expirationDate: expirationDate.toISOString(),
        currentDate: new Date().toISOString(),
        isExpired: expirationDate <= new Date(),
        timeRemaining: (expirationDate.getTime() - new Date().getTime()) / 1000 / 60 + ' minutes'
      });
      
      if (expirationDate <= new Date()) {
        console.log('❌ Token expired, logging out');
        dispatch(authLogout());
      } else {
        console.log('✅ Token valid, setting auth success');
        dispatch(authSuccess(token, expirationDate));
        dispatch(
          checkAuthTimeout(
            (expirationDate.getTime() - new Date().getTime()) / 1000
          )
        );
      }
    }
  };
};

export const authRefreshToken = ():
  ThunkAction<Promise<boolean>, RootState, unknown, AnyAction> => {
  return async (dispatch: ThunkDispatch<RootState, unknown, AnyAction>) => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      dispatch(authLogout());
      return false;
    }

    try {
      const res = await axios.post(`${API_PATH}accounts/auth/token/refresh/`, {
        refresh: refreshToken
      });
      
      const newToken = res.data.access;
      const expirationDate = new Date(new Date().getTime() + 3600 * 1000);
      
      dispatch(authSuccess(newToken, expirationDate));
      dispatch(checkAuthTimeout(3600));
      
      console.log('🔄 Token refreshed successfully');
      return true;
    } catch (err) {
      console.error('🔄 Token refresh failed:', err);
      dispatch(authLogout());
      return false;
    }
  };
};