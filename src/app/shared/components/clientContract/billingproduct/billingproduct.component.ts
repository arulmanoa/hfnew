import { Component, OnInit, Input } from '@angular/core';
import { ProductService, AlertService, SessionStorage } from 'src/app/_services/service';
import { apiResult } from 'src/app/_services/model/apiResult';
import { ClientContractService } from "../../../../_services/service/clientContract.service";
import { enumHelper } from 'src/app/shared/directives/_enumhelper';
import { MarkupType } from 'src/app/_services/model/Client/MarkupMapping';
import { LoadingScreenService } from '../../loading-screen/loading-screen.service';
import { BillType, ProductBillingAttributes, ProductBillingGroup } from 'src/app/_services/model/Client/ProductBillingGroup';
import * as _ from 'lodash';
import * as moment from 'moment';
import { ClientContract } from 'src/app/_services/model/Client/ClientContract';

@Component({
  selector: 'app-billingproduct',
  templateUrl: './billingproduct.component.html',
  styleUrls: ['./billingproduct.component.scss']
})
export class BillingproductComponent implements OnInit {
  @Input() coreObject: any;
  searchText: string = null;
  ii = 78;
  beforeSkeleton: boolean = true;
  @Input() productList = [];
  LstbillableProduct = [];
  Lstmarkuptype = [];

  @Input() ClientDetails: ClientContract;
  ExistingProductBillingGroup: ProductBillingGroup;
  productBillingAttrArr = [];
  billList: any = [];
  markupBillList: any = [];
  serviceTaxBillList: any = [];
  constructor(
    private productService: ProductService,
    private clientContractService: ClientContractService,
    private utilsHelper: enumHelper,
    private alertService: AlertService,
    private loadingScreenService: LoadingScreenService,
    private sessionService: SessionStorage,


  ) {

  }

  ngOnInit() {
    this.sessionService.delSessionStorage('billing_data');
    this.searchText = null;
    this.coreObject = JSON.parse(this.coreObject);
    console.log('coreobject', this.coreObject);
    this.get_ProductBillingGroup().then((res) => {
      console.log(res);
      this.prepareProductBillingAttrArr();
    });
    this.beforeSkeleton = true;
    this.Lstmarkuptype = this.utilsHelper.transform(MarkupType) as any;
    this.billList = this.utilsHelper.transform(BillType);
    this.markupBillList = this.utilsHelper.transform(BillType);
    console.log(this.markupBillList);
    this.serviceTaxBillList = this.utilsHelper.transform(BillType);
    // this.Get_ProductListLooup();
    setTimeout(() => {
      this.beforeSkeleton = false;
    }, 5000);
  }

  prepareProductBillingAttrArr() {
    this.productBillingAttrArr = []
    this.productList.forEach(element => {
      console.log('element', element);
      var productBillingAttributes = new ProductBillingAttributes();
      productBillingAttributes.Id = element.Id;
      productBillingAttributes.PaygroupId = 0
      productBillingAttributes.BillingApplicabilityGroupId = 1;
      productBillingAttributes.ProductId = element.ProductId;
      productBillingAttributes.IsBillable = element.isBillable;
      productBillingAttributes.IsBillableOnActual = element.isBillableOnActual;
      productBillingAttributes.BillProductId = element.billableProductName == null ? 0 : element.billableProductName;
      productBillingAttributes.IsMarkUpApplicable = element.isMarkupApplicable;
      productBillingAttributes.IsPartOfBillableCost = false;
      productBillingAttributes.IsProductWiseBillingRequired = element.isProductWiseMarkup;
      productBillingAttributes.MarkupType = element.markupType == null ? 0 : element.markupType;
      productBillingAttributes.MarkupParameter = element.markupValue;
      productBillingAttributes.LastUpdatedBy = this.coreObject.UserId;
      productBillingAttributes.LastUpdatedOn = (moment().format('YYYY-MM-DD'));
      productBillingAttributes.CreatedBy = this.coreObject.UserId;
      productBillingAttributes.CreatedOn = (moment().format('YYYY-MM-DD'));
      productBillingAttributes.IsPartOfPayrollInputSheet = false;
      productBillingAttributes.PayslipDisplayName = '';
      productBillingAttributes.ProductNotes = '';
      productBillingAttributes.Status = 1;
      productBillingAttributes.BillType = element.billType;
      productBillingAttributes.MarkupBillType = element.markupBillType;
      productBillingAttributes.ServiceTaxBillType = element.serviceTaxBillType;
      this.productBillingAttrArr.push(productBillingAttributes);
      // }
    });
  }

