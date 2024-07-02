import { NestedTreeControl } from '@angular/cdk/tree';
import { Component, Injectable, OnInit, ChangeDetectorRef, ViewChild, EventEmitter } from '@angular/core';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { Subscription } from 'rxjs';
import { MediaMatcher } from '@angular/cdk/layout';
//services

// import { AppService } from '../../_services/service/app.service';
import { EventEmiterService } from '../../_services/service/event.emmiter.service';

//models
import { LeftNavigationMenu } from '../../_services/model/LeftNavigationMenu';
import { LoginSessionDetails } from '../../_services/model/LoginSessionDetails';
import { SessionKeys } from '../../app.config';

@Component({
  selector: 'app-sidebar-left',
  templateUrl: './sidebar-left.component.html',
  styleUrls: ['./sidebar-left.component.css', './sidebar-left.component.scss']
})

export class SidebarLeftComponent  {


  // opened: boolean;
  // closed: boolean;
  // gridLayoutEnable = false;
  // RightNavopened = false;
  // // code for implementing material side nav bar
  // mobileQuery: MediaQueryList;
  // private _mobileQueryListener: () => void;
  // events: string[] = [];
  // sub: Subscription;
  // // code for implementing devexpress side nav bar
  // LeftNavMenuValues: LeftNavigationMenu[];
  // _loginSessionDetails: LoginSessionDetails;

  // toggleProvidedProvided() {
  //   if (this.opened === true) {
  //     this.opened = false;
  //   } else {
  //     this.opened = true;
  //   }
  // }
  // toggleRightNavProvided() {
  //   if (this.RightNavopened === true) {
  //     this.RightNavopened = false;
  //   } else {
  //     this.RightNavopened = true;
  //   }
  // }
  // toggleleftNav() {
  //   if (this.gridLayoutEnable === true) {
  //     this.gridLayoutEnable = false;
  //   } else {
  //     this.gridLayoutEnable = true;
  //   }
  // }

  // OnGridLayoutSettingChange() {
  //   this.appService.setSesstionStorage(SessionKeys.GridLayoutEnable, this.gridLayoutEnable);
  //   this._eventEmiter.sendEnabled(this.gridLayoutEnable);
  //   this.RightNavopened = false;
  // }

  // constructor(changeDetectorRef: ChangeDetectorRef, private _eventEmiter: EventEmiterService,
  //   media: MediaMatcher, 
    
  //   private appService: AppService
  //   ) {
  //   this.LeftNavMenuValues = appService.getLeftNavigationMenuValues();

  //   // code for implementing material side nav bar
  //   this.mobileQuery = media.matchMedia('(max-width: 600px)');
  //   this._mobileQueryListener = () => changeDetectorRef.detectChanges();
  //   this.mobileQuery.addListener(this._mobileQueryListener);
  // }

  // setLayout() {
  //   const val = this.appService.getSessionStorage(SessionKeys.GridLayoutEnable);
  //   if (val === 'true') {
  //     this.gridLayoutEnable = true;
  //   } else {
  //     this.gridLayoutEnable = false;
  //   }
  // }
  // ngOnInit() {
  //   this.setLayout();
  //   this._loginSessionDetails = <LoginSessionDetails>JSON.parse(this.appService.getSessionStorage(SessionKeys.LocalSessionDetails));

  // }

  // // tslint:disable-next-line:use-life-cycle-interface
  // ngOnDestroy(): void {
  //   // code for implementing material side nav bar
  //   this.mobileQuery.removeListener(this._mobileQueryListener);
  // }


}

