import { createAction, props } from '@ngrx/store';

export const getLanguages = createAction('[ReferralTermsConditions] Get Languages');

export const getLanguagesSuccess = createAction(
  '[ReferralTermsConditions] Get Languages Success',
  props<{ languages: any }>()
);

export const getLanguagesFailure = createAction(
  '[ReferralTermsConditions] Get Languages Failure',
  props<{ error: any }>()
);

export const getReferralTermsConditions = createAction(
  '[ReferralTermsConditions] Get Referral Terms Conditions',
  props<{ language?: string }>()
);

export const getReferralTermsConditionsSuccess = createAction(
  '[ReferralTermsConditions] Get Referral Terms Conditions Success',
  props<{ content: string }>()
);

export const getReferralTermsConditionsFailure = createAction(
  '[ReferralTermsConditions] Get Referral Terms Conditions Failure',
  props<{ error: any }>()
);

export const updateReferralTermsConditions = createAction(
  '[ReferralTermsConditions] Update Referral Terms Conditions',
  props<{ payload: any; language?: string }>()
);

export const updateReferralTermsConditionsSuccess = createAction(
  '[ReferralTermsConditions] Update Referral Terms Conditions Success',
  props<{ response: any }>()
);

export const updateReferralTermsConditionsFailure = createAction(
  '[ReferralTermsConditions] Update Referral Terms Conditions Failure',
  props<{ error: any }>()
);
