import { createReducer, on } from '@ngrx/store';
import {
  getAppVersion,
  getAppVersionSuccess,
  getAppVersionFailure,
  updateAppVersion,
  updateAppVersionSuccess,
  updateAppVersionFailure,
} from './app-version.actions';

export const appVersionFeatureKey = 'appVersion';

export interface AppVersionState {
  config: any;
  loading: boolean;
  saving: boolean;
  error: any;
}

const initialState: AppVersionState = {
  config: null,
  loading: false,
  saving: false,
  error: null,
};

export const appVersionReducer = createReducer(
  initialState,
  on(getAppVersion, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(getAppVersionSuccess, (state, action) => ({
    ...state,
    config: action.config,
    loading: false,
    error: null,
  })),
  on(getAppVersionFailure, (state, action) => ({
    ...state,
    loading: false,
    error: action.error,
  })),
  on(updateAppVersion, (state) => ({
    ...state,
    saving: true,
    error: null,
  })),
  on(updateAppVersionSuccess, (state, action) => ({
    ...state,
    config: action.config,
    saving: false,
    error: null,
  })),
  on(updateAppVersionFailure, (state, action) => ({
    ...state,
    saving: false,
    error: action.error,
  }))
);

const selectAppVersionMeta = (state: any): AppVersionState => state[appVersionFeatureKey];

export const selectAppVersionConfig = (state: any) => selectAppVersionMeta(state)?.config || null;
export const selectAppVersionLoading = (state: any) => selectAppVersionMeta(state)?.loading || false;
export const selectAppVersionSaving = (state: any) => selectAppVersionMeta(state)?.saving || false;
export const selectAppVersionError = (state: any) => selectAppVersionMeta(state)?.error || null;
