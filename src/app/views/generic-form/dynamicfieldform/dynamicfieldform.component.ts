import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PagelayoutService } from 'src/app/_services/service';
import { ControlElement } from '../form-models';
import * as _ from 'lodash';
import { FormInputControlType } from '../enums';
import { InputControlType } from '../../personalised-display/enums';

@Component({
  selector: 'app-dynamicfieldform',
  templateUrl: './dynamicfieldform.component.html',
  styleUrls: ['./dynamicfieldform.component.css']
})
export class DynamicfieldformComponent implements OnInit {
  @Input() dynamicFieldDetails: any;
  @Input() formData: any;
  @Input() col_span_size: any;
  @Input() RoleCode: any;
  @Output() isChildFormValid: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    private pageLayoutService: PagelayoutService
  ) { }

  ngOnInit() {

    console.log('dynamicFieldDetails', this.dynamicFieldDetails);
    console.log('role', this.RoleCode)
    if (this.dynamicFieldDetails && this.dynamicFieldDetails.length) {
      this.dynamicFieldDetails.forEach(element => {
        if ((element.InputControlType === 1 || element.InputControlType === 2) && (element.Value !== null || element.Value !== '') && (element.DropDownList === null || element.DropDownList.length === 0)) {
          element.Value = typeof (element.Value) === 'string' ? parseFloat(element.Value) : element.Value;
          this.getDropDownList(element);
        }
      });
    }
    // this.dynamicFieldDetails != null && this.dynamicFieldDetails.ControlElemetsList != null && this.dynamicFieldDetails.ControlElemetsList.length > 0 &&   this.dynamicFieldDetails.ControlElemetsList.forEach(a => {
    //   if (a.Validators != null && a.Validators[0].Name == 'required' && a.Value == null) {
    //     a["IsInvalidControl"] = false
    //   }
    // });
  }

  getRequired(controlElement: ControlElement) {
    return (controlElement && controlElement.Validators && controlElement.Validators.find(a => a.Name === 'required')) ? "*" : "";
  }

  doCheckViewableField(controlElement: ControlElement) {

    return controlElement.ExtraProperities.ViewableRoleCodes.includes(this.RoleCode) == true ? true : false;
  }

  doCheckEditableField(controlElement: ControlElement) {
    return controlElement.ExtraProperities.EditableRoleCodes.includes(this.RoleCode) == true ? false : true;
  }

  onOpeningDropDown(controlElement: ControlElement) {
    if (controlElement.DropDownList == null || controlElement.DropDownList.length <= 0) {
      this.getDropDownList(controlElement);
    }
    else if (controlElement.DropDownList.length > 0) {
      if (controlElement.ParentFields !== null && controlElement.ParentFields.length > 0) {
        this.getDropDownList(controlElement);
      }
    }
  }

  getDropDownList(controlElement: ControlElement) {
    controlElement.DropDownList = null;
    let parentElementList: any[] = [];
    // ! FOR ITC - Branch & Distributor Column
    if (controlElement.ExtraProperities && controlElement.ExtraProperities.hasOwnProperty('IsParentFieldFromDynamicField')) {
      controlElement.ParentFields.forEach(element => {
        // const fieldName = controlElement.ExtraProperities.IsParentFieldFromDynamicField ? element : `@${element.charAt(0).toUpperCase()}${element.slice(1)}Id`;
        const controlName = controlElement.ExtraProperities.IsParentFieldFromDynamicField ? null : element.replace("@","");
        const value = controlElement.ExtraProperities.IsParentFieldFromDynamicField
          ? this.dynamicFieldDetails.find(a => a.FieldName === element).Value
          : this.formData.controls[controlName].value;
        parentElementList.push({ FieldName: element, Value: value });
      });

    }
    console.log('DynamicForm-SearchElements', parentElementList);
    this.pageLayoutService.getDataset(controlElement.DataSource, parentElementList).subscribe(dropDownList => {

      if (dropDownList.Status == true && dropDownList.dynamicObject !== null && dropDownList.dynamicObject !== '')
        controlElement.DropDownList = JSON.parse(dropDownList.dynamicObject);
      controlElement.DropDownList = _.orderBy(controlElement.DropDownList, [controlElement.DisplayField], ["asc"]);
      if (controlElement.DropDownList == null || controlElement.DropDownList.length <= 0) {
        controlElement.DropDownList = [];
      }
      // fill the value
      for (const element of this.dynamicFieldDetails) {
        if (element.InputControlType === 1 && element.Value != null) {
          if (typeof (element.Value) === 'string') {
            element.Value = parseFloat(element.Value);
          }
        }
      }
    }, error => {
      console.log(error);
      controlElement.DropDownList = [];
    })
  }

  onSelectDropDownChangeFn(e: any, controlElement: ControlElement) {
    // ! FOR ITC - to clear value if parent dynamic fields is cleared
    if(this.dynamicFieldDetails && this.dynamicFieldDetails.length) {
      for (const controlElem of this.dynamicFieldDetails) {
        if (controlElem.ParentFields && Array.isArray(controlElem.ParentFields) && controlElem.ParentFields.includes(controlElement.FieldName)) {
          controlElem.Value = null;
          if (controlElem.InputControlType === 2) {
            controlElem.MultipleValues = [];
          }
        }
      }
    }
  }

  public validateChildForm(data: any) {
    if (data === true) {
      this.isChildFormValid.emit(this.dynamicFieldDetails);
      this.dynamicFieldDetails != null && this.dynamicFieldDetails.ControlElemetsList != null && this.dynamicFieldDetails.ControlElemetsList.length > 0 && this.dynamicFieldDetails.ControlElemetsList.forEach(a => {
        if (a.Validators != null && a.Validators[0].Name == 'required' && a.Value == null) {
          a.IsInvalidControl = true;
        }
      });

      // if(this.form.valid === true) {
      //     this.isChildFormValid.emit(true);
      // } else {
      //     this.isChildFormValid.emit(false);
      // }
    }
  }

  ngOnDestroy() {
    console.log('ssssss sfadsfasd sdasg',this.dynamicFieldDetails);      
    sessionStorage.setItem('DynamicDetails', JSON.stringify(this.dynamicFieldDetails));
    this.isChildFormValid.emit(this.dynamicFieldDetails);
  }
}
