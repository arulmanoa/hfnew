import { Component, OnInit, Input } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import {
  FormGroup,
  FormBuilder,
  FormControl,
  Validators,
  AbstractControl,
} from "@angular/forms";

import { LoginResponses, UIMode } from "src/app/_services/model";
import {
  AlertService,
  SessionStorage,
  ClientLocationService,
  ClientService,
  ClientContactService,
} from "src/app/_services/service";
import { SessionKeys } from "src/app/_services/configs/app.config";
import { apiResponse } from "src/app/_services/model/apiResponse";
import { ClientList } from "src/app/_services/model/ClientLocationAllList";
import { ClientContractService } from "src/app/_services/service/clientContract.service";
import {
  ClientContactList,
  ClientContractList,
} from "src/app/_services/model/OnBoarding/OnBoardingInfo";
import { Team } from "src/app/_services/model/Client/Team";
import { UUID } from "angular2-uuid";
import { InvoiceFromAndToMapping } from "src/app/_services/model/Client/InvoiceFromAndToMapping";

@Component({
  selector: "app-costcode",
  templateUrl: "./costcode.component.html",
  styleUrls: ["./costcode.component.css"],
})
export class CostcodeComponent implements OnInit {
  @Input() Id: number = 0;
  // GENERAL
  spinner: boolean = false;
  loginSessionDetails: LoginResponses;
  BusinessType: number = 0;
  CompanyId: number = 0;
  UserId: number = 0;
  RoleId: number = 0;
  // CLIENT
  submitted = false;
  costCodeForm: FormGroup;

  LstClient: ClientList[] = [];
  LstClientContract: ClientContractList[] = [];

  ClientContactLocationList = [];
  ClientAddressDetailsList = [];
  CompanyBranchList = [];

  constructor(
    private activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private sessionService: SessionStorage,
    private alertService: AlertService,
    private clientservice: ClientService,
    private clientLocationService: ClientLocationService,
    private clientContactService: ClientContactService,
    private clientContractService: ClientContractService
  ) {
    this.createReactiveForm();
  }

  get g() {
    return this.costCodeForm.controls;
  } // reactive forms validation

  createReactiveForm() {
    this.costCodeForm = this.formBuilder.group({
      //GENERAL
      Id: [UUID.UUID()],
      Code: ["", [Validators.required, Validators.minLength(5)]],
      Description: ["", [Validators.required]],
      ClientId: [null, Validators.required],
      ClientContractId: [null, Validators.required],
      // CompanyId: [null, Validators.required],
      BillingContactLocationMappingId: [null, Validators.required],
      ShippingContactId: [null, Validators.required],
      CompanyBranchId: [null, Validators.required],
      IsActive: [true],
    });
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
    console.log("Id", this.Id);

    if (this.Id) {
      this.spinner = true;
      this.GetCostCodeDetailsbyId().then((resolve: apiResponse) => {
        if (resolve.Status) {
          this.init();
        }
      });
    } else {
      this.spinner = true;
      this.loadClientList();
    }
  }

  async GetCostCodeDetailsbyId() {
    const promise = new Promise((res, rej) => {
      this.clientservice
        .GetCostCodeDetailsbyId(this.Id)
        .subscribe((result: apiResponse) => {
          console.log("CCODE  DET ::", result);
          this.loadClientList();
          this.costCodeForm.patchValue(result.dynamicObject);
          // this.patchReactiveForWhenEdit();
          res(result);
        });
    });
    return promise;
  }

  async loadClientList() {
    try {
      await this.clientContactService
        .getUserMappedClientList(this.RoleId, this.UserId)
        .subscribe(
          (response: apiResponse) => {
            if (response.Status) {
              this.LstClient = response.dynamicObject;
              this.LstClient =
                this.LstClient.length > 0
                  ? this.LstClient.filter((a) => a.Id != 0)
                  : [];
              if (this.BusinessType != 3 && this.Id == 0) {
                let smeSelectedClient = JSON.parse(this.sessionService.getSessionStorage("SME_Client"));
                this.costCodeForm.controls['ClientId'].patchValue(smeSelectedClient.Id);
                let item = this.LstClient.filter((client) => client.Id == smeSelectedClient.Id)[0];
                console.log(item)
                this.onChangeClient(item);
              }
              this.spinner = false;
            } else {
              this.spinner = false;
            }
            console.log("CLT LST ::", this.LstClient);
          },
          (err) => { }
        );
    } catch (error) { }
  }

