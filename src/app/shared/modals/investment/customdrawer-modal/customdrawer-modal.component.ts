import { Component, OnInit, Input } from '@angular/core';
import { NzDrawerRef, NzDrawerService } from 'ng-zorro-antd/drawer';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { HramodalComponent } from '../../employee/hramodal/hramodal.component';
import { FormGroup, FormBuilder, FormControl, Validators, AbstractControl } from '@angular/forms';
import { UUID } from 'angular2-uuid';
import Swal from "sweetalert2";
import * as moment from 'moment';
import { environment } from "../../../../../environments/environment";
import * as _ from 'lodash';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { LoginResponses } from 'src/app/_services/model';

import { MedicdependentModalComponent } from '../../employee/medicdependent-modal/medicdependent-modal.component';
import { SessionStorage } from '../../../../_services/service/session-storage.service';
import { AlertService } from '../../../../_services/service/alert.service';
import { FileUploadService } from 'src/app/_services/service/fileUpload.service';
import { ObjectStorageDetails } from 'src/app/_services/model/Candidates/ObjectStorageDetails';
import { apiResult } from 'src/app/_services/model/apiResult';
import { EmployeeService } from 'src/app/_services/service';
import { apiResponse } from 'src/app/_services/model/apiResponse';
import { EmployeeLookUp } from 'src/app/_services/model/Employee/EmployeeLookup';
import { UIMode } from 'src/app/_services/model/Common/BaseModel';
import { DatePipe } from '@angular/common';
import { enumHelper } from 'src/app/shared/directives/_enumhelper';
import { RelationShip } from 'src/app/_services/model/Candidates/CandidateFamilyDetails';
import { EmployeeInvestmentDocuments, InvestmentStatus } from 'src/app/_services/model/Employee/EmployeeInvestmentDeductions';
import { ApprovalStatus } from 'src/app/_services/model/Candidates/CandidateDocuments';
import { ModeOfInput } from 'src/app/_services/model/Attendance/AttendanceConfiguration';

export class DeductionExemption {
  Id: number;
  Name: string;
  AmtDeclared: number;
  AmtApproved: number;
  Status: any;
  Section: any;
  ChildProductJson: any = null;
}

export class Investment {
  Id: number;
  Name: string;
  AmtInvested: number;
  AmtApproved: number;
  Status: any;
  Section: any;
}

export interface multipleDocsObject {
  FileName: any;
  DocumentId: any;
  Status: number;
  ApprovedAmount: any
}

@Component({
  selector: 'app-customdrawer-modal',
  templateUrl: './customdrawer-modal.component.html',
  styleUrls: ['./customdrawer-modal.component.scss']
})

export class CustomdrawerModalComponent implements OnInit {

  @Input() objStorageJson: any;
  @Input() categoryJson;
  @Input() whichCategory;
  @Input() Mode: boolean = false;
  @Input() editableObj: any;
  @Input() CityList: any;
  @Input() ChildProductJson: any;


  Id: any;
  limitedAmount: any;
  KeyAmount: any; // Only for investment
  KeyRemarks: any = null;
  // DocumentId: any;


  btnsaved: boolean = false;
  modalOption: NgbModalOptions = {};
  oldEntryType: any;

  EntryTypeList = [{
    Id: 1, Name: "Month Wise"
  },
    //  { Id: 2, Name: "Bi-Annual" }, { Id: 3, Name: "Custom" }
  ];
  EntryType: any;
  lstCity = [{
    id: 1,
    code: 'BLR'
  },
  {
    id: 2,
    code: "CHE"
  },
  {
    id: 3,
    code: "MUM"
  }
  ]
  LstHRA = [];
  LstMedical = [];
  checkClaiming: any;
  // LOST HOUSE PROPERTY
  lhpForm: FormGroup;
  submitted = false;
  // DOCUMENT UPLOAD
  isLoading: boolean = true;
  spinnerText: string = '';
  // FileName: any;
  unsavedDocumentLst = [];
  editId: any;
  lstlookUpDetails: EmployeeLookUp;
  deletedLstHRA = [];

  NameofLandlord: any;
  PANofLandlord: any;
  RentalHouseAddress: any;
  LandlordAddress: any;

  Annual_Basic: any = 0;
  Annual_HRA: any = 0;
  LstmultipleDocs: multipleDocsObject[] = [];
  isPanMandatoryForHRA: boolean = false;
  firstPreLoadDocumentId: multipleDocsObject[] = [];
  _loginSessionDetails: LoginResponses;
  BusinessType: number;
  IsValidToTakeHomeLoanAmount: boolean = false;
  ValidHomeLoanObject_HPD: any;
  constructor(
    private drawerRef: NzDrawerRef<string>,
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    public fileuploadService: FileUploadService,
    public sessionService: SessionStorage,
    private employeeService: EmployeeService,
    private datePipe: DatePipe,
    private utilsHelper: enumHelper


  ) {
    // this.EntryType = 2;
  }

