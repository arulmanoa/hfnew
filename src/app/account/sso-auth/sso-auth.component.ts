import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from "angularx-social-login";
import { Compiler } from '@angular/core';
import { SessionKeys } from '../../_services/configs/app.config';
import { LoginResponses, _GeoLocation, _BrowserDetails, _NetworkDetails, _DeviceDetails, } from '../../_services/model/index'
import { ConfigService } from '../../_services/service/config.service';
import { SessionStorage } from '../../_services/service/session-storage.service';
import { AuthenticationService } from '../../_services/service/authentication.service';
import { AlertService } from '../../_services/service/alert.service';
import { Title } from '@angular/platform-browser';
import { environment } from "../../../environments/environment";
import { CookieService } from 'ngx-cookie-service';
import { ApiResponse, AuthenticationType } from '@services/model/Common/BaseModel';
import { apiResult } from '@services/model/apiResult';

@Component({
  selector: 'app-sso-auth',
  templateUrl: './sso-auth.component.html',
  styleUrls: ['./sso-auth.component.scss'],
  providers: [ConfigService],
})
export class SsoAuthComponent implements OnInit {

  formData: any;
  authKey: string = "";
  _apiResponse: ApiResponse;
  loginResponse: LoginResponses;

  BusinessType: any;

  hasErrorOccurred: boolean = false;
  FailerMessage: string = "";
  clientCode: string = "";
  isEnableTFAForWeb: boolean = false;
  SpinnerShouldhide: boolean = false;

  TFACode: string;

  constructor(
    private alertService: AlertService,
    private sessionService: SessionStorage,
    private _configService: AuthenticationService,
    private _compiler: Compiler,
    private googleService: AuthService,
    private titleService: Title,
    private router: Router,
    private route: ActivatedRoute,
    private cookieService: CookieService
  ) { }

  ngOnInit() {
    this.titleService.setTitle(environment.environment.applogintitle);
    this.route.queryParams.subscribe(params => {
      if (JSON.stringify(params) !== JSON.stringify({})) {
        sessionStorage.clear();
        this._compiler.clearCache();
        this.isEnableTFAForWeb = false;
        const { refId, err } = params;
        if (refId) {
          this.fetchFormData(refId);
        } else {
          err ? this.alertService.showWarning(err) : this.alertService.showWarning('There is some issue ! Please try again later');
        }
      }
    });
  }

  fetchFormData(token) {
    console.log('refId', token);
    this._configService.getSessionDetailsForSSO(token).subscribe(response => {
        console.log('Response from SESS:', response);
        if (response.Result && response.Status) {
          this.loginResponse = response.Result;
        
          try {
            this.SpinnerShouldhide = false;
            if (this.loginResponse && this.loginResponse.ClientList && this.loginResponse.ClientList.length) {
              this.clientCode = this.loginResponse.ClientList[0].LoginCode;
            }
            this.setCookie();
            this.session_subscription(this.loginResponse);
          } catch (Exception) {
            console.log("Exception Error: ", Exception);
            this.alertService.showWarning(`Something is wrong! ${Exception}`);
            this.SpinnerShouldhide = false;
          }
        } else {
          this.alertService.showWarning(response.Message);
          console.log(`Credential Error. ${response.Message}`);
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

  session_subscription(result: LoginResponses) {
    const isEssLogin: boolean = result.UIRoles && result.UIRoles.length === 1 && result.UIRoles[0].Role.Code === 'Employee';

    if (result.Company) {
      this.BusinessType = result.Company.LstCompanyBusinessTypeMapping != null ? result.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == result.Company.Id).BusinessType : 0;

      if (!isEssLogin && this.BusinessType !== 3 && !result.ClientList) {
        this.showClientInfoNotAvailable();
        return;
      }

      if (isEssLogin && this.BusinessType !== 3 && (!result.ClientList || result.ClientList.length === 0)) {
        this.showClientInfoNotAvailable();
        return;
      }

      if (this.BusinessType !== 3 && result.ClientList && result.ClientList.length > 0 && !result.ClientList.some(a => a.IsDefault)) {
        this.showClientInfoNotAvailable();
        return;
      }
    }

    if (result.UserDetails && result.UserDetails.IsMFAEnabledForWeb) {
      this.sessionService.setSesstionStorage(SessionKeys.Token, result.Token);
      this.isEnableTFAForWeb = true;
      return;
    }

    result.UIRolesCopy = result.UIRoles;
    this.storeSessionData(result);

    this.router.navigate(['app/dashboard']);
  }

  private storeSessionData(result: LoginResponses): void {
    this.sessionService.setSesstionStorage(SessionKeys.Token, result.Token);
    this.sessionService.setSesstionStorage(SessionKeys.LoginResponses, result);
    sessionStorage.setItem('currentUser', result.UserSession.UserId.toString());
    sessionStorage.setItem('loginUserId', result.UserDetails.UserName);
    // set AuthType to hide change Password in headerComponent dropdown
    const authTypeEnum = AuthenticationType.SSO;
    sessionStorage.setItem('AuthType', authTypeEnum.toString());
  }

  private showClientInfoNotAvailable() {
    this.alertService.showInfo("Please note: Client information is not available. Please contact service support Administration.");
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
          if (output && output.ClientList && output.ClientList.length) {
            this.clientCode = output.ClientList[0].LoginCode;
          }
          this.setCookie();
          this.storeSessionData(output);

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

  private handleLogoutState() {
    this.TFACode = null;
    this.isEnableTFAForWeb = false;
  }


  doCheckMax(event: any) {
    if (event.target.value.length > 6) {
      this.TFACode = (event.target.value.slice(0, 6));
    }
  }

  setCookie() {
    this.cookieService.set('clientCode', this.clientCode);
  }

  deleteCookie() {
    this.cookieService.delete('clientCode');
  }

}
