import { Component, OnInit, HostListener } from '@angular/core';
import * as moment from 'moment';
import { AttendanceService } from 'src/app/_services/service/attendnace.service';
declare let $: any;
import { ActivatedRoute } from '@angular/router';
import Swal from "sweetalert2";
import * as _ from 'lodash';
import { SessionStorage } from '../../../_services/service/session-storage.service';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { LoginResponses } from '../../../_services/model/Common/LoginResponses';
import { AlertService, PagelayoutService } from 'src/app/_services/service';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
import { enumHelper } from 'src/app/shared/directives/_enumhelper';
import { Title } from '@angular/platform-browser';
import { EntitlementAvailmentRequest } from 'src/app/_services/model/Attendance/EntitlementAvailmentRequest';
import { Column, AngularGridInstance, GridOption, Formatter, GridService, CellArgs } from 'angular-slickgrid';
import { DataSource, SearchElement } from 'src/app/views/personalised-display/models';
import { DataSourceType } from '../../personalised-display/enums';

@Component({
  selector: 'app-employee-regularize-approval-rejection',
  templateUrl: './employee-regularize-approval-rejection.component.html',
  styleUrls: ['./employee-regularize-approval-rejection.component.scss']
})

export class EmployeeRegularizeApprovalRejectionComponent implements OnInit {

  _entitlementList = [];
  sessionDetails: LoginResponses;
  RoleId: number = 0;
  RoleCode: any;
  BusinessType: any;
  UserId: any = 0;
  clientId: string;
  UserName: any;
  spinner: boolean = false;
  searchText: any = null;
  isOpened: boolean = false;
  rowData: EntitlementAvailmentRequest = new EntitlementAvailmentRequest();
  _employeeId: any;
  _employeeName: any;
  // ICON FORMATTER 
  decline_reqFormatter: Formatter;
  approve_reqFormatter: Formatter;
  // GRID PROPERTIES
  inEmployeesInitiateGridInstance: AngularGridInstance;
  inEmployeesInitiateGrid: any;
  inEmployeesInitiateGridService: GridService;
  inEmployeesInitiateDataView: any;
  inEmployeesInitiateColumnDefinitions: Column[];
  inEmployeesInitiateGridOptions: GridOption;
  inEmployeesInitiateDataset: any;
  inEmployeesInitiateList = [];
  inEmployeesInitiateSelectedItems: any[];
  // COMMON PROPERTIES
  pageTitle: any;
  DisplayName: any;
  CurrentDateTime: any = null;
  EvtReqId: any = 0;
  isMobileResolution: boolean;

  clientList: any[] = [];
  managerList: any[] = [];
  managerId: any;

  @HostListener("window:resize", [])
  private onResize() {
    this.detectScreenSize();
  }

  constructor(
    private attendanceService: AttendanceService,
    private alertService: AlertService,
    private loadingScreenService: LoadingScreenService,
    public utilsHelper: enumHelper,
    public sessionService: SessionStorage,
    private route: ActivatedRoute,
    private titleService: Title,
    private pageLayoutService: PagelayoutService
  ) {

    this.decline_reqFormatter = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) =>
      value ? `<a href="javascript:;" class="btn action-edit" style="margin-right: 5px;font-size: 12px;background: #F5F5F5;
      min-width: 32px; min-height: 32px; padding: 4px; border-radius: 50%; font-weight: 800 !important;display: inline-block;color: #212529;user-select: none;border: 1px solid transparent;line-height: 1.5;    transition: color .15s ease-in-out, background-color .15s ease-in-out, border-color .15s ease-in-out, box-shadow .15s ease-in-out;
      text-align: center; vertical-align: middle;" title="Reject"><i class="fa fa-ban" aria-hidden="true"  style="font-size: 16px;color: #e63757;"></i></a>`
        : ' <i class="fa fa-ban" aria-hidden="true" title="Reject"  style="cursor:pointer;font-size: 16px;color: #e63757;margin: 0 50%;"></i>';

