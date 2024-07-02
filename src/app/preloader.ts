import { PreloadingStrategy, Route } from '@angular/router';
import { Injectable } from '@angular/core';
import {map} from 'rxjs/operators';

import { Observable, of, timer } from 'rxjs';
import { flatMap } from 'rxjs/operators';
import { AuthenticationService } from './_services/service';

@Injectable({
  providedIn: 'root',
})
export class CustomPreloadingStrategy implements PreloadingStrategy {

    preload(route: Route, fn: () => Observable<any>): Observable<any> {
        const loadRoute = (delay) => delay > 0 ? timer(delay*1000).pipe(map(() => fn())) : fn();
        if (route.data && route.data.preload) {
          const delay = route.data.loadAfterSeconds ? route.data.loadAfterSeconds : 0;
          return loadRoute(delay);
        }
        return of(null);
      }
    }
//   constructor(private auth:AuthenticationService){}
//   preload(route: Route, load): Observable<any> {
//     const loadRoute = (delay, time) =>
//       delay ? timer(time ? time : 1000).pipe(flatMap((_) => load())) : load();
//     let access: string[] = ['payroll-ops', 'manager']; // from auth works well with can load ##check
//     let isUserLogedIn = route.data ? true : false; // from auth works well with can load ##check
//     if (isUserLogedIn) {
//       let flag = route.data && route.data.preload && access.includes(route.path);
//       return flag ? loadRoute(route.data.delay, route.data.time) : of(null);
//     } else {
//       return of(null);
//     }
//   }
// }
