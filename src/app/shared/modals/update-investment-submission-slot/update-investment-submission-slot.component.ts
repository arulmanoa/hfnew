import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { Component, Input, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NzDrawerRef } from 'ng-zorro-antd';
import { LoginResponses, UIMode, UserStatus } from 'src/app/_services/model';
import { SessionStorage } from 'src/app/_services/service/session-storage.service';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { AlertService, ClientService } from 'src/app/_services/service';
import { LoadingScreenService } from '../../components/loading-screen/loading-screen.service';
import { InvestmentSubmissionSlotMode } from 'src/app/_services/model/investmentSubmissionSlotMode';
import moment from 'moment';

@Component({
  selector: 'app-update-investment-submission-slot',
  templateUrl: './update-investment-submission-slot.component.html',
  styleUrls: ['./update-investment-submission-slot.component.css']
})
export class UpdateInvestmentSubmissionSlotComponent implements OnInit {

  @Input() rowData: any;
  @Input() action: string;

  spinner: boolean = false;
  isDeclarationSelected: boolean = true;
  startDate: any;
  endDate: any;
  minDate: any;
  investmentData: any = [];
  loggedInUserId: string = '';
  _loginSessionDetails: LoginResponses;

  constructor(
    private drawerRef: NzDrawerRef<string>,
    private modalService: NgbModal,
    private alertService: AlertService,
    public sessionService: SessionStorage,
    private clientapi: ClientService,
    private loadingScreenService : LoadingScreenService
  ) { }

  ngOnInit() {
    console.log('rowData', this.rowData);
    this.spinner = true;
    this.minDate = new Date(this.rowData.StartDate);
    this.startDate = new Date(this.rowData.StartDate);
    this.endDate = new Date(this.rowData.EndDay);
    this._loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses));
    this.loggedInUserId = this._loginSessionDetails.UserSession.UserId.toString();
    this.clientapi.getInvestmentSubmissionSlotsById(this.rowData.Id).subscribe((res) => {
      this.spinner = false;
      this.investmentData = [];
      console.log('BY ID RESULT -->',res);
      if (res.Status) {
        this.investmentData = res.Result;
        this.minDate = new Date(this.investmentData.StartDay);
        this.startDate = new Date(this.investmentData.StartDay);
        this.endDate = new Date(this.investmentData.EndDay);
        this.isDeclarationSelected = this.investmentData.Mode == 1 ? true : false;
      }
    });
  }

  onChangeMode(value: string) {
    if (value == 'proof') {
      this.isDeclarationSelected = false;
    } else {
      this.isDeclarationSelected = true;
    }
  }

  onChangeStartDate(e) {
    console.log('START DATE CHANGED', e);
    // this.endDate = new Date(e);
  }

  onChangeEndDate(e) {
    console.log('END DATE CHANGED', e);
  }

  closeInvestmentDrawer(): void {
    this.drawerRef.close(this.rowData);
  }

  clickedSubmitSlotFn() {
    if (this.action == 'delete') {
      this.deleteInvestmentSubmissionSlotFn();
    }

    if (this.action == 'inactive') {
      this.inActiveInvestmentSubmissionSlotFn();
    }

    if (this.action == 'edit') {
      this.updateInvestSubmissionSlotFn();
    }
  }

  updateInvestSubmissionSlotFn() {
    if (moment(this.startDate).isAfter(moment(this.endDate))) {
      return this.alertService.showWarning('Please check start date and end date');
    }
    this.spinner = true;
    const updateObj = this.createSaveObject();
    // UPDATE API
    this.clientapi.upsertInvestmentSubmissionSlot(updateObj).subscribe((res) => {
      this.spinner = false;
      console.log('UPDATE SLOT RESULT -->',res);
      this.closeInvestmentDrawer();
      if (res.Status) {
        this.alertService.showSuccess(res.Message);
      } else {
        this.alertService.showWarning(res.Message);
      }
    });
  }

  deleteInvestmentSubmissionSlotFn() {
    this.spinner = true;
    const deleteObj = this.createSaveObject();
    // DELETE API
    this.clientapi.deleteInvestmentSubmissionSlot(this.investmentData.Id).subscribe((res) => {
      this.spinner = false;
      this.closeInvestmentDrawer();
      console.log('DELETE SLOT API RESULT -->', res);
      if (res.Status) {
        this.alertService.showSuccess(res.Message);
      } else {
        this.alertService.showWarning(res.Message);
      }
    });
  }

  inActiveInvestmentSubmissionSlotFn() {
    this.spinner = true;
    const inActiveObj = this.createSaveObject();
    // INACTIVE API
    this.clientapi.inactiveInvestmentSubmissionSlot(inActiveObj).subscribe((res) => {
      this.spinner = false;
      this.closeInvestmentDrawer();
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
      ClientContractId : this.investmentData.ClientContractId,
      ClientId: this.investmentData.ClientId,
      CompanyId: this.investmentData.CompanyId,
      CreatedBy: this.investmentData.CreatedBy,
      CreatedOn: this.investmentData.CreatedOn,
      EmployeeId: this.investmentData.EmployeeId,
      Id: this.investmentData.Id,
      Mode: this.isDeclarationSelected ? InvestmentSubmissionSlotMode.Declaration : InvestmentSubmissionSlotMode.Proof,
      Modetype: this.action == 'delete' ? UIMode.Delete : UIMode.Edit,
      StartDay: moment(new Date(this.startDate)).format('MM-DD-YYYY'), // new Date(this.startDate).toISOString(),
      EndDay: moment(new Date(this.endDate)).format('MM-DD-YYYY'), //new Date(this.endDate).toISOString(),
      Status : this.action == 'inactive' ? UserStatus.InActive : this.investmentData.Status,
      TeamId: this.investmentData.TeamId,
      LastUpdatedBy: this.loggedInUserId,
      LastUpdatedOn: new Date(Date.now()).toISOString()
    };
    console.log('saveObj', saveObj);
    return saveObj;
  }

}
