import { Component, OnInit, Type , Input, AfterViewInit } from '@angular/core';
import { FormLayout, RowDetails, ControlElement, FormAuditModel, DataSourceTreeNode } from '../../../../views/generic-form/form-models';
import { FormInputControlType, GroupType, ElementType, RelationWithParent } from '../../../../views/generic-form/enums';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HeaderService } from 'src/app/_services/service/header.service';
import { Title } from '@angular/platform-browser';
import { ignoreElements } from 'rxjs/operators';
import { PagelayoutService } from 'src/app/_services/service/pagelayout.service';
import { DataSourceType } from '../../../../views/personalised-display/enums';
import { ActivatedRoute, Router } from '@angular/router';
import { RowDataService } from '../../../../views/personalised-display/row-data.service';
import { throwToolbarMixedModesError } from '@angular/material';
import { stringFilterCondition } from 'angular-slickgrid/app/modules/angular-slickgrid/filter-conditions/stringFilterCondition';
import { AlertService } from 'src/app/_services/service/alert.service';
import Swal from 'sweetalert2';
import { AngularGridInstance } from 'angular-slickgrid';
import { DataSource, SearchElement } from '../../../../views/personalised-display/models';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import _ from 'lodash';
import { objectStringSorter } from 'angular-slickgrid/app/modules/angular-slickgrid/sorters/objectStringSorter';

@Component({
  selector: 'app-generic-form-ui-modal',
  templateUrl: './generic-form-ui-modal.component.html',
  styleUrls: ['./generic-form-ui-modal.component.css']
})
export class GenericFormUiModalComponent implements OnInit{

  @Input() dataSourceTree : DataSourceTreeNode;
  @Input() id : number;
  @Input() entityRelations : any;
  @Input () rowData : any;
  @Input() isEdit : boolean = false;

  genericForm : FormGroup;
  editing : boolean = false;
  spinner : boolean = false;
  oldRowDetailsList : RowDetails[];

  formAuditModel : FormAuditModel;
  constructor(
    private activeModal: NgbActiveModal,
    private pageLayoutService : PagelayoutService
  ) { }

  ngOnInit() {
    let formObject = {};
    console.log(this.id , this.rowData);
    this.insertControlElementsIntoObj(formObject , this.dataSourceTree.RowDetailsList);
    if(this.isEdit){
      formObject['Id'] = new FormControl(this.rowData["Id"]);
      formObject['id'] = new FormControl(this.rowData["id"]);
    }
    else {
      formObject['Id'] = new FormControl(0);
      formObject['id'] = new FormControl(0);
    }
    console.log(formObject);
    this.genericForm = new FormGroup(formObject);
    console.log(this.genericForm);
    this.setGridForChildElements();
    this.oldRowDetailsList = JSON.parse(JSON.stringify(this.dataSourceTree.RowDetailsList));
    
  }

  async insertControlElementsIntoObj(obj : {} , rowDetailsList : RowDetails[]){
    for(let rowDetails of rowDetailsList){
      if(rowDetails.ColumnDetailsList !==null && rowDetails.ColumnDetailsList.length > 0){
        for(let columnDetails of rowDetails.ColumnDetailsList){

          if(columnDetails.ElementType == ElementType.ControlElement){

            if(this.isEdit)
              columnDetails.ControlElement.Value = this.rowData[columnDetails.ControlElement.FieldName];
            else
              columnDetails.ControlElement.Value = null;

            if(columnDetails.ControlElement.Validators !== null && columnDetails.ControlElement.Validators.length > 0){
              let validators : any[] = [];  
              for(let validator of columnDetails.ControlElement.Validators){
                validators.push(Validators[validator.Name]);
              }
             
              obj[columnDetails.ControlElement.FieldName] = new FormControl(columnDetails.ControlElement.Value , validators);
              
            }
            else {
                obj[columnDetails.ControlElement.FieldName] = new FormControl(columnDetails.ControlElement.Value);
            }
  
            if(columnDetails.ControlElement.InputControlType == FormInputControlType.AutoFillTextBox 
              || columnDetails.ControlElement.InputControlType == FormInputControlType.MultiSelectDropDown 
              || columnDetails.ControlElement.InputControlType === FormInputControlType.DropDown){
              if(columnDetails.ControlElement.LoadDataOnPageLoad){
                let val = await this.getDropDownList(columnDetails.ControlElement)
              }
            }
          }

          else{
            this.insertControlElementsIntoObj(obj , columnDetails.GroupElement.RowDetailsList); 
          }

        }
      }
    }
  }

