import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, concatMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import * as AppVersionActions from './app-version.actions';
import { AppVersionService } from 'src/app/pages/app-version/app-version.service';
import { ToastrService } from 'ngx-toastr';

@Injectable()
export class AppVersionEffects {

  getAppVersion$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AppVersionActions.getAppVersion),
      concatMap(() =>
        this.appVersionService.getAppVersion().pipe(
          map((response: any) => {
            const config = Array.isArray(response?.data) ? response.data[0] : (response?.data ?? response);
            return AppVersionActions.getAppVersionSuccess({ config });
          }),
          catchError((error) => of(AppVersionActions.getAppVersionFailure({ error })))
        )
      )
    )
  );

  getAppVersionFailure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AppVersionActions.getAppVersionFailure),
      tap((action: any) => {
        try {
          this.toastr.error(action.error || 'Failed to load app version config', 'Error');
        } catch (e) { }
      })
    ), { dispatch: false }
  );

  updateAppVersion$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AppVersionActions.updateAppVersion),
      concatMap(({ payload }) =>
        this.appVersionService.updateAppVersion(payload).pipe(
          map((response: any) => {
            const config = Array.isArray(response?.data) ? response.data[0] : (response?.data ?? response);
            return AppVersionActions.updateAppVersionSuccess({ config });
          }),
          catchError((error) => of(AppVersionActions.updateAppVersionFailure({ error })))
        )
      )
    )
  );

  updateAppVersionSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AppVersionActions.updateAppVersionSuccess),
      tap(() => {
        try {
          this.toastr.success('App version config updated successfully', 'Success');
        } catch (e) { }
      })
    ), { dispatch: false }
  );

  updateAppVersionFailure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AppVersionActions.updateAppVersionFailure),
      tap((action: any) => {
        try {
          this.toastr.error(action.error || 'Failed to update app version config', 'Error');
        } catch (e) { }
      })
    ), { dispatch: false }
  );

  constructor(
    private actions$: Actions,
    private appVersionService: AppVersionService,
    private toastr: ToastrService
  ) { }
}
