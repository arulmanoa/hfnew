import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder, FormControl, Validators, AbstractControl } from '@angular/forms';
import { PayrollService } from 'src/app/_services/service/payroll.service';
import { apiResult } from 'src/app/_services/model/apiResult';
import { SaleOrder } from 'src/app/_services/model/Payroll/PayRun';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
import { AlertService } from './../../../../_services/service/alert.service';

@Component({
  selector: 'app-saleorder-modal',
  templateUrl: './saleorder-modal.component.html',
  styleUrls: ['./saleorder-modal.component.css']
})
export class SaleorderModalComponent implements OnInit {

  @Input() objJson: any;
  @Input() CoreJson: any;
  @Input() ContentArea: any;
  SOForm: FormGroup;

  submitted = false;
  ClientContactList: any[];
  ClientAddressList: any[];

  isDisabledShipping: boolean = true;
  isDisabledBilling: boolean = true;

  Narration: any;

  constructor(
    private activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private payrollService: PayrollService,
    public loadingScreenService: LoadingScreenService,
    private alertService: AlertService,


  ) {
  }

  get g() { return this.SOForm.controls; } // reactive forms validation 

  createForm() {
    this.SOForm = this.formBuilder.group({
      Id: [],
      ShipToClientContactId: [null, Validators.required],
      BillToClientContactId: [null, Validators.required],
      PurchaseOrderNo: [null, Validators.required],
      ShippingContactDetails: ['', Validators.required],
      BillingContactDetails: ['', Validators.required],

      Remarks: [''],
      Narration: [''],
      SendInvoicetoClient: [true]
    });
    this.SOForm.controls['BillToClientContactId'].disable();
  }

  hasJsonStructure(str) {
    if (typeof str !== 'string') return false;
    try {
      const result = JSON.parse(str);
      const type = Object.prototype.toString.call(result);
      return type === '[object Object]'
        || type === '[object Array]';

    } catch (err) {
      return false;
    }
  }


  ngOnInit() {
    console.log('POPUP JOSN 1:', (this.objJson));
    this.isDisabledShipping = true;
    this.isDisabledBilling = true;
    this.objJson = JSON.parse(this.objJson);

    this.objJson.ShipToAddressDetails = this.hasJsonStructure(this.objJson.ShipToAddressDetails) === true ? JSON.parse(this.objJson.ShipToAddressDetails) : this.objJson.ShipToAddressDetails;
    this.objJson.BillToAddressDetails = this.hasJsonStructure(this.objJson.BillToAddressDetails) === true ? JSON.parse(this.objJson.BillToAddressDetails) : this.objJson.BillToAddressDetails;
    // this.objJson = JSON.stringify(this.objJson);
    // this.objJson = JSON.parse(this.objJson)
    

    this.CoreJson = JSON.parse(this.CoreJson);

    if (this.ContentArea == "PayInputs") {
      this.createForm();
      this.SOForm.patchValue((this.objJson));
      this.SOForm.patchValue({
        ShippingContactDetails: this.objJson.ShipToAddressDetails.Address1,
        BillingContactDetails: this.objJson.BillToAddressDetails.Address1
      });
      this.Get_SO_LookupDetails();
      console.log('POPUP JOSN :', (this.objJson));
    } else {
      this.Get_PayOut_LookupDetails();
      this.Narration = this.objJson.Narration;
    }
   
  }
  closeModal() {
    this.activeModal.close('Modal Closed');
  }
  Save_SO() {
    console.log(' this.objJson',  this.objJson);
    
    if (this.ContentArea == "PayInputs") {
      this.objJson.PurchaseOrderNo = this.SOForm.get('PurchaseOrderNo').value;
      this.objJson.ShipToAddressDetails.Address1 = this.SOForm.get('ShippingContactDetails').value;
      this.objJson.BillToAddressDetails.Address1 = this.SOForm.get('BillingContactDetails').value;
      this.objJson.BillToClientContactId = this.SOForm.get('BillToClientContactId').value;
      this.objJson.BillToContactName = this.ClientContactList.find(a=>a.Id === this.objJson.BillToClientContactId).Name;
      this.objJson.ShipToClientContactId = this.SOForm.get('ShipToClientContactId').value;
      this.objJson.ShipToContactName = this.ClientContactList.find(a=>a.Id === this.objJson.ShipToClientContactId).Name;
      this.objJson.ShipToAddressDetails  = JSON.stringify( this.objJson.ShipToAddressDetails);
      this.objJson.BillToAddressDetails  = JSON.stringify( this.objJson.BillToAddressDetails);

      this.objJson.Remarks = this.SOForm.get('Remarks').value;
      this.objJson.Narration = this.SOForm.get('Narration').value;
      console.log('POPUP AFTER JOSN :', (this.objJson));
      this.SaveSaleOrder(this.objJson);
    } else {
      this.objJson.Narration = this.Narration;
      this.activeModal.close(this.objJson);
    }

  }

  



  Get_SO_LookupDetails() {
    this.payrollService.get_SOLookupDetails(this.CoreJson.ClientId)
      .subscribe((result) => {
        console.log(result);
        const apiResult: apiResult = result;
        if (apiResult.Status) {
          var result =  JSON.parse(apiResult.Result) as any
          this.ClientContactList =(result.ClientContactList);
          this.ClientAddressList = (result.ClientAddressList);
          console.log(this.ClientContactList);
        }
      })
  }

  Get_PayOut_LookupDetails() {
    this.payrollService.get_PayOutLookUpDetails(this.CoreJson.ClientId)
      .subscribe((result) => {
        console.log(result);
        const apiResult: apiResult = result;
        if (apiResult.Status) {
          var result = (apiResult.Result) as any
          console.log('result look up :', result);
        }
      })
  }

  onChange_Despatch(event) {
    this.SOForm.controls['ShippingContactDetails'].setValue(this.ClientAddressList.find(a => a.Id === event.Id).Address1);

  }
  onChange_Despatch1(event) {
    this.SOForm.controls['BillingContactDetails'].setValue(this.ClientAddressList.find(a => a.Id === event.Id).Address1);

  }

  change_Despatchsaddress(indexOf) {
    indexOf == "Shipping" ? this.isDisabledShipping = false : this.isDisabledBilling = false;
  }

  SaveSaleOrder(obj) {

    this.loadingScreenService.startLoading();
    this.payrollService.put_SaveSaleOrder(obj)
      .subscribe((result) => {
        let apiResult: apiResult = result;
        if (apiResult.Status) {
          this.loadingScreenService.stopLoading();
          this.alertService.showSuccess(apiResult.Message);
          this.activeModal.close(obj);
        } else {
          this.loadingScreenService.stopLoading();
          this.alertService.showWarning(apiResult.Message);
        }
      }, err => {

      })
  }

}
