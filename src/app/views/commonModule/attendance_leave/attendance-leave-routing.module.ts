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

const routes: Routes = [{
  path: '',

  children: [
    // { path: 'attendanceentries', component: AttendanceentriesComponent, data: { breadcrumb: 'Attendance Regularization' } }, // submenu 
    // { path: 'hrattendanceentries', component: HrattendanceentriesComponent, data: { breadcrumb: 'Attendance Entries' } }, // submenu
    // { path: 'employeeattendance', component: EmployeeAttendanceComponent, data: { breadcrumb: 'Employee Attendance Entries' }, canActivate: [AuthGuard] },
    // { path: 'teamattendance', component: TeamattendanceComponent, data: { breadcrumb: 'Team Attendance' }, canActivate: [AuthGuard] },
    // //leave
    // { path: 'employeeleaveentries', component: EmployeeleaveentriesComponent, data: { breadcrumb: 'Employee Leave Entries' }, canActivate: [AuthGuard] },
    // //leave
    // { path: 'teamleaveentries', component: TeamleaverequestComponent, data: { breadcrumb: 'Team Leave Entries' } },
    // //leave
    // { path: 'proxymappinglist', component: ManagerleaverequestComponent, data: { breadcrumb: 'Proxy Mapping List' } }, // yet to be used 
    // //leave
    // { path: 'entitlementdefinition', component: EntitlementdefinitionComponent, resolve: { DataInterface: RowDataService }, data: { breadcrumb: 'Entitlement Definition' } },
    // { path: 'myteamattendance', component: OrganizationAttendanceComponent, data: { breadcrumb: 'My Team Attendance' } },
    // // Employee Compensation Claims
    // //leave
    // { path: 'compensationclaims', component: EmployeeCompensationUiComponent, data: { breadcrumb: 'Compensation Claims' } },
    // // Employee Leave Request Approve
    // //leave
    // { path: 'employeerequest', component: EmployeeRequestApproverListingComponent, data: { breadcrumb: 'EmployeeRequest' } },
    // { path: 'AttendanceConfigure', component: AttendanceComponent },
    // //leave
    // { path: 'employeemyrequests', component: EmployeeMyRequestsUiComponent, data: { breadcrumb: 'Employee My Requests' } },
  ]
}

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class AttendanceLeaveRoutingModule {

}
