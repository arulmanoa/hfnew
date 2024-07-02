import { Component, OnInit, Input, EventEmitter, OnDestroy } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";

import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { UUID } from "angular2-uuid";
import { takeUntil } from "rxjs/operators";
import { LoginResponses } from "src/app/_services/model";
import {
  AlertService,
  SessionStorage,
  ClientService,
  ClientContactService,
  OnboardingService,
} from "src/app/_services/service";
import { SessionKeys } from "src/app/_services/configs/app.config";
import { apiResponse } from "src/app/_services/model/apiResponse";
import { ClientList } from "src/app/_services/model/ClientLocationAllList";
import { ClientContractService } from "src/app/_services/service/clientContract.service";
import {
  ClientContactList,
  ClientContractList,
} from "src/app/_services/model/OnBoarding/OnBoardingInfo";
import { BaseDaysConsiderationType, Team } from "src/app/_services/model/Client/Team";
import { LeaveGroup } from "src/app/components/Models/look-up-model";
import { isObjectEmpty } from "src/app/utility-methods/utils";

@Component({
  selector: "app-team",
  templateUrl: "./team.component.html",
  styleUrls: ["./team.component.css"],
})
export class TeamComponent implements OnInit, OnDestroy {
  @Input() Id: number = 0;
  spinner: boolean = false;
  loginSessionDetails: LoginResponses;
  BusinessType: number = 0;
  CompanyId: number = 0;
  UserId: number = 0;
  RoleId: number = 0;
  submitted = false;
  teamForm: FormGroup;

  LstClient: ClientList[] = [];
  LstClientContract: ClientContractList[] = [];
  LstClientContact: ClientContactList[] = [];
  PaycycleList = [];
  AttendanceCycleList = [];
  PaygroupList = [];
  PayPeriodList = [];
  ManagerList = [];
  bankList = [];
  ifsc_Code_List = [];
  is_spinner_ifsc: boolean = false;
  basedaysconsiderationtypeList = Object.keys(BaseDaysConsiderationType).filter((key) => !isNaN(Number(key))).map(key => ({ value: Number(key), name: BaseDaysConsiderationType[key] }));
  LeaveGroupList: Array<LeaveGroup> = [];

  lookUpMaster = {
    PaycycleList: [],
    PaygroupList: [],
    AttendanceCycleList: [],
    ManagerList: [],
    LeaveGroupList: []
  };
  private stopper: EventEmitter<any> = new EventEmitter();
  currentClientId: number;
  constructor(
    private activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private sessionService: SessionStorage,
    private alertService: AlertService,
    private clientservice: ClientService,
    private clientContactService: ClientContactService,
    private clientContractService: ClientContractService,
    private onboardingService: OnboardingService
  ) {
    this.createReactiveForm();
    this.teamForm.controls["isVanBased"].valueChanges.subscribe((val: boolean) => {
      if (val) {
        this.teamForm.controls["AccountHolderName"].setValidators([Validators.required,]);
        this.teamForm.controls["BankId"].setValidators([Validators.required]);
        this.teamForm.controls["BankId"].updateValueAndValidity();
        this.teamForm.controls["IFSCCode"].setValidators([Validators.required]);
        this.teamForm.controls["IFSCCode"].updateValueAndValidity();
        this.teamForm.controls["AccountNumber"].setValidators([Validators.required]);
        this.teamForm.controls["AccountNumber"].updateValueAndValidity();
      } else {
        this.teamForm.controls["AccountHolderName"].setValue("");
        this.teamForm.controls["AccountHolderName"].setValidators(null);
        this.teamForm.controls["AccountHolderName"].updateValueAndValidity();
        this.teamForm.controls["BankId"].setValue(null);
        this.teamForm.controls["BankId"].setValidators(null);
        this.teamForm.controls["BankId"].updateValueAndValidity();
        this.teamForm.controls["IFSCCode"].setValue(null);
        this.teamForm.controls["IFSCCode"].setValidators(null);
        this.teamForm.controls["IFSCCode"].updateValueAndValidity();
        this.teamForm.controls["AccountNumber"].setValue("");
        this.teamForm.controls["AccountNumber"].setValidators(null);
        this.teamForm.controls["AccountNumber"].updateValueAndValidity();
      }
    })
  }

