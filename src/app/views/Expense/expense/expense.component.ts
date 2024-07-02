import { Component, OnInit } from '@angular/core';
import { ExpenseBatch, _ExpenseBatch, ExpenseClaimRequest, ExpenseClaimRequestStatus, SubmitExpenseBatchModel, ExpenseEligibilityCriteria } from 'src/app/_services/model/Expense/ExpenseEligibilityCriteria';
import { NzDrawerRef, NzDrawerService } from 'ng-zorro-antd/drawer';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder, FormControl, Validators, AbstractControl } from '@angular/forms';
import { UUID } from 'angular2-uuid';
import Swal from "sweetalert2";
import * as _ from 'lodash';
import { SessionStorage } from '../../../_services/service/session-storage.service';
import { apiResult } from '../../../_services/model/apiResult';

import { FileUploadService } from 'src/app/_services/service/fileUpload.service';
import { ObjectStorageDetails } from 'src/app/_services/model/Candidates/ObjectStorageDetails';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { LoginResponses, UserHierarchyRole } from 'src/app/_services/model';
import { AlertService, EmployeeService, OnboardingService, PagelayoutService } from 'src/app/_services/service';
import { AddexpenseModalComponent } from 'src/app/shared/modals/expense/addexpense-modal/addexpense-modal.component';
import { ViewdocsModalComponent } from 'src/app/shared/modals/expense/viewdocs-modal/viewdocs-modal.component';

import { Column, AngularGridInstance, GridOption, Formatter, GridService, FieldType, Filters, OnEventArgs } from 'angular-slickgrid';
import * as moment from 'moment';
import { ReimbursementService } from 'src/app/_services/service/reimbursement.service';
import { EmployeeDetails, EmployeeMenuData } from 'src/app/_services/model/Employee/EmployeeDetails';
import { ReimbursementConfiguration } from 'src/app/_services/model/Payroll/ReimbursementConfiguration';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
import { PageLayout } from '../../personalised-display/models';
import { enumHelper } from 'src/app/shared/directives/_enumhelper';
import { AttendanceService } from 'src/app/_services/service/attendnace.service';
import { UIMode } from 'src/app/_services/model/Common/BaseModel';
import { getMatIconFailedToSanitizeLiteralError } from '@angular/material';
import { Title } from '@angular/platform-browser';


const highlightingFormatter = (row, cell, value, columnDef, dataContext) => {
  if (value) {
    if (dataContext.Status == 100) {
      return `<span style=" display: inline-block;
          padding: .55em .8em;
          font-size: 90%;
          font-weight: 400;
          line-height: 1;
          text-align: center;
          white-space: nowrap;
          vertical-align: baseline;
          border-radius: .375rem;
          transition: color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out;color: #dd9f04;background-color: #fdf3d9;">${dataContext.StatusName}</span>`;
    } else if (dataContext.Status == 400) {
      return `<span style=" display: inline-block;
       padding: .55em .8em;
       font-size: 90%;
        font-weight: 400;
        line-height: 1;
        text-align: center;
        white-space: nowrap;
        vertical-align: baseline;
        border-radius: .375rem;
        transition: color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out; color: #00d97e;
        background-color: #ccf7e5;">${dataContext.StatusName}</span>`;
    }
    else if (dataContext.Status == 200 || dataContext.Status == 300) {
      return `<span style=" display: inline-block;
      padding: .55em .8em;
      font-size: 90%;
      font-weight: 400;
      line-height: 1;
      text-align: center;
      white-space: nowrap;
      vertical-align: baseline;
      border-radius: .375rem;
      transition: color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out;color: #e63757;
      background-color: #fad7dd;">${dataContext.StatusName}</span>`;
    }
    else if (dataContext.Status == 600) {
      return `<span style=" display: inline-block;
      padding: .55em .8em;
      font-size: 90%;
      font-weight: 400;
      line-height: 1;
      text-align: center;
      white-space: nowrap;
      vertical-align: baseline;
      border-radius: .375rem;
      transition: color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out;color: #dd9f04;background-color: #fdf3d9;">${dataContext.StatusName}</span>`;
    }
  }
};


@Component({
  selector: 'app-expense',
  templateUrl: './expense.component.html',
  styleUrls: ['./expense.component.css']
})
export class ExpenseComponent implements OnInit {
  sessionDetails: LoginResponses;
  RoleId: number = 0;
  UserId: any = 0;
  Role: any;
  searchText: any = null;
  searchText_unclaimed_submiited: any = null;
  searchText_claimed_submiited: any = null;
  searchText_rejected : any = null;
  spinner: boolean = false;

  expenseConfiguration: ReimbursementConfiguration = new ReimbursementConfiguration();
  defaultExpenseEligibilityCriteria: ExpenseEligibilityCriteria;

  filterItem: any[] = [];
  LstExpenseClaimedRequest: any[] = [];
  LstExpenseClaimedRequestSubmitted: any[] = [];
  LstExpenseUnClaimedRequest: any[] = [];
  LstExpenseUnClaimedRequest_Rejected: any[] = [];
  GlobalLstUnClaimRequest: any[] = [];
  LstCategory: any[] = [];

  // GRID TABLE PROPERTIES 
  editFormatter: Formatter;
  viewFormatter: Formatter;
  // COMMON PROPERTIES
  selectedItems: any[];
  BehaviourObject_Data: any;
  inEmployeesInitiateGridInstance: AngularGridInstance;
  inEmployeesInitiateGrid: any;
  inEmployeesInitiateGridService: GridService;
  inEmployeesInitiateDataView: any;
  inEmployeesInitiateColumnDefinitions: Column[];
  inEmployeesInitiateGridOptions: GridOption;
  inEmployeesInitiateDataset: any;
  inEmployeesInitiateList = [];
  inEmployeesInitiateSelectedItems: any[];

  isCliekedPendingBtn: boolean = false;
  isCliekedSubmittedBtn: boolean = false;

  _employeeId: any;

  //General
  pageLayout: PageLayout = null;
  pageLayout1: PageLayout = null;

  tempColumn: Column;
  columnName: string;
  code: string;
  code1: string;
  columnDefinition: Column[];
  gridOptions: GridOption;
  pagination = {
    pageSizes: [10, 15, 20, 25, 50, 75],
    pageSize: 15,
  };

