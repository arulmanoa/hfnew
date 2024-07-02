import { Component, OnInit, EventEmitter, Input, Output, ViewChild, TemplateRef, ElementRef } from '@angular/core';
import { EmployeeDetails, EmployeeMenuData } from 'src/app/_services/model/Employee/EmployeeDetails';

import { AlertService, CommonService, EmployeeService, ESSService, SearchService,SessionStorage } from 'src/app/_services/service';
import * as _ from 'lodash';
import { NgxSpinnerService } from "ngx-spinner";

import { DataSourceType } from 'src/app/views/personalised-display/enums';
import { DataSource } from 'src/app/views/personalised-display/models';
import { PageLayout, ColumnDefinition, SearchElement } from 'src/app/views/personalised-display/models';
import Swal from 'sweetalert2';
import { PagelayoutService, ExcelService } from 'src/app/_services/service';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { PaygroupService } from 'src/app/_services/service/paygroup.service';

import { UIMode } from 'src/app/_services/model';
import { I } from '@angular/cdk/keycodes';
import { _searchIdObject } from 'src/app/_services/model/Common/SearchIdObject';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';



@Component({
  selector: 'app-salary-details',
  templateUrl: './salary-details.component.html',
  styleUrls: ['./salary-details.component.css']
})
export class SalaryDetailsComponent implements OnInit {
  isESSLogin: boolean = false;
  _rateSetReault: any = [];
  _breakUpDetails: any = [];
  _dropDownList: any = [];
  newComponentValue: any
  _sortedRateSetReault: any = []
  cardIndex: number = 0
  editEnabledForNewJoinee: any
  newProductId: any
  payGroupId: number
  payGroupProductlist: any = [];
  copyRateSetResult: any = []
  copyPayGroupProductlist: any = [];
  listOfBreakupDetails: any = [];
  employeeRateSetId: number = 0;
  BusinessType: any = 0;
  _loginSessionDetails:any;

  //need to change this ariable as false after testing complete
  _isNewJoinee: boolean = false
  @Input() empID: any;
  @Input() salaryDetails: any;
  @Output() salaryDetailsChangeHandler = new EventEmitter();
  constructor(
    private employeeService: EmployeeService,
    private Customloadingspinner: NgxSpinnerService,
    private alertService: AlertService,
    private pageLayoutService: PagelayoutService,
    private sessionService: SessionStorage,
    public paygroupService: PaygroupService,
    
    private loadingScreenService: LoadingScreenService,

  ) { }

