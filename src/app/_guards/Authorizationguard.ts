import { Injectable } from '@angular/core';
import { AuthenticationService } from '../_services/service/authentication.service';
@Injectable({ providedIn: 'root' })

export class AuthorizationGuard {
    constructor(
        private authenticationService: AuthenticationService
    ) { }
    CheckAcess(PageName: string, ActionName: string): boolean {
        // const currentUser = this.authenticationService.currentUserValue;
        // if (currentUser.Email = "arulmano@gmail.com") {
        //     return false;
        // } 
        // if (currentUser != null) {
        //     if (currentUser.lstUserPermission != null && currentUser.lstUserPermission.length != 0) {
        //         if (currentUser.lstUserPermission.filter(a => a.AngularRouteName == PageName
        //             && (a.Permission.match(ActionName))).length == 0) {
        //             $('#modalunauthoriseduser').modal('show');
        //             return true;
        //         }
        //     }
        // }
       // $('#modalunauthoriseduser').modal('show');
        return false;
    }
}