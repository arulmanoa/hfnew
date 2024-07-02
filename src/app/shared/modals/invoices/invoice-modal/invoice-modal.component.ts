import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder, FormControl, Validators, AbstractControl } from '@angular/forms';
import { PayrollService } from 'src/app/_services/service/payroll.service';
import { apiResult } from 'src/app/_services/model/apiResult';
import { SaleOrder } from 'src/app/_services/model/Payroll/PayRun';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
import { AlertService } from './../../../../_services/service/alert.service';

@Component({
  selector: 'app-invoice-modal',
  templateUrl: './invoice-modal.component.html',
  styleUrls: ['./invoice-modal.component.css']
})
export class InvoiceModalComponent implements OnInit {

  @Input() objJson: any;
  @Input() CoreJson: any;
  InvForm: FormGroup;

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

  get g() { return this.InvForm.controls; } // reactive forms validation 

  createForm() {
    this.InvForm = this.formBuilder.group({
      Id: [],
      ShipToClientContactId: [null, Validators.required],
      BillToClientContactId: [null, Validators.required],
      PurchaseOrderNo: [null, Validators.required],
      ShippingContactDetails: ['', Validators.required],
      BillingContactDetails: ['', Validators.required],
      Remarks: [''],
      Narration: [''],
    });
    this.InvForm.controls['BillToClientContactId'].disable();
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
    this.objJson.ShipToAddressDetails != null && (this.objJson.ShipToAddressDetails =  this.hasJsonStructure(this.objJson.ShipToAddressDetails) === true ? JSON.parse(this.objJson.ShipToAddressDetails) : this.objJson.ShipToAddressDetails);
    this.objJson.BillToAddressDetails != null &&  (this.objJson.BillToAddressDetails = this.hasJsonStructure(this.objJson.BillToAddressDetails) === true ? JSON.parse(this.objJson.BillToAddressDetails) : this.objJson.BillToAddressDetails);
    this.CoreJson = JSON.parse(this.CoreJson);

    this.createForm();
    this.InvForm.patchValue((this.objJson));
    this.InvForm.patchValue({
      ShippingContactDetails:   this.objJson.ShipToAddressDetails != null ? this.objJson.ShipToAddressDetails.Address1 : null,
      BillingContactDetails:  this.objJson.BillToAddressDetails != null ? this.objJson.BillToAddressDetails.Address1 : null
    });
    this.Get_SO_LookupDetails();
    console.log('POPUP JOSN :', (this.objJson));


  }
  closeModal() {
    this.activeModal.close('Modal Closed');
  }
  Save_Invoice() {
    console.log(' this.objJson', this.objJson);
    this.objJson.PurchaseOrderNo = this.InvForm.get('PurchaseOrderNo').value;
    this.objJson.ShipToAddressDetails.Address1 = this.InvForm.get('ShippingContactDetails').value;
    this.objJson.BillToAddressDetails.Address1 = this.InvForm.get('BillingContactDetails').value;
    this.objJson.BillToClientContactId = this.InvForm.get('BillToClientContactId').value;
    this.objJson.BillToContactName = this.ClientContactList.find(a => a.Id === this.objJson.BillToClientContactId).Name;
    this.objJson.ShipToClientContactId = this.InvForm.get('ShipToClientContactId').value;
    this.objJson.ShipToContactName = this.ClientContactList.find(a => a.Id === this.objJson.ShipToClientContactId).Name;
    this.objJson.ShipToAddressDetails = JSON.stringify(this.objJson.ShipToAddressDetails);
    this.objJson.BillToAddressDetails = JSON.stringify(this.objJson.BillToAddressDetails);

    this.objJson.Remarks = this.InvForm.get('Remarks').value;
    this.objJson.Narration = this.InvForm.get('Narration').value;
    console.log('POPUP AFTER JOSN :', (this.objJson));
    this.SaveInvoices(this.objJson);
  }


  Get_SO_LookupDetails() {
    this.payrollService.get_SOLookupDetails(this.CoreJson.ClientId)
      .subscribe((result) => {
        console.log(result);
        const apiResult: apiResult = result;
        if (apiResult.Status) {
          var result = JSON.parse(apiResult.Result) as any
          this.ClientContactList = (result.ClientContactList);
          this.ClientAddressList = (result.ClientAddressList);
          console.log(this.ClientContactList);
        }
      })
  }



  onChange_Despatch(event) {
    this.InvForm.controls['ShippingContactDetails'].setValue(this.ClientAddressList.find(a => a.Id === event.Id).Address1);

  }
  onChange_Despatch1(event) {
    this.InvForm.controls['BillingContactDetails'].setValue(this.ClientAddressList.find(a => a.Id === event.Id).Address1);

  }

  change_Despatchsaddress(indexOf) {
    indexOf == "Shipping" ? this.isDisabledShipping = false : this.isDisabledBilling = false;
  }

  SaveInvoices(obj) {

    this.loadingScreenService.startLoading();
    this.payrollService.put_SaveInvoice(obj)
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