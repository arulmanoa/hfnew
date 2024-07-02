// import { Component, OnInit, EventEmitter, ChangeDetectorRef, Input, Output } from '@angular/core';
// import { EventEmiterService } from '../../components/Service/event.emmiter.service';
// import { MediaMatcher } from '@angular/cdk/layout';
// import { AppService } from '../../components/Service/app.service';

import { Component, OnInit, EventEmitter, ChangeDetectorRef, Input, Output } from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';
//services
import { EventEmiterService } from '../../_services/service/event.emmiter.service';
// import { AppService } from '../../_services/service/app.service';


@Component({
  selector: 'app-banner-top',
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.css']
})

export class BannerComponent implements OnInit {
  @Input()
  public titleIcon: string;

  @Input()
  public title: string;

  private _mobileQueryListener: () => void;

  constructor(changeDetectorRef: ChangeDetectorRef, private _eventEmiter: EventEmiterService,
    media: MediaMatcher,
    //  private appService: AppService
     ) {
    this._eventEmiter.sendEnabled(true);
  }
  ngOnInit() {

  }
}