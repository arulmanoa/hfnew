import { Component, OnInit, Input } from '@angular/core';
import { ClientContactModel, ClientContactLocationMapping } from 'src/app/_services/model/ClientContactModelList';
import { ClientContactModelList, ClientList, CountryList, StateList, CityList } from 'src/app/_services/model/ClientContactModelList';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { apiResponse } from 'src/app/_services/model/apiResponse';
import { UIMode } from 'src/app/_services/model/UIMode';
import { LoginResponses } from 'src/app/_services/model';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { SessionStorage } from 'src/app/_services/service/session-storage.service';
import { AddressDetails, CommunicationCategoryType, ContactDetails } from 'src/app/_services/model/Communication/CommunicationType';
import { AlertService, ClientContactService, ClientLocationService } from 'src/app/_services/service';
import { orderBy } from 'src/app/utility-methods/utils';

export const Salutation: any = [{ ValueMember: 1, DisplayMember: 'Mr' },
{ ValueMember: 2, DisplayMember: 'Mrs' }, { ValueMember: 3, DisplayMember: 'Ms' }, { ValueMember: 4, DisplayMember: 'Dr' }];


@Component({
  selector: 'app-client-contact',
  templateUrl: './client-contact.component.html',
  styleUrls: ['./client-contact.component.css']
})
export class ClientContactComponent implements OnInit {
  @Input() id: number;
  @Input() jsonObj: any;


  listOfsalutation = Salutation;
  ClientContactModel: ClientContactModel = {} as any;
  ClientContactModelList: ClientContactModelList;
  listOfclient: ClientList[] = [];
  listOfcountry: CountryList[] = [];
  listOfstate: StateList[] = [];
  // listOfcountry1: CountryList[] = [];
  addressDets = [];
  listOfcity: CityList[] = [];
  clientContactForm: FormGroup;
  submitted = false;
  _addressDetails: AddressDetails[] = [];
  _clientContactLocationMapping: ClientContactLocationMapping[] = [];
  dataset: any[] = [];
  countryId?: any;
  spinner: boolean = true;
  private isContent: boolean = false;
  country: any[];
  ClientLocationNameList = [];
  locationLst = [];
  LstClientLocationMapping: ClientContactLocationMapping[] = [];

  _loginSessionDetails: LoginResponses;
  UserId: any;
  RoleId: any;
  BusinessType: number = 0;

  constructor(
    private ClientContactService: ClientContactService,
    private ClientLocationService: ClientLocationService,
    private formBuilder: FormBuilder,
    private activeModal: NgbActiveModal,
    private alertService: AlertService,
    private sessionService: SessionStorage,
  ) { }

  get f() { return this.clientContactForm.controls; }

