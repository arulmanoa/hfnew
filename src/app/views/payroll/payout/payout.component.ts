import { Component, OnInit, Inject } from '@angular/core';
import {
  AngularGridInstance, GridService, Column, GridOption,
  FieldType,
  Formatters,
  OnEventArgs,
  ExcelExportService
} from 'angular-slickgrid';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { PageLayout, ColumnDefinition } from '../../personalised-display/models';
import { PagelayoutService, SessionStorage, PayrollService, AlertService, DownloadService, ExcelService } from 'src/app/_services/service';
import { RowDataService } from '../../personalised-display/row-data.service';
import { PageLayoutBuilderService } from 'src/app/_services/service/pageLayoutBuilder';
import Swal from "sweetalert2";
import { PayOutDetailsStatus, PayoutInformationDetails, PayoutInformation, PayOutModel, _PayOutModel, PayOutStatus, TransferType, PaymentMode } from 'src/app/_services/model/Payroll/PayOut';
import { enumHelper } from 'src/app/shared/directives/_enumhelper';
import { forEach, result } from 'lodash';
import { UIMode } from 'src/app/_services/model/Common/BaseModel';
import { LoginResponses } from '../../../_services/model/Common/LoginResponses';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { apiResult } from 'src/app/_services/model/apiResult';
import * as moment from 'moment';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
import { environment } from "../../../../environments/environment";
import { DOCUMENT } from '@angular/common';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ProcessCategory } from 'src/app/_services/model/Payroll/PayRun';
import { Observable, timer, NEVER, BehaviorSubject, fromEvent, of } from 'rxjs';
import { map, tap, takeWhile, share, startWith, switchMap, filter } from 'rxjs/operators';
import * as _ from 'lodash';
import { UtilityService } from 'src/app/_services/service/utitlity.service';

@Component({
  selector: 'app-payout',
  templateUrl: './payout.component.html',
  styleUrls: ['./payout.component.scss']
})
export class PayoutComponent implements OnInit {
  sessionDetails: LoginResponses;
  PersonName: any;
  UserId: any;

  BehaviourObject_Data: any;
  pageLayout: PageLayout = null;
  tempColumn: Column;
  columnName: string;
  code: string;
  spinner: boolean;

  // WIZARD CONFIGURATION
  index: number = 0;
  companyBankList = []
  payOutModel: PayOutModel = new PayOutModel();
  showClientDetails: boolean = false;
  seemoreTxt: string = "See Client Details";
  dynamictblDataSrc: any[] = [];
  dynamicCompanyId: any;
  dynamicModeTransfer: any;
  htmlStr: string = '<strong>The Tortoise</strong> &amp; the Hare';
  SpinnerShouldhide: boolean = false;
  dataset: any;
  columnDefinition: Column[];
  gridOptions: GridOption;
  angularGrid: AngularGridInstance;
  gridObj: any;
  dataviewObj: any;
  draggableGroupingPlugin: any;
  selectedItems: any[];
  ParentBankFundBalance: any;
  inEmployees1InitiateGridInstance: AngularGridInstance;
  inEmployees1InitiateGrid: any;
  inEmployees1InitiateGridService: GridService;
  inEmployees1InitiateDataView: any;
  inEmployees1InitiateColumnDefinitions: Column[];
  inEmployees1InitiateGridOptions: GridOption;
  inEmployees1InitiateDataset: any;
  inEmployees1InitiateList = [];
  inEmployees1InitiateSelectedItems: any[];
  YBankModeTransfer: any = null;
  visible_employeeConfirmPayout: boolean = false;
  transferType = [];
  transferTypeId: any = null;
  payoutdetailStatus = [];
  payoutStatus = [];
  // CLIENT DETAILS SLIDER
  visible_clientDetails: boolean = false;
  dynamicBankDetails = [];;
  // CHOOSE BANK POPUP CONFIRMATION
  shouldRendering: boolean = false;
  shouldRenderingTxt: string = "Collecting";
  popupBankFundBalance: any = null;
  popupBankStatus: boolean = true;
  popupBankMessage: string = '';
  // ACCESS CONTROL
  isFinance: boolean = true;
  currentUrl: any;
  GlbCompanyBankList: any[] = [];
  GlbmodeTransferList: any[] = [{
    Id: 1, Name: 'API'
  }, { Id: 2, Name: 'File Share' }];
  modeTransferList = [];
  SelectedTransferMethod: any = null;
  selectedModeOfTransfer: any = null;
  isDisbaledModeAPI: boolean = false;
  isDisbaledModeFileShare: boolean = false;
  // FOR GET DETAILS BY PAYOUTINFORM ID;
  ObjectOfPayoutInformation: any;

  local_dataset = [];
  _selectedPayAmount_ReleaseBatch: any;
  selectedEmployeeForRetryPayout = [];
  selectAll: boolean = false;
  rowRecord: any; Payitems: any;
  visible_netpaySlider = false;
  releasePayout_separate_spin: boolean = false;
  searchText: any;
  // auto refresh

  timer: any = 0;
  isPayOutDuplicateEntry : boolean = false;
  constructor(
    private route: ActivatedRoute,
    private pageLayoutService: PagelayoutService,
    private rowDataService: RowDataService,
    public pagelayoutBuilderService: PageLayoutBuilderService,
    private utilsHelper: enumHelper,
    private sessionService: SessionStorage,
    private payrollService: PayrollService,
    private alertService: AlertService,
    private loadingScreenService: LoadingScreenService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    @Inject(DOCUMENT) private document: Document,
    private downloadService: DownloadService,
    private notification: NzNotificationService,
    private excelService: ExcelService,
    private utilityService : UtilityService

  ) {


  }
  Init_timer() {
    const toggle$ = new BehaviorSubject(true);
    const K = 1000;
    const INTERVAL = K;
    const MINUTES = 0.1;
    const TIME = MINUTES * K * environment.environment.AutoRefreshSecondsInPayout;

    let current: number;
    let time = TIME;
    const toMinutesDisplay = (ms: number) => Math.floor(ms / K / 60);
    const toSecondsDisplay = (ms: number) => Math.floor(ms / K) % 60;
    console.log('time', time);

    const toSecondsDisplayString = (ms: number) => {
      const seconds = toSecondsDisplay(ms);
      return seconds < 10 ? `${seconds}` : seconds.toString();
    };

    const currentSeconds = () => time / INTERVAL;
    const toMs = (t: number) => t * INTERVAL
    const toRemainingSeconds = (t: number) => currentSeconds() - t;

    const remainingSeconds$ = toggle$.pipe(
      switchMap((running: boolean) => (running ? timer(0, INTERVAL) : NEVER)),
      map(toRemainingSeconds),
      takeWhile(t => t >= 0),
    );

    const ms$ = remainingSeconds$.pipe(
      map(toMs),
      tap(t => current = t)
    );

    const minutes$ = ms$.pipe(
      map(toMinutesDisplay),
      map(s => s.toString()),
      startWith(toMinutesDisplay(time).toString())
    );

    console.log('minutes', minutes$);

    const seconds$ = ms$.pipe(
      map(toSecondsDisplayString),
      startWith(toSecondsDisplayString(time).toString())
    );
    const minutesElement = document.querySelector('.minutes');
    const secondsElement = document.querySelector('.seconds');
    const toggleElement = document.querySelector('.timer');

    console.log('test ing ', this.updateDom(minutes$, minutesElement));
    this.updateDom(minutes$, minutesElement);
    this.updateDom(seconds$, secondsElement);

    fromEvent(toggleElement, 'click').subscribe(() => {
      toggle$.next(!toggle$.value);
    });

    // remainingSeconds$.subscribe({
    //   // complete: () => this.updateDom(of('Take a break!'), toggleElement)
    //   complete: () => { this.updateDom(of('Take a break!'), toggleElement), this.do_Refresh_allreleasePayout() }
    // });
  }

  updateDom(source$: Observable<string>, element: Element) {
    source$.subscribe((value) => {
      this.timer = value
    })
  }

  ngOnInit() {
    this.currentUrl = this.router.url;
    console.log('curentusr', this.currentUrl);

    this.init();

  }
  do_Refresh() {
    this.init();
  }

  init() {
    this.selectedItems = [];
    // this.loadinEmployeesInitiateRecords();
    // this.loadinEmployeesInitiateRecords1();
    this.getPageLayout();
    this.transferType = this.utilsHelper.transform(TransferType) as any;
    this.payoutdetailStatus = this.utilsHelper.transform(PayOutDetailsStatus) as any;
    this.payoutStatus = this.utilsHelper.transform(PayOutStatus) as any;

    this.selectedModeOfTransfer = "1";
    this.YBankModeTransfer = 1;
    this.modeTransferList = this.GlbmodeTransferList;
  }

  onChangeModeOfTransfer_dynamic(item, inx) {
    item.ModeOfTransfer = inx;
    console.log('item', item);

  }

