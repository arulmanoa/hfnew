import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { IntegrationTransactionalDetails } from 'src/app/_services/model/OnBoarding/IntegrationTransactionalDetails';
import { apiResult } from 'src/app/_services/model/apiResult';
import { AlertService, OnboardingService } from 'src/app/_services/service';
import { UtilityService } from 'src/app/_services/service/utitlity.service';
import { FormGroup, FormBuilder, FormControl, Validators, AbstractControl } from '@angular/forms';
import { DuplicateCandidateDetails } from 'src/app/_services/model/Candidates/CandidateDetails';

@Component({
  selector: 'app-aadhaar-verification',
  templateUrl: './aadhaar-verification.component.html',
  styleUrls: ['./aadhaar-verification.component.css']
})
export class AadhaarVerificationComponent implements OnInit {

  @Input() defaultSearchInputs: any = {
    ClientContractId: 0,
    ClientId: 0,
    ClientName: "",
    ClientContractName: ""
  };

  @Input() CompanyId: number = 0;

  aadhaarForm: FormGroup;
  submitted: boolean = false;

  UINumber: string;
  UIName: string;
  OTP: string

  hasSentOTP: boolean = false;
  hasFailedInput: boolean = false;
  failedInputErrorMessage: string = "";
  hasSuccessInput: boolean = false;
  successInputErrorMessage: string = "";
  smallspinner: boolean = false;

  integrationTransactionalDetails = new IntegrationTransactionalDetails();

