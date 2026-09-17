import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, concatMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import * as TermsConditionsActions from './terms-conditions.actions';
import { TermsConditionsManagementService } from 'src/app/pages/terms-conditions-management/terms-conditions-management.service';
import { ToastrService } from 'ngx-toastr';

@Injectable()
export class TermsConditionsEffects {

  getLanguages$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TermsConditionsActions.getLanguages),
      concatMap(() =>
        this.termsConditionsService.getLanguages().pipe(
          map((res: any) => {
            const languages = Array.isArray(res) ? res : res?.data ?? res?.languages ?? [];
            return TermsConditionsActions.getLanguagesSuccess({ languages });
          }),
          catchError((error) => of(TermsConditionsActions.getLanguagesFailure({ error })))
        )
      )
    )
  );

  getLanguagesFailure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TermsConditionsActions.getLanguagesFailure),
      tap((action: any) => {
        try {
          this.toastr.error(action.error || 'Failed to load languages', 'Error');
        } catch (e) { }
      })
    ), { dispatch: false }
  );

  getTermsConditions$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TermsConditionsActions.getTermsConditions),
      concatMap(({ language }) =>
        this.termsConditionsService.getTermsConditions(language).pipe(
          map((response: any) => {
            const data = Array.isArray(response?.data) ? response.data[0] : (response?.data ?? response);
            return TermsConditionsActions.getTermsConditionsSuccess({ content: data?.html ?? '' });
          }),
          catchError((error) => of(TermsConditionsActions.getTermsConditionsFailure({ error })))
        )
      )
    )
  );

  getTermsConditionsFailure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TermsConditionsActions.getTermsConditionsFailure),
      tap((action: any) => {
        try {
          this.toastr.error(action.error || 'Failed to load terms & conditions', 'Error');
        } catch (e) { }
      })
    ), { dispatch: false }
  );

  updateTermsConditions$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TermsConditionsActions.updateTermsConditions),
      concatMap(({ payload, language }) =>
        this.termsConditionsService.updateTermsConditions(payload, language).pipe(
          map((response: any) => TermsConditionsActions.updateTermsConditionsSuccess({ response })),
          catchError((error) => of(TermsConditionsActions.updateTermsConditionsFailure({ error })))
        )
      )
    )
  );

  updateTermsConditionsSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TermsConditionsActions.updateTermsConditionsSuccess),
      tap(() => {
        try {
          this.toastr.success('Terms & conditions updated successfully', 'Success');
        } catch (e) { }
      })
    ), { dispatch: false }
  );

  updateTermsConditionsFailure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TermsConditionsActions.updateTermsConditionsFailure),
      tap((action: any) => {
        try {
          this.toastr.error(action.error || 'Failed to update terms & conditions', 'Error');
        } catch (e) { }
      })
    ), { dispatch: false }
  );

  constructor(
    private actions$: Actions,
    private termsConditionsService: TermsConditionsManagementService,
    private toastr: ToastrService
  ) { }
}
