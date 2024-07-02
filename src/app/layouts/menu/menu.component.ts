import { AppService } from "src/app/components/Service/app.service";

import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { NavItem } from "../../_services/model/Common/navitem.model";
import { HeaderService } from '../../_services/service//header.service';

import { SessionStorage } from '../../_services/service/session-storage.service'; // session storage
import { SessionKeys } from '../../_services/configs/app.config'; // app config 
import * as _ from 'lodash';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';


import { LoginResponses, Roles, AccessControlType, AccessControl, WebMenuItemList } from '../../_services/model/Common/LoginResponses';
import { WebviewModalComponent } from "src/app/shared/modals/webview-modal/webview-modal.component";
import { environment } from "src/environments/environment";
import { SharedDataService } from "src/app/_services/service/share.service";
import { FileUploadService } from "src/app/_services/service";
import { AuthenticationService, MenuServices } from "src/app/_services/service";
import { ApiResponse } from "src/app/_services/model/Common/BaseModel";
import { FileExistsService } from "src/app/_services/service/FileExistsService";

@Component({
  selector: "app-menu",
  templateUrl: "./menu.component.html",
  styleUrls: ["./menu.component.css"],
  host: {
    //"(window:resize)": "onResize($event)"
  },
  encapsulation: ViewEncapsulation.None
})

// export class MenuAccessList {

//   Id: number;
//   Code: string;

//   ControlName: string;
//   ParentId: string;
//   Permissions: [];
//   Properties: [];
//   AccessControlTypeId: number;
//   AccessControlType: [];
//   ChildAccessControl: [] | null;

// }
export class MenuComponent implements OnInit {

  title = 'Dashboard';

  expIconClass: string;
  menuClass: string;
  isCollapsed: boolean;
  screenHeight: number;
  screenWidth: number;
  isDesktopView: boolean;
  Menu: NavItem[];
  isClicked: boolean;
  isFirstMenu: boolean = true;



  SessionDetails: LoginResponses;
  LstAccessRoles: Roles[] = [];

  // AccessControls : AccessControl[] = [];
  menuItems: AccessControl[] = [];
  menuFInal = [];


  LstOfMenus = [];

  elemtndd: any;

  _accessControls: any;
  WebMenuItemList: WebMenuItemList[] = [];
  _menuAccessList = [];
  dynamicLogo: boolean = false;
  clientLogoLink: any;
  clientminiLogoLink: any;
  BusinessType: any;
  RoleCode: string;
  modalOption: NgbModalOptions = {};
  IsRecruiter: boolean = false;
  UserId: number;
  destinationRole: any = null;
  constructor(
    private appService: AppService,
    private headerService: HeaderService,
    private sessionService: SessionStorage,
    private router: Router,
    private modalService: NgbModal,
    private sharedDataService: SharedDataService,
    private fileUploadService: FileUploadService,
    private authService: AuthenticationService,
    private menuService: MenuServices,
    private fileExistsService: FileExistsService

  ) {
    this.isClicked = false;
  }

  child(items) {



    var childmenu = [];

    try {


      const item = [];
      item.push(items);
      // console.log('item', item);
      for (let i = 0; i < item.length; i++) {
        const element: AccessControlType = item[i].AccessControlType;


        const element1 = item[i].Properties;
        var LstProp = element.LstProperties;


        for (let j = 0; j < LstProp.length; j++) {
          let elem2 = LstProp[j].Code;

          element1.forEach(e => {

            if (e.AccessControlTypePropertyId == LstProp[j].Id) {

              if (childmenu.length == 0) {


                childmenu.push(
                  {
                    [elem2]: e.value,
                    Id: item[i].Id

                  }
                );


              } else {
                var existing = childmenu.find(a => a.Id == item[i].Id);

                if (existing != null) {

                  childmenu.forEach(element => {

                    if (element.Id == item[i].Id) {

                      element[elem2] = e.value;
                    }
                  });
                }
                else {


                  childmenu.push(
                    {
                      [elem2]: e.value,
                      Id: item[i].Id
                    }
                  );
                }
              }



            }
          });
        }

      }
    } finally {

      return childmenu; // But this still executes
    }



  }

  ngAfterViewInit() {
    this.onResize();
  }

