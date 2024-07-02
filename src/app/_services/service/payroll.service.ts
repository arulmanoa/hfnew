import { Injectable } from '@angular/core';
import 'rxjs/add/observable/of';
import { HttpService } from './http.service';
import { appSettings } from '../configs/app-settings.config';
import { ProcessCategory } from '../model/Payroll/PayRun';
import { EmployeeFnFTransaction } from '../model/Employee/EmployeeFFTransaction';
import { ProcessTimeCardsModel } from '../model/Payroll/ProcessTimeCardsModel';
import { TimeCard } from '../model/Payroll/TimeCard';
import { apiResult } from '../model/apiResult';

@Injectable({
    providedIn: 'root'
})
export class PayrollService {

    constructor(
        private http: HttpService,
    ) { }
    post_generatePIS(data) {
        return this.http.post(appSettings.POST_PAYROLL_GENERATEPIS, data)
            .map(res => res)
            .catch(err => (err));

    }
    post_processTimeCard(data) {
        return this.http.post(appSettings.POST_PAYROLL_PROCESSTIMECARD, data)
            .map(res => res)
            .catch(err => (err));
    }

    post_processAnyTimeCard(processTimecardsModel: ProcessTimeCardsModel) {
        return this.http.post(appSettings.POST_PAYROLL_PROCESSANYTIMECARD, processTimecardsModel);
    }

    post_voidTimeCard(timeCards: TimeCard[]) {
        return this.http.post(appSettings.POST_PAYROLL_VOIDTIMECARD, timeCards);
    }

    post_importPIS(data) {
        return this.http.post(appSettings.POST_PAYROLL_IMPORTPIS, data)
            .map(res => res)
            .catch(err => (err));
    }
    put_PVRSubmission(data) {
        return this.http.put(appSettings.POST_PAYROLL_PVRSUBMISSION, data)
            .map(res => res)
            .catch(err => (err));
    }
    public get_allImportedPISLog(ClientId: any, ClientContractid: any, TeamId: any, PayperiodId: any) {
        let req_params_Uri = `clientId=${ClientId}&clientContractId=${ClientContractid}&teamId=${TeamId}&payperiodId=${PayperiodId}`;
        return this.http.get(appSettings.GET_ALLIMPORTEDPISLOGDATA + req_params_Uri)
            .map(res => res)
            .catch(
                err => (err)
            );
    }
    public get_payrollInputOutputByPVRId(PVRId: any) {
        let req_params_Uri = `${PVRId}`;
        return this.http.get(appSettings.GET_PAYROLLINPUTOUTPUTSHEETBYID + req_params_Uri)
            .map(res => res)
            .catch(
                err => (err)
            );
    }
    put_downloadPaysheet(requrl) {
        return this.http.put(appSettings.GET_DOWNLOADPAYSHEET, requrl)
            .map(res => res)
            .catch(
                err => (err)
            );
    }

    public put_downloadPaySheet_Timecard(data) {
        return this.http.put(appSettings.PUT_DOWNLOADPAYSHEET_TIMECARD, data)
            .map(res => res)
            .catch(
                err => (err)
            );
    }

    // PAY RUN MODEL

    // public put_upsertPayRun(data) {
    //     return this.http.put(appSettings.PUT_UPSERTPAYRUN, data)
    //         .map(res => res)
    //         .catch(
    //             err => (err)
    //         );
    // }
    public put_InitiateSaleOrder(data) {
        return this.http.put(appSettings.PUT_INITIATESALEORDER, data)
            .map(res => res)
            .catch(
                err => (err)
            );
    }

    public put_ConfirmSaleOrder(data) {
        return this.http.put(appSettings.PUT_CONFIRMSALEORDER, data)
            .map(res => res)
            .catch(
                err => (err)
            );
    }

    // PAY SALE ORDER

