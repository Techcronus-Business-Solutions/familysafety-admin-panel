import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { SubscriptionService } from '../subscription/subscription.service';

/**
 * limit = default feature: label + value editable, not deletable.
 * dud   = default feature: label editable (sent in dud_labels), value read-only, not deletable.
 * extra = label + value editable, deletable.
 */
type FeatureKind = 'limit' | 'extra' | 'dud';
type FeatureType = 'radio' | 'number';
type CellValue = boolean | number | null;

/** The only keys the backend accepts inside tiers[].limits. */
const ALLOWED_LIMIT_KEYS = [
  'offline_support',
  'max_safe_zones',
  'location_history_days',
  'max_groups',
  'max_members_per_group',
  'max_family_members',
];

interface PlanTier {
  id: number;
  name: string;
  description: string;
  slot: number;
  original: { name: string; description: string };
}

interface FeatureRow {
  /** Extra feature id from the API. Null for limits, duds and extras not saved yet. */
  id: number | null;
  key: string;
  kind: FeatureKind;
  type: FeatureType;
  label: string;
  labelEditable: boolean;
  valueEditable: boolean;
  /** Value per tier, keyed by tier id. */
  values: Record<string, CellValue>;
  isNew: boolean;
  /** Snapshot from the last load, used to send only what changed. */
  original: { label: string; values: Record<string, CellValue>; order: number } | null;
}

@Component({
  selector: 'app-subscription-features',
  imports: [CommonModule, FormsModule],
  templateUrl: './subscription-features.component.html',
  styleUrl: './subscription-features.component.scss',
})
export class SubscriptionFeaturesComponent implements OnInit, OnDestroy {
  languages: any[] = [];
  selectedLanguage = 'en';

  tiers: PlanTier[] = [];
  rows: FeatureRow[] = [];
  deletedExtraIds: number[] = [];
  warnings: string[] = [];

  loading = false;
  saving = false;
  translating = false;
  dirty = false;

  showAddForm = false;
  newFeature: { label: string; type: FeatureType } = { label: '', type: 'radio' };

  private destroy$ = new Subject<void>();

  constructor(private subscriptionService: SubscriptionService, private toastr: ToastrService) { }

  ngOnInit(): void {
    this.fetchLanguages();
  }

  private get token(): string {
    return localStorage.getItem('token') || '';
  }

  /** Limits and read-only (dud) features, shown in the "Default Features" section. */
  get fixedRows(): FeatureRow[] {
    return this.rows.filter(r => r.kind !== 'extra');
  }

  get extraRows(): FeatureRow[] {
    return this.rows.filter(r => r.kind === 'extra');
  }

