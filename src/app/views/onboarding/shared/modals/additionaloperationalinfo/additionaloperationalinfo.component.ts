import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { UIMode } from '@services/model';
import { AdditionalOperationalDetails } from '@services/model/Candidates/AdditionalOperationalDetails';
import { OnboardingAdditionalInfo } from '@services/model/OnBoarding/OnBoardingInfo';
import { SessionStorage } from '@services/service';
import { UUID } from 'angular2-uuid';
@Component({
  selector: 'app-additionaloperationalinfo',
  templateUrl: './additionaloperationalinfo.component.html',
  styleUrls: ['./additionaloperationalinfo.component.css']
})
export class AdditionaloperationalinfoComponent implements OnInit, OnDestroy {
  @Input() additionalOperationalDetails: AdditionalOperationalDetails;
  @Input() IsCandidate: boolean;
  @Output() onboardingAdditionalOperationalInfoChangeHandler = new EventEmitter();
  @Input() RoleCode: string = "";
  @Input() onboardingAdditionalInfo: OnboardingAdditionalInfo;

  additionalOperationalInfoForm: FormGroup;
  submitted = false;
  clientName: string = '';
  currentDate: Date = new Date();

  constructor(private formBuilder: FormBuilder, private sessionService: SessionStorage) {
    this.createForm();
  }
  get g() { return this.additionalOperationalInfoForm.controls; }

  createForm() {

    this.additionalOperationalInfoForm = this.formBuilder.group({
      Id: UUID.UUID(),
      IsUniformIssued: [false],
      NumberOfUniformSetsIssued: [null],
      IsFingerPrintRegistered: [false],
      IsFormScanned: [true],
      IsIDCardIssued: [false],
      IsInterviewedEarlier: [false],
      EarlierInterviewedOn: [''],
      EarlierInterviewedBy: [''],
      EarlierInterviewResult: [''],
      IsEmployedByUsEarlier: [false],
      EarlierEmployeeId: [''],
      EarlierEmploymentStartDate: [''],
      EarlierEmploymentEndDate: [''],
      EarlierDivision: [null],
      EarlierDepartment: [null],
      ReasonForLeaving: [''],
      IsChronicIllness: [false],
      ChronicIllnessDetails: [''],
      IsPreparingForCompetitiveExam: [false],
      CompetitiveExamDetails: [''],
      IsConvictedByPolice: [false],
      PoliceCaseDetails: [''],
      IsBlackListCheckDone: [false],
      Modetype: [UIMode.Edit],
      Status: [true]
    });
  }

  ngOnInit() {

    const clientSME = JSON.parse(this.sessionService.getSessionStorage("SME_Client"));
    if (clientSME != null) {
      this.clientName = clientSME.Name;
    }
    console.log('additional TEDST ::::::::::::::;', this.additionalOperationalDetails);

    if (this.additionalOperationalDetails) {
      for (const prop of Object.keys(this.additionalOperationalDetails)) {

        if (prop == 'EarlierEmploymentEndDate' && this.additionalOperationalDetails[prop] != null) {
          this.additionalOperationalDetails[prop] = new Date(this.additionalOperationalDetails[prop]);
        }
        if (prop == 'EarlierEmploymentStartDate' && this.additionalOperationalDetails[prop] != null) {
          this.additionalOperationalDetails[prop] = new Date(this.additionalOperationalDetails[prop]);
        }
        if (prop == 'EarlierInterviewedOn' && this.additionalOperationalDetails[prop] != null) {
          this.additionalOperationalDetails[prop] = new Date(this.additionalOperationalDetails[prop]);
        }
        if (prop == 'EarlierDivision' && this.additionalOperationalDetails[prop] != null) {
        
          this.additionalOperationalDetails[prop] = ((typeof this.additionalOperationalDetails[prop] == 'string') ? Number(this.additionalOperationalDetails[prop]) : this.additionalOperationalDetails[prop]);
        }

        if (prop == 'EarlierDepartment' && this.additionalOperationalDetails[prop] != null) {
          this.additionalOperationalDetails[prop] = ((typeof this.additionalOperationalDetails[prop] == 'string') ? Number(this.additionalOperationalDetails[prop]) : this.additionalOperationalDetails[prop]);
        }
      }

      console.log('additional TEDST  3::::::::::::::;', this.additionalOperationalDetails);

      this.additionalOperationalInfoForm.patchValue(this.additionalOperationalDetails);
    }

    console.log(this.additionalOperationalInfoForm.value);
  }

  onStartDateChange() {
    this.additionalOperationalInfoForm.controls.EarlierEmploymentEndDate.setValue(null);
  }

  isFieldRequired(fieldName: string): boolean {
    const control = this.additionalOperationalInfoForm.get(fieldName);
    return control && control.hasError('required');
  }

  onSubmit() {

    if (this.additionalOperationalInfoForm.valid) {
      console.log(this.additionalOperationalInfoForm.value);
    } else {

    }
  }
  EmitHandler() {
    this.submitted = true;
  }
  ngOnDestroy() {
    this.EmitHandler()
    console.log(this.additionalOperationalInfoForm.value);
    if (this.additionalOperationalInfoForm.controls.IsInterviewedEarlier.value == 'no') {
      this.additionalOperationalInfoForm.controls.EarlierInterviewedOn.setValue(null);
      this.additionalOperationalInfoForm.controls.EarlierInterviewedBy.setValue(null);
      this.additionalOperationalInfoForm.controls.EarlierInterviewResult.setValue(null);
    }

    if (this.additionalOperationalInfoForm.controls.IsEmployedByUsEarlier.value == false) {
      this.additionalOperationalInfoForm.controls.EarlierEmploymentStartDate.setValue(null);
      this.additionalOperationalInfoForm.controls.EarlierEmploymentEndDate.setValue(null);
      this.additionalOperationalInfoForm.controls.EarlierEmployeeId.setValue(null);
      this.additionalOperationalInfoForm.controls.EarlierDivision.setValue(null);
      this.additionalOperationalInfoForm.controls.ReasonForLeaving.setValue(null);
      this.additionalOperationalInfoForm.controls.EarlierDepartment.setValue(null);

    }

    if (this.additionalOperationalInfoForm.controls.IsPreparingForCompetitiveExam.value == false) {
      this.additionalOperationalInfoForm.controls.CompetitiveExamDetails.setValue(null);
    }
    if (this.additionalOperationalInfoForm.controls.IsConvictedByPolice.value == false) {
      this.additionalOperationalInfoForm.controls.PoliceCaseDetails.setValue(null);
    }
    if (this.additionalOperationalInfoForm.controls.IsChronicIllness.value == false) {
      this.additionalOperationalInfoForm.controls.ChronicIllnessDetails.setValue(null);
    }
    this.onboardingAdditionalOperationalInfoChangeHandler.emit(this.additionalOperationalInfoForm.value);
  }

}
