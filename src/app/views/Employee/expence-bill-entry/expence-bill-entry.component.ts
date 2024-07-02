import { Component, OnInit } from '@angular/core';
import { SessionStorage } from '../../../_services/service//session-storage.service';
import { EmployeeService } from '../../../_services/service/employee.service';
import { EmployeeExemptionDetails } from "../../../_services/model/Employee/EmployeeExcemptions";
import { FormGroup, FormBuilder, FormControl, Validators, AbstractControl } from '@angular/forms';
import { ObjectStorageDetails } from 'src/app/_services/model/Candidates/ObjectStorageDetails';
import { FileUploadService } from 'src/app/_services/service/fileUpload.service';
import { apiResult } from 'src/app/_services/model/apiResult';
import { AlertService } from 'src/app/_services/service/alert.service';
import { apiResponse } from 'src/app/_services/model/apiResponse';
import * as _ from 'lodash';
import { environment } from "../../../../environments/environment";
import { TaxCodeType } from 'src/app/_services/model/Employee/TaxCodeType';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import Swal from "sweetalert2";
import { ApiResponse, UIMode } from 'src/app/_services/model/Common/BaseModel';
import { Title } from '@angular/platform-browser';
import { EmployeeModel, EmployeeModel1 } from 'src/app/_services/model/Employee/EmployeeModel';
import { EmployeeTaxExemptionDetails } from "../../../_services/model/Employee/EmployeeTaxExcemptions";
import { EmployeeExemptionBillDetails } from "../../../_services/model/Employee/EmployeeExcemptionsBillDetails";
import { LoadingScreenService } from '../../../shared/components/loading-screen/loading-screen.service';

import { EmployeeDetails, EmployeeInvestmentMaster, EmployeeStatus } from 'src/app/_services/model/Employee/EmployeeDetails';
import { ApprovalStatus } from 'src/app/_services/model/Candidates/CandidateDocuments';
import { RowDataService } from '../../personalised-display/row-data.service';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { LoginResponses } from 'src/app/_services/model';
@Component({
  selector: 'app-expence-bill-entry',
  templateUrl: './expence-bill-entry.component.html',
  styleUrls: ['./expence-bill-entry.component.css']
})
export class ExpenceBillEntryComponent implements OnInit {
  isLoading: boolean = true;

  visible: any;
  productDetails: any;
  
  empDetails: EmployeeDetails;
  _Designation: any;
  FicalYearList: any
  expenseBillEntryForm: FormGroup;
  LstmultipleDocs = []
  unsavedDocumentLst: []
  BillMaxDate: any
  lstlookUpDetails: any
  LstInvestmentSubmissionSlot: any
  collection: any
  TaxationCategory: any
  TaxationOtherCategory_Exemption: any
  prodId: any
  prodDetails: any;
  FileName: any
  DocumentId: any
  billRequestList = [];
  popupId: any;
  firstTimeDocumentId: any;
  isEnabled: any = '1'
  approvedBills = []
  rejectedBills = []
  pendingBills = []
  pendingSavedBill = [];
  gridViewColumnList = []
  gridView: boolean = false
  AddColumnList = []
  submitted = false;
  editObjIndex: any;
  LstExpenseBillRequests: any[] = [];
  employeeModel: EmployeeModel1 = new EmployeeModel1();
  spinner: boolean = true;
  Employee: any;
  EmployeeId: any;
  resData: any;
  TaxDeclaration: any;
  FinId: any;
  mode: boolean = false;
  isESSLogin: boolean = false;
  routedata: any;
  spinnerText: string = "Uploading";

  searchText_unclaimed_submiited: any = null;

  selectAll: boolean = false;
  firstPreLoadDocumentId: any;
  editableObj : any;
  // submit() {
  //   this.expenseBillEntryForm.reset();
  // }
  _loginSessionDetails: LoginResponses;
  BusinessType : number;

  constructor(
    public sessionService: SessionStorage,
    public employeeService: EmployeeService,
    private formBuilder: FormBuilder,
    public fileuploadService: FileUploadService,
    private alertService: AlertService,
    private route: ActivatedRoute,
    private titleService: Title,
    private router: Router,
    private loadingScreenService: LoadingScreenService,
    private rowDataService: RowDataService,

  ) {
    this.createForm();
  }
  get g() { return this.expenseBillEntryForm.controls; } // reactive forms validation 
  createForm() {
    this.expenseBillEntryForm = this.formBuilder.group({
      Id: [0],
      EmployeeId: [null],
      FinancialYearId: [null],
      ProductId: [null],
      RequestedAmount: [null],
      ApprovedAmount: [null],
      Remarks: [null],
      ApproverRemarks: [null],
      IsProposed: [null],
      Status: [null],
      DocumentId: [null],
      Modetype: [''],
      billno: [null, Validators.required],
      billDate: ['', Validators.required],
      amount: [null, Validators.required],
      upload: [null],
      EmployeeTaxExemptionId: [0],
      // ApprovalStatus : [0]



    });
  }
  ngOnInit() {
    this.editableObj = null;

    this.titleService.setTitle('My Bills');
    this.gridViewColumnList = [
      {
        columnId: 1,
        displayName: "Bill Number",
        controlName: "billNo",
        columnType: "text",
        value: 0
      },
      {
        columnId: 2,
        displayName: "Bill Date",
        controlName: "billDate",
        columnType: "text",
        value: "",
      },
      {
        columnId: 3,
        displayName: "Bill Amount",
        controlName: "amount",
        columnType: "text"
      },
      {
        columnId: 4,
        displayName: "Remarks",
        controlName: "InputRemarks",
        columnType: "text",
        value: ""
      },
      {
        columnId: 5,
        displayName: "File Upload(Max file size 2MB)",
        controlName: "upload",
        columnType: "file",
        value: ""
      }


    ]


    this.onRefresh();


  }

