import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TermsConditionsManagementComponent } from './terms-conditions-management.component';

const routes: Routes = [
  { path: '', component: TermsConditionsManagementComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TermsConditionsManagementRoutingModule { }
