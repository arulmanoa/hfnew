import { Component, HostListener, OnInit, isDevMode } from '@angular/core';
import { LoaderState } from './components/shared/loader/loader';
import { Subscription } from 'rxjs';
import { LoaderService } from './components/Service/loader.service';
import { ErrorService } from './components/Service/error.service';
import { ErrorModel, IErrorInterface, CustomErrorModel } from './components/Models/ErrorModel';
//  import { ErrorModalComponent } from './components/shared/modal/error-modal/error-modal.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GlobalConfigurationValues } from './app.config';
import { Event, NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router } from '@angular/router';
import { LocationStrategy, PlatformLocation } from '@angular/common';
import { setTheme } from 'ngx-bootstrap/utils';
import { enGbLocale } from 'ngx-bootstrap/locale';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { BsLocaleService } from 'ngx-bootstrap/datepicker';
import { version } from '../../package.json';
import { environment } from '../environments/environment';
import { ConsoleLoggerService } from './_services/service/LoggerService';
import { SwUpdate } from '@angular/service-worker';
import { NotificationMessagingService } from './_services/service/NotificationMessagingService';
import { AngularFireMessaging } from "@angular/fire/messaging";
// import {Beacon} from '@beacon.li/bar';
import { SessionStorage } from '@services/service';
import { SessionKeys } from '@services/configs/app.config';
import { isObjectEmpty } from './utility-methods/utils';
import { LoginResponses } from '@services/model/Common/LoginResponses';

new ConsoleLoggerService();
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  public version: string = version;
  title = 'HR Suite';
  subscription: Subscription;
  showLoading = false;
  favIcon: HTMLLinkElement = document.querySelector('#appIcon');


  constructor(
    private loaderService: LoaderService,
    private router: Router,
    private errorService: ErrorService,
    private modalService: NgbModal,
    private location: LocationStrategy,
    public localeService: BsLocaleService,
    private swUpdate: SwUpdate,
    private messagingService: NotificationMessagingService,
    private angularFireMessaging: AngularFireMessaging,
    private sessionService: SessionStorage,
    public platFormLocation: PlatformLocation
  ) {

    // this.favIcon.href = 'as';

      defineLocale('en-gb', enGbLocale);
    this.localeService.use('en-gb');

    // platFormLocation.onPopState(() => {

    //   console.log('clicked back!');
    //   history.pushState(null, null, null);
    //   window.addEventListener('popstate', function () {
  
    //     history.pushState(null, null, null);
    //   });

    // });

    // setTheme('bs4')
    // history.pushState(null, null, window.location.href);
    // this.location.onPopState(() => {

    //   history.pushState(null, null, null);
    // })

    // this.location.onPopState(() => {
    //   // set isBackButtonClicked to true.
    //   // alert('ss')
    //         return false;
    // });

    // history.pushState(null, null, window.location.href);
    // this.location.onPopState(() => {
    //   alert('ss')

    //   history.pushState(null, null, window.location.href);
    // });



  }
  ngOnInit() {
  //   Beacon.load('C7RM4K');

  //   Beacon.setRouter((path: string) => {
  //     this.router.navigateByUrl(path);
  // });

    if (!isObjectEmpty(this.sessionService.getSessionStorage(SessionKeys.LoginResponses))) {
      let loginSessionDetails: LoginResponses = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses));
      let userId = String(loginSessionDetails.UserSession.UserId);
      let userName = loginSessionDetails.UserSession.PersonName;
      let roleCode = loginSessionDetails.UIRoles[0].Role.Code;
      // Beacon.loadUser(userId, { name: userName, roleCode });
    }


    // this.angularFireMessaging.messages.subscribe(
    //   (payload) => {
    //     console.log("new message received. ", payload);
    //     // this.currentMessage.next(payload);
    //     return payload;
    //   },
    //   (err) => {
    //     console.error('Unable to receive message.', err);
    // });

    this.reloadCache();

    if (isDevMode()) {
      console.log('👋 Development! ', this.version);
    } else {
      console.log('💪 Production! ', this.version);
    }
    // if (window && environment.environment.IsConsoleLogRequired == false) {
    //   window.console.log = window.console.warn = window.console.info = function () {
    //   };
    // }
    window.menubar.visible;
    window.toolbar.visible;






    // history.pushState(null, null, window.location.href);
    // this.location.onPopState(() => {
    //   window.history.go(-1);
    //   history.pushState(null, null, null);
    // })
    // history.pushState(null, null, document.URL);
    // window.addEventListener('popstate', function () {
    //     history.pushState(null, null, document.URL);
    // });

    // window.addEventListener("beforeunload", function (e) {
    //   var confirmationMessage = "\o/";
    //   console.log("cond");
    //   e.returnValue = confirmationMessage;
    //   // e.preventDefault();     // Gecko, Trident, Chrome 34+ 
    //   return confirmationMessage;              // Gecko, WebKit, Chrome <34
    // });


    this.subscription = this.loaderService.loaderState
      .subscribe((state: LoaderState) => {
        this.showLoading = state.show;
      });
    this.subscription = this.errorService.errorModel
      .subscribe((state: ErrorModel) => {

        let url: string;
        url = this.router.url;

        // if (url.endsWith('login') === false) {
        //   // const modalRef = this.modalService.open(ErrorModalComponent);
        //   // modalRef.componentInstance.ErrorTypeValue = GlobalConfigurationValues.ErrorTypeValue;
        //   // modalRef.componentInstance.ErrorMessage = GlobalConfigurationValues.ErrorMessage;
        //   if (state.ErrorTypeValue === 0) {
        //     const modalRef = this.modalService.open(ErrorModalComponent);
        //     modalRef.componentInstance.ErrorMessage = 'Please check your internet connection';
        //     return;
        //   }
        //   if (state.ErrorTypeValue === 500) {
        //     const modalRef = this.modalService.open(ErrorModalComponent);
        //     modalRef.componentInstance.ErrorMessage = 'Please contact adminstrator for more information';
        //     return;
        //   }
        //   if (state.ErrorTypeValue === 400) {
        //     const modalRef = this.modalService.open(ErrorModalComponent);
        //     modalRef.componentInstance.ErrorMessage = 'Please try again after some time';
        //     return;
        //   }
        // } else {

        // }



      });

    this.subscription = this.errorService.customErrorModel
      .subscribe((state: CustomErrorModel) => {
        console.log(state);

        if (state.ErrorStatus === false) {

          // const modalRef = this.modalService.open(ErrorModalComponent);
          // modalRef.componentInstance.ErrorMessage = state.ErrorMessage;
          return;
        }


      });
  }


  onActivate(event) {
    let scrollToTop = window.setInterval(() => {
      let pos = window.pageYOffset;
      if (pos > 0) {
        window.scrollTo(0, pos - 20); // how far to scroll on each step
      } else {
        window.clearInterval(scrollToTop);
      }
    }, 16);
  }

  reloadCache() {
    if (this.swUpdate.isEnabled) {
      this.swUpdate.available.subscribe(() => {
        if (confirm('New Version available! would you like to update?')) {
          window.location.reload();
        }
      });
    }
    if (!this.swUpdate.isEnabled) {
      console.log('SW NOT ENABLED ');
    }
  }
  UYIOYBJKK(){
    var KLUOIUIO = "YUOYEJ";
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}
