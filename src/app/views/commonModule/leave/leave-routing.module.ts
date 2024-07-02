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
import { EmployeePermissionComponent } from 'src/app/views/permissions/employee-permission/employee-permission.component'
import { EmployeeOdEntriesComponent } from '../../leavemanagement/employee-od-entries/employee-od-entries.component';
import { TeamOdEntriesComponent } from '../../leavemanagement/team-od-entries/team-od-entries.component';
import { HrPendingRequestsApprovalComponent } from '../../leavemanagement/hr-pending-requests-approval/hr-pending-requests-approval.component';

const routes: Routes = [{
  path: '',

  children: [
    {
      path: 'employeeleaveentries', component: EmployeeleaveentriesComponent,
      data: { breadcrumb: 'Employee Leave Entries' },
      canActivate: [AuthGuard]
    },
    { path: 'teamleaveentries', component: TeamleaverequestComponent, data: { breadcrumb: 'Team Leave Entries' } },
    { path: 'leaveRequestReportView', component: ManagerleaverequestComponent, data: { breadcrumb: 'Leave Request Report' } }, // yet to be used 
    { path: 'entitlementdefinition', component: EntitlementdefinitionComponent, resolve: { DataInterface: RowDataService }, data: { breadcrumb: 'Entitlement Definition' } },//url not there in db
    { path: 'compensationclaims', component: EmployeeCompensationUiComponent, data: { breadcrumb: 'Compensation Claims' } },
    { path: 'employeerequest', component: EmployeeRequestApproverListingComponent, data: { breadcrumb: 'EmployeeRequest' } },
    { path: 'employeemyrequests', component: EmployeeMyRequestsUiComponent, data: { breadcrumb: 'Employee My Requests' } },
    { path: 'permission', component: EmployeePermissionComponent, data: { breadcrumb: 'My Permission' } },
    {
      path: 'employeeOdEntries', component: EmployeeOdEntriesComponent,
      data: { breadcrumb: 'On Duty' },
      canActivate: [AuthGuard]
    },
    { path: 'teamOdentries', component: TeamOdEntriesComponent, data: { breadcrumb: 'Team OD Entries' } },
    { path: 'pendingRequestsForApproval', component: HrPendingRequestsApprovalComponent, data: { breadcrumb: 'Pending Requests' } },
  ]
}

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class LeaveRoutingModule {

}








