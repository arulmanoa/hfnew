import { Component, OnInit } from '@angular/core';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { Genericimport2ModalComponent } from 'src/app/shared/modals/generic-import-modals/genericimport2/genericimport2modal.component';
import { ObjectStorageDetails } from 'src/app/_services/model/Candidates/ObjectStorageDetails';
import { GenericImportLogData } from 'src/app/_services/model/GenericImportLogData';
import { AlertService, EmployeeService, ExcelService, SessionStorage } from 'src/app/_services/service';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { LoginResponses } from '../../../_services/model/Common/LoginResponses';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
import { apiResult } from 'src/app/_services/model/apiResult';
@Component({
  selector: 'app-genericimport2',
  templateUrl: './genericimport2.component.html',
  styleUrls: ['./genericimport2.component.css']
})
export class Genericimport2Component implements OnInit {
  modalOption: NgbModalOptions = {};
  convertedJSON: [];
  encodedBase64: any;
  importTypeId: any;
  importConfigId: any;
  successList = [];
  failedList = [];

  sessionDetails: LoginResponses;
  RoleId: number = 0;
  UserId: any = 0;
  CompanyId: any;
  isValidationDone: boolean = false;
  spinner: boolean = false;
  teamId : any;
  constructor(
    private modalService: NgbModal,
    private employeeService: EmployeeService,
    public sessionService: SessionStorage,
    private loadingScreenService: LoadingScreenService,
    private alertService: AlertService,
    public excelService: ExcelService,


  ) { }

  ngOnInit() {
    this.isValidationDone = false;
    this.encodedBase64 = null;
    this.convertedJSON = [];
    this.successList = [];
    this.failedList = [];
    this.teamId = 0;
    this.modalOption.backdrop = 'static';
    this.modalOption.keyboard = false;
    this.sessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses)); // Get the whole matched session element set as a clean json(array) via an session object
    this.RoleId = this.sessionDetails.UIRoles[0].Role.Id; // bind Logged user id may be change baed on dashboard 
    this.UserId = this.sessionDetails.UserSession.UserId;
    this.CompanyId = this.sessionDetails.Company.Id;
  }
  openImportPopup() {

    const modalRef = this.modalService.open(Genericimport2ModalComponent, this.modalOption);
    modalRef.result.then((result) => {
      if (result != "Closed") {
        result = JSON.parse(result);
        console.log('ss', result)
        if(result.data == 'Closed'){
          this.encodedBase64 = null;
          this.convertedJSON = [];
          this.successList = [];
          this.failedList = [];
          this.isValidationDone = false;
        }else {
          this.convertedJSON = result.data;
          this.encodedBase64 = result.file;
          this.importTypeId = result.importTypeId;
          this.importConfigId = result.importConfigId;
          this.teamId = result.teamId;
          console.log('this.convertedJSON', this.convertedJSON);
        }
      

      } else { 
        this.encodedBase64 = null;
        this.convertedJSON = [];
        this.successList = [];
        this.failedList = [];
        this.isValidationDone = false;
      }
    }).catch((error) => {
      console.log(error);
    });
  }
  getLetterSpace(string) {
    return string.replace(/([a-z])([A-Z])/g, '$1 $2')
  }

  Validate(isImport) {
    this.submitBulkRequest(false);
  }

  submitBulkRequest(isImport) {

    this.loadingScreenService.startLoading();
    var objectStore = new ObjectStorageDetails();
    objectStore.Content = this.encodedBase64;
    var genericImportLogData = new GenericImportLogData();
    genericImportLogData.IsImported = isImport;
    genericImportLogData.ObjectStorageId = 0;
    genericImportLogData.Remarks = '';
    genericImportLogData.OutData = null;
    genericImportLogData.ImportedRecords = this.convertedJSON.length;
    genericImportLogData.ImportedBy = this.UserId;
    genericImportLogData.ImportedOn = new Date();
    genericImportLogData.PayPeriodId = 0;
    genericImportLogData.TeamId = this.teamId;
    genericImportLogData.ClientContractId = Number(this.sessionService.getSessionStorage("default_SME_ContractId"));
    genericImportLogData.ClientId =  Number(this.sessionService.getSessionStorage("default_SME_ClientId"));
    genericImportLogData.CompanyId =  this.CompanyId;
    genericImportLogData.ImportConfigurationId =   this.importConfigId;
    genericImportLogData.ImportType =  this.importTypeId;
    genericImportLogData.Id = 0;
    genericImportLogData.ImportedFileDetails = objectStore;
    genericImportLogData.EmploymentContracts = [];

    console.log('genericImportLogData', genericImportLogData);

    this.employeeService.GenericImport(genericImportLogData)
      .subscribe((result) => {
        let apiRes: apiResult = result;
        if (apiRes.Status && apiRes.Result != null) {
          var importedList = [];
          importedList = apiRes.Result as any;
          if (importedList != null && importedList.length > 0) {
            this.isValidationDone = true;
            this.successList = importedList.filter(a => a.IsDataImported == true);
            this.failedList = importedList.filter(a => a.IsDataImported == false);
            
          }

          this.loadingScreenService.stopLoading();
          this.alertService.showSuccess(`${apiRes.Message}`);
        } else {
          var importedList = [];
          importedList = apiRes.Result as any;
          if (importedList != null && importedList.length > 0) {
            this.isValidationDone = true;
            this.successList = importedList.filter(a => a.IsDataImported == true);
            this.failedList = importedList.filter(a => a.IsDataImported == false);
            if (this.failedList.length > 0) {
            }
          }

          this.alertService.showWarning(`Something bad has happened : ${apiRes.Message}`);
          this.loadingScreenService.stopLoading();
        }
      })
  }

  abortUpload() {
    this.encodedBase64 = null;
    this.convertedJSON = [];
    this.successList = [];
    this.failedList = [];
    this.isValidationDone = false;
  }


  setDownload() {

    let failedList = [];
    const profile = this.convertedJSON;
    function deleteProperty(object, property) {
        var clonedObject = JSON.parse(JSON.stringify(object));
        property.forEach(e => {
            delete clonedObject[e];

        });
        return clonedObject;
    }
    profile.forEach(element => {
        failedList.push(deleteProperty(element, ["IsDataImported", "Remarks"]));
    });

    this.excelService.exportAsExcelFile(failedList, 'FailedTeamplate');

}

 moveObjectElement(currentKey, afterKey, obj) {
    var result = {};
    var val = obj[currentKey];
    delete obj[currentKey];
    var next = -1;
    var i = 0;
    if (typeof afterKey == 'undefined' || afterKey == null) afterKey = '';
    $.each(obj, function (k, v) {
      if ((afterKey == '' && i == 0) || next == 1) {
        result[currentKey] = val;
        next = 0;
      }
      if (k == afterKey) { next = 1; }
      result[k] = v;
      ++i;
    });
    if (next == 1) {
      result[currentKey] = val;
    }
    if (next !== -1) return result; else return obj;
  }
  //    bufferToBase64Async( buffer ) {
  //     var blob = new Blob([buffer], {type:'application/octet-binary'});    
  //     console.log("buffer to blob:" + blob)

  //     var fileReader = new FileReader();
  //     fileReader.onload = function() {
  //       var dataUrl = fileReader.result;
  //       console.log("blob to dataUrl: " + dataUrl);

  //       var base64 = dataUrl.substr(dataUrl.indexOf(',')+1)       
  //       console.log("dataUrl to base64: " + base64);
  //     };
  //     fileReader.readAsDataURL(blob);
  // }
}
