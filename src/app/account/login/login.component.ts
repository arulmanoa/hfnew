// import { Component, OnInit, ViewChild, ElementRef ,ViewEncapsulation} from '@angular/core';
// /** Error when invalid control is dirty, touched, or submitted. **/
// import { NgForm, FormGroup, FormBuilder, Validators, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
// import { trigger, style, animate, transition } from '@angular/animations';
// import { Router } from '@angular/router';
// import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
// import { GoogleLoginProvider } from "angularx-social-login";
// import { AuthService } from "angularx-social-login";

// // model and interface 
// import { MyErrorStateMatcherComponent } from '../../components/shared/MyErrorStateMatcherComponent';
// import { LoginCredential, Token, ClientLogin } from '../../components/Models/login-credential';
// import { LoginSessionDetails } from '../../components/Models/LoginSessionDetails';
// import { EndPointModel } from '../../components/Models/ConfigModel';
// import { AuthenticationConfiguration, ApiResponse } from '../../shared/models/Common/BaseModel';
// import { LoginModel, _GeoLocation, _BrowserDetails, _NetworkDetails, _DeviceDetails, _AuthenticationConfiguration }
// from '../../shared/models/Common/Authentication';
// import { LoginResponses } from '../../shared/models/Common/LoginResponses';

// // services
// import { ConfigService } from '../../components/Service/config.service'; // http services
// import { AuthenticationService } from '../../core/authentication/authentication.service'; // login and security services
// import { SessionStorage } from '../../core/utils/session-storage.service'; // session storage
// import { AlertService } from '../../core/alert/alert.service'; // alert service
// import { SessionKeys } from '../../configs/app.config'; // app config 


import { Component, OnInit, ViewChild, ElementRef, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
/** Error when invalid control is dirty, touched, or submitted. **/
import { NgForm, FormGroup, FormBuilder, Validators, FormControl, NG_VALUE_ACCESSOR, AbstractControl } from '@angular/forms';
import { trigger, style, animate, transition } from '@angular/animations';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GoogleLoginProvider } from "angularx-social-login";
import { AuthService } from "angularx-social-login";
import { Compiler } from '@angular/core';

// model and interface  
import {
  LoginCredential, ClientLogin, NavItem, LoginResponses, Roles, AccessControlType,
  AccessControl, LoginModel, _GeoLocation, _BrowserDetails, _NetworkDetails, _DeviceDetails, appSettings,
} from '../../_services/model/index'
import { _AuthenticationConfiguration, } from '../../_services/model/Common/Authentication'
import { AuthenticationConfiguration, ApiResponse, AuthenticationType } from '../../_services/model/Common/BaseModel';
import { SessionKeys } from '../../_services/configs/app.config'; // app config 
import { MyErrorStateMatcherComponent } from '../../shared/index'
// services
import { ConfigService } from '../../_services/service/config.service'; // http services  
import { SessionStorage } from '../../_services/service/session-storage.service'; // session storage 
import { AuthenticationService } from '../../_services/service/authentication.service'; // login and security services 
import { AlertService } from '../../_services/service/alert.service'; // alert service
import { CanDeactivate } from '@angular/router/src/utils/preactivation';
import { DOCUMENT, Title } from '@angular/platform-browser';
import { PlatformLocation } from '@angular/common';
import { environment } from "../../../environments/environment";
import { ReCaptcha2Component } from 'ngx-captcha';
import { apiResult } from 'src/app/_services/model/apiResult';
import { CookieService } from 'ngx-cookie-service';
//import { Beacon } from '@beacon.li/bar';

