import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertService } from 'src/app/_services/service/alert.service';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
import { SaleOrder, PayRun, SaleOrderStatus } from 'src/app/_services/model/Payroll/PayRun';
import { UIMode } from 'src/app/_services/model/Common/BaseModel';
import { PayrollService } from 'src/app/_services/service/payroll.service';
import { apiResult } from 'src/app/_services/model/apiResult';
import { DownloadService } from 'src/app/_services/service/download.service';
import { enumHelper } from 'src/app/shared/directives/_enumhelper';

@Component({
  selector: 'app-download-billing-sheet-modal',
  templateUrl: './download-billing-sheet-modal.component.html',
  styleUrls: ['./download-billing-sheet-modal.component.css']
})
export class DownloadBillingSheetModalComponent implements OnInit {

  @Input() LstSaleOrders: any;
  @Input() PayPeriod: any;
  @Input() ClientName: any;
  @Input() Team: any;
  @Input() ContentArea: any;

  isMergeSelected: any;

  constructor(
    private activeModal: NgbActiveModal,
    private alertService: AlertService,
    private loadingScreenService: LoadingScreenService,
    private payrollService: PayrollService,
    private downloadService: DownloadService,
    private utilsHelper: enumHelper

  ) { }

  ngOnInit() {
    console.log('LST :', this.LstSaleOrders);
    if (this.ContentArea === "PayRun") {
      this.LstSaleOrders.forEach(ele => {
        let SOStatus = this.utilsHelper.transform(SaleOrderStatus) as any;
        ele["Team"] = this.Team;
        ele["EmployeeCount"] = ele.BillingTransactionList.length;
        // ele["SOStatus"] = SOStatus.find(a => a.id == ele.Status).name;
      });

    }

  }
  modal_dismiss() {

    this.activeModal.close('Modal Closed');
  }
  onProfitSelectionChange(entry): void {

    entry == 1 ? this.isMergeSelected = false : this.isMergeSelected = true;
  }

  _DownloadBillingSheet() {

    if (this.isMergeSelected == undefined) {
      this.alertService.showWarning("Billable Structure :  At least one checkbox must be selected.");
      return;
    }
    this.loadingScreenService.startLoading();
    let LstSO = [];
    this.LstSaleOrders.forEach(obj => {
      var confrimSO_Obj = new SaleOrder();
      confrimSO_Obj.Id = obj.Id;
      LstSO.push(confrimSO_Obj);
    });

    var submitObject = new PayRun();
    submitObject.ModeType = UIMode.Edit;
    submitObject.IsMerge = this.isMergeSelected;
    submitObject.ProcessCategory = this.LstSaleOrders[0].ProcessCategory;
    submitObject.SaleOrders = LstSO;
    this.payrollService.put_BillingSheetDataBySOId(submitObject)
      .subscribe((result) => {
        console.log('BILLING SHEET DATA BY SO :', result);
        const apiResult: apiResult = result;
        if (apiResult.Status) {
          this.alertService.showSuccess(apiResult.Message);
          var dynoFileName = `SO_BILLSHEET_${this.ClientName}_${this.Team}_${this.PayPeriod}_`;
          this.downloadService.base64ToZip(apiResult.Result, dynoFileName);
          this.loadingScreenService.stopLoading();
          this.activeModal.close('Success');


        } else { this.alertService.showWarning(apiResult.Message); this.loadingScreenService.stopLoading(); }
      })



  }
  do_generate() {



  }
}
