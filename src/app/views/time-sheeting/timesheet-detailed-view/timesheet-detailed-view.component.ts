import { Component, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { NgbActiveModal, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { AlertService, FileUploadService } from 'src/app/_services/service';

import * as moment from 'moment';
import * as _ from 'lodash';
import { TimesheetService } from 'src/app/_services/service/time-sheet.service';
import { NzDrawerService } from 'ng-zorro-antd';
import { UIMode } from 'src/app/_services/model';
import { TimeSheetDetails, TimeSheetStatus } from 'src/app/_services/model/timesheet';
import { TimesheetEntriesByEmployeeComponent } from '../employee-time-sheet/timesheet-entries-by-employee/timesheet-entries-by-employee.component';
import { ApproveOrRejectTimesheetComponent } from 'src/app/shared/modals/approve-or-reject-timesheet/approve-or-reject-timesheet.component';
import { DomSanitizer } from '@angular/platform-browser';

import { NgxSpinnerService } from 'ngx-spinner';
@Component({
  selector: 'app-timesheet-detailed-view',
  templateUrl: './timesheet-detailed-view.component.html',
  styleUrls: ['./timesheet-detailed-view.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class TimesheetDetailedViewComponent implements OnInit {

  @Input() modalData: any;
  @Input() roleCode: string;
  @Input() UserId: any;
  @Input() EmployeeId: any;
  @Input() modeType: string;

  @ViewChild('employeeEntries') employeeEntryCmp: TimesheetEntriesByEmployeeComponent;

  // @ViewChild('employeeSavedTimesheet') empSavedEntries: EmployeeSavedTimesheetComponent;
  // @ViewChild('employeeSubmittedTimesheet') empSubmittedEntries: EmployeeSubmittedTimesheetComponent;
  // @ViewChild('managerListing') managerListingScreen: ManagerTimesheetListingComponent;

  spinner: boolean = false;
  groupedData: any;
  isSubmitted: boolean = false;
  isSaved: boolean= false;
  formattedDateRange: any;
  statusDropdown = [{
    id: TimeSheetStatus.Approved,
    name: 'Approved'
  }, {
    id: TimeSheetStatus.Rejected,
    name: 'Rejected'
  }]
  detailedData: any[] = [];
  documentURL: any = null;
  configurations: any[] = [];

  isResubmitted: boolean = false;

  constructor(
    private activeModal: NgbActiveModal,
    private alertService: AlertService,
    private customSpinner : NgxSpinnerService,
    private timesheetservice: TimesheetService,
    private drawerService: NzDrawerService,
    private objectApi: FileUploadService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    this.spinner = true;
    this.isSubmitted = this.modeType.toUpperCase() === 'SUBMIT' ? true : false;
    this.isSaved = this.modeType.toUpperCase() === 'SUBMIT' ? false : true;
    this.configurations = [];
    this.timesheetservice.getTimeSheetInformation(this.modalData.Id).subscribe((result: any) => {
      console.log('getTimeSheetInformation', result);
      this.timesheetservice.getTimesheetConfigurationForAnEmployee(this.EmployeeId).subscribe((config) => {
        if (config.Status && config.Result !== '') {
          console.log('getTimesheetConfigurationForAnEmployee result', config);
          this.spinner = false;
          this.configurations = JSON.parse(config.Result);
        }
      });
      if (result.Status && result.Result != '') {
        this.detailedData = JSON.parse(result.Result);
        const startDate = moment(this.detailedData[0]['PeriodFrom']);
        const endDate = moment(this.detailedData[0]['PeriodTo']);

        if (moment(startDate).isSame(endDate, 'day')) {
          this.formattedDateRange = startDate.format('D MMM YYYY');
          console.log(this.formattedDateRange); // Output: "1 Jan 2023"
        } else if (moment(startDate).isSame(endDate, 'month')) {
          this.formattedDateRange = `${startDate.format('D')}-${endDate.format('D')} ${endDate.format('MMM YYYY')}`;
          console.log(this.formattedDateRange); // Output: "1-31 Jan 2023"
        } else {
          this.formattedDateRange = `${startDate.format('D MMM YYYY')} - ${endDate.format('D MMM YYYY')}`;
          console.log(this.formattedDateRange); // Output: "1 Jan 2023 - 1 Feb 2023"
        }
        
        
        this.spinner = false;
        if (this.isSubmitted || this.modeType === 'APPROVAL' || this.modeType === 'MANAGER_VIEW') {
          this.groupedData = this.groupByDate(this.detailedData);
          console.log('**GROUPED**', this.groupedData);
        }
        console.log('FROM DETAILED VIEW DATA', this.detailedData);
      } else {
        this.detailedData = [];
        this.spinner = false;
        result.Status ? this.alertService.showSuccess('No Records Found !') : this.alertService.showWarning(result.Message);
      }
    }), ((err) => {
      this.detailedData = [];
      this.spinner = false;
    });
  }

  groupByDate(data: any[]): any[] {
    const groups = {};

    // Group the items by date
    data[0].TimesheetDetail.forEach((item) => {
      const date = moment(new Date(item.TransactionDate)).format('YYYY-MM-DD');

      if (!groups[date]) {
        groups[date] = [];
      }

      groups[date].push(item);
    });

    // Create an array of grouped objects with date and items properties
    return Object.keys(groups).map((date) => {
      return { date, totalHrs: data[0].TotalHours, items: groups[date] };
    });
  }

  closeModal() {
    console.log('DETAILED VIEW MODAL CLOSED');
    // this.redirectAndLoad();
    this.activeModal.close('Modal Closed');
  }

  redirectAndReload() {
   // window.location.reload();
    if (this.roleCode == "Manager") {
      // this.managerListingScreen.doRefresh();
      window.location.reload();
   } else {
    if (this.modeType === 'SAVE') {
      this.timesheetservice.getActiveTab('SavedRecords');
      // this.empSavedEntries.doRefresh();
    } else {
      this.timesheetservice.getActiveTab('SubmittedRecords');
      // this.empSubmittedEntries.doRefresh();
    }
   }
  }

  submitSavedTimeSheet() {
    
    console.log('rowData', this.detailedData);
    const rowData = JSON.parse(JSON.stringify(this.detailedData)) // [...this.detailedData];
    const configuration = this.configurations[0];
    const isApprovalRequired = configuration.IsApprovalRequired;
    const minimumHoursAllowedForADay = configuration.MinimumHoursAllowedForADay;
    const maximumHoursAllowedForADay = configuration.MaximumHoursAllowedForADay;
    const isTSHoursToBeValidatedAgainstStandardHours = configuration.IsTSHoursToBeValidatedAgainstStandardHours;
    const defaultStandardHours = configuration.DefaultStandardHours;
    
    const status = this.isResubmitted ? TimeSheetStatus.Resubmitted : isApprovalRequired ? TimeSheetStatus.Submitted : TimeSheetStatus.Approved;
    
    let hasError = false;
    let hasData = false;
    const data = JSON.parse(JSON.stringify(this.employeeEntryCmp.timesheetDates));
    if (this.employeeEntryCmp.deletedItems && this.employeeEntryCmp.deletedItems.length) {
      const deletedItems = this.employeeEntryCmp.deletedItems;
      deletedItems.forEach(element => {
        element.childProperties.Mode = UIMode.Delete;
        const existingDateIndex  = data.findIndex(obj => obj.date === element.date);
        if (existingDateIndex  !== -1) {
         data[existingDateIndex].childProperties.push(element.childProperties);
        } else {
          data.push(element);
        }
      });
    }
    hasData = data.some(details =>
      details.childProperties.some(child =>
        child.project || child.title || child.startTime || child.endTime)
    );
    if (!hasData) {return this.alertService.showWarning(`Please fill atleast one details'`);}

    console.log('UPDATE BEFORE DATA ::', this.detailedData, data, this.modalData);
    let timesheetDetails:TimeSheetDetails[] = [];
    for (let i = 0; i < data.length; i++) {
      let details = data[i];
      for (let j = 0; j < details.childProperties.length; j++) {
        let child = details.childProperties[j];
         
        const momentDate = moment(details.date, 'D MMMM YYYY, ddd').format('YYYY-MM-DD');
        const timesheetDetail = rowData[0].TimesheetDetail.find(a => a.TransactionDate == momentDate);
        const detail_totalHrs = details.childProperties
        .filter(item => item.Mode !== 2) // to exclude objects with Mode - delete
        .reduce((acc, curr) => Number(acc) + Number(curr.workingHrs), 0);
        if(detail_totalHrs < 0) {
          return this.alertService.showWarning(`Please update valid time for ${details.date}`);
        }
        if (child.project && child.title) {
          if (child.startTime == null || child.endTime == null || child.isStartTimeExists || child.isEndTimeExists) {
            this.alertService.showWarning(`Please update valid start time / end time for ${details.date}`);
            return;
          }

          if (Number(detail_totalHrs) < minimumHoursAllowedForADay) {
            hasError = true;
            return this.alertService.showWarning(`Please submit the timesheet for minimum ${minimumHoursAllowedForADay} hours`);
          }
      
          if (Number(detail_totalHrs) > maximumHoursAllowedForADay) {
            hasError = true;
            return this.alertService.showWarning(`Maximum timesheet submission for a day cannot exceed ${maximumHoursAllowedForADay} hours`);
          }
          const tempObj = {
            TimesheetHeaderId: this.modalData.Id,
            ProjectId: child.project,
            ActivityId: child.title,
            TransactionDate: new Date(momentDate),
            StartTime: child.startTime,
            EndTime: child.endTime,
            BreakTime: child.breakHrs ? child.breakHrs : 0,
            WorkingHours: child.workingHrs,
            Status: status,
            IsActive: child.Mode && child.Mode === UIMode.Delete ? false : true,
            EmployeeRemarks: child.notes,
            ApproverRemarks: this.isResubmitted || timesheetDetail && timesheetDetail.ApproverRemarks ? timesheetDetail.ApproverRemarks :  '',
            SubmittedOn: new Date(),
            SubmittedBy: this.UserId,
            // ApprovedRejectedOn:  new Date(),
            // ApprovedRejectedBy: this.UserId,
            MModetype: child.Mode && child.Mode === UIMode.Delete ? UIMode.Delete : UIMode.Edit,
            CreatedOn: new Date(),
            LastUpdatedOn: new Date(),
            CreatedBy: this.UserId,
            LastUpdatedBy: this.UserId,
            Id: child.id // timesheetDetail ? timesheetDetail.Id : 0,
          }
          timesheetDetails.push(tempObj);
        } else if (child.startTime && child.endTime) {
          if (child.project == null || child.project == undefined || child.project == "") {
            return this.alertService.showWarning(`Please select project for ${details.date}`);
          } else if (child.title == null || child.title == undefined || child.title == "") {
            return this.alertService.showWarning(`Please select activity for ${details.date}`);
          }
        }
      }
    }
    const totalHours = timesheetDetails.reduce((acc, curr) => {
      if (curr.IsActive) {
        return acc + Number(curr.WorkingHours);
      }
      return acc;
    }, 0);
   
    if (isTSHoursToBeValidatedAgainstStandardHours && totalHours < defaultStandardHours) {
      return this.alertService.showWarning(`Please submit the timesheet for ${defaultStandardHours} hours`);
    }
    const submittedData = {
      Id: this.modalData.Id,
      EmployeeId: this.EmployeeId,
      TimesheetConfigurationId: this.modalData.TimesheetConfigurationId,
      PeriodFrom: this.modalData.PeriodFrom,
      PeriodTo: this.modalData.PeriodTo,
      TagName: this.modalData.TagName,
      PlannedHours: this.modalData.PlannedHours,
      TotalHours: totalHours,
      Status: status,
      EmployeeRemarks: this.modalData.EmployeeRemarks,
      ApproverRemarks: this.modalData.ApproverRemarks ? this.modalData.ApproverRemarks : '', 
      SubmittedOn: new Date(),
      SubmittedBy: this.UserId,
      // ApprovedRejectedOn: this.modalData.ApprovedRejectedOn,
      // ApprovedRejectedBy: this.modalData.ApprovedRejectedBy,
      Modetype: UIMode.Edit,
      CreatedOn: new Date(),
      LastUpdatedOn: new Date(),
      CreatedBy: this.UserId,
      LastUpdatedBy: this.UserId,
      timesheetDetails: timesheetDetails,
      timesheetDocuments: this.detailedData && this.detailedData[0]['TimesheetDocument'] ? this.detailedData[0]['TimesheetDocument'] : []
    }
    console.log('SUBMIT DATA', submittedData);
    const drawerRef = this.drawerService.create<ApproveOrRejectTimesheetComponent, { rowData: any, title: string }, string>({
      nzTitle: '',
      nzContent: ApproveOrRejectTimesheetComponent,
      nzWidth: 553,
      nzClosable: false,
      nzMaskClosable: false,
      nzContentParams: {
        rowData: [submittedData],
        title: 'submit'
      }
    });

    drawerRef.afterOpen.subscribe(() => {
      this.closeModal();
      console.log('Approval Drawer Opened !');
    });
    drawerRef.afterClose.subscribe(data => {
      console.log('Approval Drawer Closed !');
      this.redirectAndReload();
    });
  }

  updateSavedTimeSheet() {
    console.log('UPDATE BEFORE DATA ::', this.employeeEntryCmp);
    let hasData = false;
    let hasError = false;
    const data = [...this.employeeEntryCmp.timesheetDates];
    
    if (this.employeeEntryCmp.deletedItems && this.employeeEntryCmp.deletedItems.length) {
      const deletedItems = this.employeeEntryCmp.deletedItems;
      deletedItems.forEach(element => {
        element.childProperties.Mode = UIMode.Delete;
        const existingDateIndex  = data.findIndex(obj => obj.date === element.date);
        if (existingDateIndex  !== -1) {
         data[existingDateIndex].childProperties.push(element.childProperties);
        } else {
          data.push(element);
        }
      });
    }

     hasData = data.some(details =>
       details.childProperties.some(child =>
         child.project || child.title || child.startTime || child.endTime)
     );
    if (!hasData) {hasError = true; return this.alertService.showWarning(`Please fill atleast one details'`);}

    console.log('UPDATE AFTER DATA ::', this.detailedData, data, this.modalData);
    let timesheetDetails:TimeSheetDetails[] = [];
    for (const details of data) {
      for (const child of details.childProperties) {
        const momentDate = moment(details.date, 'D MMMM YYYY, ddd').format('YYYY-MM-DD');
        const timesheetDetailId = this.detailedData[0].TimesheetDetail.find(a => a.TransactionDate === momentDate);
    
        if (child.workingHrs < 0) {
          hasError = true;
          this.alertService.showWarning(`Please update valid time for ${details.date}`);
          return;
        }
    
        if (child.project && child.title) {
          if (child.startTime == null || child.endTime == null || child.isStartTimeExists || child.isEndTimeExists) {
            hasError = true;
            this.alertService.showWarning(`Please update valid start time / end time for ${details.date}`);
            return;
          }
    
          const tempObj: TimeSheetDetails = {
            TimesheetHeaderId: this.modalData.Id,
            ProjectId: child.project,
            ActivityId: child.title,
            TransactionDate: new Date(momentDate),
            StartTime: child.startTime,
            EndTime: child.endTime,
            BreakTime: child.breakHrs ? child.breakHrs : 0,
            WorkingHours: child.workingHrs,
            Status: TimeSheetStatus.Saved,
            IsActive: child.Mode && child.Mode === UIMode.Delete ? false : true,
            EmployeeRemarks: child.notes,
            ApproverRemarks: this.isResubmitted || child.ApproverRemarks ? child.ApproverRemarks : '',
            SubmittedOn: new Date(),
            SubmittedBy: this.UserId,
            CreatedOn: new Date(),
            LastUpdatedOn: new Date(),
            CreatedBy: this.UserId,
            LastUpdatedBy: this.UserId,
            Id: child.id // timesheetDetailId ? timesheetDetailId.TimesheetDetailId : 0,
          };
    
          timesheetDetails.push(tempObj);
        } else if (child.startTime && child.endTime) {
          if (child.project == null || child.project == undefined || child.project == "") {
            return this.alertService.showWarning(`Please select project for ${details.date}`);
          } else if (child.title == null || child.title == undefined || child.title == "") {
            return this.alertService.showWarning(`Please select activity for ${details.date}`);
          }
        }
      }
    }
    
    const totalHours = timesheetDetails.reduce((acc, curr) => {
      if (curr.IsActive) {
        return acc + Number(curr.WorkingHours);
      }
      return acc;
    }, 0);
    const saveData = {
      Id: this.modalData.Id,
      EmployeeId: this.EmployeeId,
      TimesheetConfigurationId: this.modalData.TimesheetConfigurationId,
      PeriodFrom: this.modalData.PeriodFrom,
      PeriodTo: this.modalData.PeriodTo,
      TagName: this.modalData.TagName,
      PlannedHours: this.modalData.PlannedHours,
      TotalHours: totalHours,
      Status: TimeSheetStatus.Saved,
      EmployeeRemarks: this.modalData.EmployeeRemarks,
      ApproverRemarks: this.isResubmitted ? this.modalData.ApproverRemarks : '',
      SubmittedOn: new Date(),
      SubmittedBy: this.UserId,
      // ApprovedRejectedOn: this.modalData.ApprovedRejectedOn,
      // ApprovedRejectedBy: this.modalData.ApprovedRejectedBy,
      Modetype: UIMode.Edit,
      CreatedOn: new Date(),
      LastUpdatedOn: new Date(),
      CreatedBy: this.UserId,
      LastUpdatedBy: this.UserId,
      timesheetDetails: timesheetDetails,
      timesheetDocuments: []
    }
    console.log('SAVE DATA', saveData);
    this.closeModal();
    if (!hasError) {
      this.customSpinner.show();
      this.timesheetservice.upsertTimeSheetHeader(saveData).subscribe((result) => {
        console.log('result', result);
        this.customSpinner.hide();
        result.Status ? this.alertService.showSuccess(result.Message) : this.alertService.showWarning(result.Message);
        this.closeModal();
        this.timesheetservice.getActiveTab('SavedRecords');
      }), ((err) => {
        this.customSpinner.hide();
      });
    }
  }

  deleteRejectedTimeSheet() {
    console.log('rowData', this.detailedData);
    const rowData = this.detailedData;
    const drawerRef = this.drawerService.create<ApproveOrRejectTimesheetComponent, { rowData: any, title: string }, string>({
      nzTitle: '',
      nzContent: ApproveOrRejectTimesheetComponent,
      nzWidth: 553,
      nzClosable: false,
      nzMaskClosable: false,
      nzContentParams: {
        rowData: rowData,
        title: 'delete'
      }
    });

    drawerRef.afterOpen.subscribe(() => {
      console.log('Approval Drawer Opened !');
      this.closeModal();
    });
    drawerRef.afterClose.subscribe(data => {
      console.log('Approval Drawer Closed !');
      this.redirectAndReload();
    });
  }

  updatedRejectedTimeSheet() {
    this.modeType = 'SAVE';
    this.isSaved = true;
    this.isResubmitted = true;
  }

  cancelSubmittedTimesheet() {
    console.log('data',this.detailedData);
    if (this.detailedData && this.detailedData.length) {
      this.customSpinner.show();
      const configuration = this.configurations[0];
      const isApprovalRequired = configuration.IsApprovalRequired;
      const tempObj = {
        Id: this.detailedData[0].Id,
        EmployeeId: this.EmployeeId,
        TimesheetConfigurationId: this.detailedData[0].TimesheetConfigurationId,
        PeriodFrom: this.detailedData[0].PeriodFrom,
        PeriodTo: this.detailedData[0].PeriodTo,
        TagName: this.detailedData[0].TagName,
        PlannedHours: this.detailedData[0].PlannedHours,
        TotalHours: this.detailedData[0].TotalHours,
        Status: TimeSheetStatus.Saved,
        EmployeeRemarks: this.detailedData[0].EmployeeRemarks,
        ApproverRemarks: '',
        SubmittedOn: new Date(),
        SubmittedBy: this.UserId,
        Modetype: UIMode.Edit,
        CreatedOn: new Date(),
        LastUpdatedOn: new Date(),
        CreatedBy: this.UserId,
        LastUpdatedBy: this.UserId,
        IsApprovalrequired : isApprovalRequired,
        timesheetDetails: this.detailedData[0].TimesheetDetail,
        timesheetDocuments: this.detailedData[0].TimesheetDocument ? this.detailedData[0].TimesheetDocument : []
      };
      console.log('data::tempObj', tempObj);
      this.timesheetservice.upsertTimeSheetHeader(tempObj).subscribe((result) => {
        console.log('result', result);
        result.Status ? this.alertService.showSuccess(result.Message) : this.alertService.showWarning(result.Message);
        this.closeModal();
        this.timesheetservice.getActiveTab('SavedRecords');
        this.customSpinner.hide();
      }), ((err) => {
        this.customSpinner.hide();
      });
    }
  }

  submitMgrApproval() {
    console.log('***', this.groupedData);
    let timesheetDetails = [];
    let hasError = false;
    this.groupedData.forEach(el => {
      const details = el['items'];
      details.forEach(controls => {
        if (controls.Status == TimeSheetStatus.Submitted || controls.Status == TimeSheetStatus.Saved || 
          controls.Status == TimeSheetStatus.Resubmitted) {
          hasError = true;
          return this.alertService.showWarning('Please update status for all the items !');
        }
        const tempObj = {
          Id: controls.Id,
          TimesheetHeaderId: controls.TimesheetHeaderId,
          ProjectId: controls.ProjectId,
          ActivityId: controls.ActivityId,
          TransactionDate: controls.TransactionDate,
          StartTime: controls.StartTime,
          EndTime: controls.EndTime,
          BreakTime: controls.BreakTime,
          WorkingHours: controls.WorkingHours,
          Status: controls.Status,
          IsActive: true,
          EmployeeRemarks: controls.EmployeeRemarks,
          ApproverRemarks: controls.ApproverRemarks,
          SubmittedOn: new Date(),
          SubmittedBy: this.UserId,
          ApprovedRejectedOn: new Date(),
          ApprovedRejectedBy: this.UserId,
          Modetype: UIMode.Edit,
          CreatedOn: new Date(),
          LastUpdatedOn: new Date(),
          CreatedBy: this.UserId,
          LastUpdatedBy: this.UserId
        }
        timesheetDetails.push(tempObj);
      });
  
      });
    const totalHours = timesheetDetails.reduce((acc, curr) => Number(acc) + Number(curr.WorkingHours), 0);

    const submittedData = {
      Id: this.modalData.Id,
      EmployeeId: this.modalData.EmployeeId,
      TimesheetConfigurationId: this.modalData.TimesheetConfigurationId,
      PeriodFrom: this.modalData.PeriodFrom,
      PeriodTo: this.modalData.PeriodTo,
      TagName: this.modalData.TagName,
      PlannedHours: this.modalData.PlannedHours,
      TotalHours: totalHours,
      Status: timesheetDetails.find(t => t.Status === TimeSheetStatus.Rejected) ? TimeSheetStatus.Rejected : TimeSheetStatus.Approved,
      EmployeeRemarks: this.modalData.EmployeeRemarks,
      ApproverRemarks: this.modalData.ApproverRemarks ? this.modalData.ApproverRemarks : '',
      SubmittedOn: new Date(),
      SubmittedBy: this.UserId,
      ApprovedRejectedOn: new Date(),
      ApprovedRejectedBy: this.UserId,
      Modetype: UIMode.Edit,
      CreatedOn: new Date(),
      LastUpdatedOn: new Date(),
      CreatedBy: this.UserId,
      LastUpdatedBy: this.UserId,
      timesheetDetails: timesheetDetails,
      timesheetDocuments: []
    };
    console.log('SUBMIT DATA', submittedData);
    
    if (!hasError) {
      const drawerRef = this.drawerService.create<ApproveOrRejectTimesheetComponent, { rowData: any, title: string }, string>({
        nzTitle: '',
        nzContent: ApproveOrRejectTimesheetComponent,
        nzWidth: 553,
        nzClosable: false,
        nzMaskClosable: false,
        nzContentParams: {
          rowData: [submittedData],
          title: submittedData.Status === TimeSheetStatus.Rejected ? 'reject' : 'approve'
        }
      });
  
      drawerRef.afterOpen.subscribe(() => {
        console.log('Approval Drawer Opened !');
        this.closeModal();
      });
      drawerRef.afterClose.subscribe(data => {
        console.log('Approval Drawer Closed !');
        this.redirectAndReload();
      });
    }
  }

  getShortName(fullName) {
    let name = fullName.replace(/\s/g, "")
    return name.split(' ').map(n => n[0] + n[1]).join('');
  }

  viewDocs(item) {
    console.log('item', item)
    $("#popup_viewDocs").modal('show');
    this.documentURL = null;
    let contentType =  'image/jpeg;'; // this.objectApi.getContentType(item.FileName)
    this.objectApi.getObjectById(item.DocumentId) .subscribe(dataRes => {
      if (dataRes.Status == false || dataRes.Result == null || dataRes.Result == undefined) {
        return;
      }
      let file = null;
      contentType = dataRes.Result.Attribute1 ? dataRes.Result.Attribute1 : contentType;
      var objDtls = dataRes.Result;
      const byteArray = atob(objDtls.Content);
      const blob = new Blob([byteArray], { type: contentType });
      file = new File([blob], objDtls.ObjectName, {
        type: contentType,
        lastModified: Date.now()
      });
      if (file !== null) {
        var urll = 'data:' + contentType + ';base64,' + encodeURIComponent(objDtls.Content);
        this.documentURL = this.sanitizer.bypassSecurityTrustResourceUrl(urll);
        console.log(' DOCUMENT URL :', this.documentURL);

      }
    });

  }

  checkIsZipFile(item) {   

    var fileNameSplitsArray = item.FileName.split('.');
    var ext = fileNameSplitsArray[fileNameSplitsArray.length - 1];
    if (ext.toUpperCase().toString() == "ZIP") {
      return true;
    } else {
      return false;
    }
  }

  modal_dismiss() {
    this.documentURL = null;
    $("#popup_viewDocs").modal('hide');
  }

  formatDate(date) {
    const dateInMoment = moment(date, "YYYY-MM-DD");
    const formattedDate = dateInMoment.format('D MMM YYYY');
    return formattedDate;
  }

  formatDateToDay(date) {
    const dateInMoment = moment(date, "YYYY-MM-DD");
    const day = dateInMoment.format('ddd');
    return day;
  }

}
