import { Component, EventEmitter, Input, OnInit, Output, Type } from '@angular/core';
import { FormLayout, RowDetails, ControlElement, FormAuditModel, DataSourceTreeNode } from '../form-models';
import { FormInputControlType, GroupType, ElementType, RelationWithParent } from '../enums';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HeaderService } from 'src/app/_services/service/header.service';
import { Title } from '@angular/platform-browser';
import { PagelayoutService } from 'src/app/_services/service/pagelayout.service';
import { DataSourceType } from '../../personalised-display/enums';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { RowDataService } from '../../personalised-display/row-data.service';
import { AlertService } from 'src/app/_services/service/alert.service';
import Swal from 'sweetalert2';
import { AngularGridInstance } from 'angular-slickgrid';
import { DataSource, SearchElement, ColumnDefinition } from '../../personalised-display/models';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GenericFormUiModalComponent } from 'src/app/shared/modals/generic-form-modals/generic-form-ui-modal/generic-form-ui-modal.component';
import { FormLayoutService } from 'src/app/_services/service/form-layout.service';
import { ApiRequestType } from '../../generic-import/import-enums';
import _ from 'lodash';
import moment from 'moment';

@Component({
  selector: 'app-form-view',
  templateUrl: './form-view.component.html',
  styleUrls: ['./form-view.component.css']
})
export class FormViewComponent implements OnInit {

  // @Input() rowDetailsList : RowDetails[]; 
  @Input() code : string;
  @Input() displayType : string;
  @Input() formLayout : FormLayout;

  @Output() onFormCreated = new EventEmitter<any>();

  genericForm : FormGroup;

  formAuditModel : FormAuditModel;
  formObject : any;
  defaultFormObject : any;
  spinner : boolean = false;
  oldRowDetailsList : RowDetails[];
  formData : any;

  //editing
  editing : boolean = false;
  id : number;

  //Save
  submitted : boolean = false;
  
  constructor(
    private titleService : Title, 
    private headerService : HeaderService,
    private pageLayoutService : PagelayoutService,
    private formLayoutService : FormLayoutService,
    private route : ActivatedRoute ,
    private router : Router,
    private rowDataService : RowDataService,
    public modalService: NgbModal,
    private alertService : AlertService
  ) { }

  ngOnInit() {
    this.setUpFormControls();
  }

  getFormLayout(code : string){
    this.formLayout = null;
    this.spinner = true;

    this.formLayoutService.getFormLayout(code).subscribe(data =>{
      this.spinner = false;
      console.log("Form Result",data);
      if (data.Status === true && data.dynamicObject != null) {
        this.formLayout = data.dynamicObject;
        console.log("Form Layout ::" , this.formLayout);


        //Generate Form
        this.formObject = {};
        this.insertControlElementsIntoObj(this.formObject , this.formLayout.DataSourceTree.RowDetailsList);
        console.log(this.formObject);
        this.formObject['Id'] = new FormControl(0);
        this.genericForm = new FormGroup(this.formObject);
        this.defaultFormObject = this.genericForm.getRawValue();
        console.log(this.genericForm);
        console.log(this.defaultFormObject);

        //Check For Readonly Elements
        this.checkForReadOnly(this.formLayout.DataSourceTree.RowDetailsList);

        //Set Grid for One to Many relation child
        this.setGridForChildElements();
        // this.editForm();
        
     
      }



    }, error => {
      this.spinner = false;
      console.log(error);
      this.alertService.showWarning("Couldn't load form! Unknown Error Occured");
    })
  }

  // Generates the Form Group using Control Elements
  setUpFormControls(){
    console.log("Form Layout ::" , this.formLayout);

    //Generate Form
    this.formObject = {};
    this.insertControlElementsIntoObj(this.formObject , this.formLayout.DataSourceTree.RowDetailsList);
    console.log(this.formObject);
    this.formObject['Id'] = new FormControl(0);
    this.genericForm = new FormGroup(this.formObject);
    this.defaultFormObject = this.genericForm.getRawValue();
    console.log(this.genericForm);
    console.log(this.defaultFormObject);

    //Check For Readonly Elements
    this.checkForReadOnly(this.formLayout.DataSourceTree.RowDetailsList);

    this.onFormCreated.emit(this.genericForm);

    //Set Grid for One to Many relation child
    this.setGridForChildElements();
  }

