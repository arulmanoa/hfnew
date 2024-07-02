import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
import { LoginResponses, UIMode, UserStatus } from 'src/app/_services/model';
import { AlertService, ClientService } from 'src/app/_services/service';
import { SessionStorage } from 'src/app/_services/service/session-storage.service';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { UtilityService } from 'src/app/_services/service/utitlity.service';
import moment from 'moment';

@Component({
  selector: 'app-flexi-benefit-plan-time-slot',
  templateUrl: './flexi-benefit-plan-time-slot.component.html',
  styleUrls: ['./flexi-benefit-plan-time-slot.component.css']
})
export class FlexiBenefitPlanTimeSlotComponent implements OnInit {

  spinner: boolean = false;
  minDate: any;
  clientsList: any = [];
  clientContractList: any = [];
  teamsList: any = [];
  employeeList: any = [];
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
  selectedEmployee: number = 0;
  selectedEmployeeDropdown: number = 0;
  selectedStartDate: any;
  selectedEndDate: any;
  loadFBPSlotData: any;
  _loginSessionDetails: LoginResponses;
  loggedInUserId: string = '';
  companyId: number;
  disableSubmitBtn: boolean = false;
  searchText: any = null;
  businessType: number;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private alertService: AlertService,
    private clientservice: ClientService,
    private sessionService: SessionStorage,
    private loadingscreen: LoadingScreenService,
    private utilityservice: UtilityService
  ) { }

  ngOnInit() {
    this.minDate = new Date();  
    this._loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses));
    this.loggedInUserId = this._loginSessionDetails.UserSession.UserId.toString();
    this.companyId = this._loginSessionDetails.Company.Id;
    console.log('inside slot cmp');
    this.initial_getClientContract_load();
  }

  initial_getClientContract_load() {
    this.spinner = true;
    this.loadingscreen.startLoading();
    this.loadFBPSlotData = [];
    this.clientsList = [];
    this.clientContractList = [];
    this.businessType = this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping != null ? this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this._loginSessionDetails.Company.Id).BusinessType : 0;
    this.clientservice.loadFBPSubmissionSlot().subscribe(response => {
      console.log('loadFBPSubmissionSlot-response', response.dynamicObject);
      this.loadFBPSlotData = response.dynamicObject;
      // load client list
      this.clientsList = this.loadFBPSlotData.ClientList;
      // Push ALL to first in client list
      this.clientsList.unshift({Id: 0, Name: 'All'});
      // load client contract list
      this.clientContractList = this.loadFBPSlotData.ClientContractList;
      // load team list
      this.teamsList = this.loadFBPSlotData.TeamList;
      // load employee list
      this.employeeList = this.loadFBPSlotData.EmployeeList;
      // load data for SME
      if (this.businessType != 3) {
        // load based on selected sme client
        this.loadFBPSlotData.ClientList = this.loadFBPSlotData.ClientList.filter(a => a.Id === Number(this.sessionService.getSessionStorage("default_SME_ClientId")));
        this.loadFBPSlotData.ClientContractList = this.loadFBPSlotData.ClientContractList.filter(a => a.ClientId === Number(this.sessionService.getSessionStorage("default_SME_ClientId")));
        this.loadFBPSlotData.TeamList = this.loadFBPSlotData.TeamList.filter(a => a.ClientId === Number(this.sessionService.getSessionStorage("default_SME_ClientId")));
        this.loadFBPSlotData.EmployeeList = this.loadFBPSlotData.EmployeeList.filter(a => a.ClientId === Number(this.sessionService.getSessionStorage("default_SME_ClientId")));
        // assign values to show data in dropdown
        this.clientsList = this.loadFBPSlotData.ClientList;
        this.clientContractList = this.loadFBPSlotData.ClientContractList;
        this.teamsList = this.loadFBPSlotData.TeamList;
        this.employeeList = this.loadFBPSlotData.EmployeeList;
      }
      console.log(this.clientsList, this.clientContractList, this.teamsList, this.employeeList);
      this.spinner = false;
      this.loadingscreen.stopLoading();
    }, (error) => {
      console.log('error', error);
      this.spinner = false;
      this.disableSubmitBtn = true;
      this.loadingscreen.stopLoading();
    });
  }

  onClientChange(e) {
    console.log('CLIENT CHANGE', e, this.selectedClient);
    this.selectedClientContract = null;
    this.selectedTeam = null;
    this.employeeList = [];
    this.clientContractList = [];
    if(e) {
      const deepClone = e.Id == 0 ?  this.loadFBPSlotData.ClientContractList : this.loadFBPSlotData.ClientContractList.filter(a => a.ClientId === e.Id);
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
    this.employeeList = [];
    this.teamsList = [];
    if (e) {
      let deepClone =  e.Id == 0 ?  this.loadFBPSlotData.TeamList : this.loadFBPSlotData.TeamList.filter(a => a.ClientContractId === this.selectedClientContract);
      if (this.businessType == 3) {
        deepClone = e.Id == 0 && this.selectedClient != 0 ? this.loadFBPSlotData.TeamList.filter(a => a.ClientId === this.selectedClient) : deepClone;
      }
      this.teamsList = JSON.parse(JSON.stringify(deepClone));
      if ( this.teamsList &&  this.teamsList.length > 1) {
        this.teamsList.unshift({Id: 0, Name: 'All', ClientId: 0, ClientContractId: 0});
      }
    }
  }

  onTeamChange(e) {
    console.log('TEAM CHANGE', e, this.selectedTeam);
    this.disableEmpDrpdwn = false;
    if (e.Id === 0) {
      this.disableEmpDrpdwn = true;
      this.selectedEmployeeDropdown = this.employeeDropdown.filter(a => a.id === e.Id)[0].id;
      this.selectedEmployee = this.selectedEmployeeDropdown;
    }
    this.employeeList = [];
    this.employeeList = this.loadFBPSlotData.EmployeeList.filter(a => a.ClientContractId === this.selectedClientContract);
  }

  onEmpDropDownChange(e) {
    this.employeeList = [];
    if (this.selectedEmployeeDropdown == 1) {
      this.employeeList = this.loadFBPSlotData.EmployeeList.filter(a => a.ClientContractId === this.selectedClientContract);
    }
    console.log('EMP CHANGE', e, this.selectedEmployeeDropdown, this.employeeList);
  }

  onChangeStartDate(e) {
    console.log('onChangeStartDate', e);
    if (e) {
      this.selectedStartDate = new Date(e);
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
    }
  }

  onChangeEmployeeEndDate(e, item) {
    console.log('onChangeEmployeeEndDate', e);
    if (e) {
      item.selectedEndDate = new Date(e);
    }
  }

  redirectToMainFlexibleBenefitPlanSlot() {
    this.router.navigate(['app/listing/ui/fbpSlot']);
  }

  submitAddNewSlotFn() {
    this.loadingscreen.startLoading();
    let saveData = {};
    if (this.selectedEmployeeDropdown == 1) {
      this.submitSlotForSpecificEmployee().then((res) => {
        console.log('submitSlotForSpecificEmployee', res);
        this.loadingscreen.stopLoading();
        this.disableSubmitBtn = false;
        this.redirectToMainFlexibleBenefitPlanSlot();
      });
    } else {
      if(this.utilityservice.isNullOrUndefined(this.selectedClient) || 
        this.utilityservice.isNullOrUndefined(this.selectedClientContract) ||
        this.utilityservice.isNullOrUndefined(this.selectedTeam) ||
        this.utilityservice.isNullOrUndefined(this.selectedStartDate) || 
        this.utilityservice.isNullOrUndefined(this.selectedEndDate)) {
          this.loadingscreen.stopLoading();
          return this.alertService.showWarning('Please fill all fields');
      }
      if(this.selectedStartDate && this.selectedEndDate) {
        this.loadingscreen.startLoading();
        saveData = this.createSaveObject();
        // CALL API TO SAVE IN DB
        this.clientservice.upsertFBPSubmissionSlot(saveData).subscribe((res) => {
          this.loadingscreen.stopLoading();
          console.log('SUBMIT FOR ALL -->',res);
          if (res.Status) {
            this.alertService.showSuccess(res.Message);
            this.redirectToMainFlexibleBenefitPlanSlot();
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
      ClientContractId : this.selectedClientContract,
      TeamId: this.selectedTeam,
      EmployeeId: this.selectedEmployee,
      PeriodFrom: moment(new Date(this.selectedStartDate)).format('MM-DD-YYYY'), // new Date(this.selectedStartDate).toISOString(),
      PeriodTo: moment(new Date(this.selectedEndDate)).format('MM-DD-YYYY'),
      Status : UserStatus.Active,
      Id: 0,
      CreatedOn: new Date().toISOString(),
      LastUpdatedOn: new Date().toISOString(),
      CreatedBy: this.loggedInUserId,
      LastUpdatedBy: this.loggedInUserId
    };
    console.log('add-saveObj', saveObj);
    return saveObj;
  }

  submitSlotForSpecificEmployee() {
    const promise = new Promise((resolve, reject) => {
      this.employeeList.forEach(element => {
        if(element.selectedStartDate && element.selectedEndDate) {
          this.loadingscreen.startLoading();
          this.disableSubmitBtn = true;
          const saveData = {
            CompanyId: this.companyId,
            ClientId: this.selectedClient,
            ClientContractId : this.selectedClientContract,
            TeamId: this.selectedTeam,
            EmployeeId: element.EmployeeId,
            PeriodFrom: moment(new Date(element.selectedStartDate)).format('MM-DD-YYYY'),
            PeriodTo: moment(new Date(element.selectedEndDate)).format('MM-DD-YYYY'),
            Status : UserStatus.Active,
            Id: 0,
            CreatedOn: new Date().toISOString(),
            LastUpdatedOn: new Date().toISOString(),
            CreatedBy: this.loggedInUserId,
            LastUpdatedBy: this.loggedInUserId,
          };
          // CALL API TO SAVE IN DB
          this.clientservice.upsertFBPSubmissionSlot(saveData).subscribe((res) => {
            if (res.Status) {
              this.alertService.showSuccess(res.Message);
            } else {
              this.alertService.showWarning(res.Message);
              this.loadingscreen.stopLoading();
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

}

