import { Component, ElementRef, ChangeDetectorRef, OnDestroy, AfterViewInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { LoadingScreenService } from './loading-screen.service';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-loading-screen',
  templateUrl: './loading-screen.component.html',
  styleUrls: ['./loading-screen.component.css']
})
export class LoadingScreenComponent implements AfterViewInit, OnDestroy {

  spinner_loading: boolean = false;
  loadingSubscription: Subscription;

  constructor(
    private loadingScreenService: LoadingScreenService,
    private _elmRef: ElementRef,
    private _changeDetectorRef: ChangeDetectorRef,
    private spinner: NgxSpinnerService
  ) { }
 
  ngAfterViewInit(): void {
    this._elmRef.nativeElement.style.display = 'none';
    this.loadingSubscription = this.loadingScreenService.loadingStatus.pipe().subscribe(
      (status: boolean) => {
        this.spinner.show();
        this._elmRef.nativeElement.style.display = status ? 'block' : 'none';
        this._changeDetectorRef.detectChanges();
      }
    );
  }

  ngOnDestroy() {
    this.spinner.hide();
    // this.loadingSubscription.unsubscribe();
  }

}