    this.approve_reqFormatter = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) =>
      value ? `<a href="javascript:;" class="btn action-edit" style="margin-right: 5px;font-size: 12px;background: #F5F5F5;
      min-width: 32px; min-height: 32px; padding: 4px; border-radius: 50%;
      font-weight: 800 !important;display: inline-block;color: #212529;user-select: none;border: 1px solid transparent;line-height: 1.5;    transition: color .15s ease-in-out, background-color .15s ease-in-out, border-color .15s ease-in-out, box-shadow .15s ease-in-out;
      text-align: center; vertical-align: middle;"title="Approve"><i class="fa fa-check-square" aria-hidden="true" style="font-size: 16px;color: #00d97e;"></i></a>`
        : '<i class="fa fa-check-square text-center" title="Approve" aria-hidden="true" style="cursor:pointer;font-size: 16px;color: #00d97e;margin: 0 50%;"></i>';
    
    if (window.innerWidth < 768) {
      this.isMobileResolution = true;
    } else {
      this.isMobileResolution = false;
    }
  }


  ngOnInit() {
    this.pageTitle = 'Approve / Reject Regularization';
    this.titleService.setTitle('Approve Regularization');
    this.onRefresh(false);
  }

  doRefresh() {
    this.onRefresh(true);
  }

  onRefresh(bool: boolean) {
    this.spinner = true;
    this.inEmployeesInitiateList = [];
    this.searchText = null;
    this.inEmployeesInitiateSelectedItems = [];
    this.isOpened = false;
    bool ? true : this.clientId = null;
    bool ? true : this.managerId = null;

    this.sessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses)); // Get the whole matched session element set as a clean json(array) via an session object
    this.RoleId = this.sessionDetails.UIRoles[0].Role.Id;
    this.RoleCode = this.sessionDetails.UIRoles[0].Role.Code;
    this.UserId = this.sessionDetails.UserSession.UserId;
    this.UserName = this.sessionDetails.UserSession.PersonName;
    this.BusinessType = this.sessionDetails.Company.LstCompanyBusinessTypeMapping != null ? this.sessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this.sessionDetails.Company.Id).BusinessType : 0;

    bool ? true : this.setGridConfigurations();

    if (this.BusinessType != 3) {
      if (this.RoleCode != 'Manager') {
        this.clientId = this.sessionService.getSessionStorage("default_SME_ClientId");
        this.GetManagerMappedClientList();
      } else {
        this.loadAttendanceRegularizationDetailsDataByManager(this.UserId);
      }
    }
    else {
      if (this.RoleCode == 'Manager') {
        this.loadAttendanceRegularizationDetailsDataByManager(this.UserId);
      }
      else if (this.RoleCode == 'Client') {
        this.clientId = this.sessionDetails.ClientList.length > 0 ? this.sessionDetails.ClientList[0].Id as any : 0;
        this.GetManagerMappedClientList();
      }
      else {
        //  this.empId = null;
        bool ? this.loadAttendanceRegularizationDetailsDataByManager(this.managerId) : this.GetUserMappedClientList();
      }
    }
    this.spinner = false;
  }

  GetUserMappedClientList() {
    let datasource: DataSource = {
      Name: "GetUserMappedClientList",
      Type: DataSourceType.SP,
      IsCoreEntity: false
    };

    let searchElements: SearchElement[] = [
      {
        FieldName: "@roleId",
        Value: this.RoleId
      },
      {
        FieldName: "@userId",
        Value: this.UserId
      }
    ];
    console.log(searchElements);
    this.loadingScreenService.startLoading();
    this.pageLayoutService.getDataset(datasource, searchElements).subscribe((result) => {
      console.log('result', result);
      this.clientList = [];
      if (result.Status && result.dynamicObject != null && result.dynamicObject != '') {
        let apiResult = JSON.parse(result.dynamicObject);
        console.log('Result Client List ::', apiResult);
        this.clientList = apiResult;
        this.clientList.length > 0 && this.clientList.length == 1 ? this.OnChangeClientDropdown(this.clientList[0]) : true;
        this.loadingScreenService.stopLoading();
      } else {
        this.loadingScreenService.stopLoading();
      }
    });

  }

  OnChangeClientDropdown(item) {
    this.clientId = item.Id;
    this.managerId = undefined;
    this.GetManagerMappedClientList();
  }

  GetManagerMappedClientList() {
    let datasource: DataSource = {
      Name: "GetManagerMappedClientList",
      Type: DataSourceType.SP,
      IsCoreEntity: false
    };

    let searchElements: SearchElement[] = [
      {
        FieldName: "@userId",
        Value: this.UserId
      },
      {
        FieldName: "@roleId",
        Value: this.RoleId
      },
      {
        FieldName: "@clientId",
        Value: this.clientId
      }
    ];
    console.log(searchElements);
    this.loadingScreenService.startLoading();
    this.pageLayoutService.getDataset(datasource, searchElements).subscribe((result) => {
      console.log('result of GetManagerMappedClientList', result.dynamicObject);
      this.managerList = [];
      if (result.Status && result.dynamicObject != null && result.dynamicObject != '') {
        let apiResult = JSON.parse(result.dynamicObject);
      // let LstAllAttribute = [{ Id: 0, Name: 'All' }];
        console.log('Result Manager List ::', apiResult);
        this.managerList = apiResult;
       // this.managerList.length > 0 ? this.managerList = LstAllAttribute.concat(this.managerList) : true;
        //this.managerId = 0;
        //this.loadAttendanceRegularizationDetailsDataByManager(this.managerId);
        this.loadingScreenService.stopLoading();
      } else {
        this.loadingScreenService.stopLoading();
      }
    });
  }

  OnChangeManagerDropdown(item) {
    this.managerId = item.Id;
    this.loadAttendanceRegularizationDetailsDataByManager(this.managerId);
  }

  loadAttendanceRegularizationDetailsDataByManager(id: any) {
    // call api to show data in table  
    this.loadingScreenService.startLoading();
    this.attendanceService.getAttendanceRegularizationDetailsForAManager(id).subscribe((result) => {
      if (result.Status) {
        this.spinner = false;
        // this.setGridConfigurations();
        this.loadingScreenService.stopLoading();
        if (result.Result !== '') {
          this.inEmployeesInitiateList = JSON.parse(result.Result);
          console.log('getAttendanceRegularizationDetailsForAManager ::', this.inEmployeesInitiateList);
        } else {
          this.inEmployeesInitiateList = [];
          this.alertService.showWarning('No Data Available');
        }
      } else {
        this.spinner = false;
        this.loadingScreenService.stopLoading();
        this.inEmployeesInitiateList = [];
        this.alertService.showWarning(result.Message);
      }
    });
  }

  DateFormatter(rowIndex: any, cell: any, value: moment.MomentInput, columnDef: any, grid: any, dataProvider: any) {
    if (value == null || value === "") { return "---"; }
    return moment.utc(value).format('ll');
  }

  setGridConfigurations() {
    this.inEmployeesInitiateColumnDefinitions = [{
      id: 'Code',
      name: 'Employee Code',
      field: 'Code',
      sortable: true,
      filterable: true
    }, {
      id: ' FirstName',
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
      id: 'DOJ',
      name: 'DOJ',
      field: 'DOJ',
      sortable: true,
      filterable: true,
      formatter: this.DateFormatter,
    }, {
      id: 'AttendanceDate',
      name: 'Attendance Date',
      field: 'AttendanceDate',
      sortable: true,
      filterable: true,
      formatter: this.DateFormatter,
    }, {
      id: 'RequestedOn',
      name: 'Requested On',
      field: 'RequestedOn',
      sortable: true,
      filterable: true,
      formatter: this.DateFormatter,
    }, {
      id: 'approve_req',
      name: '',
      field: 'approve_req',
      formatter: this.approve_reqFormatter,
      minWidth: 30
    }, {
      id: 'reject_req',
      name: '',
      field: 'reject_req',
      formatter: this.decline_reqFormatter,
      minWidth: 30 
    }
    ];
    this.inEmployeesInitiateGridOptions = {
      enableAutoResize: true,       // true by default
      enableCellNavigation: true,
      datasetIdPropertyName: "ID",
      editable: true,
      enableFilterTrimWhiteSpace: true,
      forceFitColumns: true,
      enableHeaderMenu: false,
      enableRowSelection: true,
      enableCheckboxSelector: true,
      checkboxSelector: {
        hideSelectAllCheckbox: false
      },
      rowSelectionOptions: {
        // True (Single Selection), False (Multiple Selections)
        selectActiveRow: false
      },
      enableGridMenu: true,   // <<-- this will automatically add extra custom commands
      enableFiltering: true,
      enablePagination: true,
      pagination: {
        pageSizes: [10, 15, 25, 50, 75, 100],
        pageSize: 15,
        pageNumber: 1,
        totalItems: 0,
      }
    };
  }

  onCellClicked(e: any, args: CellArgs) {
    const metadata = this.inEmployeesInitiateGridInstance.gridService.getColumnFromEventArguments(args);
    this.rowData = null;
    this.EvtReqId = null;
    this.CurrentDateTime = null;
    this.inEmployeesInitiateSelectedItems = [];
    this.inEmployeesInitiateSelectedItems.push(metadata.dataContext);
    if (metadata.columnDef.id === 'reject_req') {
      this.rowData = metadata.dataContext;
      this.DisplayName = metadata.dataContext.EntitlementCode;
      this.EvtReqId = metadata.dataContext.Id;
      this.CurrentDateTime = moment.utc().format('YYYY-MM-DD HH:mm:ss.SSS')
      console.log('Current time : ', this.CurrentDateTime);

      this.common_approve_reject('edit', false);
      return;
    } else if (metadata.columnDef.id === 'approve_req') {
      this.rowData = metadata.dataContext;
      this.DisplayName = metadata.dataContext.EntitlementCode;
      this.EvtReqId = metadata.dataContext.Id;
      this.CurrentDateTime = moment.utc().format('YYYY-MM-DD HH:mm:ss.SSS')
      console.log('Current time : ', this.CurrentDateTime);
      this.common_approve_reject('edit', true);
      return;
    } else if (metadata.columnDef.id === 'regularize_req') {
      this.DisplayName = metadata.dataContext.EntitlementCode;
      this.EvtReqId = metadata.dataContext.Id;
      this.CurrentDateTime = moment.utc().format('YYYY-MM-DD HH:mm:ss.SSS')
      console.log('Current time : ', this.CurrentDateTime);
      this.do_revise(metadata.dataContext);
      return;
    } else {
      return;
    }
  }



  inEmployeesInitiateGridReady(angularGrid: AngularGridInstance) {
    this.inEmployeesInitiateGridInstance = angularGrid;
    this.inEmployeesInitiateDataView = angularGrid.dataView;
    this.inEmployeesInitiateGrid = angularGrid.slickGrid;
    this.inEmployeesInitiateGridService = angularGrid.gridService;
  }

  onSelectedEmployeeChange(data: any, args: { rows: string | any[]; }) {
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

  do_revise(rowData: EntitlementAvailmentRequest) {
    console.log('ROW DATA ::', rowData);
    this.rowData = null;
    this.rowData = rowData;
    this._employeeName = rowData.EmployeeName;
    this.loadingScreenService.startLoading();

  }

  close_leaverequest_approval_slider() {
    this.isOpened = false;
    $('#popup_edit_regularize_attendance').modal('hide');
  }


  do_approve_reject(whichaction: any) {

    this.common_approve_reject('edit', whichaction);

  }

  do_approve_decline(item: any, whichaction: any) {
    this.common_approve_reject('single', whichaction);
  }

  bulk_approve_reject(whichaction: any) {
    this.common_approve_reject('Multiple', whichaction);
  }


  viewEntitlement() {
    this.loadingScreenService.startLoading();
    this.loadingScreenService.stopLoading();
  }

  close_entitlementbalance() {
    $('#popup_viewEntitlement').modal('hide');

  }

  common_approve_reject(_index: string, whichaction: boolean) {
    const onlyRequestIds = this.inEmployeesInitiateSelectedItems.map(a => a.ID);
    let actionName = whichaction == true ? 'Approve' : "Reject";
    this.alertService.confirmSwal1("Confirmation", `Are you sure you want to ${actionName}?`, "Yes, Confirm", "No, Cancel").then((result) => {
      $('#popup_edit_regularize_attendance').modal('hide');
      if (!whichaction) {
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
            let jsonObj = inputValue;
            let jsonStr = jsonObj.value;
            if (_index == 'Multiple') {
              this.bulkSubmitApproveRejection(actionName, jsonStr);
            } else {
              this.submitApproveRejection(onlyRequestIds.toString(), actionName, jsonStr);
            }
          } else if (inputValue.dismiss === Swal.DismissReason.cancel) { }
        });
      }
      else {
        if (_index == 'Multiple') {
          this.bulkSubmitApproveRejection(actionName, '');
        } else {
          this.submitApproveRejection(onlyRequestIds.toString(), actionName, ' ');
        }
      }

    }).catch(error => {
      console.log('error in sweetalert', error);
    });

  }

  bulkSubmitApproveRejection(actionName, remarks) {
    // for bulk approve/reject, group the RegIDs by EmployeeID 
    const groupByEmpId = this.inEmployeesInitiateSelectedItems.reduce(function (r, a) {
      r[a.EmployeeId] = r[a.EmployeeId] || [];
      r[a.EmployeeId].push(a.ID); // push only ID
      return r;
    }, Object.create(null));
    for (const key in groupByEmpId) {
      const value = groupByEmpId[key];
      // console.log('groupBy------', value.toString());
      this.submitApproveRejection(value.toString(), actionName, remarks);
    }
  }

  submitApproveRejection(regIds: any, actionName: string, remarks: string) {
    const status = actionName != 'Approve' ? 3 : 2;
    this.spinner = true;

    const payload_regularization = {
      "Comments": remarks,
      "RegId": regIds, // this is the RequestIds field which accepts multiple ids like 1,2,3 or single id like 1
      "Button": actionName.toUpperCase(), // "APPROVE" OR "REJECT"
      "ManagerId": this.UserId,
    };
    console.log("PAYLOAD :::::", JSON.stringify(payload_regularization));
    this.attendanceService.ValidateRegularization(JSON.stringify(payload_regularization)).subscribe((result) => {
      if (result.Status && result.Result != '') {
        this.spinner = false;
        this.onRefresh(true);
        this.setGridConfigurations();
        this.alertService.showSuccess(result.Message);
      } else {
        this.spinner = false;
        this.onRefresh(true);
        this.setGridConfigurations();
        this.alertService.showWarning(result.Message);
      }
    });
    // call api 
    // this.attendanceService.putApproveRejectEmployeeRegularization(item.ID, this.UserId, remarks, status).subscribe((result) => {
    //   if (result && result.Result != '') {
    //     // bind table config
    //     this.setGridConfigurations();
    //     this.inEmployeesInitiateList = JSON.parse(result.Result);
    //     console.log('getAttendanceRegularizationDetailsForAManager ::', JSON.parse(result.Result));
    //     this.spinner = false;
    //   } else {
    //     this.alertService.showWarning(result.Message);
    //   }
    // });
  }


  ngAfterViewInit() {
    this.detectScreenSize();
  }

  private detectScreenSize() {
    if (window.innerWidth < 768) {
      this.isMobileResolution = true;
    } else {
      this.isMobileResolution = false;
    }
  }

}
