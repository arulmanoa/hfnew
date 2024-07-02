import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AttendanceService } from 'src/app/_services/service/attendnace.service';
import { ActivatedRoute, Router } from '@angular/router';
import * as _ from 'lodash';
import { SessionStorage } from '../../../_services/service/session-storage.service';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { LoginResponses } from '../../../_services/model/Common/LoginResponses';
import { AlertService, ExcelService } from 'src/app/_services/service';
import { SearchConfiguration, SearchElement } from 'src/app/views/personalised-display/models';
import { DataSourceType, InputControlType, SearchPanelType } from '../../personalised-display/enums';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
import { Title } from '@angular/platform-browser';
import { apiResult } from 'src/app/_services/model/apiResult';
import * as XLSX from 'xlsx';
import moment from 'moment';

@Component({
  selector: 'app-attendance-summary-report-view',
  templateUrl: './attendance-summary-report-view.component.html',
  styleUrls: ['./attendance-summary-report-view.component.css']
})
export class AttendanceSummaryReportViewComponent implements OnInit {

  @ViewChild('tabletoExcel') table: ElementRef;

  refreshing_table_spinner: boolean = false;
  spinner: boolean = false;
  noData: boolean = false;
  showTable: boolean = false;
  attendanceSummary_tableData = [];
  attendanceSummary_TableHeaders = [];
  attendanceSummary_DataFields = [];

  sessionDetails: LoginResponses;
  RoleId: number = 0;
  UserId: any = 0;
  UserName: any;
  employeeId: any;
  RoleCode: any;

  clientID: any;
  clientContractId: number = 0;
  attendancePeriodId: any;
  branchId: any;

  searchElementConfiguration: SearchConfiguration;
  searchElementList : SearchElement[];
  selectedValues: SearchElement[] = [];

  constructor(
    private attendanceService: AttendanceService,
    private alertService: AlertService,
    private loadingScreenService: LoadingScreenService,
    public sessionService: SessionStorage,
    private route: ActivatedRoute,
    private titleService: Title,
    private router: Router,
    private excelService: ExcelService
  ) { }

