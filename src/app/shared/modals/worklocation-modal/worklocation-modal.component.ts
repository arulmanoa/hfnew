import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { UUID } from 'angular2-uuid';
import * as _ from 'lodash';

import { AlertService } from '../../../_services/service/alert.service';
import { ClientLocationService } from 'src/app/_services/service/clientlocation.service';

import { CountryList, StateList, CityList, ClientLocationModel } from 'src/app/_services/model/ClientLocationAllList';
import { AddressDetails, CommunicationCategoryType } from 'src/app/_services/model/Communication/CommunicationType';
import { apiResult } from 'src/app/_services/model/apiResult';
import { apiResponse } from 'src/app/_services/model/apiResponse';
import { LoadingScreenService } from '../../components/loading-screen/loading-screen.service';

@Component({
  selector: 'app-worklocation-modal',
  templateUrl: './worklocation-modal.component.html',
  styleUrls: ['./worklocation-modal.component.scss']
})

export class WorklocationModalComponent implements OnInit {

  @Input() id: number;
  @Input() objStorageJson: any;

  submitted = false;
  disableBtn = false;

  clientLocationForm: FormGroup;

  listOfcountry: CountryList[] = [];
  listOfstate: StateList[] = [];
  listOfcity: CityList[] = [];
  _countryName:any;
  _stateName:any;
  _cityName:any;

  locationModel: ClientLocationModel = {} as any;

  constructor(

    private activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    public locationService: ClientLocationService,
    private loadingScreenService: LoadingScreenService,
 


  ) { }

  get g() { return this.clientLocationForm.controls; }

  ngOnInit() {

    this.clientLocationForm = this.formBuilder.group({
      Id: [0],
      locationName: ['', Validators.required],
      country: [null, Validators.required],
      state: [null, Validators.required],
      city: [null, Validators.required],
      address: [''],

    })

    this.objStorageJson = JSON.parse(this.objStorageJson);
    this.get_countryList();

    this.clientLocationForm.valueChanges

      .subscribe((changedObj: any) => {
        this.disableBtn = true;
      });

  }

  get_countryList() {

    this.locationService.getcountry().subscribe((res) => {

      this.listOfcountry = _.orderBy(res, ["Name"], ["asc"]);
      let defulatCountry = this.listOfcountry.find(a => a.Id === 100);
      this.clientLocationForm.controls['country'].setValue(defulatCountry.Id);
      this.onChangeCountry(defulatCountry)

    });
    ((err) => {

    });
  }


  onChangeCountry(CountryId) {
    this.listOfstate = [];
    this.listOfcity = [];
    this.clientLocationForm.controls['city'].setValue(null);
    this.clientLocationForm.controls['state'].setValue(null);

    let countryId = CountryId.Id;
    this.locationService.getstate(countryId).subscribe((res) => {
      this.listOfstate = _.orderBy(res, ["Name"], ["asc"]);
      if(this.listOfcountry&&this.listOfcountry.length>0){
        this.listOfcountry.forEach(element => {
          if (element.Id == CountryId.Id) {
            this._countryName = element.Name
          }
        });
      }
     

    }), ((err) => {

    });

  }

  onChangeState(StateId) {
    if (this.listOfstate && this.listOfstate.length > 0) {
      this.listOfstate.forEach(element => {
        if (element.Id == StateId.Id) {
          this._stateName = StateId.Name
        }

      });
    }
    let stateId = StateId.Id;
    this.locationService.getcity(stateId).subscribe((res) => {
      this.listOfcity = _.orderBy(res, ["Name"], ["asc"]);
    }),
      ((err) => {

      });
  }
  onChangeCity(cityObj){
    if (this.listOfcity && this.listOfcity.length > 0) {
      this.listOfcity.forEach(element => {
        if (element.Id == cityObj.Id) {
          this._cityName = cityObj.Name
        }
      });
    }
  }

  savebutton(): void {

    this.submitted = true;
    if (this.clientLocationForm.invalid) {
      return;
    }

    this.loadingScreenService.startLoading();
    var _addressDetails = new AddressDetails();
    _addressDetails.Address1 = this.clientLocationForm.get('address').value;
    _addressDetails.CountryName=this._countryName;
    _addressDetails.StateName=this._stateName;
    _addressDetails.City=this._cityName;
    
    _addressDetails.CountryId = this.clientLocationForm.get('country').value;
    _addressDetails.StateId = this.clientLocationForm.get('state').value;
    _addressDetails.CityId = this.clientLocationForm.get('city').value;
    _addressDetails.PinCode = "000000";
    _addressDetails.CommunicationCategoryTypeId = CommunicationCategoryType.Official;

    this.locationModel.Id = 0;
    this.locationModel.ClientID = this.objStorageJson.ClientId;
    this.locationModel.LocationName = this.clientLocationForm.get('locationName').value;
    this.locationModel.LocationCode = this.generateLocationCode(this.locationModel.LocationName);
    this.locationModel.LocationType = 1;
    this.locationModel.GSTNumber = "NA";
    this.locationModel.IsBillingAddress = false;
    this.locationModel.IsPrimaryLocation = false;
    this.locationModel.IsShippingAddress = false;
    this.locationModel.ClientLocationAddressdetails = _addressDetails;
    this.locationModel.Status = 1;

    console.log(this.locationModel);

    this.locationService.postClientLocation(this.locationModel).subscribe((data: any) => {

      let apiResponse: apiResponse = data;

      console.log(data);

      if (apiResponse.Status) {
        this.loadingScreenService.stopLoading();
        this.activeModal.close(apiResponse.dynamicObject);

      } else {
        this.loadingScreenService.stopLoading();
        this.alertService.showWarning(data.Message);
      }

    },
      (err) => {
        this.alertService.showWarning(`Something is wrong!  ${err}`);
        console.log("Something is wrong! : ", err);

      });

  }

  confirmExit() {

    this.activeModal.close('Modal Closed');
  }


  generateLocationCode(LocationName) {
    let code = LocationName.replace(/\s/g, "")
    return code.split(' ').map(n => n[0] + n[1]).join('');
  }
}
