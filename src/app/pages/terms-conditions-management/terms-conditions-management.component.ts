import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Editor, NgxEditorModule, TOOLBAR_FULL } from 'ngx-editor';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { html_beautify } from 'js-beautify';
import { SharedModule } from 'src/app/shared/shared.module';
import {
  getLanguages,
  getLanguagesSuccess,
  getLanguagesFailure,
  getTermsConditions,
  getTermsConditionsSuccess,
  updateTermsConditions,
} from 'src/app/store/TermsConditions/terms-conditions.actions';
import {
  selectTermsConditionsLoading,
  selectTermsConditionsSaving,
} from 'src/app/store/TermsConditions/terms-conditions.reducer';

function formatHtml(html: string): string {
  if (!html || !html.trim()) {
    return '';
  }

  return html_beautify(html, {
    indent_size: 2,
    wrap_line_length: 0,
    preserve_newlines: false,
  });
}

@Component({
  selector: 'app-terms-conditions-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgxEditorModule, SharedModule],
  templateUrl: './terms-conditions-management.component.html',
  styleUrl: './terms-conditions-management.component.scss',
})
export class TermsConditionsManagementComponent implements OnInit, OnDestroy {
  title = 'Terms & Conditions';
  breadCrumbItems: Array<{ label: string; active?: boolean }> = [
    { label: 'Dashboard' },
    { label: 'Terms & Conditions', active: true }
  ];

  editor!: Editor;
  toolbar: any = TOOLBAR_FULL;
  editForm!: FormGroup;

  languages: any[] = [];
  selectedLanguage = 'en';
  loading = false;
  saving = false;
  sourceMode = false;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private actions$: Actions
  ) { }

  ngOnInit(): void {
    this.editor = new Editor();
    this.editForm = this.fb.group({
      content: ['', Validators.required]
    });

    this.store.select(selectTermsConditionsLoading).pipe(takeUntil(this.destroy$)).subscribe(loading => this.loading = loading);
    this.store.select(selectTermsConditionsSaving).pipe(takeUntil(this.destroy$)).subscribe(saving => this.saving = saving);

    this.actions$.pipe(
      ofType(getLanguagesSuccess),
      takeUntil(this.destroy$)
    ).subscribe((action) => {
      this.languages = Array.isArray(action.languages) ? action.languages : [];
      this.selectedLanguage = this.languages.find((lang: any) => (lang.code || lang.id) === 'en')?.code
        || this.languages[0]?.code
        || this.languages[0]?.id
        || 'en';
      this.loadTermsConditions();
    });

    this.actions$.pipe(
      ofType(getLanguagesFailure),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.loadTermsConditions();
    });

    this.actions$.pipe(
      ofType(getTermsConditionsSuccess),
      takeUntil(this.destroy$)
    ).subscribe((action) => {
      const content = this.sourceMode ? formatHtml(action.content) : action.content;
      this.editForm.patchValue({ content });
    });

    this.store.dispatch(getLanguages());
  }

  toggleSourceMode(): void {
    if (!this.sourceMode) {
      const control = this.editForm.get('content');
      control?.setValue(formatHtml(control.value));
    }

    this.sourceMode = !this.sourceMode;
  }

  onLanguageChange(languageId: any): void {
    this.selectedLanguage = String(languageId);
    this.loadTermsConditions();
  }

  private loadTermsConditions(): void {
    this.store.dispatch(getTermsConditions({ language: this.selectedLanguage }));
  }

  onSubmit(): void {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    const payload = {
      lang: this.selectedLanguage,
      html: this.editForm.value.content
    };

    this.store.dispatch(updateTermsConditions({ payload, language: this.selectedLanguage }));
  }

  ngOnDestroy(): void {
    this.editor.destroy();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
