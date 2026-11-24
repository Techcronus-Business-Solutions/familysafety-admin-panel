import { Component, ViewChild, OnDestroy } from '@angular/core';

// Get Modal
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { Subject } from 'rxjs';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { deleteUser, loadUsers, loadUsersSuccess, userSuspend, userUnsuspend } from '../../../store/Users/user.actions';
import { selectAll as selectAllUsers, selectCurrentPage, selectTotalPages, selectTotalUsers, selectUsersLoading } from '../../../store/Users/user.reducer';
import { Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { ListStateService } from 'src/app/core/services/list-state.service';
import { COUNTRY_CODES, findCountryByName } from 'src/app/shared/data/country-codes';
import { UserService, UsersExportRequest } from '../user.service';

type UserSortField =
  | 'full_name'
  | 'email'
  | 'last_active'
  | 'registration_date'
  | 'subscription_end_date'
  | 'subscription_start_date';

const USER_SORT_FIELDS: readonly UserSortField[] = [
  'full_name',
  'email',
  'last_active',
  'registration_date',
  'subscription_end_date',
  'subscription_start_date'
];

function isUserSortField(field: string): field is UserSortField {
  return USER_SORT_FIELDS.some(sortableField => sortableField === field);
}

@Component({
  selector: 'app-user-list',
  standalone: false,
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss', './user-list-filters.component.scss'],
  providers: [DecimalPipe, DatePipe],
})
export class UserListComponent implements OnDestroy {
  // bread crumb items
  breadCrumbItems!: Array<{}>;
  deleteID: any;
  endItem: any
  ListForm!: UntypedFormGroup;
  submitted = false;
  masterSelected!: boolean;
  userList: any;
  users: any;
  // assigndata: any
  assignList: any;
  term: any
  @ViewChild('addUsers', { static: false }) addUsers?: ModalDirective;
  @ViewChild('deleteRecordModal', { static: false }) deleteRecordModal?: ModalDirective;
  assignto: any = [];
  editData: any;
  allusers: any;
  loading = false;
  listReady = false;
  currentPage: number = 1;
  totalPages: number = 1;
  totalUsers: number = 0;
  pageSize: number = 10;
  pageSizeOptions = [10, 50, 100];
  countryOptions = COUNTRY_CODES;
  itemsPerPage: number = 10;
  ordering: string = '';
  sortField: UserSortField | '' = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  isMinor: string = '';
  statusFilter: string = '';
  filterSubsStatus: string = '';
  filterCountry: string | null = null;
  showFilters = false;
  showExportModal = false;
  exporting = false;
  exportColumns = [
    { key: 'full_name', label: 'Full Name', selected: true },
    { key: 'email', label: 'Email', selected: true },
    { key: 'country', label: 'Country', selected: true },
    { key: 'phone_number', label: 'Phone Number', selected: true },
    { key: 'subscription_details.subs_status', label: 'Subscription Status', selected: true },
    { key: 'subscription_details.start_date', label: 'Subscription Start Date', selected: true },
    { key: 'subscription_details.end_date', label: 'Subscription End Date', selected: true },
    { key: 'is_minor', label: 'Minor', selected: true },
    { key: 'user_status', label: 'User Status', selected: true },
    { key: 'date_joined', label: 'Registration Date', selected: true },
    { key: 'suspended_by', label: 'Suspended By', selected: true },
    { key: 'last_active', label: 'Last Active Date', selected: true }
  ];
  exportPayload: UsersExportRequest | null = null;
  private destroy$ = new Subject<void>();
  private searchTimeout: any;

  constructor(private formBuilder: UntypedFormBuilder, public store: Store, public datepipe: DatePipe, private router: Router, private listState: ListStateService, private actions$: Actions, private userService: UserService) {
  }

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: 'Dashboard' },
      { label: 'Users', active: true }
    ];

    this.ListForm = this.formBuilder.group({
      id: [''],
      clientName: ['', [Validators.required]],
      ticketTitle: ['', [Validators.required]],
      createDate: ['', [Validators.required]],
      dueDate: ['', [Validators.required]],
      priority: ['', [Validators.required]],
      status: ['', [Validators.required]]
    });

    const previousUrl = this.router.lastSuccessfulNavigation()?.previousNavigation?.finalUrl?.toString() ?? '';
    let savedState = this.listState.getState('users');
    const hasSavedFilters = Boolean(
      savedState.search ||
      savedState.is_minor ||
      savedState.is_suspended ||
      savedState.filter_subs_status ||
      savedState.filter_country
    );

    if (previousUrl && !previousUrl.startsWith('/users') && !hasSavedFilters) {
      this.listState.resetState('users');
      savedState = this.listState.getState('users');
    }

    this.currentPage = savedState.page;
    this.pageSize = savedState.per_page;
    this.term = savedState.search || '';
    this.isMinor = savedState.is_minor || '';
    this.statusFilter = savedState.is_suspended || '';
    this.filterSubsStatus = savedState.filter_subs_status || '';
    this.filterCountry = savedState.filter_country || null;
    this.showFilters = hasSavedFilters;
    this.setOrderingState(savedState.ordering || '');
    this.loadUsers();
    console.log("User Current Page:- ", this.currentPage, "Page Size:- ", this.pageSize, "Search Term:- ", this.term, "Ordering:- ", this.ordering);

    this.store.select(selectUsersLoading).pipe(
      takeUntil(this.destroy$)
    ).subscribe((l) => { this.loading = l; });

    this.actions$.pipe(
      ofType(loadUsersSuccess),
      takeUntil(this.destroy$)
    ).subscribe(() => { this.listReady = true; });

    this.store.select(selectAllUsers).pipe(
      takeUntil(this.destroy$)
    ).subscribe((users) => {
      this.users = users;
      this.allusers = users;
      this.itemsPerPage = Math.max(this.itemsPerPage, users?.length || 0);
      console.log('Users from store:', users);
    });

    this.store.select(selectCurrentPage).pipe(
      takeUntil(this.destroy$)
    ).subscribe((p: number) => {
      this.currentPage = p || 1;
    });

    this.store.select(selectTotalUsers).pipe(
      takeUntil(this.destroy$)
    ).subscribe((t: number) => {
      this.totalUsers = t || 0;
    });

    this.store.select(selectTotalPages).pipe(
      takeUntil(this.destroy$)
    ).subscribe((tp: number) => {
      this.totalPages = tp || 1;
      const perPage = tp && tp > 0 ? Math.ceil((this.totalUsers || 0) / tp) : 10;
      this.itemsPerPage = Math.max(this.itemsPerPage, perPage > 0 ? perPage : 10);
    });
  }

  getRowNumber(index: number): number {
    return ((this.currentPage || 1) - 1) * (this.itemsPerPage || 10) + index + 1;
  }

  getInitials(name?: string): string {
    if (!name) {
      return '';
    }
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  getCountryFlagClass(country?: string): string | null {
    const isoCode = findCountryByName(country)?.isoCode;
    return isoCode ? `iti__${isoCode.toLowerCase()}` : null;
  }

  getCountryName(country?: string): string {
    return country || '-';
  }

  getSubscriptionStatus(user: any): string {
    const status = user?.subscription_details?.subs_status?.trim().toLowerCase();
    if (!status || status === 'no') {
      return 'No';
    }

    switch (status) {
      case 'trial':
      case 'trialing':
        return 'Trial';
      case 'active':
        return 'Active';
      case 'expired':
        return 'Expired';
      case 'cancelled':
      case 'canceled':
        return 'Cancelled';
      case 'referral_grace':
        return 'Referral Grace';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  }

  getSubscriptionStatusClass(user: any): string {
    const status = user?.subscription_details?.subs_status?.trim().toLowerCase();
    switch (status) {
      case 'trial':
      case 'trialing':
        return 'bg-warning-subtle text-warning';
      case 'active':
        return 'bg-success-subtle text-success';
      case 'expired':
      case 'cancelled':
      case 'canceled':
        return 'bg-danger-subtle text-danger';
      case 'referral_grace':
        return 'bg-info-subtle text-info';
      default:
        return 'bg-secondary-subtle text-secondary';
    }
  }

  get paginationPages(): Array<number | null> {
    const totalPages = Math.max(1, this.totalPages);
    const currentPage = Math.min(Math.max(1, this.currentPage), totalPages);

    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, null, totalPages];
    }

    if (currentPage >= totalPages - 3) {
      return [1, null, totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }

    return [1, null, currentPage - 1, currentPage, currentPage + 1, null, totalPages];
  }

  onSearch(value: string) {
    this.term = value;
    this.currentPage = 1;
    this.loadUsers();
  }

  onSearchClick() {
    this.currentPage = 1;
    this.loadUsers();
  }

  onSearchInput(): void {
    clearTimeout(this.searchTimeout);
    if (this.term.length === 0) {
      this.currentPage = 1;
      this.loadUsers();
      return;
    }
    if (this.term.length >= 3) {
      this.searchTimeout = setTimeout(() => {
        this.currentPage = 1;
        this.loadUsers();
      }, 400);
    }
  }

  onPageSizeChange(size: string | number) {
    this.pageSize = Number(size);
    this.currentPage = 1;
    this.loadUsers();
  }

  tablepageChanged(event: any) {
    const page = (event && event.page) ? event.page : (typeof event === 'number' ? event : 1);
    this.currentPage = page;
    this.loadUsers();
  }

  onPaginationItemClick(page: number | null): void {
    if (page !== null) {
      this.tablepageChanged(page);
    }
  }

  onSort(field: UserSortField) {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.ordering = this.sortDirection === 'asc' ? field : `-${field}`;
    this.currentPage = 1;
    this.loadUsers();
  }

  getSortIcon(field: UserSortField): string {
    if (this.sortField !== field) {
      return 'ri-arrow-up-down-line';
    }
    return this.sortDirection === 'asc' ? 'ri-arrow-up-line' : 'ri-arrow-down-line';
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadUsers();
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  resetFilters(): void {
    clearTimeout(this.searchTimeout);
    this.term = '';
    this.isMinor = '';
    this.statusFilter = '';
    this.filterSubsStatus = '';
    this.filterCountry = null;
    this.currentPage = 1;
    this.loadUsers();
  }

  openExportModal(): void {
    this.showExportModal = true;
  }

  closeExportModal(): void {
    if (!this.exporting) {
      this.showExportModal = false;
    }
  }

  get hasSelectedExportColumns(): boolean {
    return this.exportColumns.some(column => column.selected);
  }

  exportUsers(): void {
    const columns = this.exportColumns.filter(column => column.selected).map(column => column.key);
    if (!columns.length) {
      return;
    }

    const payload: UsersExportRequest = {
      columns,
      search: this.term || '',
      is_minor: this.isMinor || '',
      is_suspended: this.statusFilter || '',
      filter_subs_status: this.filterSubsStatus || '',
      filter_country: this.filterCountry || '',
      ordering: this.ordering || ''
    };
    this.exportPayload = payload;
    this.exporting = true;

    this.userService.exportUsers(localStorage.getItem('token') || '', payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: response => {
          this.exporting = false;
          if (response.body === null) {
            Swal.fire('Export failed', 'The export response did not contain CSV data.', 'error');
            return;
          }

          const fileName = this.getExportFileName(response.headers.get('Content-Disposition'))
            || this.getFallbackExportFileName();

          const blob = new Blob([response.body], { type: 'text/csv;charset=utf-8' });
          const downloadUrl = URL.createObjectURL(blob);
          const downloadLink = document.createElement('a');
          downloadLink.href = downloadUrl;
          downloadLink.download = fileName;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          downloadLink.remove();
          window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 0);
          this.closeExportModal();
        },
        error: (error: unknown) => {
          this.exporting = false;
          const message = typeof error === 'string' ? error : 'Unable to export users. Please try again.';
          Swal.fire('Export failed', message, 'error');
        }
      });
  }

  private getExportFileName(contentDisposition: string | null): string | null {
    if (!contentDisposition) {
      return null;
    }

    const encodedFileName = contentDisposition.match(/filename\*=[^']*'[^']*'([^;]+)/i)?.[1];
    const quotedFileName = contentDisposition.match(/filename="?([^";]+)"?/i)?.[1];
    let fileName = quotedFileName?.trim();

    if (encodedFileName) {
      try {
        fileName = decodeURIComponent(encodedFileName.trim());
      } catch {
        fileName = encodedFileName.trim();
      }
    }

    if (!fileName) {
      return null;
    }

    return fileName;
  }

  private getFallbackExportFileName(): string {
    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);

    return `Anglerprotect-UserExport-${day}-${month}-${year}.csv`;
  }

  private setOrderingState(ordering: string) {
    const descending = ordering.startsWith('-');
    const field = descending ? ordering.slice(1) : ordering;
    if (isUserSortField(field)) {
      this.ordering = ordering;
      this.sortField = field;
      this.sortDirection = descending ? 'desc' : 'asc';
    } else {
      this.ordering = '';
      this.sortField = '';
      this.sortDirection = 'asc';
    }
  }

  private loadUsers() {
    this.listState.setState('users', {
      page: this.currentPage,
      per_page: this.pageSize,
      search: this.term || '',
      ordering: this.ordering || '',
      is_minor: this.isMinor,
      is_suspended: this.statusFilter,
      filter_subs_status: this.filterSubsStatus,
      filter_country: this.filterCountry || ''
    });
    this.store.dispatch(loadUsers({
      page: this.currentPage,
      per_page: this.pageSize,
      search: this.term,
      ordering: this.ordering || undefined,
      is_minor: this.isMinor || undefined,
      is_suspended: this.statusFilter || undefined,
      filter_subs_status: this.filterSubsStatus || undefined,
      filter_country: this.filterCountry || undefined
    }));
  }

  userSuspend(id: any) {
    Swal.fire({
      title: 'Suspend User',
      text: 'Are you sure you want to suspend this user?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, suspend',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.store.dispatch(userSuspend({ id, page: this.currentPage, per_page: this.pageSize, search: this.term, ordering: this.ordering || undefined, is_minor: this.isMinor || undefined, is_suspended: this.statusFilter || undefined, filter_subs_status: this.filterSubsStatus || undefined, filter_country: this.filterCountry || undefined }));
      }
    });
  }

  userUnsuspend(id: any) {
    Swal.fire({
      title: 'Unsuspend User',
      text: 'Are you sure you want to unsuspend this user?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, unsuspend',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.store.dispatch(userUnsuspend({ id, page: this.currentPage, per_page: this.pageSize, search: this.term, ordering: this.ordering || undefined, is_minor: this.isMinor || undefined, is_suspended: this.statusFilter || undefined, filter_subs_status: this.filterSubsStatus || undefined, filter_country: this.filterCountry || undefined }));
      }
    });
  }

  onDeleteUser(id: any): void {
    Swal.fire({
      title: 'Delete User',
      text: 'Are you sure you want to delete this user? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.store.dispatch(deleteUser({ id, page: this.currentPage, per_page: this.pageSize, search: this.term, ordering: this.ordering || undefined, is_minor: this.isMinor || undefined, is_suspended: this.statusFilter || undefined, filter_subs_status: this.filterSubsStatus || undefined, filter_country: this.filterCountry || undefined }));
      }
    });
  }

  viewUserDetails(id: any) {
    this.router.navigate(['/users', id]);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
