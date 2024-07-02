import { isValid } from 'date-fns';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
import { apiResult } from 'src/app/_services/model/apiResult';
import { ObjectStorageDetails } from 'src/app/_services/model/Candidates/ObjectStorageDetails';
import { ImportedPISLogData } from './../../../../_services/model/Payroll/ImportedPIS';
import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import * as XLSX from 'xlsx';
// SERVICES
import { AlertService } from './../../../../_services/service/alert.service';
import { PayrollService } from 'src/app/_services/service/payroll.service';
import { LoginResponses } from 'src/app/_services/model';
import { SessionStorage } from 'src/app/_services/service/session-storage.service';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { ExcelService } from 'src/app/_services/service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-payroll-importdata',
  templateUrl: './payroll-importdata.component.html',
  styleUrls: ['./payroll-importdata.component.css']
})


export class PayrollImportdataComponent implements OnInit {
  @Input() ClientName: any
  @Input() objStorageJson: any;
  @ViewChild('inputFile') myInputVariable: ElementRef;

  convertedJSON: any;

  encodedBase64: any;
  FileName: string = '';
  FileCount: number = 0

  outputData = [];
  outputData_Failed = [];
  outputData_Success = [];
  Result_ImportedPISLogData: ImportedPISLogData;

  sessionDetails: LoginResponses;
  RoleId: number = 0;
  UserId: any;
  BusinessType: number;

  constructor(

    private activeModal: NgbActiveModal,
    private alertService: AlertService,
    private payrollService: PayrollService,
    private loadingScreenService: LoadingScreenService,
    public sessionService: SessionStorage,
    public excelService: ExcelService,


  ) { }

