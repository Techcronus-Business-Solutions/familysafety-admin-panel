import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { GlobalComponent } from '../../global-component';

const API_URL = GlobalComponent.API_URL;

@Injectable({
  providedIn: 'root',
})
export class SubscriptionService {
  constructor(private http: HttpClient) { }

  private createHeaders(token: string) {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      })
    };
  }

  private parseApiError(error: any): string {
    if (!error) {
      return 'Something went wrong';
    }
    if (typeof error === 'string' && error.trim()) {
      return error;
    }

    const payload = error.error ?? error;
    if (payload) {
      if (typeof payload === 'string' && payload.trim()) {
        return payload;
      }
      if (payload.message) {
        return payload.message;
      }
      if (payload.detail) {
        return payload.detail;
      }
      if (payload.error) {
        return typeof payload.error === 'string' ? payload.error : payload.error.message || JSON.stringify(payload.error);
      }
    }
    return 'Something went wrong';
  }

  private handleApiResponse(response: any, expectedStatus: number | number[] = 200): any {
    if (response && typeof response.status !== 'undefined') {
      const expectedStatuses = Array.isArray(expectedStatus) ? expectedStatus : [expectedStatus];
      if (!expectedStatuses.includes(response.status)) {
        const message = response.message || response.error || `Request failed with status ${response.status}`;
        throw new Error(message);
      }
      return response;
    }
    return response;
  }

  private handleError(error: any) {
    const message = this.parseApiError(error);
    return throwError(() => message);
  }

  getSubscriptions(token: string, params?: { page?: number; per_page?: number; search?: string }): Observable<any> {
    const url = API_URL + 'subscriptions/';
    let httpParams = new HttpParams();
    if (params) {
      if (typeof params.page !== 'undefined' && params.page !== null) {
        httpParams = httpParams.set('page', String(params.page));
      }
      if (typeof params.per_page !== 'undefined' && params.per_page !== null) {
        httpParams = httpParams.set('per_page', String(params.per_page));
      }
      if (typeof params.search !== 'undefined' && params.search !== null && params.search !== '') {
        httpParams = httpParams.set('search', params.search);
      }
    }

    return this.http.get<any>(url, { ...this.createHeaders(token), params: httpParams }).pipe(
      map((response: any) => this.handleApiResponse(response, 200)),
      catchError((error: any) => this.handleError(error))
    );
  }

  suspendUser(token: string, id: any): Observable<any> {
    const url = API_URL + `subscriptions/activity/${id}/`;
    return this.http.post<any>(url, {}, this.createHeaders(token)).pipe(
      map((response: any) => this.handleApiResponse(response, 200)),
      catchError((error: any) => this.handleError(error))
    );
  }

  createSubscription(token: string, payload: any): Observable<any> {
    const url = API_URL + 'subscriptions/';
    return this.http.post<any>(url, payload, this.createHeaders(token)).pipe(
      map((response: any) => this.handleApiResponse(response, 201)),
      catchError((error: any) => this.handleError(error))
    );
  }

  getSubscription(token: string, id: any, language?: string): Observable<any> {
    let url = API_URL + `subscriptions/${id}/`;
    if (language) {
      url += `?lang=${language}`;
    }

    return this.http.get<any>(url, this.createHeaders(token)).pipe(
      map((response: any) => {
        return this.handleApiResponse(response, 200);
      }),
      catchError((error: any) => this.handleError(error))
    );
  }

  updateSubscription(token: string, id: any, payload: any): Observable<any> {
    const url = API_URL + `subscriptions/${id}/`;
    return this.http.patch<any>(url, payload, this.createHeaders(token)).pipe(
      map((response: any) => this.handleApiResponse(response, [200, 201])),
      catchError((error: any) => this.handleError(error))
    );
  }

  deleteSubscription(token: string, id: any): Observable<any> {
    const url = API_URL + `subscriptions/${id}/`;
    return this.http.delete<any>(url, this.createHeaders(token)).pipe(
      map((response: any) => this.handleApiResponse(response, 200)),
      catchError((error: any) => this.handleError(error))
    );
  }

  getLanguages(token: string): Observable<any> {
    const url = API_URL + `languages/`;
    return this.http.get<any>(url, this.createHeaders(token)).pipe(
      map((response: any) => this.handleApiResponse(response, 200)),
      catchError((error: any) => this.handleError(error))
    );
  }

  getPlanTiers(token: string, lang: string): Observable<any> {
    const url = API_URL + 'plan-tiers/';
    const params = new HttpParams().set('lang', lang);
    return this.http.get<any>(url, { ...this.createHeaders(token), params }).pipe(
      map((response: any) => this.handleApiResponse(response, 200)),
      catchError((error: any) => this.handlePlanTierError(error, 'load the plan features'))
    );
  }

  updatePlanTiers(token: string, lang: string, payload: any): Observable<any> {
    const url = API_URL + 'plan-tiers/';
    const params = new HttpParams().set('lang', lang);
    return this.http.patch<any>(url, payload, { ...this.createHeaders(token), params }).pipe(
      map((response: any) => this.handleApiResponse(response, [200, 201])),
      catchError((error: any) => this.handlePlanTierError(error, 'save the plan features'))
    );
  }

  translatePlanLabels(token: string, lang: string): Observable<any> {
    const url = API_URL + 'subscriptions-plan-translate-label/';
    const params = new HttpParams().set('lang', lang);
    return this.http.post<any>(url, {}, { ...this.createHeaders(token), params }).pipe(
      map((response: any) => this.handleApiResponse(response, [200, 201])),
      catchError((error: any) => this.handlePlanTierError(error, 'translate the plan details'))
    );
  }

  /**
   * Turns a failed plan-tier request into a clear, user-facing message.
   * `action` completes the sentence "We couldn't ..." (e.g. "save the plan features").
   */
  private handlePlanTierError(error: any, action: string) {
    return throwError(() => this.buildPlanTierErrorMessage(error, action));
  }

  private buildPlanTierErrorMessage(error: any, action: string): string {
    // handleApiResponse throws a plain Error when the body carries an unexpected status.
    if (error instanceof Error && typeof (error as any).status === 'undefined') {
      return `We couldn't ${action}. ${this.withPeriod(error.message || 'Please try again.')}`;
    }

    const status: number = typeof error?.status === 'number' ? error.status : -1;
    const serverDetail = this.extractServerDetail(error?.error);

    switch (true) {
      case status === 0:
        return `We couldn't ${action} because the server is unreachable. Please check your internet connection and try again.`;
      case status === 400 || status === 422:
        return serverDetail
          ? `We couldn't ${action}. ${this.withPeriod(serverDetail)}`
          : `We couldn't ${action} because some of the information is invalid. Please review your changes and try again.`;
      case status === 401:
        return 'Your session has expired. Please sign in again to continue.';
      case status === 403:
        return `You don't have permission to ${action}. Please contact an administrator if you need access.`;
      case status === 404:
        return `We couldn't ${action} because the requested resource was not found.`;
      case status === 408 || status === 504:
        return `The request to ${action} timed out. Please try again in a moment.`;
      case status === 409:
        return serverDetail
          ? `We couldn't ${action}. ${this.withPeriod(serverDetail)}`
          : `We couldn't ${action} because the data was changed by someone else. Please reload and try again.`;
      case status === 429:
        return 'Too many requests were sent in a short time. Please wait a moment and try again.';
      case status >= 500:
        return `Something went wrong on the server while trying to ${action}. Please try again later.`;
      default:
        return serverDetail
          ? `We couldn't ${action}. ${this.withPeriod(serverDetail)}`
          : `We couldn't ${action} due to an unexpected error. Please try again.`;
    }
  }

  /** Pulls a readable message out of the various error body shapes the API can return. */
  private extractServerDetail(body: any): string {
    if (!body) {
      return '';
    }
    if (typeof body === 'string') {
      // Ignore HTML error pages (e.g. a Django debug page).
      return /<\/?[a-z][\s\S]*>/i.test(body) ? '' : body.trim();
    }
    if (typeof body !== 'object') {
      return String(body);
    }
    for (const key of ['message', 'detail', 'error']) {
      const value = body[key];
      if (typeof value === 'string' && value.trim()) {
        return value.trim();
      }
    }
    const fieldErrors = body.errors ?? body.error ?? body;
    return this.flattenFieldErrors(fieldErrors).slice(0, 3).join(' ');
  }

  private flattenFieldErrors(value: any, path = ''): string[] {
    if (value === null || value === undefined) {
      return [];
    }
    if (typeof value === 'string') {
      const field = path ? this.humanizeField(path) : '';
      return [field ? `${field}: ${value}` : value];
    }
    if (Array.isArray(value)) {
      return value.flatMap(v => this.flattenFieldErrors(v, path));
    }
    if (typeof value === 'object') {
      return Object.entries(value)
        .filter(([key]) => !['status', 'success', 'code', 'data'].includes(key))
        .flatMap(([key, v]) => this.flattenFieldErrors(v, path ? `${path}.${key}` : key));
    }
    return [];
  }

  /** "tiers[0].limits" -> "Tiers 1 limits", "non_field_errors" -> "" */
  private humanizeField(path: string): string {
    if (/non_field_errors/.test(path)) {
      return '';
    }
    const text = path
      .replace(/\[(\d+)\]/g, (_, i) => ` ${Number(i) + 1} `)
      .replace(/[._-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  private withPeriod(text: string): string {
    const t = text.trim().replace(/^:\s*/, '');
    return /[.!?]$/.test(t) ? t : `${t}.`;
  }

  translateSubscription(token: string, id: any, lang: string): Observable<any> {
    const url = API_URL + `subscriptions/${id}/translate/`;
    const params = new HttpParams().set('lang', lang);
    return this.http.post<any>(url, {}, { ...this.createHeaders(token), params }).pipe(
      map((response: any) => this.handleApiResponse(response, 200)),
      catchError((error: any) => this.handleError(error))
    );
  }
}