  ngOnInit() {
    this.spinner = true;
    this.sessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses)); 
    this.RoleId = this.sessionDetails.UIRoles[0].Role.Id;
    this.UserId = this.sessionDetails.UserSession.UserId;
    this.RoleCode = this.sessionDetails.UIRoles[0].Role.Code;
    this.UserName = this.sessionDetails.UserSession.PersonName;
    this.titleService.setTitle('Attendance Summary Report');
    this.spinner = false;
    this.searchElementList  = [
      { 
        DataSource : {
          IsCoreEntity : false,
          Name : "",
          Type : 0
        },
        DefaultValue : this.UserId,
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
        Value: this.UserId
      }, { 
        DataSource : {
          IsCoreEntity : false,
          Name : "",
          Type : 0
        },
        DefaultValue : this.RoleId,
        DisplayFieldInDataset : "Name",
        FieldName : "@RoleId",
        DisplayName : "Role Id",
        ForeignKeyColumnNameInDataset : "",
        IsIncludedInDefaultSearch : false,
        InputControlType : InputControlType.TextBox,
        Value : this.RoleId,
        TriggerSearchOnChange : false,
        ReadOnly : false,
        DropDownList : [],
        ParentHasValue : [],
        ParentFields : [],
        MultipleValues : null,
        GetValueFromUser : false,
        SendElementToGridDataSource : true,
        IsFieldMandatory: false
      }, 
     { 
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
        ParentFields : ["@DistrictId", "@UserId", "@RoleId"],
        MultipleValues : null,
        GetValueFromUser : false,
        SendElementToGridDataSource : true,
        IsFieldMandatory: true
      }, { 
        DataSource : {
          IsCoreEntity : false,
          Name : "GetAllDistributorDetails",
          Type : 0
        },
        DefaultValue : 0,
        DisplayFieldInDataset : 'DistributorName',
        FieldName : "@DistributorId",
        DisplayName : 'Distributor Name',
        ForeignKeyColumnNameInDataset : "DistributorId",
        IsIncludedInDefaultSearch : true,
        InputControlType : InputControlType.AutoFillTextBox,
        Value : null,
        TriggerSearchOnChange : false,
        ReadOnly : false,
        DropDownList : [],
        ParentHasValue : [],
        ParentFields : ["@BranchId", "@UserId", "@RoleId", "@DistrictId"],
        MultipleValues : null,
        GetValueFromUser : false,
        SendElementToGridDataSource : true,
        IsFieldMandatory: true
      }, {
        DisplayName : "Start Date",
        FieldName : "@startDate",
        Value : null,
        MultipleValues : null,
        DropDownList : [],
        InputControlType : InputControlType.DatePicker,
        DataSource : {
          Name : "",
          Type : 0,
          IsCoreEntity : false,
          EntityType : 0
        },
        ForeignKeyColumnNameInDataset : '',
        DisplayFieldInDataset : '',
        IsIncludedInDefaultSearch : true,
        SendElementToGridDataSource : false,
        ParentFields : [],
        IsFieldMandatory: true
      }, {
        DisplayName : "End Date",
        FieldName : "@endDate",
        Value : null,
        MultipleValues : null,
        DropDownList : [],
        InputControlType : InputControlType.DatePicker,
        DataSource : {
          Name : "",
          Type : 0,
          IsCoreEntity : false,
          EntityType : 0
        },
        ForeignKeyColumnNameInDataset : '',
        DisplayFieldInDataset : '',
        IsIncludedInDefaultSearch : true,
        SendElementToGridDataSource : false,
        ParentFields : ["@startDate"],
        IsFieldMandatory: true
      }
    ];
    this.doRefresh();
  }

  doRefresh() {
    this.spinner = true;
    this.searchElementConfiguration = {
      IsDataLevelSecurityRequired: true,
      SecurityKeys:[['UserId'], ['RoleId']],
      SearchElementList : _.cloneDeep(this.searchElementList),
      SearchPanelType : SearchPanelType.Panel,
      SearchButtonRequired : true,
      ClearButtonRequired : false
    };
    this.spinner = false;
    // this.route.queryParams.subscribe(params => {
    //   if (JSON.stringify(params) != JSON.stringify({})) {
    //     const { Idx, Cdx, Bdx, Mdx } = params;
    //     const encodedValues = { Idx, Cdx, Bdx, Mdx };
    //     this.clientID = Number(atob(encodedValues.Idx)) || 0;
    //     this.clientContractId = Number(atob(encodedValues.Cdx)) || 0;
    //     this.branchId = Number(atob(encodedValues.Bdx)) || 0;
    //     this.attendancePeriodId = Number(atob(encodedValues.Mdx)) || 0;
       
    //   } else {
    //     this.spinner = false;
    //     this.onClose();
    //     alert('No records found!');
    //     return;
    //   }
    // });
  }

  onSearchBtnClickedEvent(data) {
    console.log('clicked', data);
    this.refreshing_table_spinner = true;
    this.showTable = false;
    this.noData = false;
    this.loadingScreenService.startLoading();
    this.selectedValues = data;
    if (this.selectedValues && this.selectedValues.length) {
      const values = this.selectedValues.reduce((obj, item) => (obj[item.FieldName] = item.Value, obj), {}) as any;
      const { '@DistrictId': districtId, '@BranchId': branchId, '@DistributorId': distributorId, '@attendancePeriod': attendancePeriod, } = values;
     // this.clientID = clientId;
    //  this.clientContractId = clientContractId;
      this.branchId = branchId;
      this.attendancePeriodId = attendancePeriod;
      this.getAttendanceSummaryReportData().then((result) => {
        this.loadingScreenService.stopLoading();
        if (result != null) {
          this.refreshing_table_spinner = false;
          this.showTable = true;
          console.log('PROMISE RESOLVE ::', result);
        }
      });
    }
  }

  private getAttendanceSummaryReportData() {
    const promise = new Promise((res, rej) => {
      this.refreshing_table_spinner = true;
      const values = this.selectedValues.reduce((obj, item) => (obj[item.FieldName] = item.Value, obj), {}) as any;
      const { '@UserId': userId, '@RoleId': roleId, '@DistrictId': districtId, '@BranchId': branchId, '@DistributorId': distributorId, '@startDate': startDate, '@endDate': endDate } = values;
      this.attendanceService.GetAttendanceSummaryReport(roleId, userId, districtId, branchId, distributorId, moment(startDate).format('YYYY-MM-DD'), moment(endDate).format('YYYY-MM-DD'))
      .subscribe((result) => {
        console.log('GetAttendanceSummaryReport ::', result);
        try {
          let apiresult: apiResult = result;
          if (apiresult.Status && apiresult.Result != null) {
            console.log('****', JSON.parse(apiresult.Result))
            this.attendanceSummary_tableData = JSON.parse(apiresult.Result);
            this.attendanceSummary_DataFields = Object.keys(this.attendanceSummary_tableData[0]);
            this.attendanceSummary_TableHeaders = this.attendanceSummary_DataFields.map((key) => key.replace(/([A-Z])/g, " $1"));
            res(true);
          } else {
            res(null);
            this.noData = true;
            this.refreshing_table_spinner = false;
            this.alertService.showWarning(apiresult.Message);
          }
        } catch (error) {
          this.refreshing_table_spinner = false;
          this.alertService.showWarning('GetAttendanceSummaryReport Error: ' + error);
        }
      }, err => {
        console.error('GETATTENDANCESUMMARYREPORT ERROR ::', err);
        this.alertService.showWarning('Error: ' + err);
      });
    });
    return promise;
  }

  exportExcel() {
    this.excelService.exportToExcelFromTable(this.table, 'Attendance_Summary_Report');
  }

}
