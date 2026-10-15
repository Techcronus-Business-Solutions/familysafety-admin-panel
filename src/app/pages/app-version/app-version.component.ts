import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SharedModule } from 'src/app/shared/shared.module';
import {
  getAppVersion,
  getAppVersionSuccess,
  updateAppVersion,
  updateAppVersionSuccess,
} from 'src/app/store/AppVersion/app-version.actions';
import {
  selectAppVersionLoading,
  selectAppVersionSaving,
} from 'src/app/store/AppVersion/app-version.reducer';

@Component({
  selector: 'app-app-version',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SharedModule],
  templateUrl: './app-version.component.html',
  styleUrl: './app-version.component.scss',
})
export class AppVersionComponent implements OnInit, OnDestroy {
  title = 'App Version';
  breadCrumbItems: Array<{ label: string; active?: boolean }> = [
    { label: 'Dashboard' },
    { label: 'App Version', active: true }
  ];

  editForm!: FormGroup;
  loading = false;
  saving = false;

  private destroy$ = new Subject<void>();

  // e.g. 1.0.1 - digits only, exactly two dots, max 10 chars (enforced via maxLength validator)
  private static readonly VERSION_PATTERN = /^\d+\.\d+\.\d+$/;
  // digits only, no dot
  private static readonly BUILD_PATTERN = /^\d+$/;

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private actions$: Actions
  ) { }

  ngOnInit(): void {
    const versionValidators = [
      Validators.required,
      Validators.maxLength(10),
      Validators.pattern(AppVersionComponent.VERSION_PATTERN),
    ];
    const buildValidators = [
      Validators.required,
      Validators.maxLength(10),
      Validators.pattern(AppVersionComponent.BUILD_PATTERN),
    ];

    this.editForm = this.fb.group({
      iosForceUpdateVersion: ['', versionValidators],
      iosForceUpdateBuild: ['', buildValidators],
      androidForceUpdateVersion: ['', versionValidators],
      androidForceUpdateBuild: ['', buildValidators],
    });

    this.store.select(selectAppVersionLoading).pipe(takeUntil(this.destroy$)).subscribe(loading => this.loading = loading);
    this.store.select(selectAppVersionSaving).pipe(takeUntil(this.destroy$)).subscribe(saving => this.saving = saving);

    this.actions$.pipe(
      ofType(getAppVersionSuccess, updateAppVersionSuccess),
      takeUntil(this.destroy$)
    ).subscribe((action) => {
      const config = action.config ?? {};
      this.editForm.patchValue({
        iosForceUpdateVersion: config.ios_force_update_version ?? '',
        iosForceUpdateBuild: config.ios_force_update_build != null ? String(config.ios_force_update_build) : '',
        androidForceUpdateVersion: config.android_force_update_version ?? '',
        androidForceUpdateBuild: config.android_force_update_build != null ? String(config.android_force_update_build) : '',
      });
    });

    this.store.dispatch(getAppVersion());
  }

  onSubmit(): void {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    const value = this.editForm.value;
    const payload = {
      ios_force_update_version: value.iosForceUpdateVersion,
      ios_force_update_build: Number(value.iosForceUpdateBuild),
      android_force_update_version: value.androidForceUpdateVersion,
      android_force_update_build: Number(value.androidForceUpdateBuild),
    };

    this.store.dispatch(updateAppVersion({ payload }));
  }

  // Strips anything except digits and '.' as the user types, and caps length to 10
  restrictToVersionChars(event: Event, controlName: string): void {
    const input = event.target as HTMLInputElement;
    const sanitized = input.value.replace(/[^0-9.]/g, '').slice(0, 10);
    if (sanitized !== input.value) {
      input.value = sanitized;
    }
    this.editForm.get(controlName)?.setValue(sanitized);
  }

  // Strips anything except digits as the user types, and caps length to 10
  restrictToDigits(event: Event, controlName: string): void {
    const input = event.target as HTMLInputElement;
    const sanitized = input.value.replace(/[^0-9]/g, '').slice(0, 10);
    if (sanitized !== input.value) {
      input.value = sanitized;
    }
    this.editForm.get(controlName)?.setValue(sanitized);
  }

  isInvalid(controlName: string): boolean {
    const control = this.editForm.get(controlName);
    return !!control && control.touched && control.invalid;
  }

  hasError(controlName: string, errorName: string): boolean {
    return !!this.editForm.get(controlName)?.errors?.[errorName];
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
