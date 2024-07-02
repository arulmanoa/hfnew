import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CompleterService, CompleterData } from 'ng2-completer';
import { Observable, OperatorFunction } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { AdditionalColumns, OnboardingAdditionalInfo } from 'src/app/_services/model/OnBoarding/OnBoardingInfo';
import { EmployeeService } from 'src/app/_services/service';
import { environment } from 'src/environments/environment';
import { EmployeeDetails } from '@services/model/Employee/EmployeeDetails';

export const countries = [
  { id: 1, name: 'United States' },
  { id: 2, name: 'Canada' },
  { id: 3, name: 'United Kingdom' },
  { id: 4, name: 'Australia' },
  // Add more countries as needed
];
@Component({
  selector: 'app-onboardingadditionalinfo',
  templateUrl: './onboardingadditionalinfo.component.html',
  styleUrls: ['./onboardingadditionalinfo.component.css'],

})

export class OnboardingadditionalinfoComponent implements OnInit, OnDestroy,OnChanges {

  @Input() onboardingAdditionalInfo: OnboardingAdditionalInfo;
  @Input() additionalColumns: AdditionalColumns;
  @Input() IsCandidate: boolean;
  @Input() currentRoleCode: string;
  @Input() requiredAdditionalColumnSettingValue: any[];
  @Output() onboardingAdditionalInfoChangeHandler = new EventEmitter();
  @Input() NotAccessibleFields = [];
  @Input() employeedetails: EmployeeDetails;

  currentDate: Date = new Date();
  submitted = false;

  filteredCountries: any[] = [];
  additionalInfoForm: FormGroup;
  items: string[] = ['Apple', 'Banana', 'Cherry', 'Date', 'Fig', 'Grape', 'Lemon', 'Mango'];
  filteredItems: string[] = [];

  selectedCountry: string = '';

  departmentData: CompleterData;
  subEmploymentTypeData: CompleterData;
  categoryData: CompleterData;
  currentEntityType: string = "";
  filteredValues = [];

  constructor(private fb: FormBuilder, private completerService: CompleterService,
    private employeeService: EmployeeService,) {
    this.createForm();
  }

  get g() { return this.additionalInfoForm.controls; }

  createForm() {
    this.additionalInfoForm = this.fb.group({
      MarriageDate: [null],
      Religion: [null],
      // Department: [null],
      JobProfile: [null],
      SubEmploymentType: [null],
      // Category: [null],
      // Division: [null],
      Level: [{value: null, disabled: true}],
      SubEmploymentCategory: [null],
      CostCityCenter: [null],
      Building: [null],
      EmploymentZone: [null]
    });
  }
  ngOnChanges(changes: SimpleChanges) {    
    this.additionalInfoForm.patchValue(this.additionalColumns);
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
    this.currentEntityType = this.IsCandidate ? "Candidate" : "Employee";
    console.log('IsCandidate', this.IsCandidate);

    this.filteredValues = this.requiredAdditionalColumnSettingValue
      .filter(setting => setting.DisplayRoleCodes.includes(this.currentRoleCode));

    this.filteredValues = this.filteredValues != null && this.filteredValues.length > 0 && this.filteredValues
      .filter(setting => setting.EntityTypes.includes(this.currentEntityType));

    console.log(this.filteredValues);

    let requiredColumns = this.filteredValues != null && this.filteredValues.length > 0 && this.filteredValues
      .filter(setting => setting.MandatoryRoleCodes.includes(this.currentRoleCode));

    requiredColumns != null && requiredColumns.length > 0 && requiredColumns.forEach(e1 => {
      this.updateValidation(true, this.additionalInfoForm.get(e1.ColumnName));
    });



    if (this.IsCandidate == false) {
      this.employeeService.getActiveTab(false);
    }

    console.log('test sdfasdfads adsfasd', this.onboardingAdditionalInfo);
    console.log('additionalColumns additionalColumns', this.additionalColumns);

    for (const prop of Object.keys(this.additionalColumns)) {
      if (this.additionalColumns[prop] == 0) {
        this.additionalColumns[prop] = null;
      }
      if (prop == 'Department' && typeof this.additionalColumns[prop] === 'string') {
        this.additionalColumns[prop] = parseFloat(this.additionalColumns[prop].toString());
      }
      if (prop == 'JobProfile' && typeof this.additionalColumns[prop] === 'string') {
        this.additionalColumns[prop] = parseFloat(this.additionalColumns[prop].toString());
      }
      if (prop == 'MarriageDate' && this.additionalColumns[prop] != null) {
        this.additionalColumns[prop] = new Date(this.additionalColumns[prop]);
      }
    }
    this.additionalInfoForm.controls['Level'].disable();
    this.additionalInfoForm.patchValue(this.additionalColumns);
    this.disableFormControls();
  }

  disableFormControls() {
    for (const field of this.NotAccessibleFields) {
      if (this.additionalInfoForm.get(field)) {
        this.additionalInfoForm.get(field).disable();
      }
    }
  }

  EmitHandler() {
    this.submitted = true;
  }

  shouldDisplayColumnName(fieldName: string) {
    return this.filteredValues && this.filteredValues.length > 0 && this.filteredValues.filter(a => a.ColumnName == fieldName).length > 0 ? true : false;
  }

  ngOnDestroy() {
    this.EmitHandler()
    console.log('raw value ', this.additionalInfoForm.getRawValue());
    if (this.IsCandidate) {
      this.onboardingAdditionalInfoChangeHandler.emit(this.additionalInfoForm.getRawValue());
    } else {
      let jsonOBJ = {
        additionalInfoForm: this.additionalInfoForm.getRawValue(),
        employeedetails: this.employeedetails
      };
      this.onboardingAdditionalInfoChangeHandler.emit(jsonOBJ);
    }

  }

  // filterItems() {
  //   const userInput = this.additionalInfoForm.get('userInput').value;
  //   this.filteredItems = this.items.filter(item =>
  //     item.toLowerCase().includes(userInput.toLowerCase())
  //   );
  // }
  isFieldRequired(fieldName: string): boolean {

    return this.filteredValues && this.filteredValues.length > 0 && this.filteredValues.filter(a => a.ColumnName == fieldName).length > 0 ? this.filteredValues.find(a => a.ColumnName == fieldName).MandatoryRoleCodes.includes(this.currentRoleCode) ? true : false : false;

    // MandatoryRoleCodes
    // const control = this.additionalInfoForm.get(fieldName);
    // return control && control.hasError('required');
  }
}
