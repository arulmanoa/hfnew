import { Injectable, Component, Inject } from '@angular/core';
import { ToastrService, ToastrConfig } from 'ngx-toastr';
import Swal from "sweetalert2";
import { HttpService } from './http.service';
import { appSettings } from '../configs/app-settings.config';
// import { MatDialog } from '@angular/material';
import { ConfirmDialogModel, ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

import { timer, of } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root'
})
export class AlertService {

  result: string = '';

  constructor(

    private toastr: ToastrService,
    private http: HttpService,
    // public dialog: MatDialog
    // toastrConfig: ToastrConfig

  ) {
    // toastrConfig.timeOut = 1000000000;
  }


  disposeError(error: any) {
    console.log(error);
    if (error.error) {
      Swal.fire({
        position: 'top-end',
        type: 'error',
        title: error._body,
        showConfirmButton: false,
        timer: 3000
      })
    } else {
      Swal.fire({
        position: 'top-end',
        type: 'error',
        title: error._body,
        showConfirmButton: false,
        timer: 3000
      })
    }
    return error;
  }

  success(data: any, type: string) {
    Swal.fire({
      position: 'top-end',
      type: 'success',
      title: type,
      showConfirmButton: false,
      timer: 30000000,

    })
    if (data != null) {
      data = data.json();
    }
    return data;
  }

  showSuccess(message: string) {
    // this.toastr.success('', message, {
    //   timeOut: 30000000
    // });

    this.toastr.success(message, 'Success', {
      timeOut: 3000,
      positionClass: 'toast-top-center',
      closeButton: true,
      progressBar: true,
      // disableTimeOut : true
    });
    // content: "?" !important;
    // text-align: left;
    // float: left;
    // margin: 10px;

  }

  showSuccess1(message: string, timeOut : number = 7000) {
    // this.toastr.success('', message, {
    //   timeOut: 30000000
    // });

    this.toastr.success(message, 'Success', {
      timeOut: timeOut,
      positionClass: 'toast-top-center',
      closeButton: true,
      progressBar: true,
      // disableTimeOut : true
    });
    // content: "?" !important;
    // text-align: left;
    // float: left;
    // margin: 10px;

  }

  showWarning(message: string) {




    this.toastr.warning(message, 'Warning', {
      timeOut: 5000,
      positionClass: 'toast-top-center',
      closeButton: true,
      progressBar: true,
      // disableTimeOut : true
    });


  }

  showWarning_withTimeOut(message: string, timeOut: number) {

    this.toastr.warning(message, 'Warning', {
      timeOut: timeOut,
      positionClass: 'toast-top-center',
      closeButton: true,
      progressBar: true,
      // disableTimeOut : true
    });


  }

  showInfo(message: string) {

    this.toastr.info(message, 'Information', {
      timeOut: 5000,
      positionClass: 'toast-top-center',
      closeButton: true,
      progressBar: true,
      // disableTimeOut : true
    });


  }


  confirmSwal(title, text, buttontxt) {
    return new Promise((resolve, reject) => {

      const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-danger'
        },
        buttonsStyling: true
      })

