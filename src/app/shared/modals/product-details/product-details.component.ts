import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from '../../../_services/service/alert.service';
import { UIBuilderService } from '../../../_services/service/UIBuilder.service';

import * as _ from 'lodash';
import { UIMode } from '../../../_services/model/UIMode';
import { UUID } from 'angular2-uuid';
import { enumHelper } from '../../../shared/directives/_enumhelper';
import { PaygroupService } from 'src/app/_services/service/paygroup.service';
import { ProductService } from '../../../_services/service/product.service';
import { apiResponse } from '../../../_services/model/apiResponse';
import { Product, _Product, ProductApplicability, ProductRuleCategory } from 'src/app/_services/model/Product';

import { PayGroupProduct } from 'src/app/_services/model/paygroupproduct'
import { element } from '@angular/core/src/render3';
import { forkJoin } from 'rxjs';
import { MinWorkTimeType } from 'src/app/_services/model/PayGroup/PayGroup';

export const ProductCalculationType: any =
  [
    { ValueMember: 1, DisplayMember: 'Fixed', icon: "mdi-checkbox-marked-circle", checked: false },
    { ValueMember: 2, DisplayMember: 'Variable', icon: "mdi-shuffle-variant", checked: false },
    { ValueMember: 3, DisplayMember: 'Rule', icon: "mdi-check", checked: false }
  ];

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css']
})
export class ProductDetailsComponent implements OnInit {

  @Input() editObjects: any;

  listOfTaxCodes = [];

  listOfTaxProducts = [];

  ctcproductrulecategory: any = [];
  payrollproductrulecategory: any = [];
  ctcruleslist = [];

  ProductDetails: PayGroupProduct = {} as any;


  payrollruleslist: any = [];

  product: Product = {} as any;

  listOfproductType = [];
  producttypename: any;
  calculationTypename: any;

  productlist: any = [];
  productslist: any = [];



  ProductId: any;
  submitted = false;
  disableBtn = false;

  spinner: boolean = false;
  productdetailsForm: FormGroup;
  ctcPayrollRuleList = [];
  minWorkTimeTypesArray = [];

  notAllowedZeroValidator(control: FormControl): { [key: string]: any } | null {
    const value = control.value;
    if (Number(value) < 1) {
      return { notAllowedZero: true };
    }
    return null;
  }

  constructor(
    private activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private utilsHelper: enumHelper,
    public UIBuilderService: UIBuilderService,
    public paygroupService: PaygroupService,
    private ProductService: ProductService,
  ) {
    this.createPlatform();
  }

  get g() { return this.productdetailsForm.controls; } // reactive forms validation 

  createPlatform() {
    this.productdetailsForm = this.formBuilder.group({

      DisplayName: [{ value: '', disabled: true }, Validators.required],
      producttype: [{ value: '', disabled: true }, Validators.required],
      CalculationType: [{ value: '', disabled: true }, Validators.required],
      glCode: [''],
      // payrollrule: [null],
      IsLopApplicable: [false],
      IsArrearApplicable: [false],
      DisplayOrder: ['', [this.notAllowedZeroValidator]],
      IsOveridable: [false],
      IsRecalculationrequired: [false],
      IsBreakUpApplicable: [false],
      // ProductRuleMappingId: [],
     // PayrollProductRuleMappingId: [],
      ProductId: [],
      // ProductRuleMappingCode: [],
      // PayrollProductRuleMappingCode: [],
      // ctcrule: [],
      IsTaxOverridable: [false],
      IsTaxprojectionRequired: [],
      TaxProductId: [0, [this.notAllowedZeroValidator]],
      IsTaxCodeApplicable: [false],
      TaxCodeId: [0, [this.notAllowedZeroValidator]],
      IsThresholdLimitApplicable: [false],
      TaxThresholdLimit: [0, [this.notAllowedZeroValidator]],
      IsAdjustmentProduct: [false],
      Decimalvalue: [0],
      Numericvalue: [0],
      Stringvalue: [null],
      IsBillable: [false],
      IsProrationRequiredForNewJoiner: [false],
      ConsiderLatestAmountWhenSplitsExist: [false],
      MinWorkTimeType: [0, [Validators.required]],
      MinWorkTimeToPay: [0],
      IsEncashDaysNotApplicable: [false],
      IsArrearRequiredForNonAdheredMinWorkTimePeriods: [false],
      IsGrossTaxUpApplicable: [false],
      GLCode: [''],
      ProductCTCPayrollRuleMappingId:[0],
      ProductCTCPayrollRuleMapping:[null],
      ReverseSequenceOrder:[0]
    })
  }

