import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { IntegrationTransactionalDetails } from 'src/app/_services/model/OnBoarding/IntegrationTransactionalDetails';
import { apiResult } from 'src/app/_services/model/apiResult';
import { AlertService, OnboardingService } from 'src/app/_services/service';
import { UtilityService } from 'src/app/_services/service/utitlity.service';
import { FormGroup, FormBuilder, FormControl, Validators, AbstractControl } from '@angular/forms';
import { Gender } from 'src/app/_services/model/Base/HRSuiteEnums';
import { enumHelper } from 'src/app/shared/directives/_enumhelper';
import moment from 'moment';
import { DuplicateCandidateDetails } from 'src/app/_services/model/Candidates/CandidateDetails';

@Component({
  selector: 'app-candidatebasicinformation',
  templateUrl: './candidatebasicinformation.component.html',
  styleUrls: ['./candidatebasicinformation.component.css']
})
export class CandidatebasicinformationComponent implements OnInit {

  @Input() defaultSearchInputs: any = {
    ClientContractId: 0,
    ClientId: 0,
    ClientName: "",
    ClientContractName: ""
  };

  candidateForm: FormGroup;
  submitted: boolean = false;
  smallspinner: boolean = false;
  LstGender: any = [];

  DOBmaxDate: Date;
  isInvalidCandidateInformation: boolean = false;
  DuplicateCheckMessage: string = '';

  minDate: Date;
  maxDate: Date;
  
