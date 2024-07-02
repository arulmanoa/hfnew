import { Component, OnInit, EventEmitter, Input, Output, ViewChild, TemplateRef, ElementRef } from '@angular/core';

import { FormGroup, FormBuilder, FormControl, Validators, AbstractControl } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { enumHelper } from 'src/app/shared/directives/_enumhelper';
import * as _ from 'lodash';

import { AddressDetails, CommunicationCategoryType } from 'src/app/_services/model/Communication/CommunicationType';
import { CommunicationInfo, CityList, CountryList, StateList } from 'src/app/_services/model/OnBoarding/CommunicationInfo';
import { AlertService, EmployeeService, ESSService, HeaderService, SessionStorage } from 'src/app/_services/service';
import { EmployeeDetails } from 'src/app/_services/model/Employee/EmployeeDetails';
import { LoginResponses } from 'src/app/_services/model';
import { EmployeeModel } from 'src/app/_services/model/Employee/EmployeeModel';
import { UIMode } from 'src/app/_services/model/Common/BaseModel';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { UIBuilderService } from 'src/app/_services/service/UIBuilder.service';

@Component({
  selector: 'app-mycommunications',
  templateUrl: './mycommunications.component.html',
  styleUrls: ['./mycommunications.component.css']
})
export class MycommunicationsComponent implements OnInit {
  // DATA COMMUNICATION B/W TWO COMPONENTS
  @Input() employeedetails: EmployeeDetails;
  @Input() CommunicationListGrp: CommunicationInfo;
  @Output() communicationChangeHandler = new EventEmitter();

  // ** forms on submit validation ** //
  submitted = false;
  disableBtn = false;
  spinner: boolean = true;

  // REACTIVE FORM 
  employeeForm: FormGroup;

  // GENERAL DECL.
  // GENERAL DECL.
  isESSLogin: boolean = false;
  EmployeeId: number = 0;
  _loginSessionDetails: LoginResponses;
  CompanyId: any = 0;
  UserId: any = 0;
  RoleId: any = 0;
  RoleCode: any;
  ImplementationCompanyId: any = 0;
  BusinessType: any = 0;

  clientLogoLink: any;
  clientminiLogoLink: any;
  employeeModel: EmployeeModel = new EmployeeModel();

  // COMMUNICATION 
  // CommunicationListGrp: CommunicationInfo;
  CountryList: CountryList[] = [];
  StateList: StateList[] = [];
  StateList1: StateList[] = [];
  StateList2: StateList[] = [];
  isSameAddress = false;
  MenuId: any;
  Addressdetails = [];
  countryCode: any = '91';
  emergencyContactPersonName: string;
  emergencyContactNumber: number;
  @Input() NotAccessibleFields = [];
  
  CityList: CityList[] = [];
  CityList1:CityList[] = [];


  constructor(
    private formBuilder: FormBuilder,
    private utilsHelper: enumHelper,
    private headerService: HeaderService,
    private titleService: Title,
    public essService: ESSService,
    private sessionService: SessionStorage,
    private UIBuilderService: UIBuilderService,
    private employeeService: EmployeeService

  ) {
    this.createReactiveForm();
  }

  get g() { return this.employeeForm.controls; } // reactive forms validation 



  createReactiveForm() {
    this.isESSLogin = true;
    this.employeeForm = this.formBuilder.group({

      //COMMUNICATION
      permanentCommunicationCategoryTypeId: [''],
      permanentAddressdetails: ['', Validators.required],
      permanentAddressdetails1: [''],
      permanentAddressdetails2: [''],
      permanentStateName: [null, Validators.required],
      permanentCountryName: [null, Validators.required],
      permanentPincode: ['', Validators.required],
      permanentCity: ['', Validators.required],
      presentCommunicationCategoryTypeId: [''],
      presentAddressdetails: ['', Validators.required],
      presentAddressdetails1: [''],
      presentAddressdetails2: [''],
      presentStateName: [null, Validators.required],
      presentCountryName: [null, Validators.required],
      presentPincode: ['', Validators.required],
      presentCity: ['', Validators.required],
      emergencyContactnumber: [''],
      emergencyContactPersonName: ['']

    });
  }

