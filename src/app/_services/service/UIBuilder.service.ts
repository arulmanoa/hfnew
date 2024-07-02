// import { Injectable } from '@angular/core';
// import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';

// // model class 
// import { UserInterfaceControls, _userInterfaceControls } from '../../shared/models/UserInterfaceControls';
// import { LoginResponses, Role } from '../../shared/models/Common/LoginResponses';


// import { SessionStorage } from './session-storage.service'; // session storage
// import { SessionKeys } from '../../configs/app.config'; // app config 
// import * as _ from 'lodash';


import { Injectable } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import * as _ from 'lodash';
// model class 
import { UserInterfaceControls, _userInterfaceControls } from '../model/UserInterfaceControls';
import { LoginResponses, Role } from '../model/Common/LoginResponses';
import { SessionStorage } from './session-storage.service'; // session storage
import { SessionKeys } from '../configs/app.config'; // app config 
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})



export class UIBuilderService {

  sessionDetails: LoginResponses;
  securityAccessControl: UserInterfaceControls[];
  _securityAccessControl: UserInterfaceControls[];

  LstuserInterfaceControls: any;

  role: Role;
  RoleCode: string;

  constructor(

    private sessionService: SessionStorage,

  ) { }

  setTextBoxProperties(mode, parentComponent, element) {
    if (element.PropertyName === "required" && parentComponent.candidatesForm.controls[element.ControlName] != null) {
      if (this.getPropertyValue(mode, element) == "false") {
        parentComponent.candidatesForm.controls[element.ControlName].clearValidators();
        parentComponent.candidatesForm.controls[element.ControlName].setErrors(null);
      }
      else if (this.getPropertyValue(mode, element) == "true") {
        parentComponent.candidatesForm.controls[element.ControlName].setValidators([Validators.required]);
        parentComponent.candidatesForm.controls[element.ControlName].updateValueAndValidity();
      }
    }

    else if (element.PropertyName === "disabled" && parentComponent.candidatesForm.controls[element.ControlName] != null) {
      if (this.getPropertyValue(mode, element) === "true") {
        parentComponent.candidatesForm.controls[element.ControlName].disable();
        parentComponent.candidatesForm.controls[element.ControlName].clearValidators();
        parentComponent.candidatesForm.controls[element.ControlName].setErrors(null);
      }
      else if (this.getPropertyValue(mode, element) === "false") {
        parentComponent.candidatesForm.controls[element.ControlName].enable();
      }
    }

    else if (element.PropertyName === "maxLength" && parentComponent.candidatesForm.controls[element.ControlName] != null) {
      const maxLength = this.getPropertyValue(mode, element).toString();
      parentComponent.candidatesForm.setValidators(Validators.maxLength(Number(maxLength)));
    }

    else if (element.PropertyName === "minLength" && parentComponent.candidatesForm.controls[element.ControlName] != null) {
      const minLength = this.getPropertyValue(mode, element).toString();
      parentComponent.candidatesForm.setValidators(Validators.minLength(Number(minLength)));
    }

    else if (element.PropertyName === "pattern" && parentComponent.candidatesForm.controls[element.ControlName] != null) {
      if (this.getPropertyValue(mode, element) !== "") {
        const pattern = this.getPropertyValue(mode, element).toString();
        parentComponent.candidatesForm.setValidators(Validators.pattern(pattern));
      }
    }
  }

  setAccordionProperties(mode, parentComponent, element) {
    if (element.PropertyName === "hidden" && parentComponent[element.ControlName] != null) {
      parentComponent[element.ControlName] = !Boolean(JSON.parse(this.getPropertyValue(mode, element)));
    }
    let LstAccordion = [];
    LstAccordion = environment.environment.NotRequiredAccordionForRecruiter;
    if (this.RoleCode == 'Recruiter' && LstAccordion.length > 0 && LstAccordion.includes(element.ControlName)) {
      parentComponent[element.ControlName] = false;
    }
  }