  async ngOnInit() {
    this.EntryType = null;
    this._loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses));
    this.BusinessType = this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping != null ? this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this._loginSessionDetails.Company.Id).BusinessType : 0;
    // this.Mode = false;
    this.CityList = JSON.parse(this.CityList);
    this.objStorageJson = JSON.parse(this.objStorageJson);
    console.log('whichcate', this.whichCategory);

    console.log('categoryJson', this.categoryJson);
    this.modalOption.backdrop = 'static';
    this.modalOption.keyboard = false;
    this.editableObj = JSON.parse(this.editableObj);
    console.log('editableObj', this.editableObj);
    // console.log('his.editableObj.UIData.EntryType', JSON.parse(this.editableObj.UIData));
    var temp = null;
    this.limitedAmount = this.categoryJson.b[0].ThresholdLimit;
    this.whichCategory === "duduction_Additional" ? this.createForm() : null;
    this.editableObj === null ? this.Id = UUID.UUID() : (this.KeyAmount = this.editableObj.AmtInvested, this.KeyRemarks = this.editableObj.Remarks);
    this.whichCategory === "duduction_Medical" ? (this.editableObj !== null ? this.LstMedical = this.editableObj.AdditionalList : null) : null;
    this.whichCategory === "deduction_Self" ? (this.editableObj !== null ? this.checkClaiming = this.editableObj.AdditionalAction : null) : this.checkClaiming = true;

    // this.whichCategory === "duduction" && (temp = JSON.parse(this.editableObj.UIData), this.EntryType = temp.EntryType, this.oldEntryType = temp.EntryType);
    this.whichCategory === "duduction" ? (this.editableObj !== null ? this.LstHRA = this.editableObj.AdditionalList : []) :
      this.whichCategory === "duduction" && this.editableObj !== null && this.editableObj.AdditionalList.length > 0 ? (this.NameofLandlord = this.editableObj.AdditionalList[0].NameofLandlord, this.PANofLandlord = this.editableObj.AdditionalList[0].PANofLandlord, this.RentalHouseAddress = this.editableObj.AdditionalList[0].RentalHouseAddress, this.LandlordAddress = this.editableObj.AdditionalList[0].RentalHouseAddress) : null;
    this.whichCategory === "duduction" && (this.EntryType = this.LstHRA.length == 12 ? 1 : this.LstHRA.length == 2 ? 2 : 3);
    this.whichCategory === "duduction" && this.editableObj !== null && this.LstHRA.length > 0 ? this.onChangeHRA_table() : null;

    if (this.whichCategory === "duduction" && this.editableObj !== null && this.editableObj.AdditionalList.length > 0) {
      this.NameofLandlord = this.editableObj.AdditionalList[0].NameofLandlord;
      this.PANofLandlord = this.editableObj.AdditionalList[0].PANofLandlord, this.RentalHouseAddress = this.editableObj.AdditionalList[0].RentalHouseAddress, this.LandlordAddress = this.editableObj.AdditionalList[0].RentalHouseAddress
    }
    this.Annual_Basic = this.sessionService.getSessionStorage('HRA_Annual_Basic');
    this.Annual_HRA = this.sessionService.getSessionStorage('HRA_Annual_HRA');
    this.editableObj !== null && this.editableObj.DocumentDetails != null && this.editableObj.DocumentDetails.length > 0 ?
      this.LstmultipleDocs = this.editableObj.DocumentDetails : null;
    this.editableObj != null && this.editableObj.hasOwnProperty('DocumentDetails') && this.editableObj.DocumentDetails != null ? this.firstPreLoadDocumentId = [...this.editableObj.DocumentDetails] : true;;
    console.log('LstmultipleDocs', this.LstmultipleDocs);

    if (this.whichCategory === "duduction_Additional" && this.editableObj && this.editableObj.ChildProductJson) {
      this.IsValidToTakeHomeLoanAmount = true;
      this.lhpForm.controls['Sec24ChildProductAmount'].setValue(this.editableObj.ChildProductJson.AmtInvested);
      this.ValidHomeLoanObject_HPD = this.ChildProductJson.find(a => a.ProductId == this.editableObj.ChildProductJson.ProductId);
      this.doCheckIsAvailToTakeHomeLoanAmount();
    }
  }

  save() {
    console.log('KeyAmount  : ', this.KeyAmount);
    console.log('LstmultipleDocs', this.LstmultipleDocs);

    this.btnsaved = true;

    if (!this.Mode && this.LstmultipleDocs.length == 0) {
      this.alertService.showWarning("Please upload at least one attachment for verification");
      return;
    }

    if (!this.Mode && this.LstmultipleDocs.length > 0 && this.LstmultipleDocs.filter(a => a.Status == 2).length > 0) {
      this.alertService.showWarning("There are some rejected file(s) in your cart :)");
      return;
    }

    if (this.PANofLandlord) {
      const panRegex = /^([a-zA-Z]){3}([pPcCHhaAbBgGlLfFTtjJ]){1}([a-zA-Z]){1}([0-9]){4}([a-zA-Z]){1}?$/;
      const checkPanValid = panRegex.test(this.PANofLandlord);
      if (!checkPanValid) {
        return this.alertService.showWarning("Please match the requested format. (Ex: ABCPD1234E)");
      }
    }

    var empInvtDocs = [];
    this.LstmultipleDocs.length > 0 && this.LstmultipleDocs.forEach((el) => {
      var employeeInvestmentDocuments = new EmployeeInvestmentDocuments();
      employeeInvestmentDocuments.EmployeeId = this.objStorageJson.EmployeeId;
      employeeInvestmentDocuments.ProductId = this.categoryJson.ProductId;
      employeeInvestmentDocuments.Date = new Date();
      employeeInvestmentDocuments.DocumentNumber = "0";
      employeeInvestmentDocuments.DocumentId = el.DocumentId;
      employeeInvestmentDocuments.FileName = el.FileName;
      employeeInvestmentDocuments.Amount = this.KeyAmount;
      employeeInvestmentDocuments.ApprovedAmount = el.ApprovedAmount;
      employeeInvestmentDocuments.OtherInfo = "";
      employeeInvestmentDocuments.FromDate = new Date();
      employeeInvestmentDocuments.ToDate = new Date();
      employeeInvestmentDocuments.Remarks = '';
      employeeInvestmentDocuments.Status = el.Status;
      empInvtDocs.push(employeeInvestmentDocuments);

    })

    if (this.whichCategory === "investment" && (!isNaN(this.KeyAmount) && this.KeyAmount != undefined && this.KeyAmount != null && this.KeyAmount != '')) {


      var investment = new Investment() as any;
      investment.Id = this.editableObj !== null ? this.editableObj.Id : this.Id;
      investment.ProductId = this.categoryJson.ProductId;
      investment.Name = this.categoryJson.ProductName;
      investment.AmtInvested = this.KeyAmount;
      investment.AmtApproved = this.editableObj !== null ? this.editableObj.AmtApproved : 0;
      investment.Section = this.categoryJson.b[0].Code;
      investment.Remarks = this.KeyRemarks;
      investment.Status = "Pending";
      investment.DocumentDetails = empInvtDocs;
      // investment.DocumentId = this.DocumentId;
      this.drawerRef.close(investment);

    } else if (this.whichCategory.toString() == 'duduction' || this.whichCategory.toString() == 'duduction_Medical' || this.whichCategory.toString() === 'duduction_Additional') {
      if (this.whichCategory.toString() === 'duduction') {
        var isEmptyList = [];
        isEmptyList = this.LstHRA.filter(z => z.NameofCity === null || z.NameofCity === 0 || z.NameofCity === '' || z.RentAmountPaid === '' || z.RentAmountPaid === null);
        if (isEmptyList.length > 0) {
          this.alertService.showWarning("Please fill all the empty records!");
          return;
        }
        if ((this.EntryType == 1 || this.EntryType == 2) && (!this.RentalHouseAddress || !this.NameofLandlord || !this.LandlordAddress || (!this.PANofLandlord && this.isPanMandatoryForHRA))) {
          this.alertService.showWarning("This alert is to inform you about your required fields");
          return;
        }
        if (this.EntryType != 3) {
          this.LstHRA.forEach(element => {
            element.PANofLandlord = this.PANofLandlord;
            element.RentalHouseAddress = this.RentalHouseAddress;
            element.NameofLandlord = this.NameofLandlord;
            element.LandlordAddress = this.LandlordAddress;
          });
        }

      }
      if (this.whichCategory.toString() === 'duduction_Additional') {
        this.submitted = true;
        this.findInvalidControls();
        if (this.lhpForm.invalid) {

          this.alertService.showWarning("This alert is to inform you about your required fields");
          return;
        }
      }

      if (this.whichCategory.toString() === 'duduction_Medical') {
        if (this.LstMedical.length === 0) {
          this.alertService.showWarning("OOPS!, At leaset one records required.");
          return;
        }
      }

      if (this.whichCategory.toString() === 'duduction_Medical') {
        if (this.calculcateMedicalAmount(this.LstMedical) > 75000) {
          this.alertService.showWarning("OOPS!, You have entered amount is invalid");
          return;
        }
      }

      if (this.whichCategory.toString() === 'duduction') {
        if (this.LstHRA.length === 0) {
          this.alertService.showWarning("OOPS!, At leaset one records required.");
          return;
        }
      }
      if (this.deletedLstHRA.length > 0) {
        sessionStorage.removeItem('LstHRA');
        sessionStorage.setItem('LstHRA', JSON.stringify(this.deletedLstHRA));
      }
      var childProductObject = null;
      if (this.whichCategory.toString() === 'duduction_Additional' && this.IsValidToTakeHomeLoanAmount) {
        childProductObject = {

          Id: this.editableObj !== null &&  this.editableObj.ChildProductJson != null ? this.editableObj.ChildProductJson.Id : UUID.UUID(),
          ProductId: this.ValidHomeLoanObject_HPD.ProductId,
          Name: this.ValidHomeLoanObject_HPD.ProductName,
          ProductCode: this.ValidHomeLoanObject_HPD.ProductCode,
          AmtInvested: this.lhpForm.get('Sec24ChildProductAmount').value,
          AmtApproved: 0,
          Remarks: "",
          Status: "Pending",
          DocumentDetails: [],
          Section: this.ValidHomeLoanObject_HPD.b[0].Code,
          ChildProductJson: null,
          Modetype : UIMode.Edit
        }
      } else {

        if (this.editableObj &&  this.editableObj.ChildProductJson != null && this.isGuid(this.editableObj.ChildProductJson.Id)) {

          childProductObject = null;
        }
        else {
          if (this.ValidHomeLoanObject_HPD) {
            childProductObject = {

              Id: this.editableObj !== null && this.editableObj.ChildProductJson != null ? this.editableObj.ChildProductJson.Id : UUID.UUID(),
              ProductId: this.ValidHomeLoanObject_HPD.ProductId,
              Name: this.ValidHomeLoanObject_HPD.ProductName,
              ProductCode: this.ValidHomeLoanObject_HPD.ProductCode,
              AmtInvested: this.lhpForm.get('Sec24ChildProductAmount').value,
              AmtApproved: 0,
              Remarks: "",
              Status: "Pending",
              DocumentDetails: [],
              Section: this.ValidHomeLoanObject_HPD.b[0].Code,
              ChildProductJson: null,
              Modetype : UIMode.Delete
            }
          }
          }
      }

      var deductionExemp = new DeductionExemption() as any;
      deductionExemp.Id = this.editableObj !== null ? this.editableObj.Id : this.Id;
      deductionExemp.ProductId = this.categoryJson.ProductId;
      deductionExemp.Name = this.categoryJson.ProductName;
      deductionExemp.ProductCode = this.categoryJson.ProductCode;
      deductionExemp.AmtInvested = this.whichCategory.toString() === 'duduction_Additional' ? this.CalcLHP() : this.whichCategory.toString() === 'duduction' ? this.CalcHRA() : this.KeyAmount;
      deductionExemp.AmtApproved = this.editableObj !== null ? this.editableObj.AmtApproved : 0;
      deductionExemp.Section = this.categoryJson.b[0].Code;
      deductionExemp.Remarks = this.KeyRemarks;
      deductionExemp.Status = "Pending";
      deductionExemp.DocumentDetails = empInvtDocs;
      deductionExemp.ChildProductJson = childProductObject;



      // deductionExemp.DocumentId = this.DocumentId;
      this.whichCategory.toString() === 'duduction_Additional' ? deductionExemp.AdditionalDetailsObject = this.lhpForm.value : null;
      this.whichCategory.toString() === 'duduction' ? deductionExemp.AdditionalList = this.LstHRA : this.whichCategory.toString() === 'duduction_Medical' ? deductionExemp.AdditionalList = this.LstMedical : null
      console.log(deductionExemp);

      this.drawerRef.close(deductionExemp);
    }
    else if ((this.whichCategory.toString() == 'deduction_Loan' || this.whichCategory.toString() == 'deduction_Self') && (!isNaN(this.KeyAmount) && this.KeyAmount != undefined && this.KeyAmount != '' && this.KeyAmount != null)) {
      var deductionExemp = new DeductionExemption() as any;
      deductionExemp.Id = this.editableObj !== null ? this.editableObj.Id : this.Id;
      deductionExemp.ProductId = this.categoryJson.ProductId;
      deductionExemp.Name = this.categoryJson.ProductName;
      deductionExemp.ProductCode = this.categoryJson.ProductCode;
      deductionExemp.AmtInvested = this.KeyAmount;
      deductionExemp.AmtApproved = this.editableObj !== null ? this.editableObj.AmtApproved : 0;
      deductionExemp.Section = this.categoryJson.b[0].Code;
      deductionExemp.Remarks = this.KeyRemarks;
      deductionExemp.Status = "Pending";
      deductionExemp.DocumentDetails = empInvtDocs;
      deductionExemp.ChildProductJson = null;
      // deductionExemp.DocumentId = this.DocumentId;
      this.whichCategory.toString() === 'deduction_Self' ? deductionExemp.AdditionalAction = this.checkClaiming : null
      this.drawerRef.close(deductionExemp);

    }

    else {
    }
  }

  calculcateMedicalAmount(item) {
    var sum = 0;
    item.forEach(e => { sum += parseInt(e.Amount) })
    return sum;
  }

  CalcLHP() {
    var calculatedAmt = this.lhpForm.controls.occupanyType.value === 'rentedOut' ?
      Number(this.lhpForm.controls.AnnualRent.value) - Number(this.lhpForm.controls.MunicipalTaxesPaid.value) -
      (Number(this.lhpForm.controls.AnnualRent.value) - Number(this.lhpForm.controls.MunicipalTaxesPaid.value) % 30) -
      Number(this.lhpForm.controls.InterestPaid.value) : Number(this.lhpForm.controls.InterestPaid.value);
    console.log('calculatedAmt', calculatedAmt);
    return calculatedAmt;
  }
  CalcHRA() {
    var sum = 0
    this.LstHRA.forEach(e => { sum += parseInt(e.RentAmountPaid) })
    this.KeyAmount = sum;
    return sum;
  }

  onChangeHRA_table() {
    var sum = 0
    this.LstHRA.forEach(e => { sum += parseInt(e.RentAmountPaid) })
    console.log('SUM OF AMOUNT :', sum);

    if (sum >= environment.environment.HRAMaximumAmountForValidation) {
      this.isPanMandatoryForHRA = true;
    } else {
      this.isPanMandatoryForHRA = false;
    }

  }
  cancel(): void {

    var result3 = [];
    console.log('ss', this.firstPreLoadDocumentId);
    console.log('LstmultipleDocs', this.LstmultipleDocs);

    if (this.Mode == false && this.editableObj != null && this.firstPreLoadDocumentId.length > 0 && this.LstmultipleDocs.length > 0) {
      result3 = _(this.LstmultipleDocs)
        .differenceBy(this.firstPreLoadDocumentId, 'DocumentId')
        .map(_.partial(_.pick, _, 'DocumentId'))
        .value();
    }
    if (result3.length > 0) {
      this.alertService.showWarning("On this page, you have unsaved changes. Kindly ensure to save your edits.");
      return;
    }

    if (this.Mode == false && this.editableObj != null && this.firstPreLoadDocumentId.length != this.LstmultipleDocs.length) {
      this.alertService.showWarning("On this page, you have unsaved changes. Kindly ensure to save your edits.");
      return;
    }

    if (this.Mode == false && this.editableObj != null && this.LstmultipleDocs.length == 0) {
      this.alertService.showWarning("At least one attachment must be included.");
      return;
    }
    this.drawerRef.close();
  }

  onChangeEntryType(event) {
    console.log('this.oldEntryType', this.oldEntryType);
    if (this.LstHRA.length > 0 && this.EntryType != this.oldEntryType) {
      this.alertService.confirmSwal("Are you sure you want clear previously added items?", "Observer you actions - If you are sure they are no longer editing this data.", "Yes, Clear").then(result => {

        this.deleteAll(null);
      })
        .catch(error => {

          this.EntryType = this.oldEntryType;
        });
      return;
    } else {

      this.oldEntryType = this.EntryType;
      console.log('event', event);
      let today = new Date();
      console.log('TODAY :: ', today);
      let stdate = new Date();
      if (today.getMonth() > 2) {
        stdate = new Date(today.getFullYear(), 3, 1);
      } else {
        let year = (today.getFullYear() - 1);
        stdate = new Date(year, 3, 1);
      }
      let istdate = moment(stdate).format('YYYY-MM-DD');
      var currentDate = moment(istdate);

      if (event.Id === 1) {
        for (let i = 0; i < 12; i++) {
          var futureMonth = moment(currentDate).add(i, 'M');
          const startOfMonth = moment(futureMonth).startOf('month').format('YYYY-MM-DD');
          const endOfMonth = moment(futureMonth).endOf('month').format('YYYY-MM-DD');
          console.log('startOfMonth :', startOfMonth);
          console.log('endOfMonth :', endOfMonth);
          this.LstHRA.push({
            EntryType: this.EntryType,
            Id: UUID.UUID(),
            StartDate: new Date(startOfMonth),
            EndDate: new Date(endOfMonth),
            NameofCity: null,
            RentAmountPaid: 0,
            PANofLandlord: '',
            LandlordAddress: '',
            NameofLandlord: '',
            RentalHouseAddress: '',
            isChecked: false,

          })
        }
      }
      else if (event.Id === 2) {
        let count = 6;
        // for (let i = 0; i < 2; i++) {

        //   var futureMonth = moment(currentDate).add(count, 'M');
        const startOfMonth = moment('2021-04-01').format('YYYY-MM-DD');
        const endOfMonth = moment('2021-09-30').format('YYYY-MM-DD');
        const startOfMonth1 = moment('2021-10-01').format('YYYY-MM-DD');
        const endOfMonth1 = moment('2022-03-31').format('YYYY-MM-DD');
        count += 6;
        this.LstHRA.push({
          EntryType: this.EntryType,
          Id: UUID.UUID(),
          StartDate: new Date(startOfMonth),
          EndDate: new Date(endOfMonth),
          NameofCity: null,
          RentAmountPaid: 0,
          PANofLandlord: '',
          LandlordAddress: '',
          NameofLandlord: '',
          RentalHouseAddress: '',
          isChecked: false,
        },
          {
            EntryType: this.EntryType,
            Id: UUID.UUID(),
            StartDate: new Date(startOfMonth1),
            EndDate: new Date(endOfMonth1),
            NameofCity: null,
            RentAmountPaid: 0,
            PANofLandlord: '',
            LandlordAddress: '',
            NameofLandlord: '',
            RentalHouseAddress: '',
            isChecked: false,

          })
        // }
      }

      console.log('LST HRA', this.LstHRA);
    }

  }
  fillBelow(item) {

    this.LstHRA.forEach(element => {
      // if (element.EntryType === 1) {
      element.isChecked = item.isChecked;
      element.RentAmountPaid = item.RentAmountPaid;
      element.NameofCity = item.NameofCity;
      // }
    });
    console.log('LST HRA 2', this.LstHRA);
    this.onChangeHRA_table();
  }
  public findInvalidControls() {
    const invalid = [];
    const controls = this.lhpForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    console.log('invalid', invalid);

    return invalid;
  }

  deleteAll(item) {
    this.LandlordAddress = null;
    this.PANofLandlord = null;
    this.NameofLandlord = null;
    this.RentalHouseAddress = null;

    console.log('LST HRA 111', this.LstHRA);
    this.LstHRA.forEach(element => {
      if (this.isGuid(element.Id) == false) {
        element.Modetype = UIMode.Delete;
        this.deletedLstHRA.push(element)
      }
    });
    console.log('dele', this.deletedLstHRA);
    ``
    this.EntryType = null;
    this.LstHRA = [];
    this.onChangeHRA_table();

  }
  onChangeIsMetroCity(i, e) {
    this.LstHRA.find(a => a.Id == i.Id).NameofCity = null;
  }

  editHRA(item) {

    item.StartDate = new Date(item.StartDate);
    item.EndDate = new Date(item.EndDate);
    this.addHRA(item);
  }

  addHRA(item) {
    console.log('edit', item);
    const modalRef = this.modalService.open(HramodalComponent, this.modalOption);
    modalRef.componentInstance.EntryType = this.EntryType;
    modalRef.componentInstance.Mode = this.Mode;
    modalRef.componentInstance.editJson = (item);
    modalRef.componentInstance.CityList = JSON.stringify(this.CityList)

    modalRef.result.then((result) => {
      console.log(' HRA MODAL RESULT : ', result);
      result.isChecked = true;
      if (result !== "Modal Closed") {
        var sum = 0;
        // result.StartDate = moment(result.StartDate).format('DD-MM-YYYY');
        // result.EndDate = moment(result.EndDate).format('DD-MM-YYYY');
        result.NameofCity = Number(result.NameofCity);
        if (this.LstHRA.length > 0) {
          var foundIndex = this.LstHRA.findIndex(x => x.Id == result.Id);
          console.log('foundIndex', foundIndex);

          if (foundIndex === -1) {
            this.LstHRA.push(result);

          } else {
            this.LstHRA[foundIndex] = result;
          }
        } else { this.LstHRA.push(result); }
        this.LstHRA.forEach(e => { sum += parseInt(e.RentAmountPaid) })
        this.KeyAmount = sum;

        console.log('LST', this.LstHRA);


      }
    }).catch((error) => {
      console.log(error);
    });
  }


  get g() { return this.lhpForm.controls; } // reactive forms validation 

  createForm() {
    var tempId = (this.editableObj === null ? UUID.UUID() : this.editableObj.AdditionalDetailsObject.Id);
    this.lhpForm = this.formBuilder.group({
      Id: [tempId],
      isFirstTime: [false, Validators.required],
      occupanyType: ['selfOccupied', Validators.required],
      addressOfProperty: [null, Validators.required],
      ownership: [null, Validators.required],
      AnnualRent: [0],
      MunicipalTaxesPaid: [0],
      LoanAvailedDate: [null, Validators.required],
      PropertyPossessionDate: [null, Validators.required],
      InterestPaid: [null, Validators.required],
      PrincipalAmount: [null, Validators.required], // extra prop
      Pre_ConstructionInterest: [null, Validators.required],
      InstallmentNumber: [null, Validators.required],
      NameOfLender: [null, Validators.required],
      PANofLender: [null, Validators.required],
      addressOfLender: [null, Validators.required],
      Sec24ChildProductAmount: [0]
    });
    this.editableObj !== null && this.pre_binding_patch();
  }
  doChangeHomeLoanAvailedDate(event) {
    this.IsValidToTakeHomeLoanAmount = false;
    console.log(event);
    console.log(this.ChildProductJson);
    this.doCheckIsAvailToTakeHomeLoanAmount();

  }
  doChangeHomeLoanPossessionDate(event) {
    this.IsValidToTakeHomeLoanAmount = false;
    console.log(event);
    this.doCheckIsAvailToTakeHomeLoanAmount();
  }
  doCheckIsAvailToTakeHomeLoanAmount() {
    this.IsValidToTakeHomeLoanAmount = false;

    for (let index = 0; index < this.ChildProductJson.length; index++) {
      const element = this.ChildProductJson[index];
      console.log('element', element); 

      this.IsValidToTakeHomeLoanAmount = moment(this.lhpForm.get('LoanAvailedDate').value).isBetween(moment(element.b[0].ValidFrom).format('YYYY-MM-DD'), moment(element.b[0].ValidTill).format('YYYY-MM-DD')); // true
      // this.IsValidToTakeHomeLoanAmount = moment(this.lhpForm.get('PropertyPossessionDate').value).isBetween(moment(element.b[0].ValidFrom).format('YYYY-MM-DD'), moment(element.b[0].ValidTill).format('YYYY-MM-DD')); // true
      this.IsValidToTakeHomeLoanAmount == false ? this.IsValidToTakeHomeLoanAmount = moment(element.b[0].ValidFrom).isSame(moment(this.lhpForm.get('LoanAvailedDate').value).format('YYYY-MM-DD')) : null;
      // this.IsValidToTakeHomeLoanAmount == false ? this.IsValidToTakeHomeLoanAmount = moment(element.b[0].ValidFrom).isSame(moment(this.lhpForm.get('PropertyPossessionDate').value).format('YYYY-MM-DD')) : null;
      this.IsValidToTakeHomeLoanAmount == false ? this.IsValidToTakeHomeLoanAmount = moment(element.b[0].ValidTill).isSame(moment(this.lhpForm.get('LoanAvailedDate').value).format('YYYY-MM-DD')) : null;
      // this.IsValidToTakeHomeLoanAmount == false ? this.IsValidToTakeHomeLoanAmount = moment(element.b[0].ValidTill).isSame(moment(this.lhpForm.get('PropertyPossessionDate').value).format('YYYY-MM-DD')) : null;
      this.ValidHomeLoanObject_HPD = element;
      if (this.IsValidToTakeHomeLoanAmount) {

        break;
      }
      console.log('sdfsdfds', this.IsValidToTakeHomeLoanAmount);

      console.log(' this.ValidHomeLoanObject_HPD', this.ValidHomeLoanObject_HPD);

    }

  }

  doChangeHomeLoanAvailAmount(event) {
    if (this.ValidHomeLoanObject_HPD && this.ValidHomeLoanObject_HPD.b[0].ThresholdLimit < Number(event.target.value)) {
      this.alertService.showWarning('Please ensure the entered home loan avail amount is valid. It must be equal to or less than:' + this.ValidHomeLoanObject_HPD.b[0].ThresholdLimit);
      this.lhpForm.controls['Sec24ChildProductAmount'].setValue(0);
      return;
    }
  }


  OnChangeoccupanyType(index) {
    if (index == 1) {
      this.updateValidation(true, this.lhpForm.get('AnnualRent'));
      this.updateValidation(true, this.lhpForm.get('MunicipalTaxesPaid'));
    } else {
      this.updateValidation(false, this.lhpForm.get('AnnualRent'));
      this.updateValidation(false, this.lhpForm.get('MunicipalTaxesPaid'));
    }
  }

  pre_binding_patch() {
    // console.log('this.editableObj.AdditionalDetailsObject', this.editableObj.AdditionalDetailsObject); 
    // this.editableObj.AdditionalDetailsObject.PropertyPossessionDate = new Date( this.editableObj.AdditionalDetailsObject.PropertyPossessionDate);
    // this.editableObj.AdditionalDetailsObject.LoanAvailedDate = new Date( this.editableObj.AdditionalDetailsObject.LoanAvailedDate);
    // this.editableObj.AdditionalDetailsObject.PropertyPossessionDate =  moment(this.editableObj.AdditionalDetailsObject.PropertyPossessionDate).format('YYYY-MM-DD');
    // this.editableObj.AdditionalDetailsObject.LoanAvailedDate =  moment(this.editableObj.AdditionalDetailsObject.LoanAvailedDate, 'DD-MM-YYYY').format('YYYY-MM-DD');
    // console.log('this.editableObj.AdditionalDetailsObject d', this.editableObj.AdditionalDetailsObject); 

    this.lhpForm.patchValue(this.editableObj.AdditionalDetailsObject);
    //   this.lhpForm.controls['PropertyPossessionDate'].setValue(this.datePipe.transform(new Date(this.editableObj.AdditionalDetailsObject.PropertyPossessionDate), "dd-MM-yyyy"))
    //   this.lhpForm.controls['LoanAvailedDate'].setValue(this.datePipe.transform(new Date(this.editableObj.AdditionalDetailsObject.LoanAvailedDate), "dd-MM-yyyy"))

    this.lhpForm.controls['PropertyPossessionDate'].setValue(new Date(this.editableObj.AdditionalDetailsObject.PropertyPossessionDate))
    this.lhpForm.controls['LoanAvailedDate'].setValue(new Date(this.editableObj.AdditionalDetailsObject.LoanAvailedDate))
  }
  //TODO:To update formgroup validation
  updateValidation(value, control: AbstractControl) {
    if (value) {
      control.setValidators([Validators.required]);
    } else {
      control.clearValidators();
      control.setErrors(null);
    }
    control.updateValueAndValidity();
  }
  editDependent(item) {
    this.addDependent(item);
  }

  addDependent(item) {

    const modalRef = this.modalService.open(MedicdependentModalComponent, this.modalOption);
    modalRef.componentInstance.Mode = this.Mode;
    modalRef.componentInstance.ProductInfo = JSON.stringify(this.categoryJson);
    modalRef.componentInstance.medicType = this.categoryJson.b[0].Code.toUpperCase() == 'SEC80D' ? "medicInsurance" : this.categoryJson.b[0].Code.toUpperCase() == 'SEC80DD' ? "medicInsuranceHandicap" : "medicInsuranceSelf";
    modalRef.componentInstance.editJson = JSON.stringify(item)

    modalRef.result.then((result) => {
      console.log(' Medical MODAL RESULT : ', result);
      if (result != 'Modal Closed') {

        var sum = 0;

        if (this.LstMedical.length > 0) {
          var foundIndex = this.LstMedical.findIndex(x => x.Id == result.Id);
          console.log('foundIndex', foundIndex);

          if (foundIndex === -1) {
            this.LstMedical.push(result);

          } else {
            this.LstMedical[foundIndex] = result;
          }
        } else { this.LstMedical.push(result); }
        this.LstMedical.forEach(e => { sum += parseInt(e.Amount) })
        this.KeyAmount = sum;


      }
    }).catch((error) => {
      console.log(error);
    });
  }
  history() {

  }
  getLetterSpace(string) {
    return string.replace(/([a-z])([A-Z])/g, '$1 $2')
  }


  onFileUpload(e) {
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
        // this.FileName = file.name;
        let FileUrl = (reader.result as string).split(",")[1];
        this.doAsyncUpload(FileUrl, file.name)
      };
    }
  }

  doAsyncUpload(filebytes, filename) {

    try {
      let objStorage = new ObjectStorageDetails();
      objStorage.Id = 0;
      objStorage.EmployeeId = this.objStorageJson.EmployeeId;
      objStorage.ClientContractCode = this.BusinessType == 3 ? "" : this.sessionService.getSessionStorage("default_ContractCode") == null ? "" : this.sessionService.getSessionStorage("default_ContractCode").toString();
      objStorage.ClientCode = this.BusinessType == 3 ? "" : this.sessionService.getSessionStorage("default_ClientCode") == null ? "" : this.sessionService.getSessionStorage("default_ClientCode").toString();
      objStorage.CompanyCode = this.sessionService.getSessionStorage("CompanyCode") == null ? "" : this.sessionService.getSessionStorage("CompanyCode").toString();
      objStorage.ClientContractId = this.objStorageJson.ClientContractId;
      objStorage.ClientId = this.objStorageJson.ClientId;
      objStorage.CompanyId = this.objStorageJson.CompanyId;
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

            this.LstmultipleDocs.push({
              FileName: filename,
              DocumentId: apiResult.Result,
              Status: 0,
              ApprovedAmount: 0
            })
            // this.DocumentId = apiResult.Result;
            this.unsavedDocumentLst.push({
              Id: apiResult.Result
            })
            this.isLoading = true;
            this.alertService.showSuccess("You have successfully uploaded this file!")

          }
          else {
            // this.FileName = null;
            this.isLoading = true;
            this.alertService.showWarning("An error occurred while  trying to upload! " + apiResult.Message)
          }
        } catch (error) {
          // this.FileName = null;
          this.isLoading = true;
          this.alertService.showWarning("An error occurred while  trying to upload! " + error)
        }
      }), ((err) => {

      })

      console.log(objStorage);
    } catch (error) {
      // this.FileName = null;
      this.alertService.showWarning("An error occurred while  trying to upload! " + error)
      this.isLoading = true;
    }

  }

  isGuid(stringToTest) {
    if (stringToTest[0] === "{") {
      stringToTest = stringToTest.substring(1, stringToTest.length - 1);
    }
    var regexGuid = /^(\{){0,1}[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}(\}){0,1}$/gi;
    return regexGuid.test(stringToTest);
  }


  doDeleteFile(item) {
    if (item.Status == 1) {
      this.alertService.showWarning("Attention : This action was blocked. One or more attachement cannot be deleted because the status is in an invalid state.");
      return;
    }

    this.alertService.confirmSwal("Are you sure you want to delete?", "This item will be deleted immediately. You can't undo this file.", "Yes, Delete").then(result => {
      this.deleteAsync(item);
      // this.isGuid(this.Id) ? this.deleteAsync(item) : null // this.editableObj !== null && this.editableObj.DocumentId !== this.DocumentId ? this.deleteAsync() :
      // this.FileName = null;
    })
      .catch(error => { });

  }


  deleteAsync(item) {
    this.isLoading = false;
    this.spinnerText = "Deleting";
    this.fileuploadService.deleteObjectStorage((item.DocumentId)).subscribe((res) => {
      let apiResult: apiResult = (res);
      try {
        if (apiResult.Status) {
          var index = this.unsavedDocumentLst.map(function (el) {
            return el.Id
          }).indexOf(item.DocumentId)
          this.unsavedDocumentLst.splice(index, 1)

          var index1 = this.LstmultipleDocs.map(function (el) {
            return el.DocumentId
          }).indexOf(item.DocumentId)
          this.LstmultipleDocs.splice(index1, 1)

          // this.FileName = null;
          // this.DocumentId = null;
          this.isLoading = true;
          this.alertService.showSuccess("Awesome!...  Your file is deleted successfully!")
        } else {
          this.isLoading = true;
          this.alertService.showWarning("An error occurred while  trying to delete! " + apiResult.Message)
        }
      } catch (error) {

        this.alertService.showWarning("An error occurred while  trying to delete! " + error)
      }

    }), ((err) => {

    })

  }
  unsavedDeleteFile(_DocumentId) {
    this.fileuploadService.deleteObjectStorage((_DocumentId)).subscribe((res) => {
      console.log(res);
      let apiResult: apiResult = (res);
      try {
        if (apiResult.Status) {
          var index = this.unsavedDocumentLst.map(function (el) {
            return el.Id
          }).indexOf(_DocumentId)
          this.unsavedDocumentLst.splice(index, 1)
        } else {
        }
      } catch (error) {
      }
    }), ((err) => {
    })
  }


  _loadEmpUILookUpDetails() {

    this.employeeService.get_LoadEmployeeUILookUpDetails(this.objStorageJson.EmployeeId)
      .subscribe((result) => {
        let apiResponse: apiResponse = result;
        if (apiResponse.Status) {
          this.lstlookUpDetails = JSON.parse(apiResponse.dynamicObject) as any;
          console.log('LOOK UP DETAILS EMP :', this.lstlookUpDetails);


        }

      }, err => {

      })
  }

  getRelationShip(relationShipId) {
    let relationship = [];
    relationship = this.utilsHelper.transform(RelationShip) as any;
    return relationship.find(item => item.id == relationShipId).name;
  }

}

