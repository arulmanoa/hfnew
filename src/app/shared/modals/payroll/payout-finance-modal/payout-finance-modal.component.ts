import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from "sweetalert2";

import { apiResult } from 'src/app/_services/model/apiResult';
import { PaymentMode, PayOutDetailsStatus, PayoutInformation, PayoutInformationDetails, PayOutModel, PayOutStatus, _PayOutModel } from 'src/app/_services/model/Payroll/PayOut';
import { LoginResponses } from 'src/app/_services/model/Common/LoginResponses';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { SessionStorage } from 'src/app/_services/service/session-storage.service';

import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
import { AlertService } from 'src/app/_services/service/alert.service';
import { DownloadService } from 'src/app/_services/service/download.service';
import { PayrollService } from 'src/app/_services/service/payroll.service';
import { UIMode } from 'src/app/_services/model/Common/BaseModel';
import moment from 'moment';

@Component({
  selector: 'app-payout-finance-modal',
  templateUrl: './payout-finance-modal.component.html',
  styleUrls: ['./payout-finance-modal.component.scss']
})
export class PayoutFinanceModalComponent implements OnInit {

  @Input() lstSelectedObj: any;
  sessionDetails: LoginResponses;
  RoleId; UserId; PersonName;
  isrendering_spinner: any;
  companyBankList = [];
  BusinessType: any;
  payOutModel: PayOutModel = new PayOutModel();
  constructor(

    public payrollService: PayrollService,
    public sessionService: SessionStorage,
    private activeModal: NgbActiveModal,
    private alertService: AlertService,
    private loadingScreenService: LoadingScreenService,
    private downloadService: DownloadService


  ) { }