  ngOnInit() {
  
    let _empid = this.empID
    this._loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses)); // Get the whole matched session element set as a clean json(array) via an session object
    this.BusinessType = this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping != null ? this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this._loginSessionDetails.Company.Id).BusinessType : 0;
   
    
    if (this.salaryDetails && this.salaryDetails.length>0) {
        this._rateSetReault = this.salaryDetails
        this.payGroupId = this.salaryDetails[0].PayGroupId
        this.copyRateSetResult = JSON.parse(JSON.stringify(this._rateSetReault))
        if (this._rateSetReault && this._rateSetReault.length > 0) {
          this._sortedRateSetReault = _.sortBy(this._rateSetReault, ['EffectivePeriodId']).reverse();

          this._rateSetReault = this.ratesetResultWithNonZeroItems(this._sortedRateSetReault);

          this.getNewJoineeDetails(_empid).then((obj) => {
            if(this.editEnabledForNewJoinee==true)
            this.getPayGroupPrdoctDetails()
          });
          

          for (var i in this._rateSetReault) {

            this._rateSetReault[i].card = false;
          }
          this._rateSetReault[0].card = true;
          if (this._rateSetReault && this._rateSetReault.length > 0) {
            let breakUpItem = this._rateSetReault[0]
            if (this._rateSetReault[0].IsLatest == true) {
              this.employeeRateSetId = this._rateSetReault[0].Id
            }
            this.cardIndex = 0

            this.clickOnCard(breakUpItem, this.cardIndex)
          }
        }
      }
  
      this.employeeService.getActiveTab(false);

  }
  ratesetResultWithNonZeroItems(rateSetReault) {
    rateSetReault.forEach(element => {
      if (element) {
        element['SortedLstRateSetProducts'] = [];
        element['SortedLstRateSetProductswithZero'] = []
        _.each(element.RatesetProducts, function (value, key) {
          if (value.value > 0) {
            element['SortedLstRateSetProducts'].push(value)
          }
          else {
            element['SortedLstRateSetProductswithZero'].push(value)
          }
          console.log("key:", key, "value:", value)
        })
        console.log("element", element)
      }
    });
    return rateSetReault
  }
  EmitHandler() {
    this.subscribeEmitter();
    
  }
  ngOnDestroy() {
    this.subscribeEmitter();


  }

  subscribeEmitter() {
   
   
      this.salaryDetailsChangeHandler.emit(this._rateSetReault);
    
  }
  clickOnCard(item, index) {
    this.cardIndex = index
    if (item) {
      this._dropDownList = item.SortedLstRateSetProductswithZero;
      this._breakUpDetails = item.SortedLstRateSetProducts;
      for (let item of this._breakUpDetails) {
        item['isSelected'] = false
      }
    }
    for (var i in this._rateSetReault) {
      this._rateSetReault[i].card = false;
    }
    item.card = true;
  }

  getNewJoineeDetails(EmployeeId: any) {
    const promise = new Promise((resolve, reject) => {
      
    this.loadingScreenService.startLoading();
     // this.Customloadingspinner.show();


      var _newJoineeDetails = null;

      let datasource: DataSource = {
        Name: "GetEmployeeNewJoineeDetails",
        Type: DataSourceType.SP,
        IsCoreEntity: false
      }

      let searctElements: SearchElement[] = [
        {
          FieldName: "@EmployeeId",
          Value: EmployeeId //15465
        }
      ]
      this.pageLayoutService.getDataset(datasource, searctElements).subscribe((result) => {
        this.loadingScreenService.stopLoading();
       // this.Customloadingspinner.hide();
        if (result.Status && result.dynamicObject != null && result.dynamicObject != '') {
          let apiResult = JSON.parse(result.dynamicObject);
          if (apiResult && apiResult.length > 0) {
            let status= apiResult[0].IsNewJoinee
            if (status==1){
              this.editEnabledForNewJoinee =true
            }
            else{
              this.editEnabledForNewJoinee =false
            }
              resolve(true)
          }
        }

      }, error => {
        this.loadingScreenService.stopLoading();
       // this.Customloadingspinner.hide();
        this.alertService.showWarning("Error Occured while Fetching Employee Data");
        resolve(false);

      })

    })
    return promise;


  }
  isEdit() {
    this._isNewJoinee = true
  }

  getPayGroupPrdoctDetails() {
    this.loadingScreenService.stopLoading();
    //this.Customloadingspinner.show();
    let productGroupDropdownList = []
    let req_param_uri = `${this.payGroupId}`;
    this.paygroupService.editPaygroupproduct(req_param_uri).subscribe((data: any) => {
      this.loadingScreenService.stopLoading();
      //this.Customloadingspinner.hide();

      let apiResult = data;
      if (apiResult && apiResult.Status && apiResult.dynamicObject && apiResult.dynamicObject.LstPayGroupProduct && apiResult.dynamicObject.LstPayGroupProduct.length > 0) {
        let copyPayGroupProductlist = JSON.parse(JSON.stringify(apiResult.dynamicObject.LstPayGroupProduct))
        this.payGroupProductlist = apiResult.dynamicObject.LstPayGroupProduct
        this.listOfBreakupDetails = this.copyRateSetResult[0].RatesetProducts
        const filterByReference = (copyPayGroupProductlist, listOfBreakupDetails) => {
          let res = [];

          res = copyPayGroupProductlist.filter(el => {
            let existingProduct = listOfBreakupDetails.find(element => {
              return element.ProductId === el.ProductId;
            });
            if (existingProduct == null || existingProduct == undefined) {
              productGroupDropdownList.push({
                DisplayName: el.DisplayName,
                DisplayOrder: el.DisplayOrder,
                EmployeeId: this.empID,
                EmployeeRatesetId: this.employeeRateSetId,
                FirstPayrollPeriodId: 0,
                Id: 0,
                IsDisplayRequired: true,
                IsOveridable: true,
                ProductCode: el.product ? el.product.Code : "",
                ProductId: el.ProductId,
                ProductTypeCode: el.product.ProductType ? el.product.ProductType.Code : "",
                ProductTypeId: el.product ? el.product.ProductTypeId : 0,
                value: 0
              })

              return true;
            }
            else return false;

          });
          this._rateSetReault.forEach(element => {
            if (element) {
              _.each(productGroupDropdownList, function (value, key) {
                element.SortedLstRateSetProductswithZero.push(value)
              });
            }


            return true
          });

          return res;
        }
        filterByReference(copyPayGroupProductlist, this.listOfBreakupDetails);
      }

    })
  }
  ClickOnSelectAll(event: any) {
    console.log('event ', event)

    this._breakUpDetails.forEach(e => {
      event == true ? e.isSelected = true : e.isSelected = false
    });

  }
  ClickOnSelect(obj, isSelectd) {
    console.log('Object ', obj)
  }
  deleteAsync(deleteList, index) {
    if (this.cardIndex > -1 && this._rateSetReault && this._rateSetReault.length > 0) {
      deleteList.forEach(e => {
        if (e.isSelected == true) {
          let updateItem = deleteList.find(i => i.ProductCode == e.ProductCode);
          let index = this._rateSetReault[this.cardIndex].RatesetProducts.indexOf(updateItem);
          let productGroupIndex = this.listOfBreakupDetails.find(i => i.ProductId == updateItem.ProductId)
          if (productGroupIndex && index > -1) {
            this._rateSetReault[this.cardIndex].RatesetProducts[index].value = 0
            this._rateSetReault[this.cardIndex].RatesetProducts[index]['Modetype'] = UIMode.Edit
            this._rateSetReault[this.cardIndex]['Modetype'] = UIMode.Edit

            
          }
          else if ( (productGroupIndex==null || productGroupIndex== undefined) && index > -1) {

            
            this._rateSetReault[this.cardIndex].RatesetProducts.find(i => i.ProductId == updateItem.ProductId).value = 0
            this._rateSetReault[this.cardIndex].RatesetProducts.find(i => i.ProductId == updateItem.ProductId)['Modetype'] = UIMode.None
            //this._rateSetReault[this.cardIndex].RatesetProducts.splice(index, 1);
            this._rateSetReault[this.cardIndex]['Modetype'] = UIMode.Edit
          }
        }
      });
      this._rateSetReault = this.ratesetResultWithNonZeroItems(this._rateSetReault);
      this._dropDownList = this._rateSetReault[this.cardIndex].SortedLstRateSetProductswithZero
      this._breakUpDetails = this._rateSetReault[this.cardIndex].SortedLstRateSetProducts

      deleteList.forEach(e => {
        e.isSelected = false
      });
      this.alertService.showSuccess("Your components are deleted successfully!")
    }



  }

  clickOnAddToList() {
    if (this.newProductId && this.newComponentValue) {

      if (this.cardIndex > -1 && this._rateSetReault && this._rateSetReault.length > 0) {

        let productGroupObj = this.listOfBreakupDetails.find(i => i.ProductId == this.newProductId)
        if (productGroupObj) {

          this._rateSetReault[this.cardIndex].RatesetProducts.find(i => i.ProductId == this.newProductId).value = this.newComponentValue;
          this._rateSetReault[this.cardIndex].RatesetProducts.find(i => i.ProductId == this.newProductId).isSelected = false;
          this._rateSetReault[this.cardIndex].RatesetProducts.find(i => i.ProductId == this.newProductId)['Modetype'] = UIMode.Edit;
          this._rateSetReault[this.cardIndex]['Modetype'] = UIMode.Edit;
        }
        else {
          let productGroupIndex = this.payGroupProductlist.find(i => i.ProductId == this.newProductId)
        let  isexist=this._rateSetReault[this.cardIndex].RatesetProducts.find(i => i.ProductId == this.newProductId)
        if(isexist==null||isexist==undefined)
          {
            let breakUpObj = {
              DisplayName: productGroupIndex.DisplayName,
              DisplayOrder: productGroupIndex.DisplayOrder,
              EmployeeId: this.empID,
              EmployeeRatesetId: this.employeeRateSetId,
              FirstPayrollPeriodId: 0,
              Id: 0,
              IsDisplayRequired: true,
              IsOveridable: true,
              ProductCode: productGroupIndex.product ? productGroupIndex.product.Code : "",
              ProductId: productGroupIndex.ProductId,
              ProductTypeCode: productGroupIndex.product.ProductType ? productGroupIndex.product.ProductType.Code : "",
              ProductTypeId: productGroupIndex.product ? productGroupIndex.product.ProductTypeId : 0,
              value: this.newComponentValue,
              Modetype: UIMode.None
            }
            this._rateSetReault[this.cardIndex].RatesetProducts.push(breakUpObj)
          }
          this._rateSetReault[this.cardIndex].RatesetProducts.find(i => i.ProductId == this.newProductId).value = this.newComponentValue;
          this._rateSetReault[this.cardIndex].RatesetProducts.find(i => i.ProductId == this.newProductId).isSelected = false;
          this._rateSetReault[this.cardIndex].RatesetProducts.find(i => i.ProductId == this.newProductId)['Modetype'] = UIMode.None;
          this._rateSetReault[this.cardIndex]['Modetype'] = UIMode.Edit;
        }


        this._rateSetReault = this.ratesetResultWithNonZeroItems(this._rateSetReault);
        this._dropDownList = this._rateSetReault[this.cardIndex].SortedLstRateSetProductswithZero
        this._breakUpDetails = this._rateSetReault[this.cardIndex].SortedLstRateSetProducts
        this.newProductId = null
        this.newComponentValue = null
        this.alertService.showSuccess("Your component is added successfully!")

      }
      else {
        this.alertService.showWarning("Component failed to add");

      }
    }
    else {
      this.alertService.showWarning("Please fill the mandatory fields");
    }

  }
  deleteComponent(deleteList, index) {
    let count = 0
    if (deleteList && deleteList.length > 0) {
      deleteList.forEach(element => {
        if (element.isSelected) {
          count += 1
        }
      })
      if (count == 0) {
        this.alertService.showWarning("Please select at least one component ");
        return;
      }
    }
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: true,
    })
    swalWithBootstrapButtons.fire({
      title: 'Are you sure you want to delete?',
      text: "Once deleted, you cannot undo this action.",
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ok!',
      cancelButtonText: 'No, cancel!',
      allowOutsideClick: false,
      reverseButtons: true
    }).then((result) => {

      if (result.value) {

        if (deleteList) {
          this.deleteAsync(deleteList, index);
        }
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        swalWithBootstrapButtons.fire(
          'Cancelled',
          'Your request has been cancelled',
          'error'
        )
      }
    })
  }
  inLineEditFn(breakupObj) {
    let productGroupIndex = this.listOfBreakupDetails.find(i => i.ProductId == breakupObj.ProductId)
    if (this._rateSetReault && this._rateSetReault.length > 0) {
      if (productGroupIndex == null || productGroupIndex == undefined) {
        this._rateSetReault[this.cardIndex].RatesetProducts.find(i => i.ProductId == productGroupIndex.ProductId)['Modetype'] = UIMode.None
      }
      else {
        this._rateSetReault[this.cardIndex].RatesetProducts.find(i => i.ProductId == productGroupIndex.ProductId)['Modetype'] = UIMode.Edit

      }
      this._rateSetReault[this.cardIndex]['Modetype'] = UIMode.Edit;
      console.log(breakupObj)
    }
  }

}