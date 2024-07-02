import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { DeviceDetectorService } from 'ngx-device-detector';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })

export class AccountService {
    
    flag: boolean;
    constructor(private httpClient: HttpClient,
        private deviceService: DeviceDetectorService) {
    }

    GetIpAddressandBrowserInfo() {
        let browserInfo = '';
        let deviceInfo = null;
        deviceInfo = this.deviceService.getDeviceInfo();
        browserInfo = "browser:" + deviceInfo.browser + "|" + "browser_version:" + deviceInfo.browser_version + "|" +
            "device:" + deviceInfo.device + "|" + "os:" + deviceInfo.os + "|" +
            "os_version:" + deviceInfo.os_version + "|" + "userAgent:" + deviceInfo.userAgent + "|" +
            "isMobile:" + this.deviceService.isMobile() + "|" + "isTablet:" + this.deviceService.isTablet() + "|" +
            "isDesktopDevice:" + this.deviceService.isDesktop();
        return browserInfo;
    }

    private handleError(errorResponse: HttpErrorResponse) {
        if (errorResponse.error instanceof ErrorEvent) {
            console.error('Client Side Error :', errorResponse.error.message);
        } else {
            console.error('Server Side Error :', errorResponse);
        }
        return throwError('There is a problem with the service. We are notified & working on it. Please try again later.');
    }
}