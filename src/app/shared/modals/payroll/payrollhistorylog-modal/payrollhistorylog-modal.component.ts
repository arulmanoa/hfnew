import { Component, OnInit, Input } from '@angular/core';
import { PageLayout, ColumnDefinition } from 'src/app/views/personalised-display/models';
import { Column, AngularGridInstance, GridOption, Formatter, GridService, FieldType, Filters } from 'angular-slickgrid';
import { NgbModalOptions, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { PagelayoutService, AlertService, PayrollService } from 'src/app/_services/service';
import { Router, ActivatedRoute } from '@angular/router';
import { RowDataService } from 'src/app/views/personalised-display/row-data.service';
import { TimeCardStatus } from 'src/app/_services/model/Payroll/TimecardStatus';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
import { PayRunModel, _PayRun } from 'src/app/_services/model/Payroll/PayRunModel';
import { PayRunDetails, PayRun, PayRunStatus, MarkupCalculationMessage, ProcessCategory } from 'src/app/_services/model/Payroll/PayRun';
import { UIMode } from 'src/app/_services/model/Common/BaseModel';
import { LoginResponses } from 'src/app/_services/model/Common/LoginResponses';
import { apiResult } from 'src/app/_services/model/apiResult';
import { SessionStorage } from 'src/app/_services/service/session-storage.service';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import * as _ from 'lodash';
import { SearchPanelType, DataSourceType } from 'src/app/views/personalised-display/enums';
import { enumHelper } from 'src/app/shared/directives/_enumhelper';
import { PVRStatus } from 'src/app/_services/model/Payroll/PayrollVerificationRequest';


@Component({
  selector: 'app-payrollhistorylog-modal',
  templateUrl: './payrollhistorylog-modal.component.html',
  styleUrls: ['./payrollhistorylog-modal.component.css']
})
export class PayrollhistorylogModalComponent implements OnInit {

  @Input() rowData: any;
  sessionDetails: LoginResponses;
  RoleId: number = 0;
  UserId: any;
  PersonName: any;
  modalOption: NgbModalOptions = {};
  pageLayout: PageLayout = null;
  dataset = [];
  spinner: boolean = false;

  // COMMON PROPERTIES
  inPayrollHistoryLogs = [];
  ClientName: any; ContractCode : any;


  constructor(
    private pageLayoutService: PagelayoutService,
    private route: ActivatedRoute,
    private rowDataService: RowDataService,
    private activeModal: NgbActiveModal,
    private alertService: AlertService,
    private loadingScreenService: LoadingScreenService,
    private payrollService: PayrollService,
    private router: Router,
    public sessionService: SessionStorage,
    public enumhelpter : enumHelper


  ) { }

  ngOnInit() {
    this.rowData = JSON.parse(this.rowData);
    this.sessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses)); // Get the whole matched session element set as a clean json(array) via an session object
    this.RoleId = this.sessionDetails.UIRoles[0].Role.Id; // bind Logged user id may be change baed on dashboard 
    this.UserId = this.sessionDetails.UserSession.UserId;
    this.pageLayout = {

      Description: "config1",
      Code: "dymmy",
      CompanyId: 1,
      ClientId: 2,
      SearchConfiguration: {
        SearchElementList: [
        ],
        SearchPanelType: SearchPanelType.Panel
      },
      GridConfiguration: {
        ColumnDefinitionList: [

        ],
        DataSource: {
          Type: DataSourceType.View,
          Name: 'Dummy'
        },
        ShowDataOnLoad: true,
        IsPaginationRequired: false,
        DisplayFilterByDefault: false,
        EnableColumnReArrangement: true,
        IsColumnPickerRequired: true,
        IsSummaryRequired: true,
        IsGroupingEnabled: false,
        DefaultGroupingFields: ["Code", "Name"],
        PinnedRowCount: -1,
        PinnedColumnCount: -1,
        PinRowFromBottom: true,
      },
      PageProperties: {
        PageTitle: "Dummy List",
        BannerText: "Dummy",
      }
    }
    this.getDataset();
  }

  closeModal() {
    this.activeModal.close('Modal Closed');
  }
  
  // API CALLS USING TABLE ROUTING AND SEARCHELEMENTS IF NEEDED
  getDataset() {
    this.pageLayout.GridConfiguration.DataSource = null;
    this.pageLayout.GridConfiguration.DataSource = { Type: 0, Name: 'UI_List_GetPVRDetailsHistory' }
    this.pageLayout.SearchConfiguration.SearchElementList.push(
      {
        "DisplayName": "teamId",
        "FieldName": "teamId",
        "InputControlType": 0,
        "Value": this.rowData.teamId,
        "MultipleValues": null,
        "RelationalOperatorsRequired": false,
        "RelationalOperatorValue": null,
        "DataSource": {
          "Type": 0,
          "Name": null,
          "EntityType": 0,
          "IsCoreEntity": false
        },
        "IsIncludedInDefaultSearch": true,
        "DropDownList": [],
        "ForeignKeyColumnNameInDataset": null,
        "DisplayFieldInDataset": null,
        "ParentFields": null,
        "ReadOnly": false,
        "TriggerSearchOnChange": false
      },
      {
        "DisplayName": "payperiodId",
        "FieldName": "payperiodId",
        "InputControlType": 0,
        "Value": this.rowData.payperiodId,
        "MultipleValues": null,
        "RelationalOperatorsRequired": false,
        "RelationalOperatorValue": null,
        "DataSource": {
          "Type": 0,
          "Name": null,
          "EntityType": 0,
          "IsCoreEntity": false
        },
        "IsIncludedInDefaultSearch": true,
        "DropDownList": [],
        "ForeignKeyColumnNameInDataset": null,
        "DisplayFieldInDataset": null,
        "ParentFields": null,
        "ReadOnly": false,
        "TriggerSearchOnChange": false
      });
    this.inPayrollHistoryLogs = [];
    this.dataset = [];
    this.spinner = true;
    this.pageLayoutService.getDataset(this.pageLayout.GridConfiguration.DataSource, this.pageLayout.SearchConfiguration.SearchElementList).subscribe(dataset => {
      this.spinner = false;
      if (dataset.Status == true && dataset.dynamicObject !== null && dataset.dynamicObject !== '') {
        this.dataset = JSON.parse(dataset.dynamicObject);
        this.inPayrollHistoryLogs = this.dataset;
        this.ContractCode  = this.dataset[0].ContractCode;
        this.ClientName = this.dataset[0].ClientName;
        this.inPayrollHistoryLogs.forEach(element => {
          element.EmployeeList = this.hasJsonStructure(element.EmployeeList) === true ? JSON.parse(element.EmployeeList) : element.EmployeeList;
        });

        console.log('history log', this.inPayrollHistoryLogs);
        
        }
      else {
        console.log('Sorry! Could not Fetch Data|', dataset);
      }
    }, error => {
      this.spinner = false;
      console.log(error);
    })
  } 
  hasJsonStructure(str) {
    if (typeof str !== 'string') return false;
    try {
      const result = JSON.parse(str);
      const type = Object.prototype.toString.call(result);
      return type === '[object Object]'
        || type === '[object Array]';

    } catch (err) {
      return false;
    }
  }

  getStatus(StatusCode){
      var statusList = [];
      statusList = this.enumhelpter.transform(TimeCardStatus) as any;
      return statusList.find(a=>a.id == StatusCode).name;
  }

}
