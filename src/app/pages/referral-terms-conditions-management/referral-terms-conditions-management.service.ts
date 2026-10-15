import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { GlobalComponent } from '../../global-component';

@Injectable({ providedIn: 'root' })
export class ReferralTermsConditionsManagementService {
  private apiUrl = GlobalComponent.API_URL;

  constructor(private http: HttpClient) { }

  private get headers(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({ 'Content-Type': 'application/json', Authorization: `Bearer ${token}` });
  }

  private parseError(error: any): string {
    const payload = error?.error ?? error;
    return payload?.detail ?? payload?.message ?? payload?.error ?? 'Something went wrong';
  }

  getLanguages(): Observable<any> {
    return this.http
      .get<any>(`${this.apiUrl}languages/`, { headers: this.headers })
      .pipe(catchError((error: any) => throwError(() => this.parseError(error))));
  }

  getReferralTermsConditions(language?: string): Observable<any> {
    let params = new HttpParams();
    if (language) {
      params = params.set('lang', language);
    }
    return this.http
      .get<any>(`${this.apiUrl}referral-terms-conditions/`, { headers: this.headers, params })
      .pipe(catchError((error: any) => throwError(() => this.parseError(error))));
  }

  updateReferralTermsConditions(payload: any, language?: string): Observable<any> {
    let params = new HttpParams();
    if (language) {
      params = params.set('lang', language);
    }
    return this.http
      .patch<any>(`${this.apiUrl}referral-terms-conditions/`, payload, { headers: this.headers, params })
      .pipe(catchError((error: any) => throwError(() => this.parseError(error))));
  }
}
