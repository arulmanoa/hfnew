import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthenticationService } from '../_services/service/authentication.service';

import { SessionStorage } from '../_services/service/session-storage.service'; // session storage
import { SessionKeys } from '../_services/configs/app.config'; // app config 

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
    constructor(
        private authenticationService: AuthenticationService,
        private _SessionStorage: SessionStorage,
    ) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // add authorization header with jwt token if available
        if (this.authenticationService.isAuthenticated()) {
            let currentUser = this._SessionStorage.getSessionStorage(SessionKeys.Token);
            if (currentUser && currentUser.AuthToken) {
                request = request.clone({
                    setHeaders: {
                        UserId: `${currentUser.UserId}`,
                        Token: `${currentUser.AuthToken}`,
                        'Accept': 'application/json;charset=utf-8'
                    }
                });
            }
        }

        return next.handle(request);
    }
}