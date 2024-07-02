import { Injectable } from 'node_modules/@angular/core';
import { map } from "rxjs/operators";
import { Observable } from "rxjs";

import 'rxjs/add/observable/of';
import { HttpService } from './http.service';
import { appSettings } from '../configs/app-settings.config';
import { BulkELCWorkflowParams } from '../model/BulkELCWorkflowParams';
import { EmployeeFnFTransaction } from '../model/Employee/EmployeeFFTransaction';
import { EmployeeDetails } from '../model/Employee/EmployeeDetails';
import { apiResult } from '../model/apiResult';
import { SessionStorage } from './session-storage.service';
import { EmployeeService } from './employee.service';
import { AbstractControl, Validators } from '@angular/forms';
import { AlertService } from './alert.service';
import moment from 'moment';

@Injectable({
    providedIn: 'root'
})
export class ESSService {

    constructor(
        public sessionService: SessionStorage,
        private http: HttpService,
        private employeeService: EmployeeService,
        private alertService: AlertService

    ) { }

    GetCompanyLogoByBusinessType(_loginSessionDetails, BusinessType) {

        if (_loginSessionDetails.CompanyLogoLink != "" && _loginSessionDetails.CompanyLogoLink != null && BusinessType == 3) {
            let jsonObject = JSON.parse(_loginSessionDetails.CompanyLogoLink)
            return { clientLogoLink: jsonObject.logo, clientminiLogoLink: jsonObject.minilogo };
        } else if (_loginSessionDetails.ClientList != null && _loginSessionDetails.ClientList.length > 0 && (BusinessType == 1 || BusinessType == 2)) {
            let isDefualtExist = (_loginSessionDetails.ClientList.find(a => a.Id == Number(this.sessionService.getSessionStorage("default_SME_ClientId"))));
            if (isDefualtExist != null && isDefualtExist != undefined) {
                let jsonObject = JSON.parse(_loginSessionDetails.ClientList.find(a => a.Id == Number(this.sessionService.getSessionStorage("default_SME_ClientId"))).ClientLogoURL);

                return { clientLogoLink: jsonObject.logo, clientminiLogoLink: jsonObject.minilogo };
            } else {
                let jsonObject = JSON.parse(_loginSessionDetails.ClientList[0].ClientLogoURL);
                return { clientLogoLink: jsonObject.logo, clientminiLogoLink: jsonObject.minilogo };
            }
        }
    }

    Common_GetEmployeeAccordionDetails(employeeDetails: EmployeeDetails, accordionName) {
        const promise = new Promise((resolve, reject) => {
            try {
                // ! : 16.2 for panasonic
                // var req_Url = `${employeeDetails.EmploymentContracts.find(a => a.Status == 1 || a.Status == 0 || a.Status == 2).CompanyId}/${employeeDetails.EmploymentContracts.find(a => a.Status == 1 || a.Status == 0 || a.Status == 2).ClientId}/${employeeDetails.EmploymentContracts.find(a => a.Status == 1 || a.Status == 0 || a.Status == 2).ClientContractId}/${employeeDetails.EmploymentContracts.find(a => a.Status == 1 || a.Status == 0 || a.Status == 2).TeamId}/${accordionName}`
                var req_Url = `${employeeDetails.EmploymentContracts[0].CompanyId}/${employeeDetails.EmploymentContracts[0].ClientId == null ? 0 : employeeDetails.EmploymentContracts[0].ClientId}/${employeeDetails.EmploymentContracts[0].ClientContractId == null ? 0 : employeeDetails.EmploymentContracts[0].ClientContractId}/${employeeDetails.EmploymentContracts[0].TeamId == null ? 0 : employeeDetails.EmploymentContracts[0].TeamId}/${accordionName}`
                this.employeeService.GetEmployeeAccordionDetails(req_Url)
                    .subscribe((result) => {
                        try {
                            console.log('Accordion Details', result);
                            let apiresult: apiResult = result;
                            if (apiresult.Status && apiresult.Result != null && apiresult.Result != "") {
                                resolve(JSON.parse(apiresult.Result));

                            } else {
                                console.info('AN ERROR OCCURRED WHILE GETTING ACCORDION DATA ::', apiresult);
                                resolve(false);
                                //   this.alertService.showWarning(`An error occurred while getting employee details : ${apiresult.Message}`);
                            }

                        } catch (error) {
                            console.info('AN EXCEPTION OCCURRED WHILE GETTING EMPLOYEE ACCORDION DATA ::', error);
                            resolve(false);
                        }
                    }, err => {
                        reject(true);
                    });
            } catch (error) {
                console.log('ACCORDION EXE :', error);

            }

        });

        return promise;
    }

