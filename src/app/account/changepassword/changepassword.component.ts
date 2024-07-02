import {
  Component, OnInit, OnDestroy, ElementRef, ViewChild,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ForgotPassword } from '../../_services/model/index'
import { interval } from 'rxjs';
import { map } from 'rxjs/operators'

import { MustMatch, passwordStrengthValidator } from '../../shared/directives/_helper';

import { AuthenticationService } from '../../_services/service/authentication.service'; // login and security services 
import { AlertService } from '../../_services/service/alert.service'; // alert service
import { ReCaptcha2Component } from 'ngx-captcha';
import { environment } from "../../../environments/environment";
import { LoginResponses } from 'src/app/_services/model/Common/LoginResponses';
import { SessionStorage } from 'src/app/_services/service//session-storage.service';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-changepassword',
  templateUrl: './changepassword.component.html',
  styleUrls: ['./changepassword.component.css']
})
export class ChangepasswordComponent implements OnInit {


  public SpinnerShouldhide: boolean = false;
  public resendSpinner: boolean = false;
  public forgotPassword: ForgotPassword;
  forgotPasswordForm: FormGroup;
  public submitted: boolean = false;
  public Resetsubmitted: boolean = false;

  timeleft: any;
  timecounter: any = 0;
  isHiddenForgot: boolean = true;
  isHiddenOTP: boolean = true;
  isHiddenResetPassword: boolean = true;

  OTP: any;

  resetPasswordForm: FormGroup;
  isafterPwdChanged: boolean = true;
  // from login sscreen 
  companyId: any;
  userType: any;

  private sub: any;
  private tempUserMobileNo: any;
  private userId: any;
  // reCaptcha
  @ViewChild('captchaElem') captchaElem: ReCaptcha2Component;
  // @ViewChild('langInput') langInput: ElementRef;
  public captchaIsLoaded = true;
  public captchaSuccess = false;
  public captchaIsExpired = false;
  public captchaResponse?: string;
  // public theme: 'light' | 'dark' = 'light';
  // public size: 'compact' | 'normal' = 'normal';
  // public lang = 'en';
  public type = 'image';
  public siteKey = environment.environment.reCaptchaSiteKey;
  public configTimeLeft = environment.environment.OTPTimeLeftSec;
  _loginSessionDetails: LoginResponses;

  constructor(

    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private _configService: AuthenticationService,  //  intialization of login and logout config 
    private alertService: AlertService,
    private cdr: ChangeDetectorRef,
    public sessionService: SessionStorage, 
    private loadingScreenService: LoadingScreenService,
    private cookieService : CookieService,

  ) { }

  ngOnInit() {


    // this.sub = this.route.params.subscribe(params => {
    //   this.companyId = params['companyId'];
    //   this.userType = params['userType']
    //   // In a real app: dispatch action to load the details here.
    // });

    this._loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses)); // Get the whole matched session element set as a clean json(array) via an session object
    this.userType = this._loginSessionDetails.UserSession.UserType;
    this.companyId = this._loginSessionDetails.Company.Id;
    this.userId = this._loginSessionDetails.UserSession.UserId;

    this.resetPasswordForm = this.formBuilder.group({

      password: ['', [Validators.required, Validators.minLength(8) ,Validators.maxLength(20), passwordStrengthValidator]],
      confirmPassword: ['', Validators.required],
      oldPassword: ['', Validators.required],
      

    }, {
      validator: MustMatch('password', 'confirmPassword'),
      validators: passwordStrengthValidator
    });


  }

  // convenience getter for easy access to form fields
  // get f() { return this.forgotPasswordForm.controls; }
  get g() { return this.resetPasswordForm.controls; }



  // ************************** Reset Password section start ***********************
  saveChanges() {
    this.Resetsubmitted = true;
    // stop here if form is invalid
    if (this.resetPasswordForm.invalid) {
      return;
    }
    this.loadingScreenService.startLoading();
    this.SpinnerShouldhide = true;
    let requestURL_json = JSON.stringify({

      "UserId": this.userId,
      "OldPassword": this.resetPasswordForm.get('oldPassword').value,
      "NewPassword": this.resetPasswordForm.get('password').value,

    })
    this._configService.changePassword(requestURL_json).subscribe((data: any) => {
      console.log(data);
      let response = data.Result;
      if (data.Result && data.Status) {
        this.SpinnerShouldhide = false;

        this.loadingScreenService.stopLoading();
        this.alertService.showSuccess('Password Changed : You have successfully changed the password for your H-Factor account');
        this.isafterPwdChanged = false;

      } else {
        this.SpinnerShouldhide = false;
        this.isafterPwdChanged = true;
        this.loadingScreenService.stopLoading();
        this.alertService.showWarning(data.Message);
      }

    }, (e) => {
    });


  }

  // ************************** Reset Password section End ***********************


  backtoHome() {

    this.router.navigateByUrl('/app/dashboard')

  }

  backtoLogin() {

    this._configService.logout().subscribe(() => { });
    this._configService.google_signOut();

    const cookieValue = this.cookieService.get('clientCode');
    const businessType = environment.environment.BusinessType;
    const loginRoute = (businessType === 1 || businessType === 2) ? `login/${cookieValue}` : 'login';

    this.router.navigate([loginRoute]);

  }

  // goback(index: any) {

  //   if (index == '1') {
  //     this.isHiddenForgot = true;
  //     this.isHiddenOTP = true;
  //   }

  //   else if (index == "2") {

  //     this.isHiddenOTP = false;
  //     this.isHiddenResetPassword = true;
  //   }
  // }

  // // recaptcha -On click handling
  // handleSuccess(captchaResponse: string): void {
  //   this.captchaSuccess = true;
  //   this.captchaResponse = captchaResponse;
  //   this.captchaIsExpired = false;
  //   this.cdr.detectChanges();
  // }

  // reset(): void {
  //   this.captchaElem.resetCaptcha();
  // }

  // handleReset(): void {
  //   this.captchaSuccess = false;
  //   this.captchaResponse = undefined;
  //   this.captchaIsExpired = false;
  //   this.cdr.detectChanges();
  // }
  // // handleLoad(): void {
  // //   this.captchaIsLoaded = true;
  // //   this.captchaIsExpired = false;
  // //   this.cdr.detectChanges();
  // // }

  // // handleExpire(): void {
  // //   this.captchaSuccess = false;
  // //   this.captchaIsExpired = true;
  // //   this.cdr.detectChanges();
  // // }

  // startCountdown(seconds) {
  //   let counter = seconds;
  //   const interval = setInterval(() => {
  //     var start = Date.now()
  //     var diff = Date.now() - start, ns = (((3e5 - diff) / 1000) >> 0), m = (ns / 60) >> 0, s = ns - m * 60;
  //     if (diff > (3e5)) { start = Date.now() }
  //     this.timeleft = `Verification closes in 00:${('' + counter).length > 1 ? '' : '0'}` + counter;
  //     this.timecounter = counter;
  //     counter--;
  //     if (counter < 0) {
  //       clearInterval(interval);
  //       console.log('Ding!');
  //     }
  //   }, 1000);
  // }

  // ngOnDestroy() {
  //   this.sub.unsubscribe();
  // }
}
