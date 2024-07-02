
import { Injectable } from '@angular/core';
import * as _ from 'lodash';

// model class 
import { UserInterfaceControls, _userInterfaceControls } from '../model/UserInterfaceControls';
import { LoginResponses, Role, Roles } from '../model/Common/LoginResponses';
import { SessionStorage } from './session-storage.service'; // session storage
import { SessionKeys } from '../configs/app.config'; // app config 
import { environment } from 'src/environments/environment';
import { BehaviorSubject, Subject } from 'rxjs';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';


@Injectable({
    providedIn: 'root'
})


export class MenuServices {

    sessionDetails: LoginResponses;
    LstAccessRoles: Roles[] = [];
    _accessControls: any;

    securityAccessControl: UserInterfaceControls[];
    _securityAccessControl: UserInterfaceControls[];

    LstuserInterfaceControls: any;

    role: Role;
    changedClientContract =  new BehaviorSubject<string>("changed");
    changedClientContractdata$ = this.changedClientContract.asObservable();


    onGoingReqArray: any[] = [];
    onGoingReqArray$ = new BehaviorSubject<any[]>(this.onGoingReqArray);
    previousUrl: string = '';


    constructor(private sessionService: SessionStorage) {}

    checkAccess_Role() {

        return new Promise((resolve, reject) => {
            console.log('  menuItems');
            let propertyList = [];
            this.sessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses)); // get session storage
            const businessType = this.sessionDetails.Company.LstCompanyBusinessTypeMapping != null ? this.sessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this.sessionDetails.Company.Id).BusinessType : 0;
            
            if (environment.environment.AllowableBusinessTypesForWebMenuItems.includes(businessType)) {

                // const defaultClientId = this.sessionService.getSessionStorage("default_SME_ClientId");
                // const defaultContractId = this.sessionService.getSessionStorage("default_SME_ContractId");

                let menuItems = this.sessionDetails.UIRoles[0].WebMenuItemList;
                // let getMenuItemsStorage = [{ ClientId: 0, ClientContractId: 0, MenuItems: [] }];
                // getMenuItemsStorage = JSON.parse(this.sessionService.getSessionStorage("WebMenuItems"));
                // if (getMenuItemsStorage.length > 0 && getMenuItemsStorage.find(a => a.ClientId == defaultClientId && a.ClientContractId == defaultContractId) != undefined) {
                //     menuItems = getMenuItemsStorage.find(a => a.ClientId == defaultClientId && a.ClientContractId == defaultContractId).MenuItems;
                // }

                if (menuItems.length > 0) {

                    for (let i = 0; i < menuItems.length; i++) {
                        if (menuItems[i].Route != undefined && menuItems[i].Route != null) {
                            propertyList.push({
                                pathName: menuItems[i].Route
                            });
                        }
                        if(menuItems[i].Route == null && menuItems[i].ChildMenuItems.length > 0){
                            for (let j = 0; j <  menuItems[i].ChildMenuItems.length; j++) {
                                const element =  menuItems[i].ChildMenuItems[j].Route;
                                propertyList.push({
                                    pathName: element
                                });
                            }
                        }
                    }
                    propertyList.push({pathName : '/app/accessdenied'}, {pathName : '/app/onboarding/onboardingRequest'});
                    resolve(propertyList);
                }
            }

            if (!environment.environment.AllowableBusinessTypesForWebMenuItems.includes(businessType) && this.sessionDetails.UIRoles.length > 0) {
                if (sessionStorage.getItem('activeRoleId') != null) {
                    const selectedRoleDetails = this.sessionDetails.UIRoles.find(a => a.Role.Id == (sessionStorage.getItem('activeRoleId') as any));
                    this.LstAccessRoles = selectedRoleDetails.Role as any;
                    this._accessControls = selectedRoleDetails.AccessControls;

                } else {
                    let filt_Roles: any = this.sessionDetails.UIRoles[0].Role;
                    this.LstAccessRoles = filt_Roles;
                    this._accessControls = (this.sessionDetails.UIRoles[0].AccessControls);
                    // let isMenuList = [];
                    // isMenuList = _.filter(this._accessControls, (item) => item.ControlName == "Menu");

                    // let propertyList = [];
                    // for (let i = 0; i < isMenuList.length; i++) {
                    //     if (isMenuList[i].Properties.find(z => z.AccessControlTypePropertyId === 4) != null) {
                    //         propertyList.push({
                    //             pathName: isMenuList[i].Properties.find(z => z.AccessControlTypePropertyId === 4).Addvalue
                    //         });
                    //     }
                    // }

                    // resolve(propertyList);
                }
                let isMenuList = [];
                isMenuList = _.filter(this._accessControls, (item) => item.ControlName == "Menu");
                // var subUrlId = null; 
                //     subUrlId =   isMenuList.filter(a=>a.AccessControlType.LstProperties.find(a=>a.Code == 'suburl'));
                //     console.log('urid', subUrlId);
                //     var _addvalue = isMenuList.filter(z=>z.Properties.find(b=>b.AccessControlTypePropertyId == 56));
                //     console.log('_addvalue',_addvalue);


                console.log('isMenuList :', isMenuList);


                for (let i = 0; i < isMenuList.length; i++) {
                    if (isMenuList[i].Properties != undefined && isMenuList[i].Properties != null) {
                        if (isMenuList[i].Properties.find(z => z.AccessControlTypePropertyId == 4) != null) {
                            propertyList.push({
                                pathName: isMenuList[i].Properties.find(z => z.AccessControlTypePropertyId === 4).Addvalue
                            });
                        }
                    }
                }
                propertyList.push({pathName : '/app/accessdenied'}, {pathName : '/app/onboarding/onboardingRequest'});
                
                resolve(propertyList);

            }

            // if (localStorage.getItem('activeRoleId') != null) {
            //     const selectedRoleDetails = this.SessionDetails.UIRoles.find(a => a.Role.Id == (localStorage.getItem('activeRoleId') as any));
            //     this.LstAccessRoles = selectedRoleDetails.Role as any;
            //     this._accessControls = selectedRoleDetails.AccessControls;
            //     selectedRoleDetails.Role.Code == 'Employee' ? this.sessionService.setItem('isEmployee', true) : this.sessionService.setItem('isEmployee', false);

            // } else {
            //     let filt_Roles: any = this.SessionDetails.UIRoles[0].Role;
            //     this.LstAccessRoles = filt_Roles;
            //     this._accessControls = (this.SessionDetails.UIRoles[0].AccessControls);
            //     this.SessionDetails.UIRoles[0].Role.Code == 'Employee' ? this.sessionService.setItem('isEmployee', true) : this.sessionService.setItem('isEmployee', false);

            // }


        });
    }

    setChangedClientContract(){
        this.changedClientContract.next("contractChanged");
    };

    completeChangedClientContractObservers() {
        this.changedClientContract.complete();
        this.changedClientContract = new BehaviorSubject<string>("changed");
        this.changedClientContractdata$ = this.changedClientContract.asObservable();
    }

    pushArrayItem(url: any){
        this.onGoingReqArray.push(url);
        this.onGoingReqArray$.next(this.onGoingReqArray);
    };

    removeArrayItem(url: any){
        this.onGoingReqArray =  this.onGoingReqArray.filter(item => item !== url);
        this.onGoingReqArray$.next(this.onGoingReqArray);
    }
}