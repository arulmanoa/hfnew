import { Component, Input } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { enumHelper } from "../../directives/_enumhelper";
import { RateType } from "src/app/_services/model/Client/ClientContractOperations";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { AlertService } from "src/app/_services/service/alert.service";

@Component({
    selector: 'app-additional-app-products',
    templateUrl: './additional-app-products.component.html',
    styleUrls: ['./additional-app-products.component.css']
})
export class AdditionalAppProductsComponent {

    additionalProductForm: FormGroup;
    paymentTypeList: any;
    submitted = false;
    billingTypeList: any;
    @Input() productList;
    @Input() onEdit;
    @Input() applicableProdInfo
    selectedProduct;

    constructor(private fb: FormBuilder, private utilHelper: enumHelper, private activeModal: NgbActiveModal, private alertService: AlertService) {

    }

    ngOnInit() {
        this.additionalProductForm = this.fb.group({
            productId: [null, Validators.required],
            productCode: ['', Validators.required],
            paymentType: [null, Validators.required],
            payableRate: ['', Validators.required],
            billingType: [null, Validators.required],
            billableRate: ['', Validators.required],
            customData1: [''],
            customData2: [''],
        })
        this.paymentTypeList = this.utilHelper.transform(RateType);
        this.billingTypeList = this.utilHelper.transform(RateType);
        if (this.onEdit) {
            this.selectedProduct = this.productList.filter((pinfo) => pinfo.ProductId == this.applicableProdInfo.ProductId)[0];
            console.log('selected product ', this.selectedProduct);
            this.patchApplicableProdData();
        }
    }

    patchApplicableProdData() {
        this.additionalProductForm.controls['productId'].patchValue(this.applicableProdInfo.ProductId);
        this.additionalProductForm.controls['productCode'].patchValue(this.applicableProdInfo.ProductCode);
        this.additionalProductForm.controls['paymentType'].patchValue(this.applicableProdInfo.PaymentType);
        this.additionalProductForm.controls['payableRate'].patchValue(this.applicableProdInfo.PayableRate);
        this.additionalProductForm.controls['billingType'].patchValue(this.applicableProdInfo.BillingType);
        this.additionalProductForm.controls['billableRate'].patchValue(this.applicableProdInfo.BillableRate);
        this.additionalProductForm.controls['customData1'].patchValue(this.applicableProdInfo.CustomData1);
        this.additionalProductForm.controls['customData2'].patchValue(this.applicableProdInfo.CustomData2);
    }

    get f() {
        return this.additionalProductForm.controls;
    }

    onProductChange(event) {
        this.selectedProduct = event;
        this.additionalProductForm.controls['productCode'].setValue(this.selectedProduct.Code);
    }

    saveButton() {
        if (this.additionalProductForm.invalid) {
            this.submitted = true;
            this.alertService.showWarning(
                "Attention: The action was blocked. Please fill in all required fields "
            );
            return
        }
        if (!this.onEdit) {
            const additionalAppProductInfo = {};
            additionalAppProductInfo['ProductId'] = this.additionalProductForm.controls['productId'].value;
            additionalAppProductInfo['ProductName'] = this.selectedProduct.Name;
            additionalAppProductInfo['ProductCode'] = this.additionalProductForm.controls['productCode'].value;
            additionalAppProductInfo['PaymentType'] = this.additionalProductForm.controls['paymentType'].value;
            additionalAppProductInfo['PayableRate'] = this.additionalProductForm.controls['payableRate'].value;
            additionalAppProductInfo['BillingType'] = this.additionalProductForm.controls['billingType'].value;
            additionalAppProductInfo['BillableRate'] = this.additionalProductForm.controls['billableRate'].value;
            additionalAppProductInfo['CustomData1'] = this.additionalProductForm.controls['customData1'].value;
            additionalAppProductInfo['CustomData2'] = this.additionalProductForm.controls['customData2'].value;
            this.activeModal.close(additionalAppProductInfo);
        }
        if (this.onEdit) {
            const additionalAppProductInfo = {};
            additionalAppProductInfo['ProductId'] = this.additionalProductForm.controls['productId'].value;
            additionalAppProductInfo['ProductName'] = this.selectedProduct.Name;
            additionalAppProductInfo['ProductCode'] = this.additionalProductForm.controls['productCode'].value;
            additionalAppProductInfo['PaymentType'] = this.additionalProductForm.controls['paymentType'].value;
            additionalAppProductInfo['PayableRate'] = this.additionalProductForm.controls['payableRate'].value;
            additionalAppProductInfo['BillingType'] = this.additionalProductForm.controls['billingType'].value;
            additionalAppProductInfo['BillableRate'] = this.additionalProductForm.controls['billableRate'].value;
            additionalAppProductInfo['CustomData1'] = this.additionalProductForm.controls['customData1'].value;
            additionalAppProductInfo['CustomData2'] = this.additionalProductForm.controls['customData2'].value;
            this.activeModal.close(additionalAppProductInfo);
        }
    }

    closeModal() {
        this.activeModal.close('Modal Closed');
    }

}