  setDatePickerProperties(mode, parentComponent, element) {
    if (element.PropertyName === "required" && parentComponent.candidatesForm.controls[element.ControlName] != null) {
      if (this.getPropertyValue(mode, element) === "false") {
        parentComponent.candidatesForm.controls[element.ControlName].clearValidators();
        parentComponent.candidatesForm.controls[element.ControlName].setErrors(null);
      }
      else if (this.getPropertyValue(mode, element) === "true") {
        parentComponent.candidatesForm.controls[element.ControlName].setValidators([Validators.required]);
        parentComponent.candidatesForm.controls[element.ControlName].updateValueAndValidity();
      }
    }

    else if (element.PropertyName === "disabled" && parentComponent.candidatesForm.controls[element.ControlName] != null) {
      if (this.getPropertyValue(mode, element) === "true") {
        parentComponent.candidatesForm.controls[element.ControlName].disable();
        parentComponent.candidatesForm.controls[element.ControlName].clearValidators();
        parentComponent.candidatesForm.controls[element.ControlName].setErrors(null);
      }
      else if (this.getPropertyValue(mode, element) === "false") {
        parentComponent.candidatesForm.controls[element.ControlName].enable();
      }
    }
  }

  setDropDownProperties(mode, parentComponent, element) {

    if (element.PropertyName === "required" && parentComponent.candidatesForm.controls[element.ControlName] != null) {
      if (this.getPropertyValue(mode, element) === "false") {
        parentComponent.candidatesForm.controls[element.ControlName].clearValidators();
        parentComponent.candidatesForm.controls[element.ControlName].setErrors(null);
      }
      else if (this.getPropertyValue(mode, element) === "true") {
        parentComponent.candidatesForm.controls[element.ControlName].setValidators([Validators.required]);
        parentComponent.candidatesForm.controls[element.ControlName].updateValueAndValidity();
      }
    }

    else if (element.PropertyName === "disabled" && parentComponent.candidatesForm.controls[element.ControlName] != null) {


      if (this.getPropertyValue(mode, element) === "true") {
        parentComponent.candidatesForm.controls[element.ControlName].disable();
        parentComponent.candidatesForm.controls[element.ControlName].clearValidators();
        parentComponent.candidatesForm.controls[element.ControlName].setErrors(null);
      }
      else if (this.getPropertyValue(mode, element) === "false") {
        parentComponent.candidatesForm.controls[element.ControlName].enable();
      }
    }
    else if (element.PropertyName === "value" && parentComponent.candidatesForm.controls[element.ControlName] != null) {
      parentComponent.candidatesForm.controls[element.ControlName].setValue(Number(this.getPropertyValue(mode, element)));
    }
  }

  setButtonProperties(mode, parentComponent, element) {
    if (parentComponent[element.ControlName] != null)
      parentComponent[element.ControlName] = this.getPropertyValue(mode, element) === "disabled" ? !Boolean(JSON.parse(this.getPropertyValue(mode, element))) : this.getPropertyValue(mode, element);
  }

  setRadioProperties() {



  }

  setCheckBoxProperties(mode, parentComponent, element) {
    if (element.PropertyName == "disabled" && parentComponent.candidatesForm.controls[element.ControlName] != null) {
      if (this.getPropertyValue(mode, element) === "true") {
        parentComponent.candidatesForm.controls[element.ControlName].disable();
        parentComponent.candidatesForm.controls[element.ControlName].clearValidators();
        parentComponent.candidatesForm.controls[element.ControlName].setErrors(null);
      }
      else if (this.getPropertyValue(mode, element) === "false") {
        parentComponent.candidatesForm.controls[element.ControlName].enable();
      }
    }


  }

  getPropertyValue(mode, ctrl) {
    var res = mode == 1 ? ctrl.AddValue : (mode == 2 ? ctrl.EditValue : ctrl.ViewValue);
    return res;
  }

