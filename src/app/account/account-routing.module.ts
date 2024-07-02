import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MaintenanceComponent } from '../maintenance/maintenance.component';
import { SuccessScreenComponent } from '../shared/components/success-screen/success-screen.component';
import { UnauthorizedComponent } from '../unauthorized/unauthorized.component';
import { CandidateAcceptanceComponent } from '../views/candidate/candidate-acceptance/candidate-acceptance.component';
import { DynamicuiComponent } from '../views/dynamicui/dynamicui/dynamicui.component';
import { SuccessuiComponent } from '../views/dynamicui/successui/successui.component';
import { OnboardingComponent } from '../views/onboarding/onboarding.component';
import { OnboardingrequestComponent } from '../views/onboarding/onboardingrequest/onboardingrequest.component';
import { CandidateOTPComponent } from './candidate-otp/candidate-otp.component';
import { ForgotpasswordComponent } from './forgotpassword/forgotpassword.component';
import { LoginComponent } from './login/login.component';
import { TwoFactorAuthenticatorComponent } from './two-factor-authenticator/two-factor-authenticator.component';
import { SsoAuthComponent } from './sso-auth/sso-auth.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'login/:clientCode',
        pathMatch: 'full',
        component: LoginComponent
      },
      {
        path: 'login',
        pathMatch: 'full',
        component: LoginComponent
      },
      {
        path: 'twofactorauth',    
        pathMatch: 'full', 
        component: TwoFactorAuthenticatorComponent
      },
      {
        path: 'forgotpassword',
        pathMatch: 'full',
        component: ForgotpasswordComponent
      },


      // { path: 'login/:companyCode', component: LoginComponent },
      { path: 'core', component: LoginComponent },
      { path: 'Maintenance', component: MaintenanceComponent },
      { path: 'unauthorized', component: UnauthorizedComponent },
      { path: 'candidatelogin', component: CandidateOTPComponent },
      { path: 'candidate_acceptance', component: CandidateAcceptanceComponent },
      { path: 'candidate_information', component: OnboardingrequestComponent },
      { path: 'success', component: SuccessScreenComponent },

     
      {
        path: 'dynamicRequest',
        pathMatch: 'full',
        component: DynamicuiComponent
      },
      {
        path: 'successscreen',
        pathMatch: 'full',
        component: SuccessuiComponent
      },
      { 
        path: 'auth',
        pathMatch: 'full',
        component: SsoAuthComponent
      },
      { path: '', redirectTo: '/login/:clientCode', pathMatch: 'full' },
      { path: '', redirectTo: '/login', pathMatch: 'full' },

    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountRoutingModule { }
