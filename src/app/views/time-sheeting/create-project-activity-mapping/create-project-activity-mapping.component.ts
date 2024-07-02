import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginResponses } from 'src/app/_services/model';
import { AlertService, PagelayoutService } from 'src/app/_services/service';
import { SessionStorage } from 'src/app/_services/service/session-storage.service';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { UtilityService } from 'src/app/_services/service/utitlity.service';
import { TimesheetService } from 'src/app/_services/service/time-sheet.service';
import { DataSourceType } from '../../personalised-display/enums';
import { DataSource, SearchElement } from 'src/app/views/personalised-display/models';
import { forkJoin } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import { RowDataService } from '../../personalised-display/row-data.service';

@Component({
  selector: 'app-create-project-activity-mapping',
  templateUrl: './create-project-activity-mapping.component.html',
  styleUrls: ['./create-project-activity-mapping.component.css']
})
export class CreateProjectActivityMappingComponent implements OnInit {

  spinner: boolean = false;
  
  clientsList: any = [];
  clientContractList: any = [];
  projectList = [];
  
  selectedClient: any;
  selectedClientContract: any;
  _loginSessionDetails: LoginResponses;
  loggedInUserId: string = '';
  companyId: number;
  disableSubmitBtn: boolean = false;
  businessType: number;
  searchData: any;

  UserId: any;
  RoleId: any;
  CompanyId: any;
  selectedPeriodStartDate: any;
  selectedPeriodEndDate: any;
  clientIdForSME: any;

  selectedProject: any;
  isBillable: boolean = true;
  isActive: boolean = true;
  activityCode: any;
  activityName: any;
  description: any;

  isEdit: boolean = false;
  originalData: any;

  constructor(
    private router: Router,
    private alertService: AlertService,
    private sessionService: SessionStorage,
    private utilityservice: UtilityService,
    public pageLayoutService: PagelayoutService,
    private customLoader : NgxSpinnerService,
    private rowDataService: RowDataService,
    private timesheetService : TimesheetService
  ) { }

