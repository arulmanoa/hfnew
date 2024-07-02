import { Component, OnInit } from '@angular/core';
import { AttendanceService } from '@services/service/attendnace.service';
import { Column, GridOption, AngularGridInstance, GridService, Formatter, Filters, FieldType, OnEventArgs } from 'angular-slickgrid';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
import { apiResult } from 'src/app/_services/model/apiResult';
import { AlertService, FileUploadService, PagelayoutService } from '@services/service';
import { DataSource, PageLayout, SearchElement } from 'src/app/views/personalised-display/models';
import { DataSourceType, SearchPanelType } from '../../personalised-display/enums';
import { LoginResponses } from '../../../_services/model/Common/LoginResponses';
import { SessionStorage } from '../../../_services/service//session-storage.service';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import Swal from 'sweetalert2';
import { EntitlementRequestStatus, EntitlementType, EntitlementUnitType } from '@services/model/Attendance/AttendanceEnum';
import { EntitlementAvailmentRequest } from '@services/model/Attendance/EntitlementAvailmentRequest';
import moment from 'moment';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { ApproveRejectEmployeeRegularizationModalComponent } from 'src/app/shared/modals/attendance/approve-reject-employee-regularization-modal/approve-reject-employee-regularization-modal.component';
import { enumHelper } from 'src/app/shared/directives/_enumhelper';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title, DomSanitizer } from '@angular/platform-browser';
import { RowDataService } from '../../personalised-display/row-data.service';
import { EmployeeEntitlement } from '@services/model/Attendance/AttendanceEntitlment';

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
  selector: 'app-hr-pending-requests-approval',
  templateUrl: './hr-pending-requests-approval.component.html',
  styleUrls: ['./hr-pending-requests-approval.component.css']
})
export class HrPendingRequestsApprovalComponent implements OnInit {

  spinner: boolean = false;
  selectedValue: any = '';
  dropdownOptions = [{
    Id: 'leave',
    Name: 'Leave Requests'
  }, {
    Id: 'od',
    Name: 'On Duty Requests'
  }, {
    Id: 'regularize',
    Name: 'Regularization Requests'
  }];

  // slick grid 
  pendingRequestsColumnDefinitions: Column[] = [];
  pendingRequestsGridOptions: GridOption = {};
  pendingRequestsDataset = [];
  pendingRequestsAngularGrid: AngularGridInstance;
  pendingRequestsGridService: GridService;
  pendingRequestsSelectedItems: any[] = [];
  pendingRequestsDataView: any;
  pendingRequestsGrid: any;
  rowData: any;

  _loginSessionDetails: LoginResponses;
  businessType: any;
  UserId: any;
  UserName: any;
  RoleId: any;
  RoleCode: any;
  clientId: any;
  clientContractId: any;

  pageLayout: PageLayout = null;
  modalOption: NgbModalOptions = {};

  approveFormatter: Formatter;
  rejectFormatter: Formatter;

  _entitlementList: any[] = [];
  _limitedEntitlementList: any[] = [];
  leaveForm: FormGroup;
  selectedEntitlement: EmployeeEntitlement = new EmployeeEntitlement();
  IsNegativeUnitAllowed: boolean = false;
  MaxAllowedNegativeBalance: any = 0;
  ActualReamingDayIfNegativeAllowed: any = 0;
  isAllowedToViewDocument: boolean = true;
  EntitlementDefinitionList: any[] = [];
  _employeeName: string = '';

  remainingDays: any = 0;
  selectedLeaveType: any;
  isOpened: boolean = false;
  employeeEntitlement: EmployeeEntitlement = null;
  isZeroEligibleDays: boolean = false;
  DisplayName: any;
  EvtReqId: any = 0;
  isLOP: boolean = false;
  copyOfSelectedValue: any;

  constructor(
    private loadingScreenService: LoadingScreenService,
    private attendanceService: AttendanceService,
    private pageLayoutService: PagelayoutService,
    public sessionService: SessionStorage,
    private alertService: AlertService,
    private modalService: NgbModal,
    public utilsHelper: enumHelper,
    private formBuilder: FormBuilder,
    private titleService: Title,
    private rowDataService: RowDataService,
    private objectApi: FileUploadService,
    private sanitizer: DomSanitizer,
  ) {
    this.modalOption.backdrop = 'static';
    this.modalOption.keyboard = false;
  }

