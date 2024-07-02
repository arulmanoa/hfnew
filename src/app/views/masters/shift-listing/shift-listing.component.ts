import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { NzDrawerService } from 'ng-zorro-antd';
import { ShiftMappingComponent } from 'src/app/masters/shift-mapping/shift-mapping.component'
import { appSettings, LoginResponses } from 'src/app/_services/model';
import { SessionStorage } from 'src/app/_services/service/session-storage.service';
import { PagelayoutService } from 'src/app/_services/service/pagelayout.service';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { AlertService, ClientContactService } from 'src/app/_services/service';
import {
  AngularGridInstance,
  Column,
  FieldType,
  Filters,
  Formatter,
  Formatters,
  GridOption,
  OnEventArgs
} from 'angular-slickgrid';
import { AttendanceService } from 'src/app/_services/service/attendnace.service';
import moment from 'moment';
import _ from 'lodash';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
import { UpdateShiftWeekOffComponentComponent } from 'src/app/shared/modals/attendance/update-shift-week-off-component/update-shift-week-off-component.component';

@Component({
  selector: 'app-shift-listing',
  templateUrl: './shift-listing.component.html',
  styleUrls: ['./shift-listing.component.css']
})
export class ShiftListingComponent implements OnInit {
  clientList: any = [];
  clientId: any = 0;
  businessType: number;
  _loginSessionDetails: LoginResponses;
  LstemployeeList: any = []
  employeeSearchElement: ""
 
  searchText: number | string = '';
  dataset: any;

  shiftData = [];

  employeeList = [];
  angularGrid!: AngularGridInstance;
  columnDefinitions!: Column[];
  gridOptions!: GridOption;
  gridObj: any;
  spinner: boolean = false;
  roleId: any;
  userId: any;
  companyId: any;

  constructor(
    private router: Router,
    private sessionService: SessionStorage,
    private attendanceService: AttendanceService,
    private loadingScreen: LoadingScreenService,
    private drawerService: NzDrawerService,
    private clientContactService: ClientContactService,
    private alertService: AlertService
  ) { }

