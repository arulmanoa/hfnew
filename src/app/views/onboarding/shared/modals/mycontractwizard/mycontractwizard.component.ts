import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { IntegrationTransactionalDetails } from 'src/app/_services/model/OnBoarding/IntegrationTransactionalDetails';
import { apiResult } from 'src/app/_services/model/apiResult';
import { AlertService, OnboardingService, ClientService, ClientContactService } from 'src/app/_services/service';
import { UtilityService } from 'src/app/_services/service/utitlity.service';
import { FormGroup, FormBuilder, FormControl, Validators, AbstractControl } from '@angular/forms';
import { apiResponse } from 'src/app/_services/model/apiResponse';
import { ClientList } from 'src/app/_services/model/ClientLocationAllList';
import { ClientContactList, ClientContractList } from 'src/app/_services/model/OnBoarding/OnBoardingInfo';
import { ClientContractService } from 'src/app/_services/service/clientContract.service';

@Component({
  selector: 'app-mycontractwizard',
  templateUrl: './mycontractwizard.component.html',
  styleUrls: ['./mycontractwizard.component.css']
})
export class MycontractwizardComponent implements OnInit {

  @Input() CompanyId: number = 0;
  @Input() RoleId: number = 0;
  @Input() UserId: number = 0;

  spinner: boolean = false;

  wizardForm: FormGroup;
  submitted: boolean = false;

  LstClient: ClientList[] = [];
  LstClientContract: ClientContractList[] = [];
  LstClientContact: ClientContactList[] = [];

  hasFailedInput: boolean = false;
  failedInputErrorMessage: string = "";
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private activeModal: NgbActiveModal,
    private clientContactService: ClientContactService,
    private onboardingService: OnboardingService,
    private alertService: AlertService,
    private utilityService: UtilityService,
    private clientContractService: ClientContractService
  ) {
    this.createReactiveForm();
  }
  get g() { return this.wizardForm.controls; } // reactive forms validation 

  createReactiveForm() {

    this.wizardForm = this.formBuilder.group({
      ClientId: [null, Validators.required],
      ClientContractId: [null, [Validators.required]],
      ClientContactId: [null, Validators.required],
      ClientName: [''],
      ClientContractName: [''],
      ClientContactName: ['']
    });
  }

  ngOnInit() {
    try {
      this.spinner = true;
      this.loadClientList();
    } catch (err) {
      this.spinner = false;
      console.log('#00011 LOOKUP EX::', err);
    }
  }

  modal_dismiss(_actionName): void {
    this.activeModal.close(_actionName);
  }


  async loadClientList() {
    try {

      await this.clientContactService.getUserMappedClientList(this.RoleId, this.UserId).subscribe((response: apiResponse) => {

        if (response.Status) {
          this.LstClient = response.dynamicObject;
          this.LstClient = this.LstClient.length > 0 ? this.LstClient.filter(a => a.Id != 0) : [];
          this.spinner = false;
        } else {
          this.spinner = false;
        }
        console.log('CLT LST ::', this.LstClient);
      },
        (err) => {

        });
    } catch (error) {

    }
  }

  onChangeClient(item) {
    console.log('Client Ev :', item)
    try {
      this.wizardForm.patchValue({
        ClientId: item.Id,
        ClientContractId: null,
        ClientContactId: null,
        ClientName: item.Name,
        ClientContractName: '',
        ClientContactName: '',
      });


      this.loadClientContractByClientId(item.Id);
      this.loadClientContactByClientId(item.Id);
    } catch (error) {
      console.log('#0011 COUNTRY EX ::', error);
    }
  }

  async loadClientContractByClientId(clientId) {
    try {
      await this.clientContractService.getClientContract(clientId).subscribe((response: apiResponse) => {

        if (response.Status) {
          this.LstClientContract = response.dynamicObject;
        }
        console.log('CCRT LST ::', this.LstClientContract);
      },
        (err) => {

        });
    } catch (error) {

    }
  }


  async loadClientContactByClientId(clientId) {
    try {
      await this.clientContactService.getClientContactbyClientId(clientId).subscribe((response: apiResponse) => {

        if (response.Status) {
          this.LstClientContact = response.dynamicObject;
        }
        console.log('CCT LST ::', this.LstClientContact);
      },
        (err) => {

        });
    } catch (error) {

    }

  }

  doConfirmClient() {

    try {


      this.submitted = true;
      this.hasFailedInput = false;
      this.failedInputErrorMessage = "";

      console.log(this.wizardForm.value);

      if (this.wizardForm.invalid) {
        this.hasFailedInput = true;
        this.failedInputErrorMessage = "You must have filled out all the required fields and try to confirm";
        this.alertService.showWarning('You must have filled out all the required fields and try to confirm');
        return;
      }

      this.wizardForm.controls['ClientContractName'].setValue(this.LstClientContract.find(a => a.Id == this.wizardForm.value.ClientContractId).Name)
      this.wizardForm.controls['ClientContactName'].setValue(this.LstClientContact.find(a => a.Id == this.wizardForm.value.ClientContactId
      ).Name)

      this.activeModal.close(this.wizardForm.value);
    } catch (error) {
        console.log('EXEC ON CONFIRM ::', error);
        
    } 
  }
}