  insertControlElementsIntoObj(obj : {} , rowDetailsList : RowDetails[]){
    for(let rowDetails of rowDetailsList){
      if(rowDetails.ColumnDetailsList !==null && rowDetails.ColumnDetailsList.length > 0){
        for(let columnDetails of rowDetails.ColumnDetailsList){

          if(columnDetails.ElementType == ElementType.ControlElement){

            let defaultValue : any;

            if(columnDetails.ControlElement.DefaultValue !== undefined && columnDetails.ControlElement.DefaultValue !== null){
              defaultValue = columnDetails.ControlElement.DefaultValue;

              if(defaultValue.toLowerCase() === 'false'){
                defaultValue = false;
              }
              else if(defaultValue.toLowerCase() === 'true'){
                defaultValue = true;
              }
              else if(defaultValue.toLowerCase() === 'null'){
                defaultValue = null;
              }
            }
            else{
              defaultValue = null;
            }

            if(columnDetails.ControlElement.Validators !== null && columnDetails.ControlElement.Validators.length > 0){
              let validators : any[] = [];  
              for(let validator of columnDetails.ControlElement.Validators){
                validators.push(Validators[validator.Name]);
              }
              obj[columnDetails.ControlElement.FieldName] = new FormControl(defaultValue , validators);
            }
            else {
              obj[columnDetails.ControlElement.FieldName] = new FormControl(defaultValue);
            }
  
            // console.log("Control Element ::" , columnDetails.ControlElement , obj);
          }

          else{
            this.insertControlElementsIntoObj(obj , columnDetails.GroupElement.RowDetailsList); 
          }

        }
      }
    }
  }

  checkForReadOnly(rowDetailsList : RowDetails[]){
    for(let rowDetails of rowDetailsList){
      if(rowDetails.ColumnDetailsList !==null && rowDetails.ColumnDetailsList.length > 0){
        for(let columnDetails of rowDetails.ColumnDetailsList){
          if(columnDetails.ElementType == ElementType.ControlElement && columnDetails.ControlElement.ReadOnly){
            this.genericForm.controls[columnDetails.ControlElement.FieldName].disable();
          }
          else{
            this.checkForReadOnly(columnDetails.GroupElement.RowDetailsList);
          }
        }
      }
    }
  }

  checkForOnUILoad(rowDetailsList : RowDetails[]){
    for(let rowDetails of rowDetailsList){
      if(rowDetails.ColumnDetailsList !==null && rowDetails.ColumnDetailsList.length > 0){
        for(let columnDetails of rowDetails.ColumnDetailsList){
          if(columnDetails.ElementType == ElementType.ControlElement){
            if(columnDetails.ControlElement.InputControlType == FormInputControlType.AutoFillTextBox 
              || columnDetails.ControlElement.InputControlType == FormInputControlType.MultiSelectDropDown 
              || columnDetails.ControlElement.InputControlType === FormInputControlType.DropDown){
              if(columnDetails.ControlElement.LoadDataOnPageLoad){
                  this.getDropDownList(columnDetails.ControlElement)
              }
            }
          }
          else{
            this.checkForOnUILoad(columnDetails.GroupElement.RowDetailsList);
          }
        }
      }
    }
    
  }

  onOpeningDropDown(controlElement : ControlElement){
    if(controlElement.DropDownList == null || controlElement.DropDownList.length <= 0){
      this.getDropDownList(controlElement);
    }
    // else if(controlElement.DropDownList.length > 0){
    //   if(controlElement.ParentFields !== null && controlElement.ParentFields.length > 0){
    //     this.getDropDownList(controlElement);
    //   }

    // }
  }

  getDropDownList(controlElement : ControlElement){
    controlElement.DropDownList = null;
    let parentElementList : any[] = null;
    if(controlElement.ParentFields !== null && controlElement.ParentFields !== []){
      parentElementList = this.getParentControlElementList(controlElement);
    }
    this.pageLayoutService.getDataset(controlElement.DataSource , parentElementList).subscribe(dropDownList =>
      { 
        
        if(dropDownList.Status == true && dropDownList.dynamicObject !== null && dropDownList.dynamicObject !== '') 
          controlElement.DropDownList = JSON.parse(dropDownList.dynamicObject);
        
        if(controlElement.DropDownList == null || controlElement.DropDownList.length <= 0){
          console.log("could not fetch list of " + controlElement.Label);
          controlElement.DropDownList = [];
        }
      } , error => {
        console.log(error);
        controlElement.DropDownList = [];
      })
  }

