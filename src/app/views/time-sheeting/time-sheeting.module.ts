import { NgModule,CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NZ_I18N, en_US } from "ng-zorro-antd";
import { NgZorroAntdModule, NZ_ICONS } from "ng-zorro-antd";
import { NgxWebstorageModule } from 'ngx-webstorage';
import { NgbModule, NgbPopoverModule  } from '@ng-bootstrap/ng-bootstrap';
import { IconDefinition } from "@ant-design/icons-angular";
import * as AllIcons from "@ant-design/icons-angular/icons";
import { DatepickerModule } from 'ngx-bootstrap/datepicker';
import { BsDatepickerModule } from 'ngx-bootstrap';
import { NgxSpinnerModule } from "ngx-spinner";
import { NgSelectModule } from '@ng-select/ng-select'; 
import { MatTooltipModule } from '@angular/material';
import { ChartsModule } from 'ng2-charts';
import { SharedModule } from 'primeng/components/common/shared';
import { LayoutModule } from '@angular/cdk/layout';
import { Ng2SearchPipeModule } from 'ng2-search-filter';

import { TimeSheetingRoutingModule } from './time-sheeting-routing.module';
import { EmployeeTimesheetComponent } from './employee-time-sheet/employee-timesheet/employee-timesheet.component';
import { EmployeeSubmittedTimesheetComponent } from './employee-time-sheet/employee-submitted-timesheet/employee-submitted-timesheet.component';
import { EmployeeSavedTimesheetComponent } from './employee-time-sheet/employee-saved-timesheet/employee-saved-timesheet.component';
import { TimesheetEntriesByEmployeeComponent } from './employee-time-sheet/timesheet-entries-by-employee/timesheet-entries-by-employee.component';
import { TimesheetDetailedViewComponent } from './timesheet-detailed-view/timesheet-detailed-view.component';
import { ManagerTimesheetListingComponent } from './manager-time-sheet/manager-timesheet-listing/manager-timesheet-listing.component';
import { ManagerTimesheetRequestsHistoryComponent } from './manager-time-sheet/manager-timesheet-requests-history/manager-timesheet-requests-history.component';
import { TimesheetReportsComponent } from './timesheet-reports/timesheet-reports.component';
import { TimesheetReportsByEmployeeComponent } from './timesheet-reports-by-employee/timesheet-reports-by-employee.component';
import { TimesheetReportsByProjectComponent } from './timesheet-reports-by-project/timesheet-reports-by-project.component';
import { CreateProjectComponent } from './create-project/create-project.component';
import { CreateEmployeeProjectMappingComponent } from './create-employee-project-mapping/create-employee-project-mapping.component';
import { CreateProjectActivityMappingComponent } from './create-project-activity-mapping/create-project-activity-mapping.component';
import { ProjectListingComponent } from './project-listing/project-listing.component';
import { ProjectActivityListingComponent } from './project-activity-listing/project-activity-listing.component';
import { ProjectEmployeeListingComponent } from './project-employee-listing/project-employee-listing.component';
import { UpdateEmployeeProjectMappingComponent } from './update-employee-project-mapping/update-employee-project-mapping.component';

import { CreateActivityByEmployeeComponent } from './create-activity-by-employee/create-activity-by-employee.component';

import { registerLocaleData } from '@angular/common';
import localeEn from '@angular/common/locales/en';

import { AngularSlickgridModule } from 'angular-slickgrid';

const antDesignIcons = AllIcons as { 
  [key: string]: IconDefinition;
};
const icons: IconDefinition[] = Object.keys(antDesignIcons).map(
  key => antDesignIcons[key]
);

registerLocaleData(localeEn); 


@NgModule({
  declarations: [
    EmployeeTimesheetComponent,
    TimesheetEntriesByEmployeeComponent,
    EmployeeSavedTimesheetComponent,
    EmployeeSubmittedTimesheetComponent,
    TimesheetDetailedViewComponent,
    ManagerTimesheetListingComponent,
    ManagerTimesheetRequestsHistoryComponent,
    TimesheetReportsComponent,
    TimesheetReportsByEmployeeComponent,
    TimesheetReportsByProjectComponent,
    CreateProjectComponent,
    CreateEmployeeProjectMappingComponent,
    CreateProjectActivityMappingComponent,
    ProjectListingComponent,
    ProjectActivityListingComponent,
    ProjectEmployeeListingComponent,
    UpdateEmployeeProjectMappingComponent,
    CreateActivityByEmployeeComponent
  ],
  imports: [
    TimeSheetingRoutingModule,
    CommonModule, 
    FormsModule,
    SharedModule,
    LayoutModule,
    ReactiveFormsModule,
    NgSelectModule,   
    NgxWebstorageModule.forRoot(),
    NgbModule.forRoot(),
    NgbPopoverModule,
    NgZorroAntdModule.forRoot(),
    BsDatepickerModule.forRoot(),
    DatepickerModule.forRoot(),
    MatTooltipModule,
    NgxSpinnerModule,
    ChartsModule,
    Ng2SearchPipeModule,
    AngularSlickgridModule.forRoot({
      enableAutoResize: true,
    })
  ],
  entryComponents: [
    TimesheetDetailedViewComponent,
    ManagerTimesheetRequestsHistoryComponent,
    UpdateEmployeeProjectMappingComponent,
    CreateActivityByEmployeeComponent
  ],
  exports: [
    NgZorroAntdModule
  ],
  providers: [
  { provide: NZ_I18N, useValue: en_US }, { provide: NZ_ICONS, useValue: icons }
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]

})
export class TimeSheetingModule { }