  ngOnInit() {
    console.log('**')
    this._loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses));
    this.clientId = (this._loginSessionDetails.ClientList && this._loginSessionDetails.ClientList.length > 0) ? this._loginSessionDetails.ClientList[0].Id as any : 0;
    this.businessType = this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this._loginSessionDetails.Company.Id).BusinessType;
    this.roleId = this._loginSessionDetails.UIRoles[0].Role.Id;
    this.userId = this._loginSessionDetails.UserSession.UserId;
    this.companyId = this._loginSessionDetails.Company.Id;
    if (Number(this.businessType) != Number('3')) {
      const lstClients = this._loginSessionDetails.ClientList;
      this.clientId = (this.sessionService.getSessionStorage("default_SME_ClientId") == null || this.sessionService.getSessionStorage("default_SME_ClientId") == undefined) ? 
      lstClients.find(item => item.IsDefault).Id : this.sessionService.getSessionStorage("default_SME_ClientId"); // client id
    }
    this.onLoadTableData();
  }

  onLoadTableData() {
    if (Number(this.businessType) === Number('3')) {
      this.loadClientData().then(() => {
       
        this.prepareGrid(false);
        this.spinner = false;
        // this.attendanceService.GetWorkShiftDefinitionsForAClient(this.clientId).subscribe((result) => {
        //   console.log('GetWorkShiftDefinitionsForAClient', result);
        //   if (result) {
        //     this.spinner = false;
        //     this.loadAllShiftMapData();
        //   }
        // });
      });
    } else {
      this.loadAllShiftMapData();
    }
  }

  onChangeClient(e) {
    console.log(e);
    this.clientId = e.Id;
    this.searchText = e.Id;
  }

  loadClientData() {
    this.spinner = true;
    return new Promise((resolve, reject) => {
      this.clientContactService.getUserMappedClientList(this.roleId, this.userId).subscribe(res => {
        console.log(res);
        this.clientList = [];
        if (res.Status && res.dynamicObject) {
          this.clientList = res.dynamicObject;
          resolve(true);
        }
      }, (error) => {
        console.log('error in getUserMappedClientList API', error);
        this.spinner = false;
        reject();
      });
    });
  }

  loadAllShiftMapData() {
    this.spinner = true;
    this.attendanceService.getShiftMapping(this.companyId, this.clientId, 0, 0, 0).subscribe((result) => {
      console.log('WorkShiftDefinition:Result', result);
      if (result.Status && result.Result && result.Result != '') {
        const obj = JSON.parse(result.Result);
        const modifiedObj = obj.map((item, index) => {
          item.statusText = item.Status == true ? 'Active' : 'In-Active';
          return item;
        });
        this.shiftData = _.cloneDeep(modifiedObj);
        this.spinner = false;
        this.prepareGrid(false);
      } else {
        this.spinner = false;
        this.shiftData = [];
        // result.Status ? this.alertS
      }
    });
  }

  angularGridReady(angularGrid: AngularGridInstance) {
    this.angularGrid = angularGrid;
    this.gridObj = angularGrid.slickGrid;
  }

  searchClient() {
    this.dataset = [];
    this.loadingScreen.startLoading();
    console.log('clientList-search', this.searchText, this.dataset);
    Number(this.businessType) == Number('3') ? this.loadAllShiftMapData() : this.prepareGrid(true);
    this.loadingScreen.stopLoading();
  }

  DateFormatter(rowIndex, cell, value, columnDef, grid, dataProvider) {
    if (value == null || value === "") { return "---"; }
    return moment.utc(value).format('ll');
  }

  prepareGrid(isComingFromSearch: boolean) {
    this.columnDefinitions = [{
      id: 'ClientName',
      name: 'Client Name',
      field: 'ClientName',
      sortable: true,
      filterable: true
    }, {
      id: 'ClientContractName',
      name: 'Client Contract',
      field: 'ClientContractName',
      sortable: true,
      filterable: true
    }, {
      id: ' TeamName',
      name: 'Team',
      field: 'TeamName',
      sortable: true,
      filterable: true
    }, {
      id: 'LocationName',
      name: 'Location Name',
      field: 'LocationName',
      sortable: true,
      filterable: true
    }, {
      id: 'EmployeeCode',
      name: 'Employee Code',
      field: 'EmployeeCode',
      sortable: true,
      filterable: true
    }, {
      id: 'EmployeeName',
      name: 'Employee Name',
      field: 'EmployeeName',
      sortable: true,
      filterable: true
    }, {
      id: 'Name',
      name: 'Shift Name',
      field: 'Name',
      sortable: true,
      filterable: true
    }, {
      id: 'StartTime',
      name: 'Shift Start Time',
      field: 'StartTime',
      sortable: true,
      filterable: true
    }, {
      id: 'EndTime',
      name: 'Shift End Time',
      field: 'EndTime',
      sortable: true,
      filterable: true
    }, {
      id: 'EffectiveFrom',
      name: 'Period From',
      field: 'EffectiveFrom',
      sortable: true,
      // formatter: this.DateFormatter,
      filterable: true
    }, {
      id: 'EffectiveTo',
      name: 'Period To',
      field: 'EffectiveTo',
      sortable: true,
      // formatter: this.DateFormatter,
      filterable: true
    }, {
      id: 'statusText',
      name: 'Status',
      field: 'statusText',
      sortable: false,
      filterable: true
    }, {
      id: 'edit',
      field: 'Id',
      excludeFromColumnPicker: true,
      excludeFromGridMenu: true,
      excludeFromHeaderMenu: true,
      formatter: Formatters.editIcon,
      minWidth: 30,
      maxWidth: 30,
      // use onCellClick OR grid.onClick.subscribe which you can see down below
      onCellClick: (e: Event, args: OnEventArgs) => {
        console.log('onCellClick', args);
        this.angularGrid.gridService.highlightRow(args.row, 1500);
        this.angularGrid.gridService.setSelectedRow(args.row);
      }
    }
  ];
    this.gridOptions = {
      enableAutoResize: true,       // true by default
      enableCellNavigation: true,
      datasetIdPropertyName: "Id",
      editable: true,
      enableFilterTrimWhiteSpace: true,
      forceFitColumns: true,
      enableHeaderMenu: false,
      enableGridMenu: true,   // <<-- this will automatically add extra custom commands
      enableFiltering: true,
      enablePagination:true,
      pagination: {
        pageSizes: [10,15,25,50,75,100],
        pageSize: 15,
        pageNumber: 1,
        totalItems: 0,
      }
    };
    // modify as required for the slickgrid table
    const tempData = isComingFromSearch ? this.shiftData.filter(i => i.ClientId == this.searchText) : _.cloneDeep(this.shiftData);
    console.log('obj-before:::', _.cloneDeep(tempData));
    tempData.map(e => {
      e.StartTime = moment(e.StartTime, ["HH:mm"]).format("LT"),
      e.EndTime = moment(e.EndTime, ["HH:mm"]).format("LT");
      e.EffectiveFrom = moment(new Date(e.EffectiveFrom)).format("DD-MM-YYYY"),
      e.EffectiveTo = e.EffectiveTo ? moment(new Date(e.EffectiveTo)).format("DD-MM-YYYY") : "31-12-2099";
    });
    this.dataset = tempData;
    console.log('obj-after:::', this.dataset);
    this.loadingScreen.stopLoading();
  }

  onCellChanged(e: Event, args: any) { }

  onCellClicked(e, args) {

    const metadata = this.angularGrid.gridService.getColumnFromEventArguments(args);
    console.log('metadata', metadata);
    //call edit popup
    if (metadata.columnDef.id === 'edit') {
      if (metadata.dataContext.IsEditable === true) {
        this.editShiftMapping(metadata.dataContext);
      } else {
        this.alertService.showWarning('Cannot update the selected data !');
      }
    }
    //call delete popup
    else if (metadata.columnDef.id === 'delete') {
      this.deleteShiftMapping(metadata.dataContext);
    }
  }

  deleteShiftMapping(deleteData: any) {

  }

  editShiftMapping(item: any) {
    const selectedItem = this.shiftData.filter(e => e.Id === item.Id)[0];
    const drawerRef = this.drawerService.create<UpdateShiftWeekOffComponentComponent, { rowData: any, action: string, comingFrom: string}, string>({
      nzTitle: 'UPDATE SHIFT MAPPING',
      nzContent: UpdateShiftWeekOffComponentComponent,
      nzWidth: 750,
      nzClosable: false,
      nzMaskClosable: false,
      nzContentParams: {
        rowData: selectedItem,
        action: 'update',
        comingFrom: 'shift'
      }
    });
    drawerRef.afterOpen.subscribe(() => {
      console.log('update shift/wo cmp opened');
    });
    drawerRef.afterClose.subscribe(data => {
      console.log('update shift/wo cmp closed', data);
      this.loadAllShiftMapData();
    });
  }

  clickonCreateNewShiftMap() {
    this.router.navigate(['app/masters/shiftmapping']);
  }

  clickOnSearch() {

    let empListforSearch = []
    if (this.employeeSearchElement) {
      let obj = this.employeeList.find(item => item.empcode == parseInt(this.employeeSearchElement))
      if (obj)
        empListforSearch.push(obj)
      this.employeeList = empListforSearch
    }
  }

  selectListRecords(obj, isSelect) {
    console.log('Object ', obj)

    let updateItem = this.LstemployeeList.find(i => i.Id == obj.Id);
    let index = this.LstemployeeList.indexOf(updateItem);
    if (index > -1) {
      this.LstemployeeList.splice(index, 1);
    }
    else {
      this.LstemployeeList.push(obj);
    }

  }

}