    updateValidation(value, control: AbstractControl) {
        if (value) {
            control.setValidators([Validators.required]);
        } else {
            control.clearValidators();
            control.setErrors(null);
        }
        control.updateValueAndValidity();
    }

    public isGuid(stringToTest) {
        if (stringToTest[0] === "{") {
            stringToTest = stringToTest.substring(1, stringToTest.length - 1);
        }
        var regexGuid = /^(\{){0,1}[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}(\}){0,1}$/gi;

        return regexGuid.test(stringToTest);
    }

    GetInvesementSlotSubmissionValidation(isSubmit, isProofMode, TaxDeclaration, LstInvestmentSubmissionSlot, employeedetails) {
        const promise = new Promise((resolve, reject) => {
            try {

                // GET INVESTMENT SUBMISSION SLOT CLOSURE DATE
                if (isSubmit == true && isProofMode && TaxDeclaration != 1) {

                    var SlotClosureDate: any = null;
                    var SlotStartDate: any = null;
                    if (LstInvestmentSubmissionSlot.length > 0 && (LstInvestmentSubmissionSlot.filter(a => (a.ClientId == employeedetails.EmploymentContracts[0].ClientId) &&
                        (a.ClientContractId == employeedetails.EmploymentContracts[0].ClientContractId)).length > 0)) {
                        SlotClosureDate = LstInvestmentSubmissionSlot.filter(a => (a.ClientId == employeedetails.EmploymentContracts[0].ClientId) &&
                            (a.ClientContractId == employeedetails.EmploymentContracts[0].ClientContractId) && a.Mode == 2)[0].EndDay;
                    } else {
                        SlotClosureDate = LstInvestmentSubmissionSlot.find(z => z.ClientId == 0 && z.ClientContractId == 0 && z.Mode == 2).EndDay;
                    }

                    if (LstInvestmentSubmissionSlot.length > 0 && (LstInvestmentSubmissionSlot.filter(a => (a.ClientId == employeedetails.EmploymentContracts[0].ClientId) &&
                        (a.ClientContractId == employeedetails.EmploymentContracts[0].ClientContractId)).length > 0)) {
                        SlotStartDate = LstInvestmentSubmissionSlot.filter(a => (a.ClientId == employeedetails.EmploymentContracts[0].ClientId) &&
                            (a.ClientContractId == employeedetails.EmploymentContracts[0].ClientContractId) && a.Mode == 2)[0].StartDay;
                    } else {
                        SlotStartDate = LstInvestmentSubmissionSlot.find(z => z.ClientId == 0 && z.ClientContractId == 0 && z.Mode == 2).StartDay;
                    }


                    if (isProofMode && SlotClosureDate == null) {
                        // this.loadingScreenService.stopLoading();
                        this.alertService.showWarning("There is no active investment slot sheet. Please contact support admin.");
                        resolve(false);
                        return;
                    }
                    var currentDate = new Date();
                    let A = moment(currentDate).format('YYYY-MM-DD');
                    let B = moment(SlotClosureDate).format('YYYY-MM-DD');
                    let C = moment(SlotStartDate).format('YYYY-MM-DD');

                    if (isProofMode && A < C) {
                        // this.loadingScreenService.stopLoading();
                        this.alertService.showWarning("Submission time not yet underway. Please contact the Technical Assistance Administration.");
                        resolve(false);
                    }

                    if (isProofMode && B < A) {
                        // this.loadingScreenService.stopLoading();
                        this.alertService.showWarning("Submission time has been closed.  Please contact the Technical Assistance Administration.");
                        resolve(false);
                    }
                    resolve(SlotClosureDate);
                }
                else if (isSubmit == true) {
                    var SlotClosureDate: any = null;
                    var SlotStartDate: any = null;
                    if (LstInvestmentSubmissionSlot.length > 0 && (LstInvestmentSubmissionSlot.filter(a => (a.ClientId == employeedetails.EmploymentContracts[0].ClientId) &&
                        (a.ClientContractId == employeedetails.EmploymentContracts[0].ClientContractId)).length > 0)) {
                        SlotClosureDate = LstInvestmentSubmissionSlot.filter(a => (a.ClientId == employeedetails.EmploymentContracts[0].ClientId) &&
                            (a.ClientContractId == employeedetails.EmploymentContracts[0].ClientContractId) && a.Mode == 1)[0].EndDay;
                    } else {
                        SlotClosureDate = LstInvestmentSubmissionSlot.find(z => z.ClientId == 0 && z.ClientContractId == 0 && z.Mode == 1).EndDay;
                    }

                    if (LstInvestmentSubmissionSlot.length > 0 && (LstInvestmentSubmissionSlot.filter(a => (a.ClientId == employeedetails.EmploymentContracts[0].ClientId) &&
                        (a.ClientContractId == employeedetails.EmploymentContracts[0].ClientContractId)).length > 0)) {
                        SlotStartDate = LstInvestmentSubmissionSlot.filter(a => (a.ClientId == employeedetails.EmploymentContracts[0].ClientId) &&
                            (a.ClientContractId == employeedetails.EmploymentContracts[0].ClientContractId) && a.Mode == 1)[0].StartDay;
                    } else {
                        SlotStartDate = LstInvestmentSubmissionSlot.find(z => z.ClientId == 0 && z.ClientContractId == 0 && z.Mode == 1).StartDay;
                    }


                    if (SlotClosureDate == null) {
                        // this.loadingScreenService.stopLoading();
                        this.alertService.showWarning("There is no active investment slot sheet. Please contact support admin.");
                        resolve(false);
                    }
                    var currentDate = new Date();
                    let A = moment(currentDate).format('YYYY-MM-DD');
                    let B = moment(SlotClosureDate).format('YYYY-MM-DD');
                    let C = moment(SlotStartDate).format('YYYY-MM-DD');

                    if (A < C) {
                        // this.loadingScreenService.stopLoading();
                        this.alertService.showWarning("Submission time not yet underway. Please contact the Technical Assistance Administration.");
                        resolve(false);
                    }

                    if (B < A) {
                        // this.loadingScreenService.stopLoading();
                        this.alertService.showWarning("Submission time has been closed.  Please contact the Technical Assistance Administration.");
                        resolve(false);
                    }

                    resolve(SlotClosureDate);
                }

            } catch (error) {
                console.log('ACCORDION EXE :', error);

            }

        });

        return promise;
    }


    LoadEmployeInvestmentUILookupDetails(employeeId) {
        let req_params_Uri = `${employeeId}`;
        return this.http.get(appSettings.GET_LOADEMPLOYEEINVESTMENTUILOOKUPDETAILS + req_params_Uri) 
            .map(res => res)
            .catch(err => (err));
    }

    public GetEmployeeConfiguration(clientContractId : number= 0, entityType : number, action : string) {
      let req_params_Uri = `${clientContractId}/${entityType}/${action}`;
      return this.http.get(appSettings.GET_EMPLOYEECONFIGURATION + req_params_Uri)
          .map(res => res)
          .catch(err => (err));
  }


}