  get_ProductBillingGroup() {
    return new Promise((resolve, reject) => {
      this.clientContractService.Get_ProductBillingGroupByClientContractId(this.coreObject.ContractId).
        subscribe((result) => {
          const apiResult: apiResult = result;
          if (apiResult.Status) {
            this.ExistingProductBillingGroup = apiResult.Result as any;
            if (this.ExistingProductBillingGroup != null && this.ExistingProductBillingGroup != undefined && this.ExistingProductBillingGroup.ProductBillingAttributeList != null && this.ExistingProductBillingGroup.ProductBillingAttributeList.length > 0) {
              this.ExistingProductBillingGroup.ProductBillingAttributeList.forEach(obj => {
                var updateProductItem = this.productList.find(a => a.ProductId == obj.ProductId);
                console.log('updateProductItem', updateProductItem);
                if (updateProductItem != undefined) {
                  updateProductItem.isBillable = obj.IsBillable;
                  updateProductItem.isBillableOnActual = obj.IsBillableOnActual;
                  updateProductItem.billableProductName = obj.BillProductId;
                  updateProductItem.isMarkupApplicable = obj.IsMarkUpApplicable;
                  updateProductItem.isProductWiseMarkup = obj.IsProductWiseBillingRequired;
                  updateProductItem.markupType = obj.MarkupType;
                  updateProductItem.markupValue = obj.MarkupParameter;
                  updateProductItem.Id = obj.Id;
                  updateProductItem.billType = obj.BillType == 0 ? 1 : obj.BillType;
                  updateProductItem.markupBillType = obj.MarkupBillType == 0 ? 1 : obj.MarkupBillType;
                  updateProductItem.serviceTaxBillType = obj.ServiceTaxBillType == 0 ? 1 : obj.ServiceTaxBillType;
                }

              });
            }
            resolve(true);
          }
          else {
            this.ExistingProductBillingGroup = null;
            reject(false);
          }
        });
    })
  }

  trackByFn(index, item) {
    return item.Id;
  }

  selectColor(colorNum, colors) {
    if (colors < 1) colors = 1; // defaults to one color - avoid divide by zero
    return "hsl(" + (colorNum * (360 / colors) % 360) + ",100%,50%)";
  }

  getInterleaveColor() {
    var borderProperties = '5px solid ';
    const color = Math.floor(0x1000000 * Math.random()).toString(16);
    return borderProperties + '#' + ('000000' + color).slice(-6);
  }

  getRandomColor2() {
    let length = 6;
    let chars = '0123456789ABCDEF';
    let hex = '#';
    while (length--) hex += chars[(Math.random() * 16) | 0];
    return hex;
  }

