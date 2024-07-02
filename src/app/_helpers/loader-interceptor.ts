// import { Injectable, Injector } from '@angular/core';
// import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse, HttpErrorResponse } from '@angular/common/http';
// import { Observable, pipe } from 'rxjs';
// import { tap } from 'rxjs/operators';
// import { LoaderService } from '../_services/service/loader.service';
// import { ErrorService } from '../_services/service/error.service';

// // @Injectable({
// //   providedIn: 'root'
// // })
// @Injectable()

// export class LoaderInterceptor implements HttpInterceptor {
//   constructor(private loaderService: LoaderService, private errorService: ErrorService) { }
//   intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
//     this.showLoader();
//     console.log(req);

//     return next.handle(req).pipe(tap((event: HttpEvent<any>) => {
//       if (event instanceof HttpResponse) {
//         console.log(event);
//         console.log();
//         if (req.method === 'POST' || req.method === 'PUT') {
//           if (event.body.result !== undefined) {
//             let url: string;
//             url = req.url;
//             if (url.endsWith('token') === false) {
//               if (event.body.result.Status === false) {
//                 this.errorService.WebApiCustomErrorShow(event.body.result.Status, event.body.result.Message);
//               }
//             }
//           }
//         }
//         this.onEnd();
//       }
//     },
//       (err: HttpErrorResponse) => {
//         console.log(err);
//         if (err.status === 500 || err.status === 400 || err.status === 0) {
//           this.errorService.customErrorShow(err.status);
//           this.hideLoader();
//         } else {

//           this.onError();
//         }
//       }));
//   }
//   private onEnd(): void {
//     this.hideLoader();
//   }
//   private onError(): void {
//     this.errorService.show();
//     this.hideLoader();
//   }
//   private showLoader(): void {
//     this.loaderService.show();
//   }
//   private hideLoader(): void {
//     this.loaderService.hide();
//   }
// }
// modified by radhakrishnan
import { Injectable, Injector } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse, HttpErrorResponse }
    from '@angular/common/http';
import { Observable, pipe } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthenticationService } from '../_services/service/authentication.service';
// import { NgxSpinnerService } from 'ngx-spinner'; 
@Injectable()
export class LoaderInterceptor implements HttpInterceptor {
    constructor(
        private authenticationService: AuthenticationService,
        // private _spinner: NgxSpinnerService,
    ) { }
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        this.showLoader();
        return next.handle(req).pipe(tap((event: HttpEvent<any>) => {

            if (event instanceof HttpResponse) {
                if (event.body.result !== undefined) {
                    let url: string;
                    url = req.url;
                }
                this.hideLoader();
            }
        },
            (err: HttpErrorResponse) => {
                this.hideLoader();
            }));
    }

    private showLoader(): void {
        // this._spinner.show();
    }
    private hideLoader(): void {
        // this._spinner.hide();
    }
}
