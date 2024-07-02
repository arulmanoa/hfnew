import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { LoginResponses } from 'src/app/_services/model';
import { AttendanceService } from 'src/app/_services/service/attendnace.service';
import { SessionStorage } from '../../../_services/service/session-storage.service';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { apiResult } from 'src/app/_services/model/apiResult';
import { AlertService, OnboardingService } from 'src/app/_services/service';
import * as moment from 'moment';
import Swal from "sweetalert2";
import * as _ from 'lodash';

@Component({
  selector: 'app-organization-attendance',
  templateUrl: './organization-attendance.component.html',
  styleUrls: ['./organization-attendance.component.css'],
  encapsulation : ViewEncapsulation.None
})
export class OrganizationAttendanceComponent implements OnInit {
  spinner: boolean = false;
  sessionDetails: LoginResponses;
  RoleId: number = 0;
  UserId: any = 0;
  UserName: any;
  RoleCode: any;
  Name: any;
  PersonId: any;
  EmailId: any;

  LstManager: any[] = [];
  records: any[] = [];

  isExpandable: boolean = false;
  attendanceTableHeader = [];
  clickeditems = [];

  index: number = 0;
  flag: boolean = false;
  LstTeam = [];
  SelectedTeamId: any;
  selectTeamAttendanceStartDate: any;
  selectTeamAttendanceEndDate: any;
  constructor(
    private attendanceService: AttendanceService,
    private sessionService: SessionStorage,
    private alertService: AlertService,
    private onboardingService : OnboardingService
  ) { }

  ngOnInit() {
    this.onRefresh();
    // this.clickeditems = this.records[0].EmployeeList as any;

  }

