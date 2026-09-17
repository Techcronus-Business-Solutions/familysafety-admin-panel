import { createAction, props } from '@ngrx/store';

export const getLanguages = createAction('[TermsConditions] Get Languages');

export const getLanguagesSuccess = createAction(
  '[TermsConditions] Get Languages Success',
  props<{ languages: any }>()
);

export const getLanguagesFailure = createAction(
  '[TermsConditions] Get Languages Failure',
  props<{ error: any }>()
);

export const getTermsConditions = createAction(
  '[TermsConditions] Get Terms Conditions',
  props<{ language?: string }>()
);

export const getTermsConditionsSuccess = createAction(
  '[TermsConditions] Get Terms Conditions Success',
  props<{ content: string }>()
);

export const getTermsConditionsFailure = createAction(
  '[TermsConditions] Get Terms Conditions Failure',
  props<{ error: any }>()
);

export const updateTermsConditions = createAction(
  '[TermsConditions] Update Terms Conditions',
  props<{ payload: any; language?: string }>()
);

export const updateTermsConditionsSuccess = createAction(
  '[TermsConditions] Update Terms Conditions Success',
  props<{ response: any }>()
);

export const updateTermsConditionsFailure = createAction(
  '[TermsConditions] Update Terms Conditions Failure',
  props<{ error: any }>()
);
