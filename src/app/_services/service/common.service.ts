import { ServiceBase } from './servicebase';
import { ApiConstants, ControllerConstants } from '../model/Common/constants';
import { Injectable } from '@angular/core';
import { SessionData } from '../model/Common/sessionData';
import { HttpService } from './http.service';
import { PayrollService } from './payroll.service';
import { apiResult } from '../model/apiResult';
import { EmployeeService } from './employee.service';
import { apiResponse } from '../model/apiResponse';
import { AlertService } from './alert.service';
import { ObjectStorageDetails } from '../model/Candidates/ObjectStorageDetails';
import { HttpClient } from '@angular/common/http';
import { Subject, Observable } from 'rxjs';
import { tap } from 'lodash';
import { AbstractControl, Validators } from '@angular/forms';

@Injectable({

  providedIn: 'root'
})

export class CommonService {
  constructor(private base: ServiceBase, private session: SessionData, private http: HttpService,
    public payrollService: PayrollService,
    public employeeService: EmployeeService,
    public alertService: AlertService,
    private httpClient: HttpClient
  ) { }

  getAllLookupGroups() {
    return this.base.getData(ControllerConstants.COMMON, ApiConstants.GET_ALL_LOOKUP_GROUPS);
  }

  callApi(url, urlParameters) {

    return this.http.get(url + urlParameters)
      .map(res => res)
      .catch(err => (err));

  }

  hasJsonStructure(str) {
    if (typeof str !== 'string') return false;
    try {
      const result = JSON.parse(str);
      const type = Object.prototype.toString.call(result);
      return type === '[object Object]'
        || type === '[object Array]';

    } catch (err) {
      return false;
    }
  }

  openNewtab(base64, fileName, allowDownload = false) {
    fileName = fileName.replace(/\s/g, '');
    let contentType = 'application/pdf';
    const byteArray = atob(base64);
    const blob = new Blob([byteArray], { type: contentType });
    let file = new File([blob], fileName, {
      type: contentType,
      lastModified: Date.now()
    });
    if (file !== null && allowDownload == false) {
      let fileURL = null;
      const newPdfWindow = window.open('', '');
      const content = encodeURIComponent(base64);
      // tslint:disable-next-line:max-line-length
      // if(allowDownload==true){
      //   newPdfWindow.document.write(`${content}`);
      // }
      // else{
      const iframeStart = '<div> <img src=\'assets/Images/logo.png\'>&nbsp; </div><\iframe width=\'100%\' height=\'100%\' src=\'data:application/pdf;base64, ';
      const iframeEnd = '\'><\/iframe>';
      // newPdfWindow.document.write(`${iframeStart}${content}${iframeEnd}`);
      newPdfWindow.document.write(`${iframeStart}${content}${iframeEnd}`);
      // }

      return newPdfWindow.document.title = fileName;

    }
    else {
      const source = `data:application/pdf;base64,${base64}`;
      const link = document.createElement("a");
      link.href = source;
      link.download = `${fileName}.pdf`
      link.click();
    }

  }
  openPdfFile(base64, fineName) {
    debugger;
    // const url = 'data:application/pdf;base64,' + encodeURI(base64);
    // let pdfWindow = window.open("");
    // pdfWindow.document.write()
    // window.open(url, '_blank');
    var link = document.createElement("a");
    link.href = "data:application/pdf;base64," + base64;
    link.download = fineName;
    link.target = "blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    // return document.title = fineName;
  }


  // PAYROLL (PAYOUT)
  Get_PayOut_LookupDetails(clientId) {
    const promise = new Promise((resolve, reject) => {
      this.payrollService.get_PayOutLookUpDetails(clientId)
        .subscribe((result) => {
          const apiResult: apiResult = result;
          if (apiResult.Status) {
            var result = (apiResult.Result) as any
            result = JSON.parse(result);
            console.log('PAYOUT LOOKUP DETAILS :  ', result);
            resolve(result.CompanyBankAccountList);
          } else {
            resolve(null);
          }
        })
    })
    return promise;
  }

  // EMPLOYEE (BY ID AND LOOKUP)
  getEmployeeDetailsByEmployeeCode(employeeId) {
    const promise = new Promise((resolve, reject) => {
      this.employeeService.GetEmployeeDetailsByCode(employeeId).subscribe((result) => {
        const apiResult: apiResult = result;
        if (apiResult.Status) {
          resolve(apiResult.Result);
        }
        else {
          resolve(null);
        }
      });
    })
    return promise;
  }


  getEmployeeUILookUpDetails(employeeId) {
    return new Promise((res, rej) => {
      this.employeeService.get_LoadEmployeeUILookUpDetails(employeeId)
        .subscribe((result) => {
          let apiResponse: apiResponse = result;
          if (apiResponse.Status) {
            res(JSON.parse(apiResponse.dynamicObject) as any)
          } else {
            res(null);
          }
        }, err => {
          res(null);
        })
    });
  }

