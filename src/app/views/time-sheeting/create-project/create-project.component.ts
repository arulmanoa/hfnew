import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginResponses } from 'src/app/_services/model';
import { AlertService } from 'src/app/_services/service';
import { SessionStorage } from 'src/app/_services/service/session-storage.service';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { UtilityService } from 'src/app/_services/service/utitlity.service';
import moment from 'moment';
import { AttendanceService } from 'src/app/_services/service/attendnace.service';
import { apiResult } from 'src/app/_services/model/apiResult';
import _ from 'lodash';
import { TimesheetService } from 'src/app/_services/service/time-sheet.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { RowDataService } from '../../personalised-display/row-data.service';

@Component({
  selector: 'app-create-project',
  templateUrl: './create-project.component.html',
  styleUrls: ['./create-project.component.css']
})
export class CreateProjectComponent implements OnInit {
  spinner: boolean = false;
  minDate: any;
  clientsList: any = [];
  clientContractList: any = [];
  teamsList: any = [];
  locationList = [];
  selectedClient: any;
  selectedClientContract: any;
  selectedTeam: any;
  selectedLocation: any;
  selectedEmployee: number = 0;
  selectedEmployeeDropdown: number = 0;
  selectedStartDate: any;
  selectedEndDate: any;
  _loginSessionDetails: LoginResponses;
  loggedInUserId: string = '';
  companyId: number;
  disableSubmitBtn: boolean = false;
  searchText: any = null;
  businessType: number;
  searchData: any;

  UserId: any;
  RoleId: any;
  CompanyId: any;
  selectedPeriodStartDate: any;
  selectedPeriodEndDate: any;
  clientIdForSME: any;

