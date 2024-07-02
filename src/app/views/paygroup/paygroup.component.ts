import { Component, OnInit, Input } from '@angular/core';
import { HeaderService } from 'src/app/_services/service/header.service';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { ProductModalComponent } from 'src/app/shared/modals/product-modal/product-modal.component';
import { ProductDetailsComponent } from 'src/app/shared/modals/product-details/product-details.component';
import { SalaryBreakUpType } from 'src/app/_services/model/PayGroup/PayGroup';
import {
  AngularGridInstance,
  Column,
  Editors,
  EditorArgs,
  EditorValidator,
  FieldType,
  Filters,
  Formatters,
  Formatter,
  GridOption,
  OnEventArgs,
  OperatorType,
  Sorters,
} from 'angular-slickgrid';
import Swal from "sweetalert2";
import { ActivatedRoute, Router } from '@angular/router';
import { ScaleService } from 'src/app/_services/service/scale.service';
import { Paygroup, _Paygroup, PayGroupProduct } from 'src/app/_services/model/paygroupproduct';
import { PaygroupModal, _PaygroupModal } from 'src/app/_services/model/paygroup-product-modal'
import { UUID } from 'angular2-uuid';
import { DatePipe } from '@angular/common';
import { AlertService } from '../../_services/service/alert.service';
import * as _ from 'lodash';
import { apiResponse } from '../../_services/model/apiResponse';
import { PaygroupService } from 'src/app/_services/service/paygroup.service';
import { enumHelper } from 'src/app/shared/directives/_enumhelper';
import { UIMode } from 'src/app/_services/model/Common/BaseModel';
import { Product, _Product, ProductApplicability, ProductRuleCategory } from 'src/app/_services/model/Product';
import { ProductService } from '../../_services/service/product.service';
import { RowDataService } from '../personalised-display/row-data.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { RulesService, SessionStorage } from 'src/app/_services/service';
import { ClientContactService } from '../../_services/service/clientcontact.service';
import { LoginResponses } from 'src/app/_services/model';
import { SessionKeys } from 'src/app/_services/configs/app.config';
// const customEnableButtonFormatter: Formatter = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid: any) => {
//   return `<span style="margin-left: 5px">
//       <button class="btn btn-xs btn-default">
//         <i class="fa ${value ? 'fa-check-circle' : 'fa-circle-thin'} fa-lg" style="color: ${value ? 'black' : 'lavender'}"></i>
//       </button>
//     </span>`;
// };


// create a custom Formatter with the Formatter type
const myCustomCheckboxFormatter: Formatter = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) =>
  value ? `<i class="fa fa-check" aria-hidden="true"></i>` : '<i class="fa fa-square-o" aria-hidden="true"></i>';

@Component({
  selector: 'app-paygroup',
  templateUrl: './paygroup.component.html',
  styleUrls: ['./paygroup.component.css']
})
export class PaygroupComponent implements OnInit {

  header = "Add New paygroup";

  @Input() Id: number;
  paygroupForm: FormGroup;

  // slick grid 
  columnDefinitions: Column[] = [];
  gridOptions: GridOption = {};
  dataset = [];
  angularGrid: AngularGridInstance;
  selectedTitles: any[];
  selectedTitle: any;
  gridObj1: any;
  isAutoEdit = true;

  ctcruleslist: any = [];
  payrollruleslist: any = [];

  Paygroup: Paygroup = {} as any;

  paygroupModal: Paygroup;

  product: Product = {} as any;

  productRuleMapping: any = [];
  ctcproductrulecategory: any = [];
  payrollproductrulecategory: any = [];
  ctcrule: any = [];

  SalaryTypes: any = [];

  editPaygroupObjects: any = [];

  productlist: any = [];
  ruleid: any = [];

  data = [];
  clientList = [];

  _loginSessionDetails: LoginResponses;
  UserId: any;
  RoleId: any;
  BusinessType: any;
  CompanyId: any;

  // product:any = [];
  deletedItems: any[] = [];

  lstRuleSet: any[] = [];
  submitted = false;

  constructor(
    private headerService: HeaderService,
    private formBuilder: FormBuilder,
    public modalService: NgbModal,
    private router: Router,
    private route: ActivatedRoute,
    private utilsHelper: enumHelper,
    private datePipe: DatePipe,
    private alertService: AlertService,
    public paygroupService: PaygroupService,
    private ProductService: ProductService,
    private rowDataService: RowDataService,
    private loadingScreenService: NgxSpinnerService,
    private sessionService: SessionStorage,
    private ClientContactService: ClientContactService, 
    private ruleservice: RulesService
  ) {
    this.createForm();
  }



