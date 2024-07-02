import { Component, OnInit, Input } from '@angular/core';
import { enumHelper } from '../../../directives/_enumhelper';
import { Relationship } from '../../../../_services/model/Base/HRSuiteEnums';
import { FormGroup, FormBuilder, FormControl, Validators, AbstractControl } from '@angular/forms';
import { UUID } from 'angular2-uuid';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'lodash';
import { AlertService, EmployeeService, SessionStorage } from 'src/app/_services/service';
import { DatePipe } from '@angular/common';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { EmployeeDetails, EmployeeMenuData } from 'src/app/_services/model/Employee/EmployeeDetails';
import { apiResult } from 'src/app/_services/model/apiResult';

@Component({
  selector: 'app-medicdependent-modal',
  templateUrl: './medicdependent-modal.component.html',
  styleUrls: ['./medicdependent-modal.component.css']
})
export class MedicdependentModalComponent implements OnInit {
  @Input() medicType: any;
  @Input() editJson: any;
  @Input() ProductInfo: any;

  medicDependForm: FormGroup;
  submitted = false;
  employeedetails: EmployeeDetails = {} as any;
  relationship: any = [];
  DependentType = [{ Id: 1, Name: "Self" }, { Id: 2, Name: "Immediate Dependents" }, { Id: 3, Name: "Parents more than 60 years old" }];
  lstDisabilityPercentage = [{
    Id: 1, Name: "more than 40% but less than 80%"
  }, { Id: 2, Name: "more than 80%" }];
  lstAgeofDependent = [{ Id: 2, Name: "less than or equal to 60 years of age" }, { Id: 3, Name: "more than 60 years of age" }];
  limitedAmount: any;

  constructor(
    private utilsHelper: enumHelper,
    private formBuilder: FormBuilder,
    private activeModal: NgbActiveModal,
    private alertService: AlertService,
    private datePipe : DatePipe,
    private sessionService: SessionStorage,
    private employeeService: EmployeeService,

  ) {
    this.createForm();
  }

  get g() { return this.medicDependForm.controls; } // reactive forms validation 

  createForm() {

    this.medicDependForm = this.formBuilder.group({
      Id: [UUID.UUID()],
      DependentTypes: [null],
      DisabilityPercentage: [null],
      AgeofDependent: [null],
      relationship: [null],
      NameofDependent: ['', Validators.required],
      DOB: ['', Validators.required],
      Amount: [null, Validators.required],

    });
  }

  ngOnInit() {
    this.employeedetails = JSON.parse(this.sessionService.getSessionStorage('_EmployeeRequiredBasicDetails'));
    this.ProductInfo = JSON.parse(this.ProductInfo);

    this.editJson = JSON.parse(this.editJson);
    this.editJson != null && this.medicDependForm.patchValue(this.editJson);
    this.editJson != null && this.medicDependForm.controls['DOB'].setValue(this.datePipe.transform(this.editJson.DOB, "dd-MM-yyyy"))
    this.relationship = this.utilsHelper.transform(Relationship);
    console.log('RELATIONSHIP/EMP-DETAIL :', this.relationship, this.employeedetails);
    
    if(this.medicType == 'medicInsurance'){
      const filterArray = [1, 2, 3, 4, 5, 6];  
      this.relationship = this.utilsHelper.transform(Relationship);
      this.relationship = this.relationship.filter(({ id }) => filterArray.includes(id));
      this.medicDependForm.controls.DependentTypes.value != null  &&   this.medicDependForm.controls.DependentTypes.value == 2 && this.medicDependForm.controls['relationship'].disable();
     
    } else if (this.medicType == 'medicInsuranceSelf') {
        if (Object.values(this.ProductInfo).includes('MedicalExpenditureSelfOrDependent')) {
          this.relationship = this.utilsHelper.transform(Relationship);
          this.relationship.push({id: 0, name: 'Self'});
          this.relationship.sort((a,b) => a.id - b.id);
        } else {
          const filterArray = [1, 2, 3, 4, 5, 6];  
          this.relationship = this.utilsHelper.transform(Relationship);
          this.relationship = this.relationship.filter(({ id }) => filterArray.includes(id));
        }
    } else {
      const filterArray = [3, 4, 5, 6];  
      this.relationship = this.relationship.filter(({ id }) => filterArray.includes(id));

    }

    this.medicDependForm.get('DependentTypes').value == 2 ?  this.limitedAmount = this.ProductInfo.b[0].ThresholdLimitSenior :  this.limitedAmount = this.ProductInfo.b[0].ThresholdLimit;

  }

  closeModal() {

    this.activeModal.close('Modal Closed');

  }

  /* #region  Save */
  savebutton(): void {
   
    this.submitted = true;
    if (this.medicDependForm.invalid) {
      return;
    }

    if( Number(this.medicDependForm.get('Amount').value) > Number(this.limitedAmount)) {
      this.alertService.showWarning('Amount is required / You have entered amount is invalid');
      return;
    }
 
    this.activeModal.close(this.medicDependForm.value);

  }

  /* #endregion */

  medicalInsuType(event) {
    this.relationship = this.utilsHelper.transform(Relationship);
    this.medicDependForm.controls['NameofDependent'].setValue(null);
    this.medicDependForm.controls['DOB'].setValue(null);
    this.medicDependForm.controls['relationship'].setValue(null);
    this.limitedAmount = this.ProductInfo.b[0].ThresholdLimit;
    // custom check 
    if (event.Id == 1) {
      // self
      this.medicDependForm.controls['NameofDependent'].setValue(this.employeedetails.FirstName);
      this.medicDependForm.controls['DOB'].setValue(new Date(this.employeedetails.DateOfBirth));
      this.medicDependForm.controls['relationship'].disable();
    } else if (event.Id == 2) {
      // dependent
      this.medicDependForm.controls['relationship'].enable();
      const filterArray = [3, 4, 5, 6];  
      this.relationship = this.relationship.filter(({ id }) => filterArray.includes(id)); 
    } else {
      // parents
      this.medicDependForm.controls['relationship'].enable();
      const filterArray = [1, 2];  
      this.relationship = this.relationship.filter(({ id }) => filterArray.includes(id)); 
      this.limitedAmount = this.ProductInfo.b[0].ThresholdLimitSenior;
      console.log('FILTER RS :', this.relationship);
    }
  }

  onChangeRelationship(event){
    console.log('onChangeRelationship', event);
    if (event.id == 0) {
      this.medicDependForm.controls['NameofDependent'].setValue(this.employeedetails.FirstName);
      this.medicDependForm.controls['DOB'].setValue(new Date(this.employeedetails.DateOfBirth));
    } else {
      this.medicDependForm.controls['NameofDependent'].setValue(null);
      this.medicDependForm.controls['DOB'].setValue(null);
    }
  }

}