  // unused method
  onFileUpload(e) {
    if (e.target.files && e.target.files[0]) {

      const file = e.target.files[0];
      const pattern = /image-*/;
      var type = e.target.files[0].type;
      var size = e.target.files[0].size;
      var maxSize = (Math.round(size / 1024) + " KB");
      console.log(maxSize);
      var FileSize = e.target.files[0].size / 1024 / 1024;
      if (FileSize > 2) {
        this.alertService.showWarning('The attachment size exceeds the allowable limit.');
        return;
      }
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        var FileName = file.name;
        let FileUrl = (reader.result as string).split(",")[1];

      };
    }
  }

  findInvalidControls(formGroupName) {
    return new Promise((res, rej) => {
      const invalid = [];
      const controls = formGroupName.controls;
      for (const name in controls) {
        if (controls[name].invalid) {
          invalid.push(name);
        }
      }
      console.log('invalid', invalid);
      return res(invalid);
    })

  }

  getUpperCaseLetterAtFirst(str) {
    var sL = str.length;
    var i = 0;
    var name = '';
    for (; i < sL; i++) {
      if (str.charAt(i) === str.charAt(i).toUpperCase()) {
        name += str.charAt(i)
      }
    }
    return name;
  }

  getIP() {
    return this.httpClient.get('https://ipinfo.io/json')
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
  }

  public isGuid(stringToTest) {
    if (stringToTest[0] === "{") {
      stringToTest = stringToTest.substring(1, stringToTest.length - 1);
    }
    var regexGuid = /^(\{){0,1}[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}(\}){0,1}$/gi;
    return regexGuid.test(stringToTest);
  }

  getMapAddress() {

    this.httpClient.get('http://maps.googleapis.com/maps/api/geocode/json?latlng=44.4647452,7.3553838&sensor=true ')
  }


  getProducts() {
    this.httpClient.get<any[]>('https://maps.googleapis.com/maps/api/geocode/json?latlng=44.4647452,7.3553838&sensor=true&&key=AIzaSyCFNwiuRsaxnJrOSZVCVZMWuS9AZuDHHV0')
      .subscribe(data => {
        console.log('sadfsadfsadfa', data);

      });
  }

  getGeoCoding(url) {
    return this.http.basicGetApi(url)
      .map(res => res)
      .catch(err => (err));

  }

  getPosition(): Promise<any> {
    return new Promise((resolve, reject) => {
      // navigator.permissions.query({
      //   name: 'geolocation'
      // }).then(function (result) {
      //   if (result.state == 'granted') {
      //     alert('bbddss')
      //     navigator.geolocation.getCurrentPosition(resp => {

      //       resolve({ lng: resp.coords.longitude, lat: resp.coords.latitude });
      //     },
      //       err => {
      //         reject(err);
      //       });
      //   } else if (result.state == 'prompt') {
      //     alert('baabdd')

      //     navigator.geolocation.getCurrentPosition(resp => {

      //       resolve({ lng: resp.coords.longitude, lat: resp.coords.latitude });
      //     },
      //       err => {
      //         reject(err);
      //       });
      //     // });

      //   } else if (result.state == 'denied') {
      //     alert('bbssssdd')

      //   }
      //   result.onchange = function () {

      //   }
      // });



      const options = {
        enableHighAccuracy: true,
        timeout: 1000,
        maximumAge: 0,
      };


      navigator.geolocation.getCurrentPosition(this.success, this.error, options);


      navigator.geolocation.getCurrentPosition(resp => {
        resolve({ lng: resp.coords.longitude, lat: resp.coords.latitude });
      },
        err => {
          reject(err);
        });
    });



  }

  success(pos) {
    const crd = pos.coords;

    try {



    } catch (error) {
      console.log('err', error);
    }
    console.log("Your current position is:");
    console.log(`Latitude : ${crd.latitude}`);
    console.log(`Longitude: ${crd.longitude}`);
    console.log(`More or less ${crd.accuracy} meters.`);
  }

  error(err) {
    console.warn(`ERROR(${err.code}): ${err.message}`);
  }



  showPosition(position) {
    var lat = position.coords.latitude;
    var lang = position.coords.longitude;
    var url = "https://nominatim.openstreetmap.org/reverse?lat=13.09211&lon=80.21632"

    $.getJSON(url, function (data) {
      console.log('data', data);

      // var address = data.results[0].formatted_address;

    });
  }


  updateValidation(value, control: AbstractControl) {
    if (value) {
      control.setValidators([Validators.required]);
    } else {
      control.clearValidators();
      control.setErrors(null);
    }
    control.updateValueAndValidity();
  }

}