  ngOnInit() {
    console.log('IIIIIIIIIII');
    this.spinner = true;
    forkJoin([
      this.loadProductTypeLst(),
      this.loadTaxCodeList()
    ]).subscribe(value => {
      console.log('FORK JOIN OUTPUT :: ', value);
    });
    this.ctcruleslist.length = 0;

    this.minWorkTimeTypesArray = this.enumToArray(MinWorkTimeType);
    // this.getallproducts();

    //  this.ProductId = this.editObjects.Id;
    //  console.log('product',this.ProductId);

    if (this.editObjects.ProductId != undefined) {
      this.productlist.length = 0;
      this.ProductId = this.editObjects.ProductId;
      this.paygroupService.getProduct().subscribe(response => {
        this.productlist = response.dynamicObject;
        // console.log('product data',this.productlist);

        this.productlist.forEach(element => {
          this.listOfTaxProducts.push({ Id: element.Id, Name: element.Name });
        })

        this.productlist.forEach(element => {
          if (element.Id == this.editObjects.ProductId) {

            this.product = element
            console.log('product', this.product);
          }
        })

        if (this.editObjects != null) {
          console.log('sdsfsd', this.editObjects);

          this.productdetailsForm.patchValue(this.editObjects);


          let productid = this.product.ProductTypeId;
          let caluculationid = this.product.CalculationType;
          this.productdetailsForm.controls['DisplayName'].setValue(this.editObjects.DisplayName);

          const displayOrder = this.editObjects.DisplayOrder === 0 ? this.editObjects.CalculationOrder : this.editObjects.DisplayOrder;
          this.productdetailsForm.controls['DisplayOrder'].setValue(displayOrder);

          this.listOfproductType.forEach(element => {
            if (element.Id == productid) {
              this.producttypename = element.Name
            }
          });

          ProductCalculationType.forEach(element => {
            if (element.ValueMember == caluculationid) {
              this.calculationTypename = element.DisplayMember
            }
          });
          this.spinner = false;
          this.productdetailsForm.controls['producttype'].setValue(this.producttypename);
          this.productdetailsForm.controls['CalculationType'].setValue(this.calculationTypename);
          // this.productdetailsForm.controls['payrollrule'].setValue(this.editObjects.PayrollProductRuleMappingId);

          // this.productdetailsForm.controls['TaxProductId'].setValue(this.editObjects.ProductId);

          if (this.editObjects.TaxProductId && this.editObjects.TaxProductId != 0) {
            this.productdetailsForm.controls['TaxProductId'].setValue(this.editObjects.TaxProductId);
          } else {
            this.productdetailsForm.controls['TaxProductId'].setValue(this.editObjects.ProductId);
          }

          // let rulemapping = this.product.LstProductRuleMapping;
          // rulemapping.forEach(element => {
          //   if (element.ProductRuleCategory == 1) {

          //     this.ctcruleslist.push({ Id: element.Id, Name:element.Rule.Name});
          //   }
          //   if (element.ProductRuleCategory == 2) {
          //     this.payrollruleslist.push({ Id: element.Id, Name: element.Rule ? element.Rule.Name : '' });
          //   }
          // })

          // const temp = this.product.LstProductCTCPayrollRuleMapping;
          // temp.forEach(element => {
          //   if (element.CTCRule) {

          //     this.ctcruleslist.push(element.CTCRule);
          //   }
          //   if (element.PayrollRule) {
          //     this.payrollruleslist.push(element.PayrollRule);
          //   }
          // })

          if (this.product && this.product.LstProductCTCPayrollRuleMapping) {
            this.ctcPayrollRuleList = this.product.LstProductCTCPayrollRuleMapping;
          }



          //  rulemapping.forEach(element => {
          //   console.log('productrulemappingid',element.Id);
          //   if(element.ProductRuleCategory == 1){
          //     this.productrulemappingid = element.Id;
          //     this.ctcproductrulecategory.push(element.Rule);
          //   }
          //   if(element.ProductRuleCategory == 2){
          //     this.payrollproductrulemappingid = element.Id;
          //     this.payrollproductrulecategory.push(element.Rule);
          //   }

          //  });

          //  this.ctcproductrulecategory.forEach(element =>{

          //   this.ctcruleslist.push({Id: element.Id, Name : element.Name});


          //     })
          //     console.log('ctc rule list',this.ctcruleslist)

          //  this.payrollproductrulecategory.forEach(element =>{

          //       this.payrollruleslist.push({Id: element.Id, Name : element.Name});
          //     })

        }

      });
    }
    else {

      if (this.editObjects != null) {
        console.log('sdsfsd', this.editObjects);

        this.productlist.length = 0;
        this.ProductId = this.editObjects.Id;
        this.paygroupService.getProduct().subscribe(response => {
          this.productlist = response.dynamicObject;
          // console.log('product data',this.productlist);

          this.productlist.forEach(element => {
            this.listOfTaxProducts.push({ Id: element.Id, Name: element.Name });
          });
        });

        this.productdetailsForm.patchValue(this.editObjects);
        this.productdetailsForm.controls['DisplayName'].setValue(this.editObjects.Name);

        this.calculationTypename = this.editObjects.CalculationType

        this.productdetailsForm.controls['producttype'].setValue(this.editObjects.ProductType);
        this.productdetailsForm.controls['CalculationType'].setValue(this.editObjects.CalculationType);

        if (this.editObjects.TaxProductId != 0 && this.editObjects.TaxProductId != undefined) {
          this.productdetailsForm.controls['TaxProductId'].setValue(this.editObjects.TaxProductId);
        }
        else {
          this.productdetailsForm.controls['TaxProductId'].setValue(this.editObjects.Id);
        }



        let rulemapping = this.editObjects.LstProductRuleMapping;


        rulemapping.forEach(element => {

          if (element.ProductRuleCategory == 1) {
            this.ctcruleslist.push({ Id: element.Id, Name: element.Rule.Name });
          }
          if (element.ProductRuleCategory == 2) {
            this.payrollruleslist.push({ Id: element.Id, Name: element.Rule.Name });
          }

        });

        // this.spinner = false;

        //  this.ctcproductrulecategory.forEach(element =>{

        //   this.ctcruleslist.push({Id: 1, Name : element.Name});

        //           console.log('ctc rule list',this.ctcruleslist)
        //     })

        //  this.payrollproductrulecategory.forEach(element =>{

        //   this.payrollruleslist.push({Id: element.Id, Name : element.Name});
        //     })



      }
    }


    this.productdetailsForm.valueChanges.subscribe((changedObj: any) => {
      this.disableBtn = true;
    });

    this.productdetailsForm.get('IsBreakUpApplicable').valueChanges.subscribe(val => {
      if (val) {
        this.productdetailsForm.controls.ProductCTCPayrollRuleMappingId.setValidators([Validators.required]);
        this.productdetailsForm.controls.ProductCTCPayrollRuleMappingId.updateValueAndValidity();
        this.productdetailsForm.controls.ProductCTCPayrollRuleMappingId.setValue(null);
      }
      if (!val) {
        this.productdetailsForm.controls.ProductCTCPayrollRuleMappingId.setValidators(null);
        this.productdetailsForm.controls.ProductCTCPayrollRuleMappingId.updateValueAndValidity();
        this.productdetailsForm.controls.ProductCTCPayrollRuleMappingId.setValue(0);
      }
    });

    this.productdetailsForm.get('IsTaxOverridable').valueChanges.subscribe(val => {
      if (val) {
        this.productdetailsForm.controls.TaxProductId.setValidators([Validators.required]);
        this.productdetailsForm.controls.TaxProductId.updateValueAndValidity();
      }
      if (!val) {
        this.productdetailsForm.controls.TaxProductId.setValidators(null);
        this.productdetailsForm.controls.TaxProductId.updateValueAndValidity();
      }
    });

    this.productdetailsForm.get('IsTaxCodeApplicable').valueChanges.subscribe(val => {
      if (val) {
        this.productdetailsForm.controls.TaxCodeId.setValue(0);
        this.productdetailsForm.controls.TaxCodeId.setValidators([Validators.required, this.notAllowedZeroValidator]);
        this.productdetailsForm.controls.TaxCodeId.updateValueAndValidity();
      }
      if (!val) {
        this.productdetailsForm.controls.TaxCodeId.setValue(0);
        this.productdetailsForm.controls.TaxCodeId.setValidators(null);
        this.productdetailsForm.controls.TaxCodeId.updateValueAndValidity();
      }
    });

    this.productdetailsForm.get('IsThresholdLimitApplicable').valueChanges.subscribe(val => {
      if (val) {
        this.productdetailsForm.controls.TaxThresholdLimit.setValue(0);
        this.productdetailsForm.controls.TaxThresholdLimit.setValidators([Validators.required, this.notAllowedZeroValidator]);
        this.productdetailsForm.controls.TaxThresholdLimit.updateValueAndValidity();
      }
      if (!val) {
        this.productdetailsForm.controls.TaxThresholdLimit.setValue(0);
        this.productdetailsForm.controls.TaxThresholdLimit.setValidators(null);
        this.productdetailsForm.controls.TaxThresholdLimit.updateValueAndValidity();
      }
    });

    this.productdetailsForm.get('MinWorkTimeType').valueChanges.subscribe(val => {
      if (val > 0) {
        this.productdetailsForm.controls.MinWorkTimeToPay.setValue(0);
        this.productdetailsForm.controls.MinWorkTimeToPay.setValidators([Validators.required, this.notAllowedZeroValidator]);
        this.productdetailsForm.controls.MinWorkTimeToPay.updateValueAndValidity();
      }
      if (!val) {
        this.productdetailsForm.controls.MinWorkTimeToPay.setValue(0);
        this.productdetailsForm.controls.MinWorkTimeToPay.setValidators(null);
        this.productdetailsForm.controls.MinWorkTimeToPay.updateValueAndValidity();
      }
    });











  }

