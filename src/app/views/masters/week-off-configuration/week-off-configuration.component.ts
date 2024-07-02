import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { AlertService } from 'src/app/_services/service';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
import { apiResult } from 'src/app/_services/model/apiResult';
import { AttendanceService } from 'src/app/_services/service/attendnace.service';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import * as moment from 'moment';
import { SessionStorage } from '../../../_services/service/session-storage.service';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { LoginResponses } from '../../../_services/model/Common/LoginResponses';
import { UtilityService } from 'src/app/_services/service/utitlity.service';
import { environment } from 'src/environments/environment';
import * as _ from 'lodash';

@Component({
  selector: 'app-week-off-configuration',
  templateUrl: './week-off-configuration.component.html',
  styleUrls: ['./week-off-configuration.component.css']
})
export class WeekOffConfigurationComponent implements OnInit {
  empItem: any;
  spinner: boolean = false;
  weekOffData: any;

  _loginSessionDetails: LoginResponses;
  employeeId: any;
  UserId: any;
  RoleId: any;
  businessType: any;
  companyId: any;
  searchData: any;
  selectedEmployeeDropdown: number = 0;
  employeeDropdown = [{
    id: 0,
    name: 'All'
  }, {
    id: 1,
    name: 'Specific'
  }];

  weeksDropdown = [{
    id: 'Saturday',
    name: 'Saturday'
  }, {
    id: 'Sunday',
    name: 'Sunday',
  }, {
    id: 'Monday',
    name: 'Monday'
  }, {
    id: 'Tuesday',
    name: 'Tuesday'
  }, {
    id: 'Wednesday',
    name: 'Wednesday'
  }, {
    id: 'Thursday',
    name: 'Thursday'
  }, {
    id: 'Friday',
    name: 'Friday'
  }];
  selectedWeekOff: any;
  disableEmpDrpdwn: boolean = true;
  disableWODrpDown: boolean = false;
  selectedPeriodStartDate: any;
  selectedPeriodEndDate: any;
  minDate: any;
  maxDate: any;
  clientList: any[] = [];
  selectedClient: any;
  clientContractList: any[] = [];
  selectedClientContract: any;
  teamsList: any[] = [];
  selectedTeam: any;
  locationList: any[] = [];
  selectedLocation: any;
  employeesList: any[] = [];
  selectedEmployee: number = 0;
  disableSubmitBtn: boolean = false;
  minWeekOffSelection: number;
  maxWeekOffSelection: number;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private titleService: Title,
    private loadingScreenService: LoadingScreenService,
    private attendanceService: AttendanceService,
    public alertService: AlertService,
    public sessionService: SessionStorage,
    private UtilityService: UtilityService
  ) { }

  ngOnInit() {
    this.spinner = true;
    this._loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses));
    this.UserId = this._loginSessionDetails.UserSession.UserId;
    this.RoleId = this._loginSessionDetails.UIRoles[0].Role.Id;
    this.businessType = this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping != null
      ? this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this._loginSessionDetails.Company.Id).BusinessType : 0;
    this.employeeId = this._loginSessionDetails.EmployeeId;
    this.companyId = this._loginSessionDetails.Company.Id;
    this.minDate = new Date();
    this.selectedPeriodStartDate = new Date();
    this.maxDate = new Date('2099-12-31');
    this.selectedPeriodEndDate = this.selectedPeriodStartDate; // this.maxDate;
    this.minWeekOffSelection = environment.environment.MinimumWeekOffSelection;
    this.maxWeekOffSelection = environment.environment.MaximumWeekOffSelection;
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
          this.teamsList =  _.isArray(this.searchData.Team) ? this.searchData.Team : [this.searchData.Team];
          // load locations list
          this.locationList = this.searchData.ClientLocation;
          // load employee list
          this.employeesList = this.searchData.EmployeeList;
          // load data for SME
          if (this.businessType != 3) {
            let clientIdForSME = this.sessionService.getSessionStorage("default_SME_ClientId");
            // load based on selected sme client
            this.searchData.ClientList = this.searchData.Client.filter(a => a.Id === Number(clientIdForSME));
            this.searchData.ClientContract = this.searchData.ClientContract.filter(a => a.ClientId === Number(clientIdForSME));
            this.searchData.ClientLocation = this.searchData.ClientLocation.filter(a => a.ClientID === Number(clientIdForSME));
            if (this.searchData.Team && _.isArray(this.searchData.Team)) {
              // If searchData.Team is not an object, filter and assign back to searchData.Team 
              this.searchData.Team = this.searchData.Team.filter(a => a.ClientId === Number(clientIdForSME));
            } else if (this.searchData.Team) {
              // Check if searchData.Team truthy since null and undefined won't enter the condition 
              this.searchData.Team = [];
              this.searchData.Team = this.teamsList.filter(a => a.ClientId === Number(clientIdForSME));
            }

            this.searchData.EmployeeList = this.searchData.EmployeeList.filter(a => a.ClientId === Number(clientIdForSME));
            // assign values to show data in dropdown
            this.clientList = this.searchData.ClientList;
            this.clientContractList = this.searchData.ClientContract;
            this.teamsList = this.searchData.Team;
            this.locationList = this.searchData.ClientLocation;
            this.employeesList = this.searchData.EmployeeList;
          }
          console.log('JsonObj ::', this.searchData);
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
      if (this.locationList && this.locationList.length > 1) {
        this.locationList.unshift({ Id: 0, LocationName: 'All', ClientID: 0, LocationCode : 'All' });
      }
      if (this.clientContractList && this.clientContractList.length > 1) {
        this.clientContractList.unshift({ Id: 0, Name: 'All', ClientId: 0, ClientContractId: 0 });
      }
      if (this.teamsList && this.teamsList.length > 1) {
        this.teamsList.unshift({ Id: 0, Name: 'All', ClientId: 0, ClientContractId: 0 });
      }
    } else {
      this.disableEmpDrpdwn = true;
    }
  }

  onClientContractChange(e) {
    console.log('CLIENT CONTRACT CHANGE', e, this.selectedClientContract);
    this.selectedTeam = null;
    this.employeesList = [];
    this.teamsList = [];
    if (e) {
      let deepClone = e.Id == 0 ? this.searchData.Team : this.searchData.Team.filter(a => a.ClientContractId === this.selectedClientContract);
      if (this.businessType == 3) {
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
    // this.employeesList = this.searchData.EmployeeList.filter(a => a => a.TeamId === e.Id);
  }

  onLocationChange(e) {
    console.log('LOCATION CHANGE', e, this.selectedLocation, this.employeesList);
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
    if (this.selectedEmployeeDropdown == 1) {
      this.loadEmpDataForDropDown();
    }
    
    console.log('EMP CHANGE', e, this.selectedEmployeeDropdown, this.employeesList);
  }

  onEmpWeekOffChange(e, item) {
    console.log('EMP WO', e, item);
    if (item.selectedWeekOff && item.selectedWeekOff.length > this.maxWeekOffSelection) {
      item.disableWODrpDown = true;
    } else {
      setTimeout(() => {
        item.disableWODrpDown = false;
      }, 5000);
    }
  }

  doRefresh() {

    this.titleService.setTitle('Week Off');
    this.spinner = true;
    this.route.queryParams.subscribe(params => {
      console.log('%%%', JSON.stringify(params));
      if (JSON.stringify(params) != JSON.stringify({})) {
        var encodedOdx = atob(params["Odx"]);
        let data = JSON.parse(encodedOdx);
        if (data != null && data != undefined && data.length > 0) {
          this.empItem = data[0]
          this.empItem['_doj'] = moment(new Date(this.empItem.DOJ)).format("DD/MM/YYYY")
          this.employeeId = this.empItem.Id
        }

      }
    });

    this.getWeekOffByEmployeeId(this.employeeId).then(() => {

    });
    this.spinner = false;
  }

  submitWOMapping() {
    this.loadingScreenService.startLoading();
    let saveData = {};
    if (this.selectedEmployeeDropdown == 1) {
      // checks for undefined values
      if (this.employeesList.every(el => this.UtilityService.isNullOrUndefined(el.selectedWeekOff))) {
        this.loadingScreenService.stopLoading();
        return this.alertService.showWarning('Please fill all fields');
      }
      // call api
      this.submitWOForSpecificEmployee().then((res) => {
        console.log('submitWOForSpecificEmployee', res);
        this.loadingScreenService.stopLoading();
        this.disableSubmitBtn = false;
        this.redirectToWOListingScreen();
      });
    } else {
      if (this.UtilityService.isNullOrUndefined(this.selectedClient) ||
        this.UtilityService.isNullOrUndefined(this.selectedClientContract) ||
        this.UtilityService.isNullOrUndefined(this.selectedTeam) ||
        this.UtilityService.isNullOrUndefined(this.selectedLocation) ||
        this.UtilityService.isNullOrUndefined(this.selectedWeekOff) ||
        this.UtilityService.isNullOrUndefined(this.selectedPeriodStartDate) ||
        this.UtilityService.isNullOrUndefined(this.selectedPeriodEndDate) ||
        this.selectedWeekOff && this.selectedWeekOff.length < this.minWeekOffSelection) {
        this.loadingScreenService.stopLoading();
        return this.alertService.showWarning('Please fill all fields');
      }
      if (this.selectedWeekOff && this.selectedPeriodStartDate && this.selectedPeriodEndDate) {
        this.loadingScreenService.startLoading();
        saveData = this.createSaveObject();
        // CALL API TO SAVE IN DB
        this.attendanceService.PutUpsertWeekOff(JSON.stringify(saveData)).subscribe((res) => {
          this.loadingScreenService.stopLoading();
          console.log('SUBMIT FOR ALL WEEKOFF -->', res);
          if (res.Status) {
            this.alertService.showSuccess(res.Message);
            this.redirectToWOListingScreen();
          } else {
            this.alertService.showWarning(res.Message);
          }
        });
      }
    }

  }

  createSaveObject() {
    const saveObj = {
      CompanyId: this.companyId,
      ClientId: this.selectedClient,
      ClientContractId: this.selectedClientContract,
      TeamId: this.selectedTeam,
      EmployeeId: this.selectedEmployee,
      LocationID: this.selectedLocation,
      EffectiveDate: moment(new Date(this.selectedPeriodStartDate)).format('MM-DD-YYYY'), // new Date(this.selectedPeriodStartDate).toISOString(),
      EffectiveTo: moment(new Date(this.selectedPeriodEndDate)).format('MM-DD-YYYY'),
      Monday: this.selectedWeekOff.includes('Monday'),
      Tuesday: this.selectedWeekOff.includes('Tuesday'),
      Wednesday: this.selectedWeekOff.includes('Wednesday'),
      Thursday: this.selectedWeekOff.includes('Thursday'),
      Friday: this.selectedWeekOff.includes('Friday'),
      Saturday: this.selectedWeekOff.includes('Saturday'),
      Sunday: this.selectedWeekOff.includes('Sunday'),
      Id: 0,
      CreatedOn: new Date().toISOString(),
      LastUpdatedOn: new Date().toISOString(),
      CreatedBy: this.UserId,
      LastUpdatedBy: this.UserId,
      IsEditable: true,
      Status: 1
    };
    console.log('add-saveObj', saveObj, this.selectedWeekOff);
    return saveObj;
  }

  submitWOForSpecificEmployee() {
    const promise = new Promise((resolve, reject) => {
      this.employeesList.forEach(element => {
        if (element.selectedWeekOff && element.selectedWeekOff.length > 0 && element.selectedPeriodStartDate && element.selectedPeriodEndDate) {
          this.loadingScreenService.startLoading();
          this.disableSubmitBtn = true;
          const saveObj = {
            CompanyId: this.companyId,
            ClientId: this.selectedClient,
            ClientContractId: this.selectedClientContract,
            TeamId: this.selectedTeam,
            LocationID: this.selectedLocation,
            EmployeeId: element.EmployeeId,
            EffectiveDate: moment(new Date(element.selectedPeriodStartDate)).format('MM-DD-YYYY'),
            EffectiveTo: moment(new Date(element.selectedPeriodEndDate)).format('MM-DD-YYYY'),
            Monday: element.selectedWeekOff.includes('Monday'),
            Tuesday: element.selectedWeekOff.includes('Tuesday'),
            Wednesday: element.selectedWeekOff.includes('Wednesday'),
            Thursday: element.selectedWeekOff.includes('Thursday'),
            Friday: element.selectedWeekOff.includes('Friday'),
            Saturday: element.selectedWeekOff.includes('Saturday'),
            Sunday: element.selectedWeekOff.includes('Sunday'),
            Id: 0,
            CreatedOn: new Date().toISOString(),
            LastUpdatedOn: new Date().toISOString(),
            CreatedBy: this.UserId,
            LastUpdatedBy: this.UserId,
            IsEditable: true,
            Status: 1
          };
          // CALL API TO SAVE IN DB
          this.attendanceService.PutUpsertWeekOff(saveObj).subscribe((res) => {
            if (res.Status) {
              this.alertService.showSuccess(res.Message);
            } else {
              this.alertService.showWarning(res.Message);
              this.loadingScreenService.stopLoading();
              this.disableSubmitBtn = false;
              reject();
            }
          });
          console.log(':::: saveData inside each ::::', saveObj);
        }
      });
      resolve(true);
    });
    return promise;
  }

  getWeekOffByEmployeeId(employeeId) {

    var promise = new Promise((resolve, reject) => {

      this.loadingScreenService.startLoading();
      this.attendanceService.GetWeekOffByEmployeeId(employeeId)
        .subscribe((ress) => {

          this.loadingScreenService.stopLoading();
          console.log('WEEK OFF RESP ::', ress);
          let apiR: apiResult = ress;
          if (apiR.Status && apiR.Result && apiR.Result.length) {
            this.weekOffData = apiR.Result[0];
            resolve(true);
          } else {
            resolve(false);
          }

        })
    });
    return promise;
  }



  onWeekOffChange($event) {
    console.log('onChange', $event);
    if (this.selectedWeekOff && this.selectedWeekOff.length > this.maxWeekOffSelection) {
      this.disableWODrpDown = true;
    } else {
      this.disableWODrpDown = false;
    }

  }

  redirectToWOListingScreen() {
    this.router.navigate(['app/masters/weekOffListing'], {
    });
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

}


