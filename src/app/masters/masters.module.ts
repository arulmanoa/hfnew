import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { CookieService } from 'ngx-cookie-service';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import * as bootstrap from "bootstrap";
import * as $ from "jquery";
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PreventDoubleSubmitModule } from 'ngx-prevent-double-submission';
import { DeviceDetectorModule } from 'ngx-device-detector';
import { EncrDecrService } from '../_services/service/encr-decr.service';

//own components
import { BrandlistComponent } from './brandlist/brandlist.component';
import { CountryModalComponent } from './country-modal/country-modal.component';
import { StatesModalComponent } from './states-modal/states-modal.component';
import { CountriesComponent } from './countries/countries.component';
import { CountryComponent } from 'src/app/masters/country/countrylist/country.component';
 
import { AngularSlickgridModule } from 'angular-slickgrid';

@NgModule({
  imports: [

    CommonModule,
    FormsModule,
    RouterModule,
    //BrowserModule,
    ReactiveFormsModule,
    HttpClientModule,
    AngularFontAwesomeModule,
    FormsModule,
    // Prevent double submission module
    PreventDoubleSubmitModule.forRoot(),
    DeviceDetectorModule.forRoot(),

    // ModalModule.forRoot()
    //BrowserAnimationsModule, // required animations module
    ToastrModule.forRoot({
      timeOut: 5000,
      //positionClass: 'toast-bottom-right',
      positionClass: 'toast-top-center',
      preventDuplicates: true,
    }),
    NgbModule,
    AngularSlickgridModule,
  ],

  declarations: [
    BrandlistComponent,
    CountryComponent,
    StatesModalComponent,
    CountryModalComponent,
    //CountriesComponent
  ],

  entryComponents: [
    StatesModalComponent,
    CountryModalComponent,
    // CountryComponent,
  ],

  exports: [
    StatesModalComponent,
    CountryModalComponent,
    // CountryComponent,
  ],


  providers: [
        CookieService,
    EncrDecrService
  ],
  schemas: [
    NO_ERRORS_SCHEMA,
  ]
})
export class MastersModule { }
