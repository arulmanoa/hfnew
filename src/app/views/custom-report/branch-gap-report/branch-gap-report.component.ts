import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { SessionStorage } from '../../../_services/service/session-storage.service';
import { LoginResponses } from '../../../_services/model/Common/LoginResponses';
import { apiResult } from 'src/app/_services/model/apiResult';
import { AlertService, ClientService, ExcelService, PagelayoutService } from 'src/app/_services/service';
import { enumHelper } from 'src/app/shared/directives/_enumhelper';
import { Title } from '@angular/platform-browser';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { DataSource, SearchElement } from 'src/app/views/personalised-display/models';
import { DataSourceType, InputControlType, SearchPanelType } from '../../personalised-display/enums';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
import { SearchConfiguration } from 'src/app/views/personalised-display/models';
import _ from 'lodash';
import moment from 'moment';

@Component({
  selector: 'app-branch-gap-report',
  templateUrl: './branch-gap-report.component.html',
  styleUrls: ['./branch-gap-report.component.css']
})
export class BranchGapReportComponent implements OnInit {

  @ViewChild('customTableToXlsx') specificBranchTable: ElementRef;
  @ViewChild('allBranchTableToXlsx') allBranchTable: ElementRef;

  noData: boolean = false;
  spinner: boolean = false;
  refreshing_table_spinner: boolean = false;
  clientList: any[] = [];

  gapReportData: any = [];
  gapReport_header = [];
  gapReport_actualData: any[] = [];

  sessionDetails: LoginResponses;
  roleId: number = 0;
  roleCode: string = '';
  userId: any = 0;
  userName: any;
  companyId: any;
  businessType: any;
  employeeId: any;

  searchElementConfiguration: SearchConfiguration;
  searchElementList : SearchElement[];
  selectedValues: SearchElement[] = [];

  showSpecificBranchTable: boolean = false;
  totalPlannedDS: number = 0;
  totalActiveHeadCount: number = 0;
  totalOpenPosition: number = 0;
  
  constructor(
    private clientService: ClientService,
    private alertService: AlertService,
    public utilsHelper: enumHelper,
    public sessionService: SessionStorage,
    private titleService: Title,
    private pageLayoutService: PagelayoutService,
    private loadingScreenService: LoadingScreenService,
    private excelService: ExcelService
  ) { }