  get g() {
    return this.teamForm.controls;
  }

  createReactiveForm() {
    this.teamForm = this.formBuilder.group({
      Id: [UUID.UUID()],
      Name: ["", [Validators.required, Validators.minLength(5)]],
      Code: ["", [Validators.required, Validators.minLength(5)]],
      ClientId: [null, Validators.required],
      ClientContractId: [null, Validators.required],
      ClientContactId: [null, Validators.required],
      PayCycleId: [null, Validators.required],
      PayGroupId: [null, Validators.required],
      OpenPayPeriodId: [null, Validators.required],
      AttendanceStartday: [null, Validators.required],
      AttendanceEndday: [
        null,
        [Validators.required, Validators.minLength(2), Validators.maxLength(2)],
      ],
      AttendanceCycleId: [null, Validators.required],
      LeaveGroupId: [null],
      isnapbased: [false],
      isVanBased: [false, Validators.required],
      IsVanBasedPayOut: [false],
      AccountHolderName: [""],
      BankId: [null],
      IFSCCode: [null],
      AccountNumber: [""],
      defaultManagerId: [null],
      IsAttendanceStampingBasedonLastDate: [false],
      IsMustorRollApplicable: [false],
      BaseDaysConsiderationType: [null],
      PaycycleStartDay: [null],
      ConsultantDetails: [null]
    });
    console.log("team form ", this.teamForm);
  }

  ngOnInit() {
    this.loginSessionDetails = JSON.parse(
      this.sessionService.getSessionStorage(SessionKeys.LoginResponses)
    );
    this.BusinessType =
      this.loginSessionDetails.Company.LstCompanyBusinessTypeMapping != null
        ? this.loginSessionDetails.Company.LstCompanyBusinessTypeMapping.find(
          (item) => item.CompanyId == this.loginSessionDetails.Company.Id
        ).BusinessType
        : 0;
    this.CompanyId = this.loginSessionDetails.Company.Id;
    this.RoleId = this.loginSessionDetails.UIRoles[0].Role.Id;
    this.UserId = this.loginSessionDetails.UserSession.UserId;

    // fetching bank list
    fetch("assets/json/bankList.json")
      .then((res) => res.json())
      .then((jsonData) => {
        this.bankList = jsonData.BankList;
        console.log("Bank List", this.bankList);
      });

    this.spinner = true;
    this.init();
    if (this.Id) {
      this.GetTeamById();
    };
  }

  onChangeBank(bank) {
    this.is_spinner_ifsc = true;
    this.ifsc_Code_List = [];
    this.onboardingService
      .getBankBranchByBankId(bank.Id).pipe(takeUntil(this.stopper))
      .subscribe((authorized) => {
        const apiResponse: apiResponse = authorized;
        this.ifsc_Code_List = apiResponse.dynamicObject;
        console.log("IFSC CODE LIST ", apiResponse.dynamicObject);
        this.is_spinner_ifsc = false;
      });
  }

  init() {
    if (this.BusinessType == 3) {
      this.loadClientList();
    } else {
      let smeSelectedClient = JSON.parse(this.sessionService.getSessionStorage("SME_Client"));
      this.LstClient = [smeSelectedClient];
      this.currentClientId = smeSelectedClient.Id;
      this.teamForm.controls['ClientId'].patchValue(smeSelectedClient.Id);
      this.onChangeClient({ Id: smeSelectedClient.Id });
    };
    this.clientservice
      .LoadTeamLookupDetails().pipe(takeUntil(this.stopper))
      .subscribe((result: apiResponse) => {
        this.spinner = false;
        console.log("LOOKUP TEAM ::", result);
        if (result.Status) {
          let lookUpMaster: any = result.dynamicObject;
          this.lookUpMaster = lookUpMaster;
          if (this.currentClientId != null) {
            this.ManagerList = this.ManagerList.filter((a) => a.ClientId == this.currentClientId);
            this.LeaveGroupList = lookUpMaster.LeaveGroupList.filter((leaveGroup: LeaveGroup) => leaveGroup.ClientId === this.currentClientId);
          }
          this.PaycycleList = lookUpMaster.PaycycleList;
          this.PaygroupList = lookUpMaster.PaygroupList;
          this.AttendanceCycleList = lookUpMaster.AttendanceCycleList;
        }
      });
  }

