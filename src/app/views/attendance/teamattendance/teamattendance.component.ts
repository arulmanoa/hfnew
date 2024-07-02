import { Component, HostListener, OnInit } from '@angular/core';
import { AlertService, HeaderService, PagelayoutService } from 'src/app/_services/service';
import { DataSource, PageLayout, SearchElement } from 'src/app/views/personalised-display/models';
import { DataSourceType } from '../../personalised-display/enums';
import { LoginResponses } from '../../../_services/model/Common/LoginResponses';
import { SessionStorage } from '../../../_services/service//session-storage.service';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { Title } from '@angular/platform-browser';
import * as _ from 'lodash';
import { Column, AngularGridInstance, GridOption, Formatter, GridService, BsDropDownService, FieldType, Filters, OnEventArgs, FileType } from 'angular-slickgrid';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-teamattendance',
  templateUrl: './teamattendance.component.html',
  styleUrls: ['./teamattendance.component.css']
})
export class TeamattendanceComponent implements OnInit {

  // Session Details
  // ** Access control base prop desc
  _loginSessionDetails: LoginResponses;
  MenuId: any;
  UserId: any;
  UserName: any;
  RoleId: any;
  RoleCode: any;
  spinner: boolean = false;

  _teamList: any[] = [];
  _teamGroupedList: any[] = [];
  visible_teamlist: boolean = false;

  _proxyUserList: any[] = [];
  selectedProxyUserId: any = -2;
  IsProxyAvailable: boolean = false;
  searchText: any = null;
  nonSubmitted_count: any = 0;


  // SLICK GRID
  // COMMON PROPERTIES
  selectedItems: any[];
  BehaviourObject_Data: any;
  inEmployeesInitiateGridInstance: AngularGridInstance;
  inEmployeesInitiateGrid: any;
  inEmployeesInitiateGridService: GridService;
  inEmployeesInitiateDataView: any;
  inEmployeesInitiateColumnDefinitions: Column[];
  inEmployeesInitiateGridOptions: GridOption;
  inEmployeesInitiateDataset: any;
  inEmployeesInitiateList = [];

  inEmployeesInitiateSelectedItems: any[];
  //General
  pageLayout: PageLayout = null;
  tempColumn: Column;
  columnName: string;
  code: string;
  columnDefinition: Column[];
  gridOptions: GridOption;
  HRRoleCode: any;
  BusinessType: any;
  constructor(
    private headerService: HeaderService,
    private alertService: AlertService,
    public pageLayoutService: PagelayoutService,
    public sessionService: SessionStorage,
    private router: Router,
    private titleService: Title,



  ) { }

