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
  selector: 'app-project-listing',
  templateUrl: './project-listing.component.html',
  styleUrls: ['./project-listing.component.css']
})
export class ProjectListingComponent implements OnInit {

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
  angularGrid!: AngularGridInstance;
  columnDefinitions!: Column[];
  gridOptions!: GridOption;
  gridObj: any;
  spinner: boolean = false;
  roleId: any;
  userId: any;
  clientContractId: any;

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
    this.clientContractId = this.sessionService.getSessionStorage("default_SME_ContractId") ? Number(this.sessionService.getSessionStorage("default_SME_ContractId")) : 0;
    this.businessType = this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this._loginSessionDetails.Company.Id).BusinessType;
    if (this.businessType != 3) {
      const lstClients = this._loginSessionDetails.ClientList;
      this.clientId = (this.sessionService.getSessionStorage("default_SME_ClientId") == null || this.sessionService.getSessionStorage("default_SME_ClientId") == undefined) ? 
      lstClients.find(item => item.IsDefault).Id : this.sessionService.getSessionStorage("default_SME_ClientId"); // client id
    }
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
      id: 'ClientName',
      name: 'Client Name',
      field: 'ClientName',
      sortable: true,
      filterable: true
    },
    {
      id: 'ClientContractName',
      name: 'Client Contract Name',
      field: 'ClientContractName',
      sortable: true,
      filterable: true
    },
    {
      id: 'TeamName',
      name: 'Team Name',
      field: 'TeamName',
      sortable: true,
      filterable: true
    },
    {
      id: 'LocationName',
      name: 'Location Name',
      field: 'LocationName',
      sortable: true,
      filterable: true
    },
    {
      id: 'formattedStartDate',
      name: 'Start Date',
      field: 'formattedStartDate',
      sortable: true,
      filterable: true
    },
    {
      id: 'formattedEndDate',
      name: ' End Date',
      field: 'formattedEndDate',
      sortable: true,
      filterable: true
    },
    {
      id: 'Description',
      name: 'Description',
      field: 'Description',
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
    }];

    this.gridOptions = {
      enableAutoResize: true,       
      enableCellNavigation: true,
      datasetIdPropertyName: "Id",
      editable: true,
      enableFilterTrimWhiteSpace: true,
      forceFitColumns: true,
      enableHeaderMenu: false,
      enableGridMenu: true,  
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
        this.spinner = false;
      });
    } else {
      this.loadProjectsForAClient();
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

  loadProjectsForAClient() {
    this.spinner = true;
    this.timesheetservice.get_ProjectsForAClient(this.clientId, this.clientContractId).subscribe((result) => {
      this.spinner = false;
      if (result && result.Status && result.Result != '') {
        const data = _.cloneDeep(JSON.parse(result.Result));
        data.forEach(element => {
          element.formattedStartDate = moment(element.StartDate, 'YYYY-MM-DD').format("DD MMM YYYY");
          element.formattedEndDate = moment(element.EndDate, 'YYYY-MM-DD').format("DD MMM YYYY");
          element.StatusName = element.Status ? 'Active' : 'In-Active'
        });
        this.projectData = data;
        console.log('get_ProjectsForAClient:Result', result, data);
      } else {
        result.Status ? this.alertService.showSuccess('No Records Found !') : this.alertService.showWarning(result.Message);
      }
    });
  }

  searchClient() {
    this.dataset = [];
    this.loadingScreen.startLoading();
    console.log('clientList-search', this.searchText, this.dataset);
    this.loadProjectsForAClient() ;
    this.loadingScreen.stopLoading();
  }

  onCellClicked(e, args) {
    const metadata = this.angularGrid.gridService.getColumnFromEventArguments(args);
    console.log('metadata', metadata);
    //call edit popup
    if (metadata.columnDef.id === 'edit') {
      this.editProject(metadata.dataContext);
    }
  }

  angularGridReady(angularGrid: AngularGridInstance) {
    this.angularGrid = angularGrid;
    this.gridObj = angularGrid.slickGrid;
  }

  editProject(item) {
    const selectedItem = this.projectData.filter(e => e.Code == item.Code)[0];
    this.rowDataService.dataInterface.RowData = selectedItem;
    this.router.navigate(['app/timesheet/createProject']);
    // this.router.navigate(['app/timesheet/createProject'], {
    //   queryParams: {
    //     "dx": btoa(JSON.stringify(selectedItem)),
    //   }
    // });
  }

  clickedAddNewProject() {
    this.router.navigate(['app/timesheet/createProject']);
  }

}
