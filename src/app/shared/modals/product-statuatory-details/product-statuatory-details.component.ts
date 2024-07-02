import { Component, Input, OnInit } from "@angular/core";
import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { config } from '../../../_services/configs/app.config';
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { enumHelper } from "../../directives/_enumhelper";
import { AlertService, ClientLocationService } from "src/app/_services/service";
import _ from "lodash";
import moment from "moment";

@Component({
    selector: 'app-product-statuatory-details',
    templateUrl: './product-statuatory-details.component.html',
    styleUrls: ['./product-statuatory-details.component.css']
})

export class ProductStatuatoryDetailsComponent implements OnInit {

    productScaleForm: FormGroup;
    statutoryTypes: any;
    @Input() productList;
    @Input() scaleList;
    @Input() onEdit = false;
    @Input() produtStatInfo;
    submitted = false;

    constructor(
        private fb: FormBuilder,
        private activeModal: NgbActiveModal,
        private alertService: AlertService,
        private clientLocationService: ClientLocationService) {
    }

    ngOnInit(): void {
        this.productScaleForm = this.fb.group({
            effectiveDate: ['', Validators.required],
            productId: [null, Validators.required],
            scaleId: [null, Validators.required],
            scaleCode: ['', Validators.required],
            isRangeValue2Applicable: [false, Validators.required]
        })
        console.log('product list ', this.productList);
        console.log('scale list ', this.scaleList);
        console.log(this.productScaleForm);
        if (this.onEdit) {
            console.log('product stat info ', this.produtStatInfo);
            this.onScaleChange({ Code: this.produtStatInfo.ScaleId });
            this.patchProductStatuatoryData();
        }
    }

    get f() {
        return this.productScaleForm.controls;
    }

    patchProductStatuatoryData() {
        this.productScaleForm.controls['effectiveDate'].patchValue(this.produtStatInfo.EffectiveDate);
        this.productScaleForm.controls['productId'].patchValue(this.produtStatInfo.ProductId);
        this.productScaleForm.controls['scaleId'].patchValue(this.produtStatInfo.ScaleId);
        this.productScaleForm.controls['scaleCode'].patchValue(this.produtStatInfo.ScaleCode);
        this.productScaleForm.controls['isRangeValue2Applicable'].patchValue(this.produtStatInfo.IsRangeValue2Applicable)
    }

    onScaleChange(event) {
        if (event) {
            const scaleCode = event.Code;
            this.productScaleForm.controls['scaleCode'].setValue(scaleCode);
        }
    }

    savebutton() {
        if (this.productScaleForm.invalid) {
            this.alertService.showWarning(
                "Attention: The action was blocked. Please fill in all required fields "
            );
            this.submitted = true
            return
        }
        const productStatuatoryInfo = {};
        productStatuatoryInfo['ProductId'] = this.productScaleForm.controls['productId'].value;
        productStatuatoryInfo['ProductName'] = this.productList.filter((pl) => pl.ProductId === this.productScaleForm.controls['productId'].value)[0].Name;
        productStatuatoryInfo['EffectiveDate'] = moment(this.productScaleForm.controls['effectiveDate'].value).format('YYYY-MM-DD');
        productStatuatoryInfo['ScaleId'] = this.productScaleForm.controls['scaleId'].value;
        productStatuatoryInfo['ScaleCode'] = this.productScaleForm.controls['scaleCode'].value;
        productStatuatoryInfo['IsRangeValue2Applicable'] = this.productScaleForm.controls['isRangeValue2Applicable'].value;
        console.log('productStatuatory info ', productStatuatoryInfo);
        this.activeModal.close(productStatuatoryInfo);
    }

    closeModal() {
        this.activeModal.close('Modal Closed');
    }


}