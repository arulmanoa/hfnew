import { Injectable } from 'node_modules/@angular/core';


import 'rxjs/add/observable/of';
import { HttpService } from './http.service';
import { appSettings } from '../configs/app-settings.config';
import { environment } from "../../../environments/environment";

import { LoginResponses, UIMode } from 'src/app/_services/model';
import { SessionKeys } from 'src/app/_services/configs/app.config';

import { ObjectStorageDetails } from 'src/app/_services/model/Candidates/ObjectStorageDetails';
import { AlertService, SessionStorage } from 'src/app/_services/service';
import { apiResult } from 'src/app/_services/model/apiResult';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {

  // BusinessType: number = 0;
  // CompanyId: number = 0;
  // loginSessionDetails: LoginResponses;

  constructor(

    private http: HttpService,
    private httpClient: HttpClient
    
    // public alertService: AlertService,
    // public sessionService: SessionStorage,
  ) {

    // this.loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses));
    // this.BusinessType = this.loginSessionDetails.Company.LstCompanyBusinessTypeMapping != null ? this.loginSessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this.loginSessionDetails.Company.Id).BusinessType : 0;
    // this.CompanyId = this.loginSessionDetails.Company.Id;
  }

  // onFileReader(e, entityId,BusinessType,CompanyId,loginSessionDetails) {

  //     const promise = new Promise((resolve, reject) => {
  //         const file = e.target.files[0];
  //         const pattern = /image-*/;
  //         var type = e.target.files[0].type;
  //         var size = e.target.files[0].size;

  //         var maxSize = (Math.round(size / 1024) + " KB");
  //         var FileSize = e.target.files[0].size / 1024 / 1024;
  //         if (FileSize > 2) {
  //             this.alertService.showWarning('The attachment size exceeds the allowable limit.');
  //             resolve(0);
  //             return;
  //         }
  //         const reader = new FileReader();
  //         reader.readAsDataURL(file);
  //         reader.onloadend = () => {
  //             let FileUrl = (reader.result as string).split(",")[1];
  //             this.doAsyncUpload(FileUrl, file.name, null, entityId).then((s3DocumentId) => {
  //                 if (typeof s3DocumentId === 'number' && s3DocumentId > 0) {
  //                     resolve(s3DocumentId);
  //                 }
  //                 else {
  //                     resolve(0);
  //                 }
  //             });
  //         };
  //     });
  //     return promise;
  // }

  // doAsyncUpload(filebytes, filename, item, EmployeeId) {

  //     const promise = new Promise((resolve, reject) => {

  //         try {
  //             let objStorage = new ObjectStorageDetails();
  //             objStorage.Id = 0;
  //             objStorage.EmployeeId = EmployeeId;
  //             objStorage.ClientContractCode = this.BusinessType == 3 ? "" : this.sessionService.getSessionStorage("default_ContractCode") == null ? "" : this.sessionService.getSessionStorage("default_ContractCode").toString();
  //             objStorage.ClientCode = this.BusinessType == 3 ? "" : this.sessionService.getSessionStorage("default_ClientCode") == null ? "" : this.sessionService.getSessionStorage("default_ClientCode").toString();
  //             objStorage.CompanyCode = this.sessionService.getSessionStorage("CompanyCode") == null ? "" : this.sessionService.getSessionStorage("CompanyCode").toString();
  //             objStorage.ClientContractId = 0;
  //             objStorage.ClientId = 0;
  //             objStorage.CompanyId = this.CompanyId;
  //             objStorage.Status = true;
  //             objStorage.Content = filebytes;
  //             objStorage.SizeInKB = 12;
  //             objStorage.ObjectName = filename;
  //             objStorage.OriginalObjectName = filename;
  //             objStorage.Type = 0;
  //             objStorage.ObjectCategoryName = "EmpTransactions";
  //             this.postObjectStorage(JSON.stringify(objStorage)).subscribe((res) => {
  //                 let apiResult: apiResult = (res);
  //                 try {
  //                     if (apiResult.Status && apiResult.Result != "") {

  //                         resolve(apiResult.Result);

  //                     }
  //                     else {

  //                         this.alertService.showWarning("An error occurred while  trying to upload! " + apiResult.Message);
  //                         resolve(0);
  //                     }
  //                 } catch (error) {
  //                     this.alertService.showWarning("An error occurred while  trying to upload! " + error);
  //                     resolve(0);
  //                 }
  //             }), ((err) => {

  //             })

  //         } catch (error) {
  //             this.alertService.showWarning("An error occurred while  trying to upload! " + error);
  //             resolve(0);
  //         }
  //     });
  //     return promise;

  // }



  // deleteAsync(DocumentId) {

  //     const promise = new Promise((resolve, reject) => {
  //         this.deleteObjectStorage((DocumentId)).subscribe((res) => {
  //             let apiResult: apiResult = (res);
  //             try {

  //                 if (apiResult.Status) {

  //                     this.alertService.showSuccess("Awesome!...  Your file is deleted successfully!");
  //                     resolve(true);
  //                 } else {
  //                     this.alertService.showWarning("An error occurred while  trying to delete! " + apiResult.Message);
  //                     resolve(false);
  //                 }
  //             } catch (error) {

  //                 this.alertService.showWarning("An error occurred while  trying to delete! " + error)
  //                 resolve(false);
  //             }

  //         }), ((err) => {

  //         })
  //     });
  //     return promise;

  // }

  // unsavedDeleteFile(DocumentId) {
  //     this.deleteObjectStorage((DocumentId)).subscribe((res) => {
  //         console.log(res);
  //         let apiResult: apiResult = (res);
  //         try {

  //         } catch (error) {
  //         }
  //     }), ((err) => {
  //     })
  // }


  public getObjectStorage(ObjStroageId): any {

    let req_params = `objStorageId=${ObjStroageId} `

    return this.http.getS3(appSettings.GET_OBJECTSTORAGE + req_params)
      .map(res => res)
      .catch(
        err => (err)
      );

  }

  // GetStoredObjectsInZipFile(objectStorageIds : number[]){
  //     // let req_params = `objectStorageIds=123`;
  //     let req_params = `objectStorageIds=${JSON.stringify(objectStorageIds)} `;   


  //     return this.http.post(appSettings.GET_STOREDOBJECTSASZIPFILE + req_params)
  //         .map(res => res)
  //         .catch(
  //             err => (err)
  //         );
  // }

  GetStoredObjectsInZipFile(objectStorageIds: number[]) {

    return this.http.postForObjectStorage(appSettings.GET_STOREDOBJECTSASZIPFILE, objectStorageIds)
      .map(res => res)
      .catch(
        err => (err)
      );
  }

  public postObjectStorage(data): any {

    return this.http.post(appSettings.POST_OBJECTSTORAGE, data)
      .map(res => res)
      .catch(
        err => (err)
      );

  }
  public postGeneralMail(data): any {
    return this.http.post(appSettings.POST_GENERAL_MAIL, data)
      .map(res => res)
      .catch(
        err => (err)
      );
  }
  public BulkSendGeneralMail(data): any {
    return this.http.post(appSettings.POST_GENERALBULK_MAIL, data)
      .map(res => res)
      .catch(
        err => (err)
      );
  }


  public PostEmpMissingDocumentsMail(data): any {
    return this.http.post(appSettings.POST_EMP_MISSING_DOC_MAIL, data)
      .map(res => res)
      .catch(
        err => (err)
      );
  }


  public deleteObjectStorage(Id): any {
    // let delete_param = `objStorageId=${Id}`
    // return this.http.delete(appSettings.DELETE_OBJECTSTORAGE + delete_param)
    //     .map(res => res)
    //     .catch(
    //         err => (err)
    //     );

    return this.http.postForObjectStorage(appSettings.DELETE_OBJECTSTORAGE, Id)
      .map(res => res)
      .catch(
        err => (err)
      );

  }

  public deletCandidateDocuments(data): any {

    return this.http.post(appSettings.DELETE_CANDIDATEDOCUMENTS, data)
      .map(res => res)
      .catch(
        err => (err)
      );

  }

  public getObjectById(id): any {

    // const url = environment.environment.OBJECTSTORAGE_BASE_URL + appSettings.GET_OBJECT_BY_ID + id;
    // return this.http.genericGet(url)
    //     .map(res => res)
    //     .catch(
    //         err => (err)
    //     );

    return this.http.postForObjectStorage(appSettings.GET_OBJECT_BY_ID, id)
      .map(res => res)
      .catch(
        err => (err)
      );

  }

  public downloadObjectAsBlob(id): any {
    const url = this.getUrlToGetObject(id);
    return this.getObjectAsBlob(url);
    // return this.http.getObjectAsBlob(url)
    //   .map(res => res)
    //   .catch(
    //     err => (err)
    //   );
  }

  getObjectAsBlob(url: string): Observable<any> {
    return this.http.getObjectAsBlob(url)
      .pipe(
        catchError((error: any) => {
          if (error.status === 500) {
            console.error('Internal Server Error:', error);
            return throwError('Internal Server Error occurred');
          } else {
            console.error('Error:', error);
            return throwError(error);
          }
        })
      );
  }

  public downloadtObjectById(id): any {
    //console.log(id);        
    const url = this.getUrlToGetObject(id);
    //console.log(url);        
    return this.http.genericGet(url)
      .map(res => res)
      .catch(
        err => (err)
      );
  }

  public getUrlToGetObject(id): any {
    return environment.environment.OBJECTSTORAGE_BASE_URL + appSettings.GET_DOC_BY_ID + '/' + id + '/' + this.http.getToken();
  }

  public getContentType(fileNameWithExtension): string {
    if (fileNameWithExtension == null || fileNameWithExtension == undefined || fileNameWithExtension == '') {
      return '';
    }

    var fileNameSplitsArray = fileNameWithExtension.split('.');
    if (fileNameSplitsArray.length < 2) {
      return '';
    }

    var ext = fileNameSplitsArray[fileNameSplitsArray.length - 1];
    if (ext == "doc") {
      return "application/msword";
    }
    else if (ext == "docx") {
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    }
    else if (ext == "pdf") {
      return "application/pdf";
    }
    else if (ext == "html") {
      return "text/html";
    }
    else if (ext == "xlsx") {
      return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    }
    else if (ext.toUpperCase() == "PNG" || ext.toUpperCase() == 'JPG' || ext.toUpperCase() == 'JPEG' || ext == "png" || ext == "jpg" || ext == "jpeg" || ext == "svg" || ext == "giff" || ext == "jfif") {
      return "image/" + ext;
    }
    else if (ext.toUpperCase() == "WEBP") {
      return "image/" + ext;
    }
    else if (ext == "txt") {
      return "text/plain";
    }
    else if (ext == "pptx") {
      return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
    }
    else if (ext == "ppt") {
      return "application/vnd.ms-powerpoint";
    }
    else {
      return '';
    }
  }

  doFileUpload(): void {



  }

  getFileBlob(img_url: string) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    return this.httpClient.get(`${img_url}`, {
      headers: headers,
      responseType: 'blob', // Set the responseType to 'blob' here
    }).pipe(map((res: Blob) => res));

  }

  downloadFAQFile(fileUrl): void {    
    this.httpClient.get(fileUrl, { responseType: 'blob' }).subscribe(blob => {
      const downloadLink = document.createElement('a');
      const blobUrl = URL.createObjectURL(blob);

      downloadLink.href = blobUrl;
      downloadLink.download = 'LTA_Rules_and_FAQs.pdf';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(blobUrl);
    });
  }
}