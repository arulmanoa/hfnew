import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder, FormControl, Validators, AbstractControl } from '@angular/forms';
import { AlertService, ClientLocationService, ClientService, FileUploadService } from 'src/app/_services/service';
import { ClientBase, ClientDetails, ClientLocation, ClientModel } from 'src/app/_services/model/Client/ClientDetails';
import { LoginResponses, UIMode } from 'src/app/_services/model';
import { SessionStorage } from 'src/app/_services/service';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { apiResponse } from 'src/app/_services/model/apiResponse';
import { IndustryList } from 'src/app/_services/model/OnBoarding/OfferInfo';
import { UUID } from 'angular2-uuid';
import _ from 'lodash';
import { CityList, CountryList, StateList } from 'src/app/_services/model/ClientLocationAllList';
import { environment } from 'src/environments/environment';
import { AddressDetails, CommunicationCategoryType, ContactDetails } from 'src/app/_services/model/Communication/CommunicationType';
import moment from 'moment';
import { ClientContactLocationMapping } from 'src/app/_services/model/ClientContactModelList';
import { ObjectStorageDetails } from 'src/app/_services/model/Candidates/ObjectStorageDetails';
import { apiResult } from '../../../_services/model/apiResult';
import { SharedDataService } from 'src/app/_services/service/share.service';

export class ClientContact {

  ClientID: number;
  Salutation: number;
  Name: string;
  Designation: string;
  IsSinglePointOfContact: boolean;
  LstClientContact: ContactDetails;
  LstClientAddress: AddressDetails;
  LstClientContactLocationMapping: ClientContactLocationMapping[];
  Status: number;
  Modetype: UIMode;
  Id: number;
  CreatedBy?: string;
  CreatedOn?: Date | any;
  LastUpdatedBy?: string;
  LastUpdatedOn?: Date | any;
}

// Client Location Details
export const LocationTypeEnum: any = [{ Id: 1, Name: 'WorkPremise' },
{ Id: 2, Name: 'ClientLocation' }, { Id: 3, Name: 'Both' }];

export const SalutationEnum: any = [{ Id: 1, Name: 'Mr' },
{ Id: 2, Name: 'Mrs' }, { Id: 3, Name: 'Ms' }, { Id: 4, Name: 'Dr' }];


@Component({
  selector: 'app-client',
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.scss']
})
export class ClientComponent implements OnInit {
  // GENERAL 
  spinner: boolean = false;
  loginSessionDetails: LoginResponses;
  BusinessType: number = 0;
  CompanyId: number = 0;

  @Input() Id: number = 0;

  // CLIENT 
  submitted = false;
  clientForm: FormGroup;

  // CLIENT LOCATION
  clientLocationForm: FormGroup;
  LocationType = LocationTypeEnum;
  CountryList: CountryList[];
  StateList: StateList[];
  CityList: CityList[];
  LstClientLocation: ClientLocation[] = [];
  isNewLocation: boolean = false;

  // CLIENT CONTACT
  clientContactForm: FormGroup;
  SalutationType = SalutationEnum;
  LstClientContact: any[] = [];
  LstClientContactLocationMapping: ClientContactLocationMapping[] = [];
  isNewContact: boolean = false;

  //MASTER DATA

  IndustryList: IndustryList[] = [];
  OrganizationList = [];

  // WIZARD TYPE
  hasClientId: number = 0;
  index: number = 0;
  clientInfo: ClientDetails = new ClientDetails();

  clientModel = new ClientModel();

  isNewClientActivity: boolean = false;
  logoUploadInfo = { logo: '', minilogo: '', logodocId: 0, minilogodocId: 0 };
  deletedDocList: number[] = [];
  fileObj = {};
  constructor(
    private activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private clientservice: ClientService,
    private sessionService: SessionStorage,
    private alertService: AlertService,
    private clientLocationService: ClientLocationService,
    private fileUploadService: FileUploadService,
    private sharedDataService: SharedDataService
  ) {
    this.createReactiveForm();
  }
  get g() { return this.clientForm.controls; } // reactive forms validation 
  get h() { return this.clientLocationForm.controls; } // reactive forms validation 
  get f() { return this.clientContactForm.controls; } // reactive forms validation

  createReactiveForm() {
    const urlRegex = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/;
    this.clientForm = this.formBuilder.group({
      //GENERAL
      Id: [UUID.UUID()],
      Name: ['', [Validators.required, Validators.minLength(5)]],
      Code: ['', [Validators.required, Validators.minLength(5)]],
      Notes: [null],
      Status: [true, Validators.required],
      // IsNapsBased: ['', Validators.required],
      ShortCode: [''],
      Website: [''],
      // [Validators.required, Validators.pattern(urlRegex)]
      OrganizationId: [null, Validators.required],
      IndustryId: [null],
      Isnapbased: [false],
      ClientLogoFileName: ['', Validators.required],
      ClientMiniLogoFileName: ['', Validators.required]

    });
  }