  onRefresh() {
    this._loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses));
    this.BusinessType = this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping != null ? this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this._loginSessionDetails.Company.Id).BusinessType : 0;
    this.selectAll = false;
    this.pendingSavedBill = [];
    this.approvedBills = [];
    this.rejectedBills = [];
    this.pendingBills = [];
    this.searchText_unclaimed_submiited = null;
    this.LstExpenseBillRequests = [];
    this.spinner = true;
    var i = sessionStorage.getItem('IsBillEntryEss');
    this.isESSLogin = i as any;
    this.TaxDeclaration = sessionStorage.getItem("TaxDeclarationMode") as any;
    this.mode = this.TaxDeclaration == '1' ? false : true;

    // alert(i);
    console.log('i', i);
    this.route.queryParams.subscribe(params => {
      if (JSON.stringify(params) != JSON.stringify({})) {

        var encodedIdx = atob(params["Idx"]);
        var encodedFdx = atob(params["Fdx"]);
        var encodedEdx = atob(params["Edx"]);
        // var encodedIsEdx = atob(params["IsE"]);
        // alert(encodedEdx);
        this.prodId = Number(encodedIdx) == undefined ? 0 : Number(encodedIdx);
        this.FinId = Number(encodedFdx) == undefined ? 0 : Number(encodedFdx);
        this.EmployeeId = Number(encodedEdx) == undefined ? 0 : Number(encodedEdx);
        //  this.isESSLogin = (encodedIsEdx) as any;
        // console.log('isESSLogin', this.isESSLogin);
      }
    });
    var j = sessionStorage.getItem("RowDataInterface")
    console.log(JSON.parse(j));
    this.routedata = JSON.parse(j);

    this.rowDataService.dataInterface.RowData = null;
    this.rowDataService.dataInterface.SearchElementValuesList = [];

    this.rowDataService.dataInterface = {
      SearchElementValuesList: [],
      RowData: null
    };



    // this.TaxDeclaration = this.sessionService.getSessionStorage('TaxDeclaration');
    // this.mode = this.TaxDeclaration == 1 ? false : true;
    // this.prodId = parseInt(this.route.snapshot.queryParamMap.get('id'));
    console.log("Product Id ::", this.prodId);
    //  let id = parseInt(sessionStorage.getItem('loginUserId'));
    this.BillMaxDate = new Date();
    this._loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses));
    console.log("_loginSessionDetails", this._loginSessionDetails)
    // this.EmployeeId = this._loginSessionDetails.EmployeeId
    this.employeeService.getEmployeeDetailsById(this.EmployeeId).subscribe((result) => {
      let apiResult: apiResult = (result);
      if (apiResult.Status && apiResult.Result != null) {
        this.empDetails = result.Result;

        this.employeeService.get_LoadEmployeeUILookUpDetails(this.EmployeeId)
          .subscribe((result) => {
            let apiResponse: apiResponse = result;
            if (apiResponse.Status) {
              this.lstlookUpDetails = JSON.parse(apiResponse.dynamicObject) as any;
              this.LstInvestmentSubmissionSlot = this.lstlookUpDetails.InvestmentSubmissionSlotList != null && this.lstlookUpDetails.InvestmentSubmissionSlotList.length > 0 ?
                this.lstlookUpDetails.InvestmentSubmissionSlotList : [];
              console.log('SUBMISSION SLOT ::', this.LstInvestmentSubmissionSlot);
              this.trigger_investmentproducts_binding();

              // res(true);
            }

          }, err => {
            // rej();
          })
        // let productid = parseInt(this.route.snapshot.queryParamMap.get('id'));
        this.employeeService.
          GetEmployeeExemptionBillDetails(this.EmployeeId)
          .subscribe((result) => {
            let apiR: apiResult = result;
            console.log('GET BILL ENTRY ::', apiR.Result);

            if (apiR.Status && apiR.Result != null) {
              this.billRequestList = result.Result;
              this.billRequestList = this.billRequestList != null && this.billRequestList.length > 0 && this.billRequestList.filter(z=>z.FinancialYearId = this.FinId);
              this.rejectedBills = _.filter(this.billRequestList, (item) => { return item.ApprovalStatus == 1 && item.Status == 2 && item.ProductId == this.prodId; });
              this.approvedBills = _.filter(this.billRequestList, (item) => { return item.ApprovalStatus == 1 && item.Status == 1 && item.ProductId == this.prodId; });
              this.pendingBills = _.filter(this.billRequestList, (item) => { return item.ApprovalStatus == 1 && item.Status == 0 && item.EmployeeTaxExemptionId > 0 && item.ProductId == this.prodId; });
              this.pendingSavedBill = _.filter(this.billRequestList, (item) => { return item.ApprovalStatus == 1 && item.Status == 0 && item.EmployeeTaxExemptionId == 0 && item.ProductId == this.prodId; });
            }
            else {

            }
          }, err => {

          });
        this.addNewColumn("true", 0)

        this.spinner = false;
      } else {

        if (this.isESSLogin == true) {
          this.router.navigate(['app/investment/myinvestment']);
        }
        else {

          this.router.navigate(['app/listing/ui/employeeInvestment']);
        }
      }
    });

    if (this.mode) {
      this.updateValidation(true, this.expenseBillEntryForm.get('DocumentId'));
    }
  }

  updateValidation(value, control: AbstractControl) {


    if (value) {
      control.setValidators([Validators.required]);
    } else {
      control.clearValidators();
      control.setErrors(null);
    }
    control.updateValueAndValidity();
  }

  trigger_investmentproducts_binding() {
    console.log('LOOK UP DETAILS EMP :', this.lstlookUpDetails);

    //this.DocumentTypeList = this.lstlookUpDetails.DocumentTypeList;
    this.collection = this.lstlookUpDetails.InvesmentProductList;
    this.FicalYearList = this.lstlookUpDetails.FicalYearList;

    this.TaxationCategory = [];
    this.TaxationCategory = environment.environment.HousePropertyDetails_Static;
    this.collection = [...this.TaxationCategory, ...this.collection];
    let hra = [];
    hra = _.filter(this.collection, item => item.ProductId == environment.environment.HRA_DynamicProductId);
    this.TaxationCategory = [...this.TaxationCategory, ...hra];
    const collections = _.filter(this.lstlookUpDetails.InvesmentProductList, function (post) {
      return _.some(post.b, { TaxCodeTypeId: TaxCodeType.Investment });
    });
    this.TaxationOtherCategory_Exemption = _.filter(this.lstlookUpDetails.InvesmentProductList, function (post) {
      return _.some(post.b, { TaxCodeTypeId: TaxCodeType.Exemptions });
    });
    this.prodDetails = this.TaxationOtherCategory_Exemption.find(val => val.ProductId === this.prodId);
    this.titleService.setTitle(this.prodDetails.ProductName);

  }

  getLetterSpace(string) {
    return string.replace(/([a-z])([A-Z])/g, '$1 $2')
  }
  openDrawerAddExpense(item, index, tabactivity) {
    this.open(item, index, tabactivity)

  }
  onChangeExpenseDate() {

  }
  open(item, index, tabactivity) {
    if (this.mode) {
      this.updateValidation(true, this.expenseBillEntryForm.get('DocumentId'));
    }
    else {
      this.updateValidation(false, this.expenseBillEntryForm.get('DocumentId'));

    }
    this.expenseBillEntryForm.reset();
    this.FileName = null;
    this.DocumentId = 0;
    this.firstPreLoadDocumentId = 0;
    this.editObjIndex = index
    this.visible = true;
    if (item != null) {
      this.editableObj = item;
      this.FileName = item.FileName;
      this.DocumentId = item.BillId; 
      this.firstPreLoadDocumentId = item.BillId;
      this.expenseBillEntryForm.patchValue({
        Id: item.Id,
        EmployeeId: item.EmployeeId,
        FinancialYearId: item.FinancialYearId,
        ProductId: item.ProductId,
        amount: item.BillAmount,
        Remarks: item.Remarks,
        ApproverRemarks: item.ApproverRemarks,
        IsProposed: item.IsProposed,
        ApprovedAmount: item.ApprovedAmount,
        Status: item.Status,
        DocumentId: item.BillId,
        billno: item.BillNumber,
        billDate: new Date(item.BillDate),
        RejectedRemarks: item.RejectedRemarks,
        Modetype: UIMode.Edit,
        upload: item.upload,
        EmployeeTaxExemptionId: item.EmployeeTaxExemptionId
      });
    }
    //this.productDetails = item;
    //this.productDetails.category = which;
    //console.log("this.productDetails", this.productDetails)
  }
  cancel() {
    console.log('this.expenseBillEntryForm', this.expenseBillEntryForm.value);

    this.expenseBillEntryForm.reset(this.expenseBillEntryForm.value);
    this.visible = false;
  }
  async save(isNewBillRequired) {


    this.submitted = true;
    if (this.expenseBillEntryForm.invalid) {
      this.alertService.showWarning("Please complete all required fields!");
      return;
    }

    if (this.mode) {
      if (this.expenseBillEntryForm.get('DocumentId').value == null || this.expenseBillEntryForm.get('DocumentId').value == 0 || this.expenseBillEntryForm.get('DocumentId').value == undefined || this.DocumentId == 0 || this.DocumentId == null || this.DocumentId == undefined) {
        this.alertService.showWarning("Please upload at least one attachment");
        return;
      }
    }

    this.loadingScreenService.startLoading();
    this.spinner = true;
    let billRequest = new EmployeeExemptionDetails();
    billRequest.Id = this.expenseBillEntryForm.get('Id').value ? this.expenseBillEntryForm.get('Id').value : 0;
    billRequest.EmployeeId = this.EmployeeId;
    billRequest.FinancialYearId = this.FinId;
    billRequest.ProductId = this.prodId
    billRequest.BillAmount = this.expenseBillEntryForm.get('amount').value;
    billRequest.Remarks = this.expenseBillEntryForm.get('Remarks').value;
    billRequest.ApproverRemarks = null
    billRequest.IsProposed = this.DocumentId > 0 ?  false : (this.mode == true ? false : true); // 
    billRequest.ApprovedAmount = 0;
    billRequest.Status = ApprovalStatus.Pending;
    billRequest.ApprovalStatus = 1;
    billRequest.BillId = this.DocumentId
    billRequest.BillNumber = this.expenseBillEntryForm.get('billno').value;
    billRequest.FileName = this.FileName
    billRequest.BillDate = this.expenseBillEntryForm.get('billDate').value;
    billRequest.RejectedRemarks = '';
    billRequest.Modetype = UIMode.Edit;
    billRequest.EmployeeTaxExemptionId = this.expenseBillEntryForm.get('EmployeeTaxExemptionId').value == null ? 0 : this.expenseBillEntryForm.get('EmployeeTaxExemptionId').value;

    console.log("billRequest", billRequest);

    if (this.editObjIndex) {
      await this.employeeService.insertEmployeeExemptionBillDetails(billRequest).subscribe((result) => {
        let data = result.Result;
        if (billRequest.EmployeeTaxExemptionId > 0 && billRequest.EmployeeTaxExemptionId != null) {
          this.employeeModel.oldobj = Object.assign({}, this.empDetails);
          this.employeeModel.newobj = this.empDetails;
          let totalAmount = 0;
          let taxExemptionParentId = 0;
          let existingObject = null;
          var _empTaxExceptionDet = [];
          if (this.empDetails != null && this.empDetails.LstEmployeeTaxExemptionDetails != null && this.empDetails.LstEmployeeTaxExemptionDetails.length > 0) {
            if (this.empDetails.LstEmployeeTaxExemptionDetails.find(x => x.FinancialYearId == this.FinId && x.ProductId == this.prodId) != undefined) {
              taxExemptionParentId = this.empDetails.LstEmployeeTaxExemptionDetails.find(x => x.FinancialYearId == this.FinId && x.ProductId == this.prodId).Id;
              existingObject = this.empDetails.LstEmployeeTaxExemptionDetails.find(x => x.FinancialYearId == this.FinId && x.ProductId == this.prodId);
            }
          }

          console.log('existingObject', existingObject);

          if (existingObject.LstEmployeeExemptionBillDetails != null && existingObject.LstEmployeeExemptionBillDetails.length > 0) {
            for (let j = 0; j < existingObject.LstEmployeeExemptionBillDetails.length; j++) {
              const element = existingObject.LstEmployeeExemptionBillDetails[j];
              if (billRequest.Id == element.Id) {
                existingObject.LstEmployeeExemptionBillDetails[j] = billRequest;
              }
            }

            var isex = existingObject.LstEmployeeExemptionBillDetails.find(x => x.Id == billRequest.Id)
            if (isex != undefined) {

              isex = billRequest;
              isex.BillNumber = billRequest.BillNumber;
              isex.BillId = billRequest.BillId;
              isex.BillDate = billRequest.BillDate;
              isex.BillAmount = billRequest.BillAmount;
              isex.FileName = billRequest.FileName;
              isex.Modetype = UIMode.Edit;
              isex.IsProposed = (billRequest.BillId > 0 || billRequest.BillId != null) ? false : true;
              console.log('ises', isex);

            }

            existingObject.LstEmployeeExemptionBillDetails.forEach(element => {
              if (element.ApprovalStatus == 1) { totalAmount = Number(totalAmount) + Number(element.BillAmount) }
              //  }else {
              //    alert(element);
              //    element = billRequest;
              //   element.BillNumber = billRequest.BillNumber;
              //   element.BillId = billRequest.BillId;
              //   element.BillDate = billRequest.BillDate;
              //   element.BillAmount = billRequest.BillAmount;
              //   element.FileName = billRequest.FileName;
              //   element.Modetype = UIMode.Edit;


              //  }

            });
          }

          if(billRequest.BillId > 0 && existingObject.IsProposed == true){
           let overrideParentId =  existingObject.LstEmployeeExemptionBillDetails.find(a=>a.Id == billRequest.Id);
           if(overrideParentId){
            overrideParentId.EmployeeTaxExemptionId = 0;
            overrideParentId.Modetype = UIMode.Edit;
            this.employeeService.insertEmployeeExemptionBillDetails(overrideParentId).subscribe((result) => {

            });
           }
          }

          var ii = [];
          ii = existingObject.LstEmployeeExemptionBillDetails.filter(a => a.ApprovalStatus == 1 && a.Id != billRequest.Id)
          var empTaxExceptionObj = new EmployeeTaxExemptionDetails();
          empTaxExceptionObj.Id = taxExemptionParentId;
          empTaxExceptionObj.Modetype = UIMode.Edit;
          empTaxExceptionObj.EmployeeId = this.EmployeeId;
          empTaxExceptionObj.FinancialYearId = this.FinId;
          empTaxExceptionObj.Status = 1;
          empTaxExceptionObj.ApprovedAmount = existingObject == null ? 0 : existingObject.ApprovedAmount;
          empTaxExceptionObj.ProductId = existingObject.ProductId;
          empTaxExceptionObj.Amount = Number(totalAmount) - Number(billRequest.BillAmount);
          empTaxExceptionObj.DocumentId = 0;
          empTaxExceptionObj.IsProposed = existingObject.IsProposed;
          empTaxExceptionObj.LstEmployeeExemptionBillDetails = ii.length > 0 ? ii : [];
          _empTaxExceptionDet.push(empTaxExceptionObj);

          this.employeeModel.newobj.Modetype = UIMode.Edit;
          this.employeeModel.newobj.LstEmployeeTaxExemptionDetails = _empTaxExceptionDet;
          console.log("BILL ENTRY EMPLOYEE JSON :: ", this.employeeModel)
          var Employee_request_param = JSON.stringify(this.employeeModel);
          this.employeeService.putEmployeeDetails(Employee_request_param).subscribe((data: any) => {
            let apiR: apiResponse = data;
            if (apiR.Status && apiR.dynamicObject != null) {
              this.spinner = false;
              this.alertService.showSuccess(apiR.Message);
              // this.onRefresh();
            } else {
              // this.onRefresh();
              this.spinner = false;
              this.alertService.showWarning(apiR.Message);
            }

          });
          this.alertService.showSuccess("Record saved successfully.");
          this.employeeService.GetEmployeeExemptionBillDetails(this.EmployeeId).subscribe((result) => {
            this.billRequestList = result.Result;
            this.billRequestList = this.billRequestList != null && this.billRequestList.length > 0 && this.billRequestList.filter(z=>z.FinancialYearId = this.FinId);
            this.rejectedBills = _.filter(this.billRequestList, (item) => { return item.ApprovalStatus == 1 && item.Status == 2 && item.ProductId == this.prodId; });
            this.approvedBills = _.filter(this.billRequestList, (item) => { return item.ApprovalStatus == 1 && item.Status == 1 && item.ProductId == this.prodId; });
            this.pendingBills = _.filter(this.billRequestList, (item) => { return item.ApprovalStatus == 1 && item.Status == 0 && item.EmployeeTaxExemptionId > 0 && item.ProductId == this.prodId; });
            this.pendingSavedBill = _.filter(this.billRequestList, (item) => { return item.ApprovalStatus == 1 && item.Status == 0 && item.EmployeeTaxExemptionId == 0 && item.ProductId == this.prodId; });
            this.pendingSavedBill.length > 0 && this.pendingSavedBill.forEach(element => {
              element["isSelected"] = false;
            });
            this.spinner = false;
          });
        }
        // this.alertService.showSuccess("Record saved successfully.");
        this.loadingScreenService.stopLoading();
      });
    }
    else {
      await this.employeeService.insertEmployeeExemptionBillDetails(billRequest).subscribe((result) => {
        let data = result.Result;
        if (billRequest.EmployeeTaxExemptionId > 0 && billRequest.EmployeeTaxExemptionId != null) {
          this.employeeModel.oldobj = Object.assign({}, this.empDetails);
          this.employeeModel.newobj = this.empDetails;
          let totalAmount = 0;
          let taxExemptionParentId = 0;
          let existingObject = null;
          var _empTaxExceptionDet = [];
          if (this.empDetails != null && this.empDetails.LstEmployeeTaxExemptionDetails != null && this.empDetails.LstEmployeeTaxExemptionDetails.length > 0) {
            if (this.empDetails.LstEmployeeTaxExemptionDetails.find(x => x.FinancialYearId == this.FinId && x.ProductId == this.prodId) != undefined) {
              taxExemptionParentId = this.empDetails.LstEmployeeTaxExemptionDetails.find(x => x.FinancialYearId == this.FinId && x.ProductId == this.prodId).Id;
              existingObject = this.empDetails.LstEmployeeTaxExemptionDetails.find(x => x.FinancialYearId == this.FinId && x.ProductId == this.prodId);
            }

          }
          console.log('existingObject', existingObject);

          if (existingObject.LstEmployeeExemptionBillDetails != null && existingObject.LstEmployeeExemptionBillDetails.length > 0) {
            for (let j = 0; j < existingObject.LstEmployeeExemptionBillDetails.length; j++) {
              const element = existingObject.LstEmployeeExemptionBillDetails[j];
              if (billRequest.Id == element.Id) {
                existingObject.LstEmployeeExemptionBillDetails[j] = billRequest;
              }
            }

            var isex = existingObject.LstEmployeeExemptionBillDetails.find(x => x.Id == billRequest.Id)
            if (isex != undefined) {

              isex = billRequest;
              isex.BillNumber = billRequest.BillNumber;
              isex.BillId = billRequest.BillId;
              isex.BillDate = billRequest.BillDate;
              isex.BillAmount = billRequest.BillAmount;
              isex.FileName = billRequest.FileName;
              isex.Modetype = UIMode.Edit;

              console.log('ises', isex);

            }

            existingObject.LstEmployeeExemptionBillDetails.forEach(element => {
              // if(billRequest.Id != element.Id){
              if (element.ApprovalStatus == 1) {
                totalAmount = Number(totalAmount) + Number(element.BillAmount);

              }
              //  }else {
              //    alert(element);
              //    element = billRequest;
              //   element.BillNumber = billRequest.BillNumber;
              //   element.BillId = billRequest.BillId;
              //   element.BillDate = billRequest.BillDate;
              //   element.BillAmount = billRequest.BillAmount;
              //   element.FileName = billRequest.FileName;
              //   element.Modetype = UIMode.Edit;


              //  }

            });
          }

          if(billRequest.BillId > 0 && existingObject.IsProposed == true){
            let overrideParentId =  existingObject.LstEmployeeExemptionBillDetails.find(a=>a.Id == billRequest.Id);
            if(overrideParentId){
             overrideParentId.EmployeeTaxExemptionId = 0;
             overrideParentId.Modetype = UIMode.Edit;
             this.employeeService.insertEmployeeExemptionBillDetails(overrideParentId).subscribe((result) => {

             });
            }
           }

          var ii = [];
          ii = existingObject.LstEmployeeExemptionBillDetails.filter(a => a.ApprovalStatus == 1 && a.Id != billRequest.Id)
          var empTaxExceptionObj = new EmployeeTaxExemptionDetails();
          empTaxExceptionObj.Id = taxExemptionParentId;
          empTaxExceptionObj.Modetype = UIMode.Edit;
          empTaxExceptionObj.EmployeeId = this.EmployeeId;
          empTaxExceptionObj.FinancialYearId = this.FinId;
          empTaxExceptionObj.Status = 1;
          empTaxExceptionObj.ApprovedAmount = existingObject == null ? 0 : existingObject.ApprovedAmount;
          empTaxExceptionObj.ProductId = existingObject.ProductId;
          empTaxExceptionObj.Amount = Number(totalAmount) - Number(billRequest.BillAmount);
          empTaxExceptionObj.DocumentId = 0;
          empTaxExceptionObj.IsProposed = existingObject.IsProposed;
          empTaxExceptionObj.LstEmployeeExemptionBillDetails = ii.length > 0 ? ii : [];
          _empTaxExceptionDet.push(empTaxExceptionObj);

          this.employeeModel.newobj.Modetype = UIMode.Edit;
          this.employeeModel.newobj.LstEmployeeTaxExemptionDetails = _empTaxExceptionDet;
          console.log("BILL ENTRY EMPLOYEE JSON :: ", this.employeeModel)
          var Employee_request_param = JSON.stringify(this.employeeModel);
          this.employeeService.putEmployeeDetails(Employee_request_param).subscribe((data: any) => {
            let apiR: apiResponse = data;
            if (apiR.Status && apiR.dynamicObject != null) {
              this.spinner = false;
              this.alertService.showSuccess(apiR.Message);
              this.onRefresh();
            } else {
              this.onRefresh();
              this.spinner = false;
              this.alertService.showWarning(apiR.Message);
            }

          });

        }

        this.alertService.showSuccess("Record saved successfully.");
        this.employeeService.GetEmployeeExemptionBillDetails(this.EmployeeId).subscribe((result) => {
          this.billRequestList = result.Result;
          this.billRequestList = this.billRequestList != null && this.billRequestList.length > 0 && this.billRequestList.filter(z=>z.FinancialYearId = this.FinId);
          this.rejectedBills = _.filter(this.billRequestList, (item) => { return item.ApprovalStatus == 1 && item.Status == 2 && item.ProductId == this.prodId; });
          this.approvedBills = _.filter(this.billRequestList, (item) => { return item.ApprovalStatus == 1 && item.Status == 1 && item.ProductId == this.prodId; });
          this.pendingBills = _.filter(this.billRequestList, (item) => { return item.ApprovalStatus == 1 && item.Status == 0 && item.EmployeeTaxExemptionId > 0 && item.ProductId == this.prodId; });
          this.pendingSavedBill = _.filter(this.billRequestList, (item) => { return item.ApprovalStatus == 1 && item.Status == 0 && item.EmployeeTaxExemptionId == 0 && item.ProductId == this.prodId; });
          this.pendingSavedBill.length > 0 && this.pendingSavedBill.forEach(element => {
            element["isSelected"] = false;
          });
          this.spinner = false;
        });
      });

    }




    this.expenseBillEntryForm.reset();
    this.loadingScreenService.stopLoading();
    this.FileName = null;
    if (isNewBillRequired == "false") {
      this.visible = false;
    }
  }
  changeLayout(layoutType) {
    if (layoutType == "cloumnLayout") {
      this.visible = true;
      this.gridView = false;
    }
    else {
      this.visible = false;
      this.gridView = true;
    }
  }
  cancelGridLayout() {
    var result3 = [];
    console.log('ss', this.firstPreLoadDocumentId);
    console.log('LstmultipleDocs', this.DocumentId);
    
    if (this.mode == true && this.editableObj != null && this.firstPreLoadDocumentId != null && this.firstPreLoadDocumentId != 0 && this.DocumentId != null && this.DocumentId != 0) {
      if (this.firstPreLoadDocumentId != this.DocumentId) {
        this.alertService.showWarning("On this page, you have unsaved changes. Kindly ensure to save your edits.");
        return;
      }
    }
   
    if (this.mode == true && this.editableObj != null && this.firstPreLoadDocumentId !=  this.DocumentId ) {
      this.alertService.showWarning("On this page, you have unsaved changes. Kindly ensure to save your edits.");
      return;
    }

    if(this.mode == true && this.editableObj != null && (this.DocumentId == null || this.DocumentId == 0)){
      this.alertService.showWarning("At least one attachment must be included.");
      return;
    }

    this.AddColumnList = [];
    this.visible = false;
    this.gridView = false;
    this.addNewColumn("true", 0)
    this.FileName = null
  }
  clearGrid() {
    this.AddColumnList = [];
    this.addNewColumn("true", 0)
    this.FileName = null
  }

  addNewColumn(defaultKey, index) {
    let billRequest = new EmployeeExemptionDetails();
    let empId: any

    // if (this.empDetails && this.empDetails.ELCTransactions && this.empDetails.ELCTransactions[1].EmployeeId) {
    //   empId = this.empDetails.ELCTransactions[1].EmployeeId
    // }

    if (this.AddColumnList && this.AddColumnList.length > 0 && this.AddColumnList[index].BillDate && this.AddColumnList[index].BillNumber && this.AddColumnList[index].BillAmount) {
      this.AddColumnList[index].Id = 0,
        this.AddColumnList[index].EmployeeId = this.EmployeeId,
        this.AddColumnList[index].FinancialYearId = this.FinId;
      this.AddColumnList[index].ProductId = this.prodId
      this.AddColumnList[index].BillAmount = this.AddColumnList[index].BillAmount ? this.AddColumnList[index].BillAmount : null;
      this.AddColumnList[index].Remarks = this.AddColumnList[index].Remarks ? this.AddColumnList[index].Remarks : null;
      this.AddColumnList[index].ApproverRemarks = null
      this.AddColumnList[index].IsProposed = this.DocumentId > 0 ?  false : (this.mode == true ? false : true);
      this.AddColumnList[index].ApprovedAmount = null
      this.AddColumnList[index].Status = ApprovalStatus.Pending;
      this.AddColumnList[index].BillId = this.DocumentId ? this.DocumentId : null
      this.AddColumnList[index].BillNumber = this.AddColumnList[index].BillNumber ? this.AddColumnList[index].BillNumber : null;
      this.AddColumnList[index].BillName = this.FileName ? this.FileName : null
      this.AddColumnList[index].BillDate = this.AddColumnList[index].BillDate ? this.AddColumnList[index].BillDate : null;
      this.AddColumnList[index].RejectedRemarks = null
      this.AddColumnList[index].FileName = this.FileName
      this.AddColumnList[index].Modetype = UIMode.Edit
      //this.LstmultipleDocs = []
      if (defaultKey === "new")
        billRequest.Id = 0,
          billRequest.EmployeeId = this.EmployeeId,
          billRequest.FinancialYearId = this.FinId;
      billRequest.ProductId = this.prodId
      billRequest.BillAmount = null;
      billRequest.Remarks = null;
      billRequest.ApproverRemarks = null
      billRequest.IsProposed = this.DocumentId > 0 ?  false : (this.mode == true ? false : true);
      billRequest.ApprovedAmount = null
      billRequest.Status = 0;
      billRequest.BillId = this.DocumentId
      billRequest.BillNumber = null;
      billRequest.BillDate = null;
      billRequest.RejectedRemarks = null
      billRequest.Modetype = UIMode.Edit
      billRequest.FileName = null
      this.AddColumnList.push(billRequest)
    }
    else if (defaultKey === "true") {
      billRequest.Id = 0,
        billRequest.EmployeeId = this.EmployeeId,
        billRequest.FinancialYearId = this.FinId;
      billRequest.ProductId = this.prodId
      billRequest.BillAmount = null;
      billRequest.Remarks = null;
      billRequest.ApproverRemarks = null
      billRequest.IsProposed = this.DocumentId > 0 ?  false : (this.mode == true ? false : true);
      billRequest.ApprovedAmount = null
      billRequest.Status = 0
      billRequest.BillId = this.DocumentId
      billRequest.BillNumber = null;
      billRequest.BillDate = null;
      billRequest.RejectedRemarks = null
      billRequest.Modetype = UIMode.Edit
      billRequest.FileName = null
      // this.DocumentId = null
      this.AddColumnList.push(billRequest)

    }
    else {
      this.alertService.showWarning("please fill the mandatory fields");
    }
  }
  async saveGrid() {
    this.addNewColumn("false", 0)
    this.AddColumnList = _.sortBy(this.AddColumnList, 'DocumentId');
    this.spinner = true;
    for (let obj in this.AddColumnList) {

      if (this.AddColumnList[obj].BillAmount && this.AddColumnList[obj].BillDate && this.AddColumnList[obj].BillNumber) {
        await this.employeeService.insertEmployeeExemptionBillDetails(this.AddColumnList[obj]).subscribe((result) => {
          let data = result.Result;

        });
        //this.billRequestList.push(this.AddColumnList[obj])
      }
    }
    this.employeeService.GetEmployeeExemptionBillDetails(this.EmployeeId).subscribe((result) => {
      this.billRequestList = result.Result;
      this.billRequestList = this.billRequestList != null && this.billRequestList.length > 0 && this.billRequestList.filter(z=>z.FinancialYearId = this.FinId);
      this.rejectedBills = _.filter(this.billRequestList, (item) => { return item.ApprovalStatus == 1 && item.Status == 2 && item.ProductId == this.prodId; });
      this.approvedBills = _.filter(this.billRequestList, (item) => { return item.ApprovalStatus == 1 && item.Status == 1 && item.ProductId == this.prodId; });
      this.pendingBills = _.filter(this.billRequestList, (item) => { return item.ApprovalStatus == 1 && item.Status == 0 && item.EmployeeTaxExemptionId > 0 && item.ProductId == this.prodId; });
      this.pendingSavedBill = _.filter(this.billRequestList, (item) => { return item.ApprovalStatus == 1 && item.Status == 0 && item.EmployeeTaxExemptionId == 0 && item.ProductId == this.prodId; });
      this.pendingSavedBill.length > 0 && this.pendingSavedBill.forEach(element => {
        element["isSelected"] = false;
      });
      this.spinner = false
    });

    if (this.AddColumnList[0].BillAmount && this.AddColumnList[0].BillDate && this.AddColumnList[0].BillNumber) {
      this.gridView = false;
    }
    else {

      this.alertService.showWarning("please fill the mandatory fields");

    }

    this.AddColumnList = [];
    this.addNewColumn("true", 0)
    this.FileName = null

  }
  onFileUpload(e) {
    this.spinnerText = "Uploading";

    this.isLoading = false;
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const pattern = /image-*/;
      var type = e.target.files[0].type;
      var size = e.target.files[0].size;
      var maxSize = (Math.round(size / 1024) + " KB");
      console.log(maxSize);
      var FileSize = e.target.files[0].size / 1024 / 1024;
      if (FileSize > 2) {
        this.isLoading = true;
        this.alertService.showWarning('The attachment size exceeds the allowable limit.');

        return;
      }
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        this.spinnerText = "Uploading";

        this.FileName = file.name;
        let FileUrl = (reader.result as string).split(",")[1];
        this.doAsyncUpload(FileUrl, file.name)
      };
    }
  }

  doAsyncUpload(filebytes, filename) {
    try {
      this.isLoading = false;
      let objStorage = new ObjectStorageDetails();
      objStorage.Id = 0;
      objStorage.EmployeeId = this.EmployeeId;
      objStorage.ClientContractCode =  this.BusinessType == 3 ? "" :this.sessionService.getSessionStorage("default_ContractCode") == null ? "" : this.sessionService.getSessionStorage("default_ContractCode").toString();
      objStorage.ClientCode = this.BusinessType == 3 ? "" : this.sessionService.getSessionStorage("default_ClientCode") == null ? "" : this.sessionService.getSessionStorage("default_ClientCode").toString();
      objStorage.CompanyCode = this.sessionService.getSessionStorage("CompanyCode") == null ? ""  : this.sessionService.getSessionStorage("CompanyCode").toString();
      objStorage.ClientContractId = this.empDetails.EmploymentContracts[0].ClientContractId;
      objStorage.ClientId = this.empDetails.EmploymentContracts[0].ClientId;
      objStorage.CompanyId = this.empDetails.EmploymentContracts[0].CompanyId;

      objStorage.Status = true;
      objStorage.Content = filebytes;
      objStorage.SizeInKB = 12;
      objStorage.ObjectName = filename;
      objStorage.OriginalObjectName = filename;
      objStorage.Type = 0;
      objStorage.ObjectCategoryName = "EmpTransactions";
      this.fileuploadService.postObjectStorage(JSON.stringify(objStorage)).subscribe((res) => {
        let apiResult: apiResult = (res);
        try {
          if (apiResult.Status && apiResult.Result != "") {
            this.DocumentId = apiResult.Result;
            this.LstmultipleDocs.push({
              FileName: filename,
              DocumentId: apiResult.Result,
              Status: 0,
              ApprovedAmount: 0
            })
            this.isLoading = true;
            this.expenseBillEntryForm.controls['DocumentId'].setValue(apiResult.Result);
            this.alertService.showSuccess("You have successfully uploaded this file!")
          }
          else {
            this.isLoading = true;
            this.FileName = null;
            this.alertService.showWarning("An error occurred while  trying to upload! " + apiResult.Message)
          }
        } catch (error) {
          this.isLoading = true;
          this.FileName = null;
          this.alertService.showWarning("An error occurred while  trying to upload! " + error)
        }
      }), ((err) => {
      })
      console.log(objStorage);
    } catch (error) {
      this.isLoading = true;
      this.FileName = null;
      this.alertService.showWarning("An error occurred while  trying to upload! " + error)
    }
  }
  public isGuid(stringToTest) {
    if (stringToTest[0] === "{") {
      stringToTest = stringToTest.substring(1, stringToTest.length - 1);
    }
    var regexGuid = /^(\{){0,1}[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}(\}){0,1}$/gi;

    return regexGuid.test(stringToTest);
  }
  BackToInvestments() {

    // this.rowDataService.dataInterface.RowData = null;
    // this.rowDataService.dataInterface.SearchElementValuesList = [];

    // this.rowDataService.dataInterface = {
    //   SearchElementValuesList: [],
    //   RowData: null
    // };

    // this.rowDataService = JSON.parse(sessionStorage.getItem('RowDataInterface'));

    // console.log('dfsdf', this.rowDataService);

    //   const navParams: NavigationExtras = {
    //     state: {
    //        functionalityId: 'my id'
    //     }
    //  };
    //   // this.router.navigate(["heroes"], {some-data: "othrData"});
    //   this.router.navigate(["heroes"], {state: {...}})


    // if (this.isESSLogin == true) {
    this.rowDataService = this.routedata

    // this.rowDataService.dataInterface.RowData = null;
    // this.rowDataService.dataInterface.SearchElementValuesList = [];

    // this.rowDataService['DataInterface']['RowData'] = this.routedata.dataInterface.RowData;
    // this.rowDataService['DataInterface']['SearchElementValuesList'] = this.routedata.dataInterface.SearchElementValuesList;

    if (this.isESSLogin == 'true' as any) {
      this.router.navigate(['app/investment/myinvestment']);
    }
    else {
      // this.router.navigate(['app/listing/ui/employee']);
      this.router.navigate(['app/investment/myinvestment']);
    }

    // console.log('ss', this.rowDataService);

    // this.router.navigateByUrl('/app/employee');
    // this.router.navigate(['/b'], {state: {data: {...}}});

    // this.router.navigate(['app/ess/investmentInformation']);
    // }
    // else {
    // const navigationExtras: NavigationExtras = {
    //   state: 
    //     this.routedata

    // };
    // skipLocationChange: true

    // this.route.navigate(['app/employee'], { state: { this.routedata }   });

    // this.router.navigate(['app/ui/employeelist']);

    // }

    // this.router.navigate(['app/ess/investmentInformation']);
  }
  claimEnabled(value) {
    this.isEnabled = value;
    // this.titleService.setTitle(value == 1 ? "My Bills" : value == 2 ? "Approved Bills" : "Rejected Bills");
    this.titleService.setTitle(this.prodDetails.ProductName);
  }
  deleteAsync() {
    this.isLoading = false;
    this.spinnerText = "Deleting";
    this.fileuploadService.deleteObjectStorage((this.DocumentId)).subscribe((res) => {
      let apiResult: apiResult = (res);
      try {
        if (apiResult.Status) {
          this.expenseBillEntryForm.controls['DocumentId'].setValue(null);
          // this.expenseBillEntryForm.controls['FileName'].setValue(null);
          this.FileName = null;
          this.DocumentId = null;
          // this.expenseBillEntryForm.controls['IsDocumentDelete'].setValue(false);
          this.isLoading = true;
          this.alertService.showSuccess("Awesome!...  Your file is deleted successfully!")
        } else {
          this.isLoading = true;
          this.alertService.showWarning("An error occurred while  trying to delete! " + apiResult.Message)
        }
      } catch (error) {
        this.isLoading = true;
        this.alertService.showWarning("An error occurred while  trying to delete! " + error)
      }
    }), ((err) => {
    })
  }
  doDeleteFile() {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: true,
    })
    swalWithBootstrapButtons.fire({
      title: 'Are you sure you want to delete?',
      text: "Once deleted, you cannot undo this action.",
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ok!',
      cancelButtonText: 'No, cancel!',
      allowOutsideClick: false,
      reverseButtons: true
    }).then((result) => {

      if (result.value) {

        if (this.firstTimeDocumentId != this.DocumentId) {

          this.deleteAsync();

        }
        else {
          this.FileName = null;
          // this.expenseBillEntryForm.controls['IsDocumentDelete'].setValue(true);
          // this.expenseBillEntryForm.controls['FileName'].setValue(null);
        }
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        swalWithBootstrapButtons.fire(
          'Cancelled',
          'Your request has been cancelled',
          'error'
        )
      }
    })
  }
  doDeleteBill(item, tabactivity) {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: true,
    })
    swalWithBootstrapButtons.fire({
      title: 'Are you sure you want to delete?',
      text: "",// "Once deleted, you cannot undo this action.",
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ok!',
      cancelButtonText: 'No, cancel!',
      allowOutsideClick: false,
      reverseButtons: true
    }).then((result) => {
      if (result.value) {

        this.deleteBillEntry(item, tabactivity)
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        swalWithBootstrapButtons.fire(
          'Cancelled',
          'Your request has been cancelled',
          'error'
        )
      }
    })
  }

  selectBillEntries(obj, isSelectd) {

    console.log('Object ', obj)

    let updateItem = this.LstExpenseBillRequests.find(i => i.Id == obj.Id);
    let index = this.LstExpenseBillRequests.indexOf(updateItem);

    // console.log(index);

    if (index > -1) {
      this.LstExpenseBillRequests.splice(index, 1);
    }
    else {
      this.LstExpenseBillRequests.push(obj);
    }

    // var totalLength = 0;
    // this.LstExpenseBillRequests.forEach(e => {
    //   totalLength = totalLength + 1;
    // });
    // if (totalLength === this.selectedClaimReqs.length) {
    //   this.selectAll = true;
    // }
    // else {
    //   this.selectAll = false;
    // }

    // this.countOfExpense = this.selectedClaimReqs.length;
    // console.log('Selected_Claim_Reqs : ', this.selectedClaimReqs);

  }
  do_editAppliedRequest(item, index, tabactivity) {
    console.log('item', item);
    this.openDrawerAddExpense(item, index, tabactivity);
  }
  deleteBillEntry(item, tabactivity) {
    // if (item.ApprovalStatus == 0) {
    item.Modetype = UIMode.Edit;
    item.ApprovalStatus = 0;
    item.EmployeeTaxExemptionId = 0;

    this.employeeService.insertEmployeeExemptionBillDetails(item).subscribe((result) => {
      let data = result.Result;
      if (tabactivity == 'old') {
        this.spinner = true
        this.employeeModel.oldobj = Object.assign({}, this.empDetails);
        this.employeeModel.newobj = this.empDetails;
        let totalAmount = 0;
        let taxExemptionParentId = 0;
        let existingObject = null;
        var _empTaxExceptionDet = [];
        if (this.empDetails != null && this.empDetails.LstEmployeeTaxExemptionDetails != null && this.empDetails.LstEmployeeTaxExemptionDetails.length > 0) {
          if (this.empDetails.LstEmployeeTaxExemptionDetails.find(x => x.FinancialYearId == this.FinId && x.ProductId == this.prodId) != undefined) {
            taxExemptionParentId = this.empDetails.LstEmployeeTaxExemptionDetails.find(x => x.FinancialYearId == this.FinId && x.ProductId == this.prodId).Id;
            existingObject = this.empDetails.LstEmployeeTaxExemptionDetails.find(x => x.FinancialYearId == this.FinId && x.ProductId == this.prodId);
          }

        }

        if (existingObject.LstEmployeeExemptionBillDetails != null && existingObject.LstEmployeeExemptionBillDetails.length > 0) {
          for (let j = 0; j < existingObject.LstEmployeeExemptionBillDetails.length; j++) {
            const element = existingObject.LstEmployeeExemptionBillDetails[j];
            if (item.Id == element.Id) {
              item.Modetype = 0;
              existingObject.LstEmployeeExemptionBillDetails[j] = item;
            }
          }
        }

        //  var isex = existingObject.LstEmployeeExemptionBillDetails.find(x=>x.Id == item.Id)
        //   if(isex != undefined){

        //     isex = item;
        //     isex.BillNumber = item.BillNumber;
        //     isex.BillId = item.BillId;
        //     isex.BillDate = item.BillDate;
        //     isex.BillAmount = item.BillAmount;
        //     isex.FileName = item.FileName;
        //     isex.Modetype = UIMode.Edit;

        //     console.log('ises', isex);

        //   }


        // }

        existingObject.LstEmployeeExemptionBillDetails.forEach(element => {
          if (item.Id != element.Id && element.ApprovalStatus == 1) {

            totalAmount = Number(totalAmount) + Number(element.BillAmount)
            //  }else {
            //    alert(element);
            //    element = billRequest;
            //   element.BillNumber = billRequest.BillNumber;
            //   element.BillId = billRequest.BillId;
            //   element.BillDate = billRequest.BillDate;
            //   element.BillAmount = billRequest.BillAmount;
            //   element.FileName = billRequest.FileName;
            //   element.Modetype = UIMode.Edit;


          }

        });


        var ii = [];
        ii = existingObject.LstEmployeeExemptionBillDetails.filter(a => a.ApprovalStatus == 1)

        var empTaxExceptionObj = new EmployeeTaxExemptionDetails();
        empTaxExceptionObj.Id = taxExemptionParentId;
        empTaxExceptionObj.Modetype = UIMode.Edit;
        empTaxExceptionObj.EmployeeId = this.EmployeeId;
        empTaxExceptionObj.FinancialYearId = this.FinId;
        empTaxExceptionObj.Status = 1;
        empTaxExceptionObj.ApprovedAmount = existingObject == null ? 0 : existingObject.ApprovedAmount;
        empTaxExceptionObj.ProductId = existingObject.ProductId;
        empTaxExceptionObj.Amount = totalAmount;
        empTaxExceptionObj.DocumentId = 0;
        empTaxExceptionObj.IsProposed = existingObject.IsProposed;
        empTaxExceptionObj.LstEmployeeExemptionBillDetails = ii.length > 0 ? ii : [];
        _empTaxExceptionDet.push(empTaxExceptionObj);

        this.employeeModel.newobj.Modetype = UIMode.Edit;
        this.employeeModel.newobj.LstEmployeeTaxExemptionDetails = _empTaxExceptionDet;
        console.log("BILL ENTRY EMPLOYEE JSON :: ", this.employeeModel)
        var Employee_request_param = JSON.stringify(this.employeeModel);
        this.employeeService.putEmployeeDetails(Employee_request_param).subscribe((data: any) => {
          let apiR: apiResponse = data;
          if (apiR.Status && apiR.dynamicObject != null) {
            this.spinner = false;
            this.alertService.showSuccess(apiR.Message);
            this.onRefresh();
          } else {
            this.spinner = false;
            this.alertService.showWarning(apiR.Message);
          }

          // this.resData = data
          // this.employeeService.GetEmployeeExemptionBillDetails(this.EmployeeId).subscribe((result) => {
          //   this.billRequestList = result.Result;
          //   this.rejectedBills = _.filter(this.billRequestList, (item) => { return item.Status == 2 && item.ProductId == this.prodId });
          //   this.approvedBills = _.filter(this.billRequestList, (item) => { return item.Status == 1 && item.ProductId == this.prodId });
          //   this.pendingBills = _.filter(this.billRequestList, (item) => { return item.Status == 1 && item.ProductId == this.prodId });
          //   this.spinner = false

          //   if (this.resData.Status) {
          //   }
          //   else {
          //     //this.alertService.showWarning("An error occurred while  trying to submit! ")
          //   }
          //   this.resData = null
          // });

        });

      } else {
        this.onRefresh();

      }
      // if (result.Status) {
      //   this.employeeService.GetEmployeeExemptionBillDetails(this.EmployeeId).subscribe((result) => {
      //     this.billRequestList = result.Result;
      //     this.rejectedBills = _.filter(this.billRequestList, (item) => { return item.Status == 2 && item.ProductId == this.prodId });
      //     this.approvedBills = _.filter(this.billRequestList, (item) => { return item.Status == 1 && item.ProductId == this.prodId });
      //     this.pendingBills = _.filter(this.billRequestList, (item) => { return item.Status == 0 && item.EmployeeTaxExemptionId > 0 && item.ProductId == this.prodId; });
      //     this.pendingSavedBill = _.filter(this.billRequestList, (item) => { return item.Status == 0 && item.EmployeeTaxExemptionId == 0 && item.ProductId == this.prodId; });
      //     this.pendingSavedBill.length > 0 &&  this.pendingSavedBill.forEach(element => {
      //       element["isSelected"] = false;
      //   });
      //   });
      //   this.alertService.showSuccess("Awesome!...  Your file is deleted successfully!")
      // } else {

      //   this.alertService.showWarning("An error occurred while  trying to delete! " + result.Message)
      // }
    })
    // }
    // else {
    //   this.alertService.showWarning("You have no permission to delete approved bills");
    // }

  }

  async submitForApproval() {

    // console.log("this.pendingBills", this.pendingBills);

    try {

      if (this.LstExpenseBillRequests.length == 0) {
        this.alertService.showWarning("Please select at least one Bill ");
        return;
      }
      await this.alertService.confirmSwal("Confirmation", "Are you sure you want to submit?", "Yes, Confirm").then(result => {

        var billDetList = [];
        let totalAmount = 0;
        let taxExemptionParentId = 0;
        let existingObject = null;
        this.employeeModel.oldobj = Object.assign({}, this.empDetails);
        this.employeeModel.newobj = this.empDetails;
        var _empTaxExceptionDet = [];
        this.spinner = true

        this.LstExpenseBillRequests.forEach(obj => {

          var billObj = new EmployeeExemptionBillDetails();
          obj.Modetype = UIMode.Edit
          billObj.Id = obj.Id;
          billObj.Modetype = UIMode.Edit;
          billObj.EmployeeId = this.EmployeeId;
          billObj.FinancialYearId = obj.FinancialYearId;
          billObj.ProductId = obj.ProductId;
          billObj.BillAmount = obj.BillAmount;
          billObj.BillNumber = obj.BillNumber;
          billObj.BillDate = obj.BillDate;
          billObj.BillId = obj.BillId;
          billObj.FileName = obj.FileName;
          billObj.Remarks = obj.Remarks;
          billObj.ApprovedAmount = obj.ApprovedAmount;
          billObj.ApprovedBy = obj.ApprovedBy;
          billObj.ApprovedOn = obj.ApprovedOn;
          billObj.Status = obj.Status;
          billObj.ApprovalStatus = obj.ApprovalStatus;
          billObj.RejectedBy = obj.RejectedBy;
          billObj.RejectedOn = obj.RejectedOn;
          billObj.RejectedRemarks = obj.RejectedRemarks;
          billObj.EmployeeTaxExemptionId = 0;
          billDetList.push(billObj);
          totalAmount += obj.BillAmount

        });
        if (this.empDetails != null && this.empDetails.LstEmployeeTaxExemptionDetails != null && this.empDetails.LstEmployeeTaxExemptionDetails.length > 0) {
          if (this.empDetails.LstEmployeeTaxExemptionDetails.find(x => x.FinancialYearId == this.FinId && x.ProductId == this.prodId) != undefined) {
            taxExemptionParentId = this.empDetails.LstEmployeeTaxExemptionDetails.find(x => x.FinancialYearId == this.FinId && x.ProductId == this.prodId).Id;
            existingObject = this.empDetails.LstEmployeeTaxExemptionDetails.find(x => x.FinancialYearId == this.FinId && x.ProductId == this.prodId);
          }

        }
        var empTaxExceptionObj = new EmployeeTaxExemptionDetails();
        empTaxExceptionObj.Id = taxExemptionParentId;
        empTaxExceptionObj.Modetype = UIMode.Edit;
        empTaxExceptionObj.EmployeeId = this.EmployeeId;
        empTaxExceptionObj.FinancialYearId = this.FinId;
        empTaxExceptionObj.Status = 1;
        empTaxExceptionObj.ApprovedAmount = existingObject == null ? 0 : existingObject.ApprovedAmount;
        empTaxExceptionObj.ProductId = this.prodId;
        empTaxExceptionObj.Amount = existingObject == null ? totalAmount : (existingObject.Amount + totalAmount);
        empTaxExceptionObj.DocumentId = 0;
        empTaxExceptionObj.IsProposed = this.DocumentId > 0 ?  false : (this.mode == true ? false : true);
        empTaxExceptionObj.LstEmployeeExemptionBillDetails = billDetList;
        _empTaxExceptionDet.push(empTaxExceptionObj);

        this.employeeModel.newobj.Modetype = UIMode.Edit;
        this.employeeModel.newobj.LstEmployeeTaxExemptionDetails = _empTaxExceptionDet;
        console.log("BILL ENTRY EMPLOYEE JSON :: ", this.employeeModel)
        var Employee_request_param = JSON.stringify(this.employeeModel);
        this.employeeService.putEmployeeDetails(Employee_request_param).subscribe((data: any) => {
          let apiR: apiResponse = data;
          if (apiR.Status && apiR.dynamicObject != null) {
            this.spinner = false;
            this.alertService.showSuccess(apiR.Message);
            this.onRefresh();
          } else {
            this.spinner = false;
            this.alertService.showWarning(apiR.Message);
          }

          // this.resData = data
          // this.employeeService.GetEmployeeExemptionBillDetails(this.EmployeeId).subscribe((result) => {
          //   this.billRequestList = result.Result;
          //   this.rejectedBills = _.filter(this.billRequestList, (item) => { return item.Status == 2 && item.ProductId == this.prodId });
          //   this.approvedBills = _.filter(this.billRequestList, (item) => { return item.Status == 1 && item.ProductId == this.prodId });
          //   this.pendingBills = _.filter(this.billRequestList, (item) => { return item.Status == 1 && item.ProductId == this.prodId });
          //   this.spinner = false

          //   if (this.resData.Status) {
          //   }
          //   else {
          //     //this.alertService.showWarning("An error occurred while  trying to submit! ")
          //   }
          //   this.resData = null
          // });

        });
      }).catch(error => {

      });
    }
    catch (error) {
      this.alertService.showWarning("An error occurred while trying to submit!" + error);
    }
    //return;

    //   if(this.pendingBills.length > 0) {

    //   for (let obj of this.pendingBills) {
    //     var billObj = new EmployeeExemptionBillDetails();
    //     obj.Modetype = UIMode.Edit
    //     billObj.Id = obj.Id;
    //     billObj.Modetype = UIMode.Edit;
    //     billObj.EmployeeId = this.EmployeeId;
    //     billObj.FinancialYearId = obj.FinancialYearId;
    //     billObj.ProductId = obj.ProductId;
    //     billObj.BillAmount = obj.BillAmount;
    //     billObj.BillNumber = obj.BillNumber;
    //     billObj.BillDate = obj.BillDate;
    //     billObj.BillId = obj.BillId;
    //     billObj.FileName = obj.BillNumber;
    //     billObj.Remarks = obj.Remarks;

    //     billObj.ApprovedAmount = obj.ApprovedAmount;
    //     billObj.ApprovedBy = obj.ApprovedBy;
    //     billObj.ApprovedOn = obj.ApprovedOn;
    //     billObj.Status = ApprovalStatus.Pending;
    //     billObj.ApprovalStatus = obj.ApprovalStatus;
    //     billObj.RejectedBy = obj.RejectedBy;
    //     billObj.RejectedOn = obj.RejectedOn;
    //     billObj.RejectedRemarks = obj.RejectedRemarks;

    //     billObj.EmployeeTaxExemptionId = obj.EmployeeTaxExemptionId
    //     billDetList.push(billObj);
    //     totalAmount += obj.BillAmount
    //   }
    //   console.log("this.pendingBills", this.pendingBills)

    //   this.employeeModel.oldobj = Object.assign({}, this.empDetails);
    //   this.employeeModel.newobj = this.empDetails
    //   var _empTaxExceptionDet = [];

    //   var empTaxExceptionObj = new EmployeeTaxExemptionDetails();
    //   empTaxExceptionObj.Id = 0;
    //   empTaxExceptionObj.Modetype = UIMode.Edit;
    //   empTaxExceptionObj.EmployeeId = this.EmployeeId;
    //   empTaxExceptionObj.FinancialYearId = this.FinId;
    //   empTaxExceptionObj.Status = 1;
    //   empTaxExceptionObj.ApprovedAmount = 0;
    //   empTaxExceptionObj.ProductId = this.prodId;
    //   empTaxExceptionObj.Amount = totalAmount;
    //   empTaxExceptionObj.DocumentId = 0;
    //   empTaxExceptionObj.LstEmployeeExemptionBillDetails = billDetList;
    //   _empTaxExceptionDet.push(empTaxExceptionObj);

    //   // var empObj = {
    //   //   Id: this.EmployeeId,
    //   //   FirstName: this.empDetails.FirstName,
    //   //   FatherName: this.empDetails.FatherName,
    //   //   DateofBirth:this.empDetails.DateOfBirth,
    //   //   LstEmployeeTaxExemptionDetails: _empTaxExceptionDet,
    //   //   Modetype : UIMode.Edit
    //   // }
    //   //this.employeeModel.newobj = empObj;
    //   var empObj = {
    //     Id: this.empDetails.Id,
    //     FirstName: this.empDetails.FirstName,
    //     FatherName: this.empDetails.FatherName,
    //     DateofBirth: this.empDetails.DateOfBirth,
    //     LstEmployeeTaxExemptionDetails: [],
    //     Modetype: UIMode.Edit
    //   }

    //   //this.employeeModel.newobj = empObj;
    //   this.employeeModel.newobj.Modetype = UIMode.Edit;
    //   this.employeeModel.newobj.LstEmployeeTaxExemptionDetails = _empTaxExceptionDet;
    //   console.log("this.employeeModel", this.employeeModel)
    //   //return;
    //   var Employee_request_param = JSON.stringify(this.employeeModel);

    //   // let requestedBills = this.LstExpenseBillRequests

    //   this.LstExpenseBillRequests = []


    // }
    //     else {
    //   this.alertService.showWarning("There is no record found!");
    // }

  }

  // async submitForApproval() {
  //   let totalAmount = 0
  //   var billDetList = [];
  //   if (this.LstExpenseBillRequests.length > 0) {

  //     for (let obj of this.LstExpenseBillRequests) {
  //       var billObj = new EmployeeExemptionBillDetails();

  //       obj.Modetype = UIMode.Edit
  //       billObj.Id = obj.Id;
  //       billObj.Modetype = UIMode.Edit;
  //       billObj.EmployeeId = this.EmployeeId;
  //       billObj.FinancialYearId = obj.FinancialYearId;
  //       billObj.ProductId = obj.ProductId;
  //       billObj.BillAmount = obj.BillAmount;
  //       billObj.BillNumber = obj.BillNumber;
  //       billObj.BillDate = obj.BillDate;
  //       billObj.BillId = obj.BillId;
  //       billObj.FileName = obj.BillNumber;
  //       billObj.Remarks = obj.Remarks;

  //       billObj.ApprovedAmount = obj.ApprovedAmount;
  //       billObj.ApprovedBy = obj.ApprovedBy;
  //       billObj.ApprovedOn = obj.ApprovedOn;
  //       billObj.Status = obj.Status;
  //       billObj.ApprovalStatus = obj.ApprovalStatus;
  //       billObj.RejectedBy = obj.RejectedBy;
  //       billObj.RejectedOn = obj.RejectedOn;
  //       billObj.RejectedRemarks = obj.RejectedRemarks;

  //       billObj.EmployeeTaxExemptionId = obj.EmployeeTaxExemptionId
  //       billDetList.push(billObj);
  //       totalAmount += obj.BillAmount
  //     }
  //     console.log("this.LstExpenseBillRequests", this.LstExpenseBillRequests)

  //     this.employeeModel.oldobj = Object.assign({}, this.empDetails);
  //     this.employeeModel.newobj = this.empDetails
  //     var _empTaxExceptionDet = [];

  //     var empTaxExceptionObj = new EmployeeTaxExemptionDetails();
  //     empTaxExceptionObj.Id = 0;
  //     empTaxExceptionObj.Modetype = UIMode.Edit;
  //     empTaxExceptionObj.EmployeeId = this.EmployeeId;
  //     empTaxExceptionObj.FinancialYearId = this.FinId;
  //     empTaxExceptionObj.Status = 1;
  //     empTaxExceptionObj.ApprovedAmount = 0;
  //     empTaxExceptionObj.ProductId = this.prodId;
  //     empTaxExceptionObj.Amount = totalAmount;
  //     empTaxExceptionObj.DocumentId = 0;
  //     empTaxExceptionObj.LstEmployeeExemptionBillDetails = billDetList;
  //     _empTaxExceptionDet.push(empTaxExceptionObj);

  //     // var empObj = {
  //     //   Id: this.EmployeeId,
  //     //   FirstName: this.empDetails.FirstName,
  //     //   FatherName: this.empDetails.FatherName,
  //     //   DateofBirth:this.empDetails.DateOfBirth,
  //     //   LstEmployeeTaxExemptionDetails: _empTaxExceptionDet,
  //     //   Modetype : UIMode.Edit
  //     // }
  //     //this.employeeModel.newobj = empObj;
  //     var empObj = {
  //       Id: this.empDetails.Id,
  //       FirstName: this.empDetails.FirstName,
  //       FatherName: this.empDetails.FatherName,
  //       DateofBirth: this.empDetails.DateOfBirth,
  //       LstEmployeeTaxExemptionDetails: [],
  //       Modetype: UIMode.Edit
  //     }

  //     //this.employeeModel.newobj = empObj;
  //     this.employeeModel.newobj.Modetype = UIMode.Edit;
  //     this.employeeModel.newobj.LstEmployeeTaxExemptionDetails = _empTaxExceptionDet;
  //     console.log("this.employeeModel", this.employeeModel)
  //     //return;
  //     var Employee_request_param = JSON.stringify(this.employeeModel);

  //     // let requestedBills = this.LstExpenseBillRequests
  //     this.spinner = true
  //     await this.employeeService.putEmployeeDetails(Employee_request_param).subscribe((data: any) => {
  //       this.resData = data
  //       this.employeeService.GetEmployeeExemptionBillDetails(this.EmployeeId).subscribe((result) => {
  //         this.billRequestList = result.Result;
  //         this.rejectedBills = _.filter(this.billRequestList, (item) => { return item.Status == 2 && item.ProductId == this.prodId });
  //         this.approvedBills = _.filter(this.billRequestList, (item) => { return item.Status == 1 && item.ProductId == this.prodId });
  //         this.pendingBills = _.filter(this.billRequestList, (item) => { return item.Status == 1 && item.ProductId == this.prodId });
  //         this.spinner = false

  //         if (this.resData.Status) {
  //           this.alertService.showSuccess(this.resData.Message)
  //         }
  //         else {
  //           //this.alertService.showWarning("An error occurred while  trying to submit! ")
  //           this.alertService.showWarning(this.resData.Message)
  //         }
  //         this.resData = null
  //       });
  //       // if (data.Status) {
  //       //   this.alertService.showSuccess("Awesome!...  submited successfully!")
  //       // }
  //       // else {
  //       //   this.alertService.showWarning("An error occurred while  trying to submit! ")
  //       // }
  //     });
  //     this.LstExpenseBillRequests = []


  //   }
  //   else {
  //     this.alertService.showWarning("Please select at least one Bill  ")
  //   }

  // }


  selectAllClaimRequest(event: any) {
    this.LstExpenseBillRequests = [];
    this.pendingSavedBill.forEach(e => {
      event.target.checked == true ? e.isSelected = true : e.isSelected = false
    });
    if (event.target.checked) {
      this.pendingSavedBill.forEach(e => {
        this.LstExpenseBillRequests.push(e);
      });
    } else {
      this.LstExpenseBillRequests = [];
    }
  }

}