  ngOnInit() {
    this.doRefresh();
    this.employeeForm.valueChanges.subscribe(() => {
      this.subscribeEmitter();
    });
  }

  doRefresh() {
    this.spinner = true;
    this._loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses)); // Get the whole matched session element set as a clean json(array) via an session object
    this.UserId = this._loginSessionDetails.UserSession.UserId; // Return just the one element from the set - userid
    this.CompanyId = this._loginSessionDetails.Company.Id; // bind Logged user id may be change baed on dashboard 
    this.ImplementationCompanyId = this._loginSessionDetails.ImplementationCompanyId; // bind Logged user id may be change baed on dashboard 
    this.RoleId = this._loginSessionDetails.UIRoles[0].Role.Id; // bind Logged user id may be change baed on dashboard 
    this.RoleCode = this._loginSessionDetails.UIRoles[0].Role.Code;
    this.EmployeeId = this._loginSessionDetails.EmployeeId;
    this.clientLogoLink = 'logo.png';
    this.BusinessType = this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping != null ? this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this._loginSessionDetails.Company.Id).BusinessType : 0;
    let mode = 2; // add-1, edit-2, view, 3   
    this.MenuId = (this.sessionService.getSessionStorage("MenuId")); // need to implement it in feature
    try {
      this.UIBuilderService.doApply(mode, this, this.MenuId, "");

    } catch (error) {
      console.log('UI BUILDER ::', error);

    }
    if (this.RoleCode.toUpperCase() == 'EMPLOYEE') {
      this.isESSLogin = true;
      sessionStorage.removeItem('_StoreLstinvestment');
      sessionStorage.removeItem('_StoreLstDeductions');
      sessionStorage.removeItem("_StoreLstinvestment_Deleted");
      sessionStorage.removeItem("_StoreLstDeductions_Deleted");
      if (this.CommunicationListGrp == undefined) {
        this.getMasterInfo();           
      } else {
        this.patchEmployeeForm();    
        this.dataMapping();
      }
   
    } else {
      this.isESSLogin = false;
      this.EmployeeId = this.employeedetails != null ? this.employeedetails.Id : 0;
      if (this.CommunicationListGrp == undefined) {
        this.getMasterInfo();           
      } else {
        this.patchEmployeeForm();    
        this.dataMapping();
      }
    }



  }
  patchEmployeeForm() {

    this.employeeService.getActiveTab(false);
    try {
      console.log('CommunicationListGrp ', this.CommunicationListGrp);

      if (this.employeedetails != null) {

     

        // For Candidate Communication accordion  (Edit)
        if (this.employeedetails.EmployeeCommunicationDetails != null) {
          let _addressDetails: AddressDetails[] = [];
          _addressDetails = this.employeedetails.EmployeeCommunicationDetails.LstAddressdetails;

          if (this.BusinessType === 1 || this.BusinessType === 2) {
            const contactDetails = this.employeedetails.EmployeeCommunicationDetails.LstContactDetails;
            try {
              contactDetails.forEach(el => {
                if (el.CommunicationCategoryTypeId == 3) {
                  this.employeeForm.controls['emergencyContactnumber'] != null ? this.employeeForm.controls['emergencyContactnumber'].setValue((Number(el.EmergencyContactNo) == Number(0) || el.EmergencyContactNo == null) ? null : (Number(el.EmergencyContactNo))) : null;
                  this.employeeForm.controls['emergencyContactPersonName'] != null ? this.employeeForm.controls['emergencyContactPersonName'].setValue(el.EmergencyContactPersonName) : null;
                }
              });
            }
            catch (error) { console.log('catch error-> employee details', error); }
          }
          try {
            _addressDetails.forEach(element => {

              var result = typeof element.CountryName === 'string' ? (this.CommunicationListGrp != null && this.CommunicationListGrp.CountryList.length > 0 &&
                this.CommunicationListGrp.CountryList.find(a => a.Name.toUpperCase() == element.CountryName.toUpperCase()) != undefined ? this.CommunicationListGrp.CountryList.find(a => a.Name.toUpperCase() == element.CountryName.toUpperCase()).Id : element.CountryName)
                : (Number(element.CountryName) == Number(0) || element.CountryName == null) ? null : (Number(element.CountryName));

              var resultStateId = typeof element.StateName === 'string' ? (this.CommunicationListGrp != null && this.CommunicationListGrp.StateList.length > 0 &&
                this.CommunicationListGrp.StateList.find(a => a.Name.toUpperCase() == element.StateName.toUpperCase()) != undefined ? this.CommunicationListGrp.StateList.find(a => a.Name.toUpperCase() == element.StateName.toUpperCase()).Id : element.StateName)
                : (Number(element.StateName) == Number(0) || element.StateName == null) ? null : (Number(element.StateName));

                var resultCity = typeof element.City === 'string' ? (this.CommunicationListGrp != null && this.CommunicationListGrp.CityList.length > 0 &&
                  this.CommunicationListGrp.CityList.find(a => a.Name.toUpperCase() == element.City.toUpperCase()) != undefined ? this.CommunicationListGrp.CityList.find(a => a.Name.toUpperCase() == element.City.toUpperCase()).Id : element.City)
                  : (Number(element.City) == Number(0) || element.City == null) ? null : (Number(element.City));
                  console.log('resultCity', resultCity);
              console.log('resultStateId', resultStateId);
              console.log('result', result);
              console.log('this.CommunicationListGrp', this.CommunicationListGrp);

              if (element.CommunicationCategoryTypeId == CommunicationCategoryType.Present) {

                this.employeeForm.controls['presentAddressdetails'] != null ? this.employeeForm.controls['presentAddressdetails'].setValue(element.Address1) : null;
                this.employeeForm.controls['presentAddressdetails1'] != null ? this.employeeForm.controls['presentAddressdetails1'].setValue(element.Address2) : null;
                this.employeeForm.controls['presentAddressdetails2'] != null ? this.employeeForm.controls['presentAddressdetails2'].setValue(element.Address3) : null;
                // this.employeeForm.controls['presentCountryName'] != null ? this.employeeForm.controls['presentCountryName'].setValue(result) : null;
                this.employeeForm.controls['presentCountryName'].setValue(Number(result));
                this.employeeForm.controls['presentPincode'] != null ? this.employeeForm.controls['presentPincode'].setValue(element.PinCode) : null;
                this.employeeForm.controls['presentStateName'] != null ? this.employeeForm.controls['presentStateName'].setValue(Number(resultStateId)) : null;
                this.employeeForm.controls['presentCity'] != null ? this.employeeForm.controls['presentCity'].setValue(Number(resultCity) == 0? null : Number(resultCity)) : null;
              }
              if (element.CommunicationCategoryTypeId == CommunicationCategoryType.Permanent) {
                this.employeeForm.controls['permanentAddressdetails'] != null ? this.employeeForm.controls['permanentAddressdetails'].setValue(element.Address1) : null;
                this.employeeForm.controls['permanentAddressdetails1'] != null ? this.employeeForm.controls['permanentAddressdetails1'].setValue(element.Address2) : null;
                this.employeeForm.controls['permanentAddressdetails2'] != null ? this.employeeForm.controls['permanentAddressdetails2'].setValue(element.Address3) : null;
                // this.employeeForm.controls['permanentCountryName'] != null ? 
                this.employeeForm.controls['permanentCountryName'].setValue(Number(result))
                // : null;
                this.employeeForm.controls['permanentPincode'] != null ? this.employeeForm.controls['permanentPincode'].setValue(element.PinCode) : null;
                this.employeeForm.controls['permanentStateName'] != null ? this.employeeForm.controls['permanentStateName'].setValue(Number(resultStateId)) : null;
                this.employeeForm.controls['permanentCity'] != null ? this.employeeForm.controls['permanentCity'].setValue( Number(resultCity) == 0? null : Number(resultCity)) : null;
              }

              console.log('this.CommunicationListGrp', Number(this.employeeForm.controls.permanentCountryName.value));
            });

          }
          catch (error) {
            console.log('error communication mapping :', error);
           }
        }
       
      }
      this.spinner = false;
    } catch (error) {
      this.spinner = false;
      console.log('AN EXCEPTION OCCURRED WHILE GETTING MY PROFILE DETAILS :', error);

    }

  }

  getMasterInfo() {

    this.essService.Common_GetEmployeeAccordionDetails(this.employeedetails, 'isCommunicationdetails').then((Result) => {
      this.CommunicationListGrp = Result as any;
      try {
        this.patchEmployeeForm();    
        this.dataMapping();
      } catch (error) {
        console.log('EX GET COMMUNICATION INFO :', error);

      }

    });
  }

  dataMapping() {

    this.CountryList = _.orderBy(this.CommunicationListGrp.CountryList, ["Name"], ["asc"]);
    let countryEventId = (this.employeeForm.get('presentCountryName').value == null || this.employeeForm.get('presentCountryName').value == 0 ? null : this.employeeForm.get('presentCountryName').value);
    let countryEvent1Id = (this.employeeForm.get('permanentCountryName').value == null || this.employeeForm.get('permanentCountryName').value == 0 ? null : this.employeeForm.get('permanentCountryName').value);
    this.StateList = _.orderBy(_.filter(this.CommunicationListGrp.StateList, (a) => a.CountryId == Number(countryEventId)), ["Name"], ["asc"]);
    this.StateList1 = _.orderBy(_.filter(this.CommunicationListGrp.StateList, (a) => a.CountryId === Number(countryEvent1Id)), ["Name"], ["asc"]);
    this.StateList2 = _.orderBy(_.filter(this.CommunicationListGrp.StateList, (a) => a.CountryId == Number(countryEventId)), ["Name"], ["asc"]);

    let stateEventId = (this.employeeForm.get('presentStateName').value == null || this.employeeForm.get('presentStateName').value == 0 ? null : this.employeeForm.get('presentStateName').value);
    let stateEvent1Id = (this.employeeForm.get('permanentStateName').value == null || this.employeeForm.get('permanentStateName').value == 0 ? null : this.employeeForm.get('permanentStateName').value);
    this.CityList = _.orderBy(_.filter(this.CommunicationListGrp.CityList, (a) => a.StateId == Number(stateEventId)),["Name"], ["asc"]);
    this.CityList1 = _.orderBy(_.filter(this.CommunicationListGrp.CityList, (a) => a.StateId == Number(stateEvent1Id)), ["Name"],["asc"]);
  }

  onchangecountry(country) {
    this.employeeForm.controls['statename'].setValue(null);
    this.StateList2 = _.orderBy(_.filter(this.CommunicationListGrp.StateList, (a) => a.CountryId === country.Id), ["Name"], ["asc"]);

  }
  onChangeStateByCountryId(country) {

    this.employeeForm.controls['presentStateName'].setValue(null);
    this.StateList = _.orderBy(_.filter(this.CommunicationListGrp.StateList, (a) => a.CountryId === country.Id), ["Name"], ["asc"]);


  }
  onChangeStateByCountryId1(country) {
    this.employeeForm.controls['permanentStateName'].setValue(null);
    this.StateList1 = _.orderBy(_.filter(this.CommunicationListGrp.StateList, (a) => a.CountryId === country.Id), ["Name"], ["asc"]);

  }

  onChangeCityByStateId(state){
    this.employeeForm.controls['presentCity'].setValue(null);
    this.CityList = _.orderBy(_.filter(this.CommunicationListGrp.CityList, (a) => a.StateId === state.Id), ['Name'], ['asc']);
  }
  onChangeCityByStateId1(state){
    this.employeeForm.controls['permanentCity'].setValue(null);
    this.CityList1 = _.orderBy(_.filter(this.CommunicationListGrp.CityList, (a) => a.StateId === state.Id),['Name'],['asc']);
  }

  public onSameAddressPresentChanged(value: boolean) {

    this.isSameAddress = value;

    if (this.isSameAddress) {

      this.employeeForm.controls['permanentAddressdetails'] != null ? this.employeeForm.controls['permanentAddressdetails'].setValue(this.employeeForm.get('presentAddressdetails').value) : null;
      this.employeeForm.controls['permanentAddressdetails1'] != null ? this.employeeForm.controls['permanentAddressdetails1'].setValue(this.employeeForm.get('presentAddressdetails1').value) : null;
      this.employeeForm.controls['permanentAddressdetails2'] != null ? this.employeeForm.controls['permanentAddressdetails2'].setValue(this.employeeForm.get('presentAddressdetails2').value) : null;
      this.employeeForm.controls['permanentCountryName'] != null ? this.employeeForm.controls['permanentCountryName'].setValue(this.employeeForm.get('presentCountryName').value) : null;
      this.employeeForm.controls['permanentPincode'] != null ? this.employeeForm.controls['permanentPincode'].setValue(this.employeeForm.get('presentPincode').value) : null;
      this.StateList1 = _.orderBy(_.filter(this.CommunicationListGrp.StateList, (a) => a.CountryId === this.employeeForm.get('presentCountryName').value), ["Name"], ["asc"]);
      this.employeeForm.controls['permanentStateName'] != null ? this.employeeForm.controls['permanentStateName'].setValue(this.employeeForm.get('presentStateName').value) : null;
      this.employeeForm.controls['permanentCity'] != null ? this.employeeForm.controls['permanentCity'].setValue(this.employeeForm.get('presentCity').value) : null;

      this.CityList1 = _.orderBy(_.filter(this.CommunicationListGrp.CityList, (a) => a.StateId === this.employeeForm.get('presentStateName').value),['Name'], ['asc']);

    } else {


      this.employeeForm.controls['permanentAddressdetails'] != null ? this.employeeForm.controls['permanentAddressdetails'].setValue(null) : null;
      this.employeeForm.controls['permanentAddressdetails1'] != null ? this.employeeForm.controls['permanentAddressdetails1'].setValue(null) : null;
      this.employeeForm.controls['permanentAddressdetails2'] != null ? this.employeeForm.controls['permanentAddressdetails2'].setValue(null) : null;
      this.employeeForm.controls['permanentCountryName'] != null ? this.employeeForm.controls['permanentCountryName'].setValue(null) : null;
      this.employeeForm.controls['permanentStateName'] != null ? this.employeeForm.controls['permanentStateName'].setValue(null) : null;
      this.employeeForm.controls['permanentPincode'] != null ? this.employeeForm.controls['permanentPincode'].setValue(null) : null;
      this.employeeForm.controls['permanentCity'] != null ? this.employeeForm.controls['permanentCity'].setValue(null) : null;

      this.StateList1 = [];
      this.CityList1 = [];
    }
  }



  EmitHandler() {
    this.Addressdetails = [];
    if (this.employeedetails.EmployeeCommunicationDetails == null) {
      var _Communication = {
        Id: 0,
        EmployeeId: this.EmployeeId,
        CandidateId: 0,
        EntityType: { Id: 0, Name: '' },
        EntityId: 0,
        AddressDetails: '',
        ContactDetails: '',
        LstAddressdetails: [],
        LstContactDetails: [],
        IsEditable: true,
        Modetype: UIMode.Edit,
      }
      this.employeedetails.EmployeeCommunicationDetails = _Communication;
      this.employeedetails.EmployeeCommunicationDetails.LstContactDetails = [];
      this.employeedetails.EmployeeCommunicationDetails.LstContactDetails.push({
        PrimaryMobile: this.employeeForm.get('mobile').value,
        PrimaryEmail: this.employeeForm.get('email').value,
        CommunicationCategoryTypeId: CommunicationCategoryType.Personal,
        PrimaryMobileCountryCode: "+91",
        AlternateMobile: '',
        AlternateMobileCountryCode: '',
        AlternateEmail: '',
        EmergencyContactNo: this.BusinessType === 2 ? '' : this.employeeForm.get('emergencyContactnumber').value,
        EmergencyContactNoCountryCode: "91",
        EmergencyContactPersonName: this.BusinessType === 2 ? '' : this.employeeForm.get('emergencyContactPersonName').value,
        LandlineStd: '',
        LandLine: '',
        LandLineExtension: '',
        PrimaryFax: '',
        AlternateFax: '',
        IsDefault: true
      })

    } else {
      if (this.BusinessType === 1 || this.BusinessType === 3) {
        this.employeedetails.EmployeeCommunicationDetails.LstContactDetails[0].EmergencyContactNo = this.employeeForm.get('emergencyContactnumber').value;
        this.employeedetails.EmployeeCommunicationDetails.LstContactDetails[0].EmergencyContactNoCountryCode = "91";
        this.employeedetails.EmployeeCommunicationDetails.LstContactDetails[0].EmergencyContactPersonName = this.employeeForm.get('emergencyContactPersonName').value;
      }
      // this.employeedetails.EmployeeCommunicationDetails.LstContactDetails[0].PrimaryMobile = this.employeeForm.get('mobile').value;
      // this.employeedetails.EmployeeCommunicationDetails.LstContactDetails[0].PrimaryEmail = this.employeeForm.get('email').value;

    }


    this.Addressdetails.push({
      CommunicationCategoryTypeId: CommunicationCategoryType.Present,
      Address1: this.employeeForm.get('presentAddressdetails').value,
      Address2: this.employeeForm.get('presentAddressdetails1').value,
      Address3: this.employeeForm.get('presentAddressdetails2').value,
      CountryName: this.employeeForm.get('presentCountryName').value,
      StateName: this.employeeForm.get('presentStateName').value,
      City: this.CityList && this.CityList.length > 0 && this.CityList.filter(a=>a.Id == this.employeeForm.get('presentCity').value).length > 0 ?  this.CityList.filter(a=>a.Id == this.employeeForm.get('presentCity').value)[0].Name : "",
      PinCode: this.employeeForm.get('presentPincode').value,
      CountryId: 0,
      CityId: this.employeeForm.get('presentCity').value == null || this.employeeForm.get('presentCity').value == "" ? 0 : this.employeeForm.get('presentCity').value,
      StateId: 0,
      DistrictId: 0,

    })
    this.Addressdetails.push({
      CommunicationCategoryTypeId: CommunicationCategoryType.Permanent,
      Address1: this.employeeForm.get('permanentAddressdetails').value,
      Address2: this.employeeForm.get('permanentAddressdetails1').value,
      Address3: this.employeeForm.get('permanentAddressdetails2').value,
      CountryName: this.employeeForm.get('permanentCountryName').value,
      StateName: this.employeeForm.get('permanentStateName').value,
      City:this.CityList && this.CityList.length > 0 && this.CityList.filter(a=>a.Id == this.employeeForm.get('permanentCity').value).length > 0 ?  this.CityList.filter(a=>a.Id == this.employeeForm.get('permanentCity').value)[0].Name : "",
      PinCode: this.employeeForm.get('permanentPincode').value,
      CountryId: 0,
      CityId: this.employeeForm.get('permanentCity').value == null || this.employeeForm.get('permanentCity').value == "" ? 0 : this.employeeForm.get('permanentCity').value,
      StateId: 0,
      DistrictId: 0,

    });

    console.log('da', this.Addressdetails);

    this.employeedetails.EmployeeCommunicationDetails.LstAddressdetails = this.Addressdetails;
    this.employeedetails.EmployeeCommunicationDetails.Modetype = UIMode.Edit;

  }

  ngOnDestroy() {
    // if (this.isESSLogin == false) {
    // alert('sss')
    console.log('communic alert noti', this.employeedetails);

    this.subscribeEmitter();
    // }

  }
  subscribeEmitter() {
    this.EmitHandler();
    this.communicationChangeHandler.emit(this.employeedetails);

  }

  disableFormControls() {
    for (const field of this.NotAccessibleFields) {     
      if (this.employeeForm.get(field)) {
        this.employeeForm.get(field).disable();
      }
    }
  }




}