  holdPayout_dynamic(item, buttonAction, childTable) {

    if (item.TableDataSrc.length == 0) {
      this.alertService.showWarning("No records found!");
      return;
    }

    console.log('ITEM :', item);
    console.log('CHILD TABLE : ', childTable);




    // if (item.PayOutStatusCode > 3) {
    //   this.alertService.showWarning('Oops!, Employee cannot be moved because the status is in an invalid state.');
    //   return;
    // }

    if (item.PayOutStatusCode > 7500) {
      this.alertService.showWarning('Oops!, Employee cannot be moved because the status is in an invalid state.');
      return;
    }

    var localList = [];
    localList = item.TableDataSrc;

    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: true
    })

    swalWithBootstrapButtons.fire({
      title: `Are you sure`,
      text: "Are you sure you want to cancel the release payout?",
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: "Yes, Cancel",
      cancelButtonText: 'No!',
      reverseButtons: true,
      allowEscapeKey: false,
      allowOutsideClick: false
    }).then((res) => {
      if (res.value) {

        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'btn btn-primary',
            cancelButton: 'btn btn-danger'
          },
          buttonsStyling: true
        })
        swalWithBootstrapButtons.fire({
          title: "Cancellation Remarks",
          animation: false,
          showCancelButton: true, // There won't be any cancel button
          input: 'textarea',

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
              return 'Maximum 120 characters allowed.'
            }
            if (!value) {
              return 'You need to write something!'
            }
          },

        }).then((inputValue) => {
          if (inputValue.value) {
            let jsonObj = inputValue;
            let jsonStr = jsonObj.value;



            var tempObject: any;
            //.filter(z => z.Id == item.Id);
            console.log('test', localList);
            this.loadingScreenService.startLoading();
            this.getPayoutInformationById(localList[0].PayOutInformationId).then((result) => {
              console.log('result', result);
              if (result != null) {
                tempObject = result;



                var payOutModel: PayOutModel = _PayOutModel;
                payOutModel.NewDetails = null;
                payOutModel.OldDetails = null;
                let LstPayOutDet1 = [];
                var PayOutInfoId = 0;
                var currentDate = new Date();


                localList.forEach(obj => {

                  var childDetails = new PayoutInformationDetails();
                  PayOutInfoId = obj.PayOutInformationId;
                  childDetails.Id = obj.Id;

                  childDetails.PayoutInformationId = obj.PayOutInformationId;
                  childDetails.TimeCardId = obj.TimeCardId;
                  childDetails.EmployeeId = obj.EmployeeId;
                  childDetails.EmployeeName = obj.EmployeeName;
                  childDetails.BankName = obj.BankName;
                  childDetails.IFSCCode = obj.IFSCCode;
                  childDetails.AccountNumber = obj.AccountNumber;
                  childDetails.MobileNumber = obj.MobileNumber;
                  childDetails.UPIId = obj.UPIId;
                  childDetails.PayPeriodId = obj.PayPeriodId;
                  childDetails.PayPeriodName = obj.PayPeriodName;
                  // childDetails.Narration = obj.Narration;
                  childDetails.NetPay = obj.NetPay;
                  childDetails.ExternalRefCode = "";
                  childDetails.AcknowledgmentDetail = "";
                  childDetails.IsPaymentDone = obj.IsPaymentDone
                  childDetails.Status = PayOutDetailsStatus.Approved;// obj.Status;
                  childDetails.IsPaymentHold = obj.IsPaymentHold;
                  childDetails.ModeType = UIMode.Edit;
                  childDetails.PayTransactionId = obj.PayTransactionId;
                  childDetails.CompanyBankAccountId = this.BehaviourObject_Data.CompanyBankAccountId;
                  childDetails.ReleasePayoutInformationId = 0; //this.BehaviourObject_Data.Id;
                  childDetails['ProcessCategory'] = obj.ProcessCategory;
                  LstPayOutDet1.push(childDetails);


                  var a = new Array();
                  a['AccountNumber'] = obj.AccountNumber,
                    a['BankName'] = obj.BankName,
                    a['CompanyBankName'] = obj.CompanyBankName,
                    a['EmployeeCode'] = obj.EmployeeCode,
                    a['EmployeeId'] = obj.EmployeeId,
                    a['EmployeeName'] = obj.EmployeeName,
                    a['IFSCCode'] = obj.IFSCCode,
                    a['Id'] = obj.Id,
                    a['id'] = obj.Id,
                    a['IsPaymentHold'] = obj.IsPaymentHold,
                    a['IsPaymentHoldDisplayName'] = obj.IsPaymentHoldDisplayName,
                    a['MobileNumber'] = obj.MobileNumber,
                    a['NetPay'] = obj.NetPay,
                    a['PayOutInformationId'] = obj.PayOutInformationId,
                    a['PayOutStatus'] = obj.PayOutStatus,
                    a['PayPeriodId'] = obj.PayPeriodId,
                    a['PayTransactionId'] = obj.PayTransactionId,
                    a['ReleasePayoutInformationId'] = 0, // PayOutInfoId,
                    a['Status'] = 'Approved'  //PayOutDetailsStatus.Approved;// obj.Status,
                  a['StatusCode'] = 7500; // obj.StatusCode,
                  a['TimeCardId'] = obj.TimeCardId,
                    a['UPIId'] = obj.UPIId,
                    a['ProcessCategory'] = obj.ProcessCategory,
                    a['companybankaccountid'] = this.BehaviourObject_Data.CompanyBankAccountId;
                  this.angularGrid.gridService.addItem(a);

                });

                item.TableDataSrc = [];
                let index = this.dynamicBankDetails.findIndex(d => d.PayOutInformationId === item.PayOutInformationId); //find index in your array
                this.dynamicBankDetails.splice(index, 1);

                let submitobjePayOut1 = new PayoutInformation();
                submitobjePayOut1.Id = tempObject.Id;
                submitobjePayOut1.CompanyId = this.sessionDetails.Company.Id;
                submitobjePayOut1.ClientId = this.BehaviourObject_Data.clientId;
                submitobjePayOut1.ClientContractId = this.BehaviourObject_Data.clientcontractId;
                submitobjePayOut1.ClientName = this.BehaviourObject_Data.ClientName;
                submitobjePayOut1.PayPeriodId = this.BehaviourObject_Data.payperiodId;
                submitobjePayOut1.CompanyBankAccountId = this.BehaviourObject_Data.CompanyBankAccountId;
                submitobjePayOut1.PayPeriodName = tempObject.PayPeriodName;
                submitobjePayOut1.PayrunIds = tempObject.PayrunIds;
                submitobjePayOut1.RequestedBy = tempObject.RequestedBy;
                submitobjePayOut1.RequesterName = tempObject.RequesterName;
                submitobjePayOut1.RequestedOn = moment(tempObject.RequestedOn).format('YYYY-MM-DD');
                submitobjePayOut1.ApprovedOn = moment(tempObject.ApprovedOn).format('YYYY-MM-DD');
                submitobjePayOut1.ProcessCategory = tempObject.ProcessCategory;
                submitobjePayOut1.ApprovedId = tempObject.ApprovedId;
                submitobjePayOut1.ApproverName = tempObject.ApproverName;
                submitobjePayOut1.PayOutDate = moment(tempObject.PayOutDate).format('YYYY-MM-DD');
                submitobjePayOut1.Status = tempObject.Status; // PayOutStatus.Cancelled; // tempObject.Status;
                submitobjePayOut1.PaymentMode = 0;
                submitobjePayOut1.TransactionRemarks = tempObject.TransactionRemarks;
                submitobjePayOut1.LstPayoutInformationDetails = LstPayOutDet1;
                payOutModel.NewDetails = submitobjePayOut1;
                payOutModel.OldDetails = submitobjePayOut1;
                console.log('PAYOUT MODEL 2 : ', payOutModel);
                console.log('dynamic', this.dynamicBankDetails);
                console.log('loc', localList);

                this.payrollService.put_UpsertPayoutInformation(JSON.stringify(payOutModel))
                  .subscribe((result) => {
                    const rep = result as apiResult
                    if (rep.Status) {
                      console.log('PAYOUT 2 RESPONSE : ', rep);
                      this.do_update_cancelled_payout(payOutModel.NewDetails, localList, jsonStr);
                      this.loadingScreenService.stopLoading();


                      // this.modal_dismiss2();
                    }
                    else {
                      this.loadingScreenService.stopLoading();
                      this.alertService.showWarning(rep.Message)
                    }
                  });
              }
            });




          } else if (
            /* Read more about handling dismissals below */
            inputValue.dismiss === Swal.DismissReason.cancel

          ) {
          }
        })


      } else if (
        /* Read more about handling dismissals below */
        res.dismiss === Swal.DismissReason.cancel

      ) {
        this.loadingScreenService.stopLoading(); this.getDataset(); this.selectedItems = [];
      }
    })










    // if (item.ModeOfTransfer == 1) {
    //   this.alertService.showWarning("API mode is not avaliable. Please contact supprt admin.");
    //   return;
    // }   

    // this.local_dataset = [];
    // this.ObjectOfPayoutInformation = null;
    // this.loadingScreenService.startLoading();
    // this.getPayoutInformationById(this.BehaviourObject_Data.Id).then((result) => {
    //   console.log('result', result);
    //   if (result != null) {
    //     this.ObjectOfPayoutInformation = result;
    //     this.local_dataset = this.ObjectOfPayoutInformation != null && this.ObjectOfPayoutInformation.LstPayoutInformationDetails.length > 0 && this.ObjectOfPayoutInformation.LstPayoutInformationDetails.filter(x => x.ReleasePayoutInformationId == item.PayOutInformationId);


    //     let LstPayOutDetails = [];
    //     var PayOutInfoId = 0;
    //     var currentDate = new Date();
    //     let payOutModel: PayOutModel = _PayOutModel;

    //     if (buttonAction == 'ConfirmPayout' && this.local_dataset.filter(a => a.AccountNumber == null || a.IFSCCode == null).length == this.local_dataset.length) {
    //       this.loadingScreenService.stopLoading();
    //       this.alertService.showWarning("The user(s) you selected have no bank details");
    //       return;
    //     }
    //     this.local_dataset.forEach(obj => {
    //       if (obj.AccountNumber != null) {
    //         var childDetails = new PayoutInformationDetails();
    //         PayOutInfoId = obj.PayOutInformationId;
    //         childDetails.Id = obj.Id;
    //         childDetails.PayoutInformationId = this.ObjectOfPayoutInformation.Id;// obj.PayOutInformationId;
    //         childDetails.TimeCardId = obj.TimeCardId;
    //         childDetails.EmployeeId = obj.EmployeeId;
    //         childDetails.EmployeeName = obj.EmployeeName;
    //         childDetails.BankName = this.ObjectOfPayoutInformation.LstPayoutInformationDetails != null && this.ObjectOfPayoutInformation.LstPayoutInformationDetails.length > 0 ?
    //           this.ObjectOfPayoutInformation.LstPayoutInformationDetails.find(a => a.Id == obj.Id).BankName : obj.BankName;
    //         childDetails.IFSCCode = this.ObjectOfPayoutInformation.LstPayoutInformationDetails != null && this.ObjectOfPayoutInformation.LstPayoutInformationDetails.length > 0 ?
    //           this.ObjectOfPayoutInformation.LstPayoutInformationDetails.find(a => a.Id == obj.Id).IFSCCode : obj.IFSCCode;
    //         childDetails.AccountNumber = this.ObjectOfPayoutInformation.LstPayoutInformationDetails != null && this.ObjectOfPayoutInformation.LstPayoutInformationDetails.length > 0 ?
    //           this.ObjectOfPayoutInformation.LstPayoutInformationDetails.find(a => a.Id == obj.Id).AccountNumber : obj.AccountNumber;
    //         childDetails.MobileNumber = this.ObjectOfPayoutInformation.LstPayoutInformationDetails != null && this.ObjectOfPayoutInformation.LstPayoutInformationDetails.length > 0 ?
    //           this.ObjectOfPayoutInformation.LstPayoutInformationDetails.find(a => a.Id == obj.Id).MobileNumber : obj.MobileNumber;
    //         childDetails.UPIId = this.ObjectOfPayoutInformation.LstPayoutInformationDetails != null && this.ObjectOfPayoutInformation.LstPayoutInformationDetails.length > 0 ?
    //           this.ObjectOfPayoutInformation.LstPayoutInformationDetails.find(a => a.Id == obj.Id).UPIId : obj.UPIId;
    //         childDetails.PayPeriodId = this.ObjectOfPayoutInformation.LstPayoutInformationDetails != null && this.ObjectOfPayoutInformation.LstPayoutInformationDetails.length > 0 ?
    //           this.ObjectOfPayoutInformation.LstPayoutInformationDetails.find(a => a.Id == obj.Id).PayPeriodId : obj.PayPeriodId;
    //         childDetails.PayPeriodName = this.ObjectOfPayoutInformation.LstPayoutInformationDetails != null && this.ObjectOfPayoutInformation.LstPayoutInformationDetails.length > 0 ?
    //           this.ObjectOfPayoutInformation.LstPayoutInformationDetails.find(a => a.Id == obj.Id).PayPeriodName : obj.PayPeriodName;
    //         // childDetails.Narration = obj.Narration;
    //         childDetails.NetPay = this.ObjectOfPayoutInformation.LstPayoutInformationDetails != null && this.ObjectOfPayoutInformation.LstPayoutInformationDetails.length > 0 ?
    //           this.ObjectOfPayoutInformation.LstPayoutInformationDetails.find(a => a.Id == obj.Id).NetPay : obj.NetPay;
    //         childDetails.ExternalRefCode = this.ObjectOfPayoutInformation.LstPayoutInformationDetails != null && this.ObjectOfPayoutInformation.LstPayoutInformationDetails.length > 0 ?
    //           this.ObjectOfPayoutInformation.LstPayoutInformationDetails.find(a => a.Id == obj.Id).ExternalRefCode : "";
    //         childDetails.AcknowledgmentDetail = this.ObjectOfPayoutInformation.LstPayoutInformationDetails != null && this.ObjectOfPayoutInformation.LstPayoutInformationDetails.length > 0 ?
    //           this.ObjectOfPayoutInformation.LstPayoutInformationDetails.find(a => a.Id == obj.Id).AcknowledgmentDetail : "";
    //         childDetails.IsPaymentDone = this.ObjectOfPayoutInformation.LstPayoutInformationDetails != null && this.ObjectOfPayoutInformation.LstPayoutInformationDetails.length > 0 ?
    //           this.ObjectOfPayoutInformation.LstPayoutInformationDetails.find(a => a.Id == obj.Id).IsPaymentDone : obj.IsPaymentDone == undefined ? false : obj.IsPaymentDone;
    //         childDetails.Status = obj.StatusCode;
    //         childDetails.IsPaymentHold = obj.IsPaymentHold;
    //         childDetails.ModeType = UIMode.Edit;
    //         childDetails.PayTransactionId = obj.PayTransactionId;
    //         childDetails.CompanyBankAccountId = item.CompanyBankAccountId;
    //         childDetails.ReleasePayoutInformationId = obj.PayOutInformationId;
    //         childDetails.transferType = TransferType.NEFT;
    //         childDetails.PaymentMode = this.YBankModeTransfer == 1 ? PaymentMode.API : PaymentMode.BatchFile
    //         LstPayOutDetails.push(childDetails)
    //       }

    //     });

    //     let submitobjePayOut1 = new PayoutInformation();
    //     submitobjePayOut1.Id = item.PayOutInformationId //; this.ObjectOfPayoutInformation.Id;
    //     submitobjePayOut1.CompanyId = this.sessionDetails.Company.Id;
    //     submitobjePayOut1.ClientId = this.BehaviourObject_Data.clientId;
    //     submitobjePayOut1.ClientContractId = this.BehaviourObject_Data.clientcontractId;
    //     submitobjePayOut1.ClientName = this.BehaviourObject_Data.ClientName;
    //     submitobjePayOut1.PayPeriodId = this.BehaviourObject_Data.payperiodId;
    //     submitobjePayOut1.PayPeriodName = this.ObjectOfPayoutInformation.PayPeriodName;
    //     submitobjePayOut1.ProcessCategory = this.ObjectOfPayoutInformation.ProcessCategory;
    //     submitobjePayOut1.TransactionRemarks = this.ObjectOfPayoutInformation.TransactionRemarks;
    //     submitobjePayOut1.CompanyBankAccountId = item.CompanyBankAccountId;
    //     submitobjePayOut1.PayrunIds = this.ObjectOfPayoutInformation.PayrunIds;
    //     // submitobjePayOut.PayrunIds.push(this.selectedItems[0].PayrunId);
    //     // submitobjePayOut.PayrunIds = JSON.stringify(this.BehaviourObject_Data.PayrunIds) as;
    //     submitobjePayOut1.RequestedBy = this.ObjectOfPayoutInformation.RequestedBy;
    //     submitobjePayOut1.RequesterName = this.ObjectOfPayoutInformation.RequesterName;
    //     submitobjePayOut1.RequestedOn = moment(this.ObjectOfPayoutInformation.RequestedOn).format('YYYY-MM-DD');
    //     submitobjePayOut1.ApprovedId = this.ObjectOfPayoutInformation.ApprovedId;
    //     submitobjePayOut1.ApproverName = this.ObjectOfPayoutInformation.ApproverName;
    //     submitobjePayOut1.ApprovedOn = moment(this.ObjectOfPayoutInformation.ApprovedOn).format('YYYY-MM-DD');
    //     submitobjePayOut1.ErrorMessage = this.ObjectOfPayoutInformation.ErrorMessage;
    //     submitobjePayOut1.PayOutDate = moment(this.ObjectOfPayoutInformation.PayOutDate).format('YYYY-MM-DD');
    //     submitobjePayOut1.Status = buttonAction == "ConfirmPayout" ? PayOutStatus.APIPaymentTransferInitiated : buttonAction == "HoldPayout" ? PayOutStatus.Hold : PayOutStatus.APIPaymentTransferInitiated;
    //     submitobjePayOut1.LstPayoutInformationDetails = LstPayOutDetails;
    //     submitobjePayOut1.PaymentMode = item.ModeOfTransfer == 1 ? PaymentMode.API : PaymentMode.BatchFile;
    //     payOutModel.NewDetails = submitobjePayOut1;
    //     payOutModel.OldDetails = submitobjePayOut1;
    //     console.log('PAYRUN MODEL 4 : ', payOutModel);
    //     this.payrollService.put_UpsertPayoutInformation(JSON.stringify(payOutModel))
    //       .subscribe((result) => {
    //         console.log('sss', result);
    //         if (result.Status as apiResult) {
    //           buttonAction != "ConfirmPayout" && buttonAction == "HoldPayout" && this.alertService.showSuccess('The payout was held successfully!')

    //           buttonAction != "ConfirmPayout" && buttonAction == "HoldPayout" && this.currentUrl == '/app/payroll/payoutTransaction_ops' ? this.router.navigateByUrl('app/ui/payoutrequest') : null;
    //           this.loadingScreenService.stopLoading();
    //           buttonAction == "ConfirmPayout" && (this.visible_employeeConfirmPayout = true), this.SelectedTransferMethod = 0;
    //           buttonAction == "GenerateBankFile" && this.dosubmitBankFile(this.BehaviourObject_Data);
    //         } else {
    //           this.loadingScreenService.stopLoading();
    //           buttonAction != "ConfirmPayout" && this.alertService.showWarning('The payout update failed');
    //         }
    //       });
    //   }
    //   else {
    //     this.alertService.showWarning("No records found!");
    //     return;
    //   }
    // })



  }


  do_update_cancelled_payout(payout, payoutdetailsrecords, remarks) {


    this.loadingScreenService.startLoading();
    let lstPayout_UpdatedDet = [];
    let submitobjePayOut = new PayoutInformation();
    submitobjePayOut.Id = payoutdetailsrecords[0].ReleasePayoutInformationId;
    submitobjePayOut.CompanyId = this.sessionDetails.Company.Id;
    submitobjePayOut.ClientId = payout.ClientId;
    submitobjePayOut.ClientContractId = payout.ClientContractId;
    submitobjePayOut.ClientName = payout.ClientName
    submitobjePayOut.CompanyBankAccountId = payout.CompanyBankAccountId;
    submitobjePayOut.ApprovedId = this.UserId;
    submitobjePayOut.Status = PayOutStatus.Cancelled;
    submitobjePayOut.TransactionRemarks = remarks;
    submitobjePayOut.LstPayoutInformationDetails = [];
    submitobjePayOut.ProcessCategory = payout.ProcessCategory;
    lstPayout_UpdatedDet.push(submitobjePayOut)

    this.payrollService.put_UpdatePayoutInformation(lstPayout_UpdatedDet)
      .subscribe((result) => {
        const apiResult: apiResult = result;
        if (apiResult.Status) {
          this.loadingScreenService.stopLoading();
        } else {
          this.loadingScreenService.stopLoading();
        }
      }, err => {
        this.loadingScreenService.stopLoading();

      })
  }

  selectAll_PayoutEmployee(event: any, parentObj) {
    this.selectedEmployeeForRetryPayout = [];
    console.log('parentObj 2', parentObj);
    console.log('eve', event.target.checked);

    parentObj.TableDataSrc.forEach(e => {
      if (e.StatusCode == '7729' || e.StatusCode == '7749' || e.StatusCode == '7500') {
        event.target.checked == true ? e.isSelected = true : e.isSelected = false
      }
    });

    if (event.target.checked) {
      parentObj.TableDataSrc.forEach(i => {
        if (i.StatusCode == '7729' || i.StatusCode == '7749' || i.StatusCode == '7500') {
          this.selectedEmployeeForRetryPayout.push(i);
        }
      });
    } else {
      this.selectedEmployeeForRetryPayout = [];
    }
  }


  onChangeRetryCheckbox(obj, parentObj, event) {
    console.log('parentObj', parentObj);
    let updateItem = parentObj.TableDataSrc.find(i => i.Id == obj.Id);
    let index = this.selectedEmployeeForRetryPayout.indexOf(updateItem);

    console.log(index);

    if (index > -1) {
      this.selectedEmployeeForRetryPayout.splice(index, 1);
    }
    else {
      this.selectedEmployeeForRetryPayout.push(obj);
    }
    var totalLength = 0;
    parentObj.TableDataSrc.forEach(e => {
      if (e.StatusCode == '7729' || e.StatusCode == '7749' || e.StatusCode == '7500') {
        // e.SOList.map((i) => {
        totalLength = totalLength + 1;
      }
      // });
    });
    if (totalLength === this.selectedEmployeeForRetryPayout.length) {
      obj.selectAll = true;
    }
    else {
      obj.selectAll = false;
    }

    console.log('selectedSOs', this.selectedEmployeeForRetryPayout);;

  }

  retryPayout_dynamic(item, buttonAction) {

    if (this.selectedEmployeeForRetryPayout.length == 0) {
      this.alertService.showWarning("No records found!");
      return;
    }
    if (this.selectedEmployeeForRetryPayout.filter(z => z.MobileNumber == null || z.MobileNumber == '').length > 0) {
      this.alertService.showWarning('The payout cannot be confirmed some of the employees does not have mobile number. Please provide the technical details and try again.');
      return;
    }

    this.local_dataset = [];
    this.ObjectOfPayoutInformation = null;
    this.loadingScreenService.startLoading();
    this.getPayoutInformationById(this.BehaviourObject_Data.Id).then((result) => {
      console.log('result', result);
      var res = result as any;
      if (result != null) {
        this.ObjectOfPayoutInformation = result;
        this.ObjectOfPayoutInformation != null && this.ObjectOfPayoutInformation.LstPayoutInformationDetails.length > 0 && this.ObjectOfPayoutInformation.LstPayoutInformationDetails.forEach(m => {
          let isexistonSelecteditems = this.selectedEmployeeForRetryPayout.find(x => x.Id == m.Id);
          isexistonSelecteditems != undefined && this.local_dataset.push(m);
        });
        $('#popup_ConfirmPayout').modal('show');
        this.SelectedTransferMethod = 0;
        console.log('local_dataset', this.local_dataset);
        this.local_dataset.forEach(element => {
          element['EmployeeCode'] = item.TableDataSrc.find(a => a.EmployeeId == element.EmployeeId).EmployeeCode;
        });
        this.loadingScreenService.stopLoading();
        return;
      }
    });
  }


  confirmPayout_dynamic(item, buttonAction) {
    console.log('item :', item);
    if (item.TableDataSrc.length == 0) {
      this.alertService.showWarning("No records found!");
      return;
    }



    if (item.PayOutStatusCode > 7500) {
      this.alertService.showWarning("Warning : You already updated the payout. ");
      return;
    }

    if (item.TableDataSrc.filter(z => z.MobileNumber == null || z.MobileNumber == '').length > 0) {
      this.alertService.showWarning('The payout cannot be confirmed some of the employees does not have mobile number. Please provide the technical details and try again.');
      return;
    }

    this.local_dataset = [];
    this.ObjectOfPayoutInformation = null;
    this.loadingScreenService.startLoading();
    this.getPayoutInformationById(this.BehaviourObject_Data.Id).then((result) => {
      console.log('result', result);
      var res = result as any;
      if (result != null) {

        // if((res.Status) > PayOutStatus.Approved){
        //   this.loadingScreenService.stopLoading();
        //   this.alertService.showWarning("Warning : You already updated the payout. ");
        // return;
        // }
        this.ObjectOfPayoutInformation = result;
        this.local_dataset = this.ObjectOfPayoutInformation != null && this.ObjectOfPayoutInformation.LstPayoutInformationDetails.length > 0 && this.ObjectOfPayoutInformation.LstPayoutInformationDetails.filter(x => x.ReleasePayoutInformationId == item.PayOutInformationId);
        // this.visible_employeeConfirmPayout = true;
        $('#popup_ConfirmPayout').modal('show');
        this.SelectedTransferMethod = 0;
        console.log('local_dataset', this.local_dataset);
        this.local_dataset.forEach(element => {
          element['EmployeeCode'] = item.TableDataSrc.find(a => a.EmployeeId == element.EmployeeId).EmployeeCode;
        });
        this.loadingScreenService.stopLoading();
        return;
      }
    });

  }


  generatebankFile_dynamic(item) {


    if (item.TableDataSrc.length == 0) {
      this.alertService.showWarning("No records found!");
      return;
    }

    if (item.PayOutStatusCode > 7500) {
      this.alertService.showWarning("Warning : You already updated the payout. ");
      return;
    }

    // this.validatePayoutIsLocked().then((objet) => {
    //   if (!objet[0].IsValidForUpdate) {
    //     this.alertService.showWarning(objet[0].Remarks);
    //   } else {


    this.loadingScreenService.startLoading();
    console.log('generat item', item);
    this.getPayoutInformationById(this.BehaviourObject_Data.Id).then((result) => {
      console.log('result', result);
      if (result != null) {
        var obj = result as any;
        let lstPayout_UpdatedDet = [];
        let submitobjePayOut = new PayoutInformation();
        submitobjePayOut.Id = item.PayOutInformationId;
        submitobjePayOut.CompanyId = this.sessionDetails.Company.Id;
        submitobjePayOut.ClientId = obj.ClientId;
        submitobjePayOut.ClientContractId = obj.ClientContractId;
        submitobjePayOut.ClientName = obj.ClientName
        submitobjePayOut.CompanyBankAccountId = item.CompanyBankAccountId;
        submitobjePayOut.ApprovedId = this.UserId;
        submitobjePayOut.ApproverName = this.PersonName;
        submitobjePayOut.PayOutDate = moment(obj.PayOutDate).format('YYYY-MM-DD');
        submitobjePayOut.Status = PayOutStatus.PaymentFileGenerationInititated;

        submitobjePayOut.LstPayoutInformationDetails = obj != null && obj.LstPayoutInformationDetails.length > 0 && obj.LstPayoutInformationDetails.filter(x => x.ReleasePayoutInformationId == item.PayOutInformationId);
        lstPayout_UpdatedDet.push(submitobjePayOut)

        this.payrollService.put_GeneratePayoutFile(lstPayout_UpdatedDet)
          .subscribe((result) => {
            const apiResult: apiResult = result;
            if (apiResult.Status) {
              let dynoName = `${obj.ClientName}_Payout_${obj.Id}`
              this.downloadService.base64Toxls(apiResult.Result, dynoName);
              this.loadingScreenService.stopLoading();
              this.dynamicBankDetails.length > 0 && this.updateReleaePO_status()
            } else {
              this.loadingScreenService.stopLoading();
              this.alertService.showWarning("Attention : An error occurred while creating bank file.");
              return;
            }
          }, err => {

          });
      } else {
        this.alertService.showWarning("Attention : An error occurred while creating bank file.");
        return;
      }
    })
    // }
    // });


  }

  getPayoutInformationById(payOutInformationId) {
    const promise = new Promise((res, rej) => {
      this.payrollService.GetPayoutInformationbyId(payOutInformationId).subscribe((result) => {
        const answer: apiResult = result;
        if (answer.Status) {
          res(answer.Result)
        } else {
          res(null);
        }
      });
    })
    return promise;
  }
  seeClientDetails() {

    this.seemoreTxt == "Hide Details" ? this.showClientDetails = false : this.seemoreTxt == "See Client Details" ? this.showClientDetails = true : null;
    if (this.showClientDetails == true) {
      this.seemoreTxt = "Hide Details"
    } else {
      this.seemoreTxt = "See Client Details"
    }
  }

  async getPageLayout() {
    this.pageLayout = null;
    this.spinner = true;


    this.code = this.currentUrl == '/app/payroll/payoutTransaction' ? 'payoutTransaction' : this.currentUrl == '/app/payroll/payoutTransaction_finance' ? 'payoutTransaction_finance' : 'payoutTransaction_ops';
    // await this.pagelayoutBuilderService.pagelayoutConfiguration(this.code, this.BehaviourObject_Data).then((result) => {
    //   console.log('result', result);

    // })
    this.sessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses)); // Get the whole matched session element set as a clean json(array) via an session object
    this.PersonName = this.sessionDetails.UserSession.PersonName;
    this.UserId = this.sessionDetails.UserSession.UserId;

    this.pageLayoutService.getPageLayout(this.code).subscribe(response => {
      if (response.Status === true && response.dynamicObject != null) {
        this.pageLayout = response.dynamicObject;
        this.setGridConfiguration();


        this.route.data.subscribe(data => {
          if (data.DataInterface.SearchElementValuesList !== null && data.DataInterface.SearchElementValuesList.length > 0) {
            this.BehaviourObject_Data = data.DataInterface.RowData[0];
            console.log('this.BehaviourObject_Data', this.BehaviourObject_Data);


            data.DataInterface.SearchElementValuesList.forEach(searchElementValues => {
              this.pageLayout.SearchConfiguration.SearchElementList.forEach(searchElement => {
                if (searchElementValues.OutputFieldName === searchElement.FieldName) {
                  searchElement.Value = searchElementValues.Value;
                  searchElement.ReadOnly = searchElementValues.ReadOnly;
                }
              })
            })
            this.rowDataService.dataInterface = {
              SearchElementValuesList: [],
              RowData: null
            }
            this.getDataset();
          }
          else if (this.pageLayout.GridConfiguration.ShowDataOnLoad) {
            this.getDataset();
          }

          this.spinner = false;
        });
      }
      else {
        this.spinner = false;
      }
    }, error => {
      console.log(error);
      this.spinner = false;
    }
    );
  }

  // API CALLS USING GRID ROUTING AND SEARCHELEMENTS 
  async getDataset() {
    if (this.BehaviourObject_Data == undefined) {
      this.close_batch();
    }

    await this.Get_PayOut_LookupDetails();
    this.spinner = true;
    setTimeout(() => {


      this.dataset = [];

      this.pageLayoutService.getDataset(this.pageLayout.GridConfiguration.DataSource, this.pageLayout.SearchConfiguration.SearchElementList).subscribe(dataset => {

        if (dataset.Status == true && dataset.dynamicObject !== null && dataset.dynamicObject !== '') {
          var responseList = [];
          var parentList = []; // remove unwanted lines
          responseList = JSON.parse(dataset.dynamicObject);
          let payoutDetailsStatus = this.utilsHelper.transform(PayOutDetailsStatus) as any;
          console.log('PAYOUT STATUS :', payoutDetailsStatus);

          let ProcessCategoryStatus = this.utilsHelper.transform(ProcessCategory) as any;
          responseList.length > 0 && responseList.forEach(element => {
            // element.Status = null;
            var isStatusAppear = payoutDetailsStatus.find(a => a.id == element.StatusCode)
            element.Status = isStatusAppear != undefined ? isStatusAppear.name : ''; // payoutDetailsStatus.find(a => a.id == element.StatusCode).name;
            element.IsPaymentHoldDisplayName = element.IsPaymentHold == true ? "Yes" : 'No';
            element.ProcessCategory = ProcessCategoryStatus.find(z => z.id == element.ProcessCategory).name;
          });
          console.log('RESPONSE OF LIST OF PAYOUTINFORMATION DETAILS ::', responseList);

          var emptyList = [];
          responseList.length > 0 && responseList.forEach(ev => {
            // console.log('ev', ev);
            // console.log('hehe', this.BehaviourObject_Data);

            // if (ev.companybankaccountid == this.BehaviourObject_Data.CompanyBankAccountId || ev.companybankaccountid == 0) {
            if (ev.ReleasePayoutInformationId == this.BehaviourObject_Data.Id || ev.ReleasePayoutInformationId == 0) {
              parentList.push(ev);
            } else {
              emptyList.push(ev);
            }
          });

          console.log('emptyList', emptyList);

          if (emptyList.length > 0) {

            emptyList.forEach(el => {

              if (el.ReleasePayoutInformationId != this.BehaviourObject_Data.PayOutInformationId) {

                if (this.dynamicBankDetails != null && this.dynamicBankDetails.length > 0) {
                  var isRevokeExist = this.dynamicBankDetails.find(a => a.PayOutInformationId == el.ReleasePayoutInformationId && a.ModeOfTransfer == el.PaymentMode);
                  isRevokeExist != undefined && (
                    isRevokeExist.TableDataSrc = [],
                    isRevokeExist.TableDataSrc = emptyList.filter(a => a.ReleasePayoutInformationId == el.ReleasePayoutInformationId && a.companybankaccountid == el.companybankaccountid && a.PaymentMode == el.PaymentMode)
                  )
                  isRevokeExist == undefined &&
                    (
                      this.dynamicBankDetails.push({
                        Id: el.companybankaccountid,
                        CompanyBankAccountId: el.companybankaccountid,
                        ModeOfTransfer: (el.PaymentMode == 0 || el.PaymentMode == 1) ? 1 : 2, // this.GlbCompanyBankList.find(a => a.Id == emptyList[0].companybankaccountid).IsAPIBased == true ? 2 : 1, // this.isDisbaledModeAPI == true ? 2 : 1,
                        HoldButton: "Hold Payout",
                        ConfirmButton: "Confirm Payout",
                        TableDataSrc: emptyList.filter(a => a.ReleasePayoutInformationId == el.ReleasePayoutInformationId && a.companybankaccountid == el.companybankaccountid && a.PaymentMode == el.PaymentMode),
                        Entire_TableDataSrc: emptyList.filter(a => a.ReleasePayoutInformationId == el.ReleasePayoutInformationId && a.companybankaccountid == el.companybankaccountid && a.PaymentMode == el.PaymentMode),
                        BankFundBalance: null,
                        PayOutInformationId: el.ReleasePayoutInformationId,
                        PayOutStatus: this.payoutStatus.find(ee => ee.id == el.PayOutStatus).name,
                        PayOutStatusCode: el.PayOutStatus,
                        SuccessRate: this.calcSuccessRate(emptyList.filter(a => a.ReleasePayoutInformationId == el.ReleasePayoutInformationId && a.companybankaccountid == el.companybankaccountid && a.PaymentMode == el.PaymentMode), 'Successrate'),
                        PayoutStatusTooltip: this.calcSuccessRate(emptyList.filter(a => a.ReleasePayoutInformationId == el.ReleasePayoutInformationId && a.companybankaccountid == el.companybankaccountid && a.PaymentMode == el.PaymentMode), 'tooltip'),
                        TotalPercent: this.calcSuccessRate(emptyList.filter(a => a.ReleasePayoutInformationId == el.ReleasePayoutInformationId && a.companybankaccountid == el.companybankaccountid && a.PaymentMode == el.PaymentMode), 'percentage'),
                        ProgressRate: this.calcSuccessRate(emptyList.filter(a => a.ReleasePayoutInformationId == el.ReleasePayoutInformationId && a.companybankaccountid == el.companybankaccountid && a.PaymentMode == el.PaymentMode), 'Progressrate'),
                        FailedRate: this.calcSuccessRate(emptyList.filter(a => a.ReleasePayoutInformationId == el.ReleasePayoutInformationId && a.companybankaccountid == el.companybankaccountid && a.PaymentMode == el.PaymentMode), 'Failedrate'),
                        isRetryApplicable: this.isRetryApplicable(emptyList.filter(a => a.ReleasePayoutInformationId == el.ReleasePayoutInformationId && a.companybankaccountid == el.companybankaccountid && a.PaymentMode == el.PaymentMode)),
                        isLoading: false,
                        Statuslist: this.build_payoutdetailsStatus(emptyList.filter(a => a.ReleasePayoutInformationId == el.ReleasePayoutInformationId && a.companybankaccountid == el.companybankaccountid && a.PaymentMode == el.PaymentMode)),
                        selectAll: false,
                        searchText: null
                      })
                    )
                } else {
                  this.dynamicBankDetails.push({
                    Id: el.companybankaccountid,
                    CompanyBankAccountId: el.companybankaccountid,
                    ModeOfTransfer: (el.PaymentMode == 0 || el.PaymentMode == 1) ? 1 : 2,//  this.GlbCompanyBankList.find(a => a.Id == emptyList[0].companybankaccountid).IsAPIBased == true ? 2 : 1 ,
                    HoldButton: "Hold Payout",
                    ConfirmButton: "Confirm Payout",
                    TableDataSrc: emptyList.filter(a => a.ReleasePayoutInformationId == el.ReleasePayoutInformationId && a.companybankaccountid == el.companybankaccountid && a.PaymentMode == el.PaymentMode),
                    Entire_TableDataSrc: emptyList.filter(a => a.ReleasePayoutInformationId == el.ReleasePayoutInformationId && a.companybankaccountid == el.companybankaccountid && a.PaymentMode == el.PaymentMode),
                    BankFundBalance: null,
                    PayOutInformationId: el.ReleasePayoutInformationId,
                    PayOutStatus: this.payoutStatus.find(ee => ee.id == el.PayOutStatus).name,
                    PayOutStatusCode: el.PayOutStatus,
                    SuccessRate: this.calcSuccessRate(emptyList.filter(a => a.ReleasePayoutInformationId == el.ReleasePayoutInformationId && a.companybankaccountid == el.companybankaccountid && a.PaymentMode == el.PaymentMode), 'Successrate'),
                    PayoutStatusTooltip: this.calcSuccessRate(emptyList.filter(a => a.ReleasePayoutInformationId == el.ReleasePayoutInformationId && a.companybankaccountid == el.companybankaccountid && a.PaymentMode == el.PaymentMode), 'tooltip'),
                    TotalPercent: this.calcSuccessRate(emptyList.filter(a => a.ReleasePayoutInformationId == el.ReleasePayoutInformationId && a.companybankaccountid == el.companybankaccountid && a.PaymentMode == el.PaymentMode), 'percentage'),
                    ProgressRate: this.calcSuccessRate(emptyList.filter(a => a.ReleasePayoutInformationId == el.ReleasePayoutInformationId && a.companybankaccountid == el.companybankaccountid && a.PaymentMode == el.PaymentMode), 'Progressrate'),
                    FailedRate: this.calcSuccessRate(emptyList.filter(a => a.ReleasePayoutInformationId == el.ReleasePayoutInformationId && a.companybankaccountid == el.companybankaccountid && a.PaymentMode == el.PaymentMode), 'Failedrate'),
                    isRetryApplicable: this.isRetryApplicable(emptyList.filter(a => a.ReleasePayoutInformationId == el.ReleasePayoutInformationId && a.companybankaccountid == el.companybankaccountid && a.PaymentMode == el.PaymentMode)),
                    isLoading: false,
                    Statuslist: this.build_payoutdetailsStatus(emptyList.filter(a => a.ReleasePayoutInformationId == el.ReleasePayoutInformationId && a.companybankaccountid == el.companybankaccountid && a.PaymentMode == el.PaymentMode)),
                    selectAll: false,
                    searchText: null
                  })
                }
              }
            });




            this.dynamicBankDetails.length > 0 && this.updateReleaePO_status();


            this.dynamicBankDetails.forEach(element => {
              if (element.TableDataSrc.length > 0) {
                element.TableDataSrc.forEach(e => {
                  e['isSelected'] = false
                });
              }
            });

            console.log('dynamicBankDetails', this.dynamicBankDetails);

            // this.isDisbaledModeFileShare = this.GlbCompanyBankList.find(a => a.Id == emptyList[0].companybankaccountid).IsAPIBased == true ? true : false;
            // this.isDisbaledModeAPI = this.GlbCompanyBankList.find(a => a.Id == emptyList[0].companybankaccountid).IsAPIBased == true ? false : true;

            // this.dynamicBankDetails.push({
            //   Id: emptyList[0].companybankaccountid,
            //   CompanyBankAccountId: emptyList[0].companybankaccountid,
            //   ModeOfTransfer: this.isDisbaledModeAPI == true ? 2 : 1,
            //   HoldButton: "Hold Payout",
            //   ConfirmButton: "Confirm Payout",
            //   TableDataSrc: emptyList,
            //   BankFundBalance: null,
            //   PayOutInformationId: emptyList[0].ReleasePayoutInformationId
            // });

          }


          this.dataset = parentList;
          console.log('DYNAMIC RECORD ICICI :', this.dynamicBankDetails);
          this.utilityService.ensureIdUniqueness(this.dataset).then((result) => {
            result == true ? this.isPayOutDuplicateEntry = true : this.isPayOutDuplicateEntry = false;
          }, err => {

          })


          this.spinner = false;
          // this.Init_timer();
          console.log('this.dataset', this.dataset);

        }
        else {
          this.spinner = false;
          console.log('Sorry! Could not Fetch Data|', dataset);
        }
      }, error => {
        this.spinner = false;
        console.log(error);
      })
    }, 2500);
  }

  build_payoutdetailsStatus(listOfRecords) {
    var POD_status = [];
    listOfRecords.forEach(el => {
      POD_status.push({
        id: el.StatusCode,
        name: el.Status
      })
    });
    return _.uniqBy(POD_status, 'id');

  }

  onChangePayoutDetails_Status(event, item) {
    item.TableDataSrc = item.Entire_TableDataSrc;
    return item.TableDataSrc = item.TableDataSrc.filter(item => item.Status == (event.name));
  }


  isRetryApplicable(listOfRecords) {
    return listOfRecords.length > 0 && listOfRecords.filter(item => item.StatusCode == '7749' || item.StatusCode == '7729' || item.StatusCode == '7500').length > 0 ? true : false
  }

  calcSuccessRate(listOfRecords, area) {
    let progress = 0;
    let failed = 0;
    let success = 0;
    let percent = 0;
    let successrate = 0;
    let failedrate = 0;
    let progressrate = 0;
    let failedStatus = [7729, 7749, 7849];
    let progressStatus = [7700, 7500];
    let successStatus = [7800, 10000];

    listOfRecords.length > 0 && listOfRecords.forEach(e => {
      failedStatus.includes(Number(e.StatusCode)) == true ? failed += 1 : null;
      progressStatus.includes(Number(e.StatusCode)) == true ? progress += 1 : null;
      successStatus.includes(Number(e.StatusCode)) == true ? success += 1 : null;

    });


    if (progress == 0) {
      percent = 100;
    } else {
      percent = (100 * progress / listOfRecords.length)
    }
    if (success == 0) {
      successrate = 0;
    } else {
      successrate = (100 * success / listOfRecords.length)
    }
    if (failed == 0) {
      failedrate = 0;
    } else {
      failedrate = (100 * failed / listOfRecords.length)
    }
    if (progress == 0) {
      progressrate = 0;
    } else {
      progressrate = (100 * progress / listOfRecords.length)
    }

    console.log(`${success} Success, ${failed} Failed, ${progress} In Progress`);
    console.log('successrate', successrate);
    console.log('percent', percent);

    if (area == 'Successrate') {
      return successrate;
    } else if (area == 'percentage') {
      return percent;
    }
    else if (area == 'Progressrate') {
      return progressrate;
    }
    else if (area == 'Failedrate') {
      return failedrate;
    }
    else {
      return `${success} Success, ${failed} Failed, ${progress} In Progress`;

    }
  }



  updateReleaePO_status() {
    this.spinner = true;

    this.dynamicBankDetails.forEach(element => {
      this.getPayoutInformationById(element.PayOutInformationId).then((rs) => {
        var res = rs as any;
        element.PayOutStatus = this.payoutStatus.find(ee => ee.id == res.Status).name,
          element.PayOutStatusCode = res.Status
      });

    });
    this.spinner = false;
  }

  setGridConfiguration() {
    if (!this.pageLayout.GridConfiguration.IsDynamicColumns) {
      this.columnDefinition = this.pageLayoutService.setColumns(this.pageLayout.GridConfiguration.ColumnDefinitionList);
    }
    this.gridOptions = this.pageLayoutService.setGridOptions(this.pageLayout.GridConfiguration);
    this.gridOptions.draggableGrouping = {
      dropPlaceHolderText: 'Drop a column header here to group by the column',
      // groupIconCssClass: 'fa fa-outdent',
      deleteIconCssClass: 'fa fa-times',
      onGroupChanged: (e, args) => this.onGroupChange(),
      onExtensionRegistered: (extension) => this.draggableGroupingPlugin = extension,
    }

  }

  onGroupChange() {
    console.log("changed");
    if (!this.pageLayout.GridConfiguration.IsPaginationRequired && this.gridObj && this.pageLayout.GridConfiguration
      && !this.pageLayout.GridConfiguration.IsDynamicColumns)
      this.pagelayoutBuilderService.updateFooter(this.gridObj, this.pageLayout).then((result) => {
        this.pageLayout = result as PageLayout;
      });
  }

  showPreHeader() {
    this.gridObj.setPreHeaderPanelVisibility(true);
  }

  clearGrouping() {
    if (this.draggableGroupingPlugin && this.draggableGroupingPlugin.setDroppedGroups) {

      this.draggableGroupingPlugin.clearDroppedGroups();
    }
  }

  gridChange() {
    console.log("cell changed");
    if (this.gridObj && this.gridObj.setOptions) {
      this.gridObj.setOptions({
        frozenRow: this.pageLayout.GridConfiguration.PinnedRowCount,
        frozenColumn: this.pageLayout.GridConfiguration.PinnedColumnCount,
        frozenBottom: this.pageLayout.GridConfiguration.PinRowFromBottom,
      })
    }
  }

  onCellClicked(e, args) {
    if (this.pageLayout.GridConfiguration.IsDynamicColumns == undefined || this.pageLayout.GridConfiguration.IsDynamicColumns == null
      || !this.pageLayout.GridConfiguration.IsDynamicColumns) {
      const metadata = this.angularGrid.gridService.getColumnFromEventArguments(args);

      var iskeyValue: boolean = false;
      const column = this.angularGrid.gridService.getColumnFromEventArguments(args);

      // console.log(column.dataContext);

      if (column.dataContext.hasOwnProperty("PVRId")) {
        var value = column.dataContext['PVRId'];
        if (value > 0) {
          iskeyValue = true;
        }
      }

      console.log(column);
      var flag = false;
      for (var i = 0; i < this.pageLayout.GridConfiguration.ColumnDefinitionList.length; ++i) {
        //console.log(this.pageLayout.GridConfiguration.ColumnDefinitionList[i]);
        if (column.columnDef.id === this.pageLayout.GridConfiguration.ColumnDefinitionList[i].Id) {
          console.log(this.pageLayout.GridConfiguration.ColumnDefinitionList[i]);
          flag = this.pageLayout.GridConfiguration.ColumnDefinitionList[i].Clickable;
          if (flag) {
            console.log("clicked", column)
            if (this.pageLayout.GridConfiguration.ColumnDefinitionList[i].FunctionName !== null
              && this.pageLayout.GridConfiguration.ColumnDefinitionList[i].FunctionName !== '') {
              this.executeFunction(this.pageLayout.GridConfiguration.ColumnDefinitionList[i], column.dataContext, column)
            }
            else if (this.pageLayout.GridConfiguration.ColumnDefinitionList[i].RouteLink !== null
              && this.pageLayout.GridConfiguration.ColumnDefinitionList[i].RouteLink !== '') {

              if (this.pageLayout.GridConfiguration.ColumnDefinitionList[i].SendValuesToSearchElements) {
                this.rowDataService.dataInterface.RowData = column.dataContext;
                if (this.pageLayout.GridConfiguration.ColumnDefinitionList[i].SearchElementValuesList !== null && this.pageLayout.GridConfiguration.ColumnDefinitionList[i].SearchElementValuesList.length > 0) {
                  this.pageLayout.GridConfiguration.ColumnDefinitionList[i].SearchElementValuesList.forEach(searchElementValue => {
                    searchElementValue.Value = column.dataContext[searchElementValue.InputFieldName];
                  }
                  )
                  this.rowDataService.dataInterface.SearchElementValuesList = this.pageLayout.GridConfiguration.ColumnDefinitionList[i].SearchElementValuesList;
                }
              }
              else {
                this.rowDataService.dataInterface.RowData = null;
                this.rowDataService.dataInterface.SearchElementValuesList = [];
              }

              // this.router.navigate([this.pageLayout.GridConfiguration.ColumnDefinitionList[i].RouteLink])

            }
          }
          break;
        }
      }


    }

  }

  executeFunction(columnDefinition: ColumnDefinition, rowData: any, column: any) {
    switch (columnDefinition.FunctionName) {

      case 'onHoldPayment': {
        this.onHoldPayment_Grid(rowData);
        break;
      }
      case 'onPORemoveEmp': {
        this.onRemoveEmp_Grid(rowData);
        break;
      }
      case 'onNetPay_Slider': {
        this.onNetPay_Slider(rowData);
      }

    }
  }
  async onNetPay_Slider(rowRecord) {
    this.rowRecord = rowRecord;
    this.loadingScreenService.startLoading();
    await this.payrollService.GetPaytransactionDetails(rowRecord.PayTransactionId)
      .subscribe((result) => {
        const apiResult: apiResult = result;
        if (apiResult.Status && apiResult.Result) {
          let answer = JSON.parse(apiResult.Result);
          this.Payitems = answer.find(a => a.EmployeeId == rowRecord.EmployeeId);
          this.loadingScreenService.stopLoading();
          if (this.Payitems == undefined || this.Payitems.length == 0) {
            this.alertService.showInfo("No Pay items record found!");
            return;
          }
          this.Payitems = this.Payitems.PayItemdata;
          this.open_netpaySlider();
        } else {
          this.loadingScreenService.stopLoading();
          this.alertService.showInfo("No Pay items record found!");
          return;
        }
      })
  }

  open_netpaySlider(): void {
    this.visible_netpaySlider = true;
  }

  close_netpaySlider(): void {
    this.visible_netpaySlider = false;
  }
  // DYNAMIC BUTTON ACTIONS
  // GET CLIENT BANK LIST
  Get_PayOut_LookupDetails() {
    this.payrollService.get_PayOutLookUpDetails(this.BehaviourObject_Data.clientId)
      .subscribe((result) => {
        const apiResult: apiResult = result;
        if (apiResult.Status) {
          var result = (apiResult.Result) as any
          result = JSON.parse(result);
          this.GlbCompanyBankList = result.CompanyBankAccountList;
          this.companyBankList = result.CompanyBankAccountList;
          console.log('PAYOUT LOOKUP DETAILS :  ', result);
        }
      })
  }
  // CHECK BANK FUND BALANCE  
  checkFundBalance(item, whicharea, ind) {
    this.SpinnerShouldhide = true;
    this.payrollService.GetYBFundBalanceInvoice(item.CompanyBankAccountId).subscribe((res) => {
      console.log('res', res);
      const apiResult: apiResult = res;
      if (apiResult.Status) {
        let answer = apiResult.Result as any;
        whicharea == 'parent' && (this.ParentBankFundBalance = answer.Data.FundsAvailableResult.BalanceAmount as any);
        whicharea != 'parent' && (item.BankFundBalance = answer.Data.FundsAvailableResult.BalanceAmount as any)
        this.SpinnerShouldhide = false
      } else {
        whicharea != 'parent' && (item.BankFundBalance = null)
        this.SpinnerShouldhide = false;
        this.alertService.showWarning(apiResult.Message);
      }
    }, err => {

    });
  }
  do_delete_selctedEmp() {
    // this.validatePayoutIsLocked().then((objet) => {
    //   if (!objet[0].IsValidForUpdate) {
    //     this.alertService.showWarning(objet[0].Remarks);
    //   } else {

    // if (environment.environment.IsAllowableStatusForConfirmPayout.includes(Number(this.BehaviourObject_Data.StatusCode)) == false) {
    //   this.alertService.showWarning('Information : The action was blocked. The Payout items cannot be initiated because the status is in an invalid state or already approved.');
    //   return;
    // }

    if (this.currentUrl == '/app/payroll/payoutTransaction_ops' && this.selectedItems.filter(a => a.StatusCode == PayOutDetailsStatus.Approved).length > 0) {
      this.alertService.showWarning("You don't currently have permission to access this employee.");
      return;
    }

    if (this.currentUrl == '/app/payroll/payoutTransaction_finance' && this.selectedItems.filter(a => a.StatusCode == PayOutDetailsStatus.Stopped).length > 0) {
      this.alertService.showWarning("You don't currently have permission to access this employee.");
      return;
    }

    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: true
    })

    swalWithBootstrapButtons.fire({
      title: `Are you sure you want to void this Employee?`,
      text: "Once voided, you cannot undo this action.",
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: "Yes, void",
      cancelButtonText: 'Not now',
      reverseButtons: true,
      allowEscapeKey: false,
      allowOutsideClick: false
    }).then((res) => {
      if (res.value) {
        const LstRemoveEmployees = [];

        this.selectedItems.forEach(element => {

          this.update_employee_paymentStatus(element, PayOutDetailsStatus.Voided, 'Void');
        });

        // this.update_void_status();

        // UNUSED CODE (PHASE 1 SETUP)
        // this.selectedItems.forEach(item => {
        //   var rmObject = new PayoutInf ormationDetails();
        //   rmObject.Id = item.Id;
        //   rmObject.PayoutInformationId = item.PayoutInformationId;
        //   rmObject.TimeCardId = item.TimeCardId;
        //   rmObject.EmployeeId = item.EmployeeId;
        //   rmObject.EmployeeName = item.EmployeeName;
        //   rmObject.Status = PayOutDetailsStatus.Initiated;
        //   rmObject.ModeType = UIMode.Delete;
        //   LstRemoveEmployees.push(rmObject);

        // });

        // this.payrollService.remove_PayoutInformationDetails(JSON.stringify(LstRemoveEmployees))
        //   .subscribe((result) => {
        //     console.log('REMOVE FOR PAYOUT EMPLOYEE RESPONSE :: ', result);
        //     const apiResult: apiResult = result;
        //     if (apiResult.Status) {

        //       this.selectedItems.forEach(e => {
        //         this.angularGrid.gridService.deleteItemById(e.Id);
        //       })


        //       this.loadingScreenService.stopLoading();
        //       this.alertService.showSuccess(apiResult.Message);
        //     } else {
        //       this.loadingScreenService.stopLoading();
        //       this.alertService.showWarning(apiResult.Message);
        //     }
        //   }, error => {
        //     this.loadingScreenService.stopLoading();

        //   });
      } else if (res.dismiss === Swal.DismissReason.cancel) {
      }
    })
    //   }
    // });

  }

  onHoldPayment_Grid(rowData) {
    console.log('rowData 1', rowData);

    if (this.currentUrl == '/app/payroll/payoutTransaction_ops' && rowData.StatusCode == PayOutDetailsStatus.Approved) {
      this.alertService.showWarning("You don't currently have permission to access this employee.");
      return;
    }

    if (rowData.IsPaymentHold == true) {
      this.alertService.showWarning("You cannot Hold because an employee with that status already updated.");
      return;
    }

    // this.validatePayoutIsLocked().then((objet) => {
    //   if (!objet[0].IsValidForUpdate) {
    //     this.alertService.showWarning(objet[0].Remarks);
    //   } else {

    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: true
    })

    swalWithBootstrapButtons.fire({
      title: `Confirmation?`,
      text: `Are you sure you want to Hold`,
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: `Yes, Hold`,
      cancelButtonText: 'Not now',
      reverseButtons: true,
      allowEscapeKey: false,
      allowOutsideClick: false
    }).then((res) => {
      if (res.value) {
        this.update_employee_paymentStatus(rowData, PayOutDetailsStatus.Initiated, 'Hold');

      } else if (res.dismiss === Swal.DismissReason.cancel) {
      }
    })
    //   }
    // });
  }

  onRemoveEmp_Grid(item) {

    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: true
    })

    swalWithBootstrapButtons.fire({
      title: `Are you sure you want to remove this Employee?`,
      text: "Once deleted, you cannot undo this action.",
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: "Yes, Remove",
      cancelButtonText: 'Not now',
      reverseButtons: true,
      allowEscapeKey: false,
      allowOutsideClick: false
    }).then((res) => {
      if (res.value) {
        const LstRemoveEmployees = [];
        var rmObject = new PayoutInformationDetails();
        rmObject.Id = item.Id;
        rmObject.PayoutInformationId = item.PayoutInformationId;
        rmObject.TimeCardId = item.TimeCardId;
        rmObject.EmployeeId = item.EmployeeId;
        rmObject.EmployeeName = item.EmployeeName;
        rmObject.Status = PayOutDetailsStatus.Initiated;
        rmObject.ModeType = UIMode.Delete;
        LstRemoveEmployees.push(rmObject);
        this.payrollService.remove_PayoutInformationDetails(JSON.stringify(LstRemoveEmployees))
          .subscribe((result) => {
            console.log('REMOVE FOR PAYOUT EMPLOYEE RESPONSE :: ', result);
            const apiResult: apiResult = result;
            if (apiResult.Status) {
              this.angularGrid.gridService.deleteItemById(item.Id);
              this.loadingScreenService.stopLoading();
              this.alertService.showSuccess(apiResult.Message);
            } else {
              this.loadingScreenService.stopLoading();
              this.alertService.showWarning(apiResult.Message);
            }
          }, error => {
            this.loadingScreenService.stopLoading();

          });
      } else if (res.dismiss === Swal.DismissReason.cancel) {
      }
    })
  }

  angularGridReady(angularGrid: AngularGridInstance) {
    this.angularGrid = angularGrid;
    this.gridObj = angularGrid.slickGrid; // grid object
    this.dataviewObj = angularGrid.dataView;

    if (this.gridObj && this.gridObj.setOptions) {

      this.gridObj.setOptions(
        {
          enableColumnPicker: false
        }
      )
      if (this.draggableGroupingPlugin && this.draggableGroupingPlugin.setDroppedGroups && this.pageLayout.GridConfiguration.DefaultGroupingFields) {
        this.draggableGroupingPlugin.setDroppedGroups(this.pageLayout.GridConfiguration.DefaultGroupingFields);
        this.gridObj.invalidate();
        this.gridObj.render();
      }

      if (!this.pageLayout.GridConfiguration.IsPaginationRequired && !this.pageLayout.GridConfiguration.IsDynamicColumns)
        this.pagelayoutBuilderService.updateFooter(this.gridObj, this.pageLayout).then((result) => {
          this.pageLayout = result as PageLayout;
        });
    }
    if (this.pageLayout.GridConfiguration.DisplayFilterByDefault) {
      this.gridObj.setHeaderRowVisibility(true);
    }
  }

  onSelectedRowsChanged(eventData, args) {

    this.selectedItems = [];
    if (args != null && args.rows != null && args.rows.length > 0) {
      for (let i = 0; i < args.rows.length; i++) {
        var row = args.rows[i];
        var row_data = this.dataviewObj.getItem(row);
        this.selectedItems.push(row_data);
      }
    }
    // console.log('answer', this.selectedItems);
  }

  onIndexChange(index: any): void {
    this.index = index.target.textContent == "Batch Employee Information" ? 0 : index.target.textContent == "Payout Other Details" ? 1 :
      index.target.textContent == "Payout Process" ? 2 : 0
  }
  viewClientDetails() {
    this.visible_clientDetails = true;
  }
  close_clientDetails() {
    this.visible_clientDetails = false;
  }

  open() {
    $('#popup_confirmation').modal('show');
  }

  do_hold_selctedEmp(actionName) {

    if (this.selectedItems.length == 0) {
      this.alertService.showWarning("No Employee record(s) have been selected! Please first select");
      return;
    }

    if (this.currentUrl == '/app/payroll/payoutTransaction_ops' && this.selectedItems.filter(a => a.StatusCode == 7500).length > 0) {
      this.alertService.showWarning("You don't currently have permission to access this employee.");
      return;
    }

    if (actionName == 'Release' && this.selectedItems.filter(a => a.IsPaymentHold == false).length > 0) {
      this.alertService.showWarning("One or more employee cannot be released. You have selected item that contains invalid.");
      return;
    }

    // this.validatePayoutIsLocked().then((objet) => {
    //   if (!objet[0].IsValidForUpdate) {
    //     this.alertService.showWarning(objet[0].Remarks);
    //   } else {

    if (this.currentUrl == '/app/payroll/payoutTransaction_finance' && this.selectedItems.filter(a => a.Status == PayOutDetailsStatus.Stopped).length > 0) {
      this.alertService.showWarning("You don't currently have permission to access this employee.");
      return;
    }

    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: true
    })

    swalWithBootstrapButtons.fire({
      title: `Confirmation?`,
      text: `Are you sure you want to ${actionName}`,
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: `Yes, ${actionName}`,
      cancelButtonText: 'Not now',
      reverseButtons: true,
      allowEscapeKey: false,
      allowOutsideClick: false
    }).then((res) => {
      if (res.value) {
        this.selectedItems.forEach(element => {
          actionName == 'Hold' ? this.update_employee_paymentStatus(element, PayOutDetailsStatus.Approved, actionName) :
            actionName == 'Release' ? this.update_employee_paymentStatus(element, PayOutDetailsStatus.Approved, actionName) : this.update_employee_paymentStatus(element, PayOutDetailsStatus.Stopped, actionName);
        });
      } else if (res.dismiss === Swal.DismissReason.cancel) {
      }
    })
    //   }
    // });
  }

  update_employee_paymentStatus(result, statusCode, actionName) {

    let payoutDetailsStatus = this.utilsHelper.transform(PayOutDetailsStatus) as any;
    // this.code != 'payoutTransaction_ops' &&
    (actionName == 'Stop' || actionName == 'Void') && (result.StatusCode = statusCode);
    actionName == 'Release' && (result.IsPaymentHold = false);
    actionName == 'Release' && (result.IsPaymentHoldDisplayName = result.IsPaymentHold == false ? "No" : 'Yes');
    actionName == 'Hold' && (result.IsPaymentHold = true);
    actionName == 'Hold' && (result.IsPaymentHoldDisplayName = result.IsPaymentHold == true ? "Yes" : 'No');
    (actionName == 'Stop' || actionName == 'Void') && (result.IsPaymentHold = false);
    (actionName == 'Stop' || actionName == 'Void') && (result.IsPaymentHoldDisplayName = result.IsPaymentHold == true ? "Yes" : 'No');
    //  this.code != 'payoutTransaction_ops' && 
    (actionName == 'Stop' || actionName == 'Void') && (result.Status = payoutDetailsStatus.find(a => a.id == statusCode).name)
    this.angularGrid.gridService.updateDataGridItemById(result.Id, result, false, false, false);
  }
  onChangeBank(eve) {
    console.log('BANK ONCHANGE :', eve);
    this.modeTransferList = this.GlbmodeTransferList;
    this.popupBankFundBalance = null;
    this.dynamicModeTransfer = null;
    if (this.GlbCompanyBankList.find(a => a.Id == eve.Id).IsAPIBased == false) {
      this.modeTransferList = this.modeTransferList.filter(z => z.Id != 1);
    }

  }

  do_changeBank() {
    this._selectedPayAmount_ReleaseBatch = 0
    if (this.selectedItems.length == 0) {
      this.alertService.showWarning("No Employee record(s) have been selected! Please first select");
      return;
    }
    // this.validatePayoutIsLocked().then((objet) => {
    //   if (!objet[0].IsValidForUpdate) {
    //     this.alertService.showWarning(objet[0].Remarks);
    //   } else {


    if (this.currentUrl == '/app/payroll/payoutTransaction_finance' && this.selectedItems.filter(a => a.Status == PayOutDetailsStatus.Stopped).length > 0) {
      this.alertService.showWarning("You have selected an employee is not valid (Stopped). So please select some other employee that is valid status.");
      return;
    }

    if ((this.currentUrl == '/app/payroll/payoutTransaction_finance' || this.currentUrl == '/app/payroll/payoutTransaction') && this.selectedItems.filter(a => a.Status == PayOutDetailsStatus.Initiated).length > 0) {
      this.alertService.showWarning("We are unable to create your request at this time. You have selected an invalid employee payout status (initiated).Please click on 'Approve Batch' to verify it and ensure your payout status");
      return;
    }


    this.dynamicCompanyId = null;
    this.dynamicModeTransfer = null;
    this.companyBankList = [];
    this.popupBankStatus = true;
    this._selectedPayAmount_ReleaseBatch = this.selectedItems.forEach(e => { this._selectedPayAmount_ReleaseBatch += parseInt(e.NetPay) })
    $("#popup_bankconfirmation").modal('show');
    this.companyBankList = this.GlbCompanyBankList.length > 0 ? this.GlbCompanyBankList.filter(z => z.Id != this.BehaviourObject_Data.CompanyBankAccountId) : [];
    //   }
    // });
  }
  modal_dismiss2() {
    $("#popup_bankconfirmation").modal('hide');

  }
  checkFundBalance_popup(BankId) {
    this.shouldRendering = true;
    this.popupBankStatus = true;
    this.popupBankMessage = ''
    const promise = new Promise((resolve, reject) => {

      this.payrollService.GetYBFundBalanceInvoice(BankId).subscribe((res) => {
        const apiResult: apiResult = res;
        if (apiResult.Status) {
          let answer = apiResult.Result as any;
          this.popupBankFundBalance = answer.Data.FundsAvailableResult.BalanceAmount as any;
          this.shouldRendering = false
          resolve(true);
        } else {

          this.shouldRendering = false;
          this.popupBankStatus = apiResult.Status;
          this.popupBankMessage = apiResult.Message;
          resolve(false);
        }
      }, err => {
        this.shouldRendering = false;
        this.popupBankStatus = false;
        this.popupBankMessage = "No Records found!";

      });
    })
    return promise;
  }

  move_to_parent_dynamic(item, childTable, parent) {

    console.log('PARENT :', parent);
    console.log('CHILD :', item);

    // this.validatePayoutIsLocked().then((objet) => {
    //   if (!objet[0].IsValidForUpdate) {
    //     this.alertService.showWarning(objet[0].Remarks);
    //   } else {

    // if (item.PayOutStatusCode > 3) {
    //   this.alertService.showWarning('Oops!, Employee cannot be moved because the status is in an invalid state.');
    //   return;
    // }


    if (item.Status > 7500 &&  parent.PayOutStatusCode > 7500) {
      this.alertService.showWarning('Oops!, Employee cannot be moved because the status is in an invalid state.');
      return;
    }

    
    var tempObject: any;
    var localList = [];
    localList = childTable.filter(z => z.Id == item.Id);

    this.loadingScreenService.startLoading();
    this.getPayoutInformationById(localList[0].PayOutInformationId).then((result) => {
      console.log('result', result);
      if (result != null) {
        tempObject = result;



        var payOutModel: PayOutModel = _PayOutModel;
        payOutModel.NewDetails = null;
        payOutModel.OldDetails = null;
        let LstPayOutDet1 = [];
        var PayOutInfoId = 0;
        var currentDate = new Date();
        localList.forEach(obj => {
          var childDetails = new PayoutInformationDetails();
          PayOutInfoId = obj.PayOutInformationId;
          childDetails.Id = obj.Id;




          childDetails.PayoutInformationId = obj.PayOutInformationId;
          childDetails.TimeCardId = obj.TimeCardId;
          childDetails.EmployeeId = obj.EmployeeId;
          childDetails.EmployeeName = obj.EmployeeName;
          childDetails.BankName = obj.BankName;
          childDetails.IFSCCode = obj.IFSCCode;
          childDetails.AccountNumber = obj.AccountNumber;
          childDetails.MobileNumber = obj.MobileNumber;
          childDetails.UPIId = obj.UPIId;
          childDetails.PayPeriodId = obj.PayPeriodId;
          childDetails.PayPeriodName = obj.PayPeriodName;
          // childDetails.Narration = obj.Narration;
          childDetails.NetPay = obj.NetPay;
          childDetails.ExternalRefCode = "";
          childDetails.AcknowledgmentDetail = "";
          childDetails.IsPaymentDone = obj.IsPaymentDone
          childDetails.Status = obj.Status;
          childDetails.IsPaymentHold = obj.IsPaymentHold;
          childDetails.ModeType = UIMode.Edit;
          childDetails.PayTransactionId = obj.PayTransactionId;
          childDetails.CompanyBankAccountId = this.BehaviourObject_Data.CompanyBankAccountId;
          childDetails.ReleasePayoutInformationId = 0; //this.BehaviourObject_Data.Id;
          childDetails['ProcessCategory'] = obj.ProcessCategory;
          LstPayOutDet1.push(childDetails);


          var a = new Array();
          a['AccountNumber'] = obj.AccountNumber,
            a['BankName'] = obj.BankName,
            a['CompanyBankName'] = obj.CompanyBankName,
            a['EmployeeCode'] = obj.EmployeeCode,
            a['EmployeeId'] = obj.EmployeeId,
            a['EmployeeName'] = obj.EmployeeName,
            a['IFSCCode'] = obj.IFSCCode,
            a['Id'] = obj.Id,
            a['id'] = obj.Id,
            a['IsPaymentHold'] = obj.IsPaymentHold,
            a['IsPaymentHoldDisplayName'] = obj.IsPaymentHoldDisplayName,
            a['MobileNumber'] = obj.MobileNumber,
            a['NetPay'] = obj.NetPay,
            a['PayOutInformationId'] = obj.PayOutInformationId,
            a['PayOutStatus'] = obj.PayOutStatus,
            a['PayPeriodId'] = obj.PayPeriodId,
            a['PayTransactionId'] = obj.PayTransactionId,
            a['ReleasePayoutInformationId'] = 0, // PayOutInfoId,
            a['Status'] = obj.Status,
            a['StatusCode'] = obj.StatusCode,
            a['TimeCardId'] = obj.TimeCardId,
            a['UPIId'] = obj.UPIId,
            a['ProcessCategory'] = obj.ProcessCategory,
            a['companybankaccountid'] = this.dynamicCompanyId
          this.angularGrid.gridService.addItem(a);
          const index = childTable.indexOf(item);
          childTable.splice(index, 1);

        });
        let submitobjePayOut1 = new PayoutInformation();
        submitobjePayOut1.Id = PayOutInfoId;
        submitobjePayOut1.CompanyId = this.sessionDetails.Company.Id;
        submitobjePayOut1.ClientId = this.BehaviourObject_Data.clientId;
        submitobjePayOut1.ClientContractId = this.BehaviourObject_Data.clientcontractId;
        submitobjePayOut1.ClientName = this.BehaviourObject_Data.ClientName;
        submitobjePayOut1.PayPeriodId = this.BehaviourObject_Data.payperiodId;
        submitobjePayOut1.CompanyBankAccountId = this.BehaviourObject_Data.CompanyBankAccountId;
        submitobjePayOut1.PayPeriodName = tempObject.PayPeriodName;
        submitobjePayOut1.PayrunIds = tempObject.PayrunIds;
        submitobjePayOut1.RequestedBy = tempObject.RequestedBy;
        submitobjePayOut1.RequesterName = tempObject.RequesterName;
        submitobjePayOut1.RequestedOn = moment(tempObject.RequestedOn).format('YYYY-MM-DD');
        submitobjePayOut1.ApprovedOn = moment(tempObject.ApprovedOn).format('YYYY-MM-DD');
        submitobjePayOut1.ProcessCategory = tempObject.ProcessCategory;
        submitobjePayOut1.ApprovedId = tempObject.ApprovedId;
        submitobjePayOut1.ApproverName = tempObject.ApproverName;
        submitobjePayOut1.PayOutDate = moment(tempObject.PayOutDate).format('YYYY-MM-DD');
        submitobjePayOut1.Status = tempObject.Status;
        submitobjePayOut1.PaymentMode = 0;
        submitobjePayOut1.LstPayoutInformationDetails = LstPayOutDet1;
        payOutModel.NewDetails = submitobjePayOut1;
        payOutModel.OldDetails = submitobjePayOut1;
        console.log('PAYOUT MODEL 2 : ', payOutModel);
        this.payrollService.put_UpsertPayoutInformation(JSON.stringify(payOutModel))
          .subscribe((result) => {
            const rep = result as apiResult
            if (rep.Status) {
              console.log('PAYOUT 2 RESPONSE : ', rep);
              this.loadingScreenService.stopLoading();
              this.modal_dismiss2();
            }
            else {
              this.loadingScreenService.stopLoading();
              this.alertService.showWarning(rep.Message)
            }
          });
      }
    });
    // }
    //   });
  }

  updateExistingPayoutAdditional(ReleasePayoutId, selectedItems_bk, existingBank) {
    var tempObject: any;
    this.getPayoutInformationById(selectedItems_bk[0].PayOutInformationId).then((result) => {
      console.log('result', result);
      if (result != null) {
        tempObject = result;



        var payOutModel: PayOutModel = _PayOutModel;
        payOutModel.NewDetails = null;
        payOutModel.OldDetails = null;
        console.log('selectedItems_bk', existingBank);

        console.log('ReleasePayoutId', ReleasePayoutId);

        let LstPayOutDet1 = [];
        var PayOutInfoId = 0;
        var currentDate = new Date();
        selectedItems_bk.forEach(obj => {
          var childDetails = new PayoutInformationDetails();
          PayOutInfoId = obj.PayOutInformationId;
          childDetails.Id = obj.Id;
          childDetails.PayoutInformationId = obj.PayOutInformationId;
          childDetails.TimeCardId = obj.TimeCardId;
          childDetails.EmployeeId = obj.EmployeeId;
          childDetails.EmployeeName = obj.EmployeeName;
          childDetails.BankName = obj.BankName;
          childDetails.IFSCCode = obj.IFSCCode;
          childDetails.AccountNumber = obj.AccountNumber;
          childDetails.MobileNumber = obj.MobileNumber;
          childDetails.UPIId = obj.UPIId;
          childDetails.PayPeriodId = obj.PayPeriodId;
          childDetails.PayPeriodName = obj.PayPeriodName;
          // childDetails.Narration = obj.Narration;
          childDetails.NetPay = obj.NetPay;
          childDetails.ExternalRefCode = "";
          childDetails.AcknowledgmentDetail = "";
          childDetails.IsPaymentDone = obj.IsPaymentDone
          childDetails.Status = PayOutDetailsStatus.Approved //obj.Status;// PayOutDetailsStatus.Initiated;
          childDetails.IsPaymentHold = obj.IsPaymentHold;
          childDetails.ModeType = UIMode.Edit;
          childDetails.PayTransactionId = obj.PayTransactionId;
          childDetails.CompanyBankAccountId = this.dynamicCompanyId;
          childDetails.PaymentMode = this.dynamicModeTransfer;
          childDetails.ReleasePayoutInformationId = ReleasePayoutId;

          LstPayOutDet1.push(childDetails)
          //  existingBank.TableDataSrc.push({
          existingBank.push({
            AccountNumber: obj.AccountNumber,
            BankName: obj.BankName,
            CompanyBankName: obj.CompanyBankName,
            EmployeeCode: obj.EmployeeCode,
            EmployeeId: obj.EmployeeId,
            EmployeeName: obj.EmployeeName,
            IFSCCode: obj.IFSCCode,
            Id: obj.Id,
            IsPaymentHold: obj.IsPaymentHold,
            IsPaymentHoldDisplayName: obj.IsPaymentHoldDisplayName,
            MobileNumber: obj.MobileNumber,
            NetPay: obj.NetPay,
            PayOutInformationId: obj.PayOutInformationId,
            PayOutStatus: obj.PayOutStatus,
            PayPeriodId: obj.PayPeriodId,
            PayTransactionId: obj.PayTransactionId,
            ReleasePayoutInformationId: ReleasePayoutId,
            Status: obj.Status,
            StatusCode: obj.StatusCode,
            TimeCardId: obj.TimeCardId,
            UPIId: obj.UPIId,
            PaymentMode: this.dynamicModeTransfer,

            companybankaccountid: this.dynamicCompanyId
          });
        });
        let submitobjePayOut1 = new PayoutInformation();
        submitobjePayOut1.Id = PayOutInfoId;
        submitobjePayOut1.CompanyId = this.sessionDetails.Company.Id;
        submitobjePayOut1.ClientId = this.BehaviourObject_Data.clientId;
        submitobjePayOut1.ClientContractId = this.BehaviourObject_Data.clientcontractId;
        submitobjePayOut1.ClientName = this.BehaviourObject_Data.ClientName;
        submitobjePayOut1.PayPeriodId = this.BehaviourObject_Data.payperiodId;
        submitobjePayOut1.CompanyBankAccountId = this.BehaviourObject_Data.CompanyBankAccountId;
        submitobjePayOut1.PayPeriodName = tempObject.PayPeriodName;
        submitobjePayOut1.PayrunIds = tempObject.PayrunIds;
        submitobjePayOut1.RequestedBy = tempObject.RequestedBy;
        submitobjePayOut1.RequesterName = tempObject.RequesterName;
        submitobjePayOut1.RequestedOn = moment(tempObject.RequestedOn).format('YYYY-MM-DD');
        submitobjePayOut1.ApprovedOn = moment(tempObject.ApprovedOn).format('YYYY-MM-DD');
        submitobjePayOut1.ProcessCategory = tempObject.ProcessCategory;
        submitobjePayOut1.ApprovedId = tempObject.ApprovedId;
        submitobjePayOut1.ApproverName = tempObject.ApproverName;
        submitobjePayOut1.PayOutDate = moment(tempObject.PayOutDate).format('YYYY-MM-DD');
        submitobjePayOut1.Status = tempObject.Status; // PayOutStatus.Approved;
        submitobjePayOut1.PaymentMode = this.dynamicModeTransfer;
        submitobjePayOut1.LstPayoutInformationDetails = LstPayOutDet1;
        payOutModel.NewDetails = submitobjePayOut1;
        payOutModel.OldDetails = submitobjePayOut1;
        console.log('PAYOUT MODEL 2 : ', payOutModel);
        this.payrollService.put_UpsertPayoutInformation(JSON.stringify(payOutModel))
          .subscribe((result) => {
            const rep = result as apiResult
            if (rep.Status) {
              this.modal_dismiss2();
              console.log('PAYOUT 2 RESPONSE : ', rep);
              if(result.Result != null && result.Result.LstPayoutInformationDetails != null && result.Result.LstPayoutInformationDetails.length > 0){
                result.Result.LstPayoutInformationDetails.forEach(em => {
                  let _updateStatus = existingBank.find(item=>item.Id == em.Id);
                  if(_updateStatus != undefined && _updateStatus != null){
                    _updateStatus.StatusCode = em.Status;
                    _updateStatus.Status = this.payoutStatus.find(x => x.id == (em.Status as any)).name;
                    _updateStatus.PayPeriodName = this.BehaviourObject_Data.PayPeriod;
                  }
                });
              }
              this.loadingScreenService.stopLoading();
              this.alertService.showSuccess(`#${result.Result.LstPayoutInformationDetails[0].ReleasePayoutInformationId} a new release batch has been updated successfully!`)

            }
            else {
              this.loadingScreenService.stopLoading();
              this.alertService.showWarning(rep.Message)
            }
          });
      }
    });
  }

  // BANK CONFIRMATION 
  async confirmChangeBank() {
    this.loadingScreenService.startLoading();

    if (this.dynamicCompanyId == null || this.dynamicCompanyId == undefined || this.dynamicCompanyId == '') {
      this.alertService.showWarning("Please pick your payment bank");
      this.loadingScreenService.stopLoading();
      return;
    }
    if (this.dynamicModeTransfer == null || this.dynamicModeTransfer == undefined || this.dynamicModeTransfer == '') {
      this.alertService.showWarning("Please pick your mode of transfer");
      this.loadingScreenService.stopLoading();
      return;
    }    
    // this.isDisbaledModeFileShare = this.GlbCompanyBankList.find(a => a.Id == this.dynamicCompanyId).IsAPIBased == true ? true : false;
    // this.isDisbaledModeAPI = this.GlbCompanyBankList.find(a => a.Id == this.dynamicCompanyId).IsAPIBased == true ? false : true;
    this.dynamictblDataSrc = [];
    var selectedItem_bk = [];
    let original
    selectedItem_bk = this.selectedItems;
    for (let index = 0; index < this.selectedItems.length; index++) {
      const element = this.selectedItems[index];
      this.dynamictblDataSrc.push(element);
      // this.angularGrid.gridService.deleteItemById(element.Id, element);
      let inx = this.dataset.findIndex(d => d.Id === element.Id); //find index in your array
      this.dataset.splice(inx, 1);
    }
    let i: any[] = [];
    i = this.dataset;
    this.dataset = [];
    this.dataset = i;
    //  this.angularGrid.gridService.renderGrid();
    this.angularGrid.gridService.resetGrid();

    // i = this.dataset.filter(z=> this.selectedItems.set(a=>a.Id != z.Id).Id);
    // i = _.filter( this.dataset, item => this.selectedItems.indexOf(item.Id) === -1);

    console.log('DATASET ::', this.dataset);

    // this.selectedItems.forEach(element => {
    // this.dynamictblDataSrc.push(element);
    // });

    if (this.dynamicBankDetails.length > 0) {
      console.log('dynamicBankDetails', this.dynamicBankDetails);
      var existingBank1 = this.dynamicBankDetails.find(a => a.PayOutStatusCode <= PayOutStatus.Approved && a.CompanyBankAccountId == this.dynamicCompanyId && a.ModeOfTransfer == this.dynamicModeTransfer);

      var existingBank = this.dynamicBankDetails.find(a => a.PayOutStatusCode <= PayOutStatus.Approved && a.CompanyBankAccountId == this.dynamicCompanyId && a.ModeOfTransfer == this.dynamicModeTransfer);
      existingBank != undefined && (existingBank = existingBank.TableDataSrc);
      if (existingBank != undefined && existingBank != null && existingBank.length > 0) {
        console.log('sss', existingBank[0].ReleasePayoutInformationId);
        this.updateExistingPayoutAdditional(existingBank[0].ReleasePayoutInformationId, selectedItem_bk, existingBank);
        return;
      } else if (existingBank1 != undefined && existingBank1.PayOutInformationId != 0) {
        this.updateExistingPayoutAdditional(existingBank1.PayOutInformationId, selectedItem_bk, existingBank1);
      } else {
        this.dynamicBatchCreation();
      }
      // this.loadingScreenService.stopLoading();
    } else {
      // this.loadingScreenService.stopLoading();
      this.dynamicBatchCreation();

    }
    //   }

    // });


  }

  dynamicBatchCreation() {
    this.loadingScreenService.startLoading();

    this.dynamicBankDetails.push({
      Id: this.dynamicCompanyId,
      CompanyBankAccountId: this.dynamicCompanyId,
      ModeOfTransfer: this.dynamicModeTransfer, //this.isDisbaledModeAPI == true ? 2 : 1,
      HoldButton: "Hold Payout",
      ConfirmButton: "Confirm Payout",
      TableDataSrc: this.dynamictblDataSrc,
      Entire_TableDataSrc: this.dynamictblDataSrc,
      BankFundBalance: null,
      PayOutInformationId: 0,
      PayOutStatus: this.payoutStatus.find(ee => ee.id == this.BehaviourObject_Data.StatusCode).name,
      PayOutStatusCode: this.BehaviourObject_Data.StatusCode,
      SuccessRate: this.calcSuccessRate(this.dynamictblDataSrc, 'Successrate'),
      PayoutStatusTooltip: this.calcSuccessRate(this.dynamictblDataSrc, 'tooltip'),
      TotalPercent: this.calcSuccessRate(this.dynamictblDataSrc, 'percentage'),
      ProgressRate: 0,
      FailedRate: 0,
      isRetryApplicable: false,
      isLoading: false,
      Statuslist: this.build_payoutdetailsStatus(this.dynamictblDataSrc),
      searchText: null


    })
    var tempObject: any;
    this.getPayoutInformationById(this.BehaviourObject_Data.Id).then((result) => {
      console.log('result', result);
      if (result != null) {
        tempObject = result;

        // await this.checkFundBalance_popup(this.dynamicCompanyId).then((re) => {
        //   if (re) {

        // var a = new Array();
        // a["Id"] = this.dynamicCompanyId;
        // a[`CompanyBankAccountId`] = this.dynamicCompanyId;
        // a[`ModeOfTransfer`] = 1;
        // a[`HoldButton`] = "Hold Payout";
        // a[`ConfirmButton`] = "Confirm Payout";
        // a[`TableDataSrc`] = this.dynamictblDataSrc;
        // a[`BankFundBalance`] = null;
        // this.dynamicBankDetails.push(a);
        console.log('ADDITIONAL BANK TABLE : ', this.dynamicBankDetails);
        console.log('dynamictblDataSrc :', this.dynamictblDataSrc);
        console.log('dyna', this.dynamicModeTransfer);
        console.log('dyna 2', this.dynamicCompanyId);

        let LstPayOutDet = [];
        var PayOutInfoId = 0;
        var currentDate = new Date();
        var targettedEmps = [];
        targettedEmps = this.dynamicBankDetails.find(a => a.PayOutInformationId == 0 && a.CompanyBankAccountId == this.dynamicCompanyId && a.ModeOfTransfer == this.dynamicModeTransfer).TableDataSrc; // this.dynamicBankDetails[0].TableDataSrc;
        console.log('targettedEmps', targettedEmps);

        targettedEmps.forEach(obj => {
          var childDetails = new PayoutInformationDetails();
          PayOutInfoId = obj.PayOutInformationId;
          childDetails.Id = obj.Id;
          childDetails.PayoutInformationId = PayOutInfoId;
          childDetails.TimeCardId = obj.TimeCardId;
          childDetails.EmployeeId = obj.EmployeeId;
          childDetails.EmployeeName = obj.EmployeeName;
          childDetails.BankName = obj.BankName;
          childDetails.IFSCCode = obj.IFSCCode;
          childDetails.AccountNumber = obj.AccountNumber;
          childDetails.MobileNumber = obj.MobileNumber;
          childDetails.UPIId = obj.UPIId;
          childDetails.PayPeriodId = obj.PayPeriodId;
          childDetails.PayPeriodName = this.BehaviourObject_Data.PayPeriod;
          // childDetails.Narration = obj.Narration;
          childDetails.NetPay = obj.NetPay;
          childDetails.ExternalRefCode = "";
          childDetails.AcknowledgmentDetail = "";
          childDetails.IsPaymentDone = false // obj.IsPaymentDone
          childDetails.Status = obj.Status;// PayOutDetailsStatus.Initiated;
          childDetails.IsPaymentHold = obj.IsPaymentHold;
          childDetails.ModeType = UIMode.Edit;
          childDetails.PayTransactionId = obj.PayTransactionId;
          childDetails.CompanyBankAccountId = this.dynamicCompanyId;
          childDetails.PaymentMode = this.dynamicModeTransfer;
          childDetails.ReleasePayoutInformationId = 0;
          LstPayOutDet.push(childDetails)
        });
        // console.log('Payout Id', PayOutInfoId);
        let submitobjePayOut = new PayoutInformation();
        submitobjePayOut.Id = 0;
        submitobjePayOut.CompanyId = this.sessionDetails.Company.Id;
        submitobjePayOut.ClientId = this.BehaviourObject_Data.clientId;
        submitobjePayOut.ClientContractId = this.BehaviourObject_Data.clientcontractId;
        submitobjePayOut.ClientName = this.BehaviourObject_Data.ClientName;
        submitobjePayOut.PayPeriodId = this.BehaviourObject_Data.payperiodId;
        submitobjePayOut.PayPeriodName = tempObject.PayPeriodName;
        submitobjePayOut.CompanyBankAccountId = this.dynamicCompanyId // this.BehaviourObject_Data.CompanyBankAccountId; when creating new batch we should update the dynamic bank namw which is selected in the dropdown modal  this.BehaviourObject_Data.CompanyBankAccountId;
        // submitobjePayOut.PayrunIds = [];
        // submitobjePayOut.PayrunIds.push(this.selectedItems[0].PayrunId);
        submitobjePayOut.PayrunIds = JSON.parse(this.BehaviourObject_Data.PayrunIds)

        submitobjePayOut.RequestedBy = tempObject.RequestedBy;
        submitobjePayOut.RequesterName = tempObject.RequesterName;
        submitobjePayOut.RequestedOn = moment(tempObject.RequestedOn).format('YYYY-MM-DD');
        submitobjePayOut.ApprovedOn = moment(tempObject.ApprovedOn).format('YYYY-MM-DD');
        submitobjePayOut.ProcessCategory = tempObject.ProcessCategory;
        submitobjePayOut.ApprovedId = tempObject.ApprovedId;
        submitobjePayOut.ApproverName = tempObject.ApproverName;
        submitobjePayOut.PayOutDate = moment(tempObject.PayOutDate).format('YYYY-MM-DD');
        submitobjePayOut.Status = PayOutStatus.Approved;
        submitobjePayOut.PaymentMode = this.dynamicModeTransfer;
        // submitobjePayOut.LstPayoutInformationDetails = LstPayOutDet;
        this.payOutModel = _PayOutModel;
        this.payOutModel.NewDetails = submitobjePayOut;
        this.payOutModel.OldDetails = submitobjePayOut;
        console.log('PAYOUT MODEL : ', this.payOutModel);
        this.payrollService.put_UpsertPayoutInformation(JSON.stringify(this.payOutModel))
          .subscribe((result) => {
            console.log('UPSERT PAY OUT RESPONSE:: ', result);
            const apiResult: apiResult = result;
            if (apiResult.Status && apiResult.Result) {
              var payOutModel: PayOutModel = _PayOutModel;
              payOutModel.NewDetails = null;
              payOutModel.OldDetails = null;
              var answer = apiResult.Result as any;
              console.log('anser', answer);
              console.log('LstPayOutDet', LstPayOutDet);
              // this.dynamicBankDetails[0].PayOutInformationId = answer.Id;
              this.dynamicBankDetails.find(a => a.PayOutInformationId == 0 && a.CompanyBankAccountId == this.dynamicCompanyId && a.ModeOfTransfer == this.dynamicModeTransfer).PayOutInformationId = answer.Id;
              let LstPayOutDet1 = [];
              var PayOutInfoId = 0;
              var currentDate = new Date();
              LstPayOutDet.forEach(obj => {
                var childDetails = new PayoutInformationDetails();
                PayOutInfoId = obj.PayoutInformationId;
                childDetails.Id = obj.Id;
                childDetails.PayoutInformationId = obj.PayoutInformationId;
                childDetails.TimeCardId = obj.TimeCardId;
                childDetails.EmployeeId = obj.EmployeeId;
                childDetails.EmployeeName = obj.EmployeeName;
                childDetails.BankName = obj.BankName;
                childDetails.IFSCCode = obj.IFSCCode;
                childDetails.AccountNumber = obj.AccountNumber;
                childDetails.MobileNumber = obj.MobileNumber;
                childDetails.UPIId = obj.UPIId;
                childDetails.PayPeriodId = obj.PayPeriodId;
                childDetails.PayPeriodName = obj.PayPeriodName;
                // childDetails.Narration = obj.Narration;
                childDetails.NetPay = obj.NetPay;
                childDetails.ExternalRefCode = "";
                childDetails.AcknowledgmentDetail = "";
                childDetails.IsPaymentDone = obj.IsPaymentDone
                childDetails.Status = PayOutDetailsStatus.Approved// obj.Status;// PayOutDetailsStatus.A;
                childDetails.IsPaymentHold = obj.IsPaymentHold;
                childDetails.ModeType = UIMode.Edit;
                childDetails.PayTransactionId = obj.PayTransactionId;
                childDetails.CompanyBankAccountId = this.dynamicCompanyId;
                childDetails.PaymentMode = this.dynamicModeTransfer;
                childDetails.ReleasePayoutInformationId = answer.Id;
                LstPayOutDet1.push(childDetails)
              });
              let submitobjePayOut1 = new PayoutInformation();
              submitobjePayOut1.Id = PayOutInfoId;
              submitobjePayOut1.CompanyId = this.sessionDetails.Company.Id;
              submitobjePayOut1.ClientId = this.BehaviourObject_Data.clientId;
              submitobjePayOut1.ClientContractId = this.BehaviourObject_Data.clientcontractId;
              submitobjePayOut1.ClientName = this.BehaviourObject_Data.ClientName;
              submitobjePayOut1.PayPeriodId = this.BehaviourObject_Data.payperiodId;
              submitobjePayOut1.CompanyBankAccountId = this.BehaviourObject_Data.CompanyBankAccountId;
              submitobjePayOut1.PayPeriodName = tempObject.PayPeriodName;
              submitobjePayOut1.PayrunIds = tempObject.PayrunIds;
              submitobjePayOut1.RequestedBy = tempObject.RequestedBy;
              submitobjePayOut1.RequesterName = tempObject.RequesterName;
              submitobjePayOut1.RequestedOn = moment(tempObject.RequestedOn).format('YYYY-MM-DD');
              submitobjePayOut1.ApprovedOn = moment(tempObject.ApprovedOn).format('YYYY-MM-DD');
              submitobjePayOut1.ProcessCategory = tempObject.ProcessCategory;
              submitobjePayOut1.ApprovedId = tempObject.ApprovedId;
              submitobjePayOut1.ApproverName = tempObject.ApproverName;
              submitobjePayOut1.PayOutDate = moment(tempObject.PayOutDate).format('YYYY-MM-DD');
              submitobjePayOut1.Status = PayOutStatus.Approved;
              submitobjePayOut1.PaymentMode = this.dynamicModeTransfer;
              submitobjePayOut1.LstPayoutInformationDetails = LstPayOutDet1;
              payOutModel.NewDetails = submitobjePayOut1;
              payOutModel.OldDetails = submitobjePayOut1;
              console.log('PAYOUT MODEL 2 : ', payOutModel);
              this.payrollService.put_UpsertPayoutInformation(JSON.stringify(payOutModel))
                .subscribe((result) => {
                  if (result as apiResult && result.Status) {
                    console.log('PAYOUT 2 RESPONSE : ', result);
                    let updateExistingTableSrc = this.dynamicBankDetails.find(a => a.PayOutInformationId == result.Result.LstPayoutInformationDetails[0].ReleasePayoutInformationId &&
                      a.CompanyBankAccountId == this.dynamicCompanyId &&
                      a.ModeOfTransfer == this.dynamicModeTransfer);
                      
                    if (updateExistingTableSrc != undefined) {
                      updateExistingTableSrc.TableDataSrc.length > 0 &&  updateExistingTableSrc.TableDataSrc.forEach(element => {
                        element.StatusCode =  result.Result.LstPayoutInformationDetails.find(a=>a.Id == element.Id).Status
                        element.Status = result.Result.LstPayoutInformationDetails.find(a=>a.Id == element.Id).Status;
                        element.Status = this.payoutdetailStatus.find(c=>c.id == element.Status).name
                      });
                    }
                    updateExistingTableSrc != undefined &&
                      updateExistingTableSrc.TableDataSrc,

                      this.loadingScreenService.stopLoading();
                    this.alertService.showSuccess(`#${result.Result.LstPayoutInformationDetails[0].ReleasePayoutInformationId} a new release batch has been created successfully!`)
                    this.modal_dismiss2();
                  }
                  else {
                    this.loadingScreenService.stopLoading();
                    this.alertService.showWarning(apiResult.Message)
                  }
                });
            } else {
              this.loadingScreenService.stopLoading();
              this.alertService.showWarning(apiResult.Message)
            }
          }, error => {

          });
      }
    });
  }

  // PARENT BANK HOLD AND CONFIRMATION
  holdPayout() {
    if (environment.environment.IsAllowableStatusForConfirmPayout.includes(Number(this.BehaviourObject_Data.StatusCode)) == false) {
      this.alertService.showWarning('Information : The action was blocked. The Payout batch could not be processed because the status has been changed.');
      return;
    }
    if (this.dataset.length == 0) {
      this.alertService.showWarning("No records found!");
      return;
    }
    // this.validatePayoutIsLocked().then((objet) => {
    //   if (!objet[0].IsValidForUpdate) {
    //     this.alertService.showWarning(objet[0].Remarks);
    //   } else {

    if (this.currentUrl == '/app/payroll/payoutTransaction_finance') {
      this.do_approve_hold_batch('Hold');
    } else {

      const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-danger'
        },
        buttonsStyling: true
      })
      swalWithBootstrapButtons.fire({
        title: `Confirmation?`,
        text: `Are you sure you want to hold this Payout`,
        type: 'warning',
        showCancelButton: true,
        confirmButtonText: `Yes, Confirm`,
        cancelButtonText: 'Not now',
        reverseButtons: true,
        allowEscapeKey: false,
        allowOutsideClick: false
      }).then((res) => {
        if (res.value) {
          this.upsertPayoutInformation('HoldPayout');
        } else if (res.dismiss === Swal.DismissReason.cancel) {
        }
      })
    }
    // }
    // });
  }
  openConfirmationSlider() {

    if (environment.environment.IsAllowableStatusForConfirmPayout.includes(Number(this.BehaviourObject_Data.StatusCode)) == false) {
      this.alertService.showWarning('Information : The action was blocked. The Payout batch could not be processed because the status has been changed.');
      return;
    }
    if (this.dataset.length == 0) {
      this.alertService.showWarning("No records found!");
      return;
    }
    // this.validatePayoutIsLocked().then((objet) => {
    //   if (!objet[0].IsValidForUpdate) {
    //     this.alertService.showWarning(objet[0].Remarks);
    //   } else {

    if (this.currentUrl == '/app/payroll/payoutTransaction_finance') {
      this.do_approve_hold_batch('Approve');
    } else {

      if (this.YBankModeTransfer == null) {
        this.alertService.showWarning("Please pick your mode of transfer");
        return;
      }
      // if (this.YBankModeTransfer == 2) {
      //   this.alertService.showWarning("File Share mode is not avaliable. Please contact supprt admin.");
      //   return;
      // }
      const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-danger'
        },
        buttonsStyling: true
      })
      swalWithBootstrapButtons.fire({
        title: `Confirmation?`,
        text: `Are you sure you want to Confirm this Payout. It will only send the account number existing items`,
        type: 'warning',
        showCancelButton: true,
        confirmButtonText: `Yes, Confirm`,
        cancelButtonText: 'Not now',
        reverseButtons: true,
        allowEscapeKey: false,
        allowOutsideClick: false
      }).then((res) => {
        if (res.value) {
          this.upsertPayoutInformation('ConfirmPayout');
        } else if (res.dismiss === Swal.DismissReason.cancel) {
        }
      })
    }
    // }
    // });
  }

  upsertPayoutInformation(buttonAction) {
    this.loadingScreenService.startLoading();
    this.getPayoutInformationById(this.BehaviourObject_Data.Id).then((result) => {
      console.log('result', result);
      if (result != null) {
        this.ObjectOfPayoutInformation = result;

        console.log('this.dataset', this.dataset);
        console.log('this.transferTypeId', this.transferTypeId);

        let LstPayOutDetails = [];
        var PayOutInfoId = 0;
        var currentDate = new Date();
        let payOutModel: PayOutModel = _PayOutModel;

        if (buttonAction == 'ConfirmPayout' && this.dataset.filter(a => a.AccountNumber == null || a.IFSCCode == null).length == this.dataset.length) {
          this.loadingScreenService.stopLoading();
          this.alertService.showWarning("The users you selected have no bank details");
          return;
        }

        this.dataset.forEach(obj => {
          if (obj.AccountNumber != null) {
            var childDetails = new PayoutInformationDetails();
            PayOutInfoId = obj.PayOutInformationId;
            childDetails.Id = obj.Id;
            childDetails.PayoutInformationId = obj.PayOutInformationId;
            childDetails.TimeCardId = obj.TimeCardId;
            childDetails.EmployeeId = obj.EmployeeId;
            childDetails.EmployeeName = obj.EmployeeName;
            childDetails.BankName = this.ObjectOfPayoutInformation.LstPayoutInformationDetails != null && this.ObjectOfPayoutInformation.LstPayoutInformationDetails.length > 0 ?
              this.ObjectOfPayoutInformation.LstPayoutInformationDetails.find(a => a.Id == obj.Id).BankName : obj.BankName;
            childDetails.IFSCCode = this.ObjectOfPayoutInformation.LstPayoutInformationDetails != null && this.ObjectOfPayoutInformation.LstPayoutInformationDetails.length > 0 ?
              this.ObjectOfPayoutInformation.LstPayoutInformationDetails.find(a => a.Id == obj.Id).IFSCCode : obj.IFSCCode;
            childDetails.AccountNumber = this.ObjectOfPayoutInformation.LstPayoutInformationDetails != null && this.ObjectOfPayoutInformation.LstPayoutInformationDetails.length > 0 ?
              this.ObjectOfPayoutInformation.LstPayoutInformationDetails.find(a => a.Id == obj.Id).AccountNumber : obj.AccountNumber;
            childDetails.MobileNumber = this.ObjectOfPayoutInformation.LstPayoutInformationDetails != null && this.ObjectOfPayoutInformation.LstPayoutInformationDetails.length > 0 ?
              this.ObjectOfPayoutInformation.LstPayoutInformationDetails.find(a => a.Id == obj.Id).MobileNumber : obj.MobileNumber;
            childDetails.UPIId = this.ObjectOfPayoutInformation.LstPayoutInformationDetails != null && this.ObjectOfPayoutInformation.LstPayoutInformationDetails.length > 0 ?
              this.ObjectOfPayoutInformation.LstPayoutInformationDetails.find(a => a.Id == obj.Id).UPIId : obj.UPIId;
            childDetails.PayPeriodId = this.ObjectOfPayoutInformation.LstPayoutInformationDetails != null && this.ObjectOfPayoutInformation.LstPayoutInformationDetails.length > 0 ?
              this.ObjectOfPayoutInformation.LstPayoutInformationDetails.find(a => a.Id == obj.Id).PayPeriodId : obj.PayPeriodId;
            childDetails.PayPeriodName = this.ObjectOfPayoutInformation.LstPayoutInformationDetails != null && this.ObjectOfPayoutInformation.LstPayoutInformationDetails.length > 0 ?
              this.ObjectOfPayoutInformation.LstPayoutInformationDetails.find(a => a.Id == obj.Id).PayPeriodName : obj.PayPeriodName;
            // childDetails.Narration = obj.Narration;
            childDetails.NetPay = this.ObjectOfPayoutInformation.LstPayoutInformationDetails != null && this.ObjectOfPayoutInformation.LstPayoutInformationDetails.length > 0 ?
              this.ObjectOfPayoutInformation.LstPayoutInformationDetails.find(a => a.Id == obj.Id).NetPay : obj.NetPay;
            childDetails.ExternalRefCode = this.ObjectOfPayoutInformation.LstPayoutInformationDetails != null && this.ObjectOfPayoutInformation.LstPayoutInformationDetails.length > 0 ?
              this.ObjectOfPayoutInformation.LstPayoutInformationDetails.find(a => a.Id == obj.Id).ExternalRefCode : "";
            childDetails.AcknowledgmentDetail = this.ObjectOfPayoutInformation.LstPayoutInformationDetails != null && this.ObjectOfPayoutInformation.LstPayoutInformationDetails.length > 0 ?
              this.ObjectOfPayoutInformation.LstPayoutInformationDetails.find(a => a.Id == obj.Id).AcknowledgmentDetail : "";
            childDetails.IsPaymentDone = this.ObjectOfPayoutInformation.LstPayoutInformationDetails != null && this.ObjectOfPayoutInformation.LstPayoutInformationDetails.length > 0 ?
              this.ObjectOfPayoutInformation.LstPayoutInformationDetails.find(a => a.Id == obj.Id).IsPaymentDone : obj.IsPaymentDone == undefined ? false : obj.IsPaymentDone;
            childDetails.Status = obj.StatusCode;
            childDetails.IsPaymentHold = obj.IsPaymentHold;
            childDetails.ModeType = UIMode.Edit;
            childDetails.PayTransactionId = obj.PayTransactionId;
            childDetails.CompanyBankAccountId = this.BehaviourObject_Data.CompanyBankAccountId;
            childDetails.ReleasePayoutInformationId = obj.PayOutInformationId;
            childDetails.transferType = TransferType.NEFT;
            childDetails.PaymentMode = this.YBankModeTransfer == 1 ? PaymentMode.API : PaymentMode.BatchFile
            LstPayOutDetails.push(childDetails)
          }

        });

        let submitobjePayOut1 = new PayoutInformation();
        submitobjePayOut1.Id = this.ObjectOfPayoutInformation.Id;
        submitobjePayOut1.CompanyId = this.sessionDetails.Company.Id;
        submitobjePayOut1.ClientId = this.BehaviourObject_Data.clientId;
        submitobjePayOut1.ClientContractId = this.BehaviourObject_Data.clientcontractId;
        submitobjePayOut1.ClientName = this.BehaviourObject_Data.ClientName;
        submitobjePayOut1.PayPeriodId = this.BehaviourObject_Data.payperiodId;
        submitobjePayOut1.PayPeriodName = this.ObjectOfPayoutInformation.PayPeriodName;
        submitobjePayOut1.ProcessCategory = this.ObjectOfPayoutInformation.ProcessCategory;
        submitobjePayOut1.TransactionRemarks = this.ObjectOfPayoutInformation.TransactionRemarks;
        submitobjePayOut1.CompanyBankAccountId = this.BehaviourObject_Data.CompanyBankAccountId;
        submitobjePayOut1.PayrunIds = this.ObjectOfPayoutInformation.PayrunIds;
        // submitobjePayOut.PayrunIds.push(this.selectedItems[0].PayrunId);
        // submitobjePayOut.PayrunIds = JSON.stringify(this.BehaviourObject_Data.PayrunIds) as;
        submitobjePayOut1.RequestedBy = this.ObjectOfPayoutInformation.RequestedBy;
        submitobjePayOut1.RequesterName = this.ObjectOfPayoutInformation.RequesterName;
        submitobjePayOut1.RequestedOn = moment(this.ObjectOfPayoutInformation.RequestedOn).format('YYYY-MM-DD');
        submitobjePayOut1.ApprovedId = this.ObjectOfPayoutInformation.ApprovedId;
        submitobjePayOut1.ApproverName = this.ObjectOfPayoutInformation.ApproverName;
        submitobjePayOut1.ApprovedOn = moment(this.ObjectOfPayoutInformation.ApprovedOn).format('YYYY-MM-DD');
        submitobjePayOut1.ErrorMessage = this.ObjectOfPayoutInformation.ErrorMessage;
        submitobjePayOut1.PayOutDate = moment(this.ObjectOfPayoutInformation.PayOutDate).format('YYYY-MM-DD');
        submitobjePayOut1.Status = buttonAction == "ConfirmPayout" ? PayOutStatus.Approved : buttonAction == "HoldPayout" ? PayOutStatus.Hold : PayOutStatus.Approved;
        submitobjePayOut1.LstPayoutInformationDetails = LstPayOutDetails;
        submitobjePayOut1.PaymentMode = this.YBankModeTransfer == 1 ? PaymentMode.API : PaymentMode.BatchFile;
        payOutModel.NewDetails = submitobjePayOut1;
        payOutModel.OldDetails = submitobjePayOut1;
        console.log('PAYRUN MODEL 4 : ', payOutModel);
        this.payrollService.put_UpsertPayoutInformation(JSON.stringify(payOutModel))
          .subscribe((result) => {
            console.log('sss', result);
            if (result.Status as apiResult) {
              buttonAction != "ConfirmPayout" && buttonAction == "HoldPayout" && this.alertService.showSuccess('The payout was held successfully!')

              this.loadingScreenService.stopLoading();
              buttonAction != "ConfirmPayout" && buttonAction == "HoldPayout" && this.currentUrl == '/app/payroll/payoutTransaction_ops' ? this.router.navigateByUrl('app/listing/ui/payoutrequest') : null;

              buttonAction == "ConfirmPayout" && ($('#popup_ConfirmPayout').modal('show')), this.SelectedTransferMethod = 0;
              buttonAction == "GenerateBankFile" && this.dosubmitBankFile(this.BehaviourObject_Data);
            } else {
              this.loadingScreenService.stopLoading();
              buttonAction != "ConfirmPayout" && this.alertService.showWarning('The payout update failed');
            }
          });
      }
      else {
        this.alertService.showWarning("No records found!");
        return;
      }
    })

  }
  close_employeeConfirmPayout() {
    $('#popup_ConfirmPayout').modal('hide');

    // this.visible_employeeConfirmPayout = false;
  }
  // PREVIEW AND CONFIRATION OF PAYOUT
  RadioCheck(ind) {
    this.transferTypeId = ind;
  }
  onChangeModeOfTransfer(value) {
    this.YBankModeTransfer = value;
    this.selectedModeOfTransfer = value == 1 ? '1' : '2';
  }
  getBankName(CompanyBankAccountId) {
    return CompanyBankAccountId != 0 && CompanyBankAccountId != null ? this.GlbCompanyBankList.find(x => x.Id == CompanyBankAccountId).Details : '';
  }
  getPayOutAmount(local_dataset) {
    let sum = 0;
    // local_dataset.forEach(e => { if (e.StatusCode == PayOutDetailsStatus.Approved) { sum += parseInt(e.NetPay) } })
    local_dataset.forEach(e => { sum += parseInt(e.NetPay) })
    return sum;
  }
  confirmPayout() {
    this.transferTypeId = this.SelectedTransferMethod;
    if (this.transferTypeId == null) {
      this.alertService.showWarning("Please choose your transfer method");
      return;
    }
    this.loadingScreenService.startLoading();
    const LstPayOutEmployees = [];
    const LstPayOutDet = [];
    let PayOutInfoId = 0;
    console.log('local_dataset :', this.local_dataset);

    PayOutInfoId = this.local_dataset[0].ReleasePayoutInformationId;
    this.local_dataset.forEach(obj => {
      if (obj.IsPaymentHold == false) {
        var childDetails = new PayoutInformationDetails();
        childDetails.Id = obj.Id;
        childDetails.CompanyBankAccountId = this.local_dataset[0].CompanyBankAccountId;
        childDetails.transferType = this.transferTypeId;
        childDetails.Status = obj.StatusCode;
        LstPayOutDet.push(childDetails)
      }
    });
    console.log('Payout Id', LstPayOutDet);
    let submitobjePayOut = new PayoutInformation();
    submitobjePayOut.Id = PayOutInfoId;
    submitobjePayOut.Status = PayOutStatus.APIPaymentTransferInitiated;
    submitobjePayOut.CompanyBankAccountId = this.local_dataset[0].CompanyBankAccountId;
    submitobjePayOut.LstPayoutInformationDetails = LstPayOutDet;
    LstPayOutEmployees.push(submitobjePayOut);
    this.payrollService.InitiateYBankPaymentTransaction(LstPayOutEmployees).subscribe((result) => {
      console.log('result', result);
      const apiResult: apiResult = result;
      if (apiResult.Status) {
        var paymentResponse = result.Result[0].ErrorMessage as any;
        var payoutinfoId = result.Result[0].Id;
        var Status = this.payoutStatus.find(x => x.id == result.Result[0].Status).name;
        console.log('paymentResponse', paymentResponse);
        // this.alertService.showSuccess(apiResult.Message);
        paymentResponse == null ? this.alertService.showSuccess(apiResult.Message) : this.alertService.showWarning(`${Status} : ${paymentResponse}`);
        this.BehaviourObject_Data.StatusCode = result.Result[0].Status;
        this.BehaviourObject_Data.PayStatus = Status;
        // this.visible_employeeConfirmPayout = false;
        $('#popup_ConfirmPayout').modal('hide');


        this.updatepayoutStatus_afterConfirmation(PayOutInfoId);
        this.init();
        // this.getPayoutInformationById(payoutinfoId).then((result)=> {
        //   this.close_batch();

        // });
        return;
      } else {
        this.loadingScreenService.stopLoading();
        this.alertService.showWarning(apiResult.Message);
      }


    })
  }
  movetoparent(datas) {
    console.log('datas', datas);
  }

  updatepayoutStatus_afterConfirmation(Id) {
    this.getPayoutInformationById(Id).then((result) => {
      console.log('result', result);
      if (result != null) {
        var res = result as any;
        var isex = this.dynamicBankDetails.find(a => a.CompanyBankAccountId == res.CompanyBankAccountId && a.PayOutInformationId == res.Id)
        isex != undefined && (isex.PayOutStatus = this.payoutStatus.find(ee => ee.id == res.Status).name,
          isex.PayOutStatusCode = res.Status
        )
        this.loadingScreenService.stopLoading();
        this.do_Refresh_releasePayout(this.dynamicBankDetails.find(z => z.PayOutInformationId == Id))
      }
    });
    // unused code (50% done)
    // this.getPayoutInformationById(this.BehaviourObject_Data.Id).then((result) => {
    //   console.log('result', result);
    //   this.loadingScreenService.stopLoading();
    //   if (result != null) {
    //     var res = result as any;
    //     var isex = this.dynamicBankDetails.find(a => a.CompanyBankAccountId == res.CompanyBankAccountId && a.PayOutInformationId == Id)
    //     if(isex != undefined){
    //       isex.TableDataSrc
    //       isex.TableDataSrc.forEach(element => {
    //         element.StatusCode = 
    //         element.Status
    //       });
    //     }
    //     isex != undefined && (isex.PayOutStatus = this.payoutStatus.find(ee => ee.id == res.Status).name,
    //       isex.PayOutStatusCode = res.Status
    //     )

    //   }
    // });
  }


  // FINANCE AND OPS MANAGEMENTS
  do_approve_hold_batch(indexOf) {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: true
    })

    swalWithBootstrapButtons.fire({
      title: `Review and Confirm changes`,
      text: indexOf === "Approve" ? "Are you sure you want to Approve this request?" : "Are you sure you want to Hold this request?",
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: "Yes, Continue",
      cancelButtonText: 'No, Cancel!',
      reverseButtons: true,
      allowEscapeKey: false,
      allowOutsideClick: false
    }).then((res) => {
      if (res.value) {
        this.loadingScreenService.startLoading();
        var tempObject: any;
        this.getPayoutInformationById(this.BehaviourObject_Data.Id).then((result) => {
          console.log('result', result);
          if (result != null) {
            tempObject = result;

            let LstPayOutDet = [];
            var PayOutInfoId = 0;
            var currentDate = new Date();

            this.dataset.forEach(obj => {
              var childDetails = new PayoutInformationDetails();
              PayOutInfoId = obj.PayOutInformationId;
              childDetails.Id = obj.Id;
              childDetails.PayoutInformationId = PayOutInfoId;
              childDetails.TimeCardId = obj.TimeCardId;
              childDetails.EmployeeId = obj.EmployeeId;
              childDetails.EmployeeName = obj.EmployeeName;
              childDetails.BankName = obj.BankName;
              childDetails.IFSCCode = obj.IFSCCode;
              childDetails.AccountNumber = obj.AccountNumber;
              childDetails.MobileNumber = obj.MobileNumber;
              childDetails.UPIId = obj.UPIId;
              childDetails.PayPeriodId = obj.PayPeriodId;
              childDetails.PayPeriodName = obj.PayPeriodName;
              // childDetails.Narration = obj.Narration;
              childDetails.NetPay = obj.NetPay;
              childDetails.ExternalRefCode = "";
              childDetails.AcknowledgmentDetail = "";
              childDetails.IsPaymentDone = obj.IsPaymentDone
              childDetails.Status = indexOf == 'Hold' ? obj.PayOutStatus : PayOutDetailsStatus.Approved;
              childDetails.IsPaymentHold = obj.IsPaymentHold;
              childDetails.ModeType = UIMode.Edit;
              childDetails.PayTransactionId = obj.PayTransactionId;
              childDetails.PaymentMode = obj.PaymentMode;
              childDetails.CompanyBankAccountId = obj.companybankaccountid;
              childDetails.ReleasePayoutInformationId = obj.ReleasePayoutInformationId;
              LstPayOutDet.push(childDetails)
            });


            // let lstPayout_UpdatedDet = [];
            // // this.selectedItems.forEach(obj => {
            // let submitobjePayOut = new PayoutInformation();
            // submitobjePayOut.Id = this.BehaviourObject_Data.Id;
            // submitobjePayOut.CompanyId = this.sessionDetails.Company.Id;
            // submitobjePayOut.ClientId = this.BehaviourObject_Data.clientId;
            // submitobjePayOut.ClientContractId = this.BehaviourObject_Data.clientcontractId;
            // submitobjePayOut.ClientName = this.BehaviourObject_Data.ClientName
            // submitobjePayOut.CompanyBankAccountId = this.BehaviourObject_Data.CompanyBankAccountId;
            // submitobjePayOut.ApprovedId = this.UserId;
            // indexOf == "Approve" ? submitobjePayOut.Status = PayOutStatus.Approved : submitobjePayOut.Status = PayOutStatus.Hold;
            // submitobjePayOut.LstPayoutInformationDetails = LstPayOutDet;
            // lstPayout_UpdatedDet.push(submitobjePayOut)
            // // });

            let submitobjePayOut = new PayoutInformation();
            submitobjePayOut.Id = tempObject.Id;
            submitobjePayOut.CompanyId = this.sessionDetails.Company.Id;
            submitobjePayOut.ClientId = this.BehaviourObject_Data.clientId;
            submitobjePayOut.ClientContractId = this.BehaviourObject_Data.clientcontractId;
            submitobjePayOut.ClientName = this.BehaviourObject_Data.ClientName;
            submitobjePayOut.PayPeriodId = this.BehaviourObject_Data.payperiodId;
            submitobjePayOut.PayPeriodName = tempObject.PayPeriodName;
            submitobjePayOut.CompanyBankAccountId = this.BehaviourObject_Data.CompanyBankAccountId;
            // submitobjePayOut.PayrunIds = [];
            // submitobjePayOut.PayrunIds.push(this.selectedItems[0].PayrunId);
            submitobjePayOut.PayrunIds = JSON.parse(this.BehaviourObject_Data.PayrunIds)
            submitobjePayOut.RequestedBy = tempObject.RequestedBy;
            submitobjePayOut.RequesterName = tempObject.RequesterName;
            submitobjePayOut.RequestedOn = moment(tempObject.RequestedOn).format('YYYY-MM-DD');
            submitobjePayOut.ApprovedOn = moment(tempObject.ApprovedOn).format('YYYY-MM-DD');
            submitobjePayOut.ProcessCategory = tempObject.ProcessCategory;
            submitobjePayOut.PaymentMode = tempObject.PaymentMode;
            submitobjePayOut.ApprovedId = tempObject.ApprovedId;
            submitobjePayOut.ApproverName = tempObject.ApproverName;
            submitobjePayOut.PayOutDate = moment(tempObject.PayOutDate).format('YYYY-MM-DD');
            indexOf == "Approve" ? submitobjePayOut.Status = PayOutStatus.Approved : submitobjePayOut.Status = PayOutStatus.Hold;
            submitobjePayOut.LstPayoutInformationDetails = LstPayOutDet;
            this.payOutModel = _PayOutModel;
            this.payOutModel.NewDetails = submitobjePayOut;
            this.payOutModel.OldDetails = submitobjePayOut;
            console.log('PAYOUT MODEL : ', this.payOutModel);
            this.payrollService.put_UpsertPayoutInformation(JSON.stringify(this.payOutModel))
              .subscribe((result) => {
                const rep = result as apiResult
                if (rep.Status) {
                  let outputobje = rep.Result as any;
                  console.log('PAYOUT BATCH RESPONSE : ', rep);
                  this.alertService.showSuccess(rep.Message);
                  this.loadingScreenService.stopLoading();               
                  if(outputobje != null){
                    var _satus = this.payoutStatus.find(x => x.id == (outputobje.Status as any)).name;
                    this.BehaviourObject_Data.PayStatus = _satus;
                    this.BehaviourObject_Data.StatusCode = (outputobje.Status);
                  }
                  // this.unlock_payout().then((result)=> {

                  this.do_Refresh()
                  // })

                }
                else {
                  this.loadingScreenService.stopLoading();
                  this.alertService.showWarning(rep.Message)
                }
              }, err => {
                this.loadingScreenService.stopLoading();

              })

          } else {
            this.alertService.showWarning('Attention : No records found!');
            this.loadingScreenService.stopLoading();

          }
        });


      } else if (
        res.dismiss === Swal.DismissReason.cancel

      ) {
        this.loadingScreenService.stopLoading();
      }
    })
  }

  generatebankFile() {
    // this.validatePayoutIsLocked().then((objet) => {
    //   if (!objet[0].IsValidForUpdate) {
    //     this.alertService.showWarning(objet[0].Remarks);
    //   } else {


    this.alertService.confirmSwal("Review and Confirm changes", "Are you sure you want to proceed?", "Yes, Continue").then(result => {
      this.loadingScreenService.startLoading();
      this.upsertPayoutInformation('GenerateBankFile');

    }).catch(error => {

    });
    //   }
    // });

  }

  dosubmitBankFile(obj) {


    let lstPayout_UpdatedDet = [];
    let submitobjePayOut = new PayoutInformation();
    submitobjePayOut.Id = obj.Id;
    submitobjePayOut.CompanyId = this.sessionDetails.Company.Id;
    submitobjePayOut.ClientId = obj.clientId;
    submitobjePayOut.ClientContractId = obj.clientcontractId;
    submitobjePayOut.ClientName = obj.ClientName
    submitobjePayOut.Status = obj.StatusCode;
    submitobjePayOut.CompanyBankAccountId = obj.CompanyBankAccountId;
    submitobjePayOut.ApprovedId = this.UserId;
    submitobjePayOut.ApproverName = this.PersonName;
    submitobjePayOut.PayOutDate = obj.PayOutDate;
    submitobjePayOut.Status = PayOutStatus.PaymentFileGenerationInititated;
    submitobjePayOut.LstPayoutInformationDetails = [];
    lstPayout_UpdatedDet.push(submitobjePayOut)

    this.payrollService.put_GeneratePayoutFile(lstPayout_UpdatedDet)
      .subscribe((result) => {
        const apiResult: apiResult = result;
        if (apiResult.Status) {
          let dynoName = `${obj.ClientName}_Payout_${obj.Id}`
          this.downloadService.base64Toxls(apiResult.Result, dynoName);
          this.loadingScreenService.stopLoading();
        }
      }, err => {

      });

  }

  close_batch() {
    this.delete_removedEmployee_Additional();
    this.dynamicBankDetails.length > 0 && this.update_payoutrequest_status();
    this.currentUrl == '/app/payroll/payoutTransaction' ? this.router.navigateByUrl('app/listing/ui/payoutApprove') :
      this.currentUrl == '/app/payroll/payoutTransaction_finance' ? this.router.navigateByUrl('app/listing/ui/payoutApprovals') :
        this.currentUrl == '/app/payroll/payoutTransaction_ops' ? this.router.navigateByUrl('app/listing/ui/payoutrequest') : this.router.navigateByUrl('app/dashboard');

  }

  delete_removedEmployee_Additional() {

    if (this.dynamicBankDetails.length > 0) {
      var isEmptyItem = [];
      isEmptyItem = this.dynamicBankDetails.filter(a => a.TableDataSrc.length == 0 && a.PayOutStatusCode <= 7500);
      console.log('isEmptyItem', isEmptyItem);
      isEmptyItem.length > 0 && isEmptyItem.forEach(m => {
        this.payrollService.delete_PayOut(m.PayOutInformationId).subscribe((r) => {

        })

      });
    }
  }

  update_payoutrequest_status() {
    if (this.BehaviourObject_Data.StatusCode == 7400 || this.BehaviourObject_Data.StatusCode == 7500 || this.BehaviourObject_Data.StatusCode == 7501) {

      let lstPayout_UpdatedDet = [];
      let submitobjePayOut = new PayoutInformation();
      submitobjePayOut.Id = this.BehaviourObject_Data.Id;
      submitobjePayOut.CompanyId = this.sessionDetails.Company.Id;
      submitobjePayOut.ClientId = this.BehaviourObject_Data.clientId;
      submitobjePayOut.ClientContractId = this.BehaviourObject_Data.clientcontractId;
      submitobjePayOut.CompanyBankAccountId = this.BehaviourObject_Data.CompanyBankAccountId;
      submitobjePayOut.Status = this.dataset.length > 0 ? PayOutStatus.PartiallyApproved : (this.dynamicBankDetails.filter(a => a.StatusCode <= 7500).length > 0 ? PayOutStatus.PartiallyApproved : PayOutStatus.ReleaseBatchPrepared);
      submitobjePayOut.LstPayoutInformationDetails = [];
      lstPayout_UpdatedDet.push(submitobjePayOut)

      this.payrollService.put_UpdatePayoutInformation(lstPayout_UpdatedDet)
        .subscribe((result) => {
          const apiResult: apiResult = result;
          if (apiResult.Status) {
            this.loadingScreenService.stopLoading();
          } else {
            this.loadingScreenService.stopLoading();
          }
        }, err => {
          this.loadingScreenService.stopLoading();

        })
    }
    else {
      this.loadingScreenService.stopLoading();
    }
  }

  validatePayoutIsLocked() {
    this.loadingScreenService.startLoading();
    const promise = new Promise((res, rej) => {
      this.payrollService.ValidatePayOutIsLocked(this.BehaviourObject_Data.Id).subscribe((result) => {
        console.log('payout', result);
        const apiResult: apiResult = result
        if (apiResult.Status) {
          var objet = JSON.parse(apiResult.Result);
          this.loadingScreenService.stopLoading();
          res(objet);
        } else {
          this.alertService.showWarning('Something went wrong!.')
          this.loadingScreenService.stopLoading();
          return;
        }
      })
    })
    return promise;
  }
  lockPayout() {

    // this.validatePayoutIsLocked().then((objet) => {
    //   if (!objet[0].IsValidForUpdate) {
    //     this.alertService.showWarning(objet[0].Remarks);
    //   } else {

    this.loadingScreenService.startLoading();
    var tempObject: any;
    this.getPayoutInformationById(this.BehaviourObject_Data.Id).then((result) => {
      console.log('result', result);
      if (result != null) {
        tempObject = result;
        let LstPayOutDet = [];
        var PayOutInfoId = 0;
        var currentDate = new Date();
        this.dataset.forEach(obj => {
          var childDetails = new PayoutInformationDetails();
          PayOutInfoId = obj.PayOutInformationId;
          childDetails.Id = obj.Id;
          childDetails.PayoutInformationId = PayOutInfoId;
          childDetails.TimeCardId = obj.TimeCardId;
          childDetails.EmployeeId = obj.EmployeeId;
          childDetails.EmployeeName = obj.EmployeeName;
          childDetails.BankName = obj.BankName;
          childDetails.IFSCCode = obj.IFSCCode;
          childDetails.AccountNumber = obj.AccountNumber;
          childDetails.MobileNumber = obj.MobileNumber;
          childDetails.UPIId = obj.UPIId;
          childDetails.PayPeriodId = obj.PayPeriodId;
          childDetails.PayPeriodName = obj.PayPeriodName;
          // childDetails.Narration = obj.Narration;
          childDetails.NetPay = obj.NetPay;
          childDetails.ExternalRefCode = "";
          childDetails.AcknowledgmentDetail = "";
          childDetails.IsPaymentDone = obj.IsPaymentDone
          childDetails.Status = PayOutDetailsStatus.Approved;
          childDetails.IsPaymentHold = obj.IsPaymentHold;
          childDetails.ModeType = UIMode.Edit;
          childDetails.PayTransactionId = obj.PayTransactionId;
          childDetails.CompanyBankAccountId = obj.companybankaccountid;
          childDetails.PaymentMode = obj.PaymentMode;

          childDetails.ReleasePayoutInformationId = obj.ReleasePayoutInformationId;
          childDetails.IsLocked = true;
          childDetails.IsLockedBy = this.UserId;
          LstPayOutDet.push(childDetails)
        });

        let submitobjePayOut = new PayoutInformation();
        submitobjePayOut.Id = this.BehaviourObject_Data.Id;
        submitobjePayOut.CompanyId = this.sessionDetails.Company.Id;
        submitobjePayOut.ClientId = this.BehaviourObject_Data.clientId;
        submitobjePayOut.ClientContractId = this.BehaviourObject_Data.clientcontractId;
        submitobjePayOut.ClientName = this.BehaviourObject_Data.ClientName;
        submitobjePayOut.PayPeriodId = this.BehaviourObject_Data.payperiodId;
        submitobjePayOut.PayPeriodName = tempObject.PayPeriodName;
        submitobjePayOut.CompanyBankAccountId = this.BehaviourObject_Data.CompanyBankAccountId;
        // submitobjePayOut.PayrunIds = [];
        // submitobjePayOut.PayrunIds.push(this.selectedItems[0].PayrunId);
        submitobjePayOut.PayrunIds = JSON.parse(this.BehaviourObject_Data.PayrunIds)
        submitobjePayOut.RequestedBy = tempObject.RequestedBy;
        submitobjePayOut.RequesterName = tempObject.RequesterName;
        submitobjePayOut.RequestedOn = moment(tempObject.RequestedOn).format('YYYY-MM-DD');
        submitobjePayOut.ApprovedOn = moment(tempObject.ApprovedOn).format('YYYY-MM-DD');
        submitobjePayOut.ProcessCategory = tempObject.ProcessCategory;
        submitobjePayOut.ApprovedId = tempObject.ApprovedId;
        submitobjePayOut.ApproverName = tempObject.ApproverName;
        submitobjePayOut.PayOutDate = moment(tempObject.PayOutDate).format('YYYY-MM-DD');
        submitobjePayOut.Status = tempObject.Status;
        submitobjePayOut.LstPayoutInformationDetails = LstPayOutDet;
        submitobjePayOut.IsLocked = true;
        submitobjePayOut.PaymentMode = tempObject.PaymentMode;
        submitobjePayOut.IsLockedBy = this.UserId;
        this.payOutModel = _PayOutModel;
        this.payOutModel.NewDetails = submitobjePayOut;
        this.payOutModel.OldDetails = submitobjePayOut;
        console.log('PAYOUT MODEL : ', this.payOutModel);
        this.payrollService.put_UpsertPayoutInformation(JSON.stringify(this.payOutModel))
          .subscribe((result) => {
            const rep = result as apiResult
            if (rep.Status) {
              console.log('PAYOUT BATCH RESPONSE LOCK: ', rep);
              this.alertService.showSuccess('The payout is currently locked.');
              this.loadingScreenService.stopLoading();
              // this.close_batch();
            }
            else {
              this.loadingScreenService.stopLoading();
              this.alertService.showWarning(rep.Message)
            }
          }, err => {
            this.loadingScreenService.stopLoading();

          })

      } else {
        this.alertService.showWarning('Attention : No records found!');
        this.loadingScreenService.stopLoading();

      }
    });
    //   }
    // })
  }

  unlock_payout() {
    const prm = new Promise((resove, reject) => {


      this.loadingScreenService.startLoading();
      var tempObject: any;
      this.getPayoutInformationById(this.BehaviourObject_Data.Id).then((result) => {
        console.log('result', result);
        if (result != null) {
          tempObject = result;
          let LstPayOutDet = [];
          var PayOutInfoId = 0;
          var currentDate = new Date();
          this.dataset.forEach(obj => {
            var childDetails = new PayoutInformationDetails();
            PayOutInfoId = obj.PayOutInformationId;
            childDetails.Id = obj.Id;
            childDetails.PayoutInformationId = PayOutInfoId;
            childDetails.TimeCardId = obj.TimeCardId;
            childDetails.EmployeeId = obj.EmployeeId;
            childDetails.EmployeeName = obj.EmployeeName;
            childDetails.BankName = obj.BankName;
            childDetails.IFSCCode = obj.IFSCCode;
            childDetails.AccountNumber = obj.AccountNumber;
            childDetails.MobileNumber = obj.MobileNumber;
            childDetails.UPIId = obj.UPIId;
            childDetails.PayPeriodId = obj.PayPeriodId;
            childDetails.PayPeriodName = obj.PayPeriodName;
            // childDetails.Narration = obj.Narration;
            childDetails.NetPay = obj.NetPay;
            childDetails.ExternalRefCode = "";
            childDetails.AcknowledgmentDetail = "";
            childDetails.IsPaymentDone = obj.IsPaymentDone
            childDetails.Status = PayOutDetailsStatus.Approved;
            childDetails.IsPaymentHold = obj.IsPaymentHold;
            childDetails.ModeType = UIMode.Edit;
            childDetails.PayTransactionId = obj.PayTransactionId;
            childDetails.PaymentMode = obj.PaymentMode;

            childDetails.CompanyBankAccountId = obj.companybankaccountid;
            childDetails.ReleasePayoutInformationId = obj.ReleasePayoutInformationId;
            childDetails.IsLocked = false;
            childDetails.IsLockedBy = null;
            LstPayOutDet.push(childDetails)
          });

          let submitobjePayOut = new PayoutInformation();
          submitobjePayOut.Id = this.BehaviourObject_Data.Id;
          submitobjePayOut.CompanyId = this.sessionDetails.Company.Id;
          submitobjePayOut.ClientId = this.BehaviourObject_Data.clientId;
          submitobjePayOut.ClientContractId = this.BehaviourObject_Data.clientcontractId;
          submitobjePayOut.ClientName = this.BehaviourObject_Data.ClientName;
          submitobjePayOut.PayPeriodId = this.BehaviourObject_Data.payperiodId;
          submitobjePayOut.PayPeriodName = tempObject.PayPeriodName;
          submitobjePayOut.CompanyBankAccountId = this.BehaviourObject_Data.CompanyBankAccountId;
          // submitobjePayOut.PayrunIds = [];
          // submitobjePayOut.PayrunIds.push(this.selectedItems[0].PayrunId);
          submitobjePayOut.PayrunIds = JSON.parse(this.BehaviourObject_Data.PayrunIds)
          submitobjePayOut.RequestedBy = tempObject.RequestedBy;
          submitobjePayOut.RequesterName = tempObject.RequesterName;
          submitobjePayOut.RequestedOn = moment(tempObject.RequestedOn).format('YYYY-MM-DD');
          submitobjePayOut.ApprovedOn = moment(tempObject.ApprovedOn).format('YYYY-MM-DD');
          submitobjePayOut.ProcessCategory = tempObject.ProcessCategory;
          submitobjePayOut.ApprovedId = tempObject.ApprovedId;
          submitobjePayOut.ApproverName = tempObject.ApproverName;
          submitobjePayOut.PayOutDate = moment(tempObject.PayOutDate).format('YYYY-MM-DD');
          submitobjePayOut.Status = tempObject.Status;
          submitobjePayOut.LstPayoutInformationDetails = LstPayOutDet;
          submitobjePayOut.IsLocked = false;
          submitobjePayOut.PaymentMode = tempObject.PaymentMode;
          submitobjePayOut.IsLockedBy = null;
          this.payOutModel = _PayOutModel;
          this.payOutModel.NewDetails = submitobjePayOut;
          this.payOutModel.OldDetails = submitobjePayOut;
          console.log('PAYOUT MODEL : ', this.payOutModel);
          this.payrollService.put_UpsertPayoutInformation(JSON.stringify(this.payOutModel))
            .subscribe((result) => {
              const rep = result as apiResult
              if (rep.Status) {
                console.log('PAYOUT BATCH RESPONSE LOCK: ', rep);
                // this.alertService.showSuccess(rep.Message);
                this.loadingScreenService.stopLoading();
                resove(true);
                // this.close_batch();
              }
              else {
                this.loadingScreenService.stopLoading();
                this.alertService.showWarning(rep.Message);
                resove(false);
              }
            }, err => {
              this.loadingScreenService.stopLoading();

            })

        } else {
          this.alertService.showWarning('Attention : No records found!');
          this.loadingScreenService.stopLoading();

        }
      });
    })
    return prm;
  }

  // RELEASE BATCH

  releaseBatch() {

    console.log('BEHAVIOUR OBJECT :::',this.BehaviourObject_Data);
    
    this._selectedPayAmount_ReleaseBatch = 0;
    if (this.selectedItems.length == 0) {
      this.alertService.showWarning("No Employee record(s) have been selected! Please first select");
      return;
    }

    if (this.BehaviourObject_Data.StatusCode < PayOutStatus.PartiallyApproved) {
      this.alertService.showWarning("The payout request has not been approved.  Please review your payment and try again.");
      return;
    }

    if (this.selectedItems.filter(a => Number(Math.sign(a.NetPay)) <= 0 || Number(Math.sign(a.NetPay)) == 0).length > 0) {
      this.alertService.showWarning("Note: It is not possible to confirm that some employees do not have net compensation details.");
      return;
    }

  
    // this.validatePayoutIsLocked().then((objet) => {
    //   if (!objet[0].IsValidForUpdate) {
    //     this.alertService.showWarning(objet[0].Remarks);
    //   } else {

    if (this.selectedItems.filter(a => a.IsPaymentHold == true).length > 0) {
      this.alertService.showWarning("Some employees have held Payment status when they are released from the system of employees you have selected.");
      return;
    }


    if (this.selectedItems.filter(a => a.StatusCode == PayOutDetailsStatus.Stopped || a.StatusCode == PayOutDetailsStatus.Voided).length > 0) {
      this.alertService.showWarning("As it stands, you do not have permission to access that employee.");
      return;
    }
    this.dynamicCompanyId = null;
    this.dynamicModeTransfer = null;
    this.companyBankList = [];
    this.popupBankStatus = true;
    this.selectedItems.forEach(e => {
      this._selectedPayAmount_ReleaseBatch += parseInt(e.NetPay)
    })
    $("#popup_bankconfirmation").modal('show');
    this.companyBankList = this.GlbCompanyBankList.length > 0 ? this.GlbCompanyBankList : []; // this.GlbCompanyBankList.filter(z => z.Id != this.BehaviourObject_Data.CompanyBankAccountId) : [];
  }
  getModeOfTransfer(item) {

    return this.GlbmodeTransferList.find(a => a.Id == item.ModeOfTransfer).Name;
  }

  // individual status checking
  checkPaymentStatus(item, _payoutInformation) {
    console.log('_payoutInformation', _payoutInformation);

    console.log('_payoutInformation', item);

    if ((this.currentUrl == '/app/payroll/payoutTransaction_finance' || this.currentUrl == '/app/payroll/payoutTransaction') && item.Status > PayOutDetailsStatus.BankRejectedPayment) {
      this.alertService.showWarning("You don't currently have permission to access this employee.");
      return;
    }
    // var cls = document.getElementsByClassName('is-visible')
    // $(cls).removeClass('is-hidden').addClass('is-visible'); 
    // this.message.info('success');
    var payoutJObject = new PayoutInformation();
    payoutJObject.Id = _payoutInformation.PayOutInformationId;
    payoutJObject.LstPayoutInformationDetails = [];
    payoutJObject.LstPayoutInformationDetails.push(item);
    payoutJObject.Status = _payoutInformation.PayOutStatusCode
    payoutJObject.CompanyBankAccountId = _payoutInformation.CompanyBankAccountId;

    this.loadingScreenService.startLoading();
    this.payrollService.GetYBPaymentDetailsStatus(payoutJObject)
      .subscribe((response) => {
        const apiResult: apiResult = response;
        if (apiResult.Status) {
          const lstEmps = apiResult.Result as any;
          var status = lstEmps != null && lstEmps.LstPayoutInformationDetails.length > 0 && lstEmps.LstPayoutInformationDetails[0].Status
          lstEmps != null && (status = this.payoutdetailStatus.find(c => c.id == status).name);
          lstEmps != null && (item.StatusCode = lstEmps.LstPayoutInformationDetails[0].Status,
            item.Status = status,
            item.StatusCode = lstEmps.LstPayoutInformationDetails[0].Status,
            item.AcknowledgmentDetail = lstEmps.LstPayoutInformationDetails[0].AcknowledgmentDetail)
          this.loadingScreenService.stopLoading();
          this.notification.blank(
            'Payment Status',
            lstEmps != null ? `Payment ${status}: The final confirmation coming from bank and payment gateway` : apiResult.Message,
            {
              nzStyle: {
                width: '600px',
                marginLeft: '-265px'
              },
              nzClass: 'test-class'
            }
          );
        } else {

          this.loadingScreenService.stopLoading();

        }
      })
  }
  // });


  // }

  update_void_status() {

    this.loadingScreenService.startLoading();
    var tempObject: any;
    this.getPayoutInformationById(this.BehaviourObject_Data.Id).then((result) => {
      console.log('result', result);
      if (result != null) {
        tempObject = result;
        let LstPayOutDet = [];
        var PayOutInfoId = 0;

        this.selectedItems.forEach(obj => {
          var childDetails = new PayoutInformationDetails();
          childDetails.Id = obj.Id;
          childDetails.PayoutInformationId = obj.PayOutInformationId;
          childDetails.TimeCardId = obj.TimeCardId;
          childDetails.EmployeeId = obj.EmployeeId;
          childDetails.EmployeeName = obj.EmployeeName;
          childDetails.BankName = obj.BankName;
          childDetails.IFSCCode = obj.IFSCCode;
          childDetails.AccountNumber = obj.AccountNumber;
          childDetails.MobileNumber = obj.MobileNumber;
          childDetails.UPIId = obj.UPIId;
          childDetails.PayPeriodId = obj.PayPeriodId;
          childDetails.PayPeriodName = obj.PayPeriodName;
          // childDetails.Narration = obj.Narration;
          childDetails.NetPay = obj.NetPay;
          childDetails.ExternalRefCode = "";
          childDetails.AcknowledgmentDetail = "";
          childDetails.IsPaymentDone = obj.IsPaymentDone
          childDetails.Status = PayOutDetailsStatus.Voided;
          childDetails.IsPaymentHold = obj.IsPaymentHold;
          childDetails.ModeType = UIMode.Edit;
          childDetails.PayTransactionId = obj.PayTransactionId;
          childDetails.CompanyBankAccountId = obj.companybankaccountid;
          childDetails.PaymentMode = obj.PaymentMode;
          childDetails.ReleasePayoutInformationId = obj.ReleasePayoutInformationId;
          childDetails.IsLocked = false;
          childDetails.IsLockedBy = null;
          LstPayOutDet.push(childDetails)
        });

        let submitobjePayOut = new PayoutInformation();
        submitobjePayOut.Id = this.BehaviourObject_Data.Id;
        submitobjePayOut.CompanyId = this.sessionDetails.Company.Id;
        submitobjePayOut.ClientId = this.BehaviourObject_Data.clientId;
        submitobjePayOut.ClientContractId = this.BehaviourObject_Data.clientcontractId;
        submitobjePayOut.ClientName = this.BehaviourObject_Data.ClientName;
        submitobjePayOut.PayPeriodId = this.BehaviourObject_Data.payperiodId;
        submitobjePayOut.PayPeriodName = tempObject.PayPeriodName;
        submitobjePayOut.CompanyBankAccountId = this.BehaviourObject_Data.CompanyBankAccountId;
        // submitobjePayOut.PayrunIds = [];
        // submitobjePayOut.PayrunIds.push(this.selectedItems[0].PayrunId);
        submitobjePayOut.PayrunIds = JSON.parse(this.BehaviourObject_Data.PayrunIds)
        submitobjePayOut.RequestedBy = tempObject.RequestedBy;
        submitobjePayOut.RequesterName = tempObject.RequesterName;
        submitobjePayOut.RequestedOn = moment(tempObject.RequestedOn).format('YYYY-MM-DD');
        submitobjePayOut.ApprovedOn = moment(tempObject.ApprovedOn).format('YYYY-MM-DD');
        submitobjePayOut.ProcessCategory = tempObject.ProcessCategory;
        submitobjePayOut.ApprovedId = tempObject.ApprovedId;
        submitobjePayOut.ApproverName = tempObject.ApproverName;
        submitobjePayOut.PayOutDate = moment(tempObject.PayOutDate).format('YYYY-MM-DD');
        submitobjePayOut.Status = tempObject.Status;
        submitobjePayOut.LstPayoutInformationDetails = LstPayOutDet;
        submitobjePayOut.IsLocked = true;
        submitobjePayOut.PaymentMode = tempObject.PaymentMode;
        submitobjePayOut.IsLockedBy = this.UserId;
        this.payOutModel = _PayOutModel;
        this.payOutModel.NewDetails = submitobjePayOut;
        this.payOutModel.OldDetails = submitobjePayOut;
        console.log('PAYOUT MODEL : ', this.payOutModel);
        this.payrollService.put_UpsertPayoutInformation(JSON.stringify(this.payOutModel))
          .subscribe((result) => {
            const rep = result as apiResult
            if (rep.Status) {
              this.alertService.showSuccess('Success');

              this.selectedItems.forEach(result => {
                this.angularGrid.gridService.deleteItemById(result.Id, result);
              });
              this.loadingScreenService.stopLoading();
            }
            else {
              this.loadingScreenService.stopLoading();
              this.alertService.showWarning(rep.Message)
            }
          }, err => {
            this.loadingScreenService.stopLoading();

          })
      }
    });

  }

  getPayoutDetailsStatus(statusCode) {

    return this.payoutdetailStatus.find(a => a.id == statusCode).name;
  }

  do_saveChanges() {
    this.loadingScreenService.startLoading();
    var tempObject: any;
    this.getPayoutInformationById(this.BehaviourObject_Data.Id).then((result) => {
      console.log('result', result);
      if (result != null) {
        tempObject = result;
        let LstPayOutDet = [];
        var PayOutInfoId = 0;
        var currentDate = new Date();
        this.dataset.forEach(obj => {
          var childDetails = new PayoutInformationDetails();
          PayOutInfoId = obj.PayOutInformationId;
          childDetails.Id = obj.Id;
          childDetails.PayoutInformationId = PayOutInfoId;
          childDetails.TimeCardId = obj.TimeCardId;
          childDetails.EmployeeId = obj.EmployeeId;
          childDetails.EmployeeName = obj.EmployeeName;
          childDetails.BankName = obj.BankName;
          childDetails.IFSCCode = obj.IFSCCode;
          childDetails.AccountNumber = obj.AccountNumber;
          childDetails.MobileNumber = obj.MobileNumber;
          childDetails.UPIId = obj.UPIId;
          childDetails.PayPeriodId = obj.PayPeriodId;
          childDetails.PayPeriodName = obj.PayPeriodName;
          // childDetails.Narration = obj.Narration;
          childDetails.NetPay = obj.NetPay;
          childDetails.ExternalRefCode = "";
          childDetails.AcknowledgmentDetail = "";
          childDetails.IsPaymentDone = obj.IsPaymentDone
          childDetails.Status = obj.Status;
          childDetails.IsPaymentHold = obj.IsPaymentHold;
          childDetails.ModeType = UIMode.Edit;
          childDetails.PayTransactionId = obj.PayTransactionId;
          childDetails.CompanyBankAccountId = obj.companybankaccountid;
          childDetails.PaymentMode = obj.PaymentMode;
          childDetails.ReleasePayoutInformationId = obj.ReleasePayoutInformationId;
          childDetails.IsLocked = false;
          childDetails.IsLockedBy = null;
          LstPayOutDet.push(childDetails)
        });

        let submitobjePayOut = new PayoutInformation();
        submitobjePayOut.Id = this.BehaviourObject_Data.Id;
        submitobjePayOut.CompanyId = this.sessionDetails.Company.Id;
        submitobjePayOut.ClientId = this.BehaviourObject_Data.clientId;
        submitobjePayOut.ClientContractId = this.BehaviourObject_Data.clientcontractId;
        submitobjePayOut.ClientName = this.BehaviourObject_Data.ClientName;
        submitobjePayOut.PayPeriodId = this.BehaviourObject_Data.payperiodId;
        submitobjePayOut.PayPeriodName = tempObject.PayPeriodName;
        submitobjePayOut.CompanyBankAccountId = this.BehaviourObject_Data.CompanyBankAccountId;
        // submitobjePayOut.PayrunIds = [];
        // submitobjePayOut.PayrunIds.push(this.selectedItems[0].PayrunId);
        submitobjePayOut.PayrunIds = JSON.parse(this.BehaviourObject_Data.PayrunIds)
        submitobjePayOut.RequestedBy = tempObject.RequestedBy;
        submitobjePayOut.RequesterName = tempObject.RequesterName;
        submitobjePayOut.RequestedOn = moment(tempObject.RequestedOn).format('YYYY-MM-DD');
        submitobjePayOut.ApprovedOn = moment(tempObject.ApprovedOn).format('YYYY-MM-DD');
        submitobjePayOut.ProcessCategory = tempObject.ProcessCategory;
        submitobjePayOut.ApprovedId = tempObject.ApprovedId;
        submitobjePayOut.ApproverName = tempObject.ApproverName;
        submitobjePayOut.PayOutDate = moment(tempObject.PayOutDate).format('YYYY-MM-DD');
        submitobjePayOut.Status = tempObject.Status;
        submitobjePayOut.LstPayoutInformationDetails = LstPayOutDet;
        submitobjePayOut.IsLocked = false;
        submitobjePayOut.PaymentMode = tempObject.PaymentMode;
        submitobjePayOut.IsLockedBy = null;
        this.payOutModel = _PayOutModel;
        this.payOutModel.NewDetails = submitobjePayOut;
        this.payOutModel.OldDetails = submitobjePayOut;
        console.log('PAYOUT MODEL : ', this.payOutModel);
        this.payrollService.put_UpsertPayoutInformation(JSON.stringify(this.payOutModel))
          .subscribe((result) => {
            const rep = result as apiResult
            if (rep.Status) {
              console.log('PAYOUT BATCH RESPONSE LOCK: ', rep);
              this.alertService.showSuccess('The payout has been saved successfully');
              this.loadingScreenService.stopLoading();
              this.init();
            }
            else {
              this.loadingScreenService.stopLoading();
              this.alertService.showWarning(rep.Message)
            }
          }, err => {
            this.loadingScreenService.stopLoading();

          })
      } else {
        this.alertService.showWarning('Attention : No records found!');
        this.loadingScreenService.stopLoading();

      }
    });
  }

  exportAsXLSX(): void {
    let exportExcelDate = [];
    this.local_dataset.forEach(element => {
      exportExcelDate.push({
        EmployeeCode: element.EmployeeCode,
        EmployeeName: element.EmployeeName,
        AccountNumber: element.AccountNumber,
        BankName: element.BankName,
        IFSCCode: element.IFSCCode,
        MobileNumber: element.MobileNumber,
        NetPay: (Number(element.NetPay)),
        UTR: element.AcknowledgmentDetail
      })

    });

    this.excelService.exportAsExcelFile(exportExcelDate, 'ConfirmedPayout_Batch#_' + this.local_dataset[0].ReleasePayoutInformationId);
  }

  exportExcel_dynamic(table_src): void {
    if (table_src.length == 0) {
      this.alertService.showWarning('No records found!');
      return;

    }
    this.loadingScreenService.startLoading();
    let exportExcelDate = [];
    table_src.forEach(element => {
      exportExcelDate.push({
        EmployeeCode: element.EmployeeCode,
        EmployeeName: element.EmployeeName,
        AccountNumber: element.AccountNumber,
        BankName: element.BankName,
        IFSCCode: element.IFSCCode,
        MobileNumber: element.MobileNumber,
        NetPay: (Number(element.NetPay))
      })

    });

    this.excelService.exportAsExcelFile(exportExcelDate, 'ReleasePayout_Batch#_' + table_src[0].ReleasePayoutInformationId);
    this.loadingScreenService.stopLoading();


  }

  do_Refresh_releasePayout(item) {
    console.log('item', item);
    this.releasePayout_separate_spin = true
    item.isLoading = true;
    this.getPayoutInformationById(item.PayOutInformationId).then((rs) => {
      var res = rs as any;
      item.PayOutStatus = this.payoutStatus.find(ee => ee.id == res.Status).name,
        item.PayOutStatusCode = res.Status,
        item.TableDataSrc = item.Entire_TableDataSrc;
      item.selectAll = false
    });


    let objectString: any;
    this.getPayoutInformationById(this.BehaviourObject_Data.Id).then((result) => {
      var res = result as any;
      if (result != null) {
        objectString = result;
        objectString != null && objectString.LstPayoutInformationDetails.length > 0 && objectString.LstPayoutInformationDetails.forEach(m => {
          if (m.ReleasePayoutInformationId != 0 && m.ReleasePayoutInformationId == item.PayOutInformationId) {
            console.log('test', m);
            let oldStatus = item.Entire_TableDataSrc.find(a => a.Id == m.Id);
            oldStatus != undefined && (oldStatus.Status = this.payoutdetailStatus.find(c => c.id == m.Status).name, oldStatus.StatusCode = m.Status);
            item.TableDataSrc = item.Entire_TableDataSrc;


          }
        });
        if(objectString != null){
          var _satus = this.payoutStatus.find(x => x.id == objectString.Status).name;
          this.BehaviourObject_Data.PayStatus = _satus;
          this.BehaviourObject_Data.StatusCode = (objectString.Status);

        }
        this.releasePayout_separate_spin = false;
        item.isLoading = false;
        item.selectAll = false;
        item.SuccessRate = this.calcSuccessRate(item.TableDataSrc, 'Successrate');
        item.PayoutStatusTooltip = this.calcSuccessRate(item.TableDataSrc, 'tooltip');
        item.TotalPercent = this.calcSuccessRate(item.TableDataSrc, 'percentage');
        item.ProgressRate = this.calcSuccessRate(item.TableDataSrc, 'Progressrate');
        item.FailedRate = this.calcSuccessRate(item.TableDataSrc, 'Failedrate');
        item.isRetryApplicable = this.isRetryApplicable(item.TableDataSrc);
        item.Statuslist = this.build_payoutdetailsStatus(item.TableDataSrc);


      }

      // this.timer = 0;
      // this.Init_timer();
    });


  }

  async do_Refresh_allreleasePayout() {
    console.log('COMING :');
    let count = 0;
    await this.dynamicBankDetails.forEach(t => {

      if (t.isRetryApplicable && t.PayOutStatusCode >= '7700') {
        count += 1;
        this.do_Refresh_releasePayout(t);
      }
    });

    // if(this.dynamicBankDetails.filter(a=>a.PayOutStatusCode >= '7700').length  == count){
    // this.Init_timer();
    // }

  }

  

}
