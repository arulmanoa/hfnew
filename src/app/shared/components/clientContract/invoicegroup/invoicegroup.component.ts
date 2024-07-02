import { Component, OnInit, Input } from '@angular/core';
import { enumHelper } from 'src/app/shared/directives/_enumhelper';
import { SelectionOperator } from './invoiceGroup';
import * as _ from 'lodash';
import { ProductService, AlertService, SessionStorage } from 'src/app/_services/service';
import { apiResult } from 'src/app/_services/model/apiResult';
import { ClientContractService } from "../../../../_services/service/clientContract.service";
import { ProductWiseInvoiceGroup } from 'src/app/_services/model/Client/ProductWiseInvoiceGroup';
import { ClientSaleOrderGrouping } from 'src/app/_services/model/Client/ClientSaleOrderGrouping';
import { LoadingScreenService } from '../../loading-screen/loading-screen.service';
import { moveItemInArray, CdkDragDrop } from "@angular/cdk/drag-drop";
import { UUID } from 'angular2-uuid';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-invoicegroup',
  templateUrl: './invoicegroup.component.html',
  styleUrls: ['./invoicegroup.component.scss']
})
export class InvoicegroupComponent implements OnInit {
  @Input() coreObject: any;

  beforeSkeleton: boolean = true;
  isSaleOrderWiseGrouping: boolean = true;
  isProductWiseGrouping: boolean = true;
  groupingText = "Advanced Grouping";
  IsNoneOperator: boolean = true;
  LstApplicableProducts = [];
  LstFieldSet = [];
  Lstmarkuptype = [];
  LstOperators = [];
  LstGroupingOrder = [];
  productwiseList = [];
  LstGroupingItems = [];
  LstFieldType = [{
    id: 1,
    Name: "String"
  },
  { id: 2, Name: "Number" }]
  LstOfProducts = [];
  SOGroupId: any = 0;
  GlobalProductList: any[] = [];
  removedProductWiseItems: any[] = [];
  constructor(
    private utilsHelper: enumHelper,
    private productService: ProductService,
    private clientContractService: ClientContractService,
    private loadingScreenService: LoadingScreenService,
    private alertService: AlertService,
    private sessionService: SessionStorage,
    private nzMessageService: NzMessageService

  ) {
    this.productwiseList = []
    this.LstApplicableProducts = [];
    this.Lstmarkuptype = [{
      id: 1,
      name: "Fixed"
    }, { id: 2, name: "Percentage" }];
    this.LstGroupingOrder = [{
      id: 2,
      Code: 1
    }, { id: 3, Code: 2 }]


    this.LstGroupingItems =
      [
        // [
        //   {
        //     "fieldId": 1,
        //     "fieldName": "TeamId",
        //     "fieldType": 2,
        //     "operator": 1,
        //     "fieldValues": [
        //       224
        //     ],
        //     "sortingOrder": 1
        //   },
        //   {
        //     "fieldId": 2,
        //     "fieldName": "EmployeeId",
        //     "fieldType": 2,
        //     "operator": 6,
        //     "fieldValues": null,
        //     "sortingOrder": 2
        //   }
        // ],
        // [
        //   {
        //     "fieldId": 1,
        //     "fieldName": "TeamId",
        //     "fieldType": 2,
        //     "operator": 1,
        //     "fieldValues": [
        //       225
        //     ],
        //     "sortingOrder": 1
        //   },
        //   // {
        //   //   "fieldId": 1,
        //   //   "fieldName": "EmployeeId",
        //   //   "fieldType": 2,
        //   //   "operator": 0,
        //   //   "fieldValues": null,
        //   //   "sortingOrder": 2
        //   // }
        // ]
      ];


  }

