import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NgbModalOptions, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import moment from 'moment';
import { NzDrawerRef } from 'ng-zorro-antd';
import { apiResult } from 'src/app/_services/model/apiResult';
import { AlertService, SessionStorage, EmployeeService } from 'src/app/_services/service';
import { LoadingScreenService } from '../../components/loading-screen/loading-screen.service';

@Component({
  selector: 'app-resignation-approve-reject-modal',
  templateUrl: './resignation-approve-reject-modal.component.html',
  styleUrls: ['./resignation-approve-reject-modal.component.css']
})
export class ResignationApproveRejectModalComponent implements OnInit {

  @Input() rowData: any;
  @Input() title: string;
  @Input() RoleCode: string;

  approvedRelievingDate: string;
  remarks: string = '';
  minDate = new Date();
  minRemarksLength: number = 10;
  maxDate = new Date();

  constructor(
    private drawerRef: NzDrawerRef<string>,
    private modalService: NgbModal,
    private alertService: AlertService,
    public sessionService: SessionStorage,
    private employeeService: EmployeeService,
    private loadingScreenService: LoadingScreenService
  ) { }

  ngOnInit() {
    console.log(this.rowData);
    this.remarks = '';
    this.minDate = new Date(this.rowData.ResignedOn);
    this.maxDate = new Date(this.rowData.RelievingDateAsPerNoticePeriod);
  }

  onChangeRelievedDate(evt) {
    if (evt) {
      this.rowData.approvedRelievingDate = moment(evt).format("DD MMM YYYY");;
    }
  }

  cancelDrawer() {
    this.drawerRef.close(this.rowData);
  }

  isRemarksValid(): boolean {
    return this.remarks.length >= this.minRemarksLength;
  }

  ApproveRejectResignationByManager(status: string) {
    if (status == 'REJECT' && (this.remarks == '' || this.remarks == null || this.remarks == undefined)) {
      this.alertService.showInfo("Action blocked : Please enter the rejection remarks ");
      return;
    }
    if (status == 'REJECT' && !this.isRemarksValid()) {
      this.alertService.showWarning(`Remarks must be at least ${this.minRemarksLength} characters long.`);
      return;
    }

    if (status == 'APPROVE' && (this.rowData.approvedRelievingDate == null || this.rowData.approvedRelievingDate == undefined || this.rowData.approvedRelievingDate == '')) {
      this.alertService.showInfo("Action blocked : Please select the Resignation Relieving Date ");
      return;
    }
    const resignationMgrData = {
      "Comments": this.remarks,
      "RelievingDate": this.rowData.approvedRelievingDate,
      "ResigId": this.rowData.Id,
      "Button": status,  // 'APPROVE' or 'REJECT'
      "FnFTransactionType" : this.rowData.FnFTransactionType
 
    }
   
    this.loadingScreenService.startLoading();
    console.log('resignationMgrData', resignationMgrData);
    if (this.RoleCode == 'CorporateHR') {
      this.employeeService.ValidateResignationByHR(JSON.stringify(resignationMgrData)).subscribe((result) => {
        let apiR: apiResult = result;
        this.loadingScreenService.stopLoading();
        this.cancelDrawer();
        if (apiR.Status) {
          this.alertService.showSuccess(apiR.Message);
        } else {
          this.alertService.showWarning(apiR.Message);
        }
      })
    } else {
      this.employeeService.ValidateResignation(JSON.stringify(resignationMgrData)).subscribe((result) => {
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


}
