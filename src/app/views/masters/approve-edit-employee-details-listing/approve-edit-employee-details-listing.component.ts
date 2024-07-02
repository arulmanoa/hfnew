import { Component, OnInit } from '@angular/core';
import {
  AngularGridInstance,
  Column,
  GridOption,
  ExtensionName,
  OnEventArgs,
  Formatter,
  CellArgs,
} from 'angular-slickgrid';
import { SessionKeys } from '@services/configs/app.config';
import { SessionStorage, EmployeeService, AlertService, HttpService } from '@services/service';
import { RowDetailPreloadComponent } from './rowdetail-preload.component';
import { RowDetailViewComponent } from './rowdetail-view.component';
import Swal from 'sweetalert2';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';

import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import moment from 'moment';


@Component({
  selector: 'app-approve-edit-employee-details-listing',
  templateUrl: './approve-edit-employee-details-listing.component.html',
  styleUrls: ['./approve-edit-employee-details-listing.component.css']
})
export class ApproveEditEmployeeDetailsListingComponent implements OnInit {

  spinner: boolean = false;

  title = 'Example 14: Grouping';
  subTitle = ` `;

  angularGrid: AngularGridInstance;
  columnDefinitions: Column[];
  gridOptions: GridOption;
  dataset: any[];
  gridObj: any;
  dataviewObj: any;

  clientId: any;
  clientContractId: any;

  originalData: any = {};
  selectedItems: any = [];

  modalOption: NgbModalOptions = {};

  constructor(
    public sessionService: SessionStorage,
    private employeeservice: EmployeeService,
    public alertService: AlertService,
    private http: HttpService,
    public modalService: NgbModal,
    private loadingScreenService: LoadingScreenService,
  ) { }

