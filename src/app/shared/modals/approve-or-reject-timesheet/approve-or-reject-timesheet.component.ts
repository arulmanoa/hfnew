import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import { NzDrawerRef } from 'ng-zorro-antd';
import { apiResult } from 'src/app/_services/model/apiResult';
import { AlertService, FileUploadService, SessionStorage } from 'src/app/_services/service';
import { LoadingScreenService } from '../../components/loading-screen/loading-screen.service';
import { TimesheetService } from 'src/app/_services/service/time-sheet.service';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { LoginResponses } from 'src/app/_services/model';
import { TimeSheetDetails, TimeSheetDocuments, TimeSheetHeader, TimeSheetStatus } from 'src/app/_services/model/timesheet';
import { UIMode } from 'src/app/_services/model/UIMode';
import { ObjectStorageDetails } from 'src/app/_services/model/Candidates/ObjectStorageDetails';

@Component({
  selector: 'app-approve-or-reject-timesheet',
  templateUrl: './approve-or-reject-timesheet.component.html',
  styleUrls: ['./approve-or-reject-timesheet.component.css']
})
export class ApproveOrRejectTimesheetComponent implements OnInit {
  @Input() rowData: any;
  @Input() title: string;
  // @ViewChild('fileInput') fileInput: ElementRef;



  remarks: string = '';
  isMultiple: boolean = false;
  _loginSessionDetails: LoginResponses;
  UserId: any;
  EmployeeId:any;
  RoleId: any;
  RoleCode: any;
  CompanyId: any;
  tagName = '';
  files: any;
  fileUrl: any;
  fileName: any;
  documentUploadedId: any;
  configurations: any;
  disableConfirmBtn: boolean = false;

  constructor(
    private drawerRef: NzDrawerRef<string>,
    private modalService: NgbModal,
    private alertService: AlertService,
    public sessionService: SessionStorage,
    private timesheetservice: TimesheetService,
    private loadingScreenService : LoadingScreenService,
    public fileuploadService: FileUploadService,
  ) { }

