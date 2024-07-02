import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { UUID } from 'angular2-uuid';
import Swal from "sweetalert2";

// services 
// services 
import { AlertService } from '../../../_services/service/alert.service';
import { UIBuilderService } from '../../../_services/service/UIBuilder.service';
import { SessionStorage } from '../../../_services/service/session-storage.service';
import { OnboardingService } from '../../../_services/service/onboarding.service';

import * as _ from 'lodash';
import { apiResult } from 'src/app/_services/model/apiResult';
import { apiResponse } from 'src/app/_services/model/apiResponse';

import { FileUploadService } from 'src/app/_services/service/fileUpload.service';
import { ObjectStorageDetails } from 'src/app/_services/model/Candidates/ObjectStorageDetails'; 
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { LoginResponses } from 'src/app/_services/model';
import { RelationShip } from 'src/app/_services/model/Candidates/CandidateFamilyDetails';
import { CommunicationInfo, CountryList, StateList } from 'src/app/_services/model/OnBoarding/CommunicationInfo';
import { enumHelper } from '../../directives/_enumhelper';

@Component({
  selector: 'app-communication-modal',
  templateUrl: './communication-modal.component.html',
  styleUrls: ['./communication-modal.component.css']
})
export class CommunicationModalComponent implements OnInit { 

  @Input() id: number;
  @Input() UserId: number;
  @Input() jsonObj: any;
  @Input() objStorageJson: any;

  isLoading : any;
  communicationForm: FormGroup;
  submitted = false;
  BusinessType: any;
  isrendering_spinner: boolean = false;
  relationshipLst: any[] = [];
  CommunicationListGrp: CommunicationInfo;
  CountryList: CountryList[] = [];
  StateList: StateList[] = [];

  constructor(
    private activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private UIBuilderService: UIBuilderService,
    public sessionService: SessionStorage,
    private onboardingService: OnboardingService,
    private utilsHelper: enumHelper

  ) {
    this.createForm();
  }
  get g() { return this.communicationForm.controls; } // reactive forms validation 

  createForm() {


    this.communicationForm = this.formBuilder.group({
      Id: [UUID.UUID()],
      ContactPersonName: ['', Validators.required],
      EmergencyContactNo: ['', Validators.required],
      RelationShip: [null, Validators.required],
      Address1: ['', Validators.required],
      Address2: [''],
      Address3: [''],
      CountryId: [null, Validators.required],
      StateId: [null, Validators.required],
      City: ['', Validators.required],
      PinCode: ['', Validators.required]

    });
  }


  ngOnInit() {
    this.isrendering_spinner = true;
    this.objStorageJson = JSON.parse(this.objStorageJson);
    this.relationshipLst = this.utilsHelper.transform(RelationShip) as any;
    this.doAccordionLoading('isCommunicationdetails');

  }
 
  public doAccordionLoading(accordion_Name: any) {
    this.onboardingService.getOnboardingInfo(accordion_Name, this.UserId, (this.BusinessType == 1 || this.BusinessType == 2) ? (this.objStorageJson.ClientId == null ? 0 : this.objStorageJson.ClientId) : 0)
      .subscribe(authorized => {
        const apiResult: apiResult = authorized;
        if (apiResult.Status && apiResult.Result != "") {
          this.CommunicationListGrp = JSON.parse(apiResult.Result);
          this.CountryList = _.orderBy(this.CommunicationListGrp.CountryList, ["Name"], ["asc"]);

          if (this.communicationForm.get('Id').value != 0) {
            try {
              var countryEventId = (this.communicationForm.get('CountryId').value == null || this.communicationForm.get('CountryId').value == 0 ? null : this.communicationForm.get('CountryId').value);
              this.StateList = _.orderBy(_.filter(this.CommunicationListGrp.StateList, (a) => a.CountryId == Number(countryEventId)), ["Name"], ["asc"]);
              this.isrendering_spinner = false;

            } catch (error) { }
          } else { this.isrendering_spinner = false; }
        }
        else {
          // this.alertService.showWarning("Show Message for empty flatlist")
          this.isrendering_spinner = false;
        }
      }, (error) => {
        this.isrendering_spinner = false;
      });
  }

  savebutton(): void {
    console.log(this.communicationForm.value);
    this.submitted = true;
    if (this.communicationForm.invalid) {
      return;
    }
    this.activeModal.close(this.communicationForm.value);
  }



  confirmExit() {

    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: true
    })
    swalWithBootstrapButtons.fire({
      title: 'Are you sure?',
      text: "Are you sure you want to exit?",
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Exit!',
      allowOutsideClick: false,
      cancelButtonText: 'No, cancel!',
      reverseButtons: true
    }).then((result) => {
      if (result.value) {
        try {
          this.activeModal.close('Modal Closed');
        } catch (error) {
        }

      } else if (
        /* Read more about handling dismissals below */
        result.dismiss === Swal.DismissReason.cancel
      ) {

      }
    })


  }
}