  ngOnInit() {
    this.sessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses)); // Get the whole matched session element set as a clean json(array) via an session object
    this.RoleId = this.sessionDetails.UIRoles[0].Role.Id; // bind Logged user id may be change baed on dashboard 
    this.UserId = this.sessionDetails.UserSession.UserId;
    this.PersonName = this.sessionDetails.UserSession.PersonName;
    this.BusinessType = this.sessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this.sessionDetails.Company.Id).BusinessType;
    this.lstSelectedObj = JSON.parse(this.lstSelectedObj);
    console.log('JSON ::', this.lstSelectedObj);

    this.Get_PayOut_LookupDetails();
  }

  // TEMP SAVE TO PAYOUT INFO TABLE VIA API
  get_CompanyBankAccountDetails() {
    this.payrollService.put_UpdateCompanyBankInPayoutInfo("")
      .subscribe((result) => {
        const apiResult: apiResult = result;
        if (apiResult.Status) {

        }
      }, err => {

      })
  }

  Get_PayOut_LookupDetails() {
    this.payrollService.get_PayOutLookUpDetails(this.lstSelectedObj[0].clientId)
      .subscribe((result) => {
        console.log(result);
        const apiResult: apiResult = result;
        if (apiResult.Status) {
          var result = (apiResult.Result) as any
          result = JSON.parse(result);
          this.companyBankList = result.CompanyBankAccountList;
          console.log('result look up :', result);
        }
      })
  }

  Confirm(index) {
    console.log('confirmed item', this.lstSelectedObj);
    let isEmpty = this.lstSelectedObj.find(z => z.CompanyBankAccountId == null || z.CompanyBankAccountId === 0)
    if (isEmpty != null) {
      this.alertService.showWarning("Your request cannot make and confirm the data until Company Bank account has been updated");
      return;
    }
    console.log(isEmpty);

    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: true
    })

    swalWithBootstrapButtons.fire({
      title: `Review and Confirm changes`,
      text: index === "Save" ? "Are you sure you want to proceed?" : "Are you sure you want to submit the Request?",
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
        let lstPayout_UpdatedDet = [];
        this.lstSelectedObj.forEach(obj => {
          let submitobjePayOut = new PayoutInformation();
          submitobjePayOut.Id = obj.Id;
          submitobjePayOut.CompanyId = this.sessionDetails.Company.Id;
          submitobjePayOut.ClientId = obj.clientId;
          submitobjePayOut.ClientContractId = obj.clientcontractId;
          submitobjePayOut.ClientName = obj.ClientName
          submitobjePayOut.Status = obj.StatusCode;
          submitobjePayOut.CompanyBankAccountId = obj.CompanyBankAccountId;
          index == "Submit" ? submitobjePayOut.ApprovedId = this.UserId : null;
          index == "Submit" ? submitobjePayOut.ApproverName = this.PersonName : null;
          submitobjePayOut.PayOutDate = obj.PayOutDate;
          index == "Submit" ? submitobjePayOut.Status = PayOutStatus.Approved : null;
          submitobjePayOut.LstPayoutInformationDetails = [];
          lstPayout_UpdatedDet.push(submitobjePayOut)
        });
        this.payrollService.put_UpdateCompanyBankInPayoutInfo(lstPayout_UpdatedDet)
          .subscribe((result) => {
            const apiResult: apiResult = result;
            if (apiResult.Status) {
              index === "Save" ? this.loadingScreenService.stopLoading() : null;
              index === "Save" ? this.alertService.showSuccess(apiResult.Message) : null;
              index === "Submit" && this.callback_CreateReleaseBatch(lstPayout_UpdatedDet); //this.generateFile(lstPayout_UpdatedDet);
              index === "Save" ? this.activeModal.close('Success') : null;
            } else {
              this.loadingScreenService.stopLoading();
              this.alertService.showWarning(apiResult.Message);
            }
          }, err => {
            this.loadingScreenService.stopLoading();
          })

        console.log('confirmed item', this.lstSelectedObj);
      } else if (
        res.dismiss === Swal.DismissReason.cancel

      ) {
        this.loadingScreenService.stopLoading();
      }
    })
  }

  generateFile(lstPayout_UpdatedDet) {

    this.payrollService.put_GeneratePayoutFile(lstPayout_UpdatedDet)
      .subscribe((result) => {
        const apiResult: apiResult = result;
        if (apiResult.Status) {
          let dynoName = `PayOutRequest_Batch`
          this.downloadService.base64Toxls(apiResult.Result, dynoName);
          this.loadingScreenService.stopLoading();
          this.activeModal.close('Success');
        }
      }, err => {

      });
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

  callback_CreateReleaseBatch(lstPayout_UpdatedDet) {
    var tempObject: any;
    var po: any;
    console.log('this.lstSelectedObj[0].Id', this.lstSelectedObj[0])
    this.getPayoutInformationById(this.lstSelectedObj[0].Id).then((result) => {
      console.log('result', result);
      if (result != null) {
        var ite = result as any;
        po = ite;
        tempObject = ite.LstPayoutInformationDetails;

        let LstPayOutDet = [];
        var PayOutInfoId = 0;
        var currentDate = new Date();
        var targettedEmps = [];

        tempObject.forEach(obj => {
          var childDetails = new PayoutInformationDetails();
          PayOutInfoId = obj.PayOutInformationId;
          childDetails.Id = obj.Id;
          childDetails.PayoutInformationId = this.lstSelectedObj[0].Id;
          childDetails.TimeCardId = obj.TimeCardId;
          childDetails.EmployeeId = obj.EmployeeId;
          childDetails.EmployeeName = obj.EmployeeName;
          childDetails.BankName = obj.BankName;
          childDetails.IFSCCode = obj.IFSCCode;
          childDetails.AccountNumber = obj.AccountNumber;
          childDetails.MobileNumber = obj.MobileNumber;
          childDetails.UPIId = obj.UPIId;
          childDetails.PayPeriodId = obj.PayPeriodId;
          childDetails.PayPeriodName = this.lstSelectedObj[0].PayPeriod;
          // childDetails.Narration = obj.Narration;
          childDetails.NetPay = obj.NetPay;
          childDetails.ExternalRefCode = "";
          childDetails.AcknowledgmentDetail = "";
          childDetails.IsPaymentDone = false // obj.IsPaymentDone
          childDetails.Status = obj.Status;// PayOutDetailsStatus.Initiated;
          childDetails.IsPaymentHold = obj.IsPaymentHold;
          childDetails.ModeType = UIMode.Edit;
          childDetails.PayTransactionId = obj.PayTransactionId;
          childDetails.CompanyBankAccountId = this.lstSelectedObj[0].CompanyBankAccountId;
          childDetails.PaymentMode = PaymentMode.BatchFile;
          childDetails.Status = PayOutDetailsStatus.Approved;
          childDetails.ReleasePayoutInformationId = this.lstSelectedObj[0].Id;
          LstPayOutDet.push(childDetails)
        });
        // console.log('Payout Id', PayOutInfoId);
        let submitobjePayOut = new PayoutInformation();
        submitobjePayOut.Id = this.lstSelectedObj[0].Id;
        submitobjePayOut.CompanyId = this.sessionDetails.Company.Id;
        submitobjePayOut.ClientId = this.lstSelectedObj[0].clientId;
        submitobjePayOut.ClientContractId = this.lstSelectedObj[0].clientcontractId;
        submitobjePayOut.ClientName = this.lstSelectedObj[0].ClientName;
        submitobjePayOut.PayPeriodId = this.lstSelectedObj[0].payperiodId;
        submitobjePayOut.PayPeriodName = po.PayPeriodName;
        submitobjePayOut.CompanyBankAccountId = this.lstSelectedObj[0].CompanyBankAccountId;
        // submitobjePayOut.PayrunIds = [];
        // submitobjePayOut.PayrunIds.push(this.selectedItems[0].PayrunId);
        submitobjePayOut.PayrunIds = JSON.parse(this.lstSelectedObj[0].PayrunIds)

        submitobjePayOut.RequestedBy = po.RequestedBy;
        submitobjePayOut.RequesterName = po.RequesterName;
        submitobjePayOut.RequestedOn = moment(po.RequestedOn).format('YYYY-MM-DD');
        submitobjePayOut.ApprovedOn = moment(po.ApprovedOn).format('YYYY-MM-DD');
        submitobjePayOut.ProcessCategory = po.ProcessCategory;
        submitobjePayOut.ApprovedId = po.ApprovedId;
        submitobjePayOut.ApproverName = po.ApproverName;
        submitobjePayOut.PayOutDate = moment(po.PayOutDate).format('YYYY-MM-DD');
        submitobjePayOut.Status = PayOutStatus.Approved;
        submitobjePayOut.PaymentMode = PaymentMode.BatchFile;
        submitobjePayOut.LstPayoutInformationDetails = LstPayOutDet;
        this.payOutModel = _PayOutModel;
        this.payOutModel.NewDetails = submitobjePayOut;
        this.payOutModel.OldDetails = submitobjePayOut;
        console.log('PAYOUT MODEL : ', this.payOutModel);
        console.log('LstPayOutDet', LstPayOutDet);
        this.payrollService.put_UpsertPayoutInformation(JSON.stringify(this.payOutModel))
          .subscribe((result) => {
            var obj = result as apiResult;
            if (result as apiResult && result.Status) {
              console.log('PAYOUT 2 RESPONSE : ', result);
              // this.generateFile(lstPayout_UpdatedDet);                   
              this.dosubmitBankFile(obj.Result);
            }
            else {
              this.loadingScreenService.stopLoading();
              this.alertService.showWarning(obj.Message)
            }
          });
        //   } else {
        //     this.loadingScreenService.stopLoading();
        //     this.alertService.showWarning(obj.Message)
        //   }
        // }, error => {

        // });

        // this.payrollService.put_UpsertPayoutInformation(JSON.stringify(this.payOutModel))
        //   .subscribe((result) => {
        //     console.log('UPSERT PAY OUT RESPONSE:: ', result);
        //     const apiResult: apiResult = result;
        //     if (apiResult.Status && apiResult.Result) {
        //       var payOutModel: PayOutModel = _PayOutModel;
        //       payOutModel.NewDetails = null;
        //       payOutModel.OldDetails = null;
        //       var answer = apiResult.Result as any;
        //       console.log('anser', answer);

        //       console.log('LstPayOutDet', LstPayOutDet);
        //       let LstPayOutDet1 = [];
        //       var PayOutInfoId = 0;
        //       var currentDate = new Date();
        //       LstPayOutDet.forEach(obj => {
        //         var childDetails = new PayoutInformationDetails();
        //         PayOutInfoId = obj.PayoutInformationId;
        //         childDetails.Id = obj.Id;
        //         childDetails.PayoutInformationId = this.lstSelectedObj[0].Id; 
        //         childDetails.TimeCardId = obj.TimeCardId;
        //         childDetails.EmployeeId = obj.EmployeeId;
        //         childDetails.EmployeeName = obj.EmployeeName;
        //         childDetails.BankName = obj.BankName;
        //         childDetails.IFSCCode = obj.IFSCCode;
        //         childDetails.AccountNumber = obj.AccountNumber;
        //         childDetails.MobileNumber = obj.MobileNumber;
        //         childDetails.UPIId = obj.UPIId;
        //         childDetails.PayPeriodId = obj.PayPeriodId;
        //         childDetails.PayPeriodName = obj.PayPeriodName; 
        //         // childDetails.Narration = obj.Narration;
        //         childDetails.NetPay = obj.NetPay;
        //         childDetails.ExternalRefCode = "";
        //         childDetails.AcknowledgmentDetail = ""; 
        //         childDetails.IsPaymentDone = obj.IsPaymentDone
        //         childDetails.Status = PayOutDetailsStatus.Approved// obj.Status;// PayOutDetailsStatus.A;
        //         childDetails.IsPaymentHold = obj.IsPaymentHold;
        //         childDetails.ModeType = UIMode.Edit;
        //         childDetails.PayTransactionId = obj.PayTransactionId;
        //         childDetails.CompanyBankAccountId = this.lstSelectedObj[0].CompanyBankAccountId;
        //         childDetails.PaymentMode = PaymentMode.BatchFile;
        //         childDetails.ReleasePayoutInformationId = answer.Id;
        //         LstPayOutDet1.push(childDetails)
        //       });
        //       let submitobjePayOut1 = new PayoutInformation();
        //       submitobjePayOut1.Id = answer.Id;
        //       submitobjePayOut1.CompanyId = this.sessionDetails.Company.Id;
        //       submitobjePayOut1.ClientId = answer.ClientId;
        //       submitobjePayOut1.ClientContractId = answer.ClientContractId;
        //       submitobjePayOut1.ClientName = answer.ClientName;
        //       submitobjePayOut1.PayPeriodId = answer.PayPeriodId;
        //       submitobjePayOut1.PayPeriodName = po.PayPeriodName;
        //       submitobjePayOut1.CompanyBankAccountId = answer.CompanyBankAccountId;
        //       submitobjePayOut1.PayPeriodName = po.PayPeriodName;
        //       submitobjePayOut1.PayrunIds = po.PayrunIds;
        //       submitobjePayOut1.RequestedBy = po.RequestedBy; 
        //       submitobjePayOut1.RequesterName = po.RequesterName;
        //       submitobjePayOut1.RequestedOn = moment(po.RequestedOn).format('YYYY-MM-DD');
        //       submitobjePayOut1.ApprovedOn = moment(po.ApprovedOn).format('YYYY-MM-DD');
        //       submitobjePayOut1.ProcessCategory = po.ProcessCategory;
        //       submitobjePayOut1.ApprovedId = po.ApprovedId;
        //       submitobjePayOut1.ApproverName = po.ApproverName;
        //       submitobjePayOut1.PayOutDate = moment(po.PayOutDate).format('YYYY-MM-DD');
        //       submitobjePayOut1.Status = PayOutStatus.Approved;
        //       submitobjePayOut1.PaymentMode = PaymentMode.BatchFile;
        //       submitobjePayOut1.LstPayoutInformationDetails = LstPayOutDet1;
        //       payOutModel.NewDetails = submitobjePayOut1;
        //       payOutModel.OldDetails = submitobjePayOut1;
        //       console.log('PAYOUT MODEL 2 : ', payOutModel);
        //       this.payrollService.put_UpsertPayoutInformation(JSON.stringify(payOutModel))
        //         .subscribe((result) => {
        //           if (result as apiResult && result.Status) {
        //             console.log('PAYOUT 2 RESPONSE : ', result); 
        //             // this.generateFile(lstPayout_UpdatedDet);
        //             var obj = result as any;
        //             this.dosubmitBankFile(obj.Result); 
        //           }
        //           else {
        //             this.loadingScreenService.stopLoading();
        //             this.alertService.showWarning(apiResult.Message)
        //           }
        //         });
        //     } else {
        //       this.loadingScreenService.stopLoading();
        //       this.alertService.showWarning(apiResult.Message)
        //     }
        //   }, error => {

        //   });
      }
    });
  }




  dosubmitBankFile(obj) {

    console.log('obj', obj);


    let lstPayout_UpdatedDet = [];
    let submitobjePayOut = new PayoutInformation();
    submitobjePayOut.Id = obj.Id;
    submitobjePayOut.CompanyId = this.sessionDetails.Company.Id;
    submitobjePayOut.ClientId = obj.ClientId;
    submitobjePayOut.ClientContractId = obj.ClientContractId;
    submitobjePayOut.ClientName = obj.ClientName
    // submitobjePayOut.Status = obj.StatusCode;
    submitobjePayOut.CompanyBankAccountId = obj.CompanyBankAccountId;
    submitobjePayOut.ApprovedId = this.UserId;
    submitobjePayOut.ApproverName = this.PersonName;
    submitobjePayOut.PayOutDate = obj.PayOutDate;
    submitobjePayOut.Status = PayOutStatus.Approved;
    submitobjePayOut.LstPayoutInformationDetails = [];
    lstPayout_UpdatedDet.push(submitobjePayOut)

    this.payrollService.put_GeneratePayoutFile(lstPayout_UpdatedDet)
      .subscribe((result) => {
        const apiResult: apiResult = result;
        if (apiResult.Status) {
          let dynoName = `${obj.ClientName}_Payout_${obj.Id}`
          if(apiResult.Message != null && apiResult.Message.toUpperCase() == 'ZIP'){
            this.downloadService.base64ToZip(apiResult.Result, dynoName);

          }else {
            this.downloadService.base64Toxls(apiResult.Result, dynoName);

          }
          this.loadingScreenService.stopLoading();
          this.activeModal.close('Success');
        } else {
          this.loadingScreenService.stopLoading();
          this.alertService.showWarning(apiResult.Message);
        }
      }, err => {

      });

  }

  closeModal() {
    this.activeModal.close('Modal Closed');
  }
}
