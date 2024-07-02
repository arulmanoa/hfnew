import { Component, Input, OnInit } from '@angular/core';
import { NzDrawerRef } from 'ng-zorro-antd';
import { LoginResponses, UserStatus } from 'src/app/_services/model';
import { SessionStorage } from 'src/app/_services/service/session-storage.service';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { AlertService, ClientService } from 'src/app/_services/service';
import moment from 'moment';

@Component({
  selector: 'app-update-fbp-submission-slot-component',
  templateUrl: './update-fbp-submission-slot-component.html',
  styleUrls: ['./update-fbp-submission-slot-component.css']
})
export class UpdateFbpSubmissionSlotComponent implements OnInit {

  @Input() rowData: any;
  @Input() action: string;

  spinner: boolean = false;
  startDate: any;
  endDate: any;
  minDate: any;
  fbpSlotData: any = [];
  loggedInUserId: string = '';
  _loginSessionDetails: LoginResponses;

  constructor(
    private drawerRef: NzDrawerRef<string>,
    private alertService: AlertService,
    public sessionService: SessionStorage,
    private clientapi: ClientService
  ) { }

  ngOnInit() {
    this.spinner = true;
    this._loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses));
    this.loggedInUserId = this._loginSessionDetails.UserSession.UserId.toString();
    this.clientapi.getFBPSubmissionSlotsById(this.rowData.Id).subscribe((res) => {
      this.spinner = false;
      this.fbpSlotData = [];
      console.log('BY ID RESULT -->',res);
      if (res.Status) {
        this.fbpSlotData = res.Result;
        this.minDate = new Date(this.fbpSlotData.PeriodFrom);
        this.startDate = new Date(this.fbpSlotData.PeriodFrom);
        this.endDate = new Date(this.fbpSlotData.PeriodTo);
      }
    });
  }

  onChangeStartDate(e) {
    console.log('START DATE CHANGED', e);
  }

  onChangeEndDate(e) {
    console.log('END DATE CHANGED', e);
  }

  closeFBPDrawer(): void {
    this.drawerRef.close(this.rowData);
  }

  clickedSubmitFBPSlotFn() {
    if (this.action == 'delete') {
      this.deleteFBPSubmissionSlotFn();
    }

    if (this.action == 'inactive') {
      this.inActiveFBPSubmissionSlotFn();
    }

    if (this.action == 'edit') {
      this.updateFBPSubmissionSlotFn();
    }
  }

  updateFBPSubmissionSlotFn() {
    this.spinner = true;
    const updateObj = this.createSaveObject();
    // UPDATE API
    this.clientapi.upsertFBPSubmissionSlot(updateObj).subscribe((res) => {
      this.spinner = false;
      console.log('UPDATE SLOT RESULT -->',res);
      this.closeFBPDrawer();
      if (res.Status) {
        this.alertService.showSuccess(res.Message);
      } else {
        this.alertService.showWarning(res.Message);
      }
    });
  }

  deleteFBPSubmissionSlotFn() {
    this.spinner = true;
    const deleteObj = this.createSaveObject();
    // DELETE API
    this.clientapi.deleteFBPSubmissionSlot(this.fbpSlotData.Id).subscribe((res) => {
      this.spinner = false;
      this.closeFBPDrawer();
      console.log('DELETE SLOT API RESULT -->', res);
      if (res.Status) {
        this.alertService.showSuccess(res.Message);
      } else {
        this.alertService.showWarning(res.Message);
      }
    });
  }

  inActiveFBPSubmissionSlotFn() {
    this.spinner = true;
    const inActiveObj = this.createSaveObject();
    // INACTIVE API
    this.clientapi.inactiveFBPSubmissionSlot(inActiveObj).subscribe((res) => {
      this.spinner = false;
      this.closeFBPDrawer();
      console.log('INACTIVE SLOT API RESULT -->', res);
      if (res.Status) {
        this.alertService.showSuccess(res.Message);
      } else {
        this.alertService.showWarning(res.Message);
      }
    });
  }

  createSaveObject() {
    const saveObj = {
      CompanyId: this.fbpSlotData.CompanyId,
      ClientId: this.fbpSlotData.ClientId,
      ClientContractId : this.fbpSlotData.ClientContractId,
      TeamId: this.fbpSlotData.TeamId,
      EmployeeId: this.fbpSlotData.EmployeeId,
      PeriodFrom: moment(new Date(this.startDate)).format('MM-DD-YYYY'), //new Date(this.startDate).toISOString(),
      PeriodTo: moment(new Date(this.endDate)).format('MM-DD-YYYY'),  //new Date(this.endDate).toISOString(),
      Status : this.action == 'inactive' ? UserStatus.InActive : this.fbpSlotData.Status,
      Id: this.fbpSlotData.Id,
      CreatedOn: this.fbpSlotData.CreatedOn,
      LastUpdatedOn: new Date(Date.now()).toISOString(),
      CreatedBy: this.fbpSlotData.CreatedBy,
      LastUpdatedBy: this.loggedInUserId
    };
    console.log('saveObj', saveObj);
    return saveObj;
  }

}