  onChangeProducts(item, index) {
    console.log('item ', item);
    console.log('index', index);
    this.productBillingAttrArr[index].IsBillable = item.isBillable;
    this.productBillingAttrArr[index].IsBillableOnActual = item.isBillableOnActual;
    this.productBillingAttrArr[index].IsMarkUpApplicable = item.isMarkupApplicable;
    this.productBillingAttrArr[index].IsProductWiseBillingRequired = item.isProductWiseMarkup;
    this.productBillingAttrArr[index].MarkupType = item.markupType == null ? 0 : item.markupType;
    this.productBillingAttrArr[index].MarkupParameter = item.markupValue == null ? '' : item.markupValue;
    this.productBillingAttrArr[index].LastUpdatedOn = (moment().format('YYYY-MM-DD'));
    this.productBillingAttrArr[index].LastUpdatedOn = (moment().format('YYYY-MM-DD'));
    this.productBillingAttrArr[index].BillType = item.billType;
    this.productBillingAttrArr[index].MarkupBillType = item.markupBillType;
    this.productBillingAttrArr[index].ServiceTaxBillType = item.serviceTaxBillType;
    if (item.isBillable) {
      this.making_ProductGroup()
    }
  }
  onChangeBillableProduct(item, event, index) {
    if (event) {
      item.billableProductName = event.ProductId;
      this.productBillingAttrArr[index].BillProductId = event.billableProductName == null ? 0 : item.billableProductName;
      this.making_ProductGroup();
    }
  }
  onChangeBillType(item, event, index) {
    if (event) {
      item.id = event.id;
      this.productBillingAttrArr[index].BillType = item.billType;
      console.log(this.productBillingAttrArr[index]);
      this.making_ProductGroup();
    }
  }
  onChangeMarkType(item, event, index) {
    if (event) {
      item.id = event.id;
      this.productBillingAttrArr[index].MarkupBillType = item.markupBillType;
      console.log(this.productBillingAttrArr[index]);
      this.making_ProductGroup();
    }
  }

  onChangeServiceTax(item, event, index) {
    if (event) {
      item.id = event.id;
      this.productBillingAttrArr[index].ServiceTaxBillType = item.serviceTaxBillType;
      console.log(this.productBillingAttrArr[index]);
      this.making_ProductGroup();
    }
  }

