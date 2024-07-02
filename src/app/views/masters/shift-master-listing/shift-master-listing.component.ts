import { Component, OnInit } from '@angular/core';
import {  Router } from '@angular/router';
import {  LoginResponses } from 'src/app/_services/model';
import { SessionStorage } from 'src/app/_services/service/session-storage.service';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import {  ClientContactService } from 'src/app/_services/service';
import {
  AngularGridInstance,
  Column,
  Filters,
  Formatters,
  GridOption,
  OnEventArgs
} from 'angular-slickgrid';
import { AttendanceService } from 'src/app/_services/service/attendnace.service';
import moment from 'moment';
import _ from 'lodash';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';

@Component({
  selector: 'app-shift-master-listing',
  templateUrl: './shift-master-listing.component.html',
  styleUrls: ['./shift-master-listing.component.css']
})
export class ShiftMasterListingComponent implements OnInit {
  clientList: any = [];
  clientId: any = 0;
  businessType: number;
  _loginSessionDetails: LoginResponses;
  LstemployeeList: any = [];
  employeeSearchElement = '';
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

  constructor(
    private router: Router,
    private sessionService: SessionStorage,
    private attendanceService: AttendanceService,
    private loadingScreen: LoadingScreenService,
    private clientContactService: ClientContactService
  ) { }

  ngOnInit() {
    this._loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses));
    this.clientId = (this._loginSessionDetails.ClientList && this._loginSessionDetails.ClientList.length > 0) ? this._loginSessionDetails.ClientList[0].Id as any : 0;
    this.businessType = this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this._loginSessionDetails.Company.Id).BusinessType;
    this.roleId = this._loginSessionDetails.UIRoles[0].Role.Id;
    this.userId = this._loginSessionDetails.UserSession.UserId;
    if (Number(this.businessType) === Number('3')) {
      this.loadClientData().then(() => {
        this.shiftData = [];
        this.spinner = false;
        this.prepareGrid(false);
        // if (this.clientId > 0) {
        //   this.attendanceService.GetWorkShiftDefinitionsForAClient(this.clientId).subscribe((result) => {
        //     console.log('GetWorkShiftDefinitionsForAClient', result);
        //     if (result) {
        //       this.spinner = false;
        //       this.loadAllShiftData();
        //     }
        //   });
        // }
      });
    } else {
      const lstClients = this._loginSessionDetails.ClientList;
      this.clientId = (this.sessionService.getSessionStorage("default_SME_ClientId") == null || this.sessionService.getSessionStorage("default_SME_ClientId") == undefined) ? 
      lstClients.find(item => item.IsDefault).Id : this.sessionService.getSessionStorage("default_SME_ClientId"); // client id
      this.loadAllShiftData();
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

  loadAllShiftData() {
    this.spinner = true;
    this.attendanceService.GetWorkShiftDefinitionsForAClient(this.clientId).subscribe((result) => {
      console.log('GetWorkShiftDefinitionsForAClient:Result', result);
      if (result && result.Status) {
        this.shiftData = _.cloneDeep(result.Result);
        this.spinner = false;
        this.prepareGrid(false);
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
    Number(this.businessType) == Number('3') ? this.loadAllShiftData() : this.prepareGrid(true);
    this.loadingScreen.stopLoading();
  }

  prepareGrid(isComingFromSearch: boolean) {
    this.columnDefinitions = [{
      id: 'Code',
      name: 'Code',
      field: 'Code',
      sortable: true,
      filterable: true
    }, {
      id: 'Name',
      name: 'Name',
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
      id: ' EndTime',
      name: 'End Time',
      field: 'EndTime',
      sortable: true,
      filterable: true
    }, {
      id: 'DefaultWorkingHours',
      name: 'Default Working Hours',
      field: 'DefaultWorkingHours',
      sortable: true,
      filterable: true
    }, {
      id: 'Status',
      name: 'Status',
      field: 'Status',
      sortable: true,
      filterable: true,
      filter: {
        model: Filters.singleSelect,
        collection: [{ value: '', label: 'All' }, { value: 'Active', label: 'Active' }, { value: 'In Active', label: 'In Active' }],
      }
    }, {
      id: 'edit',
      field: 'id',
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
    // }, {
    //   id: 'delete',
    //   field: 'id',
    //   excludeFromColumnPicker: true,
    //   excludeFromGridMenu: true,
    //   excludeFromHeaderMenu: true,
    //   formatter: Formatters.deleteIcon,
    //   minWidth: 30,
    //   maxWidth: 30,
    //   onCellClick: (e: Event, args: OnEventArgs) => {
    //     console.log('onCellClick', args);
    //     this.angularGrid.gridService.highlightRow(args.row, 1500);
    //     this.angularGrid.gridService.setSelectedRow(args.row);
    //   }
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
      enablePagination: true,
      pagination: {
        pageSizes: [10, 15, 25, 50, 75, 100],
        pageSize: 15,
        pageNumber: 1,
        totalItems: 0,
      }
    };
    // modify as required for the slickgrid table
    const tempData = isComingFromSearch ? this.shiftData.filter(i => i.ClientId == this.searchText) : _.cloneDeep(this.shiftData);
    tempData.map(e => {
      e.StartTime = moment(e.StartTime, ["HH:mm"]).format("LT"),
      e.EndTime = moment(e.EndTime, ["HH:mm"]).format("LT");
      e.DefaultWorkingHours = moment(e.DefaultWorkingHours, "H:mm").format("H.m");
      e.Status = e.hasOwnProperty('Status') && e.Status == true ? 'Active' : 'In Active';
    });
    
    this.dataset = tempData;
    this.loadingScreen.stopLoading();
  }

  onCellChanged(e: Event, args: any) { }

  onCellClicked(e, args) {

    const metadata = this.angularGrid.gridService.getColumnFromEventArguments(args);
    console.log('metadata', metadata);
    //call edit popup
    if (metadata.columnDef.id === 'edit') {
      this.editShift(metadata.dataContext);
    }
    //call delete popup
    else if (metadata.columnDef.id === 'delete') {
      this.deleteShift(metadata.dataContext);
    }
  }

  deleteShift(deleteData: any) {

  }

  editShift(item) {
    const selectedItem = this.shiftData.filter(e => e.Code == item.Code)[0];
    this.router.navigate(['app/masters/shiftMasterListingConfig'], {
      queryParams: {
        "dx": btoa(JSON.stringify(selectedItem)),
      }
    });
  }

  clickonCreateNewShift() {
    this.router.navigate(['app/masters/shiftMasterListingConfig']);
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
