import { Component, Input, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NzDrawerRef } from 'ng-zorro-antd';
import { LoginResponses } from 'src/app/_services/model';
import { SessionStorage } from 'src/app/_services/service/session-storage.service';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { AlertService } from 'src/app/_services/service';
import { LoadingScreenService } from '../../../components/loading-screen/loading-screen.service';
import moment from 'moment';
import { AttendanceService } from 'src/app/_services/service/attendnace.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-update-shift-week-off-component',
  templateUrl: './update-shift-week-off-component.component.html',
  styleUrls: ['./update-shift-week-off-component.component.css']
})
export class UpdateShiftWeekOffComponentComponent implements OnInit {

  @Input() rowData: any;
  @Input() action: string;
  @Input() comingFrom: string;

  spinner: boolean = false;
  periodStartDate: any;
  periodEndDate: any;
  minDate: any;
  maxDate: any;
  loginSessionDetails: LoginResponses;
  loggedInUserId: string = '';
  roleId: any;
  companyId: any;
  minWeekOffSelection: any;
  maxWeekOffSelection: any;
  selectedDropdown: any = [];
  shiftList: any;
  weeksDropdown = [{
    id: 'Saturday',
    name: 'Saturday'
  }, {
    id: 'Sunday',
    name: 'Sunday',
  }, {
    id: 'Monday',
    name: 'Monday'
  }, {
    id: 'Tuesday',
    name: 'Tuesday'
  }, {
    id: 'Wednesday',
    name: 'Wednesday'
  }, {
    id: 'Thursday',
    name: 'Thursday'
  }, {
    id: 'Friday',
    name: 'Friday'
  }];
  isDisableStartDatePicker: boolean = false;

  constructor(
    private drawerRef: NzDrawerRef<string>,
    private modalService: NgbModal,
    private alertService: AlertService,
    public sessionService: SessionStorage,
    private attendanceService: AttendanceService,
    private loadingScreenService : LoadingScreenService
  ) { }

