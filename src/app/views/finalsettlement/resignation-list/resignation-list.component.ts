import { Component, OnInit } from '@angular/core';
import { Column, GridOption, Formatters, OnEventArgs } from 'angular-slickgrid';
import { PagelayoutService, SessionStorage, AlertService } from 'src/app/_services/service';
import { Role, LoginResponses } from 'src/app/_services/model';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { SessionDetails } from 'src/app/components/Models/SessionDetails';
import { DataSource, SearchElement, SearchConfiguration } from '../../personalised-display/models';
import { DataSourceType, SearchPanelType, InputControlType } from '../../personalised-display/enums';
import { Router } from '@angular/router';
import { tr } from 'date-fns/locale';


@Component({
  selector: 'app-resignation-list',
  templateUrl: './resignation-list.component.html',
  styleUrls: ['./resignation-list.component.css']
})
export class ResignationListComponent implements OnInit {

  columnDefinition : Column[];
  gridOptions : GridOption;
  dataset : any[];
  spinner : boolean = false;

  _loginSessionDetails : LoginResponses;
  userId : number;
  userName : string = '';
  currentRole : Role;
  roleCode : string;
  groupId : number;
  processStatusIds : string[];
  processStatusId : string;
  searchConfiguration : SearchConfiguration;


  constructor(
    private sessionService : SessionStorage,
    private pagelayoutService : PagelayoutService,
    private alertService : AlertService,
    private router : Router
  ) { }

