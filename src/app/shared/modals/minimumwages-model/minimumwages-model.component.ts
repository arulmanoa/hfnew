import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';


import { WagesService } from '../../../_services/service/wages.service';
import { AlertService } from '../../../_services/service/alert.service';
import { CountryService } from '../../../_services/service/country.service';
import { StatesService } from '../../../_services/service/states.service';


// static dropdowns
import { config } from '../../../_services/configs/app.config';
import { apiResponse } from 'src/app/_services/model/apiResponse';
import { Minimumwages, _Minimumwages } from 'src/app/_services/model/minimumwages';
import * as _ from 'lodash';
import { DatePipe } from '@angular/common';
import { UIMode } from '../../../_services/model/UIMode';

@Component({
  selector: 'app-minimumwages-model',
  templateUrl: './minimumwages-model.component.html',
  styleUrls: ['./minimumwages-model.component.css']
})
export class MinimumwagesModelComponent implements OnInit {

  header = "Add Minimum wages"

  @Input() Id: number;

   // state 
   LstState: any = [];
   stateName: any;
   selectedState: any;

   //editWagesObjects:any;

   EditWages: any = [];

   wagesForm: FormGroup;
   // ** forms on submit validation ** //
   submitted = false;
   disableBtn = false;

   
   skillCategory: any = [];
   selectedskillCategory: any;
   zones: any = [];
   selectedZones: any;
   industrys: any = [];
   selectedIndustrys:any;
   products: any = [];
   selectedProduct:any;


   wagesList: Minimumwages[] = [];
   isExists: boolean = false;

   wagesModel:Minimumwages;
  
   

  constructor(

    private activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    public wagesService : WagesService,
    private countryService: CountryService,
    private stateService: StatesService,
    private router: Router,
    private route: ActivatedRoute,
    private datePipe: DatePipe


  ) { 

    this.createForm();   
    
  }


  createForm() {


    this.wagesForm = this.formBuilder.group({
      State: [null, Validators.required],
      SkillCategory: [null, Validators.required],
      Zone: [null, Validators.required],
      Industry: [null, Validators.required],
      Product: [null, Validators.required],
      EffectiveDate: ['', Validators.required],
      ProductValue: ['', Validators.required],
      ProductCode:['', Validators.required],
      Status: [true],
      Id:0,
      
    });

    this.wagesModel = _Minimumwages;
    

  }

  get f() { return this.wagesForm.controls; } // reactive forms validation 

  getWages(): void {
    this.wagesService.getWages().subscribe(response => {   
      console.log(response);    
        this.wagesList = response.Result;
    }, (error) => {
      });
  }
  getStateListByCountryId(): void {
    this.stateService.getStates(100).subscribe(response => {

      console.log(response);
      this.LstState = response;
    }, (error) => {
    });

  }

  editwages():void{
    this.wagesService.editwages(this.Id).subscribe(response => {
      console.log(response);
      this.EditWages = response;

      if(this.EditWages != null){
        console.log('editwages',this.EditWages);
        this.wagesModel.Id = this.EditWages.Id;
          this.wagesForm.controls["State"].setValue(this.EditWages.StateId);
          this.wagesForm.controls["Zone"].setValue(this.EditWages.ZoneId);
          this.wagesForm.controls["SkillCategory"].setValue(this.EditWages.SkillCategoryId);
          this.wagesForm.controls["Industry"].setValue(this.EditWages.IndustryId);
          this.wagesForm.controls["Product"].setValue(this.EditWages.ProductId);
          this.wagesForm.controls["EffectiveDate"].setValue(this.datePipe.transform(this.EditWages.EffectiveDate, "yyyy-MM-dd"));
          this.wagesForm.controls["ProductValue"].setValue(this.EditWages.ProductValue);
          this.wagesForm.controls["ProductCode"].setValue(this.EditWages.ProductCode);
          this.wagesForm.controls["Status"].setValue(this.EditWages.Status);

          
      }

    }, (error) =>{

    });
  }

  getSkillcategory():void{
    this.wagesService.getSkillcategory().subscribe(response => {

      console.log(response);
      this.skillCategory = response;
    }, (error) => {
    });

  }

  getZones():void{
    this.wagesService.getZones().subscribe(response => {

      console.log(response);
      this.zones = response;
    }, (error) => {
    });

  }

