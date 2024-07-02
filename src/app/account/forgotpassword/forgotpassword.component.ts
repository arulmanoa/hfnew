// import { Component, OnInit, OnDestroy } from '@angular/core';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';

// import { ForgotPassword } from '../../components/Models/login-credential';
// import { MustMatch } from '../../shared/directives/_helper';

// import { AuthenticationService } from '../../core/authentication/authentication.service'; // login and security services
// import { AlertService } from '../../core/alert/alert.service'; // alert service
// import { Route } from '@angular/compiler/src/core';

import {
  Component, OnInit, OnDestroy, ElementRef, ViewChild,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ForgotPassword } from '../../_services/model/index'
import { map } from 'rxjs/operators'

import { MustMatch, passwordStrengthValidator } from '../../shared/directives/_helper';

import { AuthenticationService } from '../../_services/service/authentication.service'; // login and security services 
import { AlertService } from '../../_services/service/alert.service'; // alert service
import { ReCaptcha2Component } from 'ngx-captcha';
import { environment } from "../../../environments/environment";
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-forgotpassword',
  templateUrl: './forgotpassword.component.html',
  styleUrls: ['./forgotpassword.component.css']
})
export class ForgotpasswordComponent implements OnInit, OnDestroy {

  public SpinnerShouldhide: boolean = false;
  public resendSpinner: boolean = false;
  public forgotPassword: ForgotPassword;
  forgotPasswordForm: FormGroup;
  public submitted: boolean = false;
  public Resetsubmitted: boolean = false;
  OTPKey: string = "";
  remainingTime: number;
  private countdownSubscription: Subscription;
  resultMessage: string = "";
  showVerifyButton: boolean = true;


  timeleft: any;
  timecounter: any = 0;
  isHiddenForgot: boolean = true;
  isHiddenOTP: boolean = true;
  isHiddenResetPassword: boolean = true;

  OTP: any;

  resetPasswordForm: FormGroup;

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

  clientCode: string = "";
  authConfigId: number = 0;
  isAllenDigital: boolean = false;

  constructor(

    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private _configService: AuthenticationService,  //  intialization of login and logout config 
    private alertService: AlertService,
    private cdr: ChangeDetectorRef

  ) { }

  ngOnInit() {


    this.sub = this.route.params.subscribe(params => {
      console.log('params', params);

      this.companyId = params['companyId'];
      this.userType = params['userType']
      this.clientCode = params['clientCode'] == null ? "" : params['clientCode'];
      this.isAllenDigital = this.clientCode != "" && this.clientCode.toUpperCase() == 'ALLEN' ? true : false;
      this.authConfigId = params['authConfigId']
      // In a real app: dispatch action to load the details here.
    });

    this.forgotPasswordForm = this.formBuilder.group({
      userName: ['', Validators.required],
      recaptcha: ['', Validators.required]
    });

  }

  // convenience getter for easy access to form fields
  get f() { return this.forgotPasswordForm.controls; }
  get g() { return this.resetPasswordForm.controls; }

  requestOTP() {
    this.submitted = true;
    this.OTP = null;

    // stop here if form is invalid
    if (this.forgotPasswordForm.invalid) {
      this.alertService.showWarning('Before you proceed to the reset password. Please complete the UserName/Captcha below.');
      return;
    }

    this.SpinnerShouldhide = true;
    // display form values on success
    // alert('SUCCESS!! :-)\n\n' + JSON.stringify(this.forgotPasswordForm.value, null, 4));
    this.timecounter = 0;
    this.timeleft = null;

    let requestURL_param = "companyId=" + this.companyId + "&userType=" + this.userType + "&userName=" + this.forgotPasswordForm.get('userName').value + "&authConfigId=" + this.authConfigId + "&clientCode=" + (this.clientCode == null ? "" : this.clientCode);
    console.log('requestURL_param', requestURL_param.toString());

    this._configService.getUserOTP(requestURL_param.toString()).subscribe((data: any) => {
      console.log(data);
      this.SpinnerShouldhide = false;
      if (data.Status) {
        this.startCountdown(this.configTimeLeft);
        let response = data.Result;
        // this.tempUserMobileNo = (response.MobileNumber.slice(response.MobileNumber.length - 3)); // response.MobileNumber;
        this.OTPKey = response.OTPKey;
        // this.tempUserMobileNo = "Test";
        // this.userId = response.Id;
        this.isHiddenForgot = false;
        this.isHiddenOTP = false;
        // this.forgotPasswordForm.reset();
      } else {

        this.alertService.showWarning(data.Message);
      }

    }, (e) => {
      this.SpinnerShouldhide = false;
    });



  }