  ngOnInit() {
    this.sessionService.delSessionStorage("invoice_productwise_data");
    this.sessionService.delSessionStorage("invoice_saleOrder_data");
    this.sessionService.delSessionStorage("GroupingText");

    this.coreObject = JSON.parse(this.coreObject);
    console.log('core', this.coreObject);

    this.LstOperators = this.utilsHelper.transform(SelectionOperator) as any;
    this.beforeSkeleton = true;
    // setTimeout(() => {

    // this.isSaleOrderWiseGrouping = false;
    // this.isProductWiseGrouping = true;
    // }, 000);
    // this.Get_ProductListLooup().then((success) => {


    this.GetAllClientSaleOrderGroupingField();
    this.GetProductWiseInvoiceGroupByContractId().then((success) => {
      this.Get_ProductListLooup().then((success) => {
      });
      this.GetClientSaleOrderGroupingByContractId().then((success) => {
        console.log('third');
        this.beforeSkeleton = false;
      });
    })
      .catch((error) => {
        console.log(error);
      });



  }
  Get_ProductListLooup() {
    const promise = new Promise((resolve, reject) => {
      this.LstApplicableProducts = [];
      this.LstOfProducts = [];
      this.productService.Get_LoadProductLooupDetails()
        .subscribe((result) => {
          const apiResult: apiResult = result;
          const LooupList = JSON.parse(apiResult.Result);
          console.log('LooupList', LooupList);
          this.LstApplicableProducts = LooupList[0].ProductList;
          this.GlobalProductList = LooupList[0].ProductList;
          this.LstOfProducts = LooupList[0].ProductList;;
          console.log('Products', this.LstApplicableProducts);

        });
    });
    return promise;
  }

  GetAllClientSaleOrderGroupingField() {
    this.clientContractService.GetAllClientSaleOrderGroupingField()
      .subscribe((result) => {
        const apiResult: apiResult = result;
        this.LstFieldSet = apiResult.Result as any;

      })
  }
  GetProductWiseInvoiceGroupByContractId() {
    const promise = new Promise((resolve, reject) => {
      this.clientContractService.GetProductWiseInvoiceGroupByContractId(this.coreObject.ContractId)
        .subscribe((result) => {
          const apiResult: apiResult = result;
          this.productwiseList = apiResult.Result as any;

          resolve(true);
          // this.isSaleOrderWiseGrouping = false;
          // this.groupingText == 'Advanced Grouping' ? (this.isProductWiseGrouping = true, this.isSaleOrderWiseGrouping = false, this.groupingText = "Go to Basic Option") : (this.isProductWiseGrouping = false, this.isSaleOrderWiseGrouping = true, this.groupingText = "Advanced Grouping")
          this.setSessionStore();
        });
    });
    return promise;

  }



