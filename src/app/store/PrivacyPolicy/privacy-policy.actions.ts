import { createAction, props } from '@ngrx/store';

export const getLanguages = createAction('[PrivacyPolicy] Get Languages');

export const getLanguagesSuccess = createAction(
  '[PrivacyPolicy] Get Languages Success',
  props<{ languages: any }>()
);

export const getLanguagesFailure = createAction(
  '[PrivacyPolicy] Get Languages Failure',
  props<{ error: any }>()
);

export const getPrivacyPolicy = createAction(
  '[PrivacyPolicy] Get Privacy Policy',
  props<{ language?: string }>()
);

export const getPrivacyPolicySuccess = createAction(
  '[PrivacyPolicy] Get Privacy Policy Success',
  props<{ content: string }>()
);

export const getPrivacyPolicyFailure = createAction(
  '[PrivacyPolicy] Get Privacy Policy Failure',
  props<{ error: any }>()
);

export const updatePrivacyPolicy = createAction(
  '[PrivacyPolicy] Update Privacy Policy',
  props<{ payload: any; language?: string }>()
);

export const updatePrivacyPolicySuccess = createAction(
  '[PrivacyPolicy] Update Privacy Policy Success',
  props<{ response: any }>()
);

export const updatePrivacyPolicyFailure = createAction(
  '[PrivacyPolicy] Update Privacy Policy Failure',
  props<{ error: any }>()
);
