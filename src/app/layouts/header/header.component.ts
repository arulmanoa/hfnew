import { Component, OnInit, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { Router, Event } from '@angular/router';
import { AuthenticationService } from '../../_services/service/authentication.service';
import { SessionStorage } from '../../_services/service/session-storage.service'; // session storage

// import { Beacon } from '@beacon.li/bar';
//models
import { SessionKeys } from '../../_services/configs/app.config'; // app config 
import { Roles, LoginResponses, Role, ClientBase } from '../../_services/model/Common/LoginResponses';
import { MenuServices, AlertService, HeaderService } from 'src/app/_services/service';
import { AttendanceService } from 'src/app/_services/service/attendnace.service';
import { apiResult } from 'src/app/_services/model/apiResult';
import { NotificationMessagingService } from 'src/app/_services/service/NotificationMessagingService';
import { DeviceDetectorService } from 'ngx-device-detector';
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { MfasettingsComponent } from 'src/app/dashboard/mfasettings/mfasettings.component';
import { CookieService } from 'ngx-cookie-service';
import { ApiResponse } from 'src/app/_services/model/Common/BaseModel';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';




@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class HeaderComponent implements OnInit {

  @Output() toggleProvidedProvided = new EventEmitter();
  @Output() toggleRightNavProvided = new EventEmitter();
  @Output() toggleRoleProvider = new EventEmitter();
  @Output() toggleClientlogoProvider = new EventEmitter();

  opened = false;

  _loginSessionDetails: LoginResponses;
  LstAccessRoles: Roles[] = [];
  LstClients: ClientBase[] = [];
  LstClientContract: any[] = [];
  selectedClientName: any;
  selectedClientContractName: any;

  userName: any;
  RoleName: any;
  selectedRole: any;
  CompanyName: any;
  userStatus: any;

  userName_1: any;
  Old_ClientId: any;
  Old_ClientContractId: any;
  BusinessType: any;

  notificationList: any[] = [];
  notifySpinner: boolean = true;
  showElement: boolean = true;

  NotificationCount: number = 0;
  sub: Subscription;

  modalOption: NgbModalOptions = {};
  isManuallySelected: boolean = false;
  roleDropDownEnabled: boolean = false;
  showChangePassword: boolean = true;
  constructor(

    // private appService: AppService,
    private router: Router,
    private authService: AuthenticationService,
    private sessionService: SessionStorage,
    private menuService: MenuServices,
    private alertService: AlertService,
    private headerService: HeaderService,
    private attendanceService: AttendanceService,
    private messagingService: NotificationMessagingService,
    private deviceService: DeviceDetectorService,
    private modalService: NgbModal,
    private cookieService: CookieService,
    private loadingScreenService: LoadingScreenService
  ) {
    this.menuService.onGoingReqArray$.subscribe((data: any) =>{
      if(!data.length){
        this.roleDropDownEnabled = true
      } else {
        this.roleDropDownEnabled = false
      }
    })
    // this.menuService.allApiCalleddata$.subscribe((data: any) => {
    //   if (data == "All Api Called") {
    //     this.roleDropDownEnabled = true
    //   }
    // });
  }

  toggleleftNav() {
    if (this.opened === true) {
      this.opened = false;
    } else {
      this.opened = true;
    }
    this.toggleProvidedProvided.emit();
  }
  toggleRightNav() {
    this.toggleRightNavProvided.emit();
  }

  onLogout() {
    this.menuService.completeChangedClientContractObservers();
    this.authService.logout().subscribe(() => { });
    this.authService.google_signOut();

    const cookieValue = this.cookieService.get('clientCode');
    const businessType = environment.environment.BusinessType;
    const loginRoute = (businessType === 1 || businessType === 2) ? `login/${cookieValue}` : 'login';

    this.router.navigate([loginRoute]);

  }


  getShortName(fullName) {
    let name = fullName.replace(/\s/g, "")
    return name.split(' ').map(n => n[0] + n[1]).join('');
  }


  ngOnInit() {


    this._loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses)); // get session storage
    this.BusinessType = this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping != null ? this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this._loginSessionDetails.Company.Id).BusinessType : 0;

    this.userName = this.getShortName(this._loginSessionDetails.UserSession.PersonName);
    this.showChangePassword = sessionStorage.getItem('AuthType') && Number(sessionStorage.getItem('AuthType')) == 2 ? false : true;
    console.log('showChangePassword',  this.showChangePassword);

    // let timer = Observable.timer(0, environment.environment.TimeDurationForGetNotificationCount);
    // this.sub = timer.subscribe(t => {
    //   if (this.sessionService.getSessionStorage(SessionKeys.Token) != null)
    //     this.GetUnReadNotificationCount();
    // });


    let _rolesObj: Role;
    if (sessionStorage.getItem('activeRoleId') != null) {

      const selectedRoleDetails = this._loginSessionDetails.UIRolesCopy.find(a => a.Role.Id == (sessionStorage.getItem('activeRoleId') as any));
      let filt_Roles: any = selectedRoleDetails.Role;
      _rolesObj = selectedRoleDetails.Role;
      this.RoleName = selectedRoleDetails.Role.Name;
      this.CompanyName = this._loginSessionDetails.Company.Name;
      this.userStatus = selectedRoleDetails.Role.Status == 1 ? "Active" : "InActive";
      this.userName_1 = this._loginSessionDetails.UserSession.PersonName;
      this.LstAccessRoles = [];

      this._loginSessionDetails.UIRolesCopy.forEach(item => {
        this.LstAccessRoles.push(item.Role as any)
      });

      this._loginSessionDetails.UIRoles = [];
      this._loginSessionDetails.UIRolesCopy.forEach(element => {
        if (element.Role.Id == (sessionStorage.getItem('activeRoleId') as any)) {
          this._loginSessionDetails.UIRoles.push(element);
        }
      });
      this.sessionService.setSesstionStorage(SessionKeys.LoginResponses, this._loginSessionDetails);
      this.selectedRole = selectedRoleDetails.Role.Id;
      let companyCode = this._loginSessionDetails.Company.Code;
      this.sessionService.setSesstionStorage("CompanyCode", companyCode);
    } else {
      let filt_Roles: any = this._loginSessionDetails.UIRoles[0].Role;
      _rolesObj = this._loginSessionDetails.UIRoles[0].Role;
      this.RoleName = this._loginSessionDetails.UIRoles[0].Role.Name;
      this.CompanyName = this._loginSessionDetails.Company.Name;
      this.userStatus = this._loginSessionDetails.UIRoles[0].Role.Status == 1 ? "Active" : "InActive";
      this.userName_1 = this._loginSessionDetails.UserSession.PersonName;
      this.LstAccessRoles = [];
      this._loginSessionDetails.UIRolesCopy.forEach(item => {
        this.LstAccessRoles.push(item.Role as any)
      });
      this._loginSessionDetails.UIRoles = [];
      this._loginSessionDetails.UIRolesCopy.forEach(element => {
        if (element.Role.Id == filt_Roles.Id) {
          this._loginSessionDetails.UIRoles.push(element);
        }
      });
      this.sessionService.setSesstionStorage(SessionKeys.LoginResponses, this._loginSessionDetails);
      this.selectedRole = filt_Roles.Id;
      sessionStorage.setItem('activeRoleId', this.selectedRole);
      sessionStorage.setItem('activeRoleCode', filt_Roles.Code);
      this.sessionService.setSesstionStorage("RoleId", this.selectedRole);
      let companyCode = this._loginSessionDetails.Company.Code;
      this.sessionService.setSesstionStorage("CompanyCode", companyCode);

      let hierarchyRole = {
        IsCompanyHierarchy: false,
        RoleCode: _rolesObj.Code,
        RoleId: _rolesObj.Id
      }

      this.authService.UpdateRoleInSession(hierarchyRole).subscribe(x => {
        console.log("UpdateRoleInSession ::", x);
      })

    }
    // if (this._loginSessionDetails.ClientList != null && this._loginSessionDetails.ClientList.length > 0) {
    //   this.LstClients = this._loginSessionDetails.ClientList;
    //   this.selectedClientName = this.LstClients.find(item => item.IsDefault).Id;
    //   var _clientId = this.selectedClientName == null ? 0 : this.selectedClientName; 
    //   var _clientContractId = (this._loginSessionDetails.ClientContractList != null && this._loginSessionDetails.ClientContractList.length > 0 ? this._loginSessionDetails.ClientContractList.find(z => z.ClientId == this.selectedClientName).Id : 0);
    //   var _companyId = this._loginSessionDetails.Company.Id;
    //   this.sessionService.setSesstionStorage("default_SME_ClientId", this.selectedClientName);
    //   this.sessionService.setSesstionStorage("default_SME_ContractId", (this._loginSessionDetails.ClientContractList != null && this._loginSessionDetails.ClientContractList.length > 0 ? this._loginSessionDetails.ClientContractList.find(z => z.ClientId == this.selectedClientName).Id : 0));
    //   this.sessionService.setSesstionStorage("SME_Client", this.LstClients.find(item => item.IsDefault));
    //   this.sessionService.setSesstionStorage("SME_ClientContract", (this._loginSessionDetails.ClientContractList != null && this._loginSessionDetails.ClientContractList.length > 0 ? this._loginSessionDetails.ClientContractList.find(z => z.ClientId == this.selectedClientName) : null));

    //   this.Old_ClientId = this.selectedClientName;
    //   this.GetCompanySettings(_companyId,_clientId,_clientContractId).then(()=> { console.log('COMPANY SETTINGS TASK COMPLETE!')});
    //   // this.LstAccessRoles = this._loginSessionDetails.UIRoles;
    // }



    if (this.BusinessType != 3 && this.BusinessType != 0 && this._loginSessionDetails.ClientList != null && this._loginSessionDetails.ClientList.length > 0 && this._loginSessionDetails.ClientContractList != null && this._loginSessionDetails.ClientContractList.length > 0) {
      try {

        this.LstClients = this._loginSessionDetails.ClientList;
        this.LstClientContract = this._loginSessionDetails.ClientContractList;
        console.log('LstClientContract', this.LstClientContract);
        this.selectedClientName = (this.sessionService.getSessionStorage("default_SME_ClientId") == null || this.sessionService.getSessionStorage("default_SME_ClientId") == undefined) ? (this.LstClients.find(item => item.IsDefault) == undefined ? this.LstClients[0].Id : this.LstClients.find(item => item.IsDefault).Id) : this.sessionService.getSessionStorage("default_SME_ClientId"); // client id
        this.selectedClientContractName = (this.sessionService.getSessionStorage("default_SME_ContractId") == null || this.sessionService.getSessionStorage("default_SME_ContractId") == undefined) ? this.LstClientContract.find(x => x.ClientId == this.selectedClientName).Id : this.sessionService.getSessionStorage("default_SME_ContractId");; // client contract id
        var _companyId = this._loginSessionDetails.Company.Id;
        var _clientId = this.selectedClientName == null ? 0 : this.selectedClientName;
        var _clientContractId = this.selectedClientContractName == null ? 0 : this.selectedClientContractName;

        let _clientCode = this._loginSessionDetails.ClientList != null && this._loginSessionDetails.ClientList.length > 0 ? this._loginSessionDetails.ClientList.find(z => z.Id == this.selectedClientName).Code : null;
        let _clientContractCode = this._loginSessionDetails.ClientContractList != null && this._loginSessionDetails.ClientContractList.length > 0 ? this._loginSessionDetails.ClientContractList.find(z => z.Id == this.selectedClientContractName).Code : null;

        this.sessionService.setSesstionStorage("default_SME_ClientId", this.selectedClientName);
        this.sessionService.setSesstionStorage("default_SME_ContractId", this.selectedClientContractName);
        this.sessionService.setSesstionStorage("default_ClientCode", _clientCode);
        this.sessionService.setSesstionStorage("default_ContractCode", _clientContractCode);
        this.sessionService.setSesstionStorage("SME_Client", (this.sessionService.getSessionStorage("default_SME_ClientId") == null || this.sessionService.getSessionStorage("default_SME_ClientId") == undefined) ? this.LstClients.find(item => item.IsDefault) : this.LstClients.find(item => item.Id == Number(this.sessionService.getSessionStorage("default_SME_ClientId"))));
        this.sessionService.setSesstionStorage("SME_ClientContract", this.LstClientContract.find(x => x.ClientId == this.selectedClientName));
        this.Old_ClientId = this.selectedClientName;
        this.Old_ClientContractId = this.selectedClientContractName;
        this.GetCompanySettings(_companyId, _clientId, _clientContractId).then(() => { console.log('COMPANY SETTINGS TASK COMPLETE!') });

      } catch (error) {
        console.error('EXCEPTION WHILE MAPPING DEFAULT CLIENT ID ::', error);
      }
      // this.LstAccessRoles = this._loginSessionDetails.UIRoles;
    }
    else if (this.BusinessType == 3 && this.BusinessType != 0 && this._loginSessionDetails.ClientList != null && this._loginSessionDetails.ClientList.length > 0 && this._loginSessionDetails.ClientContractList != null && this._loginSessionDetails.ClientContractList.length > 0) {

      this.LstClients = this._loginSessionDetails.ClientList;
      this.LstClientContract = this._loginSessionDetails.ClientContractList;
      this.selectedClientName = (this.sessionService.getSessionStorage("default_SME_ClientId") == null || this.sessionService.getSessionStorage("default_SME_ClientId") == undefined) ? (this.LstClients.find(item => item.IsDefault) == undefined ? this.LstClients[0].Id : this.LstClients.find(item => item.IsDefault).Id) : this.sessionService.getSessionStorage("default_SME_ClientId"); // client id
      this.selectedClientContractName = (this.sessionService.getSessionStorage("default_SME_ContractId") == null || this.sessionService.getSessionStorage("default_SME_ContractId") == undefined) ? this.LstClientContract.find(x => x.ClientId == this.selectedClientName).Id : this.sessionService.getSessionStorage("default_SME_ContractId");; // client contract id
      var _companyId = this._loginSessionDetails.Company.Id;
      var _clientId = this.selectedClientName == null ? 0 : this.selectedClientName;
      var _clientContractId = this.selectedClientContractName == null ? 0 : this.selectedClientContractName;

      let _clientCode = this._loginSessionDetails.ClientList != null && this._loginSessionDetails.ClientList.length > 0 ? this._loginSessionDetails.ClientList.find(z => z.Id == this.selectedClientName).Code : null;
      let _clientContractCode = this._loginSessionDetails.ClientContractList != null && this._loginSessionDetails.ClientContractList.length > 0 ? this._loginSessionDetails.ClientContractList.find(z => z.Id == this.selectedClientContractName).Code : null;

      this.sessionService.setSesstionStorage("default_SME_ClientId", this.selectedClientName);
      this.sessionService.setSesstionStorage("default_SME_ContractId", this.selectedClientContractName);
    }


    if (this.LstAccessRoles.length <= 1) {

      this.sessionService.delSessionStorage("RoleId");
      this.sessionService.setSesstionStorage("RoleId", _rolesObj.Id);

    }

    this.RegisterToken();
    this.messagingService.receiveMessage();
    // 

    this.messagingService.count.subscribe((counts) => {
      console.log('counts >>>>>>>>>>>>>>>>>..', counts);
      if (counts > 0) { this.NotificationCount = Number(this.NotificationCount) + Number(counts) };
      console.log('Notification Count >>>>>>>>>>>>', this.NotificationCount);

    });

    this.GetUnReadNotificationCount(); // -- initial call


  }

  onChangeRole(roleId: any): void {
    this.roleDropDownEnabled = false;
    this.loadingScreenService.startLoading();
    sessionStorage.removeItem('activeRoleId');
    this.sessionService.delSessionStorage("RoleId");
    const selectedRoleDetails = this._loginSessionDetails.UIRolesCopy.find(a => a.Role.Id == roleId);
    this._loginSessionDetails.UIRoles = [];
    this._loginSessionDetails.UIRolesCopy.forEach(element => {
      if (element.Role.Id == roleId) {
        this._loginSessionDetails.UIRoles.push(element);
      }
    });
    this.sessionService.setSesstionStorage(SessionKeys.LoginResponses, this._loginSessionDetails);
    console.log('UIRoles', this._loginSessionDetails.UIRoles);

    let hierarchyRole = {
      IsCompanyHierarchy: false,
      RoleCode: selectedRoleDetails.Role.Code,
      RoleId: selectedRoleDetails.Role.Id
    }

    this.authService.UpdateRoleInSession(hierarchyRole).subscribe(x => {
      console.log("UpdateRoleInSession ::", x);
    })

    let _rolesObj: Role = selectedRoleDetails.Role;
    this.RoleName = selectedRoleDetails.Role.Name;
    this.userStatus = selectedRoleDetails.Role.Status == 1 ? "Active" : "InActive";
    if (this.LstAccessRoles.length <= 1) {
      this.sessionService.delSessionStorage("RoleId");
      this.sessionService.setSesstionStorage("RoleId", _rolesObj.Id);
    }

    sessionStorage.setItem('activeRoleId', roleId);
    sessionStorage.setItem('activeRoleCode', selectedRoleDetails.Role.Code);

    this.sessionService.setSesstionStorage("RoleId", _rolesObj.Id);
    this.selectedRole = roleId;

    if (environment.environment.AllowableBusinessTypesForWebMenuItems.includes(this.BusinessType)) {
      const defaultClientId = this.sessionService.getSessionStorage("default_SME_ClientId");
      const defaultContractId = this.sessionService.getSessionStorage("default_SME_ContractId");
      this.GetMenuByUserAndClient(selectedRoleDetails, defaultClientId, defaultContractId, 'Role', null);
    } else {
      const returnjsonObj = {
        DataObject: selectedRoleDetails,
        WebMenuItemList: []
      }
      this.toggleRoleProvider.emit(returnjsonObj);
      this.check_AccessMenu();
    }



  }

  check_AccessMenu() {
    let isaccess = true;
    this.menuService.checkAccess_Role().then((result) => {
      let results = result as Array<any>
      console.log('ACTIVE MENUS ', results);
      console.log(this.router.url);
      (isaccess = results.find(a => a.pathName == this.router.url) != null ? true : false);

      if (!isaccess) {
        this.router.navigate(['app/accessdenied']);
        return false;
      }
      else {
        this.redirectTo(this.router.url)
        return false
      }
    });
  }

  GetMenuByUserAndClient(selectedRoleDetails, clientId, clientContractId, DPType, JObject) {
    const roleCode = selectedRoleDetails.Role.Code;
    this.authService.GetMenuByUserAndClient(roleCode, clientId, clientContractId).subscribe((x: ApiResponse) => {
      console.log("MENU ITEMS HEADER ::", x);
      if (x.Status) {
        // this.WebMenuItemList = x.Result;
        this._loginSessionDetails.UIRoles[0].WebMenuItemList = x.Result;
        if (DPType == 'Role') {
          const returnjsonObj = {
            DataObject: selectedRoleDetails,
            WebMenuItemList: x.Result
          }
          this.toggleRoleProvider.emit(returnjsonObj);
        } else {
          const returnjsonObj = {
            DataObject: JObject,
            WebMenuItemList: x.Result
          }
          this.toggleClientlogoProvider.emit(returnjsonObj);
          if (this.isManuallySelected) {
            this.redirectTo(this.router.url);
          };
        }
      }
    })
  }


  view_profile() {

    $('#popup_profile').modal('show');
  }

  modal_dismiss() {
    $('#popup_profile').modal('hide');
  }

  // SME OR OUTSOURCING COMPANY LOGIN - TERMINAL ACTION 
  // onChangeClientName(_clientId: any) {
  //   this.alertService.confirmSwal1("Are you sure?", "Changing the company will move all the transactions to the new company. Are you sure you want to proceed?", "Cancel", "Okay").then(result => {
  //     this.selectedClientName = this.Old_ClientId;
  //   }).catch(error => {
  //     this.Old_ClientId = _clientId;
  //     let jsonObject = JSON.parse(this.LstClients.find(item => item.Id === Number(_clientId)).ClientLogoURL);

  //     this.toggleClientlogoProvider.emit(jsonObject);
  //     this.sessionService.delSessionStorage("default_SME_ClientId");
  //     this.sessionService.delSessionStorage("default_SME_ContractId");
  //     this.sessionService.delSessionStorage("SME_Client");
  //     this.sessionService.delSessionStorage("SME_ClientContract");
  //     this.sessionService.setSesstionStorage("default_SME_ClientId", _clientId);
  //     this.sessionService.setSesstionStorage("default_SME_ContractId", (this._loginSessionDetails.ClientContractList != null && this._loginSessionDetails.ClientContractList.length > 0 ? this._loginSessionDetails.ClientContractList.find(z => z.ClientId == _clientId).Id : 0));
  //     this.sessionService.setSesstionStorage("SME_Client", this.LstClients.find(item => item.Id === Number(_clientId)));
  //     this.sessionService.setSesstionStorage("SME_ClientContract", (this._loginSessionDetails.ClientContractList != null && this._loginSessionDetails.ClientContractList.length > 0 ? this._loginSessionDetails.ClientContractList.find(z => z.ClientId == _clientId) : null));
  //     this.headerService.checkdynamicClientLogo(this.LstClients.find(item => item.Id === Number(_clientId)).ClientLogoURL); // unused code 
  //     var currentUrl = this.router.url;
  //     this.redirectTo(currentUrl);
  //   });

  // }


  onChangeClientContractName(_clientContractId: any) {
    this.isManuallySelected = true;
    let _clientId = this._loginSessionDetails.ClientContractList.find(z => z.Id == _clientContractId).ClientId;

    this.alertService.confirmSwal1("Are you sure?", "Changing the company will move all the transactions to the new company. Are you sure you want to proceed?", "Okay", "Cancel").then(result => {
      this.loadingScreenService.startLoading();
      this.Old_ClientContractId = _clientContractId;
      let jsonObject = JSON.parse(this._loginSessionDetails.ClientList != null &&
        this._loginSessionDetails.ClientList.length > 0 ? this._loginSessionDetails.ClientList.find(z => z.Id == _clientId).ClientLogoURL : null);
      var _companyId = this._loginSessionDetails.Company.Id;

      let _clientCode = this._loginSessionDetails.ClientList != null && this._loginSessionDetails.ClientList.length > 0 ? this._loginSessionDetails.ClientList.find(z => z.Id == _clientId).Code : null;
      let _clientContractCode = this._loginSessionDetails.ClientContractList != null && this._loginSessionDetails.ClientContractList.length > 0 ? this._loginSessionDetails.ClientContractList.find(z => z.Id == _clientContractId).Code : null;

      sessionStorage.removeItem("SearchPanel1");
      sessionStorage.removeItem('CommonSearchCriteria');
      this.sessionService.delSessionStorage("default_SME_ClientId");
      this.sessionService.delSessionStorage("default_SME_ContractId");
      this.sessionService.delSessionStorage("default_ClientCode");
      this.sessionService.delSessionStorage("default_ContractCode");
      this.sessionService.delSessionStorage("SME_Client");
      this.sessionService.delSessionStorage("SME_ClientContract");
      this.sessionService.setSesstionStorage("default_SME_ClientId", _clientId);
      this.sessionService.setSesstionStorage("default_SME_ContractId", _clientContractId);



      this.sessionService.setSesstionStorage("default_ClientCode", _clientCode);
      this.sessionService.setSesstionStorage("default_ContractCode", _clientContractCode);

      this.sessionService.setSesstionStorage("SME_Client", (this._loginSessionDetails.ClientList != null && this._loginSessionDetails.ClientList.length > 0 ? this._loginSessionDetails.ClientList.find(z => z.Id == _clientId) : null));
      this.sessionService.setSesstionStorage("SME_ClientContract", (this._loginSessionDetails.ClientContractList != null && this._loginSessionDetails.ClientContractList.length > 0 ? this._loginSessionDetails.ClientContractList.find(z => z.Id == _clientContractId) : null));
      // this.headerService.checkdynamicClientLogo(this.LstClients.find(item => item.Id === Number(_clientId)).ClientLogoURL); // unused code 
      this.GetCompanySettings(_companyId, _clientId, _clientContractId).then(() => { console.log('COMPANY SETTINGS TASK COMPLETE!') });

      // console.log(this.sessionService.getSessionStorage('SME_ClientContract'));
      // console.log(this.sessionService.getSessionStorage('SME_Client'));
      // console.log(this.sessionService.getSessionStorage('default_SME_ContractId'));
      // console.log(this.sessionService.getSessionStorage('default_SME_ClientId'));

      if (environment.environment.AllowableBusinessTypesForWebMenuItems.includes(this.BusinessType)) {
        const defaultClientId = this.sessionService.getSessionStorage("default_SME_ClientId");
        const defaultContractId = this.sessionService.getSessionStorage("default_SME_ContractId");
        this.GetMenuByUserAndClient(this._loginSessionDetails.UIRoles[0], defaultClientId, defaultContractId, 'Client', jsonObject);
      } else {
        var currentUrl = this.router.url;
        if (this.isManuallySelected) {
          this.menuService.setChangedClientContract();
          this.redirectTo(currentUrl);
        };
      }

    }).catch(error => {
      this.selectedClientContractName = this.Old_ClientContractId;
    });

  }


  redirectTo(uri: string) {
    
    sessionStorage.removeItem('SearchPanel');
    //   this.router.navigateByUrl('/app/dashboard', { skipLocationChange: true }).then(() => {
    //     this.router.navigate(['/app/dashboard']);
    // }); 


    // this.router.navigateByUrl('/', {skipLocationChange: false}).then(()=>
    // this.router.navigate([uri]);
    // this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    // this.router.onSameUrlNavigation = 'reload';
    if (environment.environment.AllowableBusinessTypesForWebMenuItems.includes(this.BusinessType)) {
      this.router.navigate(['/app/dashboard']);
    } else {
      // this.router.routeReuseStrategy.shouldReuseRoute = () => false;
      // this.router.onSameUrlNavigation = 'reload';
      this.router.navigateByUrl('/app/dashboard')
    }

    // this.router.navigateByUrl('/app/dashboard')
    // );
  }

  changepassword() {
    this.router.navigateByUrl('/app/masters/changepassword')

  }

  mfaSettings() {

    const modalRef = this.modalService.open(MfasettingsComponent, this.modalOption);
    modalRef.result.then((result) => {
      if (result != "Modal Closed") {

      } else {
      }
    }).catch((error) => {
      console.log(error);
    })
  }
  GetCompanySettings(_companyId, _clientId, _clientContractId) {
    const promise = new Promise((res, rej) => {
      this.attendanceService.GetCompanySettings(_companyId, _clientId, _clientContractId, 'IsUserGroupRequires')
        .subscribe((result) => {
          console.log('COMPANY SETTINGS FOR USER GROUP :: ', result);
          let apiR: apiResult = result;
          if (apiR.Status && apiR.Result != null) {
            var jobject = apiR.Result as any;
            var jSettingValue = JSON.parse(jobject.SettingValue);
            this.sessionService.delSessionStorage("UserGroupCompanySettingValue");
            this.sessionService.setSesstionStorage("UserGroupCompanySettingValue", (jSettingValue));
          }

        })
    })
    return promise;
  }

  RegisterToken() {
    let deviceInfo = this.deviceService.getDeviceInfo();
    const isDesktopDevice = this.deviceService.isDesktop();
    console.log('isDesktopDevice', isDesktopDevice);

    try {

      let requestParams = {
        Id: 0,
        UserId: this._loginSessionDetails.UserSession.UserId,
        Token: null,
        DeviceType: isDesktopDevice ? 2 : 1,
        AppToken: this._loginSessionDetails.Token,
        UniqueDeviceId: "",
        OS: deviceInfo.os,
        IsActive: 1,
        DeviceInformation: JSON.stringify(deviceInfo),
        InvalidateOldEntries: 1,
      };
      this.messagingService.requestPermission(requestParams);
    } catch (error) {

      console.log('EXE ERR :: ', error);

    }
    finally {

    }
  }

  goToLink(url: string) {
    if (window.addEventListener) {
      sessionStorage.setItem('sessionStorage', JSON.stringify(this._loginSessionDetails));
      window.addEventListener("storage", null, false);
    } else {
      // window.attachEvent("onstorage", sessionStorage_transfer);
    };
    window.addEventListener('storage', (event) => {
      if (event.key === 'REQUESTING_SHARED_CREDENTIALS')
        console.log('Its working')
    })

    window.open(url, "_blank");
  }

  GetUnReadNotificationCount() {
    this.NotificationCount = 0;
    this.alertService.GetUnReadNotificationCount().subscribe((data) => {
      let apiR: apiResult = data;
      if (apiR.Status) {
        this.NotificationCount = apiR.Result as any;
      }
    }, err => {
      console.log('ERROR WHILE GETTING NOTIFICATIONS COUNT');

    });
  }

  GetNotifications() {
    this.notifySpinner = true;
    this.notificationList = [];
    this.alertService.GetNotifications().subscribe((data) => {

      let apiR: apiResult = data;
      if (apiR.Status) {
        this.notificationList = apiR.Result as any;

        this.notifySpinner = false;
        this.notificationList.length > 0 && this.notificationList.forEach(e4 => {
          e4['hover'] = false;
        });
        this.NotificationCount = this.notificationList.length > 0 ? this.notificationList.filter(a => a.Status < 70).length : this.NotificationCount;
      } else {
        this.notifySpinner = false;
      }
    }, err => {
      console.log('ERROR WHILE GETTING NOTIFICATIONS');

    });
  }

  timeSince(date) {

    let y = new Date(date).getTime();
    let seconds = Math.abs(new Date().getTime() - y) / 1000;

    var interval = seconds / 31536000;

    if (interval > 1) {
      return Math.floor(interval) + " years ago";
    }
    interval = seconds / 2592000;
    if (interval > 1) {
      return Math.floor(interval) + " months ago";
    }
    interval = seconds / 86400;
    if (interval > 1) {
      return Math.floor(interval) + " days ago";
    }
    interval = seconds / 3600;
    if (interval > 1) {
      return Math.floor(interval) + " hours ago";
    }
    interval = seconds / 60;
    if (interval > 1) {
      return Math.floor(interval) + " minutes ago";
    }
    return Math.floor(seconds) + " seconds ago";
  }

  onRead(item) {
    let ids = [];
    ids.push(item.Id);
    this.callNotificationPost(ids, 70, 2);
  }

  dismissIndividual(item) {
    let ids = [];
    ids.push(item.Id);
    this.callNotificationPost(ids, 80, 2);
  }

  dismissAllorMarkAsRead(StatusCode) {
    if (this.notificationList.length > 0) {
      let ids = [];
      this.notificationList.forEach(e3 => {
        ids.push(e3.Id);
      });
      this.callNotificationPost(ids, StatusCode, 2);
    }
  }

  callNotificationPost(ids, status, device) {
    let payload_notification = JSON.stringify({
      Ids: ids,
      Status: status,
      Device: device
    })
    this.alertService.UpdateNotificationStatus(payload_notification).subscribe((data) => {
      console.log('NOTIFY RES ', data);
      this.GetUnReadNotificationCount();
    })
  };

  openBeaconBar(){
  //  Beacon.open();
  }

}
