import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginResponses } from 'src/app/_services/model';
import { SessionStorage } from 'src/app/_services/service/session-storage.service';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { AlertService, ClientContactService } from 'src/app/_services/service';
import { AttendanceService } from 'src/app/_services/service/attendnace.service';
import {
  AngularGridInstance,
  Column,
  Formatters,
  GridOption,
  OnEventArgs
} from 'angular-slickgrid';
import moment from 'moment';
import { UpdateShiftWeekOffComponentComponent } from 'src/app/shared/modals/attendance/update-shift-week-off-component/update-shift-week-off-component.component';
import { NzDrawerService } from 'ng-zorro-antd';

@Component({
  selector: 'app-week-off-listing',
  templateUrl: './week-off-listing.component.html',
  styleUrls: ['./week-off-listing.component.css']
})
export class WeekOffListingComponent implements OnInit {
  clientId: any = 0;
  businessType: number;
  _loginSessionDetails: LoginResponses;
  weekOffList: any;
  angularGrid!: AngularGridInstance;
  columnDefinitions!: Column[];
  gridOptions!: GridOption;
  gridObj: any;
  companyId: any;
  roleId: any;
  userId: any;
  spinner: boolean = false;
  clientList = [];
  tablespinner: boolean = false;
  
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private attendanceService: AttendanceService,
    private sessionService: SessionStorage,
    private alertService: AlertService,
    private drawerService: NzDrawerService,
    private clientContactService: ClientContactService
  ) { }

  ngOnInit() {
    this.tablespinner = false;
    this.spinner = true;
    this._loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses));
    this.clientId = (this._loginSessionDetails.ClientList && this._loginSessionDetails.ClientList.length > 0) ? this._loginSessionDetails.ClientList[0].Id as any : 0;
    this.businessType = this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this._loginSessionDetails.Company.Id).BusinessType;
    if (this.businessType != 3) {
      const lstClients = this._loginSessionDetails.ClientList;
      this.clientId = (this.sessionService.getSessionStorage("default_SME_ClientId") == null || this.sessionService.getSessionStorage("default_SME_ClientId") == undefined) ? 
      lstClients.find(item => item.IsDefault).Id : this.sessionService.getSessionStorage("default_SME_ClientId"); // client id
    }
    this.roleId = this._loginSessionDetails.UIRoles[0].Role.Id;
    this.userId = this._loginSessionDetails.UserSession.UserId;
    this.companyId = this._loginSessionDetails.Company.Id;
    this.spinner = false;
    this.doRefresh();
  }

  

  doRefresh() {
    this.spinner = true;
    if (Number(this.businessType) === Number('3')) {
      this.loadClientData().then(() => {
        // this.getWeekOffMappingList();
        this.spinner = false;
        this.prepareGrid();
      });
    } else {
      this.getWeekOffMappingList();
      this.spinner = false;
      this.prepareGrid();
    }
    
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

  getWeekOffMappingList() {
    this.attendanceService.getWeekOffMapping(this.companyId, this.clientId, 0, 0, 0).subscribe((result: any) => {
      try {
        let apiresult = result;          
        this.weekOffList = [];
        if (apiresult.Status && apiresult.Result != '') {
          const parsedArr = JSON.parse(apiresult.Result);
          // get week off for an employee
          const addWeekOffObj = parsedArr.map((item, index) => {
            item.selectedWeekOff = this.getWeekOffForEachEmployee(item);
            item.statusText = item.Status == true ? 'Active' : 'In-Active';
            return item;
          });
          this.weekOffList = addWeekOffObj;
          console.log('apiresult', this.weekOffList);
        } else {
          console.log('getWeekOffMapping-API-ERROR ::', apiresult);
          apiresult.Status ? this.alertService.showSuccess('No data available !') : this.alertService.showWarning(apiresult.Message);
        }
      } catch (err) {}
    }, err => {
      console.error('ERROR ::', err);
    })
  }

  getWeekOffForEachEmployee(obj) {
    let arr = [];
    arr.push(obj);
    const result = arr.map(tab => Object.entries(tab).reduce((acc, [key, value]) => ({ ...acc, ...(key != 'IsEditable' && key != 'Status' && value === true && { [key]: value }) }), {}));
    return Object.keys(Object.assign({}, ...result)).toString();
  }

  searchClient() {
    this.tablespinner = true;
    console.log('clientList-search', this.clientId);
    this.loadDataAfterSearch().then(() => {
      this.tablespinner = false;
      this.prepareGrid();
    });
  }

  loadDataAfterSearch() {
    this.tablespinner = true;
    return new Promise((resolve, reject) => {
      this.attendanceService.getWeekOffMapping(this.companyId, this.clientId, 0, 0, 0).subscribe((result: any) => {
        try {
          let apiresult = result;
          this.weekOffList = [];
          if (apiresult.Status && apiresult.Result != '') {
            const parsedArr = JSON.parse(apiresult.Result);
            // get week off for an employee
            const addWeekOffObj = parsedArr.map((item, index) => {
              item.selectedWeekOff = this.getWeekOffForEachEmployee(item);
              item.statusText = item.Status == true ? 'Active' : 'In-Active';
              return item;
            });
            this.weekOffList = addWeekOffObj;
            console.log('apiresult', this.weekOffList);
            resolve(true);
          } else {
            console.log('getWeekOffMapping-API-ERROR ::', apiresult);
            apiresult.Status ? this.alertService.showSuccess('No data available !') : this.alertService.showWarning(apiresult.Message);
            resolve(true);
          }
        } catch (err) {
          reject();
        }
      }, err => {
        console.error('ERROR ::', err);
        reject();
      });
    });
  }

  angularGridReady(angularGrid: AngularGridInstance) {
    this.angularGrid = angularGrid;
    this.gridObj = angularGrid.slickGrid;
  }

  DateFormatter(rowIndex, cell, value, columnDef, grid, dataProvider) {
    if (value == null || value === "") { return "---"; }
    return moment.utc(value).format('DD-MM-YYYY');
  }

  prepareGrid() {
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
        id: 'selectedWeekOff',
        name: 'Week Off',
        field: 'selectedWeekOff',
        sortable: true,
        filterable: true
      }, {
        id: 'EffectiveDate',
        name: 'Period From',
        field: 'EffectiveDate',
        formatter: this.DateFormatter,
        sortable: true,
        filterable: true
      }, {
        id: 'EffectiveTo',
        name: 'Period To',
        field: 'EffectiveTo',
        formatter: this.DateFormatter,
        sortable: true,
        filterable: true
      }, {
        id: 'statusText',
        name: 'Status',
        field: 'statusText',
        sortable: false,
        filterable: true
      }, {
        id: 'edit',
        field: 'ID',
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
      //   field: 'ID',
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
      datasetIdPropertyName: "ID",
      editable: true,
      forceFitColumns: true,
      enableHeaderMenu: false,
      enableGridMenu: true,   // <<-- this will automatically add extra custom commands
      enableFiltering: true,
      enableRowSelection: true,
      enablePagination:true,
      pagination: {
        pageSizes: [10,15,25,50,75,100],
        pageSize: 15,
        pageNumber: 1,
        totalItems: 0,
      }
    };
  }

  clickonCreateNewWO() {
    this.router.navigate(['app/masters/weekoffconfig']);
  }

  onCellChanged(e: Event, args: any) {
    // this.updatedObject = args.item;
  }

  onCellClicked(e, args) {
    const metadata = this.angularGrid.gridService.getColumnFromEventArguments(args);
    console.log('metadata', metadata);
    //call edit popup
    if (metadata.columnDef.id === 'edit') {
      if (metadata.dataContext.IsEditable === true) {
        this.editWOMapping(metadata.dataContext);
      } else {
        this.alertService.showWarning('Cannot update the selected data !');
      }
    } 
    // call delete popup 
    else if (metadata.columnDef.id === 'delete') {
      this.deleteWOMapping(metadata.dataContext);
    }
  }
  
  editWOMapping(data) {
    const drawerRef = this.drawerService.create<UpdateShiftWeekOffComponentComponent, { rowData: any, action: string, comingFrom: string}, string>({
      nzTitle: 'UPDATE WEEK OFF MAPPING',
      nzContent: UpdateShiftWeekOffComponentComponent,
      nzWidth: 553,
      nzClosable: false,
      nzMaskClosable: false,
      nzContentParams: {
        rowData: data,
        action: 'update',
        comingFrom: 'weekoff'
      }
    });
    drawerRef.afterOpen.subscribe(() => {
      console.log('update shift/wo cmp opened');
    });
    drawerRef.afterClose.subscribe(data => {
      console.log('update shift/wo cmp closed', data);
      this.updateTableData().then(() => {
        this.spinner = false;
        this.prepareGrid();
      });
    });
  }

  updateTableData() {
    this.spinner = true;
    return new Promise((resolve, reject) => {
      this.attendanceService.getWeekOffMapping(this.companyId, this.clientId, 0, 0, 0).subscribe((result: any) => {
        let apiresult = result;          
        this.weekOffList = [];
        if (apiresult.Status && apiresult.Result && apiresult.Result != '') {
          const parsedArr = JSON.parse(apiresult.Result);
          // get week off for an employee
          this.weekOffList = parsedArr.map(item => ({
            ...item,
            selectedWeekOff: this.getWeekOffForEachEmployee(item),
            statusText: item.Status ? 'Active' : 'In-Active'
          }));
          resolve(true);
          console.log('apiresult', this.weekOffList);
        } else {
          console.log('getWeekOffMapping-API-ERROR ::', apiresult);
          apiresult.Status ? this.alertService.showSuccess('No data available !') : this.alertService.showWarning(apiresult.Message);
          resolve(true);
        }
      }, err => {
        console.error('ERROR ::', err);
        reject();
      })
    });
  }

  deleteWOMapping(data) {

  }

}
