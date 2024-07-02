import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RowDataService } from 'src/app/views/personalised-display/row-data.service';
import { AuthGuard } from 'src/app/_guards';
import { EmployeeTimesheetComponent } from './employee-time-sheet/employee-timesheet/employee-timesheet.component';
import { ManagerTimesheetListingComponent } from './manager-time-sheet/manager-timesheet-listing/manager-timesheet-listing.component';
import { TimesheetReportsComponent } from './timesheet-reports/timesheet-reports.component';
import { TimesheetEntriesByEmployeeComponent } from './employee-time-sheet/timesheet-entries-by-employee/timesheet-entries-by-employee.component';
import { TimesheetReportsByProjectComponent } from './timesheet-reports-by-project/timesheet-reports-by-project.component';
import { TimesheetReportsByEmployeeComponent } from './timesheet-reports-by-employee/timesheet-reports-by-employee.component';
import { CreateProjectComponent } from './create-project/create-project.component';
import { CreateProjectActivityMappingComponent } from './create-project-activity-mapping/create-project-activity-mapping.component';
import { CreateEmployeeProjectMappingComponent } from './create-employee-project-mapping/create-employee-project-mapping.component';
import { ProjectListingComponent } from './project-listing/project-listing.component';
import { ProjectActivityListingComponent } from './project-activity-listing/project-activity-listing.component';
import { ProjectEmployeeListingComponent } from './project-employee-listing/project-employee-listing.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'myTimesheet',
        component: EmployeeTimesheetComponent,
        data: { title: 'Timesheet', breadcrumb: 'Timesheet' },
        resolve: { DataInterface: RowDataService }
      }, {
        path: 'employeeTimesheetRequests',
        component: ManagerTimesheetListingComponent,
        data: { title: 'Timesheet Requests', breadcrumb: 'Timesheet Requests' },
        resolve: { DataInterface: RowDataService }
      }, {
        path: 'timesheetReport',
        component: TimesheetReportsComponent,
        data: { title: 'Timesheet Report', breadcrumb: 'Timesheet Report' },
        resolve: { DataInterface: RowDataService }
      }, {
        path: 'timesheetReportByEmployee',
        component: TimesheetReportsByEmployeeComponent,
        data: { title: 'Timesheet Report', breadcrumb: 'Timesheet Report' },
        resolve: { DataInterface: RowDataService }
      }, {
        path: 'timesheetReportByProject',
        component: TimesheetReportsByProjectComponent,
        data: { title: 'Timesheet Report', breadcrumb: 'Timesheet Report' },
        resolve: { DataInterface: RowDataService }
      }, {
        path: 'createProject',
        component: CreateProjectComponent,
        data: { title: 'Create Project', breadcrumb: 'Create Project' },
        resolve: { DataInterface: RowDataService }
      }, {
        path: 'projectListing',
        component: ProjectListingComponent,
        data: { title: 'Project', breadcrumb: 'Project' },
        resolve: { DataInterface: RowDataService }
      }, {
        path: 'createProjectActivityMapping',
        component: CreateProjectActivityMappingComponent,
        data: { title: 'Map Activity', breadcrumb: 'Map Activity' },
        resolve: { DataInterface: RowDataService }
      }, {
        path: 'projectActivityListing',
        component: ProjectActivityListingComponent,
        data: { title: 'Map Activity', breadcrumb: 'Map Activity' },
        resolve: { DataInterface: RowDataService }
      }, {
        path: 'createEmployeeProjectMapping',
        component: CreateEmployeeProjectMappingComponent,
        data: { title: 'Map Project', breadcrumb: 'Map Project' },
        resolve: { DataInterface: RowDataService }
      }, {
        path: 'employeeProjectMapping',
        component: ProjectEmployeeListingComponent,
        data: { title: 'Map Project', breadcrumb: 'Map Project' },
        resolve: { DataInterface: RowDataService }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TimeSheetingRoutingModule { }
