import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ProductGroupService } from '../../../_services/service/productgroup.service';
import { ProductService } from '../../../_services/service/product.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Product, _Product, ProductApplicability } from 'src/app/_services/model/Product';
import { AlertService } from '../../../_services/service/alert.service';
import { ProductModel, _productmodel } from 'src/app/_services/model/ProductModel';
import * as _ from 'lodash';
import { UUID } from 'angular2-uuid';

@Component({
  selector: 'app-product-applicability',
  templateUrl: './product-applicability.component.html',
  styleUrls: ['./product-applicability.component.css'],

})
export class ProductApplicabilityComponent implements OnInit {

  @Input() id: number;
  @Input() jsonObj: any;

  spinner: boolean = false;
  radioOptionSelected: any;
  showcontent = '';
  UserId: any;
  identity: number = 0;
  dataset_byproduct: any[] = [];
  dataset_ByProductGrp: any[] = [];
  product: Product = {} as any;
  ProductApplicability: ProductApplicability = {} as any;
  ProductModel: ProductModel;
  productApplicabilityForm: FormGroup;
  deleteColumn: string;
  ProductGroupList = [];
  submitted: boolean = false;
  GroupIdList: any[] = [];
  GroupList: any[] = [];
  k = [];
  minDate: Date;

  
  apiResponse: any;


  selectedApplicableData = [];
  selectedExcludedData = [];
  selectedPerptualExcludedData = [];

  applicableDataByProduct: any[] = [];
  excludedDataByProduct: any[] = [];
  perpetualExclusionDataByProduct: any[] = [];

  constructor(
    private activeModal: NgbActiveModal,
    private ProductGroupService: ProductGroupService,
    private ProductService: ProductService,
    private formBuilder: FormBuilder,
    private alertService: AlertService
  ) { }

  get f() { return this.productApplicabilityForm.controls; }

  ngOnInit() {
    this.minDate = new Date();
    
    this.loadProductGroupLst();

    this.createFormControls();
    
    console.log(this.id);
    console.log('jjjjj', this.jsonObj);


    this.initial_getProduct_load();

    if (this.id) { // edit
      const { ApplicableProductGroupIds, ExcludedProductsIds, ApplicableProductIds, ProductGroupIds } = this.jsonObj[0];
      
      const applicableProductGroupIds = ApplicableProductGroupIds && ApplicableProductGroupIds.map((element: any) => element) || [];
      const excludedProductsIds = ExcludedProductsIds && ExcludedProductsIds.map((element: any) => element) || [];
      const applicableProductIds = ApplicableProductIds && ApplicableProductIds.map((element: any) => element) || [];
      const productGroupId = ProductGroupIds && ProductGroupIds.map((element: any) => element) || [];

      console.log('loc', this.ProductGroupList);
      console.log('loc j', applicableProductGroupIds);

      // if (applicableProductIds && applicableProductIds.length > 0) {
      //   //this.radioOptionSelected ='radio2';       
      //   this.initial_getProduct_load(applicableProductIds);
      // } else {
      //   this.initial_getProduct_load(null)
      // }

      // if (this.jsonObj && this.jsonObj.length && this.jsonObj[0].ApplicableProductGroupIds) {
      //   this.loadProductGroupLstbyId(this.jsonObj[0].ApplicableProductGroupIds).then(result => {
      //     if (result) {
      //       this.perpetualExclusionDataByProduct = this.filterData(this.perpetualExclusionDataByProduct, excludedProductsIds);
      //     }
      //     // if (result) {
      //     //   this.loadProductGroupLstbyProductId(applicableProductGroupIds);
      //     //   if (excludedProductsIds && excludedProductsIds.length) {
      //     //     this.loadProductGroupLstbyExcludedId(excludedProductsIds);
      //     //   }
      //     // }
      //   });
      // } else if (this.jsonObj && this.jsonObj.length && this.jsonObj[0].ApplicableProductIds) {
      //   this.loadProductGroupLstbyProductId(applicableProductIds);
      //   if (excludedProductsIds && excludedProductsIds.length) {
      //     this.loadProductGroupLstbyExcludedId(excludedProductsIds);
      //   }
      // }
  
      if (applicableProductGroupIds.length > 0 || (productGroupId && productGroupId.length > 0)) {
        this.radioOptionSelected = 'radio1';
        this.showContent();
      } else {
        if (applicableProductIds.length > 0) {
          this.radioOptionSelected = 'radio2';
          this.showContent();
        }
      }
      
      
      this.patchFormValues();
    } else { // create
      this.radioOptionSelected = 'radio1';
      // this.initial_getProduct_load(null);
      this.showContent();
    }
    
  }