  isEnabled: any = '1';
  _statusList: any[] = [];
  countOfExpense: any = 0;
  selectedClaimReqs = [];
  expenseBatchName: any;
  expenseApproverName: any;
  objStorageJson: any;
  selectAll: boolean = false;
  tobeShown: number = 2;
  tobeShown_unclaimed: number = 2;
  tobeShown_rejcted: number = 2;
  tobeShown_claimed: number = 2;
  seeMoreText: any = "See more";
  seeMoreText_rejected: any = "See more";
  seeMoreText_unclaimed_submitted: any = "See more";
  seeMoreText_claimed_submitted: any = "See more";
  ManagerList: any[] = [];

  rowData: any;
  viewExpenseClaimRequestSlider: boolean = false;
  ExpenseErrorList: any[] = [];;
  _totalAmount: any = 0;
  _totalClaims: any = 0;
  EmployeeId: number = 0;
  modalOption: NgbModalOptions = {};

  constructor(
    private activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    public sessionService: SessionStorage,
    public fileuploadService: FileUploadService,
    private drawerService: NzDrawerService,
    private modalService: NgbModal,
    private reimbursementService: ReimbursementService,
    private employeeService: EmployeeService,
    private loadingScreenService: LoadingScreenService,
    private pageLayoutService: PagelayoutService,
    public utilsHelper: enumHelper,
    public attendanceService: AttendanceService,
    public onboardingService: OnboardingService,
    private titleService: Title,


  ) {
    window.addEventListener("beforeunload", function (e) {
      var confirmationMessage = "\o/";
      console.log("cond");
      e.returnValue = confirmationMessage;
      // e.preventDefault();     // Gecko, Trident, Chrome 34+ 
      return confirmationMessage;              // Gecko, WebKit, Chrome <34
    });

  }