  GetTeamById() {
    this.clientservice
      .GetTeamById(this.Id).pipe(takeUntil(this.stopper))
      .subscribe((result: apiResponse) => {
        console.log("Team Details by Id", result);
        let resObj: any = result.dynamicObject;
        this.currentClientId = resObj.ClientId;
        this.onChangeClient({ Id: resObj.ClientId });
        this.patchForm(result.dynamicObject);
      });
  };

  patchForm(editTeamInfo) {
    this.teamForm.patchValue(editTeamInfo);
    this.teamForm.value.PayCycleId != null && this.teamForm.value.PayCycleId > 0
      ? this.GetPayPeriodListByPayCyleId(this.teamForm.value.PayCycleId)
      : true;
    this.teamForm.controls["defaultManagerId"].setValue(
      this.teamForm.value.defaultManagerId == 0
        ? null
        : this.teamForm.value.defaultManagerId
    );
    this.teamForm.controls["AttendanceCycleId"].setValue(
      this.teamForm.value.AttendanceCycleId == 0
        ? null
        : this.teamForm.value.AttendanceCycleId
    );
    this.teamForm.patchValue({
      ClientId: editTeamInfo.ClientId
    });
    this.teamForm.controls["AttendanceEndday"].patchValue(
      Number(editTeamInfo.AttendanceEndday)
    );
    this.teamForm.controls["isnapbased"].patchValue(editTeamInfo.IsNapBased);
    this.teamForm.controls["IsVanBasedPayOut"].patchValue(
      editTeamInfo.IsVanBasedPayOut
    );
    if (editTeamInfo.isVanBasedAccount == undefined && !isObjectEmpty(editTeamInfo.VanAccountDetails)) {
      this.teamForm.controls["isVanBased"].patchValue(true);
    } else {
      this.teamForm.controls["isVanBased"].patchValue(editTeamInfo.IsVanBasedAccount);
    }
    if (
      editTeamInfo.VanAccountDetails != null ||
      editTeamInfo.VanAccountDetails != undefined || !isObjectEmpty(editTeamInfo.VanAccountDetails)
    ) {
      this.teamForm.controls["AccountHolderName"].patchValue(
        editTeamInfo.VanAccountDetails.AccountHolderName
      );
      this.teamForm.controls["AccountNumber"].patchValue(
        editTeamInfo.VanAccountDetails.AccountNumber
      );
      this.onChangeBank({ Id: editTeamInfo.VanAccountDetails.BankId });
      this.teamForm.controls["BankId"].patchValue(
        editTeamInfo.VanAccountDetails.BankId
      );
      this.teamForm.controls["IFSCCode"].patchValue(
        editTeamInfo.VanAccountDetails.BankBranchId
      );

    }


    this.teamForm.controls["AttendanceStartday"].patchValue(
      editTeamInfo.AttendanceStartday
    );
    this.teamForm.controls["AttendanceEndday"].patchValue(
      editTeamInfo.AttendanceEndday
    );
  }

  loadClientList() {
    this.clientContactService
      .getUserMappedClientList(this.RoleId, this.UserId).pipe(takeUntil(this.stopper))
      .subscribe(
        (response: apiResponse) => {
          if (response.Status) {
            if (response.dynamicObject !== null) {
              this.LstClient = response.dynamicObject;

              this.LstClient =
                this.LstClient.length > 0
                  ? this.LstClient.filter((a) => a.Id != 0)
                  : [];
            };
            if (this.LstClient.length == 0) {
              this.alertService.showWarning(
                "There is no client list found under your login, Kindly please contact support team"
              );
              setTimeout(() => {
                this.activeModal.close("Modal Closed");
              }, 2000);
            }
            this.spinner = false;
          } else {
            this.spinner = false;
          }
          console.log("CLT LST ::", this.LstClient);
        });
  }

