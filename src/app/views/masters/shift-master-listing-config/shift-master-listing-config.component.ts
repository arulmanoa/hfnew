import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { HttpService } from 'src/app/_services/service/http.service';
import { appSettings, LoginResponses } from 'src/app/_services/model';
import { SearchElement, SearchConfiguration, RoleBasedDataSecurityConfiguration, UserBasedDataSecurityConfiguration, SearchBarAccordianToggle } from 'src/app/views/personalised-display/models';
import { FormGroup, FormBuilder, FormControl, Validators, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { InputControlType, SearchPanelType, DataSourceType, RowSelectionType } from '../../personalised-display/enums';
import { SessionStorage } from 'src/app/_services/service/session-storage.service';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { PagelayoutService } from 'src/app/_services/service/pagelayout.service';
import { AttendanceService } from 'src/app/_services/service/attendnace.service';
import { AlertService, PayrollService, ExcelService, ClientContactService } from 'src/app/_services/service';
import moment from 'moment';
@Component({
  selector: 'app-shift-master-listing-config',
  templateUrl: './shift-master-listing-config.component.html',
  styleUrls: ['./shift-master-listing-config.component.css']
})
export class ShiftMasterListingConfigComponent implements OnInit {
  shiftMasterForm: FormGroup;
  clientId: any;
  _loginSessionDetails: LoginResponses;
  clientList: any = [];
  businessType: number;
  spinner: boolean = false;
  companyId: any;
  roleId: number;
  userId: number;
  isShiftSpanAcrossDays: boolean = false;
  searchElement: any;
  minTime: Date = new Date();
  pageTitle: string = '';
  isEdit: boolean = true;
  originalData: any;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpService,
    private sessionService: SessionStorage,
    private pagelayoutService: PagelayoutService,
    private attendanceService: AttendanceService,
    private alertService: AlertService,
    private clientContactService: ClientContactService
  ) { }

  ngOnInit() {
   // debugger;
    console.log('shift ON INIT');
    this.spinner = true;
    this.pageTitle = 'Add Shift';
    this.isEdit = false;
    this._loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses));
    this.clientId = (this._loginSessionDetails.ClientList && this._loginSessionDetails.ClientList.length > 0) ? this._loginSessionDetails.ClientList[0].Id as any : 0;
    this.businessType = this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this._loginSessionDetails.Company.Id).BusinessType;
    if (Number(this.businessType) != 3) {
      const lstClients = this._loginSessionDetails.ClientList;
      this.clientId = (this.sessionService.getSessionStorage("default_SME_ClientId") == null || this.sessionService.getSessionStorage("default_SME_ClientId") == undefined) ? 
      lstClients.find(item => item.IsDefault).Id : this.sessionService.getSessionStorage("default_SME_ClientId"); // client id
    }
    this.roleId = this._loginSessionDetails.UIRoles[0].Role.Id; 
    this.userId = this._loginSessionDetails.UserSession.UserId;
    this.companyId = this._loginSessionDetails.Company.Id;
    
    this.clientContactService.getUserMappedClientList(this.roleId, this.userId).subscribe((res) => {
      console.log('res', res);
      this.spinner = false;
      if (res.Status && res.dynamicObject) {
        this.clientList = res.dynamicObject;
      } else {
        this.alertService.showWarning(res.Message);
      }
    }), ((err: any) => {
      this.spinner = false;
      console.log(':: getUserMappedClientList API ERROR ::', err);
    });

    this.createReactiveForm();

    this.route.queryParams.subscribe(params => {
      if (JSON.stringify(params) != JSON.stringify({})) {
        this.isEdit = true;
        this.pageTitle = 'Update Shift';
        const data = JSON.parse(atob(params["dx"]));
        console.log('ifffff', data);
        this.originalData = data;
        this.companyId = data.Company;
        this.clientId = data.ClientId;
        this.isShiftSpanAcrossDays = data.IsShiftSpanAcrossDays;
        this.shiftMasterForm.get('clientId').disable();
        this.shiftMasterForm.patchValue({
          Id : data.Id,
          clientId: this.clientId,
          Code: data.Code,
          Name: data.Name,
          Description:  data.Description,
          startTime: data.StartTime,
          endTime: data.EndTime,
          firstHalfEndTime: data.FirstHalfEndTime,
          secondHalfStartTime: data.SecondHalfStartTime,
          workingHours: data.DefaultWorkingHours,
          statusActive: data.Status
        });
      }
    });
   
  }

  get g() { return this.shiftMasterForm.controls; } // reactive forms validation 

  createReactiveForm() {
    this.shiftMasterForm = this.formBuilder.group({
      Id: 0,
      clientId: [null, Validators.required],
      Code: ['', Validators.required],
      Name: ['', Validators.required],
      Description: [''],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      firstHalfEndTime: ['', Validators.required],
      secondHalfStartTime: ['', Validators.required],
      workingHours: [''],
      statusActive:[true]
    });
  }

  submitShiftMaster() {
    if (this.shiftMasterForm.valid) {
      this.spinner = true;
      let requestURL_json = {
        "Company": this.companyId,
        "ClientId": this.shiftMasterForm.get('clientId').value,
        "Id": this.shiftMasterForm.get('Id').value,
        "Code": this.shiftMasterForm.get('Code').value,
        "Name": this.shiftMasterForm.get('Name').value,
        "Description": this.shiftMasterForm.get('Description').value,
        "StartTime": this.shiftMasterForm.get('startTime').value,
        "EndTime": this.shiftMasterForm.get('endTime').value,
        "FirstHalfEndTime": this.shiftMasterForm.get('firstHalfEndTime').value,
        "SecondHalfStartTime": this.shiftMasterForm.get('secondHalfStartTime').value,
        "DefaultWorkingHours": moment(this.shiftMasterForm.get('workingHours').value, "hh:mm a").format("HH:mm"),
        "IsShiftSpanAcrossDays": this.isShiftSpanAcrossDays,
        "IsBreakAllowed": true,
        "FlexibleBreakHours": "00:00", // date object
        "AllotedBreaks": null,
        "CreatedOn": this.isEdit ? this.originalData.CreatedOn : new Date(),
        "LastUpdatedOn": new Date(),
        "CreatedBy": this.isEdit ? this.originalData.CreatedBy : this.userId.toString(),
        "LastUpdatedBy": this.userId.toString(),
        "Status": this.shiftMasterForm.get('statusActive').value,
      };
      console.log('SUBMIT JSON -->', requestURL_json);
      this.attendanceService.UpdateWorkShiftDefinition(JSON.stringify(requestURL_json)).subscribe((result) => {
        console.log('UpdateWorkShiftDefinition', result);
        if (result && result.Status) {
          this.spinner = false;
          this.shiftMasterForm.reset();
          this.alertService.showSuccess(result.Message);
          this.backToShiftList();
        } else {
          this.spinner = false;
          this.alertService.showWarning(result.Message);
        }
      });
    } else {
      this.alertService.showWarning('Please fill all the required field(s) !');
    }
  }

  backToShiftList() {
    this.router.navigate(['app/masters/shiftMasterListing']);
  }

  onChangeClient(searchElement: any) {
    console.log('searchElement', searchElement);
  }

  onChangeStartTime(e: any) {
    const endTime = this.shiftMasterForm.get('endTime').value;
    const startTime = e.target.value;
    this.calculateWorkingHours(startTime, endTime);
  }

  onChangeEndTime(e: any) {
    const startTime = this.shiftMasterForm.get('startTime').value;
    const endTime = e.target.value;
    this.calculateWorkingHours(startTime, endTime);
  }

  calculateWorkingHours(startTime: string | any, endTime: string | any) {
    if (startTime && startTime != '' && endTime && endTime != '') {
      const momentStartTime = moment(startTime, 'HH:mm a');
      const momentEndTime = moment(endTime, 'HH:mm a');
      this.isShiftSpanAcrossDays = false;
      console.log('start time/ end time ::', momentStartTime, momentEndTime);
      // check if across days
      if (momentEndTime.isBefore(momentStartTime)) {
        momentEndTime.add(1, 'd');
        this.isShiftSpanAcrossDays = true;
      }
      // calculate total time duration
      const duration = moment.duration(momentEndTime.diff(momentStartTime));
      // duration in hours
      const hours = duration.asHours();
      // set default working hours
      // this.shiftMasterForm.controls['workingHours'].setValue(hours);
      this.shiftMasterForm.controls['workingHours'].setValue(`${hours.toFixed(2)}`);
      console.log('time duration in hrs ::', `${hours.toFixed(2)}`);
    }
  }
}