  loadProductTypeLst() {

    this.paygroupService.getProductType().subscribe((res) => {

      this.listOfproductType = res.dynamicObject;
      this.listOfproductType = _.orderBy(this.listOfproductType, ["name"], ["asc"]);
      // console.log('ll', this.listOfproductType);


    });
    ((err) => {

    });
  }

  loadTaxCodeList() {

    this.paygroupService.getalltaxcodes().subscribe((res) => {

      this.listOfTaxCodes = res.Result;

      this.listOfTaxCodes = _.orderBy(this.listOfTaxCodes, ["name"], ["asc"]);
      console.log('all tax codes', this.listOfTaxCodes);


    });
    ((err) => {

    });
  }



  getallproducts() {
    this.paygroupService.getProduct().subscribe(response => {
      this.productslist = response.dynamicObject;
      console.log('product data', this.productslist);

      this.productlist.forEach(element => {
        if (element.Code == this.productdetailsForm.get('DisplayName').value) {

          this.ProductId = element.Id

        }
      })
      console.log('product', this.ProductId);
    });
  }

  enumToArray(enumObject: any): { id: number, name: string }[] {
    return Object.keys(enumObject)
      .filter(key => isNaN(Number(key)))
      .map(key => ({ id: enumObject[key], name: key }));
  }

