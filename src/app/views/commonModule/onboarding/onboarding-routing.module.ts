import { NgModule } from '@angular/core';
import { AuthGuard, MaintenanceGuard } from 'src/app/_guards';
import { ExtraOptions,Routes, RouterModule } from '@angular/router';
import { SubmissionListComponent } from 'src/app/views/onboarding/submission-list/submission-list.component';
import { OnboardingOpsListComponent } from 'src/app/views/onboarding/onboarding-ops-list/onboarding-ops-list.component';
import { VendorOnboardingComponent } from 'src/app/views/onboarding/vendor-onboarding/vendor-onboarding.component';
import{VendoronboardingListComponent} from 'src/app/views/onboarding/vendoronboarding-list/vendoronboarding-list.component'
import{OnboardingProcessLogsComponent} from 'src/app/views/onboarding/onboarding-process-logs/onboarding-process-logs.component';
import { OnboardingComponent } from 'src/app/views/onboarding/onboarding.component';
import { OnboardingMakeofferComponent } from 'src/app/views/onboarding/onboarding-makeoffer/onboarding-makeoffer.component';
import { OnboardingQCComponent } from 'src/app/views/onboarding/onboarding-qc/onboarding-qc.component';
import { OnboardingListComponent } from 'src/app/views/onboarding/listing/onboardinglist.component';
import { VendorQcComponent } from 'src/app/views/onboarding/vendor-qc/vendor-qc.component';
import { VendorQcListComponent } from 'src/app/views/onboarding/vendor-qc-list/vendor-qc-list.component';
import { OnboardingDetailsComponent } from 'src/app/views/onboarding/onboarding-details/onboarding-details.component';
import { OnboardingQcListComponent } from 'src/app/views/onboarding/onboarding_qclist/onboarding-qc-list.component';
import { MigrationListComponent } from 'src/app/views/migration/migration-list/migration-list.component';
import { RegenerateLetterComponent } from '../../Employee/regenerate-letter/regenerate-letter.component';
import { OnboardingrequestComponent } from '../../onboarding/onboardingrequest/onboardingrequest.component';

const routes: Routes = [{
  path: '',
 // component: SubmissionListComponent,
  // canActivate: [AuthGuard],
  children: [{
    path: 'submissionList',
    component: SubmissionListComponent,
    canActivate: [AuthGuard],
    data: { breadcrumb: 'Submission List' },
  },
  {
    path : 'onboarding_ops',
    component : OnboardingOpsListComponent,
    canActivate: [MaintenanceGuard],
    data: { breadcrumb: 'Onboarding List' },
  },
  {
    path : 'vendorOnboarding',
    component : VendorOnboardingComponent,
    data: { breadcrumb: 'Vendor Onboarding' }
  },
  {
    path : 'vendorOnboardingList',
    component : VendoronboardingListComponent,
    canActivate: [MaintenanceGuard, AuthGuard],
    data: { breadcrumb: 'Vendor Onboarding List' }
  },
  {
    path : 'onboardProcessLogs',
    component : OnboardingProcessLogsComponent,
    data: {  breadcrumb: 'Onboarding Process Logs' } 
  },
  {
    path : 'onboardingRequest',
    component : OnboardingrequestComponent,
    data: { breadcrumb: 'Onboarding Request' } 
  },
  // {
  //   path : 'onboardingRequest1',
  //   component : OnboardingrequestComponent,
  //   data: { breadcrumb: 'Onboarding Request' } 
  // },
  // {
  //   path : 'onboarding_revise',
  //   component : OnboardingMakeofferComponent,
  //   data: { breadcrumb: 'Onboarding Revise' } 
  // },
  {
    path : 'onboarding_revise',
    component : OnboardingrequestComponent,
    data: { breadcrumb: 'Onboarding Revise' } 
  },
  {
    path : 'regenerateLetter',
    component : RegenerateLetterComponent,
    data: { breadcrumb: 'Re-Generate Letter' }
  },
  // {
  //   path : 'onbqclist',
  //   component : OnboardingQcListComponent
  // },
  {
    path : 'onboardingList',
    component : OnboardingListComponent,
    canActivate: [MaintenanceGuard, AuthGuard],
    data: {breadcrumb: 'Onboarding List' }
  },
  {
    path : 'vendorOnboarding_qc',
    component : VendorQcComponent,
    data: { breadcrumb: 'Vendor Onboarding List' }
  },
  {
    path : 'vendorOnboardingQcList',
    component : VendorQcListComponent,
    data: { breadcrumb: 'Vendor Onboarding List' }
  },
  {
    path : 'onboardingDetails',
    component : OnboardingDetailsComponent
  },
  { path: 'candidate_information', 
    component: OnboardingrequestComponent 
  },
  { path: 'migrationlist',
   component: MigrationListComponent, 
   canActivate: [AuthGuard] 
  },
  { path: 'regenerateLetter', 
  component: RegenerateLetterComponent, 
  data: { breadcrumb: 'Re-Generate Letter' } },
],
}];
const config: ExtraOptions = {
  useHash: false,
};
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OnboardingRoutingModule { 
  if(window) {
    window.console.log = window.console.warn = window.console.info = function () {
      // Don't log anything.
    };
  }
}
export const routedComponents = [
  SubmissionListComponent,
  OnboardingOpsListComponent,
  VendorOnboardingComponent
];