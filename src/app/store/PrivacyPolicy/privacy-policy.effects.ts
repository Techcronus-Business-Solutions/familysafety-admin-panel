import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, concatMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import * as PrivacyPolicyActions from './privacy-policy.actions';
import { PrivacyPolicyManagementService } from 'src/app/pages/privacy-policy-management/privacy-policy-management.service';
import { ToastrService } from 'ngx-toastr';

@Injectable()
export class PrivacyPolicyEffects {

  getLanguages$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PrivacyPolicyActions.getLanguages),
      concatMap(() =>
        this.privacyPolicyService.getLanguages().pipe(
          map((res: any) => {
            const languages = Array.isArray(res) ? res : res?.data ?? res?.languages ?? [];
            return PrivacyPolicyActions.getLanguagesSuccess({ languages });
          }),
          catchError((error) => of(PrivacyPolicyActions.getLanguagesFailure({ error })))
        )
      )
    )
  );

  getLanguagesFailure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PrivacyPolicyActions.getLanguagesFailure),
      tap((action: any) => {
        try {
          this.toastr.error(action.error || 'Failed to load languages', 'Error');
        } catch (e) { }
      })
    ), { dispatch: false }
  );

  getPrivacyPolicy$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PrivacyPolicyActions.getPrivacyPolicy),
      concatMap(({ language }) =>
        this.privacyPolicyService.getPrivacyPolicy(language).pipe(
          map((response: any) => {
            const data = Array.isArray(response?.data) ? response.data[0] : (response?.data ?? response);
            return PrivacyPolicyActions.getPrivacyPolicySuccess({ content: data?.html ?? '' });
          }),
          catchError((error) => of(PrivacyPolicyActions.getPrivacyPolicyFailure({ error })))
        )
      )
    )
  );

  getPrivacyPolicyFailure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PrivacyPolicyActions.getPrivacyPolicyFailure),
      tap((action: any) => {
        try {
          this.toastr.error(action.error || 'Failed to load privacy policy', 'Error');
        } catch (e) { }
      })
    ), { dispatch: false }
  );

  updatePrivacyPolicy$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PrivacyPolicyActions.updatePrivacyPolicy),
      concatMap(({ payload, language }) =>
        this.privacyPolicyService.updatePrivacyPolicy(payload, language).pipe(
          map((response: any) => PrivacyPolicyActions.updatePrivacyPolicySuccess({ response })),
          catchError((error) => of(PrivacyPolicyActions.updatePrivacyPolicyFailure({ error })))
        )
      )
    )
  );

  updatePrivacyPolicySuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PrivacyPolicyActions.updatePrivacyPolicySuccess),
      tap(() => {
        try {
          this.toastr.success('Privacy policy updated successfully', 'Success');
        } catch (e) { }
      })
    ), { dispatch: false }
  );

  updatePrivacyPolicyFailure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PrivacyPolicyActions.updatePrivacyPolicyFailure),
      tap((action: any) => {
        try {
          this.toastr.error(action.error || 'Failed to update privacy policy', 'Error');
        } catch (e) { }
      })
    ), { dispatch: false }
  );

  constructor(
    private actions$: Actions,
    private privacyPolicyService: PrivacyPolicyManagementService,
    private toastr: ToastrService
  ) { }
}