  setGridForChildElements(){
    for(let child of this.dataSourceTree.Children ){
      if(child.RelationWithParent === RelationWithParent.OnetoMany){
        child.Columns = this.pageLayoutService.setColumns(child.GridConfiguration.ColumnDefinitionList);
        child.GridOptions = this.pageLayoutService.setGridOptions(child.GridConfiguration);
        
      }
    }
  }

  editForm (){
    this.editing = true;
    //this.id.toString();
    console.log(this.rowData);

    this.genericForm.patchValue(this.rowData);
    console.log(this.genericForm.value);

    // delete this.rowData['Id']
    this.formAuditModel = {
      OldDetails : JSON.stringify(this.rowData),
      NewDetails : JSON.stringify(this.rowData),
      Id : this.id,
      RowDetailsList : null,
      
    }

    let searchElements : {
      FieldName : string,
      Value : string
    }[] = [];

    for(let child of this.dataSourceTree.Children){
      searchElements = [];
      for(let parent of Object.keys(this.entityRelations[child.DataSource.Name])){
        for(let key of Object.keys(this.entityRelations[child.DataSource.Name][parent])){
          console.log(parent,key);
          searchElements.push({
            FieldName : this.entityRelations[child.DataSource.Name][parent][key],
            Value : this.genericForm.value[key]
          })
        }
      }
      this.getDataset(child,child.DataSource,searchElements);
    }

   
  }

  getDataset(treeNode : DataSourceTreeNode ,dataSource : DataSource , searchElements : SearchElement[] = null ){
    this.spinner = true;
    this.pageLayoutService.getDataset(dataSource,searchElements).subscribe(
      data => {
        this.spinner=false;
        if(data.Status == true && data.dynamicObject !== null && data.dynamicObject !== ''){
          treeNode.Dataset = JSON.parse(data.dynamicObject);
          
          treeNode.Dataset.forEach(element => {
            element["Status"] = element.Status == 0 ? "In-Active" : "Active";
          });
        }
        else {
          console.log('Sorry! Could not Fetch Data |', data);
        }
      },
      error => {
        this.spinner=false;
        console.log(error);
      }
    )

  }

  getDropDownList(controlElement : ControlElement){
    console.log("DropDownlist for" , controlElement);
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

  onSave(){
    console.log(this.genericForm.value);

    if(this.isEdit){
      let formValue = _.cloneDeep(this.genericForm.value);
      let newData = _.cloneDeep(this.rowData);
      Object.assign(newData , this.genericForm.getRawValue());
      this.dataSourceTree.AngularGrid.gridService.updateItem(newData , {highlightRow : false});
    }
    else{
      if(this.dataSourceTree.OldRowDetailsList == undefined || this.dataSourceTree.OldRowDetailsList == null)
        this.dataSourceTree.OldRowDetailsList = [];
      
      if(this.dataSourceTree.NewRowDetailsList == undefined ||this.dataSourceTree.NewRowDetailsList == null)
        this.dataSourceTree.NewRowDetailsList = []

      this.dataSourceTree.OldRowDetailsList.push(
        {
          Id : this.id,
          RowDetailsList : this.oldRowDetailsList
        }
        )
      this.dataSourceTree.NewRowDetailsList.push({
        Id : this.id,
        RowDetailsList : this.dataSourceTree.RowDetailsList
      })

      let formValue = _.cloneDeep(this.genericForm.value);
      console.log("Adding id to formValue");
      formValue.id = this.dataSourceTree.Dataset == undefined || 
        this.dataSourceTree.Dataset == null || this.dataSourceTree.Dataset.length <= 0 ? 0 : this.dataSourceTree.Dataset.length;

      if(this.dataSourceTree.Dataset == undefined || this.dataSourceTree.Dataset == null){
        this.dataSourceTree.Dataset = [];
        this.dataSourceTree.Dataset.push(formValue);
      }
      else{
        this.dataSourceTree.AngularGrid.gridService.addItem(formValue , {highlightRow : false});

      }
    }

    


    this.activeModal.close();
  }

  closeModal(){
    this.activeModal.close();
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

}
