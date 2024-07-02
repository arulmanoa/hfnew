
import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { Observable, timer } from 'rxjs';
import { map, share } from 'rxjs/operators';
import { MapsAPILoader } from '@agm/core';

import { UUID } from 'angular2-uuid';
import Swal from "sweetalert2";
// services 
import { AlertService } from '../../../../_services/service/alert.service';
import { UIBuilderService } from '../../../../_services/service/UIBuilder.service';
import { SessionStorage } from '../../../../_services/service/session-storage.service';

import { FileUploadService } from 'src/app/_services/service/fileUpload.service';
import { ObjectStorageDetails } from 'src/app/_services/model/Candidates/ObjectStorageDetails';
// directives 

import { enumHelper } from '../../../../shared/directives/_enumhelper';
// enum
import * as _ from 'lodash';
import { apiResult } from 'src/app/_services/model/apiResult';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { LoginResponses } from 'src/app/_services/model';
import { AttendanceConfiguration, AttendanceType } from 'src/app/_services/model/Attendance/AttendanceConfiguration';
import { EmployeeAttendanceBreakUpDetails, EmployeeAttendanceDetails, EmployeeAttendancePunchInDetails, SubmitAttendanceUIModel } from 'src/app/_services/model/Attendance/EmployeeAttendanceDetails';
import { AttendanceService } from 'src/app/_services/service/attendnace.service';
import * as moment from 'moment';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
import { L } from '@angular/cdk/keycodes';
import { ImagecaptureModalComponent } from '../imagecapture-modal/imagecapture-modal.component';
import { CommonService } from 'src/app/_services/service';
import { AttendanceBreakUpDetailsStatus, AttendanceBreakUpDetailsType } from 'src/app/_services/model/Attendance/AttendanceEnum';
import { Subscription } from 'rxjs';
import { PunchAttendanceModel } from 'src/app/_services/model/Attendance/PunchAttendanceModel';

import { Subject } from 'rxjs/Subject';
import { of } from 'rxjs/observable/of';
import { filter, catchError, tap, switchMap } from 'rxjs/operators';
import { fromPromise } from 'rxjs/observable/fromPromise';

declare var google: any;

class Time {
  hour: number;
  minute: number;
  second: number;
  Time(options: {
    hour?: number;
    minute?: number;
    second?: number;
  } = {}) {
    this.hour = options.hour;
    this.minute = options.minute;
    this.second = options.second;
  }
}

@Component({
  selector: 'app-attendance-request',
  templateUrl: './attendance-request.component.html',
  styleUrls: ['./attendance-request.component.css']
})
export class AttendanceRequestComponent implements OnInit {

  @Input() EmployeeObject: any
  @Input() JObject: any;
  @Input() AttendanceConfig: AttendanceConfiguration = new AttendanceConfiguration();
  PunchInOutText: any = 'Punch In';
  punchInSpinner: boolean = false;
  TotalWorkingHours: number = 0;
  modalOption: NgbModalOptions = {};
  actualWorkingHours: number = 0;
  preferredDate: Date = new Date();
  formatted_startTime: Time;
  formatted_endTime: Time;
  LstattendanceType: any[] = [];
  attendanceForm: FormGroup;
  leaveType: any[] = [{
    id: 1,
    name: "SL"
  },
  {
    id: 2,
    name: "LOP"
  }]
  LstPunchInDetails: any[] = [];
  _PayableDay: number = 0;
  _StartTime: any;
  _EndTime: any;
  CalendarObject: any;
  _attendanceConfiguration: AttendanceConfiguration;
  isMultiplePunchesAllowed: boolean = false;
  isPunchInTimeAllowEdit: boolean = true;
  isPunchOutTimeAllowEdit: boolean = true;
  tobeHidden: boolean = false;
  isInvalidPunchOutTime: boolean = false;
  isInvalidTablePunchInOutTime: boolean = false;
  RoleId: number;

  // current time clock 
  time = new Date();
  rxTime = new Date();
  intervalId;
  subscription: Subscription;

  FCI: any = '--:--:--';
  LCO: any = '--:--:--';
  TOTALHOURS: any = '0.00';
  isrendering_spinner: boolean = false;
  LstEmployeeAttendanceBreakUpDetails: any;
  isCheckCurrentDate: boolean = false;

  // Coordinates/ Image base 64
  PunchInImageId: any;
  PunchOutImageId: any;
  isLocationAccessed: boolean = false;
  position: any;
  isInvalidGeoFenceCoordinates: boolean = false;
  completeGeoLocationAddress : string = "";
  PhotoId: any;
  Coordinates: any;
  private geocoder: any;
  isShiftSpanAcrossDays: boolean = false;
  ShouldShowPunchInBtn: boolean = false;

  dropDownData: any[] = []; // for allen

  constructor(
    private activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private attendanceService: AttendanceService,
    private utilsHelper: enumHelper,
    private loadingScreenService: LoadingScreenService,
    private modalService: NgbModal,
    private commonService: CommonService,
    private sessionService: SessionStorage,
    private mapLoader: MapsAPILoader
  ) {
    const starttime = new Time();
    this.createForm();
  }

  get g() { return this.attendanceForm.controls; }

  createForm() {


    this.attendanceForm = this.formBuilder.group({
      Id: [0],
      starttime: [null, Validators.required],
      endtime: ['', Validators.required],
      remarks: [''],
      attendancedate: this.preferredDate


    });
  }



  ngOnInit() {
    this.position = null;
    this.isCheckCurrentDate = false;
    let today = new Date();

    this.isrendering_spinner = true;
    this.JObject = JSON.parse(this.JObject);
    this.modalOption.backdrop = 'static';
    this.modalOption.keyboard = false;
    console.log('EMP OBJ ::', this.EmployeeObject);
    if (this.EmployeeObject.EmployeeName == undefined) {
      this.EmployeeObject.EmployeeName = this.EmployeeObject.FirstName;
    }

    if (this.EmployeeObject.EmployeeCode == undefined) {
      this.EmployeeObject.EmployeeCode = this.EmployeeObject.Code;
    }
    console.log('OTHER OBJ ::', this.JObject);

    this.isShiftSpanAcrossDays = (this.JObject && this.JObject.WorkShiftDefinition && this.JObject.WorkShiftDefinition.IsShiftSpanAcrossDays) ? this.JObject.WorkShiftDefinition.IsShiftSpanAcrossDays : false;


    // Using RxJS Timer
    this.subscription = timer(0, 1000)
      .pipe(
        map(() => new Date()),
        share()
      )
      .subscribe(time => {
        this.rxTime = time;
      });



    this.RoleId = this.sessionService.getSessionStorage('RoleId');

    this.preferredDate = this.JObject.preferredDate;

    // if (moment(today).format('YYYY-MM-DD') == moment(this.preferredDate).format('YYYY-MM-DD')) {
    //   this.isCheckCurrentDate = true;
    // }

    let a = new Date(this.JObject.AttendancePeriod.StartDate);
    let b = new Date(this.JObject.AttendancePeriod.EndDate);
    var Difference_In_Time = a.getTime() - b.getTime();
    this._PayableDay = Difference_In_Time / (1000 * 3600 * 24);
    this._PayableDay = Math.abs(this._PayableDay);
    this._PayableDay = Number(this._PayableDay) + 1;
    this._StartTime = new Date(this.JObject.WorkShiftDefinition.StartTime);
    this._EndTime = new Date(this.JObject.WorkShiftDefinition.EndTime);
    this.LstattendanceType = this.utilsHelper.transform(AttendanceType) as any;
    this.GetISTServerTime().then((rs) => {
      this.objectMapping();
    })

  }

  GetISTServerTime() {
    const promise = new Promise((res, rej) => {
      this.attendanceService.getEmployeeShiftAndAttendanceDetailsForToday(this.EmployeeObject.Id).subscribe((response) => {
        let apiResult: apiResult = response;
        if (apiResult.Status) {
          const parsedResult = JSON.parse(apiResult.Result);
          console.log('getEmployeeShiftAndAttendanceDetailsForToday-response', parsedResult);
          this.ShouldShowPunchInBtn = parsedResult.IsAttendanceAllowed;
          this.ShouldShowPunchInBtn ? true : this.alertService.showWarning(parsedResult.Message);
        }
        this.attendanceService.GetISTServerTime()
          .subscribe((ress) => {
            console.log('IST TIME ::', ress);
            let apiR: apiResult = ress;
            if (apiR.Status) {
              this.time = new Date(apiR.Result);
              let serverDateTime = new Date(apiR.Result);
              if (moment(serverDateTime).format('YYYY-MM-DD') == moment(this.preferredDate).format('YYYY-MM-DD')) {
                this.isCheckCurrentDate = true;
              } else {
                this.isCheckCurrentDate = false;
              }
            }
            res(true);

          });
      });

    });
    return promise;
  }

  calcCrow(lat1, lon1, lat2, lon2) {
    var R = 6371; // km
    var dLat = this.toRad(lat2 - lat1);
    var dLon = this.toRad(lon2 - lon1);
    var lat1 = this.toRad(lat1) as any;
    var lat2 = this.toRad(lat2) as any;

    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d;
  }

  // Converts numeric degrees to radians
  toRad(Value) {
    return Value * Math.PI / 180;
  }
  // private initGeocoder() {
  //   console.log('Init geocoder!');
  //   this.geocoder = new google.maps.Geocoder();
  // }

  // private waitForMapsToLoad(): Observable<boolean> {
  //   if (!this.geocoder) {
  //     return fromPromise(this.mapLoader.load())
  //       .pipe(
  //         tap(() => this.initGeocoder()),
  //         map(() => true)
  //       );
  //   }
  //   return of(true);
  // }