  ngOnInit() {
    console.log('rowData', this.rowData);
    this.spinner = true;
    const today = new Date();
    this.minWeekOffSelection = environment.environment.MinimumWeekOffSelection;
    this.maxWeekOffSelection = environment.environment.MaximumWeekOffSelection;
    this.minDate =  new Date();
    this.maxDate = new Date('2099-12-31');
    this.periodStartDate = this.rowData.EffectiveDate ? new Date(this.rowData.EffectiveDate) : new Date(this.rowData.EffectiveFrom);
    this.periodEndDate = this.rowData.EffectiveTo ? new Date(this.rowData.EffectiveTo) : this.maxDate;
    if (moment(this.periodStartDate).isBefore(moment(today), "day")) {
      this.isDisableStartDatePicker = true;
    }
    if (moment(this.periodEndDate).isBefore(moment(today), "day")) {
      this.periodEndDate = today;
    }
    this.loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses));
    this.loggedInUserId = this.loginSessionDetails.UserSession.UserId.toString();
    this.roleId = this.loginSessionDetails.UIRoles[0].Role.Id;
    this.companyId = this.loginSessionDetails.Company.Id;
    //update weekoff dropdown
    if (this.comingFrom.toLowerCase() === 'weekoff') {
      this.selectedDropdown = [];
      this.selectedDropdown = this.weeksDropdown.filter(e => this.rowData.selectedWeekOff.includes(e.name)).map(e => e.id);
      this.spinner = false;
    }
    // update shift dropdown
    if (this.comingFrom.toLowerCase() === 'shift') {
      this.selectedDropdown = this.rowData.ShiftId;
      this.attendanceService.GetWorkShiftDefinitionsForAClient(this.rowData.ClientId).subscribe((result) => {
        console.log('GetWorkShiftDefinitionsForAClient-Drawer', result);
        if (result.Status && result.Result != '') {
          result.Result.map(e => {
            e.modifiedStartTime = moment(e.StartTime, ["HH:mm"]).format("LT"),
            e.modifiedEndTime = moment(e.EndTime, ["HH:mm"]).format("LT");
          });
          this.shiftList = result.Result;
          this.spinner = false;
          console.log('shiftList', this.shiftList);
        } else {
          this.spinner = false;
          this.alertService.showWarning(result.Message);
        }
      });
    }
  }

  onShiftDrpdwnChangeFn(e) {
    console.log('SHIFT DRPDWN CHANGED', e, this.selectedDropdown);
    this.selectedDropdown = e.Id;
  }

  onWeekOffDrpDwnChangeFn(e) {
    console.log('WEEKOFF DRPDWN CHANGED', e, this.selectedDropdown);
  }

  onChangePeriodStartDate(e) {
    console.log('START DATE CHANGED', e);
    // this.periodEndDate = new Date(e);
  }

  onChangePeriodEndDate(e) {
    console.log('END DATE CHANGED', e);
  }

  closeUpdateShiftWeekOffDrawer(): void {
    this.drawerRef.close(this.rowData);
  }

  clickedSubmitFn() {
    if (this.action == 'delete') {
      this.doDeleteAPI();
    }

    if (this.action == 'inactive') {
      this.doInActiveAPI();
    }

    if (this.action == 'update') {
      this.doUpdateAPI();
    }
  }

  doUpdateAPI() {
    if (moment(this.periodStartDate).isAfter(moment(this.periodEndDate))) {
      return this.alertService.showWarning('Please check start date and end date');
    }
    if (this.selectedDropdown == null || this.selectedDropdown == undefined || this.selectedDropdown == '' || this.selectedDropdown.length < this.minWeekOffSelection) {
      return this.alertService.showWarning('Please fill all the required fields');
    }
    this.spinner = true;
    // UPDATE API
    if (this.comingFrom.toLowerCase() === 'shift') {
      this.doUpdateShiftMappingAPI();
      this.spinner = false;
    }

    if (this.comingFrom.toLowerCase() === 'weekoff') {
      this.doUpdateWeekOffMappingAPI();
      this.spinner = false;
    }
  }

  doUpdateShiftMappingAPI() {
    const updateShiftObj = this.createObjectForShift();
    // CALL API TO SAVE IN DB
    this.attendanceService.UpsertWorkShiftAndMapping(JSON.stringify(updateShiftObj)).subscribe((res) => {
      this.loadingScreenService.stopLoading();
      console.log('SUBMIT FOR ALL -->',res);
      if (res.Status) {
        this.alertService.showSuccess(res.Message);
        this.closeUpdateShiftWeekOffDrawer();
      } else {
        this.alertService.showWarning(res.Message);
      }
    });

  }

  doUpdateWeekOffMappingAPI() {
    this.loadingScreenService.startLoading();
    const updateWOObj = this.createObjectForWeekoff();
     // CALL API TO SAVE IN DB
     this.attendanceService.PutUpsertWeekOff(JSON.stringify(updateWOObj)).subscribe((res) => {
      console.log('SUBMIT FOR ALL WEEKOFF -->',res);
      if (res.Status) {
        this.alertService.showSuccess(res.Message);
        this.loadingScreenService.stopLoading();
        this.closeUpdateShiftWeekOffDrawer();
      } else {
        this.loadingScreenService.stopLoading();
        this.alertService.showWarning(res.Message);
      }
    });
    
  }

  doDeleteAPI() {
    this.spinner = true;
    // DELETE API
    
  }

  doInActiveAPI() {
    this.spinner = true;
    // INACTIVE API
    
  }
  
  createObjectForShift() {
    const saveObj = {
      CompanyId: this.companyId,
      ClientId: this.rowData.ClientId,
      ClientContractId : this.rowData.ClientContractId ? this.rowData.ClientContractId : 0,
      TeamId: this.rowData.TeamId ? this.rowData.TeamId : 0,
      EmployeeId:  this.rowData.EmployeeId ? this.rowData.EmployeeId : 0,
      LocationID: this.rowData.LocationID ? this.rowData.LocationID : 0,
      EffectiveFrom: moment(new Date(this.periodStartDate)).format('MM-DD-YYYY'),
      EffectiveTo: moment(new Date(this.periodEndDate)).format('MM-DD-YYYY'),
      Id: this.rowData.Id,
      WSDId: this.selectedDropdown,
      //CreatedOn: this.rowData.ClientId,
      LastUpdatedOn: new Date().toISOString(),
      //CreatedBy: this.rowData.ClientId,
      LastUpdatedBy: this.loggedInUserId,
      Status:  this.rowData.Status,
      IsEditable:  this.rowData.IsEditable
    };
   console.log('saveObj', saveObj);
   return saveObj;
  }

  createObjectForWeekoff() {
    const saveObj = {
      CompanyId: this.companyId,
      ClientId: this.rowData.ClientId,
      ClientContractId : this.rowData.ClientContractId ? this.rowData.ClientContractId : 0,
      TeamId: this.rowData.TeamId ? this.rowData.TeamId : 0,
      EmployeeId: this.rowData.EmployeeId ? this.rowData.EmployeeId : 0,
      LocationID: this.rowData.LocationID ? this.rowData.LocationID : 0,
      EffectiveDate: moment(new Date(this.periodStartDate)).format('MM-DD-YYYY'),
      EffectiveTo: moment(new Date(this.periodEndDate)).format('MM-DD-YYYY'),
      Monday: this.selectedDropdown.includes('Monday'),
      Tuesday: this.selectedDropdown.includes('Tuesday'),
      Wednesday: this.selectedDropdown.includes('Wednesday'),
      Thursday: this.selectedDropdown.includes('Thursday'),
      Friday: this.selectedDropdown.includes('Friday'),
      Saturday: this.selectedDropdown.includes('Saturday'),
      Sunday: this.selectedDropdown.includes('Sunday'),
      Id: this.rowData.Id ? this.rowData.Id : this.rowData.ID,
      // CreatedOn: new Date().toISOString(),
      LastUpdatedOn: new Date().toISOString(),
      // CreatedBy: this.loggedInUserId,
      LastUpdatedBy: this.loggedInUserId,
      Status:  this.rowData.Status,
      IsEditable:  this.rowData.IsEditable
    };
    console.log('add-saveObj', saveObj);
    return saveObj;
  }

  onStatusChange(e) {
    
  }


}
