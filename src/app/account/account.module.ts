import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { CookieService } from 'ngx-cookie-service';
import { NgxCaptchaModule } from 'ngx-captcha';


import { AngularFontAwesomeModule } from 'angular-font-awesome';

import * as bootstrap from "bootstrap";
import * as $ from "jquery";
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PreventDoubleSubmitModule } from 'ngx-prevent-double-submission';
import { DeviceDetectorModule } from 'ngx-device-detector';
import { SuccessScreenComponent } from '../shared/components/success-screen/success-screen.component';


import { EncrDecrService } from '../_services/service/encr-decr.service';
import { LoginComponent } from './login/login.component';
import { ForgotpasswordComponent } from './forgotpassword/forgotpassword.component';
import { CandidateOTPComponent } from './candidate-otp/candidate-otp.component';
import { AccessblockedComponent } from './accessblocked/accessblocked.component';
import { ChangepasswordComponent } from './changepassword/changepassword.component';
import { AccountRoutingModule } from './account-routing.module';
import { CandidateAcceptanceComponent } from '../views/candidate/candidate-acceptance/candidate-acceptance.component';
import { UnauthorizedComponent } from '../unauthorized/unauthorized.component';
import { MaintenanceComponent } from '../maintenance/maintenance.component';
import { SharedModule } from '../shared/shared.module';
import { OnboardingComponent } from '../views/onboarding/onboarding.component';
import { AngularSlickgridModule } from 'angular-slickgrid';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { LightboxModule } from 'ngx-lightbox';
import { TextMaskModule } from 'angular2-text-mask';
import { BsDatepickerModule } from 'ngx-bootstrap';
import { LayoutModule } from '../layouts/layout.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { OnboardingrequestComponent } from '../views/onboarding/onboardingrequest/onboardingrequest.component';
import { DynamicuiComponent } from '../views/dynamicui/dynamicui/dynamicui.component';
import { SuccessuiComponent } from '../views/dynamicui/successui/successui.component';
import { TwoFactorAuthenticatorComponent } from './two-factor-authenticator/two-factor-authenticator.component';
import { AadhaarVerificationComponent } from '../views/onboarding/shared/modals/aadhaar-verification/aadhaar-verification.component';
import { SurveyComponent } from '../views/onboarding/shared/survey/survey.component';
import { SsoAuthComponent } from './sso-auth/sso-auth.component';
import { UpperCaseInputDirective } from '../../app/views/onboarding/shared/directives/UppercaseInputDirective';
import { AutoCompleteOffDirective } from '../../app/views/onboarding/shared/directives/AutocompleteOffDirective';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    //BrowserModule,
    LayoutModule,
    ReactiveFormsModule,
    HttpClientModule,
    AngularFontAwesomeModule,
    FormsModule,
    SharedModule,
    LightboxModule,
    BsDatepickerModule.forRoot(),
    // Prevent double submission module
    PreventDoubleSubmitModule.forRoot(),
    DeviceDetectorModule.forRoot(),
    Ng2SearchPipeModule,
    // ModalModule.forRoot()
    //BrowserAnimationsModule, // required animations module
    ToastrModule.forRoot({
      timeOut: 5200,
      //positionClass: 'toast-bottom-right',
      positionClass: 'toast-top-center',
      preventDuplicates: false,
    }),
    NgbModule,NgxCaptchaModule,
    AngularSlickgridModule.forRoot({
      enableAutoResize: true,
    }),
    TextMaskModule,
    NgSelectModule,
    AccountRoutingModule

  ],

  declarations: [
    LoginComponent,
    ForgotpasswordComponent,
    CandidateOTPComponent,
    AccessblockedComponent,
    // ChangepasswordComponent,
    // MaintenanceComponent,
    // SuccessScreenComponent,
    CandidateAcceptanceComponent,
    UnauthorizedComponent,
    OnboardingComponent,
    OnboardingrequestComponent,
    TwoFactorAuthenticatorComponent,
    AadhaarVerificationComponent,
    SurveyComponent,
    DynamicuiComponent,
    SuccessuiComponent,
    SsoAuthComponent,
    UpperCaseInputDirective,
    AutoCompleteOffDirective
  ],
  entryComponents: [
    OnboardingComponent,
    OnboardingrequestComponent,
    AadhaarVerificationComponent,
    SurveyComponent
    // MaintenanceComponent
  ],
  exports: [
    OnboardingComponent,
    OnboardingrequestComponent,
    AadhaarVerificationComponent,
    SurveyComponent
    // MaintenanceComponent
  ]
  ,
  providers: [

    CookieService,
    EncrDecrService
  ],
  schemas: [
    NO_ERRORS_SCHEMA,
  ]
})
export class AccountModule { }
