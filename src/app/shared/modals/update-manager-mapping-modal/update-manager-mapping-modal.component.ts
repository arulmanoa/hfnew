import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { NzDrawerRef } from 'ng-zorro-antd';
import { FormLayout, RowDetails, ControlElement, FormAuditModel, DataSourceTreeNode } from 'src/app/views/generic-form/form-models';
import { HeaderService } from 'src/app/_services/service/header.service';
import { Title } from '@angular/platform-browser';
import { PagelayoutService } from 'src/app/_services/service/pagelayout.service';
import { AlertService } from 'src/app/_services/service/alert.service';
import Swal from 'sweetalert2';
import { AngularGridInstance } from 'angular-slickgrid';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GenericFormUiModalComponent } from 'src/app/shared/modals/generic-form-modals/generic-form-ui-modal/generic-form-ui-modal.component';
import { FormLayoutService } from 'src/app/_services/service/form-layout.service';
import _ from 'lodash';
import { LoginResponses } from 'src/app/_services/model';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { SessionStorage } from '../../../_services/service//session-storage.service';
import { RelationWithParent, ElementType, FormInputControlType, GroupType } from 'src/app/views/generic-form/enums';
import { ApiRequestType } from 'src/app/views/generic-import/import-enums';
import { DataSourceType } from 'src/app/views/personalised-display/enums';
import {DataSource, SearchElement, ColumnDefinition } from 'src/app/views/personalised-display/models';
import { RowDataService } from 'src/app/views/personalised-display/row-data.service';

@Component({
  selector: 'app-update-manager-mapping-modal',
  templateUrl: './update-manager-mapping-modal.component.html',
  styleUrls: ['./update-manager-mapping-modal.component.css']
})
export class UpdateManagerMappingModalComponent implements OnInit {

  @Input() rowData: any;
  //General
  code: string;
  formLayout: FormLayout;
  genericForm: FormGroup;
  formAuditModel: FormAuditModel;
  formObject: any;
  defaultFormObject: any;
  spinner: boolean = false;
  oldRowDetailsList: RowDetails[];
  formData: any;
  _loginSessionDetails: LoginResponses;
  //editing
  editing: boolean = false;
  id: number;
  //Save
  submitted: boolean = false;

  constructor(
    private drawerRef: NzDrawerRef<string>,
    private titleService: Title,
    private headerService: HeaderService,
    private pageLayoutService: PagelayoutService,
    private formLayoutService: FormLayoutService,
    private route: ActivatedRoute,
    private router: Router,
    private rowDataService: RowDataService,
    public modalService: NgbModal,
    private alertService: AlertService,
    public sessionService: SessionStorage,
  ) {}