  fillChildMenuItems(currentMenuItem: NavItem) {
    var filteredList = this._accessControls.filter(x => x.ParentId == currentMenuItem.id);
    if (filteredList.length == 0) {
      return;
    }

    if (currentMenuItem.subMenu == null || currentMenuItem.subMenu == undefined) {
      currentMenuItem.subMenu = [];
    }

    for (let indx = 0; indx < filteredList.length; indx++) {

      if (filteredList[indx].Properties == null) {
        continue;
      }

      if (filteredList[indx].Permissions != null
        && filteredList[indx].Permissions.length > 0
        && filteredList[indx].AccessControlType.LstPermission.find(mm => mm.Code == "View") != null
        && filteredList[indx].Permissions.find(m => m.AccessControlTypePropertyId ==
          (filteredList[indx].AccessControlType.LstPermission.find(mm => mm.Code == "View")).Id).ViewValue == "false") {
        continue;
      }
      var subUrlId = 0;

      if (filteredList[indx].AccessControlType.LstProperties.find(y => y.Code == "suburl") != undefined) {
        subUrlId = filteredList[indx].AccessControlType.LstProperties.find(y => y.Code == "suburl").Id;

      }

      if (filteredList[indx].Properties.find(x => x.AccessControlTypePropertyId == subUrlId) == undefined) {
        // continue;

        // if (filteredList[indx].Properties.find(x => x.AccessControlTypePropertyId == subUrlId) != undefined) {
        //   var _addvalue = filteredList[indx].Properties.find(x => x.AccessControlTypePropertyId == subUrlId).Addvalue;
        //   if(_addvalue == true){
        //     continue;
        //   }
        // }

        //  ! : 16.2 for panasonic  
        if (this.SessionDetails.ClientList != null && this.SessionDetails.ClientList.length > 0 &&
          environment.environment.HideMenuByClientId != null && environment.environment.HideMenuByClientId.length > 0
          && environment.environment.HideMenuByClientId.filter(z => this.SessionDetails.ClientList.find(a => z.ClientId == a.Id)).length > 0
          && environment.environment.HideMenuByClientId.find(z => this.SessionDetails.ClientList.find(a => z.ClientId == a.Id)).Menus.length > 0) {
          let LstHideMenu = [];
          let SelectedAttributes = environment.environment.HideMenuByClientId.find(z => this.SessionDetails.ClientList.find(a => a.Id == z.ClientId));
          LstHideMenu = SelectedAttributes.Menus;
          if (SelectedAttributes.Roles.includes(this.RoleCode) == true) {
            let menuUrlPath = filteredList[indx].Properties.find(x => x.AccessControlTypePropertyId == filteredList[indx].AccessControlType.LstProperties.find(y => y.Code == 'url').Id) != undefined ?
              filteredList[indx].Properties.find(x => x.AccessControlTypePropertyId == filteredList[indx].AccessControlType.LstProperties.find(y => y.Code == 'url').Id).Addvalue : '';
            if (LstHideMenu.includes(menuUrlPath) == true) {
              return;
            }
          }
        }
        currentMenuItem.subMenu.push({
          id: filteredList[indx].Id,
          displayOrder: filteredList[indx].DisplayOrder,
          text: filteredList[indx].Properties.find(x => x.AccessControlTypePropertyId == filteredList[indx].AccessControlType.LstProperties.find(y => y.Code == 'text').Id) == null
            ? '' : filteredList[indx].Properties.find(x => x.AccessControlTypePropertyId == filteredList[indx].AccessControlType.LstProperties.find(y => y.Code == 'text').Id).Addvalue,
          url: filteredList[indx].Properties.find(x => x.AccessControlTypePropertyId == filteredList[indx].AccessControlType.LstProperties.find(y => y.Code == 'url').Id) == null
            ? '' : filteredList[indx].Properties.find(x => x.AccessControlTypePropertyId == filteredList[indx].AccessControlType.LstProperties.find(y => y.Code == 'url').Id).Addvalue,
          icon: filteredList[indx].Properties.find(x => x.AccessControlTypePropertyId == filteredList[indx].AccessControlType.LstProperties.find(y => y.Code == 'icon').Id) == null
            ? '' : filteredList[indx].Properties.find(x => x.AccessControlTypePropertyId == filteredList[indx].AccessControlType.LstProperties.find(y => y.Code == 'icon').Id).Addvalue
        });
      }
    }


    for (let subIndx = 0; subIndx < currentMenuItem.subMenu.length; subIndx++) {
      this.fillChildMenuItems(currentMenuItem.subMenu[subIndx]);
    }

  }

  onChangeUIRole(jsonObj: any) {

    const selectedRoleDetails = jsonObj.DataObject;
    this.WebMenuItemList = jsonObj.WebMenuItemList;

    console.log('currentRole', jsonObj);

    this._accessControls = [];
    this.sessionService.removeItem('isEmployee');
    selectedRoleDetails.Role.Code == 'Employee' ? this.sessionService.setItem('isEmployee', true) : this.sessionService.setItem('isEmployee', false);
    console.log('selectedRoleDetails ::', selectedRoleDetails);
    this.LstAccessRoles = selectedRoleDetails.Role;
    this._accessControls = selectedRoleDetails.AccessControls;
    this.router.navigate(['app/dashboard']);

    let currentRole: any = null;
    currentRole = selectedRoleDetails != null && selectedRoleDetails.Role;
    this.destinationRole = selectedRoleDetails;
    console.log('currentRole', currentRole);
    this.RoleCode = selectedRoleDetails.Role.Code;
    if (environment.environment.hasOwnProperty("HYRE") && environment.environment.HYRE != null && environment.environment.HYRE.IsRequiredToShow == true && environment.environment.HYRE.PermissibleRoles.includes(currentRole.Code)) {
      this.IsRecruiter = true;
    } else {
      this.IsRecruiter = false;
    }

    const defaultClientId = this.sessionService.getSessionStorage("default_SME_ClientId");
    const defaultContractId = this.sessionService.getSessionStorage("default_SME_ContractId");

    console.log('defaultClientId', defaultClientId);
    console.log('defaultContractId', defaultContractId);

    if (environment.environment.AllowableBusinessTypesForWebMenuItems.includes(this.BusinessType)) {
      this.getMenuItems()
    } else {
      this.dynamicMenuItems();
    }

  }

  checkFile(filenameToCheck) {

    this.fileExistsService
      .checkFileExistence('clientlogo/', filenameToCheck)
      .subscribe((fileExists) => {
        if (fileExists) {
          console.log(`${filenameToCheck} exists.`);
        } else {
          console.log(`${filenameToCheck} does not exist.`);
        }
      });
  }


  async onChangeClientName(jsonObj: any) {

    const jsonObject = jsonObj.DataObject;
    this.WebMenuItemList = jsonObj.WebMenuItemList;
    // console.log('sfsdadfads',this.checkFile(jsonObject.logo));

    // this.clientLogoLink = await this.fileExistsService.checkFileExistence('clientlogo/', jsonObject.logo) ? this.clientLogoLink : jsonObject.logo;
    // this.clientminiLogoLink = await this.fileExistsService.checkFileExistence('clientlogo/', jsonObject.minilogo) ? this.clientminiLogoLink : jsonObject.minilogo;
    this.clientLogoLink = jsonObject.logo;
    this.clientminiLogoLink = jsonObject.minilogo;
    const defaultContractId = this.sessionService.getSessionStorage("default_SME_ContractId");
    const defaultClientId = this.sessionService.getSessionStorage("default_SME_ClientId");

    console.log('defaultClientId', defaultClientId);
    console.log('defaultContractId', defaultContractId);

    if (environment.environment.AllowableBusinessTypesForWebMenuItems.includes(this.BusinessType)) {
      this.getMenuItems();
      return;
    }
  }

