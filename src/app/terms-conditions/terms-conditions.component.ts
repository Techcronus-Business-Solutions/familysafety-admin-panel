import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { GlobalComponent } from '../global-component';

@Component({
  selector: 'app-terms-conditions',
  imports: [CommonModule],
  templateUrl: './terms-conditions.component.html',
  styleUrl: './terms-conditions.component.scss',
})
export class TermsConditionsComponent implements OnInit {
  content: SafeHtml = '';
  loading = true;

  constructor(private http: HttpClient, private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    document.documentElement.setAttribute('data-preloader', 'disable');

    const preloader = document.getElementById('preloader');
    if (preloader) {
      preloader.style.opacity = '0';
      preloader.style.visibility = 'hidden';
      preloader.style.display = 'none';
    }

    const params = new HttpParams().set('lang', 'en');

    this.http.get<any>(`${GlobalComponent.API_URL}terms-conditions/`, { params }).subscribe({
      next: (response: any) => {
        const data = Array.isArray(response?.data) ? response.data[0] : (response?.data ?? response);
        this.content = this.sanitizer.bypassSecurityTrustHtml(data?.html ?? '');
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
