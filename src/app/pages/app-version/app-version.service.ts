import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { GlobalComponent } from '../../global-component';

@Injectable({ providedIn: 'root' })
export class AppVersionService {
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

  getAppVersion(): Observable<any> {
    return this.http
      .get<any>(`${this.apiUrl}app-version-config/`, { headers: this.headers })
      .pipe(catchError((error: any) => throwError(() => this.parseError(error))));
  }

  updateAppVersion(payload: any): Observable<any> {
    return this.http
      .patch<any>(`${this.apiUrl}app-version-config/`, payload, { headers: this.headers })
      .pipe(catchError((error: any) => throwError(() => this.parseError(error))));
  }
}