  get f() { return this.paygroupForm.controls; } // reactive forms validation 

  createForm() {
    const clientId = this.BusinessType != 3 ? this.sessionService.getSessionStorage("default_SME_ClientId") : 0;
    this.paygroupForm = this.formBuilder.group({
      Id: [0],
      ClientId: [clientId, Validators.required],
      Code: ["", [Validators.required, Validators.maxLength(20)]],
      Name: ["", Validators.required],
      SalaryBreakUpType: [null, Validators.required],
      RuleSetId:[0],
      Description: [""],
      // glCode: [null]
      // Status:[true],
    })


    this.paygroupModal = _Paygroup;

  }




  ngOnInit() {
    this.spinnerStarOver();
    this.headerService.setTitle('paygroup');

    this.SalaryTypes = this.utilsHelper.transform(SalaryBreakUpType);

    this._loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses)); // Get the whole matched session element set as a clean json(array) via an session object
    this.UserId = this._loginSessionDetails.UserSession.UserId;
    this.RoleId = this._loginSessionDetails.UIRoles[0].Role.Id;
    this.BusinessType = this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping != null ? this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this._loginSessionDetails.Company.Id).BusinessType : 0;
    this.CompanyId = this._loginSessionDetails.Company.Id;
    this.loadAllRuleSet();
    if (this.BusinessType == 3) {
      this.loadClientList();
    }


    // this.route.queryParams.subscribe(params => {
    //   console.log(params);
    //   if (JSON.stringify(params) != JSON.stringify({})) {

    //     var encodedIdx = atob(params["Idx"]);
    //     this.Id = Number(encodedIdx) == undefined ? 0 : Number(encodedIdx);

    //   }



    // });

    this.route.data.subscribe(data => {

      this.spinnerEnd();
      if (data.DataInterface.RowData) {
        console.log(data.DataInterface.RowData.Id);
        this.Id = data.DataInterface.RowData.Id;
        this.editpaygroupDetails();
      }
      else {
        this.paygroupModal.Id = 0;
        _PaygroupModal.OldDetails = this.paygroupModal;
      }
      this.rowDataService.dataInterface = {
        SearchElementValuesList: [],
        RowData: null
      }

    });

    // if(this.Id == 0 || this.Id == undefined){
    //   this.paygroupModal.Id = 0;
    // }
    // else{
    //   // this.editScaleDetails();



    //   let req_param_uri = `${this.Id}`;
    // this.paygroupService.editPaygroupproduct(req_param_uri).subscribe((data: any) => {
    //   let apiResponse: apiResponse = data;
    //   this.paygroupModal = (apiResponse.dynamicObject);
    //   console.log('response data',this.paygroupModal);

    //   this.header = "Edit PayGroup : " + this.paygroupModal.Code ;

    //   this.paygroupForm.patchValue(this.paygroupModal);
    //   this.paygroupForm.controls['Status'].setValue(this.paygroupModal.Status);
    //  this.data = this.paygroupModal.LstPayGroupProduct;
    // //  this.dataset = this.paygroupModal.LstPayGroupProduct;
    // //  this.dataset.forEach(element =>{
    // //   element.ctcrule = 'zzzzz'
    // //  }); 


    //   this.paygroupService.getProduct().subscribe(response => {
    //     this.productlist = response.dynamicObject;

    //   console.log('productlist',this.productlist)

    // this.data.forEach(element =>{

    //   if(element.ProductRuleMappingId > 0){

    //   this.product = this.productlist.filter(function(products) {
    //     return products.Id == element.ProductId;
    //   });

    //   this.ruleid = this.product[0].LstProductRuleMapping
    //   console.log('rule',this.ruleid);
    //  this.ruleid.forEach(element => {


    //       if(element.ProductRuleCategory == 1){
    //         this.ctcruleslist.push({ Id: element.Id, Name:element.Rule.Name});
    //        }
    //         if(element.ProductRuleCategory == 2){
    //         this.payrollruleslist.push({ Id: element.Id, Name:element.Rule.Name});
    //         }

    //     });




    //   }
    //   if(element.ProductRuleMappingId != 0 && this.ctcruleslist.find(a => a.Id == element.ProductRuleMappingId)){
    //   element.ctcrule = this.ctcruleslist.find(a=>a.Id == element.ProductRuleMappingId).Name;
    //   }
    //   if(element.PayrollProductRuleMappingId != 0 && this.payrollruleslist.find(a => a.Id == element.PayrollProductRuleMappingId)){
    //   element.payrollrule = this.payrollruleslist.find(a=>a.Id == element.PayrollProductRuleMappingId).Name;
    //   }

    //   });

    //   this.dataset = this.data;
    //   console.log('dataset',this.dataset);
    // });

    // });
    // }






    this.columnDefinitions = [

      // {
      //   id: '#', field: '', name: '', width: 40,
      //   behavior: 'selectAndMove',
      //   selectable: false, resizable: false,
      //   cssClass: 'cell-reorder dnd',
      //   excludeFromExport: true,
      //   excludeFromColumnPicker: true,
      //   excludeFromHeaderMenu: true,
      //   excludeFromGridMenu: true
      // },

      { id: 'DisplayName', name: 'Product Name', field: 'DisplayName', sortable: true, filterable: true },
      // { id: 'ctcrule', name: 'CTC Rule', field: 'ctcrule', sortable: true,type: FieldType.string},
      // { id: 'payrollrule', name: 'Payroll Rule', field: 'payrollrule', sortable: true},
      { id: 'rule', name: 'Rule', field: 'rule', sortable: true, type: FieldType.string },
      {
        id: 'IsOveridable', name: 'Is Overidable', field: 'IsOveridable', sortable: true, formatter: myCustomCheckboxFormatter, type: FieldType.boolean,
        filter: {
          collection: [{ value: '', label: '' }, { value: true, label: 'true' }, { value: false, label: 'false' }],
          model: Filters.singleSelect,
        },
        editor: { model: Editors.checkbox },
        onCellClick: (e, args) => {
          // console.log(args.dataContext)
        }
      },
      { id: 'CalculationOrder', name: 'Calculation Order', field: 'CalculationOrder', sortable: true, editor:{model:Editors.integer} },
      { id: 'DisplayOrder', name: 'Display Order', field: 'DisplayOrder', sortable: true, editor:{model:Editors.integer} },

      {
        id: 'edit',
        field: 'id',
        excludeFromHeaderMenu: true,
        formatter: Formatters.editIcon,
        minWidth: 30,
        maxWidth: 30,
        onCellClick: (e: Event, args: OnEventArgs) => {
          // console.log(args);

        }
      },
      {
        id: 'delete',
        field: 'id',
        excludeFromHeaderMenu: true,
        formatter: Formatters.deleteIcon,
        minWidth: 30,
        maxWidth: 30,
        onCellClick: (e: Event, args: OnEventArgs) => {
          // console.log(args);

        }
      },
    ];

    this.gridOptions = {
      enableAutoResize: true,       // true by default
      enableCellNavigation: true,
      datasetIdPropertyName: "id",
      editable: true,
      autoCommitEdit: false,
      autoResize: {
        containerId: 'demo-container',
        sidePadding: 15
      },
      asyncEditorLoading: false,
      autoEdit: this.isAutoEdit,
      enableColumnPicker: false,
      enableExcelCopyBuffer: true,
      enableRowMoveManager: false, //true
      enableFiltering: true,
      showHeaderRow: false,

      // rowMoveManager: {
      //   onBeforeMoveRows: (e, args) => this.onBeforeMoveRow(e, args),
      //   onMoveRows: (e, args) => this.onMoveRows(e, args),
      // },
    };
  }

  loadClientList() {
    this.ClientContactService.getUserMappedClientList(this.RoleId, this.UserId).subscribe((res) => {

      let apiResonse: apiResponse = res;
      
      this.clientList = apiResonse.dynamicObject;
      if (this.clientList && this.clientList.length) {
        this.clientList.unshift({Id: 0, Name: 'All'});
      }
      console.log('clientList', this.clientList);

    }),(err => {
      console.log('getUserMappedClientList API ERR', err);
    });
  }

  loadAllRuleSet() {
    this.ruleservice.getAllRulesets().subscribe((res) => {
      console.log('getAllRulesets', res);
      this.lstRuleSet = res;
    }),(err => {
      this.lstRuleSet = [];
      console.log('getAllRulesets API ERR', err);
    });
  }


  editpaygroupDetails() {
    // if(this.Id == 0 || this.Id == undefined){
    //   this.paygroupModal.Id = 0;
    // }
    // else{
    // this.editScaleDetails();

    this.spinnerStarOver();

    let req_param_uri = `${this.Id}`;
    this.paygroupService.editPaygroupproduct(req_param_uri).subscribe((data: any) => {
      let apiResponse: apiResponse = data;
      if (!apiResponse.Status && apiResponse.dynamicObject == null) {
        this.alertService.showWarning(apiResponse.Message);
        this.spinnerEnd();
        return;
      };
      _PaygroupModal.OldDetails = JSON.parse(JSON.stringify(apiResponse.dynamicObject));
      this.paygroupModal = JSON.parse(JSON.stringify(apiResponse.dynamicObject));
     // _PaygroupModal.OldDetails.RuleSetId = 0;
      console.log('response data', this.paygroupModal);

      this.header = "Edit Paygroup : " + this.paygroupModal.Code;

      this.paygroupForm.patchValue(this.paygroupModal);
      //      this.paygroupForm.controls['Status'].setValue(this.paygroupModal.Status);
      this.data = this.paygroupModal.LstPayGroupProduct;
      //  this.dataset = this.paygroupModal.LstPayGroupProduct;
      //  this.dataset.forEach(element =>{
      //   element.ctcrule = 'zzzzz'
      //  }); 


      this.paygroupService.getProduct().subscribe(response => {
        this.productlist = response.dynamicObject;

        console.log('productlist', this.productlist)

        this.data.forEach(element => {
          element.id = element.Id;
          if (element.ProductCTCPayrollRuleMappingId > 0) {

            this.product = this.productlist.filter(function (products) {
              return products.Id == element.ProductId;
            });

            this.ruleid = this.product[0].LstProductCTCPayrollRuleMapping
            console.log('rule', this.ruleid);
            this.ruleid.forEach(element => {


              if (element.CTCRule) {
                this.ctcruleslist.push(element.CTCRule);
              }
              if (element.PayrollRule) {
                this.payrollruleslist.push(element.PayrollRule);
              }

            });




          }
          // if (element.ProductRuleMappingId != 0 && this.ctcruleslist.find(a => a.Id == element.ProductRuleMappingId)) {
          //   element.ctcrule = this.ctcruleslist.find(a => a.Id == element.ProductRuleMappingId).Name;
          // }
          // if (element.PayrollProductRuleMappingId != 0 && this.payrollruleslist.find(a => a.Id == element.PayrollProductRuleMappingId)) {
          //   element.payrollrule = this.payrollruleslist.find(a => a.Id == element.PayrollProductRuleMappingId).Name;
          // }
          element.rule = '';
          if (element.ProductCTCPayrollRuleMappingId && element.ProductCTCPayrollRuleMappingId > 0) {
           element.rule = element.ProductCTCPayrollRuleMapping.Name;
          }
          
        });
        this.dataset = this.data.sort((a, b) => a.CalculationOrder - b.CalculationOrder);
        // this.dataset = this.data;
        this.spinnerEnd();
        console.log('dataset', this.dataset);
      });

    });
    // }
  }




  onBeforeMoveRow(e, data) {
    for (let i = 0; i < data.rows.length; i++) {
      // no point in moving before or after itself
      if (data.rows[i] === data.insertBefore || data.rows[i] === data.insertBefore - 1) {
        e.stopPropagation();
        return false;
      }
    }
    return true;
  }


  onMoveRows(e, args) {
    const extractedRows = [];
    let left;
    let right;
    const rows = args.rows;
    const insertBefore = args.insertBefore;
    left = this.dataset.slice(0, insertBefore);
    right = this.dataset.slice(insertBefore, this.dataset.length);
    rows.sort((a, b) => {
      return a - b;
    });

    for (let i = 0; i < rows.length; i++) {
      extractedRows.push(this.dataset[rows[i]]);
    }

    rows.reverse();

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (row < insertBefore) {
        left.splice(row, 1);
      } else {
        right.splice(row - insertBefore, 1);
      }
    }
    this.dataset = left.concat(extractedRows.concat(right));
    const selectedRows = [];

    for (let i = 0; i < rows.length; i++) {
      selectedRows.push(left.length + i);
    }

    this.angularGrid.slickGrid.resetActiveCell();
    let length = this.dataset.length;
    let i = 1;
    this.dataset.forEach(element => {

      if (i <= length) {
        element.CalculationOrder = i;
        i++
      }

    })
    this.angularGrid.slickGrid.setData(this.dataset);
    this.angularGrid.slickGrid.setSelectedRows(selectedRows);
    this.angularGrid.slickGrid.render();
  }



  select_product() {
    this.submitted = true;
    if (this.paygroupForm.invalid) {
      this.alertService.showInfo('Please fill mandatory fields !');
      return;
    }
    const modalRef = this.modalService.open(ProductModalComponent);
    modalRef.componentInstance.editObjects = this.dataset;
    // console.log('passing dataset',modalRef.componentInstance.editObjects)
    modalRef.result.then((result) => {

      console.log('result', result);

      if (result) {
        result.forEach(element => {
        // element.id = element.Id;
         //  element.ProductId = element.Id;
          element.DisplayName = element.Name;
  
        });
      }
      this.angularGrid.gridService.addItems(result, {position: 'bottom'});//hear it is multi select 
      // this.dataset = result; ///push not working i traid so wait , u knwo abt the addtogriditem concept 

      // this.dataset.forEach((element, index) => {
      //   element.CalculationOrder = index + 1;
      //   element.DisplayOrder = index + 1;
      // });
      let idx = 1;
      const len = this.dataset.length;
      this.dataset.forEach(element => {
  
        if (idx <= len) {
          element.CalculationOrder = element.CalculationOrder ? element.CalculationOrder : idx;
          element.DisplayOrder = element.DisplayOrder ? element.DisplayOrder : idx;
          idx++
        }
      });
      console.log("ok", this.dataset);
    }).catch((error) => {
      console.log(error);
    });
  }

  angularGridReady(angularGrid: AngularGridInstance) {
    this.angularGrid = angularGrid;
    this.gridObj1 = angularGrid && angularGrid.slickGrid || {};
  }


  onCellClicked(e, args) {
    const metadata = this.angularGrid.gridService.getColumnFromEventArguments(args);
    // console.log(metadata);
    if (metadata.columnDef.id === 'IsOveridable') {
      const row = args.grid.getData().getItems()[args.row];
      const column = args.grid.getColumns()[args.cell];
      row[column.field] = !row[column.field];
      // console.log('&&&&&&&&&', column, row);
    }
    if (metadata.columnDef.id === 'edit') {


      console.log(`open a modal window to edit: ${metadata.dataContext.title}`);

      const modalRef = this.modalService.open(ProductDetailsComponent);
      modalRef.componentInstance.editObjects = metadata.dataContext;
      modalRef.result.then((result) => {
        if (result != "Modal Closed") {
          let isAlready = false;
          console.log('result', result)
          result.Id = metadata.dataContext.Id; // using Id to check the edit or insert col
          result.id = metadata.dataContext.id;
          // result.ProductRuleMappingCode = result.ctcrule;
          // result.PayrollProductRuleMappingCode = result.payrollrule;
          result.rule =  result.ProductCTCPayrollRuleMapping && Object.keys(result.ProductCTCPayrollRuleMapping).length ? 
            result.ProductCTCPayrollRuleMapping.Name : '';
          // result.DisplayName =  result.ctcPayrollRule;
          result.CalculationOrder = metadata.dataContext.CalculationOrder;
  
          this.angularGrid.gridService.updateItemById(metadata.dataContext.id, result);
  
          // let length = this.dataset.length;
          // let i=1;
          // this.dataset.forEach(element =>{
  
          // if( i<=length ){
          //   element.CalculationOrder = i;
          //   i++
          // }
  
          // });
        }



      }).catch((error) => {
        console.log(error);
      });



      this.angularGrid.gridService.highlightRow(args.row, 1500);
      // you could also select the row, when using "enableCellNavigation: true", it automatically selects the row
      // this.angularGrid.gridService.setSelectedRow(args.row);
    } else if (metadata.columnDef.id === 'delete') {
      this.alertService.confirmSwal1("Confirmation", `Are you sure you want to delete`, "Yes, Confirm", "No, Cancel").then((result) => {
        metadata.dataContext.Modetype = UIMode.Delete;
        if (metadata.dataContext.id != 0) {
          this.deletedItems.push(metadata.dataContext);
        }
        this.angularGrid.gridService.deleteItemById(metadata.dataContext.id);
      });
    }
  }


  public isGuid(stringToTest) {
    // alert("guid testing");
    if (stringToTest[0] === "{") {
      stringToTest = stringToTest.substring(1, stringToTest.length - 1);
    }
    var regexGuid = /^(\{){0,1}[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}(\}){0,1}$/gi;

    return regexGuid.test(stringToTest);
  }

  savebutton(): void {
    // this.ScaleDetails.length = 0;
    this.submitted = true;
    if (this.paygroupForm.invalid) {
      return;
    }

    this.spinnerStarOver();
    console.log(this.dataset);
    if (this.dataset.length > 0) {
      this.dataset.forEach(element => {
        element.Id = this.isGuid(element.Id) == true ? 0 : element.Id;
        if (element.ProductId == undefined) {
          // element.ProductId = element.Id;
          // element.ProductRuleMappingCode = element.ctcrule;
          // element.PayrollProductRuleMappingCode = element.payrollrule;
        }
        element.IsEditable = true;
        // element.Modetype = UIMode.Edit;
        element.Modetype = element.Id > 0 ? UIMode.Edit : UIMode.None,
        delete element.id;
      });
    }

    // if (this.deletedItems && this.deletedItems.length) {
    //   this.deletedItems.forEach(item => {
    //     item.product.Modetype = UIMode.Delete;
    //     item.product.Status = UserStatus.InActive;
    //     this.dataset.push(item);
    //   });
    // }

   
    this.Paygroup.Id = this.paygroupForm.get('Id').value;
    this.Paygroup.Name = this.paygroupForm.get('Name').value;
    this.Paygroup.Code = this.paygroupForm.get('Code').value;
    this.Paygroup.Description = this.paygroupForm.get('Description').value;
    this.Paygroup.SalaryBreakUpType = this.paygroupForm.get('SalaryBreakUpType').value;
    //    this.Paygroup.Status = this.paygroupForm.get('Status').value;
    this.Paygroup.ClientId = this.BusinessType == 3 ? this.paygroupForm.get('ClientId').value : this.sessionService.getSessionStorage("default_SME_ClientId");
    this.Paygroup.ClientContractId = 0;
    this.Paygroup.TeamId = 0;
    this.Paygroup.RuleSetId = this.paygroupForm.get('RuleSetId').value;
    this.Paygroup.LstPayGroupProduct = this.dataset;

    console.log('PG',this.Paygroup);

    _PaygroupModal.NewDetails = this.Paygroup;
    const PaygroupProduct_request_param = JSON.stringify(_PaygroupModal);
    console.log('OBJ :::', _PaygroupModal);

    // return this.spinnerEnd();
    if (this.Paygroup.Id > 0) {
      this.paygroupService.putPaygroupProduct(PaygroupProduct_request_param).subscribe((data: any) => {
        console.log(data);
        this.spinnerEnd();
        if (data.Status) {

          this.alertService.showSuccess(data.Message);
          this.router.navigate(['/app/listing/ui/paygroup']);
        }
        else {
          this.alertService.showWarning(data.Message);
        }
      },(err) => {
        this.spinnerEnd();
        this.alertService.showWarning(`Something is wrong!  ${err}`);
        console.log("Something is wrong! : ", err);
      });
    } else {
      this.paygroupService.postPaygroupProduct(PaygroupProduct_request_param).subscribe((data: any) => {
        console.log(data);
        this.spinnerEnd();
        if (data.Status) {
          this.alertService.showSuccess(data.Message);
          this.router.navigate(['/app/listing/ui/paygroup']);
        } else {
          this.alertService.showWarning(data.Message);
        }
      },(err) => {
        this.spinnerEnd();
        this.alertService.showWarning(`Something is wrong!  ${err}`);
        console.log("Something is wrong! : ", err);
      });
    }
  }

  confirmExit() {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: true
    })

    swalWithBootstrapButtons.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Exit!',
      cancelButtonText: 'No, cancel!',
      reverseButtons: true
    }).then((result) => {
      if (result.value) {
        this.router.navigate(['/app/listing/ui/paygroup']);
      } else if (
        /* Read more about handling dismissals below */
        result.dismiss === Swal.DismissReason.cancel
      ) {}
    });
  }

  spinnerStarOver() {
    this.loadingScreenService.show();
    // (<HTMLInputElement>document.getElementById('overlay')).style.display = "flex";
  }

  spinnerEnd() {
    this.loadingScreenService.hide();
    // (<HTMLInputElement>document.getElementById('overlay')).style.display = "none";
  }
}
