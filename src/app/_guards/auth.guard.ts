import { Injectable, isDevMode } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthenticationService } from '../_services/service/authentication.service';

import { SessionStorage } from '../_services/service/session-storage.service'; // session storage
import { SessionKeys } from '../_services/configs/app.config'; // app config 
import { MenuServices } from '../_services/service';
import ConfigJson from '../../assets/json/config.json';
import { ConsoleLoggerService } from '../_services/service/LoggerService';

new ConsoleLoggerService();
@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
    public routename: string = '';

    constructor(
        private router: Router,
        private authenticationService: AuthenticationService,
        private _SessionStorage: SessionStorage,
        public menuService: MenuServices


    ) {
        if (window && ConfigJson.IsConsoleLogRequired == false) {
            window.console.log = window.console.warn = window.console.info = function () {
            };
        }

        // if (window && ConfigJson.IsConsoleLogRequired == true) {
        //     window.console.log = window.console.warn = window.console.info = null;
        // }
    }
 
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

        if (this.authenticationService.isAuthenticated()) {
            let currentUserResponse = this._SessionStorage.getSessionStorage(SessionKeys.Token);
            //still we needs to check route level here
            if (currentUserResponse) {
                this.checkvalidURL(state.url);
                return true;
            }
        }
        // not logged in so redirect to login page with the return url
        this.router.navigate(['/login']);// { queryParams: { returnUrl: state.url }}
        return false;
    }
    isInArray(array, word) {
        return array.indexOf(word.toLowerCase()) > -1;
    }

    checkvalidURL(currentUrl) {
        console.log('CURRENT URL ::', currentUrl);

        let isaccess = true;
        this.menuService.checkAccess_Role().then((result) => {
            let results = result as Array<any>
            console.log('RESULT :', results);
            currentUrl != null && currentUrl != undefined && (isaccess = results.find(a => a.pathName == currentUrl) != null ? true : false);
              // return true;
            if (!isaccess && !currentUrl.includes('/app/listing/ui/attendanceBreakupDetailsForNextPeriod') && !currentUrl.includes('/app/listing/ui/attendanceBreakupDetails')) {
                this.router.navigate(['app/accessdenied']);
                return false;
            }
        });

    }
}