  ngOnInit() {
    this.spinner = true;
    const loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses));
    const businessType = loginSessionDetails.Company.LstCompanyBusinessTypeMapping != null ? loginSessionDetails.Company.LstCompanyBusinessTypeMapping.find((item: { CompanyId: any; }) => item.CompanyId == loginSessionDetails.Company.Id).BusinessType : 0;
    this.clientId = businessType === 3 ? 0 : Number(this.sessionService.getSessionStorage("default_SME_ClientId"));
    this.clientContractId = businessType === 3 ? 0 : Number(this.sessionService.getSessionStorage('default_SME_ContractId'));
    this.prepareGrid();
    this.loadData();
  }

  prepareGrid() {
    let previewFormatter: Formatter = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) =>
    value ? `<i class="mdi mdi-eye m-r-xs" title="Preview" style="cursor:pointer"></i> ` : '<i class="mdi mdi-eye" style="cursor:pointer"></i>';

    // grid option
    this.gridOptions = {
      enableCellNavigation: true,
      enableRowSelection: true,
      enableCheckboxSelector: true,
      //datasetIdPropertyName: 'LogId',
      rowSelectionOptions: {
        // True (Single Selection), False (Multiple Selections)
        selectActiveRow: false
      },
      checkboxSelector: {
        // remove the unnecessary "Select All" checkbox in header when in single selection mode
        hideSelectAllCheckbox: false
      },
      enableAutoResize: true,
      asyncEditorLoading: false,
      autoEdit: true,
      autoCommitEdit: true,
      editable: true,
      enableColumnPicker: true,
      enableFiltering: true,
      enableSorting: true,
      enablePagination: false,
      // enableRowDetailView: true,
      // rowDetailView: {
      //   process: (item) => this.simulateServerAsyncCall(item),
      //   loadOnce: true,
      //   singleRowExpand: false,
      //   useRowClick: false,
      //   panelRows: 4,
      //   preloadComponent: RowDetailPreloadComponent,
      //   viewComponent: RowDetailViewComponent,
      //   parent: this
      // }
      // editCommandHandler: (item, column, editCommand: any) => {
      //   console.log(this.originalData);
      //   editCommand['EmployeeId'] = item.Id;
      //   editCommand['EmployeeCode'] = item.Code;
      //   editCommand['ApprovedAmount'] = column.field;
      //   const index = this._commandQueue.findIndex(e => e.FieldName === column.field && e.EmployeeId === item.Id);
      //   if (index !== -1) {
      //     this._commandQueue.splice(index, 1, editCommand);
      //   } else {
      //     this._commandQueue.push(editCommand);
      //   }
      //   editCommand.execute();
      // },
    };
    // column definitions
    this.columnDefinitions = [{
      id: `Code`,
      name: `Code`,
      field: `Code`,
      filterable: true,
      sortable: true
    }, {
      id: `Name`,
      name: `Emp. Name`,
      field: `Name`,
      filterable: true,
      sortable: true
    }, 
    // {
    //   id: `FieldName`,
    //   name: `Field Name`,
    //   field: `FieldName`,
    //   filterable: true,
    //   minWidth: 100,
    //   sortable: true
    // }, {
    //   id: `OldValue`,
    //   name: `Old Value`,
    //   field: `OldValue`,
    //   filterable: true,
    //   minWidth: 100,
    //   sortable: true,
    //   formatter: (_row, _cell, value, columnDef: Column, dataContext: any, grid?: any) => value && value > 0 ? this.originalData[dataContext.FieldName].find(a => Number(a.Id) === Number(value)).Code : value,
    //   exportCustomFormatter: (_row, _cell, value, columnDef: Column, dataContext: any, grid?: any) => value && value > 0 ? this.originalData[dataContext.FieldName].find(a => Number(a.Id) === Number(value)).Code : value,
    // }, 
    // {
    //   id: `NewValue`,
    //   name: `New Value`,
    //   field: `NewValue`,
    //   filterable: true,
    //   minWidth: 100,
    //   sanitizeDataExport: true,
    //   sortable: true,
    //   formatter: (_row, _cell, value, columnDef: Column, dataContext: any, grid?: any) => value && value > 0 ? this.originalData[dataContext.FieldName].find(a => Number(a.Id) === Number(value)).Code : value,
    //   exportCustomFormatter: (_row, _cell, value, columnDef: Column, dataContext: any, grid?: any) => value && value > 0 ? this.originalData[dataContext.FieldName].find(a => Number(a.Id) === Number(value)).Code : value,
    //   editor: {
    //     placeholder: 'choose option',
    //     enableCollectionWatch: true,
    //     collectionAsync: this.getData.bind(this),
    //     collectionSortBy: {
    //       property: 'label',
    //       sortDesc: true
    //     },
    //     model: Editors.singleSelect,
    //     elementOptions: {
    //       filter: true,
    //       infiniteScroll: true
    //     },
    //     required: true
    //   },
    //   filter: {
    //     model: Filters.inputText,
    //   }
    // }, 
    {
      id: `SubmittedBy`,
      name: `Submitted By`,
      field: `SubmittedBy`,
      filterable: true,
      sortable: true
    }, {
      id: `SubmittedOn`,
      name: `Submitted On`,
      field: `SubmittedOn`,
      filterable: true,
      sortable: true,
      formatter: this.DateFormatter
    }, {
      id: 'edit',
      field: 'id',
      excludeFromHeaderMenu: true,
      formatter: previewFormatter,
      minWidth: 40,
      maxWidth: 40,
      onCellClick: (e: Event, args: OnEventArgs) => {
        this.showModal(args.dataContext);
      }
    }];
  }

  simulateServerAsyncCall(item: any) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const itemDetail = item;
        itemDetail.ApprovedValue = Number(item.NewValue);
        itemDetail.Dropdown = this.originalData[item.FieldName];
        resolve(itemDetail);
      }, 1000);
    });
  }

  async loadData() {
    try {
      await this.getData();
      this.spinner = false;
    } catch (err) {
      console.log('ERR IN LOAD DATA', err);
    }
  }

  getCollectionData(): Promise<any[]> {
    // Implement your asynchronous data loading logic here
    return new Promise<any[]>((resolve, reject) => {
      console.log(this);
      this.employeeservice.getPendingEmpDataCorrections(this.clientId, this.clientContractId).subscribe(
        (res) => {
          const data = JSON.parse(res.Result);
          resolve(data.Designation);
        },
        (error) => {
          reject(error);
        }
      );
    });
  }

  async getData(): Promise<void> {
    try {
      const res = await this.employeeservice.getPendingEmpDataCorrections(this.clientId, this.clientContractId).toPromise();
      console.log('API RES', res);
      if (res.Status && res.Result && res.Result != '') {
        const response = JSON.parse(res.Result);
        console.log('API RES 2', response);
        this.originalData = JSON.parse(JSON.stringify(response));
        if (this.originalData && this.originalData.EmployeeList && this.originalData.EmployeeList.length) {
          this.originalData.EmployeeList.forEach((e: any, idx: number) => {
            e.id = idx + 1;
            e.ApprovedValue = e.FieldName == 'Manager' ? Number(e.NewValue): e.NewValue;
            e.Remarks = '';
          });
        }
        const newVal = this.columnDefinitions.find(column => column.id === 'NewValue');
        if (newVal) {
          console.log('newVal', this, newVal);
          // newVal.editor.collection = this.originalData[];
        }
        // SET DATA FOR TABLE GRID
        this.dataset = this.originalData.EmployeeList && this.originalData.EmployeeList.length ? this.transformData(this.originalData.EmployeeList) as any : [];
        console.log(this.dataset);
        return;
      } else {
        this.originalData = [];
        this.dataset = [];
        res.Status ? this.alertService.showSuccess (res.Message) : this.alertService.showWarning(res.Message);
        return;
      }
    } catch (err) {
      this.spinner = false;
      console.log('ERR IN getPendingEmpDataCorrections API', err);
      throw err;
    }
  }

  angularGridReady(angularGrid: AngularGridInstance) {
    this.angularGrid = angularGrid;
    this.gridObj = angularGrid.slickGrid;
    this.dataviewObj = angularGrid.dataView;
    //this.groupByDuration();
  }

  onCellClicked(e: any, args: CellArgs) {

    const metadata = this.angularGrid.gridService.getColumnFromEventArguments(args);
    console.log('metadata', args, metadata);
    // this.changeEditable(metadata.dataContext);
    this.selectedItems = [];
    this.selectedItems.push(metadata.dataContext.Data);
    setTimeout(() => {
      const newVal = this.columnDefinitions.find(column => column.id === 'NewValue');
      if (newVal) {
       // Refresh the grid with the new data
       this.dataviewObj.setItems(this.originalData[metadata.dataContext['FieldName']]);
         this.dataviewObj.invalidate();
         this.dataviewObj.render();
      }
    }, 250);
  }

  collapseAllGroups() {
    // this.dataviewObj.collapseAllGroups();
  }

  expandAllGroups() {
    //this.dataviewObj.expandAllGroups();
    const rowDetailExtension: any = this.angularGrid.extensionService.getExtensionByName(ExtensionName.rowDetailView);
    rowDetailExtension.instance.expandDetailView();
  }

  onSelectedRowsChanged(e: any, args: { rows: string | any[]; }) {

    this.selectedItems = [];
    if (args != null && args.rows != null && args.rows.length > 0) {
      for (let i = 0; i < args.rows.length; i++) {
        var row = args.rows[i];
        var row_data = this.dataviewObj.getItem(row);
        this.selectedItems.push(row_data);
      }
    }
    console.log('clicked!!', this.selectedItems);
  }

  refresh() {
    this.spinner = true;
    this.loadData();
  }

  approveRejectMasterDataRequest(data: any, isApproved: boolean, index) {
    console.log(data);
    if (!isApproved) {
      const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-danger'
        },
        buttonsStyling: true
      })
      swalWithBootstrapButtons.fire({
        title: 'Rejection Remarks',
        text: `Selected Employees : ${this.selectedItems.length}`,
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
          if (index !== 'single') {
            // Iterate through each object in the array
            data.forEach(obj => {
              // Check if the object has a "Remarks" key
              if ('Remarks' in obj) {
                // Replace the value of "Remarks" key with the string 'test'
                obj['Remarks'] = jsonObj.value;
              }
            });
          } else {
            data.Remarks = jsonObj.value;
          }
          this.loadingScreenService.startLoading();
          const arr = index == 'single' ?  [data] : data;
          this.do_Call_Approval_API(arr, isApproved);

        } else if (inputValue.dismiss === Swal.DismissReason.cancel) { }
      })

    }
    else {
      this.alertService.confirmSwal("Are you sure?", `You want to approve for ${this.selectedItems.length} record(s) ?`, "Yes, Proceed").then(result => {
        this.loadingScreenService.startLoading();
        const arr = index == 'single' ?  [data] : data;
        this.do_Call_Approval_API(arr, isApproved);
      }).catch(error => {});
    }

  }
  do_Call_Approval_API(data: any, IsApproved: any) {
   let tempData = this.transformSubmitData(data);
    const submittedData = {
      ClientId: this.clientId,
      IsApproved: IsApproved,
      Data: JSON.parse(JSON.stringify(tempData))
    };
    console.log('submittedData', submittedData);
    // this.loadingScreenService.stopLoading();
    // return;
    this.employeeservice.approveRejectEmployeeDataCorrection(submittedData).subscribe((result) => {
      console.log('apiResponse', result);
      this.loadingScreenService.stopLoading();
      if (result.Status) {
        this.alertService.showSuccess('Data updated successfully !');
        this.refresh();
      } else {
        this.alertService.showWarning(result.Message);
        this.refresh();
      }
    }, err => {
      console.log('ERR IN approveRejectEmployeeDataCorrection API', err);
    })
  }

  approveAllRequests() {
    this.approveRejectMasterDataRequest(this.selectedItems, true, 'multiple');
  }

  rejectAllRequests() {
    this.approveRejectMasterDataRequest(this.selectedItems, false, 'multiple');
  }

  transformData(jsonData: any[]): any[] {
    return jsonData.reduce((acc: any[], item) => {
      const existingLog = acc.find(log => log.LogId === item.LogId);
      let dropdownData = this.originalData[item.FieldName] ? this.originalData[item.FieldName] : [];
      if (item.FieldName.toUpperCase() == 'MANAGER') {
        this.originalData[item.FieldName].map(element => {
          element.LabelName = `${element.Username} (${element.Name})`;
        });
      }
      if (item.FieldName.toUpperCase() == 'DESIGNATION') {
        dropdownData = this.originalData.Designation.filter(a => Number(a.CategoryId) === Number(item.Category));
      }
      if (existingLog) {
        existingLog.Data.push({
          FieldName: item.FieldName,
          OldValue: item.OldValue,
          NewValue: item.NewValue,
          OldValueName:  item.FieldName !== 'Manager' && item.OldValue && item.OldValue != '' && item.OldValue != '0' && this.originalData[item.FieldName] ? this.originalData[item.FieldName].find(c => c.Id === Number(item.OldValue)).Code : item.OldValue,
          NewValueName:  item.FieldName !== 'Manager' && item.NewValue && item.NewValue != '0' && item.NewValue != '' && this.originalData[item.FieldName] ? this.originalData[item.FieldName].find(c => c.Id === Number(item.NewValue)).Code : item.NewValue,
          ApprovedValue: item.FieldName !== 'Manager' ? Number(item.NewValue): item.NewValue,
          Dropdown: dropdownData
        });
      } else {
        const correctedEffectiveDate = item.ApprovedEffectiveDate && item.ApprovedEffectiveDate != '1900-01-01T00:00:00' ? new Date(moment.utc(item.ApprovedEffectiveDate).format('YYYY-MM-DD')) 
        : (item.RequestedEffectiveDate && item.RequestedEffectiveDate != '1900-01-01T00:00:00') 
        ? new Date( moment.utc(item.RequestedEffectiveDate).format('YYYY-MM-DD')) : new Date();
        acc.push({
          LogId: item.LogId,
          Code: item.Code,
          EmployeeId: item.EmployeeId,
          Remarks: item.Remarks,
          Name: item.Name,
          SubmittedBy: item.SubmittedBy,
          SubmittedOn: item.SubmittedOn,
          id: item.id,
          RequestedEffectiveDate: item.RequestedEffectiveDate != '1900-01-01T00:00:00' ? item.RequestedEffectiveDate : '',
          ApprovedEffectiveDate : correctedEffectiveDate,
          Data: [{
            FieldName: item.FieldName,
            OldValue: item.OldValue,
            NewValue: item.NewValue,
            OldValueName:  item.FieldName !== 'Manager' && item.OldValue && item.OldValue != '' && item.OldValue != '0' && this.originalData[item.FieldName] ? this.originalData[item.FieldName].find(c => c.Id === Number(item.OldValue)).Code : item.OldValue,
            NewValueName:  item.FieldName !== 'Manager' && item.NewValue && item.NewValue != '0' && item.NewValue != '' && this.originalData[item.FieldName] ? this.originalData[item.FieldName].find(c => c.Id === Number(item.NewValue)).Code : item.NewValue,
            ApprovedValue: item.FieldName !== 'Manager' ? Number(item.NewValue): item.NewValue,
            Dropdown: dropdownData
          }]
        });
      }
      return acc;
    }, []);
  }

  transformSubmitData(data: any[]): any[] {
    return data.map(e => ({
      LogId: e.LogId,
      EmployeeId: e.EmployeeId,
      Remarks: e.Remarks ? e.Remarks : '',
      SubmittedBy: e.SubmittedBy,
      SubmittedOn: e.SubmittedOn,
      RequestedEffectiveDate: e.RequestedEffectiveDate,
      ApprovedEffectiveDate: e.ApprovedEffectiveDate && e.ApprovedEffectiveDate != '1900-01-01T00:00:00' ? moment(e.ApprovedEffectiveDate).format('YYYY-MM-DDTHH:mm:ss') : moment().format('YYYY-MM-DDTHH:mm:ss'),
      Data: e.Data.map(d => ({
        FieldName: d.FieldName,
        OldValue: d.OldValue,
        NewValue: d.NewValue,
        ApprovedValue: d.ApprovedValue.toString()
      }))
    }));
  }

  showModal(data) {
    this.modalOption.backdrop = 'static';
    this.modalOption.keyboard = false;
    const modalRef = this.modalService.open(RowDetailViewComponent, this.modalOption);
    modalRef.componentInstance.data = data;
    modalRef.result.then((result) => {
      console.log(result);
      if (result !== 'Modal Closed') {
        result.data.ApprovedEffectiveDate = moment(result.data.ApprovedEffectiveDate).format('YYYY-MM-DD');
        this.approveRejectMasterDataRequest(result.data, result.isApproved, 'single');
        // this.refresh();
      }
    }).catch((error) => {
      console.log('ACTIVITY MODAL ERR', error);
    }); 
  }

  DateFormatter(rowIndex, cell, value, columnDef, grid, dataProvider) {
    if (value == null || value === "") { return "---"; }
    return moment.utc(value).format('ddd, D MMM YYYY');
  }

  
}