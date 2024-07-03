

import { Component, OnInit} from '@angular/core';
/** Error when invalid control is dirty, touched, or submitted. **/
import { ActivatedRoute, Router } from '@angular/router';
import { CandidateService } from '../../_services/service/candidate.service'; // login and security services 
import { AlertService } from '../../_services/service/alert.service'; // alert service
import { apiResult } from 'src/app/_services/model/apiResult';
import { AuthenticationService } from 'src/app/_services/service/authentication.service';
import { SessionKeys } from '../../_services/configs/app.config'; // app config 
import { SessionStorage } from '../../_services/service/session-storage.service'; // session storage 
import { LoginResponses } from 'src/app/_services/model';

@Component({
  selector: 'app-candidate-otp',
  templateUrl: './candidate-otp.component.html',
  styleUrls: ['./candidate-otp.component.scss']
})
export class CandidateOTPComponent implements OnInit {

  public SpinnerShouldhide: boolean = false;
  OTP: string;
  VerficationKey: string;
  isAuthorized: boolean = false;

  constructor(

    public candidateService: CandidateService,
    private alertService: AlertService,
    private route: ActivatedRoute,
    private router: Router,
    public authService: AuthenticationService,
    private sessionService: SessionStorage,

  ) { }

  ngOnInit() {
    
    this.route.queryParams.subscribe(params => {

      if (JSON.stringify(params) != JSON.stringify({})) {

        var encodedIdx = (params["Idx"]);

       // let encryptedKey = "caG6tPVUJeJPocYDSbJHDUwHGtl6Yp3ZhD4TnaenuQI=";
        this.fetchEncryption(encodedIdx).then(() => {
       
          this.isAuthorized = true;
        }); // Now has value;
       
      }
    });

    
  }



  fetchEncryption(encryptedKey): Promise<any> {
    return new Promise((resolve, reject) => {

      this.candidateService.getVerificationKey(encryptedKey).subscribe((res) => {
        let apiResult: apiResult = res;
        if (apiResult.Status && apiResult.Result != "") {
          this.VerficationKey = apiResult.Result;
          resolve(apiResult.Status);
        }
        else { this.router.navigate(['/unauthorized']); }
      }), ((error) => {
        console.error(error);
        
      });
    })

  }



  // ************************** One Time Password section start ***********************
  VerifyOTP() {

  
    if (this.OTP == null || this.OTP == undefined || this.OTP == "") {
      this.alertService.showInfo("Please enter OTP to authorize the account");
      return;
    }


    this.SpinnerShouldhide = true;

    let requestURL_json = `encryptedtext=${this.VerficationKey}&otp=${this.OTP.toString()}`;


    this.authService.candidateLogin(requestURL_json).subscribe((data: any) => {
      console.log(data);
      if (data == undefined) {

        this.router.navigate(['/unauthorized']);

      } else {  
      
        if (data.Status && data.Result) {

          let result: LoginResponses = data.Result;
          
          this.sessionService.setSesstionStorage(SessionKeys.Token, result.Token);
          this.sessionService.setSesstionStorage(SessionKeys.LoginResponses, result);

          this.sessionService.setSesstionStorage("Encryptedtext", this.VerficationKey);
          this.router.navigate(['/candidate_acceptance'])


        } else {
          this.SpinnerShouldhide = false; 
          this.alertService.showWarning(data.Message);
        }
      }

    }, (e) => {
      this.SpinnerShouldhide = false;

    });


  }

  
  // ************************** One Time Password section End ***********************

}
