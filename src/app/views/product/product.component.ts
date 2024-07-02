import { Component, OnInit } from '@angular/core';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import Swal from "sweetalert2";
import { NgbActiveModal, } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { AlertService } from '../../_services/service/alert.service';
import { ProductService } from '../../_services/service/product.service';
import { ProductGroupService } from '../../_services/service/productgroup.service';
import { ProductTypeService } from '../../_services/service/producttype.service';
import { ProductModel, _productmodel } from 'src/app/_services/model/ProductModel';
import { Product, _Product, ProductCTCPayrollRuleMapping } from 'src/app/_services/model/Product';
import { HeaderService } from 'src/app/_services/service/header.service';
import { apiResponse } from '../../_services/model/apiResponse';
import { ProductApplicabilityComponent } from 'src/app/shared/modals/product-applicability/product-applicability.component';
import { RuleBuilderComponent } from 'src/app/components/rules/ruleeditor/rulebuilder.component';
import { Rule } from '../../_services/model/Rule';
import { RulesService } from '../../_services/service/rules.service';
import { LoadingScreenService } from '../../shared/components/loading-screen/loading-screen.service';
import { AngularGridInstance, Column, Formatters, GridOption, OnEventArgs } from 'angular-slickgrid';
import * as _ from 'lodash';
import { UIMode } from '../../_services/model/Common/BaseModel';
import { DatePipe } from '@angular/common';
import { environment } from 'src/environments/environment';
import { RuleSet } from 'src/app/_services/model/Ruleset';
import { RowDataService } from '../personalised-display/row-data.service';
import { UtilityService } from 'src/app/_services/service/utitlity.service';
import { ProductCTCPayrollRuleMappingComponent } from 'src/app/shared/modals/product-ctcpayroll-rule-mapping/product-ctcpayroll-rule-mapping.component';
import { forkJoin } from 'rxjs';
import { LoginResponses } from 'src/app/_services/model';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { SessionStorage } from 'src/app/_services/service';

export const RoundOffType: any = [{ ValueMember: 0, DisplayMember: 'Nearest', icon: "mdi-google-nearby", checked: false },
{ ValueMember: 1, DisplayMember: 'Highest', icon: "mdi-arrow-up-bold-box", checked: false }];

export const ProductCalculationType: any =
  [
    { ValueMember: 1, DisplayMember: 'Fixed', icon: "mdi-checkbox-marked-circle", checked: false },
    { ValueMember: 2, DisplayMember: 'Variable', icon: "mdi-shuffle-variant", checked: false },
    { ValueMember: 3, DisplayMember: 'Rule', icon: "mdi-check", checked: false }
  ];

export const ProductCategory: any = [
  { ValueMember: 1, DisplayMember: 'Payroll', icon: 'mdi-cash-usd', checked: false },
  { ValueMember: 2, DisplayMember: 'Billing', icon: 'mdi-file', checked: false },
  { ValueMember: 3, DisplayMember: 'Tax', icon: 'mdi-account', checked: false }
];

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss']
})
export class ProductComponent implements OnInit {

  header = "Add New Product";

  UserId: any;
  spinner: boolean = false;
  identity: any;
  identityId: number = 0;

  deleteColumn: string;
  productForm: FormGroup;
  unsavedDocumentLst = [];
  submitted = false;
  product: Product = {} as any;
  ProductModel: ProductModel;
  Id: number = 0;
  UserName: any;
  should_spin_product: boolean = true;

  listOfroundOffType = RoundOffType;
  listOfcalculationType: any;
  listOfproductCategory = ProductCategory;
  listOfproductType = [];
  listOfproductGroup = [];
  listOfTaxCodes = [];

  CTCcolumnDefinitions: Column[] = [];
  CTCgridOptions: GridOption = {};
  angularGrid_ctcrule: AngularGridInstance;
  gridObj1_ctcrule: any;
  CTCdataset = [];
  LstCtcruleList: any = [];


  PayRollcolumnDefinitions: Column[] = [];
  PayRollgridOptions: GridOption = {};
  angularGrid_payroll: AngularGridInstance;
  gridObj1_payroll: any;
  PayRolldataset = [];
  payrolcurrentRule: Rule;
  selectedpayrolRuleList: any[];
  ctccurrentRule: Rule;
  // ctcruleset:any;
  ctcRuleList = [];
  payrollRuleList = [];
  selectedRuleList: any[];
  deletedItems = [];
  concatinateData: any[];
  // modal
  modalOption: NgbModalOptions = {};

  // product applicability
  applicabilitydata: any = [];
  datasetproductapp = [];

  columnDefinitions: Column[] = [];
  gridOptions: GridOption = {};
  angularGrid: AngularGridInstance;
  gridObj1: any;
  // rule mapping
  productCtcPayrollMapping: ProductCTCPayrollRuleMapping[] = [];
  ctcrulesset: RuleSet;
  payrollruleset: RuleSet;

  angularGrid_payrollCTCRule: AngularGridInstance;
  gridObj_payrollCTCRule: any;
  payrollCTCRuleDataset = [];
  LstPayrollCTCRuleList: any = [];
  payrollCTCRuleColumnDefinitions: Column[] = [];
  payrollCTCRuleGridOptions: GridOption = {};

  // session
  sessionDetails: LoginResponses;
  businessType: number = 0;
  companyId: number = 0;
  clientId: number = 0;

  constructor(
    public modalService: NgbModal,
    private activeModal: NgbActiveModal,
    private router: Router,
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private ProductService: ProductService,
    private route: ActivatedRoute,
    private ProductGroupService: ProductGroupService,
    private ProductTypeService: ProductTypeService,
    public datepipe: DatePipe,
    private headerService: HeaderService,
    private rulesApi: RulesService,
    private loadingScreenService: LoadingScreenService,
    private rowDataService: RowDataService,
    private utilService: UtilityService,
    private sessionService: SessionStorage,
  ) {
    this.loadRules();
  }

  get f() { return this.productForm.controls; }