  async onChangeClient(item) {
    console.log("Client Ev :", item);
    try {
      this.teamForm.patchValue({
        ClientId: item.Id,
        ClientContractId: null,
        ClientContactId: null,
      });
      this.currentClientId = item.Id;
      this.ManagerList = this.lookUpMaster.ManagerList;
      this.ManagerList = this.ManagerList.filter((a) => a.ClientId == item.Id);
      this.LeaveGroupList = this.lookUpMaster.LeaveGroupList.filter((leaveGroup: LeaveGroup) => leaveGroup.ClientId === this.currentClientId);
      console.log('leaveGroupList ', this.LeaveGroupList);
      this.loadClientContractByClientId(item.Id);
      this.loadClientContactByClientId(item.Id);
    } catch (error) {
      console.log("#002 COUNTRY EX ::", error);
    }
  }

  async loadClientContractByClientId(clientId) {
    try {
      await this.clientContractService.getClientContract(clientId).pipe(takeUntil(this.stopper)).subscribe(
        (response: apiResponse) => {
          if (response.Status) {
            this.LstClientContract = response.dynamicObject;
            if (this.BusinessType != 3) {
              let smeClientContract = JSON.parse(this.sessionService.getSessionStorage('sme_clientcontract'));
              console.log('smeClientContract ', smeClientContract);
              this.teamForm.controls['ClientContractId'].patchValue(smeClientContract.Id);
            }
          }
          console.log("CCRT LST ::", this.LstClientContract);
        }
      );
    } catch (error) { }
  }

  async loadClientContactByClientId(clientId) {
    try {
      await this.clientContactService
        .getClientContactbyClientId(clientId).pipe(takeUntil(this.stopper))
        .subscribe(
          (response: apiResponse) => {
            if (response.Status) {
              this.LstClientContact = response.dynamicObject;
              if (this.BusinessType != 3) {
                console.log('smeClientId ', this.sessionService.getSessionStorage('default_sme_clientid'));
              }
            }
            console.log("CCT LST ::", this.LstClientContact);
          }
        );
    } catch (error) { }
  }

  onChangePayPeriod(item) {
    try {
      this.teamForm.patchValue({
        PayCycleId: item.Id,
        OpenPayPeriodId: null,
      });
      this.GetPayPeriodListByPayCyleId(item.Id);
    } catch (error) {
      console.log("#002 PAYP EX ::", error);
    }
  }

  async GetPayPeriodListByPayCyleId(payCycleId) {
    try {
      await this.clientservice
        .GetPayPeriodListByPayCyleId(payCycleId).pipe(takeUntil(this.stopper))
        .subscribe(
          (response: apiResponse) => {
            if (response.Status) {
              this.PayPeriodList = response.dynamicObject;
            }
            console.log("PP LST ::", this.PayPeriodList);
          });
    } catch (error) { }
  }

  public isGuid(stringToTest) {
    if (stringToTest[0] === "{") {
      stringToTest = stringToTest.substring(1, stringToTest.length - 1);
    }
    var regexGuid =
      /^(\{){0,1}[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}(\}){0,1}$/gi;
    return regexGuid.test(stringToTest);
  }

  onUpdateAttendanceEndDay(event) {
    let attendanceEndDay = Number((<HTMLInputElement>event.target).value);
    if (attendanceEndDay > 31) {
      this.teamForm.controls["AttendanceEndday"].setErrors({
        invalidEndDay: true,
      });
    } else {
      this.teamForm.controls["AttendanceEndday"].setErrors(null);
    }
  }

  onUpdateAttendanceStartDay(event) {
    let attendanceStartDay = Number((<HTMLInputElement>event.target).value);
    if (attendanceStartDay > 31) {
      this.teamForm.controls["AttendanceStartday"].setErrors({
        invalidStartDay: true,
      });
    } else {
      this.teamForm.controls["AttendanceStartday"].setErrors(null);
    }
  }