  createFormControls() {
    this.productApplicabilityForm = this.formBuilder.group({
      Id: [UUID.UUID()],
      code: ['', [Validators.required, Validators.minLength(2)]],
      effectiveDate: [null, Validators.required],
      productGrouplist: [[]],
      perpetualExclusionProduct: [[]],
      applicableProduct: [[]],
      excludedProduct: [[]],
      status: [true],
    });
  }

  patchFormValues() {
    this.productApplicabilityForm.patchValue({
      "Id": this.jsonObj[0].Id,
      "code": this.jsonObj[0].Code,
      "effectiveDate": new Date(this.jsonObj[0].EffectiveDate),
      "status": this.jsonObj[0].Status == "Active" ? true : false,
      "productGrouplist": this.jsonObj[0].ProductGroupIds || this.jsonObj[0].ApplicableProductGroupIds,
      "perpetualExclusionProduct": this.jsonObj[0].PerpetualExclusionProductIds,
      "applicableProduct": this.jsonObj[0].ApplicableProductIds,
      "excludedProduct": this.jsonObj[0].ExcludedProductsIds,
    });

    console.log("pp", this.productApplicabilityForm);
  }

  initial_getProduct_load() {
    this.apiResponse = [];
    //this.dataset_byproduct = [];
    this.ProductService.getProduct().subscribe(response => {
      if (response.Status && response.dynamicObject != '') {
        const dynamicObject = response.dynamicObject;
        this.dataset_byproduct = dynamicObject.map(ele => {
          const listname = this.ProductGroupList.find(a => a.Id == ele.ProductgroupId);
          if (listname) {
            return { ...ele, ProductGroupName: listname.Name };
          } else {
            return ele;
          }
        });
        this.applicableDataByProduct = JSON.parse(JSON.stringify(this.dataset_byproduct));
        this.excludedDataByProduct = JSON.parse(JSON.stringify(this.dataset_byproduct));
        this.perpetualExclusionDataByProduct = JSON.parse(JSON.stringify(this.dataset_byproduct));
        // on edit
        if (this.jsonObj && this.jsonObj.length && this.jsonObj[0].ApplicableProductIds && this.jsonObj[0].ApplicableProductIds != null && this.jsonObj[0].ApplicableProductIds.length) {
          this.selectedApplicableData = this.dataset_byproduct.filter(item => this.jsonObj[0].ApplicableProductIds.includes(item.Id));
          this.excludedDataByProduct = this.dataset_byproduct.filter(item => !this.jsonObj[0].ApplicableProductIds.includes(item.Id));
          this.perpetualExclusionDataByProduct = this.dataset_byproduct.filter(item => !this.jsonObj[0].ApplicableProductIds.includes(item.Id));
        }
  
        if (this.jsonObj && this.jsonObj.length && this.jsonObj[0].ExcludedProductsIds && this.jsonObj[0].ExcludedProductsIds != null && this.jsonObj[0].ExcludedProductsIds.length) {
          this.selectedExcludedData = this.dataset_byproduct.filter(item => this.jsonObj[0].ExcludedProductsIds.includes(item.Id))
          this.perpetualExclusionDataByProduct = this.dataset_byproduct.filter(item => !this.jsonObj[0].ExcludedProductsIds.includes(item.Id));
        }
  
        if (this.jsonObj && this.jsonObj.length && this.jsonObj[0].PerpetualExclusionProductIds && this.jsonObj[0].PerpetualExclusionProductIds != null && this.jsonObj[0].PerpetualExclusionProductIds.length) {
          this.selectedPerptualExcludedData = this.dataset_byproduct.filter(item => this.jsonObj[0].PerpetualExclusionProductIds.includes(item.Id))
          this.excludedDataByProduct = this.dataset_byproduct.filter(item => !this.jsonObj[0].PerpetualExclusionProductIds.includes(item.Id));
          this.applicableDataByProduct = this.dataset_byproduct.filter(item => !this.jsonObj[0].PerpetualExclusionProductIds.includes(item.Id));
        }
      }
    }, (error) => { });
  }

