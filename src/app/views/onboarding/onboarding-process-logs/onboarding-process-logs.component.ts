import { Component, OnInit } from '@angular/core';
import { NzDrawerService } from 'ng-zorro-antd';
import {ViewOnboardingProcessLogsComponent} from 'src/app/shared/modals/view-onboarding-process-logs/view-onboarding-process-logs.component'
import { SessionStorage } from '../../../_services/service/session-storage.service'; 
import { SessionKeys } from '../../../_services/configs/app.config'; // app config
import moment from 'moment';
import { NgxSpinnerService } from "ngx-spinner";
import { OnboardingService } from '../../../_services/service/onboarding.service'; 
import { ClientService } from 'src/app/_services/service/client.service';
import { AlertService } from '../../../_services/service/alert.service';
import { I } from '@angular/cdk/keycodes';
import {Gender} from 'src/app/_services/model/Base/HRSuiteEnums';
import {CandidateStatus} from 'src/app/_services/model/Candidates/CandidateDetails';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
@Component({
  selector: 'app-onboarding-process-logs',
  templateUrl: './onboarding-process-logs.component.html',
  styleUrls: ['./onboarding-process-logs.component.css']
})
export class OnboardingProcessLogsComponent implements OnInit {
  _loginSessionDetails:any
  BusinessType:any;
  candidateSrcVal:any="";
  serchclientId:any;
  candidatesSearchList:any=[]
  companyId:any;
  listOfclients:any=[];
  spinner:boolean=false;
  

  dropDownList=[{ id: 1, clientName: 'ciel', clientType: 0 }, { id: 2, clientName: 'mafoi', clientType: 300,  },
   { id: 3, clientName: 'integrum', clientType: 100, }];
   
  constructor(
    private router: Router,
    private drawerService: NzDrawerService,
    public sessionService: SessionStorage,
    private onboardingApi: OnboardingService,
    private Customloadingspinner: NgxSpinnerService,
    private clientservice: ClientService,
    private alertService: AlertService,
  ) { }

  ngOnInit() {

    
    this._loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses)); 
    
    this.BusinessType = this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping != null ? this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this._loginSessionDetails.Company.Id).BusinessType : 0;
    //if(this.BusinessType!=3){
      this.companyId = this._loginSessionDetails.Company.Id;
   // }
    
    console.log("this.companyId",this.companyId);
    let companyid=this.companyId
    this.clientListForSearch(companyid)
    this.searchFunction();
  }

  searchFunction() {
    if(this.BusinessType!=3){
    this.serchclientId=this.sessionService.getSessionStorage('default_SME_ClientId');
    }
    //if(this.serchclientId&&this.candidateSrcVal){
    // this.Customloadingspinner.show();
    this.spinner=true;
    this.onboardingApi.getCandidateDetailsForProcessLogUi(this.serchclientId,this.candidateSrcVal).subscribe((data) => {
      let apiResult = data;
     // this.Customloadingspinner.hide();
     this.spinner=false;
      if (apiResult&&apiResult.Status&&apiResult.Result!=""&& apiResult.Result!=null){
         this.candidatesSearchList=JSON.parse(apiResult.Result);
         for (let obj of this.candidatesSearchList ){
           obj['DOB']=moment(obj.DateOfBirth).format('DD-MM-YYYY');
           obj.Gender==1?obj['_Gender']="Male":(obj.Gender==2?obj['_Gender']="Female":obj['_Gender']="TransGender")
           obj.Status==1?obj['_Status']="Active":obj['_Status']="InActive"

           
         }
        console.log("onboard process log searchList",this.candidatesSearchList);
      }
      else if(apiResult&&apiResult.Status&&apiResult.Result==""){
        this.candidatesSearchList=[]
      }
      else{
        console.log("onboard process log searchList",data.Message);
       // this.alertService.showWarning(data.Message);
      }
        
    }), ((err) => {
      this.spinner=false;
    });
  // }
  //   else {
     
  //     this.alertService.showWarning(`Please fill the mandatory fields`);
  //   }
   
  }
 
  clientListForSearch(companyid){
   // this.Customloadingspinner.show();
   this.spinner=true;
      this.clientservice.getClientByCompanyId(companyid).subscribe((res) => {
        this.spinner=false;
       // this.Customloadingspinner.hide();
       if(res.Status) {
        let apiresponse = res;
        this.listOfclients = apiresponse.dynamicObject;
        console.log('listOfclients', this.listOfclients);
      }
        else{
          this.alertService.showWarning(res.Message);
        }
  
      }),
  
  
        ((err) => {
  
        });
  
  
    
  }

  clickOnViewLogs(obj) {
    

    const drawerRef = this.drawerService.create<ViewOnboardingProcessLogsComponent, { transactionId }, string>({
      nzTitle: 'View Logs',
      nzContent: ViewOnboardingProcessLogsComponent,
      nzWidth: 980,
      nzClosable: true,
      nzMaskClosable: false,
      nzContentParams: {
        transactionId:obj.ModuleProcessTransactionId,
      }
    });

    drawerRef.afterOpen.subscribe(() => {
      console.log('Drawer(Component) open');
    });

    drawerRef.afterClose.subscribe(data => {
      console.log('data', data);

      var modalResult = (data) as any;
      if (data != undefined) {

      }

    });
  }
  backToOnBoardList(){
    this.router.navigate(['app/onboarding/onboarding_ops'])
  }
}