  ngOnInit() {
    this.HRRoleCode = environment.environment.HRRoleCode;
    this.spinner = true;
    this._teamList = [];
    this.headerService.setTitle('Team Attendance');
    this.titleService.setTitle('Team Attendance');
    this.searchText = null;

    this._loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses)); // Get the whole matched session element set as a clean json(array) via an session object
    this.UserId = this._loginSessionDetails.UserSession.UserId; // Return just the one element from the set - userid
    this.UserName = this._loginSessionDetails.UserSession.PersonName; // Return just the one element from the set - username
    this.RoleId = this._loginSessionDetails.UIRoles[0].Role.Id;
    this.RoleCode = this._loginSessionDetails.UIRoles[0].Role.Code;
    this.BusinessType = this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping != null ? this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this._loginSessionDetails.Company.Id).BusinessType : 0;

    this.onRefresh();
  }

  onRefresh() {
    this.inEmployeesInitiateList = [];
    this.inEmployeesInitiateSelectedItems = [];
    this.spinner = true;
    this.code = 'teamattendance';

    if ((environment.environment.HRRoleCode.includes(this.RoleCode) == true)) {
      this.get_pagelayout().then((result) => {
      });
    } else { 
      this.getPISDetailsByManagerId();
    }

  }



  getPISDetailsByManagerId() {
    let datasource: DataSource = {
      Name: "GET_PISDETAILSBYMANAGERID",
      Type: DataSourceType.SP,
      IsCoreEntity: false
    }

    let searctElements: SearchElement[] = [
      {
        FieldName: "@managerId",
        Value: this.UserId
      },
      {
        FieldName: "@clientId",
        Value: (this.BusinessType == 1 || this.BusinessType == 2) ? this.sessionService.getSessionStorage("default_SME_ClientId") : 0
      },
      {
        FieldName: "@roleCode",
        Value:  this.RoleCode
      }
    ]

    console.log(searctElements);

    this.pageLayoutService.getDataset(datasource, searctElements).subscribe((result) => {
      if (result.Status && result.dynamicObject != null && result.dynamicObject != '') {
        let apiResult = JSON.parse(result.dynamicObject);
        console.log('RESULT ::', apiResult);

        this._teamList = apiResult;
        // this.inEmployeesInitiateList = apiResult;
        // this._teamGroupedList = _.chain(apiResult)
        // // Group the elements of Array based on `color` property
        // .groupBy("ManagerId")
        // // `key` is group's name (color), `value` is the array of objects
        // .map((value, key) => ({ ManagerId: key, TeamList: value, ManagerName : value[0].ManagerName }))
        // .value();
        // console.log('GROUPED TEAM LIST ::', this._teamGroupedList);
        console.log('this.sessionService.getSessionStorage', this.sessionService.getSessionStorage('selectedProxyId'));

        if (this.sessionService.getSessionStorage('selectedProxyId') != null && this.sessionService.getSessionStorage('selectedProxyId') != undefined) {
          this.selectedProxyUserId = this.sessionService.getSessionStorage('selectedProxyId')
        } else {
          this.selectedProxyUserId = -2;
        }
        this.commonBuilder();

        this.spinner = false
      } else {
        this.spinner = false

      }
    });
  }
  getArraySum(a) {
    var sum = 0;
    a.forEach(e => { if (e.IsPayrollSubmitted == false) { sum++ } });
    return sum;
    // var total = 0;
    // for (var i in a) {
    //   console.log('a[i].IsPayrollSubmitted',a[i].IsPayrollSubmitted);      
    //   if (a[i].IsPayrollSubmitted == false) {
    //     total = total + total;
    //   }
    // }

    // return total;
  }

  async onChange_proxy(value) {
    if (value.proxyUserId != null && value.proxyUserId != 0) {
      this.selectedProxyUserId = value.proxyUserId;
      this.sessionService.setSesstionStorage('selectedProxyId', this.selectedProxyUserId);
      this.commonBuilder();
    }
  }

  // PROXY ONCHANGE METHOLOGY WILL HAPPENING 
  async onChange_component(value) {
    this._proxyUserList = [];
    console.log('PROXY :', value);
    if (value.componentId == 2) {
      this._teamList.forEach(ele => {
        if (ele.ManagerId != this.UserId && ele.ManagerId != 0) {
          this._proxyUserList.push({
            proxyUserId: ele.ManagerId,
            proxyUserName: ele.PendingAtUserName,
            amountOfRequests: this._teamList.filter(item => item.ManagerId != 0 && item.ManagerId != this.UserId && item.ManagerId == ele.ManagerId).length
          })
        }
      });
      this._proxyUserList = _.uniqBy(this._proxyUserList, 'proxyUserId'); //removed if had duplicate proxyuserid
      this._proxyUserList = this._proxyUserList.filter(a => a.amountOfRequests > 0);
      console.log(' PROXY USER LIST : ', this._proxyUserList);

    }
  }

  commonBuilder() {
    this._proxyUserList = [
      {
        proxyUserId: -1,
        proxyUserName: `All (${this._teamList.length})`,
        amountOfRequests: this._teamList.length

      },
      {
        proxyUserId: -2,
        proxyUserName: `My Team Requests (${this._teamList.filter(item => item.ManagerId == this.UserId).length})`,
        amountOfRequests: this._teamList.filter(item => item.ManagerId == this.UserId).length

      }
    ]
    this._teamGroupedList = this._teamList;
    this._teamList.forEach(ele => {
      if (ele.ManagerId != this.UserId && ele.ManagerId != 0) {
        this._proxyUserList.push({
          proxyUserId: ele.ManagerId,
          proxyUserName: `${ele.ManagerName} (${this._teamList.filter(item => item.ManagerId != 0 && item.ManagerId != this.UserId && item.ManagerId == ele.ManagerId).length})`,
          amountOfRequests: this._teamList.filter(item => item.ManagerId != 0 && item.ManagerId != this.UserId && item.ManagerId == ele.ManagerId).length
        })
      }
    });
    this._proxyUserList = _.uniqBy(this._proxyUserList, 'proxyUserId'); //removed if had duplicate proxyuserid
    this._proxyUserList = this._proxyUserList.filter(a => a.amountOfRequests > 0);

    this.selectedProxyUserId == -2 ? (this._teamGroupedList = this._teamList.filter(item => item.ManagerId == this.UserId)) : this.selectedProxyUserId == -1 ? (this._teamGroupedList = this._teamList) :
      (this._teamGroupedList = this._teamList.filter(item => item.ManagerId == this.selectedProxyUserId));
    this.inEmployeesInitiateList = this._teamGroupedList;

    console.log('LIST ::', this.inEmployeesInitiateList);
    this.inEmployeesInitiateList = this.inEmployeesInitiateList.length == 0 ? (this._teamList != null && this._teamList.length > 0 ? this._teamList : []) : this.inEmployeesInitiateList;
    this.selectedProxyUserId = this.inEmployeesInitiateList.length == 0 ? -1 : this.selectedProxyUserId;
    this._teamGroupedList = this.inEmployeesInitiateList

    console.log(' PROXY USER LIST : ', this._proxyUserList);
    if (this._teamList.length > 0 && this._teamList.filter(item => item.ManagerId != 0 && item.ManagerId != this.UserId).length > 0) {
      this.IsProxyAvailable = true;
      this.inEmployeesInitiateList = [];
      this.selectedProxyUserId == -2 ? (this._teamGroupedList = this._teamList.filter(item => item.ManagerId == this.UserId)) : this.selectedProxyUserId == -1 ? (this._teamGroupedList = this._teamList) :
        (this._teamGroupedList = this._teamList.filter(item => item.ManagerId == this.selectedProxyUserId));
      this.inEmployeesInitiateList = this._teamGroupedList;
      this.selectedProxyUserId = this.inEmployeesInitiateList.length == 0 ? -1 : this.selectedProxyUserId;
      this.inEmployeesInitiateList = this.inEmployeesInitiateList.length == 0 ? (this._teamList != null && this._teamList.length > 0 ? this._teamList : []) : this.inEmployeesInitiateList;
      this._teamGroupedList = this.inEmployeesInitiateList;
    }
    this.nonSubmitted_count = this.getArraySum(this._teamGroupedList)
    this.sessionService.setSesstionStorage('selectedProxyId', this.selectedProxyUserId);

  }

  ontab_team(item) {
    var IsProxy = (item.ManagerId == this.UserId ? false : true) as any;
    sessionStorage.removeItem('IsProxy');
    sessionStorage.setItem('IsProxy', IsProxy);

    if ((environment.environment.HRRoleCode.includes(this.RoleCode) == true)) {
      this.router.navigate(['app/attendance/hrattendanceentries'], {
        queryParams: {
          "Idx": btoa(item.TeamId),
          "Mdx": btoa(item.ManagerId),
          "IsBulk": btoa('false').toString(),
        }
      });
    }
    else {
      this.router.navigate(['app/attendance/attendanceentries'], {
        queryParams: {
          "Idx": btoa(item.TeamId),
          "Mdx": btoa(item.ManagerId),
        }
      });
    }
  }

  do_view_request() {
    if (this.inEmployeesInitiateList.length == 0) {
      this.alertService.showWarning("There is no record please try after sometime.");
      return;
    }
    if (this.selectedItems.length == 0) {
      this.alertService.showWarning('Please select a minimum of one record from the list and try');
      return;
    }
    var IsProxy = (this.selectedItems[0].ManagerId == this.UserId ? false : true) as any;
    sessionStorage.removeItem('IsProxy');
    sessionStorage.setItem('IsProxy', IsProxy);

    // if (this.RoleCode == this.HRRoleCode) {
    //   if (this.selectedItems.length == 1) {
    //     this.router.navigate(['app/hrattendanceentries'], {
    //       queryParams: {
    //         "Idx": btoa(this.selectedItems[0].TeamId),
    //         "Mdx": btoa(this.selectedItems[0].ManagerId),
    //         "IsBulk": btoa('false').toString(),
    //       }
    //     });
    //   } else {
    //     this.router.navigate(['app/hrattendanceentries'], {
    //       queryParams: {
    //         "Idx": btoa(this.inEmployeesInitiateList[0].TeamId),
    //         "Mdx": btoa(this.inEmployeesInitiateList[0].ClientId),
    //         "IsBulk": btoa('true').toString(),
    //       }
    //     });
    //   }

    // } else {
      if (this.selectedItems.length == 1) {
        this.router.navigate(['app/attendance/attendanceentries'], {
          queryParams: {
            "Idx": btoa(this.selectedItems[0].TeamId),
            "Mdx": btoa(this.selectedItems[0].ManagerId),
            "IsBulk": btoa('false').toString(),
          }
        });
      }
    //   else {
    //     this.router.navigate(['app/hrattendanceentries'], {
    //       queryParams: {
    //         "Idx": btoa('0'),
    //         "Mdx": btoa(this.selectedItems[0].ManagerId),
    //         "IsBulk": btoa('true').toString(),
    //       }
    //     });
    //   }
    // }

  }

  do_view_all_request() {
    if (this.inEmployeesInitiateList.length == 0) {
      this.alertService.showWarning("There is no record please try after sometime.");
      return;
    }
    if (this.inEmployeesInitiateList.length != this.selectedItems.length) {
      this.alertService.showWarning('Please select all that are listed. Please try again.');
      return;
    }
    this.router.navigate(['app/attendance/hrattendanceentries'], {
      queryParams: {
        "Idx": btoa(this.inEmployeesInitiateList[0].TeamId),
        "Mdx": btoa(this.inEmployeesInitiateList[0].ClientId),
        "IsBulk": btoa('true').toString(),
      }
    });
  }

  do_view_by_manager() { // unused now
    this.router.navigate(['app/attendance/hrattendanceentries'], {
      queryParams: {
        "Idx": btoa('0'),
        "Mdx": btoa(this.selectedItems[0].ManagerId),
        "IsBulk": btoa('true').toString(),
      }
    });
  }

  // @HostListener('window:scroll', ['$event'])
  // onWindowScroll(e) {

  //   if (window.pageYOffset > 350) {
  //     let element = document.getElementById('navbar');
  //     element.classList.add('sticky');
  //   } else {
  //     let element = document.getElementById('navbar');
  //     element.classList.remove('sticky');
  //   }
  // }



  /* #region EVERTHING THAT WORKS PAGELAYOUT IS WRITTERN HERE  */

  get_pagelayout() {


    const promise = new Promise((res, rej) => {


      this.pageLayout = null;
      this.spinner = true;
      this.titleService.setTitle('Loading...');
      this.headerService.setTitle('');
      this.pageLayoutService.getPageLayout(this.code).subscribe(data => {
        if (data.Status === true && data.dynamicObject != null) {
          this.pageLayout = data.dynamicObject;
          console.log('LEAVE REQUEST LIST ::', this.pageLayout);
          this.titleService.setTitle(this.pageLayout.PageProperties.PageTitle);
          this.headerService.setTitle(this.pageLayout.PageProperties.BannerText);
          this.setGridConfiguration();
          if (this.pageLayout.GridConfiguration.ShowDataOnLoad) {
            this.getDataset();
          }
          res(true)
        }
        else {
          res(true)
          this.titleService.setTitle('HR Suite');
        }

      }, error => {
        console.log(error);
        this.spinner = false;
        this.titleService.setTitle('HR Suite');
      }
      );
    })
    return promise;
  }


  setGridConfiguration() {
    if (!this.pageLayout.GridConfiguration.IsDynamicColumns) {
      this.inEmployeesInitiateColumnDefinitions = this.pageLayoutService.setColumns(this.pageLayout.GridConfiguration.ColumnDefinitionList);
      this.inEmployeesInitiateColumnDefinitions.forEach(element => {

        if (element.id == 'IsPayrollSubmitted') {
          element.filter = {
            collection: [{ value: '', label: 'All' }, { value: true, label: 'Submitted' }, { value: false, label: 'Not Submitted' }],
            model: Filters.singleSelect,
          }
        }
        if (element.id == 'IsMigrated') {
          element.filter = {
            collection: [{ value: '', label: 'All' }, { value: true, label: 'Submitted' }, { value: false, label: 'Not Submitted' }],
            model: Filters.singleSelect,
          }
        }
      });
    }

    this.inEmployeesInitiateGridOptions = this.pageLayoutService.setGridOptions(this.pageLayout.GridConfiguration);
    this.inEmployeesInitiateGridOptions.draggableGrouping = {
      dropPlaceHolderText: 'Drop a column header here to group by the column',
      // groupIconCssClass: 'fa fa-outdent',
      deleteIconCssClass: 'fa fa-times',
      // onGroupChanged: (e, args) => this.onGroupChange(),
      // onExtensionRegistered: (extension) => this.draggableGroupingPlugin = extension,
    }

  }


  getDataset() {
    this.selectedItems = [];
    this.inEmployeesInitiateList = [];
    // this.pageLayout.SearchConfiguration.SearchElementList.
    let searctElements: SearchElement[] = [
      {
        FieldName: "@managerId",
        Value: this.UserId
      },
      {
        FieldName: "@clientId",
        Value:  this.BusinessType == 1 ? this.sessionService.getSessionStorage("default_SME_ClientId") : 0
      },
      {
        FieldName: "@roleCode",
        Value:  this.RoleCode
      }
    ]
    this.pageLayoutService.getDataset(this.pageLayout.GridConfiguration.DataSource, searctElements).subscribe(dataset => {
      this.spinner = false;
      if (dataset.Status == true && dataset.dynamicObject !== null && dataset.dynamicObject !== '') {
        // this.inEmployeesInitiateList = JSON.parse(dataset.dynamicObject);
       let ProxyList = [];
       ProxyList = JSON.parse(dataset.dynamicObject);
       if(this.BusinessType != 3){
        this._teamList = ProxyList.length > 0 ? ProxyList.filter(z=>z.ClientContractId == this.sessionService.getSessionStorage("default_SME_ContractId")) :[];
       }else {
        this._teamList = JSON.parse(dataset.dynamicObject);
       }
       
        console.log('this.sessionService.getSessionStorage', this.sessionService.getSessionStorage('selectedProxyId'));

        if (this.sessionService.getSessionStorage('selectedProxyId') != null && this.sessionService.getSessionStorage('selectedProxyId') != undefined) {
          this.selectedProxyUserId = Number(this.sessionService.getSessionStorage('selectedProxyId'))
        } else {
          this.selectedProxyUserId = -2;
        }

        this.commonBuilder();
        try {

        } catch (error) {

        }

      }
      else {
        console.log('Sorry! Could not Fetch Data|', dataset);
      }
    }, error => {
      this.spinner = false;
      console.log(error);
    })
  }

  inEmployeesInitiateGridReady(angularGrid: AngularGridInstance) {
    this.inEmployeesInitiateGridInstance = angularGrid;
    this.inEmployeesInitiateDataView = angularGrid.dataView;
    this.inEmployeesInitiateGrid = angularGrid.slickGrid;
    this.inEmployeesInitiateGridService = angularGrid.gridService;
  }


  onSelectedEmployeeChange(eventData, args) {
    if (Array.isArray(args.rows)) {
      console.log('checkbox selected');
    }
    this.selectedItems = [];
    if (args != null && args.rows != null && args.rows.length > 0) {
      for (let i = 0; i < args.rows.length; i++) {
        var row = args.rows[i];
        var row_data = this.inEmployeesInitiateDataView.getItem(row);
        this.selectedItems.push(row_data);
      }
    }
    console.log('ANSWER ::', this.selectedItems);
  }

  onCellClicked(e, args) {
    const metadata = this.inEmployeesInitiateGridInstance.gridService.getColumnFromEventArguments(args);
    // this.rowData = null;
    // if (metadata.columnDef.id === 'decline_req' && metadata.dataContext.Status == 100) {
    //   this.rowData = metadata.dataContext;
    //   this.common_approve_reject('edit', false, (metadata.dataContext));
    //   return;
    // }
    // else if (metadata.columnDef.id === 'approve_req' && metadata.dataContext.Status == 100) {
    //   this.rowData = metadata.dataContext;
    //   this.common_approve_reject('edit', true, (metadata.dataContext));
    //   return;
    // }
    // else if (metadata.columnDef.id === 'regularize_req' && metadata.dataContext.Status == 100) {
    //   this.do_revise(metadata.dataContext);
    //   // this.bsDropdown.render({
    //   //   component: CustomActionFormatterComponent,
    //   //   args,
    //   //   offsetLeft: 92,
    //   //   offsetDropupBottom: 15,
    //   //   parent: this, // provide this object to the child component so we can call a method from here if we wish
    //   // });
    //   return;
    // }
    // else {
    //   return;
    //   // this.alertService.showWarning('Action was blocked : Invalid Leave request - that tha leave request is already approved/rejected.')
  }
  ngOnDestroy() {
    // this.sessionService.delSessionStorage('selectedProxyId');
  }
}



/* #endregion */