  savebutton(): void {

    this.submitted = true;

    if (this.productdetailsForm.invalid) {
      this.alertService.showWarning('Please fill all required fields');
     // alert('form invalid')
      return;
    }
    // this.ctcruleslist.forEach(element => {
    //   if (element.Id == this.productdetailsForm.get('ctcrule').value) {
    //     this.ProductDetails.ProductRuleMappingId = element.Id;
    //     this.productdetailsForm.controls['ctcrule'].setValue(element.Name);
    //     this.productdetailsForm.controls['ProductRuleMappingCode'].setValue(element.Name);
    //   }
    // });

    // this.payrollruleslist.forEach(element => {
    //   if (element.Id == this.productdetailsForm.get('payrollrule').value) {
    //     this.ProductDetails.PayrollProductRuleMappingId = element.Id;
    //     this.productdetailsForm.controls['payrollrule'].setValue(element.Name);
    //     this.productdetailsForm.controls['PayrollProductRuleMappingCode'].setValue(element.Name);
    //   }
    // });

    this.ctcPayrollRuleList.forEach(el => {
      if (el.Id == this.productdetailsForm.get('ProductCTCPayrollRuleMappingId').value) {
        this.ProductDetails.ProductCTCPayrollRuleMapping = el;
        this.productdetailsForm.controls['ProductCTCPayrollRuleMapping'].setValue(el);
        // this.productdetailsForm.controls['PayrollProductRuleMappingId'].setValue(el.Name);
        // this.productdetailsForm.controls['PayrollProductRuleMappingCode'].setValue(el.Name);
      }
    });



    this.productdetailsForm.controls['ProductId'].setValue(this.ProductId);
    

    // this.productdetailsForm.controls['PayrollProductRuleMappingId'].setValue(this.ProductDetails.PayrollProductRuleMappingId);


    console.log('productdetailsform', this.productdetailsForm.value);
    this.activeModal.close(this.productdetailsForm.getRawValue());





  }




  closeModal() {

    this.activeModal.close('Modal Closed');

  }

}
