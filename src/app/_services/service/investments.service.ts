
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { LoginResponses, UIMode } from 'src/app/_services/model';
import { SessionKeys } from 'src/app/_services/configs/app.config';

import { ObjectStorageDetails } from 'src/app/_services/model/Candidates/ObjectStorageDetails';
import { AlertService, FileUploadService, SessionStorage } from 'src/app/_services/service';
import { apiResult } from 'src/app/_services/model/apiResult';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';


@Injectable({
    providedIn: 'root'
})
export class InvestmentService {

    BusinessType: number = 0;
    CompanyId: number = 0;
    loginSessionDetails: LoginResponses;

    constructor(private sessionService: SessionStorage, private fileuploadService: FileUploadService, private alertService: AlertService) {
        this.loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses));
        this.BusinessType = this.loginSessionDetails.Company.LstCompanyBusinessTypeMapping != null ? this.loginSessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this.loginSessionDetails.Company.Id).BusinessType : 0;
        this.CompanyId = this.loginSessionDetails.Company.Id;

    }

    PermissibleRoles(RoleCode) {
      const authorizedRoles = environment.environment['AuthorizedRolesToAdjustApprovedAmount'];
      return authorizedRoles && authorizedRoles.includes(RoleCode) ? true : false;
    }

    doAsyncUpload(filebytes, filename, item, EmployeeId) {

      console.log('filebytes', filebytes);
      
        const promise = new Promise((resolve, reject)=> {

                try {
            let objStorage = new ObjectStorageDetails();
            objStorage.Id = 0;
            objStorage.EmployeeId = EmployeeId;
            objStorage.ClientContractCode = this.BusinessType == 3 ? "" : this.sessionService.getSessionStorage("default_ContractCode") == null ? "" : this.sessionService.getSessionStorage("default_ContractCode").toString();
            objStorage.ClientCode = this.BusinessType == 3 ? "" : this.sessionService.getSessionStorage("default_ClientCode") == null ? "" : this.sessionService.getSessionStorage("default_ClientCode").toString();
            objStorage.CompanyCode = this.sessionService.getSessionStorage("CompanyCode") == null ? "" : this.sessionService.getSessionStorage("CompanyCode").toString();
            objStorage.ClientContractId = 0;
            objStorage.ClientId = 0;
            objStorage.CompanyId = this.CompanyId;
            objStorage.Status = true;
            objStorage.Content = filebytes;
            objStorage.SizeInKB = 12;
            objStorage.ObjectName = filename;
            objStorage.OriginalObjectName = filename;
            objStorage.Type = 0;
            objStorage.ObjectCategoryName = "EmpTransactions";
            this.fileuploadService.postObjectStorage(JSON.stringify(objStorage)).subscribe((res) => {
                let apiResult: apiResult = (res);
                try {
                    if (apiResult.Status && apiResult.Result != "") {

                        resolve(apiResult.Result);

                    }
                    else {
                        
                        this.alertService.showWarning("An error occurred while  trying to upload! " + apiResult.Message);
                        resolve(0);
                    }
                } catch (error) {
                    this.alertService.showWarning("An error occurred while  trying to upload! " + error);
                    resolve(0);
                }
            }), ((err) => {

            })

        } catch (error) {
            this.alertService.showWarning("An error occurred while  trying to upload! " + error);
            resolve(0);
        }
    });
    return promise;

    }



    deleteAsync(DocumentId) {
        
        const promise = new Promise((resolve, reject)=> {
        this.fileuploadService.deleteObjectStorage((DocumentId)).subscribe((res) => {
            let apiResult: apiResult = (res);
            try {
               
                if (apiResult.Status) {
                   
                    this.alertService.showSuccess("Awesome!...  Your file is deleted successfully!");
                    resolve(true);
                } else {
                    this.alertService.showWarning("An error occurred while  trying to delete! " + apiResult.Message);
                    resolve(false);
                }
            } catch (error) {

                this.alertService.showWarning("An error occurred while  trying to delete! " + error)
                resolve(false);
            }

        }), ((err) => {

        })
    });
    return promise;

    }

    unsavedDeleteFile(DocumentId) {
        this.fileuploadService.deleteObjectStorage((DocumentId)).subscribe((res) => {
            console.log(res);
            let apiResult: apiResult = (res);
            try {
              
            } catch (error) {
            }
        }), ((err) => {
        })
    }

}