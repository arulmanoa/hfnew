import { Component, OnInit ,Input} from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { HeaderService } from 'src/app/_services/service/header.service';
import { AlertService } from '../../../_services/service/alert.service';
import {BankService} from '../../../_services/service/bank.service';
import {BankBranchService} from '../../../_services/service/bankbranch.service';
import {ClientContactService} from '../../../_services/service/clientcontact.service';
import { BankDetails,BankBranch} from 'src/app/_services/model/Bank';
import { apiResponse } from '../../../_services/model/apiResponse';
import { CountryList} from 'src/app/_services/model/ClientContactModelList';
import * as _ from 'lodash';

@Component({
  selector: 'app-bank-branch',
  templateUrl: './bank-branch.component.html',
  styleUrls: ['./bank-branch.component.css']
})
export class BankBranchComponent implements OnInit {
  @Input() id: number;
  @Input() jsonObj: any;

  BankBranchForm: FormGroup;
  submitted = false;
  BankBranch: BankBranch = {} as any;
  BankDetails: BankDetails = {} as any;
  listOfcountry:CountryList[] = [];

  constructor(private activeModal: NgbActiveModal,public modalService: NgbModal,public BankBranchService:BankBranchService,
    public BankService:BankService,public ClientContactService:ClientContactService,private router: Router,private headerService: HeaderService, 
    private formBuilder: FormBuilder,private alertService: AlertService,private route: ActivatedRoute) { }

  get f() { return this.BankBranchForm.controls; }

  ngOnInit() {
    this.headerService.setTitle('Bank');
    this.BankBranchForm = this.formBuilder.group({
      Id: [0],
      fscode:['', [Validators.required, Validators.minLength(3)]],
      name: [null, Validators.required],
      scode: ['', [Validators.required, Validators.minLength(3)]],
      email:[null, Validators.required],
      country:[null, Validators.required],
      location:[null, Validators.required],
      address:[null, Validators.required],
      status: [true],
    })
    this.loadCountryLst();

    if(this.id != null || this.id != undefined){

      this.BankBranchForm.patchValue({
      "Id": this.jsonObj[0].Id,
      "fscode":this.jsonObj[0].FinancialSystemCode,
      "name": this.jsonObj[0].Name,
      "scode":this.jsonObj[0].SwiftCode,
      "email":this.jsonObj[0].Email,
      "country":this.jsonObj[0].CountryId,
      "location":this.jsonObj[0].Location,
      "address":this.jsonObj[0].AddressDetails,
      "status":this.jsonObj[0].Status == "Active" ? 1 : 0
        
      });
    }
  }
 
  loadCountryLst() {
     
    this.ClientContactService.getcountry().subscribe((res) => {

      this.listOfcountry = res;  
      this.listOfcountry = _.orderBy(this.listOfcountry, ["Name"], ["asc"]);   
      if(this.BankBranchForm.controls.Id.value == 0){
      this.BankBranchForm.controls['country'].setValue(this.listOfcountry.find(a=>a.Id == 100).Id);    
      }
      console.log('code', this.listOfcountry);
     
    });
    ((err) => {

    });
  }

  closeModal() {

    this.activeModal.close('Modal Closed');

  }
  saveBankBranchbutton(): void {
    this.submitted = true;
    if (this.BankBranchForm.invalid) {
      this.alertService.showInfo("Please fill the Mandatory fields ")
      return;
    }
    this.BankBranch.Id = this.BankBranchForm.get('Id').value;
    this.BankBranch.Name = this.BankBranchForm.get('name').value;
    this.BankBranch.FinancialSystemCode = this.BankBranchForm.get('fscode').value;
    this.BankBranch.SwiftCode = this.BankBranchForm.get('scode').value;
    this.BankBranch.Status = this.BankBranchForm.get('status').value;
    this.BankBranch.CountryId = this.BankBranchForm.get('country').value;
    this.BankBranch.Location = this.BankBranchForm.get('location').value;
    this.BankBranch.AddressDetails = this.BankBranchForm.get('address').value;
    this.BankBranch.Email = this.BankBranchForm.get('email').value;
    this.BankBranch.Status= Boolean(this.BankBranch.Status) == false ? 0 : 1;
 
    this.activeModal.close(this.BankBranch);


  }
}
