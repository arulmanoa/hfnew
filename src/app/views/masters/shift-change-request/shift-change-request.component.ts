import { Component, OnInit } from '@angular/core';

import {
  AngularGridInstance,
  Column,
  Editors,
  EditorArguments,
  EditorValidator,
  FieldType,
  Filters,
  Formatter,
  Formatters,
  GridOption,
  OnEventArgs,
  GridService,
  GridStateChange,
  CellArgs
} from 'angular-slickgrid';
import { FormGroup, FormBuilder, FormControl, Validators, AbstractControl, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from "sweetalert2";

import * as _ from 'lodash';
import { SessionStorage } from '../../../_services/service/session-storage.service';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { LoginResponses } from '../../../_services/model/Common/LoginResponses';
import { apiResult } from 'src/app/_services/model/apiResult';

import { AlertService, HeaderService } from 'src/app/_services/service';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
import { Title } from '@angular/platform-browser';
import { RowDataService } from '../../personalised-display/row-data.service';
import moment from 'moment';
import { environment } from 'src/environments/environment';
import { AttendanceService } from 'src/app/_services/service/attendnace.service';
import { ShiftChangeRequestStatus } from 'src/app/_services/model/Attendance/AttendanceEnum';

@Component({
  selector: 'app-shift-change-request',
  templateUrl: './shift-change-request.component.html',
  styleUrls: ['./shift-change-request.component.css']
})
export class ShiftChangeRequestComponent implements OnInit {
  
  spinner: boolean = true;
  shiftChangeForm: FormGroup;

  periodFromMinDate: any;
  periodToMinDate: any;
  submitted: boolean = false;

  _loginSessionDetails: LoginResponses;
  employeeId: any;
  UserId: any;
  RoleId: any;
  businessType: any;
  companyId: any;
  clientId: any;
  RoleCode: string | any;

  // manager slick grid
  angularGrid!: AngularGridInstance;
  columnDefinitions: Column[];
  gridOptions: GridOption;
  gridDataView: any;
  gridData: any
  gridObj: any;
  selectedDataSet: any = [];
  // employee slick grid

  angularGridForEmployee!: AngularGridInstance;
  columnDefinitionsForEmployee!: Column[];
  gridOptionsForEmployee!: GridOption;
  gridObjForEmployee: any;

  shiftChangeDataset: any;
  shiftList = [];
  isManager: boolean = false;
  isEmployee: boolean = false;
  isDrawerVisible: boolean = false;

 

  constructor(
    private alertService: AlertService,
    private formBuilder: FormBuilder,
    private loadingScreenService: LoadingScreenService,
    public sessionService: SessionStorage,
    private route: ActivatedRoute,
    private titleService: Title,
    private headerService: HeaderService,
    private rowDataService: RowDataService,
    private attendanceService: AttendanceService,
    private router: Router
  ) { }

  ngOnInit() {
    this.spinner = true;
    this._loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses));
    console.log('_loginSessionDetails', this._loginSessionDetails);
    this.UserId = this._loginSessionDetails.UserSession.UserId;
    this.RoleId = this._loginSessionDetails.UIRoles[0].Role.Id;
    this.RoleCode = this._loginSessionDetails.UIRoles[0].Role.Code;
    this.clientId = (this._loginSessionDetails.ClientList && this._loginSessionDetails.ClientList.length > 0) ? this._loginSessionDetails.ClientList[0].Id as any : 0;
    this.businessType = this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping != null 
      ? this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this._loginSessionDetails.Company.Id).BusinessType : 0;
    
    if (this.businessType != 3) {
      const lstClients = this._loginSessionDetails.ClientList;
      this.clientId = (this.sessionService.getSessionStorage("default_SME_ClientId") == null || this.sessionService.getSessionStorage("default_SME_ClientId") == undefined) ? 
      lstClients.find(item => item.IsDefault).Id : this.sessionService.getSessionStorage("default_SME_ClientId"); // client id
    }
    this.employeeId = this._loginSessionDetails.EmployeeId;
    this.companyId = this._loginSessionDetails.Company.Id;

    

   
    this.isEmployee = this.RoleCode.toLowerCase() === 'employee'; // returns true or false

   this.isEmployee ? this.prepareGridForEmployee() : this.prepareGridForManager(); 

    console.log('INIT SHIFT CHANGE', this.isEmployee,  this.RoleCode);
    this.titleService.setTitle('Shift Change Request');
    
    this.doRefresh();
  }

  doRefresh() {
  
    if (this.isEmployee) {
      this.spinner = true;
      this.loadDataForEmployee();
      const today = new Date();
      const maxPastDayAllowed = environment.environment.MaxPastDaysAllowedForShiftChange;
      const minDate = today.setDate(today.getDate() - maxPastDayAllowed);
      this.periodFromMinDate = new Date(minDate);
      this.createForm();
      this.spinner = false;
    } else {
      this.spinner = true;
      this.getAllShiftRequestDataForMananger();
      this.spinner = false;
    }
  }

  loadDataForEmployee() {
    this.attendanceService.GetWorkShiftDefinitionsForAClient(this.clientId).subscribe((result) => {
      this.shiftList = [];
      if (result.Status && result.Result != '') {
        result.Result.map(e => {
          e.modifiedStartTime = moment(e.StartTime, ["HH:mm"]).format("LT"),
          e.modifiedEndTime = moment(e.EndTime, ["HH:mm"]).format("LT");
        });
        this.shiftList = result.Result;
        this.loadingScreenService.stopLoading();
        console.log('shiftList', this.shiftList);
      } else {
        this.loadingScreenService.stopLoading();
        this.alertService.showWarning(result.Message);
      }
      // this.createForm();
      this.getShiftRequestDataForEmployee();
      
    }, err => {
      console.log('ERROR IN API : GetWorkShiftDefinitionsForAClient', err);
    });
  }

  DateFormatter(rowIndex: any, cell: any, value: moment.MomentInput, columnDef: any, grid: any, dataProvider: any) {
    if (value == null || value === "") { return "---"; }
    return moment(value).format('ll'); // shows like this Apr 11, 2023
  }

  
  get g() { return this.shiftChangeForm.controls; } // reactive forms validation 

  createForm() {
    this.shiftChangeForm = this.formBuilder.group({
      Id: [0],
      PeriodFrom: [new Date(), Validators.required],
      PeriodTo: [new Date(), Validators.required],
      selectedShift: [null, Validators.required],
      ApplierRemarks:['']
    });
  }

  getAllShiftRequestDataForMananger() {
    this.attendanceService.getAllShiftRequestForMananger(this.UserId).subscribe((result) => {
      console.log('getAllShiftRequestForMananger', result);
      if (result.Status && result.Result != '') {
        this.shiftChangeDataset = JSON.parse(result.Result);
      } else {
        this.shiftChangeDataset = [];
        result.Status ? this.alertService.showSuccess('No Data Available !') : this.alertService.showWarning(result.Message);
      }
    });
  }

  getShiftRequestDataForEmployee() {
    this.attendanceService.getShiftRequestForAnEmployee(this.employeeId).subscribe((response) => {
      console.log('getShiftRequestForAnEmployee', response);
      if (response.Status && response.Result && response.Result != '') {
        let res = JSON.parse(response.Result);
        const statusMap = { 1: 'Pending', 2: 'Approved', 3: 'Rejected' };
        res.forEach(el => {
          el.Status = statusMap[el.Status] || el.Status;
        });
        this.shiftChangeDataset = res;
      } else {
        this.shiftChangeDataset = [];
        response.Status && response.Result == '' ? this.alertService.showSuccess('No Data Available !') : this.alertService.showWarning(response.Message);
      }
    }, err => {
      console.log('ERROR IN API : getShiftRequestForAnEmployee', err)
    });
  } 

  prepareGridForManager() {
    const decline_reqFormatter: Formatter = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) =>
    value ? `<a href="javascript:;" class="btn action-edit" style="margin-right: 5px;font-size: 12px;background: #F5F5F5;
    min-width: 32px; min-height: 32px; padding: 4px; border-radius: 50%; font-weight: 800 !important;display: inline-block;color: #212529;user-select: none;border: 1px solid transparent;line-height: 1.5;    transition: color .15s ease-in-out, background-color .15s ease-in-out, border-color .15s ease-in-out, box-shadow .15s ease-in-out;
    text-align: center; vertical-align: middle;" title="Reject"><i class="fa fa-ban" aria-hidden="true"  style="font-size: 16px;color: #e63757;"></i></a>`
      : ' <i class="fa fa-ban" aria-hidden="true" title="Reject"  style="cursor:pointer;font-size: 16px;color: #e63757;margin: 0 50%;"></i>';

  const approve_reqFormatter: Formatter = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) =>
    value ? `<a href="javascript:;" class="btn action-edit" style="margin-right: 5px;font-size: 12px;background: #F5F5F5;
    min-width: 32px; min-height: 32px; padding: 4px; border-radius: 50%;
    font-weight: 800 !important;display: inline-block;color: #212529;user-select: none;border: 1px solid transparent;line-height: 1.5;    transition: color .15s ease-in-out, background-color .15s ease-in-out, border-color .15s ease-in-out, box-shadow .15s ease-in-out;
    text-align: center; vertical-align: middle;"title="Approve"><i class="fa fa-check-square" aria-hidden="true" style="font-size: 16px;color: #00d97e;"></i></a>`
      : '<i class="fa fa-check-square text-center" title="Approve" aria-hidden="true" style="cursor:pointer;font-size: 16px;color: #00d97e;margin: 0 50%;"></i>';
    
    this.columnDefinitions = [];
    this.columnDefinitions = [
      { 
        id: 'EmpCode',
        name: 'Employee Code',
        field: 'EmpCode',
        sortable: true,
        filterable: true
      }, { 
        id: 'FirstName',
        name: 'Employee Name',
        field: 'FirstName',
        sortable: true,
        filterable: true
      }, { 
        id: 'Designation',
        name: 'Designation',
        field: 'Designation',
        sortable: true,
        filterable: true
      }, { 
      //   id: 'Department',
      //   name: 'Department',
      //   field: 'Department',
      //   sortable: true,
      //   filterable: true
      // }, { 
        id: 'DOJ',
        name: 'DOJ',
        field: 'DOJ',
        sortable: true,
        filterable: true,
        formatter: this.DateFormatter
      }, { 
        id: 'Name',
        name: 'Shift Name',
        field: 'Name',
        sortable: true,
        filterable: true
      }, { 
        id: 'StartTime',
        name: 'Start Time',
        field: 'StartTime',
        sortable: true,
        filterable: true,
      }, { 
        id: 'EndTime',
        name: 'End Time',
        field: 'EndTime',
        sortable: true,
        filterable: true,
      }, { 
        id: 'PeriodFrom',
        name: 'Period From',
        field: 'PeriodFrom',
        sortable: true,
        filterable: true,
        formatter: this.DateFormatter
      }, { 
        id: 'PeriodTo',
        name: 'Period To',
        field: 'PeriodTo',
        sortable: true,
        filterable: true,
        formatter: this.DateFormatter
      }, {
        id: 'EmployeeRemarks',
        name: 'Employee Remarks',
        field: 'EmployeeRemarks',
        sortable: true,
        filterable: true
      }, {
        id: 'approve_req',
        name: '',
        field: 'approve_req',
        formatter: approve_reqFormatter,
        minWidth: 30 
      }, {
        id: 'reject_req',
        name: '',
        field: 'reject_req',
        formatter: decline_reqFormatter,
        minWidth: 30 
      }
    ];
    this.gridOptions = {
      asyncEditorLoading: false,
      autoResize: {
        containerId: 'grid-container',
        //sidePadding: 15
      },
      enableAutoResize: true,
      editable: true,
      enableColumnPicker: true,
      enableCellNavigation: true,
      enableRowSelection: true,
      enableCheckboxSelector: true,
      enableFiltering: true,
      forceFitColumns: true,
      enablePagination: true,
      pagination: {
        pageSizes: [10,15,25,50,75,100],
        pageSize: 15,
        pageNumber: 1,
        totalItems: 0,
      },
      rowSelectionOptions: {
        // True (Single Selection), False (Multiple Selections)
        selectActiveRow: false
      },
      checkboxSelector: {
        // remove the unnecessary "Select All" checkbox in header when in single selection mode
        hideSelectAllCheckbox: false
      },
      datasetIdPropertyName: "Id"
    };
  }

  onAngularGridCreated(angularGrid: AngularGridInstance) {
    this.angularGrid = angularGrid;
    this.gridDataView = angularGrid.dataView;
    this.gridObj = angularGrid.slickGrid;
  }

  onCellClicked(e: any, args: CellArgs) {

    const metadata = this.angularGrid.gridService.getColumnFromEventArguments(args);
    console.log('metadata', metadata);
    
    if (metadata.columnDef.id === 'approve_req') {
     this.doApproveRejectRequests('Single', metadata.dataContext, 'APPROVE');
    } else if (metadata.columnDef.id === 'reject_req') {
     this.doApproveRejectRequests('Single', metadata.dataContext, 'REJECT');
    }
  }

  onSelectAllItems(data: any, args: { rows: string | any[]; }) {
      this.selectedDataSet = [];
      if (args != null && args.rows != null && args.rows.length > 0) {
        for (let i = 0; i < args.rows.length; i++) {
          var row = args.rows[i];
          var row_data = this.gridDataView.getItem(row);
          this.selectedDataSet.push(row_data);
        }
      }
      console.log('SELECTED ITEMS ::', this.selectedDataSet);
  }

  prepareGridForEmployee() {

    const customStatusButtonFormatter: Formatter = (_row: number, _cell: number, value: any) => {
      console.log('&&', value,_row,_cell);
      return `<span style="margin-left: 5px">
        <button class="btn btn-xs">
          <span class="badge ${value === 'Approved' ? 'badge-success' : value === 'Rejected' ? 'badge-danger' : 'badge-warning'}">
          ${value}
          </span> 
        </button>
      </span>`;
    };
    this.columnDefinitionsForEmployee = [
      { 
        id: 'Name',
        name: 'Shift Name',
        field: 'Name',
        sortable: true,
        filterable: true
      }, { 
        id: 'StartTime',
        name: 'Start Time',
        field: 'StartTime',
        sortable: true,
        filterable: true
      }, { 
        id: 'EndTime',
        name: 'End Time',
        field: 'EndTime',
        sortable: true,
        filterable: true
      }, { 
        id: 'PeriodFrom',
        name: 'Period From',
        field: 'PeriodFrom',
        sortable: true,
        filterable: true
      }, { 
        id: 'PeriodTo',
        name: 'Period To',
        field: 'PeriodTo',
        sortable: true,
        filterable: true
      }, { 
        id: 'Status',
        name: 'Status',
        field: 'Status',
        sortable: true,
        filterable: true,
        formatter: customStatusButtonFormatter
      }, {
        id: 'EmployeeRemarks',
        name: 'Employee Remarks',
        field: 'EmployeeRemarks',
        sortable: true,
        filterable: true
      }, {
        id: 'ApproverRemarks',
        name: 'Approver Remarks',
        field: 'ApproverRemarks',
        sortable: true,
        filterable: true
      }
    ];
    
    this.gridOptionsForEmployee = {
      asyncEditorLoading: false,
      autoResize: {
        containerId: 'grid-container',
      },
      enableAutoResize: true,
      editable: true,
      enableColumnPicker: true,
      enableCellNavigation: true,
      enableRowSelection: false,
      enableCheckboxSelector: false,
      enableFiltering: true,
      enablePagination:true,
      datasetIdPropertyName: "Id",
      forceFitColumns: true,
      pagination: {
        pageSizes: [10,15,25,50,75,100],
        pageSize: 15,
        pageNumber: 1,
        totalItems: 0,
      }
    };

  }

  onAngularGridCreatedForEmp(angularGrid: AngularGridInstance) {
    this.angularGridForEmployee = angularGrid;
    this.gridObjForEmployee = angularGrid.slickGrid;
  }


  onChangePeriodFromDate(e: any) {
    if (e) {
     this.periodToMinDate = new Date(e);
     // this.shiftChangeForm.controls['PeriodTo'].setValue(new Date(e));
     // console.log('**** FROM ****', this.shiftChangeForm.controls['PeriodFrom'].value);
    }
  }

  onChangePeriodToDate(e: any) {
    if (e) {
      this.periodToMinDate = new Date(e);
      this.shiftChangeForm.controls['PeriodTo'].setValue(new Date(e));
      // console.log('**** TO ****', this.shiftChangeForm.controls['PeriodTo'].value);
    }
  }
  
  onChangeShiftSelection(e: any) {
    this.shiftChangeForm.get('selectedShift').setValue(e.Id);
    console.log('shift change', e, this.shiftChangeForm.get('selectedShift').value);
  }

  saveShiftChangeRequest() {
    console.log('form valid ?', this.shiftChangeForm.valid);
    const startDate = this.shiftChangeForm.controls['PeriodFrom'].value;
    const endDate = this.shiftChangeForm.controls['PeriodTo'].value;
    this.submitted = true;
    if(this.shiftChangeForm.invalid) {
      this.alertService.showWarning('Please fill all the required field(s)');
      return;
    }

    if (moment(endDate).isBefore(moment(startDate), "day")) {
      this.alertService.showWarning('Please provide valid dates for the period from and/or period to fields !');
      return;
    }
    this.loadingScreenService.startLoading();
    const fromDate = moment(this.shiftChangeForm.get('PeriodFrom').value).format('MM-DD-YYYY');
    const toDate = moment(this.shiftChangeForm.get('PeriodTo').value).format('MM-DD-YYYY');
    this.attendanceService.checkIfShiftRequestExists(this.employeeId, fromDate, toDate).subscribe((result: any) => {
      console.log('checkIfShiftRequestExists', result);
      this.loadingScreenService.stopLoading();
      if (result.Status) {
        if (result.Result == '1') {
          this.alertService.showWarning('Request already exists for the given period !');
        } else {
          this.doSubmitShiftRequestFromEmployee();
        }
      } else {
        this.alertService.showWarning(result.Message);
      }
    }, error => {
      this.loadingScreenService.stopLoading();
      console.log('error in upsertShiftChangeRequest', error);
    });
  }

  doSubmitShiftRequestFromEmployee() {
    this.loadingScreenService.startLoading();
    const saveData = {
      "EmployeeId": this.employeeId,
      "WSDId": this.shiftChangeForm.get('selectedShift').value,
      "PeriodFrom": new Date(this.shiftChangeForm.get('PeriodFrom').value).toISOString(),
      "PeriodTo": new Date(this.shiftChangeForm.get('PeriodTo').value).toISOString(),
      "EmployeeRemarks": this.shiftChangeForm.get('ApplierRemarks').value,
      "ApproverRemarks": null,
      "Status": 1,
      "ApprovedBy": 0,
      "ApprovedOn": new Date().toISOString(),
      "Id": this.shiftChangeForm.get('Id').value,
      "CreatedOn": new Date().toISOString(),
      "LastUpdatedOn": new Date().toISOString(),
      "CreatedBy": this.UserId,
      "LastUpdatedBy": this.UserId,
    };
    console.log('::SAVE DATA::', saveData);
    this.attendanceService.upsertShiftChangeRequest(saveData).subscribe((result: any) => {
      console.log('upsertShiftChangeRequest', result);
      this.loadingScreenService.stopLoading();
      if(result.Status) {
        this.close_shift_change_popup();
      } else {
        this.alertService.showWarning(result.Message)
      }
    }, error => {
      this.loadingScreenService.stopLoading();
      console.log('error in upsertShiftChangeRequest', error);
    });
  }

  cancelPendingRequest(item: any) {
    console.log('cancel request', item);
    this.alertService.confirmSwalWithCancelAction('Confirmation!', 'Are you sure you want to cancel the request ?', "Yes, Continue", "No, Cancel").then((result) => {
      if (result) {
        // this.loadingScreenService.startLoading();
        
      } else {
        
      }
    });
  }

  createNewShiftChangeRequest() {
    if (!this.isManager) {
      this.open_shift_change_popup();
    }
  }

  open_shift_change_popup() {
   // $('#shift_change_popup').modal('show');
   
   // console.log('MAX PAST DAYS ALLOWED', maxPastDayAllowed);
   this.isDrawerVisible = true;
  }

  close_shift_change_popup() {
    this.submitted = false;
    this.isDrawerVisible = false;
    this.shiftChangeForm.reset();
    this.doRefresh();
   // $('#shift_change_popup').modal('hide');
  }

  doApproveRejectRequests(index: string, item: any, actionName: string) {
    this.alertService.confirmSwal1("Confirmation", `Are you sure you want to ${actionName} ?`, "Yes, Confirm", "No, Cancel").then((result) => {
      if (actionName === 'REJECT') {
        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'btn btn-primary',
            cancelButton: 'btn btn-danger'
          },
          buttonsStyling: true
        })
        swalWithBootstrapButtons.fire({
          title: 'Rejection Comments',
          animation: false,
          showCancelButton: true,
          input: 'textarea',
          inputValue: '',
          inputPlaceholder: 'Type your message here...',
          allowEscapeKey: false,
          inputAttributes: {
            autocorrect: 'off',
            autocapitalize: 'on',
            maxlength: '120',
            'aria-label': 'Type your message here',
          },
          allowOutsideClick: false,
          inputValidator: (value) => {
            if (value.length >= 120) {
              return 'Maximum 120 characters allowed.'
            }
            if (!value) {
              return 'You need to write something!'
            }
          },

        }).then((inputValue) => {
          if (inputValue.value) {
            const data = index == 'Multiple' 
            ? {
                Id: item.map(a => a.Id).join(),
                Status: ShiftChangeRequestStatus.Rejected,
                Remarks: inputValue.value
              } 
            : {
                Id: item.Id,
                Status: ShiftChangeRequestStatus.Rejected,
                Remarks: inputValue.value
            };
            this.approveOrRejectPendingRequest(data);
          } else if (inputValue.dismiss === Swal.DismissReason.cancel) { }
        });
      }
      else {
        const data = index == 'Multiple' ? 
        {
          Id: item.map(a => a.Id).join(),
          Status: ShiftChangeRequestStatus.Approved,
          Remarks: '  - '
        } : {
          Id: item.Id,
          Status: ShiftChangeRequestStatus.Approved,
          Remarks: '  - '
        };
        this.approveOrRejectPendingRequest(data);
      }

    }).catch(error => {
      console.log('error in alert', error);
    });
  }

  approveOrRejectPendingRequest(data: any) {
    this.loadingScreenService.startLoading();
    console.log('approve/reject request', data);
    this.angularGrid.slickGrid.setOptions({ enableCheckboxSelector: true })
    
    // this.prepareGridForManager(); 
    this.attendanceService.approveRejectShiftRequests(data.Id, data.Status, data.Remarks, this.UserId).subscribe((response) => {
      console.log('approveRejectShiftRequests API', response);
      this.loadingScreenService.stopLoading();
      this.getAllShiftRequestDataForMananger();
      response.Status ? this.alertService.showSuccess(response.Message) : this.alertService.showWarning(response.Message);
    });
  }

}