  GetClientSaleOrderGroupingByContractId() {
    const promise = new Promise((resolve, reject) => {
      this.clientContractService.GetClientSaleOrderGroupingByContractId(this.coreObject.ContractId)
        .subscribe((result) => {
          const apiResult: apiResult = result;
          var ClientSO: ClientSaleOrderGrouping[] = [];
          ClientSO = apiResult.Result as any;
          console.log('clientso', ClientSO);

          ClientSO.length > 0 && (this.LstGroupingItems = ClientSO[0].ListOfGroupingFieldList);
          console.log('this.LstGroupingItems', this.LstGroupingItems);
          this.LstGroupingItems.length > 0 ? this.SOGroupId = ClientSO[0].Id : this.SOGroupId = 0;
          this.LstGroupingItems.length > 0 ? this.groupingText = "Advanced Grouping" : this.groupingText = "Go to Basic Option";
          this.LstGroupingItems.length > 0 ? this.isProductWiseGrouping = false : this.isSaleOrderWiseGrouping = true;
          //  this.LstGroupingItems.forEach(element => {
          //    element['Id'] =  this.LstFieldSet.find(a=>a.FieldName == element.FieldName).Id
          //  });
          this.productwiseList.length > 0 ? this.groupingText = "Go to Basic Option" : this.groupingText = "Advanced Grouping";
          this.productwiseList.length > 0 ? this.isProductWiseGrouping = true : this.isSaleOrderWiseGrouping = false;

          console.log(' this.productwiseList.length', this.productwiseList);
          console.log(' this.LstGroupingItems.length', this.LstGroupingItems);

          if (this.productwiseList.length == 0 && this.LstGroupingItems.length == 0) {

            this.groupingText = "Advanced Grouping";
            this.isProductWiseGrouping = false;
          }
          else if (this.LstGroupingItems.length > 0 && (this.productwiseList.length > 0 || this.productwiseList.length == 0)) {
            this.groupingText = "Advanced Grouping";
            this.isProductWiseGrouping = false;

          }
          else if (this.LstGroupingItems.length == 0 && this.productwiseList.length > 0) {

            this.groupingText = "Go to Basic Option";
            this.isProductWiseGrouping = true;
          }

          resolve(true);
          this.setSessionStore();
        })
    });
    return promise;

  }
  onChangeProductwiseGroup() {
    this.setSessionStore();
  }
  onChangeSaleOrderGrouping() {
    this.setSessionStore();
  }
  setSessionStore() {
    this.LstApplicableProducts = this.GlobalProductList;
    // if (this.groupingText == 'Go to Basic Option') {
    //   this.isProductWiseGrouping = true;
    //   this.isSaleOrderWiseGrouping = false;
    var _LstProductWiseInvoiceGroup = [];
    (this.productwiseList.length > 0) && this.productwiseList.forEach(element => {
      console.log('lement', element);
      if (element.ApplicableProductIds != null && element.ApplicableProductIds.length == 0 && element.Id == 0) {

      }
      else if (element.ApplicableProductIds != null) {
        var productwiseGroup = new ProductWiseInvoiceGroup();
        productwiseGroup.Code = element.Code;
        productwiseGroup.EffectivePeriodId = 1;
        productwiseGroup.CompanyId = this.coreObject.CompanyId;
        productwiseGroup.ClientId = this.coreObject.ClientId;
        productwiseGroup.ClientContractId = this.coreObject.ContractId;
        productwiseGroup.TeamId = 0;
        productwiseGroup.EmployeeId = 0;
        productwiseGroup.ApplicableProductIds = element.ApplicableProductIds;
        productwiseGroup.Status = 1;
        productwiseGroup.Id = element.Id;
        _LstProductWiseInvoiceGroup.push(productwiseGroup);
      }
    });

    this.removedProductWiseItems.forEach(element => {
      if (element.Id > 0) {
        var rmproductwiseGroup = new ProductWiseInvoiceGroup();
        rmproductwiseGroup.Code = element.Code;
        rmproductwiseGroup.EffectivePeriodId = 1;
        rmproductwiseGroup.CompanyId = this.coreObject.CompanyId;
        rmproductwiseGroup.ClientId = this.coreObject.ClientId;
        rmproductwiseGroup.ClientContractId = this.coreObject.ContractId;
        rmproductwiseGroup.TeamId = 0;
        rmproductwiseGroup.EmployeeId = 0;
        rmproductwiseGroup.ApplicableProductIds = [];
        rmproductwiseGroup.Status = 1;
        rmproductwiseGroup.Id = element.Id;
        _LstProductWiseInvoiceGroup.push(rmproductwiseGroup);
      }
    });
    // this.LstApplicableProducts = [];
    // this.LstApplicableProducts = this.GlobalProductList;
    this.productwiseList != null && this.productwiseList.length > 0 && this.productwiseList.forEach(e => {
      e.ApplicableProductIds != null && e.ApplicableProductIds.length > 0 && (this.LstApplicableProducts = this.LstApplicableProducts.filter(i => !e.ApplicableProductIds.includes(i.Id)));
    });
    console.log('_LstProductWiseInvoiceGroup', _LstProductWiseInvoiceGroup);
    this.sessionService.setSesstionStorage("invoice_productwise_data", JSON.stringify(_LstProductWiseInvoiceGroup));
    this.sessionService.setSesstionStorage("GroupingText", this.groupingText);

    // } else {

    if (this.LstGroupingItems.length > 0) {
      // this.isProductWiseGrouping = false
      // this.isSaleOrderWiseGrouping = true;

      for (var j = 0; j < this.LstGroupingItems.length; j++) {
        var currentPosition = 1;
        var element = this.LstGroupingItems[j];
        for (var item of element) {
          item.SortingOrder = currentPosition;
          currentPosition++;
        }
      }

      // this.LstGroupingItems.forEach(e => {
      //   e.map((i) => { // for duplication check or empty item

      //     if (i.FieldName == null) {
      //       this.alertService.showWarning("empty");
      //     }

      //   });
      // });
      this.LstGroupingItems = this.LstGroupingItems.filter(i => i.length > 0);
      console.log('this.LstGroupingItems', this.LstGroupingItems);

      //   var i = [];
      // this.LstGroupingItems[0].forEach(element => {
      //   i = [];
      //   i.push(element.FieldValues);
      //   element.FieldValues != [] &&  element.FieldValues != null && (element.FieldValues.push(element.FieldValues)  as any);
      //   // const usingSplit = string.split('-');
      //   console.log('element', element.FieldValues);

      // });
      // var clientSaleOrderGrouping = new ClientSaleOrderGrouping();
      // clientSaleOrderGrouping.ClientId = this.coreObject.ClientId;
      // clientSaleOrderGrouping.Id = this.SOGroupId;
      // clientSaleOrderGrouping.ClientContractId = this.coreObject.ContractId;
      // clientSaleOrderGrouping.CompanyId = this.coreObject.CompanyId;
      // clientSaleOrderGrouping.ProcessCategory = 1;
      // clientSaleOrderGrouping.ContainerType = 1;
      // clientSaleOrderGrouping.MaxBillAmountPerSaleOrder = 0;
      // clientSaleOrderGrouping.ListOfGroupingFieldList = (this.LstGroupingItems);
      // console.log('clientSaleOrderGrouping', clientSaleOrderGrouping); 
      this.sessionService.setSesstionStorage("invoice_saleOrder_data", JSON.stringify({ LstGroupingItems: this.LstGroupingItems, Id: this.SOGroupId }));
      this.sessionService.setSesstionStorage("GroupingText", this.groupingText);
      // this.clientContractService.Put_UpsertClientSaleOrderGrouping(clientSaleOrderGrouping)
      //   .subscribe((result) => {
      //     const apiResult : apiResult = result;
      //     if(apiResult.Status){
      //       this.loadingScreenService.stopLoading();
      //       this.alertService.showSuccess(apiResult.Message);
      //     }else {
      //       this.loadingScreenService.stopLoading();
      //       this.alertService.showWarning(apiResult.Message);
      //     }
      //   })

      // }
    }
  }