  ngOnInit() {
    this._loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses));
    this.UserId = this._loginSessionDetails.UserSession.UserId;
    this.UserName = this._loginSessionDetails.UserSession.PersonName;
    this.RoleId = this._loginSessionDetails.UIRoles[0].Role.Id;
    this.RoleCode = this._loginSessionDetails.UIRoles[0].Role.Code;
    this.businessType = this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping != null ? this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this._loginSessionDetails.Company.Id).BusinessType : 0;
    this.clientId = this.businessType === 3 ? 0 : Number(this.sessionService.getSessionStorage('default_SME_ClientId'));
    this.clientContractId = this.businessType === 3 ? 0 : Number(this.sessionService.getSessionStorage('default_SME_ContractId'));

    this.pendingRequestsGridOptions = {
      enableAutoResize: true,
      enableCellNavigation: true,
      datasetIdPropertyName: "Id",
      editable: true,
      enableCheckboxSelector: true,
      enableRowSelection: true,
      checkboxSelector: {
        hideSelectAllCheckbox: false,
      },
      rowSelectionOptions: {
        // True (Single Selection), False (Multiple Selections)
        selectActiveRow: false
      },
      enableColumnPicker: true,
      enableExcelCopyBuffer: true,
      enableFiltering: true,
      showHeaderRow: true,
      enableAutoTooltip: true,
    };
  }

  pendingRequestsGridReady(angularGrid: AngularGridInstance) {
    this.pendingRequestsAngularGrid = angularGrid;
    this.pendingRequestsDataView = angularGrid.dataView;
    this.pendingRequestsGrid = angularGrid.slickGrid;
    this.pendingRequestsGridService = angularGrid.gridService;
  }

  onDropdownValueChange(e) {
    console.log(e, this.selectedValue);
  }

  onSearchBtnCLicked() {
    this.loadingScreenService.startLoading();
    this.copyOfSelectedValue = this.selectedValue;
    // this.pendingRequestsColumnDefinitions.length = 0;
    this.pendingRequestsDataset = [];
    this.pendingRequestsGridOptions.enableCheckboxSelector = true;
    this.pendingRequestsGridOptions.enableColumnPicker = true;
    this.pendingRequestsGridOptions.enableRowSelection = true;
    this.pendingRequestsGridOptions.enableFiltering = true;
    this.pendingRequestsGridOptions.rowSelectionOptions = {
      selectActiveRow: false
    };
    this.spinner = true;
    switch (this.copyOfSelectedValue) {
      case 'regularize':
        this.handleRegularizeRequests();
        break;
      case 'od':
        this.handleOnDutyRequests();
        break;
      case 'leave':
        this.handleLeaveRequests();
        break;
      default:
        this.loadingScreenService.stopLoading();
        this.spinner = false;
    }
  }

  handleOnDutyRequests() {
    this.spinner = true;
    const pagelayoutCode = 'onDutyRequest';
    this.getPageLayout(pagelayoutCode).then(result => {
      console.log('promise', result);
      this.setGridConfiguration();
      this.attendanceService.GetOnDutyRequestsForApprovalByHR().subscribe(apiResult => {
        this.spinner = false;
        this.processApiResult(apiResult, 'There are no pending on duty requests !');
      }, err => {
        console.error(err);
        this.spinner = false;
      });
    }).catch(err => {
      console.error(err);
      this.spinner = false;
    });
  }

  handleLeaveRequests() {
    this.spinner = true;
    const pagelayoutCode = 'entitlementAvailmentRequest';
    this.getPageLayout(pagelayoutCode).then(result => {
      console.log('promise', result);
      this.setGridConfiguration();
      this.attendanceService.GetEntitlementAvailmentRequestsForApprovalByHR().subscribe(apiResult => {
        this.spinner = false;
        this.processApiResult(apiResult, 'There are no pending leave requests !');
      }, err => {
        console.error(err);
        this.spinner = false;
      });
    }).catch(err => {
      console.error(err);
      this.spinner = false;
    });
  }

  handleRegularizeRequests() {
    this.spinner = true;
    const pagelayoutCode = 'attendanceDetailedRegularizationRequestsForHR';
    this.getPageLayout(pagelayoutCode).then(result => {
      console.log('promise', result);
      this.spinner = false;
    }).catch(err => {
      console.error(err);
      this.spinner = false;
    });
  }

  processApiResult(apiResult, noPendingMessage) {
    if (apiResult.Status && apiResult.Result) {
      this.pendingRequestsDataset = apiResult.Result;
      const statusList = this.utilsHelper.transform(EntitlementRequestStatus) as any;
      this.pendingRequestsDataset.forEach(ele => {
        ele['StatusName'] = statusList.find(z => z.id == ele.Status) ? statusList.find(z => z.id == ele.Status).name : '';
        ele['LeaveRequestStatus'] = ele.Status;
        ele['isSelected'] = false;
      });
      this.pendingRequestsDataset.sort((a, b) => new Date(a.AppliedOn).getTime() - new Date(b.AppliedOn).getTime());
    } else {
      apiResult.Status ? this.alertService.showSuccess(noPendingMessage) : this.alertService.showWarning(apiResult.Message);
    }
  }


  async getPageLayout(code: string): Promise<boolean> {
    this.pendingRequestsColumnDefinitions = null;
    this.pageLayout = null;
    this.loadingScreenService.startLoading();
    try {
      const data = await this.pageLayoutService.getPageLayout(code).toPromise();
      if (data.Status && data.dynamicObject) {
        this.pageLayout = data.dynamicObject;
        this.setGridConfiguration();
        if (this.pageLayout.GridConfiguration.ShowDataOnLoad) {
          this.pendingRequestsSelectedItems = [];
          this.pendingRequestsDataset = [];
          if (this.copyOfSelectedValue == 'regularize') {
            await this.getDataset();
          }
        }
      }
      return true;
    } catch (error) {
      console.error(error);
      this.spinner = false;
      return false;
    } finally {
      this.loadingScreenService.stopLoading();
    }
  }

  async getDataset(): Promise<void> {
    const datasource: DataSource = {
      Name: "GetAttendanceRegularizationDetailsForHR",
      Type: DataSourceType.SP,
      EntityType: 120, // staging DB
      IsCoreEntity: false
    };

    const searchElements: SearchElement[] = [
      { FieldName: "@userId", Value: this.UserId },
      { FieldName: "@roleCode", Value: this.RoleCode },
      { FieldName: "@clientId", Value: this.clientId },
      { FieldName: "@clientContractId", Value: this.clientContractId }
    ];

    try {
      const res = await this.pageLayoutService.getDataset(datasource, searchElements).toPromise();
      console.log(res);
      this.loadingScreenService.stopLoading();
      this.spinner = false;
      if (res.Status && res.dynamicObject && res.dynamicObject !== '') {
        this.pendingRequestsDataset = JSON.parse(res.dynamicObject);
      } else {
        res.Status ? this.alertService.showSuccess('There are no pending requests !') : this.alertService.showWarning(res.Message);
      }
    } catch (error) {
      this.loadingScreenService.stopLoading();
      console.error('error in fetchdataset', error);
    } finally {
      this.loadingScreenService.stopLoading();
    }
  }


  setGridConfiguration() {
    if (!this.pageLayout.GridConfiguration.IsDynamicColumns) {
      this.pendingRequestsColumnDefinitions = this.pageLayoutService.setColumns(this.pageLayout.GridConfiguration.ColumnDefinitionList);
    }
    this.pendingRequestsGridOptions = this.pageLayoutService.setGridOptions(this.pageLayout.GridConfiguration);
    console.log('pendingRequestsColumnDefinitions', this.pendingRequestsColumnDefinitions);
    this.pendingRequestsColumnDefinitions.forEach(ele => {
      if (ele.id == 'LeaveRequestStatus') {
        ele.filter = {
          collection: [{ value: '', label: 'select' }, { value: 100, label: 'Applied' }, { value: 200, label: 'Cancelled' }, { value: 300, label: 'Rejected' }, { value: 400, label: 'Approved' }, { value: 500, label: 'Availed' }, { value: 600, label: 'CancelApplied' }],
          model: Filters.singleSelect,
        }
      }
    });
  }


  showRegularizedDetailedViewDrawer(rowData) {
    console.log(rowData);
    const modalRef = this.modalService.open(ApproveRejectEmployeeRegularizationModalComponent, this.modalOption);
    modalRef.componentInstance.data = rowData;
    modalRef.result.then((result) => {
      this.spinner =true;
      this.getDataset();
    }).catch((error) => {
      console.log(error);
    });
  }

  onCellClicked(e, args) {
    const metadata = this.pendingRequestsAngularGrid.gridService.getColumnFromEventArguments(args);
    this.rowData = metadata.dataContext;
    this.pendingRequestsSelectedItems = [metadata.dataContext];

    if (this.copyOfSelectedValue !== 'regularize') {
      this.handleLeaveAndOnDutyActions(metadata);
    } else {
      this.handleColumnClick(metadata);
    }
  }

  private handleLeaveAndOnDutyActions(metadata) {
    const status = metadata.dataContext.Status;
    const entitlementCode = metadata.dataContext.EntitlementCode;
    const id = metadata.dataContext.Id;
    if (status !== 100 && status !== 600) {
      return;
    }
    switch (metadata.columnDef.id) {
      case 'decline_req':
        this.EvtReqId = id;
        this.common_approve_reject('edit', false, metadata.dataContext, 'parent');
        break;
      case 'approve_req':
        this.EvtReqId = id;
        this.common_approve_reject('edit', true, metadata.dataContext, 'parent');
        break;
      case 'regularize_req':
        this.doViewLeaveDetails(metadata);
        break;
      default:
        break;
    }
  }

  private doViewLeaveDetails(metadata) {
    this.selectedLeaveType = metadata.dataContext.EntitlementId;
    const displayName = metadata.dataContext.EntitlementCode;
    this.EvtReqId = metadata.dataContext.Id;
    this.do_revise(metadata.dataContext);
  }

  private handleColumnClick(metadata) {
    const columnDefinitions = this.pageLayout.GridConfiguration.ColumnDefinitionList;
    for (const columnDef of columnDefinitions) {
      if (metadata.columnDef.id === columnDef.Id && columnDef.Clickable) {
        this.executeFunctionByName(columnDef.FunctionName);
        break;
      }
    }
  }

  private executeFunctionByName(functionName: string) {
    if (!functionName) {
      return;
    }

    switch (functionName) {
      case 'showRegularizedDetailedView':
        this.showRegularizedDetailedViewDrawer(this.rowData);
        break;
      case 'approveRegularizationDetailType':
        this.approveRejectRegularizationDetailedType('Approve');
        break;
      case 'rejectRegularizationDetailType':
        this.approveRejectRegularizationDetailedType('Reject');
        break;
      default:
        break;
    }
  }


  do_revise(rowData) {
    console.log('ROW DATA ::', rowData);
    this.rowData = null;
    this.rowData = rowData;
    this._employeeName = rowData.EmployeeName;
    this.loadingScreenService.startLoading();

    if (this.copyOfSelectedValue === 'leave') {
      this.processEntitlementList(rowData, this.get_EmployeeEntitlementList.bind(this));
    }

    if (this.copyOfSelectedValue === 'od') {
      this.processEntitlementList(rowData, this.get_EmployeeOnDutyEntitlementList.bind(this));
    }
  }

  processEntitlementList(rowData, entitlementListMethod) {
    entitlementListMethod(rowData.EmployeeId).then((result) => {
      if (result) {
        console.log('et', this._entitlementList);
        this._limitedEntitlementList = this._entitlementList.filter(i => i.EntitlementId === rowData.EntitlementId);
        this.createForm();
        const entitlement = this._entitlementList.find(a => a.EntitlementId === rowData.EntitlementId);
        this.updateFormFields(rowData, entitlement);
        this.updateLeaveForm(rowData, entitlement);
        this.loadingScreenService.stopLoading();
        $('#popup_edit_attendance').modal('show');
      } else {
        this.loadingScreenService.stopLoading();
        this.alertService.showWarning('No records found!');
      }
    });
  }

  updateFormFields(rowData, entitlement) {
    this.onChangeEntitlement(entitlement);
    this.IsNegativeUnitAllowed = entitlement.Definition.IsNegativeBalanceAllowed;
    this.MaxAllowedNegativeBalance = entitlement.Definition.MaxNegativeBalanceAllowed;
    // view doc check
    this.isAllowedToViewDocument = this.checkDocumentViewPermission(entitlement);
  }

  checkDocumentViewPermission(entitlement) {
    const roles = entitlement.Definition.ProofDisplayRoleCodes;
    return roles && roles.length > 0 ? roles.includes(this.RoleCode) : true;
  }

  formatUtilizationDatesForCompOff(compensationDates) {
    if (!compensationDates || !compensationDates.length) {
      return null;
    }
    return compensationDates.map(date => moment(date.UtilizationDate, "YYYY-MM-DD").format("DD-MM-YYYY"));
  }

  updateLeaveForm(rowData, entitlement) {
    const utilizationDatesFormattedString = this.formatUtilizationDatesForCompOff(rowData.CompensationDates);

    this.leaveForm.patchValue({
      Id: rowData.Id,
      AppliedFrom: new Date(rowData.AppliedFrom),
      AppliedTill: new Date(rowData.AppliedTill),
      IsAppliedForFirstHalf: rowData.IsAppliedForFirstHalf,
      IsAppliedFromSecondHalf: rowData.IsAppliedFromSecondHalf,
      IsAppliedTillFirstHalf: rowData.IsAppliedTillFirstHalf,
      IsAppliedTillSecondHalf: rowData.IsAppliedTillSecondHalf,
      EntitlementType: rowData.EntitlementType,
      Entitlement: rowData.EntitlementId,
      CalculatedAppliedUnits: rowData.CalculatedAppliedUnits,
      ApplierRemarks: rowData.ApplierRemarks,
      AppliedOn: rowData.AppliedOn,
      EmployeeEntitlement: rowData.EmployeeEntitlementId,
      AdditionalDateInput: rowData.AdditionalDate,
      AdditionalDocumentId: rowData.DocumentId,
      AdditionalDocumentName: rowData.DocumentName,
      EligibleUnits: entitlement ? entitlement.EligibleUnits : 0,
      // ValidatorRemarks: rowData.ValidatorRemarks
      compOffDates: utilizationDatesFormattedString,
      relationshipId: rowData.RelationshipName
    });

    this.updateRemainingDays(entitlement);
    this.isOpened = true;
    this.selectedLeaveType = rowData.EntitlementId;
  }

  updateRemainingDays(entitlement) {
    if (entitlement && !isNaN(Number(entitlement.EligibleUnits)) && Number(entitlement.EligibleUnits) <= 0) {
      this.remainingDays = Number(entitlement.AvailableUnits);
      this.remainingDays -= parseInt(this.MaxAllowedNegativeBalance, 10);
      this.ActualReamingDayIfNegativeAllowed = this.remainingDays + parseInt(this.MaxAllowedNegativeBalance, 10);
      this.remainingDays = Math.abs(this.remainingDays);
    } else {
      this.remainingDays = entitlement ? Number(entitlement.AvailableUnits) : 0;
    }
  }

  onChangeEntitlement(event: any) {
    console.log('event', event);

    // Initialize variables
    this.employeeEntitlement = event;
    this.isLOP = false;
    this.isZeroEligibleDays = false;
    this.DisplayName = event && event.DisplayName ? event.DisplayName : '';
    this.selectedLeaveType = event && event.EntitlementId ? event.EntitlementId : '';

    // Check if the event is undefined
    if (!event) {
      return;
    }

    // Set the form controls
    this.leaveForm.controls['EligibleUnits'].setValue(event.EligibleUnits);
    this.leaveForm.controls['Entitlement'].setValue(event.EntitlementId);
    this.leaveForm.controls['EmployeeEntitlement'].setValue(event.Id);

    // Check if the leave type is LOP (Leave without Pay)
    this.isLOP = this.DisplayName === 'LOP';

    // Find the entitlement definition
    const entitlement = this._entitlementList.find(a => a.EntitlementId === event.EntitlementId);
    if (!entitlement) {
      return;
    }

    const { IsNegativeBalanceAllowed, MaxNegativeBalanceAllowed } = entitlement.Definition;
    const availableUnits = event.AvailableUnits;

    // Check for zero or negative balance
    if (this.DisplayName !== 'LOP' && availableUnits <= 0 && !IsNegativeBalanceAllowed) {
      this.isZeroEligibleDays = true;
      this.alertService.showWarning('Not enough leave Balance : The Leave type does not have enough balance to take. Please try any other leave type.');
      return;
    }

    // If negative balance is allowed
    if (availableUnits <= 0 && IsNegativeBalanceAllowed && MaxNegativeBalanceAllowed < 0) {
      this.isZeroEligibleDays = true;
      this.alertService.showWarning('Not enough leave Balance : The Leave type does not have enough balance to take. Please try any other leave type.');
      return;
    }

    if (!isNaN(availableUnits) && availableUnits < 0 && IsNegativeBalanceAllowed && MaxNegativeBalanceAllowed !== 0) {
      this.remainingDays = Number(entitlement.AvailableUnits);
      this.ActualReamingDayIfNegativeAllowed = this.remainingDays + MaxNegativeBalanceAllowed;
      this.remainingDays = Math.abs(this.remainingDays - MaxNegativeBalanceAllowed);
    }
  }


  getLeaveType(entitlmentleavetypeId) {
    return this._entitlementList.length > 0 ? this._entitlementList.find(a => a.EntitlementId == entitlmentleavetypeId).DisplayName : '';
  }

  get_EmployeeEntitlementList(_employeeId) {
    const promise = new Promise((res, rej) => {
      this._entitlementList = [];
      this.attendanceService.GetEmployeeEntitlementList(_employeeId, EntitlementType.Leave).subscribe((result) => {
        console.log('RES ENTITLEMENTLIST::', result);
        let apiResult: apiResult = result;
        if (apiResult.Status && apiResult.Result != null) {
          this._entitlementList = apiResult.Result as any;
          this._limitedEntitlementList = this._entitlementList;

          res(true);
        } else {
          res(false);
        }
      }, err => {
        console.warn('ERR ::', err);
      });
    });
    return promise;
  }

  get_EmployeeOnDutyEntitlementList(_employeeId) {
    const promise = new Promise((res, rej) => {
      this._entitlementList = [];
      this.attendanceService.getEmployeeODList(_employeeId, EntitlementType.Leave).subscribe((result) => {
        console.log('RES ENTITLEMENTLIST::', result);
        let apiResult: apiResult = result;
        if (apiResult.Status && apiResult.Result != null) {
          this._entitlementList = apiResult.Result as any;
          this._limitedEntitlementList = this._entitlementList;

          res(true);
        } else {
          res(false);
        }
      }, err => {
        console.warn('ERR ::', err);
      });
    });
    return promise;
  }

  onSelectRowChange(e, args) {
    this.pendingRequestsSelectedItems = args && args.rows ? args.rows.map(row => this.pendingRequestsDataView.getItem(row)) : [];
    console.log('SELECTED ITEMS ::', this.pendingRequestsSelectedItems);
  }

  getEntitlementDefinitionDataset() {
    this.EntitlementDefinitionList = [];
    const datasource: DataSource = {
      Name: "GetEntitlementDefinition",
      Type: DataSourceType.SP,
      IsCoreEntity: false
    };

    const searchConfiguration = {
      SearchElementList: [],
      SearchPanelType: SearchPanelType.Panel,
      SearchButtonRequired: true,
      ClearButtonRequired: true,
      SaveSearchElementsLocally: false
    };

    this.pageLayoutService.getDataset(datasource, searchConfiguration as any).subscribe((dataset) => {
      if (dataset.Status && dataset.dynamicObject) {
        try {
          this.EntitlementDefinitionList = JSON.parse(dataset.dynamicObject);
        } catch (error) {
          console.error('Error in fetch data:', error);
        }
      } else {
        console.log('Sorry! Could not Fetch Data', dataset);
      }
    }, (err) => {
      this.spinner = false;
      console.error('Error fetching data:', err);
    });
  }


  bulk_approve_reject(boolValue: boolean) {
    // for regularize requests
    if (this.copyOfSelectedValue === 'regularize') {
      const action = boolValue ? 'Approve' : 'Reject';
      this.approveRejectRegularizationDetailedType(action);
    }
    // for OD/Leave requests
    const approvalType = boolValue ? 'Approved' : 'Rejected';
    const isLeaveSelected = this.copyOfSelectedValue === 'od' || this.copyOfSelectedValue === 'leave';
    const text = this.copyOfSelectedValue === 'od' ? 'On Duty' : 'Leave';
    if (isLeaveSelected) {
      if (boolValue && this.pendingRequestsSelectedItems.some(a => a.Status === 400)) {
        this.alertService.showWarning(`${text} request cannot be processed as it has already been approved.`);
        return;
      }
  
      if (!boolValue && this.pendingRequestsSelectedItems.some(a => a.Status === 300)) {
        this.alertService.showWarning(`${text} request cannot be processed as it has already been rejected.`);
        return;
      }
    }
  
    if (isLeaveSelected) {
      let isAllowToCancel = false;
      for (const entitlement of this.EntitlementDefinitionList) {
        for (const request of this.pendingRequestsSelectedItems) {
          if (entitlement.EntitlementId === request.EntitlementId) {
            const formattedADOJ = moment(request.AppliedFrom).format('YYYY-MM-DD');
            const currentDate = moment().format('YYYY-MM-DD');
            const diff = this.workingDaysBetweenDates1(currentDate, formattedADOJ);
  
            if (!(entitlement.IsAllowToCancelPastDayRequest && entitlement.MaximumAllowedPastDays > 0 && entitlement.MaximumAllowedPastDays > diff)) {
              isAllowToCancel = true;
              break;
            }
          }
        }
      }
  
      if (isAllowToCancel && this.pendingRequestsSelectedItems.some(a => a.Status === 300 || a.Status === 400)) {
        this.alertService.showWarning(`${text} request cannot be canceled - one or more requests for leave have no authority to cancel the ${approvalType} leave.`);
        return;
      }
    }
    if (this.copyOfSelectedValue != 'regularize') {
      this.common_approve_reject('Multiple', boolValue, '', 'parent');
    }
  }
  

  common_approve_reject(_index, whichaction, item, whicharea) {
    if (this.copyOfSelectedValue == 'od') {
      this.triggerOnDutyAPICallRequest(_index, whichaction, item, whicharea);
    }

    if (this.copyOfSelectedValue == 'leave') {
      this.tiggerApiCall_LeaveRequest(_index, whichaction, item, whicharea);
    }

    if (this.copyOfSelectedValue == 'regularize') {
      this.approveRejectRegularizationDetailedType(whichaction);
    }
  }

  do_approve_reject(whichaction) {
    this.common_approve_reject('edit', whichaction, '', 'child');
  }

  workingDaysBetweenDates1 = (d0, d1) => {

    console.log('d', d0);
    console.log('d1', d1);

    /* Two working days and an sunday (not working day) */
    var holidays = ['2021-07-03', '2021-07-05', '2021-07-07'];
    var startDate = new Date(d0);
    var endDate = new Date(d1);

    var s1 = new Date(startDate);
    var e1 = new Date(endDate);
    // Validate input
    if (moment(endDate).format('YYYY-MM-DD') > moment(startDate).format('YYYY-MM-DD')) {
      return 0;
    }
    // Calculate days between dates
    var millisecondsPerDay = 86400 * 1000; // Day in milliseconds
    startDate.setHours(0, 0, 0, 1);  // Start just after midnight
    endDate.setHours(23, 59, 59, 999);  // End just before midnight
    var diff = ((endDate as any) - (startDate as any));  // Milliseconds between datetime objects    
    var days = Math.ceil(diff / millisecondsPerDay);


    while (moment(s1) <= moment(e1)) {
      const weekEndDays = new Date(s1);
      s1 = moment(weekEndDays).add(1, 'days').format('YYYY-MM-DD') as any;

    }

    return Math.abs(days);
  }

  close_leaverequest_approval_slider() {
    this.isOpened = false;
    $('#popup_edit_attendance').modal('hide');
  }

  tiggerApiCall_LeaveRequest(_index, whichaction, item, whicharea) {
    let actionName = whichaction == true ? 'Approve' : "Reject";
    this.alertService.confirmSwal1("Confirmation", `Are you sure you want to ${actionName}?`, "Yes, Confirm", "No, Cancel").then((result) => {
      $('#popup_edit_attendance').modal('hide');
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
          showCancelButton: true, // There won't be any cancel button
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
            _index == 'single' ? this.Bulk_validateEAR(item, jsonStr, whichaction, 'single') : _index == 'edit' ?
              this.validateEAR(jsonStr, whichaction, whicharea) : this.callMultipleFunction(whichaction, jsonStr);

          } else if (inputValue.dismiss === Swal.DismissReason.cancel) {}
        })
      }
      else {
        _index == 'single' ? this.Bulk_validateEAR(item, '', whichaction, 'single') : _index == 'edit' ?
          this.validateEAR('', whichaction, whicharea) : this.callMultipleFunction(whichaction, '');
      }
    }).catch(error => {});
  }

  async callMultipleFunction(whichaction, jsonStr) {
    this.loadingScreenService.startLoading();
    let count = 0;
    for (let i = 0; i < this.pendingRequestsSelectedItems.length; i++) {
      count = count + 1;
      console.log('count :', count);
      await this.Bulk_validateEAR(this.pendingRequestsSelectedItems[i], '', whichaction, 'Multiple');
    }
  
    if (count === this.pendingRequestsSelectedItems.length) {
      this.handleLeaveRequests();
      this.close_leaverequest_approval_slider();
    }
  }
  
  private createEntitlementRequest(item: any, jstring: string, whichaction: boolean, isCancellationRequest: boolean): EntitlementAvailmentRequest {
    let currentDate = new Date();
    return {
      IsApprovedFromSecondHalf: false,
      IsApprovedForFirstHalf: false,
      ApprovedTill: null,
      IsApprovedTillFirstHalf: false,
      IsApprovedTillSecondHalf: false,
      ApprovedUnits: whichaction ? item.CalculatedAppliedUnits : 0,
      ApprovedFrom: null,
      AppliedOn: moment(item.AppliedOn).format('YYYY-MM-DD hh:mm:ss'),
      ValidatedOn: moment(currentDate).format('YYYY-MM-DD hh:mm:ss'),
      ValidatedBy: this.UserId,
      ApplierRemarks: item.ApplierRemarks,
      CancellationRemarks: isCancellationRequest ? jstring : '',
      ValidatorRemarks: isCancellationRequest ? '' : jstring,
      Status: isCancellationRequest ? EntitlementRequestStatus.CancelApplied : (whichaction ? EntitlementRequestStatus.Approved : EntitlementRequestStatus.Rejected),
      AppliedBy: item.AppliedBy,
      CalculatedAppliedUnits: item.CalculatedAppliedUnits,
      AppliedUnits: item.AppliedUnits,
      IsAppliedTillSecondHalf: false,
      Id: item.Id,
      EmployeeId: item.EmployeeId,
      EmployeeEntitlementId: item.EmployeeEntitlementId,
      EntitlementType: EntitlementType.Leave,
      EntitlementId: item.EntitlementId,
      EntitlementDefinitionId: item.EntitlementDefinitionId,
      EntitlementMappingId: item.EntitlementMappingId,
      UtilizationUnitType: EntitlementUnitType.Day,
      ApplicablePayPeriodId: 0,
      ApplicableAttendancePeriodId: 0,
      AppliedFrom: moment(new Date(item.AppliedFrom)).format('YYYY-MM-DD'),
      IsAppliedFromSecondHalf: item.IsAppliedFromSecondHalf,
      IsAppliedForFirstHalf: item.IsAppliedForFirstHalf,
      AppliedTill: moment(new Date(item.AppliedTill)).format('YYYY-MM-DD'),
      IsAppliedTillFirstHalf: item.IsAppliedTillFirstHalf,
      ActivityList: [],
      PendingAtUserId: item.AppliedBy,
      LastUpdatedOn: item.LastUpdatedOn,
      ApprovalStatus: whichaction ? EntitlementRequestStatus.Approved : EntitlementRequestStatus.Rejected,
      ValidatedUserName: this.UserName
    } as EntitlementAvailmentRequest;
  }

  private handleEntitlementValidation(result: any, whichaction: boolean, index: any, isODRequest: boolean): void {
    if (result.Status) {
      this.alertService.showSuccess(result.Message);
    } else {
      this.alertService.showWarning(result.Message);
    }
    this.loadingScreenService.stopLoading();
    if (index !== 'Multiple') {
      this.close_leaverequest_approval_slider();
      if (isODRequest) {
        whichaction === false ? this.handleOnDutyRequests() : null;
      } else {
        this.handleLeaveRequests();
      }
    } else if (whichaction === false) {
      if (isODRequest) {
        this.handleOnDutyRequests();
      } else {
        this.handleLeaveRequests();
      }
    }
  }

  Bulk_validateEAR(item: any, jstring: string, whichaction: boolean, index: any): Promise<void> {
    return new Promise((resolve, reject) => {
      item = this.pendingRequestsDataset.find(a => a.Id === item.Id);
      console.log('ITEM ::', item);
      const isCancellationRequest = item.Status === EntitlementRequestStatus.CancelApplied;
  
      this.loadingScreenService.startLoading();
      const entitlementAvailmentRequest = this.createEntitlementRequest(item, jstring, whichaction, isCancellationRequest);
  
      console.log('ENTITLEMENT REQUEST APPROVAL 2:: ', entitlementAvailmentRequest);
  
      this.attendanceService.ValidateEntitlementAvailmentRequestByHR(entitlementAvailmentRequest).subscribe(
        (result: any) => {
          this.handleEntitlementValidation(result, whichaction, index, false);
          this.loadingScreenService.stopLoading();
          resolve();
        },
        (error) => {
          console.error('Error validating entitlement request:', error);
          this.loadingScreenService.stopLoading();
          reject(error);
        }
      );
    });
  }
  

  validateEAR(jstring: string, whichaction: boolean, whicharea: string): void {
    const isCancellationRequest = this.rowData.Status === EntitlementRequestStatus.CancelApplied;

    this.loadingScreenService.startLoading();
    const entitlementAvailmentRequest = this.createEntitlementRequest(
      {
        ...this.rowData,
        EmployeeEntitlementId: whicharea === 'parent' ? this.rowData.EmployeeEntitlementId : this.leaveForm.get('EmployeeEntitlement').value,
        EntitlementId: whicharea === 'parent' ? this.rowData.EntitlementId : this.leaveForm.get('Entitlement').value
      },
      jstring,
      whichaction,
      isCancellationRequest
    );

    console.log('ENTITLEMENT REQUEST APPROVAL :: ', entitlementAvailmentRequest);

    this.attendanceService.ValidateEntitlementAvailmentRequestByHR(entitlementAvailmentRequest).subscribe(
      (result: any) => this.handleEntitlementValidation(result, whichaction, null, false),
      () => this.loadingScreenService.stopLoading()
    );
  }

  triggerOnDutyAPICallRequest(_index, whichaction, item, whicharea) {
    let actionName = whichaction == true ? 'Approve' : "Reject";
    this.alertService.confirmSwal1("Confirmation", `Are you sure you want to ${actionName}?`, "Yes, Confirm", "No, Cancel").then((result) => {
      $('#popup_edit_attendance').modal('hide');
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
          showCancelButton: true, // There won't be any cancel button
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
            _index == 'single' ? this.Bulk_validateODRequests(item, jsonStr, whichaction, 'single') : _index == 'edit' ?
              this.validateODRequests(jsonStr, whichaction, whicharea) : this.callMultipleForOd(whichaction, jsonStr);

          } else if (inputValue.dismiss === Swal.DismissReason.cancel) { }
        })
      }
      else {
        _index == 'single' ? this.Bulk_validateODRequests(item, '', whichaction, 'single') : _index == 'edit' ?
          this.validateODRequests('', whichaction, whicharea) : this.callMultipleForOd(whichaction, '');
      }
    }).catch(error => {});
  }

  validateODRequests(jstring: string, whichaction: boolean, whicharea: string): void {
    const isCancellationRequest = this.rowData.Status === EntitlementRequestStatus.CancelApplied;

    this.loadingScreenService.startLoading();
    const entitlementAvailmentRequest = this.createEntitlementRequest(
      {
        ...this.rowData,
        EmployeeEntitlementId: whicharea === 'parent' ? this.rowData.EmployeeEntitlementId : this.leaveForm.get('EmployeeEntitlement').value,
        EntitlementId: whicharea === 'parent' ? this.rowData.EntitlementId : this.leaveForm.get('Entitlement').value
      },
      jstring,
      whichaction,
      isCancellationRequest
    );

    console.log('ENTITLEMENT REQUEST APPROVAL :: ', entitlementAvailmentRequest);

    this.attendanceService.ValidateonDutyEntitlementAvailmentRequestByHR(entitlementAvailmentRequest).subscribe(
      (result: any) => this.handleEntitlementValidation(result, whichaction, null, true),
      () => this.loadingScreenService.stopLoading()
    );
  }

  Bulk_validateODRequests(item: any, jstring: string, whichaction: boolean, index): Promise<void> {
    return new Promise((resolve, reject) => {
      item = this.pendingRequestsDataset.find(a => a.Id === item.Id);
      console.log('ITEM ::', item);
      const isCancellationRequest = item.Status === EntitlementRequestStatus.CancelApplied;
  
      this.loadingScreenService.startLoading();
      const entitlementAvailmentRequest = this.createEntitlementRequest(item, jstring, whichaction, isCancellationRequest);
      console.log('ENTITLEMENT REQUEST APPROVAL 2:: ', entitlementAvailmentRequest);
  
      this.attendanceService.ValidateonDutyEntitlementAvailmentRequestByHR(entitlementAvailmentRequest).subscribe(
        (result: any) => {
          this.handleEntitlementValidation(result, whichaction, index, true);
          this.loadingScreenService.stopLoading();
          resolve();
        },
        (error) => {
          console.error('Error validating entitlement request:', error);
          this.loadingScreenService.stopLoading();
          reject(error);
        }
      );
    });
  }

  async callMultipleForOd(whichaction, jsonStr) {
    this.loadingScreenService.startLoading();
    let count = 0;
    for (let i = 0; i < this.pendingRequestsSelectedItems.length; i++) {
      count = count + 1;
      console.log('count :', count);
      await this.Bulk_validateODRequests(this.pendingRequestsSelectedItems[i], '', whichaction, 'Multiple');
    }
  
    if (count === this.pendingRequestsSelectedItems.length) {
      this.handleOnDutyRequests();
      this.close_leaverequest_approval_slider();
    }
  }
  
  

  approveRejectRegularizationDetailedType(approvalType: string) {
    const reqIds = this.pendingRequestsSelectedItems.map(a => a.Id).toString();
    const status = approvalType !== 'Approve' ? 3 : 2;
  
    if (approvalType !== 'Approve') {
      this.showRejectConfirmation(reqIds, status);
    } else {
      this.showApprovalConfirmation(reqIds, status);
    }
  }
  
  showRejectConfirmation(reqIds: string, status: number) {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-danger',
        cancelButton: 'btn'
      },
      buttonsStyling: true
    });
  
    swalWithBootstrapButtons.fire({
      title: `Are you sure, you want to reject ?`,
      text: `You won't be able to revert this action!`,
      type: 'warning',
      animation: false,
      showCancelButton: true,
      confirmButtonText: 'Reject',
      input: 'textarea',
      inputPlaceholder: 'Type your message here...',
      allowEscapeKey: false,
      inputAttributes: {
        autocorrect: 'off',
        autocapitalize: 'on',
        maxlength: '200',
      },
      allowOutsideClick: false,
      inputValidator: (value) => {
        if (value.length >= 200) {
          return 'Maximum 200 characters allowed.';
        }
        if (!value) {
          return 'You need to write something!';
        }
      },
    }).then((inputValue) => {
      if (inputValue.value && inputValue.value !== "") {
        this.processApproval(reqIds, inputValue.value, status);
      }
    });
  }
  
  showApprovalConfirmation(reqIds: string, status: number) {
    this.alertService.confirmSwal1("Confirmation", "Are you sure you want to approve?", "Yes, Confirm", "No, Cancel").then((action) => {
      if (action) {
        this.processApproval(reqIds, "", status);
      }
    }).catch(error => {});
  }
  
  processApproval(reqIds: string, message: string, status: number) {
    this.loadingScreenService.startLoading();
    this.attendanceService.ApproveRejectRegularizationDetailTypeByHR(reqIds, this.UserId, message, status).subscribe(res => {
      this.loadingScreenService.stopLoading();
      if (res.Status) {
        this.alertService.showSuccess(res.Message);
        this.getDataset();
      } else {
        this.getDataset();
        this.alertService.showWarning(res.Message);
      }
    }, error => {
      this.loadingScreenService.stopLoading();
      console.log(error);
      this.alertService.showWarning(error);
    });
  }

  createForm() {
    this.leaveForm = this.formBuilder.group({
      Id: [0],
      AppliedFrom: [null, Validators.required],
      AppliedTill: [null, Validators.required],
      IsAppliedForFirstHalf: [false],
      IsAppliedFromSecondHalf: [false],
      IsAppliedTillFirstHalf: [false],
      IsAppliedTillSecondHalf: [false],
      EntitlementType: [null],
      Entitlement: [null, Validators.required],
      CalculatedAppliedUnits: [0, Validators.required],
      EligibleUnits: [0],
      ApplierRemarks: [''],
      AppliedOn: [null],
      EmployeeEntitlement: [null],
      OptinalHoliday: [null],
      AdditionalDateInput: [null],
      AdditionalDocumentId: [0],
      AdditionalDocumentName: [""],
      compOffDates: [null],
      relationshipId: [null]
      // ValidatorRemarks: ['',, Validators.required]
    });
  }

}
