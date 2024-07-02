import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
// import { AppConfig } from '../../assets/AppConfig.model';
import { MenuServices } from '../_services/service/menu.service';

@Injectable({ providedIn: 'root' })
export class MaintenanceGuard implements CanActivate {
    public routename: string = '';

    constructor(
        private router: Router,
        public menuService: MenuServices

    ) { }

    // canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

    //     let appmode = AppConfig.AppMode;

    //     if (appmode == 'Offline') {
    //         this.router.navigate(['/Maintenance']);
    //         return false;
    //     }
    //     return true;
    // }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

        console.log('CURRENT URL PATH :: ', state.url);

        let URL = route.data["roles"] as Array<string>;
        console.log('URL ::', URL);
        
        let stateUrl = state.url;
        console.log('url', URL , route);
        console.log('state url' , stateUrl);

        let isaccess = true;   
        this.menuService.checkAccess_Role().then((result) => {
            let results = result as Array<any>
            URL!= null && URL != undefined && (isaccess = results.find(a => a.pathName == URL[0]) != null ? true : false);
            console.log('canactive', results); 

            stateUrl != null && stateUrl != undefined && (isaccess = results.find(a => a.pathName == stateUrl) !== undefined ? true : false);
 
            if (!isaccess) {
                this.router.navigate(['app/accessdenied']);
                return false;
            }
        });

        return isaccess;
    }

}