  fetchLanguages(): void {
    this.subscriptionService.getLanguages(this.token).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        const languages = Array.isArray(res) ? res : res?.data ?? res?.languages ?? [];
        this.languages = Array.isArray(languages) ? languages : [];
        const defaultLang = this.languages.find((l: any) => l.code === 'en')?.code || this.languages[0]?.code || 'en';
        this.selectedLanguage = defaultLang;
        this.loadPlanTiers();
      },
      error: (err: any) => {
        this.toastr.error(
          "We couldn't load the list of languages, so English is being shown. Please refresh the page to try again.",
          'Languages Unavailable'
        );
        this.loadPlanTiers();
      }
    });
  }

  onLanguageChange(lang: any): void {
    const previous = this.selectedLanguage;
    if (this.dirty && !confirm('You have unsaved changes. Switch language and discard them?')) {
      // Re-assign so the select reverts to the previous language.
      this.selectedLanguage = '';
      setTimeout(() => (this.selectedLanguage = previous));
      return;
    }
    this.selectedLanguage = String(lang);
    this.loadPlanTiers();
  }

  loadPlanTiers(): void {
    this.loading = true;
    this.subscriptionService.getPlanTiers(this.token, this.selectedLanguage).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.buildState(res?.data ?? {});
        this.loading = false;
      },
      error: (err: any) => {
        this.loading = false;
        this.tiers = [];
        this.rows = [];
        this.toastr.error(err || "We couldn't load the plan features. Please try again.", 'Unable to Load');
      }
    });
  }

  private toKind(f: any): FeatureKind {
    if (f.kind === 'extra') {
      return 'extra';
    }
    if (f.kind === 'limit' && ALLOWED_LIMIT_KEYS.includes(f.key)) {
      return 'limit';
    }
    // "dud" and any limit outside the allowed keys are read-only and never sent.
    return 'dud';
  }

  private buildState(data: any): void {
    const apiTiers: any[] = Array.isArray(data?.tiers) ? data.tiers : [];
    apiTiers.sort((a, b) => (a.slot ?? 0) - (b.slot ?? 0));

    this.tiers = apiTiers.map(t => ({
      id: t.id,
      name: t.name ?? '',
      description: t.description ?? '',
      slot: t.slot,
      original: { name: t.name ?? '', description: t.description ?? '' },
    }));

    // Merge each tier's feature list into one row per feature key, keeping API order.
    const rowMap = new Map<string, FeatureRow>();
    for (const tier of apiTiers) {
      const tierKey = String(tier.id);
      for (const f of tier.features ?? []) {
        let row = rowMap.get(f.key);
        if (!row) {
          const kind = this.toKind(f);
          row = {
            id: kind === 'extra' ? f.id : null,
            key: f.key,
            kind,
            type: f.type === 'number' ? 'number' : 'radio',
            label: f.label ?? '',
            labelEditable: f.label_editable !== false,
            valueEditable: kind !== 'dud' && f.value_editable !== false,
            values: {},
            isNew: false,
            original: null,
          };
          rowMap.set(f.key, row);
        }
        row.values[tierKey] = row.type === 'radio' ? !!f.value : (f.value ?? null);
      }
    }

    // Tiers that don't list a feature get a default value so every cell is bound.
    const rows = Array.from(rowMap.values());
    for (const row of rows) {
      for (const tier of this.tiers) {
        const k = String(tier.id);
        if (!(k in row.values)) {
          row.values[k] = row.type === 'radio' ? false : null;
        }
      }
    }

    this.rows = rows;
    this.rows.forEach((row, index) => {
      row.original = { label: row.label, values: { ...row.values }, order: index + 1 };
    });
    this.deletedExtraIds = [];
    this.warnings = [
      ...(Array.isArray(data?.warnings) ? data.warnings : []),
      ...apiTiers.flatMap(t => Array.isArray(t.warnings) ? t.warnings : []),
    ];
    this.dirty = false;
    this.cancelAdd();
  }

  /** "max_safe_zones" / "real-time-location" -> "Max Safe Zones" / "Real Time Location" */
  formatKey(key: string): string {
    return (key || '')
      .replace(/[-_]+/g, ' ')
      .trim()
      .split(/\s+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  markDirty(): void {
    this.dirty = true;
  }

  // ---- Extra features ----

  openAdd(): void {
    this.showAddForm = true;
    this.newFeature = { label: '', type: 'radio' };
  }

  cancelAdd(): void {
    this.showAddForm = false;
    this.newFeature = { label: '', type: 'radio' };
  }

  addExtraFeature(): void {
    const label = (this.newFeature.label || '').trim();
    if (!label) {
      this.toastr.warning('Please enter a feature name', 'Validation');
      return;
    }
    const type = this.newFeature.type;
    const values: Record<string, CellValue> = {};
    for (const tier of this.tiers) {
      values[String(tier.id)] = type === 'radio' ? false : 0;
    }
    this.rows.push({
      id: null,
      key: `new-${Date.now()}`,
      kind: 'extra',
      type,
      label,
      labelEditable: true,
      valueEditable: true,
      values,
      isNew: true,
      original: null,
    });
    this.markDirty();
    this.cancelAdd();
  }

  moveExtra(row: FeatureRow, direction: -1 | 1): void {
    const extras = this.extraRows;
    const idx = extras.indexOf(row);
    const target = extras[idx + direction];
    if (!target) {
      return;
    }
    const a = this.rows.indexOf(row);
    const b = this.rows.indexOf(target);
    [this.rows[a], this.rows[b]] = [this.rows[b], this.rows[a]];
    this.markDirty();
  }

  deleteExtra(row: FeatureRow): void {
    if (row.kind !== 'extra') {
      return;
    }
    if (!confirm(`Delete feature "${row.label}"? It will be removed when you save.`)) {
      return;
    }
    if (row.id !== null && !row.isNew) {
      this.deletedExtraIds.push(row.id);
    }
    this.rows = this.rows.filter(r => r !== row);
    this.markDirty();
  }

  // ---- Save ----

  private normalizeValue(row: FeatureRow, value: any): CellValue {
    if (row.type === 'radio') {
      return value === true || value === 'true';
    }
    if (value === null || value === undefined || value === '') {
      return null;
    }
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }

  private validate(): string | null {
    for (const tier of this.tiers) {
      if (!(tier.name || '').trim()) {
        return 'Plan name cannot be empty';
      }
    }
    for (const row of this.rows) {
      if (!(row.label || '').trim()) {
        return 'Feature name cannot be empty';
      }
      if (row.kind !== 'dud' && row.type === 'number') {
        for (const tier of this.tiers) {
          const v = row.values[String(tier.id)];
          if (v !== null && v !== undefined && (v as any) !== '' && (!Number.isFinite(Number(v)) || Number(v) < 0)) {
            return `"${row.label}" must be a positive number or unlimited`;
          }
        }
      }
    }
    return null;
  }

  buildPayload(): any {
    const tiers: any[] = [];
    for (const tier of this.tiers) {
      const tierKey = String(tier.id);
      const entry: any = { id: tier.id };

      const name = tier.name.trim();
      const description = (tier.description || '').trim();
      if (name !== tier.original.name.trim()) {
        entry.name = name;
      }
      if (description !== tier.original.description.trim()) {
        entry.description = description;
      }

      // Only kind "limit" rows with an allowed key, only the value, only if it changed.
      const limits: Record<string, CellValue> = {};
      for (const row of this.rows) {
        if (row.kind !== 'limit' || !ALLOWED_LIMIT_KEYS.includes(row.key)) {
          continue;
        }
        const value = this.normalizeValue(row, row.values[tierKey]);
        const originalValue = this.normalizeValue(row, row.original?.values[tierKey]);
        if (value !== originalValue) {
          limits[row.key] = value;
        }
      }
      if (Object.keys(limits).length) {
        entry.limits = limits;
      }

      if (Object.keys(entry).length > 1) {
        tiers.push(entry);
      }
    }

    // Default feature labels: only changed ones, keyed by feature key.
    const dudLabels: Record<string, string> = {};
    const limitLabels: Record<string, string> = {};
    for (const row of this.rows) {
      if (row.kind === 'extra' || !row.original) {
        continue;
      }
      const label = row.label.trim();
      if (label === row.original.label.trim()) {
        continue;
      }
      if (row.kind === 'dud') {
        dudLabels[row.key] = label;
      } else if (ALLOWED_LIMIT_KEYS.includes(row.key)) {
        limitLabels[row.key] = label;
      }
    }

    const create: any[] = [];
    const update: any[] = [];
    this.rows.forEach((row, index) => {
      if (row.kind !== 'extra') {
        return;
      }
      const order = index + 1;
      const label = row.label.trim();
      if (row.isNew) {
        const values: Record<string, CellValue> = {};
        for (const tier of this.tiers) {
          values[String(tier.id)] = this.normalizeValue(row, row.values[String(tier.id)]);
        }
        create.push({ label, type: row.type, values, order });
        return;
      }
      const original = row.original;
      // Existing extras: send only the tier values that changed.
      const changedValues: Record<string, CellValue> = {};
      for (const tier of this.tiers) {
        const k = String(tier.id);
        const value = this.normalizeValue(row, row.values[k]);
        if (!original || value !== this.normalizeValue(row, original.values[k])) {
          changedValues[k] = value;
        }
      }
      const hasValueChanges = Object.keys(changedValues).length > 0;
      const changed = !original
        || label !== original.label.trim()
        || order !== original.order
        || hasValueChanges;
      if (changed) {
        const entry: any = { id: row.id, label, order };
        if (hasValueChanges) {
          entry.values = changedValues;
        }
        update.push(entry);
      }
    });

    const payload: any = {};
    if (tiers.length) {
      payload.tiers = tiers;
    }
    if (Object.keys(dudLabels).length) {
      payload.dud_labels = dudLabels;
    }
    if (Object.keys(limitLabels).length) {
      payload.limit_labels = limitLabels;
    }
    const extras: any = {};
    if (create.length) {
      extras.create = create;
    }
    if (update.length) {
      extras.update = update;
    }
    if (this.deletedExtraIds.length) {
      extras.delete = [...this.deletedExtraIds];
    }
    if (Object.keys(extras).length) {
      payload.extras = extras;
    }
    return payload;
  }

  save(): void {
    const error = this.validate();
    if (error) {
      this.toastr.warning(error, 'Validation');
      return;
    }
    const payload = this.buildPayload();
    if (!Object.keys(payload).length) {
      this.toastr.info('No changes to save', 'Info');
      return;
    }
    this.saving = true;
    this.subscriptionService.updatePlanTiers(this.token, this.selectedLanguage, payload).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.saving = false;
        this.toastr.success(res?.message || 'Plan features updated successfully', 'Success');
        this.loadPlanTiers();
      },
      error: (err: any) => {
        this.saving = false;
        this.toastr.error(err || "We couldn't save the plan features. Please try again.", 'Save Failed');
      }
    });
  }

  translateDetails(): void {
    if (!this.selectedLanguage || this.selectedLanguage === 'en') {
      return;
    }
    if (this.dirty && !confirm('Translating will reload the data and discard your unsaved changes. Continue?')) {
      return;
    }
    this.translating = true;
    this.subscriptionService.translatePlanLabels(this.token, this.selectedLanguage).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.translating = false;
        this.toastr.success(res?.message || 'Details translated successfully', 'Success');
        this.loadPlanTiers();
      },
      error: (err: any) => {
        this.translating = false;
        this.toastr.error(err || "We couldn't translate the plan details. Please try again.", 'Translation Failed');
      }
    });
  }

  trackRow = (_: number, row: FeatureRow) => row.key;
  trackTier = (_: number, tier: PlanTier) => tier.id;

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
