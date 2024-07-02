import {
  ChangeDetectorRef,
  Component,
  Injectable,
  Input,
  OnInit
} from "@angular/core";
import {
  FormBuilder,
  NgForm,
} from "@angular/forms";
import { NgbActiveModal, NgbModal, NgbModalOptions } from "@ng-bootstrap/ng-bootstrap";
import { apiResult } from "src/app/_services/model/apiResult";
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
import {
  PaymentSourceType,
  DeductionType,
  DeductionStatus,
  SuspensionType,
  EndStatus,
  EmployeeDeductions,
} from "src/app/_services/model/Employee/EmployeeDeductions";
import { EmployeeDetails } from "src/app/_services/model/Employee/EmployeeDetails";
import { AlertService, EmployeeService, PayrollService } from "src/app/_services/service";
import Swal from "sweetalert2";
import * as _ from "lodash";
import * as moment from "moment";
import { EmployeeDeductionModel } from "src/app/_services/model/Employee/employee-deduction-model";
import { UIMode } from "src/app/_services/model/Common/BaseModel";
import { EmployeeDeductionScheduleDetails } from "src/app/_services/model/Employee/employee-deduction-schedule-details";
import { EmployeeSuspendedDeductions, DeductionPayItemStatus } from "src/app/_services/model/Employee/employee-deduction-suspended-details";
import {
  AngularGridInstance,
  Column,
  GridOption,
  GridService
} from "angular-slickgrid";
import { NzDrawerRef, NzDrawerService } from "ng-zorro-antd";
import { E } from "@angular/cdk/keycodes";

@Component({
  selector: "app-employeedeductionmodal",
  templateUrl: "./employeedeductionmodal.component.html",
  styleUrls: ["./employeedeductionmodal.component.css"],
})
@Injectable()
export class EmployeedeductionmodalComponent implements OnInit {
  //#region Intialize Parameters

  @Input() id: number;
  @Input() employeeDetails: EmployeeDetails;
  @Input() employeeDeductionDetails: EmployeeDeductions;
  @Input() gridId: string;
  @Input() AddDeductionType: string;
  @Input() timeCardObj: any;
  paymentSourceType = PaymentSourceType;
  deductionSourceType = DeductionType;
  deductionStatus = DeductionStatus;
  suspensionType = SuspensionType;
  endStatus = EndStatus;
  paymentSourceTypeList = [];
  deductionTypeList = [];
  deductionStatusList = [];
  suspensionTypeList = [];
  endStatusList = [];
  productList = [];
  payperiodList = [];
  schedule_CardVisible: boolean = false;
  schedule_CalendarBased: boolean = false;
  CheckBoxisChecked: boolean;
  suspended_CardVisible: boolean = false;
  EndStatusPeriod_CardVisible: boolean = false;
  NoOfOccurrences_CardVisible: boolean = false;
  DeductionAmount_CardVisible: boolean = false;
  Id: number;
  isLoading: boolean = true;
  disableBtn = false;
  employeeDeduction: EmployeeDeductions;
  spinnerText: string = "Uploading";
  employeeDeductionModel: EmployeeDeductionModel = new EmployeeDeductionModel();
  employeeDedForm: NgForm;
  lstEmployeeScheduleDetails: Array<EmployeeDeductionScheduleDetails>;
  lstEmployeeSuspendDetails: Array<EmployeeSuspendedDeductions>;
  gridOptions_EmployeeScheduleDetails: GridOption = {};
  columnDefinitions_EmployeeDeduction: Column[] = [];
  angularGrid_EmployeeSchedule: AngularGridInstance;
  title = "ngSlickGrid";
  disableConfirmDetailsBtn = true;
  columnDefinitions: Column[] = [];
  gridOptions: GridOption = {};
  dataset: any[] = [];
  generateButtonVisible: boolean = true;
  rulesGridInstance: AngularGridInstance;
  rulesGrid: any;
  rulesGridService: GridService;
  dataView: any;
  gridEmployeeDeduction: string = "gridEmployeeDeduction";
  Suspension_CardVisible: boolean = false;
  modalOption: NgbModalOptions = {};
  initDeductionArr: any;
  initAmount: Float32Array;
  CheckdVal: boolean;
  spinner: boolean;
  SelectScheduleDetails: any;
  deductionProductList: any;
  EndpayperiodList: any;
  // Susp_ModelVal1: boolean;
  // Susp_ModelVal2: boolean;
  // Susp_ModelVal3: boolean;
  // Susp_ModelVal4: boolean;
  SusStartPeriodId: any;
  SusEndPayPeriodId: any;
  SuspendTypeId: any;
  paymentDate: any;
  showNextPeriodName: string = '';
  startPeriodList: any = [];
  endPeriodList: any = [];
  hideSuspendRescheduleBtns = false;
  installmentChanged = false;
  TotalDeductionAmountLabel: string = 'Amount';
  radioSelectedForSuspendType: any = "4";
  showUpdateSuspendTypeBtn = false;
  cdRef: ChangeDetectorRef;
  //#endregion

  //#region Constructor

  constructor(
    public employeeService: EmployeeService,
    private formBuilder: FormBuilder,
    private activeModal: NgbActiveModal,
    private drawerService: NzDrawerService,
    private alertService: AlertService,
    private drawerRef: NzDrawerRef<string>,
    private modalService: NgbModal,
    private loadingScreenService: LoadingScreenService,
    private payrollService: PayrollService,
    cdRef: ChangeDetectorRef,
  ) { this.cdRef = cdRef; }

  //#endregion

  //#region Page Load Events

  ngOnInit() {
    //debugger;
    this.SelectScheduleDetails = null;
    this.showUpdateSuspendTypeBtn = this.AddDeductionType == 'Update Deduction' ? true : false;
    console.log('selected employee details', this.employeeDeductionDetails);
    if (this.employeeDeductionDetails) {
      this.CheckBoxisChecked = this.employeeDeductionDetails.IsDeductionAgainstPayment;
      this.radioSelectedForSuspendType = this.employeeDeductionDetails.SuspensionType.toString() == '0' ? '4' : this.employeeDeductionDetails.SuspensionType.toString();
    } else {
      this.CheckBoxisChecked = true;
      this.radioSelectedForSuspendType = "4";
    }

    if (this.employeeDeductionDetails && this.employeeDeductionDetails.IsCarryForwarded) {
      this.alertService.showWarning('Please check the Deduction Calendar details and reset installment amount');
    }
    this.getDeductionControlList();
    this.gridOptionBinding();

    if (this.employeeDeductionDetails != null && this.employeeDeductionDetails.Id > 0) {
      this.generateButtonVisible = false;
      this.employeeDeduction = this.employeeDeductionDetails;
      this.employeeDeduction.EmployeeSuspndDeductions = this.employeeDeductionDetails.EmployeeSuspndDeductions;
      this.employeeDeduction.PaymentDate = moment(this.employeeDeductionDetails.PaymentDate).format("YYYY-MM-DD");
      this.paymentDate = new Date(this.employeeDeductionDetails.PaymentDate);
      this.employeeDeduction.EmployeeSuspndDeductions.forEach(obj1 => {
        this.employeeDeduction.EmployeeDednScheduleDetails.forEach(obj2 => {
          if (obj1.EmployeeDeductionManagementId == obj2.EmployeeDeductionManagementId && obj1.PayPeriodId == obj2.DeductionPeriodId) {
            obj2['IsSuspended'] = true;
          }
          else {
            if (obj2['IsSuspended'] && obj2['IsSuspended'] == true) {

            }
            else {
              obj2['IsSuspended'] = false;
            }

          }
        })
      });
      this.lstEmployeeScheduleDetails = this.employeeDeduction.EmployeeDednScheduleDetails;
      console.log('***', this.lstEmployeeScheduleDetails);
      this.initDeductionArr = "";
      this.initDeductionArr = JSON.stringify(this.lstEmployeeScheduleDetails);
      for (var i in this.lstEmployeeScheduleDetails) {
        this.lstEmployeeScheduleDetails[i]['Select_Val'] = false;
        // this.payperiodList.forEach(el => {
        //   if (el.Id == this.lstEmployeeScheduleDetails[i].DeductionPeriodId) {
        //     this.lstEmployeeScheduleDetails[i].DeductionPeriodName = el.PayCyclePeriodName;
        //   }
        // })
      }
      let deductionType = this.deductionTypeList.find((p) => p.Id == this.employeeDeduction.DeductionType);
      this.schedule_CardVisible = true;
      // if (deductionType && deductionType.Name == "ScheduleBased") {
      if (deductionType && deductionType.Name == "CalendarBased") {
        this.schedule_CardVisible = true;
        let endStatus = this.endStatusList.find(
          (p) => p.Id == this.employeeDeduction.EndStatus
        );
        if (endStatus.Name == "ENDPAYPERIOD") {
          this.EndStatusPeriod_CardVisible = true;
          this.NoOfOccurrences_CardVisible = false;
          this.DeductionAmount_CardVisible = false;
        } else if (endStatus.Name == "NOOFOCCURRENCES") {
          this.NoOfOccurrences_CardVisible = true;
          this.EndStatusPeriod_CardVisible = false;
          this.DeductionAmount_CardVisible = false;
        } else if (endStatus.Name == "DEDNAMOUNT") {
          this.NoOfOccurrences_CardVisible = false;
          this.EndStatusPeriod_CardVisible = false;
          this.DeductionAmount_CardVisible = true;
        } else {
          this.EndStatusPeriod_CardVisible = false;
          this.NoOfOccurrences_CardVisible = false;
          this.DeductionAmount_CardVisible = false;
        }
      } else {
        //this.schedule_CardVisible = false;
        this.EndStatusPeriod_CardVisible = false;
        this.NoOfOccurrences_CardVisible = false;
      }
    } else {
      this.generateButtonVisible = true;
      this.employeeDeduction = new EmployeeDeductions();
    }

    if (this.AddDeductionType == 'Update Deduction') {
      this.generateButtonVisible = false;
    }
    console.log(this.AddDeductionType);
  }

