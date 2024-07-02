import { Component, OnInit } from '@angular/core';
import { AlertService, EmployeeService } from 'src/app/_services/service';
import { LoginResponses } from '../../../_services/model/Common/LoginResponses';
import { SessionStorage } from '../../../_services/service//session-storage.service';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import moment from 'moment';

@Component({
  selector: 'app-fbp-listing-for-employee',
  templateUrl: './fbp-listing-for-employee.component.html',
  styleUrls: ['./fbp-listing-for-employee.component.css']
})
export class FbpListingForEmployeeComponent implements OnInit {

  constructor(
    private router: Router,
    private alertservice: AlertService,
    private employeeService: EmployeeService,
    public sessionService: SessionStorage,
    private titleService: Title
  ) { }

  spinner: boolean = false;
  employeeId: any = 0;
  showAddNewSlotBtn: boolean = false;
  _loginSessionDetails: LoginResponses;
  fbpHistoryDataset: any[];
  fbpConfig: any;

  ngOnInit() {
    this.spinner = true;
    this.titleService.setTitle('FBP Submission List');
    this._loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses));
    this.employeeId = this._loginSessionDetails.EmployeeId;
    // API to check if employee has access to this page
    this.employeeService.getIsFBPApplicableForEmployee(this.employeeId).subscribe((result) => {
      console.log('getIsFBPApplicableForEmployee--', result);
      if (result.Status) {
        // API to check if employee has FBP slot enabled to show 'ADD NEW' button
        this.employeeService.checkIsFBPSlotEnabledForEmployee(this.employeeId).subscribe((res) => {
          console.log('checkIsFBPSlotEnabledForEmployee---', res);
          if (res.Status) {
            this.showAddNewSlotBtn = res.Result.toLowerCase() == 'true' ? true : false;
            // API to get FBP related configurations for logged in employee
            this.employeeService.getFBPConfigForAnEmployee(this.employeeId, 0).subscribe((config) => {
              console.log('getFBPConfig---', config);
              if (config.Status && config.Result != '') {
                this.fbpConfig = JSON.parse(config.Result);
                if (this.fbpConfig && this.fbpConfig.length) {
                  this.showAddNewSlotBtn = this.fbpConfig[0].RP[0].IsFBPActive == 1 ? false : true;
                }
                // API to show previous FBP lists in a table
                this.employeeService.getAllFBPSlotsForEmployee(this.employeeId).subscribe((slots) => {
                  console.log('getAllFBPSlotsForEmployee---', slots);
                  if(slots.Status && slots.Result != '') {
                    this.fbpHistoryDataset = JSON.parse(slots.Result);
                    if (this.fbpHistoryDataset && this.fbpHistoryDataset.length) {
                      this.fbpHistoryDataset.forEach(el => {
                        const today = moment(new Date(), 'DD-MM-YYYY');
                        const periodEndDate = moment(el.FBP[0].PeriodTo, 'DD-MM-YYYY');
                        el.isSlotClosed = moment(today).isAfter(periodEndDate, 'day');
                      });
                    }
                    console.log('emp list data modified---', this.fbpHistoryDataset);
                    this.spinner = false;
                  } else {
                    this.spinner = false;
                    // this.alertservice.showInfo('No Data Available !');
                  }
                }, error => {
                  console.log('getFBPConfig::ERROR -->', error);
                  this.spinner = false;
                });
              } else {
                this.showAddNewSlotBtn = false;
                // API to show previous FBP lists in a table
                this.employeeService.getAllFBPSlotsForEmployee(this.employeeId).subscribe((slots) => {
                  console.log('getAllFBPSlotsForEmployee---', slots);
                  if(slots.Status && slots.Result != '') {
                    this.fbpHistoryDataset = JSON.parse(slots.Result);
                    if (this.fbpHistoryDataset && this.fbpHistoryDataset.length) {
                      this.fbpHistoryDataset.forEach(el => {
                        const today = moment(new Date(), 'DD-MM-YYYY');
                        const periodEndDate = moment(el.FBP[0].PeriodTo, 'DD-MM-YYYY');
                        el.isSlotClosed = moment(today).isAfter(periodEndDate, 'day');
                      });
                    }
                    console.log('emp list data modified---', this.fbpHistoryDataset);
                    this.spinner = false;
                  } else {
                    this.spinner = false;
                    this.alertservice.showInfo('No Data Available !');
                  }
                }, error => {
                  console.log('getFBPConfig::ERROR -->', error);
                  this.spinner = false;
                });
              }
            }, error => {
              console.log('getFBPConfig::ERROR -->', error);
              this.alertservice.showWarning(res.Message);
              this.showAddNewSlotBtn = false;
              this.spinner = false;
            });
          } else {
            this.spinner = false;
            this.showAddNewSlotBtn = false;
            this.alertservice.showWarning(res.Message);
          }
        }, error => {
          console.log('checkIsFBPSlotEnabledForEmployee::ERROR -->', error);
          this.spinner = false;
        });
      } else {
        this.spinner = false;
        this.router.navigate(['app/accessdenied']);
      }
    }, err => {
      this.spinner = false;
      this.alertservice.showWarning(err);
      this.router.navigate(['app/accessdenied']);
      console.log('getIsFBPApplicableForEmployee::ERROR -->', err);
    });
  }

  redirectToFBPDeclarationSlot(mode: string , role: string) {
    let slotId = '0';
    let elcId = '0';
    if (mode.toLowerCase() !== 'new') {
      slotId = this.fbpConfig.FBP[0].FBPSlotId;
      elcId = this.fbpConfig.ELCId;
    }
    this.router.navigate(['app/flexibleBenefitPlan/flexiBenefitPlanDeclaration'], {
      queryParams: {
        "Mdx": btoa(mode),
        "Edx": btoa(slotId),
        "Idx": btoa(this.employeeId),
        "Rdx": btoa(role),
        "elcIdx": btoa(elcId)
      }
    });
  }

  editFbpHistory(selectedData) {
    console.log('selected-edit', selectedData);
    this.fbpConfig = selectedData;
    this.redirectToFBPDeclarationSlot('EDIT', 'employee');
  }

  viewFbpHistory(selectedData) {
    console.log('selected-delete', selectedData);
    this.fbpConfig = selectedData;
    this.redirectToFBPDeclarationSlot('VIEW', 'employee');
  }

}
