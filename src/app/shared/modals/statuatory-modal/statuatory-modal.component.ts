import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { StatesService } from '../../../_services/service/states.service';
import { CityService } from '../../../_services/service/city.service';
import { AlertService } from '../../../_services/service/alert.service';

// static dropdowns

import { config } from '../../../_services/configs/app.config';
import { apiResponse } from 'src/app/_services/model/apiResponse';

import { Statutory, _Statutory } from '../../../_services/model/statutory';
import { element } from '@angular/core/src/render3';

@Component({
  selector: 'app-statuatory-modal',
  templateUrl: './statuatory-modal.component.html',
  styleUrls: ['./statuatory-modal.component.css']
})
export class StatuatoryModalComponent implements OnInit {

  header =  "Add New Statutory";

  //Input() id: number;
  @Input() stateName: number;
  @Input() countryName: number;
  @Input() editObjects: any;

  selectedMonth: any = [];


  statutoryForm: FormGroup;

  // ** forms on submit validation ** //
  submitted = false;
  disableBtn = false;

  statutoryModal: Statutory;

  StatutoryType: any = [];
  Scales: any = [];
  Months: any = [];




  constructor(

    private activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    public stateService: StatesService,
    public cityService: CityService,
    private alertService: AlertService

  ) {

    this.createForm();
    this.StatutoryType = config.StatutoryType;
    this.Scales = config.Scales;
    

  }

  get f() { return this.statutoryForm.controls; } // reactive forms validation 

  createForm() {


    this.statutoryForm = this.formBuilder.group({
      EffectiveDate: ['', Validators.required],
      StatutoryType: ['', Validators.required],
      IsApplicable: [true],
      ScaleId: ['', Validators.required],
      ApplicableMonths: [''],

    });


    this.statutoryModal = _Statutory;

  }

  //  submitForm() {
  //    this.activeModal.close(this.myForm.value + '\n' + this.id);
  //  }


  ngOnInit() {

    this.Months = config.Months;
    console.log('md onth', this.Months);

    if (this.editObjects) {
     this.header =  "Edit Statutory";

      console.log('sdsfsd', this.editObjects);
      this.statutoryForm.patchValue(this.editObjects);

      if(this.editObjects.ApplicableMonths != null){
      this.selectedMonth = []
      this.selectedMonth = this.editObjects.ApplicableMonths;
      
      
      this.editObjects.ApplicableMonths.forEach(element => {

        var staticValue = this.Months.find(a => a.id == element);
        if (staticValue != null) {
          staticValue.checked = true;
        }
       

      });
    }
    }
    

    this.statutoryForm.valueChanges
      .subscribe((changedObj: any) => {
        this.disableBtn = true;
      });

    console.log('month', this.Months);

    this.onload_service_init();

  }

  onload_service_init() {

    this.stateService.getAllScale().subscribe((res) => {


      let apiResponse: apiResponse = res;
      this.Scales = apiResponse.dynamicObject;

    }), ((err) => {

    })


    this.cityService.getAllScale().subscribe((res) => {


      let apiResponse: apiResponse = res;
      this.Scales = apiResponse.dynamicObject;

    }), ((err) => {

    })


  }

  // monthChange(event){
  //   let index=this.selectedMonth.indexOf(event.target.value);
  //   if(index == -1){
  //     this.selectedMonth.push(event.target.value);   
  //   }
  //   else{
  //     this.selectedMonth.splice(index,1);
  //   }
  //   console.log(this.selectedMonth);
  // }

  monthChange(event,Month) {

    //alert(event.target.value)
    if (event.target.checked) {

      this.selectedMonth.push(Number(event.target.value));

    } else {

      // for (let i = 0; i < this.selectedMonth.length; i++) {
      //   const element = this.selectedMonth[i];
      //   if(element.id == item.id){
          
      //   }
        
      // }
      const index = this.selectedMonth.indexOf( Number(event.target.value));
if (index > -1) {
  this.selectedMonth.splice(index, 1);
}

      // var index = this.selectedMonth.map(function (el) {
      //   alert(el);
      //   return el.id
      // }).indexOf(event.target.value)
      // this.selectedMonth.splice(index, 1)


    }
    console.log(this.selectedMonth);
  }


  closeModal() {
    this.activeModal.close('Modal Closed');
    this.Months.forEach(element => {
      element.checked = false;
    });
    
  }


  savebutton(): void {

    for (const i in this.statutoryForm.controls) {
      if (this.statutoryForm.controls[i].invalid) {
        console.log(i);

      }

    }
    this.submitted = true;
    if(this.selectedMonth.length == 0 ){
      this.alertService.showWarning("Please select at least one applicable months")
      return;
      
    }
    if (this.statutoryForm.invalid) {
     
      //alert('yes')
      return;
    }

    
 
    // this.selectedMonth = [];
    this.Months.forEach(element => {
      element.checked = false;
    });
    // this.selectedMonth.push(this.Months.filter(a=>a.checked).id);

    this.statutoryForm.controls['ApplicableMonths'].setValue(this.selectedMonth);
    this.activeModal.close(this.statutoryForm.value);

  }


}