  getIdustrys():void{
    this.wagesService.getIndustrys().subscribe(response => {

      console.log(response);
      this.industrys = response;
    }, (error) => {
    });

  }

  getProducts():void{
    this.wagesService.getProducts().subscribe(response => {

      console.log(response);
      this.products = response.dynamicObject;
    }, (error) => {
    });

  }

  
  ngAfterViewInit(): void {
    //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
    //Add 'implements AfterViewInit' to the class.

    this.wagesForm.valueChanges
      .subscribe((changedObj: any) => {
        this.disableBtn = true;
      });

  }


  ngOnInit() {


      this.getStateListByCountryId();
      this.getSkillcategory();
      this.getZones();
      this.getIdustrys();
      this.getProducts();
      this.getWages();
      
      if(this.Id != 0){

        this.header = "Edit Minimum wages";
        this.editwages();
     
      }
      
  
  }

  closeModal() {
    this.activeModal.close('Modal Closed');
  }

  IsStateExists() {

    this.isExists = _.find(this.wagesList, (Minimumwages) => Minimumwages.Id != this.wagesModel.Id && Minimumwages.StateId == this.wagesForm.get('State').value && Minimumwages.ZoneId == this.wagesForm.get('Zone').value && Minimumwages.IndustryId == this.wagesForm.get('Industry').value &&  Minimumwages.SkillCategoryId == this.wagesForm.get('SkillCategory').value &&   Minimumwages.ProductId == this.wagesForm.get('Product').value && Minimumwages.ProductCode == this.wagesForm.get('ProductCode').value && Minimumwages.ProductValue == this.wagesForm.get('ProductValue').value &&  Minimumwages.EffectiveDate == this.wagesForm.get('EffectiveDate').value && Minimumwages.Status == this.wagesForm.get('Status').value) != null ? true : false;
    return this.isExists;
  }

  savebutton(): void {

    this.submitted = true;
    if (this.wagesForm.invalid) {
      return;
    }

    

    console.log(this.wagesModel);

    this.wagesModel.StateId = this.wagesForm.get('State').value;
    this.wagesModel.SkillCategoryId = this.wagesForm.get('SkillCategory').value;
    this.wagesModel.ZoneId = this.wagesForm.get('Zone').value;
    this.wagesModel.IndustryId = this.wagesForm.get('Industry').value;
    this.wagesModel.ProductId = this.wagesForm.get('Product').value;
    this.wagesModel.ProductValue = this.wagesForm.get('ProductValue').value;
    this.wagesModel.ProductCode = this.wagesForm.get('ProductCode').value;
    this.wagesModel.EffectiveDate = this.wagesForm.get('EffectiveDate').value;
    this.wagesModel.Status = this.wagesForm.get('Status').value == true ? UIMode.Edit : UIMode.None;
    this.wagesModel.Modetype = this.wagesModel.Id > UIMode.None ? UIMode.Edit : UIMode.None;

   
    var wages_request_param = JSON.stringify(this.wagesModel);
    console.log(wages_request_param);


    this.IsStateExists();

    if (this.isExists) {

      this.alertService.showWarning("The Wages Details is already exists");

      return;

    }

    if (this.wagesModel.Id > 0) {

      this.wagesService.putWages(wages_request_param).subscribe((data: any) => {

        console.log(data);

        
        if (data.Status) {

          this.alertService.showSuccess(data.Message);         
          this.router.navigate(['/app/masters/minimumwagesList']);
         

        }
        else {

          this.alertService.showWarning(data.Message);

        }

      },
        (err) => {
          this.alertService.showWarning(`Something is wrong!  ${err}`);
          console.log("Something is wrong! : ", err);

        });


    } else {

      this.wagesService.postWages(wages_request_param).subscribe((data: any) => {

        console.log(data);
        if (data.Status) {

          this.alertService.showSuccess(data.Message);
          this.router.navigate(['/app/masters/minimumwagesList']);
          
        }
        else {

          this.alertService.showWarning(data.Message);

        }

      },
        (err) => {
          this.alertService.showWarning(`Something is wrong!  ${err}`);
          console.log("Something is wrong! : ", err);

        });

    }

    //console.log(this.wagesForm);
    this.activeModal.close(this.wagesForm.value);

  }

}
