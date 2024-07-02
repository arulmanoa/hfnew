import { Component, OnInit } from '@angular/core';
import { HeaderService } from 'src/app/_services/service/header.service';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { OnboardingService } from '../../../_services/service/onboarding.service';
import { CandidateOnboardingDetailsModel} from 'src/app/_services/model/OnBoarding/QC';
@Component({
  selector: 'app-onboarding-details',
  templateUrl: './onboarding-details.component.html',
  styleUrls: ['./onboarding-details.component.css']
})
export class OnboardingDetailsComponent implements OnInit {
  Id: number = 0;
  objCandidateOnboardingDetails: CandidateOnboardingDetailsModel = new CandidateOnboardingDetailsModel();
  constructor(private headerService: HeaderService,private route: ActivatedRoute,private onboardingApi: OnboardingService,) { }
  
  ngOnInit() {
    this.headerService.setTitle('Candidate Details');

    this.route.queryParams.subscribe(params => {
      console.log(params);
      if (JSON.stringify(params) != JSON.stringify({})) {

        var encodedIdx = atob(params["Idx"]);
        this.Id = Number(encodedIdx) == undefined ? 0 : Number(encodedIdx);
         console.log('Id', this.Id);
        
      }
    });
     if( this.Id){
      let req_param_uri = `${this.Id}`;
          this.onboardingApi.getAllCandidateInfo(req_param_uri).subscribe(response => {
            console.log('producta list ', response);
           var list=  JSON.parse(response.Result);
           this.objCandidateOnboardingDetails=list[0];
           console.log('list',this.objCandidateOnboardingDetails);
       
      }, (error) => {
      });
    }

  }
  
}