  addNewProductGroup() {
    console.log('this.productwiseList', this.productwiseList);
    console.log(' this.coreObject', this.coreObject);
    var count = Number(this.productwiseList.length + 1)
    this.productwiseList.push({
      Id: 0,
      Code: `${this.coreObject.ContractCode}${count}`,
      ApplicableProductIds: null
    });
  }

  addNewField(indexValue) {
    console.log('indec', indexValue);;
    console.log('list', this.LstGroupingItems);
    var index = this.LstGroupingItems.findIndex(x => _.isEqual(x, indexValue));
    let isMissed: boolean = false;
    console.log('this.LstGroupingItems[index]', this.LstGroupingItems[index]);

    this.LstGroupingItems[index].forEach(i => {
      // e.map((i) => {
      if (i.FieldName == null) {
        isMissed = true;
        this.alertService.showInfo("You missed a bit. Please fill in the missing fields and continue");
        return
      }
      // });
    });
    if (!isMissed) {
      var index = this.LstGroupingItems.findIndex(x => _.isEqual(x, indexValue));
      console.log(this.LstGroupingItems[index].length);
      console.log(this.LstFieldSet.length);
      if (this.LstGroupingItems[index].length < this.LstFieldSet.length) {
        this.LstGroupingItems[index].push({
          "Id": UUID.UUID(),
          "FieldId": null,
          "FieldName": null,
          "FieldType": 0,
          "Operator": 0,
          "FieldValues": [
          ],
          "SortingOrder": Number(this.LstGroupingItems[index].length + 1),
        });
      }
    }

  }