  //#endregion

  //#region Button Events

  confirmExit() {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: "btn btn-primary",
        cancelButton: "btn btn-danger",
      },
      buttonsStyling: true,
    });
    swalWithBootstrapButtons
      .fire({
        title: "Are you sure?",
        text:
          this.disableBtn == true
            ? "You won't be able to revert this!"
            : "Are you sure you want to exit?",
        type: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, Exit!",
        allowOutsideClick: false,
        cancelButtonText: "No, cancel!",
        reverseButtons: true,
      })
      .then((result) => {
        if (result.value) {
          try {
            this.closeModal();
          } catch (error) { }
        } else if (
          /* Read more about handling dismissals below */
          result.dismiss === Swal.DismissReason.cancel
        ) {
        }
      });
  }

  closeModal() {
    this.activeModal.close("Modal Closed");
  }
  noOfOccurenceschngFn() {
    this.employeeDeduction.EndPayPeriodId = null;
    // this.employeeDeduction.StartPeriodId = null;
    this.disableConfirmDetailsBtn = true;
    // CHECKS FOR NO.OF OCCURENCE
    this.EndpayperiodList = this.payperiodList.filter(obj => (obj.Id > this.employeeDeduction.StartPeriodId));
    if (this.employeeDeduction.NoOfOccurrences == 1) {
      this.employeeDeduction.EndPayPeriodId = this.employeeDeduction.StartPeriodId;
    } else if (!(this.EndpayperiodList.length >= (this.employeeDeduction.NoOfOccurrences - 1))) {
      this.employeeDeduction.EndPayPeriodId = null;
      // return this.alertService.showWarning('Future pay periods was not generated.');
    } else if (this.employeeDeduction.NoOfOccurrences) {
      for (var i in this.EndpayperiodList) {
        if (parseInt(i) + 2 == this.employeeDeduction.NoOfOccurrences) {
          this.employeeDeduction.EndPayPeriodId = this.EndpayperiodList[i].Id;
        }
      }
    }
  }
  deductionAmountChangeFn() {
    this.generateButtonVisible = true;
    this.disableConfirmDetailsBtn = true;
  }

  StartPayperiodClickFn() {
    // debugger;
    this.generateButtonVisible = true;
    this.disableConfirmDetailsBtn = true;
    this.EndpayperiodList = this.payperiodList.filter(obj => (obj.Id > this.employeeDeduction.StartPeriodId));
    // set no.of occurence value on change of start period and end period value is there
    if (this.employeeDeduction.StartPeriodId && this.employeeDeduction.EndPayPeriodId)  {
      this.employeeDeduction.NoOfOccurrences = 0;
      this.employeeDeduction.NoOfOccurrences = this.employeeDeduction.EndPayPeriodId - this.employeeDeduction.StartPeriodId;
      const count = this.payperiodList.filter((a) => {
        if (a.Id <= this.employeeDeduction.EndPayPeriodId && a.Id >= this.employeeDeduction.StartPeriodId) {
          return a.Id;
        }
      });
      this.employeeDeduction.NoOfOccurrences = count.length;
    }

    // SET DEDUCTION TYPE VALUE
    this.employeeDeduction.DeductionType = DeductionType.CalendarBased;
  }
  onEndPeriodChange() {
    this.generateButtonVisible = true;
    this.disableConfirmDetailsBtn = true;
    this.employeeDeduction.NoOfOccurrences = 0;
    if (this.employeeDeduction.StartPeriodId && this.employeeDeduction.EndPayPeriodId)  {
      const count = this.payperiodList.filter((a) => {
        if (a.Id <= this.employeeDeduction.EndPayPeriodId && a.Id >= this.employeeDeduction.StartPeriodId) {
          return a.Id;
        }
      });
      this.employeeDeduction.NoOfOccurrences = count.length;
    }
  }
  onChangeFromSuspendPeriod() {
    this.EndpayperiodList = this.payperiodList.filter(obj => (obj.Id > this.SusStartPeriodId));
  }
  addDeduction(employeeDedForm: NgForm) {
    if (employeeDedForm.valid && this.lstEmployeeScheduleDetails.length > 0) {
      this.generateButtonVisible = false;
      if (this.employeeDeduction.Id == 0) {
        this.employeeDeductionModel.OldDetails = this.employeeDeduction;
        this.employeeDeductionModel.NewDetails = this.employeeDeduction;
      } else {
        this.employeeDeductionModel.OldDetails = this.employeeDeductionDetails;
        this.employeeDeductionModel.NewDetails = this.employeeDeduction;
      }
      this.employeeDeductionModel.NewDetails.EmployeeDednScheduleDetails.forEach(ele => {
        delete ele['Select_Val'];
      });
      this.employeeDeductionModel.OldDetails.EmployeeDednScheduleDetails.forEach(ele => {
        delete ele['Select_Val'];
      });
      this.employeeDeductionModel.NewDetails.Modetype = UIMode.Edit;
      this.employeeDeductionModel.OldDetails.Modetype = UIMode.Edit;
      console.log('update Records', this.employeeDeductionModel);
      this.loadingScreenService.startLoading();
      this.spinner = true;
      this.employeeService.Put_UpsertEmployeeDeductionManagement(JSON.stringify(this.employeeDeductionModel)).subscribe((result) => {
        const rep = result as apiResult;
        if (rep.Status) {
          this.hideSuspendRescheduleBtns = false;
          this.spinner = false;
          this.payrollService.getValidateTimeCardToProcess(this.employeeDeductionModel.OldDetails.EmployeeId).subscribe((result) => {
            let apiresult: apiResult = result;
            console.log('checkIsValidTimeCard',  apiresult);
            this.loadingScreenService.stopLoading();
            this.spinner = false;
            this.alertService.showSuccess("You have successfully added the employee deduction !");
            if (apiresult.Status && apiresult.Result) {
              this.cancel();
              // alert to process salary
              this.alertService.confirmSwal("Would you like to process salary ?", "", "Yes").then((res) => {
                this.payrollService.postProcessTimeCard(apiresult.Result).subscribe((timeCard) => {
                  console.log('postProcessTimeCard',timeCard)
                });
              });
            } else {
              this.cancel();
            }
          }, err => {
            console.error('getValidateTimeCardToProcess' , err);
            this.loadingScreenService.stopLoading();
            this.spinner = false;
          });
        } else {
          this.alertService.showWarning(rep.Message);
          this.loadingScreenService.stopLoading();
          this.spinner = false;
        }
      });
    }
  }

  addDeductionForNoEndDateDeductionType(employeeDedForm: NgForm) {
    if (employeeDedForm.valid) {
      let contractDetails = _.first(this.employeeDetails.EmploymentContracts);
      this.employeeDeduction.EmployeeId = this.employeeDetails.Id;
      this.employeeDeduction.EmployeeCode = this.employeeDetails.Code;
      this.employeeDeduction.EmployeeName = this.employeeDetails.FirstName + " " + this.employeeDetails.LastName;
      this.employeeDeduction.ClientId = contractDetails.ClientId;
      this.employeeDeduction.ClientName = "";
      if (this.employeeDeduction.PayPeriodId) {
        this.employeeDeduction.PayCycleId = _.find(this.payperiodList, (payPeriod) => payPeriod.Id == this.employeeDeduction.PayPeriodId).PayCycleId;
      } else {
        this.employeeDeduction.PayCycleId = this.employeeDeduction.PayCycleId ? this.employeeDeduction.PayCycleId : contractDetails.PayCycleId;
        this.employeeDeduction.PayPeriodId = this.employeeDeduction.PayPeriodId ? this.employeeDeduction.PayPeriodId : contractDetails.OpenPayPeriodId;
      }
      if (this.CheckBoxisChecked && this.employeeDeduction.TotalDeductionAmount > this.employeeDeduction.PaymentAmount) {
        return this.alertService.showWarning('Total Deduction Amount cannot be greater than Pay Amount !');
      }
      this.employeeDeduction.PaymentDate = moment(this.employeeDeduction.PaymentDate).format("YYYY-MM-DD");
      this.employeeDeduction.Modetype = UIMode.Edit;
      this.employeeDeduction.EmployeeDednScheduleDetails = new Array<EmployeeDeductionScheduleDetails>();
      this.employeeDeduction.IsDeductionAgainstPayment = this.CheckBoxisChecked;
      this.employeeDeduction.TotalDeductionAmount = this.employeeDeduction.TotalDeductionAmount;
      this.employeeDeduction.NoOfOccurrences = 0;
      this.employeeDeduction.EndPayPeriodId = 0;
      this.employeeDeduction.DeductionType = DeductionType.CurrentPayrollCycle;
      this.employeeDeduction.PaymentTypeName = this.paymentSourceType[this.employeeDeduction.PaymentType];
      this.loadingScreenService.startLoading();
      this.spinner = true;
      console.log('add-deduction-no-end-date-generate', JSON.stringify(this.employeeDeduction));
      this.employeeService.GenerateEmployeeScheduleDetails(JSON.stringify(this.employeeDeduction)).subscribe((result) => {
        const rep = result as apiResult;
        this.loadingScreenService.stopLoading();
        if (rep.Status) {
          this.loadingScreenService.startLoading();
          this.employeeDeduction = JSON.parse(JSON.stringify(rep.Result));
          this.employeeDeductionModel.OldDetails = this.employeeDeduction;
          this.employeeDeductionModel.NewDetails = this.employeeDeduction;

          this.employeeDeductionModel.NewDetails.Modetype = UIMode.Edit;
          this.employeeDeductionModel.OldDetails.Modetype = UIMode.Edit;
          console.log('add-deduction-no-end-date', this.employeeDeductionModel);
          this.employeeService.Put_UpsertEmployeeDeductionManagement(JSON.stringify(this.employeeDeductionModel)).subscribe((result) => {
            const rep = result as apiResult;
            this.loadingScreenService.stopLoading();
            if (rep.Status) {
              this.hideSuspendRescheduleBtns = false;
              this.spinner = false;
              this.payrollService.getValidateTimeCardToProcess(this.employeeDeductionModel.OldDetails.EmployeeId).subscribe((result) => {
                let apiresult: apiResult = result;
                console.log('checkIsValidTimeCard',  apiresult);
                this.loadingScreenService.stopLoading();
                this.spinner = false;
                this.alertService.showSuccess("You have successfully added the employee deduction !");
                if (apiresult.Status && apiresult.Result) {
                  this.cancel();
                  // alert to process salary
                  this.alertService.confirmSwal("Would you like to process salary ?", "", "Yes").then((res) => {
                    this.payrollService.postProcessTimeCard(apiresult.Result).subscribe((timeCard) => {
                      console.log('postProcessTimeCard',timeCard)
                    });
                  });
                } else {
                  this.cancel();
                }
              }, err => {
                console.error('getValidateTimeCardToProcess' , err);
                this.loadingScreenService.stopLoading();
                this.spinner = false;
              });
            } else {
              this.alertService.showWarning(rep.Message);
              this.loadingScreenService.stopLoading();
              this.spinner = false;
            }
          });
         
          
        } else {
          this.loadingScreenService.stopLoading();
          this.spinner = false;
          this.alertService.showWarning(rep.Message);
        }
      });
    } else {
      console.log('employeeDedForm-noEndDate', employeeDedForm);
      this.alertService.showWarning('Please select mandatory fields.');
    }
  }

  onChangeCheckBox(val) {
    this.CheckBoxisChecked = val;
    this.disableConfirmDetailsBtn = true;
    // clear deduction calendar details table
    // this.lstEmployeeScheduleDetails = [];
    // // clear deduction details dropdown
    // this.employeeDeduction.PaymentAmount = 0;
    // this.employeeDeduction.PaymentType = null;
    // // this.employeeDeduction.PaymentDate = null;
    // this.employeeDeduction.PayPeriodId = null;
    // this.employeeDeduction.DeductionProductId = null;
    // this.employeeDeduction.StartPeriodId = null;
    // this.employeeDeduction.DeductionType = null;
    // this.employeeDeduction.TotalDeductionAmount = null;
    // this.employeeDeduction.EmployeeDednScheduleDetails = [];
    // this.employeeDeduction.NoOfOccurrences = 0;
    // this.employeeDeduction.PayCycleId = null;
    // this.paymentDate = null;
    // this.employeeDeduction.EndStatus = null;
    console.log('onChangeCheckBox', val, this.employeeDeduction, this.lstEmployeeScheduleDetails);
    //debugger;
  }

  onChangepaymentDate(evt) {
    if (evt) {
      this.employeeDeduction.PaymentDate = moment(evt).format("YYYY-MM-DD");
    }
  }
  generateEmployeeScheduleDetails(employeeDedForm: NgForm) {
   
    // debugger;
    if (employeeDedForm.valid) {
      if (this.employeeDeduction.StartPeriodId && this.employeeDeduction.EndPayPeriodId) {
        if (this.employeeDeduction.StartPeriodId == this.employeeDeduction.EndPayPeriodId && this.employeeDeduction.NoOfOccurrences != 1 || (this.employeeDeduction.StartPeriodId > this.employeeDeduction.EndPayPeriodId)) {
          return this.alertService.showWarning('Please select proper start end periods.');
        }
        // else if (this.employeeDeduction.NoOfOccurrences < 1) {
        //   return this.alertService.showWarning('Please enter the no.of occurrences.');
        // }

      }
      let contractDetails = _.first(this.employeeDetails.EmploymentContracts);
      this.employeeDeduction.EmployeeId = this.employeeDetails.Id;
      this.employeeDeduction.EmployeeCode = this.employeeDetails.Code;
      this.employeeDeduction.EmployeeName = this.employeeDetails.FirstName + " " + this.employeeDetails.LastName;
      this.employeeDeduction.ClientId = contractDetails.ClientId;
      this.employeeDeduction.ClientName = "";
      if (this.employeeDeduction.PayPeriodId) {
        this.employeeDeduction.PayCycleId = _.find(this.payperiodList, (payPeriod) => payPeriod.Id == this.employeeDeduction.PayPeriodId).PayCycleId;
        //this.employeeDeduction.StartPeriodId = this.employeeDeduction.PayPeriodId;
        //this.employeeDeduction.EndPayPeriodId = this.employeeDeduction.PayPeriodId;
      }
      else {
        this.employeeDeduction.PayCycleId = this.employeeDeduction.PayCycleId ? this.employeeDeduction.PayCycleId : contractDetails.PayCycleId;
        this.employeeDeduction.PayPeriodId = this.employeeDeduction.PayPeriodId ? this.employeeDeduction.PayPeriodId : contractDetails.OpenPayPeriodId;
        //this.employeeDeduction.StartPeriodId ? this.employeeDeduction.StartPeriodId : 0;
        //this.employeeDeduction.EndPayPeriodId ? this.employeeDeduction.EndPayPeriodId : 0;
      }
      if (this.CheckBoxisChecked && this.employeeDeduction.TotalDeductionAmount > this.employeeDeduction.PaymentAmount) {
        return this.alertService.showWarning('Total Deduction Amount cannot be greater than Pay Amount !');
      }
      
      this.employeeDeduction.PaymentDate = moment(this.employeeDeduction.PaymentDate).format("YYYY-MM-DD");
      this.employeeDeduction.Modetype = UIMode.Edit;
      this.employeeDeduction.EmployeeDednScheduleDetails = new Array<EmployeeDeductionScheduleDetails>();
      this.employeeDeduction.IsDeductionAgainstPayment = this.CheckBoxisChecked;
      this.employeeDeduction.TotalDeductionAmount = this.employeeDeduction.TotalDeductionAmount;
      this.employeeDeduction.NoOfOccurrences = this.employeeDeduction.NoOfOccurrences ?
        this.employeeDeduction.NoOfOccurrences : 0;
      // this.employeeDeduction.DeductionProductId = this.employeeDeduction.PaymentType;
      // debugger;
      this.employeeDeduction.EndPayPeriodId = this.employeeDeduction.EndPayPeriodId ? this.employeeDeduction.EndPayPeriodId : undefined;
      
      this.employeeDeduction.PaymentType = this.employeeDeduction.PaymentType ? this.employeeDeduction.PaymentType : this.paymentSourceType.Loan;
      
      this.employeeDeduction.PaymentTypeName = this.paymentSourceType[this.employeeDeduction.PaymentType];
      console.log('generate parms', this.employeeDeduction);
      this.loadingScreenService.startLoading();
      this.disableConfirmDetailsBtn = false;
      // this.generateButtonVisible = false;
      this.hideSuspendRescheduleBtns = true;
      this.spinner = true;
      this.employeeService.GenerateEmployeeScheduleDetails(JSON.stringify(this.employeeDeduction)).subscribe((result) => {
        const rep = result as apiResult;
        this.loadingScreenService.stopLoading();
        this.spinner = false;
        if (rep && rep.Status) {
          this.employeeDeduction = JSON.parse(JSON.stringify(rep.Result));
          const checkMonthlyInstalmentAmt = this.employeeDeduction.NoOfOccurrences > 0 ? this.employeeDeduction.TotalDeductionAmount / this.employeeDeduction.NoOfOccurrences : 0;
          console.log('generate parms-result', this.employeeDeduction, checkMonthlyInstalmentAmt);
          this.lstEmployeeScheduleDetails = this.employeeDeduction.EmployeeDednScheduleDetails;
          let roundOffTotalInstalmentAmt = this.employeeDeduction.NoOfOccurrences > 0 ? this.lstEmployeeScheduleDetails[this.lstEmployeeScheduleDetails.length - 1]['InstallmentAmount'] * this.employeeDeduction.NoOfOccurrences : 0;
          for (var i in this.lstEmployeeScheduleDetails) {
            this.lstEmployeeScheduleDetails[i]['Select_Val'] = false;
            this.lstEmployeeScheduleDetails[i]['OpeningBalanceAmount'] = Math.round( this.lstEmployeeScheduleDetails[i]['OpeningBalanceAmount']);
            this.lstEmployeeScheduleDetails[i]['InstallmentAmount'] = Math.round( this.lstEmployeeScheduleDetails[i]['InstallmentAmount']);
            this.lstEmployeeScheduleDetails[i]['ClosingBalance'] = Math.round( this.lstEmployeeScheduleDetails[i]['ClosingBalance']);
            this.payperiodList.forEach(el => {
              if (el.Id == this.lstEmployeeScheduleDetails[i].DeductionPeriodId) {
                this.lstEmployeeScheduleDetails[i].DeductionPeriodName = el.PayCyclePeriodName;
              }
            });
            roundOffTotalInstalmentAmt = this.employeeDeduction.NoOfOccurrences > 0 ? this.lstEmployeeScheduleDetails[i]['InstallmentAmount'] * this.employeeDeduction.NoOfOccurrences : 0;
          }
          this.initDeductionArr = "";
          this.initDeductionArr = JSON.stringify(this.lstEmployeeScheduleDetails);
         
          const checkBalTotalRoundOff = this.employeeDeduction.TotalDeductionAmount - roundOffTotalInstalmentAmt;
          if (roundOffTotalInstalmentAmt != 0) {
            this.lstEmployeeScheduleDetails[i]['OpeningBalanceAmount'] = checkBalTotalRoundOff != 0 ? 
              this.lstEmployeeScheduleDetails[i]['OpeningBalanceAmount'] + checkBalTotalRoundOff : this.lstEmployeeScheduleDetails[i]['OpeningBalanceAmount'];
            this.lstEmployeeScheduleDetails[this.lstEmployeeScheduleDetails.length - 1].ClosingBalance = checkBalTotalRoundOff;
          }
          if (this.employeeDeduction.NoOfOccurrences > 0) {
            this.disableConfirmDetailsBtn = checkBalTotalRoundOff != 0 ? true : false;
          }
          console.log('Schedule Details', this.lstEmployeeScheduleDetails);
          console.log('monthly inst amt', checkBalTotalRoundOff, roundOffTotalInstalmentAmt);
          this.alertService.showSuccess(rep.Message);
        } else {
          this.alertService.showWarning(rep.Message);
        }
      });
    }
    else {
      console.log('employeeDedForm', employeeDedForm);
      this.alertService.showWarning('Please select mandatory fields.');
    }
  }
  // $( "#susbutton").click(function() {

  // });

  // $('#susbutton').on(function(){

  // })

  suspendEmployeeDeduction(selectedData) {
    this.SelectScheduleDetails = selectedData;
    this.showNextPeriodName = '';
    //debugger;
    //$('#suspendpop').modal('show');
    $("#suspendpop").modal({ backdrop: false });
    // this.Suspension_CardVisible =true;
    // const modalRef = this.modalService.open(AddSuspensionmodalComponent, this.modalOption);
    // modalRef.componentInstance.employeeDeductionList = null;

  }
  cancellSuspendPopup() {
    $('#suspendpop').modal('hide');
  }

  //#endregion

  //#region Private Methods
  labelNameFn(id) {
    // debugger;
    if (id == 1) {
      return 'Permanent Suspend';
    }
    else if (id == 2) {
      return 'Adjust in next month';
    }
    else if (id == 3) {
      return 'Add new installment';
    }
    else if (id == 4) {
      return 'Manual';
    }
  }

  labelForDeductionType(id) {
    if (id == 0) {
      return 'No End Date';
    } else if (id == 1) {
      return 'End Pay Period';
    } else if (id == 2) {
      return 'No Of Occurrences';
    } else if (id == 3) {
      return 'Fixed Amount';
    } else if (id == 4) {
      return 'End Date';
    } else if (id == 5) {
      return 'On Settlement';
    }
  }

  changeSuspendTypeDefinition(val) {
    this.employeeDeduction.SuspensionType = val;
    this.showUpdateSuspendTypeBtn = this.AddDeductionType == 'Update Deduction' ? true : false;
    console.log('::: change-suspend-type :::', val, this.employeeDeduction, this.showUpdateSuspendTypeBtn);
  }

  updateSuspendTypeValue(employeeDeductionForm: NgForm) {
    this.showUpdateSuspendTypeBtn = false;
    this.addDeduction(employeeDeductionForm);
  }
  
  getDeductionControlList() {
    this.paymentSourceTypeList = Object.keys(this.paymentSourceType)
      .map((key) => ({ Id: parseInt(key), Name: this.paymentSourceType[key] }))
      .filter((f) => !isNaN(Number(f.Id)));
    this.deductionTypeList = Object.keys(this.deductionSourceType)
      .map((key) => ({
        Id: parseInt(key),
        Name: this.deductionSourceType[key],
      }))
      .filter((f) => !isNaN(Number(f.Id)));
    this.deductionStatusList = Object.keys(this.deductionStatus)
      .map((key) => ({ Id: parseInt(key), Name: this.deductionStatus[key] }))
      .filter((f) => !isNaN(Number(f.Id)));
    this.suspensionTypeList = Object.keys(this.suspensionType)
      .map((key) => ({ Id: parseInt(key), Name: this.suspensionType[key], Label_Name: this.labelNameFn(parseInt(key)) }))
      .filter((f) => !isNaN(Number(f.Id)));
    console.log('this.suspensionTypeList', this.suspensionTypeList);
    this.endStatusList = Object.keys(this.endStatus)
        .map((key) => ({ Id: parseInt(key), Name: this.endStatus[key], Label: this.labelForDeductionType(parseInt(key)) }))
        .filter((f) => !isNaN(Number(f.Id)));
    this.spinner = true;
    this.employeeService.LoadEmployeeDeductionManagementLookupDetails(this.id).subscribe((result) => {
      this.spinner = false;
      let apiresult: apiResult = result;
      // debugger;
      let lookUpDetails = JSON.parse(apiresult.Result);
      this.productList = lookUpDetails.EarningProducts;
      this.payperiodList = lookUpDetails.PayperiodList;
      this.EndpayperiodList = lookUpDetails.PayperiodList;
      
      if (this.employeeDetails.EmploymentContracts[0].OpenPayPeriodId > this.employeeDeduction.StartPeriodId) {
        this.payperiodList = this.payperiodList.filter((obj) => obj.Id >= this.employeeDeduction.StartPeriodId);
      } else {
        this.payperiodList = this.payperiodList.filter((obj) => obj.Id >= this.employeeDetails.EmploymentContracts[0].OpenPayPeriodId);
      }
      this.deductionProductList = lookUpDetails.DeductionProduct;
      console.log('productList', this.productList);
      console.log('payperiodList', this.payperiodList);
      console.log('deductionProductList', this.deductionProductList);
      for (var i in this.lstEmployeeScheduleDetails) {
        this.lstEmployeeScheduleDetails[i]['Select_Val'] = false;
        this.payperiodList.forEach(el => {
          if (el.Id == this.lstEmployeeScheduleDetails[i].DeductionPeriodId) {
            this.lstEmployeeScheduleDetails[i].DeductionPeriodName = el.PayCyclePeriodName;
          }
        })
      }
      // get period list for the available loan periods
      const availablePeriods = this.lstEmployeeScheduleDetails.map(({ DeductionPeriodId }) => DeductionPeriodId);
      const largest = Math.max.apply(0, availablePeriods); 
      this.startPeriodList = [];
      this.startPeriodList = this.payperiodList.filter((item) => item.Id > largest);
      console.log(this.startPeriodList);
    });

  }
  /* deduction Schedule*/
  onChangeDeduction(deduction) {
    this.disableConfirmDetailsBtn = true;
    if (deduction && deduction.Name == "CalendarBased") {
      this.schedule_CalendarBased = true;

    }
    else {
      this.schedule_CalendarBased = false;
      this.employeeDeduction.StartPeriodId = undefined;
      this.employeeDeduction.EndPayPeriodId = undefined;
      this.employeeDeduction.NoOfOccurrences = undefined;
    }
    //if (deduction.Name == "ScheduleBased") {
    // if (deduction.Name == "CalendarBased") {
    //   this.schedule_CardVisible = true;
    // } else {
    //this.schedule_CardVisible = false;
    //this.EndStatusPeriod_CardVisible = false;
    //this.NoOfOccurrences_CardVisible = false;
    //}
  }
  /* deduction Type*/
  onChangeEndingStatus(endStatus) {
    console.log('DEDUCTION TYPE CHANGE -->', endStatus);
    this.generateButtonVisible = true;
    this.disableConfirmDetailsBtn = true;
    if (endStatus) {
      this.employeeDeduction.EndPayPeriodId = undefined;
      this.employeeDeduction.DeductionType = DeductionType.CalendarBased;
      this.disableConfirmDetailsBtn = true;
      this.generateButtonVisible = true;
      this.EndStatusPeriod_CardVisible = false;
      this.schedule_CalendarBased = false;
      // this.employeeDeduction.DeductionType = undefined;
      this.employeeDeduction.NoOfOccurrences = undefined;
      this.deductionTypeList = Object.keys(this.deductionSourceType)
        .map((key) => ({
          Id: parseInt(key),
          Name: this.deductionSourceType[key],
        })).filter((f) => !isNaN(Number(f.Id)));

      if (endStatus.Name == "ENDPAYPERIOD" || endStatus.Name == "ENDINGPERIOD") {
        this.TotalDeductionAmountLabel = 'Amount';
        this.employeeDeduction.DeductionType = DeductionType.CalendarBased;
        this.EndStatusPeriod_CardVisible = true;
        this.NoOfOccurrences_CardVisible = false;
        this.DeductionAmount_CardVisible = false;
      } else if (endStatus.Name == "NOOFOCCURRENCES") {
        this.TotalDeductionAmountLabel = 'Total Deduction Amount';
        this.schedule_CalendarBased = true;
        this.NoOfOccurrences_CardVisible = true;
        this.schedule_CardVisible = true;
        this.EndStatusPeriod_CardVisible = false;
        this.DeductionAmount_CardVisible = false;
        var deductionTypeListvar = [];
        for (var i in this.deductionTypeList) {
          if (this.deductionTypeList[i].Id != 5) {
            deductionTypeListvar.push(this.deductionTypeList[i]);
          }
        }
        this.deductionTypeList = [];
        this.deductionTypeList = deductionTypeListvar;
        deductionTypeListvar = [];
      } else if (endStatus.Name == "DEDNAMOUNT") {
        this.TotalDeductionAmountLabel = 'Total Deduction Amount';
        this.NoOfOccurrences_CardVisible = false;
        this.EndStatusPeriod_CardVisible = false;
        this.DeductionAmount_CardVisible = true;
      }
      else if (endStatus.Name == "FIXEDAMOUNT") {
        this.TotalDeductionAmountLabel = 'Amount';
        this.employeeDeduction.EndPayPeriodId = undefined;
        if (this.employeeDeduction.StartPeriodId > this.employeeDetails.EmploymentContracts[0].OpenPayPeriodId) {
          this.employeeDeduction.DeductionType = DeductionType.NextPayrollCycle;
        } else {
          this.employeeDeduction.DeductionType = DeductionType.CurrentPayrollCycle;
        }
        var deductionTypeListvar = [];
        for (var i in this.deductionTypeList) {
          if (this.deductionTypeList[i].Id != 4) {
            deductionTypeListvar.push(this.deductionTypeList[i]);
          }
        }
        this.deductionTypeList = [];
        this.deductionTypeList = deductionTypeListvar;
        //this.NoOfOccurrences_CardVisible = false;
        //this.DeductionAmount_CardVisible = false;
      }
      else if (endStatus.Name == "NOENDDATE") {
        this.TotalDeductionAmountLabel = 'Deduction Amount Per Month';
        this.employeeDeduction.EndPayPeriodId = undefined;
        this.generateButtonVisible = false;
        this.disableConfirmDetailsBtn = false;
        var deductionTypeListvar = [];
        for (var i in this.deductionTypeList) {
          if (this.deductionTypeList[i].Id == 0 || this.deductionTypeList[i].Id == 1) {
            deductionTypeListvar.push(this.deductionTypeList[i]);
          }
        }
        this.deductionTypeList = [];
        this.deductionTypeList = deductionTypeListvar;
        this.NoOfOccurrences_CardVisible = false;
        this.DeductionAmount_CardVisible = false;
      }
      else {
        this.TotalDeductionAmountLabel = 'Total Deduction Amount';
        this.EndStatusPeriod_CardVisible = false;
        this.NoOfOccurrences_CardVisible = false;
        this.DeductionAmount_CardVisible = false;

        if (endStatus.Name == 'OnSettlement') {
          this.employeeDeduction.EndPayPeriodId = undefined;
          this.employeeDeduction.DeductionType = DeductionType.OnSettlement; // on settlement
        }
      }
    }
  }

  onChangeSuspension(suspension) {
    if (suspension.Name == "SUSPENSIONPERIOD") {
      this.suspended_CardVisible = true;
    } else {
      this.suspended_CardVisible = false;
    }
  }

  setValidatorsBasedOnCondition() {
    // setTimeout(() => {
    //   this.employeeDedForm.controls[""].get.valueChanges()
    // });
  }

  gridOptionBinding() {
    this.columnDefinitions = [

      {
        id: "DeductionPeriodName",
        name: "Period Name",
        field: "DeductionPeriodName",
        sortable: true,
      },
      {
        id: "OpeningBalanceAmount",
        name: "OpeningBalance Amount",
        field: "OpeningBalanceAmount",
        sortable: true,
        // editor: {
        //   model: Editors.integer,
        //   required: true,
        // },
      },
      {
        id: "InstallmentAmount",
        name: "Installment Amount",
        field: "InstallmentAmount",
        sortable: true,
        // editor: {
        //   model: Editors.float
        // },
      },

      // {
      //   id: "IsSettlementDeduction",
      //   name: "Is SettlementDeduction",
      //   field: "IsSettlementDeduction",
      // },
      {
        id: "ClosingBalance",
        name: "Closing Balance",
        field: "ClosingBalance",
        // editor: {
        //   model: Editors.integer,
        //   required: true,
        // },
      },
      // { id: "IsDeducted", name: "Is Deducted", field: "IsDeducted" },
      // {
      //   id: "IsCarryForwarded",
      //   name: "Is CarryForwarded",
      //   field: "IsCarryForwarded",
      // }

    ];
    this.gridOptions = {
      enableAutoResize: true,       // true by default
      enableCellNavigation: true,
      datasetIdPropertyName: "Id",
      editable: true,
      forceFitColumns: true,
      // enableFiltering: true,

      presets: {

        pagination: { pageNumber: 2, pageSize: 20 }
      },
      enableCheckboxSelector: true,
      enableRowSelection: true,
      checkboxSelector: {
        // remove the unnecessary "Select All" checkbox in header when in single selection mode
        hideSelectAllCheckbox: true,

      },
      rowSelectionOptions: {
        // True (Single Selection), False (Multiple Selections)
        selectActiveRow: false
      },
      autoCommitEdit: false,
      autoResize: {
        containerId: 'demo-container',
      },
      asyncEditorLoading: false,
      enableColumnPicker: false,
      autoHeight: true,
      enableExcelCopyBuffer: true,
      // enableFiltering: true,
    };
  }
  // OnClickInstallmentAmount(amount) {
  //   debugger;
  //   console.log(amount);
  //   this.initAmount = amount;
  // }
  isNumberKey(e) {
    let result = false; 
    try {
      const charCode = (e.which) ? e.which : e.keyCode;
      // To Allow: Ctrl+A,Ctrl+C,Ctrl+V
      if ((e.keyCode == 65 || e.keyCode == 86 || e.keyCode == 67) && (e.ctrlKey === true)) {
        result = true;
      // To Allow: backspace and numbers
      } else if ((charCode == 8) || (charCode >= 46 && charCode <= 57) || (charCode >= 96 && charCode <= 105)) {
        result = true;
      }
    } catch(err) { console.log('keyppppresss-isNumberKey-catch', err ); }
    return result;
  }

  onClickSubmitUpdateInstalmentAmnt(obj, index, evt) {
    if(!this.isNumberKey(evt)) {
      // stop character from entering input
      evt.preventDefault();
      return;
    }
    console.log('evt-keyppppresss', evt);
    //debugger;
    this.installmentChanged = true;
    obj.InstallmentAmount = Math.round(Number(obj.InstallmentAmount));
    // checks installemnt amount & opening balance amount
    if (obj.InstallmentAmount > obj.OpeningBalanceAmount) {
      JSON.parse(this.initDeductionArr).map((val, idx) => {
        if (index == idx) {
          obj.InstallmentAmount = parseInt(val.InstallmentAmount);
        }
      })
      // JSON.parse(this.initDeductionArr).forEach((ele, idx) => {
      //   if (index == idx) {
      //     obj.InstallmentAmount = parseInt(ele.InstallmentAmount);
      //   }
      // });
      this.disableConfirmDetailsBtn = true;
      return this.alertService.showWarning('Installment amount should be less than opening balance amount');
    }
    
    
    var length = 0;
    var varyAmount = 0;
    var addorless = false;
    let revert = false;
    JSON.parse(this.initDeductionArr).forEach(ele => {
      if (obj.InstallmentPeriodId == ele.InstallmentPeriodId) {
        if (ele.InstallmentAmount > obj.InstallmentAmount) {
          varyAmount = Math.round(parseInt(ele.InstallmentAmount) - parseInt(obj.InstallmentAmount));//less
          addorless = true;
        } else if (ele.InstallmentAmount < obj.InstallmentAmount) {
         varyAmount = Math.round(parseInt(obj.InstallmentAmount) - parseInt(ele.InstallmentAmount));//more
          addorless = false;
        } else if (ele.InstallmentAmount == obj.InstallmentAmount) {
          obj.ClosingBalance = obj.OpeningBalanceAmount - obj.InstallmentAmount;
          if (obj.ClosingBalance < 1) {
            obj.ClosingBalance = 0;
          } 
          revert = true;
        } else {
          varyAmount = 0;
          return;
        }
      }
    });
    if (varyAmount > 0 || revert) {
      for (var i in this.lstEmployeeScheduleDetails) {
        if (this.lstEmployeeScheduleDetails[i].InstallmentPeriodId > obj.InstallmentPeriodId) {
          this.lstEmployeeScheduleDetails[i].IsSuspended = this.lstEmployeeScheduleDetails[i].IsSuspended ? this.lstEmployeeScheduleDetails[i].IsSuspended : false;
          if (((this.lstEmployeeScheduleDetails[i].IsDeducted == false && this.lstEmployeeScheduleDetails[i].IsSuspended == false) || 
          (this.lstEmployeeScheduleDetails[i].IsCarryForwarded == false && this.lstEmployeeScheduleDetails[i].IsSuspended == false))) {
            length = length + 1;
            this.lstEmployeeScheduleDetails[i].Modetype = UIMode.Edit;
          }
        }

        if (this.lstEmployeeScheduleDetails[i].InstallmentPeriodId == obj.InstallmentPeriodId) {
          const balance = this.lstEmployeeScheduleDetails[i].OpeningBalanceAmount - this.lstEmployeeScheduleDetails[i].InstallmentAmount;
          this.lstEmployeeScheduleDetails[i].ClosingBalance = Math.round(balance);
          if (this.lstEmployeeScheduleDetails[i].ClosingBalance < 1) {
            this.lstEmployeeScheduleDetails[i].ClosingBalance = 0;
          }
        }
      }
     
      var mergeAmount = (varyAmount / length);
      mergeAmount = Math.round(mergeAmount);
      const lstLength = this.lstEmployeeScheduleDetails.length;
      console.log('this.lstEmployeeScheduleDetails[i]', this.lstEmployeeScheduleDetails, index, length);
      // check if last data has 0 balance
      const getLastLstIdx = this.lstEmployeeScheduleDetails[lstLength - 1];
      if (getLastLstIdx.InstallmentAmount !== getLastLstIdx.OpeningBalanceAmount) {
        this.disableConfirmDetailsBtn = true;
      } else if (getLastLstIdx.ClosingBalance != 0) {
        this.disableConfirmDetailsBtn = true;
      } else {
        this.disableConfirmDetailsBtn = false;
      }
      
      this.lstEmployeeScheduleDetails.forEach((element, Idx) => {
        const elementLength = Idx + 1;
        
        if (index < Idx && ((element.IsDeducted == false && element.IsSuspended == false) || (element.IsCarryForwarded == false && element.IsSuspended == false))) {
          // if (addorless == true) {
          //   this.lstEmployeeScheduleDetails[Idx].InstallmentAmount += Math.round(mergeAmount);
          //   if (! Number(this.lstEmployeeScheduleDetails[Idx].InstallmentAmount)) {
          //     this.lstEmployeeScheduleDetails[Idx].InstallmentAmount = 0;
          //     console.log('round+', (Math.round(mergeAmount)));
          //   }
          // } else if (addorless == false) {//value increase
          //   this.lstEmployeeScheduleDetails[Idx].InstallmentAmount -= (Math.round(mergeAmount));
          //   console.log('round--', (Math.round(mergeAmount)));
          //   //this.lstEmployeeScheduleDetails[Idx].ClosingBalance = 
          // }
        }
        if (index <= Idx || ((element.IsDeducted == false && element.IsSuspended == false) || (element.IsCarryForwarded == false && element.IsSuspended == false))) {
          this.lstEmployeeScheduleDetails[Idx].Modetype = UIMode.Edit;
          const closingBalanceUpdated = Math.round(this.lstEmployeeScheduleDetails[Idx].OpeningBalanceAmount - this.lstEmployeeScheduleDetails[Idx].InstallmentAmount);
          this.lstEmployeeScheduleDetails[Idx].ClosingBalance = this.lstEmployeeScheduleDetails[Idx].OpeningBalanceAmount > 0 && closingBalanceUpdated > 0 ? closingBalanceUpdated : 0;
          console.log('this.lstEmployeeScheduleDetails[Idx]', this.lstEmployeeScheduleDetails[Idx]);
          this.cdRef.detectChanges();
          // check the total installment amount and first opening balance match , and last closingbalance is zero 
          const checkLastIndx = this.lstEmployeeScheduleDetails[ this.lstEmployeeScheduleDetails.length - 1];
          if (checkLastIndx.InstallmentAmount !== checkLastIndx.OpeningBalanceAmount) {
            this.disableConfirmDetailsBtn = true;
          } else if (checkLastIndx.ClosingBalance != 0) {
            this.disableConfirmDetailsBtn = true;
          } else {
            this.disableConfirmDetailsBtn = false;
          }
          if (this.lstEmployeeScheduleDetails[Idx].ClosingBalance < 1) {
            this.lstEmployeeScheduleDetails[Idx].InstallmentAmount = Math.round(this.lstEmployeeScheduleDetails[Idx].OpeningBalanceAmount - this.lstEmployeeScheduleDetails[Idx].ClosingBalance);
            if (this.lstEmployeeScheduleDetails && this.lstEmployeeScheduleDetails[elementLength]) {
              this.lstEmployeeScheduleDetails[elementLength].ClosingBalance = 0;
              this.lstEmployeeScheduleDetails[elementLength].OpeningBalanceAmount = 0;
              this.lstEmployeeScheduleDetails[elementLength].InstallmentAmount = Math.round(this.lstEmployeeScheduleDetails[elementLength].OpeningBalanceAmount - this.lstEmployeeScheduleDetails[elementLength].ClosingBalance);
            }
          }
          this.cdRef.detectChanges();
          // check the total installment amount and first opening balance match , and last closingbalance is zero 
          const getLastLstIdx = this.lstEmployeeScheduleDetails[lstLength - 1];
          if (getLastLstIdx.InstallmentAmount !== getLastLstIdx.OpeningBalanceAmount) {
            this.disableConfirmDetailsBtn = true;
          } else if (getLastLstIdx.ClosingBalance != 0) {
            this.disableConfirmDetailsBtn = true;
          } else {
            this.disableConfirmDetailsBtn = false;
          }
          if ((this.lstEmployeeScheduleDetails[elementLength] && lstLength !== elementLength) || 
            ((this.lstEmployeeScheduleDetails[elementLength].IsDeducted == false && 
            this.lstEmployeeScheduleDetails[elementLength].IsSuspended == false) || 
            (this.lstEmployeeScheduleDetails[elementLength].IsCarryForwarded == false &&
            this.lstEmployeeScheduleDetails[elementLength].IsSuspended == false))) {
           
            if (this.lstEmployeeScheduleDetails[Idx].ClosingBalance < 1) {
              this.lstEmployeeScheduleDetails[elementLength].OpeningBalanceAmount = 0;
              this.lstEmployeeScheduleDetails[elementLength].ClosingBalance = 0;
              // this.lstEmployeeScheduleDetails[elementLength].InstallmentAmount = Math.round(this.lstEmployeeScheduleDetails[elementLength].OpeningBalanceAmount - this.lstEmployeeScheduleDetails[elementLength].ClosingBalance);
             this.lstEmployeeScheduleDetails[Idx].InstallmentAmount = Math.round(this.lstEmployeeScheduleDetails[Idx].OpeningBalanceAmount - this.lstEmployeeScheduleDetails[Idx].ClosingBalance);
             this.cdRef.detectChanges();
              // check the total installment amount and first opening balance match , and last closingbalance is zero 
              if (getLastLstIdx.InstallmentAmount !== getLastLstIdx.OpeningBalanceAmount) {
                this.disableConfirmDetailsBtn = true;
              } else if (getLastLstIdx.ClosingBalance != 0) {
                this.disableConfirmDetailsBtn = true;
              } else {
                this.disableConfirmDetailsBtn = false;
              }
            } else {
              this.lstEmployeeScheduleDetails[elementLength].OpeningBalanceAmount = this.lstEmployeeScheduleDetails[Idx].ClosingBalance;
              this.lstEmployeeScheduleDetails[elementLength].ClosingBalance = Math.round(this.lstEmployeeScheduleDetails[elementLength].OpeningBalanceAmount - this.lstEmployeeScheduleDetails[elementLength].InstallmentAmount);
              
              console.log('save btn check',elementLength, this.disableConfirmDetailsBtn, this.lstEmployeeScheduleDetails[elementLength]);
              
              this.cdRef.detectChanges();
              // check the total installment amount and first opening balance match , and last closingbalance is zero 
              const getLastLstIdx = this.lstEmployeeScheduleDetails[elementLength];
              if (getLastLstIdx.InstallmentAmount !== getLastLstIdx.OpeningBalanceAmount) {
                this.disableConfirmDetailsBtn = true;
              } else if (getLastLstIdx.ClosingBalance != 0) {
                this.disableConfirmDetailsBtn = true;
              } else {
                this.disableConfirmDetailsBtn = false;
              }
            }
            this.cdRef.detectChanges();
            // check the total installment amount and first opening balance match , and last closingbalance is zero 
            if (getLastLstIdx.InstallmentAmount !== getLastLstIdx.OpeningBalanceAmount) {
              this.disableConfirmDetailsBtn = true;
            } else if (getLastLstIdx.ClosingBalance != 0) {
              this.disableConfirmDetailsBtn = true;
            } else {
              this.disableConfirmDetailsBtn = false;
            }
            console.log('ClosingBalance-BTN', this.disableConfirmDetailsBtn);
            this.cdRef.detectChanges();
          }
        }
        this.cdRef.detectChanges();
        // check the total installment amount and first opening balance match , and last closingbalance is zero 
        const getLastLstIdx = this.lstEmployeeScheduleDetails[lstLength - 1];
        if (getLastLstIdx.InstallmentAmount !== getLastLstIdx.OpeningBalanceAmount) {
          this.disableConfirmDetailsBtn = true;
        } else if (getLastLstIdx.ClosingBalance != 0) {
          this.disableConfirmDetailsBtn = true;
        } else {
          this.disableConfirmDetailsBtn = false;
        }
      
      });
     
      this.initDeductionArr = "";
      this.initDeductionArr = JSON.stringify(this.lstEmployeeScheduleDetails);
    } else {
      if ((obj.IsDeducted == false && obj.IsSuspended == false) || (obj.IsCarryForwarded == false && obj.IsSuspended == false)) {
        obj.ClosingBalance = obj.OpeningBalanceAmount - obj.InstallmentAmount;
        if (obj.ClosingBalance < 1) {
          obj.ClosingBalance = 0;
        } 
        this.disableConfirmDetailsBtn = false;
      }
    }
    // e.stopPropagation();
  }
  onSelecteDeduction(Type, list, isChecked, obj) {
    this.SelectScheduleDetails = null;
    if (Type == 'M') {
      this.lstEmployeeScheduleDetails.forEach(ele => {
        ele['Select_Val'] = isChecked;
      })
    }
    else if (Type == 'S') {
      this.lstEmployeeScheduleDetails.forEach((ele, idx) => {
        ele['Select_Val'] = false;
        if (obj.Id == ele.Id) {
          ele['Select_Val'] = isChecked;
          if (ele['Select_Val'] == true) {
            this.SelectScheduleDetails = obj;
            this.SelectScheduleDetails['scheduleId'] = idx + 1;
          }
        }
      });

    }
    console.log(list);
    console.log(isChecked);
    // debugger;
  }
  angularGridReady_EmployeeScheduleDetails(angularGrid: AngularGridInstance) {
    this.angularGrid_EmployeeSchedule = angularGrid;
    //this.gridOptions_EmployeeScheduleDetails = 
    (angularGrid && angularGrid.slickGrid) || {};
  }

  angularGridReady(angularGrid: AngularGridInstance) {
    this.rulesGridInstance = angularGrid;
    // this.dataView = angularGrid.dataView;
    this.rulesGrid = angularGrid.slickGrid;
    this.rulesGridInstance.resizerService.resizeGrid();
    // this.rulesGridService = angularGrid.gridService;
  }

  cancel() {
    this.loadingScreenService.stopLoading();
    this.drawerRef.close();
  }
  //#endregion
  onClickSubmitSuspendFn() {
    this.hideSuspendRescheduleBtns = true;
    if (this.employeeDeduction.Id == 1) {
      this.employeeDeductionModel.OldDetails = this.employeeDeduction;
      this.employeeDeductionModel.NewDetails = this.employeeDeduction;
    } else {
      this.employeeDeductionModel.OldDetails = this.employeeDeductionDetails;
      this.employeeDeductionModel.NewDetails = this.employeeDeduction;
    }
    // Suspend for next period
    if (this.SuspendTypeId == 2) {
      // this.employeeDeductionModel.NewDetails.Modetype = UIMode.Edit;
      var parms = {
        employeeDeductionManagementId: this.SelectScheduleDetails.EmployeeDeductionManagementId,
        employeeDeductionScheduleDetailsId: this.SelectScheduleDetails.Id,// this.SelectScheduleDetails.scheduleId,
        employeeId: this.SelectScheduleDetails.EmployeeId,
        payPeriodId: this.SelectScheduleDetails.DeductionPeriodId,
        isSuspended: true,
        IsCarryForwarded: true,
        CarryForwardedPeriodId: this.payperiodList.filter(x => x.PayCyclePeriodName === this.showNextPeriodName)[0].Id,
        suspensionType: this.SuspendTypeId,
        suspensionToPeriodId:  this.payperiodList.filter(x => x.PayCyclePeriodName === this.showNextPeriodName)[0].Id,//this.employeeDeductionModel.NewDetails.SuspensionToPeriodId,
        SuspensionFromPeriodId:  this.payperiodList.filter(x => x.PayCyclePeriodName === this.showNextPeriodName)[0].Id,
        DeductionPayitemId: 0,
        status: DeductionPayItemStatus.Suspended,
        modetype: UIMode.Edit
      };

      //this.employeeDeductionModel.OldDetails.EmployeeSuspndDeductions.push(parms);
      this.employeeDeductionModel.NewDetails.EmployeeSuspndDeductions.push(parms);

      this.employeeDeductionModel.OldDetails.SuspensionType = this.SuspendTypeId;
      this.employeeDeductionModel.NewDetails.SuspensionType = this.SuspendTypeId;
      this.employeeDeductionModel.OldDetails.EmployeeDednScheduleDetails.forEach(ele => {
       // delete ele['Select_Val'];
        if (ele.Id == this.SelectScheduleDetails.Id) { ele.Modetype = UIMode.Edit;}
      });
      // update selected next month installment
      this.employeeDeductionModel.NewDetails.EmployeeDednScheduleDetails.forEach((ele) => {
        if (this.showNextPeriodName.toLowerCase() == ele.DeductionPeriodName.toLowerCase()) {
          ele.Modetype = UIMode.Edit;
          ele.IsCarryForwarded = false;
          ele.IsDeducted = false;
          ele.IsSuspended = false;
          ele.InstallmentAmount = ele.InstallmentAmount + this.SelectScheduleDetails.InstallmentAmount;
          ele.OpeningBalanceAmount = ele.OpeningBalanceAmount + this.SelectScheduleDetails.InstallmentAmount;
          ele.ClosingBalance = ele.OpeningBalanceAmount - ele.InstallmentAmount;
        }
      });
      // update existing selected installment
      this.employeeDeductionModel.NewDetails.EmployeeDednScheduleDetails.forEach((ele) => {
        // delete ele['Select_Val'];
        if (ele.Id == this.SelectScheduleDetails.Id) {
          ele.Modetype = UIMode.Edit;
          ele.IsCarryForwarded = true;
          ele.IsDeducted = false;
          ele.IsSuspended = true;
          ele.OpeningBalanceAmount = ele.OpeningBalanceAmount;
          ele.ClosingBalance = ele.OpeningBalanceAmount;
          ele.InstallmentAmount = 0;
          ele.DeductionPayitemId = 0;
          ele.CarryForwardedPeriodId = this.payperiodList.filter(x => x.PayCyclePeriodName === this.showNextPeriodName)[0].Id;
        }
      });
      this.employeeDeductionModel.NewDetails.Modetype = UIMode.Edit;
      this.employeeDeductionModel.OldDetails.Modetype = UIMode.Edit;
      this.employeeDeductionModel.NewDetails.Status = 1;
      this.employeeDeductionModel.OldDetails.Status = 1;
      
      
      this.cancellSuspendPopup();
      // this.cancel();
      console.log('SUSPEND_NEXT_PERIOD', this.employeeDeductionModel);
    }
    // Add new installment
    else if (this.SuspendTypeId == 3) {
      this.employeeDeduction.NoOfOccurrences = this.employeeDeduction.NoOfOccurrences ? this.employeeDeduction.NoOfOccurrences + 1 : 0;
      this.employeeDeduction.Modetype = UIMode.Edit;
      if (this.showNextPeriodName !== '') {
        this.SusStartPeriodId =  this.payperiodList.filter(x => x.PayCyclePeriodName === this.showNextPeriodName)[0].Id;
      } else {
        console.log('**** // NEW INSTALLMENT // ****', this.showNextPeriodName, this.payperiodList);
        this.alertService.showWarning('Couldn\'t add new installment !');
      }
      
      this.employeeDeductionModel.OldDetails.SuspensionType = this.SuspendTypeId;
      this.employeeDeductionModel.NewDetails.SuspensionType = this.SuspendTypeId;
      // this.employeeDeductionModel.OldDetails.EmployeeDednScheduleDetails.forEach(ele => {
      //   // delete ele['Select_Val'];
      //   ele.Modetype = UIMode.Edit;
      // });
      // add new installment
      let newInstallMentParam: EmployeeDeductionScheduleDetails = {
        Id: 0,
        EmployeeId: this.SelectScheduleDetails.EmployeeId,
        EmployeeDeductionManagementId: this.SelectScheduleDetails.EmployeeDeductionManagementId,
        InstallmentPeriodId: this.SusStartPeriodId,
        OpeningBalanceAmount: this.SelectScheduleDetails.OpeningBalanceAmount,
        InstallmentAmount: this.SelectScheduleDetails.InstallmentAmount,
        ClosingBalance: this.SelectScheduleDetails.ClosingBalance,
        DeductionPeriodId: this.SusStartPeriodId,
        DeductionPeriodName: this.payperiodList.filter(x => x.Id === this.SusStartPeriodId)[0].PayCyclePeriodName,
        IsDeducted: false,
        IsExternalSystemDeducted: false,
        IsSettlementDeduction: false,
        IsCarryForwarded: false,
        DeductionPayitemId: 0,
        CarryForwardedPeriodId: 0,
        CarryForwardedMonth: 0,
        CarryForwardedYear: 0,
        InstallmentMonth: 0,
        InstallmentYear: 0,
        InterestPercentage: 0,
        InterestAmount: 0,
        status: 0,
        Modetype: UIMode.None,
        IsSuspended: false
      };
      this.employeeDeductionModel.NewDetails.EmployeeDednScheduleDetails.push(newInstallMentParam);
      let parms = {
        employeeDeductionManagementId: this.SelectScheduleDetails.EmployeeDeductionManagementId,
        employeeDeductionScheduleDetailsId: this.SelectScheduleDetails.Id,// this.SelectScheduleDetails.scheduleId,
        employeeId: this.SelectScheduleDetails.EmployeeId,
        payPeriodId: this.SelectScheduleDetails.DeductionPeriodId,
        isSuspended: true,
        IsCarryForwarded: true,
        status: DeductionPayItemStatus.Suspended,
        modetype: UIMode.Edit
      };
      this.employeeDeductionModel.NewDetails.EmployeeSuspndDeductions = [];
      //this.employeeDeductionModel.OldDetails.EmployeeSuspndDeductions.push(parms);
      this.employeeDeductionModel.NewDetails.EmployeeSuspndDeductions.push(parms);
      this.employeeDeductionModel.NewDetails.EmployeeDednScheduleDetails.forEach((ele) => {
        // delete ele['Select_Val'];
        // update existing selected installment
        if (ele.Id == this.SelectScheduleDetails.Id) {
          ele.Modetype = UIMode.Edit;
          ele.IsCarryForwarded = true;
          ele.IsDeducted = false;
          ele.IsSuspended = true;
          ele.OpeningBalanceAmount = ele.OpeningBalanceAmount;
          ele.ClosingBalance = ele.OpeningBalanceAmount;
          ele.InstallmentAmount = 0;
          ele.CarryForwardedPeriodId = this.SusStartPeriodId;
        }
      });
      const index = this.employeeDeductionModel.NewDetails.EmployeeDednScheduleDetails.findIndex(x => x.Id === this.SelectScheduleDetails.Id);
      this.employeeDeductionModel.NewDetails.EmployeeDednScheduleDetails.forEach((arr, idx) => {
        if (idx > index) {
          // Reset Closing, Opening BAlance, Installment Values
          arr['OpeningBalanceAmount'] = Math.round(this.employeeDeductionModel.NewDetails.EmployeeDednScheduleDetails[idx - 1]['ClosingBalance']);
          arr['InstallmentAmount'] = Math.round(arr['InstallmentAmount']);
          arr['ClosingBalance'] = Math.round(arr['OpeningBalanceAmount']) - Math.round(arr['InstallmentAmount']);
        }
      });
      console.log('SUSPEND_NEW_PERIOD', this.employeeDeductionModel);
      this.cancellSuspendPopup();
    }
    // Make adjustment in existing schedule
    else if (this.SuspendTypeId == 4) {
      this.alertService.showWarning('Please update the Installement amount and Press enter when done');
      this.cancellSuspendPopup();
    }
    // check the total installment amount and first opening balance match 
    const overallTotalInstallmentAmt = this.lstEmployeeScheduleDetails.map(item => item.InstallmentAmount).reduce((prev, next) => prev + next);
    if (this.lstEmployeeScheduleDetails[0].OpeningBalanceAmount !== overallTotalInstallmentAmt) {
      this.disableConfirmDetailsBtn = true;
    } else {
      this.disableConfirmDetailsBtn = false;
    }
    // check if last data has 0 balance
    const getLastIdx = this.lstEmployeeScheduleDetails.slice(-1);
    if (getLastIdx[0].InstallmentAmount > getLastIdx[0].OpeningBalanceAmount) {
      this.disableConfirmDetailsBtn = true;
      return this.alertService.showWarning('Please adjust the installment amount');
    } else if (getLastIdx[0].ClosingBalance != 0) {
      this.disableConfirmDetailsBtn = true;
      return this.alertService.showWarning('Please adjust the installment amount');
    } else {
      this.disableConfirmDetailsBtn = false;
    }
    // Make API Call
  //  if (this.SuspendTypeId !== 4) {
  //   this.hideSuspendRescheduleBtns = true;
  //   this.loadingScreenService.startLoading();
  //   this.spinner = true;
  //   this.employeeService.Put_UpsertEmployeeDeductionManagement(JSON.stringify(this.employeeDeductionModel)).subscribe((result) => {
  //     const rep = result as apiResult;
  //     if (rep.Status) {
  //       this.payrollService.getValidateTimeCardToProcess(this.SelectScheduleDetails.EmployeeId).subscribe((result) => {
  //         let apiresult: apiResult = result;
  //         console.log('checkIsValidTimeCard',  apiresult);
  //         if (apiresult.Status && apiresult.Result) {
  //           this.loadingScreenService.stopLoading();
  //           this.spinner = false;
  //           this.alertService.showSuccess("You have successfully Suspended the Employee deduction!");
  //           // alert to process salary
  //           this.cancel();
  //           this.alertService.confirmSwal("Would you like to process salary ?", "", "Yes").then((res) => {
  //             this.payrollService.postProcessTimeCard(apiresult.Result).subscribe((timeCard) => {
  //               console.log('postProcessTimeCard',timeCard);
  //             });
  //           });
  //         } else {
  //           this.loadingScreenService.stopLoading();
  //           this.spinner = false;
  //           this.cancel();
  //           this.alertService.showSuccess("You have successfully Suspended the Employee deduction!");
  //         }
  //       }, err => {
  //         console.error('getValidateTimeCardToProcess' , err);
  //         this.loadingScreenService.stopLoading();
  //         this.spinner = false;
  //         this.cancel();
  //       });
  //     } else {
  //       this.alertService.showWarning(rep.Message);
  //       this.loadingScreenService.stopLoading();
  //       this.spinner = false;
  //     }
  //   }, error => {
  //     this.alertService.showWarning(error);
  //     this.loadingScreenService.stopLoading();
  //     this.spinner = false;
  //   });
  //  }
  }
  onChange_Suspend(val) {
    console.log('val', val);
    this.SuspendTypeId = val.Id;
    const index = this.payperiodList.findIndex(x => x.Id === this.SelectScheduleDetails.InstallmentPeriodId);
    if (val.Id == 3) {
      const availablePeriods = this.lstEmployeeScheduleDetails.map(({ DeductionPeriodId }) => DeductionPeriodId);
      const largest = Math.max.apply(0, availablePeriods); 
      this.startPeriodList = [];
      this.startPeriodList = this.payperiodList.filter((item) => item.Id > largest);
      
      this.showNextPeriodName = this.startPeriodList[0].PayCyclePeriodName;
      console.log(this.startPeriodList);
    } else if (val.Id == 2) {
      const len = this.lstEmployeeScheduleDetails.length;
      if (this.SelectScheduleDetails.Id == this.lstEmployeeScheduleDetails[len - 1].Id) {
        const alertMessage = len > 1 ? 'NOTE: The selected month is not available in the existing schedule. Please click on other options !' :
        'NOTE: The selected month is not available in the existing schedule. Please click on \'Do you want to add new installment\' !'
        this.alertService.showWarning(alertMessage);
      } else {
        this.showNextPeriodName = this.payperiodList[index + 1].PayCyclePeriodName;
        this.lstEmployeeScheduleDetails.forEach(el => {
          if ((el['DeductionPeriodName'] == this.showNextPeriodName) && (el.IsDeducted == true || el.IsSuspended == true)) {
            this.SuspendTypeId == undefined;
            this.showNextPeriodName = '';
            return this.alertService.showWarning('The next period is already suspended/deducted');
          }
        });
      }
    } else {
      this.SusStartPeriodId = undefined;
      this.SusEndPayPeriodId = undefined;
    }
  }


  onStartPeriodListChange(evt) {
    this.endPeriodList = [];
    // this.endPeriodList = this.startPeriodList.filter(e => e.Id !== this.SusStartPeriodId && e.Id >= this.SusStartPeriodId);
    this.endPeriodList = this.startPeriodList.filter(e => e.Id >= this.SusStartPeriodId);
    console.log('&&&&*** endPeriodList ***&&&&', this.endPeriodList);
  }
  permanentlySuspendDeduction(selectedData) {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-primary'
      },
      buttonsStyling: true
    })
    swalWithBootstrapButtons.fire({
      title: 'Your Comments',
      animation: false,
      showCancelButton: true,
      input: 'textarea',
      inputValue: '',
      inputPlaceholder: 'Type your message here...',
      allowEscapeKey: false,
      inputAttributes: {
        autocorrect: 'off',
        autocapitalize: 'on',
        maxlength: '120',
        'aria-label': 'Type your message here',
      },
      allowOutsideClick: false,
      inputValidator: (value) => {
        if (value.length >= 120) {
          return 'Maximum limit allowed is 120 characters.'
        }
        if (!value) {
          return 'You need to write something!'
        }
      },

    }).then((inputValue) => {
      if (inputValue.value) {
        this.hideSuspendRescheduleBtns = true;
        // check if last data has 0 balance
        const getLastLstIdx = this.lstEmployeeScheduleDetails[this.lstEmployeeScheduleDetails.length - 1];
        if (getLastLstIdx.InstallmentAmount !== getLastLstIdx.OpeningBalanceAmount) {
          this.disableConfirmDetailsBtn = true;
        } else if (getLastLstIdx.ClosingBalance != 0) {
          this.disableConfirmDetailsBtn = true;
        } else {
          this.disableConfirmDetailsBtn = false;
        }
        this.SuspendTypeId = 1; // SUSPEND_FOREVER
        console.log('Remarks--->', inputValue.value);
        if (this.employeeDeduction.Id == 1) {
          this.employeeDeductionModel.OldDetails = this.employeeDeduction;
          this.employeeDeductionModel.NewDetails = this.employeeDeduction;
        } else {
          this.employeeDeductionModel.OldDetails = this.employeeDeductionDetails;
          this.employeeDeductionModel.NewDetails = this.employeeDeduction;
        }
        var parms = {
          employeeDeductionManagementId: selectedData.EmployeeDeductionManagementId,
          employeeDeductionScheduleDetailsId: selectedData.Id, // selectedData.scheduleId,
          employeeId: selectedData.EmployeeId,
          payPeriodId: selectedData.DeductionPeriodId,
          isSuspended: true,
          IsPermanentSuspension : true,
          Remarks: inputValue.value,
          isDeducted: true,
          suspensionType: this.SuspendTypeId,
          suspensionToPeriodId: selectedData.DeductionPeriodId,//this.employeeDeductionModel.NewDetails.SuspensionToPeriodId,
          SuspensionFromPeriodId: selectedData.DeductionPeriodId,
          status: DeductionPayItemStatus.Suspended,
          modetype: UIMode.Edit
        };
        this.employeeDeductionModel.NewDetails.EmployeeSuspndDeductions.push(parms);
        this.employeeDeductionModel.NewDetails.EmployeeDednScheduleDetails.forEach(ele => {
          if (ele.Id == selectedData.Id) {
            ele.Modetype = UIMode.Edit;
            ele.IsSuspended = true;
            ele.IsPermanentSuspension  = true;
            ele.Remarks = inputValue.value;
            ele.IsDeducted = true;
          }
        });
        this.employeeDeductionModel.OldDetails.SuspensionType = this.SuspendTypeId;
        this.employeeDeductionModel.NewDetails.SuspensionType = this.SuspendTypeId;
        this.employeeDeductionModel.OldDetails.EmployeeDednScheduleDetails.forEach(ele => {
          // delete ele['Select_Val'];
          if (ele.Id == selectedData.Id) {
            ele.Modetype = UIMode.Edit;
          }
        });
        this.employeeDeductionModel.NewDetails.Modetype = UIMode.Edit;
        this.employeeDeductionModel.OldDetails.Modetype = UIMode.Edit;
        this.employeeDeductionModel.NewDetails.Status = 2;
        this.employeeDeductionModel.OldDetails.Status = 2;
        console.log('update Records', this.employeeDeductionModel);
        for (var i in this.lstEmployeeScheduleDetails) {
          if (this.lstEmployeeScheduleDetails[i].Id === selectedData.Id) {
            this.lstEmployeeScheduleDetails[i] = selectedData;
          }
        }
        console.log('update Records', this.lstEmployeeScheduleDetails);
         
        // this.employeeService.Put_UpsertEmployeeDeductionManagement(JSON.stringify(this.employeeDeductionModel)).subscribe((result) => {
        //   const rep = result as apiResult;
        //   if (rep.Status) {
        //     this.spinner = false;
        //     this.payrollService.getValidateTimeCardToProcess(selectedData.EmployeeId).subscribe((result) => {
        //       let apiresult: apiResult = result;
        //       this.loadingScreenService.stopLoading();
        //       this.alertService.showSuccess("You have successfully Suspended the Employee deduction!");
        //       console.log('checkIsValidTimeCard',  apiresult);
        //       if (apiresult.Status && apiresult.Result) {
        //         // alert to process salary
        //         this.cancel();
        //         this.alertService.confirmSwal("Would you like to process salary ?", "", "Yes").then((res) => {
        //           this.payrollService.postProcessTimeCard(apiresult.Result).subscribe((timeCard) => {
        //             console.log('postProcessTimeCard',timeCard);
        //           });
        //         });
        //       } else {
        //         this.cancel();
        //       }
        //     }, err => {
        //       console.error('getValidateTimeCardToProcess' , err);
        //       this.loadingScreenService.stopLoading();
        //       this.cancel();
        //     });
        //   } else {
        //     this.alertService.showWarning(rep.Message);
        //     this.cancel();
        //   }
        // });
      }
    });
  }
}