  ngOnInit() {

    this.sessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses));
    this.businessType = this.sessionDetails.Company.LstCompanyBusinessTypeMapping != null ? this.sessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this.sessionDetails.Company.Id).BusinessType : 0;
    this.companyId = this.sessionDetails.Company.Id;
    this.clientId = 0;
    if (this.businessType != 3) {
      this.clientId = this.sessionService.getSessionStorage("default_SME_ClientId");
    }
    this.modalOption.backdrop = 'static';
    this.modalOption.keyboard = false;
    this.modalOption.size = 'lg';

    this.loadingScreenService.startLoading();
    this.headerService.setTitle('Product');

    this.productForm = this.formBuilder.group({
      Id: [0],
      name: [null, [Validators.required, Validators.minLength(2)]],
      description: [''],
      code: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(20)]],
      roundOffType: [null, Validators.required],
      roundOffValue: [null, [Validators.required, Validators.min(0)]],
      productType: [null, Validators.required],
      productGroup: [0, Validators.required],
      calculationType: ['1'],
      productCategory: ['1'],
      status: [true],
      lOpApplicable: [false],
      arrearApplicable: [false],
      // gLCode: [null],
      billsrequired: [false],
      taxprojection: [false],
      taxCodeApplicable: [false],
      applicableTaxCode: [],
      thresholdlimit: [0],
      IsThresholdLimitApplicable: [false],
      IsBenefitProduct: [false]
    });

    forkJoin([
      this.loadProductGroupLst(),
      this.loadProductTypeLst(),
      this.loadTaxCodeList()
    ]).subscribe(value => {
      console.log('FORK JOIN OUTPUT PRODUCT :: ', value);
    });

    this.productForm.get('taxCodeApplicable').valueChanges.subscribe(val => {
      if (val) {
        this.productForm.controls.applicableTaxCode.setValidators([Validators.required]);
        this.productForm.controls.applicableTaxCode.updateValueAndValidity();
      }
      if (!val) {
        this.productForm.controls.applicableTaxCode.setValidators(null);
        this.productForm.controls.applicableTaxCode.updateValueAndValidity();
      }
    });

    this.productForm.get('IsThresholdLimitApplicable').valueChanges.subscribe(val => {
      if (val) {
        this.productForm.controls.thresholdlimit.setValidators([Validators.required, Validators.min(0)]);
        this.productForm.controls.thresholdlimit.setValue(1.00);
        this.productForm.controls.thresholdlimit.updateValueAndValidity();
      }
      if (!val) {
        this.productForm.controls.thresholdlimit.setValidators(null);
        this.productForm.controls.thresholdlimit.setValue(0);
        this.productForm.controls.thresholdlimit.updateValueAndValidity();
      }
    });


    this.route.data.subscribe(data => {

      if (data.DataInterface.RowData) {
        console.log(data.DataInterface.RowData.Id);
        this.Id = data.DataInterface.RowData.Id;
        if (this.Id != 0) {
          this.loadRules();
          setTimeout(() => {
            // this.loadingScreenService.stopLoading();
            this.do_Edit();
          }, 0);
        }
      } else {
        this.Id = 0;
        _productmodel.OldProductDetails = _.cloneDeep(Object.assign({}, this.product));
      }

      this.rowDataService.dataInterface = {
        SearchElementValuesList: [],
        RowData: null
      }

    });

    // this.route.queryParams.subscribe(params => {
    //   console.log(params);
    //   if (JSON.stringify(params) != JSON.stringify({})) {

    //     var encodedIdx = atob(params["Idx"]);
    //     this.Id = Number(encodedIdx) == undefined ? 0 : Number(encodedIdx);

    //   }
    // });

    this.columnDefinitions = [
      { id: 'Code', name: 'Code', field: 'Code', formatter: Formatters.uppercase, sortable: true, filterable: true },
      { id: 'EffectiveDate', name: 'Effective Date', field: 'EffectiveDate', formatter: Formatters.dateIso, sortable: true },
      // { id: 'RuleId', name: 'RuleId', field: 'RuleId', formatter: Formatters.uppercase, sortable: true },
      { id: 'Status', name: 'Status', field: 'Status', cssClass: 'right-align', sortable: true, filterable: true },
      {
        id: 'edit',
        field: 'id',
        excludeFromExport: true,
        excludeFromHeaderMenu: true,
        formatter: Formatters.editIcon,
        minWidth: 30,
        maxWidth: 30,
        onCellClick: (e: Event, args: OnEventArgs) => {
          console.log(args.dataContext);
          let i: any = this.datasetproductapp.filter(item => item.Id == args.dataContext.Id);

          const modalRef = this.modalService.open(ProductApplicabilityComponent, { size: 'lg' });
          modalRef.componentInstance.id = args.dataContext.Id;
          modalRef.componentInstance.jsonObj = i;
          console.log(i);
          modalRef.result.then((result) => {
            if (result !== 'Modal Closed') {
              const isSameResult = _.find(this.datasetproductapp, (a) => a.Id == result.Id) != null ? true : false;
              console.log("rr", isSameResult);
              if (isSameResult) {
                result.Status = result.Status == 0 ? "In-Active" : "Active";
                this.angularGrid.gridService.updateItemById(result.Id, result);
              } else {
                this.angularGrid.gridService.addItem(result);
              }
            }
          });
          // result.Status = 0 ? "In-Active" : "Active";       

          //    this.datasetproductapp.push(result);
          // this.initial_getProductApplicability_load();

        }
      },
      {
        id: 'delete',
        field: 'id',
        excludeFromExport: true,
        excludeFromHeaderMenu: true,
        formatter: Formatters.deleteIcon,
        minWidth: 30,
        maxWidth: 30,
        // use onCellClick OR grid.onClick.subscribe which you can see down below
        onCellClick: (e: Event, args: OnEventArgs) => {
          console.log(args.dataContext);
          let navigationExtras: NavigationExtras = {
            queryParams: {
              "id": args.dataContext.Id,
            }
          };
          this.confirmDeleteid(args.dataContext.ProductId, args.dataContext.Code, args.dataContext.Id);
        }
      },
    ];

    this.gridOptions = {
      enableAutoResize: true,       // true by default
      enableCellNavigation: true,
      datasetIdPropertyName: "Id",
      editable: true,
      forceFitColumns: true,
      enableHeaderMenu: false,
      enableGridMenu: true,   // <<-- this will automatically add extra custom commands
      enableFiltering: true,
      showHeaderRow: false,

    };



    

    this.payrollCTCRuleColumnDefinitions = [
      { id: 'Code', name: 'Code', field: 'Code', formatter: Formatters.uppercase, sortable: true, filterable: true },
      { id: 'Name', name: 'Name', field: 'Name', formatter: Formatters.uppercase, sortable: true, filterable: true },
      { id: 'Description', name: 'Description', field: 'Description', sortable: true, filterable: true },
      { id: 'Rule', name: 'Rule Name', field: 'Rule', sortable: true, filterable: true },
      { id: 'Status', name: 'Status', field: 'Status', cssClass: 'right-align', sortable: true, filterable: true },
      {
        id: 'edit',
        field: 'Id',

        excludeFromExport: true,
        excludeFromHeaderMenu: true,
        formatter: Formatters.editIcon,
        minWidth: 30,
        maxWidth: 30,

        onCellClick: (e: Event, args: OnEventArgs) => {
          console.log(args.dataContext);
          // args.dataContext.Modetype = UIMode.Edit
          this.selectedRuleList = [];
          this.selectedRuleList.push(args.dataContext);
          this.showProductRuleMappingModal();
        }
      },
      {
        id: 'delete',
        field: 'Id',

        excludeFromExport: true,
        excludeFromHeaderMenu: true,
        formatter: Formatters.deleteIcon,
        minWidth: 30,
        maxWidth: 30,
        // use onCellClick OR grid.onClick.subscribe which you can see down below
        onCellClick: (e: Event, args: OnEventArgs) => {
          console.log(args.dataContext);
          args.dataContext.Modetype = UIMode.Delete;
          if (args.dataContext.id != 0) {
            this.deletedItems.push(args.dataContext);
          }
          console.log('deleted items', this.deletedItems.length);
          this.angularGrid_payrollCTCRule.gridService.deleteItemById(args.dataContext.Id);

        }
      },
    ];

    this.payrollCTCRuleGridOptions = {
      enableAutoResize: true,       // true by default
      enableCellNavigation: true,
      datasetIdPropertyName: "Id",
      editable: true,
      forceFitColumns: true,
      enableHeaderMenu: false,
      enableGridMenu: true,   // <<-- this will automatically add extra custom commands
      enableFiltering: true,
      showHeaderRow: false,
      enablePagination: false
    };

    this.listOfcalculationType = [

      { ValueMember: 1, DisplayMember: 'Fixed', icon: "mdi-checkbox-marked-circle", checked: false },
      { ValueMember: 2, DisplayMember: 'Variable', icon: "mdi-shuffle-variant", checked: false },
      { ValueMember: 3, DisplayMember: 'Rule', icon: "mdi-check", checked: false }
    ];


  }
  angularGridReady(angularGrid: AngularGridInstance) {
    this.angularGrid = angularGrid;
    this.gridObj1 = angularGrid && angularGrid.slickGrid || {};
  }

  angularGridReady_CTCangularGrid(angularGrid: AngularGridInstance) {
    this.angularGrid_ctcrule = angularGrid;
    this.gridObj1_ctcrule = angularGrid && angularGrid.slickGrid || {};
  }

  angularGridReady_payrollCTCRuleAngularGrid(angularGrid: AngularGridInstance) {
    this.angularGrid_payrollCTCRule = angularGrid;
    this.gridObj_payrollCTCRule = angularGrid && angularGrid.slickGrid || {};
  }

  confirmDeleteid(id: number, Code: any, Id: any) {
    this.identity = this.isGuid(Id) == true ? true : false;
    this.Id = Id;
    this.identityId = +id;
    this.deleteColumn = Code;
    this.deletePopup();
    // $('#modaldeleteconfimation').modal('show');
  }
  deletePopup() {
    this.alertService.confirmSwal1("Confirmation", `Are you sure you want to delete ${this.deleteColumn}`, "Yes, Confirm", "No, Cancel").then((result) => {
      if (this.identity) {
        let temp_list = this.datasetproductapp.find(a => a.Id == this.Id);
        temp_list.id = temp_list.Id;
        if (temp_list != null) {
          this.angularGrid.gridService.deleteItem(temp_list);
        }
      } else {
  
        this.product.Id = this.identityId;
        var i = this.product.ProductApplicabilityLst.find(a => a.Code.toString() == this.deleteColumn.toString());
        i.Status = 0;
        this.product.ProductApplicabilityLst.find(s => s.Code == this.deleteColumn);
        this.ProductService.deleteProductApplicability(JSON.stringify(this.product)).subscribe(response => {
          if (response.Status) {
            this.alertService.showSuccess(response.Message);
            // $('#modaldeleteconfimation').modal('hide');
            let Id = i.Code;
            this.angularGrid.gridService.deleteItemById(Id);
          } else {
            this.alertService.showWarning(response.Message);
          }
          // $('#modaldeleteconfimation').modal('hide');
  
        }, (error) => {
          // $('#modaldeleteconfimation').modal('hide');
        });
  
      }
    }).catch(err => {
      console.log('DELETE ALERT ERR', err);
    });
  }

  initial_getProductApplicability_load() {
    this.spinner = true;
    let req_param_uri = `${this.Id}`;
    this.ProductService.getProductById(req_param_uri).subscribe(response => {
      console.log('producta list ', response);
      if (response.dynamicObject.ProductApplicabilityLst == null) {
        this.spinner = false;
      }
      this.datasetproductapp = response.dynamicObject.ProductApplicabilityLst;
      if (this.datasetproductapp !== null) {
        this.datasetproductapp.forEach(element => {
          element["Status"] = element.Status == 0 ? "In-Active" : "Active";
          element["Id"] = element.Id ? element.Id : element.Code;
          element["ProductId"] = this.product.Id;
        });
      }
      this.spinner = false;
    }, (error) => {
    });
  }


  loadRules() {
    this.rulesApi.getRulesetwithRulesbyname(environment.environment.CTCRuleSetName).subscribe((response) => {
      this.ctcrulesset = null;
      this.ctcrulesset = response;
      this.ctcRuleList = this.ctcrulesset.RuleList;
    },(error) => {

    });

    this.rulesApi.getRulesetwithRulesbyname(environment.environment.PayrollRuleSetName).subscribe(response => {
      this.payrollruleset = response;
      this.payrollRuleList = this.payrollruleset.RuleList;
      // console.log('payrollruleset', this.payrollruleset)
    },(error) => {

    });
  }


  async do_Edit() {

    this.loadingScreenService.startLoading();

    let req_param_uri = `${this.Id}`;
    this.ProductService.getProductById(req_param_uri).subscribe((data: any) => {
      let apiResponse: apiResponse = data;
      this.product = (apiResponse.dynamicObject);
      //for header title
      this.header = "Edit product : " + this.product.Name;


      // console.log('product data', this.product);
      _productmodel.NewProductDetails = this.product;
      _productmodel.OldProductDetails = _.cloneDeep(Object.assign({}, this.product));
      // console.log("con", _productmodel)



      // if (this.product.LstProductRuleMapping != null && this.product.LstProductRuleMapping.length > 0) {
      //   this.product.LstProductRuleMapping.forEach(element => {
      //     if (element.ProductRuleCategory === ProductRuleCategory.CTCBreakup) {
      //       // element.Rule = this.ctcrulesset.RuleList.find(y => y.Id == element.RuleId);
      //       element.Rule = this.ctcRuleList.find(y => y.Id == element.RuleId);
      //       // this.ctcruleset = element.Rule.RulesetId
      //       // console.log('ctcrules', element.Rule);
      //       console.log('ctcrules', element.Rule);
      //       if (element.Rule != undefined) {
      //         this.CTCdataset.push(element.Rule)
      //         this.CTCdataset.forEach(e => {
      //           e.id = e.Id;
      //           e[
      //             'ParentId'
      //           ] = element.Id
      //         })
      //       }

      //     }
      //     if (element.ProductRuleCategory === ProductRuleCategory.Payroll) {
      //       // element.Rule = this.payrollruleset.RuleList.find(y => y.Id == element.RuleId);
      //       element.Rule = this.payrollRuleList.find(y => y.Id == element.RuleId);
      //       // this.ruleset = element.Rule.RulesetId
      //       // console.log('payrollrules', element.Rule);
      //       console.log('payrollrules', element.Rule);
      //       if (element.Rule != undefined) {
      //         this.PayRolldataset.push(element.Rule)
      //         this.PayRolldataset.forEach(e => {
      //           e.id = e.Id;
      //           e[
      //             'ParentId'
      //           ] = element.Id

      //         })
      //       }
      //     }
      //   });
      // }

      if (this.product.LstProductCTCPayrollRuleMapping && this.product.LstProductCTCPayrollRuleMapping.length) {

        // this.product.LstProductCTCPayrollRuleMapping.forEach(element => {
        //   element.CTCRule = this.ctcRuleList.find(y => y.Id == element.CTCRuleId);
        //   console.log('ctcrules', element.CTCRule);
        //   if (element.CTCRule != undefined) {
        //     this.payrollCTCRuleDataset.push(element)
        //     this.payrollCTCRuleDataset.forEach(e => {
        //       e.id = e.Id;
        //       e[
        //         'ParentId'
        //       ] = element.Id
        //     })
        //   }
        //   element.PayrollRule = this.payrollRuleList.find(y => y.Id == element.PayrollRuleId);
        //   console.log('payrollrules', element.PayrollRule);
        //   if (element.PayrollRule != undefined) {
        //     this.payrollCTCRuleDataset.push(element)
        //     this.payrollCTCRuleDataset.forEach(e => {
        //       e.id = e.Id;
        //       e[
        //         'ParentId'
        //       ] = element.Id

        //     })
        //   }
        // });
        try {
          this.payrollCTCRuleDataset = this.product.LstProductCTCPayrollRuleMapping.map(item => {
            if (item.CTCRuleId && item.CTCRuleId > 0 || item.PayrollRuleId && item.PayrollRuleId > 0) {
              return [
                {
                  id: item.Id, // for internal reference
                  Id: item.Id,
                  ParentId: item.Id,
                  Code: item.Code,
                  Name: item.Name,
                  Description: item.Description,
                  CTCRuleId: item.CTCRuleId,
                  PayrollRuleId: item.PayrollRuleId,
                  Status: item.Status === 1 ? 'Active' : 'In-Active',
                  PayrollRule: item.PayrollRuleId > 0 ? this.payrollRuleList.find(y => y.Id == item.PayrollRuleId) : null,
                  CTCRule: item.CTCRuleId > 0 ? this.ctcRuleList.find(x => x.Id == item.CTCRuleId) : null,
                  Rule: item.CTCRuleId > 0 && item.PayrollRuleId > 0
                    ? `${this.ctcRuleList.find(x => x.Id == item.CTCRuleId).Name}, ${this.payrollRuleList.find(y => y.Id == item.PayrollRuleId).Name}`
                    : item.CTCRuleId > 0 ? this.ctcRuleList.find(x => x.Id == item.CTCRuleId).Name : this.payrollRuleList.find(y => y.Id == item.PayrollRuleId).Name,
                  // Rule: item.CTCRuleId > 0 ? this.ctcRuleList.find(x => x.Id == item.CTCRuleId).Name : this.payrollRuleList.find(y => y.Id == item.PayrollRuleId).Name
                }
              ];
            }
            return [];
          }).reduce((acc, arr) => acc.concat(arr), []);
        } catch (error) {
          console.log('product LstProductCTCPayrollRuleMapping errrrrr', error);
        }

      }

      console.log('product LstProductCTCPayrollRuleMapping', this.payrollCTCRuleDataset);

      this.DataBinding_for_Edit();
      this.initial_getProductApplicability_load();
      this.loadingScreenService.stopLoading();

    },
      (err) => {
        this.loadingScreenService.stopLoading();
        this.alertService.showWarning(`Something is wrong!  ${err}`);
      });
  }
  DataBinding_for_Edit(): void {
    
    this.productForm.controls['Id'].setValue(this.product.Id)
    this.productForm.controls['name'].setValue(this.product.Name)
    this.productForm.controls['description'].setValue(this.product.Description)
    this.productForm.controls['code'].setValue(this.product.Code)
    this.productForm.controls['roundOffValue'].setValue(this.product.RoundOffValue)
    this.productForm.controls['roundOffType'].setValue(this.product.RoundOffType)
    this.productForm.controls['productType'].setValue(this.product.ProductTypeId)
    this.productForm.controls['productGroup'].setValue(this.product.ProductgroupId)
    this.productForm.controls['calculationType'].setValue(this.product.CalculationType)
    this.productForm.controls['productCategory'].setValue(this.product.ProductCategoryId)
    this.productForm.controls['status'].setValue(this.product.Status)
    this.productForm.controls['lOpApplicable'].setValue(this.product.IsLopApplicable)
    this.productForm.controls['arrearApplicable'].setValue(this.product.IsArrearApplicable)
    // this.productForm.controls['gLCode'].setValue(this.product.GLCode)
    this.productForm.controls['billsrequired'].setValue(this.product.IsBillRequiredforProof);
    this.productForm.controls['taxprojection'].setValue(this.product.IsTaxprojectionRequired)
    this.productForm.controls['applicableTaxCode'].setValue(this.product.TaxCodeId)
    this.productForm.controls['IsBenefitProduct'].setValue(this.product.IsBenefitProduct);
    this.productForm.controls['IsThresholdLimitApplicable'].setValue(this.product.IsThresholdLimitApplicable);
    this.productForm.controls['taxCodeApplicable'].setValue(this.product.IsTaxCodeApplicable);
    this.productForm.controls['thresholdlimit'].setValue(this.product.TaxThresholdLimit);

    console.log('****', this.productForm);
  }

  loadTaxCodeList() {
    this.ProductService.getalltaxcodes().subscribe((res) => {
      this.listOfTaxCodes = res.Result;
      console.log('all tax codes', this.listOfTaxCodes);
    }, (err) => {

    });
  }

  loadProductGroupLst() {
    this.ProductGroupService.getProductGroup().subscribe((res) => {
      this.listOfproductGroup = res.dynamicObject;
      this.listOfproductGroup = _.orderBy(this.listOfproductGroup, ["Name"], ["asc"]);
      // console.log('ll', this.listOfproductGroup);

    }, (err) => {

    });
  }

  loadProductTypeLst() {

    this.ProductTypeService.getProductType().subscribe((res) => {
      this.listOfproductType = res.dynamicObject;
      this.listOfproductType = _.orderBy(this.listOfproductType, ["name"], ["asc"]);
      
    }, (err) => {

    });
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
        this.router.navigate(['app/listing/ui/productlist']);
      } else if (result.dismiss === Swal.DismissReason.cancel) {}
    })
  }

  updateIdToZero(data) {
    if (typeof data === 'object' && data !== null) {
      if ('Id' in data && this.isGuid(data.Id)) {
        data.Id = 0;
      }
      for (const key in data) {
        this.updateIdToZero(data[key]);
      }
    }
    return data;
  }

  saveProductFn(): void {
    this.loadingScreenService.startLoading();
    this.LstCtcruleList.length = 0;
    this.LstPayrollCTCRuleList = [];
    this.submitted = true;
    if (this.productForm.invalid) {
      this.loadingScreenService.stopLoading();
      this.alertService.showInfo("Please fill the Mandatory fields ");
      return;
    }

    if (this.product && (this.productForm.get('calculationType').value === 1 || this.productForm.get('calculationType').value === 3)
      && (this.payrollCTCRuleDataset.length === 0 || this.product.LstProductCTCPayrollRuleMapping.length === 0)) {
      this.loadingScreenService.stopLoading();
      this.alertService.showInfo("Please add atleast one rule");
      return;
    }

    console.log("old");
    console.log(_productmodel.OldProductDetails);


    // this.CTCdataset.push(this.deletedItems)

    // if (this.CTCdataset.length > 0) {
    //   this.CTCdataset.forEach(element => {
    //     let ctcRule = [];
    //     let rule = new Rule();
    //     rule.Id = this.isGuid(element.id) == true ? 0 : element.id;
    //     rule.RulesetId = element.RulesetId;
    //     rule.Code = element.Code;
    //     rule.Description = element.Description;
    //     rule.Name = element.Name;
    //     rule.FormattedPhrase = element.FormattedPhrase;
    //     rule.HtmlData = element.HtmlData;
    //     rule.Status = element.Status;


    //     this.LstCtcruleList.push({
    //       // Id: this.isGuid(element.id) == true ? 0 : _productmodel.OldProductDetails.LstProductRuleMapping.find(x=> x.Rule != null && x.Rule.Id == rule.Id).Id,
    //       Id: this.isGuid(element.id) == true ? 0 : element.id,
    //       ProductId: this.productForm.get('Id').value,
    //       RuleId: rule.Id,
    //       ProductRuleCategory: 1,
    //       Rule: rule,
    //     // Modetype: rule.Id > 0 ?
    //       //   (_productmodel.OldProductDetails.LstProductRuleMapping.find(x => x.Rule != null && x.Rule.Id == rule.Id).Rule.FormattedPhrase != rule.FormattedPhrase) ||
    //       //     (_productmodel.OldProductDetails.LstProductRuleMapping.find(x => x.Rule != null && x.Rule.Id == rule.Id).Rule.Code != rule.Code) ||
    //       //     (_productmodel.OldProductDetails.LstProductRuleMapping.find(x => x.Rule != null && x.Rule.Id == rule.Id).Rule.Name != rule.Name) ||
    //       //     (_productmodel.OldProductDetails.LstProductRuleMapping.find(x => x.Rule != null && x.Rule.Id == rule.Id).Rule.Description != rule.Description) ? UIMode.Edit : UIMode.None : UIMode.Edit,
    //       Modetype: rule.Id > 0 ? UIMode.Edit : UIMode.None,
    //     });

    //     const ctcRuleObject =  {
    //       Id: this.isGuid(element.id) == true ? 0 : element.id,
    //       ProductId: this.productForm.get('Id').value,
    //       RuleId: rule.Id,
    //       ProductRuleCategory: 2,
    //       Rule: rule,
    //       Modetype: rule.Id > 0 ? UIMode.Edit : UIMode.None ,

    //     }
    //    ctcRule.push(ctcRuleObject);

    //     const _productCtcPayrollMapping = new ProductCTCPayrollRuleMapping();
    //     _productCtcPayrollMapping.Id = this.isGuid(element.id) == true ? 0 : element.id;
    //     _productCtcPayrollMapping.Name = element.Name;
    //     _productCtcPayrollMapping.Code =  element.Code;
    //     _productCtcPayrollMapping.CTCRule = ctcRule;
    //     _productCtcPayrollMapping.CTCRuleId = this.isGuid(element.id) == true ? 0 : element.id;
    //     _productCtcPayrollMapping.Modetype = UIMode.None;

    //     this.productCtcPayrollMapping.push(_productCtcPayrollMapping);

    //   });
    // }

    // if (this.PayRolldataset.length > 0) {
    //   this.PayRolldataset.forEach(element => {
    //     let payrollRule = [];
    //     let rule = new Rule();
    //     rule.Id = this.isGuid(element.id) == true ? 0 : element.id;
    //     rule.RulesetId = element.RulesetId;
    //     rule.Code = element.Code;
    //     rule.Description = element.Description;
    //     rule.Name = element.Name;
    //     rule.FormattedPhrase = element.FormattedPhrase;
    //     rule.HtmlData = element.HtmlData;
    //     rule.Status = element.Status;


    //     this.LstCtcruleList.push({

    //       Id: this.isGuid(element.id) == true ? 0 : element.id,
    //       ProductId: this.productForm.get('Id').value,
    //       RuleId: rule.Id,
    //       ProductRuleCategory: 2,
    //       Rule: rule,
    //       // Modetype: rule.Id > 0 ?
    //       //   (_productmodel.OldProductDetails.LstProductRuleMapping.find(x => x.Rule != null && x.Rule.Id == rule.Id).Rule.FormattedPhrase != rule.FormattedPhrase) ||
    //       //     (_productmodel.OldProductDetails.LstProductRuleMapping.find(x => x.Rule != null && x.Rule.Id == rule.Id).Rule.Code != rule.Code) ||
    //       //     (_productmodel.OldProductDetails.LstProductRuleMapping.find(x => x.Rule != null && x.Rule.Id == rule.Id).Rule.Name != rule.Name) ||
    //       //     (_productmodel.OldProductDetails.LstProductRuleMapping.find(x => x.Rule != null && x.Rule.Id == rule.Id).Rule.Description != rule.Description) ? UIMode.Edit : UIMode.None : UIMode.Edit,
    //        Modetype: rule.Id > 0 ? UIMode.Edit : UIMode.None,
    //     })

    //     const payrollRuleObj =  {
    //       Id: this.isGuid(element.id) == true ? 0 : element.id,
    //       ProductId: this.productForm.get('Id').value,
    //       RuleId: rule.Id,
    //       ProductRuleCategory: 2,
    //       Rule: rule,
    //       // Modetype: rule.Id > 0 ?
    //       //   (_productmodel.OldProductDetails.LstProductRuleMapping.find(x => x.Rule != null && x.Rule.Id == rule.Id).Rule.FormattedPhrase != rule.FormattedPhrase) ||
    //       //     (_productmodel.OldProductDetails.LstProductRuleMapping.find(x => x.Rule != null && x.Rule.Id == rule.Id).Rule.Code != rule.Code) ||
    //       //     (_productmodel.OldProductDetails.LstProductRuleMapping.find(x => x.Rule != null && x.Rule.Id == rule.Id).Rule.Name != rule.Name) ||
    //       //     (_productmodel.OldProductDetails.LstProductRuleMapping.find(x => x.Rule != null && x.Rule.Id == rule.Id).Rule.Description != rule.Description) ? UIMode.Edit : UIMode.None : UIMode.Edit,
    //       Modetype: rule.Id > 0 ? UIMode.Edit : UIMode.None,
    //     }
    //     payrollRule.push(payrollRuleObj);

    //     const _productCtcPayrollMapping = new ProductCTCPayrollRuleMapping();
    //     _productCtcPayrollMapping.Id = this.isGuid(element.id) == true ? 0 : element.id;
    //     _productCtcPayrollMapping.Name = element.Name;
    //     _productCtcPayrollMapping.Code =  element.Code;
    //     _productCtcPayrollMapping.PayrollRule = payrollRule;
    //     _productCtcPayrollMapping.PayrollRuleId = this.isGuid(element.id) == true ? 0 : element.id;
    //     _productCtcPayrollMapping.Modetype = UIMode.None;

    //     this.productCtcPayrollMapping.push(_productCtcPayrollMapping);

    //   });
    // }

    if (this.payrollCTCRuleDataset && this.payrollCTCRuleDataset.length > 0) {
      this.payrollCTCRuleDataset.forEach(item => {
        const modifiedCTCRule = Array.isArray(item.CTCRule)
          ? item.CTCRule.map(cRule => (typeof cRule === 'object' ? this.updateIdToZero({ ...cRule }) : cRule))
          : (item.CTCRule && typeof item.CTCRule === 'object' ? this.updateIdToZero({ ...item.CTCRule }) : item.CTCRule);

        const modifiedPayrollRule = Array.isArray(item.PayrollRule)
          ? item.PayrollRule.map(pRule => (typeof pRule === 'object' ? this.updateIdToZero({ ...pRule }) : pRule))
          : (item.PayrollRule && typeof item.PayrollRule === 'object' ? this.updateIdToZero({ ...item.PayrollRule }) : item.PayrollRule);

        this.LstPayrollCTCRuleList.push({
          ...this.updateIdToZero(item),
          Status: item.Status.toLowerCase() === 'active' ? 1 : 0,
          Modetype: UIMode.Edit,  // item.Id > 0 ? UIMode.Edit : UIMode.None,
          CTCRule: modifiedCTCRule && Array.isArray(modifiedCTCRule) ? modifiedCTCRule[0] : modifiedCTCRule,
          PayrollRule: modifiedPayrollRule && Array.isArray(modifiedPayrollRule) ? modifiedPayrollRule[0] : modifiedPayrollRule,
        });
      });
    }


    if (this.deletedItems.length > 0 || this.deletedItems != null) {
      this.deletedItems.forEach(deleteObj => {
        deleteObj.Status = 0 // In-Active
        this.LstPayrollCTCRuleList.push(deleteObj);
      });
      // this.deletedItems.forEach(element => {
      //   let ctcRule = [];
      //   let rule = new Rule();
      //   rule.Id = this.isGuid(element.id) == true ? 0 : element.id;
      //   rule.RuleSetId = element.RuleSetId;
      //   rule.Code = element.Code;
      //   rule.Description = element.Description;
      //   rule.Name = element.Name;
      //   rule.FormattedPhrase = element.FormattedPhrase;
      //   rule.HtmlData = element.HtmlData;
      //   rule.Status = element.Status.toLowerCase() === 'active' ? 1 : 0;


      //   this.LstCtcruleList.push({


      //     Id: this.isGuid(element.id) == true ? 0 : element.ParentId,
      //     ProductId: this.productForm.get('Id').value,
      //     RuleId: rule.Id,
      //     ProductRuleCategory: 1,
      //     Rule: rule,
      //     Modetype: UIMode.Delete,

      //   })
      //   const ctcRuleObj =  {
      //     Id: this.isGuid(element.id) == true ? 0 : element.ParentId,
      //     ProductId: this.productForm.get('Id').value,
      //     RuleId: rule.Id,
      //     ProductRuleCategory: 1,
      //     Rule: rule,
      //     Modetype: UIMode.Delete,
      //   }
      //   ctcRule.push(ctcRuleObj);

      //   const _productCtcPayrollMapping = new ProductCTCPayrollRuleMapping();
      //   _productCtcPayrollMapping.Id = this.isGuid(element.id) == true ? 0 : element.id;
      //   _productCtcPayrollMapping.Name = element.Name;
      //   _productCtcPayrollMapping.Code =  element.Code;
      //   _productCtcPayrollMapping.CTCRule = ctcRule;
      //   _productCtcPayrollMapping.CTCRuleId = this.isGuid(element.id) == true ? 0 : element.id;
      //   _productCtcPayrollMapping.Modetype = UIMode.None;

      //   this.productCtcPayrollMapping.push(_productCtcPayrollMapping);

      // })

    }
    console.log('CTC DELETED SET ::', this.deletedItems);

    console.log('CTC SET ::', this.CTCdataset);
    console.log('PAYROLL SET ::', this.PayRolldataset);
    console.log('COMBINED SET ::', this.LstPayrollCTCRuleList);

    this.product.ClientId = this.clientId;
    this.product.CompanyId = this.companyId;

    this.product.Id = this.productForm.get('Id').value;
    this.product.Name = this.productForm.get('name').value;
    this.product.Code = this.productForm.get('code').value;
    this.product.RoundOffType = this.productForm.get('roundOffType').value != null ? this.productForm.get('roundOffType').value : '0';
    this.product.RoundOffValue = this.productForm.get('roundOffValue').value != null ? this.productForm.get('roundOffValue').value : '1';
    this.product.ProductTypeId = this.productForm.get('productType').value;
    this.product.ProductgroupId = this.productForm.get('productGroup').value != null ? this.productForm.get('productGroup').value : 0;
    this.product.CalculationType = this.productForm.get('calculationType').value;
    this.product.ProductCategoryId = this.productForm.get('productCategory').value;

    this.product.IsLopApplicable = this.productForm.get('lOpApplicable').value;
    this.product.IsArrearApplicable = this.productForm.get('arrearApplicable').value;
    // this.product.GLCode = this.productForm.get('gLCode').value != null ? this.productForm.get('gLCode').value : '';
    this.product.IsBillRequiredforProof = this.productForm.get('billsrequired').value == "" ? false : true;
    this.product.IsTaxprojectionRequired = this.productForm.get('taxprojection').value == "" ? false : true;
    this.product.TaxCodeId = this.productForm.get('applicableTaxCode').value == null ? 0 : this.productForm.get('applicableTaxCode').value;
    this.product.TaxThresholdLimit = this.productForm.get('thresholdlimit').value == "" ? 0 : this.productForm.get('thresholdlimit').value;
    this.product.IsThresholdLimitApplicable = this.productForm.get('IsThresholdLimitApplicable').value;
    this.product.IsTaxCodeApplicable = this.productForm.get('taxCodeApplicable').value;
    this.product.IsBenefitProduct = this.productForm.get('IsBenefitProduct').value;
    // this.product.LstProductRuleMapping = (this.LstPayrollCTCRuleList);
    this.product.LstProductCTCPayrollRuleMapping = (this.LstPayrollCTCRuleList);


    console.log('product', this.product)

    if (this.datasetproductapp && this.datasetproductapp.length) {

      this.datasetproductapp.forEach(element => {
        element.Id = this.isGuid(element.Id) ? 0 : element.Id;
        element.Status = element.Status == "In-Active" ? 0 : 1;


      })
    }

    this.product.ProductApplicabilityLst = this.datasetproductapp;

    this.product.Description = this.productForm.get('description').value;
    this.product.Status = this.productForm.get('status').value;
    this.product.Status = Boolean(this.product.Status) == false ? 0 : 1;
    this.product.Modetype = this.product.Id > 0 ? UIMode.Edit : UIMode.None;
    // if (this.product.Id > 0) {
    // this.product.Modetype = UIMode.Edit;}
    _productmodel.NewProductDetails = this.product;
    if (_productmodel.OldProductDetails && _productmodel.OldProductDetails.LstProductCTCPayrollRuleMapping && _productmodel.OldProductDetails.LstProductCTCPayrollRuleMapping.length > 0) {
      _productmodel.OldProductDetails.LstProductCTCPayrollRuleMapping = _productmodel.OldProductDetails.LstProductCTCPayrollRuleMapping.map(item => {
        const modifiedCTCRule = Array.isArray(item.CTCRule) ? item.CTCRule.map(cRule => (typeof cRule === 'object' ? this.updateIdToZero({ ...cRule }) : cRule)) : (item.CTCRule && typeof item.CTCRule === 'object' ? this.updateIdToZero({ ...item.CTCRule as any }) : null);
        const modifiedPayrollRule = Array.isArray(item.PayrollRule) ? item.PayrollRule.map(pRule => (typeof pRule === 'object' ? this.updateIdToZero({ ...pRule }) : pRule)) : (item.PayrollRule && typeof item.PayrollRule === 'object' ? this.updateIdToZero({ ...item.PayrollRule as any }) : null);

        return {
          ...this.updateIdToZero(item),
          Status: (item.Status === 'Active' as any) ? 1 : 0,
          CTCRule: Array.isArray(modifiedCTCRule) ? modifiedCTCRule[0] : modifiedCTCRule,
          PayrollRule: Array.isArray(modifiedPayrollRule) ? modifiedPayrollRule[0] : modifiedPayrollRule,
        };
      });
    }
    var product_request_param = JSON.stringify(_productmodel);
    console.log('_productmodel', _productmodel);
    // return this.loadingScreenService.stopLoading();
    if (this.product.Id > 0) { // edit 

      this.ProductService.putProduct(product_request_param).subscribe((data: any) => {

        console.log(data);
        if (data.Status == true) {
          this.loadingScreenService.stopLoading();
          this.activeModal.close('Modal Closed');
          this.alertService.showSuccess(data.Message);
          this.router.navigate(['/app/listing/ui/productlist']);
        } else {

          this.loadingScreenService.stopLoading();

          this.alertService.showWarning(data.Message);
        }



      },
        (err) => {
          this.loadingScreenService.stopLoading();
          this.alertService.showWarning(`Something is wrong!  ${err}`);
          console.log("Something is wrong! : ", err);

        });

    } else {   // create
      this.ProductService.postProduct(product_request_param).subscribe((data: any) => {

        console.log(data);

        if (data.Status) {
          this.loadingScreenService.stopLoading();
          this.activeModal.close('Modal Closed');
          this.alertService.showSuccess(data.Message);
          this.router.navigate(['/app/listing/ui/productlist']);

        } else {
          this.loadingScreenService.stopLoading();
          this.alertService.showInfo(data.Message);
        }

      },
        (err) => {
          // this.loadingScreenService.stopLoading();
          this.alertService.showWarning(`Something is wrong!  ${err}`);
          console.log("Something is wrong! : ", err);

        });
    }



  }
  public isGuid(stringToTest) {
    if (stringToTest[0] === "{") {
      stringToTest = stringToTest.substring(1, stringToTest.length - 1);
    }
    var regexGuid = /^(\{){0,1}[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}(\}){0,1}$/gi;

    return regexGuid.test(stringToTest);
  }

  ttypechange(event, i) {
    console.log('caluculation type', event.target.value);
    this.listOfcalculationType.forEach(element => {

      if (i.ValueMember == element.ValueMember) {
        element.checked = true;
        console.log(element);
        // if (i.ValueMember == 3) {
        //   this.router.navigate(['/app/ruleslist']);
        // }
      }
      else {
        element.checked = false;
      }
    })
  }

  change(event, i) {
    console.log('product type', event.target.value);
    this.listOfproductType.forEach(element => {
      if (i.Id == element.Id) {
        element.checked = true;
        console.log(element);
      }
      else {
        element.checked = false;
      }
    })
  }

  newProductApplicabilityClick() {
    const modalRef = this.modalService.open(ProductApplicabilityComponent, { size: 'lg' });
    modalRef.result.then((result) => {
      if(result !== 'Modal Closed') {
        console.log('result', result);
        result.id = this.isGuid(result.Id) ? 0 : result.Id;
        result.Status = result.Status == 0 ? "In-Active" : "Active";
        // this.applicabilitydata.push(result)
        // this.datasetproductapp = this.applicabilitydata;
        this.angularGrid.gridService.addItem(result);
        console.log("ok", this.datasetproductapp);
  
        // this.initial_getProductApplicability_load();
      }
    }).catch((error) => {
      console.log(error);
    });
  }


  editRule() {
    if (this.selectedRuleList == undefined || this.selectedRuleList.length == 0) {
      alert("Please select a rule to edit");
      return;
    }

    if (this.selectedRuleList.length > 1) {
      alert("You can edit only one rule, but have selected more then one");
      return;
    }

    this.ctccurrentRule = this.selectedRuleList[0];
    console.log('currentrule', this.ctccurrentRule);

    this.showModal(this.ctccurrentRule, this.ctcrulesset, 1);
  }


  newCTCRule() {
    this.ctccurrentRule = new Rule();
    this.ctccurrentRule.RuleSetId = this.ctcrulesset.Id;
    this.showModal(this.ctccurrentRule, this.ctcrulesset, 1);
  }

  showProductRuleMappingModal() {
    const activeModal = this.modalService.open(ProductCTCPayrollRuleMappingComponent, this.modalOption);
    activeModal.componentInstance.product = this.product;
    activeModal.componentInstance.ctcrulesset = this.ctcrulesset;
    activeModal.componentInstance.payrollruleset = this.payrollruleset;
    activeModal.componentInstance.selectedRule = this.selectedRuleList && this.selectedRuleList.length ? this.selectedRuleList[0] : [];

    activeModal.result.then((result) => {
      console.log('Rule Mapping Modal Result ::', result);
      if (result) {
        this.selectedRuleList = [];
        result.id = this.isGuid(result.Id) ? 0 : result.Id;
        result['Rule'] = (result.CTCRuleId >= 0 && result.CTCRule != null && result.PayrollRuleId >= 0 && result.PayrollRule != null) ? 
        `${result.CTCRule.Name}, ${result.PayrollRule.Name}` : (result.CTCRuleId >= 0 && result.CTCRule != null) ?
         result.CTCRule.Name : (result.PayrollRuleId >= 0 && result.PayrollRule != null) ? result.PayrollRule.Name : '';
        
         result.Status = result.Status == 0 ? "In-Active" : "Active";

        if (this.payrollCTCRuleDataset && this.payrollCTCRuleDataset.length) {
          const isAlready = this.payrollCTCRuleDataset.some(rule => rule.Id === result.Id);
          if ((typeof result.Id === 'number' && result.Id > 0) || isAlready) {
            this.angularGrid_payrollCTCRule.gridService.updateItemById(result.Id, result);
          } else {
            // this.payrollCTCRuleDataset.push(result);
            this.angularGrid_payrollCTCRule.gridService.addItem(result);
          }
          // Find the index of the object with the matching ID
          const index = this.payrollCTCRuleDataset.findIndex(obj => obj.Id === result.Id);

          if (index !== -1) {
            // If the object is found, replace it with the updated object
            this.payrollCTCRuleDataset[index] = result;
          } else {
            // If the object is not found, simply push the updated object to the array
            this.payrollCTCRuleDataset.push(result);
          }
        } else {
          // this.payrollCTCRuleDataset.push(result);
          if (result.PayrollRuleId !== null && result.PayrollRule != null) {
            this.payrollruleset.RuleList.push(result.PayrollRule);
          }
          if (result.CTCRuleId !== null && result.CTCRule != null) {
            this.ctcrulesset.RuleList.push(result.CTCRule);
          }
          result['Rule'] = (result.CTCRuleId >= 0 && result.CTCRule != null && result.PayrollRuleId >= 0 && result.PayrollRule != null) ? 
          `${result.CTCRule.Name}, ${result.PayrollRule.Name}` : (result.CTCRuleId >= 0 && result.CTCRule != null) ?
          result.CTCRule.Name : (result.PayrollRuleId >= 0 && result.PayrollRule != null) ? result.PayrollRule.Name : '';
           
          this.angularGrid_payrollCTCRule.gridService.addItem(result);
        }
      }
    }).catch((error) => {
      console.log('Rule Mapping Modal Error ::', error);
    });
  }

  newPayrollCtcRule() {
    this.selectedRuleList = [];
    if (this.productForm.invalid) {
      return this.alertService.showInfo('Please fill required fields !');
    }

    if (this.utilService.isNullOrUndefined(this.product)) {
      this.product.CalculationType = this.productForm.get('calculationType').value;
    }

    if (this.product && this.utilService.isNullOrUndefined(this.product.CalculationType)) {
      this.product.CalculationType = this.productForm.get('calculationType').value;
    }
    this.showProductRuleMappingModal();
  }


  showModal(rule: Rule, ruleset: RuleSet, index) {
    const activeModal = this.modalService.open(RuleBuilderComponent, this.modalOption);
    activeModal.componentInstance.currentRule = rule;
    activeModal.componentInstance.rulesetId = ruleset.Id;
    activeModal.componentInstance.parentComponent = this;
    activeModal.componentInstance.ruleSet = ruleset;
    activeModal.componentInstance.BusinessSystemId = ruleset.BusinessSystemId;
    activeModal.componentInstance.IsFromOtherEntity = true;

    activeModal.result.then( (result) => {
      console.log('result', result);
      if (result) {
        let isAlready = false;
        // result.Id = UUID.UUID();
        result.id = result.Id;
        //  
        // console.log(this.angularGrid_ctcrule);

        if (index == 1) {

          isAlready = _.find(this.CTCdataset, (ctcrule) => ctcrule.Id == result.Id) != null ? true : false;
          if ((typeof result.Id === 'number' && result.Id > 0) || isAlready == true) {
            this.CTCdataset.push(result);
            // this.angularGrid_ctcrule.gridService.updateDataGridItemById(result.Id, result, true, true);
            this.angularGrid_payrollCTCRule.gridService.updateDataGridItemById(result.Id, result, true, true);

          }
          else {
            // this.angularGrid_ctcrule.gridService.addItemToDatagrid(result);
            this.CTCdataset.push(result);
            this.angularGrid_payrollCTCRule.gridService.addItemToDatagrid(result);
          }
        }
        else if (index == 2) {

          isAlready = _.find(this.PayRolldataset, (payrollrule) => payrollrule.Id == result.Id) != null ? true : false;
          if ((typeof result.Id === 'number' && result.Id > 0) || isAlready == true) {
            this.PayRolldataset.push(result);
            // this.angularGrid_payroll.gridService.updateDataGridItemById(result.Id, result, true, true);
            this.angularGrid_payrollCTCRule.gridService.updateDataGridItemById(result.Id, result, true, true);

          }
          else {
            // this.angularGrid_payroll.gridService.addItemToDatagrid(result);
            this.PayRolldataset.push(result);
            this.angularGrid_payrollCTCRule.gridService.addItemToDatagrid(result);
          }
        }

        // this.angularGrid_ctcrule.gridService.addItemToDatagrid(result);
      } else {

      }
    })
    .catch((error) => {
      console.log(error);
    });
  }

  newpayrollRule() {
    this.payrolcurrentRule = new Rule();
    this.payrolcurrentRule.RuleSetId = this.payrollruleset.Id;
    this.showModal(this.payrolcurrentRule, this.payrollruleset, 2);
  }

  payroleditRule() {

    if (this.selectedpayrolRuleList == undefined || this.selectedpayrolRuleList.length == 0) {
      alert("Please select a rule to edit");
      return;
    }

    if (this.selectedpayrolRuleList.length > 1) {
      alert("You can edit only one rule, but have selected more then one");
      return;
    }

    this.payrolcurrentRule = this.selectedpayrolRuleList[0];
    console.log('payrolcurrentrule', this.payrolcurrentRule);

    this.showModal(this.payrolcurrentRule, this.payrollruleset, 2);

  }

}
