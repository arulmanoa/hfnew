import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { UUID } from 'angular2-uuid';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { Person } from 'src/app/_services/model/Migrations/Transition';
import { LoginUserDetails, UserCompanyClientMapping } from 'src/app/_services/model/OnBoarding/LoginUserDetails';
import { AlertService, ESSService, OnboardingService, PagelayoutService, SessionStorage } from 'src/app/_services/service';
import { LoginResponses, UIMode, UserCompanyAppliationRole, UserStatus, UserType } from 'src/app/_services/model';
import moment from 'moment';
import { apiResult } from 'src/app/_services/model/apiResult';
import { ApiResponse } from 'src/app/_services/model/Common/BaseModel';
import { DataSource, SearchElement } from 'src/app/views/personalised-display/models';
import { DataSourceType } from 'src/app/views/personalised-display/enums';

export interface ClientMappingTable {
  ClientCode: string;
  ClientName: string;
  ClientContractName: string;
  IsActive: boolean;
  Id: number | string;
  IsDefault: boolean
  ClientId: number;
  ClientContractId: number;
  CompanyId: number;
  Settings: number;
  UserId: number;
}
@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {

  @Input() rowData;
  userForm: FormGroup;
  submitted = false;
  loginSessionDetails: LoginResponses;
  existingUserDetailsObject: LoginUserDetails = new LoginUserDetails();
  person = new Person();
  userCompanyAppliationRole: UserCompanyAppliationRole[] = [];
  UserCompanyClientMappings: UserCompanyClientMapping[] = [];
  LstRoles = [];
  LstClient_ClientContract = [];
  LstClientMapping_tbl: ClientMappingTable[] = [];
  LstClientMapping_Existing: ClientMappingTable[] = [];
  spinnerText: string = "Loading";

  selectedClient;
  isLoading: boolean = false;
  isFailedForValidation: boolean = false;
  FailedProcessMessage: string = '';
  constructor(
    private activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private onboardingService: OnboardingService,
    public sessionService: SessionStorage,
    public pageLayoutService: PagelayoutService,
    public essService: ESSService,
    private alertService: AlertService

  ) {
    this.createForm();
  }

  get g() { return this.userForm.controls; } // reactive forms validation 

  createForm() {


    this.userForm = this.formBuilder.group({
      Id: [UUID.UUID()],
      FirstName: ['', Validators.required],
      PrimaryMobile: ['', Validators.required],
      PrimaryEmail: ['', Validators.required],
      FatherName: [''],
      DOB: ['', Validators.required],
      UserName: ['', Validators.required],
      Password: [''],
      Role: ['', Validators.required],
      Clients: [null, Validators.required]
    });

  }

  ngOnInit() {
    console.log('rowData', this.rowData);


    this.isLoading = true;
    this.loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses));
    this.getDemandedData().then((callback) => {

      if (this.rowData) {
        this.GetLoginUserDetailsByUserId();
      }

    });





  }

  getDemandedData() {
    const pro = new Promise((res, rej) => {

      try {

        this.userForm.disable();
        this.LstRoles = [];
        this.LstClient_ClientContract = [];
        // Compnay Applicant Role By Company id

        let datasource: DataSource = {
          Name: "GetCompanyApplicationRole",
          Type: DataSourceType.SP,
          IsCoreEntity: false
        }
        let searctElements: SearchElement[] = [
          {
            FieldName: "@CompanyId",
            Value: this.loginSessionDetails.Company.Id
          },
        ];
        this.pageLayoutService.getDataset(datasource, searctElements).subscribe((role_res) => {
          if (role_res.Status && role_res.dynamicObject != null && role_res.dynamicObject != '') {
            let apiResult = JSON.parse(role_res.dynamicObject);

            this.LstRoles = apiResult == null || apiResult == "" ? [] : apiResult;

          } else {

          }
        });


        // Client and Client Contract By Company id

        let datasource1: DataSource = {
          Name: "GetClientAndClientContractList",
          Type: DataSourceType.SP,
          IsCoreEntity: false
        }
        let searctElements1: SearchElement[] = [
          {
            FieldName: "@companyId",
            Value: this.loginSessionDetails.Company.Id
          },
        ];
        this.pageLayoutService.getDataset(datasource1, searctElements1).subscribe((cc_res) => {
          this.isLoading = false;
          if (cc_res.Status && cc_res.dynamicObject != null && cc_res.dynamicObject != '') {
            let apiResult = JSON.parse(cc_res.dynamicObject);
            this.LstClient_ClientContract = apiResult == null || apiResult == "" ? [] : apiResult;
            console.log('ddddd', this.LstClient_ClientContract)
          } else {

          }
          res(true);
        });

        this.userForm.enable();

      } catch (error) {
      }
    })
    return pro;
  }

  GetLoginUserDetailsByUserId() {

    this.isLoading = true;
    this.onboardingService.GetLoginUserDetails(this.rowData.Id).subscribe((result) => {
      let jObject: apiResult = result;
      console.log('sssssss ::::::::::::::::::', result);
      console.log('jObject ::::::::::::::::::', jObject);

      this.existingUserDetailsObject = jObject.Result as any;
      console.log('RS :::::::::::', this.existingUserDetailsObject
      );
      if (this.existingUserDetailsObject == undefined) {
        this.existingUserDetailsObject = null;
      }

      try {


        if (this.existingUserDetailsObject != null) {
          if (this.existingUserDetailsObject.Person != null) {
            this.userForm.controls['FirstName'].setValue(this.existingUserDetailsObject.Person.FirstName);
            this.userForm.controls['PrimaryMobile'].setValue(this.existingUserDetailsObject.Person.PrimaryMobile);
            this.userForm.controls['PrimaryEmail'].setValue(this.existingUserDetailsObject.Person.PrimaryEmail);
            this.userForm.controls['FatherName'].setValue(this.existingUserDetailsObject.Person.FatherName);
            this.userForm.controls['DOB'].setValue(this.existingUserDetailsObject.Person.DOB);

          }
          this.userForm.controls['UserName'].setValue(this.existingUserDetailsObject.UserName);
          // this.existingUserDetailsObject.Person != null ? this.userForm.patchValue(this.existingUserDetailsObject.Person) : true;
          this.existingUserDetailsObject.Person != null ? this.person = this.existingUserDetailsObject.Person : true;

          if (this.existingUserDetailsObject.UserCompanyAppliationRoles != null && this.existingUserDetailsObject.UserCompanyAppliationRoles.length > 0) {
            this.userCompanyAppliationRole = this.existingUserDetailsObject.UserCompanyAppliationRoles;
            var existingRoles = [];
            var existingClients = [];
            this.userCompanyAppliationRole.forEach(e => {
              existingRoles.push(e.CompanyApplicationRoleId);
            });
            existingRoles.length > 0 ? this.userForm.controls['Role'].setValue(existingRoles) : true;
          }

          if (this.existingUserDetailsObject.UserCompanyClientMappings != null && this.existingUserDetailsObject.UserCompanyClientMappings.length > 0) {
            this.UserCompanyClientMappings = this.existingUserDetailsObject.UserCompanyClientMappings;
            this.UserCompanyClientMappings.forEach(ele => {

              let ClientContractObject = ele.ClientContractId == 0 ? this.LstClient_ClientContract.find(a => a.ClientId == ele.ClientId) : this.LstClient_ClientContract.find(a => a.ClientId == ele.ClientId && a.ClientContractId == ele.ClientContractId);
              this.LstClientMapping_Existing.push({
                ClientCode: ClientContractObject.ClientCode,
                ClientName: ClientContractObject.ClientName,
                ClientContractName: ClientContractObject.ClientContractName,
                IsActive: ele.IsActive,
                Id: ele.Id,
                IsDefault: ele.IsDefault,
                ClientId: ClientContractObject.ClientId,
                ClientContractId: ClientContractObject.ClientContractId,
                CompanyId: ele.CompanyId,
                Settings: null,
                UserId: ele.UserId
              });

              if (ele.IsActive == true) {
                existingClients.push(ele.ClientId);
              }

            });

            existingClients.length > 0 ? this.userForm.controls['Clients'].setValue(existingClients) : true;


          }

        }
      } catch (err) {

        console.log('eeeeee', err);

      }
      this.isLoading = false;

    }, error => {

    })
  }


  onChangeClient(event): void {

    try {
      
    
    console.log(event);
    this.selectedClient = event;
    this.LstClientMapping_tbl = [];
    if (event != null && event.length > 0) {
      event.forEach(element => {

        if (this.LstClientMapping_tbl.find(a => a.ClientContractId == element.ClientContractId) == undefined) {
          this.LstClientMapping_tbl.push({
            ClientCode: element.ClientCode,
            ClientName: element.ClientName,
            ClientContractName: element.ClientContractName,
            IsActive: true,
            Id: UUID.UUID(),
            IsDefault: false,
            ClientId: element.ClientId,
            ClientContractId: element.ClientContractId,
            CompanyId: this.loginSessionDetails.Company.Id,
            Settings: null,
            UserId: 0
          });
        } else if (this.LstClientMapping_Existing.find(a => a.ClientContractId == element.ClientContractId) != undefined) {

          var exists = this.LstClientMapping_Existing.find(a => a.ClientContractId == element.ClientContractId);
          exists.IsActive = false;
        }
      });
    }
    
    if (event.length == 0) {

      this.LstClientMapping_tbl.length > 0 ? this.LstClientMapping_tbl = [] : true;

      this.LstClientMapping_Existing.length > 0 && this.LstClientMapping_Existing.forEach(elmt => {
        elmt.IsActive = false;
      });
    }

  } catch (error) {
        console.log('ddd', error);
        
  }

    //   this.selectedClient.forEach(it => {

    // });
    //    var index = this.LstClientMapping_tbl.map(function (el) {
    //                 return el.ClientContractId
    //               }).indexOf(this.approvalForm.get('ObjectStorageId').value)

    //               this.unsavedDocumentLst.splice(index, 1)



  }

  deleteItem(item) {
    const indx = this.LstClientMapping_tbl.findIndex(v => v.Id === item.Id);
    this.LstClientMapping_tbl.splice(indx, 1);

    const indx1 = this.selectedClient.findIndex(v => v.ClientContractId === item.ClientContractId);
    this.selectedClient.splice(indx1, 1);

  }
  onChangeIsDefault(event, item) {
    console.log('ss', item);

    this.LstClientMapping_tbl.forEach(e => {
      if (this.essService.isGuid(e.Id) == true) {
        if (e.Id == item.Id && event.target.checked) {
          e.IsDefault = true
        } else {
          e.IsDefault = false
        }
      } else {
        e.IsActive = false;
        e.IsDefault = false;
      }


    });


  }

  onSave() {

    this.submitted = true;
    this.FailedProcessMessage = '';
    this.isFailedForValidation = false;
    console.log(this.userForm.value.Clients);

    if (this.userForm.invalid) {
      this.isFailedForValidation = true;
      this.FailedProcessMessage = "( * ) Denotes required field. Please check the form and save again.";
      return;
    }

    let isDefaultClientExits: boolean = false;

    if (this.LstClientMapping_tbl.length > 0 && this.LstClientMapping_tbl.filter(a => a.IsDefault == true && a.IsActive).length > 0) {
      isDefaultClientExits = true;
    }
    if (this.LstClientMapping_Existing.length > 0 && this.LstClientMapping_Existing.filter(a => a.IsDefault == true && a.IsActive).length > 0) {
      isDefaultClientExits = true;

    }
    if (this.LstClientMapping_tbl.length == 0 && (this.LstClientMapping_Existing.length == 0 || this.LstClientMapping_Existing.filter(a => a.IsActive).length == 0)) {
      this.isFailedForValidation = true;
      this.FailedProcessMessage = "Client Mapping :) At least one default client mapping is required";
      return;

    }

    if (isDefaultClientExits == false) {
      this.isFailedForValidation = true;
      this.FailedProcessMessage = "Client Mapping :) There must be at least one default checkbox selected.";
      // this.alertService.showWarning("Client Mapping :) There must be at least one default checkbox selected.");
      return;
    }


    // GETTING A REMOVED COMPANY ROLES

    let removedCompanyRoles = [];
    this.userCompanyAppliationRole.length > 0 && this.userCompanyAppliationRole.forEach(t => {
      if (this.userForm.value.Role.find(e => e == t.CompanyApplicationRoleId) == undefined) {
        t.Modetype = UIMode.Delete;
        removedCompanyRoles.push(t)
      }
    })

    if ((this.userForm.controls['PrimaryMobile'].value).length != 10) {
      this.isFailedForValidation = true;
      this.FailedProcessMessage = "Mobile Number should be minimum 10 characters";
      // this.alertService.showWarning("Mobile Number should be minimum 10 characters");
      return;
    }
    if (this.existingUserDetailsObject == null && (this.userForm.controls['Password'].value == null || this.userForm.controls['Password'].value == undefined || this.userForm.controls['Password'].value == '')) {
      this.isFailedForValidation = true;
      this.FailedProcessMessage = "Please enter the password to create a new user";
      // this.alertService.showWarning("Please enter the password to create a new user");
      return;
    }

    if (this.existingUserDetailsObject == null && (this.userForm.controls['Password'].value).length < 6 ) {
      this.isFailedForValidation = true;
      this.FailedProcessMessage = "Password should be minimum 6 characters";
      return;
    }

  

    try {

      this.isLoading = true;

      this.person.FirstName = this.userForm.value.FirstName;
      this.person.LastName = "";
      this.person.DOB = moment(this.userForm.value.DOB).format('YYYY-MM-DD');
      this.person.FatherName = this.userForm.value.FatherName;
      this.person.PrimaryMobileCountryCode = "91";
      this.person.PrimaryMobile = this.userForm.value.PrimaryMobile;
      this.person.PrimaryEmail = this.userForm.value.PrimaryEmail;
      this.person.CreatedCompanyId = this.loginSessionDetails.Company.Id;
      this.person.LastUpdatedCompanyId = this.loginSessionDetails.Company.Id;
      this.person.Status = 1;
      this.person.Id = this.existingUserDetailsObject.Person != null ? this.existingUserDetailsObject.Person.Id : 0;


      // ADDING NEW ROLE INTO THE COMPANY ROLE MAPPING TABLE 

      if (this.userForm.value.Role != null && this.userForm.value.Role.length > 0) {

        this.userForm.value.Role.forEach(ele => {
          var _userCompanyAppliationRole = new UserCompanyAppliationRole();

          var existItems = this.userCompanyAppliationRole.find(a => a.CompanyApplicationRoleId == ele)
          if (existItems == undefined) {

            _userCompanyAppliationRole.Id = 0;
            _userCompanyAppliationRole.UserId = 0;
            _userCompanyAppliationRole.CompanyApplicationRoleId = ele
            _userCompanyAppliationRole.CompanyId = this.loginSessionDetails.Company.Id
            _userCompanyAppliationRole.CompanyApplicationRole = null;
            _userCompanyAppliationRole.Modetype = UIMode.Edit;
            _userCompanyAppliationRole.Status = 1;
            this.userCompanyAppliationRole.push(_userCompanyAppliationRole);


          }


        });
      }
      // CANCATINATION THE REMOVED AND NEWLY ADDED ROLES

      this.userCompanyAppliationRole = this.userCompanyAppliationRole.concat(removedCompanyRoles);

      this.LstClientMapping_tbl.length > 0 && this.LstClientMapping_tbl.forEach(e => {

        if (this.UserCompanyClientMappings.find(z => z.Id == e.Id) == undefined) {
          var _userCompanyClientMappings = new UserCompanyClientMapping();
          _userCompanyClientMappings.ClientId = e.ClientId;
          _userCompanyClientMappings.ClientContractId = e.ClientContractId;
          _userCompanyClientMappings.CompanyId = this.loginSessionDetails.Company.Id;
          _userCompanyClientMappings.IsActive = e.IsActive;
          _userCompanyClientMappings.IsDefault = e.IsDefault;
          _userCompanyClientMappings.Settings = null;
          _userCompanyClientMappings.UserId = this.essService.isGuid(e.Id) == true ? 0 : e.UserId;
          _userCompanyClientMappings.Id = this.essService.isGuid(e.Id) == true ? 0 : e.Id as any;
          this.UserCompanyClientMappings.push(_userCompanyClientMappings);
        }

      });

      // this.LstClientMapping_Existing.length > 0 && this.LstClientMapping_Existing.forEach(it => {
      //   let isExists = this.UserCompanyClientMappings.find(a => a.Id == it.Id);
      //   if (isExists != undefined) {
      //     isExists.IsActive = false;
      //   }
      // });



      var loginUsers = new LoginUserDetails();
      loginUsers.Id = this.existingUserDetailsObject != null && this.existingUserDetailsObject != undefined ? this.existingUserDetailsObject.Id : 0;
      loginUsers.Person = this.person;
      loginUsers.UserName = this.userForm.value.UserName;
      loginUsers.Password = this.userForm.value.Password;
      loginUsers.UserCompanyAppliationRoles = this.userCompanyAppliationRole;
      loginUsers.UserCompanyClientMappings = this.UserCompanyClientMappings;
      loginUsers.UserType = this.existingUserDetailsObject != null && this.existingUserDetailsObject != undefined ? this.existingUserDetailsObject.UserType : UserType.CoreUser;
      loginUsers.Status = UserStatus.Active;
      loginUsers.IsLocked = this.existingUserDetailsObject != null && this.existingUserDetailsObject != undefined ? this.existingUserDetailsObject.IsLocked : false;
      loginUsers.LockedOn = this.existingUserDetailsObject != null && this.existingUserDetailsObject != undefined ? this.existingUserDetailsObject.LockedOn : '0001-01-01';
      loginUsers.LastLoggedInAt = moment().format('YYYY-MM-DD');
      console.log('loginUsers RES :::::::::::: ', loginUsers);

      this.onboardingService.CreateLoginUserDetails(loginUsers).subscribe((result) => {

        console.log('OUTPUT RES :::::::::::: ', result);
        let response: apiResult = result;
        if (response.Status) {
          this.alertService.showSuccess(response.Message);
          this.confirmExit();
        } else {
          this.alertService.showWarning(response.Message);
        }
        this.isLoading = false;

      }, error => {

      })

    } catch (error) {
      this.alertService.showInfo(error);
      this.isLoading = false;
    }
  }

  confirmExit() {

    this.activeModal.close('Modal Closed');
  }

}