  ngOnInit() {
    this.noData = false;
    this.spinner = true;
    this.titleService.setTitle('Attendance Gap Report');

    this.sessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses));
    this.userId = this.sessionDetails.UserSession.UserId;
    this.userName = this.sessionDetails.UserSession.PersonName;
    this.roleId = this.sessionDetails.UIRoles[0].Role.Id;
    this.roleCode = this.sessionDetails.UIRoles[0].Role.Code;
    this.businessType = this.sessionDetails.Company.LstCompanyBusinessTypeMapping != null ? this.sessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this.sessionDetails.Company.Id).BusinessType : 0;

    console.log('INSIDE GAP REPORT');
    this.searchElementList  = [
      { 
        DataSource : {
          IsCoreEntity : false,
          Name : "",
          Type : 0
        },
        DefaultValue : this.userId,
        DisplayFieldInDataset : "Name",
        FieldName : "@UserId",
        DisplayName : "User Id",
        ForeignKeyColumnNameInDataset : "",
        IsIncludedInDefaultSearch : false,
        InputControlType : InputControlType.TextBox,
        TriggerSearchOnChange : false,
        ReadOnly : false,
        DropDownList : [],
        ParentHasValue : [],
        ParentFields : [],
        MultipleValues : null,
        GetValueFromUser : false,
        SendElementToGridDataSource : true,
        IsFieldMandatory: false,
        Value: this.userId
      }, { 
        DataSource : {
          IsCoreEntity : false,
          Name : "",
          Type : 0
        },
        DefaultValue : this.roleId,
        DisplayFieldInDataset : "Name",
        FieldName : "@RoleId",
        DisplayName : "Role Id",
        ForeignKeyColumnNameInDataset : "",
        IsIncludedInDefaultSearch : false,
        InputControlType : InputControlType.TextBox,
        Value : this.roleId,
        TriggerSearchOnChange : false,
        ReadOnly : false,
        DropDownList : [],
        ParentHasValue : [],
        ParentFields : [],
        MultipleValues : null,
        GetValueFromUser : false,
        SendElementToGridDataSource : true,
        IsFieldMandatory: false
      }, { 
        DataSource : {
          IsCoreEntity : false,
          Name : "GetAllDistrictDetails",
          Type : 0
        },
        DefaultValue : 0,
        DisplayFieldInDataset : "DistrictName",
        FieldName : "@DistrictId",
        DisplayName : "District Name",
        ForeignKeyColumnNameInDataset : "DistrictId",
        IsIncludedInDefaultSearch : true,
        InputControlType : InputControlType.AutoFillTextBox,
        Value : null,
        TriggerSearchOnChange : false,
        ReadOnly : false,
        DropDownList : [],
        ParentHasValue : [],
        ParentFields : ["@UserId", "@RoleId"],
        MultipleValues : null,
        GetValueFromUser : false,
        SendElementToGridDataSource : true,
        IsFieldMandatory: true
      }, { 
        DataSource : {
          IsCoreEntity : false,
          Name : "GetAllBranchDetails",
          Type : 0
        },
        DefaultValue : 0,
        DisplayFieldInDataset : 'BranchName',
        FieldName : "@BranchId",
        DisplayName : 'Branch Name',
        ForeignKeyColumnNameInDataset : "BranchId",
        IsIncludedInDefaultSearch : true,
        InputControlType : InputControlType.AutoFillTextBox,
        Value : null,
        TriggerSearchOnChange : false,
        ReadOnly : false,
        DropDownList : [],
        ParentHasValue : [],
        ParentFields : ["@UserId", "@RoleId", "@DistrictId"],
        MultipleValues : null,
        GetValueFromUser : false,
        SendElementToGridDataSource : true,
        IsFieldMandatory: true
      }
      // {
      //   DisplayName : "Start Date",
      //   FieldName : "@startDate",
      //   Value : null,
      //   MultipleValues : null,
      //   DropDownList : [],
      //   InputControlType : InputControlType.DatePicker,
      //   DataSource : {
      //     Name : "",
      //     Type : 0,
      //     IsCoreEntity : false,
      //     EntityType : 0
      //   },
      //   ForeignKeyColumnNameInDataset : '',
      //   DisplayFieldInDataset : '',
      //   IsIncludedInDefaultSearch : true,
      //   SendElementToGridDataSource : false,
      //   ParentFields : [],
      //   IsFieldMandatory: true
      // }, {
      //   DisplayName : "End Date",
      //   FieldName : "@endDate",
      //   Value : null,
      //   MultipleValues : null,
      //   DropDownList : [],
      //   InputControlType : InputControlType.DatePicker,
      //   DataSource : {
      //     Name : "",
      //     Type : 0,
      //     IsCoreEntity : false,
      //     EntityType : 0
      //   },
      //   ForeignKeyColumnNameInDataset : '',
      //   DisplayFieldInDataset : '',
      //   IsIncludedInDefaultSearch : true,
      //   SendElementToGridDataSource : false,
      //   ParentFields : ["@startDate"],
      //   IsFieldMandatory: true
      // }
    ];
    
    this.doRefresh();
  }

  doRefresh() {
    

    this.searchElementConfiguration = {
      IsDataLevelSecurityRequired: true,
      SecurityKeys:[['UserId'], ['RoleId']],
      SearchElementList : _.cloneDeep(this.searchElementList),
      SearchPanelType : SearchPanelType.Panel,
      SearchButtonRequired : true,
      ClearButtonRequired : false
    };

    this.spinner = false;
   
  }
  doSearch() {
    const values = this.selectedValues.reduce((obj, item) => (obj[item.FieldName] = item.Value, obj), {}) as any;
    const { '@DistrictId': districtId, '@BranchId': branchId } = values;
    this.clientService.GetBranchGapReportForITC(this.roleId,this.userId, districtId, branchId, moment(new Date()).format('YYYY-MM-DD'), moment(new Date()).format('YYYY-MM-DD')).subscribe((response: any) => {
      console.log('RESPONSE GetBranchGapReport API ::', response);
      this.loadingScreenService.stopLoading();
      if (response.Status && response.dynamicObject && response.dynamicObject != '') {
        this.gapReportData = response.dynamicObject;
        this.gapReport_header= this.gapReportData && this.gapReportData.length ? Object.keys(this.gapReportData[0]) : [];
        this.gapReport_actualData = JSON.parse(JSON.stringify(this.gapReportData));
        if (branchId > 0) {
          this.showSpecificBranchTable = false;
          const newData = this.gapReportData.map(item => {
            const { WeekNr, ...newItem } = item; // Destructuring and removing the WeekNr property
            return newItem;
          });
          this.gapReport_header= newData && newData.length ? Object.keys(newData[0]) : [];
          this.gapReport_actualData = newData;
        } else {
          const initialTotal = { plannedDS: 0, openPosition: 0, activeHeadCount: 0 };
          
          const { plannedDS, openPosition, activeHeadCount } = this.gapReport_actualData.reduce(
            (acc, { PlannedResourceCount, OpenPositionCount, ActiveResourceCount }) => ({
              plannedDS: acc.plannedDS + PlannedResourceCount,
              openPosition: acc.openPosition + OpenPositionCount,
              activeHeadCount: acc.activeHeadCount + ActiveResourceCount
            }),
            initialTotal
          );
          
          this.totalPlannedDS = plannedDS;
          this.totalOpenPosition = openPosition;
          this.totalActiveHeadCount = activeHeadCount;
        }
        this.noData = false;
        this.refreshing_table_spinner = false;
        console.log('DATA  ::', this.gapReport_header, this.gapReport_actualData);
      } else {
        this.noData = true;
        this.refreshing_table_spinner = false;
      }
    }, err => {
      console.log('ERROR IN GetBranchGapReport API ::', err);
    });
  }
  
  onSearchBtnClickedEvent(data) {
    console.log('clicked', data);
    this.showSpecificBranchTable = false;
    this.refreshing_table_spinner = true;
    this.loadingScreenService.startLoading();
    this.selectedValues = data;
    this.gapReport_header = [];
    this.gapReport_actualData = [];
    if (this.selectedValues && this.selectedValues.length) {
      this.doSearch();
    }
  }

  export() {
    const fileName = 'GapReport_';
    this.showSpecificBranchTable ? this.excelService.exportToExcelFromTable(this.specificBranchTable, fileName) 
      : this.excelService.exportToExcelFromTable(this.allBranchTable, fileName);
  }

}