  ngOnInit() {
    this.sessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses)); // Get the whole matched session element set as a clean json(array) via an session object
    this.RoleId = this.sessionDetails.UIRoles[0].Role.Id; // bind Logged user id may be change baed on dashboard 
    this.UserId = this.sessionDetails.UserSession.UserId;
    this.BusinessType = this.sessionDetails.Company.LstCompanyBusinessTypeMapping != null ?
      this.sessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this.sessionDetails.Company.Id).BusinessType : 0;
    this.objStorageJson = JSON.parse(this.objStorageJson);
    console.log('OBJ :', this.objStorageJson);

  }

  getBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        let encoded = reader.result.toString().replace(/^data:(.*,)?/, '');
        if ((encoded.length % 4) > 0) {
          encoded += '='.repeat(4 - (encoded.length % 4));
        }
        console.log('Result: ', encoded);
        this.encodedBase64 = encoded;
        resolve(encoded);
      };
      reader.onerror = error => reject(error);
    });
  }

  // toBase64  = file => new Promise((resolve, reject) => {
  //   const reader = new FileReader();
  //   reader.readAsDataURL(file);
  //   reader.onload = () => resolve(reader.result);
  //   reader.onerror = error => reject(error);
  // });

  async onbrowseFile(e) {
    const file = e.target.files[0];
    file != null && this.loadingScreenService.startLoading();
    this.FileName = file.name;
    await this.upload_file(e);
    await this.getBase64(file).then((result) => {
      this.validateExcelRecords('validate');
    }, (error) => {
      this.loadingScreenService.stopLoading();
    });
  }


  getLetterSpace(string) {
    return string.replace(/([a-z])([A-Z])/g, '$1 $2')
  }

  validateExcelRecords(index) {
    if (index == "confirm") {
      const isValid = this.outputData.find(z => z.IsValid == "False");
      if (isValid != null) {
        this.alertService.confirmSwal1("Confirmation!", `The payroll confirmation action will only take over the successful employees on the list.`, "Yes, Continue", "No, Cancel").then((result) => {
          try {
            this.triggerApiCall(index);
          } catch (error) {
          }
        }).catch(error => {
        });
      }
      else {
        this.triggerApiCall(index);
      }
      // if (isValid != null) { this.alertService.showWarning('Something went wrong! Please try again later.'); this.loadingScreenService.stopLoading(); return };
    } else {
      this.triggerApiCall(index);
    }

  }

  triggerApiCall(index) {
    index == "confirm" && this.loadingScreenService.startLoading();
    console.log(this.objStorageJson);
    const objStorage = new ObjectStorageDetails();
    objStorage.Id = 0;
    objStorage.CandidateId = 0;
    objStorage.EmployeeId = 0;
    objStorage.ClientContractCode = this.BusinessType == 3 ? "" : this.sessionService.getSessionStorage("default_ContractCode") == null ? "" : this.sessionService.getSessionStorage("default_ContractCode").toString();
    objStorage.ClientCode = this.BusinessType == 3 ? "" : this.sessionService.getSessionStorage("default_ClientCode") == null ? "" : this.sessionService.getSessionStorage("default_ClientCode").toString();
    objStorage.CompanyCode = this.sessionService.getSessionStorage("CompanyCode") == null ? "" : this.sessionService.getSessionStorage("CompanyCode").toString();
    objStorage.ClientContractId = this.objStorageJson.ClientContractId;
    objStorage.ClientId = this.objStorageJson.ClientId;
    objStorage.CompanyId = this.objStorageJson.CompanyId;

    objStorage.Status = true;
    objStorage.Content = this.encodedBase64;
    objStorage.SizeInKB = 12;
    objStorage.ObjectName = this.FileName;
    objStorage.OriginalObjectName = this.FileName;
    objStorage.Type = 0;
    objStorage.ObjectCategoryName = "Transactions";

    var apiObject = new ImportedPISLogData();
    apiObject.Id = 0;
    apiObject.PISConfigurationId = 0;
    apiObject.CompanyId = 0;
    apiObject.ClientId = this.objStorageJson.clientId;
    apiObject.ClientContractId = this.objStorageJson.clientcontractId;
    apiObject.PayPeriodId = this.objStorageJson.payperiodId;
    apiObject.ImportedOn = new Date();
    apiObject.ImportedBy = this.UserId;
    apiObject.ImportedRecords = this.FileCount;
    apiObject.OutData = index == "confirm" ? this.Result_ImportedPISLogData.OutData : null;
    apiObject.Remarks = '';
    apiObject.ObjectStorageId = 0;
    apiObject.IsImported = index == "confirm" ? true : false;
    apiObject.ImportedFileDetails = objStorage;
    this.payrollService.post_importPIS(JSON.stringify(apiObject))
      .subscribe((res) => {
        console.log('RESPONSE API: ', res);
        const apiResult: apiResult = res;
        if (index == "validate") {
          if (apiResult.Status) {
            this.Result_ImportedPISLogData = apiResult.Result as any;
            let list = this.Result_ImportedPISLogData.OutData as [];
            console.log('OutData :', this.outputData);
            this.FileCount = list.length;
            list.forEach(element => {
              this.outputData.push(this.deleteProperty(element, ["TimeCardData"]));
            });
            this.checkFailedItems();
            this.loadingScreenService.stopLoading();
          }
          else {
            this.alertService.showWarning("Runtime Execution Error: The file is incorrect or worksheet name is wrong/" + apiResult.Message + " Please try again");
            this.loadingScreenService.stopLoading();
            this.myInputVariable.nativeElement.value = ''; this.FileName = null, this.FileCount = 0; return;
          }
        } else {
          this.loadingScreenService.stopLoading();
          if (apiResult.Status) {
            this.alertService.showSuccess(apiResult.Message);
            this.modal_dismiss();
          }
          else {
            this.alertService.showWarning("Runtime Execution Error: The file is incorrect or worksheet name is wrong/" + apiResult.Message + " Please try again");

          }
        }
      }, error => {

      });
  }
  deleteProperty(object, property) {
    var clonedObject = JSON.parse(JSON.stringify(object));
    property.forEach(e => {
      delete clonedObject[e];

    });
    return clonedObject;
  }

  checkFailedItems() {
    this.outputData_Success = [];
    this.outputData_Failed = [];
    // show only these keys and its data on the table 
    const keys_to_keep = ['EmployeeCode', 'EmployeeName', 'Remarks'];
    const reduxKey = array => array.map(o => keys_to_keep.reduce((acc, curr) => {
      acc[curr] = o[curr];
      return acc;
    }, {}));
    this.outputData_Success = reduxKey(this.outputData.filter(a => a.IsValid == "True"));
    this.outputData_Failed = reduxKey(this.outputData.filter(a => a.IsValid ==  "False"));
  }
  modal_dismiss() {

    this.activeModal.close('Modal Closed');
  }

  upload_file(ev) {
    let workBook = null;
    let jsonData = null;
    const reader = new FileReader();
    const file = ev.target.files[0];
    reader.onload = (event) => {
      const data = reader.result;
      workBook = XLSX.read(data, { type: 'binary', cellDates: true });
      jsonData = workBook.SheetNames.reduce((initial, name) => {
        const sheet = workBook.Sheets[name];
        initial[name] = XLSX.utils.sheet_to_json(sheet, { raw: false });
        return initial;
      }, {});
      console.log(jsonData);

      this.convertedJSON = jsonData[Object.keys(jsonData)[0]]; // (jsonData.Sheet1);

      if (typeof this.convertedJSON == 'undefined') {
        this.alertService.showWarning("Runtime Execution error: The file is incorrect or worksheet name is wrong! Please try again"); this.myInputVariable.nativeElement.value = ''; return;
      }

      // this.FileCount = this.convertedJSON.length;
      console.log("The count in excel file: ", this.convertedJSON.length)
      // if (this.convertedJSON.length > 100) {
      //   this.alertService.showWarning('The imported file has exceeded the maximum allowed file limits (100).')
      //   this.myInputVariable.nativeElement.value = '';
      //   return;
      // } else {

      //   $('#popup_import_data').modal('hide');
      // }


      //   document.getElementById('output').innerHTML = dataString.slice(0, 300).concat("...");
      //   this.setDownload(dataString);
    }
    reader.readAsBinaryString(file);
  }



  setDownload() {

    let failedList = [];
    const profile = this.outputData_Failed;
    function deleteProperty(object, property) {
      var clonedObject = JSON.parse(JSON.stringify(object));
      property.forEach(e => {
        delete clonedObject[e];

      });
      return clonedObject;
    }
    profile.forEach(element => {
      failedList.push(deleteProperty(element, ["IsValid", "Remarks", "TimeCardData"]));
    });

    this.excelService.exportAsExcelFile(failedList, 'FailedTeamplate');

  }

  exportTableAsExcel() {
    const fileName = "import-PIS-valid-invalid-entry.xlsx";
    const sheetName = ["sheet1", "sheet2"];
      let wb = XLSX.utils.book_new();
      for (var i = 0; i < sheetName.length; i++) {
        let ws = sheetName[i] === 'sheet1' ? XLSX.utils.json_to_sheet(this.outputData.filter(a => a.IsValid ==  "True")) :
        XLSX.utils.json_to_sheet(this.outputData.filter(a => a.IsValid ==  "False"));
        XLSX.utils.book_append_sheet(wb, ws, sheetName[i]);
      }
      XLSX.writeFile(wb, fileName);
  }



}
