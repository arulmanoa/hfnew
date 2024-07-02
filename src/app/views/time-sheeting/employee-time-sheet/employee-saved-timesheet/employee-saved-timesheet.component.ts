import { Component, OnInit } from '@angular/core';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { LoginResponses } from 'src/app/_services/model/Common/LoginResponses';
import { SessionStorage } from 'src/app/_services/service/session-storage.service';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { TimesheetDetailedViewComponent } from '../../timesheet-detailed-view/timesheet-detailed-view.component';
import { TimesheetService } from 'src/app/_services/service/time-sheet.service';
import { AlertService } from 'src/app/_services/service';
import { TimeSheetDetails, TimeSheetStatus } from 'src/app/_services/model/timesheet';
import { UIMode } from 'src/app/_services/model/UIMode';
import { NzDrawerService } from 'ng-zorro-antd';
import { ApproveOrRejectTimesheetComponent } from 'src/app/shared/modals/approve-or-reject-timesheet/approve-or-reject-timesheet.component';
import moment from 'moment';
@Component({
  selector: 'app-employee-saved-timesheet',
  templateUrl: './employee-saved-timesheet.component.html',
  styleUrls: ['./employee-saved-timesheet.component.css']
})
export class EmployeeSavedTimesheetComponent implements OnInit {

  sessionDetails: LoginResponses;
  roleId: number = 0;
  EmployeeId: any = 0;
  UserId: any;
  roleCode: any;

  spinner: boolean = false;
  isSelectAll: boolean = false;
  modalOption: NgbModalOptions = {};

  savedDataList = [];
  showNoDataFound: boolean = false;

  configurations = [];

  public pageSize = 10;
  public currentPage = 1;
  public totalPages = Math.ceil(this.savedDataList.length / this.pageSize);
  public pages = [];

  constructor(
    public sessionService: SessionStorage,
    private modalService: NgbModal,
    private alertservice: AlertService,
    private timesheetservice: TimesheetService,
    private drawerService: NzDrawerService,
  ) { }

