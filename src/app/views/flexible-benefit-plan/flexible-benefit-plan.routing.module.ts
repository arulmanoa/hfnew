import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RowDataService } from 'src/app/views/personalised-display/row-data.service';
import { FbpListingForEmployeeComponent } from './fbp-listing-for-employee/fbp-listing-for-employee.component';
import { FlexiBenefitPlanTimeSlotComponent } from './flexi-benefit-plan-time-slot/flexi-benefit-plan-time-slot.component';
import { FlexibleBenefitsPlanDeclarationComponent } from './flexible-benefits-plan-declaration/flexible-benefits-plan-declaration.component';

const routes: Routes = [
  {
    path: '',
    children: [{ 
        path: 'flexiBenefitPlanDeclaration', 
        component: FlexibleBenefitsPlanDeclarationComponent, 
        data: { title: 'FBP Declaration', breadcrumb: 'FBP Declaration' }
    }, { 
      path: 'fbpSlotForEmployee', 
      component: FbpListingForEmployeeComponent, 
      data: { title: 'FBP Submission List', breadcrumb: 'FBP Submission List' }
    }, { 
        path: 'createNewFbpSlot', 
        component: FlexiBenefitPlanTimeSlotComponent,
        data: { title: 'FBP Submission Slot', breadcrumb: 'FBP Submission Slot' },
        resolve: { DataInterface: RowDataService }
    }]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FlexibleBenefitPlanRoutingModule { }