import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder, FormControl, Validators, AbstractControl } from '@angular/forms';
import { AlertService, OnboardingService } from 'src/app/_services/service';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, catchError, tap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { ExternalAPIType, IntegrationTransactionalDetails } from 'src/app/_services/model/OnBoarding/IntegrationTransactionalDetails';
import { apiResult } from 'src/app/_services/model/apiResult';

@Component({
  selector: 'app-userverification',
  templateUrl: './userverification.component.html',
  styleUrls: ['./userverification.component.css']
})
export class UserverificationComponent implements OnInit {
  @Input() userDetails = null;

  userNumberVerficationForm: FormGroup;
  submitted: boolean = false;

  smallspinner: boolean = false;
  hasFailedInput: boolean = false;
  failedInputErrorMessage: string = "";

  constructor(
    private formBuilder: FormBuilder,
    private activeModal: NgbActiveModal,
    private alertService: AlertService,
    private http: HttpClient,
    private onboardingService: OnboardingService,

  ) {
    this.createReactiveForm();
  }
  get g() { return this.userNumberVerficationForm.controls; } // reactive forms validation 

  createReactiveForm() {
    this.userNumberVerficationForm = this.formBuilder.group({
      MobileNumber: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
      Name: ['', [Validators.required]],
      AlternativeMobileNumber: [''],
      PAN: [''],
      UAN: ['']
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


  ngOnInit() {

    if (this.userDetails != null) {
      this.userDetails.VerificationRequest == "UAN" ? this.updateValidation(true, this.userNumberVerficationForm.get('UAN')) : this.updateValidation(true, this.userNumberVerficationForm.get('PAN'))

      this.userNumberVerficationForm.patchValue({
        MobileNumber: this.userDetails.MobileNumber,
        Name: this.userDetails.Name,
        UAN: this.userDetails.VerificationRequest == "UAN" ? this.userDetails.OfficialNumber : "",
        PAN: this.userDetails.VerificationRequest == "PAN" ? this.userDetails.OfficialNumber : "",
      })

      this.doVerify();
    }


  }

  modal_dismiss(_actionName): void {
    this.activeModal.close(_actionName);
  }


  mobileNumberLengthRestrict(event: any, formCtrl: any) {
    if (event.target.value.length > 10) {
      formCtrl.setValue(event.target.value.slice(0, 10));
    }
  }
  doVerify() {
    this.submitted = true;
    this.hasFailedInput = false;
    this.failedInputErrorMessage = "";

    if (this.userNumberVerficationForm.invalid) {
      this.hasFailedInput = true;
      this.failedInputErrorMessage = "Please fill out all required information and match the number format for verification.";
      return;
    }

    this.smallspinner = true;

    if (this.userDetails.VerificationRequest === "UAN") {
      const data = {
        employeeName: this.userNumberVerficationForm.get('Name').value,
        mobile: this.userNumberVerficationForm.get('MobileNumber').value
      };

      this.callAndLogAPI(environment.environment.UAN_ENDPOINT, data);
    } else {
      const data_pan = {
        pan: this.userNumberVerficationForm.get('PAN').value,
      };

      this.callAndLogAPI(environment.environment.PAN_ENDPOINT, data_pan);
    }
  }

  callAndLogAPI(endpoint, data) {
    const response = this.callExternalAPI(endpoint, data);
    console.log('err', response);
  }


  callExternalAPI(UAN_ENDPOINT, data) {

    // let responseData_UAN = {
    //   status: "",
    //   data: {
    //     nameLookup: null,
    //     uan: [{
    //       employer: [],
    //       uan: "",
    //       uanSource: ""
    //     }]
    //   }
    // }

    // let responseData_PAN = {
    //   status: "",
    //   data: {
    //     requestId: "",
    //     result: {
    //       pan: "",
    //       name: "",
    //       firstName: "",
    //       middleName: "",
    //       lastName: "",
    //       gender: "",
    //       dob: "",
    //       aadhaarLinked: false,
    //       "address": {
    //         "buildingName": "",
    //         "locality": "",
    //         "streetName": "",
    //         "pinCode": "",
    //         "city": "",
    //         "state": "",
    //         "country": ""
    //       },
    //       "mobileNo": "",
    //       "emailId": "",
    //       "profileMatch": [],
    //       "aadhaarMatch": null,
    //       "status": "",
    //       "issueDate": ""
    //     },
    //     "statusCode": 0
    //   }
    // }

    let responseData_UAN = { status: "", data: { uan: [{ employer: [], uan: "", uanSource: "" }] } };
    let responseData_PAN = { status: "", data: { requestId: "", result: {}, statusCode: 0 } };

    let iTdetails = new IntegrationTransactionalDetails();
    const verificationRequest = this.userDetails.VerificationRequest;

    iTdetails.UniQueNumber = verificationRequest === "UAN" ? this.userNumberVerficationForm.get('MobileNumber').value : this.userNumberVerficationForm.get('PAN').value;
    iTdetails.UniqueName = this.userNumberVerficationForm.get('Name').value;
    iTdetails.CompanyId = this.userDetails.CompanyId;

    const payload = JSON.stringify({
      IntegrationTransactionalDetails: iTdetails,
      externalAPIType: verificationRequest === "UAN" ? ExternalAPIType.UAN : ExternalAPIType.PAN
    });

    console.log("PYD ##121 ::", payload);

    return this.onboardingService.VerifyUniqueNumber(JSON.stringify(payload)).subscribe(
      (data: apiResult) => {
        console.log('OTP Validate :', data);
        this.smallspinner = false;

        if (data.Status) {
          this.smallspinner = false;
          iTdetails = data.Result as any;
          const responseData = JSON.parse(iTdetails.ResponseData);

          if (verificationRequest === "UAN") {
            responseData_UAN = responseData;

            if (responseData_UAN.status === 'SUCCESS' && responseData_UAN.data && responseData_UAN.data.uan.length > 0) {
              if (this.userNumberVerficationForm.get('UAN').value === responseData_UAN.data.uan[0].uan) {
                this.alertAndClose('UAN', 'The entered UAN validated successfully.');
              } else {
                this.failedInputErrorMessage = "The verification of UAN numbers failed. (Mobile Number and Name against UAN does not match with it)";
                this.showAlertAndSetFlag('UAN');
              }
            } else {
              this.showAlertAndSetFlag('UAN');
            }
          } else if (verificationRequest === "PAN") {
            responseData_PAN = responseData;

            if (responseData_PAN.status === 'SUCCESS' && responseData_PAN.data && responseData_PAN.data.statusCode !== 102 && responseData_PAN.data.statusCode !== 104 && responseData_PAN.data.result) {
              if (this.verifyPANData(responseData_PAN.data.result)) {
                this.alertAndClose('PAN', 'The entered PAN validated successfully.');
              } else {
                this.failedInputErrorMessage = "The verification of PAN numbers failed. The supplied number does not match the server data.";
                this.showAlertAndSetFlag('PAN');
              }
            } else {
              this.showAlertAndSetFlag('PAN');
            }
          }
        } else {
          this.smallspinner = false;
          this.alertService.showWarning('The verification of unique numbers failed. The supplied number does not match the server data. Please try again after some time.');
        }
      },
      (err) => {
        this.smallspinner = false;
        this.failedInputErrorMessage = "The verification of unique numbers failed. The supplied number does not match the server data.";
        this.hasFailedInput = true;
      }
    );
  }

  // verifyPANData(resultData) {
  //   const userPAN = this.userNumberVerficationForm.get('PAN').value.toUpperCase();
  //   const serverPAN = resultData.pan.toUpperCase();
  //   const userName = this.userNumberVerficationForm.get('Name').value.replace(/\s/g, '').toUpperCase();

  //   const serverName = resultData.name.replace(/\s/g, '').toUpperCase();
  //   const serverFirstName = resultData.firstName.replace(/\s/g, '').toUpperCase();
  //   const serverLastName = resultData.middleName.replace(/\s/g, '').toUpperCase();
  //   const serverMiddleName = resultData.lastName.replace(/\s/g, '').toUpperCase();

  //   const name1Cleaned = userName.trim().toUpperCase();
  //   const name2Cleaned = serverName.trim().toUpperCase();
  //   var isMatching = false;

  //   isMatching = this.fuzzyNameMatch(name1Cleaned, name2Cleaned, 2);
  //   if (!isMatching) {
  //     isMatching = serverFirstName != "" ? this.fuzzyNameMatch(name1Cleaned, serverFirstName, 2) : false;
  //     if (!isMatching) {
  //       isMatching = serverMiddleName != "" ? this.fuzzyNameMatch(name1Cleaned, serverMiddleName, 2): false;
  //       if (!isMatching) {
  //         isMatching = serverLastName != "" ?  this.fuzzyNameMatch(name1Cleaned, serverLastName, 2): false; 
  //       }
  //     }
  //   }

  //   return userPAN === serverPAN && (isMatching);
  // }

  verifyPANData(resultData) {
    const userPAN = this.userNumberVerficationForm.get('PAN').value.toUpperCase();
    const serverPAN = resultData.pan.toUpperCase();
    const userName = this.userNumberVerficationForm.get('Name').value.replace(/\s/g, '').toUpperCase();
    const serverNameParts = [
      resultData.name, resultData.firstName, resultData.middleName, resultData.lastName
    ].map(namePart => namePart.replace(/\s/g, '').toUpperCase());
  
    const cleanedUserName = userName.trim().toUpperCase();
  
    const isMatching = this.checkNameMatching(cleanedUserName, serverNameParts, environment.environment.threshold);
  
    return userPAN === serverPAN && isMatching;
  }
  
  checkNameMatching(userName, serverNames, threshold) {
    for (const serverName of serverNames) {
      if (this.fuzzyNameMatch(userName, serverName, threshold)) {
        return true;
      }
    }
    return false;
  }



  alertAndClose(type, message) {
    this.alertService.showSuccess(message);
    const officialNumber = type === 'UAN' ? this.userNumberVerficationForm.get('UAN').value : this.userNumberVerficationForm.get('PAN').value;
    this.activeModal.close({ OfficialNumber: officialNumber, IsVerified: true });
  }

  showAlertAndSetFlag(type) {
    this.hasFailedInput = true;
    this.alertService.showWarning(`The verification of ${type} numbers failed. ${type === 'UAN' ? 'Mobile Number and Name against UAN does not match with it' : 'The supplied number does not match the server data.'}`);
  }


  levenshteinDistance(str1, str2) {
    const m = str1.length;
    const n = str2.length;
    const dp = Array.from(Array(m + 1), () => Array(n + 1).fill(0));

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (str1[i - 1] === str2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1];
        } else {
          dp[i][j] = Math.min(
            dp[i - 1][j] + 1,
            dp[i][j - 1] + 1,
            dp[i - 1][j - 1] + 1
          );
        }
      }
    }

    return dp[m][n];
  }

  fuzzyNameMatch(name1, name2, threshold) {
    const distance = this.levenshteinDistance(name1.toLowerCase(), name2.toLowerCase());
    console.log('name1 |  name2:', `${name2} -${name2}`);
    console.log('distance :', distance);
    return distance <= threshold;
  }

}