  addNewGroup() {
    let isMissed: boolean = false;
    this.LstGroupingItems.forEach(e => {
      e.map((i) => {
        console.log(i);

        if (i.FieldName == null) {
          isMissed = true;
          this.alertService.showInfo("You missed a bit. Please fill in the missing fields and continue");
          return
        }
      });
    });
    if (!isMissed) {
      const createIndex = [];
      createIndex.push([{
        "Id": UUID.UUID(),
        "FieldId": null,
        "FieldName": null,
        "FieldType": 0,
        "Operator": 0,
        "FieldValues": [
        ],
        "SortingOrder": 0
      }]);

      this.LstGroupingItems = this.LstGroupingItems.concat(createIndex)
      console.log('test', this.LstGroupingItems);
    }
  }

  selectGrouptItems() {
    // if(  this.productwiseList.length > 0){
    //   this.alertService.showWarning("You do not have access to create advance grouping!");
    //   return;
    // }
    if (this.groupingText == 'Advanced Grouping' && this.LstGroupingItems != null && this.LstGroupingItems.length > 0) {
      this.alertService.showWarning("The action was blocked. Please note! if you are wanting to create for new group, you must delete the previous records.");
      return;
    } else if (this.groupingText == 'Go to Basic Option' && this.productwiseList != null && this.productwiseList.length > 0) {
      this.alertService.showWarning("The action was blocked. Please note! if you are wanting to create for new group, you must delete the previous records.");
      return;
    }
    this.setSessionStore();
    this.groupingText == 'Advanced Grouping' ? (this.isProductWiseGrouping = true, this.isSaleOrderWiseGrouping = false, this.groupingText = "Go to Basic Option") : (this.isProductWiseGrouping = false, this.isSaleOrderWiseGrouping = true, this.groupingText = "Advanced Grouping")

  }


  onChangeFieldSet(event, item, parent) {
    console.log('parent', parent);
    console.log('event', event);
    console.log('item', item);

    // if (parent != null && parent.length > 0 && parent.filter(x => x.FieldName != null  && x.FieldName == item.FieldName).length > 0) {
    //   // item.FieldName = null;
    //   this.alertService.showWarning(`${item.FieldName} already exists.`);
    //   return;
    // }

    if (parent.filter(x => x.Id != item.Id && x.FieldName == item.FieldName).length > 0) {
      this.alertService.showInfo(`${item.FieldName} already exists.`);
      item.FieldName = null;
      item.FieldId = null;
      return;
    }

    item.FieldId = event.Id;
    item.FieldName = event.Field;
    item.FieldType = event.FieldType;
    this.getType(item);
    this.setSessionStore();
  }

  remove_item(child, parent, i) {
    child.FieldName == null ? (parent.splice(i, 1), this.setSessionStore()) : (
      this.alertService.confirmSwal("Are you sure you want to delete? ", "This item will be deleted immediately. You can't undo this file.", "Ok!").then((res) => {
        parent.splice(i, 1);
        this.setSessionStore();
      }).catch(cancel => {

      }));

  }
  remove_productitem(item, index) {
    this.alertService.confirmSwal("Are you sure you want to delete? ", "This item will be deleted immediately. You can't undo this file.", "Ok!").then((res) => {
      console.log('item', item);
      console.log('index', index);

      item.Id != 0 && this.removedProductWiseItems.push(item);
      this.productwiseList.splice(index, 1);
      console.log('this.removedProductWiseItems', this.removedProductWiseItems);
      console.log('this.productwiseList', this.productwiseList);

      this.setSessionStore();
    }).catch(cancel => {

    });
  }

  onChangeValue(i, eve) {
    this.setSessionStore();
  }

  getType(item) {
    return item.FieldType == 1 ? 'text' : 'number';
  }

