import { Component, OnInit, ChangeDetectionStrategy  } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
import { LoginResponses, UIMode, UserStatus } from 'src/app/_services/model';
import { AlertService, ClientService } from 'src/app/_services/service';
import { SessionStorage } from 'src/app/_services/service/session-storage.service';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { InvestmentSubmissionSlotMode } from 'src/app/_services/model/investmentSubmissionSlotMode';
import { UtilityService } from 'src/app/_services/service/utitlity.service';
import moment from 'moment';
@Component({
  selector: 'app-investmentsubmissionslot',
  templateUrl: './investmentsubmissionslot.component.html',
  styleUrls: ['./investmentsubmissionslot.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvestmentsubmissionslotComponent implements OnInit {

  spinner: boolean = false;
  minDate: any;
  isDeclarationSelected: boolean = true;
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
  loadInvestmentSlot: any;
  _loginSessionDetails: LoginResponses;
  loggedInUserId: string = '';
  companyId: number;
  disableSubmitBtn: boolean = false;
  searchText: any = null;
  businessType: number;
  page = 1;
  throttle = 300;
  scrollDistance = 2;
  scrollUpDistance = 1;
  direction = "";
  sum = 100;

  pageSize = 50;
  currentPage = 1;
  loading = false;
  groupedArray: any;


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
    this.loadInvestmentSlot = [];
    this.clientsList = [];
    this.clientContractList = [];
    this.businessType = this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping != null ? this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this._loginSessionDetails.Company.Id).BusinessType : 0;
    this.clientservice.loadInvestmentSubmissionSlot().subscribe(response => {
      console.log('loadInvestmentSubmissionSlot-response', response.dynamicObject);
      this.loadInvestmentSlot = response.dynamicObject;
      // load client list
      this.clientsList = this.loadInvestmentSlot.ClientList;
      // Push ALL to first in client list
      this.clientsList.unshift({ Id: 0, Name: 'All' });
      // load client contract list
      this.clientContractList = this.loadInvestmentSlot.ClientContractList;
      // load team list
      this.teamsList = this.loadInvestmentSlot.TeamList;
      // load employee list
      this.employeeList = this.loadInvestmentSlot.EmployeeList;
      // load data for SME
      if (this.businessType != 3) {
        // load based on selected sme client
        this.loadInvestmentSlot.ClientList = this.loadInvestmentSlot.ClientList.filter(a => a.Id === Number(this.sessionService.getSessionStorage("default_SME_ClientId")));
        this.loadInvestmentSlot.ClientContractList = this.loadInvestmentSlot.ClientContractList.filter(a => a.ClientId === Number(this.sessionService.getSessionStorage("default_SME_ClientId")));
        this.loadInvestmentSlot.TeamList = this.loadInvestmentSlot.TeamList.filter(a => a.ClientId === Number(this.sessionService.getSessionStorage("default_SME_ClientId")));
        this.loadInvestmentSlot.EmployeeList = this.loadInvestmentSlot.EmployeeList.filter(a => a.ClientId === Number(this.sessionService.getSessionStorage("default_SME_ClientId")));
        // assign values to show data in dropdown
        this.clientsList = this.loadInvestmentSlot.ClientList;
        this.clientContractList = this.loadInvestmentSlot.ClientContractList;
        this.teamsList = this.loadInvestmentSlot.TeamList;
        this.employeeList = this.loadInvestmentSlot.EmployeeList;
      }
      console.log(this.clientsList, this.clientContractList, this.teamsList, this.employeeList);

      const groupedData = this.loadInvestmentSlot.EmployeeList.reduce((acc, employee) => {
        const key = `${employee.ClientContractId}-${employee.TeamId}`;

        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(employee);
        return acc;
      }, {});

      this.groupedArray = Object.values(groupedData);
      console.log('groupedData', groupedData);

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
    if (e) {
      const deepClone = e.Id == 0 ? this.loadInvestmentSlot.ClientContractList : this.loadInvestmentSlot.ClientContractList.filter(a => a.ClientId === e.Id);
      this.clientContractList = JSON.parse(JSON.stringify(deepClone));
      if (this.clientContractList && this.clientContractList.length > 1) {
        this.clientContractList.unshift({ Id: 0, Name: 'All', ClientId: 0, ClientContractId: 0 });
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
      let deepClone = e.Id == 0 ? this.loadInvestmentSlot.TeamList : this.loadInvestmentSlot.TeamList.filter(a => a.ClientContractId === this.selectedClientContract);
      if (this.businessType == 3) {
        deepClone = e.Id == 0 && this.selectedClient != 0 ? this.loadInvestmentSlot.TeamList.filter(a => a.ClientId === this.selectedClient) : deepClone;
      }
      this.teamsList = JSON.parse(JSON.stringify(deepClone));
      if (this.teamsList && this.teamsList.length > 1) {
        this.teamsList.unshift({ Id: 0, Name: 'All', ClientId: 0, ClientContractId: 0 });
      }
    }

    this.employeeList = this.getEmployeeListByContractAndTeam(this.groupedArray, this.selectedClientContract, undefined);


  }

  onTeamChange(e) {
    console.log('TEAM CHANGE', e, this.selectedTeam);
    this.disableEmpDrpdwn = false;
    this.selectedEmployeeDropdown = null;
    this.employeeList = [];
    if (e.Id === 0) {
      this.disableEmpDrpdwn = true;
      this.selectedEmployeeDropdown = this.employeeDropdown.filter(a => a.id === e.Id)[0].id;
      this.selectedEmployee = this.selectedEmployeeDropdown;
    }
    this.employeeList = this.getEmployeeListByContractAndTeam(this.groupedArray, this.selectedClientContract, this.selectedTeam);
    console.log('Team List', e, this.selectedEmployeeDropdown, this.employeeList);
  }

  onEmpDropDownChange(e) {
    // 
    if (e.id == 0) {
      this.employeeList = [];
      if (this.selectedTeam != 0) {
        this.employeeList = this.getEmployeeListByContractAndTeam(this.groupedArray, this.selectedClientContract, this.selectedTeam);
      } else {
        this.employeeList = this.groupedArray.flat()
      }

      // const filteredList = this.loadInvestmentSlot.EmployeeList.reduce(
      //   (accumulator, employee) =>
      //     employee.TeamId === this.selectedTeam
      //       ? accumulator.concat(employee)
      //       : accumulator,
      //   []
      // );
      // this.employeeList = filteredList;
    } else {
      this.employeeList = [];
      this.employeeList = this.getEmployeeListByContractAndTeam(this.groupedArray, this.selectedClientContract, this.selectedTeam);
    }

    // this.currentPage = 1;
    //   this.loadMore();

    // this.employeeList = [];
    // if (e.id == 1) {
    //   this.employeeList = this.loadInvestmentSlot.EmployeeList.filter(a => a.ClientContractId === this.selectedClientContract);
    // }
    console.log('EMP CHANGE', e, this.selectedEmployeeDropdown, this.employeeList);
  }

  getEmployeeListByContractAndTeam(groupedArray, targetContractId, targetTeamId) {
    const contractFiltered = groupedArray.filter((group) => group[0].ClientContractId === targetContractId);
    if (contractFiltered.length > 0) {
      if (targetTeamId !== undefined) {
        for (const group of contractFiltered) {
          const teamId = group[0].TeamId;

          if (teamId === targetTeamId) {
            return group;
          }
        }
      } else {
        return contractFiltered[0];
      }
    }
    return [];
  }


  loadMore(): void {
    if (!this.loading && this.selectedClientContract !== null) {
      this.loading = true;

      const filteredEmployees = this.loadInvestmentSlot.EmployeeList.filter(employee => employee.ClientContractId === this.selectedClientContract);

      const startIndex = (this.currentPage - 1) * this.pageSize;
      const endIndex = startIndex + this.pageSize;
      const newEmployees = filteredEmployees.slice(startIndex, endIndex);

      this.employeeList = [...this.employeeList, ...newEmployees];
      this.loading = false;
    }
  }


  trackByFn(index: number, item: any): any {
    return item.EmployeeId;
  }

  onChangeStartDate(e) {
    if (e) {
      this.selectedStartDate = new Date(e);
    }
  }

  onChangeEndDate(e) {
    if (e) {
      this.selectedEndDate = new Date(e);
    }
  }

  onChangeEmployeeStartDate(e, item) {
    if (e) {
      item.selectedStartDate = new Date(e);
    }
  }

  onChangeEmployeeEndDate(e, item) {
    if (e) {
      item.selectedEndDate = new Date(e);
    }
  }

  redirectToMainInvestmentSlot() {
    this.router.navigate(['app/listing/ui/InvesmentSlot']);
  }

  onChangeMode(value: string) {
    if (value == 'proof') {
      this.isDeclarationSelected = false;
    } else {
      this.isDeclarationSelected = true;
    }
  }

  submitAddNewSlotFn() {
    this.loadingscreen.startLoading();
    let saveData = {};
    if (this.selectedEmployeeDropdown == 1) {
      this.submitSlotForSpecificEmployee().then((res) => {
        console.log('submitSlotForSpecificEmployee', res);
        this.loadingscreen.stopLoading();
        this.disableSubmitBtn = false;
        this.redirectToMainInvestmentSlot();
      });
    } else {
      this.loadingscreen.stopLoading();
      if (this.utilityservice.isNullOrUndefined(this.selectedClient) ||
        this.utilityservice.isNullOrUndefined(this.selectedClientContract) ||
        this.utilityservice.isNullOrUndefined(this.selectedTeam) ||
        this.utilityservice.isNullOrUndefined(this.selectedStartDate) ||
        this.utilityservice.isNullOrUndefined(this.selectedEndDate)) {
        return this.alertService.showWarning('Please fill all fields');
      }
      if (this.selectedStartDate && this.selectedEndDate) {
        this.loadingscreen.startLoading();
        saveData = this.createSaveObject();
        // CALL API TO SAVE IN DB
        this.clientservice.upsertInvestmentSubmissionSlot(saveData).subscribe((res) => {
          this.loadingscreen.stopLoading();
          console.log('BY ID RESULT -->', res);
          if (res.Status) {
            this.alertService.showSuccess(res.Message);
            this.redirectToMainInvestmentSlot();
          } else {
            this.alertService.showWarning(res.Message);
          }
        });
      }
    }
    console.log('saveData', saveData);
  }

  createSaveObject() {
    const saveObj = {
      ClientContractId: this.selectedClientContract,
      ClientId: this.selectedClient,
      CompanyId: this.companyId,
      CreatedBy: this.loggedInUserId,
      CreatedOn: new Date().toISOString(),
      EmployeeId: this.selectedEmployee,
      Id: 0,
      Mode: this.isDeclarationSelected ? InvestmentSubmissionSlotMode.Declaration : InvestmentSubmissionSlotMode.Proof,
      Modetype: UIMode.None,
      StartDay: moment(new Date(this.selectedStartDate)).format('MM-DD-YYYY'), //new Date(this.selectedStartDate).toISOString(),
      EndDay: moment(new Date(this.selectedEndDate)).format('MM-DD-YYYY'),// new Date(this.selectedEndDate).toISOString(),
      Status: UserStatus.Active,
      TeamId: this.selectedTeam,
      LastUpdatedBy: this.loggedInUserId,
      LastUpdatedOn: new Date().toISOString()
    };
    console.log('add-saveObj', saveObj);
    return saveObj;
  }

  submitSlotForSpecificEmployee() {
    const promise = new Promise((resolve, reject) => {
      this.employeeList.forEach(element => {
        if (element.selectedStartDate && element.selectedEndDate) {
          this.loadingscreen.startLoading();
          this.disableSubmitBtn = true;
          const saveData = {
            ClientContractId: this.selectedClientContract,
            ClientId: this.selectedClient,
            CompanyId: this.companyId,
            CreatedBy: this.loggedInUserId,
            CreatedOn: new Date().toISOString(),
            EmployeeId: element.EmployeeId,
            Id: 0,
            Mode: this.isDeclarationSelected ? InvestmentSubmissionSlotMode.Declaration : InvestmentSubmissionSlotMode.Proof,
            Modetype: UIMode.None,
            StartDay: moment(new Date(element.selectedStartDate)).format('MM-DD-YYYY'), //new Date(element.selectedStartDate).toISOString(),
            EndDay: moment(new Date(element.selectedEndDate)).format('MM-DD-YYYY'), //new Date(element.selectedEndDate).toISOString(),
            Status: UserStatus.Active,
            TeamId: this.selectedTeam,
            LastUpdatedBy: this.loggedInUserId,
            LastUpdatedOn: new Date().toISOString()
          };
          // CALL API TO SAVE IN DB
          console.log(':::: saveData inside each ::::', saveData);
          this.clientservice.upsertInvestmentSubmissionSlot(saveData).subscribe((res) => {
            if (res.Status) {
              this.alertService.showSuccess(res.Message);
            } else {
              this.alertService.showWarning(res.Message);
              this.loadingscreen.stopLoading();
              this.disableSubmitBtn = false;
              reject();
            }
          });
        }
      });
      resolve(true);
    });
    return promise;
  }

 
}