  ngOnInit() {
    this._loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses));
    this.loggedInUserId = this._loginSessionDetails.UserSession.UserId.toString();
    this.companyId = this._loginSessionDetails.Company.Id;
    console.log('inside project activity cmp');
    this.initial_getClientContract_load();
  }

  initial_getClientContract_load() {
    this.spinner = true;
    this.customLoader.show();
    this.searchData = [];
    this.clientsList = [];
    this.clientContractList = [];
    this.businessType = this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping != null ? this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this._loginSessionDetails.Company.Id).BusinessType : 0;
    if (this.rowDataService.dataInterface.RowData) {
      this.isEdit = true;
      const data = JSON.parse(JSON.stringify(this.rowDataService.dataInterface.RowData));
      console.log('Data::', data);
      this.originalData = data;
      this.companyId = data.Company;
      this.selectedClient = data.ClientId;
      this.selectedClientContract = data.ClientContractId;
      this.isActive = data.Status;
      this.isBillable = data.IsBillable;
      this.selectedProject = data.ProjectId;
      this.activityCode = data.Code;
      this.activityName = data.Name;
      this.description = data.Description;
      this.selectedPeriodStartDate = new Date(data.StartDate);
      this.selectedPeriodEndDate = new Date(data.EndDate);
    }
    this.customLoader.hide();
    if (this.businessType != 3) {
      this.selectedClient = Number(this.sessionService.getSessionStorage("default_SME_ClientId"));
      this.selectedClientContract = Number(this.sessionService.getSessionStorage("default_SME_ContractId"));
      this.getProjectsList();
      this.spinner = false;
    } else {
      this.selectedClient = null;
      this.selectedClientContract = null;
      forkJoin([this.getClientList()]).subscribe(value => {
        console.log('FORK JOIN OUTPUT :: ', value);
        this.spinner = false;
      }, error => {
        this.spinner = false;
        console.log('FORK JOIN ERROR:', error);
      });
    }
  }

  getClientList() {
    let datasource: DataSource = {
      Name: "GetUserMappedClientList",
      Type: DataSourceType.SP,
      IsCoreEntity: false
    }

    let searchElements: SearchElement[] = [

      {
        FieldName: "@roleId",
        Value: this.RoleId
      },
      {
        FieldName: "@userId",
        Value: this.UserId
      }

    ];

    this.pageLayoutService.getDataset(datasource, searchElements).subscribe((result) => {
      console.log('result', result);
      this.clientsList = [];
      if (result.Status && result.dynamicObject != null && result.dynamicObject != '') {
        let apiResult = JSON.parse(result.dynamicObject);
        console.log('Result Client List ::', apiResult);
        this.clientsList = apiResult;
      } else {
        this.spinner = false;
      }
    });
  }

  getClientContractList() {
    this.customLoader.show();
    let datasource: DataSource = {
      Name: "GetUserMappedClientContractList",
      Type: DataSourceType.SP,
      IsCoreEntity: false
    }

    let searchElements: SearchElement[] = [

      {
        FieldName: "@roleId",
        Value: this.RoleId
      },
      {
        FieldName: "@userId",
        Value: this.UserId
      },
      {
        FieldName: "@clientId",
        Value: this.selectedClient
      }

    ];

    this.pageLayoutService.getDataset(datasource, searchElements).subscribe((result) => {
      console.log('result', result);
      this.clientContractList = [];
      this.customLoader.hide();
      if (result.Status && result.dynamicObject != null && result.dynamicObject != '') {
        let apiResult = JSON.parse(result.dynamicObject);
        console.log('Result Client Contract List ::', apiResult);
        this.clientContractList = apiResult;
      } else {
        this.spinner = false;
      }
    });
  }

  getProjectsList() {
    this.customLoader.show();
    let datasource: DataSource = {
      Name: "GetProjectsForAClient",
      Type: DataSourceType.SP,
      IsCoreEntity: false
    }

    let searchElements: SearchElement[] = [

      {
        FieldName: "@clientId",
        Value: this.selectedClient
      },
      {
        FieldName: "@clientcontractId",
        Value: this.selectedClientContract
      }

    ];

    this.pageLayoutService.getDataset(datasource, searchElements).subscribe((result) => {
      console.log('result', result);
      this.projectList = [];
      this.customLoader.hide();
      if (result.Status && result.dynamicObject != null && result.dynamicObject != '') {
        let apiResult = JSON.parse(result.dynamicObject);
        console.log('Result Project List ::', apiResult);
        this.projectList = apiResult;
      } else {
        this.spinner = false;
      }
    });
  }


  onClientChange(e) {
    console.log(e);
    if (e) {
      this.getClientContractList();
    }
  }

  onClientContractChange(e) {
    console.log(e);
    if (e) {
      this.getProjectsList();
    }
  }

  onProjectChange(e) {

  }

  submitProjectActivitymapping() {
    this.customLoader.show();
    if (this.utilityservice.isNullOrUndefined(this.selectedClient) || this.utilityservice.isNullOrUndefined(this.selectedClientContract)
      || this.utilityservice.isNullOrUndefined(this.selectedProject)  ||
      this.utilityservice.isNullOrUndefined(this.activityCode) || this.utilityservice.isNullOrUndefined(this.activityName)
      ) {
        this.customLoader.hide();
        return this.alertService.showWarning('Please fill all fields !');
    }
    const saveData = this.createSaveObject();
    // CALL API TO SAVE IN DB
    this.timesheetService.put_UpsertProjectActivityMapping(JSON.stringify(saveData)).subscribe((res) => {
      this.customLoader.hide();
      console.log('SUBMIT -->', res);
      if (res.Status) {
        this.alertService.showSuccess(res.Message);
        this.redirectToMainListingScreen();
      } else {
        this.alertService.showWarning(res.Message);
      }
    });
  }

  createSaveObject() {
    const saveObj = {
      ProjectId: this.selectedProject,
      Code: this.activityCode,
      Name: this.activityName,
      Description: this.description,
      Status : this.isActive,
      IsBillable: this.isBillable,
      Id: this.isEdit ? this.originalData.Id : 0,
      CreatedOn: new Date().toISOString(),
      LastUpdatedOn: new Date().toISOString(),
      CreatedBy: this.loggedInUserId,
      LastUpdatedBy: this.loggedInUserId
    };
    console.log('add-saveObj', saveObj);
    return saveObj;
  }

  redirectToMainListingScreen() {
    this.rowDataService.dataInterface.RowData = null;
    this.router.navigate(['app/timesheet/projectActivityListing']);
  }

}