  ngOnInit() {
    this._loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses));
    this.code = 'userHierarchyTest';
    this.getFormLayout(this.code);
    console.log("Form ::", this.code);
  }

  getFormLayout(code: string) {
    this.formLayout = null;
    this.spinner = true;
    this.id = 0;
    this.titleService.setTitle('Loading');
    this.headerService.setTitle('');
    this.formLayoutService.getFormLayout(code).subscribe(data => {
      this.spinner = false;
      console.log("Form Result", data);
      if (data.Status === true && data.dynamicObject != null) {
        this.formLayout = data.dynamicObject;
        console.log("Form Layout ::", this.formLayout);
        //Set Title

        if (this.formLayout == undefined || this.formLayout == null) {
          this.router.navigate(["app/dashboard"]);
          return;
        }

        if (this.formLayout.PageProperties !== undefined && this.formLayout.PageProperties !== null) {
          this.titleService.setTitle(this.formLayout.PageProperties.PageTitle);
          this.headerService.setTitle(this.formLayout.PageProperties.BannerText);
        }

        //Generate Form
        this.formObject = {};
        this.insertControlElementsIntoObj(this.formObject, this.formLayout.DataSourceTree.RowDetailsList);
        console.log('formObject -->', this.formObject);
        this.formObject['Id'] = new FormControl(0);
        this.genericForm = new FormGroup(this.formObject);
        this.defaultFormObject = this.genericForm.getRawValue();
        console.log('genericForm -->', this.genericForm);
        console.log('defaultFormObject -->', this.defaultFormObject);

        //Check For Readonly Elements
        this.checkForReadOnly(this.formLayout.DataSourceTree.RowDetailsList);

        //Set Grid for One to Many relation child
        this.setGridForChildElements();
        this.editForm();
      }
    }, error => {
      this.spinner = false;
      console.log(error);
      this.alertService.showWarning("Couldn't load form! Unknown Error Occured");
    })
  }

  setGridForChildElements() {
    for (let child of this.formLayout.DataSourceTree.Children) {
      if (child.RelationWithParent === RelationWithParent.OnetoMany) {
        child.Columns = this.pageLayoutService.setColumns(child.GridConfiguration.ColumnDefinitionList);
        child.GridOptions = this.pageLayoutService.setGridOptions(child.GridConfiguration);
        child.GridOptions = {
          datasetIdPropertyName: 'id'
        }
      }
    }
  }

  editForm() {
    this.editing = true;
    this.spinner = true;
    this.id = this.rowData && this.rowData.length ? this.rowData[0].Id : '0'; // this.rowData.map(obj => String(obj.Id)).join(',') : '0';
    this.pageLayoutService.getDataset(this.formLayout.DataSourceTree.DataSource, [{ FieldName: 'Id', Value: this.id }])
      .subscribe(
        data => {
          this.spinner = false;
          console.log('DATASET API RES', data);
          if (data.Status == true && data.dynamicObject !== null && data.dynamicObject !== '') {
            let formData = JSON.parse(data.dynamicObject);
            formData = formData[0];
            console.log('formData-RESULT', JSON.parse(data.dynamicObject));
            this.formData = formData;
            // to enable multiselect option
            if(this.rowData && this.rowData.length > 1) {
              this.formData.EmployeeCodes = this.rowData.map(obj => String(obj.Code)).join(',');
            }
            this.formData.EmployeeIds = this.rowData.map(obj => String(obj.Id));
            this.genericForm.patchValue(formData);
            this.checkForOnPageLoad(this.formLayout.DataSourceTree.RowDetailsList);
            
            this.formAuditModel = {
              OldDetails: JSON.stringify(formData),
              NewDetails: JSON.stringify(formData),
              Id: this.id,
              RowDetailsList: null,
              //DataSourceList : this.formLayout.DataSourceList,
              EntityRelations: this.formLayout.EntityRelations,
              //OldRowDetailsList : this.formLayout.RowDetailsList
            }

            this.oldRowDetailsList = JSON.parse(JSON.stringify(this.formLayout.DataSourceTree.RowDetailsList));

            let searchElements: {
              FieldName: string,
              Value: string
            }[] = [];

            for (let child of this.formLayout.DataSourceTree.Children) {
              searchElements = [];
              for (let parent of Object.keys(this.formLayout.EntityRelations[child.DataSource.Name])) {
                for (let key of Object.keys(this.formLayout.EntityRelations[child.DataSource.Name][parent])) {
                  console.log(parent, key);
                  searchElements.push({
                    FieldName: this.formLayout.EntityRelations[child.DataSource.Name][parent][key],
                    Value: this.genericForm.getRawValue()[key]
                  })
                }
              }
              this.getDataset(child, child.DataSource, searchElements);
            }

          }
          else {
            console.log(data);
          }
        }, error => {
          this.spinner = false;
          console.log(error);
        });
  }


  getDataset(treeNode: DataSourceTreeNode, dataSource: DataSource, searchElements: SearchElement[] = null) {
    this.spinner = true;
    this.pageLayoutService.getDataset(dataSource, searchElements).subscribe(
      data => {
        this.spinner = false;
        if (data.Status == true && data.dynamicObject !== null && data.dynamicObject !== '') {
          treeNode.Dataset = JSON.parse(data.dynamicObject);

          if (treeNode.Dataset != undefined && treeNode.Dataset != null && treeNode.Dataset.length > 0) {
            for (let i = 0; i < treeNode.Dataset.length; ++i) {
              treeNode.Dataset[i].id = i;
              if (treeNode.Dataset[i].hasOwnProperty('Status')) {
                treeNode.Dataset[i]['Status'] = treeNode.Dataset[i]['Status'] == 0 ? "In-Active" : "Active";
              }
            }
          }
        }
        else {
          console.log('Sorry! Could not Fetch Data |', data);
        }
      },
      error => {
        this.spinner = false;
        console.log(error);
      }
    )

  }

  insertControlElementsIntoObj(obj: {}, rowDetailsList: RowDetails[]) {
    for (let rowDetails of rowDetailsList) {
      if (rowDetails.ColumnDetailsList !== null && rowDetails.ColumnDetailsList.length > 0) {
        for (let columnDetails of rowDetails.ColumnDetailsList) {

          if (columnDetails.ElementType == ElementType.ControlElement) {
            if (columnDetails.ControlElement.Validators !== null && columnDetails.ControlElement.Validators.length > 0) {
              let validators: any[] = [];
              for (let validator of columnDetails.ControlElement.Validators) {
                validators.push(Validators[validator.Name]);
              }
              obj[columnDetails.ControlElement.FieldName] = new FormControl(null, validators);
            }
            else {
              obj[columnDetails.ControlElement.FieldName] = new FormControl(null);
              const businessType = this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping != null ? this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this._loginSessionDetails.Company.Id).BusinessType : 0;
              if (businessType == 3 && this.id == 0 && columnDetails.ControlElement.FieldName == 'IsMustorRollApplicable') {
                columnDetails.ControlElement.Value = 'true';
                console.log('IsMustorRollApplicable OBJ', columnDetails.ControlElement);
              }
            }


          }

          else {
            this.insertControlElementsIntoObj(obj, columnDetails.GroupElement.RowDetailsList);
          }

        }
      }
    }
  }

  checkForOnPageLoad(rowDetailsList: RowDetails[]) {
    for (let rowDetails of rowDetailsList) {
      if (rowDetails.ColumnDetailsList !== null && rowDetails.ColumnDetailsList.length > 0) {
        for (let columnDetails of rowDetails.ColumnDetailsList) {
          if (columnDetails.ElementType == ElementType.ControlElement) {
            if (columnDetails.ControlElement.InputControlType == FormInputControlType.AutoFillTextBox
              || columnDetails.ControlElement.InputControlType == FormInputControlType.MultiSelectDropDown
              || columnDetails.ControlElement.InputControlType === FormInputControlType.DropDown) {
              if (columnDetails.ControlElement.LoadDataOnPageLoad) {
                this.getDropDownList(columnDetails.ControlElement)
              }
            }
          }
          else {
            this.checkForOnPageLoad(columnDetails.GroupElement.RowDetailsList);
          }
        }
      }
    }

  }

  checkForReadOnly(rowDetailsList: RowDetails[]) {
    for (let rowDetails of rowDetailsList) {
      if (rowDetails.ColumnDetailsList !== null && rowDetails.ColumnDetailsList.length > 0) {
        for (let columnDetails of rowDetails.ColumnDetailsList) {
          if (columnDetails.ElementType == ElementType.ControlElement && columnDetails.ControlElement.ReadOnly) {
            this.genericForm.controls[columnDetails.ControlElement.FieldName].disable();
          } else  if (this.router.url.includes('Team') && columnDetails.ControlElement.FieldName == 'PayGroupId') {
            // call API to get dropdown list data
            let parentElementList: any[] = null;
            const controlElement = columnDetails.ControlElement;
            if (controlElement.ParentFields !== null && Array.isArray(controlElement.ParentFields) && controlElement.ParentFields.length) {
              parentElementList = this.getParentControlElementList(controlElement);
            }
            // and set default value as "ciel flexibale pay structure by CTC and disable the dropdown"
            this.pageLayoutService.getDataset(controlElement.DataSource, parentElementList).subscribe(dropDownList => {
              if (dropDownList.Status && dropDownList.dynamicObject && dropDownList.dynamicObject !== '') {
                controlElement.DropDownList = JSON.parse(dropDownList.dynamicObject);
                if (controlElement.DropDownList.length) {
                  const businessType = this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping != null ? this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this._loginSessionDetails.Company.Id).BusinessType : 0;
                  const flexPayStructureVal =  controlElement.DropDownList.find( list => list['Name'] == 'CIEL Flexible Pay Structure using CTC' );
                  if (flexPayStructureVal && businessType == 3) {
                    this.genericForm.controls[columnDetails.ControlElement.FieldName].setValue(flexPayStructureVal[controlElement.ValueField]);
                    this.genericForm.controls[columnDetails.ControlElement.FieldName].disable();
                  }
                  console.log("PayGroup-drpdwn value:::" , flexPayStructureVal);
                } else {
                  console.log("no data for PayGroup dropdown ", controlElement);
                  controlElement.DropDownList = [];
                }
              } else {
                console.log("could not fetch for PayGroup dropdown", controlElement);
                controlElement.DropDownList = [];
              }
            }, error => {
              console.log("could not fetch dropdown list for PayGroup :::", error);
              controlElement.DropDownList = [];
            })
           
          } else {
            this.checkForReadOnly(columnDetails.GroupElement.RowDetailsList);
          }
        }
      }
    }
  }


  onOpeningDropDown(controlElement: ControlElement) {
    console.log(' *** dropdown ControlElement***',  controlElement);
    this.getDropDownList(controlElement);
  }

  getDropDownList(controlElement: ControlElement) {
    controlElement.DropDownList = null;
    let parentElementList: any[] = null;
    if (controlElement.ParentFields !== null && Array.isArray(controlElement.ParentFields) && controlElement.ParentFields.length) {
      parentElementList = this.getParentControlElementList(controlElement);
    }
    this.pageLayoutService.getDataset(controlElement.DataSource, parentElementList).subscribe(dropDownList => {

      if (dropDownList.Status == true && dropDownList.dynamicObject !== null && dropDownList.dynamicObject !== '')
        controlElement.DropDownList = JSON.parse(dropDownList.dynamicObject);

      if (controlElement.DropDownList == null || controlElement.DropDownList.length <= 0) {
        console.log("could not fetch list of " + controlElement.Label);
        controlElement.DropDownList = [];
      }
    }, error => {
      console.log(error);
      controlElement.DropDownList = [];
    })
  }

  getParentControlElementList(controlElement: ControlElement) {
    let parentElementList: {
      FieldName: string,
      Value: null
    }[] = [];
    for (let parent of controlElement.ParentFields) {
      parentElementList.push({
        FieldName: parent,
        Value: this.genericForm.controls[parent].value
      })
    }
    return parentElementList;
  }

  angularGridReady(dataSourceTreeNode: DataSourceTreeNode, angularGrid: AngularGridInstance) {
    dataSourceTreeNode.AngularGrid = angularGrid;
    dataSourceTreeNode.GridObj = angularGrid.slickGrid; // grid object
    dataSourceTreeNode.DataviewObj = angularGrid.dataView;
  }

  onAddButtonClicked(dataSourceTreeNode: DataSourceTreeNode) {
    const modalRef = this.modalService.open(GenericFormUiModalComponent);
    modalRef.componentInstance.id = 0;
    modalRef.componentInstance.isEdit = false;
    modalRef.componentInstance.dataSourceTree = dataSourceTreeNode;
    modalRef.componentInstance.entityRelations = this.formLayout.EntityRelations;
    modalRef.result.then((result) => {
      console.log("DatasourceTree ::", this.formLayout.DataSourceTree);
    })
  }

  onCellClicked(dataSourceTreeNode: DataSourceTreeNode, e, args) {
    // const metadata = this.angularGrid.gridService.getColumnFromEventArguments(args);
    // if (metadata.columnDef.id === 'edit') {
    //   this.CitiesObject = metadata.dataContext;
    //   this.addCity();
    // }
    // else if (metadata.columnDef.id === 'delete') {
    //    this.sweetalertConfirm(metadata.dataContext);
    // }

    const column = dataSourceTreeNode.AngularGrid.gridService.getColumnFromEventArguments(args);
    console.log(column);
    var flag = false;
    for (var i = 0; i < dataSourceTreeNode.GridConfiguration.ColumnDefinitionList.length; ++i) {
      //console.log(dataSourceTreeNode.GridConfiguration.ColumnDefinitionList[i]);
      if (column.columnDef.id === dataSourceTreeNode.GridConfiguration.ColumnDefinitionList[i].Id) {
        console.log(dataSourceTreeNode.GridConfiguration.ColumnDefinitionList[i]);
        flag = dataSourceTreeNode.GridConfiguration.ColumnDefinitionList[i].Clickable;
        if (flag) {
          console.log("clicked", column)
          if (dataSourceTreeNode.GridConfiguration.ColumnDefinitionList[i].FunctionName !== null
            && dataSourceTreeNode.GridConfiguration.ColumnDefinitionList[i].FunctionName !== '') {
            this.executeFunction(dataSourceTreeNode.GridConfiguration.ColumnDefinitionList[i], column.dataContext)
          }
          else if (dataSourceTreeNode.GridConfiguration.ColumnDefinitionList[i].RouteLink !== null
            && dataSourceTreeNode.GridConfiguration.ColumnDefinitionList[i].RouteLink !== '') {

            if (dataSourceTreeNode.GridConfiguration.ColumnDefinitionList[i].SendValuesToSearchElements) {
              this.rowDataService.dataInterface.RowData = column.dataContext;
              if (dataSourceTreeNode.GridConfiguration.ColumnDefinitionList[i].SearchElementValuesList !== null
                && dataSourceTreeNode.GridConfiguration.ColumnDefinitionList[i].SearchElementValuesList.length > 0) {
                dataSourceTreeNode.GridConfiguration.ColumnDefinitionList[i].SearchElementValuesList.forEach(
                  searchElementValue => {
                    searchElementValue.Value = column.dataContext[searchElementValue.InputFieldName];
                  }
                )
                this.rowDataService.dataInterface.SearchElementValuesList = dataSourceTreeNode.GridConfiguration.ColumnDefinitionList[i].SearchElementValuesList;
              }
            }
            else {
              this.rowDataService.dataInterface.RowData = null;
              this.rowDataService.dataInterface.SearchElementValuesList = [];
            }

            console.log('tt', this.rowDataService);
            sessionStorage.removeItem("RowDataInterface");
            sessionStorage.setItem("RowDataInterface", JSON.stringify(this.rowDataService));

            this.router.navigate([dataSourceTreeNode.GridConfiguration.ColumnDefinitionList[i].RouteLink])

          }
          else {
            const modalRef = this.modalService.open(GenericFormUiModalComponent);
            modalRef.componentInstance.id = column.dataContext.Id;
            modalRef.componentInstance.isEdit = true;
            modalRef.componentInstance.dataSourceTree = dataSourceTreeNode;
            modalRef.componentInstance.entityRelations = this.formLayout.EntityRelations;
            modalRef.componentInstance.rowData = column.dataContext;
            modalRef.result.then((result) => {
              console.log(this.formLayout.DataSourceTree);
            })
          }

        }
        break;
      }
    }
  }


  executeFunction(columnDefinition: ColumnDefinition, rowData: any) {
    switch (columnDefinition.FunctionName) {

      // case 'delete': {
      //   this.delete(rowData);
      //   break;
      // }

      // case 'executeQuery': {
      //   if(columnDefinition.SendDataToFunction)
      //     this.executeQuery(rowData , columnDefinition.FunctionData);
      //   break;
      // }

      // case 'approve_pvr': {
      //   this.approve_pvr(rowData);
      //   break;
      // }

      // case 'reject_pvr': {
      //   this.reject_pvr(rowData);
      //   break;
      // }
    }
  }

  async onSubmit() {

    console.log("Master Generic Form ::", this.genericForm);
    // if (this.formData.ApplicableUserId === this.genericForm.get('ApplicableUserId').value) {
    //   return this.alertService.showInfo('No changes were made !');
    // }

    if (this.formLayout.SaveConfiguration.UseGeneralApi && !this.formLayout.SaveConfiguration.UseGeneralSP) {
      console.log("Final FormLayout ::", this.formLayout);

      let newFormData = _.cloneDeep(this.formData);
      let obj = {};

      this.getEntityMappedData(this.formLayout.DataSourceTree, obj);

      if (this.id > 0) {
        Object.assign(newFormData, obj);
      }
      else {
        newFormData = _.cloneDeep(obj);
        newFormData["Id"] = 0
      }

      console.log("Final Submit Obj ::", newFormData);

      const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-danger'
        },
        buttonsStyling: true
      })

      swalWithBootstrapButtons.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        type: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, Save!',
        cancelButtonText: 'No, cancel!',
        reverseButtons: true
      }).then((result) => {
        if (result.value) {
          this.spinner = true;
          this.formLayoutService.uploadFormDataToCustomSP(this.formLayout.Code, newFormData).subscribe(dataset => {
            this.spinner = false;
            console.log(dataset);
            if (dataset.Status) {
              this.alertService.showSuccess(dataset.Message);
              this.close();
              // this.router.navigate([this.formLayout.SaveConfiguration.AfterSaveRouteLink]);
            }
            else {
              this.alertService.showWarning(dataset.Message);
            }
          }, error => {
            this.spinner = false;
            this.alertService.showWarning("Unknown Error Occured");
            console.log(error);
          }
          )

        } else if (
          /* Read more about handling dismissals below */
          result.dismiss === Swal.DismissReason.cancel
        ) {
          this.spinner = false;
        }
      })

    }
  }

  getEntityMappedData(datasourceTree: DataSourceTreeNode, objRef: any) {
    if (datasourceTree.RelationWithParent == RelationWithParent.None) {

      this.getJsonFromRowList(objRef, datasourceTree.RowDetailsList);
      Object.assign(objRef, objRef[datasourceTree.DataSource.Name]);
      console.log("Obj")
      delete objRef[datasourceTree.DataSource.Name];
    }
    else {
      if (datasourceTree.Dataset != undefined && datasourceTree.Dataset != null && datasourceTree.Dataset.length > 0) {
        objRef[datasourceTree.DataSource.Name] = datasourceTree.Dataset;
      }
      else {
        objRef[datasourceTree.DataSource.Name] = [];
      }
    }

    for (let childDatasourceTree of datasourceTree.Children) {
      this.getEntityMappedData(childDatasourceTree, objRef);
    }
  }

  getJsonFromRowList(obj: {}, rowDetailsList: RowDetails[]) {
    for (let rowDetails of rowDetailsList) {
      if (rowDetails.ColumnDetailsList !== null && rowDetails.ColumnDetailsList.length > 0) {
        for (let columnDetails of rowDetails.ColumnDetailsList) {

          if (columnDetails.ElementType == ElementType.ControlElement) {
            let fieldName: string = columnDetails.ControlElement.FieldName;
            let value = columnDetails.ControlElement.Value;

            for (let entity of columnDetails.ControlElement.EntityList) {
              if (!obj.hasOwnProperty(entity)) obj[entity] = {};
              obj[entity][fieldName] = value;
            }

          }
          else {
            this.insertControlElementsIntoObj(obj, columnDetails.GroupElement.RowDetailsList);
          }

        }
      }
    }
  }



  clearData(toNode: DataSourceTreeNode, fromNode: DataSourceTreeNode) {
    toNode = {
      DataSource: fromNode.DataSource,
      RelationWithParent: fromNode.RelationWithParent,
      RowDetailsList: fromNode.RowDetailsList,
      Children: [],
      OldRowDetailsList: fromNode.OldRowDetailsList,
      NewRowDetailsList: fromNode.NewRowDetailsList,
    }
    for (let node of fromNode.Children) {
      let newNode = new DataSourceTreeNode();
      toNode.Children.push(this.clearData(newNode, node));
    }
    return toNode;
  }

  onExit() {
    this.router.navigate(['app/ui/TaxCode']);
  }


  confirmExit() {

    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: true
    })

    swalWithBootstrapButtons.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Exit!',
      cancelButtonText: 'No, cancel!',
      reverseButtons: true
    }).then((result) => {
      if (result.value) {

        if (this.formLayout.SaveConfiguration.AfterSaveRouteLink == null) {
          if (this.code === 'Team') {
            this.router.navigate(['/app/listing/ui/Teams']);
          } else {
            this.router.navigate(['/app/listing/ui/ManagerMapping']);
          }

        } else {
          this.router.navigate([this.formLayout.SaveConfiguration.AfterSaveRouteLink]);

        }

      } else if (
        /* Read more about handling dismissals below */
        result.dismiss === Swal.DismissReason.cancel
      ) {

      }
    })
  }

  close(): void {
    this.drawerRef.close();
  }

  editRow() {

  }

  deleteRow() {

  }
}
