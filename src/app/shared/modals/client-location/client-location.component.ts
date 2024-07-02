import { Component, OnInit, Input } from '@angular/core';
import { apiResponse } from 'src/app/_services/model/apiResponse';
import { ClientLocationService } from '../../../_services/service/clientlocation.service';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { ClientLocationModel } from 'src/app/_services/model/ClientLocationAllList';
import * as _ from 'lodash';
import { apiResult } from '../../../_services/model/apiResult';
import { CommunicationInfo } from '../../../_services/model/OnBoarding/CommunicationInfo';
import { ContactDetails, CommunicationDetails, AddressDetails, CommunicationCategoryType } from '../../../_services/model/Communication/CommunicationType';
import { ClientLocationAllList, ClientList, CountryList, StateList, CityList, DistrictList } from 'src/app/_services/model/ClientLocationAllList';
import { CandidateDetails } from 'src/app/_services/model/Candidates/CandidateDetails';
import { debug } from 'util';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertService } from '../../../_services/service/alert.service';
import { UIMode } from 'src/app/_services/model/UIMode';

import { SessionStorage } from '../../../_services/service/session-storage.service'; // session storage
import { SessionKeys } from '../../../_services/configs/app.config'; // app config 
import { LoginResponses, } from '../../../_services/model/Common/LoginResponses';
import { LoadingScreenService } from '../../components/loading-screen/loading-screen.service';
export const LocationType: any = [{ ValueMember: 1, DisplayMember: 'WorkPremise' },
{ ValueMember: 2, DisplayMember: 'ClientLocation' }, { ValueMember: 3, DisplayMember: 'Both' }];

@Component({
  selector: 'app-client-location',
  templateUrl: './client-location.component.html',
  styleUrls: ['./client-location.component.css']
})
export class ClientLocationComponent implements OnInit {

  //sessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses)); // get session storage


  @Input() id: number;
  @Input() jsonObj: any;
  _loginSessionDetails: LoginResponses;
  BusinessType: any
  clientlable: boolean = false;
  listOflocationType = LocationType;
  listOfclient: ClientList[] = [];
  listofclientlocation: ClientLocationAllList;
  listOfcountry: CountryList[] = [];
  listOfstate: StateList[] = [];
  addressDets = [];
  CommunicationListGrp: CommunicationInfo;
  listOfcity: CityList[] = [];
  listOfdistrict: DistrictList[] = [];
  clientLocationForm: FormGroup;
  ClientLocationModel: ClientLocationModel = {} as any;
  submitted = false;
  _addressDetails: AddressDetails[] = [];
  dataset: any[] = [];
  isExists: boolean = false;
  jsonObjNameObj: any = {};
  _countryName: any;
  _stateName: any;
  _cityName: any;
  RoleId: any;
  UserId: any;

  _NewCandidateDetails: CandidateDetails = new CandidateDetails();
  constructor(private ClientLocationService: ClientLocationService,
    private activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private sessionService: SessionStorage,
    private loadingScreenService: LoadingScreenService
  ) { }


  get f() { return this.clientLocationForm.controls; }