    public put_RemovePayrunDetails(data) {
        return this.http.put(appSettings.PUT_REMOVEPAYRUNDETAILS, data)
            .map(res => res)
            .catch(
                err => (err)
            );
    }
    public delete_PayRun(Id) {
        var requrl = `Id=${Id}`
        return this.http.delete1(appSettings.DELETE_PAYRUN + requrl)
            .map(res => res)
            .catch(
                err => (err)
            );
    }

    public get_EmployeePayOutDetails(ClientContractid: any, PayperiodId: any) {
        let req_params_Uri = `clientContractId=${ClientContractid}&payperiodId=${PayperiodId}`;
        return this.http.get(appSettings.GET_EMPLOYEEPAYOUTDETAILS + req_params_Uri)
            .map(res => res)
            .catch(
                err => (err)
            );
    }

    public get_TerminationTimeCardDetails(employeeId) {
        let req_params_Uri = `employeeId=${employeeId}`;
        return this.http.get(appSettings.GET_TERMINATIONTIMECARDDETAILS + req_params_Uri)
            .map(res => res)
            .catch(
                err => (err)
            );
    }

    public VoidSalaryTimeCard(employeefnftransaction: EmployeeFnFTransaction) {
        return this.http.post(appSettings.POST_VOIDSALARYTIMECARD, employeefnftransaction);
    }

    public get_AdditionalTimeCardDetails(ClientContractid: any, PayperiodId: any, ProcessCategory: ProcessCategory) {
        let req_params_Uri = `clientContractId=${ClientContractid}&payperiodId=${PayperiodId}&processCategory=${ProcessCategory as number}`;
        return this.http.get(appSettings.GET_ADDITIONALTIMECARDDETAILS + req_params_Uri)
            .map(res => res)
            .catch(
                err => (err)
            );
    }

    public GetPaytransactionDetails(paytransactionId: any) {
        let req_params_Uri = `paytransactionId=${paytransactionId}`;
        return this.http.get(appSettings.GET_PAYTRANSACTIONDETAILSBYID + req_params_Uri)
            .map(res => res)
            .catch(
                err => (err)
            );
    }

    public previewSettlement(paytransactionId: any) {
        let req_params_Uri = `payTransactionId=${paytransactionId}`;
        return this.http.get(appSettings.GET_PREVIEWSETTLEMENTBYPAYTRANSACTIONID + req_params_Uri)
            .map(res => res)
            .catch(err => (err));
    }


    public get_SOLookupDetails(ClientId) {
        let req_params_Uri = `clientId=${ClientId}`;
        return this.http.get(appSettings.GET_SALEORDERLOOKUPDETAILS + req_params_Uri)
            .map(res => res)
            .catch(
                err => (err)
            );
    }


    public put_BillingSheetDataBySOId(data) {
        return this.http.put(appSettings.PUT_GETBILLINGSHEETDATABYSOID, data)
            .map(res => res)
            .catch(
                err => (err)
            );
    }

    public get_PayrollDetailsForQCSubmit(data) {
        return this.http.put(appSettings.PUT_GETPAYROLLDETAILSFORQCSUBMISSION, data)
            .map(res => res)
            .catch(
                err => (err)
            );
    }

    public get_ValidateRecreateSo(payrunId: any) {
        let req_params_Uri = `payrunId=${payrunId}`;
        return this.http.get(appSettings.GET_VALIDATERECREATESO + req_params_Uri)
            .map(res => res)
            .catch(
                err => (err)
            );
    }


    public ValidateTimecardsToReprocessBilling(data) {
        return this.http.put(appSettings.PUT_VALIDATETIMECARDTOREPROCESSBILLING, data)
            .map(res => res)
            .catch(
                err => (err)
            );
    }



    public ValidatePayOutIsLocked(payoutId) {
        let req_params_Uri = `payoutId=${payoutId}`;
        return this.http.get(appSettings.GET_VALIDATEPAYOUTISLOCKED + req_params_Uri)
            .map(res => res)
            .catch(
                err => (err)
            );
    }
    // PAY OUT INFORMATION UPSERT API CALL

