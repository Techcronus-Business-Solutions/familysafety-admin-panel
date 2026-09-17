import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { GlobalComponent } from '../global-component';

@Component({
  selector: 'app-privacy-policy',
  imports: [CommonModule],
  templateUrl: './privacy-policy.component.html',
  styleUrl: './privacy-policy.component.scss',
})
export class PrivacyPolicyComponent implements OnInit {
  content: SafeHtml = '';
  loading = true;

  constructor(private http: HttpClient, private sanitizer: DomSanitizer, private translate: TranslateService) { }

  ngOnInit(): void {
    document.documentElement.setAttribute('data-preloader', 'disable');

    const preloader = document.getElementById('preloader');
    if (preloader) {
      preloader.style.opacity = '0';
      preloader.style.visibility = 'hidden';
      preloader.style.display = 'none';
    }

    this.http.get<any>(`${GlobalComponent.API_URL}languages/`).subscribe({
      next: (response: any) => {
        const languages = Array.isArray(response) ? response : (response?.data ?? response?.languages ?? []);
        this.loadPrivacyPolicy(this.resolveLanguage(languages));
      },
      error: () => {
        this.loadPrivacyPolicy('en');
      }
    });
  }

  private resolveLanguage(languages: any[]): string {
    const browserLang = (this.translate.getBrowserLang() || '').toLowerCase();
    const supportedCodes = (languages || []).map((lang: any) => String(lang?.code ?? lang?.id ?? '').toLowerCase());
    return supportedCodes.includes(browserLang) ? browserLang : 'en';
  }

  private loadPrivacyPolicy(lang: string): void {
    const params = new HttpParams().set('lang', lang);

    this.http.get<any>(`${GlobalComponent.API_URL}privacy-policy/`, { params }).subscribe({
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