  // ************************** One Time Password section start ***********************
  VerifyOTP() {

    if (this.OTP == null || this.OTP == undefined || this.OTP == "") {
      this.alertService.showInfo("To proceed, provide the OTP code sent to your registered mobile/email");
      return;
    }

    this.SpinnerShouldhide = true;
    this.resetPasswordForm = this.formBuilder.group({

      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(20), passwordStrengthValidator]],
      confirmPassword: ['', Validators.required],

    }, {
      validator: MustMatch('password', 'confirmPassword'),
      validators: passwordStrengthValidator
    });


    let requestURL_json = JSON.stringify({

      "UserId": this.OTPKey,
      "OTP": this.OTP.toString(),
      "ACID": this.authConfigId,
      "CC": this.clientCode

    })
    this._configService.validateOTP(requestURL_json).subscribe((data: any) => {
      console.log(data);
      let response = data.Result;
      this.SpinnerShouldhide = false;
      if (data.Result) {

        this.isHiddenOTP = true;
        this.isHiddenResetPassword = false;

      } else {
        this.OTP = null;
        this.alertService.showWarning(data.Message);
        this.resultMessage = data.Message;
        this.showVerifyButton = this.resultMessage.indexOf("exceeded the limit") == -1;
        if (!this.showVerifyButton) {        
          this.timecounter = 0;
          this.timeleft = null;
          if (this.timecounter <= 0) {
            this.countdownSubscription.unsubscribe();
          }
        }
      }

    }, (e) => {
      this.SpinnerShouldhide = false;

    });


  }

  onInput(event: any): void {
    this.OTP = this.OTP.toUpperCase();
  }

  request_ResendOTP() {

    this.resendSpinner = true;
    this.timecounter = 0;
    this.timeleft = null;

    this.OTP = null;

    let requestURL_param = "companyId=" + this.companyId + "&userType=" + this.userType + "&userName=" + this.forgotPasswordForm.get('userName').value + "&authConfigId=" + this.authConfigId + "&clientCode=" + (this.clientCode == null ? "" : this.clientCode);
    this._configService.getUserOTP(requestURL_param.toString()).subscribe((data: any) => {
      console.log(data);
      this.resendSpinner = false;
      if (data.Status) {

        let response = data.Result;
        this.remainingTime = this.configTimeLeft;
        this.OTPKey = response.OTPKey;
        this.startCountdown(this.configTimeLeft);
        this.alertService.showInfo("A new verification code has been successfully resent to your email/mobile");
        this.showVerifyButton = true;

      } else {

        this.alertService.showWarning(data.Message);
      }

    }, (e) => {
      this.resendSpinner = false;
    });


  }

  // ************************** One Time Password section End ***********************

  // ************************** Reset Password section start ***********************
  saveChanges() {
    this.Resetsubmitted = true;

    // stop here if form is invalid
    if (this.resetPasswordForm.invalid) {
      return;
    }
    this.SpinnerShouldhide = true;
    let requestURL_json = JSON.stringify({

      "UserId": this.OTPKey,
      "Password": this.resetPasswordForm.get('password').value,
      "OTP": this.OTP,
      "ACID": this.authConfigId,
      "CC": this.clientCode

    })
    this._configService.updatePassword(requestURL_json).subscribe((data: any) => {
      console.log(data);
      let response = data.Result;
      if (data.Result) {
        this.alertService.showSuccess('Congratulations! Your password has been reset successfully.');
        this.isHiddenOTP = true;
        this.isHiddenResetPassword = false;

        setTimeout(() => {
          this.SpinnerShouldhide = false;
          this.backtoLogin();
        }, 1000);

      } else {
        this.SpinnerShouldhide = false;
        this.alertService.showWarning(data.Message);
      }

    }, (e) => {
      this.SpinnerShouldhide = false;
    });


  }

  // ************************** Reset Password section End ***********************

  resendOTP() {

    this.request_ResendOTP();


  }


  backtoLogin() {

    if (this.userType == 3) {
      this.router.navigate(['/login/core'], { skipLocationChange: true });
    } else {
      const businessType = environment.environment.BusinessType;
      const loginRoute = (businessType === 1 || businessType === 2) ? `login/${this.clientCode}` : 'login';
      this.router.navigate([loginRoute], { skipLocationChange: true });
    }


  }

  goback(index: any) {

    this.captchaSuccess

    if (index == '1') {
      this.isHiddenForgot = true;
      this.isHiddenOTP = true;
      this.showVerifyButton = true;
      if (this.countdownSubscription) {
        this.countdownSubscription.unsubscribe();
      }
      this.timecounter = 0;
      this.timeleft = null; 
      this.forgotPasswordForm.controls['recaptcha'].setValue(null);
    }

    else if (index == "2") {

      this.isHiddenOTP = false;
      this.isHiddenResetPassword = true;
    }
  }

  // recaptcha -On click handling
  handleSuccess(captchaResponse: string): void {
    this.captchaSuccess = true;
    this.captchaResponse = captchaResponse;
    this.captchaIsExpired = false;
    this.cdr.detectChanges();
  }

  reset(): void {
    this.captchaElem.resetCaptcha();
  }

  handleReset(): void {
    this.captchaSuccess = false;
    this.captchaResponse = undefined;
    this.captchaIsExpired = false;
    this.cdr.detectChanges();
  }
  // handleLoad(): void {
  //   this.captchaIsLoaded = true;
  //   this.captchaIsExpired = false;
  //   this.cdr.detectChanges();
  // }

  // handleExpire(): void {
  //   this.captchaSuccess = false;
  //   this.captchaIsExpired = true;
  //   this.cdr.detectChanges();
  // }

  startCountdown(seconds) {
    let counter = seconds;

    this.countdownSubscription = interval(1000).subscribe(() => {
      const minutes = Math.floor(counter / 60);
      const seconds = counter % 60;

      this.timeleft = `Didn't get OTP? Resend in ${('0' + minutes).slice(-2)}:${('0' + seconds).slice(-2)}`;
      this.timecounter = counter;

      counter--;

      if (counter < 0) {
        this.countdownSubscription.unsubscribe();
        console.log('Laps done!');
      }
    });
  }


  ngOnDestroy() {
    this.sub.unsubscribe();
    if (this.countdownSubscription) {
      this.countdownSubscription.unsubscribe();
    }
  }
}