  ngOnInit() {
    this.columnDefinition = [
      {
        id : 'Code',
        field : 'EmployeeCode',
        name : 'Employee Code',
        filterable : true
      },
      {
        id : 'Name',
        field : 'EmployeeName',
        name : 'Employee Name',
        filterable : true
      },
      {
        id : 'Designatiom',
        field : 'Designation',
        name : 'Designation',
        filterable : true
      },
      {
        id : 'edit',
        field : 'Id',
        name : '',
        width : 20,
        formatter : Formatters.editIcon,
        onCellClick: (e: Event, args: OnEventArgs) => {
          
          console.log(args.dataContext);

          // localStorage.removeItem('previousPath');
          // localStorage.setItem('previousPath', '/app/componentUI');

          this.router.navigate(['app/fnf/finalsettlement'], {
            queryParams: {
             "Odx": btoa(JSON.stringify(args.dataContext)),
            }
          });
                            
       }
      }
    ];

    this.gridOptions = {
      enableGridMenu: true,
      enableColumnPicker: false,
      enableAutoResize: true,
      enableSorting: true,
      datasetIdPropertyName: "Id",
      enableColumnReorder: true,
      enableFiltering: true,
      showHeaderRow: true,
      enablePagination: false,
      enableAddRow: false,
      leaveSpaceForNewRows: true,
      autoEdit: true,
      alwaysShowVerticalScroll: false,
      enableCellNavigation: true,
      editable : true,
      //forceFitColumns : true,
      enableAutoSizeColumns : true,
      enableAutoTooltip : true,
    }

    

    this._loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses)); // Get the whole matched session element set as a clean json(array) via an session object
    this.userId = this._loginSessionDetails.UserSession.UserId; // Return just the one element from the set - userid
    this.userName = this._loginSessionDetails.UserSession.PersonName;

    if(sessionStorage.getItem('activeRoleId') != null){
      const selectedRoleDetails = this._loginSessionDetails.UIRoles.find(a => a.Role.Id == (sessionStorage.getItem('activeRoleId') as any));
      this.currentRole = selectedRoleDetails.Role as any;

    }
    else{
      const selectedRoleDetails = this._loginSessionDetails.UIRoles[0];
      this.currentRole = selectedRoleDetails.Role as any;
    } 

    this.roleCode = this.currentRole.Code;

    console.log("UserId" , this.userId)
    // console.log("UserId" , this.userId)

    this.setProcessStatusIds();


    this.searchConfiguration = {
      SearchElementList : [
        {
          DataSource: {
            EntityType: 0,
            IsCoreEntity: false,
            Name: "Client",
            Type: 1
          },
          DefaultValue : "1846",
          DisplayFieldInDataset : "Name",
          FieldName : "ClientId",
          DisplayName : 'Client Name',
          ForeignKeyColumnNameInDataset : "Id",
          InputControlType : InputControlType.AutoFillTextBox,
          IsIncludedInDefaultSearch : true,
          TriggerSearchOnChange : false,
          MultipleValues : null,
          Value : null,
          DropDownList : [],
          ParentFields : null,
          ParentHasValue : [],
          GetValueFromUser : false,
          SendElementToGridDataSource : true
        },
        {
          FieldName : 'PendingAtUserId',
          DisplayName : '',
          Value : this.userId,
          InputControlType : InputControlType.AutoFillTextBox,
          DataSource : {
            Name : '',
            Type : DataSourceType.View,
            IsCoreEntity : false
          },
          DisplayFieldInDataset : 'Name',
          ForeignKeyColumnNameInDataset : 'Id',
          IsIncludedInDefaultSearch : false,
          DropDownList : [],
          ParentFields : [],
          MultipleValues : null,

        },
        {
          FieldName : 'ProcessStatusId',
          DisplayName : '',
          Value : this.processStatusId,
          InputControlType : InputControlType.AutoFillTextBox,
          DataSource : {
            Name : '',
            Type : DataSourceType.View,
            IsCoreEntity : false
          },
          DisplayFieldInDataset : 'Name',
          ForeignKeyColumnNameInDataset : 'Id',
          MultipleValues : null,
          IsIncludedInDefaultSearch : false,
          DropDownList : [],
          ParentFields : [],
        },
        {
          FieldName : 'Status',
          DisplayName : '',
          Value : "2",
          InputControlType : InputControlType.AutoFillTextBox,
          DataSource : {
            Name : '',
            Type : DataSourceType.View,
            IsCoreEntity : false
          },
          DisplayFieldInDataset : 'Name',
          ForeignKeyColumnNameInDataset : 'Id',
          MultipleValues : null,
          IsIncludedInDefaultSearch : false,
          DropDownList : [],
          ParentFields : [],
        },
      ],
      SearchButtonRequired : true,
      ClearButtonRequired : false,
      SearchPanelType : SearchPanelType.SearchBar
    }

    this.getDataset()
    

  }

  setProcessStatusIds(){
    if(this.currentRole.Code == 'Manager'){
      //this.processStatusIds = ["21000"]
      this.processStatusIds = ["20300" , "20549"]
      this.processStatusId = "20300"
    }
    else if(this.currentRole.Code == 'LocationHR'){
      this.processStatusIds = ["21000" , "21249"  ]
      this.processStatusId = "21000";
    }
    else if(this.currentRole.Code == 'ClientSpoc'){
      
      this.processStatusId = "22400";
      this.processStatusIds = ["22400" , "22649"]
    }
    else if(this.currentRole.Code == 'ClientPayroll'){
      
      this.processStatusId = "21700";
      this.processStatusIds = ["21700" , "21949"]
    }
    else if(this.currentRole.Code == 'PayrollAdmin'){
      
      this.processStatusId = "23100";
      this.processStatusIds = ["23100" , "23349"]
    }

    console.log("Process Ids :: " , this.processStatusIds);
  }

  onSearch(){
    this.getDataset();
  }

  getDataset(){
    let datasourse : DataSource = {
      Name : 'EmployeeFnFView',
      Type : DataSourceType.View,
      IsCoreEntity : false
    }

    let searchElements : SearchElement[] = [
      {
        FieldName : 'PendingAtUserId',
        Value : this.userId,
      },
      {
        FieldName : 'ProcessStatusId',
        Value : this.processStatusId,
        //MultipleValues : this.processStatusIds
      }
    ]

    this.spinner = true;
    this.pagelayoutService.getDataset(datasourse , this.searchConfiguration.SearchElementList).subscribe((result) => {
      this.spinner = false;
      if (result.Status == true && result.dynamicObject !== null && result.dynamicObject !== '') {
        this.dataset = JSON.parse(result.dynamicObject);
        console.log("Dataset ::" , this.dataset);

      }
      else{
        this.dataset = [];
      }
    } , (error) => {
      this.spinner = false;
      this.alertService.showWarning("Sorry , Something went wrong! Could not fetch records.")
      console.error(error);
      this.dataset = [];
    })
  }
}
