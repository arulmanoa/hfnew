import { Component, OnInit } from '@angular/core';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { SessionStorage } from 'src/app/_services/service/session-storage.service';
import { LoginResponses } from 'src/app/_services/model';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { TimesheetService } from 'src/app/_services/service/time-sheet.service';
import { TimesheetDetailedViewComponent } from '../../timesheet-detailed-view/timesheet-detailed-view.component';
import { ApproveOrRejectTimesheetComponent } from 'src/app/shared/modals/approve-or-reject-timesheet/approve-or-reject-timesheet.component';
import { NzDrawerService } from 'ng-zorro-antd';
import { AlertService } from 'src/app/_services/service';
import * as moment from 'moment';
import { ManagerTimesheetRequestsHistoryComponent } from '../manager-timesheet-requests-history/manager-timesheet-requests-history.component';

@Component({
  selector: 'app-manager-timesheet-listing',
  templateUrl: './manager-timesheet-listing.component.html',
  styleUrls: ['./manager-timesheet-listing.component.css']
})
export class ManagerTimesheetListingComponent implements OnInit {

  _loginSessionDetails: LoginResponses;
  UserId: any;
  RoleId: any;
  EmployeeId:any;
  RoleCode: any;
  data: any[] = [];
  

  pageSize: number = 15;
  currentPage: number = 1;
  totalPages = Math.ceil(this.data.length / this.pageSize);
  pages = [];

  modalOption: NgbModalOptions = {};
  spinner: boolean = false;
  showNoData: boolean = false;
  isSelectAll: boolean = false;
  showFooterBtns: boolean = false;

  constructor(
    private modalService: NgbModal,
    public sessionService: SessionStorage,
    private timesheetservice: TimesheetService,
    private loadingScreenService: LoadingScreenService,
    private alertService: AlertService,
    private drawerService: NzDrawerService,
  ) { }

