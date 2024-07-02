import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { enumHelper } from '../../directives/_enumhelper';
import { ApproverType } from '@services/model/Candidates/CandidateDetails';
import { UUID } from 'angular2-uuid';
import { UIMode } from '@services/model';

@Component({
  selector: 'app-employment-reference-details',
  templateUrl: './employment-reference-details.component.html',
  styleUrls: ['./employment-reference-details.component.css']
})
export class EmploymentReferenceDetailsComponent implements OnInit {

  @Input() UserId: any;
  @Input() jsonObj: any;
  @Input() EntityType: string;

  referenceForm: FormGroup;
  ReferenceTypeList: any = [];

  submitted: boolean = false;
  constructor(
    private activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private utilsHelper: enumHelper,
  ) {
    this.createForm();

  }
  get g() { return this.referenceForm.controls; } // reactive forms validation 

  createForm() {

    this.referenceForm = this.formBuilder.group({
      Id: UUID.UUID(),
      Type: [null, Validators.required],
      Name: ['', [Validators.required]],
      Organization: [''],
      Designation: [''],
      Email: ['', [Validators.required, Validators.email]],
      ContactNumber: ['', Validators.required],
      Department: [''],
      Location: [''],
      Modetype: [UIMode.Edit],
      Status: [true]
    });

  }

  get formControls() {
    return this.referenceForm.controls;
  }

  mobileNumberLengthRestrict(event: any, formCtrl: any) {
    if (event.target.value.length > 10) {
      formCtrl.setValue(event.target.value.slice(0, 10));
    }
  }

  ngOnInit() {
    console.log('jsonObj', this.jsonObj);
    this.ReferenceTypeList = this.utilsHelper.transform(ApproverType);
    if (this.jsonObj) {
      try {
        // this.referenceForm.patchValue(this.jsonObj);
       
       

        this.referenceForm.patchValue({
          Type: this.jsonObj.Type,
          Name: this.jsonObj.Name,
          Organization: this.jsonObj.Organization,
          Designation: this.jsonObj.Designation,
          Email: this.jsonObj.Email,
          ContactNumber: this.jsonObj.ContactNumber,
          Department: this.jsonObj.Department,
          Location: this.jsonObj.Location,
          Modetype: this.jsonObj.Modetype,
          Status: this.jsonObj.Status,
          Id : this.jsonObj.Id
        });

      } catch (error) {
        console.log('ereror ::', error);

      }

    }

  }

  submitForm() {
    this.submitted = true;

    if (this.referenceForm.valid) {
      console.log(this.referenceForm.value);
      this.referenceForm.controls['Modetype'].setValue(UIMode.Edit);
      this.activeModal.close(this.referenceForm.value);
    }
  }
  confirmExit() {
    this.activeModal.close('Modal Closed');
  }

}