  loadProductGroupLstbyId(param: any[]) {

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        param && param.forEach(async (element: any) => {
          try {
            const res = await this.ProductGroupService.getProductGroupById(element).toPromise();
            const listbygroup = res.dynamicObject;
            this.GroupList.push(listbygroup);
            this.GroupList.forEach((element: any) => {
              this.spinner = true;
              var _Id = element.Id;
              this.ProductService.getProductByGroupId(_Id).subscribe(response => {
                console.log("Response from Product Group : ", response);
                if (response && response.dynamicObject) {
                  let resObject = response.dynamicObject;
                  resObject.forEach((p: any) => {
                    p.ProductGroupName = element.Name;
                    this.apiResponse.push(p);
                  });
                  console.log("Filtered prodcut group list", this.apiResponse);
                  this.dataset_ByProductGrp = this.apiResponse;
                  this.dataset_ByProductGrp.forEach(prGrp => {
                    prGrp.ProductGroupName = prGrp.ProductGroupName;
                  });
                 

                  if (this.jsonObj && this.jsonObj.length && this.jsonObj[0].ApplicableProductGroupIds && this.jsonObj[0].ApplicableProductGroupIds != null && this.jsonObj[0].ApplicableProductGroupIds.length) {
                    this.selectedApplicableData = this.dataset_ByProductGrp.filter(item => this.jsonObj[0].ApplicableProductGroupIds.includes(item.Id));
                    // this.excludedDataByProductGroup = this.dataset_ByProductGrp.filter(item => !this.jsonObj[0].ApplicableProductGroupIds.includes(item.Id));
                  }

                  if (this.jsonObj && this.jsonObj.length && this.jsonObj[0].ExcludedProductsIds && this.jsonObj[0].ExcludedProductsIds != null && this.jsonObj[0].ExcludedProductsIds.length) {
                    this.selectedExcludedData = this.dataset_ByProductGrp.filter(item => this.jsonObj[0].ExcludedProductsIds.includes(item.Id))
                    // this.applicableDataByProductGroup = this.dataset_ByProductGrp.filter(item => !this.jsonObj[0].ExcludedProductsIds.includes(item.Id));
                  }
                  this.spinner = false;
                  console.log(this.dataset_ByProductGrp);
                } else {
                  this.spinner = false;
                  this.alertService.showWarning('No data available');
                  this.dataset_ByProductGrp = [];
                }
              });
            });
          } catch (error) {
            reject(error);
          }
        });
        resolve(true);
      }, 1000);
    });
  }

  loadProductGroupLst() {
    this.ProductGroupService.getProductGroup().subscribe((res) => {
      this.ProductGroupList = res.dynamicObject;
      this.ProductGroupList = _.orderBy(this.ProductGroupList, ["Name"], ["asc"]);
      console.log('ll', this.ProductGroupList);
    }, (err) => {});
  }

  loadProductGroupLstbyProductId(j: any[]) {

    j.forEach((element: any) => {
      this.spinner = true;
      this.ProductService.getProductById(element).subscribe(response => {
        if (response.Status && response.dynamicObject != '') {
          this.dataset_ByProductGrp.push(response.dynamicObject);
              
          if ( this.GroupList &&  this.GroupList.length) {
            this.dataset_ByProductGrp.forEach(ele => {
              console.log('gg', this.GroupList)
              const listname = this.GroupList.find(a => a.Id == ele.ProductgroupId).Name;
              ele.ProductGroupName = listname;
              console.log('name', listname)
            });
          }

          // this.applicableDataByProductGroup = JSON.parse(JSON.stringify(this.dataset_ByProductGrp));
          // this.excludedDataByProductGroup = JSON.parse(JSON.stringify(this.dataset_ByProductGrp));
        } else {
          this.dataset_ByProductGrp = [];
          this.applicableDataByProduct = [];
          this.excludedDataByProduct = [];
          this.perpetualExclusionDataByProduct = [];
        }
        this.spinner = false;
      });

    });
    ((err: any) => {});
  }

  loadProductGroupLstbyExcludedId(q: any[]) {
    q.forEach((element: any) => {
      this.spinner = true;
      this.ProductService.getProductById(element).subscribe(response => {
        this.dataset_ByProductGrp.push(response.dynamicObject);

        if (this.GroupList && this.GroupList.length) {
          this.dataset_ByProductGrp.forEach(ele => {
            console.log('gg', this.GroupList)
            const listname = this.GroupList.find(a => a.Id == ele.ProductgroupId).Name;
            ele.ProductGroupName = listname;
            console.log('name', listname)
          });
        }

        // this.applicableDataByProductGroup = JSON.parse(JSON.stringify(this.dataset_ByProductGrp));
        // this.excludedDataByProductGroup = JSON.parse(JSON.stringify(this.dataset_ByProductGrp));
        this.spinner = false;
      });
    }, (err: any) => {
      this.spinner = false;
    });
  }

  onChangeProductGroupDropdown(Lstproductgroup: any) {

    console.log(Lstproductgroup);

    this.apiResponse = [];
    this.dataset_ByProductGrp = [];
    this.selectedApplicableData = [];
    this.selectedExcludedData = [];
    this.selectedPerptualExcludedData = [];
    this.productApplicabilityForm.get('excludedProduct').setValue([]);
    this.productApplicabilityForm.get('perpetualExclusionProduct').setValue([]);
    Lstproductgroup.forEach((element: any) => {
      this.spinner = true;
      var _Id = element.Id;
      this.ProductService.getProductByGroupId(_Id).subscribe(response => {
        console.log("Response from Product Group : ", response);
        if (response && response.dynamicObject) {
          let resObject = response.dynamicObject;
          resObject.forEach((p: any) => {
            p.ProductGroupName = element.Name;
            this.apiResponse.push(p);
          });
          console.log("Filtered prodcut group list", this.apiResponse);
          this.dataset_ByProductGrp = this.apiResponse;
          
          this.excludedDataByProduct = JSON.parse(JSON.stringify(this.dataset_ByProductGrp));
          this.perpetualExclusionDataByProduct = JSON.parse(JSON.stringify(this.dataset_ByProductGrp));
          this.spinner = false;
          console.log(this.dataset_ByProductGrp);
        } else {
          this.spinner = false;
          this.alertService.showWarning('No data available');
          this.dataset_ByProductGrp = [];
          this.excludedDataByProduct = [];
          this.perpetualExclusionDataByProduct = [];
        }
      });
    });
  }

  closeModal() {
    this.activeModal.close('Modal Closed');
  }

  showContent() {
    this.showcontent = this.radioOptionSelected;
    this.selectedApplicableData = [];
    this.selectedExcludedData = [];
    this.selectedPerptualExcludedData = [];
    this.productApplicabilityForm.get('productGrouplist').setValue([]);
    this.productApplicabilityForm.get('applicableProduct').setValue([]);
    this.productApplicabilityForm.get('excludedProduct').setValue([]);
    this.productApplicabilityForm.get('perpetualExclusionProduct').setValue([]);
    if (this.radioOptionSelected === 'radio2') {
      this.applicableDataByProduct = JSON.parse(JSON.stringify(this.dataset_byproduct));
    } else {
      this.excludedDataByProduct = JSON.parse(JSON.stringify(this.dataset_ByProductGrp));
      this.perpetualExclusionDataByProduct = JSON.parse(JSON.stringify(this.dataset_ByProductGrp));
    }
  }

  saveProductApplicability() {
    this.submitted = true;
    if (this.productApplicabilityForm.invalid) {
      this.alertService.showInfo("Please fill the mandatory fields !");
      // this.submitted = false;
      return;
    }

    this.ProductApplicability.Id = this.productApplicabilityForm.get('Id').value;
    this.ProductApplicability.Code = this.productApplicabilityForm.get('code').value;
    this.ProductApplicability.EffectiveDate = this.productApplicabilityForm.get('effectiveDate').value;
    this.ProductApplicability.RuleId = 0;
    this.ProductApplicability.Status = this.productApplicabilityForm.get('status').value;
    this.ProductApplicability.ProductGroupIds = this.productApplicabilityForm.get('productGrouplist').value;

    this.ProductApplicability.ApplicableProductGroupIds = this.productApplicabilityForm.get('productGrouplist').value;
    this.ProductApplicability.ApplicableProductIds = this.productApplicabilityForm.get('applicableProduct').value;
    this.ProductApplicability.ExcludedProductsIds = this.productApplicabilityForm.get('excludedProduct').value;
    
    this.ProductApplicability.PerpetualExclusionProductIds = this.productApplicabilityForm.get('perpetualExclusionProduct').value;

    this.ProductApplicability.Status = Boolean(this.ProductApplicability.Status) == false ? 0 : 1;

    console.log('ProductApplicability-end', this.ProductApplicability);
    this.activeModal.close(this.ProductApplicability);
  }

  onChangeApplicableProduct(event: any[]) {
    this.selectedApplicableData = event;
  }

  onChangeExcludedProduct(event: any[]) {
    this.selectedExcludedData = event;
    if (event && event.length) {
      this.perpetualExclusionDataByProduct = this.filterData(this.excludedDataByProduct, event);
    } else {
      this.perpetualExclusionDataByProduct = this.filterData(this.dataset_byproduct, event);
    }
  }

  onChangePerpetualProduct(event: any[]) {
    this.selectedPerptualExcludedData = event;
    if (event && event.length) {
      this.excludedDataByProduct = this.filterData(this.perpetualExclusionDataByProduct, event);
    } else {
      this.excludedDataByProduct = this.filterData(this.dataset_byproduct, event);
    }
    
  }

  filterData(data1: any[], data2: any[]) {
    return data1.filter(item1 => !data2.some(item2 => item2.Code === item1.Code));
  }

}