  // geocodeAddress(): Observable<Location> {
  //   console.log('Start geocoding!');
  //   return this.waitForMapsToLoad().pipe(
  //     // filter(loaded => loaded),
  //     switchMap(() => {
  //       return new Observable(observer => {
  //         this.geocoder.geocode({ 'address': '' }, (results, status) => {
  //           if (status == google.maps.GeocoderStatus.OK) {
  //             console.log('Geocoding complete!');
  //             // observer.next({
  //             //   lat: results[0].geometry.location.lat(),
  //             //   lng: results[0].geometry.location.lng()
  //             // });
  //           } else {
  //             console.log('Error - ', results, ' & Status - ', status);
  //             // observer.next({ lat: 0, lng: 0 });
  //           }
  //           observer.complete();
  //         });
  //       })
  //     })
  //   )
  // }
  objectMapping() {
    this.isInvalidGeoFenceCoordinates = false;
    this.PunchInOutText = 'Punch In';
    this.CalendarObject = this.JObject.CalendarObject != null ? this.JObject.CalendarObject.breakupObject : null;
    this._attendanceConfiguration = this.JObject.AttendanceConfiguration;

    console.log('atten config', this._attendanceConfiguration);
    // this.geocodeAddress();
    // this.commonService.getProducts();
    if (this._attendanceConfiguration.IsGeoFenceRequired) {
      this.commonService.getPosition().then(pos => {
        this.position = pos;
        var url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${this.position.lat}&lon=${this.position.lng}`;
        this.commonService.getGeoCoding(url).subscribe((data: any) => {
          console.log('Geo Coding :: ', data);
          this.completeGeoLocationAddress = data.display_name;
        });

        if (this._attendanceConfiguration.GeoFenceCoordinatesMapping == null) {
          this.isInvalidGeoFenceCoordinates = true;
        } else {
          // this._attendanceConfiguration.GeoFenceCoordinatesMapping.Locations = JSON.parse(this._attendanceConfiguration.GeoFenceCoordinatesMapping.Locations);

          if (!this._attendanceConfiguration.GeoFenceCoordinatesMapping.Locations.find(a => this.calcCrow(a.Coordinates.Latitude, a.Coordinates.Longitude, this.position.lat, this.position.lng) <= a.Radius)) {
            this.isInvalidGeoFenceCoordinates = true;
          } else {
          }
        }
        console.log(`Positon: ${pos.lng} ${pos.lat}`);
      }, err => {
        console.log('ERR ::', err.message);

        console.warn('USER NOT ALLOWED : LOCATION PERMISSION');
        this.alertService.showInfo('Note: For your security, we need permission to access the location to enter attendance. Without it, this application will not be in a position to discover.');
        if (err.message == 'User denied Geolocation') {
          this.activeModal.close('Modal Closed');
          return;
        }

      });
    }

    let formattedDate = moment(this.preferredDate).format('YYYY-MM-DD');
    var actualStartTime = this.CalendarObject != null && this.CalendarObject.hasOwnProperty('FirstCheckIn') == true ? this.CalendarObject != null ? moment(formattedDate + ' ' + this.CalendarObject.FirstCheckIn) : moment(formattedDate + ' ' + this.JObject.WorkShiftDefinition.StartTime) : moment(formattedDate + ' ' + this.JObject.WorkShiftDefinition.StartTime);
    var actualEndTime = this.CalendarObject != null && this.CalendarObject.hasOwnProperty('LastCheckedOut') == true ? this.CalendarObject != null ? moment(formattedDate + ' ' + this.CalendarObject.LastCheckedOut) : moment(formattedDate + ' ' + this.JObject.WorkShiftDefinition.EndTime) : moment(formattedDate + ' ' + this.JObject.WorkShiftDefinition.EndTime);
    this.TotalWorkingHours = 0;

    var _punchIn = moment(actualStartTime, 'HH:mm');
    var _punchOut = moment(actualEndTime, 'HH:mm');
    this.TotalWorkingHours = _punchOut.diff(_punchIn, 'hour');
    var totalMinutes = _punchOut.diff(_punchIn, 'minutes');
    this.TotalWorkingHours = Number(this.parseHours(totalMinutes));
    //if we are using timepicker, it should be helpfull us
    this.formatted_startTime = new Time();
    this.formatted_startTime.hour = actualStartTime.hour()
    this.formatted_startTime.minute = actualStartTime.minute()

    this.formatted_endTime = new Time();
    this.formatted_endTime.hour = actualEndTime.hour()
    this.formatted_endTime.minute = actualEndTime.minute();

    this.attendanceForm.patchValue({
      // starttime: (this.CalendarObject != null ? moment(actualStartTime).format('HH:mm:ss') : null),
      // endtime: this.CalendarObject != null ? moment(actualEndTime).format('HH:mm:ss') : null,
      remarks: this.CalendarObject != null ? this.CalendarObject.RequesterRemarks : '',
      Id: this.CalendarObject != null ? this.CalendarObject.Id : 0,
      attendancedate: this.preferredDate,
      starttime: null,
      endtime: null
    })

    if (this.isCheckCurrentDate) {
      this.attendanceForm.controls['remarks'].setValue(null);
    }
    console.log('ccalen', this.CalendarObject);

    // if (this.CalendarObject != null) {
    //   this.LstPunchInDetails.push({
    //     Id: this.CalendarObject.Id,
    //     AttendanceDate: this.CalendarObject.AttendanceDate,
    //     StartTime: this.CalendarObject.FirstCheckIn,
    //     EndTime: this.CalendarObject.LastCheckedOut,
    //     TotalHours: this.CalendarObject.TotalSubmittedHours.toFixed(2),
    //     ChildTableRow: 1,
    //     Iserror: false
    //   })

    // }
    if (this.CalendarObject != null) {
      this.TOTALHOURS = this.CalendarObject.hasOwnProperty('TotalSubmittedHours') == true ? this.CalendarObject.TotalSubmittedHours.toFixed(2) : 0;
    }
    if (this.CalendarObject != null && this.CalendarObject.hasOwnProperty('LstEmployeeAttendancePunchInDetails') == true && this.CalendarObject.LstEmployeeAttendancePunchInDetails != null && this.CalendarObject.LstEmployeeAttendancePunchInDetails.length > 0) {
      this.CalendarObject.LstEmployeeAttendancePunchInDetails.forEach(item => {
        this.LstPunchInDetails.push({
          Id: item.Id,
          AttendanceDate: item.Attendancedate,
          StartTime: item.Starttime,
          EndTime: item.FinishTime,
          TotalHours: item.SubmittedHours.toFixed(2),
          ChildTableRow: 2,
          Iserror: false,
          PunchInImageId: item.PunchInPhotoId,
          PunchOutImageId: item.PunchOutPhotoId,
          PunchInCoordinates: item.PunchInCoordinates,
          PunchOutCoordinates: item.PunchOutCoordinates,
          PunchInRemarks: item.PunchInRemarks,
          PunchOutRemarks: item.PunchOutRemarks,
        })
      });
    }

    this.LstPunchInDetails = this.LstPunchInDetails != null && this.LstPunchInDetails.length > 0 ? _.orderBy(this.LstPunchInDetails, ["ChildTableRow"], ["asc"]) : [];
    // if (this.LstPunchInDetails != null && this.LstPunchInDetails.length > 1) {
    //   let lastIndex = (this.LstPunchInDetails.length - 1);
    //   this.FCI = this.LstPunchInDetails[0].StartTime == null ? '--:--:--' :  this.LstPunchInDetails[0].StartTime;
    //   this.LCO = (this.LstPunchInDetails[lastIndex - 1].EndTime == null && this.LstPunchInDetails[lastIndex - 1].EndTime == undefined) ? '--:--:--' : this.LstPunchInDetails[lastIndex - 1].EndTime;
    // }

    if (this.LstPunchInDetails != null && this.LstPunchInDetails.length > 0) {
      let lastIndex = this.LstPunchInDetails.length - 1;
      let atlast = lastIndex == 0 ? 0 : (lastIndex - 1);

      this.FCI = this.LstPunchInDetails[0].StartTime == null ? '--:--:--' : this.LstPunchInDetails[0].StartTime;
      this.LCO = this.LstPunchInDetails[lastIndex].EndTime != null ? this.LstPunchInDetails[lastIndex].EndTime : this.LstPunchInDetails[atlast].EndTime

    }



    console.log('CalendarObject OBJ ::', this.JObject.CalendarObject);
    this.isMultiplePunchesAllowed = true;
    this.tobeHidden = false;
    // if (this._attendanceConfiguration.IsAllowToInputTimeForPunchOut || this._attendanceConfiguration.IsAllowEmployeeToInputWorkingHours) {
    //   this.isPunchOutTimeAllowEdit = false
    // }
    if (this.isCheckCurrentDate && this._attendanceConfiguration.IsAllowToInputTimeForPunchOut) {
      this.isPunchOutTimeAllowEdit = false
    }
    // if (this._attendanceConfiguration.IsAllowToInputTimeForPunchIn || this._attendanceConfiguration.IsAllowEmployeeToInputWorkingHours) {
    //   this.isPunchInTimeAllowEdit = false
    // }
    if (this.isCheckCurrentDate && this._attendanceConfiguration.IsAllowToInputTimeForPunchIn) {
      this.isPunchInTimeAllowEdit = false
    }
    if (this._attendanceConfiguration.IsAutoPunchOutEnabled && this._attendanceConfiguration.IsAllowToChangePunchOutIfAutoPunched) {
      this.isPunchOutTimeAllowEdit = false
    }

    if (!this.isCheckCurrentDate && this._attendanceConfiguration.IsAllowToEditInAndOutTimesForPastDays == true
    ) {

      this.isPunchInTimeAllowEdit = false;
      this.isPunchOutTimeAllowEdit = false;
    }


    this.actualWorkingHours += this.calculatedTotalHours(this.JObject.WorkShiftDefinition.StartTime, this.JObject.WorkShiftDefinition.EndTime);
    if (this.LstPunchInDetails != null && this.LstPunchInDetails.length > 0 && this.LstPunchInDetails.find(a => a.StartTime != null && (a.EndTime == null || a.EndTime == undefined))) {
      this.PunchInOutText = 'Punch Out';
    }
    else if (this.LstPunchInDetails != null && this.LstPunchInDetails.length > 0 && this.LstPunchInDetails.find(a => a.StartTime == null || a.StartTime == undefined)) {
      this.PunchInOutText = 'Punch In';
    }
    else {
      if (this.LstPunchInDetails != null && this.LstPunchInDetails.length > 0) {
        this.LstPunchInDetails.push({
          Id: UUID.UUID(),
          AttendanceDate: this.preferredDate,
          StartTime: null,
          EndTime: null,
          TotalHours: 0.00,
          ChildTableRow: 2,
          Iserror: false,
          PunchInImageId: 0,
          PunchOutImageId: 0,
          PunchInCoordinates: { "Altitude": 0.0, "Latitude": 0.0, "Longitude": 0.0, "Address": "" },
          PunchOutCoordinates: { "Altitude": 0.0, "Latitude": 0.0, "Longitude": 0.0, "Address": "" },
          PunchInRemarks: '',
          PunchOutRemarks: '',
        })
      } else if (this.LstPunchInDetails.length == 0) {
        this.LstPunchInDetails.push({
          Id: UUID.UUID(),
          AttendanceDate: this.preferredDate,
          StartTime: null,
          EndTime: null,
          TotalHours: 0.00,
          ChildTableRow: 2,
          Iserror: false,
          PunchInImageId: 0,
          PunchOutImageId: 0,
          PunchInCoordinates: { "Altitude": 0.0, "Latitude": 0.0, "Longitude": 0.0, "Address": "" },
          PunchOutCoordinates: { "Altitude": 0.0, "Latitude": 0.0, "Longitude": 0.0, "Address": "" },
          PunchInRemarks: '',
          PunchOutRemarks: '',
        })
      }
    }
    this.isrendering_spinner = false;

    console.log('PUNCH IN', this.LstPunchInDetails);

    this.LstPunchInDetails = this.LstPunchInDetails != null && this.LstPunchInDetails.length > 0 ? _.orderBy(this.LstPunchInDetails, ["ChildTableRow", "StartTime"], ["asc", "asc"]) : [];


  }

  getUserLocation() {
    navigator.geolocation.getCurrentPosition(function (position) {
      this.isLocationAccessed = true;
      console.log(
        "Latitude: " + position.coords.latitude +
        "Longitude: " + position.coords.longitude);


      // this.lat = position.coords.latitude;
      // this.lng = position.coords.longitude;
      // console.log(this.lat);
      // console.log(this.lat);
    }, function () {
      this.isLocationAccessed = false;
      console.warn('USER NOT ALLOWED : LOCATION PERMISSION');
      this.alertService.showInfo('Note: For your security, we need permission to access the location to enter attendance. Without it, this application will not be in a position to discover.');
      return;
    });

  }

  public parseHours = (n) => Math.round((n / 60) * 100) / 100;


  triggerImageCapture_modalPopup() {
    const promise = new Promise((res, rej) => {

      const modalRef = this.modalService.open(ImagecaptureModalComponent, this.modalOption);
      modalRef.componentInstance.objStorageJson = { EmployeeId: this.EmployeeObject.Id, CompanyId: this.JObject.CompanyId, ClientId: this.EmployeeObject.ClientId, ClientContractId: this.EmployeeObject.ClientContractId };
      modalRef.result.then((result) => {
        if (result != "Modal Closed") {
          res(result);
        }
        else {
          res(null);
        }
      }).catch((error) => {
        console.log(error);
      });
    })
    return promise;

  }



  toggleTimer(item, i) {
    this.PhotoId = 0;
    this.Coordinates = this._attendanceConfiguration.IsGeoFenceRequired && this.position != null ? JSON.stringify({ "Altitude": 0.0, "Latitude": this.position.lat, "Longitude": this.position.lng, "Address": this.completeGeoLocationAddress }) : JSON.stringify({ "Altitude": 0.0, "Latitude": 0.0, "Longitude": 0.0, "Address": "" });
    this.punchInSpinner = true;
    if (this.PunchInOutText === 'Punch In' && this._attendanceConfiguration.IsImageCaptureRequiredWhilePunchIn) {
      this.triggerImageCapture_modalPopup().then((result) => {
        if (result != null && result != 'Cannot read UserMedia from MediaDevices.' && result != 'Permission denied') {
          this.PunchInImageId = result;
          item.PunchInImageId = result;
          this.PhotoId = result;
          this.Coordinates = this._attendanceConfiguration.IsGeoFenceRequired && this.position != null ? JSON.stringify({ "Altitude": 0.0, "Latitude": this.position.lat, "Longitude": this.position.lng, "Address": this.completeGeoLocationAddress }) : JSON.stringify({ "Altitude": 0.0, "Latitude": 0.0, "Longitude": 0.0, "Address": "" });
          item.PunchInCoordinates = this._attendanceConfiguration.IsGeoFenceRequired && this.position != null ? JSON.stringify({ "Altitude": 0.0, "Latitude": this.position.lat, "Longitude": this.position.lng, "Address": this.completeGeoLocationAddress }) : JSON.stringify({ "Altitude": 0.0, "Latitude": 0.0, "Longitude": 0.0, "Address": "" });
          if (item.PunchInImageId == null || item.PunchInImageId == undefined || item.PunchInImageId == 0) {
            this.punchInSpinner = false;
            this.alertService.showInfo('Note: For your security, we need permission to access the camera to enter attendance. Without it, this application will not be in a position to discover.');
            return;
          }
          this.callbacktoggelTimer(item, i);
          return;
        } else if (result == 'Cannot read UserMedia from MediaDevices.') {
          this.PunchInImageId = 0;
          item.PunchInImageId = 0;
          this.PhotoId = 0;
          this.Coordinates = this._attendanceConfiguration.IsGeoFenceRequired && this.position != null ? JSON.stringify({ "Altitude": 0.0, "Latitude": this.position.lat, "Longitude": this.position.lng, "Address": this.completeGeoLocationAddress }) : JSON.stringify({ "Altitude": 0.0, "Latitude": 0.0, "Longitude": 0.0, "Address": "" });
          item.PunchInCoordinates = this._attendanceConfiguration.IsGeoFenceRequired && this.position != null ? JSON.stringify({ "Altitude": 0.0, "Latitude": this.position.lat, "Longitude": this.position.lng, "Address": this.completeGeoLocationAddress }) : JSON.stringify({ "Altitude": 0.0, "Latitude": 0.0, "Longitude": 0.0, "Address": "" });
          this.punchInSpinner = false;
          this.alertService.showInfo('Action required : For your security, we need permission to access the camera to enter attendance. Without it, this application will not be in a position to discover.');
          // this.callbacktoggelTimer(item, i);
          return;
          // this.alertService.showWarning("Action required : Please update your image.");
          // return;
        } else if (result == 'Permission denied') {
          this.punchInSpinner = false;
          this.alertService.showInfo('Action required : For your security, we need permission to access the camera to enter attendance. Without it, this application will not be in a position to discover.');
          return;
        } else {
          this.punchInSpinner = false;
          this.alertService.showInfo('Action required : For your security, we need permission to access the camera to enter attendance. Without it, this application will not be in a position to discover.');
          return;
        }
      });
    }
    else if (this.PunchInOutText === 'Punch Out' && this._attendanceConfiguration.IsImageCaptureRequiredWhilePunchOut) {
      this.triggerImageCapture_modalPopup().then((result) => {
        if (result)
          if (result != null && result != 'Cannot read UserMedia from MediaDevices.' && result != 'Permission denied') {
            this.PunchOutImageId = result;
            item.PunchOutImageId = result;
            this.PhotoId = result;
            this.Coordinates = this._attendanceConfiguration.IsGeoFenceRequired && this.position != null ? JSON.stringify({ "Altitude": 0.0, "Latitude": this.position.lat, "Longitude": this.position.lng, "Address": this.completeGeoLocationAddress }) : JSON.stringify({ "Altitude": 0.0, "Latitude": 0.0, "Longitude": 0.0, "Address": "" });;

            item.PunchOutCoordinates = this._attendanceConfiguration.IsGeoFenceRequired && this.position != null ? JSON.stringify({ "Altitude": 0.0, "Latitude": this.position.lat, "Longitude": this.position.lng, "Address": this.completeGeoLocationAddress }) : JSON.stringify({ "Altitude": 0.0, "Latitude": 0.0, "Longitude": 0.0, "Address": "" });;
            if (item.PunchOutImageId == null || item.PunchOutImageId == undefined || item.PunchOutImageId == 0) {
              this.punchInSpinner = false;
              this.alertService.showInfo('Note: For your security, we need permission to access the camera to enter attendance. Without it, this application will not be in a position to discover.');
              return;
            }
            this.callbacktoggelTimer(item, i);
            return;
          } else if (result == 'Cannot read UserMedia from MediaDevices.') {
            this.PunchOutImageId = 0;
            item.PunchOutImageId = 0;
            this.PhotoId = 0;
            this.Coordinates = this._attendanceConfiguration.IsGeoFenceRequired && this.position != null ? JSON.stringify({ "Altitude": 0.0, "Latitude": this.position.lat, "Longitude": this.position.lng, "Address": this.completeGeoLocationAddress }) : JSON.stringify({ "Altitude": 0.0, "Latitude": 0.0, "Longitude": 0.0, "Address": "" });;
            item.PunchOutCoordinates = this._attendanceConfiguration.IsGeoFenceRequired && this.position != null ? JSON.stringify({ "Altitude": 0.0, "Latitude": this.position.lat, "Longitude": this.position.lng, "Address": this.completeGeoLocationAddress }) : JSON.stringify({ "Altitude": 0.0, "Latitude": 0.0, "Longitude": 0.0, "Address": "" });;

            this.punchInSpinner = false;
            this.alertService.showInfo('Action required : For your security, we need permission to access the camera to enter attendance. Without it, this application will not be in a position to discover.');
            // this.callbacktoggelTimer(item, i);
            return;
            // this.alertService.showWarning("Action required : Please update your image.");
            // return;
          }
          else if (result == 'Permission denied') {
            this.punchInSpinner = false;
            this.alertService.showInfo('Action required : For your security, we need permission to access the camera to enter attendance. Without it, this application will not be in a position to discover.');
            return;
          }
          else {
            this.punchInSpinner = false;
            this.alertService.showInfo('Action required : For your security, we need permission to access the camera to enter attendance. Without it, this application will not be in a position to discover.');
            return;
          }
      });
    }
    else
      this.callbacktoggelTimer(item, i);


  }

  callbacktoggelTimer(item, indx) {

    item.Iserror = false;
    this.isInvalidTablePunchInOutTime = false;

    if (this.PunchInOutText == 'Punch In') {
      item.EndTime = null;
      // this.attendanceForm.controls['endtime'].setValue(null);
    }

    if (this.isInvalidPunchOutTime == true) {
      this.punchInSpinner = false;
      this.alertService.showWarning('Please specify that the time of entry/exit is not valid or that the time is not valid.');
      return;
    }


    if (this.LstPunchInDetails.length > 0) {

      for (let j = 0; j < this.LstPunchInDetails.length; j++) {
        const element = this.LstPunchInDetails[j];
        if (j < indx) {
          if (moment().format('HH:mm:ss') <= element.StarTime || moment().format('HH:mm:ss') <= element.EndTime) {
            item.Iserror = true;
            this.isInvalidTablePunchInOutTime = true;
            break;
          }
        }

      }

    }

    if (this.isInvalidTablePunchInOutTime == true) {
      this.punchInSpinner = false;
      this.alertService.showWarning('Please specify that the time of entry/exit is not valid or that the time is not valid range.');
      return;
    }


    this.PunchInOutText === 'Punch In' ? ((item.StartTime == null || item.StartTime != undefined) ? item.StartTime = (moment().format('HH:mm:ss')) : null) : ((item.EndTime == null || item.EndTime != undefined) ? item.EndTime = (moment().format('HH:mm:ss')) : null);
    (this.PunchInOutText === 'Punch In' && !this._attendanceConfiguration.IsAutoPunchOutEnabled) ? this.PunchInOutText = 'Punch Out' : this.PunchInOutText = 'Punch In';
    this.tobeHidden = this._attendanceConfiguration.IsAutoPunchOutEnabled == true ? true : false;

    console.log('item', item);;

    var totalHrs: number = 0;
    if (item.EndTime != null && item.EndTime != undefined) {

      let AttendanceStartDateTime: Date = new Date();
      let AttendanceEndDateTime: Date = new Date();
      this.isMultiplePunchesAllowed = this._attendanceConfiguration.IsAllowMultiplePunches == true ? false : true;
      var patternedDate = moment(AttendanceStartDateTime).format('YYYY/MM/DD');
      var i = new Date(`${patternedDate} ` + item.StartTime);
      var j = new Date(`${patternedDate} ` + item.EndTime);
      console.log('i', i);
      console.log('j', j);
      var fromhrs = moment(i, 'HH:mm');
      var tillhrs = moment(j, 'HH:mm');
      totalHrs = tillhrs.diff(fromhrs, 'hour');
      var totalMinutes = tillhrs.diff(fromhrs, 'minutes');
      totalHrs = Number(this.parseHours(totalMinutes));
      console.log('vv', totalHrs);
      if (this.TotalWorkingHours < totalHrs) {
        // alert('day is completed');
      } else {
        // alert('not complete your day');
      }

      var inputJSON = {
        "created_date": `${patternedDate} ` + item.StartTime,
        "current_time": `${patternedDate} ` + item.EndTime
      };

      console.log('inputJSON', inputJSON);

      var diff = this.getDataDiff(new Date(inputJSON.created_date.replace(/-/g, "/")), new Date(inputJSON.current_time.replace(/-/g, "/")));
      console.log(diff);
      totalHrs = diff.minute;

      if (totalHrs == 0) {
        this.PunchInOutText = 'Punch Out';
        item.EndTime = null;
        this.punchInSpinner = false;
        this.alertService.showInfo("There exists a total invalid number of hours of work. Please provide a minimum of hours and then proceed");
        return;
      }

    }

    if (Number.isNaN(totalHrs)) {
      totalHrs = 0
    }
    // only the alert should be shown on is multiple punches off . please mention here like, 
    if (!this._attendanceConfiguration.IsAllowMultiplePunches && item.EndTime != null && this.actualWorkingHours >= totalHrs) {
      this.alertService.confirmSwal1("Confirmation!", `The overall number of hours is less than the actual number of hours worked.`, "Yes, Continue", "No, Cancel").then((result) => {
        try {
          this.triggerApiCall(totalHrs, item);
          // item.StartTime = null;
          // item.EndTime = null;
        } catch (error) {
          this.punchInSpinner = false;
        }
      }).catch(error => {
        this.PunchInOutText = 'Punch Out'
        // item.EndTime = null;
        this.punchInSpinner = false;
      });
    } else {
      this.triggerApiCall(totalHrs, item);
      // item.EndTime = null;

    }



    console.log('actual hrs ::', this.actualWorkingHours);
    console.log('TotalTimes hrs ::', totalHrs);



  }


  getDataDiff(startDate, endDate) {
    console.log('startDate', startDate);
    console.log('endDate', endDate);

    var diff = endDate.getTime() - startDate.getTime();
    var days = Math.floor(diff / (60 * 60 * 24 * 1000));
    var hours = Math.floor(diff / (60 * 60 * 1000)) - (days * 24);
    var minutes = Math.floor(diff / (60 * 1000)) - ((days * 24 * 60) + (hours * 60));
    var seconds = Math.floor(diff / 1000) - ((days * 24 * 60 * 60) + (hours * 60 * 60) + (minutes * 60));
    return { day: days, hour: hours, minute: minutes, second: seconds };
  }

  triggerApiCall(totalHrs, item) {


    if (this.LstPunchInDetails != null && this.LstPunchInDetails.length > 0) {
      let isExists = this.LstPunchInDetails.find(a => a.Id == item.Id);
      if (isExists != undefined && isExists != null) {
        isExists.StartTime = item.StartTime;
        isExists.EndTime = item.EndTime;
        isExists.TotalHours = totalHrs // this.calculatedTotalHours(item.StartTime, item.EndTime);  //totalHrs.toFixed(2);

      }
      // let Index = this.LstPunchInDetails.length - 1;
      // let existingValue = this.LstPunchInDetails[Index];
      // if (existingValue.EndTime == null) {
      //   existingValue.EndTime = item.EndTime;
      //   existingValue.TotalHours = totalHrs.toFixed(2);

      // }
      // else {
      //   this.LstPunchInDetails.push({
      //     Id: UUID.UUID(),
      //     AttendanceDate: new Date(this.preferredDate),
      //     StartTime: item.StartTime,
      //     EndTime: item.EndTime,
      //     TotalHours: totalHrs.toFixed(2),
      //     ChildTableRow: 2,
      //     Iserror: false
      //   })
      // }
    } else {
      // let isExists = this.LstPunchInDetails.find(a => a.Id == item.Id);
      // if (isExists != undefined && isExists != null) {
      //   isExists.StartTime = item.StartTime;
      //   isExists.EndTime = item.EndTime;
      //   isExists.TotalHours = totalHrs.toFixed(2);

      // }
      // this.LstPunchInDetails.push({
      //   Id: UUID.UUID(),
      //   AttendanceDate: new Date(this.attendanceForm.get('attendancedate').value),
      //   StartTime: this.attendanceForm.get('starttime').value,
      //   EndTime: this.attendanceForm.get('endtime').value,
      //   TotalHours: totalHrs.toFixed(2),
      //   ChildTableRow: 1,
      //   Iserror: false
      // })
    }

    // if(this.LstPunchInDetails[0].StartTime != null && this.LstPunchInDetails[0].EndTime != null){
    //   this.LstPunchInDetails.push({
    //     Id: UUID.UUID(),
    //     AttendanceDate: new Date(this.preferredDate),
    //     StartTime: item.StartTime,
    //     EndTime: item.EndTime,
    //     TotalHours: totalHrs.toFixed(2),
    //     ChildTableRow: 2,
    //     Iserror: false
    //   })
    // }

    console.log('ddd', this.LstPunchInDetails);

    // this.punchInSpinner = false;
    // return;
    var TotalTimes: number = 0;
    // if (this._attendanceConfiguration.IsAllowMultiplePunches && this._attendanceConfiguration.IsTimeCalculationRequiredBaseOnMultiplePunches) {
    //   this.LstPunchInDetails != null && this.LstPunchInDetails.length > 0 && this.LstPunchInDetails.forEach(element => {
    //     TotalTimes += this.calculatedTotalHours(element.StartTime, element.EndTime);
    //   });
    // } else {
    //   if (this.LstPunchInDetails != null && this.LstPunchInDetails.length > 0) {
    //     let lastIndex = this.LstPunchInDetails.length - 1;
    //     let atlastitem = lastIndex == 0 ? 0 : (lastIndex - 1)
    //     TotalTimes += this.calculatedTotalHours(this.LstPunchInDetails[0].StartTime, this.LstPunchInDetails[lastIndex].EndTime != null ? this.LstPunchInDetails[lastIndex].EndTime : this.LstPunchInDetails[atlastitem].EndTime);
    //   }
    // }

    // TotalTimes += this.calculatedTotalHours(this.LstPunchInDetails[0].StartTime, this.LstPunchInDetails[0].EndTime != null ? this.LstPunchInDetails[0].EndTime : this.LstPunchInDetails[0].EndTime);

    var TotalMinutes: number = 0;
    if (this.LstPunchInDetails != null && this.LstPunchInDetails.length > 0) {
      this.LstPunchInDetails.forEach(ee => {
        // TotalMinutes += this.convertH2M(ee.TotalHours);
        ee.TotalHours = Number(ee.TotalHours);

        if ((ee.TotalHours - Math.floor(ee.TotalHours)) !== 0) {
          TotalMinutes += this.convertH2M(ee.TotalHours);
        }
        else {
          TotalMinutes += this.convertH2M(ee.TotalHours.toFixed(2));

        }

      });

    }
    TotalTimes = Number(this.parseHours(TotalMinutes));
    if (Number.isNaN(TotalTimes)) {
      TotalTimes = 0
    }

    var empAttendancePunchInDetails = [];
    if (this.LstPunchInDetails != null && this.LstPunchInDetails.length > 0) {
      for (let i = 0; i < this.LstPunchInDetails.length; i++) {
        const ele = this.LstPunchInDetails[i];
        if (ele.TotalHours != 0) {

          if ((ele.TotalHours - Math.floor(ele.TotalHours)) !== 0) {
          }
          else {
            ele.TotalHours = ele.TotalHours.toFixed(2) as any;
          }

          var timeParts = String(ele.TotalHours).split(".");
          if (timeParts[1].length == 1) {

            // Too many numbers after decimal.
            timeParts[1] = '0' + timeParts[1];
          }
          var converted = (timeParts[0]) + '.' + (timeParts[1]);

          ele.TotalHours = Number(converted);
        }

        // console.log('ele.PunchInCoordinates',ele.PunchInCoordinates);
        // console.log('ele.PunchInCoordinates s',ele.PunchOutCoordinates);


        // if (ele.ChildTableRow == 2) {
        //   console.log('ee', ele);
        var employeeAttendancePunchInDetails = new EmployeeAttendancePunchInDetails();
        employeeAttendancePunchInDetails.Id = this.commonService.isGuid(ele.Id) == true ? 0 : ele.Id;
        employeeAttendancePunchInDetails.EmployeeId = this.EmployeeObject.Id;
        employeeAttendancePunchInDetails.EmployeeAttendanceBreakUpDetailsId = this.CalendarObject != null ? this.attendanceForm.get('Id').value : 0;
        employeeAttendancePunchInDetails.Attendancedate = moment(new Date(this.preferredDate)).format('YYYY-MM-DD');
        employeeAttendancePunchInDetails.Starttime = ele.StartTime;
        employeeAttendancePunchInDetails.FinishTime = ele.EndTime;
        employeeAttendancePunchInDetails.SubmittedHours = ele.TotalHours;
        employeeAttendancePunchInDetails.ApprovedHours = 0;
        employeeAttendancePunchInDetails.RequesterRemarks = this.attendanceForm.get('remarks').value;
        employeeAttendancePunchInDetails.ApproverRemarks = '';
        employeeAttendancePunchInDetails.Status = 1;
        employeeAttendancePunchInDetails.PunchInRemarks = ele.PunchInRemarks;
        employeeAttendancePunchInDetails.PunchOutRemarks = ele.PunchOutRemarks;
        employeeAttendancePunchInDetails.PunchInPhotoId = ele.PunchInImageId  // this._attendanceConfiguration.IsImageCaptureRequiredWhilePunchIn ? ele.PunchInImageId : 0;
        employeeAttendancePunchInDetails.PunchOutPhotoId = ele.PunchOutImageId // this._attendanceConfiguration.IsImageCaptureRequiredWhilePunchOut ? ele.PunchOutImageId : 0;
        employeeAttendancePunchInDetails.PunchInCoordinates = ele.PunchInCoordinates // this._attendanceConfiguration.IsGeoFenceRequired ? ele.PunchInCoordinates != null ? JSON.parse(ele.PunchInCoordinates) : null : null;
        employeeAttendancePunchInDetails.PunchOutCoordinates = ele.PunchOutCoordinates  //this._attendanceConfiguration.IsGeoFenceRequired ? ele.PunchOutCoordinates != null ? JSON.parse(ele.PunchOutCoordinates) : null : null; // ele.PunchOutCoordinates;
        empAttendancePunchInDetails.push(employeeAttendancePunchInDetails);
        // }
      }
    }



    if (this.LstPunchInDetails != null && this.LstPunchInDetails.length > 0) {
      // let lastIndex = this.LstPunchInDetails.length - 1;
      var empAttendanceBreakupList = [];
      // let _st = this.LstPunchInDetails.find(a => a.ChildTableRow == 1).StartTime;
      // let _et = this.LstPunchInDetails.find(a => a.ChildTableRow == 1).EndTime;


      let lastIndex1 = this.LstPunchInDetails.length - 1;
      let atlastitem = lastIndex1 == 0 ? 0 : (lastIndex1 - 1);
      let _st1 = this.LstPunchInDetails[0].StartTime;
      let _et1 = this.LstPunchInDetails[lastIndex1].EndTime != null ? this.LstPunchInDetails[lastIndex1].EndTime : this.LstPunchInDetails[atlastitem].EndTime;

      if (TotalTimes != 0) {

        if ((TotalTimes - Math.floor(TotalTimes)) !== 0) {
        }
        else {
          TotalTimes = TotalTimes.toFixed(2) as any;
        }

        var timeParts = String(TotalTimes).split(".");
        if (timeParts[1].length == 1) {
          // Too many numbers after decimal.
          timeParts[1] = '0' + timeParts[1];
        }
        var converted = (timeParts[0]) + '.' + (timeParts[1]);

        TotalTimes = Number(converted);
      }

      console.log('bbbb', this.attendanceForm.value);


      var employeeAttendanceBreakUpDetails = new EmployeeAttendanceBreakUpDetails();
      employeeAttendanceBreakUpDetails.Id = this.CalendarObject != null ? this.attendanceForm.get('Id').value : 0; // need to change
      employeeAttendanceBreakUpDetails.RequesterRemarks = this.attendanceForm.get('remarks').value;
      employeeAttendanceBreakUpDetails.Status = AttendanceBreakUpDetailsStatus.EmployeeSaved // need to change
      employeeAttendanceBreakUpDetails.PayableDay = this.actualWorkingHours >= TotalTimes ? 0 : 1;
      employeeAttendanceBreakUpDetails.AttendanceType = AttendanceType.Present;
      employeeAttendanceBreakUpDetails.AttendanceCode = this.LstattendanceType.find(a => a.name == 'Present').name;
      employeeAttendanceBreakUpDetails.IsFullDayPresent = this.actualWorkingHours >= TotalTimes ? false : true;
      employeeAttendanceBreakUpDetails.TotalApprovedHours = 0;
      // employeeAttendanceBreakUpDetails.TotalSubmittedHours = TotalTimes;
      // employeeAttendanceBreakUpDetails.LastCheckedOut = _et == null || _et == undefined ? null : _et;
      // employeeAttendanceBreakUpDetails.FirstCheckIn = _st == null ? null : _st;

      employeeAttendanceBreakUpDetails.TotalSubmittedHours = TotalTimes;
      employeeAttendanceBreakUpDetails.LastCheckedOut = _et1 == null || _et1 == undefined ? null : _et1;
      employeeAttendanceBreakUpDetails.FirstCheckIn = _st1 == null ? null : _st1;
      employeeAttendanceBreakUpDetails.AttendanceBreakUpDetailsType = AttendanceBreakUpDetailsType.FullDayPresent;
      employeeAttendanceBreakUpDetails.AttendanceDate = moment(new Date(this.preferredDate)).format('YYYY-MM-DD');
      employeeAttendanceBreakUpDetails.YADId = 0;
      employeeAttendanceBreakUpDetails.AttendancePeriodId = this.JObject.AttendancePeriod.Id;
      employeeAttendanceBreakUpDetails.AttendanceCycleId = this.JObject.AttendancePeriod.AttendanceCycleId;
      employeeAttendanceBreakUpDetails.EADetailsId = 0; // need to change
      employeeAttendanceBreakUpDetails.PISId = '0';
      employeeAttendanceBreakUpDetails.EmployeeId = this.EmployeeObject.Id;
      employeeAttendanceBreakUpDetails.ApproverRemarks = '';
      employeeAttendanceBreakUpDetails.LstEmployeeAttendancePunchInDetails = empAttendancePunchInDetails;
      empAttendanceBreakupList.push(employeeAttendanceBreakUpDetails);
      console.log('EMPLOYEE BREAKUP DETAILS ::', empAttendanceBreakupList);

      if (this.isCheckCurrentDate) {

        var punchAttendanceModel = new PunchAttendanceModel();
        punchAttendanceModel.EmployeeId = this.EmployeeObject.Id;
        punchAttendanceModel.PhotoId = this.PhotoId;
        punchAttendanceModel.Coordinates = this._attendanceConfiguration.IsGeoFenceRequired ? JSON.parse(this.Coordinates) : null;
        punchAttendanceModel.Remarks = this.attendanceForm.get('remarks').value;
        console.log('punchAttendanceModel', punchAttendanceModel);

        this.attendanceService.PunchAttendance(JSON.stringify(punchAttendanceModel))
          .subscribe((result) => {
            console.log(result);
            let apiresult: apiResult = result;
            if (apiresult.Status) {
              this.punchInSpinner = false;

              this.activeModal.close('Modal Closed');
              // this.onRefreshModal(); // lastly commented code , can be used want to stay back the same page
              // this.alertService.showSuccess(apiresult.Message);
              // this.activeModal.close('Success');
            }
            else {
              this.activeModal.close('Modal Closed');
              this.punchInSpinner = false; this.alertService.showWarning(apiresult.Message);
            }

          })

      } else {



        // this.punchInSpinner = false;
        // return;
        // this.punchInSpinner = false;
        // return;
        this.attendanceService.UpsertEmployeeAttendanceBreakUpDetails(JSON.stringify(empAttendanceBreakupList))
          .subscribe((result) => {
            console.log(result);
            let apiresult: apiResult = result;
            if (apiresult.Status) {
              this.punchInSpinner = false;
              let lastindex = this.LstPunchInDetails.length - 1;
              if (this.LstPunchInDetails[lastindex].StartTime != null && this.LstPunchInDetails[lastindex].StartTime != undefined && this.LstPunchInDetails[lastindex].EndTime != null && this.LstPunchInDetails[lastindex].EndTime != undefined) {

                this.LstPunchInDetails = [];
                this.LstPunchInDetails.push({
                  Id: UUID.UUID(),
                  AttendanceDate: new Date(this.preferredDate),
                  StartTime: null,
                  EndTime: null,
                  TotalHours: 0.00,
                  ChildTableRow: 2,
                  Iserror: false
                })
              } else {
                this.LstPunchInDetails = [];
              }
              this.activeModal.close('Modal Closed');
              // this.onRefreshModal(); // lastly commented code , can be used want to stay back the same page
              // this.alertService.showSuccess(apiresult.Message);
              // this.activeModal.close('Success');
            }
            else {
              this.activeModal.close('Modal Closed');
              this.punchInSpinner = false; this.alertService.showWarning(apiresult.Message);
            }

          })
      }
    }
  }
  onChangePunchOutTime_form(event) {

    this.isInvalidPunchOutTime = false;
    var calculatedHours = this.attendanceForm.get('starttime').value != null ? this.calculatedTotalHours(this.attendanceForm.get('starttime').value, event.target.value) : 0;
    if (Math.sign(calculatedHours) == -1) {
      this.isInvalidPunchOutTime = true;
    }
  }
  OnChangePunchInTime(event, item, i) {
    item.Iserror = false;
    this.isInvalidTablePunchInOutTime = false;
    let formattedDate = moment(this.preferredDate).format('YYYY-MM-DD');
    var actualStartTime = moment(formattedDate + ' ' + event.target.value);
    var actualEndTime = item.EndTime != null ? moment(formattedDate + ' ' + item.EndTime) : null;
    /**
     * This code block checks if a shift spans across multiple days, such as night shifts 
     * that start in one day and end in the next.
     * If the shift does span across multiple days, this code adds the next day to the end time,
     *  which leads to improved calculation accuracy.
    */
    if (this.isShiftSpanAcrossDays && (actualEndTime && actualEndTime.isBefore(actualStartTime))) {
      actualEndTime = actualEndTime.add(1, 'd');
    }
    var fromhrs = moment(actualStartTime, 'HH:mm');
    var tillhrs = moment(actualEndTime, 'HH:mm');
    var totalHrs = tillhrs.diff(fromhrs, 'hour');
    var totalMinutes = tillhrs.diff(fromhrs, 'minutes');
    totalHrs = Number(this.parseHours(totalMinutes));
    console.log('to', totalHrs);

    if (Math.sign(totalHrs) == -1) {
      item.Iserror = true;
      this.isInvalidTablePunchInOutTime = true;
    }
    if (Number.isNaN(totalHrs)) {
      // item.Iserror = true;
      // this.isInvalidTablePunchInOutTime = true;
      totalHrs = 0
    }

    item.TotalHours = totalHrs;
    if (this.LstPunchInDetails.length > 1) {
      // var prevEndTime =  this.LstPunchInDetails[i -1].EndTime;
      // if(item.StartTime < prevEndTime){
      //   item.Iserror = true;
      //   this.isInvalidTablePunchInOutTime = true;
      // }

      for (let j = 0; j < this.LstPunchInDetails.length; j++) {
        const element = this.LstPunchInDetails[j];
        if (j < i) {
          if (item.StartTime <= element.StarTime || item.StartTime <= element.EndTime) {
            item.Iserror = true;
            this.isInvalidTablePunchInOutTime = true;
            break;
          }
        }

      }

    }

  }
  OnChangePunchOutTime(event, item, i) {
    item.Iserror = false;
    this.isInvalidTablePunchInOutTime = false;
    let formattedDate = moment(this.preferredDate).format('YYYY-MM-DD');
    var actualStartTime = item.StartTime != null ? moment(formattedDate + ' ' + item.StartTime) : null;
    var actualEndTime = moment(formattedDate + ' ' + event.target.value);
    /**
     * This code block checks if a shift spans across multiple days, such as night shifts 
     * that start in one day and end in the next.
     * If the shift does span across multiple days, this code adds the next day to the end time,
     *  which leads to improved calculation accuracy.
    */
    if (actualEndTime.isBefore(actualStartTime) && this.isShiftSpanAcrossDays) {
      actualEndTime.add(1, 'd');
    }
    var fromhrs = moment(actualStartTime, 'HH:mm');
    var tillhrs = moment(actualEndTime, 'HH:mm');
    var totalHrs = tillhrs.diff(fromhrs, 'hour');
    var totalMinutes = tillhrs.diff(fromhrs, 'minutes');
    console.log('totalMinutes', totalMinutes);

    totalHrs = Number(this.parseHours(totalMinutes));
    console.log('totalHrs', totalHrs);

    if (Math.sign(totalHrs) == -1) {
      item.Iserror = true;
      this.isInvalidTablePunchInOutTime = true;
    }
    if (Number.isNaN(totalHrs)) {
      item.Iserror = true;
      this.isInvalidTablePunchInOutTime = true;
      totalHrs = 0
    }

    item.TotalHours = totalHrs;
    console.log(' item.TotalHours', item.TotalHours);

    if (this.LstPunchInDetails.length > 1) {
      // var prevEndTime =  this.LstPunchInDetails[i -1].EndTime;
      // if(item.StartTime < prevEndTime){
      //   item.Iserror = true;
      //   this.isInvalidTablePunchInOutTime = true;
      // }

      for (let j = 0; j < this.LstPunchInDetails.length; j++) {
        const element = this.LstPunchInDetails[j];
        if (j < i) {
          if (item.StartTime <= element.StarTime || item.StartTime <= element.EndTime) {
            item.Iserror = true;
            this.isInvalidTablePunchInOutTime = true;
            break;
          }
        }

      }

    }


  }

  // checkInvalidTimeline(i){
  //   // this.LstPunchInDetails.forEach(element => {

  //   // });
  //   if(this.LstPunchInDetails.length > 1){

  //   var validatingItems = [];
  //   validatingItems = this.LstPunchInDetails.slice(0, i)  
  //     var prevEndTime =  this.LstPunchInDetails[i -1].EndTime;
  //     if(item.StartTime < prevEndTime){
  //       item.Iserror = true;
  //       this.isInvalidTablePunchInOutTime = true;
  //     }

  //   }
  // }

  punchintimeCalculate() {

  }

  calculatedTotalHours(punchInTime, punchOutTime) {
    var totalHrs = 0;
    var currentAttendanceDate: Date = new Date(this.preferredDate);
    var patternedDate = moment(currentAttendanceDate).format('YYYY-MM-DD');
    var i = new Date(`${patternedDate} ` + punchInTime);
    var j = new Date(`${patternedDate} ` + punchOutTime);
    if (j != null && i != null) {
      var fromhrs = moment(i, 'HH:mm');
      var tillhrs = moment(j, 'HH:mm');
      totalHrs = tillhrs.diff(fromhrs, 'hour');
      var totalMinutes = tillhrs.diff(fromhrs, 'minutes');
      totalHrs = Number(this.parseHours(totalMinutes));
    }
    return totalHrs;
  }


  convertH2M(timeInHour) {
    console.log('timeInHour', timeInHour);

    if (timeInHour != null && timeInHour != 0) {
      // timeInHour = Number(timeInHour).toFixed(2);
      var timeParts = String(timeInHour).split(".");

      if (timeParts[1].length == 1) {
        // Too many numbers after decimal.
        timeParts[1] = `0${timeParts[1]}`;
      }

      // return Number(timeParts[0]) * 60 + Number(timeParts[1]);
      return (Number(timeInHour) * 60);
    } else {
      return 0;
    }

  }


  savebutton() {
    var tempPunchInOutDetetails = [];
    tempPunchInOutDetetails = this.LstPunchInDetails;
    console.log('REACTIVE FORM ::', this.attendanceForm.value);

    tempPunchInOutDetetails = this.LstPunchInDetails.filter(a => a.StartTime != null);
    console.log('OUNCH', tempPunchInOutDetetails)

    if (tempPunchInOutDetetails == null || tempPunchInOutDetetails.length == 0) {
      this.alertService.showInfo("Please provide a minimum of record and then proceed");
      return;
    }


    if (this._attendanceConfiguration.IsAllowMultiplePunches && this.attendanceForm.get('starttime').value != null && this.attendanceForm.get('endtime').value != null && (this.attendanceForm.get('remarks').value == null || this.attendanceForm.get('remarks').value == undefined || this.attendanceForm.get('remarks').value == '')) {
      this.alertService.showWarning('Please enter the comments and attempt again.');
      return;
    }

    if (tempPunchInOutDetetails != null && tempPunchInOutDetetails.length > 0 && tempPunchInOutDetetails.filter(a => a.EndTime != null && Number(a.TotalHours) == 0).length > 0) {
      this.alertService.showInfo("There exists a total invalid number of hours of work. Please provide a minimum of hours and then proceed");
      return;
    }

    if (tempPunchInOutDetetails != null && tempPunchInOutDetetails.length > 0 && tempPunchInOutDetetails.filter(a => a.StartTime == null).length > 0) {
      this.alertService.showInfo("No entry found in this list. Please specify that time of in/out and try again.");
      return;
    }

    if (this.isInvalidTablePunchInOutTime == true) {
      this.punchInSpinner = false;
      this.alertService.showWarning('Please specify that the time of entry/exit is not valid or that the time is not valid range.');
      return;
    }

    // if (this._attendanceConfiguration.IsImageCaptureRequiredWhilePunchIn) {
    //   this.triggerImageCapture_modalPopup().then((result) => {
    //     if (result != null) {
    //       this.PunchInImageId = result;
    //       console.log('test',result);

    //       // this.callbacktoggelTimer(item, i);
    //       return;
    //     } else {
    //       this.alertService.showWarning("Action required : Please update your image.");
    //       return;
    //     }
    //   });
    // }

    // return;

    this.loadingScreenService.startLoading();

    var TotalTimes: number = 0;
    // if (this._attendanceConfiguration.IsAllowMultiplePunches && this._attendanceConfiguration.IsTimeCalculationRequiredBaseOnMultiplePunches) {
    //   tempPunchInOutDetetails != null && tempPunchInOutDetetails.length > 0 && tempPunchInOutDetetails.forEach(element => {
    //     TotalTimes += this.calculatedTotalHours(element.StartTime, element.EndTime);
    //   });
    // } else {
    //   if (tempPunchInOutDetetails != null && tempPunchInOutDetetails.length > 0) {
    //     let lastIndex = tempPunchInOutDetetails.length - 1;
    //     // TotalTimes += this.calculatedTotalHours(tempPunchInOutDetetails[0].StartTime, tempPunchInOutDetetails[lastIndex].EndTime);
    //     let atlastitem = lastIndex == 0 ? 0 : (lastIndex - 1)
    //     TotalTimes += this.calculatedTotalHours(this.LstPunchInDetails[0].StartTime, this.LstPunchInDetails[lastIndex].EndTime != null ? this.LstPunchInDetails[lastIndex].EndTime : this.LstPunchInDetails[atlastitem].EndTime);

    //   }
    // }
    var TotalMinutes: number = 0;
    if (tempPunchInOutDetetails != null && tempPunchInOutDetetails.length > 0) {
      tempPunchInOutDetetails.forEach(ee => {
        ee.TotalHours = Number(ee.TotalHours);
        if ((ee.TotalHours - Math.floor(ee.TotalHours)) !== 0) {
          console.log(ee.TotalHours);

          TotalMinutes += this.convertH2M(ee.TotalHours);
        }
        else {
          console.log(ee.TotalHours);
          TotalMinutes += this.convertH2M(ee.TotalHours.toFixed(2));
        }
      });

    }
    console.log('test', TotalMinutes)
    TotalTimes = Number(this.parseHours(TotalMinutes))
    console.log('test 1', TotalTimes)

    if (Number.isNaN(TotalTimes)) {
      TotalTimes = 0
    }
    var empAttendancePunchInDetails = [];
    if (tempPunchInOutDetetails != null && tempPunchInOutDetetails.length > 0) {
      for (let i = 0; i < tempPunchInOutDetetails.length; i++) {
        const ele = tempPunchInOutDetetails[i];


        if (ele.TotalHours != 0) {
          if ((ele.TotalHours - Math.floor(ele.TotalHours)) !== 0) {

          }
          else {
            ele.TotalHours = ele.TotalHours.toFixed(2);
          }

          var timeParts = String(ele.TotalHours).split(".");
          if (timeParts[1].length == 1) {

            // Too many numbers after decimal.
            timeParts[1] = '0' + timeParts[1];
          }
          var converted = (timeParts[0]) + '.' + (timeParts[1]);

          ele.TotalHours = Number(converted);
        }

        // if (i > 0 && ele.StartTime != null) {
        var employeeAttendancePunchInDetails = new EmployeeAttendancePunchInDetails();
        employeeAttendancePunchInDetails.Id = this.commonService.isGuid(ele.Id) == true ? 0 : ele.Id;
        employeeAttendancePunchInDetails.EmployeeId = this.EmployeeObject.Id;
        employeeAttendancePunchInDetails.EmployeeAttendanceBreakUpDetailsId = this.CalendarObject != null ? this.attendanceForm.get('Id').value : 0;
        employeeAttendancePunchInDetails.Attendancedate = moment(new Date(this.preferredDate)).format('YYYY-MM-DD');
        employeeAttendancePunchInDetails.Starttime = ele.StartTime;
        employeeAttendancePunchInDetails.FinishTime = ele.EndTime == null ? null : ele.EndTime;
        employeeAttendancePunchInDetails.SubmittedHours = ele.TotalHours;
        employeeAttendancePunchInDetails.ApprovedHours = 0;
        employeeAttendancePunchInDetails.RequesterRemarks = this.attendanceForm.get('remarks').value;
        employeeAttendancePunchInDetails.ApproverRemarks = '';
        employeeAttendancePunchInDetails.Status = 1;

        empAttendancePunchInDetails.push(employeeAttendancePunchInDetails);
        // }
      }
    }

    if (tempPunchInOutDetetails != null && tempPunchInOutDetetails.length > 0) {
      // let lastIndex = tempPunchInOutDetetails.length - 1;
      var empAttendanceBreakupList = [];
      // let _st = this.LstPunchInDetails.find(a => a.ChildTableRow == 1).StartTime;
      // let _et = this.LstPunchInDetails.find(a => a.ChildTableRow == 1).EndTime;

      let lastIndex1 = tempPunchInOutDetetails.length - 1;
      let atlastitem = lastIndex1 == 0 ? 0 : (lastIndex1 - 1)


      let _st1 = tempPunchInOutDetetails[0].StartTime;
      let _et1 = tempPunchInOutDetetails[lastIndex1].EndTime != null ? tempPunchInOutDetetails[lastIndex1].EndTime : tempPunchInOutDetetails[atlastitem].EndTime

      if (TotalTimes != 0) {
        if ((TotalTimes - Math.floor(TotalTimes)) !== 0) {

        }
        else {
          TotalTimes = TotalTimes.toFixed(2) as any;
        }
        var timeParts = String(TotalTimes).split(".");
        if (timeParts[1].length == 1) {
          // Too many numbers after decimal.
          timeParts[1] = '0' + timeParts[1];
        }
        var converted = (timeParts[0]) + '.' + (timeParts[1]);

        TotalTimes = Number(converted);
      }

      var employeeAttendanceBreakUpDetails = new EmployeeAttendanceBreakUpDetails();
      employeeAttendanceBreakUpDetails.Id = this.CalendarObject != null ? this.attendanceForm.get('Id').value : 0; // need to change
      employeeAttendanceBreakUpDetails.RequesterRemarks = this.attendanceForm.get('remarks').value;
      employeeAttendanceBreakUpDetails.Status = AttendanceBreakUpDetailsStatus.EmployeeSaved // need to change
      employeeAttendanceBreakUpDetails.PayableDay = this.actualWorkingHours >= TotalTimes ? 0 : 1;
      employeeAttendanceBreakUpDetails.AttendanceType = AttendanceType.Present;
      employeeAttendanceBreakUpDetails.AttendanceCode = this.LstattendanceType.find(a => a.name == 'Present').name;
      employeeAttendanceBreakUpDetails.IsFullDayPresent = this.actualWorkingHours >= TotalTimes ? false : true;
      employeeAttendanceBreakUpDetails.TotalApprovedHours = 0;
      employeeAttendanceBreakUpDetails.TotalSubmittedHours = TotalTimes;
      // employeeAttendanceBreakUpDetails.LastCheckedOut = tempPunchInOutDetetails[lastIndex].EndTime == null ? null : tempPunchInOutDetetails[lastIndex].EndTime;
      // employeeAttendanceBreakUpDetails.FirstCheckIn = tempPunchInOutDetetails[0].StartTime == null ? null : tempPunchInOutDetetails[0].StartTime;
      // employeeAttendanceBreakUpDetails.LastCheckedOut = _et == null || _et == undefined ? null : _et;
      // employeeAttendanceBreakUpDetails.FirstCheckIn = _st == null ? null : _st;
      employeeAttendanceBreakUpDetails.LastCheckedOut = _et1 == null || _et1 == undefined ? null : _et1;
      employeeAttendanceBreakUpDetails.FirstCheckIn = _st1 == null ? null : _st1;
      employeeAttendanceBreakUpDetails.AttendanceBreakUpDetailsType = AttendanceBreakUpDetailsType.FullDayPresent;
      employeeAttendanceBreakUpDetails.AttendanceDate = moment(new Date(this.preferredDate)).format('YYYY-MM-DD');
      employeeAttendanceBreakUpDetails.YADId = 0;
      employeeAttendanceBreakUpDetails.AttendancePeriodId = this.JObject.AttendancePeriod.Id;
      employeeAttendanceBreakUpDetails.AttendanceCycleId = this.JObject.AttendancePeriod.AttendanceCycleId;
      employeeAttendanceBreakUpDetails.EADetailsId = 0; // need to change
      employeeAttendanceBreakUpDetails.PISId = '0';
      employeeAttendanceBreakUpDetails.EmployeeId = this.EmployeeObject.Id;
      employeeAttendanceBreakUpDetails.ApproverRemarks = '';
      employeeAttendanceBreakUpDetails.LstEmployeeAttendancePunchInDetails = empAttendancePunchInDetails;
      empAttendanceBreakupList.push(employeeAttendanceBreakUpDetails);

      console.log('EMPLOYEE BREAKUP DETAILS ::', empAttendanceBreakupList);

      // this.loadingScreenService.stopLoading();
      // return;




      // var empAttendancePunchInDetails = [];
      // if (tempPunchInOutDetetails != null && tempPunchInOutDetetails.length > 1) {
      //   for (let i = 0; i < tempPunchInOutDetetails.length; i++) {
      //     const ele = tempPunchInOutDetetails[i];
      //     if (i > 0 && ele.StartTime != null) {
      //       var employeeAttendancePunchInDetails = new EmployeeAttendancePunchInDetails();
      //       employeeAttendancePunchInDetails.Id = this.commonService.isGuid(ele.Id) == true ? 0 : ele.Id;
      //       employeeAttendancePunchInDetails.EmployeeId = this.EmployeeObject.Id;
      //       employeeAttendancePunchInDetails.EmployeeAttendanceBreakUpDetailsId = this.CalendarObject != null ? this.attendanceForm.get('Id').value : 0;
      //       employeeAttendancePunchInDetails.Attendancedate = moment(new Date(this.preferredDate)).format('YYYY-MM-DD');
      //       employeeAttendancePunchInDetails.Starttime = ele.StartTime;
      //       employeeAttendancePunchInDetails.FinishTime = ele.EndTime == null ? null : ele.EndTime;
      //       employeeAttendancePunchInDetails.SubmittedHours = ele.TotalHours;
      //       employeeAttendancePunchInDetails.ApprovedHours = 0;
      //       employeeAttendancePunchInDetails.RequesterRemarks = this.attendanceForm.get('remarks').value;
      //       employeeAttendancePunchInDetails.ApproverRemarks = '';
      //       employeeAttendancePunchInDetails.Status = 1;
      //       empAttendancePunchInDetails.push(employeeAttendancePunchInDetails);
      //     }
      //   }
      // }

      // if (tempPunchInOutDetetails != null && tempPunchInOutDetetails.length > 0) {
      //   let lastIndex = tempPunchInOutDetetails.length - 1;
      //   var empAttendanceBreakupList = [];
      //   let _st = this.LstPunchInDetails.find(a => a.ChildTableRow == 1).StartTime;
      //   let _et = this.LstPunchInDetails.find(a => a.ChildTableRow == 1).EndTime;

      //   var employeeAttendanceBreakUpDetails = new EmployeeAttendanceBreakUpDetails();
      //   employeeAttendanceBreakUpDetails.Id = this.CalendarObject != null ? this.attendanceForm.get('Id').value : 0; // need to change
      //   employeeAttendanceBreakUpDetails.RequesterRemarks = this.attendanceForm.get('remarks').value;
      //   employeeAttendanceBreakUpDetails.Status = AttendanceBreakUpDetailsStatus.EmployeeSaved // need to change
      //   employeeAttendanceBreakUpDetails.PayableDay = this.actualWorkingHours >= TotalTimes ? 0 : 1;
      //   employeeAttendanceBreakUpDetails.AttendanceType = AttendanceType.Present;
      //   employeeAttendanceBreakUpDetails.AttendanceCode = this.LstattendanceType.find(a => a.name == 'Present').name;
      //   employeeAttendanceBreakUpDetails.IsFullDayPresent = this.actualWorkingHours >= TotalTimes ? false : true;
      //   employeeAttendanceBreakUpDetails.TotalApprovedHours = 0;
      //   employeeAttendanceBreakUpDetails.TotalSubmittedHours = TotalTimes;
      //   // employeeAttendanceBreakUpDetails.LastCheckedOut = tempPunchInOutDetetails[lastIndex].EndTime == null ? null : tempPunchInOutDetetails[lastIndex].EndTime;
      //   // employeeAttendanceBreakUpDetails.FirstCheckIn = tempPunchInOutDetetails[0].StartTime == null ? null : tempPunchInOutDetetails[0].StartTime;
      //   employeeAttendanceBreakUpDetails.LastCheckedOut = _et == null || _et == undefined ? null : _et;
      //   employeeAttendanceBreakUpDetails.FirstCheckIn = _st == null ? null : _st;

      //   employeeAttendanceBreakUpDetails.AttendanceDate = moment(new Date(this.preferredDate)).format('YYYY-MM-DD');
      //   employeeAttendanceBreakUpDetails.YADId = 0;
      //   employeeAttendanceBreakUpDetails.AttendancePeriodId = this.JObject.AttendancePeriod.Id;
      //   employeeAttendanceBreakUpDetails.AttendanceCycleId = this.JObject.AttendancePeriod.AttendanceCycleId;
      //   employeeAttendanceBreakUpDetails.EADetailsId = 0; // need to change
      //   employeeAttendanceBreakUpDetails.PISId = '0';
      //   employeeAttendanceBreakUpDetails.EmployeeId = this.EmployeeObject.Id;
      //   employeeAttendanceBreakUpDetails.ApproverRemarks = '';
      //   employeeAttendanceBreakUpDetails.LstEmployeeAttendancePunchInDetails = empAttendancePunchInDetails;
      //   empAttendanceBreakupList.push(employeeAttendanceBreakUpDetails);

      //   console.log('EMPLOYEE BREAKUP DETAILS ::', empAttendanceBreakupList);
      // this.isrendering_spinner = true;
      // this.loadingScreenService.stopLoading();
      // return;
      let submitAttendanceUIModel = new SubmitAttendanceUIModel();
      submitAttendanceUIModel.LstEmployeeAttendanceBreakUpDetails = empAttendanceBreakupList;
      submitAttendanceUIModel.ModuleProcessAction = -1;
      submitAttendanceUIModel.Role = {
        IsCompanyHierarchy: false,
        RoleId: this.RoleId
      }

      this.attendanceService.SubmitEmployeeAttendanceBreakUpDetails(submitAttendanceUIModel)
        .subscribe((result) => {
          console.log(result);
          let apiresult: apiResult = result;
          if (apiresult.Status) {
            this.loadingScreenService.stopLoading();
            this.LstPunchInDetails = [];
            tempPunchInOutDetetails = [];
            // this.alertService.showSuccess(apiresult.Message);
            // this.activeModal.close('Success');
            this.activeModal.close('Modal Closed');

            // this.onRefreshModal(); // ref the comment of toggle times
          }
          else {
            this.loadingScreenService.stopLoading();
            this.alertService.showWarning(apiresult.Message);
          }

        })


      // this.attendanceService.UpsertEmployeeAttendanceBreakUpDetails(JSON.stringify(empAttendanceBreakupList))
      //   .subscribe((result) => {
      //     console.log(result);
      //     let apiresult: apiResult = result;
      //     if (apiresult.Status) {
      //       this.loadingScreenService.stopLoading();
      //       // this.alertService.showSuccess(apiresult.Message);
      //       this.activeModal.close('Success');
      //     }
      //     else {
      //       this.loadingScreenService.stopLoading();
      //       this.alertService.showWarning(apiresult.Message);
      //     }

      //   })

    }






















    // let AttendanceStartDateTime: Date;
    // AttendanceStartDateTime = new Date(this.preferredDate);
    // AttendanceStartDateTime.setHours(this.formatted_startTime.hour);
    // AttendanceStartDateTime.setMinutes(this.formatted_startTime.minute);

    // let AttendanceEndDateTime: Date;
    // AttendanceEndDateTime = new Date(this.preferredDate);
    // this.attendanceForm.get('endtime').value != null ? AttendanceEndDateTime.setHours(this.formatted_endTime.hour) : true;
    // this.attendanceForm.get('endtime').value != null ? AttendanceEndDateTime.setMinutes(this.formatted_endTime.minute) : true;



    // var startTime = this.attendanceForm.get('starttime').value != null ? moment(AttendanceStartDateTime).format('HH:mm:ss') : null;
    // var endTime = this.attendanceForm.get('endtime').value != null ? moment(AttendanceEndDateTime).format('HH:mm:ss') : null;
    // console.log('startTime', startTime);
    // var totalHrs = 0;
    // if (endTime != null && startTime != null) {
    //   var fromhrs = moment(startTime.toString(), 'HH:mm');
    //   var tillhrs = moment(endTime.toString(), 'HH:mm');
    //   totalHrs = tillhrs.diff(fromhrs, 'hour');
    // }

    // var empAttendancePunchInDetails = [];
    // this.LstPunchInDetails.forEach(ele => {

    //   var employeeAttendancePunchInDetails = new EmployeeAttendancePunchInDetails();
    //   employeeAttendancePunchInDetails.Id = 0;
    //   employeeAttendancePunchInDetails.EmployeeId = this.EmployeeObject.Id;
    //   employeeAttendancePunchInDetails.EmployeeAttendanceBreakUpDetailsId = this.CalendarObject != null ? this.attendanceForm.get('Id').value : 0;
    //   employeeAttendancePunchInDetails.Attendancedate = moment(new Date(this.preferredDate)).format('YYYY-MM-DD');
    //   employeeAttendancePunchInDetails.Starttime = ele.StartTime;
    //   employeeAttendancePunchInDetails.FinishTime = ele.EndTime;
    //   employeeAttendancePunchInDetails.SubmittedHours = ele.TotalHours;
    //   employeeAttendancePunchInDetails.ApprovedHours = 0;
    //   employeeAttendancePunchInDetails.RequesterRemarks = this.attendanceForm.get('remarks').value;
    //   employeeAttendancePunchInDetails.ApproverRemarks = '';
    //   employeeAttendancePunchInDetails.Status = 1;
    //   empAttendancePunchInDetails.push(employeeAttendancePunchInDetails);
    // });

    // var TotalTimes: number = 0;
    // if (this._attendanceConfiguration.IsAllowMultiplePunches && this._attendanceConfiguration.IsTimeCalculationRequiredBaseOnMultiplePunches) {
    //   this.LstPunchInDetails != null && this.LstPunchInDetails.length > 0 && this.LstPunchInDetails.forEach(element => {
    //     TotalTimes += this.calculatedTotalHours(element.StartTime, element.EndTime);
    //   });
    // } else {
    //   if (this.LstPunchInDetails != null && this.LstPunchInDetails.length > 0) {
    //     let lastIndex = this.LstPunchInDetails.length - 1;
    //     TotalTimes += this.calculatedTotalHours(this.LstPunchInDetails[0].StartTime, this.LstPunchInDetails[lastIndex].EndTime);
    //   }
    // }

    // console.log('TotalTimes', TotalTimes);

    // var empAttendanceBreakupList = [];
    // var employeeAttendanceBreakUpDetails = new EmployeeAttendanceBreakUpDetails();
    // employeeAttendanceBreakUpDetails.Id = this.CalendarObject != null ? this.attendanceForm.get('Id').value : 0; // need to change
    // employeeAttendanceBreakUpDetails.RequesterRemarks = this.attendanceForm.get('remarks').value;
    // employeeAttendanceBreakUpDetails.Status = 1 // need to change
    // employeeAttendanceBreakUpDetails.PayableDay = this._PayableDay;
    // employeeAttendanceBreakUpDetails.AttendanceType = AttendanceType.Present;
    // employeeAttendanceBreakUpDetails.AttendanceCode = this.LstattendanceType.find(a => a.name == 'Present').name;
    // employeeAttendanceBreakUpDetails.IsFullDayPresent = true;
    // employeeAttendanceBreakUpDetails.TotalApprovedHours = 0;
    // employeeAttendanceBreakUpDetails.TotalSubmittedHours = TotalTimes;
    // employeeAttendanceBreakUpDetails.LastCheckedOut = endTime as any;
    // employeeAttendanceBreakUpDetails.FirstCheckIn = startTime as any;
    // employeeAttendanceBreakUpDetails.AttendanceDate = moment(new Date(this.preferredDate)).format('YYYY-MM-DD');
    // employeeAttendanceBreakUpDetails.YADId = 0;
    // employeeAttendanceBreakUpDetails.AttendancePeriodId = this.JObject.AttendancePeriod.Id;
    // employeeAttendanceBreakUpDetails.AttendanceCycleId = this.JObject.AttendancePeriod.AttendanceCycleId;
    // employeeAttendanceBreakUpDetails.EADetailsId = 0; // need to change
    // employeeAttendanceBreakUpDetails.PISId = '0';
    // employeeAttendanceBreakUpDetails.EmployeeId = this.EmployeeObject.Id;
    // employeeAttendanceBreakUpDetails.ApproverRemarks = '';
    // employeeAttendanceBreakUpDetails.LstEmployeeAttendancePunchInDetails = empAttendancePunchInDetails;
    // empAttendanceBreakupList.push(employeeAttendanceBreakUpDetails);

    // // var employeeAttendanceDetails = new EmployeeAttendanceDetails();
    // // employeeAttendanceDetails.Status = 1;
    // // employeeAttendanceDetails.AttendanceConfigurationMappingId = 1;
    // // employeeAttendanceDetails.TotalNumberOfNonPayableDays = 0;
    // // employeeAttendanceDetails.TotalNumberOfPayableDays = 30;
    // // employeeAttendanceDetails.TotalNumberOfDays = 30;
    // // employeeAttendanceDetails.TotalOThours = 0;
    // // employeeAttendanceDetails.TotalApprovedhours = 0;
    // // employeeAttendanceDetails.TotalSubmittedHours = 10;
    // // employeeAttendanceDetails.AttendancePeriodId = 1;
    // // employeeAttendanceDetails.AttendancecycleId = 1;
    // // employeeAttendanceDetails.DOJ = new Date();
    // // employeeAttendanceDetails.EmployeeName = this.EmployeeObject.EmployeeName;
    // // employeeAttendanceDetails.ClientEmployeeCode = '';
    // // employeeAttendanceDetails.EmployeeCode = this.EmployeeObject.EmployeeCode;
    // // employeeAttendanceDetails.EmployeeId = this.EmployeeObject.Id;
    // // employeeAttendanceDetails.PISId = 0;
    // // employeeAttendanceDetails.LstEmployeeAttendanceBreakUpDetails = empAttendanceBreakupList;
    // // employeeAttendanceDetails.LstEmployeeAttendanceReversalDetails = [];
    // // employeeAttendanceDetails.LstEmployeeVariableInputsDetails = [];

    // console.log('empAttendanceBreakupList', empAttendanceBreakupList);
    // // this.loadingScreenService.stopLoading();
    // this.attendanceService.UpsertEmployeeAttendanceBreakUpDetails(JSON.stringify(empAttendanceBreakupList))
    //   .subscribe((result) => {
    //     console.log(result);
    //     let apiresult: apiResult = result;
    //     if (apiresult.Status) {
    //       this.loadingScreenService.stopLoading();
    //       this.alertService.showSuccess(apiresult.Message);
    //       this.activeModal.close('Success');
    //     }
    //     else {
    //       this.loadingScreenService.stopLoading();
    //       this.alertService.showWarning(apiresult.Message);
    //     }

    //   })

    // this.attendanceService.UpsertEmployeeAttendanceDetails(JSON.stringify(employeeAttendanceDetails))
    //   .subscribe((result) => {
    //     console.log(result);

    //   })

    // InterviewStartDateTime = new Date(this.addLevelForm.get('InterviewDate').value);

    // let attendanceStartDateTime: Date;

    // attendanceStartDateTime.setHours(1);
    // attendanceStartDateTime.setMinutes(1);


    // RequesterRemarks: string;
    // Status: number;
    // PayableDay: number;
    // AttendanceType: number;
    // AttendanceCode: string;
    // IsFullDayPresent: boolean;
    // TotalApprovedHours: number;
    // TotalSubmittedHours: number;
    // LastCheckedOut: string;
    // FirstCheckIn: string;
    // AttendanceDate: Date | string;
    // YADId: number;
    // AttendancePeriodId: number;
    // AttendanceCycleId: number;
    // EADetailsId: number;
    // PISId: string;
    // EmployeeId: number;
    // ApproverRemarks: string;
    // LstEmployeeAttendancePunchInDetails: EmployeeAttendancePunchInDetails[]; 


    // console.log(this.attendanceForm.value)
    // this.activeModal.close('Modal Closed');
  }

  onRefreshModal() {
    try {

      this.isrendering_spinner = true;
      this.attendanceService.GetAttendanceData(this.EmployeeObject.EmployeeCode, (new Date(this.preferredDate).getMonth() + 1), (new Date(this.preferredDate).getFullYear()))
        .subscribe((response) => {

          let apiResult: apiResult = response;
          if (apiResult.Status) {
            let res = JSON.parse(apiResult.Result);
            this.LstEmployeeAttendanceBreakUpDetails = res.LstEmployeeAttendanceBreakUpDetails;

            this.LstEmployeeAttendanceBreakUpDetails != null && this.LstEmployeeAttendanceBreakUpDetails.length > 0 && this.LstEmployeeAttendanceBreakUpDetails.forEach(e => {

              if (moment(e.AttendanceDate).format('YYYY-MM-DD') == moment(this.preferredDate).format('YYYY-MM-DD')) {
                this.JObject.CalendarObject.breakupObject = e;
                this.objectMapping();
              }
            });

          } else {
            console.error('EXECEPTION ERROR LINE NO : 312');
          }

        }, err => {

        }

        )
    } catch (error) {
      console.log('EXECPTION ::', error);
    }
  }



  close() {
    this.activeModal.close('Modal Closed');
  }

  onKeyUp(i) {

    console.log('i', i);

  }

  getMyProperty() {
    console.log(this.attendanceForm.get('starttime').value);
    return 23;
  }

  addNewPunchIn() {
    this.LstPunchInDetails.push({
      Id: UUID.UUID(),
      AttendanceDate: new Date(),
      StartTime: '--:--',
      EndTime: '--:--',
      TotalHours: 0
    })
  }


  ngOnDestroy() {
    clearInterval(this.intervalId);
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}