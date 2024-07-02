import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UUID } from 'angular2-uuid';
import * as _ from 'lodash';
//SERVICE
import { ClientContractService } from "../../../../_services/service/clientContract.service";
import { SourceType } from 'src/app/_services/model/Candidates/CandidateOfferDetails';
import { enumHelper } from 'src/app/shared/directives/_enumhelper';
import { AlertService, SessionStorage } from 'src/app/_services/service';
import { MarkupMapping } from 'src/app/_services/model/Client/MarkupMapping';
import { ProcessCategory } from 'src/app/_services/model/Payroll/PayRun';
import * as moment from 'moment';
import { ClientContract } from 'src/app/_services/model/Client/ClientContract';
import { UIMode } from 'src/app/_services/model/Common/BaseModel';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';


@Component({
  selector: 'app-servicefee',
  templateUrl: './servicefee.component.html',
  styleUrls: ['./servicefee.component.scss']
})
export class ServicefeeComponent implements OnInit {
  @Input() coreObject: any;

  LstPayrollItems = [];
  markup_Slider = false;
  markupForm: FormGroup;
  submitted = false;
  beforeLoad = true;

  @Input() MarkupList = [];
  PayPeriodList = [];
  sourceTypes = [];
  LstMarkupItems = [];
  LstSalaryMarkup = [];
  LstFnFMarkup = [];
  LstReimbursmentMarkup = [];
  LstAdhocMarkup = [];
  LstOfAnyProcessCategory = [];
  Index: string = null;
  @Input() ClientDetails: ClientContract;
  pageOfItems: Array<any>;
  page = 1;
  pageSize = 4;
  collectionSize = 0;

  EFmaxDate: Date;
  EFminDate: Date;

  constructor(
    private formBuilder: FormBuilder,
    private clientContractService: ClientContractService,
    private utilsHelper: enumHelper,
    private alertService: AlertService,
    private loadingScreenService: LoadingScreenService,
    private sessionService: SessionStorage,



  ) {
    this.LstPayrollItems = [{ Id: 1, Name: "Salary Markup" }, { Id: 2, Name: "Full and Final Settlement Markup" }, { Id: 3, Name: "Reimbursement Markup" }, { Id: 4, Name: "Adhoc Payments Markup" }];
    this.createForm();
  }

  get g() { return this.markupForm.controls; } // reactive forms validation 

  createForm() {

    this.markupForm = this.formBuilder.group({
      Id: [UUID.UUID()],
      markupRule: [null, Validators.required],
      markupValue: [null, Validators.required],
      isServiceFee: [false, Validators.required],
      effectiveFrom: [null, Validators.required],
      sourceType: [null],
      startFrom: [null, Validators.required],
      status: [true],
      parentMarkupType: [null]

    });
  }

  ngOnInit() {
    this.sessionService.delSessionStorage("serviceFee_data");
    this.coreObject = JSON.parse(this.coreObject);
    console.log('core', this.coreObject);
    this.sourceTypes = this.utilsHelper.transform(SourceType) as any;

    if (this.coreObject.ClientDetails.ContractType > 1 && this.coreObject.ClientDetails.ValidFrom != null) {
      this.EFminDate = new Date();
      this.EFmaxDate = new Date();
      var mxdate = new Date(this.coreObject.ClientDetails.ValidTo);
      var mndate = new Date(this.coreObject.ClientDetails.ValidFrom);
      this.EFmaxDate.setDate(mxdate.getDate());
      this.EFmaxDate.setMonth(mxdate.getMonth());
      this.EFmaxDate.setFullYear(mxdate.getFullYear());

      this.EFminDate.setDate(mndate.getDate());
      this.EFminDate.setMonth(mndate.getMonth());
      this.EFminDate.setFullYear(mndate.getFullYear());
    }
    // this.getAllMarkuMappingList();
    // this.getMarkuMappingDetails();
    this.getPayPeriodList().then((res) => {
      if (res) {
        this.getMarkuMappingDetails();
      }
    }, (err) => {
      console.log(err);
    })
  }

  getPayPeriodList() {
    return new Promise((resolve, reject) => {
      try {
        this.clientContractService.getPayPerdiodList().subscribe((res) => {
          const dynamicObj = res.dynamicObject;
          if (dynamicObj && dynamicObj.length > 0) {
            this.PayPeriodList = dynamicObj;
            console.log('pay period list ', this.PayPeriodList);
            resolve(true);
          } else {
            reject();
          }
        }, (error) => {
          console.log(error);
        })
      } catch (error) {
        console.log(error);
      }
    })
  }

