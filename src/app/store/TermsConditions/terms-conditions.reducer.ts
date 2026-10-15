import { createReducer, on } from '@ngrx/store';
import {
  getLanguagesSuccess,
  getLanguagesFailure,
  getTermsConditions,
  getTermsConditionsSuccess,
  getTermsConditionsFailure,
  updateTermsConditions,
  updateTermsConditionsSuccess,
  updateTermsConditionsFailure,
} from './terms-conditions.actions';

export const termsConditionsFeatureKey = 'termsConditions';

export interface TermsConditionsState {
  languages: any[];
  content: string;
  loading: boolean;
  saving: boolean;
  error: any;
}

const initialState: TermsConditionsState = {
  languages: [],
  content: '',
  loading: false,
  saving: false,
  error: null,
};

export const termsConditionsReducer = createReducer(
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
  on(getTermsConditions, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(getTermsConditionsSuccess, (state, action) => ({
    ...state,
    content: action.content,
    loading: false,
    error: null,
  })),
  on(getTermsConditionsFailure, (state, action) => ({
    ...state,
    loading: false,
    error: action.error,
  })),
  on(updateTermsConditions, (state) => ({
    ...state,
    saving: true,
    error: null,
  })),
  on(updateTermsConditionsSuccess, (state) => ({
    ...state,
    saving: false,
    error: null,
  })),
  on(updateTermsConditionsFailure, (state, action) => ({
    ...state,
    saving: false,
    error: action.error,
  }))
);

const selectTermsConditionsMeta = (state: any): TermsConditionsState => state[termsConditionsFeatureKey];

export const selectTermsConditionsLanguages = (state: any) => selectTermsConditionsMeta(state)?.languages || [];
export const selectTermsConditionsContent = (state: any) => selectTermsConditionsMeta(state)?.content || '';
export const selectTermsConditionsLoading = (state: any) => selectTermsConditionsMeta(state)?.loading || false;
export const selectTermsConditionsSaving = (state: any) => selectTermsConditionsMeta(state)?.saving || false;
export const selectTermsConditionsError = (state: any) => selectTermsConditionsMeta(state)?.error || null;