  making_ProductGroup() {
    this.sessionService.delSessionStorage('billing_data');
    var productBillingGroup = new ProductBillingGroup();
    productBillingGroup.Id = this.ExistingProductBillingGroup != null ? this.ExistingProductBillingGroup.Id == 1 ? 0 : this.ExistingProductBillingGroup.Id : 0;
    productBillingGroup.Code = this.ExistingProductBillingGroup != null && this.ExistingProductBillingGroup.Code != null ? this.ExistingProductBillingGroup.Code : '';
    productBillingGroup.Name = this.ExistingProductBillingGroup != null && this.ExistingProductBillingGroup.Name != null ? this.ExistingProductBillingGroup.Name : '';
    productBillingGroup.Description = this.ExistingProductBillingGroup != null && this.ExistingProductBillingGroup.Description ? this.ExistingProductBillingGroup.Description : '';
    productBillingGroup.CompanyId = this.coreObject.CompanyId;
    productBillingGroup.ClientId = this.ClientDetails.ClientId;
    productBillingGroup.ClientContractId = this.ClientDetails.Id;
    productBillingGroup.EmployeeId = 0;
    productBillingGroup.TeamId = 0;
    productBillingGroup.EffectiveDate = moment().format('YYYY-MM-DD');
    productBillingGroup.EffectivePeriod = '';
    productBillingGroup.ProductBillingAttributeList = this.productBillingAttrArr;
    productBillingGroup.Status = 1;
    (productBillingGroup.LastUpdatedBy = this.coreObject.UserId);
    (productBillingGroup.LastUpdatedOn = (moment().format('YYYY-MM-DD')));
    (productBillingGroup.CreatedBy = this.coreObject.UserId);
    (productBillingGroup.CreatedOn = (moment().format('YYYY-MM-DD')));
    this.sessionService.setSesstionStorage("billing_data", JSON.stringify(productBillingGroup));

  }
  async doSave_ProductBillingItems() {

    if (this.productList.length === 0) {
      this.alertService.showWarning("No records were found that met your criteria.");
      return;
    }
    this.loadingScreenService.startLoading();

    const _productBillingAttributes = [];
    this.productList.forEach(element => {
      // if (element.isBillable) {
      console.log('element', element);

      var productBillingAttributes = new ProductBillingAttributes();
      productBillingAttributes.Id = element.Id;
      productBillingAttributes.PaygroupId = 0
      productBillingAttributes.BillingApplicabilityGroupId = 1;
      productBillingAttributes.ProductId = element.ProductId;
      productBillingAttributes.IsBillable = element.isBillable;
      productBillingAttributes.IsBillableOnActual = element.isBillableOnActual;
      productBillingAttributes.BillProductId = element.billableProductName == null ? 0 : element.billableProductName;
      productBillingAttributes.IsMarkUpApplicable = element.isMarkupApplicable;
      productBillingAttributes.IsPartOfBillableCost = false;
      productBillingAttributes.IsProductWiseBillingRequired = element.isProductWiseMarkup;
      productBillingAttributes.MarkupType = element.markupType == null ? 0 : element.markupType;
      productBillingAttributes.MarkupParameter = element.markupValue;
      (productBillingAttributes.LastUpdatedBy = this.coreObject.UserId);
      (productBillingAttributes.LastUpdatedOn = (moment().format('YYYY-MM-DD')));
      (productBillingAttributes.CreatedBy = this.coreObject.UserId);
      (productBillingAttributes.CreatedOn = (moment().format('YYYY-MM-DD')));
      productBillingAttributes.IsPartOfPayrollInputSheet = false;
      productBillingAttributes.PayslipDisplayName = '';
      productBillingAttributes.ProductNotes = '';
      productBillingAttributes.Status = 1;
      _productBillingAttributes.push(productBillingAttributes);
      // }
    });
    var productBillingGroup = new ProductBillingGroup();
    productBillingGroup.Id = this.ExistingProductBillingGroup != null ? this.ExistingProductBillingGroup.Id : 0;
    productBillingGroup.Code = this.ExistingProductBillingGroup != null ? this.ExistingProductBillingGroup.Code : '';
    productBillingGroup.Name = this.ExistingProductBillingGroup != null ? this.ExistingProductBillingGroup.Name : '';
    productBillingGroup.Description = this.ExistingProductBillingGroup != null ? this.ExistingProductBillingGroup.Description : '';
    productBillingGroup.CompanyId = this.coreObject.CompanyId;
    productBillingGroup.ClientId = this.ClientDetails.ClientId;
    productBillingGroup.ClientContractId = this.ClientDetails.Id;
    productBillingGroup.EmployeeId = 0;
    productBillingGroup.TeamId = 0;
    productBillingGroup.EffectiveDate = moment().format('YYYY-MM-DD');
    productBillingGroup.EffectivePeriod = '';
    productBillingGroup.ProductBillingAttributeList = _productBillingAttributes;
    productBillingGroup.Status = 1;
    (productBillingGroup.LastUpdatedBy = this.coreObject.UserId);
    (productBillingGroup.LastUpdatedOn = (moment().format('YYYY-MM-DD')));
    (productBillingGroup.CreatedBy = this.coreObject.UserId);
    (productBillingGroup.CreatedOn = (moment().format('YYYY-MM-DD')));



    console.log('test', productBillingGroup);
    this.clientContractService.Put_UpsertBillingProductGroup(JSON.stringify(productBillingGroup))
      .subscribe((result) => {
        const apiResult: apiResult = result;
        this.loadingScreenService.stopLoading();
        return apiResult;
        // if (apiResult.Status) {
        //   this.loadingScreenService.stopLoading();
        //   this.alertService.showSuccess(apiResult.Message);
        // } else {
        //    this.alertService.showWarning(apiResult.Message); this.loadingScreenService.stopLoading() }
      })
  }

  public isGuid(stringToTest) {
    if (stringToTest[0] === "{") {
      stringToTest = stringToTest.substring(1, stringToTest.length - 1);
    }
    var regexGuid = /^(\{){0,1}[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}(\}){0,1}$/gi;
    return regexGuid.test(stringToTest);
  }

}
