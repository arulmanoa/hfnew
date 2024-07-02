import { ServiceBase } from './servicebase';
import { ApiConstants, ControllerConstants } from '../model/Common/constants';
import { Injectable } from '@angular/core';
import { SessionData } from '../model/Common/sessionData';
import { HttpService } from './http.service';
import { PayrollService } from './payroll.service';
import { apiResult } from '../model/apiResult';
import { EmployeeService } from './employee.service';
import { apiResponse } from '../model/apiResponse';
import { AlertService } from './alert.service';
import { ObjectStorageDetails } from '../model/Candidates/ObjectStorageDetails';
import { HttpClient } from '@angular/common/http';
import { Subject, Observable } from 'rxjs';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';


import { DataSourceType } from 'src/app/views/personalised-display/enums';
import { DataSource } from 'src/app/views/personalised-display/models';
import { PageLayout, ColumnDefinition, SearchElement } from 'src/app/views/personalised-display/models';
import { PagelayoutService, ExcelService } from 'src/app/_services/service';

@Injectable({

    providedIn: 'root'
})
export class CommonApiMethodService {
    constructor(private base: ServiceBase, private session: SessionData, private http: HttpService,
        public payrollService: PayrollService,
        public employeeService: EmployeeService,
        public alertService: AlertService,
        // private httpClient: HttpClient,
        private pageLayoutService: PagelayoutService,
        private excelService: ExcelService,
        private loadingScreenService : LoadingScreenService
    ) { }


    get_payoutinformationdetailsById(PayoutInformationId: any) {
        const promise = new Promise((resolve, reject) => {
            this.loadingScreenService.startLoading();

            var LstEmployeeForPayout = null;
            var inEmployeesInitiateList = [];
            var _LstPayoutEmployees = null;

            let datasource: DataSource = {
                Name: "GET_EMPLOYEELISTUSING_BATCHID",
                Type: DataSourceType.SP,
                IsCoreEntity: false
            }

            let searctElements: SearchElement[] = [
                {
                    FieldName: "@batchId",
                    Value: PayoutInformationId
                }
            ]
            this.pageLayoutService.getDataset(datasource, searctElements).subscribe((result) => {
                if (result.Status && result.dynamicObject != null && result.dynamicObject != '') {
                    let apiResult = JSON.parse(result.dynamicObject);
                    _LstPayoutEmployees = apiResult;
                }
                this.payrollService.GetPayoutInformationbyId(PayoutInformationId).subscribe((result) => {
                    const apiResult: apiResult = result;
                    if (apiResult.Status) {
                        const lstEmps = apiResult.Result as any;
                        console.log('PAYOUT INFO : ', lstEmps);

                        LstEmployeeForPayout = lstEmps != null && lstEmps;
                        inEmployeesInitiateList = LstEmployeeForPayout.LstPayoutInformationDetails
                        inEmployeesInitiateList.length > 0 && inEmployeesInitiateList.forEach(element => {
                            element['EmployeeCode'] = _LstPayoutEmployees.find(a => a.Id == element.Id).EmployeeCode;
                        });
                        this.loadingScreenService.stopLoading();
                        this.exportAsXLSX(inEmployeesInitiateList);
                        resolve(true);
                    } else {
                        this.loadingScreenService.stopLoading();
                        this.alertService.showWarning("No Records found!");
                        resolve(false);

                    }
                })
            }, error => {
                this.loadingScreenService.stopLoading();
                this.alertService.showWarning("Error Occured while Fetching Employee Data");
                resolve(false);

            })

        })
        return promise;


    }


    exportAsXLSX(inEmployeesInitiateList): void {
        let exportExcelDate = [];
        inEmployeesInitiateList.forEach(element => {
            exportExcelDate.push({
                EmployeeCode: element.EmployeeCode,
                EmployeeName: element.EmployeeName,
                MobileNumber: element.MobileNumber,
                NetPay: (Number(element.NetPay)),
                UTR: element.AcknowledgmentDetail,
                Remarks: element.ErrorMessage
            })

        });

        this.excelService.exportAsExcelFile(exportExcelDate, 'Payout_CheQue_Batch#_' + inEmployeesInitiateList[0].PayoutInformationId);
    }


}