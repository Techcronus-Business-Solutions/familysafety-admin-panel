import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, concatMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import * as ReferralTermsConditionsActions from './referral-terms-conditions.actions';
import { ReferralTermsConditionsManagementService } from 'src/app/pages/referral-terms-conditions-management/referral-terms-conditions-management.service';
import { ToastrService } from 'ngx-toastr';

@Injectable()
export class ReferralTermsConditionsEffects {

  getLanguages$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReferralTermsConditionsActions.getLanguages),
      concatMap(() =>
        this.referralTermsConditionsService.getLanguages().pipe(
          map((res: any) => {
            const languages = Array.isArray(res) ? res : res?.data ?? res?.languages ?? [];
            return ReferralTermsConditionsActions.getLanguagesSuccess({ languages });
          }),
          catchError((error) => of(ReferralTermsConditionsActions.getLanguagesFailure({ error })))
        )
      )
    )
  );

  getLanguagesFailure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReferralTermsConditionsActions.getLanguagesFailure),
      tap((action: any) => {
        try {
          this.toastr.error(action.error || 'Failed to load languages', 'Error');
        } catch (e) { }
      })
    ), { dispatch: false }
  );

  getReferralTermsConditions$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReferralTermsConditionsActions.getReferralTermsConditions),
      concatMap(({ language }) =>
        this.referralTermsConditionsService.getReferralTermsConditions(language).pipe(
          map((response: any) => {
            const data = Array.isArray(response?.data) ? response.data[0] : (response?.data ?? response);
            return ReferralTermsConditionsActions.getReferralTermsConditionsSuccess({ content: data?.html ?? '' });
          }),
          catchError((error) => of(ReferralTermsConditionsActions.getReferralTermsConditionsFailure({ error })))
        )
      )
    )
  );

  getReferralTermsConditionsFailure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReferralTermsConditionsActions.getReferralTermsConditionsFailure),
      tap((action: any) => {
        try {
          this.toastr.error(action.error || 'Failed to load referral terms & conditions', 'Error');
        } catch (e) { }
      })
    ), { dispatch: false }
  );

  updateReferralTermsConditions$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReferralTermsConditionsActions.updateReferralTermsConditions),
      concatMap(({ payload, language }) =>
        this.referralTermsConditionsService.updateReferralTermsConditions(payload, language).pipe(
          map((response: any) => ReferralTermsConditionsActions.updateReferralTermsConditionsSuccess({ response })),
          catchError((error) => of(ReferralTermsConditionsActions.updateReferralTermsConditionsFailure({ error })))
        )
      )
    )
  );

  updateReferralTermsConditionsSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReferralTermsConditionsActions.updateReferralTermsConditionsSuccess),
      tap(() => {
        try {
          this.toastr.success('Referral terms & conditions updated successfully', 'Success');
        } catch (e) { }
      })
    ), { dispatch: false }
  );

  updateReferralTermsConditionsFailure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReferralTermsConditionsActions.updateReferralTermsConditionsFailure),
      tap((action: any) => {
        try {
          this.toastr.error(action.error || 'Failed to update referral terms & conditions', 'Error');
        } catch (e) { }
      })
    ), { dispatch: false }
  );

  constructor(
    private actions$: Actions,
    private referralTermsConditionsService: ReferralTermsConditionsManagementService,
    private toastr: ToastrService
  ) { }
}
