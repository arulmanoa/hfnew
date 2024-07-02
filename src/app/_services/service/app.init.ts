import { Injectable } from '@angular/core';;
import { from } from 'rxjs';
import { filter, map, switchMap, tap } from 'rxjs/operators';
declare var window: any;

@Injectable()
export class AppInitService {

  // This is the method you want to call at bootstrap
  // Important: It should return a Promise
  // public init() {
  //   return from(
  //       fetch('assets/json/config.json').then(function(response) {
  //         return response.json();
  //       })
  //     ).pipe(
  //       map((config) => {
  //       window.config = config;
  //       return 
  //     })).toPromise();
  // }

  public init() {
    return from(
        fetch('assets/json/config.json').then(function(response) {
          return response.json();
        })
      ).pipe(
        map((config) => {
        window.config = config;
        Object.freeze(window.config)
        if (window && config.IsConsoleLogRequired == false) {
          window.console.log = window.console.warn = window.console.info = function () {
            // Don't log anything.
          };
        } 
        return 
      })).toPromise();
  }
}