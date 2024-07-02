import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';

// Modal and interface

import { Country, _Country } from '../../_services/model/country';

// services 


import { AlertService } from '../../_services/service/alert.service';

import { CountryService } from '../../_services/service/country.service';
// import { CountryService } from '../../../services/country/country.service';

import * as _ from 'lodash';

@Component({
  selector: 'app-country-modal',
  templateUrl: './country-modal.component.html',
  styleUrls: ['./country-modal.component.css']
})
export class CountryModalComponent implements OnInit {

  @Input() id: number;
  @Input() editObjects: Country;
  @Input() countryList: Country[] = [];


  countryForm: FormGroup;

  // ** forms on submit validation ** //
  submitted = false;
  disableBtn = false;

  countryModal: Country;

  isExists: boolean = false; // for country - is already exists 

  constructor(

    private activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private countryService: CountryService,

  ) {
    this.createForm();
  }

  get f() { return this.countryForm.controls; } // reactive forms validation 

  createForm() {


    this.countryForm = this.formBuilder.group({
      CountryAbbr: ['', [Validators.required, Validators.minLength(2)]],
      Name: ['', Validators.required],
      description: [''],
    });

    this.countryModal = _Country;
  }

  //  submitForm() {
  //    this.activeModal.close(this.myForm.value + '\n' + this.id);
  //  }


  ngOnInit() {

    if (this.editObjects) {


      this.countryModal.Id = this.editObjects.Id;
      this.countryModal.Status = this.editObjects.Status;
      this.countryForm.patchValue(this.editObjects);
      this.countryForm.controls['CountryAbbr'].disable();

    }

    this.countryForm.valueChanges

      .subscribe((changedObj: any) => {
        this.disableBtn = true;
      });


    // this.countryForm.controls['CountryAbbr'].clearValidators();
    // this.countryForm.controls['CountryAbbr'].setErrors(null);
    // this.countryForm.controls['CountryAbbr'].setValidators(null);



    // Object.keys(this.countryForm.controls).forEach(key => {
    //   console.log('key', key);

    //   this.countryForm.get(key)();
    // });


  }

  closeModal() {

    this.activeModal.close('Modal Closed');

  }


  savebutton(): void {

    this.submitted = true;
    if (this.countryForm.invalid) {
      return;
    }

    this.IsCountryExists();

    if (this.isExists) {

      this.alertService.showWarning("The Country code/name is already exists");
      return;

    }
    this.spinnerStarOver();


    this.countryModal.Name = this.countryForm.get('Name').value;
    this.countryModal.CountryAbbr = this.countryForm.get('CountryAbbr').value;
    this.countryModal.Status = 1;
    var country_request_param = JSON.stringify(this.countryModal);
    console.log(country_request_param);

    if (this.countryModal.Id > 0) { // edit 

      this.countryService.putCountry(country_request_param).subscribe((data: any) => {

        this.spinnerEnd();
        console.log(data);
        if (data.Status == true) {

          this.activeModal.close('Modal Closed');
          this.alertService.showSuccess(data.Message);

        } else {

          this.alertService.showInfo(data.Message);
        }



      },
        (err) => {
          this.spinnerEnd();
          this.alertService.showWarning(`Something is wrong!  ${err}`);
          console.log("Something is wrong! : ", err);

        });

    } else {   // create
      this.countryService.postCountry(country_request_param).subscribe((data: any) => {

        this.spinnerEnd();
        console.log(data);

        if (data.Status) {

          this.activeModal.close('Modal Closed');
          this.alertService.showSuccess(data.Message);

        } else {

          this.alertService.showInfo(data.Message);
        }

      },
        (err) => {
          this.spinnerEnd();
          this.alertService.showWarning(`Something is wrong!  ${err}`);
          console.log("Something is wrong! : ", err);

        });
    }



  }

  IsCountryExists() {

    this.countryList = _.filter(this.countryList, (item) => item.Id != this.countryModal.Id)
    this.isExists = _.find((this.countryList), (country) => country.CountryAbbr == this.countryForm.get('CountryAbbr').value || country.Name == this.countryForm.get('Name').value) != null ? true : false;

    return this.isExists;

  }

  spinnerStarOver() {

    (<HTMLInputElement>document.getElementById('overlay')).style.display = "flex";

  }

  spinnerEnd() {

    (<HTMLInputElement>document.getElementById('overlay')).style.display = "none";

  }
}

