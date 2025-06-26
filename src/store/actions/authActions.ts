import axios from "axios";
import { API_PATH } from "../../backend_url";
import { ThunkAction, ThunkDispatch } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { AnyAction } from 'redux';

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

export const authFail = (error: any) => ({
  type: AUTH_FAIL,
  error
});

export const authLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("expirationDate");
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
      const res = await axios.post(`${API_PATH}accounts/login/`, {
        email,
        password
      });
      const token = res.data.access;
      const expirationDate = new Date(new Date().getTime() + 3600 * 1000);
      dispatch(authSuccess(token, expirationDate));
      dispatch(checkAuthTimeout(3600));
    } catch (err) {
      dispatch(authFail(err));
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
      const res = await axios.post(`${API_PATH}accounts/register/`, {
        email,
        password1,
        password2,
        first_name,
        last_name
      });
      const token = res.data.access;
      const expirationDate = new Date(new Date().getTime() + 3600 * 1000);
      dispatch(authSuccess(token, expirationDate));
      dispatch(checkAuthTimeout(3600));
    } catch (err) {
      dispatch(authFail(err));
    }
  };
};

export const authCheckState = ():
  ThunkAction<void, RootState, unknown, AnyAction> => {
  return (dispatch: ThunkDispatch<RootState, unknown, AnyAction>) => {
    const token = localStorage.getItem("token");
    if (!token) {
      dispatch(authLogout());
    } else {
      const expirationDateStr = localStorage.getItem("expirationDate");
      if (!expirationDateStr) {
        dispatch(authLogout());
        return;
      }
      const expirationDate = new Date(expirationDateStr);
      if (expirationDate <= new Date()) {
        dispatch(authLogout());
      } else {
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