  LstcountryCode = [
    {
      id: 1,
      name: "91"
    },
    {
      id: 2,
      name: "01"
    },
    {
      id: 3,
      name: "99"
    },
    {
      id: 4,
      name: "66"
    },
    {
      id: 5,
      name: "65"
    },
    {
      id: 6,
      name: "60"
    },
    {
      id: 1,
      name: "983"
    }
  ];
  
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private activeModal: NgbActiveModal,
    private onboardingService: OnboardingService,
    private alertService: AlertService,
    private utilityService: UtilityService,
    private utilsHelper: enumHelper
  ) {
    this.createReactiveForm();
  }

  get g() { return this.candidateForm.controls; } // reactive forms validation 

  createReactiveForm() {
    const urlRegex = /^[2-9]{1}[0-9]{3}[0-9]{4}[0-9]{4}$/;
    this.candidateForm = this.formBuilder.group({
      CandidateName: ['', [Validators.required]],
      AadhaarNumber: ['', [Validators.required, Validators.minLength(12), Validators.maxLength(12), Validators.pattern(urlRegex)]],
      Gender: [null, [Validators.required]],
      FathersName: [''],
      PrimaryEmail: ['', Validators.required],
      MobileNumber: ['', Validators.required],
      DOB: [null, Validators.required],
      PANNumber: [''],
      ApprenticeCode : ['', Validators.required],

    });
  }
  ngOnInit() {
    this.DOBmaxDate = new Date();
    // this.DOBmaxDate.setFullYear(this.DOBmaxDate.getFullYear() - 18);
    this.minDate  = new Date();
    this.maxDate  = new Date();
    this.minDate.setFullYear(this.minDate.getFullYear() - 35);
    this.maxDate.setFullYear(this.maxDate.getFullYear() - 17);
  
   
    this.LstGender = this.utilsHelper.transform(Gender);

  }
  mobileNumberLengthRestrict(event: any, formCtrl: any) {
    if (event.target.value.length > 10) {
      formCtrl.setValue(event.target.value.slice(0, 10));
    }
  }


  doCheckAadhaarMaxlength(event: any, formCtrl: any) {
    if (event.target.value.length > 12) {
      formCtrl.setValue(event.target.value.slice(0, 12));
    }
  }

  onChangeDOB(event){
    
  }

  doCancel(_actionName): void {
    this.activeModal.close(_actionName);
  }

  doContinue() {
    console.log('sss', this.candidateForm.value);

    this.submitted = true;

    if (this.utilityService.isNullOrUndefined(this.candidateForm.get('CandidateName').value) == true) {
      this.alertService.showWarning('Please enter the Candidate Name');
      return;
    }

    else if (this.utilityService.isNullOrUndefined(this.candidateForm.get('PrimaryEmail').value) == true) {
      this.alertService.showWarning('Candidate E-Mail is required');
      return;
    }
    else if (this.candidateForm.get('PrimaryEmail').valid == false) {
      this.alertService.showWarning('Please enter valid email (pattern mismatch)');
      return;
    }

    else if (this.utilityService.isNullOrUndefined(this.candidateForm.get('MobileNumber').value) == true) {
      this.alertService.showWarning('Please enter the Candidate Mobile No.');
      return;
    }
    else if (this.candidateForm.get('MobileNumber').valid == false) {
      this.alertService.showWarning('Mobile No should be minimum 10 characters');
      return;
    }

    else if (this.utilityService.isNullOrUndefined(this.candidateForm.get('DOB').value) == true) {
      this.alertService.showWarning('Please enter the Date of Birth');
      return;
    }

    var date = moment(this.candidateForm.get('DOB').value);
    if (!date.isValid) {
      this.alertService.showWarning('Please enter valid Date of Birth (DD-MM-YYYY)');
      return;
    } else if (moment(date).isAfter(moment(this.DOBmaxDate), 'day')) {
      this.alertService.showWarning('Please enter valid Date of Birth (DD-MM-YYYY)');
      return;
    }

    


    try {
      this.smallspinner = true;
      this.isInvalidCandidateInformation = false;
      this.DuplicateCheckMessage = '';
      var duplicateCandidateDetails = new DuplicateCandidateDetails();
      duplicateCandidateDetails.CandidateId = 0;

      this.candidateForm.controls['CandidateName'] != null ? duplicateCandidateDetails.FirstName = this.candidateForm.get('CandidateName').value == null || this.candidateForm.get('CandidateName').value == "" ? "" : this.candidateForm.get('CandidateName').value : null;
      this.candidateForm.controls['DOB'] != null ? duplicateCandidateDetails.dateOfBirth = this.candidateForm.get('DOB').value == null ? null : moment(this.candidateForm.get('DOB').value).format('YYYY-MM-DD') : null;
      this.candidateForm.controls['MobileNumber'] != null ? duplicateCandidateDetails.PrimaryMobile = this.candidateForm.get('MobileNumber').value == null || this.candidateForm.get('MobileNumber').value == "" ? "" : this.candidateForm.get('MobileNumber').value : null;
      this.candidateForm.controls['PrimaryEmail'] != null ? duplicateCandidateDetails.PrimaryEmail = this.candidateForm.get('PrimaryEmail').value == null || this.candidateForm.get('PrimaryEmail').value == "" ? "" : this.candidateForm.get('PrimaryEmail').value : null;
      this.candidateForm.controls['AadhaarNumber'] != null ? duplicateCandidateDetails.Aadhaar = this.candidateForm.get('AadhaarNumber').value == null || this.candidateForm.get('AadhaarNumber').value == "" ? "" : this.candidateForm.get('AadhaarNumber').value : null;
      this.candidateForm.controls['PANNumber'] != null ? duplicateCandidateDetails.PAN = this.candidateForm.get('PANNumber').value == null || this.candidateForm.get('PANNumber').value == "" ? "" : this.candidateForm.get('PANNumber').value : null;
      this.candidateForm.controls['ApprenticeCode'] != null ? duplicateCandidateDetails.ApprenticeCode = this.candidateForm.get('ApprenticeCode').value == null || this.candidateForm.get('ApprenticeCode').value == "" ? "" : this.candidateForm.get('ApprenticeCode').value : null;

      console.log('DUPLICATE CANDI PYD :: ', duplicateCandidateDetails);

      this.onboardingService.ValidateCandidateInformation(duplicateCandidateDetails).subscribe((result) => {
        console.log('result', result);

        let apiResult: apiResult = (result);
        // this.alertService.showSuccess("The candidate was successfully validated.");
        if (apiResult.Status && apiResult.Result != null) {
          this.smallspinner = false;
          this.activeModal.close(this.candidateForm.value);
        } else if (!apiResult.Status && apiResult.Message != null && apiResult.Message != '') {
          this.isInvalidCandidateInformation = true;
          this.DuplicateCheckMessage = apiResult.Message;
          this.smallspinner = false;
        } else if (apiResult.Status) {
          this.smallspinner = false;
          this.activeModal.close(this.candidateForm.value);
        } else {
          this.smallspinner = false;
        }
      }, err => {
        this.smallspinner = false;
      })
    } catch (error) {
      this.smallspinner = false;
      console.log('DUPLICATE CHECK EXECPTION ERROR :', error);

    }
  }


}
