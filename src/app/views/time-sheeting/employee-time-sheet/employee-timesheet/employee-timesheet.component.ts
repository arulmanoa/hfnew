import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { TimesheetEntriesByEmployeeComponent } from '../timesheet-entries-by-employee/timesheet-entries-by-employee.component';
import { TimeSheetDetails, TimeSheetHeader, TimeSheetStatus } from 'src/app/_services/model/timesheet';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { SessionStorage } from 'src/app/_services/service/session-storage.service';
import { LoginResponses } from 'src/app/_services/model';
import { UIMode } from 'src/app/_services/model/Common/BaseModel';
import { TimesheetService } from 'src/app/_services/service/time-sheet.service';
import { EmployeeSubmittedTimesheetComponent } from '../employee-submitted-timesheet/employee-submitted-timesheet.component';
import * as moment from 'moment';
import { Router } from '@angular/router';
import { AlertService } from 'src/app/_services/service';
import { ApproveOrRejectTimesheetComponent } from 'src/app/shared/modals/approve-or-reject-timesheet/approve-or-reject-timesheet.component';
import { NzDrawerService } from 'ng-zorro-antd';
import { NgxSpinnerService } from "ngx-spinner";

@Component({
  selector: 'app-employee-timesheet',
  templateUrl: './employee-timesheet.component.html',
  styleUrls: ['./employee-timesheet.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class EmployeeTimesheetComponent implements OnInit {

  @ViewChild('entries') entriesCmp: TimesheetEntriesByEmployeeComponent;
  @ViewChild('submitted') submittedCmp: EmployeeSubmittedTimesheetComponent;

  isEmployeeLogin: boolean = false;
  _loginSessionDetails: LoginResponses;
  UserId: any;
  RoleId: any;
  RoleCode: any;
  EmployeeId: any;
  emptyArr = [];

  spinner: boolean = false;
  getActiveTabName: string = 'TimeEntires';
  entryData: TimeSheetHeader;
  configurations:any;
  isSubmitted: boolean = false;

  constructor(
    private router: Router,
    private alertservice: AlertService,
    public sessionService: SessionStorage,
    private timesheetservice: TimesheetService,
    private customSpinner : NgxSpinnerService,
    private drawerService: NzDrawerService
  ) { }

  ngOnInit() {
    this.spinner = true;
    this._loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses)); 
    // console.log('_loginSessionDetails', this._loginSessionDetails);
    this.RoleId = this._loginSessionDetails.UIRoles[0].Role.Id; 
    this.EmployeeId = this._loginSessionDetails.EmployeeId;
    this.UserId = this._loginSessionDetails.UserSession.UserId;
    this.RoleCode = this._loginSessionDetails.UIRoles[0].Role.Code;

    this.timesheetservice.getTimesheetConfigurationForAnEmployee(this.EmployeeId).subscribe((result) => {
      if (result.Status && result.Result !== '') {
        console.log('getTimesheetConfigurationForAnEmployee result', result);
        this.spinner = false;
        this.configurations = JSON.parse(result.Result);
      } else {
        this.router.navigate(['app/accessdenied']);
        this.configurations = [];
      }
    }), ((err) => {
      console.log('getTimesheetConfigurationForAnEmployee API ERROR ::', err);
      this.spinner = false;
      this.configurations = [];
      this.router.navigate(['app/accessdenied']);
    });

    this.timesheetservice.activeTabAsObservable.subscribe(name => {
      console.log('active tab', name);
      this.getActiveTabName = name;
    });

    if (sessionStorage.getItem('isEmployee') != null && sessionStorage.getItem('isEmployee') == 'true') {
      this.isEmployeeLogin = true;
    } else {
      this.isEmployeeLogin = false;
    }
    this.sessionService.watchStorage().subscribe((data: any) => {
      console.log('data ::::', data,);

      if (data == 'true') {
        this.isEmployeeLogin = true;
      } else {
        this.isEmployeeLogin = false;
      }
    });
  }
 
  loadTabData(event) {
    console.log(event);
    this.timesheetservice.getActiveTab(event.nextId);
    // this.getActiveTabName = event.nextId;
  }

  isAtLeastOneRowFilled(rows): boolean {
    for(let i = 0; i < rows.length; i++) {
      const row = rows.at(i);
      if(row.controls.project.value != null && row.controls.project.value !== "") {
        return true;
      }
    }
    return false;
  }

  doSaveOrSubmitTimesheetEntries(type: string) {
    this.isSubmitted = true;
    this.customSpinner.show();
    const configuration = this.configurations[0];
    const isApprovalRequired = configuration.IsApprovalRequired;
    const minimumHoursAllowedForADay = configuration.MinimumHoursAllowedForADay;
    const maximumHoursAllowedForADay = configuration.MaximumHoursAllowedForADay;
    const isTSHoursToBeValidatedAgainstStandardHours = configuration.IsTSHoursToBeValidatedAgainstStandardHours;
    const defaultStandardHours = configuration.DefaultStandardHours;
    
    const status = isApprovalRequired ? TimeSheetStatus.Submitted : TimeSheetStatus.Approved;
    let hasError = false;
    let hasData = false;
    const data = this.entriesCmp.timesheetDates;
    hasData = data.some(details => details.childProperties.some(child => child.project || child.title || child.startTime || child.endTime));
    
    if (!hasData) {
      this.customSpinner.hide();
      this.isSubmitted = false;
      return this.alertservice.showWarning('Please fill at least one detail');
    }
    
    const periodRange = this.entriesCmp.dateRangeList.find(d => d.id == this.entriesCmp.selectedDateRange);
    
    console.log('before save/submit ::', data);
    
    const timesheetDetails: TimeSheetDetails[] = [];
    for (const details of data) {
      const momentDate = moment(details.date, 'D MMMM YYYY, ddd').format('YYYY-MM-DD');
    
      for (const child of details.childProperties) {
        if (child.workingHrs < 0) {
          hasError = true;
          this.customSpinner.hide();
          this.isSubmitted = false;
          this.alertservice.showWarning(`Please update valid time for ${details.date}`);
          return; // exit the function without continuing
        }
        if (child.project && child.title) {
          if (child.startTime == null || child.endTime == null || child.isStartTimeExists == null || child.isEndTimeExists == null) {
            hasError = true;
            this.customSpinner.hide();
            this.isSubmitted = false;
            this.alertservice.showWarning('Please update valid start time / end time');
            return; // exit the function without continuing
          }
          const detail_totalHrs = details.childProperties.reduce((acc, curr) => Number(acc) + Number(curr.workingHrs), 0);
          if (type === 'submit' && Number(detail_totalHrs) < minimumHoursAllowedForADay) {
            hasError = true;
            this.customSpinner.hide();
            this.isSubmitted = false;
            return this.alertservice.showWarning(`Please submit the timesheet for minimum ${minimumHoursAllowedForADay} hours for ${details.date}`);
          }
      
          if (type === 'submit' && Number(detail_totalHrs) > maximumHoursAllowedForADay) {
            hasError = true;
            this.customSpinner.hide();
            this.isSubmitted = false;
            return this.alertservice.showWarning(`Maximum timesheet submission for a day cannot exceed ${maximumHoursAllowedForADay} hours for ${details.date}`);
          }
          
          const tempObj: TimeSheetDetails = {
            TimesheetHeaderId: 0,
            ProjectId: child.project,
            ActivityId: child.title,
            TransactionDate: new Date(momentDate),
            StartTime: child.startTime,
            EndTime: child.endTime,
            BreakTime: child.breakHrs ? child.breakHrs : 0,
            WorkingHours: child.workingHrs,
            Status: type === 'submit' ? status : TimeSheetStatus.Saved,
            IsActive: true,
            EmployeeRemarks: child.notes,
            ApproverRemarks: '',
            SubmittedOn: new Date(),
            SubmittedBy: this.UserId,
            CreatedOn: new Date(),
            LastUpdatedOn: new Date(),
            CreatedBy: this.UserId,
            LastUpdatedBy: this.UserId,
            Id: 0
          };
          timesheetDetails.push(tempObj);
        } else if (child.startTime && child.endTime) {
          if (child.project == null || child.project == undefined || child.project == "") {
            this.isSubmitted = false;
            return this.alertservice.showWarning(`Please select project for ${details.date}`);
          } else if (child.title == null || child.title == undefined || child.title == "") {
            this.isSubmitted = false;
            return this.alertservice.showWarning(`Please select activity for ${details.date}`);
          }
        }
      }
    }
    
    const totalHours = timesheetDetails.reduce((acc, curr) => Number(acc) + Number(curr.WorkingHours), 0);
    
    if (type === 'submit' && isTSHoursToBeValidatedAgainstStandardHours && totalHours < defaultStandardHours) {
      this.customSpinner.hide();
      this.isSubmitted = false;
      return this.alertservice.showWarning(`Please submit the timesheet for ${defaultStandardHours} hours`);
    }

    this.entryData = {
      Id: 0,
      EmployeeId: this.EmployeeId,
      TimesheetConfigurationId: configuration.ID,
      PeriodFrom: new Date(periodRange.startDate),
      PeriodTo: new Date(periodRange.endDate),
      TagName: '',
      PlannedHours: defaultStandardHours,
      TotalHours: totalHours,
      Status: type === 'submit' ? TimeSheetStatus.Submitted : TimeSheetStatus.Saved,
      EmployeeRemarks: '',
      ApproverRemarks: '',
      SubmittedOn: new Date(),
      SubmittedBy: this.UserId,
      Modetype: UIMode.None,
      CreatedOn: new Date(),
      LastUpdatedOn: new Date(),
      CreatedBy: this.UserId,
      LastUpdatedBy: this.UserId,
      timesheetDetails: timesheetDetails,
      timesheetDocuments: []
    };
    
    console.log('SAVE DATA', this.entryData);
    if (type !== 'submit' && !hasError) {
      this.timesheetservice.upsertTimeSheetHeader(this.entryData).subscribe(result => {
        console.log('result', result);
        this.isSubmitted = false;
         this.customSpinner.hide();
        if (result.Status) {
          this.alertservice.showSuccess(result.Message);
          this.timesheetservice.getActiveTab('SavedRecords');
          // this.getActiveTabName = 'SavedRecords';
        } else {
          this.alertservice.showWarning(result.Message);
        }
      },
      err => {
         this.customSpinner.hide();
         this.isSubmitted = false;
      });
    } else {
      console.log('rowData', this.entryData);
      this.customSpinner.hide();
      this.isSubmitted = false;
      const rowData = this.entryData;
      // open submit drawer where user can upload supporting documents (if any)
      const drawerRef = this.drawerService.create<ApproveOrRejectTimesheetComponent>({
        nzTitle: '',
        nzContent: ApproveOrRejectTimesheetComponent,
        nzWidth: 553,
        nzClosable: false,
        nzMaskClosable: false,
        nzContentParams: {
          rowData: [rowData],
          title: 'submit'
        }
      });
    
      drawerRef.afterOpen.subscribe(() => {
        console.log('Approval Drawer Opened!');
      });
    
      drawerRef.afterClose.subscribe(data => {
        console.log('Approval Drawer Closed!');
        this.timesheetservice.getActiveTab('SubmittedRecords');
        // this.getActiveTabName = 'SubmittedRecords';
      });
    }
    
  }

  approveOrRejectAllTimeSheet(action: string) {
    const childData = this.submittedCmp.submittedDataList;
    console.log(childData);
  }

}
