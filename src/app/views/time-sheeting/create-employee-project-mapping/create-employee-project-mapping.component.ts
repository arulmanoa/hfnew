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

@Component({
  selector: 'app-create-employee-project-mapping',
  templateUrl: './create-employee-project-mapping.component.html',
  styleUrls: ['./create-employee-project-mapping.component.css']
})
export class CreateEmployeeProjectMappingComponent implements OnInit {

  spinner: boolean = false;
  minDate: any;
  clientsList: any = [];
  clientContractList: any = [];
  teamsList: any = [];
  employeeList: any = [];
  locationList = [];
  employeeDropdown = [{
    id: 0,
    name: 'All'
  }, {
    id: 1,
    name: 'Specific'
  }];
  disableEmpDrpdwn: boolean = true;
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
  clientIdForSME: any;
  selectedProject: any;
  projectsList = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private alertService: AlertService,
    private sessionService: SessionStorage,
    private customLoader : NgxSpinnerService,
    private utilityservice: UtilityService,
    private timesheetservice: TimesheetService,
    private attendanceService: AttendanceService
  ) { }

  ngOnInit() {
    this.minDate = new Date();  
    this._loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses));
    this.loggedInUserId = this._loginSessionDetails.UserSession.UserId.toString();
    this.companyId = this._loginSessionDetails.Company.Id;
    console.log('inside project create cmp');
    this.initial_getClientContract_load();
  }

  initial_getClientContract_load() {
    this.spinner = true;
    this.customLoader.show();
    this.minDate = new Date();
    this.selectedStartDate = new Date();
    this.selectedEndDate = this.selectedStartDate; 
    this.searchData = [];
    this.clientsList = [];
    this.clientContractList = [];
    this.UserId = this._loginSessionDetails.UserSession.UserId;
    this.RoleId = this._loginSessionDetails.UIRoles[0].Role.Id;
    this.clientIdForSME = this.sessionService.getSessionStorage("default_SME_ClientId");
    this.selectedClient = this.sessionService.getSessionStorage("default_SME_ClientId");
    this.selectedClientContract = this.sessionService.getSessionStorage("default_SME_ContractId");
    this.businessType = this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping != null ? this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this._loginSessionDetails.Company.Id).BusinessType : 0;
    this.customLoader.hide();
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
          if (this.locationList && this.locationList.length > 1) {
            this.locationList.unshift({ Id: 0, LocationName: 'All', ClientID: 0, ClientContractId: 0 });
          }
          // load employee list
          this.employeeList = this.searchData.EmployeeList;
          // load data for SME
          if (this.businessType != 3) {
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
            this.clientsList = this.searchData.ClientList;
            this.clientContractList = this.searchData.ClientContract;
            this.teamsList = this.searchData.Team;
            this.locationList = this.searchData.ClientLocation;
            this.employeeList = this.searchData.EmployeeList;

            if (this.locationList && this.locationList.length > 1) {
              this.locationList.unshift({ Id: 0, LocationName: 'All', ClientID: 0, ClientContractId: 0 });
            }

            // load project data
            this.timesheetservice.get_ProjectsForAClient(this.selectedClient, this.selectedClientContract).subscribe(result => {
              console.log('get_ProjectsForAClient:Result', result);
              if (result && result.Status) {
                this.projectsList = _.cloneDeep(JSON.parse(result.Result));
                this.spinner = false;
              }
            });
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
    this.employeeList = [];
    this.clientContractList = [];
    
    if(e) {
      const deepClone = e.Id == 0 ?  this.searchData.ClientContract : this.searchData.ClientContract.filter(a => a.ClientId === e.Id);
      this.clientContractList = JSON.parse(JSON.stringify(deepClone));
      if ( this.clientContractList &&  this.clientContractList.length > 1) {
        this.clientContractList.unshift({Id: 0, Name: 'All', ClientId: 0, ClientContractId: 0});
      }

      
      // load project data
      this.timesheetservice.get_ProjectsForAClient(this.selectedClient, 0).subscribe(result => {
        console.log('get_ProjectsForAClient:Result', result);
        if (result && result.Status) {
          this.projectsList = _.cloneDeep(JSON.parse(result.Result));
          this.spinner = false;
        }
      });
    }
  }

  onClientContractChange(e) {
    console.log('CLIENT CONTRACT CHANGE', e, this.selectedClientContract);
    this.selectedTeam = null;
    this.employeeList = [];
    this.teamsList = [];
    if (e) {
      let deepClone = e.Id == 0 ? this.searchData.Team : this.searchData.Team.filter(a => a.ClientContractId === this.selectedClientContract);
      if (this.businessType == 3) {
        deepClone = e.Id == 0 && this.selectedClient != 0 ? this.searchData.Team.filter(a => a.ClientId === this.selectedClient) : deepClone;
      }
      this.teamsList = JSON.parse(JSON.stringify(deepClone));
      if (this.teamsList && this.teamsList.length > 1 && this.teamsList.every(obj => obj.Id !== 0 && obj.Name !== "All")) {
        this.teamsList.unshift({ Id: 0, Name: 'All', ClientId: 0, ClientContractId: 0 });
      }
      if (this.locationList && this.locationList.length > 1 && this.locationList.every(obj => obj.Id !== 0 && obj.LocationName !== "All")) {
        this.locationList.unshift({ Id: 0, LocationName: 'All', ClientID: 0, ClientContractId: 0 });
      }
      console.log('TEAM', this.teamsList);
    }
  }

  onTeamChange(e) {
    console.log('TEAM CHANGE', e, this.selectedTeam, this.locationList);
    this.disableEmpDrpdwn = false;
    this.selectedLocation = null;
    if (e) {
      let deepClone = e.Id == 0 ? this.searchData.ClientLocation : this.searchData.ClientLocation.filter(a => a.ClientID === Number( this.selectedClient));
      this.locationList = JSON.parse(JSON.stringify(deepClone));
      if (this.locationList && this.locationList.length > 1) {
        this.locationList.unshift({ Id: 0, LocationName: 'All', ClientID: this.selectedClient, ClientContractId: this.selectedClientContract });
      }
      console.log('Location', this.locationList);
    }
    if (e.Id === 0) {
      this.disableEmpDrpdwn = true;
      this.selectedEmployeeDropdown = this.employeeDropdown.filter(a => a.id === e.Id)[0].id;
      this.selectedEmployee = this.selectedEmployeeDropdown;
    }
    this.employeeList = [];
  }

  onLocationChange(e) {
    console.log('LOCATION CHANGE', e, this.selectedLocation);
    this.employeeList = [];
    this.loadEmpDataForDropDown();
  }

  onProjectChange(e) {
    // this.selectedStartDate = new Date(e.StartDate);
    // this.selectedEndDate = new Date(e.EndDate);
  }

  onEmpDropDownChange(e) {
    this.employeeList = [];
    console.log('EMP DROPDOWN CHANGE', e, this.employeeList);
    if (this.selectedEmployeeDropdown == 1) {
      this.loadEmpDataForDropDown();
    }
    console.log('EMP CHANGE', e, this.selectedEmployeeDropdown, this.employeeList);
  }

  loadEmpDataForDropDown() {
    if (this.selectedLocation === 0) {
      this.employeeList = this.searchData.EmployeeList.filter(a => a.TeamId == this.selectedTeam);
    } else if (this.selectedTeam === 0 && this.selectedLocation !== 0) {
      this.employeeList = this.searchData.EmployeeList.filter(a => a.ClientLocationId === this.selectedLocation);
    } else {
      this.employeeList = this.searchData.EmployeeList.filter(a => a.TeamId == this.selectedTeam && a.ClientLocationId === this.selectedLocation);
    }
     
    if (this.employeeList && this.employeeList.length) {
      this.employeeList.forEach(emp => {
        emp.selectedStartDate = new Date();
        emp.selectedEndDate = new Date();
      });
    }
  }

  onChangeStartDate(e) {
    console.log('onChangeStartDate', e);
    if (e) {
      this.selectedStartDate = new Date(e);
      this.selectedEndDate = new Date(e);
    }
  }

  onChangeEndDate(e) {
    console.log('onChangeEndDate', e);
    if (e) {
      this.selectedEndDate = new Date(e);
    }
  }

  onChangeEmployeeStartDate(e, item) {
    console.log('onChangeEmployeeStartDate', e);
    if (e) {
      item.selectedStartDate = new Date(e);
      item.selectedEndDate = new Date(e);
    }
  }

  onChangeEmployeeEndDate(e, item) {
    console.log('onChangeEmployeeEndDate', e);
    if (e) {
      item.selectedEndDate = new Date(e);
    }
  }
  
  createSaveObject() {
    const saveObj = {
      CompanyId: this.companyId,
      ClientId: this.selectedClient,
      ClientContractId : this.selectedClientContract,
      TeamId: this.selectedTeam,
      LocationId: this.selectedLocation,
      EmployeeId: this.selectedEmployee,
      PeriodFrom: moment(new Date(this.selectedStartDate)).format('MM-DD-YYYY'),
      PeriodTo: moment(new Date(this.selectedEndDate)).format('MM-DD-YYYY'),
      Id: 0,
      ProjectId: this.selectedProject,
      StartDate: moment(new Date(this.selectedStartDate)).format('MM-DD-YYYY'),
      EndDate:  moment(new Date(this.selectedEndDate)).format('MM-DD-YYYY'),
      CreatedOn: new Date().toISOString(),
      LastUpdatedOn: new Date().toISOString(),
      CreatedBy: this.loggedInUserId,
      LastUpdatedBy: this.loggedInUserId
    };
    console.log('add-saveObj', saveObj);
    return saveObj;
  }

  submitMap() {
    this.disableSubmitBtn = true;
    this.customLoader.show();
    let saveData = {};
    if (this.selectedEmployeeDropdown == 1) {
      // checks for undefined values
      if (this.employeeList.every(el => this.utilityservice.isNullOrUndefined(el.selectedProject))) {
        this.customLoader.hide();
        this.disableSubmitBtn = false;
        return this.alertService.showWarning('Please fill all fields');
      }
      // call api
      this.submitForSpecificEmployee().then((res) => {
        console.log('submitShiftForSpecificEmployee', res);
        this.customLoader.hide();
        this.disableSubmitBtn = false;
        if (res) {
          this.redirectToListingScreen();
        }
      });
    } else {
      if (this.utilityservice.isNullOrUndefined(this.selectedClient) ||
        this.utilityservice.isNullOrUndefined(this.selectedClientContract) ||
        this.utilityservice.isNullOrUndefined(this.selectedTeam) ||
        this.utilityservice.isNullOrUndefined(this.selectedLocation) ||
        this.utilityservice.isNullOrUndefined(this.selectedProject) ||
        this.utilityservice.isNullOrUndefined(this.selectedStartDate) ||
        this.utilityservice.isNullOrUndefined(this.selectedEndDate)) {
        this.customLoader.hide();
        this.disableSubmitBtn = false;
        return this.alertService.showWarning('Please fill all fields');
      }

      const project = this.projectsList.find(a => a.Id === this.selectedProject);
      const startDate = new Date(project.StartDate);
      const endDate = new Date(project.EndDate);
      
      const isStartDateInRange = this.isDateInRange(this.selectedStartDate, startDate,endDate);
      const isEndDateInRange = this.isDateInRange(this.selectedEndDate, startDate, endDate);
      
      
      if (!isStartDateInRange || !isEndDateInRange) {
        const rangeText = `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
        this.customLoader.hide();
        this.disableSubmitBtn = false;
        return this.alertService.showWarning(`The Period From /Period To should be within ${rangeText} range`);
      }
      
      if (this.selectedProject && this.selectedStartDate && this.selectedEndDate) {
        this.customLoader.show();
        saveData = this.createSaveObject();
        // CALL API TO SAVE IN DB
        this.timesheetservice.put_UpsertProjectEmployeeMapping(JSON.stringify(saveData)).subscribe((res) => {
          this.customLoader.hide();
          this.disableSubmitBtn = false;
          console.log('SUBMIT FOR ALL -->', res);
          if (res.Status) {
            this.alertService.showSuccess(res.Message);
            this.redirectToListingScreen();
          } else {
            this.alertService.showWarning(res.Message);
          }
        });
      }
    }

  }

  submitForSpecificEmployee() {
    const promise = new Promise((resolve, reject) => {
      this.employeeList.forEach(element => {
        
        if(element.selectedProject && element.selectedStartDate && element.selectedEndDate) {
          const project = this.projectsList.find(a => a.Id === element.selectedProject);
          const startDate = new Date(project.StartDate);
          const endDate = new Date(project.EndDate);
          
          const isStartDateInRange = this.isDateInRange(element.selectedStartDate, startDate, endDate);
          const isEndDateInRange = this.isDateInRange(element.selectedEndDate, startDate, endDate);
          
          if (!isStartDateInRange || !isEndDateInRange) {
            resolve(false);
            const rangeText = `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
            return this.alertService.showWarning(`The Start date / End date should be within ${rangeText} range`);
          }
          this.customLoader.show();
          this.disableSubmitBtn = true;
          const saveData = {
            ProjectId: element.selectedProject,
            CompanyId: this.companyId,
            ClientId: this.selectedClient,
            ClientContractId : this.selectedClientContract,
            TeamId: this.selectedTeam,
            LocationId: this.selectedLocation,
            EmployeeId: element.EmployeeId,
            PeriodFrom: moment(new Date(element.selectedStartDate)).format('MM-DD-YYYY'),
            PeriodTo: moment(new Date(element.selectedEndDate)).format('MM-DD-YYYY'),
            Id: 0,
            StartDate: moment(new Date(element.selectedStartDate)).format('MM-DD-YYYY'),
            EndDate:  moment(new Date(element.selectedEndDate)).format('MM-DD-YYYY'),
            CreatedOn: new Date().toISOString(),
            LastUpdatedOn: new Date().toISOString(),
            CreatedBy: this.loggedInUserId,
            LastUpdatedBy: this.loggedInUserId,
          };
          // CALL API TO SAVE IN DB
          console.log(':::: saveData inside each ::::', saveData);
          this.timesheetservice.put_UpsertProjectEmployeeMapping(JSON.stringify(saveData)).subscribe((res) => {
            this.customLoader.hide();
            console.log('SUBMIT FOR ALL -->', res);
            if (res.Status) {
              this.alertService.showSuccess(res.Message);
              this.redirectToListingScreen();
              resolve(true);
            } else {
              this.alertService.showWarning(res.Message);
              resolve(false);
            }
          });
        }
      });
      
    });
    return promise;
  }

  redirectToListingScreen() {
    this.router.navigate(['app/timesheet/employeeProjectMapping']);
  }

  isDateInRange(currentDate: Date, startDate: Date, endDate: Date): boolean {
    // splitting to avoid error
    let from = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    let to = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
    let date = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());

    // Convert to UTC
    from.setUTCHours(0, 0, 0, 0);   
    to.setUTCHours(0, 0, 0, 0);
    date.setUTCHours(0, 0, 0, 0);

    // check range
    const result = date >= from && date <= to;
    console.log('Range', result);
    return result;
  }

}
