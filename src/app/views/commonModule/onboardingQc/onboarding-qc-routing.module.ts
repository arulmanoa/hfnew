import { NgModule } from '@angular/core';
import { AuthGuard, MaintenanceGuard } from 'src/app/_guards';
import { ExtraOptions,Routes, RouterModule } from '@angular/router';
import { OnboardingQcListComponent } from 'src/app/views/onboarding/onboarding_qclist/onboarding-qc-list.component';
import { OnboardingQCComponent } from 'src/app/views/onboarding/onboarding-qc/onboarding-qc.component';
import { LifecycleQclistComponent } from 'src/app/views/Employee/lifecycle-qclist/lifecycle-qclist.component';
import { LifecycleListComponent } from 'src/app/views/Employee/lifecycle-list/lifecycle-list.component';
import { RowDataService } from 'src/app/views/personalised-display/row-data.service';
// QC ESS
import { SelfserviceQclistComponent } from 'src/app/views/Employee/selfservice-qclist/selfservice-qclist.component';
import { SelfserviceQcComponent } from 'src/app/views/Employee/selfservice-qc/selfservice-qc.component';
import { InvestmentsQclistComponent } from 'src/app/views/Employee/investments-qclist/investments-qclist.component';
import { InvestmentsQcComponent } from 'src/app/views/Employee/investments-qc/investments-qc.component';
import { ExemptionQcComponent } from "src/app/views/Employee/exemption-qc/exemption-qc.component"
import { InvestmentpreviewComponent } from 'src/app/views/Employee/investmentpreview/investmentpreview.component';

const routes: Routes = [{
  path: '',
  //canActivate: [AuthGuard],
  children: [{
    path: 'onbqclist',
    component: OnboardingQcListComponent,
    canActivate: [MaintenanceGuard, AuthGuard], 
    data: { breadcrumb: 'Onboarding List' }
  },
  {
    path : 'onboarding_qc',
    component : OnboardingQCComponent,
    data: { breadcrumb: 'Onboarding List' }
  },
  // {
  //   path :'lifecycle_qclist',
  //   component : LifecycleQclistComponent,
  //   canActivate: [MaintenanceGuard, AuthGuard],
  //    data: { breadcrumb: 'ELC List' }
  // },
  // {
  //   path : 'employeeLifecycleList',
  //   component : LifecycleListComponent,
  //   data: { title: 'employeeLifecycleList', breadcrumb: 'ELC List' }, 
  //   canActivate: [AuthGuard] 
  // },
  {
    path : 'selfService_qc',
    component : SelfserviceQclistComponent,
    resolve: { DataInterface: RowDataService },
    data: { breadcrumb: 'Self Service' }, 
    canActivate: [AuthGuard]

  },
  {
    path : 'selfService',
    component :  SelfserviceQcComponent,
    data: { breadcrumb: 'Self Service' }
  },
  {
    path : 'investment_qc',
    component :  InvestmentsQclistComponent,
    resolve: { DataInterface: RowDataService },
     data: { breadcrumb: 'Investment Request' }, 
     canActivate: [AuthGuard] 
  },
  {
    path : 'investmentqc',
    component :  InvestmentsQcComponent,
    data: { breadcrumb: 'Investment Request' }
  },
  {
    path : 'exemptions_qc',
    component :  ExemptionQcComponent,
    data: { breadcrumb: 'exemptions Request' }
  },
 
  
  
  
  

]
}];
const config: ExtraOptions = {
  useHash: false,
};
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OnboardingQcRoutingModule { 
  if(window) {
    window.console.log = window.console.warn = window.console.info = function () {
      // Don't log anything.
    };
  }
}