  IsaadhaarPetternValid: boolean = true;
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private activeModal: NgbActiveModal,
    private onboardingService: OnboardingService,
    private alertService: AlertService,
    private utilityService: UtilityService
  ) {
    this.createReactiveForm();
  }
  get g() { return this.aadhaarForm.controls; } // reactive forms validation 

  createReactiveForm() {
    const urlRegex = /^[2-9]{1}[0-9]{3}[0-9]{4}[0-9]{4}$/;
    this.aadhaarForm = this.formBuilder.group({
      UINumber: ['', [Validators.required, Validators.minLength(12), Validators.maxLength(12), Validators.pattern(urlRegex)]],
      UIName: ['', [Validators.required, Validators.minLength(3)]],
      OTP: [''],
      OTP1: [''],
      OTP2: [''],
      OTP3: [''],
      OTP4: [''],
      OTP5: [''],
    });
  }

  ngOnInit() {
  }

  modal_dismiss(_actionName): void {
    this.activeModal.close(_actionName);
  }

  patternValidator(value) {
    this.IsaadhaarPetternValid = true;
    if (!value) {
      this.IsaadhaarPetternValid = true;
      return true;
    }
    console.log('value', value);

    const regex = new RegExp('^[2-9]{1}[0-9]{3}[0-9]{4}[0-9]{4}$');
    const valid = regex.test(value);
    return valid ? this.IsaadhaarPetternValid = true : this.IsaadhaarPetternValid = false;;
  };

  updateValidation(value, control: AbstractControl) {
    if (value) {
      control.setValidators([Validators.required]);
    } else {
      control.clearValidators();
      control.setErrors(null);
    }
    control.updateValueAndValidity();

  }

  otpController(event, next, prev) {


    if (event.target.value.length < 1 && prev) {
      // console.log('prev',prev);
      // document.querySelector(`#test`).focus()
      // prev.setFocus()
      document.querySelector<HTMLInputElement>(`#${prev}`).focus();

    }
    else if (next && event.target.value.length > 0) {
      console.log('next', next);
      document.querySelector<HTMLInputElement>(`#${next}`).focus();
      // document.querySelector(`#test`).focus()
      // next.setFocus();
    }
    else {
      return 0;
    }

  }


  doVerifyAadhaar(): void {

    this.submitted = true;
    this.hasFailedInput = false;
    this.failedInputErrorMessage = "";

    console.log('this.aadhaarForm.value', this.aadhaarForm.value);


    if (this.aadhaarForm.invalid) {
      this.hasFailedInput = true;
      this.failedInputErrorMessage = "You must have filled out all the required fields and try to verify";
      this.alertService.showWarning('You must have filled out all the required fields and try to verify');
      return;
    }




    this.smallspinner = true;

    this.doCheckDuplication().then(result => {

      if (result) {

        this.aadhaarForm.controls['UINumber'].disable();
        this.aadhaarForm.controls['UIName'].disable();

        this.integrationTransactionalDetails.UniQueNumber = this.aadhaarForm.get('UINumber').value;
        this.integrationTransactionalDetails.UniqueName = this.aadhaarForm.get('UIName').value;
        this.integrationTransactionalDetails.ClientId = 0;
        this.integrationTransactionalDetails.ClientContractId = 0;
        this.integrationTransactionalDetails.CompanyId = this.CompanyId;
        console.log('PYL ::', this.integrationTransactionalDetails);

        this.onboardingService.SendAadhaarOTP(JSON.stringify(this.integrationTransactionalDetails)).subscribe((data: apiResult) => {
          console.log('Aadhaar Validate :', data);
          if (data.Status) {
            this.smallspinner = false;
            this.integrationTransactionalDetails = data.Result as any;
           
                    
            if (this.integrationTransactionalDetails.IsFinalResponse) {

              const responseData = JSON.parse(this.integrationTransactionalDetails.ResponseData);
              if(responseData.data.statusCode == 104 && this.isEmptyObject(responseData.data.result)){
                this.hasFailedInput = true;
                this.failedInputErrorMessage = "Whoops! Information is not sufficiently received. There are some server-side problems. Please try after some time.";
                return;
              }

              this.hasSuccessInput = true;
              this.successInputErrorMessage = "The Aadhaar number entered has been verified. Please click Continue to make more changes."
              // this.activeModal.close(this.integrationTransactionalDetails);
            }
            else {
              this.smallspinner = false;
              this.updateValidation(true, this.aadhaarForm.get('OTP'));
              this.updateValidation(true, this.aadhaarForm.get('OTP1'));
              this.updateValidation(true, this.aadhaarForm.get('OTP2'));
              this.updateValidation(true, this.aadhaarForm.get('OTP3'));
              this.updateValidation(true, this.aadhaarForm.get('OTP4'));
              this.updateValidation(true, this.aadhaarForm.get('OTP5'));
              this.hasSentOTP = true;
            }

          } else {
            this.smallspinner = false;
            this.aadhaarForm.controls['UINumber'].enable();
            this.aadhaarForm.controls['UIName'].enable();
            this.alertService.showWarning('UIDAI is facing some issue at the moment. Please try again after sometime');
          }

        }, ((err) => {

        }));
      } else {
        this.hasFailedInput = true;
        this.failedInputErrorMessage = "The provided Aadhaar number has already been recorded.";
        return;
      }
    })

  }

  doCheckDuplication() {

    const promise = new Promise((res, rej) => {

      var duplicateCandidateDetails = new DuplicateCandidateDetails();
      duplicateCandidateDetails.CandidateId = 0;
      duplicateCandidateDetails.FirstName = this.aadhaarForm.get('UIName').value;
      duplicateCandidateDetails.Aadhaar = this.aadhaarForm.get('UINumber').value;

      console.log('DUPLICATE CANDI PYD :: ', duplicateCandidateDetails);

      this.onboardingService.ValidateCandidateInformation(duplicateCandidateDetails).subscribe((result) => {
        console.log('result', result);

        let apiResult: apiResult = (result);
        // this.alertService.showSuccess("The candidate was successfully validated.");
        if (apiResult.Status && apiResult.Result != null) {
          res(true);
          this.smallspinner = false;

        } else if (!apiResult.Status && apiResult.Message != null && apiResult.Message != '') {
          res(false);
          this.smallspinner = false;
        } else {
          res(true);
        }
      }, err => {
        this.smallspinner = false;
      })
    })
    return promise;
  }

  isEmptyObject(obj) {
    return (obj && (Object.keys(obj).length === 0));
  }

  doVerifyOTP() {
    this.submitted = true;
    this.hasFailedInput = false;
    this.failedInputErrorMessage = "";

    if (this.aadhaarForm.invalid) {
      this.hasFailedInput = true;
      this.failedInputErrorMessage = "You must have filled out all the required fields and try to verify";
      this.alertService.showWarning('You must have filled out all the required fields and try to verify');
      return;
    }
    this.smallspinner = true;

    var OTP = this.aadhaarForm.get('OTP').value + this.aadhaarForm.get('OTP1').value +
      this.aadhaarForm.get('OTP2').value + this.aadhaarForm.get('OTP3').value +
      this.aadhaarForm.get('OTP4').value + this.aadhaarForm.get('OTP5').value;

    this.integrationTransactionalDetails.OTP = OTP.trim();
    this.onboardingService.VerifyAadhaar(JSON.stringify(this.integrationTransactionalDetails)).subscribe((data: apiResult) => {
      console.log('OTP Validate :', data);
      if (data.Status) {
        this.integrationTransactionalDetails = data.Result as any;
        this.smallspinner = false;
        
        const responseData = JSON.parse(this.integrationTransactionalDetails.ResponseData);
        if(responseData.data.statusCode == 102 && this.isEmptyObject(responseData.data.result)){
          this.hasFailedInput = true;
          this.failedInputErrorMessage = "Whoops! The OTP you entered seemed invalid. Please attempt again.";
          return;
        }
        if(responseData.data.statusCode == 104 && this.isEmptyObject(responseData.data.result)){
          this.hasFailedInput = true;
          this.failedInputErrorMessage = "Whoops! Information is not sufficiently received. There are some server-side problems. Please try after some time.";
          return;
        }
        
        if (this.integrationTransactionalDetails.IsFinalResponse) {
          // this.activeModal.close(this.integrationTransactionalDetails);
          this.hasSuccessInput = true;
          this.successInputErrorMessage = "The Aadhaar number entered has been verified. Please click 'Continue' to make more changes."

        }
      } else {
        this.smallspinner = false;
        this.alertService.showWarning('UIDAI is facing some issue at the moment. Please try again after sometime');
      }

    }, ((err) => {

    }));
  }

  doProceed(){
    this.activeModal.close(this.integrationTransactionalDetails);
    
  }

  aadhaarKeyUp(e){
    if (e.target.value.length > e.target.maxLength) {
      e.target.value = e.target.value.slice(0, e.target.maxLength);
      e.preventDefault();
      e.stopPropagation();   
      return;
  }
    // if (length >= 12) {
    //   e.preventDefault();  
    //   e.stopPropagation();   
    // }
  }


 
}