  selectedProjectCode: any;
  selectedProjectName: any;
  description: string = '';
  isActive: boolean = true;
  isBillable: boolean = true
  isEdit: boolean = false;
  originalData: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private alertService: AlertService,
    private sessionService: SessionStorage,
    private loadingScreenService: NgxSpinnerService,
    private utilityservice: UtilityService,
    private attendanceService: AttendanceService,
    private timesheetService : TimesheetService,
    private rowDataService: RowDataService
  ) { }

  ngOnInit() {
    this.minDate = new Date();
    this.selectedPeriodStartDate = new Date();
    this.selectedPeriodEndDate = this.selectedPeriodStartDate; 
    this.loadingScreenService.show();
    this._loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses)); // Get the whole matched session element set as a clean json(array) via an session object
    this.businessType = this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping != null ? this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this._loginSessionDetails.Company.Id).BusinessType : 0;
    this.UserId = this._loginSessionDetails.UserSession.UserId;
    this.RoleId = this._loginSessionDetails.UIRoles[0].Role.Id;
    this.CompanyId = this._loginSessionDetails.Company.Id;
    this.clientIdForSME = this.sessionService.getSessionStorage("default_SME_ClientId");
    this.selectedClient = this.sessionService.getSessionStorage("default_SME_ClientId");
    this.selectedClientContract = this.sessionService.getSessionStorage("default_SME_ContractId");
    this.loadingScreenService.hide();
    this.initial_getClientContract_load();
  }

  initial_getClientContract_load() {
    this.spinner = true;
    this.loadingScreenService.show();
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
      this.selectedLocation = data.LocationId;
      this.selectedTeam = data.TeamId
      this.isActive = data.Status;
      this.isBillable = data.IsBillable;
      this.selectedProjectCode = data.Code;
      this.selectedProjectName = data.Name;
      this.description = data.Description;
      this.selectedPeriodStartDate = new Date(data.StartDate);
      this.selectedPeriodEndDate = new Date(data.EndDate);
    }
    this.attendanceService.getAllSearchFilterDataForShiftMapping(this.RoleId, this.UserId).subscribe((res) => {
      console.log('getAllSearchFilterDataForShiftMapping ::', res);
      let apiR: apiResult = res;
      this.loadingScreenService.hide();
      if (apiR.Status && apiR.Result) {
        this.searchData = JSON.parse(apiR.Result);
        try {
          this.searchData.Client = JSON.parse(this.searchData.Client);
          this.searchData.ClientContract = JSON.parse(this.searchData.ClientContract);
          this.searchData.ClientLocation = JSON.parse(this.searchData.ClientLocation);
          // load client list
          this.clientsList = this.searchData.Client;
          // Push ALL to first in client list
          this.clientsList.unshift({ Id: 0, Name: 'All' });
          // load client contract list
          this.clientContractList = this.searchData.ClientContract;
          // load team list
          console.log('is Array', _.isArray(this.searchData.Team));
          this.teamsList =  _.isArray(this.searchData.Team) ? this.searchData.Team : [this.searchData.Team];
          this.teamsList.unshift({ Id: 0, Name: 'All' });
          // load locations list
          this.locationList = this.searchData.ClientLocation;
          this.locationList.unshift({ Id: 0, LocationName: 'All' });
          // load data for SME
          if (this.businessType != 3) {
            // load based on selected sme client
            this.searchData.ClientList = this.searchData.Client.filter(a => a.Id === Number(this.clientIdForSME));
            this.searchData.ClientContract = this.searchData.ClientContract.filter(a => a.ClientId === Number(this.selectedClientContract));
            this.searchData.ClientLocation = this.searchData.ClientLocation.filter(a => a.ClientID === Number(this.clientIdForSME));
            if (this.searchData.Team && _.isArray(this.searchData.Team)) {
              // If searchData.Team is not an object, filter and assign back to searchData.Team 
              this.searchData.Team = this.searchData.Team.filter(a => a.ClientContractId === Number(this.selectedClientContract));
            } else if (this.searchData.Team) {
              // Check if searchData.Team truthy since null and undefined won't enter the condition 
              this.searchData.Team = [];
              this.searchData.Team = this.teamsList.filter(a => a.ClientContractId === Number(this.selectedClientContract));
            }
           
            this.searchData.EmployeeList = this.searchData.EmployeeList.filter(a => a.ClientId === Number(this.clientIdForSME));
            // assign values to show data in dropdown
            this.clientsList = this.searchData.ClientList;
            this.clientContractList = this.searchData.ClientContract;
            this.teamsList = this.searchData.Team;
            this.locationList = this.searchData.ClientLocation;
            this.locationList.unshift({ Id: 0, LocationName: 'All' });
          }
          console.log('searchData ::', this.searchData);
          this.spinner = false;
        } catch (error) {
          console.log('getAllSearchFilterDataForShiftMapping Result format error ::', error);
          this.alertService.showWarning(error);
          this.spinner = false;
        }
      } else {
        this.spinner = false;
        this.alertService.showWarning(apiR.Message);
      }
    }, err => {
      console.log('getAllSearchFilterDataForShiftMapping API ERROR ::', err);
    });
  }

  onClientChange(e) {
    console.log('CLIENT CHANGE', e, this.selectedClient);
    this.selectedClientContract = null;
    this.selectedTeam = null;
    this.clientContractList = [];
    if(e) {
      const deepClone = e.Id == 0 ?  this.searchData.ClientContract : this.searchData.ClientContract.filter(a => a.ClientId === e.Id);
      this.clientContractList = JSON.parse(JSON.stringify(deepClone));
      if ( this.clientContractList &&  this.clientContractList.length > 1) {
        this.clientContractList.unshift({Id: 0, Name: 'All', ClientId: 0, ClientContractId: 0});
        // this.clientContractList.sort(({Id:a}, {Id:b}) => a-b);
      }
    }
  }

  onClientContractChange(e) {
    console.log('CLIENT CONTRACT CHANGE', e, this.selectedClientContract);
    this.selectedTeam = null;
    this.teamsList = [];
    if (e) {
      let deepClone = e.Id == 0 ? this.searchData.Team : this.searchData.Team.filter(a => a.ClientContractId === Number(this.selectedClientContract));
      if (this.businessType == 3) {
        deepClone = e.Id == 0 && this.selectedClient != 0 ? this.searchData.Team.filter(a => a.ClientId === Number(this.selectedClient)) : deepClone;
      }
      this.teamsList = JSON.parse(JSON.stringify(deepClone));
      if (this.teamsList && this.teamsList.length > 1) {
        this.teamsList.unshift({ Id: 0, Name: 'All', ClientId: 0, ClientContractId: 0 });
      }
      console.log('TEAM', this.teamsList);
    }
  }

  onTeamChange(e) {
    console.log('TEAM CHANGE', e, this.selectedTeam);
    this.selectedLocation = null;
    if (e) {
      let deepClone = e.Id == 0 ? this.searchData.ClientLocation : this.searchData.ClientLocation.filter(a => a.ClientID === Number( this.selectedClient));
      this.locationList = JSON.parse(JSON.stringify(deepClone));
      if (this.locationList && this.locationList.length > 1) {
        this.locationList.unshift({ Id: 0, LocationName: 'All', ClientID: this.selectedClient, ClientContractId: this.selectedClientContract });
      }
      console.log('Location', this.locationList);
    }
  }

  onLocationChange(e) {
    console.log('LOCATION CHANGE', e, this.selectedLocation);
  }

  onChangeStartDate(e) {
    console.log('onChangeStartDate', e);
    if (e) {
      this.selectedPeriodStartDate = new Date(e);
      this.selectedPeriodEndDate = new Date(e);
    }
  }

  onChangeEndDate(e) {
    console.log('onChangeEndDate', e);
    if (e) {
      this.selectedPeriodEndDate = new Date(e);
    }
  }

  submitProjectCreated() {
    
    this.loadingScreenService.show();
    if (this.utilityservice.isNullOrUndefined(this.selectedClient) || this.utilityservice.isNullOrUndefined(this.selectedClientContract)
      || this.utilityservice.isNullOrUndefined(this.selectedTeam) || this.utilityservice.isNullOrUndefined(this.selectedLocation) ||
      this.utilityservice.isNullOrUndefined(this.selectedProjectCode) || this.utilityservice.isNullOrUndefined(this.selectedProjectName)
      ) {
        this.loadingScreenService.hide();
        return this.alertService.showWarning('Please fill all fields !');
    }
    const saveData = this.createSaveObject();
    // CALL API TO SAVE IN DB
    this.timesheetService.put_UpsertProject(JSON.stringify(saveData)).subscribe((res) => {
      this.loadingScreenService.hide();
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
      CompanyId: this.CompanyId,
      ClientId: this.selectedClient,
      ClientContractId : this.selectedClientContract,
      TeamId: this.selectedTeam,
      LocationId: this.selectedLocation,
      Code: this.selectedProjectCode.trim(),
      Name: this.selectedProjectName.trim(),
      Description: this.description ? this.description.trim() : '',
      IsBillable: this.isBillable,
      StartDate: moment(new Date(this.selectedPeriodStartDate)).format('MM-DD-YYYY'), // new Date(this.selectedStartDate).toISOString(),
      EndDate: moment(new Date(this.selectedPeriodEndDate)).format('MM-DD-YYYY'),
      Status :this.isActive,
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
    this.router.navigate(['app/timesheet/projectListing']);
  }

}
