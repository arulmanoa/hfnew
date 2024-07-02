import { Component, OnInit, Input } from '@angular/core';
import { RowDetails, ColumnDetails, ControlElement, DataSourceTreeNode } from 'src/app/views/generic-form/form-models';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { DataSource } from 'src/app/views/personalised-display/models';
import { RelationWithParent, FormInputControlType } from 'src/app/views/generic-form/enums';
import { PagelayoutService } from 'src/app/_services/service/pagelayout.service';
import { AlertService } from 'src/app/_services/service/alert.service';
import { DataSourceType } from 'src/app/views/personalised-display/enums';


@Component({
  selector: 'app-configure-inputs-modal',
  templateUrl: './configure-inputs-modal.component.html',
  styleUrls: ['./configure-inputs-modal.component.css']
})
export class ConfigureInputsModalComponent implements OnInit {

  @Input() controlElement : ControlElement;
  @Input() node : DataSourceTreeNode;

  dataSourceList : DataSource[] ;
  columnListObject = {};
  spinner : boolean = false;
  controlElementColumns : string[] = [];

  inputControlTypeNames= [ 
    {
      label : 'Text Box',
      value : FormInputControlType.TextBox
    },
    {
      label : 'Drop Down',
      value : FormInputControlType.DropDown
    },
    {
      label : 'Multi Select Drop Down',
      value : FormInputControlType.MultiSelectDropDown
    },
    {
      label : 'Autofill Text Box',
      value : FormInputControlType.AutoFillTextBox
    },
    {
      label : 'Check Box',
      value : FormInputControlType.CheckBox
    },
    {
      label : 'Text Area',
      value : FormInputControlType.TextArea
    },
    {
      label : 'Radio Buttons',
      value : FormInputControlType.RadioButtons
    },
    {
      label : 'Date Picker',
      value : FormInputControlType.DatePicker
    }
  ];

  dataSourceTypeNames = [
    {
      label : 'View',
      value : DataSourceType.View
    },
    {
      label : 'Stored Procedure',
      value : DataSourceType.SP
    },
    {
      label : 'Fixed Values',
      value : DataSourceType.FixedValues
    },
    {
      label : 'External API',
      value : DataSourceType.ExternalAPI
    }
  ];

  constructor(
    private activeModal: NgbActiveModal,
    private pageLayoutService : PagelayoutService,
    private alertService : AlertService
  ) { }

  ngOnInit() {
    if(this.node.DataSourceList === undefined || this.node.DataSourceList === null || this.node.DataSourceList.length <= 0){
      this.node.DataSourceList = [];
      this.getDataSourceList(this.node);
    }
    
    if(this.node.ColumnListObject === undefined || this.node.ColumnListObject === null || Object.keys(this.node.ColumnListObject).length <= 0){
      this.node.ColumnListObject = {};
      this.getColumnsList();
    }

    console.log(this.controlElement);
    
  }

  getDataSourceList(dataSourceNode : DataSourceTreeNode){



    if(dataSourceNode.RelationWithParent === RelationWithParent.OnetoOne || 
      dataSourceNode.RelationWithParent === RelationWithParent.None || 
      dataSourceNode.DataSource.Name == this.node.DataSource.Name){
        this.node.DataSourceList.push(dataSourceNode.DataSource);
      }
      for(let child of dataSourceNode.Children){
        this.getDataSourceList(child);
      }
  }

  getColumnsList(){
    if(this.node.DataSourceList.length <= 0)
      this.getDataSourceList(this.node);
      
    for(let i = 0; i < this.node.DataSourceList.length; ++i){
      this.spinner = true;
      this.pageLayoutService.getColumnOrParamName(this.node.DataSourceList[i]).subscribe(
        data => {
          if(i == this.node.DataSourceList.length-1){
            this.spinner = false;
          }
          if(data.Status == true && data.dynamicObject){
            this.node.ColumnListObject[this.node.DataSourceList[i].Name] = data.dynamicObject;
            console.log(this.node.ColumnListObject);
          }
          else {
            console.log(data);
          }
            

        }, error =>
        {
          if(i == this.node.DataSourceList.length-1)
            this.spinner = false;
          this.alertService.showWarning('Error Occured' );
          console.log(error);
        }
      )
    }
  }

  closeModal(){
    this.activeModal.close();
  }

  onOpeningDatasourceBindingFieldsDropDown(controlElement : ControlElement){
    this.controlElementColumns=null;
    if(controlElement.DataSource.Type == DataSourceType.View){
      // this.loadingScreenService.startLoading();
      this.pageLayoutService.getColumnOrParamName(controlElement.DataSource).subscribe(dataset => 
        {
          // this.loadingScreenService.stopLoading();
          if(dataset.Status == true && dataset.dynamicObject)
          {
            this.controlElementColumns = [];
            this.controlElementColumns = dataset.dynamicObject;
          }
          else
            console.log(dataset);
        } , error =>{
          // this.loadingScreenService.stopLoading();
          console.log(error);
        })
      }
  }

}
