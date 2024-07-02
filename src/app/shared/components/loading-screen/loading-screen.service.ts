import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingScreenService {

  constructor() { }

  private _loading: boolean = false;
  loadingStatus: Subject<boolean> = new Subject();

  get spinner_loading(): boolean {
    return this._loading; 
  }

  set spinner_loading(value) {
    this._loading = value;
    this.loadingStatus.next(value);
  }

  startLoading() {    
    this.spinner_loading = true;
  }

  stopLoading() {
    this.spinner_loading = false;
  }
  ngOnDestroy() {
    this.loadingStatus.unsubscribe();
  }

  
}