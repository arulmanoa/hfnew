import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { enumHelper } from 'src/app/shared/directives/_enumhelper';
import { apiResult } from 'src/app/_services/model/apiResult';
import { ImportType } from 'src/app/_services/model/GenericImportLogData';
import { AlertService, CommonService, DownloadService, EmployeeService, ImportLayoutService, PagelayoutService, SessionStorage } from 'src/app/_services/service';
import * as XLSX from 'xlsx';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { DataSourceType } from 'src/app/views/personalised-display/enums';
import { DataSource } from 'src/app/views/personalised-display/models';
import { apiResponse } from 'src/app/_services/model/apiResponse';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-genericimport2modal',
  templateUrl: './genericimport2modal.component.html',
  styleUrls: ['./genericimport2modal.component.css']
})
export class Genericimport2ModalComponent implements OnInit {
  ImportTypeList: any[] = [];
  convertedJSON: any;
  isValidToUpload: boolean = false;
  isLoading: boolean = false;
  templateFile: any;
  selectedImportType: any;
  importTypeId: any;
  importConfigId: any;
  encodedBase64: any;
  TeamList = [];
  selectedTeamId: any;
  firsttimeLoader: boolean = false;
  @ViewChild('inputFile') myInputVariable: ElementRef;
  importConfigurationList = [];

  constructor(
    private alertService: AlertService,
    private utilsHelper: enumHelper,
    private employeeService: EmployeeService,
    private commonService: CommonService,
    public downloadService: DownloadService,
    private activeModal: NgbActiveModal,
    private pagelayoutService: PagelayoutService,
    private sessionService: SessionStorage

  ) { }

  ngOnInit() {
    this.ImportTypeList = [];
    this.importConfigurationList = [];
    this.firsttimeLoader = true;
    this.getTeamList();
    this.getImportConfiguration();
    this.selectedTeamId = null;
    this.importTypeId = null;
    this.importConfigId = null;
    this.ImportTypeList = this.utilsHelper.transform(ImportType) as any;
  }
  getImportType(Id) {
    this.templateFile = null;
    this.isValidToUpload = false;

    const promise = new Promise((res, rej) => {
      this.employeeService.GetImportConfigurationbyId(Id)
        .subscribe((result) => {
          console.log('IMPORT TYPE RESULT :: ', result);
          let apiResult: apiResult = result;
          if (apiResult.Status && apiResult.Result != null) {

            var data = apiResult.Result as any;
            this.templateFile = data.TemplateFile as any;
            this.importConfigId = data.Id;
            this.isValidToUpload = this.templateFile != null ? true : false;
            this.isLoading = false;

          } else {
            this.alertService.showWarning(`Something bad has happened : ${apiResult.Message}`);
            this.isLoading = false;

          }
          res(true);
        })
    })
    return promise;
  }

  onChangeImportType(event) {
    var dbImportTypeMainId = 0;
    this.isLoading = true;
    this.importTypeId = event.id;
    this.selectedImportType = event.name;
    if( this.importConfigurationList.length > 0 && this.importConfigurationList.find(a=>a.ImportType == event.id && a.TeamId == this.selectedTeamId) != undefined){
      dbImportTypeMainId = this.importConfigurationList.find(a=>a.ImportType == event.id && a.TeamId == this.selectedTeamId).Id ;
      this.getImportType(dbImportTypeMainId).then(() => { console.log('task completed') })
    }else {
      this.isLoading = false;
      this.alertService.showWarning('no records found');
    }
  

  }

  download_template() {
    this.downloadService.base64Toxlsx(this.templateFile, `${this.selectedImportType}`);
  }

  onChangeTeam(e) {
    this.importTypeId = null;
    this.selectedImportType =  null;
    this.ImportTypeList =  [];
    this.ImportTypeList = this.utilsHelper.transform(ImportType) as any; //this.importConfigurationList.length > 0 ?   this.importConfigurationList.filter(a => a.TeamId == e.Id) : true;
    this.selectedTeamId = e.Id;
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
        this.encodedBase64 = encoded;
        resolve(encoded);
      };
      reader.onerror = error => reject(error);
    });
  }


  onFileChange(ev) {
    let workBook = null;
    let jsonData = null;
    const reader = new FileReader();
    const file = ev.target.files[0];
    this.getBase64(file).then((result) => { });
    reader.onload = (event) => {
      const data = reader.result;
      workBook = XLSX.read(data, { type: 'binary', cellDates: true });

      jsonData = workBook.SheetNames.reduce((initial, name) => {
        const sheet = workBook.Sheets[name];
        initial[name] = XLSX.utils.sheet_to_json(sheet, {
          raw: false, header: 0,
          defval: ""
        });
        return initial;
      }, {});
      console.log(jsonData);

      this.convertedJSON = (jsonData.upload);

      if (typeof this.convertedJSON == 'undefined') {
        this.alertService.showWarning("Runtime Execution error: The file is incorrect or worksheet name is wrong! Please try again");
        this.myInputVariable.nativeElement.value = ''; return;
      }

      if (this.convertedJSON.length > environment.environment.MaxLimitOfImport) {
        this.alertService.showWarning(`The imported file has exceeded the maximum allowed file limits (${environment.environment.MaxLimitOfImport}).`)
        this.myInputVariable.nativeElement.value = '';
        return;
      }
      else {
        this.confirmExit(this.convertedJSON, file);
      }
    }
    reader.readAsBinaryString(file);
  }

  confirmExit(data, file) {
    var jobject = JSON.stringify({ data: data, file: this.encodedBase64, importTypeId: this.importTypeId, importConfigId: this.importConfigId, teamId: this.selectedTeamId });
    this.activeModal.close(jobject);
  }


  getTeamList() {
    let datasource: DataSource = {
      Name: "team",
      Type: DataSourceType.View,
      IsCoreEntity: false
    }

    let parentElementList: any[] = null;
    this.pagelayoutService.getDataset(datasource, parentElementList).subscribe(dropDownList => {
      console.log('dropDownList', dropDownList);
      let i: apiResponse = dropDownList;
      if (i.Status && i.dynamicObject != null) {
        var j = [];
        this.firsttimeLoader = false;
        j = JSON.parse(i.dynamicObject);
        if (j.length > 0) {
          this.TeamList = j.filter(a => a.ClientId == this.sessionService.getSessionStorage("default_SME_ClientId"));

        }
      }
      else {
        this.firsttimeLoader = false;
      }


    }, error => {


    })
  }


  getImportConfiguration() {
    this.importConfigurationList = [];
    this.ImportTypeList = [];

    let datasource: DataSource = {
      Name: "ImportConfigurationView",
      Type: DataSourceType.View,
      IsCoreEntity: false
    }

    let parentElementList: any[] = null;
    this.pagelayoutService.getDataset(datasource, parentElementList).subscribe(ImportList => {
      let i: apiResponse = ImportList;
      if (i.Status && i.dynamicObject != null) {
        var j = [];
        j = JSON.parse(i.dynamicObject);
        this.importConfigurationList = j;
        console.log('IMPORT CONFIGURAION BY ID : ', j);
        this.importConfigurationList != null && this.importConfigurationList.length > 0 ?
          this.ImportTypeList = this.importConfigurationList.filter(a => a.ClientContractId == this.sessionService.getSessionStorage("default_SME_ContractId")) : true;

      }
      else {
        this.firsttimeLoader = false;
      }


    }, error => {


    })
  }
}