  onRefresh() {
    this.spinner = true
    this.LstTeam = [];
    this.LstManager = [];
    this.clickeditems = [];
    this.attendanceTableHeader = [];
    this.sessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses)); // Get the whole matched session element set as a clean json(array) via an session object
    this.RoleId = this.sessionDetails.UIRoles[0].Role.Id; // bind Logged user id may be change baed on dashboard 
    this.UserId = this.sessionDetails.UserSession.UserId;
    this.RoleCode = this.sessionDetails.UIRoles[0].Role.Code;
    this.UserName = this.sessionDetails.UserSession.PersonName;
    this.EmailId = this.sessionDetails.UserSession.EmailId;
    this.PersonId = this.sessionDetails.UserSession.PersonId;

    var h = [{
      ApplicableRoleId: 11,
      ApplicableUserId: 2851,
      CreatedBy: "5",
      CreatedOn: "2021-11-01T18:05:08.373",
      EmployeeList: [],
      Id: 1,
      LastUpdatedBy: "5",
      LastUpdatedOn: "2021-11-01T18:05:08.373",
      Level: 2,
      ModuleId: 0,
      ModuleProcessId: 0,
      Status: true,
      UserDetails: { Id: 1, UserName: "testing user", Name: "Testing User" },
      UserId: 2851,
      isEmployee: false,
    }];

    
    // this.LstManager = h;
    // this.mappingDynamiObject(h);
    // if (this.RoleCode == "Manager") {
    //   this.GetEmployeeAttendanceListUsingManagerId(this.UserId);

    // } else {
      this.GetAllManagersForReportingManager(this.UserId).then((result) => { console.log('TASK COMPLETED ') });
      // this.GetEmployeeListUsingReportingManager(this.UserId).then((result) => { console.log('TASK COMPLETED ') });

    // }

    const startOfMonth = moment().startOf('month').format('YYYY-MM-DD hh:mm');
    const endOfMonth = moment().endOf('month').format('YYYY-MM-DD hh:mm');

    this.selectTeamAttendanceStartDate = startOfMonth;
    this.selectTeamAttendanceEndDate = endOfMonth;


    this.enumerateDaysBetweenDates1(startOfMonth, endOfMonth)



  }


  enumerateDaysBetweenDates1(startDate, endDate) {
    this.attendanceTableHeader = [];
    while (moment(startDate) <= moment(endDate)) {
      this.attendanceTableHeader.push({ date: new Date(startDate) });
      startDate = moment(startDate).add(1, 'days').format("YYYY-MM-DD");
    }
    console.log('da', this.attendanceTableHeader);

    return this.attendanceTableHeader;
  }

  OpenAccordian() {
    this.isExpandable = true;
  }

  GetAllManagersForReportingManager(managerId) {
    // this.spinner = true;
    const promise = new Promise((resolve, reject) => {
      this.attendanceService.GetAllManagersForReportingManager(managerId)
        .subscribe((res) => {
          this.spinner = false;
          let apiR: apiResult = res;
          var tempitem = [];
          if (apiR.Status && apiR.Result != null && apiR.Result != "") {
            console.log('ttt', apiR);

            var _LstManager = JSON.parse(apiR.Result);

            // _LstManager = _LstManager.concat(h);
            this.mappingDynamiObject(_LstManager);
            this.flag = false;
            // this.GetEmployeeAttendanceListUsingManagerId('2851');

            resolve(true);
          } else {
            this.GetEmployeeAttendanceListUsingManagerId(this.UserId);
            // this.alertService.showWarning("There is no record found!.");
            resolve(null);
            return;
          }
        }, err => {
          resolve(null);
        })

    })
    return promise;

  }


  GetEmployeeAttendanceListUsingManagerId(managerId) {
    const promise = new Promise((resolve, reject) => {
      this.attendanceService.GetEmployeeAttendanceListUsingManagerId(managerId)
        .subscribe((res) => {
          this.spinner = false;
          let apiR: apiResult = res;
          
          if (apiR.Status && apiR.Result != null && apiR.Result !='') {
            var i = JSON.parse(apiR.Result);
            // this.LstManager.forEach(element => {
            //   element['isEmployee'] = true;
            //   element['EmployeeList'] = this.records[0].EmployeeList;
            // });
            
            this.LstTeam = i;
           
            // var ii = [{
            //   AttendanceEndDate: "2021-11-20T00:00:00",
            //   AttendancePeriodId: 21,
            //   AttendanceStartDate: "2021-10-21T00:00:00",
            //   EmployeeList: this.LstTeam[0].EmployeeList,
            //   Id: 490,
            //   TeamId: 490,
            //   TeamName: "tt",
            // }];


            // this.LstTeam = this.LstTeam.concat(ii);



            if (this.LstTeam.length == 0) {
              // this.alertService.showWarning('There is no record found!');
            }
            else {

              this.SelectedTeamId = this.LstTeam[0].Id;
              var startOfMonth = new Date(this.LstTeam.find(a => a.Id == this.SelectedTeamId).AttendanceStartDate)
              var endOfMonth = new Date(this.LstTeam.find(a => a.Id == this.SelectedTeamId).AttendanceEndDate)
              this.selectTeamAttendanceStartDate = new Date(startOfMonth);
              this.selectTeamAttendanceEndDate = new Date(endOfMonth);
              this.enumerateDaysBetweenDates1(startOfMonth, endOfMonth)

              this.LstTeam.forEach(element => {

                element.EmployeeList.forEach(element => {
                  element['isEmployee'] = true;
                });
              });

              if (this.LstManager.length == 0) {

                var dummyObj = [
                  {
                    ApplicableRoleId: 0,
                    ApplicableUserId: 0,
                    CreatedBy: "5",
                    CreatedOn: "2021-11-01T18:05:08.373",
                    EmployeeList: [],
                    Id: 1,
                    LastUpdatedBy: "5",
                    LastUpdatedOn: "2021-11-01T18:05:08.373",
                    Level: 1,
                    ModuleId: 0,
                    ModuleProcessId: 0,
                    Status: true,
                    UserDetails: { Id: this.UserId, UserName: this.UserName, Name: this.UserName, PersonId: this.PersonId, EmailId: this.EmailId },
                    UserId: this.UserId,
                    isEmployee: false
                  }
                ]
                this.LstManager = dummyObj;
              }
              this.LstManager.forEach(element => {

                if (element.UserId == managerId) {
                  // element['isEmployee'] = true;
                  element['EmployeeList'] = [];
                  element['EmployeeList'] = this.LstTeam[0].EmployeeList;

                  this.getmissingday(this.LstTeam[0].EmployeeList);

                } // this.LstTeam[0].EmployeeList //   this.records[0].EmployeeList;
              });
              console.log('res', this.LstManager);
            }
            this.flag = false;
            resolve(true);
          } else {
            resolve(null);
            this.alertService.showWarning("There is no record found!.");
            return;
          }
        }, err => {
          resolve(null);
        })

    })
    return promise;
  }

  getmissingday(emparray) {
    emparray.forEach(e => {
      if (e.Attendance != null) {
        var tempitems = [];
        this.attendanceTableHeader.forEach(el => {

          var test = e.Attendance.find(a => moment(a.AttendanceDate).format('YYYY-MM-DD') == moment(el.date).format('YYYY-MM-DD'));
          if (test == undefined) {
            var obj = {
              AttendanceDate: moment(el.date).format(),
              FirstHalf: "EMPTY",
              FirstHalfApplied: "EMPTY",
              IsWeekOff: false,
              SecondHalf: "EMPTY",
              SecondHalfApplied: "EMPTY",
              Status: 50,
            }
            tempitems.push(obj);
          }

        });

        e.Attendance = e.Attendance.concat(tempitems);

        e.Attendance = _.orderBy(_.filter(e.Attendance), ["AttendanceDate"], ["asc"]);

      }



      // var missingDates = [];
      // for (var i = 1; i < e.Attendance.length; i++)
      // {
      //     var daysDiff = ((e.Attendance[i].AttendanceDate - e.Attendance[i - 1].AttendanceDate) / 86400000) - 1;
      //     for (var j = 1; j <= daysDiff; j++)
      //     {
      //         var missingDate = new Date(e.Attendance[i - 1]);
      //         missingDate.setDate( e.Attendance[i - 1].AttendanceDate.getDate() + j);
      //         missingDates.push(missingDate);
      //     }
      // }
      // console.log(missingDates);


      // e.Attendance.forEach(element => {
      //   // Usage
      //   const dates = getDates(new Date(2013, 10, 22), new Date(2013, 11, 25))
      //   dates.forEach(function (date) {
      //     console.log(date)
      //   })
      // });

    });

  }

  // getDates (startDate, endDate) {
  //   const dates = []
  //   let currentDate = startDate
  //   const addDays = function (days) {
  //     const date = new Date(this.valueOf())
  //     date.setDate(date.getDate() + days)
  //     return date
  //   }
  //   while (currentDate <= endDate) {
  //     dates.push(currentDate)
  //     currentDate = addDays.call(currentDate, 1)
  //   }
  //   return dates
  // }





  doCheckManagerLevel(it, inx) {

    console.log('it', it);

    if (this.index == inx && this.flag) {
      this.index = null;
    } else {
      this.flag = true;
      this.index = inx;
    }


    if (it.Level > 1) {
      this.GetAllManagersForReportingManager(it.UserId);
    } else {
      this.GetEmployeeAttendanceListUsingManagerId(it.UserId);

    }

  }

  mappingDynamiObject(_LstManager) {
    console.log('bb', _LstManager);

    if (this.LstManager.length == 0) {
      this.LstManager = _LstManager;
    } else {
      this.LstManager = this.LstManager.concat(_LstManager);
    }

    this.LstManager = _.orderBy(_.filter(this.LstManager), ["Level"], ["desc"]);
    this.LstManager.forEach(element => {
      element['isEmployee'] = false;
      element['EmployeeList'] = [];
    });

    console.log('res', this.LstManager);

  }

  onChangeTeam(team): void {

    console.log(';t', team);

  }
}
