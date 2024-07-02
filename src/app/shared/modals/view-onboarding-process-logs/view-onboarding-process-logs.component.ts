import { Component, OnInit, EventEmitter, Input, Output, ViewChild, TemplateRef, ElementRef } from '@angular/core';
import * as _ from 'lodash';
import { NgxSpinnerService } from "ngx-spinner";
import { OnboardingService } from '../../../_services/service/onboarding.service';
import { AlertService } from '../../../_services/service/alert.service';
import moment from 'moment';
import { SessionStorage } from '../../../_services/service/session-storage.service'; 
import { SessionKeys } from '../../../_services/configs/app.config'; // app config

@Component({
  selector: 'app-view-onboarding-process-logs',
  templateUrl: './view-onboarding-process-logs.component.html',
  styleUrls: ['./view-onboarding-process-logs.component.css']
})
export class ViewOnboardingProcessLogsComponent implements OnInit {

  @Input() transactionId: any;
  empDetails: any ;
  ProcessLogs:any=[]
  _loginSessionDetails:any
  BusinessType:any;
  constructor(
    private onboardingApi: OnboardingService,
    private Customloadingspinner: NgxSpinnerService,
    private alertService: AlertService,
    public sessionService: SessionStorage,
  ) { }

  ngOnInit() {

    this._loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses)); 
    
    this.BusinessType = this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping != null ? this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this._loginSessionDetails.Company.Id).BusinessType : 0;
 
let transId=this.transactionId
this.Customloadingspinner.show();
    this.onboardingApi.getProcessLog(transId).subscribe((data) => {
      let apiResult = data;
      this.Customloadingspinner.hide();
      if (apiResult&&apiResult.Status&& apiResult.Result != ""){
        let logData=apiResult.Result;
        this.empDetails=logData.EntityDetails
        if(this.empDetails){
          this.empDetails['formatDOJ']=moment(this.empDetails.DOJ).format('DD-MM-YYYY');
        }
        if(logData&&logData.ProcessLogs&& logData.ProcessLogs.length>0){
          this.ProcessLogs =logData.ProcessLogs;
          for(let obj of this.ProcessLogs){
             obj['inputFormatrdDate'] =moment(obj.InputTime).format('DD-MM-YYYY HH:mm A');
           obj['ouputFormatrdDate'] =moment(obj.InputTime).format('DD-MM-YYYY HH:mm A');
          }
          console.log("ProcessLogData",this.ProcessLogs)
        }
        
      }
      else{
        console.log("getProcessLog", apiResult.Message)
        //this.alertService.showWarning(apiresult1.Message);
      }
        
    }), ((err) => {

    });
    

  }

 
 

}
