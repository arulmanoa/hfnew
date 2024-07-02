import { Component, Input, OnInit } from "@angular/core";
import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { config } from '../../../_services/configs/app.config';
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { enumHelper } from "../../directives/_enumhelper";
import { StatutoryRulesDetails, StatutoryType } from "src/app/_services/model/Client/ClientContractOperations";
import { AlertService, ClientLocationService } from "src/app/_services/service";
import _ from "lodash";
import moment from "moment";

@Component({
    selector: 'app-statuatory-rule',
    templateUrl: './statuatory-rule.component.html',
    styleUrls: ['./statuatory-rule.component.css']
})
export class StatuatoryRuleComponent implements OnInit {

    statutoryForm: FormGroup;
    statutoryTypes: any;
    disableBtn = false;
    @Input() productList;
    @Input() scaleList;
    @Input() statuatoryInfo;
    @Input() onEdit: boolean = false;
    selectedProduct: any = {};
    effectiveDate: any;
    stateList = [];
    cityList = [];
    monthList = [];
    submitted = false;

    constructor(
        private fb: FormBuilder,
        private activeModal: NgbActiveModal,
        private utilHelper: enumHelper,
        private alertService: AlertService,
        private clientLocationService: ClientLocationService) {
    }

    ngOnInit(): void {
        this.statutoryForm = this.fb.group({
            statutoryType: [null, Validators.required],
            effectiveDate: ['', Validators.required],
            productId: [null, Validators.required],
            productApplicabilityCode: ['', Validators.required],
            isApplicable: [false],
            isPreviousPaymentExclusion: [false],
            isHalfYearlyApplicable: [false],
            scaleLocationMappings: this.fb.array([])
        })
        this.statutoryTypes = this.utilHelper.transform(StatutoryType);
        console.log('product list ', this.productList);
        console.log('scale list ', this.scaleList);
        console.log(this.statutoryForm);
        this.getStateList()
        this.monthList = config.Months;
        if (this.onEdit) {
            this.selectedProduct.ProductId = this.statuatoryInfo.ProductId;
            this.effectiveDate = this.statuatoryInfo.EffectiveDate;
            this.patchStatuatoryRuleData();
        }
    }


    patchStatuatoryRuleData() {
        this.statutoryForm.controls['statutoryType'].patchValue(this.statuatoryInfo.StatutoryType);
        this.statutoryForm.controls['effectiveDate'].patchValue(this.statuatoryInfo.EffectiveDate);
        this.statutoryForm.controls['productId'].patchValue(this.statuatoryInfo.ProductId);
        this.statutoryForm.controls['productApplicabilityCode'].patchValue(this.statuatoryInfo.ProductApplicabilityCode);
        this.statutoryForm.controls['isApplicable'].patchValue(this.statuatoryInfo.IsApplicable);
        this.statutoryForm.controls['isPreviousPaymentExclusion'].patchValue(this.statuatoryInfo.IsPreviousPaymentExclusion);
        this.statutoryForm.controls['isHalfYearlyApplicable'].patchValue(this.statuatoryInfo.IsHalfYearlyApplicable);
        if (this.statuatoryInfo.scaleLocationMappings.length > 0) {
            this.statutoryForm.setControl('scaleLocationMappings', this.setExistingMetadata(this.statuatoryInfo.scaleLocationMappings));;
        }
    }

    setExistingMetadata(optionValues): FormArray {
        const formArray = new FormArray([]);
        console.log(optionValues);
        optionValues.forEach((e) => {
            this.onChangeState({ Id: e.StateId })
            formArray.push(
                this.fb.group({
                    productId: [e.ProductId, Validators.required],
                    effectiveDate: [this.effectiveDate],
                    stateId: [e.StateId, Validators.required],
                    cityId: [e.CityId, Validators.required],
                    scaleCode: [e.ScaleCode],
                    scaleId: [e.ScaleId, Validators.required],
                    applicableMonths: [e.ApplicableMonths, Validators.required]
                })
            )
        })
        return formArray;
    }

