import { NgModule } from '@angular/core';
import { ExtraOptions,Routes, RouterModule } from '@angular/router';
import { AuthGuard, MaintenanceGuard } from 'src/app/_guards';
import { RowDataService } from 'src/app/views/personalised-display/row-data.service';

import { ProfileComponent } from 'src/app/views/ESS/ess/profile/profile.component';
import { MybankComponent } from 'src/app/views/ESS/ess/mybank/mybank.component';
import { NomineeInformationComponent } from 'src/app/views/ESS/ess/nominee-information/nominee-information.component';
import { OfficialInformationComponent } from 'src/app/views/ESS/ess/official-information/official-information.component';
import { MyinvestmentComponent } from 'src/app/views/ESS/ess/myinvestment/myinvestment.component';
import { MydocumentsComponent } from 'src/app/views/ESS/ess/mydocuments/mydocuments.component';
import { PreviousEmploymentComponent } from 'src/app/views/ESS/ess/previous-employment/previous-employment.component';
import { MypaymentsComponent } from 'src/app/views/ESS/ess/mypayments/mypayments.component';
import { SalaryDetailsComponent } from 'src/app/views/ESS/ess/salary-details/salary-details.component';
import { MycommunicationsComponent } from 'src/app/views/ESS/ess/mycommunications/mycommunications.component';
import { MyeducationComponent } from 'src/app/views/ESS/ess/myeducation/myeducation.component';
import { MyexperienceComponent } from 'src/app/views/ESS/ess/myexperience/myexperience.component';
// import { EmployeeDeductionsComponent } from 'src/app/views/ESS/ess/employee-deductions/employee-deductions.component';
import { TaxslipComponent } from 'src/app/views/Employee/taxslip/taxslip.component';
import { PayslipComponent } from 'src/app/views/Employee/payslip/payslip.component';
import { ExpenceBillEntryComponent } from "src/app/views/Employee/expence-bill-entry/expence-bill-entry.component";
import { BenefitsclubComponent } from 'src/app/views/Employee/benefitsclub/benefitsclub.component';
import { HrpolicyComponent } from 'src/app/views/Employee/hrpolicy/hrpolicy.component';
import { EmployeeDocsComponent } from 'src/app/views/Employee/employee-docs/employee-docs.component';
import { CustomdashboardComponent } from 'src/app/dashboard/customdashboard/customdashboard.component';
import { EssComponent } from '../../ESS/ess/ess.component';
import { EmployeeResignationComponent } from '../../ESS/ess/employee-resignation/employee-resignation.component';
import { OnlineJoiningKitComponent } from '../../ESS/ess/online-joining-kit/online-joining-kit.component';
import { EmployeesInfoComponent } from '../../Employee/employees-info/employees-info.component';

const routes: Routes = [{
  path: '',
  //canActivate: [AuthGuard],
  children: [{
    path: 'profile',
    component: ProfileComponent,
    resolve: { DataInterface: RowDataService }, data: { title: 'My Profile', breadcrumb: 'My Profile' } 
  },
  {
    path: 'bankInformation',
    component: MybankComponent,
    resolve: { DataInterface: RowDataService }, data: { title: 'My Bank', breadcrumb: 'My Bank' }
  },
  {
    path: 'nomineeInformation',
    component: NomineeInformationComponent,
    resolve: { DataInterface: RowDataService }, data: { title: 'My Nominee', breadcrumb: 'My Nominee' }
  },
  {
    path: 'currentEmployment',
    component: OfficialInformationComponent,
    resolve: { DataInterface: RowDataService }, data: { title: 'Official Info', breadcrumb: 'Official Info' } 
  },
  {
    path: 'investmentInformation',
    component: MyinvestmentComponent,
    resolve: { DataInterface: RowDataService }, data: { title: 'My Investments', breadcrumb: 'My Investments' }
  },
  {
    path: 'mydocuments',
    component: MydocumentsComponent,
    data: { breadcrumb: 'My Documents' }
  },
  {
    path: 'employmentInformation',
    component: PreviousEmploymentComponent,
    resolve: { DataInterface: RowDataService }, data: { title: 'Previous Employment', breadcrumb: 'Previous Employment' } 
  },
  {
    path: 'paymentInformation',
    component: MypaymentsComponent,
    resolve: { DataInterface: RowDataService }, data: { title: 'My Payment', breadcrumb: 'My Payment' }
  },
  {
    path: 'employee/salarydetails',
    component: SalaryDetailsComponent,
  },
  {
    path: 'employee/communication',
    component: MycommunicationsComponent,
  },
  {
    path: 'employee/myEducation',
    component: MyeducationComponent,
  },
  {
    path: 'employee/myExperience',
    component: MyexperienceComponent,
  },
  { path: 'employee', component: EssComponent, resolve: { DataInterface: RowDataService }, data: { title: 'Employee Details', breadcrumb: 'Employee Details' } },
  { path: 'employee/:id', component: EssComponent, resolve: { DataInterface: RowDataService }, data: { title: 'Employee Details', breadcrumb: 'Employee Details', isEncrypted: true } },
  
  // {
  //   path: 'employee/deductions',
  //   component: EmployeeDeductionsComponent,
  // },
  {
    path: 'taxSlip',
    component: TaxslipComponent,
    resolve: { DataInterface: RowDataService }, data: { breadcrumb: 'Tax Slip' }, canActivate: [AuthGuard]
  },
  {
    path: 'employeetaxslip',
    component: TaxslipComponent,
    resolve: { DataInterface: RowDataService }, data: { breadcrumb: 'Employee Tax Slip' }, canActivate: [AuthGuard]
  },
  {
    path: 'employeepayslip',
    component: PayslipComponent,
    resolve: { DataInterface: RowDataService }, data: { breadcrumb: 'Employee Pay Slip' }, canActivate: [AuthGuard]
  },
  {
    path: 'expenseBillEntry',
    component: ExpenceBillEntryComponent,
    resolve: { DataInterface: RowDataService }, data: { breadcrumb: ' Employee Bill List' }
  },
  {
    path: 'benefitclub',
    component: BenefitsclubComponent,
    data: { breadcrumb: 'Benefit Club' }
  },
  {
    path: 'hrpolicy',
    component: HrpolicyComponent,
    data: { breadcrumb: 'HR Documents' }, canActivate: [AuthGuard]
  },
  {
    path: 'employeeDocs',
    component: EmployeeDocsComponent,
    resolve: { DataInterface: RowDataService }, data: { breadcrumb: 'Employee Docs' }, canActivate: [AuthGuard]
  },
  { path: 'salaryReport',
   component: CustomdashboardComponent, canActivate: [MaintenanceGuard, AuthGuard], data: { breadcrumb: 'Salary Report' } },
   {
    path: 'resignation',
    component: EmployeeResignationComponent, canActivate: [AuthGuard],
    resolve: { DataInterface: RowDataService }, data: { breadcrumb: 'Resignation' }
  },
  {
    path: 'onlineJoiningKit',
    component: OnlineJoiningKitComponent,
    resolve: { DataInterface: RowDataService }, data: { breadcrumb: 'Online Joining Kit' }
  },
  {
    path: 'employeeInfo',
    component: EmployeesInfoComponent,
    data: { breadcrumb: 'Employee Directory' }, canActivate: [AuthGuard]
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
export class EssRoutingModule {
  if(window) {
    window.console.log = window.console.warn = window.console.info = function () {
      // Don't log anything.
    };
  }
 }