    public PUT_UpsertPayRun(data) {
        return this.http.put(appSettings.PUT_UPSERTPAYRUN, data)
            .map(res => res)
            .catch(
                err => (err)
            );
    }

    public put_UpsertPayoutInformation(data) {
        return this.http.put(appSettings.PUT_UPSERTPAYOUTINFORMATION, data)
            .map(res => res)
            .catch(
                err => (err)
            );
    }

    public remove_PayoutInformationDetails(data) {
        return this.http.put(appSettings.REMOVE_PAYOUTINFORMATIONDETAILS, data)
            .map(res => res)
            .catch(
                err => (err)
            );
    }

    public delete_PayOut(Id) {
        var requrl = `Id=${Id}`
        return this.http.delete1(appSettings.DELETE_PAYOUT + requrl)
            .map(res => res)
            .catch(
                err => (err)
            );
    }

    public get_PayOutLookUpDetails(clientId) {
        let req_params_Uri = `clientId=${clientId}`;
        return this.http.get(appSettings.GET_PAYOUTLOOKUPDETAILS + req_params_Uri)
            .map(res => res)
            .catch(
                err => (err)
            );
    }

    /// PAY OUT REQUESTS

    public put_GeneratePayoutFile(data) {
        return this.http.put(appSettings.PUT_GENERATEPAYOUTFILE, data)
            .map(res => res)
            .catch(
                err => (err)
            );
    }

    public put_UpdateCompanyBankInPayoutInfo(data) {
        return this.http.put(appSettings.PUT_UPDATECOMPANYBANKINPAYOUTINFO, data)
            .map(res => res)
            .catch(
                err => (err)
            );
    }
    public put_UpdatePayoutInformation(data) {
        return this.http.put(appSettings.PUT_UPDATEPAYOUTINFORMATION, data)
            .map(res => res)
            .catch(
                err => (err)
            );
    }

    public post_ProcessBilling(data) {
        return this.http.post(appSettings.POST_PROCESSINGBILLING, data)
            .map(res => res)
            .catch(
                err => (err)
            );
    }


    public GetPayoutInformationbyId(Id) {
        let req_params_Uri = `Id=${Id}`;
        return this.http.get(appSettings.GET_PAYOUTINFORMATIONBYID + req_params_Uri)
            .map(res => res)
            .catch(
                err => (err)
            );
    }



    // SALE ORDER API

    public get_SaleOrdersbyPayrunId(payrunId) {
        let req_params_Uri = `payrunId=${payrunId}`;
        return this.http.get(appSettings.GET_SALEORDERSBYPAYRUNID + req_params_Uri)
            .map(res => res)
            .catch(
                err => (err)
            );
    }


    public put_UpdateSaleOrdersStatusDetails(data) {
        return this.http.put(appSettings.PUT_UPDATESALEORDERSTATUSDETAILS, data)
            .map(res => res)
            .catch(
                err => (err)
            );
    }
    public put_SaveSaleOrder(data) {
        return this.http.put(appSettings.PUT_SAVESALEORDER, data)
            .map(res => res)
            .catch(
                err => (err)
            );
    }

    public put_VoidSaleOrder(data) {
        return this.http.put(appSettings.PUT_VOIDSALEORDERS, data)
            .map(res => res)
            .catch(
                err => (err)
            );
    }

    public put_MergeSaleOrder(data) {
        return this.http.put(appSettings.PUT_MERGESALEORDER, data)
            .map(res => res)
            .catch(
                err => (err)
            );
    }

    public put_generateInvoice(data) {

        return this.http.put(appSettings.PUT_GENERATEINVOICE, data)
            .map(res => res)
            .catch(
                err => (err)
            );
    }


    //FINANCE CONTROL

    // PAYROLL INPUTS FOR EDIT

    public getTimeCardDetailsById(Id: any) {

        let req_params_Uri = `${Id}`;
        return this.http.get(appSettings.GET_TIMECARDDETAILSBYID + req_params_Uri)
            .map(res => res)
            .catch(
                err => (err)
            );

    }

