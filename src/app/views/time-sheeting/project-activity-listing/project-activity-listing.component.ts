import { Component, OnInit } from '@angular/core';
import {  Router } from '@angular/router';
import {  LoginResponses } from 'src/app/_services/model';
import { SessionStorage } from 'src/app/_services/service/session-storage.service';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import {  AlertService, ClientContactService } from 'src/app/_services/service';
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
import { TimesheetService } from 'src/app/_services/service/time-sheet.service';
import { RowDataService } from '../../personalised-display/row-data.service';

@Component({
  selector: 'app-project-activity-listing',
  templateUrl: './project-activity-listing.component.html',
  styleUrls: ['./project-activity-listing.component.css']
})
export class ProjectActivityListingComponent implements OnInit {

  clientList: any = [];
  clientId: any = 0;
  businessType: number;
  _loginSessionDetails: LoginResponses;
  LstemployeeList: any = [];
  employeeSearchElement = '';
  dataset: any;
  clientContractId: any;
  projectData = [];

  spinner: boolean = false;
  roleId: any;
  userId: any;
  projectId: any;
  projectList = [];

  angularGrid: AngularGridInstance;
  columnDefinitions:Column[];
  gridOptions: GridOption;
  gridObj: any;

  constructor(
    private router: Router,
    private sessionService: SessionStorage,
    private timesheetservice: TimesheetService,
    private loadingScreen: LoadingScreenService,
    private alertService: AlertService,
    private rowDataService: RowDataService,
    private clientContactService: ClientContactService
  ) { }


  ngOnInit() {
    this._loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses));
    this.clientId = (this._loginSessionDetails.ClientList && this._loginSessionDetails.ClientList.length > 0) ? this._loginSessionDetails.ClientList[0].Id as any : 0;
    if (this.businessType != 3) {
      const lstClients = this._loginSessionDetails.ClientList;
      this.clientId = (this.sessionService.getSessionStorage("default_SME_ClientId") == null || this.sessionService.getSessionStorage("default_SME_ClientId") == undefined) ? 
      lstClients.find(item => item.IsDefault).Id : this.sessionService.getSessionStorage("default_SME_ClientId"); // client id
    }
    this.clientContractId = this.sessionService.getSessionStorage("default_SME_ContractId") ? Number(this.sessionService.getSessionStorage("default_SME_ContractId")) : 0;
    this.businessType = this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this._loginSessionDetails.Company.Id).BusinessType;
    this.roleId = this._loginSessionDetails.UIRoles[0].Role.Id;
    this.userId = this._loginSessionDetails.UserSession.UserId;

    this.columnDefinitions=[{
      id: 'Code',
      name: 'Code',
      field: 'Code',
      sortable: true,
      filterable: true
    },
    {
      id: 'Name',
      name: 'Name',
      field: 'Name',
      sortable: true,
      filterable: true
    },
    {
      id: 'IsBillable',
      name: 'IsBillable',
      field: 'IsBillable',
      sortable: true,
      filterable: true
    },
    
    {
      id: 'StatusName',
      name: 'Status',
      field: 'StatusName',
      sortable: true,
      filterable: true
    },
    
    {
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

    if (Number(this.businessType) === Number('3')) {
      this.loadClientData().then(() => {
        this.projectData = [];
        this.loadProjects();
        this.spinner = false;
      });
    } else {
      this.loadProjects();
      this.spinner = false;
    }
  }

  onChangeClient(e) {
    console.log(e);
    this.clientId = e.Id;
    this.loadProjects();
  }

  onChangeProject(e) {
    console.log(e);
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

  loadProjects() {
    this.spinner = true;
    this.timesheetservice.get_ProjectsForAClient(this.clientId, this.clientContractId).subscribe((result) => {
      console.log('get_ProjectsForAClient:Result', result);
      this.spinner = false;
      if (result && result.Status) {
        this.projectList = _.cloneDeep(JSON.parse(result.Result));
      }
    });
  }

  loadProjectsActivityForAClient() {
    this.spinner = true;
    this.timesheetservice.getActivitiesForAProject(this.projectId).subscribe((result) => {
      console.log('getActivitiesForAProject:Result', result);
      this.spinner = false;
      if (result && result.Status) {
        const data = _.cloneDeep(JSON.parse(result.Result));
        data.forEach(element => {
          element.StatusName = element.Status ? 'Active' : 'In-Active'
        });
        this.projectData = data;
      } else {
        this.projectData = [];
        result.Status ? this.alertService.showSuccess('No Records Found !') : this.alertService.showWarning(result.Message);
      }
    });
  }

  doSearch() {
    this.dataset = [];
    this.loadingScreen.startLoading();
    console.log('clientList-search', this.clientId, this.dataset);
    this.loadProjectsActivityForAClient();
    this.loadingScreen.stopLoading();
  }

  editProjectActivityMapping(item) {
    const selectedItem = this.projectData.filter(e => e.Code == item.Code)[0];
    selectedItem.ProjectId = this.projectId;
    this.rowDataService.dataInterface.RowData = selectedItem;
    this.redirectToCreationPage();
    // this.router.navigate(['app/timesheet/createProjectActivityMapping'], {
    //   queryParams: {
    //     "dx": btoa(JSON.stringify(selectedItem)),
    //   }
    // });
  }

  redirectToCreationPage() {
    this.router.navigate(['app/timesheet/createProjectActivityMapping']);
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
      this.editProjectActivityMapping(metadata.dataContext);
    }
  }
}
