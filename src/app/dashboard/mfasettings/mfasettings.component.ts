import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { LoginResponses, UIMode } from 'src/app/_services/model';
import { AuthenticationService, SessionStorage } from 'src/app/_services/service';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { environment } from 'src/environments/environment';
import { DomSanitizer } from '@angular/platform-browser';
import { apiResult } from 'src/app/_services/model/apiResult';
import { Router } from '@angular/router';

@Component({
  selector: 'app-mfasettings',
  templateUrl: './mfasettings.component.html',
  styleUrls: ['./mfasettings.component.css']
})
export class MfasettingsComponent implements OnInit {
  loginSessionDetails: LoginResponses;
  BusinessType: number = 0;
  CompanyId: number = 0;

  // COMN   
  hasErrorOccurred: boolean = false;
  FailerMessage: string = "";

  // ENABLE MFA
  isEnableTFA: boolean = false;

  // REQUEST OTP
  spinner: boolean = false;
  timeleft: any;
  timecounter: any = 0;

  // GENERATE QR CODE 
  OTP: number;
  QRCode: string | any;
  TFACode: number;

  // QR CODE
  isEnableTFAForWeb: boolean = false
  isEnableTFAForMobile: boolean = false;

  RegisteredMFA: boolean = false;
  Setup2Factor: boolean = false;
  VerifyOTP: boolean = false;
  NonRegisteredMFA: boolean = true;

  // Data Binding

  smallspinner: boolean = false;
  maskedEmail: string = "";

  MFAEnabledForWeb: boolean = false;
  MFAEnabledForMobile: boolean = false;
  IsRequiredReVerifyMFABtn: boolean = false;
  clientLogoLink: any;
  clientminiLogoLink: any;

  ShouldShowChangeSettings: boolean = false;
  DisableMFA: boolean = false;
  MFASecurityCode: string;

  public configTimeLeft = environment.environment.OTPTimeLeftSec;
  constructor(
    private activeModal: NgbActiveModal,
    private sessionService: SessionStorage,
    private authService: AuthenticationService,
    private _sanitizer: DomSanitizer,
    private router: Router,

  ) { }