    public getTimeCardUILookUpDetails(teamId) {
        let req_params_Uri = `teamId=${teamId}`;
        return this.http.get(appSettings.GET_TIMECARDUILOOKUPDETAILS + req_params_Uri)
            .map(res => res)
            .catch(
                err => (err)
            );
    }

    public put_SaveTimeCardDetails(data) {
        return this.http.put(appSettings.PUT_SAVETIMECARDDETAILS, data)
            .map(res => res)
            .catch(
                err => (err)
            );
    }

    public put_PreviewSaleOrderInvoice(data) {
        return this.http.put(appSettings.PUT_PREVIEWSALEORDERINVOICE, data)
            .map(res => res)
            .catch(
                err => (err)
            );
    }

    public GetLopDetailsForRevokal(employeeId, PayperiodId) {
        let req_params_Uri = `EmployeeId=${employeeId}&PayPeriodId=${PayperiodId}`;
        return this.http.get(appSettings.GET_GETLOPDETAILSFORREVOKE + req_params_Uri)
            .map(res => res)
            .catch(
                err => (err)
            );
    }

    // INVOICE API

    public put_SaveInvoice(data) {
        return this.http.put(appSettings.PUT_SAVEINVOICE, data)
            .map(res => res)
            .catch(
                err => (err)
            );
    }

    public get_InvoiceDetailsbyId(Id) {
        let req_params_Uri = `Id=${Id}`;
        return this.http.get(appSettings.GET_GETINVOICEDETAILSBYID + req_params_Uri)
            .map(res => res)
            .catch(
                err => (err)
            );
    }


    public get_PreviewInvoice(invoiceId) {
        let req_params_Uri = `invoiceId=${invoiceId}`;
        return this.http.get(appSettings.GET_PREVIEWINVOICE + req_params_Uri)
            .map(res => res)
            .catch(
                err => (err)
            );
    }

    public put_VoidInvoices(data) {
        return this.http.put(appSettings.PUT_VOIDINVOICES, data)
            .map(res => res)
            .catch(
                err => (err)
            );
    }

    public put_ContractRollOver(data) {
        return this.http.put(appSettings.PUT_CONTRACTROLLOVER, data)
            .map(res => res)
            .catch(
                err => (err)
            );
    }

    // FINANCE BANK API

    public GetYBFundBalanceInvoice(bankAccountId) {
        let req_params_Uri = `bankAccountId=${bankAccountId}`;
        return this.http.get_finance(appSettings.GET_YBFUNDBALANCE + req_params_Uri)
            .map(res => res)
            .catch(
                err => (err)
            );
    }
    public InitiateYBankPaymentTransaction(data) {
        return this.http.put_finance(appSettings.PUT_INITIATEYBBANKPAYMENTTRANSACTION, data)
            .map(res => res)
            .catch(
                err => (err)
            );
    }
    public GetYBPaymentDetailsStatus(data) {
        return this.http.put_finance(appSettings.PUT_GETYBPAYMENTDETAILSSTATUS, data)
            .map(res => res)
            .catch(
                err => (err)
            );
    }

    public GetTaxComputationDetails(clientContractId, payperiodId) {
        let req_params_Uri = `clientContractId=${clientContractId}&payperiod=${payperiodId}`;
        return this.http.get(appSettings.GET_TAXCOMPUTATIONDETAILS + req_params_Uri)
            .map(res => res)
            .catch(
                err => (err)
            );
    }
    public GetTaxComputationDetailsbyMonthYear(clientContractId, payrollmonth, payrollYear) {
        let req_params_Uri = `clientContractId=${clientContractId}&payrollmonth=${payrollmonth}&payrollYear=${payrollYear}`;
        return this.http.get(appSettings.GET_TAXCOMPUTATIONDETAILSBYMONTHYEAR + req_params_Uri)
            .map(res => res)
            .catch(
                err => (err)
            );
    }
    public GetTaxComputationDetailsbyFiscalYear(clientContractId, financialYearId) {
        let req_params_Uri = `clientContractId=${clientContractId}&financialYearId=${financialYearId}`;
        return this.http.get(appSettings.GET_TAXCOMPUTATIONDETAILSBYFISCALYEAR + req_params_Uri)
            .map(res => res)
            .catch(
                err => (err)
            );
    }