  ngOnInit() {
    this.spinner = true;
    this.showNoData = false;
    this._loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses)); 
    this.RoleId = this._loginSessionDetails.UIRoles[0].Role.Id; 
    this.UserId = this._loginSessionDetails.UserSession.UserId;
    this.EmployeeId = this._loginSessionDetails.EmployeeId;
    this.RoleCode = this._loginSessionDetails.UIRoles[0].Role.Code;
    this.spinner = false;
    this.doRefresh();
    this.modalOption.backdrop = 'static';
    this.modalOption.keyboard = false;
  }

  doRefresh() {
    this.showFooterBtns = false;
    this.spinner = true;
    this.timesheetservice.getPendingTimeSheetForManager(this.UserId).subscribe((result) => {
      console.log('getPendingTimeSheetForManager::result::', result);
      if (result.Status && result.Result != '') {
        this.data = JSON.parse(result.Result);
        for (let key in this.data) {
          if (this.data.hasOwnProperty(key)) {
            this.data[key].isSelected = false;
            const startDate = moment(this.data[key]['PeriodFrom']);
            const endDate = moment(this.data[key]['PeriodTo']);
    
            if (moment(startDate).isSame(endDate, 'day')) {
              this.data[key].formattedDateRange = startDate.format('D MMM YYYY');
            } else if (moment(startDate).isSame(endDate, 'month')) {
              this.data[key].formattedDateRange = `${startDate.format('D')}-${endDate.format('D')} ${endDate.format('MMM YYYY')}`;
            } else {
              this.data[key].formattedDateRange = `${startDate.format('D MMM YYYY')} - ${endDate.format('D MMM YYYY')}`;
            }
          }
        }
        this.totalPages = Math.ceil(this.data.length / this.pageSize);
        this.pages = [];
        for (let i = 1; i <= this.totalPages; i++) {
          this.pages.push(i);
        }
        this.spinner = false;
        console.log('this.data', this.data);
      } else {
        this.showNoData = true;
        this.data = [];
        result.Status ? this.alertService.showSuccess('No Records Found !') : this.alertService.showWarning(result.Message);
        this.spinner = false;
      }
    }), ((err) => {
      this.loadingScreenService.stopLoading();
      this.showNoData = true;
      this.data = [];
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
    return this.data.slice(start, start + this.pageSize);
  }


  onCheckboxClicked(evt, item) {
    console.log('CLICKED ::', evt, item);
    item.isSelected = evt.target.checked;
    this.showFooterBtns = item.isSelected ? true : false;
  }

  onCheckboxAllClicked(evt) {
    console.log('ALL CLICKED ::', evt.target.checked);
    this.isSelectAll = evt.target.checked;
    this.showFooterBtns = this.isSelectAll ? true : false;
    for (let key in this.pagedDataList) {
      if (this.pagedDataList.hasOwnProperty(key)) {
        this.pagedDataList[key].isSelected = evt.target.checked;
      }
    }
  }

  onRowClicked(evt, item) {
    console.log('CLICKED ::', evt.target.nodeName, item);
    // prevent this function from calling when checkbox or action buttons are called
    if (evt.target.nodeName === 'BUTTON' || evt.target.nodeName === 'INPUT') {
      return;
    }
    this.showDetailedView(item);
  }

  approveOrRejectAllTimesheetEntries(type) {
    console.log('rowData', type, this.pagedDataList);
    const rowData = this.pagedDataList;
    const drawerRef = this.drawerService.create<ApproveOrRejectTimesheetComponent, { rowData: any, title: string }, string>({
      nzTitle: '',
      nzContent: ApproveOrRejectTimesheetComponent,
      nzWidth: 553,
      nzClosable: false,
      nzMaskClosable: false,
      nzContentParams: {
        rowData: rowData,
        title: type
      }
    });

    drawerRef.afterOpen.subscribe(() => {
      console.log('Approval Drawer Opened !');
    });
    drawerRef.afterClose.subscribe(data => {
      console.log('Approval Drawer Closed !');
      this.isSelectAll = false;
      this.showFooterBtns = false;
      this.doRefresh();
    });
  }

  showDetailedView(data) {
    const modalRef = this.modalService.open(TimesheetDetailedViewComponent, this.modalOption);
    modalRef.componentInstance.roleCode = this.RoleCode;
    modalRef.componentInstance.UserId = this.UserId;
    modalRef.componentInstance.EmployeeId = this.EmployeeId;
    modalRef.componentInstance.modalData = data;
    modalRef.componentInstance.modeType = 'APPROVAL';

    modalRef.result.then((result) => {

      this.doRefresh(); 

      if (result != "Modal Closed") {

      } else {
      }
    }).catch((error) => {
      console.log(error);
    });
  }

  rejectSelectedTimeSheet(data) {
    data.isSelected = true;
    const drawerRef = this.drawerService.create<ApproveOrRejectTimesheetComponent, { rowData: any, title: string }, string>({
      nzTitle: '',
      nzContent: ApproveOrRejectTimesheetComponent,
      nzWidth: 553,
      nzClosable: false,
      nzMaskClosable: false,
      nzContentParams: {
        rowData: [data],
        title: 'reject'
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

  approveSelectedTimeSheet(data) {
    data.isSelected = true;
    const drawerRef = this.drawerService.create<ApproveOrRejectTimesheetComponent, { rowData: any, title: string }, string>({
      nzTitle: '',
      nzContent: ApproveOrRejectTimesheetComponent,
      nzWidth: 553,
      nzClosable: false,
      nzMaskClosable: false,
      nzContentParams: {
        rowData: [data],
        title: 'approve'
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

  showRequestHistory() {
    const modalRef = this.modalService.open(ManagerTimesheetRequestsHistoryComponent, this.modalOption);
    modalRef.componentInstance.roleCode = this.RoleCode;
    modalRef.componentInstance.UserId = this.UserId;
    modalRef.componentInstance.EmployeeId = this.EmployeeId;

    modalRef.result.then((result) => {
      this.doRefresh();
      // if (result != "Modal Closed") {
        
      // } else {
      // }
    }).catch((error) => {
      console.log(error);
    });
  }

}
