import { Component, OnInit } from '@angular/core';
import {  Router } from '@angular/router';
import {  LoginResponses } from 'src/app/_services/model';
import { SessionStorage } from 'src/app/_services/service/session-storage.service';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import {  AlertService, ClientContactService } from 'src/app/_services/service';
import { AttendanceService } from 'src/app/_services/service/attendnace.service';
import moment from 'moment';
import _ from 'lodash';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
import { TimesheetService } from 'src/app/_services/service/time-sheet.service';
import { UpdateEmployeeProjectMappingComponent } from '../update-employee-project-mapping/update-employee-project-mapping.component';
import { NzDrawerService } from 'ng-zorro-antd';
import { GridOption, Column, AngularGridInstance, Formatters, OnEventArgs } from 'angular-slickgrid';


@Component({
  selector: 'app-project-employee-listing',
  templateUrl: './project-employee-listing.component.html',
  styleUrls: ['./project-employee-listing.component.css']
})
export class ProjectEmployeeListingComponent implements OnInit {
  
  clientList: any = [];
  clientId: any = 0;
  businessType: number;
  _loginSessionDetails: LoginResponses;
  LstemployeeList: any = [];
  employeeSearchElement = '';
  searchText: number | string = '';
  dataset: any;
  projectData: any;

  employeeList = [];
  gridOptions: GridOption;
  columnDefinitions:Column[];
  angularGrid:AngularGridInstance;
  gridObj: any;
  spinner: boolean = false;
  roleId: any;
  userId: any;
  constructor(
    private router: Router,
    private sessionService: SessionStorage,
    private timesheetservice: TimesheetService,
    private loadingScreen: LoadingScreenService,
    private drawerService: NzDrawerService,
    private alertService: AlertService,
    private clientContactService: ClientContactService
  ) { }


  ngOnInit() {
    this.spinner = true;
    this.columnDefinitions=[{
      id: 'Code',
      name: 'Project Code',
      field: 'Code',
      sortable: true,
      filterable: true
    },{
      id: 'Name',
      name: 'Project Name',
      field: 'Name',
      sortable: true,
      filterable: true
    },{
      id: 'ClientName',
      name: 'Client Name',
      field: 'ClientName',
      sortable: true,
      filterable: true
    },{
      id: 'ClientContractName',
      name: 'Client Contract Name',
      field: 'ClientContractName',
      sortable: true,
      filterable: true
    },{
      id: 'TeamName',
      name: 'Team Name',
      field: 'TeamName',
      sortable: true,
      filterable: true
    },{
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
    },{
      id: 'EmployeeName',
      name: 'Employee Name',
      field: 'EmployeeName',
      sortable: true,
      filterable: true
    },{
      id: 'Description',
      name: 'Description',
      field: 'Description',
      sortable: true,
      filterable: true
    },{
      id: 'formattedStartDate',
      name: 'Start Date',
      field: 'formattedStartDate',
      sortable: true,
      filterable: true
    },{
      id: 'formattedEndDate',
      name: 'End Date',
      field: 'formattedEndDate',
      sortable: true,
      filterable: true
    },{
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
    }];

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
    if (Number(this.businessType) === Number('3')) {
      this.loadClientData().then(() => {
        this.projectData = [];
        this.spinner = false;
      });
    } else {
      this.loadProjectsEmployeeMap();
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

  loadProjectsEmployeeMap() {
    this.spinner = true;
    this.projectData = [];
    this.timesheetservice.get_EmployeeProjectMapping(this.clientId).subscribe((result) => {
      console.log('get_EmployeeProjectMapping', result);
      this.spinner = false;
      if (result && result.Status && result.Result != '') {
        const data = _.cloneDeep(JSON.parse(result.Result));
        data.forEach(element => {
          element.formattedStartDate = moment(element.StartDate, 'YYYY-MM-DD').format("DD MMM YYYY");
          element.formattedEndDate = moment(element.EndDate, 'YYYY-MM-DD').format("DD MMM YYYY");
        });
        this.projectData = data;
      } else {
        result.Status ? this.alertService.showSuccess('No Records Found !') : this.alertService.showWarning(result.Message);
      }
    });
  }

  searchClient() {
    this.dataset = [];
    this.projectData = [];
    this.loadingScreen.startLoading();
    console.log('clientList-search', this.searchText, this.dataset);
    this.loadProjectsEmployeeMap() ;
    this.loadingScreen.stopLoading();
  }


  editProjectEmployeeMap(item) {
    const drawerRef = this.drawerService.create<UpdateEmployeeProjectMappingComponent, { rowData: any, action: string }, string>({
      nzTitle: 'UPDATE',
      nzContent: UpdateEmployeeProjectMappingComponent,
      nzWidth: 553,
      nzClosable: false,
      nzMaskClosable: false,
      nzContentParams: {
        rowData: item,
        action: 'edit'
      }
    });

    drawerRef.afterOpen.subscribe(() => {
      console.log('Drawer(Component) Open');

    });
    drawerRef.afterClose.subscribe(data => {
      this.loadProjectsEmployeeMap();
    });
  }

  clickedAddNewProject() {
    this.router.navigate(['app/timesheet/createEmployeeProjectMapping']);
  }

  angularGridReady(angularGrid: AngularGridInstance) {
    this.angularGrid = angularGrid;
    this.gridObj = angularGrid.slickGrid;
  }

  onCellClicked(e, args) {
    const metadata = this.angularGrid.gridService.getColumnFromEventArguments(args);
    console.log('metadata', metadata);
    //call edit popup
    if (metadata.columnDef.id === 'edit') {
      this.editProjectEmployeeMap(metadata.dataContext);
    }
  }

}

