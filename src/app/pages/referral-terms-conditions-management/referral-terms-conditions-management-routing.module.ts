import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReferralTermsConditionsManagementComponent } from './referral-terms-conditions-management.component';

const routes: Routes = [
  { path: '', component: ReferralTermsConditionsManagementComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReferralTermsConditionsManagementRoutingModule { }