  ngOnInit() {

    this.modalOption.backdrop = 'static';
    this.modalOption.keyboard = false;
    this.headerService.title.subscribe(title => {
      this.title = title;
    });

    // var clicked = this.appService('clicked');
    this.init();
  }

  init() {
    this.dynamicLogo = false;
    this.expIconClass = "fa fa-dedent";
    this.isCollapsed = false;
    document.onclick = this.onDocumentClick;
    this.SessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses)); // get session storage
    this.UserId = this.SessionDetails.UserSession.UserId;
    // console.log(this.SessionDetails);
    // dynamic logo
    this.BusinessType = this.SessionDetails.Company.LstCompanyBusinessTypeMapping != null ? this.SessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this.SessionDetails.Company.Id).BusinessType : 0;

    if (this.clientLogoLink == null || this.clientLogoLink == undefined) {
      this.clientLogoLink = 'logo.png';

      if (this.SessionDetails.CompanyLogoLink != "" && this.SessionDetails.CompanyLogoLink != null && this.BusinessType == 3) {
        let jsonObject = JSON.parse(this.SessionDetails.CompanyLogoLink)
        this.clientLogoLink = jsonObject.logo;
        this.clientminiLogoLink = jsonObject.minilogo;
      } else if (this.SessionDetails.ClientList != null && this.SessionDetails.ClientList.length > 0 && (this.BusinessType == 1 || this.BusinessType == 2)) {


        let isDefualtExist = (this.SessionDetails.ClientList.find(a => a.Id == Number(this.sessionService.getSessionStorage('default_SME_ClientId'))));
        if (isDefualtExist != null && isDefualtExist != undefined) {
          let jsonObject = JSON.parse(this.SessionDetails.ClientList.find(a => a.Id == Number(this.sessionService.getSessionStorage('default_SME_ClientId'))).ClientLogoURL);
          this.clientLogoLink = jsonObject.logo;
          this.clientminiLogoLink = jsonObject.minilogo;
          // if (jsonObject.logodocId) {
          //   let logodocId = parseInt(jsonObject.logodocId);
          //   this.fileUploadService.getObjectById(logodocId).subscribe((res1) => {
          //     if (res1.status) {
          //       this.clientLogoLink = 'data:' + 'image/png' + ';base64,' + res1.content;
          //     } else if (JSON.parse(sessionStorage.getItem('ClientLogoUrl')) != null && JSON.parse(sessionStorage.getItem('ClientLogoUrl')).logo != null) {
          //       this.clientLogoLink = JSON.parse(sessionStorage.getItem('ClientLogoUrl')).logo
          //     } else {
          //       this.clientLogoLink = jsonObject.logo;
          //     }
          //   })
          // }
          // if (jsonObject.minilogodocId) {
          //   let minilogodocId = parseInt(jsonObject.minilogodocId);
          //   this.fileUploadService.getObjectById(minilogodocId).subscribe((res2) => {
          //     if (res2.status) {
          //       this.clientminiLogoLink = 'data:' + 'image/png' + ';base64,' + res2.content;
          //     } else if (JSON.parse(sessionStorage.getItem('ClientLogoUrl')) != null && JSON.parse(sessionStorage.getItem('ClientLogoUrl')).miniLogo != null) {
          //       this.clientminiLogoLink = JSON.parse(sessionStorage.getItem('ClientLogoUrl')).miniLogo
          //     } else {
          //       this.clientminiLogoLink = jsonObject.miniLogo;
          //     }
          //   })
          // }
        } else {
          let jsonObject = JSON.parse(this.SessionDetails.ClientList[0].ClientLogoURL);
          this.clientLogoLink = jsonObject.logo;
          this.clientminiLogoLink = jsonObject.minilogo;
        }

        // let isDefualtExist = (this.SessionDetails.ClientList.find(a => a.IsDefault == true));
        // if (isDefualtExist != null && isDefualtExist != undefined) {
        //   let jsonObject = JSON.parse(this.SessionDetails.ClientList.find(a => a.IsDefault == true).ClientLogoURL);
        //   this.clientLogoLink = jsonObject.logo;
        //   this.clientminiLogoLink = jsonObject.minilogo;
        // } else {
        //   let jsonObject = JSON.parse(this.SessionDetails.ClientList[0].ClientLogoURL);
        //   this.clientLogoLink = jsonObject.logo;
        //   this.clientminiLogoLink = jsonObject.minilogo;
        // }
      }
    }

    // this.headerService.dynamicClientLogo.subscribe(dynamicClientLogo => {
    //   console.log('dynamicClientLogo', dynamicClientLogo)
    // });


    // 1: SME
    // 2 : OutSource
    // 3 : Staffing
    if (sessionStorage.getItem('activeRoleId') != null) {
      const selectedRoleDetails = this.SessionDetails.UIRoles.find(a => a.Role.Id == (sessionStorage.getItem('activeRoleId') as any));
      this.LstAccessRoles = selectedRoleDetails.Role as any;
      this._accessControls = selectedRoleDetails.AccessControls;
      this.WebMenuItemList = selectedRoleDetails.WebMenuItemList;
      selectedRoleDetails.Role.Code == 'Employee' ? this.sessionService.setItem('isEmployee', true) : this.sessionService.setItem('isEmployee', false);
      this.RoleCode = selectedRoleDetails.Role.Code;


    } else {
      let filt_Roles: any = this.SessionDetails.UIRoles[0].Role;
      this.LstAccessRoles = filt_Roles;
      this._accessControls = (this.SessionDetails.UIRoles[0].AccessControls);
      this.WebMenuItemList = this.SessionDetails.UIRoles[0].WebMenuItemList;
      this.SessionDetails.UIRoles[0].Role.Code == 'Employee' ? this.sessionService.setItem('isEmployee', true) : this.sessionService.setItem('isEmployee', false);
      this.RoleCode = this.SessionDetails.UIRoles[0].Role.Code;

    }

    console.log('BusinessType ', this.BusinessType);

    if (environment.environment.AllowableBusinessTypesForWebMenuItems.includes(this.BusinessType)) {
      this.getMenuItems();
      return;
    } else {
      this.dynamicMenuItems();
      return;
    }

  }

  private addMenuItem(menuItem, menuList) {
    if (menuItem.IsVisible)
      menuList.push({
        MenuName: menuItem.MenuName,
        Route: menuItem.Route,
        Icon: menuItem.Icon,
        Type: menuItem.Type,
        TargetType: menuItem.TargetType,
        ChildMenuItems: [],
        IsVisible: menuItem.IsVisible
      });

    if (menuItem.ChildMenuItems && menuItem.ChildMenuItems.length > 0) {
      for (const childMenuItem of menuItem.ChildMenuItems) {
        // menuItem.ChildMenuItems = menuItem.ChildMenuItems.sort((a, b) => a.DisplayOrder - b.DisplayOrder);
        this.addMenuItem(childMenuItem, menuList[menuList.length - 1].ChildMenuItems);
      }
    }
  }


  getMenuItems(): any[] {
    this.Menu = [];

    const sortedMenuData = this.WebMenuItemList.sort((a, b) => a.DisplayOrder - b.DisplayOrder);
    if (sortedMenuData.length > 0) {
      sortedMenuData.forEach(e1 => {
        if (e1.ChildMenuItems && e1.ChildMenuItems.length > 0) {
          e1.ChildMenuItems = e1.ChildMenuItems.sort((a, b) => a.DisplayOrder - b.DisplayOrder);
        }
      });
    }
    const menuList = [];

    for (const menuItem of sortedMenuData) {
      this.addMenuItem(menuItem, menuList);
    }

    // console.log('menuList', menuList);
    // const selectedRoleDetails = this.SessionDetails.UIRoles.find(a => a.Role.Id == (sessionStorage.getItem('activeRoleId') as any));
    // const defaultClientId = this.sessionService.getSessionStorage("default_SME_ClientId");
    // const defaultContractId = this.sessionService.getSessionStorage("default_SME_ContractId");
    // const menuObj = { ClientId: defaultClientId, ClientContractId: defaultContractId, MenuItems: menuList, RoleCode :  selectedRoleDetails.Role.Code };
    // let setMenuItemsStorage = [menuObj];
    // if (this.sessionService.getSessionStorage("WebMenuItems") != null) {

    //   let getMenuItemsStorage = [{ ClientId: 0, ClientContractId: 0, MenuItems: [], RoleCode : "" }];
    //   getMenuItemsStorage = JSON.parse(this.sessionService.getSessionStorage("WebMenuItems"));
    //   setMenuItemsStorage.push(...getMenuItemsStorage)
    //   if (getMenuItemsStorage.length > 0 && getMenuItemsStorage.find(a => a.ClientId == defaultClientId && a.ClientContractId == defaultContractId && a.RoleCode ==  selectedRoleDetails.Role.Code) != undefined) {
    //     this.SessionDetails.UIRoles[0].WebMenuItemList = this.WebMenuItemList;
    //     this.Menu = getMenuItemsStorage.find(a => a.ClientId == defaultClientId && a.ClientContractId == defaultContractId && a.RoleCode ==  selectedRoleDetails.Role.Code).MenuItems;
    //     return;
    //   } else {
    //     this.sessionService.setSesstionStorage('WebMenuItems', setMenuItemsStorage);
    //   }
    // }
    // else {
    //   this.sessionService.setSesstionStorage('WebMenuItems', setMenuItemsStorage)
    // }

    this.Menu = menuList;
    this.onResize();
    this.verifyAccessMenuItems();
    return menuList;

  }

  GetMenuByUserAndClient(roleCode, clientId, clientContractId) {
    console.log('test enter');
    console.log('sesss ;;sget', this.sessionService.getSessionStorage("WebMenuItems"));

    // this.WebMenuItemList = [];
    // if (this.sessionService.getSessionStorage("WebMenuItems") != null) {
    //   let getMenuItemsStorage = [{ ClientId: 0, ClientContractId: 0, MenuItems: [],RoleCode : "" }];
    //   getMenuItemsStorage = JSON.parse(this.sessionService.getSessionStorage("WebMenuItems"));
    //   if (getMenuItemsStorage.length > 0 && getMenuItemsStorage.find(a => a.ClientId == clientId && a.ClientContractId == clientContractId && a.RoleCode ==  roleCode) != undefined) {
    //     this.SessionDetails.UIRoles[0].WebMenuItemList = this.WebMenuItemList;
    //     this.WebMenuItemList = getMenuItemsStorage.find(a => a.ClientId == clientId && a.ClientContractId == clientContractId && a.RoleCode ==  roleCode).MenuItems;
    //     return;
    //   }
    // }
    this.authService.GetMenuByUserAndClient(roleCode, clientId, clientContractId).subscribe((x: ApiResponse) => {
      console.log("MENU ITEMS ::", x);
      if (x.Status) {
        this.WebMenuItemList = x.Result;
        this.SessionDetails.UIRoles[0].WebMenuItemList = this.WebMenuItemList;
        this.getMenuItems();
      }
    })
  }

  verifyAccessMenuItems() {
    let isaccess = true;
    this.menuService.checkAccess_Role().then((result) => {
      let results = result as Array<any>
      console.log('ACTIVE MENUS ', results);
      console.log(this.router.url);
      let URL = this.router.url;
      if (URL.includes('?')) {
        URL = URL.split('?')[0];
      }
      console.log('URL :', URL);
      (isaccess = results.find(a => a.pathName == URL) != null ? true : false);
      console.log('isaccess ', isaccess);
      if (!isaccess) {
        // this.menuService.setAllApiCalled(); // for the roles who doesnt have dashboard screen, the roles dropdown will be enabled explicitly
        this.router.navigate(['app/accessdenied']);
        return;
      }
      else {
        this.menuService.setChangedClientContract();
        // this.redirectTo(this.router.url)
        return;
      }
    });
  }

  redirectTo(uri: string) {
    
    sessionStorage.removeItem('SearchPanel');
    // this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    // this.router.onSameUrlNavigation = 'reload';
    // this.router.onSameUrlNavigation = 'reload';
    // this.router.navigateByUrl('/app/dashboard', { skipLocationChange: true });
    this.router.navigateByUrl('/app/dashboard')

  }

  updateImgUrl(type) {
    if (type == 'clientminiLogoLink') {
      return this.clientminiLogoLink != undefined && this.clientminiLogoLink.includes('base64') ? this.clientminiLogoLink : `assets/Images/clientlogo/${this.clientminiLogoLink}`
    }
    if (type == 'clientLogoLink') {
      return this.clientLogoLink != undefined && this.clientLogoLink.includes('base64') ? this.clientLogoLink : `assets/Images/clientlogo/${this.clientLogoLink}`
    }
  }

  dynamicMenuItems() {


    let isMenuList = [];
    isMenuList = _.filter(this._accessControls, (item) => item.ControlName == "Menu");
    this.Menu = [];
    // this.AccessControls.push(this.AccessMenuLst[0].AccessControls); // get access control menus list
    //fill level 1 menus
    for (let p = 0; p < this._accessControls.length; p++) {


      if (this._accessControls[p].AccessControlType.Code != 'Menu'
        || this._accessControls[p].ParentId > 0
        || this._accessControls[p].Properties == null) {
        continue;
      }
      if (this._accessControls[p].Permissions != null
        && this._accessControls[p].Permissions.length > 0
        && this._accessControls[p].AccessControlType.LstPermission.find(mm => mm.Code == "View") != null
        && this._accessControls[p].Permissions.find(m => m.AccessControlTypePropertyId ==
          (this._accessControls[p].AccessControlType.LstPermission.find(mm => mm.Code == "View")).Id).ViewValue == "false") {
        continue;
      }

      var subUrlId = 0;
      if (this._accessControls[p].AccessControlType.LstProperties.find(y => y.Code == "suburl") != undefined) {
        subUrlId = this._accessControls[p].AccessControlType.LstProperties.find(y => y.Code == "suburl").Id;
      }

      if (this._accessControls[p].Properties.find(x => x.AccessControlTypePropertyId == subUrlId) == undefined) {

        //  ! : 16.2 for panasonic  
        if (this.SessionDetails.ClientList != null && this.SessionDetails.ClientList.length > 0 &&
          environment.environment.HideMenuByClientId != null
          && environment.environment.HideMenuByClientId.length > 0
          && environment.environment.HideMenuByClientId.filter(z => this.SessionDetails.ClientList.find(a => z.ClientId == a.Id)).length > 0
          && environment.environment.HideMenuByClientId.find(z => this.SessionDetails.ClientList.find(a => z.ClientId == a.Id)).Menus.length > 0) {
          let LstHideMenu = [];
          let SelectedAttributes = environment.environment.HideMenuByClientId.find(z => this.SessionDetails.ClientList.find(a => a.Id == z.ClientId));
          LstHideMenu = SelectedAttributes.Menus;
          if (SelectedAttributes.Roles.includes(this.RoleCode) == true) {
            let menuUrlPath = this._accessControls[p].Properties.find(x => x.AccessControlTypePropertyId == this._accessControls[p].AccessControlType.LstProperties.find(y => y.Code == "url").Id) != undefined ?
              this._accessControls[p].Properties.find(x => x.AccessControlTypePropertyId == this._accessControls[p].AccessControlType.LstProperties.find(y => y.Code == "url").Id).Addvalue : '';
            if (LstHideMenu.includes(menuUrlPath) == true) {
              return;
            }
          }
        }
        // console.log('test',this._accessControls[p].AccessControlType.LstProperties.find(y => y.Code == "suburl").Id); 


        // console.log(this._accessControls[p].Properties.find(x => x.AccessControlPropertyTypeId == 2).value);
        this.Menu.push({
          id: this._accessControls[p].Id,
          displayOrder: this._accessControls[p].DisplayOrder,
          text: this._accessControls[p].Properties.find(x => x.AccessControlTypePropertyId == this._accessControls[p].AccessControlType.LstProperties.find(y => y.Code == "text").Id) == null
            ? '' : this._accessControls[p].Properties.find(x => x.AccessControlTypePropertyId == this._accessControls[p].AccessControlType.LstProperties.find(y => y.Code == "text").Id).Addvalue,
          url: this._accessControls[p].Properties.find(x => x.AccessControlTypePropertyId == this._accessControls[p].AccessControlType.LstProperties.find(y => y.Code == "url").Id) == null
            ? '' : this._accessControls[p].Properties.find(x => x.AccessControlTypePropertyId == this._accessControls[p].AccessControlType.LstProperties.find(y => y.Code == "url").Id).Addvalue,
          icon: this._accessControls[p].Properties.find(x => x.AccessControlTypePropertyId == this._accessControls[p].AccessControlType.LstProperties.find(y => y.Code == "icon").Id) == null
            ? '' : this._accessControls[p].Properties.find(x => x.AccessControlTypePropertyId == this._accessControls[p].AccessControlType.LstProperties.find(y => y.Code == "icon").Id).Addvalue
        });

      }
    }
    for (let indx = 0; indx < this.Menu.length; indx++) {
      this.fillChildMenuItems(this.Menu[indx]);
    }

    // for (let p = 0; p < this._accessControls.length; p++) {

    //   const Properties = this._accessControls[p].Properties; //   object value name
    //   const LstProp: AccessControlType = this._accessControls[p].AccessControlType; // key name
    //   const LstChildAccessControl = this._accessControls[p].ChildAccessControls;
    //   const AccessControlTypePropertyId = this._accessControls[p].AccessControlTypeId; // Access Control TYpe Id
    //   const ControlName = this._accessControls[p].ControlName; // Control Name (ex: country, state, products)
    //   const Id = this._accessControls[p].Id; // Control main Id (parent Id)


    //   for (let i = 0; i < LstProp.LstProperties.length; i++) {

    //     var keyName = LstProp.LstProperties[i].Code;
    //     var objectValueName = Properties.find(a => a.AccessControlTypePropertyId == LstProp.LstProperties[i].Id);



    //     if (objectValueName != null) {

    //       if (this.LstOfMenus.length == 0) {


    //         this.LstOfMenus.push(
    //           {

    //             Id: Id,
    //             AccessControlTypePropertyId: AccessControlTypePropertyId,
    //             ControlName: ControlName,
    //             [keyName]: objectValueName.value

    //           }
    //         )
    //       }
    //       else {

    //         var existing = this.LstOfMenus.find(a => a.Id == Id);

    //         if (existing != null) {

    //           this.LstOfMenus.forEach(e => {

    //             if (e.Id == Id) {

    //               e[keyName] = objectValueName.value;

    //             }

    //           });
    //         }
    //         else {

    //           this.LstOfMenus.push(
    //             {
    //               Id: Id,
    //               AccessControlTypePropertyId: AccessControlTypePropertyId,
    //               ControlName: ControlName,
    //               [keyName]: objectValueName.value
    //             }
    //           );
    //         }


    //       }

    //     }



    //   }

    //   if (LstChildAccessControl != null)
    //     for (let k = 0; k < LstChildAccessControl.length; k++) {
    //       const ParentId = LstChildAccessControl[k].ParentId;

    //       this.LstOfMenus.forEach(ele => {

    //         if (ParentId == ele.Id) {

    //           if (ele.subMenu == undefined) {

    //             ele["subMenu"] = this.child(LstChildAccessControl[k]);

    //           }
    //           else {

    //             ele.subMenu.forEach(el => {

    //               this.child(LstChildAccessControl[k]).map(function (obj) {

    //                 ele.subMenu.push(obj);
    //                 return obj;
    //               });


    //             });
    //             // ele.subMenu.join(this.child(LstChildAccessControl[k]))
    //           }
    //         }

    //       });
    //     }


    // }

    this.Menu.length > 0 && this.Menu.forEach(element => {
      element.subMenu != null && element.subMenu.length > 0 && (element.subMenu = _.orderBy((element.subMenu), ["displayOrder"], ["asc"]));

    });

    if (this.destinationRole == null) {

      let currentRole = this.SessionDetails.UIRoles != null && this.SessionDetails.UIRoles.length > 0 && this.SessionDetails.UIRoles[0].Role;
      if (environment.environment.hasOwnProperty("HYRE") && environment.environment.HYRE != null && environment.environment.HYRE.IsRequiredToShow == true && environment.environment.HYRE.PermissibleRoles.includes(currentRole.Code)) {
        this.IsRecruiter = true;
      } else {
        this.IsRecruiter = false;
      }
    }


    if (this.IsRecruiter == true) {

      this.Menu.push({
        id: -1000,
        displayOrder: 120,
        text: 'Recruitment',
        url: null,
        icon: "fa fa fa-search"
      })
    } else {
      let updateItem = this.Menu.length > 0 && this.Menu.find(i => i.id == -1000);
      let index = this.Menu.indexOf(updateItem);

      if (index > -1) {
        this.Menu.splice(index, 1);
      }
    }

    let PermissibleUserIds = [17157, 17155, 17156];
    if (PermissibleUserIds.includes(this.UserId) && (this.RoleCode == 'Employee' || this.RoleCode == 'Manager')) {


      this.Menu.push({
        id: -1001,
        displayOrder: 121,
        text: 'Performance',
        url: null,
        icon: "fa fa-line-chart"
      })
    } else {
      let updateItem = this.Menu.length > 0 && this.Menu.find(i => i.id == -1001);
      let index = this.Menu.indexOf(updateItem);

      if (index > -1) {
        this.Menu.splice(index, 1);
      }
    }


    this.Menu = _.orderBy((this.Menu), ["displayOrder"], ["asc"]);
    // this.verifyAccessMenuItems();

    console.log('ALLOCATED MENU ITEMS :: ', this.Menu);

    //this.Menu = this.LstOfMenus;
    // this.Menu = [
    //   {
    //     text: "Desktop",
    //     icon: "fa fa-desktop",
    //     url: "#"
    //   },
    //   {
    //     text: "Test 1",
    //     icon: "fa fa-files-o",
    //     subMenu: [
    //       {
    //         text: "Gallery",
    //         icon: "fa fa-image",
    //         url: "/home/scalelist"
    //       },
    //       {
    //         text: "Profile",
    //         icon: "fa fa-user",
    //         url: "/home/candidates"
    //       },
    //       {
    //         text: "Timeline",
    //         icon: "fa fa-clock-o",
    //         subMenu: [
    //           {
    //             text: "Default",
    //             icon: "fa fa-align-center",
    //             url: "/home/scalelist"
    //           },
    //           {
    //             text: "Full Width",
    //             icon: "fa fa-align-justify",
    //             url: "/home/rulesetlist"
    //           }
    //         ]
    //       }
    //     ]
    //   },
    //   {
    //     text: "Test 2",
    //     icon: "fa fa-files-o",
    //     subMenu: [
    //       {
    //         text: "Gallery 2",
    //         icon: "fa fa-image",
    //         url: "/home/scalelist"
    //       },
    //       {
    //         text: "Profile 2" ,
    //         icon: "fa fa-user",
    //         url: "/home/candidates"
    //       },
    //       {
    //         text: "Timeline 2",
    //         icon: "fa fa-clock-o",
    //         subMenu: [
    //           {
    //             text: "Default 3",
    //             icon: "fa fa-align-center",
    //             url: "/home/scalelist"
    //           },
    //           {
    //             text: "Full Width 3",
    //             icon: "fa fa-align-justify",
    //             url: "/home/rulesetlist"
    //           }
    //         ]
    //       }
    //     ]
    //   }
    //   // {
    //   //   text: "Mailbox",
    //   //   icon: "fa fa-envelope",
    //   //   subMenu: [
    //   //     {
    //   //       text: "Inbox",
    //   //       icon: "fa fa-inbox",
    //   //       url: "/home/scalelist"
    //   //     },
    //   //     {
    //   //       text: "Message",
    //   //       icon: "fa fa-file-text",
    //   //       url: "/home/CandidateList"
    //   //     },
    //   //     {
    //   //       text: "Compose",
    //   //       icon: "fa fa-pencil",
    //   //       url: "/home/rulesetlist"
    //   //     }
    //   //   ]
    //   // }
    // ];
    this.onResize();
  }

  openNav() {
    // alert('yes ')


    this.dynamicLogo = false;



    if (this.isCollapsed) {
      this.screenWidth = window.innerWidth;
      if (this.screenWidth <= 1024) {


        // alert('is colllap less')
        // var elements = document.getElementsByClassName("xn-text");
        // var menuUL = document.getElementsByClassName(
        //   "x-navigation-minimized"
        // );
        // menuUL[0].classList.remove("x-navigation-minimized");
        // // $(".x-navigation li app-menuitemloader ul>li").css("display", "block");
        // for (var i = 0; i < elements.length; i++) {
        //   //(elements[i] as HTMLElement).style.display = "inline";
        // }
        //document.getElementById("main").style.marginLeft = "170px";

        if (!this.isClicked) {
          // alert('yes clicked j')
          this.expIconClass = "fa fa-dedent";
          this.menuClass = "sidenav1";
          this.isCollapsed = false;
          document.getElementById("main").style.marginLeft = "220px";
          this.isClicked = true;
        } else {
          // alert('no clicked j')
          this.expIconClass = "fa fa-indent";

          this.menuClass = "sidenav";
          this.isCollapsed = true;
          document.getElementById("main").style.marginLeft = "0px";

        }

        // this.expIconClass = "fa fa-dedent";
        // this.menuClass = "sidenav";
        // this.isCollapsed = true;

        // document.getElementById("main").style.marginLeft = "220px";

        // $('.sidenav').css('width','220px !important');
      } else {
        // alert('enter')
        this.expIconClass = "fa fa-indent";
        this.menuClass = "sidenav";
        this.isCollapsed = false;
        setTimeout(() => {
          var elements = document.getElementsByClassName("xn-text");
          var menuUL = document.getElementsByClassName(
            "x-navigation-minimized"
          );
          document.getElementById("main").removeAttribute("style");
          menuUL[0].classList.remove("x-navigation-minimized");
          // $(".x-navigation li app-menuitemloader ul>li").css("display", "block");
          for (var i = 0; i < elements.length; i++) {
            //(elements[i] as HTMLElement).style.display = "inline";
          }
          //document.getElementById("main").style.marginLeft = "170px";


          if ($("li.xn-openable").hasClass("active")) {
            // $("li.xn-openable").hasClass("active").find("ul").css("background-color", "red");
            $("li.xn-openable")
              .find("ul")
              .removeClass("testul");
            $("li.xn-openable")
              .find("ul")
              .width(220);

          }
        }, 50);
      }
    } else {
      // alert('close nava')
      this.closeNav();
    }
  }
  closeNav() {
    this.screenWidth = window.innerWidth;
    // alert(this.screenWidth)
    if (this.screenWidth <= 1024) {

      // var elements = document.getElementsByClassName("xn-text");
      // var menuUL = document.getElementsByClassName(
      //   "x-navigation-minimized"
      // );
      // menuUL[0].classList.remove("x-navigation-minimized");
      // // $(".x-navigation li app-menuitemloader ul>li").css("display", "block");
      // for (var i = 0; i < elements.length; i++) {
      //   //(elements[i] as HTMLElement).style.display = "inline";
      // }
      //document.getElementById("main").style.marginLeft = "170px";
      if (!this.isClicked) {
        // alert('yes clicked')
        this.expIconClass = "fa fa-dedent";
        this.menuClass = "sidenav1";
        this.isCollapsed = false;
        document.getElementById("main").style.marginLeft = "220px";
        this.isClicked = true;
      } else {
        // alert('no clicked')
        // alert(this.menuClass)
        this.expIconClass = "fa fa-indent";
        this.menuClass = "sidenav";
        this.isCollapsed = true;
        this.isClicked = false;

        document.getElementById("main").style.marginLeft = "0px";


      }
      // $('.sidenav').css('width','220px !important');
    } else {

      this.dynamicLogo = true;

      this.expIconClass = "fa fa-indent";
      this.menuClass = "sidenavCollapsed";
      this.appService.setSesstionStorage("menuitemClass", this.menuClass);
      this.onDocumentClick();
      this.isCollapsed = true;
      var menuUL = document.getElementsByClassName("x-navigation");
      menuUL[0].classList.add("x-navigation-minimized");
      $(".xn-openable:before").css("display", "none");
      document.getElementById("main").style.marginLeft = "0";
      var elements = document.getElementsByClassName("xn-text");

      //var elements = document.getElementsByClassName('active');
      if (elements) {
        for (let index = 0; index < elements.length; index++) {
          // const element = elements[index].classList.remove('active');
        }
      }
      for (var i = 0; i < elements.length; i++) {
        //(elements[i] as HTMLElement).style.display = 'None';
      }
      if ($("li.xn-openable").hasClass("active")) {
        //$("li.xn-openable").hasClass("active").find("ul").css("background-color", "red");
        $('li.xn-openable').find('ul').removeClass('testul');
        $("li.xn-openable")
          .find("ul")
          .width(50);
        $(
          ".x-navigation.x-navigation-minimized > li li.xn-openable:before"
        ).css("display", "none");
        $(
          ".x-navigation.x-navigation-minimized > li li.active.xn-openable:before"
        ).css("display", "none");

        // $('.x-navigation li.xn-openable:before').css('display','none');
      }
    }
  }

  expandMobileView() {
    var x = document.getElementById("myLinks");
    if (x.style.display === "block") {
      x.style.display = "none";
    } else {
      // x.style.display = "block";
    }
    var elements = document.getElementsByClassName("xn-text");
    var menuUL = document.getElementsByClassName("x-navigation-minimized");
    if (menuUL.length > 0) {
      menuUL[0].classList.remove("x-navigation-minimized");
    }

    for (var i = 0; i < elements.length; i++) {
      // (elements[i] as HTMLElement).style.display = 'inline';
    }
  }

  onDocumentClick() {
    var elem = document.getElementsByClassName("x-navigation-minimized");

    if (
      (this.menuClass == "sidenavCollapsed" && this.isDesktopView == true) ||
      (elem && elem.length > 0)
    ) {
      var elements = document.getElementsByClassName("active");
      if (elements) {
        for (let index = 0; index < elements.length; index++) {
          // const element = elements[index].classList.remove('active');
        }
      }
    }
  }

  onResize(event?) {
    this.dynamicLogo = false;

    this.screenHeight = window.innerHeight;
    this.screenWidth = window.innerWidth;
    var elements = document.getElementsByClassName("active");
    if (elements) {
      for (let index = 0; index < elements.length; index++) {
        //   const element = elements[index].classList.remove('active');
      }
    }
    if (this.screenWidth >= 1024) {
      // alert('if')
      // alert(this.menuClass)
      if (this.menuClass != "sidenav") {
        var menuitemClass = this.appService.getSessionStorage("menuitemClass");

        if (this.menuClass == 'sidenavCollapsed') {
          this.menuClass = "sidenav";
          this.expIconClass = "fa fa-indent";
          // $("#main").removeAttr("style")
          // this.menuClass = "topnav";
          var menuUL = document.getElementsByClassName(
            "x-navigation-minimized"
          );
          document.getElementById("main").removeAttribute("style");
          menuUL[0].classList.remove("x-navigation-minimized");
        } else {
          // if (menuitemClass == null) {
          this.menuClass = "sidenav";
        }
        this.isCollapsed = false;
        // } else {
        //   this.menuClass = menuitemClass;

        //   if (menuitemClass == 'sidenav') {
        //     this.isCollapsed = false;
        //   } else
        //   {
        //     this.isCollapsed = true;
        //     //document.getElementById('main').style.marginLeft = '0';
        //     // document.getElementById('main').style.marginLeft = '0px';
        //   }
        // }
        var elements = document.getElementsByClassName("xn-text");


        for (var i = 0; i < elements.length; i++) {
          //(elements[i] as HTMLElement).style.display = 'None';
        }
        var menuUL = document.getElementsByClassName("x-navigation");
        if (menuUL.length > 0) {
          //  menuUL[0].classList.add('x-navigation-minimized');
        }
      }

      var elements = document.getElementsByClassName("xn-text");
      for (var i = 0; i < elements.length; i++) {
        (elements[i] as HTMLElement).style.display = 'inline';

      }

      // var x = document.getElementById("myLinks");
      this.isDesktopView = true;
      // document.getElementById("main").style.marginLeft = "170px";
      //x.style.display = "block";
    }

    else {

      // alert('else')
      this.isDesktopView = true;
      this.menuClass = "sidenav";
      this.expIconClass = "fa fa-indent";

      $("#main").removeAttr("style")
      var menuUL = document.getElementsByClassName(
        "x-navigation-minimized"
      );
      // document.getElementById("main").removeAttribute("style");
      if (menuUL !== undefined && menuUL !== null && menuUL[0] !== undefined && menuUL !== null)
        menuUL[0].classList.remove("x-navigation-minimized");
      // this.menuClass = "topnav";
      var elements = document.getElementsByClassName("xn-text");

      for (var i = 0; i < elements.length; i++) {
        (elements[i] as HTMLElement).style.display = 'inline';
      }
      var x = document.getElementById("myLinks");
      // x.style.display = "None";
    }

  }

  onActivate(event) {
    let scrollToTop = window.setInterval(() => {
      let pos = window.pageYOffset;
      if (pos > 0) {
        window.scrollTo(0, pos - 20); // how far to scroll on each step
      } else {
        window.clearInterval(scrollToTop);
      }
    }, 16);
  }


  openJotForm() {
    const modalRef = this.modalService.open(WebviewModalComponent, this.modalOption);
    modalRef.result.then((result) => {

    }).catch((error) => {
      console.log(error);
    });
  }

}