  ngOnInit() {
    this.IsRequiredReVerifyMFABtn = environment.environment.IsRequiredReVerifyMFABtn;
    this.loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses));
    this.BusinessType = this.loginSessionDetails.Company.LstCompanyBusinessTypeMapping != null ? this.loginSessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this.loginSessionDetails.Company.Id).BusinessType : 0;
    this.CompanyId = this.loginSessionDetails.Company.Id;
    console.log('sess', this.loginSessionDetails);
    this.getCompanyLogo();
    this.MFAEnabledForWeb = this.loginSessionDetails.UserDetails.IsMFAEnabledForWeb
    this.MFAEnabledForMobile = this.loginSessionDetails.UserDetails.IsMFAEnabledForMobile

    if (this.MFAEnabledForMobile == true || this.MFAEnabledForWeb == true) {
      this.RegisteredMFA = true;
      this.NonRegisteredMFA = false;
      this.isEnableTFA = true;
    } else {
      this.RegisteredMFA = false;
      this.NonRegisteredMFA = true;
    }

  }

  getCompanyLogo() {

    this.clientLogoLink = 'logo.png';
    this.clientminiLogoLink = 'cielminilogo.png';

    if (this.loginSessionDetails.CompanyLogoLink != "" && this.loginSessionDetails.CompanyLogoLink != null && this.BusinessType == 3) {
      let jsonObject = JSON.parse(this.loginSessionDetails.CompanyLogoLink)
      this.clientLogoLink = jsonObject.logo;
      this.clientminiLogoLink = jsonObject.minilogo;
    } else if (this.loginSessionDetails.ClientList != null && this.loginSessionDetails.ClientList.length > 0 && (this.BusinessType == 1 || this.BusinessType == 2)) {
      let isDefualtExist = (this.loginSessionDetails.ClientList.find(a => a.Id == Number(this.sessionService.getSessionStorage("default_SME_ClientId"))));
      if (isDefualtExist != null && isDefualtExist != undefined) {
        let jsonObject = JSON.parse(this.loginSessionDetails.ClientList.find(a => a.Id == Number(this.sessionService.getSessionStorage("default_SME_ClientId"))).ClientLogoURL);
        this.clientLogoLink = jsonObject.logo;
        this.clientminiLogoLink = jsonObject.minilogo;
      } else {
        let jsonObject = JSON.parse(this.loginSessionDetails.ClientList[0].ClientLogoURL);
        this.clientLogoLink = jsonObject.logo;
        this.clientminiLogoLink = jsonObject.minilogo;
      }
    }
  }

  doRequestOTP() {

    this.hasErrorOccurred = false;
    this.FailerMessage = "";

    console.log('isEnableTFA', this.isEnableTFA);

    if (this.isEnableTFA == false) {
      this.hasErrorOccurred = true;
      this.FailerMessage = 'You must enable the MFA checkbox before moving ahead.'
      return;
    }

    this.smallspinner = true;
    this.timecounter = 0;
    this.timeleft = null;
    this.SendOTPForMFA().then((res) => {
      if (res == true) {
        this.smallspinner = false;
        this.NonRegisteredMFA = false;
        this.RegisteredMFA = false;
        this.Setup2Factor = false;
        this.VerifyOTP = true;
      }
    });


  }

  SendOTPForMFA() {
    const promise = new Promise((res, rej) => {

      this.authService.SendOTPForMFA().subscribe((result) => {
        let apiR: apiResult = result;
        this.spinner = false;
        if (apiR.Status) {
          this.maskedEmail = apiR.Result;
          this.startCountdown(this.configTimeLeft);
          console.log('result', result);
          res(true);
        }
        else {
          this.smallspinner = false;
          this.hasErrorOccurred = true;
          this.FailerMessage = apiR.Message;
        }


      })
    });
    return promise;

  }

  resendOTP() {

    this.spinner = true;
    this.SendOTPForMFA().then((res) => {
    });

  }

  startCountdown(seconds) {
    let counter = seconds;
    const interval = setInterval(() => {
      var start = Date.now()
      var diff = Date.now() - start, ns = (((3e5 - diff) / 1000) >> 0), m = (ns / 60) >> 0, s = ns - m * 60;
      if (diff > (3e5)) { start = Date.now() }
      this.timeleft = ` ${('' + counter).length > 1 ? '' : '0'} ` + counter;
      this.timecounter = counter;
      counter--;
      if (counter < 0) {
        clearInterval(interval);
        console.log('Ding!');
      }
    }, 1000);
  }

  doChangeSettings() {
    this.DisableMFA = true;
    this.RegisteredMFA = false;
  }
  doDisableMFA() {

    const req_payload = JSON.stringify({
      "Code": this.MFASecurityCode.toString(),
      "IsMFAEnabledForWeb": this.MFAEnabledForWeb,
      "IsMFAEnabledForMobile": this.MFAEnabledForMobile
    });

    this.hasErrorOccurred = false;
    this.FailerMessage = "";


    if (this.MFASecurityCode == null || this.MFASecurityCode == undefined) {
      this.hasErrorOccurred = true;
      this.FailerMessage = 'Please enter 6-digit security code before moving ahead.'
      return;
    }
    this.smallspinner = true;

    console.log('req_payload', req_payload);
    this.authService.DisableMFA(req_payload).subscribe((result) => {
      console.log('apiR :', result);
      let apiR: apiResult = result;
      if (apiR.Status) {
        this.smallspinner = false;
        this.loginSessionDetails.UserDetails.IsMFAEnabledForWeb = this.MFAEnabledForWeb;
        this.loginSessionDetails.UserDetails.IsMFAEnabledForMobile = this.MFAEnabledForMobile;
        this.sessionService.setSesstionStorage(SessionKeys.LoginResponses, this.loginSessionDetails);
        this.cancel();

      } else {
        this.smallspinner = false;
        this.hasErrorOccurred = true;
        this.FailerMessage = apiR.Message;
      }
    })

  }

  doMFAChange(event, Mode) {
    this.ShouldShowChangeSettings = true;
  }

  doVerifyOTP() {

    this.hasErrorOccurred = false;
    this.FailerMessage = "";

    if (this.OTP == null || this.OTP == undefined) {
      this.hasErrorOccurred = true;
      this.FailerMessage = 'Please enter a valid OTP to confirm your account'
      return;
    }

    this.smallspinner = true;
    this.authService.GetQRCodeForMFA(this.OTP).subscribe((result) => {
      console.log('apiR :', result);
      let apiR: apiResult = result;
      if (apiR.Status) {
        this.smallspinner = false;
        this.QRCode = this._sanitizer.bypassSecurityTrustResourceUrl(result.Result);
        this.NonRegisteredMFA = false;
        this.RegisteredMFA = false;
        this.Setup2Factor = true;
        this.VerifyOTP = false;
      }
      else {
        this.smallspinner = false;
        this.hasErrorOccurred = true;
        this.FailerMessage = apiR.Message;
      }

    });


  }




  doEnbaleTFA() {
    const req_payload = JSON.stringify({
      "Code": this.TFACode,
      "IsMFAEnabledForWeb": this.isEnableTFAForWeb,
      "IsMFAEnabledForMobile": this.isEnableTFAForMobile
    });

    this.hasErrorOccurred = false;
    this.FailerMessage = "";


    if (this.TFACode == null || this.TFACode == undefined) {
      this.hasErrorOccurred = true;
      this.FailerMessage = 'Scan this QR Code and type the 6-digit security code before moving ahead.'
      return;
    }

    if (this.isEnableTFAForWeb == false) {
      this.hasErrorOccurred = true;
      this.FailerMessage = 'You must have enabled the web app option in the above settings.'
      return;
    }

    this.smallspinner = true;

    this.authService.EnableMFA(req_payload).subscribe((result) => {
      console.log('apiR :', result);
      let apiR: apiResult = result;
      if (apiR.Status) {
        this.smallspinner = false;


        var sessionDetails: LoginResponses = apiR.Result as any;

        this.loginSessionDetails.UserDetails.IsMFAEnabledForWeb = sessionDetails.UserDetails.IsMFAEnabledForWeb
        this.loginSessionDetails.UserDetails.IsMFAEnabledForMobile = sessionDetails.UserDetails.IsMFAEnabledForMobile;
        this.sessionService.setSesstionStorage(SessionKeys.LoginResponses, this.loginSessionDetails);

        this.MFAEnabledForWeb = sessionDetails.UserDetails.IsMFAEnabledForWeb
        this.MFAEnabledForMobile = sessionDetails.UserDetails.IsMFAEnabledForMobile

        if (this.MFAEnabledForMobile == true || this.MFAEnabledForWeb == true) {
          this.RegisteredMFA = true;
          this.NonRegisteredMFA = false;
          this.isEnableTFA = true;
        } else {
          this.RegisteredMFA = false;
          this.NonRegisteredMFA = true;
        }
        this.Setup2Factor = false;
        this.VerifyOTP = false;
        this.cancel();

      } else {

        if (!apiR.Status && apiR.Result != null) {
          const logout = JSON.parse(apiR.Result);
          if (logout.IsLoggedOut) {
            this.TFACode = null;
            this.isEnableTFAForWeb = false;
            this.cancel();
            this.authService.logout().subscribe((response) => {

            });
            this.authService.google_signOut();
            this.router.navigate(['login']);
            return;
          }

        }


        this.smallspinner = false;
        this.hasErrorOccurred = true;
        this.FailerMessage = apiR.Message;
      }
    })


  }

  cancel() {
    this.activeModal.close('Modal Closed');
  }
}
