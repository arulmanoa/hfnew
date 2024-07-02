import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from 'src/app/_guards';

import { RowDataService } from 'src/app/views/personalised-display/row-data.service';
import { HrattendanceentriesComponent } from 'src/app/views/attendance/hrattendanceentries/hrattendanceentries.component';

import { AttendanceentriesComponent } from 'src/app/views/attendance/attendanceentries/attendanceentries.component';
import { EmployeeAttendanceComponent } from 'src/app/views/attendance/employee-attendance/employee-attendance.component';
import { TeamattendanceComponent } from 'src/app/views/attendance/teamattendance/teamattendance.component';
import { EmployeeleaveentriesComponent } from 'src/app/views/leavemanagement/employeeleaveentries/employeeleaveentries.component';
import { TeamleaverequestComponent } from 'src/app/views/leavemanagement/teamleaverequest/teamleaverequest.component';
import { ManagerleaverequestComponent } from 'src/app/views/leavemanagement/managerleaverequest/managerleaverequest.component';
import { EntitlementdefinitionComponent } from 'src/app/views/leavemanagement/entitlementdefinition/entitlementdefinition.component';
import { OrganizationAttendanceComponent } from 'src/app/views/attendance/organization-attendance/organization-attendance.component';
import { EmployeeCompensationUiComponent } from 'src/app/views/Compensation/employee-compensation-ui/employee-compensation-ui.component';
import { EmployeeRequestApproverListingComponent } from 'src/app/views/employee-request/employee-request-approver-listing/employee-request-approver-listing.component'
import { AttendanceComponent } from 'src/app/views/attendance/attendance/attendance.component';
import { EmployeeMyRequestsUiComponent } from 'src/app/views/emloyeemyrequests/employee-myrequests-ui/employee-myrequests-ui.component';
import { AttendancereportComponent } from 'src/app/views/attendance/attendancereport/attendancereport.component';
import { AttendanceMonthlyReportComponent } from '../../attendance/attendance-monthly-report/attendance-monthly-report.component';
import { AtteandanceBreakUpDetailsComponent } from '../../attendance/atteandance-break-up-details/atteandance-break-up-details.component';
import { EmployeeRegularizeApprovalRejectionComponent } from 'src/app/views/attendance/employee-regularize-approval-rejection/employee-regularize-approval-rejection.component';
import { AttendanceBaseReportComponent } from '../../attendance/attendance-base-report/attendance-base-report.component';
import { ViewShiftsByEmployeeComponent } from '../../attendance/view-shifts-by-employee/view-shifts-by-employee.component';
import { ViewAllEmployeeShiftsComponent } from '../../attendance/view-all-employee-shifts/view-all-employee-shifts.component';
import { AttendanceSummaryReportViewComponent } from '../../attendance/attendance-summary-report-view/attendance-summary-report-view.component';
import { AttendanceSummaryDailyViewReportComponent } from '../../attendance/attendance-summary-daily-view-report/attendance-summary-daily-view-report.component';
import { AttendanceReportForItcComponent } from '../../attendance/attendance-report-for-itc/attendance-report-for-itc.component';
import { MonthlyLeaveRequestReportForITCComponent } from '../../attendance/monthly-leave-request-report-for-itc/monthly-leave-request-report-for-itc.component';
import { EmployeeAttendanceViewComponent } from '../../attendance/employee-attendance-view/employee-attendance-view.component';
import { BiometricPunchToolComponent } from '../../attendance/biometric-punch-tool/biometric-punch-tool.component';
import { EmployeeAttendanceManagerViewComponent } from '../../attendance/employee-attendance-manager-view/employee-attendance-manager-view.component';
import { BulkUploadLeaveAttendanceComponent } from '../../attendance/bulk-upload-leave-attendance/bulk-upload-leave-attendance.component';

const routes: Routes = [{
  path: '',

  children: [
    { path: 'attendanceentries', component: AttendanceentriesComponent, data: { breadcrumb: 'Attendance Regularization' } }, // submenu 
    { path: 'hrattendanceentries', component: HrattendanceentriesComponent, data: { breadcrumb: 'Attendance Entries' } }, // submenu
    {
      path: 'employeeattendance',
      component: EmployeeAttendanceComponent, data: { breadcrumb: 'Employee Attendance Entries' },
      canActivate: [AuthGuard]
    },
    {
      path: 'teamattendance', component: TeamattendanceComponent,
      data: { breadcrumb: 'Team Attendance' },
      canActivate: [AuthGuard]
    },
    { path: 'attendancereport', component: AttendancereportComponent, data: { breadcrumb: 'Attendance Report' } }, 

    { path: 'myteamattendance', component: OrganizationAttendanceComponent, data: { breadcrumb: 'My Team Attendance' } },
    // Employee Compensation Claims
    { path: 'AttendanceConfigure', component: AttendanceComponent },
    // Attendance Monthly Report
    { path: 'attendanceMonthlyReportView', component: AttendanceMonthlyReportComponent, data: { breadcrumb: 'Attendance Monthly Report' } },
    { path: 'attendanceBreakupDetails', component: AtteandanceBreakUpDetailsComponent, data: { breadcrumb: 'Attendance Breakup Details' } },
    { path: 'regularizeAttendanceEntries', component: EmployeeRegularizeApprovalRejectionComponent, data: { breadcrumb: 'Approve Regularization' } },
    { path: 'attendanceBaseReportView', component: AttendanceBaseReportComponent, data: { breadcrumb: 'Attendance Base Report' } },
    { path: 'myShifts', component: ViewShiftsByEmployeeComponent, canActivate: [AuthGuard], data: { breadcrumb: 'View My Shifts' } },
    { path: 'employeeShifts', component: ViewAllEmployeeShiftsComponent, data: { breadcrumb: 'View Employee Shifts' } },
    { path: 'attendanceSummaryReportView', component: AttendanceSummaryReportViewComponent, data: { breadcrumb: 'Attendance Summary Report' } },
    { path: 'attendanceSummaryDailyReportView', component: AttendanceSummaryDailyViewReportComponent, data: { breadcrumb: 'Attendance Summary Report' } },
    { path: 'attendanceReportITC', component: AttendanceReportForItcComponent, data: { breadcrumb: 'Attendance Report' } },
    { path: 'MLReportViewITC', component: MonthlyLeaveRequestReportForITCComponent, data: { breadcrumb: 'ML Report' } },
    {path: 'employeeAttendanceEntries',component: EmployeeAttendanceViewComponent, data: { breadcrumb: 'My Attendance' }, canActivate: [AuthGuard] }, // for allen
    {path: 'biometricPunchData',component: BiometricPunchToolComponent, data: { breadcrumb: 'Punch tool' }, canActivate: [AuthGuard] }, // for allen
    {path: 'teamAttendanceView',component: EmployeeAttendanceManagerViewComponent, data: { breadcrumb: 'Team Attendance' }, canActivate: [AuthGuard] }, // for allen
    {path: 'upload',component: BulkUploadLeaveAttendanceComponent, data: { breadcrumb: 'Bulk Upload' }, }, // for allen
  ]
}

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class AttendanceRoutingModule {

}









