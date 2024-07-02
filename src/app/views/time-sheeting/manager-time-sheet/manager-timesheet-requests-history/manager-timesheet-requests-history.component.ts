import { Component, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { NgbActiveModal, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { AlertService } from 'src/app/_services/service';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';

import * as moment from 'moment';
import * as _ from 'lodash';
import { TimesheetService } from 'src/app/_services/service/time-sheet.service';
import { NzDrawerService } from 'ng-zorro-antd';
import { UIMode } from 'src/app/_services/model';
import { TimeSheetStatus } from 'src/app/_services/model/timesheet';
import { TimesheetEntriesByEmployeeComponent } from '../../employee-time-sheet/timesheet-entries-by-employee/timesheet-entries-by-employee.component';
import { TimesheetDetailedViewComponent } from '../../timesheet-detailed-view/timesheet-detailed-view.component';

@Component({
  selector: 'app-manager-timesheet-requests-history',
  templateUrl: './manager-timesheet-requests-history.component.html',
  styleUrls: ['./manager-timesheet-requests-history.component.css']
})
export class ManagerTimesheetRequestsHistoryComponent implements OnInit {
  
  @Input() roleCode: string;
  @Input() UserId: any;
  @Input() EmployeeId: any;

  spinner: boolean = false;
  searchText: string = '';
  requestHistoryData = [];

  showNoDataFound: boolean = false;

  modalOption: NgbModalOptions = {};

  pageSize: number = 15;
  currentPage: number = 1;
  totalPages = Math.ceil(this.requestHistoryData.length / this.pageSize);
  pages = [];

  constructor(
    private activeModal: NgbActiveModal,
    private alertService: AlertService,
    private timesheetservice: TimesheetService,
    private modalService: NgbModal,
  ) { }

  ngOnInit() {
    this.spinner = true;

    this.modalOption.backdrop = 'static';
    this.modalOption.keyboard = false;
    this.spinner = false;
    this.doRefresh();
   
  }

  doRefresh() {
    this.spinner = true;
    this.timesheetservice.getApprovedRejectedTimesheetForManager(this.UserId).subscribe((result) => {
      console.log('getApprovedRejectedTimesheetForManager', result);
      if (result.Status && result.Result != '') {
        this.requestHistoryData = JSON.parse(result.Result);
        for (let key in this.requestHistoryData) {
          if (this.requestHistoryData.hasOwnProperty(key)) {
            this.requestHistoryData[key].isSelected = false;
            this.requestHistoryData[key].ApproverRemarks = this.requestHistoryData[key].ApproverRemarks !== 'null' 
              ? this.requestHistoryData[key].ApproverRemarks : '';
            const startDate = moment(this.requestHistoryData[key]['PeriodFrom']);
            const endDate = moment(this.requestHistoryData[key]['PeriodTo']);
    
            if (moment(startDate).isSame(endDate, 'day')) {
              this.requestHistoryData[key].requestedWeek = startDate.format('D MMM YYYY');
            } else if (moment(startDate).isSame(endDate, 'month')) {
              this.requestHistoryData[key].requestedWeek = `${startDate.format('D')}-${endDate.format('D')} ${endDate.format('MMM YYYY')}`;
            } else {
              this.requestHistoryData[key].requestedWeek = `${startDate.format('D MMM YYYY')} - ${endDate.format('D MMM YYYY')}`;
            }
          }
        }
        this.totalPages = Math.ceil(this.requestHistoryData.length / this.pageSize);
        this.pages = [];
        for (let i = 1; i <= this.totalPages; i++) {
          this.pages.push(i);
        }
        this.spinner = false;
        console.log('this.requestHistoryData', this.requestHistoryData);
      } else {
        this.showNoDataFound = true;
        this.requestHistoryData = [];
        this.spinner = false;
      }
    }), ((err) => {
      console.log('getApprovedRejectedTimesheetForManager API ERROR ::', err);
      this.showNoDataFound = true;
      this.requestHistoryData = [];
      this.spinner = false;
    });
  }

  previousPage() {
    console.log('Prev:', this.currentPage);
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
    console.log('Prev:', this.currentPage);
    this.currentPage = page;
  }

  get pagedDataList() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.requestHistoryData.slice(start, start + this.pageSize);
  }

  closeModal() {
    this.activeModal.close('Modal Closed');
  }

  showDetailedView(rowData) {
    const modalRef = this.modalService.open(TimesheetDetailedViewComponent, this.modalOption);
    modalRef.componentInstance.roleCode = this.roleCode;
    modalRef.componentInstance.UserId = this.UserId;
    modalRef.componentInstance.EmployeeId = this.EmployeeId;
    modalRef.componentInstance.modalData = rowData;
    modalRef.componentInstance.modeType = 'MANAGER_VIEW';

    modalRef.result.then((result) => {
      console.log('MODAL DETAILED RESULT', result);
      this.doRefresh();

      if (result != "Modal Closed") {

      } else {

      }
    }).catch((error) => {
      console.log(error);
    });
  }

}
