import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder, FormControl, Validators, AbstractControl } from '@angular/forms';
import { UUID } from 'angular2-uuid';
import { AlertService } from 'src/app/_services/service/alert.service';
import * as moment from 'moment';

@Component({
  selector: 'app-hramodal',
  templateUrl: './hramodal.component.html',
  styleUrls: ['./hramodal.component.css']
})
export class HramodalComponent implements OnInit {
  @Input() EntryType: any
  @Input() Mode: boolean = false;
  @Input() editJson: any;
  @Input() CityList : any;

  hraForm: FormGroup;
  submitted = false;
  disableBtn = false;

  FileName: any;
  EnddateminDate: Date;

  constructor(
    private activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private alertService: AlertService,
  ) {
    this.createForm();
  }

  get g() { return this.hraForm.controls; } // reactive forms validation 

  createForm() {

    this.hraForm = this.formBuilder.group({
      Id: [UUID.UUID()],
      RentalHouseAddress: [null],
      EntryType: [3],
      NameofLandlord: [null, Validators.required],
      NameofCity: ['', Validators.required],
      PANofLandlord: [''],
      StartDate: ['', Validators.required],
      EndDate: ['', Validators.required],
      LandlordAddress: [''],
      RentAmountPaid: [null, Validators.required],
      ObjectStorageId: [null], // extra prop
      isChecked : [true]

    });
  }

  ngOnInit() { 
  
    this.EnddateminDate = new Date();
    // this.editJson = JSON.parse(this.editJson);
    console.log(this.editJson);
    this.CityList = JSON.parse(this.CityList);
    this.editJson != null && this.hraForm.patchValue(this.editJson);
    var date = new Date();
    this.editJson === null && this.hraForm.controls['StartDate'].setValue(this.EntryType === 3 ? new Date(date.getFullYear(), date.getMonth(), 1) : this.EntryType === 2 ? new Date(date.getFullYear(), 0, 1) : this.EntryType === 1 ? date : date);
    this.editJson === null && this.hraForm.controls['EndDate'].setValue(this.EntryType === 3 ? new Date(date.getFullYear(), date.getMonth() + 1, 0) : this.EntryType === 2 ? date : this.EntryType === 1 ? date : date);
   
  

  }
  onChangeStartDate(event) {

    // this.workExpForm.controls['enddate'].setValue(null);
    if (this.hraForm.get('StartDate').value != null || this.hraForm.get('StartDate').value != undefined) {
      var StartDate = new Date(event);

      this.EnddateminDate = new Date();
      this.EnddateminDate.setMonth(StartDate.getMonth());
      this.EnddateminDate.setDate(StartDate.getDate() + 1);
      this.EnddateminDate.setFullYear(StartDate.getFullYear());

    }
  }


  /* #region  Close modal */

  closeModal() {

    this.activeModal.close('Modal Closed');

  }
  /* #endregion */

  /* #region  Save */
  savebutton(): void {

    this.submitted = true;
    if (this.hraForm.invalid && (this.Mode == false && this.FileName == null)) {
      return;
    }

    this.activeModal.close(this.hraForm.value);

  }

  /* #endregion */

}
