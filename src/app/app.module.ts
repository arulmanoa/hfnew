import { BrowserModule, TransferState, BrowserTransferStateModule } from '@angular/platform-browser';
import { Injector, APP_INITIALIZER, NgModule, CUSTOM_ELEMENTS_SCHEMA, ErrorHandler } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { MatSnackBarModule } from '@angular/material';
import { LOCATION_INITIALIZED } from '@angular/common';
import { AppRoutingModule } from './app-routing.module';

import { TabsModule } from 'ngx-bootstrap/tabs';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpModule } from '@angular/http';
import { TranslateModule, TranslateService, TranslateStore, TranslateLoader, TranslateCompiler } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { DatepickerModule } from 'ngx-bootstrap/datepicker';
import { SocialLoginModule, AuthServiceConfig } from "angularx-social-login";
import { GoogleLoginProvider } from "angularx-social-login";
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { DatePipe } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';
import { CdkStepperModule } from '@angular/cdk/stepper';
import { MatStepperModule } from '@angular/material/stepper';
import { AppComponent } from './app.component';
// main structure modules

import { LayoutModule } from './layouts/layout.module';
import { PagenotfoundComponent } from './shared/components/pagenotfound/pagenotfound.component';
//own services
//LoaderInterceptor
import { JwtInterceptor, HttpErrorInterceptor, } from './_helpers';
import { EncrDecrService } from './_services/service/encr-decr.service';
import { EventEmiterService } from './components/Service/event.emmiter.service';
import { HttpService } from './_services/service/http.service';
import { ExcelService } from './_services/service/excel.service';
//own components without module
// pages

import ConfigJson from '../assets/json/config.json';
import { AppInitService } from './_services/service/app.init';
import { NZ_I18N, en_US } from "ng-zorro-antd";
import { NgZorroAntdModule, NZ_ICONS } from "ng-zorro-antd";
import { IconDefinition } from "@ant-design/icons-angular";
import * as AllIcons from "@ant-design/icons-angular/icons";
import { TextMaskModule } from 'angular2-text-mask';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ServiceWorkerModule, SwRegistrationOptions } from '@angular/service-worker';

import { environment, firebase } from '../environments/environment';
import { WebcamModule } from 'ngx-webcam';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { CoreModule } from './core/core.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { GlobalErrorHandler } from './_services/service/GlobalErrorHandler';
import { AsyncPipe } from '../../node_modules/@angular/common';
import { NotificationMessagingService } from './_services/service/NotificationMessagingService';
import { initializeApp } from "firebase/app";
import { AngularFireMessagingModule } from '@angular/fire/messaging';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireModule } from '@angular/fire';
import { GlobalJsErrorHandler } from './_helpers/globalJsError';

export const enablePwa = true

initializeApp(environment.firebase);

let config = new AuthServiceConfig([
  {
    id: GoogleLoginProvider.PROVIDER_ID,
    provider: new GoogleLoginProvider(ConfigJson.GoogleAuth_Key)
    //  
  },

]);

const antDesignIcons = AllIcons as {
  [key: string]: IconDefinition;
};
const icons: IconDefinition[] = Object.keys(antDesignIcons).map(
  key => antDesignIcons[key]
);


export function provideConfig() {
  return config;
}

export function init_app(appLoadService: AppInitService) {
  return () => appLoadService.init();
}

// AoT requires an exported function for factories
export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

// use an Initializer Factory as describe here: https://github.com/ngx-translate/core/issues/517#issuecomment-299637956
export function appInitializerFactory(translate: TranslateService, injector: Injector) {
  return () => new Promise<any>((resolve: any) => {
    const locationInitialized = injector.get(LOCATION_INITIALIZED, Promise.resolve(null));
    locationInitialized.then(() => {
      const langToSet = 'en';
      translate.setDefaultLang('en');
      translate.use(langToSet).subscribe(() => {
      }, err => {
        console.error(`Problem with '${langToSet}' language initialization.'`);
      }, () => {
        resolve(null);
      });
    });
  });
}

// @dynamic
@NgModule({

  declarations: [
    AppComponent,
    PagenotfoundComponent
  ],


  imports: [

    BrowserModule,
    AngularFireDatabaseModule,
    AngularFireAuthModule,
    AngularFireMessagingModule,
    AngularFireModule.initializeApp(firebase),
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpModule,
    BrowserTransferStateModule,
    LayoutModule,
    SocialLoginModule,
    HttpClientModule,
    NgbModule.forRoot(),
    TabsModule.forRoot(),
    CoreModule,
    DashboardModule,
    DatepickerModule.forRoot(),
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: enablePwa }),
    MatTooltipModule,
    CdkStepperModule,
    MatStepperModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps:
          [HttpClient]
      }
    }),
    Ng2SearchPipeModule,
    TextMaskModule,
    NgZorroAntdModule.forRoot(),
    WebcamModule,
    MatSnackBarModule,
  ],

  exports: [NgZorroAntdModule],
  entryComponents: [],
  providers: [
    NotificationMessagingService,
    AsyncPipe,
    { provide: ErrorHandler, useClass: GlobalErrorHandler }, // new version / chunk file is not getting reloaded due to this

    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: HttpErrorInterceptor, multi: true },
    {
      provide: SwRegistrationOptions,
      useFactory: () => ({ enabled: environment.production }),
    },
    AppInitService,
    {
      provide: APP_INITIALIZER,
      useFactory: init_app,
      deps: [AppInitService],
      multi: true
    },
    { provide: NZ_I18N, useValue: en_US }, { provide: NZ_ICONS, useValue: icons },
    CookieService, EncrDecrService,
    NgbActiveModal,
    DatePipe,
    ExcelService,
    HttpService,
    {
      provide: AuthServiceConfig,
      useFactory: provideConfig
    },
    EventEmiterService, TranslateService, TranslateStore,
    { provide: MatDialogRef, useValue: {} },
    { provide: MAT_DIALOG_DATA, useValue: [] },
    // {
    //   provide: ErrorHandler,
    //   useClass: GlobalJsErrorHandler
    // }
  ],

  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