  //Add-1, edit-2, view, 3
  doApply(mode, parentComponent, menuId, GroupControlName): void {

    console.log('GroupControlName', GroupControlName);


    this.sessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses)); // get session storage
    this.RoleCode = this.sessionDetails.UIRoles[0].Role.Code;

    if (sessionStorage.getItem('activeRoleId') != null) {
      const selectedRoleDetails = this.sessionDetails.UIRoles.find(a => a.Role.Id == (sessionStorage.getItem('activeRoleId') as any));
      this.role = selectedRoleDetails.Role as any;

    }
    else {
      const selectedRoleDetails = this.sessionDetails.UIRoles[0];
      this.role = selectedRoleDetails.Role as any;
    }

    //this.role = (this.sessionDetails.UIRoles[0].Role); // get Roles
    //this.LstuserInterfaceControls = (this.sessionDetails.UIRoles.find(x => x.Role.Id == this.role.Id).UserInterfaceControls); // getting security User Access Control 

    console.log("selected role ::", this.role);

    this.LstuserInterfaceControls = (this.sessionDetails.UIRoles.find(x => x.Role.Id == this.role.Id).UserInterfaceControls); // getting security User Access Control 

    this.securityAccessControl = _.filter(this.LstuserInterfaceControls, (item) => item.MenuId == menuId);
    this._securityAccessControl = this.securityAccessControl;


    // console.log('securityAccessControl', this.securityAccessControl);
    var hiddenControls = _.filter(this.securityAccessControl, (item) => (GroupControlName == "" ? true : GroupControlName == item.GroupControlName) && item.PropertyName === "hidden" && this.getPropertyValue(mode, item).toString() == "true");

    console.log('hidden', hiddenControls);

    var visibeControls = _.filter(this.securityAccessControl, (items) => (GroupControlName == "" ? true : GroupControlName == items.GroupControlName) && hiddenControls.find(x => x.ControlName == items.ControlName) == null);

    console.log('vis', visibeControls);

    // if (GroupControlName != null || GroupControlName != undefined || GroupControlName != "") {

    //   console.log('ss', visibeControls);
    //   visibeControls = _.filter(visibeControls, (item) => item.GroupControlName === GroupControlName);
    //   console.log('xxxx', visibeControls); 

    // } 
    hiddenControls.forEach(ctrl => {
      if (ctrl.AccessControlTypeName != "button" && ctrl.AccessControlTypeName != "accordion"
        && ctrl.AccessControlTypeName != "div" && parentComponent.candidatesForm.controls[ctrl.ControlName] != null) {
        parentComponent.candidatesForm.removeControl(ctrl.ControlName);
      }
      else if (parentComponent[ctrl.ControlName] != null) {

        parentComponent[ctrl.ControlName] = !Boolean(JSON.parse(this.getPropertyValue(mode, ctrl)));
      }
    })

    visibeControls.forEach(element => {

      if (element.AccessControlTypeName === "textbox") {
        this.setTextBoxProperties(mode, parentComponent, element);
      }

      else if (element.AccessControlTypeName === "accordion") {
        this.setAccordionProperties(mode, parentComponent, element);
      }

      else if (element.AccessControlTypeName === "button") {
        this.setButtonProperties(mode, parentComponent, element);
      }

      else if (element.AccessControlTypeName == "dropdown") {


        this.setDropDownProperties(mode, parentComponent, element);
      }

      else if (element.AccessControlTypeName === "checkbox") {
        this.setCheckBoxProperties(mode, parentComponent, element);
      }

      else if (element.AccessControlTypeName === "datepicker") {
        this.setDatePickerProperties(mode, parentComponent, element);
      }

      else if (element.AccessControlTypeName === "radiobutton") {
        this.setCheckBoxProperties(mode, parentComponent, element);
      }



    });

    console.log('parentComponent', parentComponent);


  }

  onFieldValidation(string: string): Promise<Boolean> {

    console.log('testing', string);

    return new Promise((resolve, reject) => {

      this.sessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses)); // get session storage
      this.LstuserInterfaceControls = (this.sessionDetails.UIRoles[0].UserInterfaceControls); // getting security User Access Control 
      var promise = (this.LstuserInterfaceControls.find(z => z.PropertyName === "required" && z.ControlName === string) != null ? true : false);
      if (promise != null) {

        console.log('yes');
        resolve(true);

      } else {
        console.log('no');

        reject(false)
      }



    });

  }



}