  save_Markup() {
    this.submitted = true;
    if (this.markupForm.invalid) {
      this.alertService.showWarning("Please file the required fields!");
      return;
    }
    this.submitted = false;
    // MarkupType: MarkupType;
    // ProcessCategory: ProcessCategory;
    // CompanyId: number;
    // ClientId: number;
    // ClientContractId: number;
    // TeamId: number;
    // EmployeeId: number;
    // EffectiveDate: Date | string;
    // EffectivePeriodId: number;
    // MarkupDetailsId: number;
    // MarkupParameter: string;
    // IsPeriodWiseCalculationRequired: boolean;
    // Status: number;
    // SourceType : SourceType 
    const Ids = this.markupForm.get('Id').value;
    console.log('id', Ids);

    var isExistItem = this.LstMarkupItems.find(b => b.Id === this.markupForm.get('Id').value);
    isExistItem != undefined && (_.remove(this.LstMarkupItems, function (e) {
      return e.Id == Ids;
    }));

    this.LstMarkupItems.push({
      Id: this.markupForm.get('Id').value,
      ProcessCategory: this.Index == "salary" ? ProcessCategory.Salary : this.Index == "fnf" ? ProcessCategory.Termination :
        this.Index == "adhoc" ? ProcessCategory.AdhocPayment : ProcessCategory.Expense,
      markupRule: this.markupForm.get('markupRule').value,
      parentMarkupType: this.MarkupList.find(x => x.Id == this.markupForm.get('markupRule').value).MarkupType,
      markupRuleName: this.MarkupList.find(item => item.Id === this.markupForm.get('markupRule').value).DisplayName,
      markupValue: this.markupForm.get('markupValue').value,
      isServiceFee: this.markupForm.get('isServiceFee').value,
      effectiveFrom: this.markupForm.get('effectiveFrom').value,
      sourceType: (this.markupForm.get('sourceType').value == null || this.markupForm.get('sourceType').value == undefined) ? 0 : this.markupForm.get('sourceType').value,
      startFrom: this.markupForm.get('startFrom').value,
      startFromName: this.PayPeriodList.find(a => a.Id == this.markupForm.get('startFrom').value).Name,
      status: this.markupForm.get('status').value,
    })
    this._PostBindingmarkupItems();
    this.markup_Slider = false;
    this.markupForm.reset();
    this.createForm();
  }
  _PostBindingmarkupItems() {
    this.beforeLoad = false;
    this.LstSalaryMarkup = [];
    this.LstFnFMarkup = [];
    this.LstReimbursmentMarkup = [];
    this.LstAdhocMarkup = [];

    this.LstSalaryMarkup = this.LstMarkupItems.filter(a => a.ProcessCategory == ProcessCategory.Salary);
    this.collectionSize = this.LstSalaryMarkup.length
    console.log('LstSalaryMarkup', this.LstSalaryMarkup);
    this.LstFnFMarkup = this.LstMarkupItems.filter(a => a.ProcessCategory == ProcessCategory.Termination);
    this.LstReimbursmentMarkup = this.LstMarkupItems.filter(a => a.ProcessCategory == ProcessCategory.Expense);
    this.LstAdhocMarkup = this.LstMarkupItems.filter(a => a.ProcessCategory == ProcessCategory.AdhocPayment);
    this.LstOfAnyProcessCategory = this.LstMarkupItems.filter(a => a.ProcessCategory == ProcessCategory.Any)


    if (this.LstMarkupItems.length != 0) {
      const _MarkupMapping = [];
      this.LstMarkupItems.forEach(element => {
        var markupMapping = new MarkupMapping();
        markupMapping.Id = this.isGuid(element.Id) == true ? 0 : element.Id;
        markupMapping.MarkupType = element.parentMarkupType; // MarkupType.FixedAmount;
        markupMapping.ProcessCategory = element.ProcessCategory;
        markupMapping.CompanyId = this.coreObject.CompanyId;
        markupMapping.ClientId = this.coreObject.ClientId;
        markupMapping.ClientContractId = this.coreObject.ContractId;
        markupMapping.TeamId = 0;
        markupMapping.EmployeeId = 0;
        markupMapping.EffectiveDate = moment(element.effectiveFrom).format('YYYY-MM-DD');
        markupMapping.EffectivePeriodId = element.startFrom;
        markupMapping.SourceType = element.sourceType;
        markupMapping.MarkupDetailsId = element.markupRule;
        markupMapping.MarkupParameter = element.markupValue;
        markupMapping.IsPeriodWiseCalculationRequired = element.isServiceFee;
        markupMapping.Status = element.status == true ? 1 : 0;
        markupMapping.ModeType = UIMode.Edit;
        _MarkupMapping.push(markupMapping);
      });
      this.sessionService.setSesstionStorage("serviceFee_data", JSON.stringify(_MarkupMapping));
      let i = JSON.parse((this.sessionService.getSessionStorage("serviceFee_data")));
      console.log('iii', JSON.parse(i))
    }

  }