  ngOnInit() {
    this.loadingScreenService.startLoading();
    console.log('data', this.rowData);
    for (let key in this.rowData) {
      if (this.rowData.hasOwnProperty(key)) {
        // this.rowData[key].isSelected = true;
        const startDate = moment(this.rowData[key]['PeriodFrom']);
        const endDate = moment(this.rowData[key]['PeriodTo']);

        if (moment(startDate).isSame(endDate, 'day')) {
          this.rowData[key].formattedDateRange = startDate.format('D MMM YYYY');
        } else if (moment(startDate).isSame(endDate, 'month')) {
          this.rowData[key].formattedDateRange = `${startDate.format('D')}-${endDate.format('D')} ${endDate.format('MMM YYYY')}`;
        } else {
          this.rowData[key].formattedDateRange = `${startDate.format('D MMM YYYY')} - ${endDate.format('D MMM YYYY')}`;
        }
      }
    }
    this.isMultiple = false;
    if (this.rowData && this.rowData.length > 1) {
      this.isMultiple = true;
    }

    this._loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses)); 
    this.RoleId = this._loginSessionDetails.UIRoles[0].Role.Id; 
    this.UserId = this._loginSessionDetails.UserSession.UserId;
    this.EmployeeId = this._loginSessionDetails.EmployeeId;
    this.RoleCode = this._loginSessionDetails.UIRoles[0].Role.Code;
    this.CompanyId = this._loginSessionDetails.Company.Id; 
    
    this.loadingScreenService.stopLoading();
    if (this.RoleCode == 'Employee') {
      const checkRemarks = this.rowData.some(item => item.EmployeeRemarks !== '');
      const checkTagName = this.rowData.some(item => item.TagName !== '');
      this.remarks = checkRemarks ? this.rowData[0].EmployeeRemarks : '';
      this.tagName = checkTagName ? this.rowData[0].TagName : '';  
      this.loadingScreenService.startLoading();
      this.timesheetservice.getTimesheetConfigurationForAnEmployee(this.EmployeeId).subscribe((result) => {
        this.loadingScreenService.stopLoading();
        if (result.Status && result.Result !== '') {
          console.log('getTimesheetConfigurationForAnEmployee result', result);
          this.configurations = JSON.parse(result.Result);
        } else {
          this.configurations = [];
        }
      }), ((err) => {
        this.configurations = [];
        this.loadingScreenService.stopLoading();
        console.log('getTimesheetConfigurationForAnEmployee API ERROR ::', err);
      });
    }
  }

  cancelDrawer() {
    for (let key in this.rowData) {
      if (this.rowData.hasOwnProperty(key)) {
        this.rowData[key].isSelected = false;
      }
    }
    this.drawerRef.close(this.rowData);
  }

  onBrowseClick(event: MouseEvent) {
    event.preventDefault();
    // this.fileInput.nativeElement.click();
  }


  onFileChange(pFileList: File[]){
    this.files = Object.keys(pFileList).map(key => pFileList[key]);
    const reader = new FileReader();
    reader.readAsDataURL(pFileList[0]);
    reader.onloadend = () => {
      this.fileUrl = (reader.result as string).split(",")[1];
      this.fileName = pFileList[0].name;
    };
    this.alertService.showSuccess('File uploaded successfully !');
  }

  deleteFile(f){
    this.files = this.files.filter(function(w){ return w.name != f.name });
    this.alertService.showSuccess('File deleted successfully !');
  }

  submitEmployeeTimeSheet() {
    this.disableConfirmBtn = true;
    // this.rowData[0].ApprovedRejectedBy = this.UserId;
    // this.rowData[0].ApprovedRejectedOn = new Date();
    this.rowData[0].TagName = this.tagName;
    this.rowData[0].EmployeeRemarks = this.remarks;
    this.rowData[0].timesheetDocuments =  this.rowData[0].timesheetDocuments ?  this.rowData[0].timesheetDocuments : [];

    let totalHours = 0;

    const configuration = this.configurations[0];
    const isApprovalRequired = configuration.IsApprovalRequired;
    const minimumHoursAllowedForADay = configuration.MinimumHoursAllowedForADay;
    const maximumHoursAllowedForADay = configuration.MaximumHoursAllowedForADay;
    const isTSHoursToBeValidatedAgainstStandardHours = configuration.IsTSHoursToBeValidatedAgainstStandardHours;
    const defaultStandardHours = configuration.DefaultStandardHours;

    if (this.rowData[0].TimesheetDetail) {
      const detail_totalHrs = this.rowData[0].TimesheetDetail.reduce((acc, curr) => Number(acc) + Number(curr.workingHrs), 0);
      if (Number(detail_totalHrs) < minimumHoursAllowedForADay) {
        this.disableConfirmBtn = false;
        return this.alertService.showWarning(`Please submit the timesheet for minimum ${minimumHoursAllowedForADay} hours`);
      }
  
      if (Number(detail_totalHrs) > maximumHoursAllowedForADay) {
        this.disableConfirmBtn = false;
        return this.alertService.showWarning(`Maximum timesheet submission for a day cannot exceed ${maximumHoursAllowedForADay} hours`);
      }
      this.rowData[0].TimesheetDetail.forEach(element => {
        element.Status = isApprovalRequired ? TimeSheetStatus.Submitted : TimeSheetStatus.Approved;
      });
      totalHours = this.rowData[0].TimesheetDetail.reduce((acc, curr) => Number(acc) + Number(curr.WorkingHours), 0)
    }

    if (this.rowData[0].timesheetDetails) {
      this.rowData[0].TimesheetDetail  = this.rowData[0].timesheetDetails;
      const detail_totalHrs = this.rowData[0].timesheetDetails.reduce((acc, curr) => Number(acc) + Number(curr.workingHrs), 0);
      if (Number(detail_totalHrs) < minimumHoursAllowedForADay) {
        this.disableConfirmBtn = false;
        return this.alertService.showWarning(`Please submit the timesheet for minimum ${minimumHoursAllowedForADay} hours `);
      }
  
      if (Number(detail_totalHrs) > maximumHoursAllowedForADay) {
        this.disableConfirmBtn = false;
        return this.alertService.showWarning(`Maximum timesheet submission for a day cannot exceed ${maximumHoursAllowedForADay} hours`);
      }
      this.rowData[0].timesheetDetails.forEach(element => {
        element.Status = isApprovalRequired ? TimeSheetStatus.Submitted : TimeSheetStatus.Approved;
      });
      totalHours = this.rowData[0].timesheetDetails.reduce((acc, curr) => Number(acc) + Number(curr.WorkingHours), 0)
    }

   
    if ((isTSHoursToBeValidatedAgainstStandardHours) && (totalHours < defaultStandardHours )) {
      this.disableConfirmBtn = false;
      return this.alertService.showWarning('Please submit the timesheet for ' + defaultStandardHours + ' hours')
    }
    
    const tempObj = {
      TagName: this.tagName,
      EmployeeRemarks: this.remarks,
      EmployeeId: this.rowData[0].EmployeeId,
      Id: this.rowData[0].Id,
      TimesheetConfigurationId: this.rowData[0].TimesheetConfigurationId,
      PlannedHours: this.rowData[0].PlannedHours,
      TotalHours: this.rowData[0].TotalHours,
      Status: isApprovalRequired ? TimeSheetStatus.Submitted : TimeSheetStatus.Approved,
      ApproverRemarks: '',
      SubmittedOn: new Date(),
      SubmittedBy: this.UserId,
      PeriodFrom: this.rowData[0].PeriodFrom,
      PeriodTo: this.rowData[0].PeriodTo,
      Modetype: UIMode.Edit,
      CreatedOn: new Date(),
      LastUpdatedOn: new Date(),
      CreatedBy: this.UserId,
      LastUpdatedBy: this.UserId,
      IsApprovalrequired : isApprovalRequired,
      timesheetDetails: this.rowData[0].TimesheetDetail,
      timesheetDocuments: this.rowData[0].timesheetDocuments ? this.rowData[0].timesheetDocuments : []
    };
    console.log('SUBMIT DATA', tempObj);
    this.loadingScreenService.startLoading();
    this.disableConfirmBtn = false;
    if (this.files && this.files.length) {
      console.log('SUBMIT files', this.files, this.rowData[0]);
      this.doAsyncUpload(this.fileUrl, this.fileName).then((res) => {
        const docObj = {
          TimesheetHeaderId: this.rowData[0].Id,
          DocumentId: this.documentUploadedId,
          Id:  this.rowData[0].timesheetDocuments &&  this.rowData[0].timesheetDocuments.length >  0 ? 
          this.rowData[0].timesheetDocuments[0].Id : 0
        };
        this.rowData[0].timesheetDocuments = [docObj];
        this.timesheetservice.upsertTimeSheetHeader(this.rowData[0]).subscribe((result) => {
          console.log('result', result);
          result.Status ? this.alertService.showSuccess(result.Message) : this.alertService.showWarning(result.Message);
          this.timesheetservice.getActiveTab('SubmittedRecords');
          this.cancelDrawer();
          this.loadingScreenService.stopLoading();
        }), ((err) => {
          this.loadingScreenService.stopLoading();
        });
      }); 
    } else {
      this.timesheetservice.upsertTimeSheetHeader(tempObj).subscribe((result) => {
        console.log('result', result);
        result.Status ? this.alertService.showSuccess(result.Message) : this.alertService.showWarning(result.Message);
        this.timesheetservice.getActiveTab('SubmittedRecords');
        this.cancelDrawer();
        this.loadingScreenService.stopLoading();
      }), ((err) => {
        this.loadingScreenService.stopLoading();
      });
    }
    
  }

  ApproveRejectIndividualRecord() {
    this.rowData[0].ApprovedRejectedBy = this.UserId;
    this.rowData[0].ApprovedRejectedOn = new Date();
    this.rowData[0].ApproverRemarks = this.remarks;
    this.rowData[0].IsApprovalrequired = true;
    this.timesheetservice.upsertTimeSheetHeader(this.rowData[0]).subscribe((result) => {
      console.log('result', result);
      result.Status ? this.alertService.showSuccess(result.Message) : this.alertService.showWarning(result.Message);
      this.cancelDrawer();
      this.loadingScreenService.stopLoading();
    }), ((err) => {
      this.loadingScreenService.stopLoading();
    });
  }

  ApproveRejectTimeSheet(statusName: string) {
    console.log('APPROVE/REJECT', this.rowData);
    
    if (statusName == 'REJECT' && (this.remarks == '' || this.remarks == null || this.remarks == undefined)) {
      this.alertService.showInfo("Action blocked : Please enter the rejection remarks ");
      return;
    }
    const status = statusName === 'REJECT' ? TimeSheetStatus.Rejected : TimeSheetStatus.Approved;
    this.loadingScreenService.startLoading();
    const timesheetIds = this.rowData.filter(obj => obj.isSelected).map(obj => obj.Id.toString()).join(',');
    const isDirectApproval = this.rowData.every(obj => obj.hasOwnProperty("isSelected"))
    const checkIndividualRecordForRemarks = this.rowData.some(item =>
      item.timesheetDetails && item.timesheetDetails.some(detail => detail.ApproverRemarks != '' ? true : false)
    );  
    if (checkIndividualRecordForRemarks || !isDirectApproval) {
      this.ApproveRejectIndividualRecord();
    } else {
      this.remarks = statusName !== 'REJECT' && this.remarks == '' ? null : this.remarks;
      this.timesheetservice.putApproveRejectEmployeeTimeSheet(timesheetIds, status, this.UserId, this.remarks).subscribe((result) => {
        let apiR: apiResult = result;
          this.loadingScreenService.stopLoading();
          this.cancelDrawer();
        if (apiR.Status) {
          this.alertService.showSuccess(apiR.Message);
        } else {
          this.alertService.showWarning(apiR.Message);
        }
      });
    }
  }

  deleteEmployeeTimeSheet() {
    console.log('delete', this.rowData);
    this.loadingScreenService.startLoading();
    if (this.rowData && this.rowData.length) {
      let newTimesheetDetail:TimeSheetDetails[] = [];
      this.rowData[0].TimesheetDetail.forEach(el => {
        if(el.WorkingHours < 1) {
          return this.alertService.showWarning('Please update break time');
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
          IsActive: false,
          EmployeeRemarks: el.EmployeeRemarks,
          ApproverRemarks: el.ApproverRemarks ? el.ApproverRemarks : '',
          SubmittedOn: el.SubmittedOn,
          SubmittedBy: el.SubmittedBy,
          // ApprovedRejectedOn: el.ApprovedRejectedOn,
          // ApprovedRejectedBy: el.ApproverRemarks,
          Modetype: UIMode.Delete,
          CreatedOn: new Date(),
          LastUpdatedOn: new Date(),
          CreatedBy: this.UserId,
          LastUpdatedBy: this.UserId,
          Id: el.Id
        }
        newTimesheetDetail.push(tempObj);
      });
      this.rowData[0].timesheetDocuments =  this.rowData[0].TimesheetDocument ?  this.rowData[0].TimesheetDocument : [];
      this.rowData[0].timesheetDetails = newTimesheetDetail;
    }
    console.log('payload::', this.rowData);
    this.timesheetservice.upsertTimeSheetHeader(this.rowData[0]).subscribe((result) => {
      console.log('result', result);
      this.loadingScreenService.stopLoading();
      result.Status ? this.alertService.showSuccess(result.Message) : this.alertService.showWarning(result.Message);
      this.cancelDrawer();
    }), ((err) => {
      this.loadingScreenService.stopLoading();
      this.cancelDrawer();
    });
  }

  
  // Function to upload file
  doAsyncUpload(filebytes, filename) {
    const promise = new Promise((resolve, reject) => {
      try {
        this.loadingScreenService.startLoading();
        let objStorage = new ObjectStorageDetails();
        objStorage.Id = 0;
        objStorage.CandidateId = Number(this.EmployeeId);
        objStorage.EmployeeId = Number(this.EmployeeId);
        objStorage.ClientContractCode = "";
        objStorage.ClientCode = "";
        objStorage.CompanyCode = this.CompanyId;
        objStorage.ClientContractId = 0;
        objStorage.ClientId = 0;
        objStorage.CompanyId = this.CompanyId;
        objStorage.Status = true;
        objStorage.Content = filebytes;
        objStorage.SizeInKB = 12;
        objStorage.ObjectName = filename;
        objStorage.OriginalObjectName = filename;
        objStorage.Type = 0;
        objStorage.ObjectCategoryName = "EmpTransactions";

        this.fileuploadService.postObjectStorage(JSON.stringify(objStorage)).subscribe((res) => {
          let apiResult: apiResult = (res);
          console.log('UPLOAD ObjectStorage API:::', apiResult);
          try {
            if (apiResult.Status && apiResult.Result != "") {
              this.documentUploadedId = apiResult.Result;
              resolve(true);
              // this.loadingScreenService.stopLoading();
              console.log("Awesome..., You have successfully uploaded this file");
            } else {
              // this.loadingScreenService.stopLoading();
              this.files = null;
              reject();
              this.alertService.showWarning("An error occurred while trying to upload! " + apiResult.Message);
            }
          } catch (error) {
            this.loadingScreenService.stopLoading();
            this.files = null;
            reject();
            this.alertService.showWarning("An error occurred while trying to upload! " + error);
          }
        }), ((err) => {
          reject();
          this.alertService.showWarning("An error occurred while trying to upload! " + err);
        })
      } catch (error) {
        reject();
        this.loadingScreenService.stopLoading();
        this.files = null;
        this.alertService.showWarning("An error occurred while trying to upload! " + error);
      }
    })
    return promise;
  }


}