  getParentControlElementList(controlElement : ControlElement){
    let parentElementList :  {
      FieldName : string,
      Value : null
    }[] = [];
    for(let parent of controlElement.ParentFields){
      parentElementList.push({
        FieldName : parent,
        Value : this.genericForm.controls[parent].value
      })
    }
    return parentElementList;
  }

  setGridForChildElements(){
    for(let child of this.formLayout.DataSourceTree.Children ){
      if(child.RelationWithParent === RelationWithParent.OnetoMany){
        child.Columns = this.pageLayoutService.setColumns(child.GridConfiguration.ColumnDefinitionList);
        child.GridOptions = this.pageLayoutService.setGridOptions(child.GridConfiguration);
        child.GridOptions = {
          datasetIdPropertyName : 'id'
        }        
      }
    }
  }


  onControlElementDisplayValueChange(controlElement: ControlElement , event = null) {
    
    this.modifyFormControlValueBasedOnInputControlType(controlElement , event);

  }

  modifyFormControlValueBasedOnInputControlType(controlElement : ControlElement , event = null){
    let count = 0;
    if(controlElement.InputControlType === FormInputControlType.CommaSeparatedNumbers){
      if(controlElement.DisplayValue === undefined || controlElement.DisplayValue === null ||controlElement.DisplayValue === ''){
        controlElement.DisplayValue = null;
        // controlElement.Value = null;
        this.genericForm.get(controlElement.FieldName).setValue(null);
      }
      else{
        let inputNumbers : number[] = controlElement.DisplayValue.split(",").map(Number);
        if(inputNumbers === undefined || inputNumbers === null || inputNumbers.length <= 0){
          this.genericForm.get(controlElement.FieldName).setValue(null);
          controlElement.DisplayValue = null;
        }
        else{
          this.genericForm.get(controlElement.FieldName).setValue(JSON.stringify(inputNumbers));
        }
      }
      // console.log("number" ,  inputNumbers);
      // console.log("Comma Separated values ::" , searchElement);

    }
    else if(controlElement.InputControlType === FormInputControlType.CommaSeparatedStrings){
      
      
      if(controlElement.DisplayValue === undefined || controlElement.DisplayValue === null ||controlElement.DisplayValue === ''){
        controlElement.DisplayValue = null;
        this.genericForm.get(controlElement.FieldName).setValue(null);
      }
      else{
        let inputStrings = controlElement.DisplayValue.split(",");
        if(inputStrings === undefined || inputStrings === null || inputStrings.length <= 0){
          this.genericForm.get(controlElement.FieldName).setValue(null);
          controlElement.DisplayValue = null;
        }
        else{
          this.genericForm.get(controlElement.FieldName).setValue(JSON.stringify(inputStrings));
        }
      }

      

      // console.log("number" ,  inputStrings);
      // console.log("Comma Separated values ::" , searchElement);

    }
    else if(controlElement.InputControlType === FormInputControlType.DatePicker){
     
      // count = count + 1;
      // alert(count)
      console.log("Event ::" , event , controlElement);

      // If Clear button is pressed
      if(event === null){
        controlElement.DisplayValue = null;
        this.genericForm.get(controlElement.FieldName).setValue(null);
      }
      else{
        this.genericForm.get(controlElement.FieldName).setValue(moment(event).format("YYYY-MM-DD HH:mm:ss"));
      }

    }
    else if(controlElement.InputControlType === FormInputControlType.MultiSelectDropDown){
      if(controlElement.DisplayValue === undefined || controlElement.DisplayValue === null ||controlElement.DisplayValue === '' ||
        controlElement.DisplayValue.length <= 0){
        controlElement.DisplayValue = null;
        this.genericForm.get(controlElement.FieldName).setValue(null);
      }
      else{
        this.genericForm.get(controlElement.FieldName).setValue(JSON.stringify(controlElement.DisplayValue));
      }
    }
  }

}
