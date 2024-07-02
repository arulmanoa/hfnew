import { Component, OnInit } from '@angular/core';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { LoginResponses } from 'src/app/_services/model/Common/LoginResponses';
import { SessionStorage } from 'src/app/_services/service/session-storage.service';
import { TimesheetDetailedViewComponent } from '../../timesheet-detailed-view/timesheet-detailed-view.component';
import { TimesheetService } from 'src/app/_services/service/time-sheet.service';

@Component({
  selector: 'app-employee-submitted-timesheet',
  templateUrl: './employee-submitted-timesheet.component.html',
  styleUrls: ['./employee-submitted-timesheet.component.css']
})
export class EmployeeSubmittedTimesheetComponent implements OnInit {
  
  sessionDetails: LoginResponses;
  roleId: number = 0;
  UserId: any;
  EmployeeId: any = 0;
  roleCode: any;

  spinner: boolean = false;
  isSelectAll: boolean = false;
  
  submittedDataList = [];
  showNoDataFound: boolean = false;

  pageSize: number = 10;
  currentPage: number = 1;
  totalPages = Math.ceil(this.submittedDataList.length / this.pageSize);
  pages = [];

  modalOption: NgbModalOptions = {};

  constructor(
    public sessionService: SessionStorage,
    private modalService: NgbModal,
    private timesheetservice: TimesheetService
  ) { }

  

  ngOnInit() {
    this.spinner = true;

    this.sessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses)); 
    this.roleId = this.sessionDetails.UIRoles[0].Role.Id;
    this.EmployeeId = this.sessionDetails.EmployeeId;
    this.roleCode = this.sessionDetails.UIRoles[0].Role.Code;
    this.UserId = this.sessionDetails.UserSession.UserId;
    this.showNoDataFound = false;
    this.modalOption.backdrop = 'static';
    this.modalOption.keyboard = false;
    this.spinner = false;

    this.doRefresh();
   
  }

  doRefresh() {
    this.spinner = true;

    this.timesheetservice.getTimeSheetForAnEmployee(this.EmployeeId).subscribe((result) => {
      console.log('result', result);
      if (result.Status && result.Result != '') {
        this.submittedDataList = JSON.parse(result.Result);
        this.totalPages = Math.ceil(this.submittedDataList.length / this.pageSize);
        this.pages = [];
        for (let i = 1; i <= this.totalPages; i++) {
          this.pages.push(i);
        }
        this.spinner = false;
        console.log('this.submittedDataList', this.submittedDataList);
      } else {
        this.showNoDataFound = true;
        this.submittedDataList = [];
        this.spinner = false;
      }
    }), ((err) => {
      console.log('getTimeSheetForAnEmployee API ERROR ::', err);
      this.showNoDataFound = true;
      this.submittedDataList = [];
      this.spinner = false;
    });
  }

  editData(data) {
    console.log('Editing data:', data);
  }

  deleteData(data) {
    console.log('Deleting data:', data);
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
    return this.submittedDataList.slice(start, start + this.pageSize);
  }

  onCheckboxClicked(e, item) {
    console.log('CLICKED ::', e, item);
    this.showDetailedView(item);
  }

  onCheckedAll(e) {
    console.log('CLICKED ::', e);
    // this.showDetailedView(rowData);
  }

  showDetailedView(rowData) {
    const modalRef = this.modalService.open(TimesheetDetailedViewComponent, this.modalOption);
    modalRef.componentInstance.roleCode = this.roleCode;
    modalRef.componentInstance.UserId = this.UserId;
    modalRef.componentInstance.EmployeeId = this.EmployeeId;
    modalRef.componentInstance.modalData = rowData;
    modalRef.componentInstance.modeType = 'SUBMIT';

    modalRef.result.then((result) => {
      console.log('MODAL', result);
      this.doRefresh();
      // if (result != "Modal Closed") {

      // } else {

      // }
    }).catch((error) => {
      console.log(error);
    });
  }

}
