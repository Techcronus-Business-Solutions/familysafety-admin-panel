import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PrivacyPolicyManagementComponent } from './privacy-policy-management.component';

const routes: Routes = [
  { path: '', component: PrivacyPolicyManagementComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PrivacyPolicyManagementRoutingModule { }
