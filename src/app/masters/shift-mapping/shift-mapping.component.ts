import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { LoginResponses, UserStatus } from 'src/app/_services/model';
import { AlertService, SessionStorage, EmployeeService } from 'src/app/_services/service';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { UtilityService } from 'src/app/_services/service/utitlity.service';
import { AttendanceService } from 'src/app/_services/service/attendnace.service';
import { apiResult } from 'src/app/_services/model/apiResult';
import * as moment from 'moment';
import * as _ from 'lodash';

@Component({
  selector: 'app-shift-mapping',
  templateUrl: './shift-mapping.component.html',
  styleUrls: ['./shift-mapping.component.css']
})
export class ShiftMappingComponent implements OnInit {
  selectedEmpLength = 0;
  dummyEmployeesList = []
  EmployeeList: any = []
  role: any = 'manager';
  mappingLevel: any = [];;
  shiftMappingEmployeesList: any = [];
  LstemployeeList: any = [];
  selectAll: any;
  Code: any
  Name: any
  StartTime: any
  FirstOffEndTime: any
  SecondOffEndTime: any
  EndTime: any
  WorkingHours: any;
  shiftMappingList: any = ['Shift 1', 'Shift 2', 'Shift 3'];
  employeeLevelMapping: boolean = false
  teamLevelMapping: boolean = false
  departmentLevelMapping: boolean = false;
  employeeSearchElement: "";
  selectedShiftMappingList: any;
  minDate: Date;
  maxDate: Date;
  selectedPeriodStartDate: any;
  selectedPeriodEndDate: any;
  employeesList = [];
  locationList = [];
  _loginSessionDetails: LoginResponses;
  BusinessType: any;
  RoleId: any;
  UserId: any;
  CompanyId: any;
  clientList = [];
  clientContractList = [];
  spinner: boolean = false;
  selectedEmployeeDropdown: number = 0;
  employeeDropdown = [{
    id: 0,
    name: 'All'
  }, {
    id: 1,
    name: 'Specific'
  }];
  disableSubmitBtn: boolean = false;
  searchData: any;
  teamsList: any[] = [];
  disableEmpDrpdwn: boolean = true;
  selectedClient: any;
  selectedClientContract: any;
  selectedTeam: any;
  selectedLocation: any;
  selectedEmployee: number = 0;
  selectedShift: any;
  clientIdForSME: string | number = 0;
  shiftList: any[] = [];
  isEdit: boolean = false;
  originalData: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private titleService: Title,
    private alertService: AlertService,
    private sessionService: SessionStorage,
    private employeeService: EmployeeService,
    private loadingScreenService: LoadingScreenService,
    private UtilityService: UtilityService,
    private attendanceService: AttendanceService,
  ) { }

  ngOnInit() {
    console.log('ON INIT SHIFT MAPPING');
    this.minDate = new Date();
    this.selectedPeriodStartDate = new Date();
    this.maxDate = new Date('2099-12-31');
    this.selectedPeriodEndDate = this.selectedPeriodStartDate; // this.maxDate;
    this.loadingScreenService.startLoading();
    this._loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses)); // Get the whole matched session element set as a clean json(array) via an session object
    this.BusinessType = this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping != null ? this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this._loginSessionDetails.Company.Id).BusinessType : 0;
    this.UserId = this._loginSessionDetails.UserSession.UserId;
    this.RoleId = this._loginSessionDetails.UIRoles[0].Role.Id;
    this.CompanyId = this._loginSessionDetails.Company.Id;
    this.clientIdForSME = this.sessionService.getSessionStorage("default_SME_ClientId");
    this.doRefresh();
  }

  doRefresh() {
    this.spinner = true;
    this.selectedClient = null;
    this.attendanceService.getAllSearchFilterDataForShiftMapping(this.RoleId, this.UserId).subscribe((res) => {
      console.log('getAllSearchFilterDataForShiftMapping ::', res);
      let apiR: apiResult = res;
      if (apiR.Status && apiR.Result) {
        this.searchData = JSON.parse(apiR.Result);
        try {
          this.searchData.Client = JSON.parse(this.searchData.Client);
          this.searchData.ClientContract = JSON.parse(this.searchData.ClientContract);
          this.searchData.ClientLocation = JSON.parse(this.searchData.ClientLocation);
          // load client list
          this.clientList = this.searchData.Client;
          // Push ALL to first in client list
          this.clientList.unshift({ Id: 0, Name: 'All' });
          // load client contract list
          this.clientContractList = this.searchData.ClientContract;
          // load team list
          console.log('is Array', _.isArray(this.searchData.Team));
          this.teamsList =  _.isArray(this.searchData.Team) ? this.searchData.Team : [this.searchData.Team];
          this.teamsList.unshift({ Id: 0, Name: 'All' });
          // load locations list
          this.locationList = this.searchData.ClientLocation;
          // load employee list
          this.employeesList = this.searchData.EmployeeList;
          // load data for SME
          if (this.BusinessType != 3) {
            // load based on selected sme client
            this.searchData.ClientList = this.searchData.Client.filter(a => a.Id === Number(this.clientIdForSME));
            this.searchData.ClientContract = this.searchData.ClientContract.filter(a => a.ClientId === Number(this.clientIdForSME));
            this.searchData.ClientLocation = this.searchData.ClientLocation.filter(a => a.ClientID === Number(this.clientIdForSME));
            if (this.searchData.Team && _.isArray(this.searchData.Team)) {
              // If searchData.Team is not an object, filter and assign back to searchData.Team 
              this.searchData.Team = this.searchData.Team.filter(a => a.ClientId === Number(this.clientIdForSME));
            } else if (this.searchData.Team) {
              // Check if searchData.Team truthy since null and undefined won't enter the condition 
              this.searchData.Team = [];
              this.searchData.Team = this.teamsList.filter(a => a.ClientId === Number(this.clientIdForSME));
            }

            this.searchData.EmployeeList = this.searchData.EmployeeList.filter(a => a.ClientId === Number(this.clientIdForSME));
            // assign values to show data in dropdown
            this.clientList = this.searchData.ClientList;
            this.clientContractList = this.searchData.ClientContract;
            this.teamsList = this.searchData.Team;
            this.locationList = this.searchData.ClientLocation;
            this.employeesList = this.searchData.EmployeeList;
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
    this.loadingScreenService.startLoading();
    console.log('CLIENT CHANGE', e, this.selectedClient);
    this.selectedClientContract = null;
    this.selectedTeam = null;
    this.selectedLocation = null;
    this.employeesList = [];
    this.clientContractList = [];
    this.locationList = [];
    this.teamsList = [];
    if (e) {
      this.disableEmpDrpdwn = false;
      const deepClone = e.Id == 0 ? this.searchData.ClientContract : this.searchData.ClientContract.filter(a => a.ClientId === e.Id);
      this.locationList = e.Id == 0 ? this.searchData.ClientLocation : this.searchData.ClientLocation.filter(a => a.ClientID === e.Id);
      this.teamsList = e.Id == 0 ? this.searchData.Team : this.searchData.Team.filter(a => a.ClientId === e.Id);
      this.clientContractList = JSON.parse(JSON.stringify(deepClone));
      if (this.clientContractList && this.clientContractList.length > 1) {
        this.clientContractList.unshift({ Id: 0, Name: 'All', ClientId: 0, ClientContractId: 0 });
      }
      if (this.locationList && this.locationList.length > 1) {
        this.locationList.unshift({ Id: 0, LocationName: 'All', ClientID: 0, LocationCode : 'All' });
      }
      if (this.teamsList && this.teamsList.length > 1) {
        this.teamsList.unshift({ Id: 0, Name: 'All', ClientId: 0, ClientContractId: 0 });
      }
      this.attendanceService.GetWorkShiftDefinitionsForAClient(e.Id).subscribe((result) => {
        console.log('GetWorkShiftDefinitionsForAClient', result);
        this.shiftList = [];
        if (result.Status && result.Result && result.Result != '') {
          result.Result.map(e => {
            e.modifiedStartTime = moment(e.StartTime, ["HH:mm"]).format("LT"),
              e.modifiedEndTime = moment(e.EndTime, ["HH:mm"]).format("LT");
            e.modifiedDefaultWorkingHours = moment(e.DefaultWorkingHours, "H:mm").format("H.m");
          });
          this.shiftList = result.Result;
          this.loadingScreenService.stopLoading();
          console.log('shiftList', this.shiftList);
        } else {
          this.loadingScreenService.stopLoading();
          result.Status ? this.alertService.showWarning('There is no shift available for the selected client !') : this.alertService.showWarning(result.Message);
        }
      });
    } else {
      this.disableEmpDrpdwn = true;
      this.loadingScreenService.stopLoading();
    }
  }

  onClientContractChange(e) {
    console.log('CLIENT CONTRACT CHANGE', e, this.selectedClientContract);
    this.selectedTeam = null;
    this.employeesList = [];
    this.teamsList = [];
    if (e) {
      let deepClone = e.Id == 0 ? this.searchData.Team : this.searchData.Team.filter(a => a.ClientContractId === this.selectedClientContract);
      if (this.BusinessType == 3) {
        deepClone = e.Id == 0 && this.selectedClient != 0 ? this.searchData.Team.filter(a => a.ClientId === this.selectedClient) : deepClone;
      }
      this.teamsList = JSON.parse(JSON.stringify(deepClone));
      if (this.teamsList && this.teamsList.length > 1) {
        this.teamsList.unshift({ Id: 0, Name: 'All', ClientId: 0, ClientContractId: 0 });
      }
      console.log('TEAM', this.teamsList);
    }
  }

  onTeamChange(e) {
    console.log('TEAM CHANGE', e, this.selectedTeam, this.locationList);
    this.disableEmpDrpdwn = false;
    this.selectedLocation = null;
    if (e.Id === 0) {
      this.disableEmpDrpdwn = true;
      this.selectedEmployeeDropdown = this.employeeDropdown.filter(a => a.id === e.Id)[0].id;
      this.selectedEmployee = this.selectedEmployeeDropdown;
    }
    this.employeesList = [];
    // this.employeesList = this.searchData.EmployeeList.filter(a => a.TeamId == e.Id);
  }

  onLocationChange(e) {
    console.log('LOCATION CHANGE', e, this.selectedLocation);
    this.employeesList = [];
    this.loadEmpDataForDropDown();
  }

  loadEmpDataForDropDown() {
    if (this.selectedLocation === 0) {
      this.employeesList = this.searchData.EmployeeList.filter(a => a.TeamId == this.selectedTeam);
    } else if (this.selectedTeam === 0 && this.selectedLocation !== 0) {
      this.employeesList = this.searchData.EmployeeList.filter(a => a.ClientLocationId === this.selectedLocation);
    } else {
      this.employeesList = this.searchData.EmployeeList.filter(a => a.TeamId == this.selectedTeam && a.ClientLocationId === this.selectedLocation);
    }
     
    if (this.employeesList && this.employeesList.length) {
      this.employeesList.forEach(emp => {
        emp.selectedPeriodStartDate = new Date();
        emp.selectedPeriodEndDate = new Date();
      });
    }
  }

  onEmpDropDownChange(e) {
    this.employeesList = [];
    console.log('EMP DROPDOWN CHANGE', e, this.employeesList);
    if (this.selectedEmployeeDropdown == 1) {
      this.loadEmpDataForDropDown();
    }
    console.log('EMP CHANGE', e, this.selectedEmployeeDropdown, this.employeesList);
  }

  onShiftDropdownChange(e) {
    console.log('SHIFT DRPDWN CHANGE', e);
  }

  onEmpShiftDropdownChange(e) {
    console.log('EMP SHIFT DRPDWN CHANGE', e);
  }

  onChangeShift(event) {

    console.log('change shift', event);

    this.Code = event.Code
    this.Name = event.Name
    this.StartTime = event.StartTime
    this.FirstOffEndTime = event.FirstOffEndTime
    this.SecondOffEndTime = event.SecondOffEndTime
    this.EndTime = event.EndTime
    this.WorkingHours = event.WorkingHours


  }

  submitShiftMapping() {
    this.loadingScreenService.startLoading();
    let saveData = {};
    if (this.selectedEmployeeDropdown == 1) {
      // checks for undefined values
      if (this.employeesList.every(el => this.UtilityService.isNullOrUndefined(el.Shift))) {
        this.loadingScreenService.stopLoading();
        return this.alertService.showWarning('Please fill all fields');
      }
      // call api
      this.submitShiftForSpecificEmployee().then((res) => {
        console.log('submitShiftForSpecificEmployee', res);
        this.loadingScreenService.stopLoading();
        this.disableSubmitBtn = false;
        this.redirectToShiftMappingListingScreen();
      });
    } else {
      if (this.UtilityService.isNullOrUndefined(this.selectedClient) ||
        this.UtilityService.isNullOrUndefined(this.selectedClientContract) ||
        this.UtilityService.isNullOrUndefined(this.selectedTeam) ||
        this.UtilityService.isNullOrUndefined(this.selectedLocation) ||
        this.UtilityService.isNullOrUndefined(this.selectedShift) ||
        this.UtilityService.isNullOrUndefined(this.selectedPeriodStartDate) ||
        this.UtilityService.isNullOrUndefined(this.selectedPeriodEndDate)) {
        this.loadingScreenService.stopLoading();
        return this.alertService.showWarning('Please fill all fields');
      }
      if (this.selectedShift && this.selectedPeriodStartDate && this.selectedPeriodEndDate) {
        this.loadingScreenService.startLoading();
        saveData = this.createSaveObject();
        // CALL API TO SAVE IN DB
        this.attendanceService.UpsertWorkShiftAndMapping(JSON.stringify(saveData)).subscribe((res) => {
          this.loadingScreenService.stopLoading();
          console.log('SUBMIT FOR ALL -->', res);
          if (res.Status) {
            this.alertService.showSuccess(res.Message);
            this.redirectToShiftMappingListingScreen();
          } else {
            this.alertService.showWarning(res.Message);
          }
        });
      }
    }

  }

  createSaveObject() {
    const saveObj = {
      CompanyId: this.CompanyId,
      ClientId: this.selectedClient,
      ClientContractId: this.selectedClientContract,
      TeamId: this.selectedTeam,
      EmployeeId: this.selectedEmployee,
      LocationID: this.selectedLocation,
      EffectiveFrom: moment(new Date(this.selectedPeriodStartDate)).format('MM-DD-YYYY'), // new Date(this.selectedPeriodStartDate).toISOString(),
      EffectiveTo: moment(new Date(this.selectedPeriodEndDate)).format('MM-DD-YYYY'),
      IncludedHolidays: [],
      ExcludedHolidays: [],
      Id: 0,
      WSDId: this.selectedShift,
      CreatedOn: new Date().toISOString(),
      LastUpdatedOn: new Date().toISOString(),
      CreatedBy: this.UserId,
      LastUpdatedBy: this.UserId,
      IsEditable: true,
      Status: 1
    };
    console.log('add-saveObj', saveObj);
    return saveObj;
  }

  submitShiftForSpecificEmployee() {
    const promise = new Promise((resolve, reject) => {
      this.employeesList.forEach(element => {
        if (element.Shift && element.selectedPeriodStartDate && element.selectedPeriodEndDate) {
          this.loadingScreenService.startLoading();
          this.disableSubmitBtn = true;
          const saveData = {
            CompanyId: this.CompanyId,
            ClientId: this.selectedClient,
            ClientContractId: this.selectedClientContract,
            TeamId: this.selectedTeam,
            LocationID: this.selectedLocation,
            EmployeeId: element.EmployeeId,
            WSDId: element.Shift,
            EffectiveFrom: moment(new Date(element.selectedPeriodStartDate)).format('MM-DD-YYYY'),
            EffectiveTo: moment(new Date(element.selectedPeriodEndDate)).format('MM-DD-YYYY'),
            IncludedHolidays: [],
            ExcludedHolidays: [],
            MinimumTimeForHalfDayPresent: null,
            MinimumTimeForFullDayPresent: null,
            MinimumTimeForHalfDayLeave: null,
            MinimumTimeForFullDayLeave: null,
            Id: 0,
            CreatedOn: new Date().toISOString(),
            LastUpdatedOn: new Date().toISOString(),
            CreatedBy: this.UserId,
            LastUpdatedBy: this.UserId,
            IsEditable: true,
            Status: 1
          };
          // CALL API TO SAVE IN DB
          this.attendanceService.UpsertWorkShiftAndMapping(saveData).subscribe((res) => {
            if (res.Status) {
              this.alertService.showSuccess(res.Message);
            } else {
              this.alertService.showWarning(res.Message);
              this.loadingScreenService.stopLoading();
              this.disableSubmitBtn = false;
              reject();
            }
          });
          console.log(':::: saveData inside each ::::', saveData);
        }
      });
      resolve(true);
    });
    return promise;
  }

  onChangeStartDate(e) {
    if (e) {
      this.selectedPeriodStartDate = new Date(e);
      this.selectedPeriodEndDate = new Date(e);
    }
  }

  onChangeEndDate(e) {
    if (e) {
      //this.selectedPeriodEndDate = new Date(e);
    }
  }

  onChangeEmployeeStartDate(e, item) {
    if (e) {
      item.selectedPeriodStartDate = new Date(e);
      item.selectedPeriodEndDate = new Date(e);
    }
  }

  onChangeEmployeeEndDate(e, item) {
    if (e) {
     // item.selectedPeriodEndDate = new Date(e);
    }
  }


  redirectToShiftMappingListingScreen() {
    this.router.navigate(['app/masters/shiftMapListing']);
  }

}