    getStateList() {
        fetch('assets/json/config.json').then(response => {
            return response.json()
        }).then((data) => {
            let countyId = data.DefaultCountryId_India
            this.clientLocationService.getstate(countyId).subscribe((res2) => {
                this.stateList = res2;
                this.stateList = _.orderBy(this.stateList, ["Name"], ["asc"]);
            })
        });
    }

    onChangeState(event) {
        const stateId = event.Id;
        this.clientLocationService.getcity(stateId).subscribe((res) => {
            this.cityList = res;
            this.cityList = _.orderBy(this.cityList, ["Name"], ["asc"]);
            console.log('cityList ', this.cityList);
        })
    }

    onScaleChange(event, i) {
        if (event) {
            const scaleCode = event.Code;
            let scaleLocationMap = this.statutoryForm.get('scaleLocationMappings') as FormArray;
            scaleLocationMap.controls[i].get('scaleCode').setValue(scaleCode);
        }
    }

    getEffectiveDate(event) {
        console.log(event);
        this.effectiveDate = event;
    }

    addScaleLocationMap(scale) {
        const control = this.statutoryForm.controls['scaleLocationMappings'] as FormArray;
        control.push(this.getScaleLocationMap());
        console.log(control);
        console.log('scale ', scale);
    }

    removeScaleLocation(i) {
        const control = this.statutoryForm.controls['scaleLocationMappings'] as FormArray;
        control.removeAt(i);
    }

    getScaleLocationMap(): FormGroup {
        return this.fb.group({
            productId: [this.selectedProduct != undefined ? this.selectedProduct.ProductId : '', Validators.required],
            effectiveDate: [this.effectiveDate],
            stateId: [null, Validators.required],
            cityId: [null, Validators.required],
            scaleCode: [''],
            scaleId: [null, Validators.required],
            applicableMonths: [null, Validators.required]
        })
    }

    get f() { return this.statutoryForm.controls; }

    onHalfYearChange(event) {
        console.log(event);
        console.log(event.value);
        if (this.statutoryForm.controls['isHalfYearlyApplicable'].value) {
            // $("#popup_ScaleLocation").modal("show");
            this.addScaleLocationMap('test');
        } else {
            // $("#popup_ScaleLocation").modal("hide");
            this.statutoryForm.controls['scaleLocationMappings'].setValidators(null);
            this.statutoryForm.controls['scaleLocationMappings'].updateValueAndValidity();
            let control = this.statutoryForm.controls['scaleLocationMappings'] as FormArray;
            if (control.controls.length > 0) {
                for (let i = 0; i < control.controls.length; i++) {
                    control.removeAt(i);
                }
            }
        }
    }

    onProductChange(event) {
        this.selectedProduct = event;
        const productId = this.selectedProduct.ProductId;
        console.log('selected product ', this.selectedProduct);
        this.statutoryForm.controls['productApplicabilityCode'].setValue(this.selectedProduct.Code);
        let scaleLocationMap = this.statutoryForm.get('scaleLocationMappings') as FormArray;
        if (scaleLocationMap.controls.length > 0) {
            for (let i = 0; i < scaleLocationMap.controls.length; i++) {
                scaleLocationMap.controls[i].get('productId').setValue(productId);
            }
        }
    }