  ngOnInit() {
    this.titleService.setTitle('My Claims');

    this.sessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses)); // Get the whole matched session element set as a clean json(array) via an session object
    this.RoleId = this.sessionDetails.UIRoles[0].Role.Id; // bind Logged user id may be change baed on dashboard 
    this.UserId = this.sessionDetails.UserSession.UserId;
    this.Role = this.sessionDetails.UIRoles[0].Role;
    this.EmployeeId = this.sessionDetails.EmployeeId;
    this.onRefresh();
  }

  claimEnabled(value) {
    console.log('value', value);
    
    this.isEnabled = value;
    this.titleService.setTitle(value == 4 ? "Rejected Claims" : value == 1 ? "My Claims" : value == 2 ? "Approved Claim Request" : "Pending For Claim Approval");

  }
  onRefresh() {
    this.seeMoreText = "See more";
    this.seeMoreText_rejected = "See more";
    this.seeMoreText_unclaimed_submitted = "See more";
    this.seeMoreText_claimed_submitted = "See more";

    this.ExpenseErrorList = [];
    this.rowData = null;
    this.selectAll = false;
    this.searchText_unclaimed_submiited = null;
    this.searchText_claimed_submiited = null;
    this.searchText_rejected = null;
    this.searchText = null;
    this.tobeShown = 2;
    this.tobeShown_rejcted = 2;
    this.tobeShown_claimed = 2;
    this.tobeShown_unclaimed = 2;
    this.expenseBatchName = '';
    this.inEmployeesInitiateList = [];
    this._statusList = this.utilsHelper.transform(ExpenseClaimRequestStatus) as any;
    this.selectedClaimReqs = [];
    this.isCliekedPendingBtn = true;
    this.isCliekedSubmittedBtn = false;
    this.isEnabled = 1;
    this.LstExpenseClaimedRequest = [];
    this.LstExpenseClaimedRequestSubmitted = [];
    this.LstExpenseUnClaimedRequest = [];
    this.LstExpenseUnClaimedRequest_Rejected = [];
    this.countOfExpense = 0;
    this.code = 'expenseClaimRequest';
    this.code1 = 'expenseBatch';


    this.getExpenseConfigurationByEmployeeId().then((result) => {




      this.filterItem = [

        {
          Id: 1,
          Name: "Unclaimed"
        },
        {
          Id: 2,
          Name: "Claimed"
        }
      ];
      this.editFormatter = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) =>
        value ? `<a href="javascript:;" class="btn action-edit" style="margin-right: 5px;font-size: 12px;background: #F5F5F5;
      min-width: 32px;
      min-height: 32px;
      padding: 4px;
      border-radius: 50%;
    font-weight: 800 !important;display: inline-block;color: #212529;user-select: none;border: 1px solid transparent;line-height: 1.5;    transition: color .15s ease-in-out, background-color .15s ease-in-out, border-color .15s ease-in-out, box-shadow .15s ease-in-out;
    text-align: center;
    vertical-align: middle;
   matTooltip="Edit Request">
      <i class="fa fa-pencil-square-o" aria-hidden="true" style="font-size: 16px;color: #838383;"></i>
    </a>` : '<i class="mdi mdi-checkbox-multiple-marked-outline" style="cursor:pointer"></i>';
      this.viewFormatter = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) =>
        value ? `<a href="javascript:;" class="btn action-edit" style="margin-right: 5px;font-size: 12px;
      font-weight: 800 !important;background: #F5F5F5;
      min-width: 32px;
      min-height: 32px;
      padding: 4px;
      border-radius: 50%;display: inline-block;color: #212529;user-select: none;border: 1px solid transparent;line-height: 1.5;    transition: color .15s ease-in-out, background-color .15s ease-in-out, border-color .15s ease-in-out, box-shadow .15s ease-in-out;
      text-align: center;
      vertical-align: middle;margin-right :5px
      matTooltip="View Documents">
      <i class="fa fa-file-text" aria-hidden="true" style="font-size: 16px;color: #838383;"></i>
    </a>
` : '<i class="mdi mdi-close-box-outline" style="cursor:pointer"></i>';

      this.loadinEmployeesInitiateRecords1();
    });
  }

  // OPEN DRAWER (ADD AND EDIT)

  openDrawerAddExpense() {
    this.openDrawer(null);
  }

  openDrawer(object) {
    const drawerRef = this.drawerService.create<AddexpenseModalComponent, { CategoryList: any, editObject: any, objStorageJson: any, Role: any }, string>({
      nzTitle: object != null ? 'Edit Expense Request' : 'Add Expense Request',
      nzContent: AddexpenseModalComponent,
      nzWidth: 740,
      nzClosable: false,
      nzMaskClosable: false,
      nzContentParams: {
        CategoryList: this.LstCategory,
        editObject: object,
        objStorageJson: this.objStorageJson,
        Role: this.Role
      }
    });

    drawerRef.afterOpen.subscribe(() => {
    });

    drawerRef.afterClose.subscribe(data => {
      console.log('data', data);

      var modalResult = JSON.parse(data);

      console.log('Modal Result', modalResult)
      if (modalResult.StandardAPICallValue != null) {
        var formValue: ExpenseClaimRequest = modalResult as any;

        if (this.LstExpenseUnClaimedRequest.length == 0 || this.LstExpenseUnClaimedRequest.filter(a => a.Id == formValue.Id).length == 0) {
          this.LstExpenseUnClaimedRequest.push(formValue)
          this.LstExpenseUnClaimedRequest.forEach(element => {
            element["isSelected"] = false;
          });
        } else {
          var existingExpenseClaimRequest = this.LstExpenseUnClaimedRequest.find(a => a.Id == formValue.Id);
          existingExpenseClaimRequest != undefined && (existingExpenseClaimRequest = formValue)
        }
        this.LstExpenseUnClaimedRequest != null && this.LstExpenseUnClaimedRequest.length > 0 && this.LstExpenseUnClaimedRequest.forEach(ee => {
          ee['ProductName'] = this.LstCategory != null && this.LstCategory.length > 0 && this.LstCategory.find(a => a.ProductId == ee.ProductId) != undefined ? this.LstCategory.find(a => a.ProductId == ee.ProductId).DisplayName : '---';
        });
        this.LstExpenseUnClaimedRequest = _.orderBy(this.LstExpenseUnClaimedRequest, ["LastUpdatedOn"], ["desc"]);

        this.onRefresh();
        console.log('this.LstExpenseUnClaimedRequest', this.LstExpenseUnClaimedRequest);
      }
      else if (modalResult.StandardAPICall) {
        this.onRefresh();
      }




    });
  }


  // GRID TABLE 
  DateFormatter(rowIndex, cell, value, columnDef, grid, dataProvider) {
    if (value == null || value === "") { return "---"; }
    return moment.utc(value).format('ddd, D MMM YYYY');
  }

  loadinEmployeesInitiateRecords1() {

    this.inEmployeesInitiateGridOptions = {
      enableGridMenu: true,
      enableColumnPicker: false,
      enableAutoResize: true,
      enableSorting: true,
      datasetIdPropertyName: "Id",
      enableColumnReorder: true,
      enableFiltering: true,
      showHeaderRow: false,
      enableAddRow: false,
      leaveSpaceForNewRows: true,
      autoEdit: true,
      alwaysShowVerticalScroll: false,
      enableCellNavigation: true,
      editable: false,
      createFooterRow: true,
      showFooterRow: false,
      footerRowHeight: 30,
      createPreHeaderPanel: true,
      showPreHeaderPanel: false,
      preHeaderPanelHeight: 40,
      enablePagination: false,
      enableCheckboxSelector: true,
      enableRowSelection: true,
      rowSelectionOptions: {
        selectActiveRow: false
      }
    };


    this.inEmployeesInitiateColumnDefinitions = [
      // {
      //   id: 'ProductName', name: 'Category', field: 'ProductName',
      //   sortable: true,
      //   filterable: true,
      //   type: FieldType.string,
      // },
      // {
      //   id: 'ExpenseIncurredDate', name: 'Expense Date', field: "ExpenseIncurredDate",
      //   sortable: true,
      //   filterable: true,
      //   type: FieldType.string,


      // },
      // {
      //   id: 'DocumentNumber', name: 'Bill No', field: 'DocumentNumber',
      //   sortable: true,
      //   filterable: true,
      //   type: FieldType.string,
      // },

      // {
      //   id: 'DocumentDate', name: 'Bill Date', field: 'DocumentDate',
      //   sortable: true,
      //   type: FieldType.string,
      //   filterable: true,
      //   formatter: this.DateFormatter

      //   // minWidth: 80,
      //   // maxWidth: 80,
      // },
      // {
      //   id: 'RequestedAmount', name: 'Amount (₹)', field: "RequestedAmount",
      //   sortable: true,
      //   filterable: true,
      //   type: FieldType.string,


      // },
      // {
      //   id: 'Remarks', name: 'Remarks', field: "Remarks",
      //   sortable: true,
      //   filterable: true,
      //   type: FieldType.string,

      // },
      // {
      //   id: 'StatusName', name: 'Status', field: 'StatusName',
      //   sortable: true,
      //   type: FieldType.string,
      //   formatter: highlightingFormatter,
      //   filterable: true,
      //   filter: {
      //     model: Filters.singleSelect,
      //     collection: [{ value: '', label: 'All' }, { value: "Applied", label: 'Applied' }, { value: "Cancelled", label: 'Cancelled' }, { value: "Rejected", label: 'Rejected' },
      //     { value: "Approved", label: 'Approved' }],
      //   },
      //   // minWidth: 90, 
      //   // maxWidth: 90,  Applied = 100,

      // },
      // {
      //   id: 'edit',
      //   field: 'Id',
      //   excludeFromHeaderMenu: true,
      //   formatter: this.editFormatter,
      //   minWidth: 40,
      //   maxWidth: 40,
      //   onCellClick: (e: Event, args: OnEventArgs) => {


      //   }
      // },
      // {
      //   id: 'cancel',
      //   field: 'Id',
      //   excludeFromHeaderMenu: true,
      //   formatter: this.viewFormatter,
      //   minWidth: 40,
      //   maxWidth: 40,
      //   onCellClick: (e: Event, args: OnEventArgs) => {


      //   }
      // },

      {
        id: 'EmployeeCode', name: 'Employee Code', field: 'EmployeeCode',
        sortable: true,
        filterable: true,
        type: FieldType.string,
      },
      {
        id: 'EmployeeName', name: 'Employee Name', field: "EmployeeName",
        sortable: true,
        filterable: true,
        type: FieldType.string,


      },
      {
        id: 'Batch', name: 'Batch #', field: 'Batch',
        sortable: true,
        filterable: true,
        type: FieldType.string,
      },

      {
        id: 'BatchName', name: 'Batch Name', field: 'BatchName',
        sortable: true,
        type: FieldType.string,
        filterable: true,

        // minWidth: 80,
        // maxWidth: 80,
      },
      {
        id: 'BatchDate', name: 'Requested Date', field: 'BatchDate',
        sortable: true,
        type: FieldType.string,
        filterable: true,
        formatter: this.DateFormatter
        // minWidth: 80,
        // maxWidth: 80,
      },
      {
        id: 'RequestedAmount', name: 'Amount (₹)', field: "RequestedAmount",
        sortable: true,
        filterable: true,
        type: FieldType.string,

      },
      {
        id: 'Remarks', name: 'Remarks', field: "Remarks",
        sortable: true,
        filterable: true,
        type: FieldType.string,

      },
      {
        id: 'StatusName', name: 'Status', field: 'StatusName',
        sortable: true,
        type: FieldType.string,
        formatter: highlightingFormatter,
        filterable: true,
        filter: {
          model: Filters.singleSelect,
          collection: [{ value: '', label: 'All' }, { value: "Applied", label: 'Applied' }, { value: "Cancelled", label: 'Cancelled' }, { value: "Rejected", label: 'Rejected' },
          { value: "Approved", label: 'Approved' }],
        },
        // minWidth: 90, 
        // maxWidth: 90,  Applied = 100,

      },
      {
        id: 'edit',
        field: 'Id',
        excludeFromHeaderMenu: true,
        formatter: this.editFormatter,
        minWidth: 40,
        maxWidth: 40,
        onCellClick: (e: Event, args: OnEventArgs) => {


        }
      },
      {
        id: 'cancel',
        field: 'Id',
        excludeFromHeaderMenu: true,
        formatter: this.viewFormatter,
        minWidth: 40,
        maxWidth: 40,
        onCellClick: (e: Event, args: OnEventArgs) => {


        }
      },


    ];

  }

  onSelectedEmployeeChange(data, args) {
    this.inEmployeesInitiateSelectedItems = [];
    if (args != null && args.rows != null && args.rows.length > 0) {
      for (let i = 0; i < args.rows.length; i++) {
        var row = args.rows[i];
        var row_data = this.inEmployeesInitiateDataView.getItem(row);
        this.inEmployeesInitiateSelectedItems.push(row_data);
      }
    }
    console.log('SELECTED ITEMS ::', this.inEmployeesInitiateSelectedItems);

  }

  inEmployeesInitiateGridReady(angularGrid: AngularGridInstance) {
    this.inEmployeesInitiateGridInstance = angularGrid;
    this.inEmployeesInitiateDataView = angularGrid.dataView;
    this.inEmployeesInitiateGrid = angularGrid.slickGrid;
    this.inEmployeesInitiateGridService = angularGrid.gridService;
  }

  clickEvent(whichButton) {
    if (whichButton == '1') {
      this.isCliekedPendingBtn = true;
      this.isCliekedSubmittedBtn = false;


    } else if (whichButton == '2') {
      this.isCliekedSubmittedBtn = true;
      this.isCliekedPendingBtn = false;

    }
  }

  do_editAppliedRequest(item) {
    console.log('item', item);

    item['InputRemarks'] = item.Remarks;
    if (item.Status == 300) {

      if (item.Remarks.includes('Employee')) {
        let popWord = item.Remarks.split('|')[0];
        popWord = popWord.split(":").pop();
        console.log('popWord', popWord);
        item.InputRemarks = popWord

      }
    }
    this.openDrawer(item);

  }




  getExpenseConfigurationByEmployeeId() {
    const promise = new Promise((resolve, reject) => {


      this.spinner = true;
      // FETCH EMPLOYEE BASIC DETAILS BY EMPLOYEE CODE (LOGIN CODE)

      this.employeeService.GetEmployeeRequiredDetailsById(this.EmployeeId, EmployeeMenuData.Profile).subscribe((result) => {
        try {
          let apiResult: apiResult = result;
          console.log('EMP REQUIRED DATA PROFILE ::', apiResult)
          if (apiResult.Status && apiResult.Result != null) {
            const Object: EmployeeDetails = apiResult.Result as any;
            Object.EmploymentContracts != null && Object.EmploymentContracts.length > 0 ? this.GetCompanySettings(Object.EmploymentContracts[0].CompanyId, Object.EmploymentContracts[0].ClientId, Object.EmploymentContracts[0].ClientContractId) : true;
            this.objStorageJson = { CompanyId: Object.EmploymentContracts[0].CompanyId, ClientId: Object.EmploymentContracts[0].ClientId, ClientContractId: Object.EmploymentContracts[0].ClientContractId, EmployeeId: Object.EmploymentContracts[0].EmployeeId }
            this._employeeId = Object.Id;
            this.get_pagelayout();
            this.get_pagelayout1();

            // FETCH EXPENSE CONFIGURATION 
            this.reimbursementService.FetchReimbursementConfigurationByEmployeeId(this._employeeId)
              .subscribe((expenseConfigObj) => {
                try {
                  resolve(true);
                  console.log('EXPENSE CONFIGURATION ::', expenseConfigObj);
                  let resultObj: apiResult = expenseConfigObj;
                  if (resultObj.Status && resultObj.Result != null) {
                    this.expenseConfiguration = resultObj.Result as any;
                    if (this.expenseConfiguration.ProductConfigurationList != null && this.expenseConfiguration.ProductConfigurationList.length > 0) {
                      this.spinner = false;
                      this.LstCategory = this.expenseConfiguration.ProductConfigurationList;
                    } else {
                      this.spinner = false;
                      this.alertService.showWarning('Employee expense product information is not available');
                      return;
                    }
                  }
                } catch (Exception) {
                  resolve(true);
                  this.alertService.showWarning('Expense Configuration : Something bas has happend ! ' + Exception);
                  this.spinner = false;
                }

              }, err => {

              })

            this.getMigrationMasterInfo(Object.EmploymentContracts[0].ClientContractId);

            this.reimbursementService.FetchExpenseEligibilityCriteriaByEmployeeId(this._employeeId, 0).subscribe(data => {
              try {
                console.log('EXPENSE Default CONFIGURATION ::', data);
                let resultObj: apiResult = data;
                resolve(true);
                if (resultObj.Status && resultObj.Result != null) {
                  this.defaultExpenseEligibilityCriteria = resultObj.Result as any;
                }
                else {
                  this.spinner = false;
                  // this.alertService.showWarning('Default expense configuration not found');
                  return;
                }
              }
              catch (ex) {

              }
            })

          }

        } catch (Exception) {
          resolve(true);
          this.spinner = false;
          this.alertService.showWarning('Employee Information : Something bas has happend ! ' + Exception);
        }

      }, err => {

      });
    })
    return promise;


    // this.employeeService.FetchEmployeeDetailsByEmployeeCode(req_params_Uri)
    //   .subscribe((employeeObj) => {
    //     try {
    //       const apiResponse: apiResult = employeeObj;
    //       if (apiResponse.Status && apiResponse.Result != null) {
    //         const Object: EmployeeDetails = apiResponse.Result as any;
    //         Object.EmploymentContracts != null && Object.EmploymentContracts.length > 0 ? this.GetCompanySettings(Object.EmploymentContracts[0].CompanyId, Object.EmploymentContracts[0].ClientId, Object.EmploymentContracts[0].ClientContractId) : true;
    //         this.objStorageJson = { CompanyId: Object.EmploymentContracts[0].CompanyId, ClientId: Object.EmploymentContracts[0].ClientId, ClientContractId: Object.EmploymentContracts[0].ClientContractId, EmployeeId: Object.EmploymentContracts[0].EmployeeId }
    //         this._employeeId = Object.Id;

    //         this.get_pagelayout();
    //         this.get_pagelayout1();
    //         this.getMigrationMasterInfo(Object.EmploymentContracts[0].ClientContractId);
    //         // FETCH EXPENSE CONFIGURATION 
    //         this.reimbursementService.FetchReimbursementConfigurationByEmployeeId(this._employeeId)
    //           .subscribe((expenseConfigObj) => {
    //             try {
    //               console.log('EXPENSE CONFIGURATION ::', expenseConfigObj);
    //               let resultObj: apiResult = expenseConfigObj;
    //               if (resultObj.Status && resultObj.Result != null) {
    //                 this.expenseConfiguration = resultObj.Result as any;
    //                 if (this.expenseConfiguration.ProductConfigurationList != null && this.expenseConfiguration.ProductConfigurationList.length > 0) {
    //                   this.spinner = false;
    //                   this.LstCategory = this.expenseConfiguration.ProductConfigurationList;
    //                 } else {
    //                   this.spinner = false;
    //                   this.alertService.showWarning('Employee expense product information is not available');
    //                   return;
    //                 }
    //               }
    //             } catch (Exception) {
    //               this.alertService.showWarning('Expense Configuration : Something bas has happend ! ' + Exception);
    //               this.spinner = false;
    //             }

    //           }, err => {

    //           })

    //         this.reimbursementService.FetchExpenseEligibilityCriteriaByEmployeeId(this._employeeId, 0).subscribe(data => {
    //           try {
    //             console.log('EXPENSE Default CONFIGURATION ::', data);
    //             let resultObj: apiResult = data;
    //             if (resultObj.Status && resultObj.Result != null) {
    //               this.defaultExpenseEligibilityCriteria = resultObj.Result as any;
    //             }
    //             else {
    //               this.spinner = false;
    //               this.alertService.showWarning('Default expense configuration not found');
    //               return;
    //             }
    //           }
    //           catch (ex) {

    //           }
    //         })

    //       }

    //     } catch (Exception) {
    //       this.spinner = false;
    //       this.alertService.showWarning('Employee Information : Something bas has happend ! ' + Exception);
    //     }

    //   })

  }

  getMigrationMasterInfo(ClientContractId) {

    this.onboardingService.getMigrationMasterInfo(ClientContractId).subscribe((result) => {
      let apiResult: apiResult = (result);
      if (apiResult.Status && apiResult.Result != null) {
        var MigrationInfoGrp = [];
        MigrationInfoGrp = JSON.parse(apiResult.Result);
        console.log('MigrationInfoGrp', MigrationInfoGrp);

        if (MigrationInfoGrp != null && MigrationInfoGrp.length > 0) {
          this.ManagerList = MigrationInfoGrp[0].ReportingManagerList;
        }
      } else {

      }

    }), ((error) => {

    })
  }
  onChangeManagerName(event) {
    this.expenseApproverName = event.ManagerId;
  }


  GetCompanySettings(_companyId, _clientId, _clientContractId) {
    const promise = new Promise((res, rej) => {
      var settingsName = "ReportingManager_RoleCode";
      this.attendanceService.GetCompanySettings(_companyId, _clientId, _clientContractId, settingsName)
        .subscribe((result) => {
          console.log('result result result', result);
          let apiR: apiResult = result;
          if (apiR.Status && apiR.Result != null) {
            var jobject = apiR.Result as any;
            var jSettingValue = JSON.parse(jobject.SettingValue);
          }

        })
    })
    return promise;
  }




  /* #region EVERTHING THAT WORKS PAGELAYOUT IS WRITTERN HERE  */

  get_pagelayout() {

    const promise = new Promise((res, rej) => {
      this.spinner = true;
      this.pageLayout = null;
      this.spinner = true;
      this.pageLayoutService.getPageLayout(this.code).subscribe(data => {
        if (data.Status === true && data.dynamicObject != null) {
          this.pageLayout = data.dynamicObject;
          console.log('EXPENSE UNCLAIM/CLAIM REQUEST LIST ::', this.pageLayout);
          this.setGridConfiguration();
          if (this.pageLayout.GridConfiguration.ShowDataOnLoad) {
            this.getDataset();
          }
          res(true)
        }
        else {
          res(true)
        }

      }, error => {
        console.log(error);

      }
      );
    })
    return promise;
  }
  get_pagelayout1() {

    const promise = new Promise((res, rej) => {

      this.pageLayout1 = null;
      this.spinner = true;
      this.pageLayoutService.getPageLayout(this.code1).subscribe(data => {
        if (data.Status === true && data.dynamicObject != null) {
          this.pageLayout1 = data.dynamicObject;
          console.log('EXPENSE UNCLAIM/CLAIM REQUEST LIST ::', this.pageLayout1);
          // this.setGridConfiguration1();
          if (this.pageLayout1.GridConfiguration.ShowDataOnLoad) {
            this.getDataset1();
          }
          res(true)
        }
        else {
          res(true)
        }

      }, error => {
        console.log(error);

      }
      );
    })
    return promise;
  }


  setGridConfiguration() {
    if (!this.pageLayout.GridConfiguration.IsDynamicColumns) {
      // let  collection: [{ value: '', label: 'All' }, { value: "Submitted", label: 'Submitted' }, { value: "Not Submitted", label: 'Not Submitted' }];
      this.inEmployeesInitiateColumnDefinitions = this.pageLayoutService.setColumns(this.pageLayout.GridConfiguration.ColumnDefinitionList);
    }
    this.inEmployeesInitiateGridOptions = this.pageLayoutService.setGridOptions(this.pageLayout.GridConfiguration);
    this.inEmployeesInitiateGridOptions.draggableGrouping = {
      dropPlaceHolderText: 'Drop a column header here to group by the column',
      // groupIconCssClass: 'fa fa-outdent',
      deleteIconCssClass: 'fa fa-times',
      // onGroupChanged: (e, args) => this.onGroupChange(),
      // onExtensionRegistered: (extension) => this.draggableGroupingPlugin = extension,
    }

  }

  setGridConfiguration1() {
    if (!this.pageLayout1.GridConfiguration.IsDynamicColumns) {
      // let  collection: [{ value: '', label: 'All' }, { value: "Submitted", label: 'Submitted' }, { value: "Not Submitted", label: 'Not Submitted' }];
      this.inEmployeesInitiateColumnDefinitions = this.pageLayoutService.setColumns(this.pageLayout.GridConfiguration.ColumnDefinitionList);
    }
    this.inEmployeesInitiateGridOptions = this.pageLayoutService.setGridOptions(this.pageLayout.GridConfiguration);
    this.inEmployeesInitiateGridOptions.draggableGrouping = {
      dropPlaceHolderText: 'Drop a column header here to group by the column',
      // groupIconCssClass: 'fa fa-outdent',
      deleteIconCssClass: 'fa fa-times',
      // onGroupChanged: (e, args) => this.onGroupChange(),
      // onExtensionRegistered: (extension) => this.draggableGroupingPlugin = extension,
    }

  }


  getDataset() {
    this.selectedItems = [];
    this.LstExpenseUnClaimedRequest = [];
    this.LstExpenseUnClaimedRequest_Rejected = [];
    if (this.pageLayout.SearchConfiguration.SearchElementList.find(item => item.FieldName == '@employeeId') != undefined) {
      this.pageLayout.SearchConfiguration.SearchElementList.find(item => item.FieldName == '@employeeId').Value = this._employeeId
    }
    this.pageLayoutService.getDataset(this.pageLayout.GridConfiguration.DataSource, this.pageLayout.SearchConfiguration.SearchElementList).subscribe(dataset => {

      if (dataset.Status == true && dataset.dynamicObject !== null && dataset.dynamicObject !== '') {
        // this.GlobalLstUnClaimRequest = [];
        this.LstExpenseUnClaimedRequest = JSON.parse(dataset.dynamicObject);
        // this.GlobalLstUnClaimRequest.length > 0 ? this.LstExpenseUnClaimedRequest = this.GlobalLstUnClaimRequest.filter(a => a.Status == 100) : true;
        // this.GlobalLstUnClaimRequest.length > 0 ? this.LstExpenseUnClaimedRequest_Rejected = this.GlobalLstUnClaimRequest.filter(a => a.Status == 300) : true;
        console.log('Unclaimed Request List : ', this.LstExpenseUnClaimedRequest);
        this.LstExpenseUnClaimedRequest.length > 0 && this.LstExpenseUnClaimedRequest.forEach(e3 => {
          e3.DocumentDate = new Date(e3.DocumentDate);
        });
        console.log('Unclaimed Request List : ', this.LstExpenseUnClaimedRequest);

        this.LstExpenseUnClaimedRequest = _.orderBy(this.LstExpenseUnClaimedRequest, ["LastUpdatedOn"], ["desc"]);


        try {

        } catch (error) {

        }

      }
      else {
        console.log('Sorry! Could not Fetch Data|', dataset);
      }
    }, error => {

      console.log(error);
    })
  }
  getDataset1() {
    this.selectedItems = [];
    this.LstExpenseClaimedRequest = [];
    this.LstExpenseUnClaimedRequest_Rejected =[];
    this.LstExpenseClaimedRequestSubmitted = [];
    if (this.pageLayout1.SearchConfiguration.SearchElementList.find(item => item.FieldName == '@employeeId') != undefined) {
      this.pageLayout1.SearchConfiguration.SearchElementList.find(item => item.FieldName == '@employeeId').Value = this._employeeId
    }
    console.log('this.pageLayout 2', this.pageLayout1);

    this.pageLayoutService.getDataset(this.pageLayout1.GridConfiguration.DataSource, this.pageLayout1.SearchConfiguration.SearchElementList).subscribe(dataset => {

      console.log('dataset.dynamicObject', dataset.dynamicObject);
      if (dataset.Status == true && dataset.dynamicObject !== null && dataset.dynamicObject !== '') {
        this.LstExpenseClaimedRequest = JSON.parse(dataset.dynamicObject);
        this.LstExpenseClaimedRequest = _.orderBy(this.LstExpenseClaimedRequest, ["Id"], ["desc"]);
        var glob = [];
        glob = this.LstExpenseClaimedRequest;
        console.log('Claimed Request List : ', this.LstExpenseClaimedRequest);

        this.LstExpenseClaimedRequest = glob.filter(a => a.IsClaimed == 1);
        this.LstExpenseClaimedRequestSubmitted = glob.filter(a => a.IsPendingForApproval == 1);
        this.LstExpenseUnClaimedRequest_Rejected = glob.filter(a => a.hasRejected == 1);

      }
      else {
        console.log('Sorry! Could not Fetch Data|', dataset);
      }
    }, error => {

      console.log(error);
    })
  }


  onCellClicked(e, args) {
    const metadata = this.inEmployeesInitiateGridInstance.gridService.getColumnFromEventArguments(args);

    if (metadata.columnDef.id === 'expenseEdit' && metadata.dataContext.Status == 100) {

      // this.common_approve_reject('edit', false, (metadata.dataContext), 'parent');
      return;
    }
    else if (metadata.columnDef.id === 'expenseDelete' && metadata.dataContext.Status == 100) {

      // this.common_approve_reject('edit', true, (metadata.dataContext), 'parent');
      return;
    }

    else {
      return;
      // this.alertService.showWarning('Action was blocked : Invalid Leave request - that  leave request is already approved/rejected.')
    }
  }

  /* #endregion */


  getStatusName(status) {
    return this._statusList.find(a => a.id == status).name;
  }

  selectClaimRequest(obj) {

    console.log('Object ', obj);

    let updateItem = this.LstExpenseUnClaimedRequest.find(i => i.Id == obj.Id);
    let index = this.selectedClaimReqs.indexOf(updateItem);

    console.log(index);

    if (index > -1) {
      this.selectedClaimReqs.splice(index, 1);
    }
    else {
      this.selectedClaimReqs.push(obj);
    }

    var totalLength = 0;
    this.LstExpenseUnClaimedRequest.forEach(e => {
      totalLength = totalLength + 1;
    });
    if (totalLength === this.selectedClaimReqs.length) {
      this.selectAll = true;
    }
    else {
      this.selectAll = false;
    }

    this.countOfExpense = this.selectedClaimReqs.length;
    console.log('Selected_Claim_Reqs : ', this.selectedClaimReqs);

  }
  selectAllClaimRequest(event: any) {
    this.selectedClaimReqs = [];

    this.LstExpenseUnClaimedRequest.forEach(e => {

      event.target.checked == true ? e.isSelected = true : e.isSelected = false
    });


    if (event.target.checked) {
      this.LstExpenseUnClaimedRequest.forEach(e => {
        this.selectedClaimReqs.push(e);
      });
    } else {
      this.selectedClaimReqs = [];
    }
  }

  submitForApproval() {
    if (this.selectedClaimReqs.length == 0) {
      this.alertService.showWarning('Please select at leaset one item and try again.');
      return;
    }

    if (this.selectedClaimReqs.filter(a => a.Status == 300).length > 0) {
      this.alertService.showWarning("Error : One or more claim request items cannot be submitted because the status is in an invalid state (Rejected). ");
      return;
    }

    this._totalAmount = 0;
    this._totalClaims = 0;
    this.expenseApproverName = null;
    this.expenseBatchName = null;

    this.selectedClaimReqs.forEach(e => {
      e.ApproverUserId = this.expenseApproverName,
        this._totalAmount += parseInt(e.RequestedAmount)
    });
    this._totalClaims = this.selectedClaimReqs.length;


    var invalidClaimRequest: boolean = false;
    var productIds = [];
    this.selectedClaimReqs.forEach(element => {
      productIds.push(element.ProductId);

    });


    let findDuplicates = arr => arr.filter((item, index) => arr.indexOf(item) != index)
    // console.log(findDuplicates(productIds)) // All duplicates
    var i = [...(findDuplicates(productIds))];  // Unique duplicates
    // console.log('i', i);
    if (i.length > 0) {

      for (let j = 0; j < i.length; j++) {
        const e = i[j];
        var categoryDetails = this.LstCategory.find(z => z.ProductId == e);
        if (categoryDetails != null && categoryDetails.EligibilityCriteria != null && categoryDetails.EligibilityCriteria.IsAllowMultipleInBatch == false) {
          invalidClaimRequest = true;
          break;
        }
      }

    }
    if (invalidClaimRequest == true) {
      this.alertService.showWarning('One or several categories of requests are duplicated. please select unique claim request and try again.');
      return;

    }

    if (invalidClaimRequest == false) {
      $('#expense_batch').modal('show');
    }

    // this.reimbursementService.UpsertExpenseClaimRequest()
  }

  confirm_submit_claimApproval() {

    if (this.expenseBatchName == '' || this.expenseBatchName == null || this.expenseBatchName == undefined) {
      this.alertService.showWarning('Please enter claim batch name');
      return;

    } else if ((this.defaultExpenseEligibilityCriteria != null && this.defaultExpenseEligibilityCriteria.IsAllowToInputApproverForEmployee) && (this.expenseApproverName == '' || this.expenseApproverName == null || this.expenseApproverName == undefined)) {
      this.alertService.showWarning('Please choose manager name');
      return;
    }
    else {
      console.log("Choose Manager ::", this.expenseApproverName);
      this.loadingScreenService.startLoading();
      var sum = 0;
      this.selectedClaimReqs.forEach(e => {
        e.ApproverUserId = this.expenseApproverName,
          sum += parseInt(e.RequestedAmount)
      });

      var expenseBatch = new ExpenseBatch();
      expenseBatch.EmployeeId = this._employeeId;
      expenseBatch.Name = this.expenseBatchName;
      expenseBatch.TotalRequestedAmount = sum;
      expenseBatch.TotalApprovedAmount = 0;
      expenseBatch.TotalNoOfDocuments = this.selectedClaimReqs.length;
      expenseBatch.TotalNoOfRequests = this.selectedClaimReqs.length;
      expenseBatch.RejectedClaimIds = [];
      // expenseBatch.ModuleProcessTransactionId = 0;
      // expenseBatch.TimeCardId = 0;
      // expenseBatch.ApproverUserId = 0;
      expenseBatch.Status = 1;
      expenseBatch.ExpenseClaimRequestList = this.selectedClaimReqs;
      expenseBatch.ExpenseClaimRequestList.forEach(x => {
        x.ModeType = UIMode.Edit;
        x.ApproverUserId = this.defaultExpenseEligibilityCriteria != null && this.defaultExpenseEligibilityCriteria.IsAllowToInputApproverForEmployee ?
          (this.expenseApproverName !== null && this.expenseApproverName !== undefined ? this.expenseApproverName : 0) : 0;
      });
      expenseBatch.ModeType = UIMode.Edit;
      var role = new UserHierarchyRole();
      role.IsCompanyHierarchy = false;
      role.RoleCode = this.Role.Code;
      role.RoleId = this.Role.Id;

      var submitExpenseBatchModel = new SubmitExpenseBatchModel();
      submitExpenseBatchModel.ExpenseBatch = expenseBatch;
      submitExpenseBatchModel.ModuleProcessAction = 40;
      submitExpenseBatchModel.Role = role;
      submitExpenseBatchModel.ActionProcessingStatus = 30000;
      submitExpenseBatchModel.Remarks = '';
      submitExpenseBatchModel.ClientId = this.objStorageJson.ClientId;
      submitExpenseBatchModel.ClientContractId = this.objStorageJson.ClientContractId;
      submitExpenseBatchModel.CompanyId = this.objStorageJson.CompanyId;


      console.log('expenseBatch', submitExpenseBatchModel);
      // this.loadingScreenService.stopLoading();
      // return;

      this.reimbursementService.SubmitExpenseBatch(submitExpenseBatchModel)
        .subscribe((expenseBatchReqgObj) => {
          try {
            console.log('UPSERT EXPENSE BATCH ::', expenseBatchReqgObj);
            let resultObj: apiResult = expenseBatchReqgObj;
            if (resultObj.Status && resultObj.Result != null) {
              this.loadingScreenService.stopLoading();
              this.alertService.showSuccess(resultObj.Message);
              this.close_expensebatch_popup();
            }
            else {
              this.close_expensebatch_popup();
              this.loadingScreenService.stopLoading();
              this.alertService.showWarning('An error occcurred : ' + resultObj.Message);
            }

            this.ExpenseErrorList = resultObj.Result as any;
            if (this.ExpenseErrorList.length > 0) {
              this.ExpenseErrorList != null && this.ExpenseErrorList.length > 0 && this.ExpenseErrorList.forEach(ee => {
                var existingProduct = ee.ExpenseClaimRequest;
                existingProduct['ProductName'] = this.LstCategory != null && this.LstCategory.length > 0 && this.LstCategory.find(a => a.ProductId == existingProduct.ProductId) != undefined ? this.LstCategory.find(a => a.ProductId == existingProduct.ProductId).DisplayName : '---';
              });
            }
            $('#expense_batch_claimrequest').modal('show');



          } catch (Exception) {
            this.loadingScreenService.stopLoading();
            this.alertService.showWarning('Expense Batch Request : Something bas has happend ! ' + Exception);
          }

        }, err => {
          this.loadingScreenService.stopLoading();
          this.alertService.showWarning('Expense Batch Request : Something bas has happend ! ' + err);

        })

    }

  }
  close_expensebatch_claimrequest_popup() {
    $('#expense_batch_claimrequest').modal('hide');
    this.onRefresh();

  }
  close_expensebatch_popup() {
    $('#expense_batch').modal('hide');
  }

  seeMore() {
    if (this.seeMoreText == 'See more') {
      this.tobeShown = this.LstExpenseUnClaimedRequest.length;
      this.seeMoreText = 'See less';
    } else {
      this.tobeShown = 2;
      this.seeMoreText = 'See more';
    }

  }

  seeMore_rejected() {
    if (this.seeMoreText_rejected == 'See more') {
      this.tobeShown_rejcted = this.LstExpenseUnClaimedRequest_Rejected.length;
      this.seeMoreText_rejected = 'See less';
    } else {
      this.tobeShown_rejcted = 2;
      this.seeMoreText_rejected = 'See more';
    }

  }

  seeMore_unclaimed_submitted() {
    if (this.seeMoreText_unclaimed_submitted == 'See more') {
      this.tobeShown_unclaimed = this.LstExpenseClaimedRequestSubmitted.length;
      this.seeMoreText_unclaimed_submitted = 'See less';
    } else {
      this.tobeShown_unclaimed = 2;
      this.seeMoreText_unclaimed_submitted = 'See more';
    }

  }

  seeMore_claimed_submitted() {
    if (this.seeMoreText_claimed_submitted == 'See more') {
      this.tobeShown_claimed = this.LstExpenseClaimedRequest.length;
      this.seeMoreText_claimed_submitted = 'See less';
    } else {
      this.tobeShown_claimed = 2;
      this.seeMoreText_claimed_submitted = 'See more';
    }

  }


  do_viewDocuments(item) {
    this.rowData = item;
    console.log('row', this.rowData);

    this.rowData.ExpenseClaimRequestList != null && this.rowData.ExpenseClaimRequestList.length > 0 && this.rowData.ExpenseClaimRequestList.forEach(ee => {
      ee['ProductName'] = this.LstCategory != null && this.LstCategory.length > 0 && this.LstCategory.find(a => a.ProductId == ee.ProductId) != undefined ? this.LstCategory.find(a => a.ProductId == ee.ProductId).DisplayName : '---';

    });
    this.viewExpenseClaimRequestSlider = true;
  }


  close_viewExpenseClaimRequestSlider() {
    this.rowData = null;
    this.viewExpenseClaimRequestSlider = false;

  }

  do_seeDocs(item) {

    const modalRef = this.modalService.open(ViewdocsModalComponent, this.modalOption);
    modalRef.componentInstance.editObject = item;
    modalRef.componentInstance.Role = this.Role;
    modalRef.componentInstance.IsVerification = false;

    modalRef.componentInstance.objStorageJson = { CompanyId: this.rowData.CompanyId, ClientId: this.rowData.ClientId, ClientContractId: this.rowData.ClientContractId, EmployeeId: this.rowData.EmployeeId }

    modalRef.result.then((result) => {
      if (result != "Modal Closed") {
        console.log('result', result);
      }
    }).catch((error) => {
      console.log(error);
    });

  }

  ShowRejectionRemarksAlone(item) {

    // if (item.Remarks.includes('Manager')) {
    //   var popWord = item.Remarks.split("Manager").pop();
    //   popWord = popWord.split(":").pop();

    //   if (popWord.includes('Finance')) {
    //     console.log('ste');
    //     popWord = popWord.split("Finance").pop();
    //     popWord = popWord.split(":").pop();
    //     return popWord;
    //   }

    //   return popWord;
    // }


    // else {
    return item.Remarks;
    // }

  }

  getRejectedClaimsAmt(item) {
    let claimAmt = 0;
    item.ExpenseClaimRequestList.length > 0 && item.ExpenseClaimRequestList.forEach(e1 => {
      if (e1.Status == 300) {
        claimAmt += e1.RequestedAmount
      }
    });
    return claimAmt;
  }

  getRejectedClaims(item) {
    let rejectedCts = 0;
    item.ExpenseClaimRequestList.length > 0 ? rejectedCts = item.ExpenseClaimRequestList.filter(a => a.Status == 300).length : 0
    return rejectedCts;
  }

}