      swalWithBootstrapButtons.fire({
        title: title,
        text: text,
        type: 'warning',
        showCancelButton: true,
        confirmButtonText: buttontxt,
        cancelButtonText: 'No, cancel!',
        reverseButtons: true,
        allowEscapeKey: false,
        allowOutsideClick: false,
      }).then((result) => {
        if (result.value) {

          resolve(result.value);

        } else if (
          /* Read more about handling dismissals below */
          result.dismiss === Swal.DismissReason.cancel

        ) {
          reject(false);
        }
      })
    });

  }

  confirmSwal1(title, text, buttontxt, cancelbtntxt) {
    return new Promise((resolve, reject) => {

      const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-danger'
        },
        buttonsStyling: true
      })

      swalWithBootstrapButtons.fire({
        title: title,
        text: text,
        type: 'warning',
        showCancelButton: true,
        confirmButtonText: buttontxt,
        cancelButtonText: cancelbtntxt,
        reverseButtons: true,
        allowEscapeKey: false,
        allowOutsideClick: false,
      }).then((result) => {
        if (result.value) {

          resolve(result.value);

        } else if (
          /* Read more about handling dismissals below */
          result.dismiss === Swal.DismissReason.cancel

        ) {
          reject(false);
        }
      })
    });

  }

  confirmSwalWithClose(title, text, buttontxt, cancelbtntxt) {
    return new Promise((resolve, reject) => {

      const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-danger'
        },
        buttonsStyling: true
      })

      swalWithBootstrapButtons.fire({
        title: title,
        text: text,
        type: 'warning',
        showCancelButton: true,
        confirmButtonText: buttontxt,
        cancelButtonText: cancelbtntxt,
        showCloseButton: true,
        reverseButtons: true,
        allowEscapeKey: false,
        allowOutsideClick: false,
      }).then((result) => {
        if (result.value) {

          resolve(result.value);

        } else if (
          /* Read more about handling dismissals below */
          result.dismiss === Swal.DismissReason.cancel

        ) {
          reject(false);
        }
      })
    });

  }

  confirmSwalWithCancelAction(title, text, confirmBtnTxt, cancelBtnTxt) {
    return new Promise((resolve, reject) => {

      const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-danger'
        },
        buttonsStyling: true
      })

      swalWithBootstrapButtons.fire({
        title: title,
        text: text,
        type: 'warning',
        showCancelButton: true,
        confirmButtonText: confirmBtnTxt,
        cancelButtonText: cancelBtnTxt,
        showCloseButton: true,
        reverseButtons: true,
        allowEscapeKey: false,
        allowOutsideClick: false,
      }).then((result) => {
        if (result.value) {
          resolve(result.value);
        } else if (
          /* Read more about handling dismissals below */
          result.dismiss === Swal.DismissReason.cancel
        ) {
          resolve(false);
        }
      })
    });

  }
  confirmSwalWithRemarks(remarksTitle,) {
    return new Promise((resolve, reject) => {
      const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-danger'
        },
        buttonsStyling: true
      })
      swalWithBootstrapButtons.fire({
        title: remarksTitle , //'Cancellation Remarks',
        animation: false,
        showCancelButton: true,
        input: 'textarea',
        inputPlaceholder: 'Type your message here...',
        allowEscapeKey: false,
        inputAttributes: {
          autocorrect: 'off',
          autocapitalize: 'on',
          maxlength: '120',
          'aria-label': 'Type your message here',
        },
        allowOutsideClick: false,
        inputValidator: (value) => {
          if (value.length >= 120) {
            return 'Maximum 120 characters allowed.'
          }
          if (!value) {
            return 'You need to write something!'
          }
        },

      }).then((inputValue) => {
        if (inputValue.value) {
          resolve(inputValue.value);
        } else if (
          inputValue.dismiss === Swal.DismissReason.cancel
        ) {
          resolve(false);
        }

      }).catch(error => {
      });
    });
  }



  GetNotifications() {
    return this.http.get(appSettings.GET_PUSHNOTIFICATION)
      .map(res => res)
      .catch(err => (err));
  }
  // GetUnReadNotificationCount() {

  // }

  GetUnReadNotificationCount() {
    // return timer(0, environment.environment.TimeDurationForGetNotificationCount)
    //   .pipe(
    //     switchMap(_ => this.http.get(appSettings.GET_PUSHNOTIFICATIONCOUNT)),
    //     catchError(error => of(`Bad request: ${error}`))
    //   );

    return this.http.get(appSettings.GET_PUSHNOTIFICATIONCOUNT)
      .map(res => res)
      .catch(err => (err));
  }

  UpdateNotificationStatus(data) {
    return this.http.post(appSettings.POST_UPDATENOTIFICATIONSTATUS, data)
      .map(res => res)
      .catch(
        err => (err)
      );
  }
  TestNotificationCheck(data) {
    return this.http.post(appSettings.POST_TESTNOTIFICATION, data)
      .map(res => res)
      .catch(
        err => (err)
      );
  }

  RegisterToken(data) {

    return this.http.post(appSettings.POST_REGISTERTOKEN, data)
      .map(res => res)
      .catch(
        err => (err)
      );
  }

}