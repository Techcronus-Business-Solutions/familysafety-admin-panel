import { createAction, props } from '@ngrx/store';

export const getAppVersion = createAction('[AppVersion] Get App Version');

export const getAppVersionSuccess = createAction(
  '[AppVersion] Get App Version Success',
  props<{ config: any }>()
);

export const getAppVersionFailure = createAction(
  '[AppVersion] Get App Version Failure',
  props<{ error: any }>()
);

export const updateAppVersion = createAction(
  '[AppVersion] Update App Version',
  props<{ payload: any }>()
);

export const updateAppVersionSuccess = createAction(
  '[AppVersion] Update App Version Success',
  props<{ config: any }>()
);

export const updateAppVersionFailure = createAction(
  '[AppVersion] Update App Version Failure',
  props<{ error: any }>()
);