  editMarkup(index, item) {
    this.Index = index;
    console.log('index', this.Index);
    this.markup_Slider = true;
    this.markupForm.patchValue(item);
  }
  addnewMarkup(index) {
    this.Index = index;
    this.markup_Slider = true;
  }

  close_markup_Slider() {
    this.markup_Slider = false;
  }

  // getAllMarkuMappingList() {
  //   this.clientContractService.get_AllMarkupMappingList()
  //     .subscribe((result) => {
  //       const apiResult: apiResult = result;
  //       if (apiResult.Status) {
  //         this.MarkupList = apiResult.Result as any;
  //       }
  //     })

  // }

  getMarkuMappingDetails() {
    this.beforeLoad = false;
    this.ClientDetails.LstMarkupMappingDetails.length > 0 && this.ClientDetails.LstMarkupMappingDetails.forEach(object => {
      this.LstMarkupItems.push({
        Id: object.Id,
        ProcessCategory: object.ProcessCategory,
        parentMarkupType: object.MarkupType,
        markupRule: object.MarkupDetailsId,
        markupRuleName: this.MarkupList.find(item => item.Id === object.MarkupDetailsId).DisplayName,
        markupValue: object.MarkupParameter,
        isServiceFee: object.IsPeriodWiseCalculationRequired,
        effectiveFrom: new Date(object.EffectiveDate),
        sourceType: object.SourceType,
        startFrom: object.EffectivePeriodId,
        startFromName: object.EffectivePeriodId != 0 ? this.PayPeriodList.find(a => a.Id == object.EffectivePeriodId).Name : '',
        status: object.Status
      })
    });
    this._PostBindingmarkupItems();
  }

  saveTEMP() {
    if (this.LstMarkupItems.length === 0) {
      // this.alertService.showWarning("No records were found that met your criteria.");
      return [];
    }
    // return new Promise((resolve, reject) => {
    // this.loadingScreenService.startLoading();
    const _MarkupMapping = [];
    this.LstMarkupItems.forEach(element => {
      var markupMapping = new MarkupMapping();
      markupMapping.Id = this.isGuid(element.Id) == true ? 0 : element.Id;
      markupMapping.MarkupType = element.parentMarkupType; // MarkupType.FixedAmount;
      markupMapping.ProcessCategory = element.ProcessCategory;
      markupMapping.CompanyId = this.coreObject.CompanyId;
      markupMapping.ClientId = this.ClientDetails.ClientId;
      markupMapping.ClientContractId = this.ClientDetails.Id;
      markupMapping.TeamId = 0;
      markupMapping.EmployeeId = 0;
      markupMapping.EffectiveDate = moment(element.effectiveFrom).format('YYYY-MM-DD');
      markupMapping.EffectivePeriodId = element.startFrom;
      markupMapping.SourceType = element.sourceType;
      markupMapping.MarkupDetailsId = element.markupRule;
      markupMapping.MarkupParameter = element.markupValue;
      markupMapping.IsPeriodWiseCalculationRequired = element.isServiceFee;
      markupMapping.Status = element.status == true ? 1 : 0;
      markupMapping.ModeType = UIMode.Edit;
      _MarkupMapping.push(markupMapping);
    });
    console.log('mapping', _MarkupMapping);
    return _MarkupMapping;
    // this.ClientDetails.Modetype = UIMode.Edit;
    // this.ClientDetails.LstMarkupMappingDetails = _MarkupMapping;
    // this.clientContractService.Put_UpsertClientContract(JSON.stringify(this.ClientDetails))
    //   .subscribe((result) => {
    //     const apiResult: apiResult = result;
    //     if (apiResult.Status) {
    //       this.loadingScreenService.stopLoading();
    //       this.alertService.showSuccess(apiResult.Message);
    //     } else { this.alertService.showWarning(apiResult.Message); this.loadingScreenService.stopLoading() }
    //   })
    // });
  }


  onChangePage(pageOfItems: Array<any>) {
    // update current page of items
    this.LstSalaryMarkup = pageOfItems;
  }
  onChangePageLstFnFMarkup(pageOfItems: Array<any>) {

  }
  onChangePageLstReimbursmentMarkup(pageOfItems: Array<any>) {

  }
  onChangePageLstAdhocMarkup(pageOfItems: Array<any>) {

  }

  public isGuid(stringToTest) {
    if (stringToTest[0] === "{") {
      stringToTest = stringToTest.substring(1, stringToTest.length - 1);
    }
    var regexGuid = /^(\{){0,1}[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}(\}){0,1}$/gi;
    return regexGuid.test(stringToTest);
  }
}