    public GetMonthlyPayrollData(clientId, clientContractId, month, year) {
        let req_params_Uri = `clientId=${clientId}&clientContractId=${clientContractId}&month=${month}&year=${year}`;
        return this.http.get(appSettings.GET_MONTHLYPAYROLLDATA + req_params_Uri)
            .map(res => res)
            .catch(
                err => (err)
            );
    }
    
    public GetPFChallanReport(clientId, month, year) {
        let req_params_Uri = `clientId=${clientId}&month=${month}&year=${year}`;
        return this.http.get(appSettings.GET_PFCHALLANREPORT + req_params_Uri)
            .map(res => res)
            .catch(
                err => (err)
            );
    }

    // PENNY DROP PAYMENT TRANS

    public initiatePennyDropPayment(data) {

        return this.http.put(appSettings.PUT_INITITATEPENNYDROPPAYMENTTRANSACTION, data)
            .map(res => res)
            .catch(
                err => (err)
            );
    }

    public GetYBPennyDropStatus(data) {
        return this.http.put(appSettings.PUT_GETYBPENNYDROPSTATUS, data)
            .map(res => res)
            .catch(
                err => (err)
            );
    }

    GetCompanySettings(companyId, clientId, clientContractId, settingValue) {
        let req_params_Uri = `${companyId}/${clientId}/${clientContractId}/${settingValue}`;
        return this.http.get(appSettings.GETCOMPANYSETTINGS + req_params_Uri)
            .map(res => res)
            .catch(err => (err));
    }
    GetCompanyRequiredSettings(companyId, ClientId, ClientContractId, settingNames) {

        let req_params_Uri = `CompanyId=${companyId}&ClientId=${ClientId}&ClientContractId=${ClientContractId}&settingNames=${settingNames}`;
        return this.http.get(appSettings.GETCOMPANYREQUIREDSETTINGS + req_params_Uri)
            .map(res => res)
            .catch(err => (err));
    }

    public getValidateTimeCardToProcess(employeeId) {
        let req_params_Uri = `employeeId=${employeeId}`;
        return this.http.get(appSettings.GET_VALIDATETIMECARDTOPROCESS + req_params_Uri)
            .map(res => res)
            .catch(err => (err));
    }

    public postProcessTimeCard(data) {
        return this.http.post(appSettings.POST_PROCESSTIMECARD, data)
            .map(res => res)
            .catch(err => (err));
    }

    ValidateAndPushToTimeCard(employeeId) {
        const promise = new Promise((resolve, reject) => {
            try {
                this.getValidateTimeCardToProcess(employeeId).subscribe((result) => {
                    let apiresult: apiResult = result;
                    console.log('CHECK VALID TIMECARD ::: ', apiresult);
                    if (apiresult.Status && apiresult.Result) {

                        this.postProcessTimeCard(apiresult.Result).subscribe((timeCard_response) => {
                            console.log('POST PROCESS OF TIMECARD RESULT ::::', timeCard_response)
                            resolve(true);
                        }, err => {
                            console.log("ERROR API CALL", err);
                        });
                    }
                    else{
                        resolve(true);                    }

                }, err => {
                    console.log("ERROR API CALL", err);
                });
            } catch (error) {
                console.log('******** EXCEPTION OCCURRED WHILE PUSHING INTO TIMECARD ********', error);

            }
        })
        return promise;
    }

    ProcessTimeCardWOQ(employeeId) {
        let req_params = `employeeId=${employeeId}`;
        return this.http.get(appSettings.GET_PROCESSTIMECARDWOQ + req_params)
            .map(res => res)
            .catch(err => (err));
    }
}