    savebutton() {
        if (this.statutoryForm.invalid) {
            this.alertService.showWarning(
                "Attention: The action was blocked. Please fill in all required fields "
            );
            this.submitted = true;
            return
        }
        if (!this.onEdit) {
            const statuatoryRuleData = {};
            statuatoryRuleData['StatutoryTypeName'] = this.statutoryTypes.filter((st) => st.id == this.statutoryForm.controls['statutoryType'].value)[0].name;
            statuatoryRuleData['StatutoryType'] = this.statutoryForm.controls['statutoryType'].value;
            statuatoryRuleData['EffectiveDate'] = moment(this.statutoryForm.controls['effectiveDate'].value).format('YYYY-MM-DD');
            statuatoryRuleData['ProductId'] = this.statutoryForm.controls['productId'].value;
            statuatoryRuleData['ProductApplicabilityCode'] = this.statutoryForm.controls['productApplicabilityCode'].value;
            statuatoryRuleData['IsApplicable'] = this.statutoryForm.controls['isApplicable'].value;
            statuatoryRuleData['IsPreviousPaymentExclusion'] = this.statutoryForm.controls['isPreviousPaymentExclusion'].value;
            statuatoryRuleData['IsHalfYearlyApplicable'] = this.statutoryForm.controls['isHalfYearlyApplicable'].value;
            const scaleArr = [];
            for (let i = 0; i < this.statutoryForm.value.scaleLocationMappings.length; i++) {

                const scaleLocationObj = {};
                scaleLocationObj['ProductId'] = this.statutoryForm.value.scaleLocationMappings[i].productId;
                scaleLocationObj['EffectiveDate'] = moment(this.statutoryForm.value.scaleLocationMappings[i].effectiveDate).format('YYYY-MM-DD');
                scaleLocationObj['StateId'] = this.statutoryForm.value.scaleLocationMappings[i].stateId;
                scaleLocationObj['CityId'] = this.statutoryForm.value.scaleLocationMappings[i].cityId;
                scaleLocationObj['ScaleId'] = this.statutoryForm.value.scaleLocationMappings[i].scaleId;
                scaleLocationObj['ScaleCode'] = this.statutoryForm.value.scaleLocationMappings[i].scaleCode;
                scaleLocationObj['ApplicableMonths'] = this.statutoryForm.value.scaleLocationMappings[i].applicableMonths;
                scaleArr.push(scaleLocationObj);
            }
            statuatoryRuleData['scaleLocationMappings'] = scaleArr;
            this.activeModal.close(statuatoryRuleData);
        }
        if (this.onEdit) {
            const statuatoryRuleData = {};
            statuatoryRuleData['StatutoryTypeName'] = this.statutoryTypes.filter((st) => st.id == this.statutoryForm.controls['statutoryType'].value)[0].name;;
            statuatoryRuleData['StatutoryType'] = this.statutoryForm.controls['statutoryType'].value;
            statuatoryRuleData['EffectiveDate'] = this.statutoryForm.controls['effectiveDate'].value;
            statuatoryRuleData['ProductId'] = this.statutoryForm.controls['productId'].value;
            statuatoryRuleData['ProductApplicabilityCode'] = this.statutoryForm.controls['productApplicabilityCode'].value;
            statuatoryRuleData['IsApplicable'] = this.statutoryForm.controls['isApplicable'].value;
            statuatoryRuleData['IsPreviousPaymentExclusion'] = this.statutoryForm.controls['isPreviousPaymentExclusion'].value;
            statuatoryRuleData['IsHalfYearlyApplicable'] = this.statutoryForm.controls['isHalfYearlyApplicable'].value;
            const scaleArr = [];
            for (let i = 0; i < this.statutoryForm.value.scaleLocationMappings.length; i++) {

                const scaleLocationObj = {};
                scaleLocationObj['ProductId'] = this.statutoryForm.value.scaleLocationMappings[i].productId;
                scaleLocationObj['EffectiveDate'] = moment(this.statutoryForm.value.scaleLocationMappings[i].effectiveDate).format('YYYY-MM-DD');;
                scaleLocationObj['StateId'] = this.statutoryForm.value.scaleLocationMappings[i].stateId;
                scaleLocationObj['CityId'] = this.statutoryForm.value.scaleLocationMappings[i].cityId;
                scaleLocationObj['ScaleId'] = this.statutoryForm.value.scaleLocationMappings[i].scaleId;
                scaleLocationObj['ScaleCode'] = this.statutoryForm.value.scaleLocationMappings[i].scaleCode;
                scaleLocationObj['ApplicableMonths'] = this.statutoryForm.value.scaleLocationMappings[i].applicableMonths;
                scaleArr.push(scaleLocationObj);
            }
            statuatoryRuleData['scaleLocationMappings'] = scaleArr;
            this.activeModal.close(statuatoryRuleData);
        }
    }

    closeModal() {
        this.activeModal.close('Modal Closed');
    }


}