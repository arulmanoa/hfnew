import { Injectable } from 'node_modules/@angular/core';
import 'rxjs/add/observable/of';
import { HttpService } from './http.service';
import { appSettings } from '../configs/app-settings.config';
import { PunchAttendanceModel } from '../model/Attendance/PunchAttendanceModel';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {


  constructor(

    private http: HttpService,

  ) { }



  GetPayrollInputSubmissionUIData(Id) {
    let req_params_Uri = `${Id}`;
    return this.http.get(appSettings.GET_PAYROLLINPUTSUBMISSIONUIDATA + req_params_Uri)
      .map(res => res)
      .catch(err => (err));
  }

  GetPayrollInputsSubmissionUIDatabyTeamandManagerId(Id, _ManagerId) {
    let req_params_Uri = `${Id}/${_ManagerId}`;
    return this.http.get(appSettings.GET_PAYROLLINPUTSUBMISSIONUIDATABYTEAMIDMANAGERID + req_params_Uri)
      .map(res => res)
      .catch(err => (err));
  }
  GetRegularizationAttendanceData(userId, roleId, teamId) {
    let req_params_Uri = `${userId}/${roleId}/${teamId}`;
    return this.http.get(appSettings.GET_REGULARIZATIONATTENDANCEDATA + req_params_Uri)
      .map(res => res)
      .catch(err => (err));
  }
  GetAttendancePeriodBasedEmployeeList(userId, roleId, teamId, attendancePeriodId) {
    let req_params_Uri = `${userId}/${roleId}/${teamId}/${attendancePeriodId}`;
    return this.http.get(appSettings.GET_ATTENDACEPERIODBASEDEMPLOYEELIST + req_params_Uri)
      .map(res => res)
      .catch(err => (err));
  }
  GetAttendanceBreakUpDetailsByAttendancePeriodId(employeCode, attendancePeriodId) {
    let req_params_Uri = `${employeCode}/${attendancePeriodId}`;
    return this.http.get(appSettings.GET_ATTENDANCEBREAKUPDETAILSBYATTENDANCEPERIODID + req_params_Uri)
      .map(res => res)
      .catch(err => (err));
  }

  GetEmployeeAttendanceDetails(employeeId, attendancePeriodId) {
    let req_params_Uri = `${employeeId}/${attendancePeriodId}`;
    return this.http.get(appSettings.GET_ATTENDANCEDETAILSBYATTENDANCEPERIODID + req_params_Uri)
      .map(res => res)
      .catch(err => (err));
  }



  GetPayrollInputsSubmissionUIDatabyTeamId(Id, _ManagerId) {
    let req_params_Uri = `${Id}/${_ManagerId}`;
    return this.http.get(appSettings.GET_PAYROLLINPUTSUBMISSIONUIDATABYTEAMID + req_params_Uri)
      .map(res => res)
      .catch(err => (err));
  }
  put_UpsertTimeCard(data) {
    return this.http.put(appSettings.PUT_UPSERTTIMECARD, data)
      .map(res => res)
      .catch(
        err => (err)
      );
  }
  SubmitPayrollInputsSubmission(data) {
    return this.http.put(appSettings.PUT_SUBMITPAYROLLINPUTSUBMISSION, data)
      .map(res => res)
      .catch(
        err => (err)
      );
  }
  GetPayrollInputsSubmissionUIDatabyclientId(clientId) {
    let req_params_Uri = `${clientId}`;
    return this.http.get(appSettings.GET_PAYROLLINPUTSUBMISSIONUIDATABYCLIENTID + req_params_Uri)
      .map(res => res)
      .catch(err => (err));
  }
  GetPayrollInputsSubmissionUIDatabyManagerId(managerId) {
    let req_params_Uri = `${managerId}`;
    return this.http.get(appSettings.GET_PAYROLLINPUTSUBMISSIONUIDATABYMANAGERID + req_params_Uri)
      .map(res => res)
      .catch(err => (err));
  }



  SubmitPayrollInputsSubmissionByTeamId(data) {
    return this.http.post(appSettings.POST_SUBMITPAYROLLINPUTSUBMISSIONBYTEAMID, data)
      .map(res => res)
      .catch(err => (err));

  }

  GetAttendanceConfiguration(companyId, clientId, clientContractId, teamId, employeeId) {
    let req_params_Uri = `${companyId}/${clientId}/${clientContractId}/${teamId}/${employeeId}`;
    return this.http.get(appSettings.GET_ATTENDANCECONFIGURATION + req_params_Uri)
      .map(res => res)
      .catch(err => (err));
  }
  GetAttendanceConfigurationByEmployeeCode(employeeCode) {
    let req_params_Uri = `${employeeCode}`;
    return this.http.get(appSettings.GET_ATTENDANCECONFIGURATION + req_params_Uri)
      .map(res => res)
      .catch(err => (err));
  }

  GetAttendanceData(employeeCode, month, year) {
    let req_params_Uri = `${employeeCode}/${month}/${year}`;
    return this.http.get(appSettings.GET_ATTENDANCEDATA + req_params_Uri)
      .map(res => res)
      .catch(err => (err));
  }
  GetAttendanceDataByEmployeeId(employeeId, month, year) {
    let req_params_Uri = `${employeeId}/${month}/${year}`;
    // let req_params_Uri = `${employeeId}`;
    return this.http.get(appSettings.GET_ATTENDANCEDATABYEMPID + req_params_Uri)
      .map(res => res)
      .catch(err => (err));
  }

  GetHolidayCalendarBasedOnApplicability(holidayCalendarType, clientId, clientContractId, teamId, stateId, locationId, empId) {

    let req_params = `holidayCalendarType=${holidayCalendarType}&clientId=${clientId}&clientContractId=${clientContractId}&teamId=${teamId}&stateId=${stateId}&locationId=${locationId}&empId=${empId} `
    return this.http.get(appSettings.GET_HOLIDAYCALENDARBASEDAPPLICABILITY + req_params)
      .map(res => res)
      .catch(err => (err));
  }

  GetIpAddress() {
    return this.http.get(appSettings.GETIPADDRESS)
      .map(res => res)
      .catch(err => (err));
  }


  UpsertEmployeeAttendanceDetails(data) {
    return this.http.put(appSettings.PUT_UPSERTEMPLOYEEATTENDANCEDETAILS, data)
      .map(res => res)
      .catch(
        err => (err)
      );
  }

  UpsertEmployeeAttendanceBreakUpDetails(data) {
    return this.http.put(appSettings.PUT_UPSERTEMPLOYEEATTENDANCEBREAKUPDETAILS, data)
      .map(res => res)
      .catch(
        err => (err)
      );
  }


  SubmitEmployeeAttendanceBreakUpDetails(data) {
    return this.http.put(appSettings.PUT_SUBMITEMPLOYEEATTENDANCEBREAKUPDETAILS, data)
      .map(res => res)
      .catch(
        err => (err)
      );
  }

  SubmitRegularizedAttendance(data) {
    return this.http.put(appSettings.PUT_SUBMITREGULARIZEDATTENDANCE, data)
      .map(res => res)
      .catch(
        err => (err)
      );
  }
  SendMailForRegularizeAttendanceEmployees(data) {
    return this.http.put(appSettings.PUT_SENDMAILFORREGULARIZEDEMPLOYEEATTENDNACE, data)
      .map(res => res)
      .catch(
        err => (err)
      );
  }

  // LEAVE

  GetEmployeeEntitlementList(employeeId, entitlementType) {

    let req_params = `${employeeId}/${entitlementType}`;
    return this.http.get(appSettings.GET_GETEMPLOYEEENTITLEMENTLIST + req_params)
      .map(res => res)
      .catch(err => (err));
  }
  GetUpcomingLeaveRequestByEmployeeId(employeeId) {

    let req_params = `${employeeId}`;
    return this.http.get(appSettings.GET_UPCOMINGLEAVEREQUEST + req_params)
      .map(res => res)
      .catch(err => (err));
  }
  GetEntitlementAvailmentRequests(employeeId) {
    let req_params = `${employeeId}`;
    return this.http.get(appSettings.GET_ENTITLEMENTAVAILMENTREQUESTS + req_params)
      .map(res => res)
  }
  PostEntitlementAvailmentRequest(data) {
    return this.http.put(appSettings.PUT_POSTENTITLEMENTAVAILMENTREQUEST, data)
      .map(res => res)
      .catch(
        err => (err)
      );
  }
  GetEntitlementAvailmentRequestsForApproval() {
    return this.http.get(appSettings.GET_ENTITLEMENTAVAILMENTREQUESTSFORAPPROVAL)
      .map(res => res)
      .catch(err => (err));
  }

  GetEntitlementAvailmentRequestsForApprovalByManagerId(managerId) {
    let req_params = `${managerId}`;
    return this.http.get(appSettings.GET_ENTITLEMENTAVAILMENTREQUESTSFORAPPROVALBYMANAGERID + req_params)
      .map(res => res)
      .catch(err => (err));
  }
  GetManagerApprovePermReq() {
    return this.http.get(appSettings.get_Manager_PermissionsForApproverUI)
      .map(res => res)
      .catch(err => (err));

  }
  GetManagerApproveWOWReq() {
    return this.http.get(appSettings.get_Manager_PermissionsForWOW)
      .map(res => res)
      .catch(err => (err));

  }

  ValidateEntitlementAvailmentRequest(data) {
    return this.http.post(appSettings.POST_VALIDATEENTITLEMENTAVAILMENTREQUEST, data)
      .map(res => res)
      .catch(
        err => (err)
      );
  }
  CancelEntitlementAvailmentRequest(data) {
    return this.http.post(appSettings.POST_CANCELENTITLEMENTAVAILMENTREQUEST, data)
      .map(res => res)
      .catch(
        err => (err)
      );
  }


  UpdateEntitlementAvailmentRequestAsPresent(data) {
    return this.http.post(appSettings.POST_UPDATEENTITLEMENTREQUESTASPRESENT, data)
      .map(res => res)
      .catch(
        err => (err)
      );
  }

  UpsertTimecardAttendance(data) {
    return this.http.put(appSettings.PUT_UPSERTTIMECARDATTENDANCE, data)
      .map(res => res)
      .catch(
        err => (err)
      );
  }

  UpsertEntitlementDefinition(data) {
    return this.http.put(appSettings.PUT_UPSERTENTITLEMENTDEFINITION, data)
      .map(res => res)
      .catch(
        err => (err)
      );
  }

  ValidateLeaveRequestIsValidToUpdate(EvtReqId, CurrentDateTime) {

    let req_params = `EvtReqId=${EvtReqId}&CurrentDateTime=${CurrentDateTime}`
    return this.http.get(appSettings.GET_VALIDATELEAVEREQUSTISVALIDTOUPDATE + req_params)
      .map(res => res)
      .catch(err => (err));
  }

  GetISTServerTime() {

    return this.http.get(appSettings.GET_ISTSERVERTIME)
      .map(res => res)
      .catch(err => (err));
  }

  getWeekOff(employeeCode) {
    let req_params = `${employeeCode}`;
    return this.http.get(appSettings.GET_WEEKOFFDAYS + req_params)
      .map(res => res)
      .catch(err => (err));
  }
  GetWeekOffByEmployeeId(employeeId) {
    let req_params = `${employeeId}`;
    return this.http.get(appSettings.GET_WEEKOFFDAYSBYEMPID + req_params)
      .map(res => res)
      .catch(err => (err));
  }
  GetWorkshiftByEmployeeId(employeeId) {
    let req_params = `${employeeId}`;
    return this.http.get(appSettings.GET_WORKSHIFTEMPLOYEEID + req_params)
      .map(res => res)
      .catch(err => (err));
  }

  GetCompanySettings(companyId, clientId, clientContractId, settingValue) {
    let req_params_Uri = `${companyId}/${clientId}/${clientContractId}/${settingValue}`;
    return this.http.get(appSettings.GETCOMPANYSETTINGS + req_params_Uri)
      .map(res => res)
      .catch(err => (err));
  }

  PunchAttendance(PunchAttendanceModel) {
    return this.http.put(appSettings.PUT_PUNCHATTENDANCE, PunchAttendanceModel)
      .map(res => res)
      .catch(err => (err));
  }

  GetAllManagersForReportingManager(_ManagerId) {
    let req_params_Uri = `${_ManagerId}`;
    return this.http.get(appSettings.GET_REPORTINGMANAGER + req_params_Uri)
      .map(res => res)
      .catch(err => (err));
  }

  GetEmployeeAttendanceListUsingManagerId(_ManagerId) {
    let req_params_Uri = `${_ManagerId}`;
    return this.http.get(appSettings.GET_EMPLOYEEATTENDANCELISTUSINGEMPLOYEEID + req_params_Uri)
      .map(res => res)
      .catch(err => (err));
  }



  InsertAttendanceConfiguration(data) {
    return this.http.put(appSettings.INSERTATTENDANCECONFIGURATION, data)
      .map(res => res)
      .catch(err => (err));
  }


  upsertAttendanceConfiguration(data) {
    return this.http.put(appSettings.UPSERTATTENDANCECONFIGURATION, data)
      .map(res => res)
      .catch(error => (error));
  }


  UpsertWorkShiftAndMapping(data) {
    return this.http.put(appSettings.PUT_UPSERTWORKSHFITANDMAPPING, data)
      .map(res => res)
      .catch(err => (err));
  }


  UpdateWorkShiftDefinition(data) {
    return this.http.put(appSettings.PUT_UPDATEWORKSHIFTDEFINITION, data)
      .map(res => res)
      .catch(err => (err));
  }

  UpsertAttendanceGeoFenceCoordinatesMapping(data) {
    return this.http.put(appSettings.PUT_ATTENDACEGEOFENCECOORDINATESMAPPING, data)
      .map(res => res)
      .catch(err => (err));
  }

  GetGeoCoordinates(companyId, clientId, clientContractId, teamId, employeeId) {
    let req_params_Uri = `${companyId}/${clientId}/${clientContractId}/${teamId}/${employeeId}`;
    return this.http.get(appSettings.GET_ATTENDANCEGEOFENCINGCOORDINATEMAPPING + req_params_Uri)
      .map(res => res)
      .catch(err => (err));

  }

  GetAttendanceConfigurationMapping(companyId, clientId, clientContractId, teamId, employeeId) {
    let req_params_Uri = `${companyId}/${clientId}/${clientContractId}/${teamId}/${employeeId}`;
    return this.http.get(appSettings.GET_ATTENDANCEMAPPING + req_params_Uri)
      .map(res => res)
      .catch(err => (err));
  }
  GetAttendanceConfigurationMappingByEmployeeId(employeeId) {
    let req_params_Uri = `${employeeId}`;
    return this.http.get(appSettings.GET_ATTENDANCEMAPPING + req_params_Uri)
      .map(res => res)
      .catch(err => (err));
  }
  getShiftMapping(companyId, clientId, clientContractId, teamId, employeeId) {
    let req_params_Uri = `${companyId}/${clientId}/${clientContractId}/${teamId}/${employeeId}`;
    return this.http.get(appSettings.GET_WORKSHIFTDEFINITION + req_params_Uri)
      .map(res => res)
      .catch(err => (err));
  }

  GetEmployeeBreakupDetailsByCurrentDate(employeeId: any) {
    let req_params_Uri = `${employeeId}`;
    return this.http.get(appSettings.GET_EMPLOYEEATTENDANCEBREAKUPDETAILSBYCURRENTDATE + req_params_Uri)
      .map(res => res)
      .catch(err => (err));
  }
  Post_Per_Aprove_Reject_Request(Data) {
    return this.http.post(appSettings.Post_Permission_Aprove_Reject, Data)
      .map(res => res)
      .catch(err => (err));
  }
  GetAttendanceConfigurationByEmployeeId(employeeId) {
    let req_params_Uri = `${employeeId}`;
    return this.http.get(appSettings.GET_ATTENDANCECONFIGURATIONBYEMPLOYEEID + req_params_Uri)
      .map(res => res)
      .catch(err => (err));
  }

  Post_WOW_Aprove_Reject_Request(Data) {
    return this.http.post(appSettings.Post_WOW_Aprove_Reject, Data)
      .map(res => res)
      .catch(err => (err));
  }
  GetComensationUI(data) {
    var url = `${data.FromDate}/${data.TillDate}/${data.status}`;
    return this.http.get(appSettings.GetCompensationDetailsForEmployeeUI + url)
      .map(res => res)
      .catch(err => (err));
  }
  Post_ClaimType(Data) {
    return this.http.post(appSettings.Post_ClaimType, Data)
      .map(res => res)
      .catch(err => (err));
  }

  Post_Avail_Individual_Compensation(data) {
    return this.http.post(appSettings.Post_Avail_Individual_Compensation, data)
      .map(res => res)
      .catch(err => (err));
  }
  Post_Avail_Multy_Compensation(data) {
    return this.http.post(appSettings.Post_Avail_Multy_Compensation, data)
      .map(res => res)
      .catch(err => (err));
  }

  getPermissionRequest(employeeId, count) {
    let req_params_Uri = `${employeeId}/${count}`;
    return this.http.get(appSettings.GET_RECENTRMISSIONS + req_params_Uri)
      .map(res => res)
      .catch(err => (err));
  }

  insertRequestPermission(data) {
    return this.http.post(appSettings.POST_REQUESTPERMISSION, data)
      .map(res => res)
      .catch(
        err => (err)
      );
  }

  getPermissionsForEmployeeUI(status, fromDate, tillDate) {
    let req_params_Uri = `${status}/${fromDate}/${tillDate}`;
    return this.http.get(appSettings.GET_PERMISSIONSFOREMPLOYEEUI + req_params_Uri)
      .map(res => res)
      .catch(err => (err));
  }
  getEmployeeWOWReq(data) {
    var url = `${data.FromDate}/${data.TillDate}/${data.status}`;
    return this.http.get(appSettings.Get_Emp_WOW_Req + url)
      .map(res => res)
      .catch(err => (err));
  }
  postRequestOd(Data) {
    return this.http.post(appSettings.postEmpRequestOD, Data)
      .map(res => res)
      .catch(err => (err));
  }
  postRequestWfh(Data) {
    return this.http.post(appSettings.postEmpRequestWFH, Data)
      .map(res => res)
      .catch(err => (err));
  }
  postManagerOdAproveReject(Data) {
    return this.http.post(appSettings.postManagerSubmitOdRequest, Data)
      .map(res => res)
      .catch(err => (err));
  }
  postManagerWfhAproveReject(Data) {
    return this.http.post(appSettings.postManagerSubmitWfhRequest, Data)
      .map(res => res)
      .catch(err => (err));
  }
  GetManagerWfhGridSrvc() {
    return this.http.get(appSettings.GetManagerWfhGrid)
      .map(res => res)
      .catch(err => (err));
  }
  GetManagerOdGridSrvc() {
    return this.http.get(appSettings.GetManagerOdGrid)
      .map(res => res)
      .catch(err => (err));
  }
  GetInitManagerCardsSrvc() {
    return this.http.get(appSettings.GetInitManagerCards)
      .map(res => res)
      .catch(err => (err));
  }

  GetDashboardDetailsByRoleCodeAndUserId(cId, ccId, tId, uId, roleCode) {
    let req_params_Uri = `${cId}/${ccId}/${tId}/${uId}/${roleCode}`;
    return this.http.get(appSettings.GET_DASHBOARDDETAILSBYROLECODEUSEID + req_params_Uri)
      .map(res => res)
      .catch(err => (err));
  }
  getClientDashboardDetails(companyId, cId, ccId, filterType, fromDate, toDate) {
    let req_params_Uri = `${companyId}/${cId}/${ccId}/${filterType}/${fromDate}/${toDate}`;
    return this.http.get(appSettings.GET_CLIENTDASHBOARDDETAILS + req_params_Uri)
      .map(res => res)
      .catch(err => (err));
  }


  GetInitEmployeeCardsSrvc() {
    return this.http.get(appSettings.GetInitEmployeeCards)
      .map(res => res)
      .catch(err => (err));
  }
  GetODRequestsForEmployeeUISrvcMethod(data) {
    var url = `${data.FromDate}/${data.TillDate}/${data.status}`;
    return this.http.get(appSettings.GetODRequestsForEmployeeUISrvc + url)
      .map(res => res)
      .catch(err => (err));
  }
  GetWFHRequestsForEmployeeUISrvcMethod(data) {
    var url = `${data.FromDate}/${data.TillDate}/${data.status}`;
    return this.http.get(appSettings.GetWFHRequestsForEmployeeUISrvc + url)
      .map(res => res)
      .catch(err => (err));
  }
  MarkAttendanceAsPresentByEmployee(data) {
    return this.http.put(appSettings.PUT_MARKASPRESENTBYEMPLOYEE, data)
      .map(res => res)
      .catch(err => (err));
  }

  GetRequiredCompanySettingsList(CompanyId, ClientId, settingNames) {

    let req_params = `CompanyId=${CompanyId}&ClientId=${ClientId}&settingNames=TaxBasedOnProof,IsPennyDropCheckRequired,Frances`
    return this.http.get(appSettings.GetRequiredCompanySettingsList + req_params)
      .map(res => res)
      .catch(err => (err));
  }
  PutUpsertWeekOff(data) {
    return this.http.put(appSettings.PUT_UPSERTWEEKOFF, data)
      .map(res => res)
      .catch(err => (err));
  }
  upsertjob(data) {
    return this.http.put(appSettings.PUT_UPSERTJOB, data)
      .map(res => res)
      .catch(err => (err));
  }
  GetMonthlyAttendanceReport(clientId, clientContractId, attendancePayPeriodId, managerId, roleId) {
    let params = `${clientId}/${clientContractId}/${attendancePayPeriodId}/${managerId}/${roleId}`;
    return this.http.get(appSettings.GET_ATTENDANCEREPORT + params)
      .map(res => res)
      .catch(err => (err));
  }
  InsUpdWorkShiftDef(data) {
    return this.http.put(appSettings.UPDATE_INSERT_WORKSHIFTDEF, data)
      .map(res => res)
      .catch(err => (err));
  }
  GetWorkShiftDefinitionsForAClient(clientId) {
    let params = `${clientId}`;
    return this.http.get(appSettings.GETWORKSHIFTDEFFORCLIENT + params)
      .map(res => res)
      .catch(err => (err));
  }

  GetWeekOffForClient(clientId) {
    let req_param = `${clientId}`;
    return this.http.get(appSettings.GET_WEEKOFFLISTBYCLIENTID + req_param)
      .map(res => res)
      .catch(err => (err));
  }

  GetTeamsForClient(clientId) {
    let req_param = `${clientId}`;
    return this.http.get(appSettings.GET_TEAMSBYCLIENTID + req_param)
      .map(res => res)
      .catch(err => (err));
  }

  GetAttendanceLeaveRequestsReport(clientId, attendancePayPeriodId, loggedInUserId, reportType, managerId, roleId) {
    let params = `${clientId}/${attendancePayPeriodId}/${loggedInUserId}/${reportType}/${managerId}/${roleId}`;
    return this.http.get(appSettings.GET_ATTENDANCELEAVEREQUESTREPORT + params)
      .map(res => res)
      .catch(err => (err));
  }
  GetAttendanceRegularizationRequestDetails(reqIds) {
    let params = `${reqIds}`;
    return this.http.get(appSettings.GET_ATTENDANCEREGULARIZATIONREQUESTDETAILS + params)
      .map(res => res)
      .catch(err => (err));
  }

  ValidateRegularization(data) {

    return this.http.post(appSettings.POST_VALIDATEREGULARIZATION, data)
      .map(res => res)
      .catch(err => (err));
  }

  CreateEmployeeAttendanceBreakUpDetails(reqIds) {
    let params = `${reqIds}`;
    return this.http.put(appSettings.PUT_CREATEEMPLOYEEATTNBREAKUPDETAILS + params, '')
      .map(res => res)
      .catch(err => (err));
  }
  GetEntitlementAvailmentRequestById(reqIds) {
    let params = `${reqIds}`;
    return this.http.get(appSettings.GET_GETENTITLEMENTAVAILMENTREQUESTBYID + params)
      .map(res => res)
      .catch(err => (err));
  }
  CreateEmployeeAttendanceBreakUpDetailsForNextPeriod(clientId) {
    let params = `${clientId}`;
    return this.http.put(appSettings.PUT_CREATEEMPLOYEEATTNBREAKUPDETAILSFORNEXTPERIOD + params, '')
      .map(res => res)
      .catch(err => (err));
  }



  callAPIPUT(endpoint, payload) {
    return this.http.put(endpoint, payload)
      .map(res => res)
      .catch(err => (err));
  }
  callAPIPOST(endpoint, payload) {
    return this.http.post(endpoint, payload)
      .map(res => res)
      .catch(err => (err));
  }
  calAPIGET(endpoint, payload) {
    return this.http.get(endpoint + payload)
      .map(res => res)
      .catch(err => (err));
  }
  getPunchInPunchOutReport(clientId, attendancePeriodId, managerUserId, roleId) {
    let params = `${clientId}/${attendancePeriodId}/${managerUserId}/${roleId}`;
    return this.http.get(appSettings.GET_PUNCHINPUNCHOUTREPORT + params)
      .map(res => res)
      .catch(err => (err));
  }
  CallAPIPOST(endpoint, payload) {
    return this.http.postWithoutSecurity(endpoint, payload)
      .map(res => res)
      .catch(err => (err));
  }

  getAllSearchFilterDataForShiftMapping(roleId, userId) {
    let params = `${roleId}/${userId}`;
    return this.http.get(appSettings.GET_SEARCHFILTERFORSHIFTMAPPING + params)
      .map(res => res)
      .catch(err => (err));
  }

  getWeekOffMapping(companyId, clientId, clientContractId, teamId, employeeId) {
    let params = `${companyId}/${clientId}/${clientContractId}/${teamId}/${employeeId}`;
    return this.http.get(appSettings.GET_WEEKOFFMAPPING + params)
      .map(res => res)
      .catch(err => (err));
  }

  getAttendanceRegularizationDetailsForAManager(managerId: any) {
    let params = `${managerId}`;
    return this.http.get(appSettings.GET_ATTENDANCEREGULARIZEFORAMANAGER + params)
      .map(res => res)
      .catch(err => (err));
  }

  putApproveRejectEmployeeRegularization(regIds, managerId, remarks, status) {
    let params = `${regIds}/${managerId}/${remarks}/${status}`;
    return this.http.put(appSettings.PUT_APPROVEREJECTREGULARIZATION + params, '')
      .map(res => res)
      .catch(err => (err));
  }

  GetMonthlyAttendanceReportForITCClient(userId, roleId, districtId, branchId, distributorId, strtDate, endDate) {
    let params = `${userId}/${roleId}/${districtId}/${branchId}/${distributorId}/${strtDate}/${endDate}`;
    return this.http.get(appSettings.GET_ATTENDANCEREPORTFORITC + params)
      .map(res => res)
      .catch(err => (err));
  }

  isManagerAllowedToRegularise(empId, attendanceFromDate, attendanceToDate) {
    let params = `${empId}/${attendanceFromDate}/${attendanceToDate}`;
    return this.http.get(appSettings.GET_ISMANAGERALLOWEDTOREGULARIZE + params)
      .map(res => res)
      .catch(err => (err));
  }

  getShiftRequestForAnEmployee(employeeId) {
    let params = `${employeeId}`;
    return this.http.get(appSettings.GET_SHIFTREQUESTBYEMPLOYEE + params)
      .map(res => res)
      .catch(err => (err));
  }

  getAllShiftRequestForMananger(managerId) {
    let params = `${managerId}`;
    return this.http.get(appSettings.GET_SHIFTREQUESTSBYMANAGER + params)
      .map(res => res)
      .catch(err => (err));
  }

  upsertShiftChangeRequest(data) {
    return this.http.put(appSettings.PUT_SHIFTCHANGEREQUEST, data)
      .map(res => res)
      .catch(
        err => (err)
      );
  }

  approveRejectShiftRequests(reqIds, status, remarks, managerId) {
    let req_params = `${reqIds}/${status}/${remarks}/${managerId}`;
    return this.http.put(appSettings.PUT_APPROVEREJECTSHIFTCHANGEREQUESTS + req_params, '')
      .map(res => res)
      .catch(err => (err));
  }

  checkIfShiftRequestExists(employeeId, fromDate, toDate) {
    let req_params = `${employeeId}/${fromDate}/${toDate}`;
    return this.http.get(appSettings.GET_ISSHIFTCHANGEREQUESTEXISTS + req_params)
      .map(res => res)
      .catch(err => (err));
  }

  sendAttendanceReminderMails(managerId, type) {
    let req_params = `managerId=${managerId}&type=${type}`;
    return this.http.get(appSettings.GET_SENDATTENDANCEREMINDERMAILS + req_params)
      .map(res => res)
      .catch(err => (err));
  }

  getEmployeeShiftAndAttendanceDetailsForToday(employeeId) {
    let req_params = `${employeeId}`;
    return this.http.get(appSettings.GET_EMPLOYEESHIFTANDATTENDANCEDETAILSFORTODAY + req_params)
      .map(res => res)
      .catch(err => (err));
  }

  GetShiftDetailsForEmployee(employeeId, periodFrom, periodTo) {
    let req_params = `${employeeId}/${periodFrom}/${periodTo}`;
    return this.http.get(appSettings.GET_SHIFTDETAILSFORANEMPLOYEE + req_params)
      .map(res => res)
      .catch(err => (err));
  }

  GetShiftDetailsForManager(managerId, periodFrom, periodTo) {
    let req_params = `${managerId}/${periodFrom}/${periodTo}`;
    return this.http.get(appSettings.GET_SHIFTDETAILSFORMANAGER + req_params)
      .map(res => res)
      .catch(err => (err));
  }

  GetAttendanceSummaryReport(userId, roleId, districtId, branchId, distributorId, startDate, endDate) {
    let params = `${userId}/${roleId}/${districtId}/${branchId}/${distributorId}/${startDate}/${endDate}`;
    return this.http.get(appSettings.GET_ATTENDANCESUMMARYREPORT + params)
      .map(res => res)
      .catch(err => (err));
  }

  GetAttendanceSummaryReportDailyBasis(userId, roleId, districtId, branchId, distributorId, startDate, endDate) {
    let params = `${userId}/${roleId}/${districtId}/${branchId}/${distributorId}/${startDate}/${endDate}`;
    return this.http.get(appSettings.GET_ATTENDANCESUMMARYREPORTDAILYBASIS + params)
      .map(res => res)
      .catch(err => (err));
  }

  getPunchInPunchOutReportForITC(userId, roleId, districtId, branchId, distributorId, startDate, endDate) {
    let params = `${userId}/${roleId}/${districtId}/${branchId}/${distributorId}/${startDate}/${endDate}`;
    return this.http.get(appSettings.GET_PUNCHINPUNCHOUTREPORTFORITC + params)
      .map(res => res)
      .catch(err => (err));
  }

  getMLReportForITC(userId, roleId, districtId, branchId, distributorId, startDate, endDate) {
    let params = `${userId}/${roleId}/${districtId}/${branchId}/${distributorId}/${startDate}/${endDate}`;
    return this.http.get(appSettings.GET_ATTENDANCELEAVEREQUESTSREPORTFORITC + params)
      .map(res => res)
      .catch(err => (err));
  }

  getClientLocationByEmployeeId(employeeId) {
    let param = `${employeeId}`;
    return this.http.get(appSettings.GET_CLIENTLOCATIONSFORANEMPLOYEE + param)
      .map(res => res)
      .catch(err => (err));
  }

  regularizeAttendanceForDetailedType(biometricData, submissionType, remarks, userId, employeeId, attendanceDate) {
    // let params = `${submissionType}/${remarks}/${userId}/${employeeId}/${attendanceDate}`;
    let params = `submissionType=${submissionType}&remarks=${remarks}&userId=${userId}&employeeId=${employeeId}&attendanceDate=${attendanceDate}`
    console.log('params', params);
    return this.http.put(appSettings.PUT_REGULARISEATTENDANCE + params, biometricData)
      .map(res => res)
      .catch(err => (err));
  }

  approveRejectRegularation_DetailedType(reqIds, managerId, remarks, status) {
    let params = `regIds=${reqIds}&managerId=${managerId}&remarks=${remarks}&status=${status}`
    return this.http.put(appSettings.PUT_APPROVEREJECTREGULARIZATIONDETAILTYPE + params, '')
      .map(res => res)
      .catch(err => (err));
  }

  get_DetailedTypeRegularizedData(employeeId, attendanceDate) {
    let params = `${employeeId}/${attendanceDate}`;
    return this.http.get(appSettings.GET_TEMPEMPLOYEEATTENDANCEBREAKUPDETAILSFORADATE + params)
      .map(res => res)
      .catch(err => (err));
  }

  get_IsEmployeeAllowedToRegularize(employeeId, attendanceDate) {
    let params = `${employeeId}/${attendanceDate}`;
    return this.http.get(appSettings.GET_ISEMPLOYEEALLOWEDTOREGULARISEFORADATE + params)
      .map(res => res)
      .catch(err => (err));
  }

  GetEmployeeEntitlementLog(empEntlId: any) {
    let params = `${empEntlId}`;
    return this.http.get(appSettings.GET_EMPLOYEEENTITLEMENTLOG + params)
      .map(res => res)
      .catch(err => (err));
  }
  GetLeavesToMapToEmployee(params){  
    return this.http.get(appSettings.GET_EMPLOYEELEAVESTOMAP + params)
      .map(res => res)
      .catch(err => (err));
  }

  UpdateEmployeeEntitlementBalance(data) {
    return this.http.post(appSettings.POST_EMPLOYEEENTITLEMENTBALANCE, data)
      .map(res => res)
      .catch(err => (err));
  }

  GetEmployeeAttendanceDetailsByFromTodate(employeeId, from, to) {
    let params = `${employeeId}/${from}/${to}`;
    return this.http.get(appSettings.GET_ATTENDANCEDETAILSBYFROMDATETODATE + params)
      .map(res => res)
      .catch(err => (err));
  }

  MapEntitlementToEmployee(data) { 
    return this.http.post(appSettings.POST_MAPENTITLEMENTTOEMPLOYEE, data)
      .map(res => res)
      .catch(err => (err));
  }

  GetEntitlementRequestEndDate(empId : any, empEntlId, startDate){
    let params = `${empId}/${empEntlId}/${startDate}`;
    return this.http.get(appSettings.GET_EMPLOYEEENTITLEMENTREQUESTENDDATE + params)
      .map(res => res)
      .catch(err => (err));
  }

  ValidateRegularizationDetailType(data) {
    return this.http.post(appSettings.POST_VALIDATEREGULARIZATION_DETAILTYPE, data)
      .map(res => res)
      .catch(err => (err));
  }

  MapShiftForEmployees(data: any) {
    return this.http.post(appSettings.POST_MAPSHIFTFOREMPLOYEES, data)
      .map(res => res)
      .catch(err => (err));
  }

  MapWeekOffForEmployees(data: any) {
    return this.http.post(appSettings.POST_MAPWEEKOFFFOREMPLOYEES, data)
      .map(res => res)
      .catch(err => (err));
  }

  GetAttendanceRegularizationRequestDetailsDetailType(reqIds) {
    let params = `${reqIds}`;
    return this.http.get(appSettings.GET_ATTENDANCEREGULARIZATIONREQUESTDETAILS_DETAILTYPE + params)
      .map(res => res)
      .catch(err => (err));
  }

  getAvailableDatesForCompOffForAnEmployee(clientId, clientContractId, employeeId) {
    let params = `clientId=${clientId}&clientContractId=${clientContractId}&employeeId=${employeeId}`
    return this.http.get(appSettings.GET_AVAILABLEDATESFORCOMPOFFFORANEMPLOYEE + params)
      .map(res => res)
      .catch(err => (err));
  }

  getCompensationReport(fromDate, toDate, clientId, clientContractId, filterObject) {
    let params = `fromDate=${fromDate}&toDate=${toDate}&clientId=${clientId}&clientContractId=${clientContractId}&filterObject=${filterObject}`
    return this.http.get(appSettings.GET_COMPENSATIONREPORT + params)
      .map(res => res)
      .catch(err => (err));
  }

  getBiometricDeviceDetails(clientId) {
    let req_params_Uri = `${clientId}`;
    return this.http.get(appSettings.GET_BIOMETRICDEVICES + req_params_Uri)
      .map(res => res)
      .catch(err => (err));
  }

  existingPunchDetails(data) {
    return this.http.post(appSettings.POST_EXISTINGPUNCHDETAILS, data)
      .map(res => res)
      .catch(err => (err));
  }

  pushBiometricDataManually(data) {
    return this.http.post(appSettings.POST_PUSHBIOMETRICDATAMANUALLY, data)
      .map(res => res)
      .catch(err => (err));
  }

  putNumberOfDaysForAppliedLeave(data) {
    return this.http.put(appSettings.PUT_NUMBEROFLEAVEDAYSAPPLIED, data)
      .map(res => res)
      .catch(
        err => (err)
      );
  }

  getRelationshipDetails() {
    return this.http.get(appSettings.GET_RELATIONSHIPDETAILS)
      .map(res => res)
      .catch(
        err => (err)
      );
  }

  getOnDutyRequests(employeeId) {
    let req_params = `${employeeId}`;
    return this.http.get(appSettings.GET_ONDUTYREQUESTS + req_params)
      .map(res => res)
  }

  getEmployeeODList(employeeId, entitlementType) {

    let req_params = `${employeeId}/${entitlementType}`;
    return this.http.get(appSettings.GET_EMPLOYEEODLIST + req_params)
      .map(res => res)
      .catch(err => (err));
  }

  GetOnDutyRequestsForApproval() {
    return this.http.get(appSettings.GET_ONDUTYREQUESTSFORAPPROVAL)
      .map(res => res)
      .catch(err => (err));
  }

  ValidateOnDutyRequest(data) {
    return this.http.post(appSettings.POST_VALIDATEONDUTYREQUEST, data)
      .map(res => res)
      .catch(
        err => (err)
      );
  }
  CancelOnDutyRequestRequest(data) {
    return this.http.post(appSettings.POST_CANCELONDUTYENTITLEMENTAVAILMENTREQUEST, data)
      .map(res => res)
      .catch(
        err => (err)
      );
  }

  PostOdRequest(data) {
    return this.http.put(appSettings.POST_ONDUTYREQUEST, data)
      .map(res => res)
      .catch(
        err => (err)
      );
  }

  getNumberOfOnDutyDaysApplied(data) {
    return this.http.put(appSettings.PUT_NUMBEROFONDUTYDAYSAPPLIED, data)
      .map(res => res)
      .catch(
        err => (err)
      );
  }

  getAllEntitlementsByClientId(clientId) {
    let req_params = `${clientId}`;
    return this.http.get(appSettings.Get_AllEntitlementsByClientId + req_params)
      .map(res => res)
      .catch(err => (err));
  }

  validateBulkLeaveTransaction(data) {
    return this.http.post(appSettings.POST_VALIDATEBULKLEAVETRANSACTION, data)
      .map(res => res)
      .catch(
        err => (err)
      );
  }

  validateBiometricData(data) {
    return this.http.post(appSettings.POST_VALIDATEBULKPUSHBIOMETRICDATA, data)
      .map(res => res)
      .catch(
        err => (err)
      );
  }

  validateOnDutyData(data) {
    return this.http.post(appSettings.POST_VALIDATEBULKODTRANSACTION, data)
      .map(res => res)
      .catch(
        err => (err)
      );
  }

  insertBulkLeaveTransaction(data) {
    return this.http.post(appSettings.POST_INSERTBULKLEAVETRANSACTION, data)
      .map(res => res)
      .catch(
        err => (err)
      );
  }

  insertBulkBiometricData(data) {
    return this.http.post(appSettings.POST_INSERTBULKPUSHBIOMETRICDATA, data)
      .map(res => res)
      .catch(
        err => (err)
      );
  }

  insertBulkOnDutyData(data) {
    return this.http.post(appSettings.POST_INSERTBULKODTRANSACTION, data)
      .map(res => res)
      .catch(
        err => (err)
      );
  }

  GetEntitlementAvailmentRequestsForApprovalByHR() {
    return this.http.get(appSettings.GET_ENTITLEMENTAVAILMENTREQUESTSFORAPPROVALBYHR)
      .map(res => res)
      .catch(err => (err));
  }

  GetOnDutyRequestsForApprovalByHR() {
    return this.http.get(appSettings.GET_ONDUTYREQUESTSFORAPPROVALBYHR)
      .map(res => res)
      .catch(err => (err));
  }

  ValidateEntitlementAvailmentRequestByHR(data) {
    return this.http.post(appSettings.POST_ValidateEntitlementAvailmentRequestByHR, data)
      .map(res => res)
      .catch(
        err => (err)
      );
  }

  ValidateonDutyEntitlementAvailmentRequestByHR(data) {
    return this.http.post(appSettings.POST_ValidateonDutyEntitlementAvailmentRequestByHR, data)
      .map(res => res)
      .catch(
        err => (err)
      );
  }

  ApproveRejectRegularizationDetailTypeByHR(reqIds, userId, remarks, status) {
    let params = `regIds=${reqIds}&userId=${userId}&remarks=${remarks}&status=${status}`
    return this.http.put(appSettings.PUT_ApproveRejectRegularizationDetailTypeByHR + params, '')
      .map(res => res)
      .catch(err => (err));
  }

  GetEmployeeEntitlementListForProxy(employeeId, entitlementType) {

    let req_params = `${employeeId}/${entitlementType}`;
    return this.http.get(appSettings.GET_EMPLOYEEENTITLEMENTLISTFORPROXY + req_params)
      .map(res => res)
      .catch(err => (err));
  }

  PostEntitlementAvailmentRequestForProxy(data) {
    return this.http.put(appSettings.POST_ENTITLEMENTAVAILMENTREQUESTFORPROXY, data)
      .map(res => res)
      .catch(
        err => (err)
      );
  }

  PostOnDutyRequestForProxy(data) {
    return this.http.put(appSettings.POST_ONDUTYREQUESTFORPROXY, data)
      .map(res => res)
      .catch(
        err => (err)
      );
  }

}