@Component({
  selector: 'app-login',
  animations: [
    trigger(
      'enterAnimation', [
      transition(':enter', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate('500ms', style({ transform: 'translateX(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        style({ transform: 'translateX(0)', opacity: 1 }),
        animate('500ms', style({ transform: 'translateX(100%)', opacity: 0 }))
      ])
    ]
    )
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [ConfigService],
  // encapsulation: ViewEncapsulation.None, // Use to disable CSS Encapsulation for this component 
})


export class LoginComponent implements OnInit {

  @ViewChild('LoginButton') LoginButton: ElementRef;

  isClassLoginActive: boolean = true; // deputees radio
  isClassClientActive: boolean = false; // client code radio
  isClientCodeActivated: boolean = false;  // client login forms and google

  user: any;
  loggedIn: any;

  isLive: boolean = true; // url path live section
  isCoreEmployee: boolean = false; // company employee login
  SpinnerShouldhide: boolean = false; // button click action spinner 

  msg: string; // error message

  /** Login Form group intialization and declaration and model interface**/

  // _token: Token;
  loginFormModel: LoginCredential;
  ClientLoginModel: ClientLogin;
  // _credential: LoginCredential;
  // _loginSessionDetails: LoginSessionDetails;

  userNameFormControl = new FormControl('', [Validators.required]);
  passwordFormControl = new FormControl('', [Validators.required]);

  loginErrorMatcher = new MyErrorStateMatcherComponent();
  // apiEndpoints: EndPointModel;
  loginForm: FormGroup;
  ClientCodeForm: FormGroup;
  ClientForm: FormGroup;

  // ** forms on submit validation ** //

  submitted = false;
  Clientsubmitted = false;
  _client_submitted = false;

  //  ** security api calls param and authentcation config from server ** 
  authKey: string = "";
  _authenticationConfiguration: AuthenticationConfiguration;
  _authenticationConfiguration2: AuthenticationConfiguration;
  _authenticationConfiguration_Common: AuthenticationConfiguration;
  _apiResponse: ApiResponse;

  // hide and show based on authentication config

  _isAuthTypEmployeeForm: boolean = true;
  _isAuthTypEmployeeGoogle: boolean = false;
  _isAuthTypCompanyForm: boolean = true;
  _isAuthTypCompanyGoogle: boolean = true;
  _isAuthTypClientForm: boolean = true;
  _isAuthTypClientGoogle: boolean = true;

  id = 'rer';

  loginModel: LoginModel;

  // result of login details

  loginResponse: LoginResponses;
  apploginlogo: any;
  BusinessType: any;

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
  public isCaptchaVerificationRequired: boolean = false;
  isEnableTFAForWeb: boolean = false;
  TFACode: string;
  TFACode1: string;
  TFACode2: string;
  TFACode3: string;
  TFACode4: string;
  TFACode5: string;

  hasErrorOccurred: boolean = false;
  FailerMessage: string = "";
  clientCode: string = "";
  isAuthorized: boolean = false;
  isAllen : boolean = false;

  constructor(

    private alertService: AlertService,
    private formBuilder: FormBuilder,
    private router: Router,
    platformLocation: PlatformLocation,
    private sessionService: SessionStorage,
    private _configService: AuthenticationService,  //  intialization of login and logout config 
    private modalService: NgbModal,
    private _compiler: Compiler,
    private googleService: AuthService, // intialization of social login
    private titleService: Title,
    private activeRouter: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private cookieService: CookieService

  ) {

   
    window.addEventListener("beforeunload", function (e) {
      // var confirmationMessage = "\o/";
      console.log("cond");
      // e.returnValue = confirmationMessage;
      // e.preventDefault();     // Gecko, Trident, Chrome 34+ 
      // return confirmationMessage;              // Gecko, WebKit, Chrome <34
    });

  }

  get f() { return this.loginForm.controls; } // reactive forms validation 
  get c() { return this.ClientForm.controls; } // reactive forms validation 
  get d() { return this.ClientCodeForm.controls; } // reactive forms validation 

  deleteCookie() {
    this.cookieService.delete('clientCode');
  }

  ngAfterViewInit() {
    const overlayElement = document.getElementById('overlay') as HTMLInputElement;
    overlayElement.style.display = "flex";
  }

  ngOnInit() {

    this.activeRouter.params.subscribe(params => {
      console.log('KEY PARAMS :: ', params);

      const businessType = environment.environment.BusinessType;
      const hasParams = Object.keys(params).length > 0;
      if (((businessType === 1 || businessType == 2) && !hasParams) || (businessType === 3 && hasParams)) {
        this.isAuthorized = false;
      } else {
        this.deleteCookie();
        // this.setCookie();
        this.clientCode = (businessType === 1 || businessType == 2) ? params.clientCode : "";
        this.isAllen =  this.clientCode != "" &&  this.clientCode.toUpperCase() == 'ALLEN' ? true : false;
        this.isAuthorized = true;
      }

      this.loginFormModel = { userName: '', password: '', grant_type: '' };
      this.ClientLoginModel = { clientCode: '', userName: '', password: '' };
      this.loginModel = {
        AuthConfiguration: _AuthenticationConfiguration,
        CompanyId: 0,
        SSOEmailId: '',
        UserType: 0,
        ClientId: 0,
        UserName: '',
        Password: '',
        Location: _GeoLocation,
        IMEI: '',
        Network: _NetworkDetails,
        Browser: _BrowserDetails,
        Device: _DeviceDetails,
        AuthType: 0,
        ClientCode: this.clientCode
      }

    });

    // console.log((platformLocation as any).location);
    // console.log((platformLocation as any).location.href);
    // console.log((platformLocation as any).location.origin);

    this.getAppConfig();

    this.isEnableTFAForWeb = false;
    this.apploginlogo = environment.environment.applogo;
    this.titleService.setTitle(environment.environment.applogintitle);    // let localURL_Path = this.router.url.includes(`${environment.environment.UrlCodeForNavigation}`) || this.router.url.includes(`login/${environment.environment.UrlCodeForNavigation}`);
    // console.log(localURL_Path);
    // if (localURL_Path) {
    //   this.isLive = false;
    //   this.isCoreEmployee = true;
    //   this.authKey = environment.environment.AuthKey;
    // }


    this.activeRouter.paramMap.subscribe((params: ParamMap) => {
      if (params.get('companyCode') != null && params.get('companyCode') != undefined) {
        this.isLive = false;
        this.isCoreEmployee = true;
        this.authKey = params.get('companyCode');
      }
    })
    this.isClassLoginActive = true;
    this.initial_api_request(); 

    // this.autoGoogleLogin();

    this.loginForm = this.formBuilder.group({
      UserName: ['', Validators.required],
      Password: ['', Validators.required],
      recaptcha: ['']
    });

    this.ClientCodeForm = this.formBuilder.group({
      Code: ['', Validators.required],
    });

    // this.apiEndpoints = <EndPointModel>JSON.parse(this.sessionService.getSessionStorage(SessionKeys.API_Endpoints));


    // this._loginSessionDetails = this.sessionService.getLoginSessionDetailsValues();
    // if (this._loginSessionDetails !== null) {
    //   this.router.navigate(['home/Dashboard']);
    // }
    //this.drawerRef.close();
    for (var i = 0; i <= 100; i++) {
      $(`#cdk-overlay-${i}`).hide();
    }
    this._configService.logout().subscribe((response) => {

    });
    this._configService.google_signOut();
  }

  initial_api_request() {
    const requestParams = `urlCode=${environment.environment.urlCode}&authKey=${this.authKey}`;

    this._configService.getAuthenticationConfiguration(requestParams).subscribe(
      (data: any) => {
        const response = JSON.parse(data.Result);
        this._authenticationConfiguration = response;
        this._authenticationConfiguration_Common = this._authenticationConfiguration;
        this.isCaptchaVerificationRequired = this._authenticationConfiguration_Common.IsCaptchaRequired;

        this.updateValidation(this.isCaptchaVerificationRequired, this.loginForm.get('recaptcha'));

        if (this._authenticationConfiguration.KeyName === "core") {
          this._isAuthTypCompanyForm = this._authenticationConfiguration.UserType !== 3 || this._authenticationConfiguration.AuthType !== 0;
          this._isAuthTypCompanyGoogle = this._authenticationConfiguration.UserType !== 3 || this._authenticationConfiguration.AuthType !== 2;
        } else {
          this._isAuthTypEmployeeForm = this._authenticationConfiguration.AuthType == AuthenticationType.Forms || this._authenticationConfiguration.AuthType == AuthenticationType.FormsWithSSO;
          this._isAuthTypEmployeeGoogle = this._authenticationConfiguration.AuthType == AuthenticationType.SSO || this._authenticationConfiguration.AuthType == AuthenticationType.FormsWithSSO;
          sessionStorage.setItem('AuthType', this._authenticationConfiguration.AuthType.toString());
          if (this._authenticationConfiguration.AuthType == AuthenticationType.SSO) {
            // this.signInWithGoogleSSO();
          }
        }
      },
      (error) => {
        // Handle error if needed
      }
    );

    setTimeout(() => {
      const overlayElement = document.getElementById('overlay');
      if (overlayElement) {
        overlayElement.style.display = "none";
      }
    }, 1000);
  }
  //TODO:To update formgroup validation
  updateValidation(value, control: AbstractControl) {
    if (value) {
      control.setValidators([Validators.required]);
    } else {
      control.clearValidators();
      control.setErrors(null);
    }
    control.updateValueAndValidity();
  }

  autoGoogleLogin() {

    this.googleService.authState.subscribe((user) => {
      this.user = user;
      console.log("USER : ", user);

      this.loggedIn = (user != null);
    });
  }

  activeDeputy() {

    this.isClassLoginActive = true;
    this.isClassClientActive = false;

    this.isClientCodeActivated = false;
    this._authenticationConfiguration_Common = this._authenticationConfiguration;
    // console.log(this._authenticationConfiguration_Common);

  }
  activeClient() {

    this.isClassLoginActive = false;
    this.isClassClientActive = true;

    this.isClientCodeActivated = false;
    this._authenticationConfiguration_Common = this._authenticationConfiguration2;
    // console.log(this._authenticationConfiguration_Common);
  }

  // Let's an app config settings for BASE End points

  getAppConfig() {

    // this._configService.get().subscribe(config => {
    //   this.apiEndpoints = config;
    //   this.sessionService.setSesstionStorage(SessionKeys.API_Endpoints, this.apiEndpoints);
    //   this.apiEndpoints = <EndPointModel>JSON.parse(this.sessionService.getSessionStorage(SessionKeys.API_Endpoints));
    // },
    //   error => { this.msg = <any>error; });
  }


  // forgot password 

  forgot_password(index: any) {

    // console.log(this._authenticationConfiguration_Common);
    if (this.clientCode === null || this.clientCode.trim().length === 0) {
      this.clientCode = "";
    }
    this.router.navigate(['/forgotpassword', { authConfigId: this._authenticationConfiguration_Common.Id, companyId: this._authenticationConfiguration_Common.CompanyId, userType: this._authenticationConfiguration_Common.UserType, clientCode: this.clientCode }], { skipLocationChange: true });



  }

  //  for client login  

  ClientCodeSubmit(): void {

    this.Clientsubmitted = true;
    if (this.ClientCodeForm.invalid) {
      // this.alertService.showInfo("Please fill the Mandatory fields ")
      return;
    }
    this.SpinnerShouldhide = true;

    this.ClientLoginModel.clientCode = this.ClientCodeForm.get('Code').value;

    let requestURL_param = "companyId=" + '5' + "&clientCode=" + this.ClientLoginModel.clientCode;
    this._configService.getAuthConfigDataByCompanyAndClient(requestURL_param.toString()).subscribe((data: any) => {
      this.SpinnerShouldhide = false;

      if (data.Result) {
        let response = JSON.parse(data.Result);
        this._authenticationConfiguration2 = response;
        this._authenticationConfiguration_Common = this._authenticationConfiguration2;
        this._isAuthTypClientForm = this._authenticationConfiguration2.UserType === 2 && this._authenticationConfiguration2.AuthType === 0 ? false : true;
        this._isAuthTypClientGoogle = this._authenticationConfiguration2.UserType === 2 && this._authenticationConfiguration2.AuthType === 2 ? false : true;

        this.isClassClientActive = false;
        this.isClientCodeActivated = true;
      } else {

        this.alertService.showWarning("You have entered an invalid Client Code. Please try again.");

      }
    }, (ERROR) => {
      this.SpinnerShouldhide = false;
      console.log("ERROR : ", ERROR);

    });

    this.ClientForm = this.formBuilder.group({
      UserName: ['', Validators.required],
      Password: ['', Validators.required]
    });

    // alert(this.ClientLoginModel.clientCode)
    // this.alertService.success("", this.ClientLoginModel.clientCode);

  }

  client_api_request() {

  }

  // for all clients login
  ClientSubmit(): void {

    this._client_submitted = true;
    if (this.ClientForm.invalid) {
      // this.alertService.showInfo("Please fill the Mandatory fields ")
      return;
    }
    this.final_Login();

  }

  // for deputee/employee Login 
  generateToken(): void {
    this.submitted = true;
    if (this.loginForm.invalid) {
      // this.alertService.showInfo("Please fill the Mandatory fields ")
      return;
    }
    this.final_Login();

  }

  // for company employee login 

  coreLogin(): void {


    this.submitted = true;
    if (this.loginForm.invalid) {
      // this.alertService.showInfo("Please fill the Mandatory field(s)")

      return;
    }
    this.final_Login();

  }

  // final submission, session and verification
  final_Login(): void {
    // Clear session storage and template cache
    sessionStorage.clear();
    this._compiler.clearCache();

    this.SpinnerShouldhide = true;
    this.setCookie();
    this.loginModel.AuthConfiguration = this._authenticationConfiguration_Common;
    this.loginModel.CompanyId = this._authenticationConfiguration_Common.CompanyId;
    this.loginModel.UserType = this._authenticationConfiguration_Common.UserType;
    this.loginModel.ClientId = this._authenticationConfiguration_Common.ClientId;
    this.loginModel.AuthType = this._authenticationConfiguration_Common.AuthType;

    if (this._authenticationConfiguration_Common.AuthType === 0) {
      if (this._authenticationConfiguration_Common.UserType === 2) {
        this.loginModel.UserName = this.ClientForm.get('UserName').value;
        this.loginModel.Password = this.ClientForm.get('Password').value;
      } else if (
        this._authenticationConfiguration_Common.UserType === 1 ||
        this._authenticationConfiguration_Common.UserType === 3 ||
        this._authenticationConfiguration_Common.UserType === 4
      ) {
        this.loginModel.UserName = this.loginForm.get('UserName').value;
        this.loginModel.Password = this.loginForm.get('Password').value;
      }
    } else if (this._authenticationConfiguration_Common.AuthType === 3) {
      this.loginModel.UserName = this.loginForm.get('UserName').value;
      this.loginModel.Password = this.loginForm.get('Password').value;
    }

    this.loginModel.IMEI = "";
    this.loginModel.Device = _DeviceDetails;
    this.loginModel.Network = _NetworkDetails;
    this.loginModel.Location = _GeoLocation;
    this.loginModel.Browser = _BrowserDetails;

    const credential = JSON.stringify(this.loginModel);
    
    this._configService.login(credential).subscribe(
      (data: any) => {
        if (data.Result && data.Status) {
          this.loginResponse = data.Result;

          try {
            this.SpinnerShouldhide = false;
            this.setCookie();
            this.Session_Subscribtion(this.loginResponse);
          } catch (Exception) {
            console.log("Exception Error: ", Exception);
            this.alertService.showWarning(`Something is wrong! ${Exception}`);
            this.SpinnerShouldhide = false;
          }
        } else {
          this.alertService.showWarning(data.Message);
          console.log(`Credential Error. ${data.Message}`);
          this.SpinnerShouldhide = false;
        }
      },
      (err) => {
        this.alertService.showWarning(`Something is wrong! ${err}`);
        console.log("Something is wrong! :", err);
        this.SpinnerShouldhide = false;
      }
    );
  }

  Session_Subscribtion(result: LoginResponses) {
    let userId = this.loginForm.get('UserName').value;

    // TO BE CHECKED CLIENT LIST 
    var isEssLogin: boolean = false;
    if (result.UIRoles && result.UIRoles.length == 1) {
      result.UIRoles[0].Role.Code == 'Employee' ? isEssLogin = true : isEssLogin = false;
    }

    if (result.Company) {

      this.BusinessType = result.Company.LstCompanyBusinessTypeMapping != null ? result.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == result.Company.Id).BusinessType : 0;
      if (!isEssLogin && this.BusinessType != 3 && result.ClientList == null) {
        this.alertService.showInfo("Please note: Client information is not available.  Please contact service support Administration.")
        return;
      } else if (isEssLogin && this.BusinessType != 3 && result.ClientList != null && result.ClientList.length == 0) {
        this.alertService.showInfo("Please note: Client information is not available.  Please contact service support Administration.")
        return;
      }

      if (this.BusinessType != 3 && result.ClientList != null && result.ClientList.length > 0 && result.ClientList != null && result.ClientList.filter(a => a.IsDefault == true).length == 0) {
        this.alertService.showInfo("Please note: Client information is not available.  Please contact service support Administration.")
        return;
      }

    }



    if (result.UserDetails && result.UserDetails.IsMFAEnabledForWeb) {
      this.sessionService.setSesstionStorage(SessionKeys.Token, result.Token);
      this.isEnableTFAForWeb = true;
      return;
    }
    result.UIRolesCopy = result.UIRoles;
    this.sessionService.setSesstionStorage(SessionKeys.Token, result.Token);
    this.sessionService.setSesstionStorage(SessionKeys.LoginResponses, result);

    sessionStorage.setItem('currentUser', result.UserSession.UserId.toString());

    var test: LoginResponses;
    test = this.sessionService.getSessionStorage(SessionKeys.LoginResponses)
    // console.log(test);
    sessionStorage.setItem('loginUserId', this.loginForm.get('UserName').value);
    let userName = result.UserSession.PersonName;
    let roleCode = result.UIRoles[0].Role.Code;
    // Beacon.loadUser(userId, {name: userName, roleCode});
    this.setCookie();
    // this.router.navigate(['twofactorauth']);
    // return;
    this.router.navigate(['app/dashboard']);

  }

  setCookie() {
    this.cookieService.set('clientCode', this.clientCode);
  }

  // Google provider 

  signInWithGoogle(): void {
    this.googleService.signIn(GoogleLoginProvider.PROVIDER_ID).then((user) => {
      console.log(user);
      this.loginModel.SSOEmailId = user.email;
      this.final_Login();
    });
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

  doVerifyTFACode() {

    this.clearErrorState();

    if (!this.TFACode) {
      this.handleError('Please enter the 6-digit security code before proceeding.');
      return;
    }

    this.SpinnerShouldhide = true;
    this._configService.VerifyMFA(this.TFACode).subscribe(
      (result: apiResult) => {
        console.log('apiR:', result);
        this.SpinnerShouldhide = false;

        if (result.Status) {
          const output: LoginResponses = result.Result as any;
          output.UIRolesCopy = output.UIRoles;

          this.sessionService.setSesstionStorage(SessionKeys.Token, output.Token);
          this.sessionService.setSesstionStorage(SessionKeys.LoginResponses, output);
          sessionStorage.setItem('currentUser', output.UserSession.UserId.toString());
          sessionStorage.setItem('loginUserId', this.loginForm.get('UserName').value);

          this.router.navigate(['app/dashboard']);
        } else {
          if (result.Result && JSON.parse(result.Result).IsLoggedOut) {
            this.handleLogoutState();
          } else {
            this.handleError(result.Message);
          }
        }
      },
      (error) => {
        this.handleError(`Something went wrong! ${error}`);
      }
    );
  }

  backtoLogin() {
    this.sessionService.delSessionStorage(SessionKeys.Token);
    this.clearErrorState();
    this.TFACode = null;
    this.isEnableTFAForWeb = false;
  }

  private handleError(errorMessage: string) {
    this.hasErrorOccurred = true;
    this.FailerMessage = errorMessage;
    this.alertService.showWarning(errorMessage);
  }

  private clearErrorState() {
    this.hasErrorOccurred = false;
    this.FailerMessage = '';
  }

  private handleLogoutState() {
    this.TFACode = null;
    this.isEnableTFAForWeb = false;
  }

  doCheckMax(event: any) {
    if (event.target.value.length > 6) {
      this.TFACode = (event.target.value.slice(0, 6));
    }
  }


  otpController(event, next, prev) {
    if (event.target.value.length < 1 && prev) {
      document.querySelector<HTMLInputElement>(`#${prev}`).focus();
    }
    else if (next && event.target.value.length > 0) {
      document.querySelector<HTMLInputElement>(`#${next}`).focus();
    }
    else {
      return 0;
    }

  }

  signInWithGoogleSSO(): void {
    sessionStorage.clear();
    this._compiler.clearCache();
    const url = environment.environment.SAML_BASE_URL + appSettings.GET_SPLOGIN;
    window.location.href = url;
  }

  //! Note: This is to fix to the locking of username & password fields by Chrome browser when AuthType = 3
  unfreezeInput(el) {
    // setting input value again makes it editable
    el.target.value = el.target.value;
  }


}
