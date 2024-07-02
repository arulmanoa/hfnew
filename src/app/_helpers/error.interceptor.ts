import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { retry, retryWhen, catchError, concatMap, delay, finalize } from 'rxjs/operators';
import { Injectable, Injector } from '@angular/core';
import { AuthenticationService } from '../_services/service/authentication.service';
import { MenuServices } from '@services/service';


@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
    constructor(private authenticationService: AuthenticationService, private injector: Injector,   private menuService: MenuServices) { }
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
     this.menuService.pushArrayItem(request.url)
        return next.handle(request).pipe(
            retry(0),//
            catchError(err => {
                if (err.status === 401) { 
                    // auto logout if 401 response returned from api 
                    $('#modalsessionexpired').modal({backdrop: 'static', keyboard: false, show: true});
                    //this.authenticationService.logout();
                    // location.reload(true); { backdrop: false, show: true }
                } 
                else if (err.status === 400) {
                    // $('#modalbadrequest').modal('show');
                    // $('#modalbadrequestcontent').html(`Error Code: ${err.status}\nMessage: ${err.message}`);
                }
                else if (err.status === 500) {
                    
                    // $('#modalbadrequest').modal('show');
                    // $('#modalbadrequestcontent').html(`Error Code: ${err.status}\nMessage: ${err.message}`);
                }
                const error = err.error || err.statusText;
                return throwError(error);
            }),

            // retryWhen(errors => errors
            //     .pipe(
            //         concatMap((error, count) => {
            //             // if (count < 2 && (error.status == 503 || error.status == 500)) {
            //             //     return of(error.status);
            //             // }

            //             return throwError(error);
            //         }),
            //         delay(500)
            //     )
            // ),  
            finalize(() => {
                this.menuService.removeArrayItem(request.url)
              })
        )
    }
}