  onChangeOperator(e, item) {
    item.FieldValues = null;
    if (e.id == 0) {
      this.IsNoneOperator = true;
    } else { this.IsNoneOperator = false; }
    this.setSessionStore();

  }
  onChangeProductItem(eve) {

    this.LstApplicableProducts = [];
    this.LstApplicableProducts = this.GlobalProductList;
    this.productwiseList.forEach(e => {
      e.ApplicableProductIds != null && e.ApplicableProductIds.length > 0 ? this.LstApplicableProducts = this.LstApplicableProducts.filter(i => !e.ApplicableProductIds.includes(i.Id)) : null;
    });
    this.setSessionStore();
  }
  saveTEMP() {
    this.loadingScreenService.startLoading();
    console.log('test', JSON.stringify(this.LstGroupingItems));
    if (this.groupingText == 'Go to Basic Option') {
      var _LstProductWiseInvoiceGroup = [];
      this.productwiseList.forEach(element => {
        if (element.ApplicableProductIds != null) {
          var productwiseGroup = new ProductWiseInvoiceGroup();
          productwiseGroup.Code = element.Code;
          productwiseGroup.EffectivePeriodId = 1;
          productwiseGroup.CompanyId = this.coreObject.CompanyId;
          productwiseGroup.ClientId = this.coreObject.ClientId;
          productwiseGroup.ClientContractId = this.coreObject.ContractId;
          productwiseGroup.TeamId = 0;
          productwiseGroup.EmployeeId = 0;
          productwiseGroup.ApplicableProductIds = element.ApplicableProductIds;
          productwiseGroup.Status = 1;
          productwiseGroup.Id = element.Id;
          _LstProductWiseInvoiceGroup.push(productwiseGroup);
        }
      });
      console.log('_LstProductWiseInvoiceGroup', _LstProductWiseInvoiceGroup);

      this.clientContractService.Put_Put_UpsertProductWiseInvoiceGroup(_LstProductWiseInvoiceGroup)
        .subscribe((result) => {
          const apiResult: apiResult = result;
          if (apiResult.Status) {
            this.loadingScreenService.stopLoading();
            this.alertService.showSuccess(apiResult.Message);
          } else {
            this.loadingScreenService.stopLoading();
            this.alertService.showWarning(apiResult.Message);
          }
        })

    } else {

      console.log('list', this.LstGroupingItems);

      this.LstGroupingItems[0].forEach(element => {
        var i = [];
        i.push(element.FieldValues);
        console.log('ii', i);

        element.FieldValues != [] && element.FieldValues != null && (element.FieldValues = i);
        // const usingSplit = string.split('-');
      });

      var clientSaleOrderGrouping = new ClientSaleOrderGrouping();
      clientSaleOrderGrouping.ClientId = this.coreObject.ClientId;
      clientSaleOrderGrouping.Id = this.SOGroupId;
      clientSaleOrderGrouping.ClientContractId = this.coreObject.ContractId;;
      clientSaleOrderGrouping.CompanyId = this.coreObject.CompanyId;;
      clientSaleOrderGrouping.ProcessCategory = 1;
      clientSaleOrderGrouping.ContainerType = 1;
      clientSaleOrderGrouping.MaxBillAmountPerSaleOrder = 0;
      clientSaleOrderGrouping.ListOfGroupingFieldList = (this.LstGroupingItems);

      console.log('clientSaleOrderGrouping', clientSaleOrderGrouping);

      this.clientContractService.Put_UpsertClientSaleOrderGrouping(clientSaleOrderGrouping)
        .subscribe((result) => {
          const apiResult: apiResult = result;
          if (apiResult.Status) {
            this.loadingScreenService.stopLoading();
            this.alertService.showSuccess(apiResult.Message);
          } else {
            this.loadingScreenService.stopLoading();
            this.alertService.showWarning(apiResult.Message);
          }
        })


    }

  }

  onDrop(event: CdkDragDrop<string[]>, parent) {
    moveItemInArray(parent, event.previousIndex, event.currentIndex);

  }

  cancel(): void {
    // this.nzMessageService.info('click cancel');
  }



}