  init() {
    try {
      this.LoadCostCodeLookupDetailsByClientId().then(
        (resolve: apiResponse) => {
          if (resolve.Status) {
            let lookUpMaster = {
              ClientAddressDetailsList: [],
              ClientContactLocationList: [],
              ClientContractList: [],
              CompanyBranchList: [],
            };

            lookUpMaster = resolve.dynamicObject && resolve.dynamicObject;
            console.log("lookUpMaster", lookUpMaster);
            this.ClientAddressDetailsList =
              lookUpMaster.ClientAddressDetailsList;
            this.ClientContactLocationList =
              lookUpMaster.ClientContactLocationList;
            this.LstClientContract = lookUpMaster.ClientContractList;
            if (this.BusinessType != 3 && this.Id == 0) {
              let smeClientContract = JSON.parse(this.sessionService.getSessionStorage('sme_clientcontract'));
              this.costCodeForm.controls['ClientContractId'].patchValue(smeClientContract.Id);
            }
            this.CompanyBranchList = lookUpMaster.CompanyBranchList;
          }
        }
      );
    } catch (error) {
      console.log("#0002 LOOKUP EX::", error);
    }
  }
  onChangeClient(item) {
    console.log("Client Ev :", item);
    try {
      this.costCodeForm.patchValue({
        ClientId: item.Id,
        ClientContractId: null,
        BillingContactLocationMappingId: null,
        ShippingContactId: null,
        CompanyBranchId: null,
      });
      this.init();
    } catch (error) {
      console.log("#002 COUNTRY EX ::", error);
    }
  }

  LoadCostCodeLookupDetailsByClientId() {
    const promise = new Promise((res, rej) => {
      this.clientservice
        .LoadCostCodeLookupDetailsbyClientId(this.costCodeForm.value.ClientId)
        .subscribe((result: apiResponse) => {
          console.log("LOOKUP CCODE ::", result);
          res(result);
        });
    });
    return promise;
  }

  public isGuid(stringToTest) {
    if (stringToTest[0] === "{") {
      stringToTest = stringToTest.substring(1, stringToTest.length - 1);
    }
    var regexGuid =
      /^(\{){0,1}[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}(\}){0,1}$/gi;
    return regexGuid.test(stringToTest);
  }

  doSaveTeam() {
    this.submitted = true;
    console.log("invalid", this.costCodeForm.value);

    if (this.costCodeForm.invalid) {
      this.alertService.showWarning(
        "You must have filled out all the required fields and try to save"
      );
      return;
    }
    this.spinner = true;
    let invoiceFromAndToMapping = new InvoiceFromAndToMapping();

    invoiceFromAndToMapping.Id = this.isGuid(this.costCodeForm.value.Id)
      ? 0
      : this.costCodeForm.value.Id;
    invoiceFromAndToMapping.Code = this.costCodeForm.value.Code;
    invoiceFromAndToMapping.ClientContractId =
      this.costCodeForm.value.ClientContractId;
    invoiceFromAndToMapping.ClientId = this.costCodeForm.value.ClientId;
    invoiceFromAndToMapping.Description = this.costCodeForm.value.Description;
    invoiceFromAndToMapping.BillingContactLocationMappingId =
      this.costCodeForm.value.BillingContactLocationMappingId;
    invoiceFromAndToMapping.ShippingContactId =
      this.costCodeForm.value.ShippingContactId;
    invoiceFromAndToMapping.CompanyBranchId =
      this.costCodeForm.value.CompanyBranchId;
    invoiceFromAndToMapping.IsActive = this.costCodeForm.value.IsActive;
    invoiceFromAndToMapping.CompanyId = this.CompanyId;

    console.log("CCODES PYL ::", invoiceFromAndToMapping);

    this.clientservice
      .UpsertCostCodeDetails(JSON.stringify(invoiceFromAndToMapping))
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
  }
}
