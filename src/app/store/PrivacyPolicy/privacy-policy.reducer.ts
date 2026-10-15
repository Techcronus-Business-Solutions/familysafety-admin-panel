import { createReducer, on } from '@ngrx/store';
import {
  getLanguagesSuccess,
  getLanguagesFailure,
  getPrivacyPolicy,
  getPrivacyPolicySuccess,
  getPrivacyPolicyFailure,
  updatePrivacyPolicy,
  updatePrivacyPolicySuccess,
  updatePrivacyPolicyFailure,
} from './privacy-policy.actions';

export const privacyPolicyFeatureKey = 'privacyPolicy';

export interface PrivacyPolicyState {
  languages: any[];
  content: string;
  loading: boolean;
  saving: boolean;
  error: any;
}

const initialState: PrivacyPolicyState = {
  languages: [],
  content: '',
  loading: false,
  saving: false,
  error: null,
};

export const privacyPolicyReducer = createReducer(
  initialState,
  on(getLanguagesSuccess, (state, action) => ({
    ...state,
    languages: Array.isArray(action.languages) ? action.languages : [],
    error: null,
  })),
  on(getLanguagesFailure, (state, action) => ({
    ...state,
    error: action.error,
  })),
  on(getPrivacyPolicy, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(getPrivacyPolicySuccess, (state, action) => ({
    ...state,
    content: action.content,
    loading: false,
    error: null,
  })),
  on(getPrivacyPolicyFailure, (state, action) => ({
    ...state,
    loading: false,
    error: action.error,
  })),
  on(updatePrivacyPolicy, (state) => ({
    ...state,
    saving: true,
    error: null,
  })),
  on(updatePrivacyPolicySuccess, (state) => ({
    ...state,
    saving: false,
    error: null,
  })),
  on(updatePrivacyPolicyFailure, (state, action) => ({
    ...state,
    saving: false,
    error: action.error,
  }))
);

const selectPrivacyPolicyMeta = (state: any): PrivacyPolicyState => state[privacyPolicyFeatureKey];

export const selectPrivacyPolicyLanguages = (state: any) => selectPrivacyPolicyMeta(state)?.languages || [];
export const selectPrivacyPolicyContent = (state: any) => selectPrivacyPolicyMeta(state)?.content || '';
export const selectPrivacyPolicyLoading = (state: any) => selectPrivacyPolicyMeta(state)?.loading || false;
export const selectPrivacyPolicySaving = (state: any) => selectPrivacyPolicyMeta(state)?.saving || false;
export const selectPrivacyPolicyError = (state: any) => selectPrivacyPolicyMeta(state)?.error || null;