  ngOnInit() {
    this.spinner = true;
    this.loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses));
    this.BusinessType = this.loginSessionDetails.Company.LstCompanyBusinessTypeMapping != null ? this.loginSessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this.loginSessionDetails.Company.Id).BusinessType : 0;
    this.CompanyId = this.loginSessionDetails.Company.Id;

    console.log('Id', this.Id);

    if (this.Id) {
      this.isNewClientActivity = false;


      this.hasClientId = this.Id;
      this.GetClientById().then((resolve: apiResponse) => {
        if (resolve.Status) {
          try {
            // master - clientlookup details 
            this.getLookUpDetails().then((resolve: apiResponse) => {
              if (resolve.Status) {
                let lookUpMaster = {
                  IndustryList: [],
                  OrganizationList: [],
                };

                lookUpMaster = resolve.dynamicObject && resolve.dynamicObject;
                this.IndustryList = lookUpMaster.IndustryList;
                this.OrganizationList = lookUpMaster.OrganizationList;
                this.spinner = false;
              }
            })
          } catch (error) {
            console.log('#0001 LOOKUP EX::', error);
          }
        }

      })
    }
    else {
      try {
        this.clientForm.controls['Status'].disable();
        this.isNewClientActivity = true;
        // master - clientlookup details 
        this.getLookUpDetails().then((resolve: apiResponse) => {
          if (resolve.Status) {
            let lookUpMaster = {
              IndustryList: [],
              OrganizationList: [],
            };

            lookUpMaster = resolve.dynamicObject && resolve.dynamicObject;
            this.IndustryList = lookUpMaster.IndustryList;
            this.OrganizationList = lookUpMaster.OrganizationList;
            this.spinner = false;
          }
        })
      } catch (error) {
        console.log('#0001 LOOKUP EX::', error);
      }
    }

    if (this.BusinessType != 3) {
      let sme_client = JSON.parse(this.sessionService.getSessionStorage("sme_client"));
      console.log('sme_client ', sme_client);
      let sme_logoInfo = JSON.parse(sme_client.ClientLogoURL);
      console.log('sme_logoInfo ', sme_logoInfo);
      this.fileObj['clientId'] = sme_client.Id;
      this.logoUploadInfo.logo = sme_logoInfo.logo;
      this.logoUploadInfo.minilogo = sme_logoInfo.minilogo;
      this.logoUploadInfo.logodocId = sme_logoInfo.logodocId;
      this.logoUploadInfo.minilogodocId = sme_logoInfo.minilogodocId;
      this.clientForm.controls['ClientLogoFileName'].setValue(sme_logoInfo.logo);
      this.clientForm.controls['ClientMiniLogoFileName'].setValue(sme_logoInfo.minilogo);
    }
  }

  GetClientById() {
    const promise = new Promise((res, rej) => {
      this.clientservice.getClientById(this.Id).subscribe((result: apiResponse) => {
        console.log('CLIENT  DET ::', result);
        let rt: ClientDetails = result.dynamicObject;
        this.clientForm.patchValue(result.dynamicObject);
        let dynamicObject: any = result.dynamicObject;
        this.clientForm.controls['Isnapbased'].setValue(dynamicObject.IsNapBased)
        if (dynamicObject && dynamicObject.ClientBase) {
          let clientBase = dynamicObject.ClientBase;
          console.log('clientBase ', clientBase);
          if (clientBase.ClientLogoUrl != '') {
            this.logoUploadInfo = JSON.parse(clientBase.ClientLogoURL);
          }
        }
        this.clientForm.controls['ClientLogoFileName'].setValue(this.logoUploadInfo.logo);
        this.clientForm.controls['ClientMiniLogoFileName'].setValue(this.logoUploadInfo.minilogo);

        this.clientModel.oldobj = Object.assign({}, result.dynamicObject);
        this.clientInfo = result.dynamicObject;
        this.LstClientLocation = this.clientInfo.LstClientLocation;
        this.LstClientContact = this.clientInfo.LstContact;
        // this.clientForm.controls['Code'].disable();
        this.clientForm.controls['Status'].enable();
        res(result);
      })
    })
    return promise;
  }

  onIndexChange(index: any): void {
    console.log("Changing index");
    this.index = index.target.textContent == "Client Details" ? 0 : index.target.textContent == "Client Location" ? 1 :
      index.target.textContent == "Client Contact" ? 2 : 0

    if (this.index == 1) {
      this.getCountryList();
    }
  }


  getLookUpDetails() {
    const promise = new Promise((res, rej) => {
      this.clientservice.LoadClientLookupDetails().subscribe((result) => {
        console.log('LOOKUP CLT ::', result);
        const apiR: apiResponse = result;
        res(apiR);
      })
    })
    return promise;
  }

  close() {
    if (this.index == 1) {
      this.isNewLocation ? this.isNewLocation = false : true;
      this.LstClientLocation.length > 0 ? this.activeModal.close('Record Updated') : true;
      return;
    }

    if (this.index == 2) {
      this.isNewContact ? this.isNewContact = false : true;
      this.LstClientContact.length > 0 ? this.activeModal.close('Record Updated') : true;
      return;
    }

    this.activeModal.close('Modal Closed');
  }

  onFileUpload(event, fileUploadType) {
    const file: File = event.target.files[0];
    let fileName = file ? file.name : ''
    if (file.type != 'image/png' && file.type != 'image/jpeg') {
      this.alertService.showWarning(
        "Uploaded file must be of type png or jpeg"
      );
      return;
    }
    if (file.size > 1000000) {
      this.alertService.showWarning(
        "Uploaded file size must less than 1 MB"
      );
      return;
    }
    const maxWidth = 210;
    const maxHeight = 60
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = (e: any) => {
      let fileurl = (reader.result as string).split(",")[1];
      const img = new Image();
      img.src = e.target.result;
      img.onload = () => {

        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Check if the image exceeds the maximum dimensions
        if (width > maxWidth || height > maxHeight) {
          width = maxWidth;
          height = maxHeight;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        if (fileUploadType == 'miniLogo') {
          this.fileObj['miniLogo'] = canvas.toDataURL(file.type);
        }
        if (fileUploadType == 'logo') {
          this.fileObj['logo'] = canvas.toDataURL(file.type)
        }

        this.doFileUpload(fileurl, fileName, fileUploadType, file.type);
      }
    }
  }

  doFileUpload(filebytes, filename, fileUploadType, fileType) {
    try {
      let objStorage = new ObjectStorageDetails();
      objStorage.Id = 0;
      objStorage.CandidateId = 0;
      objStorage.ClientContractCode = this.BusinessType == 3 ? "" : this.sessionService.getSessionStorage("default_ContractCode") == null ? "" : this.sessionService.getSessionStorage("default_ContractCode").toString();
      objStorage.ClientCode = this.BusinessType == 3 ? "" : this.sessionService.getSessionStorage("default_ClientCode") == null ? "" : this.sessionService.getSessionStorage("default_ClientCode").toString();
      objStorage.CompanyCode = this.sessionService.getSessionStorage("CompanyCode") == null ? "" : this.sessionService.getSessionStorage("CompanyCode").toString();
      objStorage.ClientContractId = 0;
      objStorage.ClientId = 0;
      objStorage.CompanyId = this.CompanyId;
      objStorage.Status = true;
      objStorage.Content = filebytes;
      objStorage.SizeInKB = 12;
      objStorage.ObjectName = filename;
      objStorage.OriginalObjectName = filename;
      objStorage.Type = 0;
      objStorage.ObjectCategoryName = "Proofs";

      this.fileUploadService.postObjectStorage(JSON.stringify(objStorage)).subscribe((res) => {
        console.log(res);
        let apiResult: any = res;
        if (apiResult.Status && apiResult.Result != "") {
          let documentId = apiResult.Result;
          if (fileUploadType == 'miniLogo') {
            this.logoUploadInfo.minilogo = filename;
            this.logoUploadInfo.minilogodocId = documentId;
            this.clientForm.controls['ClientMiniLogoFileName'].setValue(filename);
            if (this.BusinessType != 3) {
              this.fileObj['logodocId'] = documentId;
            }

          }
          if (fileUploadType == 'logo') {
            this.logoUploadInfo.logo = filename;
            this.logoUploadInfo.logodocId = documentId;
            this.clientForm.controls['ClientLogoFileName'].setValue(filename);
            if (this.BusinessType != 3) {
              this.fileObj['minilogodocId'] = documentId;
            }
          }
          console.log('fileobj ', this.fileObj);
          console.log('logo upload info ', this.logoUploadInfo);
        }
        else {
          this.alertService.showWarning("Failed to upload. Please try after sometimes!")
        }

      }), ((err) => {

      })

    } catch (error) {
      console.log(error);
    }

  }

  doDeleteFile(uploadType) {
    this.alertService
      .confirmSwal(
        "Are you sure you want to delete ?",
        "Once deleted,  you cannot undo this action.",
        "OK, Delete"
      )
      .then((result) => {
        // this.deleteAsync(uploadType);
        if (uploadType == 'logo') {
          this.deletedDocList.push(this.logoUploadInfo.logodocId);
          this.clientForm.controls['ClientLogoFileName'].setValue('');
          this.logoUploadInfo.logo = '';
          this.logoUploadInfo.logodocId = 0;
        }
        if (uploadType == 'miniLogo') {
          this.deletedDocList.push(this.logoUploadInfo.minilogodocId);
          this.clientForm.controls['ClientMiniLogoFileName'].setValue('');
          this.logoUploadInfo.minilogo = '';
          this.logoUploadInfo.minilogodocId = 0;
        }
      })
      .catch((error) => { });
  }

  deleteAsync(documentId) {
    if (documentId) {
      this.fileUploadService
        .deleteObjectStorage(documentId)
        .subscribe((res) => {
          console.log(res);
          let apiResult: apiResult = res;
          try {
            if (apiResult.Status) {
              this.alertService.showSuccess(
                "Your file is deleted successfully!"
              );
            }
          } catch (error) {
            console.log(error);
          }
        }),
        (err) => {
          console.log(err);
        };
    }
  }

  doSaveClient() {
    var clientBase = new ClientBase();
    var client = new ClientDetails();

    if (this.index == 0) {

      this.submitted = true;
      console.log('invalid', this.clientForm.value);

      // if (this.BusinessType == 3) {
      //   this.clientForm.controls['ClientLogoFileName'].setValidators(null);
      //   this.clientForm.controls['ClientLogoFileName'].updateValueAndValidity();
      //   this.clientForm.controls['ClientMiniLogoFileName'].setValidators(null);
      //   this.clientForm.controls['ClientMiniLogoFileName'].updateValueAndValidity();
      // } else {
      //   this.clientForm.controls['ClientLogoFileName'].setValidators(Validators.required);
      //   this.clientForm.controls['ClientLogoFileName'].updateValueAndValidity();
      //   this.clientForm.controls['ClientMiniLogoFileName'].setValidators(Validators.required);
      //   this.clientForm.controls['ClientMiniLogoFileName'].updateValueAndValidity();
      // }

      if (this.clientForm.invalid) {
        this.alertService.showWarning('You must have filled out all the required fields and try to save');
        return;
      }

      if (this.deletedDocList.length > 0) {
        this.deleteAsync(this.deletedDocList[0]);
        this.deleteAsync(this.deletedDocList[1]);
      }

      try {

        this.submitted = false;
        this.spinner = true;

        if (this.Id > 0) {

        } else {

          clientBase.Id = 0;
          clientBase.Code = this.clientForm.value.Code;
          clientBase.Name = this.clientForm.value.Name;
          clientBase.OrganizationId = this.clientForm.value.OrganizationId;
          clientBase.CompanyId = this.CompanyId;
          clientBase.LoginCode = null;
          // clientBase.ClientLogoURL = JSON.stringify(this.logoUploadInfo);
          clientBase.IsDefault = true;
        }


        client.Id = this.Id;
        client.Code = this.clientForm.value.Code;
        client.Name = this.clientForm.value.Name;
        client.CompanyId = this.CompanyId;
        client.Status = this.clientForm.getRawValue().Status == true ? 1 : 0;
        client.OrganizationId = this.clientForm.value.OrganizationId;
        client.Notes = this.clientForm.value.Notes;
        client.DefaultAccountManagerId = 0;
        client.ShortCode = this.clientForm.value.ShortCode;
        client.Website = this.clientForm.value.Website;
        client.IndustryId = this.clientForm.value.IndustryId;
        client.Isnapbased = this.clientForm.value.Isnapbased;
        client.ClientBase = this.Id > 0 ? this.clientInfo.ClientBase : clientBase;
        client.LstClientLocation = this.Id > 0 ? this.clientInfo.LstClientLocation : [];
        client.LstContact = this.Id > 0 ? this.clientInfo.LstContact : [];
        client.CreatedBy = String(this.loginSessionDetails.UserSession.UserId);
        client.LastUpdatedBy = String(this.loginSessionDetails.UserSession.UserId);

        this.Id > 0 ? client.Modetype = UIMode.Edit : true;

        client.Status == undefined ? client.Status = 1 : true;
        console.log('#001 PLD ::', client);

        if (this.Id > 0) {
          // client.ClientBase.ClientLogoURL = JSON.stringify(this.logoUploadInfo);
          // this.clientModel.newobj = client;
          this.clientservice.putClient(JSON.stringify(this.clientModel)).subscribe((data: apiResponse) => {
            console.log('#001 RES 3::', data);
            this.spinner = false;
            if (data.Status) {

              // if (this.BusinessType !== 3) {
              //   this.sessionService.setItem('ClientLogoUrl', JSON.stringify(this.fileObj));
              //   this.sharedDataService.updateClientLogo.next(this.fileObj);
              // }

              if (!this.isNewClientActivity) {
                this.activeModal.close('Record Updated');
                return;
              }
              client = data.dynamicObject;
              this.clientInfo = client;
              this.Id = this.clientInfo.Id;
              this.clientModel.oldobj = Object.assign({}, data.dynamicObject);
              this.alertService.showSuccess(data.Message);
              this.spinner = false;
              this.LstClientLocation = this.clientInfo.LstClientLocation;
              this.LstClientContact = this.clientInfo.LstContact;
              this.LstClientLocation.length > 0 ? this.isNewLocation = false : true;

            } else {
              this.alertService.showWarning(data.Message);
            }
          });
        } else {

          this.clientservice.postClient(JSON.stringify(client)).subscribe((data: apiResponse) => {
            console.log('#001 RES ::', data);
            this.spinner = false;
            if (data.Status) {
              // if (this.BusinessType !== 3) {
              //   this.sessionService.setItem('ClientLogoUrl', JSON.stringify(this.fileObj));
              //   this.sharedDataService.updateClientLogo.next(this.fileObj);
              // }
              client = data.dynamicObject;
              this.clientInfo = client;
              this.Id = this.clientInfo.Id;
              this.clientModel.oldobj = Object.assign({}, data.dynamicObject);
              this.LstClientLocation = this.clientInfo.LstClientLocation;
              this.LstClientContact = this.clientInfo.LstContact == null ? [] : this.clientInfo.LstContact;
              this.alertService.showSuccess(data.Message);
              this.spinner = false;
              this.createCLReactiveForm();
              this.hasClientId = client.Id;
              this.index = 1;
              this.getCountryList();

            } else {
              this.alertService.showWarning(data.Message);
            }
          });
        }


      } catch (error) {
        console.log('#001 CLINETN INSERT EX ::', error);
      }

    }
    else if (this.index == 1) {
      this.submitted = true;

      console.log('invalid', this.clientLocationForm.value);

      if (this.clientLocationForm.invalid) {
        this.alertService.showWarning('You must have filled out all the required fields and try to save');
        return;
      }
      try {


        this.spinner = true;
        var _addressDetails = new AddressDetails();
        let clientLocation = new ClientLocation();

        if (this.clientInfo.LstClientLocation && this.clientInfo.LstClientLocation.length > 0 && this.clientInfo.LstClientLocation.find(a => a.Id == this.clientLocationForm.value.Id)) {
          let existingCL = this.clientInfo.LstClientLocation.find(a => a.Id == this.clientLocationForm.value.Id);
          clientLocation = existingCL;
          _addressDetails.Address1 = this.clientLocationForm.value.Address;
          _addressDetails.CountryId = this.clientLocationForm.value.Country;
          _addressDetails.CountryName = this.clientLocationForm.value.CountryName;
          _addressDetails.StateName = this.clientLocationForm.value.StateName;
          _addressDetails.StateId = this.clientLocationForm.value.State;
          _addressDetails.CityId = this.clientLocationForm.value.City;
          _addressDetails.City = this.clientLocationForm.value.CityName;
          _addressDetails.PinCode = this.clientLocationForm.value.Pincode;
          _addressDetails.CommunicationCategoryTypeId = CommunicationCategoryType.Official;


          clientLocation.ClientID = this.hasClientId;
          clientLocation.LocationCode = this.clientLocationForm.value.LocationCode;
          clientLocation.LocationName = this.clientLocationForm.value.LocationName;
          clientLocation.LocationType = this.clientLocationForm.value.LocationType;
          clientLocation.IsPrimaryLocation = this.clientLocationForm.value.IsPrimaryLocation;
          clientLocation.ClientLocationAddressdetails = _addressDetails
          clientLocation.IsBillingAddress = this.clientLocationForm.value.IsBillingAddress;
          clientLocation.IsShippingAddress = this.clientLocationForm.value.IsShippingAddress;
          clientLocation.GSTNumber = this.clientLocationForm.value.GST;
          clientLocation.Status = this.clientLocationForm.value.Status == true ? 1 : 0;
          clientLocation.Modetype = UIMode.Edit;
          clientLocation.Id = this.clientLocationForm.value.Id;
        }
        else {

          _addressDetails.Address1 = this.clientLocationForm.value.Address;
          _addressDetails.CountryId = this.clientLocationForm.value.Country;
          _addressDetails.CountryName = this.clientLocationForm.value.CountryName;
          _addressDetails.StateName = this.clientLocationForm.value.StateName;
          _addressDetails.StateId = this.clientLocationForm.value.State;
          _addressDetails.CityId = this.clientLocationForm.value.City;
          _addressDetails.City = this.clientLocationForm.value.CityName;
          _addressDetails.PinCode = this.clientLocationForm.value.Pincode;
          _addressDetails.CommunicationCategoryTypeId = CommunicationCategoryType.Official;


          clientLocation.ClientID = this.hasClientId;
          clientLocation.LocationCode = this.clientLocationForm.value.LocationCode;
          clientLocation.LocationName = this.clientLocationForm.value.LocationName;
          clientLocation.LocationType = this.clientLocationForm.value.LocationType;
          clientLocation.IsPrimaryLocation = this.clientLocationForm.value.IsPrimaryLocation;
          clientLocation.ClientLocationAddressdetails = _addressDetails
          clientLocation.IsBillingAddress = this.clientLocationForm.value.IsBillingAddress;
          clientLocation.IsShippingAddress = this.clientLocationForm.value.IsShippingAddress;
          clientLocation.GSTNumber = this.clientLocationForm.value.GST;
          clientLocation.Status = this.clientLocationForm.value.Status == true ? 1 : 0;
          clientLocation.Modetype = UIMode.Edit;
          clientLocation.Id = this.clientLocationForm.value.Id;
          clientLocation.LastUpdatedOn = moment().format('YYYY-MM-DD');
          this.clientInfo.LstClientLocation.push(clientLocation);
        }
        this.submitted = false;

        this.clientLocationForm.reset();
        this.clientLocationForm.controls['Client'].setValue(this.hasClientId);
        this.clientLocationForm.controls['Id'].setValue(UUID.UUID());
        this.clientLocationForm.controls['Status'].setValue(true);
        this.clientLocationForm.controls['IsPrimaryLocation'].setValue(false);
        this.clientLocationForm.controls['IsShippingAddress'].setValue(false);
        this.clientLocationForm.controls['IsBillingAddress'].setValue(false);


        this.clientInfo.LstClientLocation && this.clientInfo.LstClientLocation.length > 0 && this.clientInfo.LstClientLocation.forEach(e1 => {
          e1.Id = this.isGuid(e1.Id) ? 0 : e1.Id;
        });

        console.log('#001 PLD (1)::', this.clientInfo);


        this.clientModel.newobj = this.clientInfo;
        this.clientservice.putClient(JSON.stringify(this.clientModel)).subscribe((data: apiResponse) => {

          console.log('#001 RES ::', data);
          this.spinner = false;
          if (data.Status) {
            client = data.dynamicObject;
            this.clientInfo = client;
            this.isNewLocation = false;
            this.LstClientLocation = this.clientInfo.LstClientLocation;
            this.LstClientContact = this.clientInfo.LstContact == null ? [] : this.clientInfo.LstContact;
            this.alertService.showSuccess(data.Message);
            this.spinner = false;

          } else {
            this.alertService.showWarning(data.Message);
          }
        });

      } catch (error) {
        console.log('EXE CLOCATION ::', error);
        this.spinner = false;
      }

      // this.index = 2;
      // this.createCCReactiveForm()
    }
    else if (this.index == 2) {

      this.submitted = true;

      console.log('invalid', this.clientContactForm.value);

      if (this.clientContactForm.invalid) {
        this.alertService.showWarning('You must have filled out all the required fields and try to save');
        return;
      }
      this.spinner = true;
      var _contactDetails = new ContactDetails();
      var clientContact = new ClientContact();

      try {
        // if (!this.isNewContact) {
        if (this.clientInfo && this.clientInfo.LstContact &&
          this.clientInfo.LstContact.length > 0 && this.clientInfo.LstContact.find(a => a.Id == this.clientContactForm.value.Id)) {
          let existingCC = this.clientInfo.LstContact.find(a => a.Id == this.clientContactForm.value.Id);
          clientContact = existingCC;
          _contactDetails.CommunicationCategoryTypeId = CommunicationCategoryType.Official;
          _contactDetails.PrimaryEmail = this.clientContactForm.get('PrimaryEmail').value;
          _contactDetails.PrimaryMobile = this.clientContactForm.get('PrimaryMobile').value;
          _contactDetails.PrimaryMobileCountryCode = this.clientContactForm.get('PrimaryMobileCountryCode').value;
          const cl = JSON.stringify(this.clientContactForm.get('ClientLocation').value)
          var selectedCls = [];
          this.LstClientContactLocationMapping = [];
          selectedCls = JSON.parse(cl);
          selectedCls.forEach(element => {
            // var isext = this.locationLst.find(a => a.ClientLocationId == element);
            // if (isext != null) {

            //   var _clientContactLocationMapping = new ClientContactLocationMapping();
            //   _clientContactLocationMapping.ClientLocationId = isext.ClientLocationId;
            //   _clientContactLocationMapping.ClientContactId = isext.ClientContactId;
            //   _clientContactLocationMapping.Id = isext.Id;
            //   _clientContactLocationMapping.Status = 1;
            //   _clientContactLocationMapping.Modetype = UIMode.Edit;
            //   this.LstClientLocationMapping.push(_clientContactLocationMapping);

            // }
            // else {

            var _clientContactLocationMapping = new ClientContactLocationMapping();
            _clientContactLocationMapping.ClientLocationId = element
            _clientContactLocationMapping.ClientContactId = 0;
            _clientContactLocationMapping.Id = 0;
            _clientContactLocationMapping.Status = 1;
            _clientContactLocationMapping.Modetype = UIMode.Edit;
            this.LstClientContactLocationMapping.push(_clientContactLocationMapping);
            // }
          });



          clientContact.Id = this.isGuid(this.clientContactForm.get('Id').value) ? 0 : this.clientContactForm.get('Id').value;
          clientContact.ClientID = this.hasClientId
          clientContact.Salutation = this.clientContactForm.get('Salutation').value;
          clientContact.Name = this.clientContactForm.get('Name').value;
          clientContact.Designation = this.clientContactForm.get('Designation').value;
          clientContact.IsSinglePointOfContact = this.clientContactForm.get('IsSinglePointOfContact').value;
          clientContact.LstClientContactLocationMapping = this.LstClientContactLocationMapping;
          clientContact.LstClientContact = _contactDetails;
          clientContact.Modetype = UIMode.None;
          clientContact.Status = 1;
          clientContact.LastUpdatedOn = moment().format('YYYY-MM-DD');
          var inx = _.findIndex(this.clientInfo.LstContact, { Id: this.clientContactForm.value.Id });
          this.clientInfo.LstContact.splice(inx, 1, clientContact);

        }
        else {



          _contactDetails.CommunicationCategoryTypeId = CommunicationCategoryType.Official;
          _contactDetails.PrimaryEmail = this.clientContactForm.get('PrimaryEmail').value;
          _contactDetails.PrimaryMobile = this.clientContactForm.get('PrimaryMobile').value;
          _contactDetails.PrimaryMobileCountryCode = this.clientContactForm.get('PrimaryMobileCountryCode').value;
          const cl = JSON.stringify(this.clientContactForm.get('ClientLocation').value)
          let selectedCls;
          this.LstClientContactLocationMapping = [];
          selectedCls = JSON.parse(cl);
          // selectedCls.forEach(element => {
          // var isext = this.locationLst.find(a => a.ClientLocationId == element);
          // if (isext != null) {

          //   var _clientContactLocationMapping = new ClientContactLocationMapping();
          //   _clientContactLocationMapping.ClientLocationId = isext.ClientLocationId;
          //   _clientContactLocationMapping.ClientContactId = isext.ClientContactId;
          //   _clientContactLocationMapping.Id = isext.Id;
          //   _clientContactLocationMapping.Status = 1;
          //   _clientContactLocationMapping.Modetype = UIMode.Edit;
          //   this.LstClientLocationMapping.push(_clientContactLocationMapping);

          // }
          // else {

          var _clientContactLocationMapping = new ClientContactLocationMapping();
          _clientContactLocationMapping.ClientLocationId = Number(selectedCls)
          _clientContactLocationMapping.ClientContactId = 0;
          _clientContactLocationMapping.Id = 0;
          _clientContactLocationMapping.Status = 1;
          _clientContactLocationMapping.Modetype = UIMode.Edit;
          this.LstClientContactLocationMapping.push(_clientContactLocationMapping);
          // }
          // });



          clientContact.Id = this.isGuid(this.clientContactForm.get('Id').value) ? 0 : this.clientContactForm.get('Id').value;
          clientContact.ClientID = this.hasClientId
          clientContact.Salutation = this.clientContactForm.get('Salutation').value;
          clientContact.Name = this.clientContactForm.get('Name').value;
          clientContact.Designation = this.clientContactForm.get('Designation').value;
          clientContact.IsSinglePointOfContact = this.clientContactForm.get('IsSinglePointOfContact').value;
          clientContact.LstClientContactLocationMapping = this.LstClientContactLocationMapping;
          clientContact.LstClientContact = _contactDetails;
          clientContact.Modetype = UIMode.None;
          clientContact.Status = 1;
          clientContact.LastUpdatedOn = moment().format('YYYY-MM-DD');
          let addr = this.LstClientLocation.find(a => a.Id == selectedCls);
          clientContact.LstClientAddress = addr.ClientLocationAddressdetails;
          this.clientInfo.LstContact.push(clientContact);
        }
        // }



        this.submitted = false;

        this.clientContactForm.reset();
        this.clientContactForm.controls['Client'].setValue(this.hasClientId);
        this.clientContactForm.controls['Id'].setValue(UUID.UUID());
        this.clientContactForm.controls['Status'].setValue(true);
        this.clientContactForm.controls['IsSinglePointOfContact'].setValue(true);
        this.clientContactForm.controls['PrimaryMobileCountryCode'].setValue('91');

        this.clientInfo.LstContact && this.clientInfo.LstContact.length > 0 && this.clientInfo.LstContact.forEach(e1 => {
          e1.Id = this.isGuid(e1.Id) ? 0 : e1.Id;
          e1.Modetype = UIMode.Edit;
        });

        console.log('#001 PLD (2)::', this.clientInfo);


        this.clientModel.newobj = this.clientInfo;
        this.clientservice.putClient(JSON.stringify(this.clientModel)).subscribe((data: apiResponse) => {

          console.log('#001 RES ::', data);
          this.spinner = false;
          if (data.Status) {
            client = data.dynamicObject;
            this.clientInfo = client;
            this.isNewContact = false;
            this.LstClientContact = this.clientInfo.LstContact;
            this.alertService.showSuccess(data.Message);
            this.spinner = false;

          } else {
            this.alertService.showWarning(data.Message);
          }
        });

      } catch (error) {
        console.log('EXE CLOCATION ::', error);
        this.spinner = false;
      }


    }
  }


  ApiCall() {


  }

  // CLIENT LOCATION DETAILS


  createCLReactiveForm() {

    const GSTINRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;


    this.clientLocationForm = this.formBuilder.group({

      Id: [UUID.UUID()],
      Client: [this.hasClientId, Validators.required],
      LocationName: ['', Validators.required],
      LocationCode: ['', [Validators.required, Validators.minLength(2)]],
      LocationType: [null, Validators.required],
      Address: ['', Validators.required],
      Country: [null, Validators.required],
      State: [null, Validators.required],
      City: [null, Validators.required],
      Pincode: ['', [Validators.required, Validators.maxLength(6)]],
      GST: ['', [Validators.pattern(GSTINRegex)]],
      IsPrimaryLocation: [true],
      IsBillingAddress: [true],
      IsShippingAddress: [true],
      StateName: [''],
      CountryName: [''],
      CityName: [''],
      Status: [true, Validators.required],
    })
  }

  mobileNumberLengthRestrict(event: any, formCtrl: any) {
    if (event.target.value.length > 10) {
      formCtrl.setValue(event.target.value.slice(0, 10));
    }
  }


  // master ui of location

  getCountryList(): void {
    this.spinner = true;
    // if (this.CountryList.length == 0) {
    this.clientLocationService.getcountry()
      .subscribe((result) => {
        console.log('result', result);
        this.CountryList = result;
        if (this.CountryList && this.CountryList.length > 0) {
          this.CountryList = _.orderBy(this.CountryList, ["Name"], ["asc"]);

          this.clientLocationForm.patchValue({
            Country: environment.environment.DefaultCountryId_India,
            CountryName: this.CountryList.find(a => a.Id == environment.environment.DefaultCountryId_India).Name,
          });
          this.spinner = false;
          this.getStateList();
        }

      })
    // } else {
    //   this.clientLocationForm.patchValue({
    //     Country: environment.environment.DefaultCountryId_India,
    //     CountryName: this.CountryList.find(a => a.Id == environment.environment.DefaultCountryId_India).Name,
    //   });
    //   this.getStateList();
    // }

  }
  onChangeCountry(item) {
    console.log('Country Ev :', item)
    try {
      this.clientLocationForm.patchValue({
        Country: item.Id,
        CountryName: item.Name,
        State: null,
        StateName: '',
        City: null,
        CityName: ''

      });

      this.StateList = [];
      this.getStateList();
    } catch (error) {
      console.log('#002 COUNTRY EX ::', error);
    }

  }


  getStateList(): void {

    this.clientLocationService.getstate(this.clientLocationForm.value.Country).subscribe((res) => {
      this.StateList = res;
      if (this.StateList && this.StateList.length > 0) {
        this.StateList = this.StateList && this.StateList.length > 0 ? _.orderBy(this.StateList, ["Name"], ["asc"]) : [];
      }

    }), ((err) => {

    })
  }

  onChangeState(item) {

    try {

      this.clientLocationForm.patchValue({
        State: item.Id,
        StateName: item.Name,
        City: null,
        CityName: ''

      });
      this.CityList = [];

      this.getCityList();
    } catch (error) {
      console.log('#002 STATE EX ::', error);
    }

  }


  getCityList() {

    this.clientLocationService.getcity(this.clientLocationForm.value.State).subscribe((res) => {
      this.CityList = res;
      if (this.CityList && this.CityList.length > 0) {
        this.CityList = this.CityList && this.CityList.length > 0 ? _.orderBy(this.CityList, ["Name"], ["asc"]) : [];
      }
    }),
      ((err) => {

      });
  }

  onChangeCity(item) {

    this.clientLocationForm.patchValue({
      City: item.Id,
      CityName: item.Name,
    });

  }

  getMasterName(item, propName) {

    if (propName == 'LocationType') {
      return this.LocationType.find(a => a.Id == item.LocationType).Name;
    }
    if (propName == 'State') {
      return this.StateList.length > 0 ? this.StateList.find(a => a.Id == item.ClientLocationAddressdetails.StateId).Name : '';
    }
    if (propName == 'City') {
      return this.CityList.length > 0 ? this.CityList.find(a => a.Id == item.ClientLocationAddressdetails.CityId).Name : '';
    }
    if (propName == 'Salutation') {


      return this.SalutationType.length > 0 ? this.SalutationType.find(a => a.Id == item.Salutation).Name : '';
    }
    if (propName == 'PrimaryEmail') {
      return this.LstClientContact.length > 0 ? this.LstClientContact.find(a => a.Id == item.Id).LstClientContact.PrimaryEmail : '';
    }
    if (propName == 'PrimaryMobile') {
      return this.LstClientContact.length > 0 ? this.LstClientContact.find(a => a.Id == item.Id).LstClientContact.PrimaryMobile : '';
    }
  }

  public isGuid(stringToTest) {

    if (stringToTest[0] === "{") {
      stringToTest = stringToTest.substring(1, stringToTest.length - 1);
    }
    var regexGuid = /^(\{){0,1}[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}(\}){0,1}$/gi;
    return regexGuid.test(stringToTest);
  }

  doAddNewLocation() {
    this.isNewLocation = true;
  }

  deleteClientLocation(item) {

    this.alertService.confirmSwal1("Confirmation", "Are you sure you want to delete? You won't be able to revert this!", "Yes", "No").then((result) => {

      if (this.isGuid(item.Id)) {
        var index = this.LstClientLocation.indexOf(item);
        if (index !== -1) {
          this.LstClientLocation.splice(index, 1);
        }
      } else {
        this.LstClientLocation.find(a => a.Id == item.Id).Status = 0;
      }

    }).catch(error => {

    });

  }

  editClientLocation(item) {
    console.log('item', item);

    this.clientLocationForm.patchValue({
      Id: item.Id,
      Client: item.ClientID,
      LocationName: item.LocationName,
      LocationCode: item.LocationCode,
      LocationType: item.LocationType,
      Address: item.ClientLocationAddressdetails.Address1,
      Country: item.ClientLocationAddressdetails.CountryId,
      State: item.ClientLocationAddressdetails.StateId,
      City: item.ClientLocationAddressdetails.CityId,
      Pincode: item.ClientLocationAddressdetails.PinCode,
      GST: item.GSTNumber,
      IsPrimaryLocation: item.IsPrimaryLocation,
      IsBillingAddress: item.IsBillingAddress,
      IsShippingAddress: item.IsShippingAddress,
      StateName: item.ClientLocationAddressdetails.StateName,
      CountryName: item.ClientLocationAddressdetails.CountryName,
      CityName: item.ClientLocationAddressdetails.City,
      Status: item.Status,

    });
    this.isNewLocation = true;
  }

  // client contact 

  next() {
    if (this.index == 0) {
      this.createCLReactiveForm();
      this.index = 1;
      this.getCountryList();
      this.LstClientLocation.length > 0 ? this.isNewLocation = false : true;
      return
    }

    if (this.index == 1 && this.clientInfo && this.clientInfo.LstClientLocation && this.clientInfo.LstClientLocation.length == 0) {
      this.alertService.showWarning('You must be added to one client location and try to move forward');
      return;
    }
    this.index = 2;
    this.createCCReactiveForm();
  }

  createCCReactiveForm() {

    this.clientContactForm = this.formBuilder.group({

      Id: [UUID.UUID()],
      Client: [this.hasClientId, Validators.required],
      ClientLocation: ['', Validators.required],
      Salutation: [null, Validators.required],
      Name: ['', [Validators.required, Validators.minLength(2)]],
      Designation: [null, Validators.required],
      PrimaryMobile: ['', Validators.required],
      PrimaryEmail: [null, Validators.required],
      PrimaryMobileCountryCode: ['91', Validators.required],
      Status: [true, Validators.required],
      IsSinglePointOfContact: [true],

    })
  }

  deleteClientContact(item) {

    this.alertService.confirmSwal1("Confirmation", "Are you sure you want to delete? You won't be able to revert this!", "Yes", "No").then((result) => {

      if (this.isGuid(item.Id)) {
        var index = this.LstClientContact.indexOf(item);
        if (index !== -1) {
          this.LstClientContact.splice(index, 1);
        }
      } else {
        this.LstClientContact.find(a => a.Id == item.Id).Status = 0;
      }

    }).catch(error => {

    });

  }

  editClientContact(item) {

    var CL = []
    if (item.LstClientContactLocationMapping != null) {
      item.LstClientContactLocationMapping.forEach(e1 => {
        CL.push(e1.ClientLocationId)
        // this.LstClientLocation.push({
        //   Id: e1.Id, 
        //   ClientLocationId: e1.ClientLocationId
        //   , ClientContactId: e1.ClientContactId
        // })

      });
    }
    this.clientContactForm.patchValue({
      Id: item.Id,
      Client: item.ClientID,
      ClientLocation: CL,
      Salutation: item.Salutation,
      Name: item.Name,
      Designation: item.Designation,
      PrimaryMobile: item.LstClientContact.PrimaryMobile,
      PrimaryEmail: item.LstClientContact.PrimaryEmail,
      PrimaryMobileCountryCode: item.LstClientContact.PrimaryMobileCountryCode,
      Status: item.Status,
      IsSinglePointOfContact: item.IsSinglePointOfContact,
    });

    this.isNewContact = true;
  }


  doAddNewContact() {
    this.isNewContact = true;
  }

  previous() {

    this.index == 2 ? this.index = 1 : this.index == 1 ? this.index = 0 : true;

  }
}