  ngOnInit() {
    this.spinner = true;
    this._loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses)); // Get the whole matched session element set as a clean json(array) via an session object
    this.UserId = this._loginSessionDetails.UserSession.UserId;
    this.RoleId = this._loginSessionDetails.UIRoles[0].Role.Id;
    let loginSessionDetails = JSON.parse(
      this.sessionService.getSessionStorage(SessionKeys.LoginResponses)
    );
    this.BusinessType =
      loginSessionDetails.Company.LstCompanyBusinessTypeMapping != null
        ? loginSessionDetails.Company.LstCompanyBusinessTypeMapping.find(
          (item) => item.CompanyId == loginSessionDetails.Company.Id
        ).BusinessType
        : 0;
    this.clientContactForm = this.formBuilder.group({
      Id: [0],
      client: [null, Validators.required],
      clientlocation: [null, Validators.required],
      salutation: [''],
      name: [null, Validators.required],
      designation: ['', Validators.required],
      mobile: ['', Validators.required],
      ccode: ['', Validators.required],
      isSinglePointOfContact: [true],
      email: ['', Validators.required]

    })
    this.loadClientLst();
    this.loadCountryLst();
    console.log(this.id);
    console.log('jjjjj', this.jsonObj);
    this.editclientcontact();
  }


  editclientcontact() {

    let j: any[] = [];
    if (this.id) {
      this.Clientdropdown(this.jsonObj[0].ClientID);
      if (this.jsonObj[0].LstClientContactLocationMapping != null) {

        this.jsonObj[0].LstClientContactLocationMapping.forEach(element => {

          j.push(element.ClientLocationId)
          this.locationLst.push({
            Id: element.Id, ClientLocationId: element.ClientLocationId
            , ClientContactId: element.ClientContactId
          })

        });
      }
      console.log('loc', this.locationLst);
      console.log('loc j', j);
      this.clientContactForm.patchValue({
        "Id": this.jsonObj[0].Id,
        "client": this.jsonObj[0].ClientID,
        "clientlocation": j,
        "salutation": this.jsonObj[0].Salutation,
        "name": this.jsonObj[0].Name,
        "designation": this.jsonObj[0].Designation,
        "mobile": this.jsonObj[0].LstClientContact.PrimaryMobile,
        "ccode": this.jsonObj[0].LstClientContact.PrimaryMobileCountryCode,
        "email": this.jsonObj[0].LstClientContact.PrimaryEmail,
        "isSinglePointOfContact": this.jsonObj[0].IsSinglePointOfContact,
      });
      this.clientContactForm.controls['client'].disable();
    }
    this.spinner = false;
    console.log(this.clientContactForm);
  }

  Clientdropdown(ClientId) {
    if (typeof ClientId == 'object') ClientId = ClientId.Id;
    this.ClientLocationService.getClientLocationByClientId(ClientId).subscribe((res) => {
      this.ClientLocationNameList = res.dynamicObject;
      this.ClientLocationNameList = this.ClientLocationNameList.concat().sort(orderBy(["LocationName"], ["asc"]));
      console.log('ll', this.ClientLocationNameList);
      if (this.jsonObj !== null && this.jsonObj != undefined) {
        let addData = this.ClientLocationNameList.find((cln) => cln.ClientLocationAddressdetails.StateName == this.jsonObj[0].LstClientAddress.StateName);
        this.clientContactForm.controls['clientlocation'].patchValue(addData.Id);
      }
    });
  }

  closeModal = () => this.activeModal.close('Modal Closed');
  //pass client list from the parent comp to this modal
  loadClientLst() {
    this.spinner = false;
    this.isContent = true;
    this.ClientContactService.getUserMappedClientList(this.RoleId, this.UserId).subscribe((res) => {
      let apiResonse: apiResponse = res;
      this.listOfclient = apiResonse.dynamicObject;
      console.log('list of client', this.listOfclient);
      if (this.BusinessType != 3 && this.clientContactForm.controls['Id'].value == 0) {
        let smeClient = JSON.parse(this.sessionService.getSessionStorage('sme_client'));
        console.log('smeClient ', smeClient);
        this.clientContactForm.controls['client'].patchValue(smeClient.Id);
        this.Clientdropdown({ Id: smeClient.Id });
      }
    });
  }

  loadCountryLst() {
    this.spinner = false;
    this.isContent = true;
    this.ClientContactService.getcountry().subscribe((res) => {
      this.listOfcountry = res;
      this.listOfcountry = this.listOfcountry.concat().sort(orderBy(["Name"], ["asc"]));
      if (this.clientContactForm.controls.Id.value == 0) {
        this.clientContactForm.controls['ccode'].setValue(this.listOfcountry.find(a => a.Id == 100).PhoneCode);
      }
      console.log('code', this.listOfcountry);
    });
  }

  onChangeCountry(CountryId) {
    this.spinner = false;
    this.isContent = true;
    this.ClientContactService.getstate(CountryId).subscribe((res) => {
      this.listOfstate = res;
      this.listOfstate = this.listOfstate.concat().sort(orderBy(["Name"], ["asc"]));
      console.log(this.listOfstate);
    });
  }



  saveClientContactbutton() {
    this.LstClientLocationMapping = []
    this.submitted = true;
    if (this.clientContactForm.invalid) {
      return;
    };
    this.spinner = true;

    var _contactDetails = new ContactDetails();
    _contactDetails.CommunicationCategoryTypeId = CommunicationCategoryType.Official;
    _contactDetails.PrimaryEmail = this.clientContactForm.get('email').value;
    _contactDetails.PrimaryMobile = this.clientContactForm.get('mobile').value;
    _contactDetails.PrimaryMobileCountryCode = this.clientContactForm.get('ccode').value;

    var _addressDetails = new AddressDetails();
    _contactDetails.CommunicationCategoryTypeId = CommunicationCategoryType.Official;
    _contactDetails.PrimaryEmail = this.clientContactForm.get('email').value;
    _contactDetails.PrimaryMobile = this.clientContactForm.get('mobile').value;
    _contactDetails.PrimaryMobileCountryCode = this.clientContactForm.get('ccode').value;

    const Lst_clientLocation = JSON.stringify(this.clientContactForm.get('clientlocation').value)
    var tes = [];
    tes = JSON.parse(Lst_clientLocation);
    // tes.forEach(element => {
    var isext = this.locationLst.find(a => a.ClientLocationId == tes);
    if (isext != null) {
      var _clientContactLocationMapping = new ClientContactLocationMapping();
      _clientContactLocationMapping.ClientLocationId = isext.ClientLocationId;
      _clientContactLocationMapping.ClientContactId = isext.ClientContactId;
      _clientContactLocationMapping.Id = isext.Id;
      _clientContactLocationMapping.Status = 1;
      _clientContactLocationMapping.Modetype = UIMode.Edit;
      this.LstClientLocationMapping.push(_clientContactLocationMapping);

    } else {
      var _clientContactLocationMapping = new ClientContactLocationMapping();
      _clientContactLocationMapping.ClientLocationId = Number(tes)
      _clientContactLocationMapping.ClientContactId = 0;
      _clientContactLocationMapping.Id = 0;
      _clientContactLocationMapping.Status = 1;
      _clientContactLocationMapping.Modetype = UIMode.None;
      this.LstClientLocationMapping.push(_clientContactLocationMapping);
    }
    // });



    this.ClientContactModel.Id = this.clientContactForm.get('Id').value;
    this.ClientContactModel.ClientID = this.clientContactForm.get('client').value;
    this.ClientContactModel.Salutation = this.clientContactForm.get('salutation').value;
    this.ClientContactModel.Name = this.clientContactForm.get('name').value;
    this.ClientContactModel.Designation = this.clientContactForm.get('designation').value;
    this.ClientContactModel.IsSinglePointOfContact = this.clientContactForm.get('isSinglePointOfContact').value;
    this.ClientContactModel.LstClientContactLocationMapping = this.LstClientLocationMapping;
    this.ClientContactModel.LstClientContact = _contactDetails;
    let addr = this.ClientLocationNameList.find(a => a.Id == tes);
    this.ClientContactModel.LstClientAddress = addr.ClientLocationAddressdetails;


    this.ClientContactModel.Status = 1;

    if (this.ClientContactModel.Id > 0) {
      this.ClientContactModel.Modetype = UIMode.Edit;
    }
    if (this.ClientContactModel.Id == 0) {
      this.ClientContactModel.Modetype = UIMode.None;
    }
    var clientcontact_request_param = JSON.stringify(this.ClientContactModel);
    console.log(clientcontact_request_param);

    if (this.ClientContactModel.Id > 0) { // edit 
      this.ClientContactModel.Modetype = UIMode.Edit;
      this.ClientContactService.putClientContact(clientcontact_request_param).subscribe((data: any) => {
        console.log(data);
        if (data.Status == true) {
          this.activeModal.close(this.ClientContactModel);
          this.alertService.showSuccess(data.Message);
        } else {
          this.alertService.showInfo(data.Message);
        };
        this.spinner = false;

      }, (err) => {
        this.spinner = false;
        this.alertService.showWarning(`Something is wrong!  ${err}`);
        console.log("Something is wrong! : ", err);
      });
    } else {   // create
      this.ClientContactService.postClientContact(clientcontact_request_param).subscribe((data: any) => {
        this.spinner = false;
        console.log(data);

        if (data.Status) {
          this.activeModal.close(this.ClientContactModel);
          this.alertService.showSuccess(data.Message);
        } else {
          this.alertService.showInfo(data.Message);
        };

      }, (err) => {
        this.spinner = false;
        this.alertService.showWarning(`Something is wrong!  ${err}`);
        console.log("Something is wrong! : ", err);
      });
    }
  }
}