  ngOnInit() {
    this.spinner = true;
    this.sessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses)); 
    this.roleId = this.sessionDetails.UIRoles[0].Role.Id;
    this.EmployeeId = this.sessionDetails.EmployeeId;
    this.UserId = this.sessionDetails.UserSession.UserId;
    this.roleCode = this.sessionDetails.UIRoles[0].Role.Code;
    this.showNoDataFound = false;
    this.modalOption.backdrop = 'static';
    this.modalOption.keyboard = false;
    this.doRefresh();
  }

  doRefresh() {
    this.spinner = true;
    this.timesheetservice.getTimesheetConfigurationForAnEmployee(this.EmployeeId).subscribe((result) => {
      if (result.Status && result.Result !== '') {
        console.log('getTimesheetConfigurationForAnEmployee result', result);
        this.spinner = false;
        this.configurations = JSON.parse(result.Result);
      } else {
        this.configurations = [];
      }
      this.timesheetservice.getSavedTimeSheetForAnEmployee(this.EmployeeId).subscribe((result) => {
        console.log('getSavedTimeSheetForAnEmployee Result :: ', result);
        if (result.Status && result.Result != '') {
          this.savedDataList = JSON.parse(result.Result);
          this.totalPages = Math.ceil(this.savedDataList.length / this.pageSize);
          this.pages = [];
          for (let i = 1; i <= this.totalPages; i++) {
            this.pages.push(i);
          }
          this.spinner = false;
          console.log('this.savedDataList', this.savedDataList);
        } else {
          this.showNoDataFound = true;
          this.savedDataList = [];
          this.spinner = false;
        }
      }), ((err) => {
        console.log('getSavedTimeSheetForAnEmployee API ERROR ::', err);
        this.savedDataList = [];
        this.spinner = false;
      });
    });
    
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  changePage(page) {
    this.currentPage = page;
  }

  get pagedDataList() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.savedDataList.slice(start, start + this.pageSize);
  }

  onCheckboxClicked(e, item) {
    console.log('CLICKED ::', e, item);
  }

  updateSavedTimeSheetEntry(rowData) {
    this.showDetailedView(rowData);
  }

  submitTimeSheetEntry(rowData) {
    this.spinner = true;
    const configuration = this.configurations[0];
    const isApprovalRequired = configuration.IsApprovalRequired;
    const minimumHoursAllowedForADay = configuration.MinimumHoursAllowedForADay;
    const maximumHoursAllowedForADay = configuration.MaximumHoursAllowedForADay;
    const isTSHoursToBeValidatedAgainstStandardHours = configuration.IsTSHoursToBeValidatedAgainstStandardHours;
    const defaultStandardHours = configuration.DefaultStandardHours;
    
    this.timesheetservice.getTimeSheetInformation(rowData.Id).subscribe((result: any) => {
      if (result.Status && result.Result != '') {
        this.spinner = false;
        const detailedData = JSON.parse(result.Result);
        console.log('detailedData', detailedData);
        for (let key in detailedData) {
          if (detailedData.hasOwnProperty(key)) {
            detailedData[key].Status =  isApprovalRequired ? TimeSheetStatus.Submitted : TimeSheetStatus.Approved;
          }
        }
        if (detailedData && detailedData.length) {
          let newTimesheetDetail:TimeSheetDetails[] = [];

          if (isTSHoursToBeValidatedAgainstStandardHours && detailedData[0].TotalHours < defaultStandardHours) {
            return this.alertservice.showWarning(`Please submit the timesheet for ${defaultStandardHours} hours`);
          }

          
          for (const entry of detailedData[0].TimesheetDetail) {
            const detail_totalHrs = entry.WorkingHours;
            const momentDate = moment(entry.TransactionDate, 'YYYY-MM-DD').format ('D MMMM YYYY, ddd');
            if (Number(detail_totalHrs) < minimumHoursAllowedForADay) {
              return this.alertservice.showWarning(`Please submit the timesheet for minimum ${minimumHoursAllowedForADay} hours for ${momentDate}`);
            }
            if (Number(detail_totalHrs) > maximumHoursAllowedForADay) {
              return this.alertservice.showWarning(`Maximum timesheet submission for a day cannot exceed ${maximumHoursAllowedForADay} hours for ${momentDate}`);
            }
          }
          
          detailedData[0].TimesheetDetail.forEach(el => {
            if(el.WorkingHours < 0) {
              this.spinner = false;
              return this.alertservice.showWarning('Please update valid time');
            }
            const tempObj = {
              TimesheetHeaderId: el.TimesheetHeaderId,
              ProjectId: el.ProjectId,
              ActivityId: el.ActivityId,
              TransactionDate: el.TransactionDate,
              StartTime: el.StartTime,
              EndTime: el.EndTime,
              BreakTime: el.BreakTime ? el.BreakTime : 0,
              WorkingHours: el.WorkingHours,
              Status: TimeSheetStatus.Submitted,
              IsActive: true,
              EmployeeRemarks: el.EmployeeRemarks,
              ApproverRemarks: '',
              SubmittedOn: el.SubmittedOn,
              SubmittedBy: el.SubmittedBy,
              // ApprovedRejectedOn: el.ApprovedRejectedOn,
              // ApprovedRejectedBy: el.ApproverRemarks,
              Modetype: UIMode.Edit,
              CreatedOn: new Date(),
              LastUpdatedOn: new Date(),
              CreatedBy: this.UserId,
              LastUpdatedBy: this.UserId,
              Id: el.Id
            }
            newTimesheetDetail.push(tempObj);
          });
          detailedData[0].timesheetDocuments = [];
          detailedData[0].timesheetDetails = newTimesheetDetail;
        }
        console.log('payload::', detailedData);
        const drawerRef = this.drawerService.create<ApproveOrRejectTimesheetComponent, { rowData: any, title: string }, string>({
          nzTitle: '',
          nzContent: ApproveOrRejectTimesheetComponent,
          nzWidth: 553,
          nzClosable: false,
          nzMaskClosable: false,
          nzContentParams: {
            rowData: detailedData,
            title: 'submit'
          }
        });
    
        drawerRef.afterOpen.subscribe(() => {
          console.log('Approval Drawer Opened !');
        });
        drawerRef.afterClose.subscribe(data => {
          console.log('Approval Drawer Closed !');
          this.doRefresh();
        });
      }
    }), ((err) => {
      this.spinner = false;
    });

  }

  showDetailedView(data) {
    const modalRef = this.modalService.open(TimesheetDetailedViewComponent, this.modalOption);
    modalRef.componentInstance.roleCode = this.roleCode;
    modalRef.componentInstance.UserId = this.UserId;
    modalRef.componentInstance.EmployeeId = this.EmployeeId;
    modalRef.componentInstance.modalData = data;
    modalRef.componentInstance.modeType = 'SAVE';

    modalRef.result.then((result) => {
      this.doRefresh();
    }).catch((error) => {
      console.log(error);
    });
  }

}
