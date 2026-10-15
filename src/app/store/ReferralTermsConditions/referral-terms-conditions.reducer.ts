import { createReducer, on } from '@ngrx/store';
import {
  getLanguagesSuccess,
  getLanguagesFailure,
  getReferralTermsConditions,
  getReferralTermsConditionsSuccess,
  getReferralTermsConditionsFailure,
  updateReferralTermsConditions,
  updateReferralTermsConditionsSuccess,
  updateReferralTermsConditionsFailure,
} from './referral-terms-conditions.actions';

export const referralTermsConditionsFeatureKey = 'referralTermsConditions';

export interface ReferralTermsConditionsState {
  languages: any[];
  content: string;
  loading: boolean;
  saving: boolean;
  error: any;
}

const initialState: ReferralTermsConditionsState = {
  languages: [],
  content: '',
  loading: false,
  saving: false,
  error: null,
};

export const referralTermsConditionsReducer = createReducer(
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
  on(getReferralTermsConditions, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(getReferralTermsConditionsSuccess, (state, action) => ({
    ...state,
    content: action.content,
    loading: false,
    error: null,
  })),
  on(getReferralTermsConditionsFailure, (state, action) => ({
    ...state,
    loading: false,
    error: action.error,
  })),
  on(updateReferralTermsConditions, (state) => ({
    ...state,
    saving: true,
    error: null,
  })),
  on(updateReferralTermsConditionsSuccess, (state) => ({
    ...state,
    saving: false,
    error: null,
  })),
  on(updateReferralTermsConditionsFailure, (state, action) => ({
    ...state,
    saving: false,
    error: action.error,
  }))
);

const selectReferralTermsConditionsMeta = (state: any): ReferralTermsConditionsState => state[referralTermsConditionsFeatureKey];

export const selectReferralTermsConditionsLanguages = (state: any) => selectReferralTermsConditionsMeta(state)?.languages || [];
export const selectReferralTermsConditionsContent = (state: any) => selectReferralTermsConditionsMeta(state)?.content || '';
export const selectReferralTermsConditionsLoading = (state: any) => selectReferralTermsConditionsMeta(state)?.loading || false;
export const selectReferralTermsConditionsSaving = (state: any) => selectReferralTermsConditionsMeta(state)?.saving || false;
export const selectReferralTermsConditionsError = (state: any) => selectReferralTermsConditionsMeta(state)?.error || null;