  onUpdatePayCycleStartDay(event) {
    let payCycleStartDay = Number((<HTMLInputElement>event.target).value);
    if (payCycleStartDay > 31) {
      this.teamForm.controls["PaycycleStartDay"].setErrors({
        invalidPayCylceStartDay: true,
      });
    } else {
      this.teamForm.controls["PaycycleStartDay"].setErrors(null);
    }
  }

  doSaveTeam() {
    this.submitted = true;
    console.log("invalid", this.teamForm.value);

    if (this.teamForm.invalid) {
      this.alertService.showWarning("Please check respective field error messages and then try to save");
      return;
    }

    this.spinner = true;
    let team = new Team();
    team.Id = this.isGuid(this.teamForm.value.Id) ? 0 : this.teamForm.value.Id;
    team.Code = this.teamForm.value.Code;
    team.ClientContractId = this.teamForm.value.ClientContractId;
    team.ClientId = this.teamForm.value.ClientId;
    team.ClientContactId = this.teamForm.value.ClientContactId;
    team.PayCycleId = this.teamForm.value.PayCycleId;
    team.AttendanceStartday = Number(this.teamForm.value.AttendanceStartday);
    team.AttendanceEndday = Number(this.teamForm.value.AttendanceEndday);
    team.AttendanceCycleId = this.teamForm.value.AttendanceCycleId;
    team.PayGroupId = this.teamForm.value.PayGroupId;
    team.Name = this.teamForm.value.Name;
    team.IsAttendanceStampingBasedonLastDate =
      this.teamForm.value.IsAttendanceStampingBasedonLastDate;
    team.defaultManagerId =
      this.teamForm.value.defaultManagerId == null
        ? 0
        : this.teamForm.value.defaultManagerId;
    team.isnapbased = this.teamForm.value.isnapbased;
    team.IsVanBasedAccount = this.teamForm.value.isVanBased;
    if (this.teamForm.value.isVanBased) {
      let vanAccDetails: Team["VanAccountDetails"] = {
        AccountHolderName: "",
        companyId: 0,
        BankId: 0,
        BankBranchId: 0,
        IFSCCode: "",
        AccountNumber: 0,
      };
      vanAccDetails["AccountHolderName"] =
        this.teamForm.value.AccountHolderName;
      vanAccDetails["BankId"] = this.teamForm.value.BankId; // getting bank id
      vanAccDetails["BankBranchId"] = this.teamForm.value.IFSCCode; // getting ifsc code id
      vanAccDetails["IFSCCode"] = this.ifsc_Code_List.filter(
        (ifscCode) => ifscCode.Id == this.teamForm.value.IFSCCode
      )[0].FinancialSystemCode;
      vanAccDetails["AccountNumber"] = this.teamForm.value.AccountNumber;
      vanAccDetails["companyId"] = this.CompanyId;
      team.VanAccountDetails = vanAccDetails;
      team.PaycycleStartDay = this.teamForm.value.PaycycleStartDay;
      team.LeaveGroupId = this.teamForm.value.LeaveGroupId;
      team.BaseDaysConsiderationType = this.teamForm.value.BaseDaysConsiderationType;
      team.ConsultantDetails = this.teamForm.value.ConsultantDetails
    }
    team.IsVanBasedPayOut = this.teamForm.value.IsVanBasedPayOut;


    team.IsMustorRollApplicable = this.teamForm.value.IsMustorRollApplicable;
    team.OpenPayPeriodId = this.teamForm.value.OpenPayPeriodId;

    console.log("TEAM PYL ::", team);

    this.clientservice
      .UpsertTeamDetails(JSON.stringify(team)).pipe(takeUntil(this.stopper))
      .subscribe((data: apiResponse) => {
        console.log("#001 RES ::", data);
        this.spinner = false;
        if (data.Status) {
          this.alertService.showSuccess(data.Message);
          this.spinner = false;
          this.activeModal.close(data.Message);
        } else {
          this.spinner = false;
          this.alertService.showWarning(data.Message);
        }
      });
  }

  close() {
    this.activeModal.close("Modal Closed");
  };

  ngOnDestroy(): void {
    this.stopper.next();
    this.stopper.complete();

  }
}