  ngOnInit() {

    this._loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses)); // Get the whole matched session element set as a clean json(array) via an session object
    this.BusinessType = this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping != null ? this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this._loginSessionDetails.Company.Id).BusinessType : 0;
    this.UserId = this._loginSessionDetails.UserSession.UserId;
    this.RoleId = this._loginSessionDetails.UIRoles[0].Role.Id;

    this.clientLocationForm = this.formBuilder.group({
      Id: [0],
      client: [null, Validators.required],
      //client1:[null,Validators.required],
      name: ['', Validators.required],
      code: ['', [Validators.required, Validators.minLength(2)]],
      locationType: ['', Validators.required],
      address: ['', Validators.required],
      country: [null, Validators.required],
      state: [null, Validators.required],
      city: [null, Validators.required],
      pin: ['', Validators.required],
      gst: [''],
      isPrimaryLocation: [false],
      isBillingAddress: [true],
      isShippingAddress: [true],
      StateName: [''],
      CountryName: [''],
      CityName: [''],
    })


    console.log('kjjj', this.jsonObj);


    if (this.id != 0) {
      this.loadClientLst();
    }
    this.loadCountryLst();


    console.log(this.id);


    if (this.id) {

      try {


        // this.clientlable = true;
        // this.ClientLocationModel.Id = this.jsonObj.Id;
        // this.ClientLocationModel.Status = this.jsonObj.Status;
        // this.clientLocationForm.patchValue(this.jsonObj);

        // this.clientLocationForm.controls['code'].setValue(this.jsonObj.LocationCode);
        // console.log(this.clientLocationForm);

        this.clientLocationForm.patchValue({
          "Id": this.jsonObj[0].Id,
          "client": this.jsonObj[0].ClientID,
          "code": this.jsonObj[0].LocationCode,
          "name": this.jsonObj[0].LocationName,
          "locationType": this.jsonObj[0].LocationType,
          "address": this.jsonObj[0].ClientLocationAddressdetails.Address1,
          "country": this.jsonObj[0].ClientLocationAddressdetails.CountryId,
          "state": this.jsonObj[0].ClientLocationAddressdetails.StateId,
          'StateName': this.jsonObj[0].ClientLocationAddressdetails.StateName,
          "CountryName": this.jsonObj[0].ClientLocationAddressdetails.CountryName,
          "CityName": this.jsonObj[0].ClientLocationAddressdetails.City,
          "city": this.jsonObj[0].ClientLocationAddressdetails.CityId,
          "pin": this.jsonObj[0].ClientLocationAddressdetails.PinCode,
          "gst": this.jsonObj[0].GSTNumber,
          "isPrimaryLocation": this.jsonObj[0].IsPrimaryLocation,
          "isBillingAddress": this.jsonObj[0].IsBillingAddress,
          "isShippingAddress": this.jsonObj[0].IsShippingAddress,

        });


        this.clientLocationForm.controls['client'].disable();
        let countryParam = {};
        countryParam = {
          Id: this.jsonObj[0].ClientLocationAddressdetails.CountryId
        }
        this.onChangeCountry(countryParam);
        let stateParam = {};
        stateParam = {
          Id: this.jsonObj[0].ClientLocationAddressdetails.StateId
        }
        this.onChangeState(stateParam);

      } catch (error) {
        console.log('error ::', error);
      }

    }
    let cityParam = {}
    cityParam = {
      Id: this.jsonObj[0].ClientLocationAddressdetails.CityId
    }
    this.onChangeCity(cityParam);
    //console.log(this.clientLocationForm);


  }



  closeModal() {

    this.activeModal.close('Modal Closed');

  }

  loadClientLst() {


    this.ClientLocationService.getUserMappedClientList(this.RoleId, this.UserId).subscribe((res) => {
      let apiResonse: apiResponse = res;

      this.listOfclient = apiResonse.dynamicObject;


    });


    ((err) => {
      console.log("err2", err)

    });


  }


  // loadCountryLst() {

  //   this.ClientLocationService.getcountry().subscribe((res) => {

  //     this.listOfcountry = res;
  //     this.listOfcountry = _.orderBy(this.listOfcountry, ["Name"], ["asc"]);
  //     //  if(this.clientLocationForm.controls.Id.value == 0){      
  //     //  this.clientLocationForm.controls['country'].setValue(this.listOfcountry.find(a=>a.Id == 100).Name);
  //     // }
  //     //console.log('dddddd', this.listOfcountry);

  //   });
  //   ((err) => {

  //   });
  // }
  loadCountryLst() {
    this.ClientLocationService.getcountry()
      .subscribe((result) => {
        this.listOfcountry = result;
        this.listOfcountry = _.orderBy(this.listOfcountry, ["Name"], ["asc"]);

      })

  }

  onChangeCountry(CountryObj) {
    this._countryName = this.jsonObj && this.jsonObj.length > 0 && this.jsonObj[0].ClientLocationAddressdetails.CountryName;

    let countryId = CountryObj.Id || 100;
    if (this.listOfcountry && this.listOfcountry.length > 0) {
      this.listOfcountry.forEach(element => {
        if (element.Id == countryId) {
          this._countryName = element.Name
        }
      });
    }
    this.ClientLocationService.getstate(countryId).subscribe((res) => {
      this.listOfstate = res;
      this.listOfstate = _.orderBy(this.listOfstate, ["Name"], ["asc"]);

    }), ((err) => {

    });

  }

  // onChangeCountry(CountryObj) {

  //   let countryId =CountryObj.Id||100;
  //   if (this.listOfcountry && this.listOfcountry.length > 0) {
  //     this.listOfcountry.forEach(element => {
  //       if (element.Id == countryId) {
  //         this.jsonObjNameObj.CountryName = element.Name
  //       }
  //     });
  //   }
  //   this.ClientLocationService.getstate(countryId).subscribe((res) => {
  //     this.listOfstate = res;
  //     this.listOfstate = _.orderBy(this.listOfstate, ["Name"], ["asc"]);
  //   }), ((err) => {

  //   });

  // }
  onChangeState(StateObj) {
    this._stateName = this.jsonObj && this.jsonObj.length > 0 && this.jsonObj[0].ClientLocationAddressdetails.StateName
    let stateId = StateObj.Id;

    if (this.listOfstate && this.listOfstate.length > 0) {
      this.listOfstate.forEach(element => {
        if (element.Id == StateObj.Id) {
          this._stateName = StateObj.Name
        }

      });
    }
    this.ClientLocationService.getcity(stateId).subscribe((res) => {

      // let apiResonse: apiResponse = res;
      this.listOfcity = res;
      this.listOfcity = _.orderBy(this.listOfcity, ["Name"], ["asc"]);
      //console.log(this.listOfstate);

    }),

      ((err) => {

      });

  }

  onChangeCity(cityObj) {
    this._cityName = this.jsonObj && this.jsonObj.length > 0 && this.jsonObj[0].ClientLocationAddressdetails.City
    let cityID = cityObj.Id;
    if (this.listOfcity && this.listOfcity.length > 0) {
      this.listOfcity.forEach(element => {
        if (element.Id == cityObj.Id) {
          this._cityName = cityObj.Name
        }
      });
    }
  }

  IsdataExists() {
    this.ClientLocationService.getClientLocation().subscribe(response => {
      //dataset.fromJson(json);
      // console.log(response);
      this.dataset = response.dynamicObject;

      //console.log(this.dataset.length);

      this.dataset.forEach(element => {
        element.Id != this.ClientLocationModel.Id;
        this.isExists = (this.clientLocationForm.get('name').value || this.clientLocationForm.get('code').value != null ? true : false);
        return this.isExists;
      });
    }, (error) => {
    });
  }

  saveClientLocationbutton(): void {

    this.submitted = true;
    console.log('test', this.clientLocationForm.value);
    if (this.BusinessType != 3) {
      this.clientLocationForm.controls['client'].setValue(this.sessionService.getSessionStorage('default_SME_ClientId'));
      this.ClientLocationModel.ClientID = this.sessionService.getSessionStorage('default_SME_ClientId');
    } else {
      this.ClientLocationModel.ClientID = this.clientLocationForm.get('client').value;
    }

    //changes here
    if (this.clientLocationForm.invalid) {
      // this.alertService.showInfo("Please fill the Mandatory fields ")
      return;
    }

    try {


      this.loadingScreenService.startLoading();
      // this.IsdataExists();

      //   if (this.isExists) {

      //     this.alertService.showWarning("The location code/name is already exists");
      //     return;

      //   }

      var _addressDetails = new AddressDetails();
      _addressDetails.Address1 = this.clientLocationForm.get('address').value;
      _addressDetails.CountryId = this.clientLocationForm.get('country').value;
      _addressDetails.CountryName = this.clientLocationForm.get('CountryName').value;//to get the conuntryname
      _addressDetails.StateName = this.clientLocationForm.get('StateName').value;//to get the statename from dropdown
      _addressDetails.StateId = this.clientLocationForm.get('state').value;
      _addressDetails.CityId = this.clientLocationForm.get('city').value;
      _addressDetails.City = this.clientLocationForm.get('CityName').value;///toget the city name
      _addressDetails.PinCode = this.clientLocationForm.get('pin').value;

      _addressDetails.CommunicationCategoryTypeId = CommunicationCategoryType.Official;

      //var _addressDetailsstring = JSON.stringify(this._addressDetails);
      this.ClientLocationModel.Id = this.clientLocationForm.get('Id').value;
      //this.ClientLocationModel.ClientID = this.jsonObj[0].ClientId;
      if (this.BusinessType != 3) {
        this.ClientLocationModel.ClientID = this.sessionService.getSessionStorage('default_SME_ClientId');

      } else {
        this.ClientLocationModel.ClientID = this.clientLocationForm.get('client').value;

      }
      this.ClientLocationModel.LocationName = this.clientLocationForm.get('name').value;
      this.ClientLocationModel.LocationCode = this.clientLocationForm.get('code').value;
      this.ClientLocationModel.LocationType = this.clientLocationForm.get('locationType').value;
      this.ClientLocationModel.GSTNumber = this.clientLocationForm.get('gst').value;
      this.ClientLocationModel.IsBillingAddress = this.clientLocationForm.get('isBillingAddress').value;
      this.ClientLocationModel.IsPrimaryLocation = this.clientLocationForm.controls['isPrimaryLocation'].value;
      this.ClientLocationModel.IsShippingAddress = this.clientLocationForm.get('isShippingAddress').value;

      // this.ClientLocationModel.ClientLocationAddressdetails.Address1 = this.clientLocationForm.get('address').value;
      // this.ClientLocationModel.ClientLocationAddressdetails.CountryName = this.clientLocationForm.get('country').value;
      // this.ClientLocationModel.ClientLocationAddressdetails.StateName = this.clientLocationForm.get('state').value;
      // this.ClientLocationModel.ClientLocationAddressdetails.City = this.clientLocationForm.get('city').value;
      // this.ClientLocationModel.ClientLocationAddressdetails.PinCode = this.clientLocationForm.get('pin').value; 
      // this.ClientLocationModel.ClientLocationAddressdetails.CommunicationCategoryTypeId=CommunicationCategoryType.Official;
      this.ClientLocationModel.ClientLocationAddressdetails = _addressDetails;
      this.ClientLocationModel.Status = 1;

      if (this.ClientLocationModel.Id > 0) {
        this.ClientLocationModel.Modetype = UIMode.Edit;
      }
      if (this.ClientLocationModel.Id == 0) {
        this.ClientLocationModel.Modetype = UIMode.None;
      }

      this.ClientLocationModel.ClientLocationAddressdetails.CountryName = this._countryName;
      this.ClientLocationModel.ClientLocationAddressdetails.StateName = this._stateName;
      this.ClientLocationModel.ClientLocationAddressdetails.City = this._cityName;
      console.log("clientModel", this.ClientLocationModel.ClientLocationAddressdetails)
      var clientlocation_request_param = JSON.stringify(this.ClientLocationModel);
      //console.log(clientlocation_request_param);

      if (this.ClientLocationModel.Id > 0) { // edit 
        this.ClientLocationModel.Modetype = UIMode.Edit;
        this.ClientLocationService.putClientLocation(clientlocation_request_param).subscribe((data: any) => {

          // this.spinnerEnd();
          //console.log(data);
          if (data.Status == true) {
            this.loadingScreenService.stopLoading();
            this.alertService.showSuccess(data.Message);
            this.activeModal.close(this.ClientLocationModel);

          } else {
            this.loadingScreenService.stopLoading();
            this.alertService.showInfo(data.Message);
          }



        },
          (err) => {

            // this.spinnerEnd();
            this.loadingScreenService.stopLoading();

            this.alertService.showWarning(`Something is wrong!  ${err}`);
            console.log("Something is wrong! : ", err);

          });

      } else {   // create


        this.ClientLocationService.postClientLocation(clientlocation_request_param).subscribe((data: any) => {

          // this.spinnerEnd();
          //console.log(data);

          if (data.Status) {
            this.loadingScreenService.stopLoading();
            this.alertService.showSuccess(data.Message);
            this.activeModal.close(this.ClientLocationModel);


          } else {
            this.loadingScreenService.stopLoading();
            this.alertService.showInfo(data.Message);
          }

        },
          (err) => {
            // this.spinnerEnd();
            this.loadingScreenService.stopLoading();
            this.alertService.showWarning(`Something is wrong!  ${err}`);
            console.log("Something is wrong! : ", err);

          });
      }

    } catch (error) {
      this.loadingScreenService.stopLoading();
      this.alertService.showWarning(`Something is wrong!  ${error}`);
    }

  }
}

