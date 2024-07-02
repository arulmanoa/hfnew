import { Injectable } from 'node_modules/@angular/core';
import { BehaviorSubject, Observable, of } from "rxjs";

import 'rxjs/add/observable/of';
import { HttpService } from './http.service';
import { appSettings } from '../configs/app-settings.config';
import { BulkELCWorkflowParams } from '../model/BulkELCWorkflowParams';
import { EmployeeFnFTransaction } from '../model/Employee/EmployeeFFTransaction';
import { EmployeeDetails } from '../model/Employee/EmployeeDetails';
import { apiResult } from '../model/apiResult';
import { SessionStorage } from './session-storage.service';
import { ELCStatus } from '../model/Employee/EmployeeLifeCycleTransaction';
import { catchError, map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class EmployeeService {

  employeedetails: EmployeeDetails = {} as any;

  isDisabledTab = new BehaviorSubject<boolean>(false);
  disabledTabAsObservable: Observable<boolean> = this.isDisabledTab.asObservable();

  employeeTabInfo = new BehaviorSubject<any>([]);
  getEmployeeVisibleTabs: Observable<any> = this.employeeTabInfo.asObservable();

  constructor(
    public sessionService: SessionStorage,
    private http: HttpService,

  ) { }


  getEmployeeList(CandidateListingScreenType: any, RoleId: any, searchParameter: any) {
    let req_params_Uri = `${CandidateListingScreenType}/${RoleId}/${searchParameter}`;
    return this.http.get(appSettings.GET_EMPLOYEELIST + req_params_Uri)
      .map(res => res)
      .catch(err => (err));

  }

  GetSelfServiceList(CandidateListingScreenType: any, RoleId: any, searchParameter: any) {
    let req_params_Uri = `${CandidateListingScreenType}/${RoleId}/${searchParameter}`;
    return this.http.get(appSettings.GET_SELFSERVICELIST + req_params_Uri)
      .map(res => res)
      .catch(err => (err));

  }
  GetInvestmentProofList(CandidateListingScreenType: any, RoleId: any, searchParameter: any) {
    let req_params_Uri = `${CandidateListingScreenType}/${RoleId}/${searchParameter}`;
    return this.http.get(appSettings.GET_INVESTMENTPROOFLIST + req_params_Uri)
      .map(res => res)
      .catch(err => (err));

  }

  updateEmployeeVoidTransaction(data) {
    return this.http.put_text(appSettings.UPDATE_EMPLOYEEVOIDTRANSACTION, data)
      .map(res => res)
      .catch(err => (err));

  }

  Regenerate_AL(data) {
    return this.http.post(appSettings.REGENERATE_AL, data)
      .map(res => res)
      .catch(err => (err));
  }

  previewLetter_AL(data) {

    return this.http.post(appSettings.PREVIEWLETTER_AL, data)
      .map(res => res)
      .catch(err => (err));
  }

  /* #region  Employee Payroll - Life cycle Transaction */


  getEmployeeDetailsById(employeeId) {

    let req_params = `Id=${employeeId} `
    return this.http.get(appSettings.GET_EMPLOYEEDETAILSBYID + req_params)
      .map(res => res)
      .catch(err => (err));
  }
  getValidateSubmitInvestmentProof(employeeId) {

    let req_params = `employeeId=${employeeId} `
    return this.http.get(appSettings.GET_VALIDATEEMPLOYEEINVESTMENT + req_params)
      .map(res => res)
      .catch(err => (err));
  }
  // SendLoginCredentials(data) {
  //     let req_params = `employeeId=${data}`
  //     return this.http.put(appSettings.PUT_SENDLOGINCREDENTIALS , data) 
  //     .map(res => res)
  //     .catch(err => (err));
  // }


  getpayment(employeeId) {
    let req_params = `employeeId=${employeeId} `
    return this.http.get(appSettings.getdumm + req_params)
      .map(res => res)
      .catch(err => (err));
  }

  SendLoginCredentials(data) {
    return this.http.post(appSettings.PUT_SENDLOGINCREDENTIALS, data)
      .map(res => res)
      .catch(err => (err));

  }


  GetEmployeeDetailsByCode(employeeCode) {

    let req_params = `Code=${employeeCode} `
    return this.http.get(appSettings.GET_EMPLOYEEDETAILSBYCODE + req_params)
      .map(res => res)
      .catch(err => (err));
  }


  // only getting an employee object
  FetchEmployeeDetailsByEmployeeCode(employeeCode) {

    let req_params = `employeeCode=${employeeCode} `
    return this.http.get(appSettings.FETCH_EMPLOYEEDETAILSBYEMPLOYEECODE + req_params)
      .map(res => res)
      .catch(err => (err));
  }


  DeleteEmployeeDetailsByEmployeeId(EmployeeId) {

    let req_params = `EmployeeId=${EmployeeId} `
    return this.http.put_text(appSettings.DELETE_EMPLOYEEDETAILSBYEMPLOYEEID, req_params)
      .map(res => res)
      .catch(err => (err));
  }



  new_CalculateSalaryBreakup(data): any {

    return this.http.post(appSettings.POST_NEW_CALCULATESALARYBREAKUP, data)
      .map(res => res)
      .catch(
        err => (err)
      );

  }
  put_ELCTransaction(data: any): any {
    return this.http.put(appSettings.PUT_EMPLOYEELIFECYCLETRANSACTION, data)
      .map(res => res)
      .catch(err => (err));

  }
  put_ELCTransactionForFBP(data: any, IsFBPTransaction: boolean = false, fbpSlotId: number = 0, fbpStatus: number = 0,
    remarks: string = '', productIdForFBPCalculation: number = 0, actualAmount: number = 0, fbpAmount: number = 0, unallocatedAmount: number = 0): any {
    let req_params = `${IsFBPTransaction}/${fbpSlotId}/${fbpStatus}/${remarks}/${productIdForFBPCalculation}/
        ${actualAmount}/${fbpAmount}/${unallocatedAmount}`;
    return this.http.put(appSettings.PUT_FBPEMPLOYEELIFECYCLETRANSACTION + req_params, data)
      .map(res => res)
      .catch(err => (err));

  }

  post_PreviewLetter(data): any {

    return this.http.post(appSettings.POST_EMPLOYEEPREVIEWLETTER, data)
      .map(res => res)
      .catch(
        err => (err)
      );

  }


  getMinumumwagesDetails(data) {
    return this.http.put(appSettings.GET_MINIMUMWAGESDETAILS_EMPLOYEE, data)
      .map(res => res)
      .catch(err => (err));

  }

  post_ELCWorkFlow(data) {

    return this.http.post(appSettings.POST_ELCWORKFLOW, data)
      .map(res => res)
      .catch(err => (err));
  }

  post_BulkELCWorkFlow(data: BulkELCWorkflowParams) {

    return this.http.post(appSettings.POST_BULKELCWORKFLOW, data)
      .map(res => res)
      .catch(err => (err));
  }

  post_FnFWorkflow(data) {
    return this.http.post(appSettings.POST_FNFWORKFLOW, data)
      .map(res => res)
      .catch(err => (err));
  }

  putEmployeeDetails(data) {

    return this.http.put(appSettings.PUTEMPLOYEEDETAILS, data)
      .map(res => res)
      .catch(err => (err));

  }

  post_BankDetailsWorkFlow(data) {

    return this.http.post(appSettings.POST_BANKDETAILSWORKFLOW, data)
      .map(res => res)
      .catch(err => (err));
  }

  post_InvestmentWorkFlow(data) {

    return this.http.post(appSettings.POST_INVESTMENTWORKFLOW, data)
      .map(res => res)
      .catch(err => (err));
  }


  put_MarkEmploymentContractsForSeperation(data) {

    return this.http.post(appSettings.PUT_MARKEMPLOYMENTCONTRACTFORSEPERATION, data)
      .map(res => res)
      .catch(err => (err));

  }
  MarkEmploymentContractsLWD(data) {

    return this.http.post(appSettings.PUT_MARKEMPLOYMENTCONTRACTLWD, data)
      .map(res => res)
      .catch(err => (err));

  }

  get_LoadEmployeeUILookUpDetails(employeeId) {
    let req_params_Uri = `${employeeId}`;
    return this.http.get(appSettings.GET_EMPLOYEEUILOOKUPDETAILS + req_params_Uri)
      .map(res => res)
      .catch(err => (err));
  }

  downloadPaySlip(payTransactionId) {
    let req_params = `payTransactionId=${payTransactionId} `;
    return this.http.get(appSettings.GET_PREVIEWPAYSLIP + req_params)
      .map(res => res)
      .catch(err => (err));
  }

  get_ndcDocumentList(employeeId: number) {
    let reqParams = `employeeId=${employeeId}`;
    return this.http.get(appSettings.GET_NDCDOCUMENTLIST + reqParams).map((res) => res).catch((err) => err);

  }

  notifyDepartment(notifyDepartmentData) {
    return this.http.post(appSettings.NOTIFY_NDCMAIL, notifyDepartmentData).map((res) => res).catch((err) => err);
  }

  upsertNDCDepartmentDetails(ndcDepartmentInfo) {
    return this.http.post(appSettings.POST_UPSERT_NDCDEPARTMENTDETAILS, ndcDepartmentInfo).map((res) => res).catch((err) => err);
  }

  get_employeeNDCTransaction(employeeId: number) {
    let reqParams = `employeeId=${employeeId}`;
    return this.http.get(appSettings.GET_EMPLOYEE_NDC_TRANSACTION + reqParams).map((res) => res).catch((err) => err);
  }

  /* #endregion */

  // timecard
  UpdateEmployeeMarkedForCalculation(EmployeeId) {
    let req_params = `employeeId=${EmployeeId} `;
    return this.http.post(appSettings.POST_UPDATEEMPLOYEETIMECARDCALCULATION + req_params, '')
      .map(res => res)
      .catch(err => (err));
  }

  MarkEmployeeForSeparation(employeefnfTransaction: EmployeeFnFTransaction) {
    return this.http.post(appSettings.POST_MARKEMPLOYEEFORSEPARATION, employeefnfTransaction);
  }

  VoidELCTransactions(elcIds: number[]) {
    return this.http.put(appSettings.PUT_VOIDELCTRANSACTIONS, elcIds);
  }

  CancelAnyELCTransactions(data: any[]) {
    return this.http.put(appSettings.PUT_CANCELANYELCTRANSACTIONS, data);
  }

  SaveClientApprovalFoELC(data: any) {
    return this.http.put(appSettings.POST_SAVECLIENTAPPROVALFOELC, data);
  }

  ConfirmSeparation(data: any) {
    return this.http.post(appSettings.POST_CONFIRMSEPARATION, data);
  }


  GetImportConfigurationbyId(Id) {
    let req_params = `Id=${Id} `
    return this.http.get(appSettings.GET_IMPORTCONFIGURATIONTYPEID + req_params)
      .map(res => res)
      .catch(err => (err));
  }

  public GenericImport(data) {

    return this.http.post(appSettings.POST_GENERICIMPORTBULK, data)
      .map(res => res)
      .catch(err => (err));
  }

  GetEmployeeOfficialDocuments(employeeId: number, reportType: number, searchParams: string) {

    let req_url = appSettings.GET_GETEMPLOYEEOFFICIALDOCUMENTS + `/${employeeId}/${reportType}/${searchParams}`

    return this.http.get(req_url)
      .map(res => res)
      .catch(err => (err));
  }
  insertEmployeeExemptionBillDetails(data) {
    return this.http.put(appSettings.POST_EMPLOYEEEXEMPTIONBILLDETAILS, data)
      .map(res => res)
      .catch(err => (err));

  }

  UpsertEmployeeJourneyDetails(data) {
    return this.http.put(appSettings.POST_EMPLOYEEJOURNEYDETAILS, data)
      .map(res => res)
      .catch(err => (err));

  }

  GetEmployeeExemptionBillDetails(employeeId: number) {

    let req_url = appSettings.GET_EMPLOYEEEXEMPTIONBILLDETAILS + `/${employeeId}`

    return this.http.get(req_url)
      .map(res => res)
      .catch(err => (err));
  }
  postEmployeeBillExceptionList(data) {

    return this.http.put(appSettings.POST_EMPLOYEEEXCEPTIONBILLLIST, data)
      .map(res => res)
      .catch(err => (err));
  }


  GetEmployeeRequiredDetailsById(employeeId, menuData: any, financialYearId = 0) {
    financialYearId == null || financialYearId == undefined ? financialYearId = 0 : true;
    let req_params_Uri = `${employeeId}/${menuData}/${financialYearId}`;
    return this.http.get(appSettings.GET_EMPLOYEEREQUIREDDETAILSBYID + req_params_Uri)
      .map(res => res)
      .catch(err => (err));

  }
  GetOptionalHolidaysForAnEmployee(employeeId = 0) {
    let req_params_Uri = `${employeeId}`;
    return this.http.get(appSettings.GET_OPTIONALHOLIDAYBYANEMPLOYEEID + req_params_Uri)
      .map(res => res)
      .catch(err => (err));

  }


  GetEmployeeAddressDetailsById(employeeId) {
    let req_params_Uri = `${employeeId}`;
    return this.http.get(appSettings.GET_EMPLOYEEADDRESSDETAILSFORJOININGKIT + req_params_Uri)
      .map(res => res)
      .catch(err => (err));

  }


  //#region Employee Deductions 

  getAllEmployeeDeductionManagementbyEmployeeId(employeeId) {
    let req_params = `employeeId=${employeeId} `;
    return this.http.get(appSettings.GET_ALLEMPLOYEEDEDUCTIONMANAGEMENTBYEMPLOYEEID + req_params)
      .map(res => res)
      .catch(err => (err));
  }

  getEmployeeDeductionManagementbyEmpId(employeeId) {
    return this.http.get(appSettings.GET_EMPLOYEEDEDUCTIONMANAGEMENTBYEMPID + `/${employeeId}`)
      .map(res => res)
      .catch(err => (err));
  }

  LoadEmployeeDeductionManagementLookupDetails(employeeId) {
    let req_params = `employeeId=${employeeId} `;
    return this.http.get(appSettings.GET_EMPLOYEEDEDUCTIONMANAGEMENTLOOKUPDETAILS + req_params)
      .map(res => res)
      .catch(err => (err));
  }

  GetEmployeeNextPayPeriodId(employeeId, processCategory, IsCurrentPayperiod) {
    return this.http.get(appSettings.GETEMPLOYEENEXTPAYPERIODID + `/${employeeId}` + `/${processCategory}` + `/${IsCurrentPayperiod}`)
      .map(res => res)
      .catch(err => (err));
  }

  Put_UpsertEmployeeDeductionManagement(data) {
    return this.http.put(appSettings.PUT_EMPLOYEEDEDUCTIONMANAGEMENT, data)
      .map(res => res)
      .catch(err => (err));

  }

  Delete_EmployeeDeductionManagementById(selectedId) {
    let req_params_Uri = `Id=${selectedId}`;
    return this.http.delete1(appSettings.DELETE_EMPLOYEEDEDUCTIONMANAGEMENTBYID + req_params_Uri)
      .map(res => res)
      .catch(err => (err));

  }

  GenerateEmployeeScheduleDetails(data) {
    return this.http.put(appSettings.PUT_EMPLOYEESCHEDULEDETAILS, data)
      .map(res => res)
      .catch(err => (err));

  }
  //#endregion

  GetEmployeeByTeam(clientId: any, clientContractId: any, TeamId: any) {
    let req_param1 = `clientId=${clientId}`;
    let req_param2 = `clientContractId=${clientContractId}`;
    let req_param3 = `TeamId=${TeamId}`;
    return this.http.get(appSettings.GETEMPLOYEEBYTEAM + req_param1 + '&' + req_param2 + '&' + req_param3)
      .map(res => res)
      .catch(err => (err));

  }


  GetAnyPaymentHistory(employeeId, pc, year) {
    let req_params_Uri = `${employeeId}/${pc}/${year}`;
    return this.http.get(appSettings.GET_EMPLOYEEPAYMENTHISTORY + req_params_Uri)
      .map(res => res)
      .catch(err => (err));
  }

  GetEmployeeTaxItem(employeeId) {
    let req_params_Uri = `${employeeId}`;
    return this.http.get(appSettings.GET_EMPLOYEETAXITEM + req_params_Uri)
      .map(res => res)
      .catch(err => (err));
  }
  GetEmployeeAccordionDetails(req_Url) {
    return this.http.get(appSettings.GET_EMPLOYEEACCORDIONDETAILS + req_Url)
      .map(res => res)
      .catch(err => (err));
  }

  EmployeeLookUpDetailsByEmployeeId(employeeId) {
    let req_params_Uri = `${employeeId}`;
    return this.http.get(appSettings.GET_EMPLOYEELOOKUPDETAILSBYEMPID + req_params_Uri)
      .map(res => res)
      .catch(err => (err));
  }
  Common_GetEmployeeRequiredDetailsById(employeeId, ctrlActivity) {
    const promise = new Promise((resolve, reject) => {
      this.GetEmployeeRequiredDetailsById(employeeId, ctrlActivity)
        .subscribe((result) => {
          try {
            let apiresult: apiResult = result;
            if (apiresult.Status && apiresult.Result != null) {
              this.employeedetails = apiresult.Result as any;
              console.log('EMPLOYEE REQUIRED DETAILS ::', this.employeedetails);
              this.sessionService.delSessionStorage('_EmployeeRequiredBasicDetails');
              this.sessionService.setSesstionStorage('_EmployeeRequiredBasicDetails', this.employeedetails);
              resolve(true);


            } else {
              console.error('AN ERROR OCCURRED WHILE GETTING EMPLOYEE REQUIRED DATA ::', apiresult);
              resolve(false);
              //   this.alertService.showWarning(`An error occurred while getting employee details : ${apiresult.Message}`);
            }

          } catch (error) {
            console.error('AN EXCEPTION OCCURRED WHILE GETTING EMPLOYEE REQUIRED DATA ::', error);
            resolve(false);
          }
        }, err => {
          reject(true);
        });

    });

    return promise;
  }
  CommonDUP_GetEmployeeRequiredDetailsById(employeeId, ctrlActivity) {
    const promise = new Promise((resolve, reject) => {
      this.GetEmployeeRequiredDetailsById(employeeId, ctrlActivity)
        .subscribe((result) => {
          try {
            let apiresult: apiResult = result;
            if (apiresult.Status && apiresult.Result != null) {
              this.employeedetails = apiresult.Result as any;
              console.log('EMPLOYEE REQUIRED DETAILS ::', this.employeedetails);
              this.sessionService.delSessionStorage('_EmployeeRequiredBasicDetails');
              this.sessionService.setSesstionStorage('_EmployeeRequiredBasicDetails', this.employeedetails);
              resolve(this.employeedetails);


            } else {
              console.info('AN ERROR OCCURRED WHILE GETTING EMPLOYEE REQUIRED DATA ::', apiresult);
              resolve(false);
              //   this.alertService.showWarning(`An error occurred while getting employee details : ${apiresult.Message}`);
            }

          } catch (error) {
            console.info('AN EXCEPTION OCCURRED WHILE GETTING EMPLOYEE REQUIRED DATA ::', error);
            resolve(false);
          }
        }, err => {
          reject(true);
        });

    });

    return promise;
  }


  GetEmployeeYTDDetails(employeeId: any, financialYearId: any) {
    let req_param1 = `employeeId=${employeeId}`;
    let req_param2 = `financialYearId=${financialYearId}`;

    return this.http.get(appSettings.GETEMPLOYEEYTDDETAILS + req_param1 + '&' + req_param2)
      .map(res => res)
      .catch(err => (err));
  }
  GetEmployeeActiveRatesets(empId: any) {
    let req_params_Uri = `${empId}`;
    return this.http.get(appSettings.GetEmployeeActiveRatesets + req_params_Uri)
      .map(res => res)
      .catch(err => (err));
  }

  //  Get the tab disabled or enabled for the ess/employee page

  getActiveTab(isActive: boolean) {
    this.isDisabledTab.next(isActive);
  }

  // dynamic approval apis

  GetMasterInfoForResignation(eId: number) {
    let req_params_Uri = `${eId}`;
    return this.http.get(appSettings.GET_EMPLOYEEMASTERINFORFORRESIGNATION + req_params_Uri)
      .map(res => res)
      .catch(err => (err));
  }
  ValidateResignation(data) {

    return this.http.post(appSettings.POST_VALIDATERESIGNATION, data)
      .map(res => res)
      .catch(err => (err));
  }
  ValidateResignationByHR(data) {
    return this.http.post(appSettings.POST_VALIDATERESIGNATIONBYHR, data).map((res) => res).catch((err) => err);
  }
  isEmployeeAllowedToEditJoiningKit(empId: number) {
    let req_params_Uri = `${empId}`;
    return this.http.get(appSettings.GET_ISEMPLOYEEALLOWEDTOEDITJOININGKIT + req_params_Uri)
      .map(res => res)
      .catch(err => (err));
  }

  getOnlineJoiningKitForApproval(clientId: number) {
    let req_params_Uri = `${clientId}`;
    return this.http.get(appSettings.GET_JOININGKITFORAPPROVAL + req_params_Uri)
      .map(res => res)
      .catch(err => (err));
  }

  updateOnlineJoiningKit(data) {
    return this.http.put(appSettings.PUT_UPDATEONLINEJOININGKIT, data)
      .map(res => res)
      .catch(err => (err));
  }

  getJoiningKitDetails(candidateId: number) {
    let req_params_Uri = `${candidateId}`;
    return this.http.get(appSettings.GET_JOININGKITDETAILS + req_params_Uri)
      .map(res => res)
      .catch(err => (err));
  }
  upsertEmployeeResignationDetails(data) {
    return this.http.post(appSettings.POST_EMPLOYEERESIGNATIONDETAILS, data)
      .map(res => res)
      .catch(err => (err));
  }

  revokeEmployeeResignationRequest(data) {
    return this.http.post(appSettings.POST_REVOKEEMPLOYEERESIGNATIONREQUEST, data)
      .map(res => res)
      .catch(err => (err));
  }

  UpsertEmployeeInvestmentDetails(data) {

    return this.http.put(appSettings.UPSERTEMPLOYEEINVESTMENTDETAILS, data)
      .map(res => res)
      .catch(err => (err));

  }

  GeneratePDFDocument(data) {
    return this.http.post(appSettings.GENERATEPDFDOCUMENT, data)
      .map(res => res)
      .catch(err => (err));
  }

  DownLoadHTMLtoPDF(data) {
    return this.http.post(appSettings.GENERATEHTMLTOPDFDOCUMENT, data)
      .map(res => res)
      .catch(err => (err));
  }

  getFBPComponentsForAnEmployee(employeeId: number) {
    let req_params_Uri = `${employeeId}`;
    return this.http.get(appSettings.GET_FBPCOMPONENTSFOREMPLOYEE + req_params_Uri)
      .map(res => res)
      .catch(err => (err));
  }

  checkIsFBPSlotEnabledForEmployee(employeeId: number) {
    let req_params_Uri = `${employeeId}`;
    return this.http.get(appSettings.GET_ISFBPSLOTENABLEDFOREMPLOYEE + req_params_Uri)
      .map(res => res)
      .catch(err => (err));
  }

  getIsFBPApplicableForEmployee(employeeId: number) {
    let req_params_Uri = `${employeeId}`;
    return this.http.get(appSettings.GET_ISFBPAPPLICABLEFOREMPLOYEE + req_params_Uri)
      .map(res => res)
      .catch(err => (err));
  }

  getAllFBPSlotsForEmployee(employeeId: number) {
    let req_params_Uri = `${employeeId}`;
    return this.http.get(appSettings.GET_ALLFBPSLOTSFORANEMPLOYEE + req_params_Uri)
      .map(res => res)
      .catch(err => (err));
  }

  getFBPConfigForAnEmployee(employeeId, fbpSlotId) {
    let req_params_Uri = `${employeeId}/${fbpSlotId}`;
    return this.http.get(appSettings.GET_FBPCONFIGFOREMPLOYEE + req_params_Uri)
      .map(res => res)
      .catch(err => (err));
  }

  CalculateTax(data) {
    return this.http.put(appSettings.PUT_CALCULATETAX, data)
      .map(res => res)
      .catch(err => (err));

  }

  ResendNotificationMessage(payload) {
    return this.http.post(appSettings.POST_NOTIFICATIONMESSAGE, payload)
      .map(res => res)
      .catch(err => (err));
  }
  UpdateEmployeeConfirmationDate(payload) {
    return this.http.post(appSettings.UPDATEEMPLOYEECONFIRMATIONDATE, payload)
      .map(res => res)
      .catch(err => (err));
  }

  MarkAnEmployeeAsBlackListed(payload) {
    return this.http.post(appSettings.POST_MARKANEMPLOYEEASBLACKLISTED, payload)
      .map(res => res)
      .catch(err => (err));
  }

  FetchBlackListingReasons(clientId) {
    let req_params_Uri = `clientId=${clientId}`;
    return this.http.get(appSettings.GET_BLACKLISTREASONS + req_params_Uri)
      .map(res => res)
      .catch(err => (err));
  }

  getEmployeeTabInfo(clientId, empId) {
    let req_params_Uri = `${clientId}/${empId}`;
    return this.http.get(appSettings.GET_EMPLOYEETABINFO + req_params_Uri)
      .map(res => res)
      .catch(err => (err));
  }

  getEmpVisibleTabs(tabName) {
    this.employeeTabInfo.next(tabName);
  }

  getApplicableEmployeeDetails(clientId) {
    let req_params_Uri = `${clientId}`;
    return this.http.get(appSettings.GET_APPLICABLEEMPLOYEEDETAILS + req_params_Uri)
      .map(res => res)
      .catch(err => (err));
  }
  ValidateEmployeeRequestApprovalByHR(data) {
    return this.http.post(appSettings.POST_VALIDATEEMPLOYEEREQUESTAPPROVALBYHR, data).map((res) => res).catch((err) => err);
  }

  getEmployeeMasterDataForCorrection(clientId, clientContractId, cityId = '0') {
    let req_params_Uri = `${clientId}/${clientContractId}/${cityId}`;
    return this.http.get_reports(appSettings.GET_MASTERANDREPORTEEDATAFORCORRECTION + req_params_Uri)
      .map(res => res)
      .catch(err => (err));
  }

  insertEmployeeDataCorrectionLog(data) {
    return this.http.post_reports(appSettings.POST_INSERTEMPLOYEEDATACORRECTIONLOG, data)
      .map(res => res)
      .catch(err => (err));
  }

  getPendingEmpDataCorrections(clientId, clientContractId) {
    let req_params_Uri = `${clientId}/${clientContractId}`;
    return this.http.get_reports(appSettings.GET_PENDINGEMPDATACORRECTIONS + req_params_Uri)
      .map(res => res)
      .catch(err => (err));
  }

  approveRejectEmployeeDataCorrection(data) {
    return this.http.post_reports(appSettings.POST_UPDATEEMPLOYEEATTRIBUTES, data)
      .map(res => res)
      .catch(err => (err));
  }

  getCityList(clientId, clientContractId) {
    let req_params_Uri = `${clientId}/${clientContractId}`;
    return this.http.get_reports(appSettings.GET_APPLICABLECITIESBYUSERID + req_params_Uri)
      .map(res => res)
      .catch(err => (err));
  }
  validateEmployeeAndGetDetailsById(empId, type) {
    let req_params_Uri = `${empId}/${type}`;
    console.log('req_params_Uri',req_params_Uri);
    
    return this.http.get(appSettings.GET_VALIDATEEMPPLOYEEANDGETDETAILSBYID + req_params_Uri)
      .map(res => res)
      .catch(err => (err));
  }
  getEmployeeInfo(searchBy,searchValue) {
    let req_params_Uri = `${searchBy}/${searchValue}`;
    return this.http.get(appSettings.Get_EMPLOYEEINFORMATION + req_params_Uri)
      .map(res => res)
      .catch(err => (err)); 
  }

  RevokeSeparation(data) {
    return this.http.post(appSettings.POST_REVOKESEPARATION, data).map((res) => res).catch((err) => err);
  }

  GetEmployeeExitTransactionHistory(employeeId: string, transactionType: any) {
    return this.http.get(`${appSettings.GET_EMPLOYEEEXITTRANSACTIONHISTORY}${employeeId}/${transactionType}`)
      .pipe(
        map(res => res),
        catchError(err => {
          return this.handleHttpError(err);
        })
      );
  }
  private handleHttpError(error: any) {
    if (error.status === 500) {
      // this.alertService.showError('Server error (500): Internal Server Error. Please try again later.');
    } else if (error.status === 503) {
      // this.alertService.showError('Service unavailable (503): The service is temporarily unavailable. Please try again later.');
    } else {
      // this.alertService.showError(`Unexpected error: ${error.message}`);
    }
    return of(null); 
  }
}