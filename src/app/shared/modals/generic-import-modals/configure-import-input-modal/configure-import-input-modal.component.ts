import { Component, OnInit, Input } from '@angular/core';
import { ControlElement } from 'src/app/views/generic-form/form-models';
import { DataSource } from 'src/app/views/personalised-display/models';
import { ImportTreeNode } from 'src/app/views/generic-import/import-models';
import { ImportLayoutService } from 'src/app/_services/service/import-layout.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertService } from 'src/app/_services/service/alert.service';
import { FormInputControlType } from 'src/app/views/generic-form/enums';
import { DataSourceType } from 'src/app/views/personalised-display/enums';
import { PagelayoutService } from 'src/app/_services/service/pagelayout.service';

@Component({
  selector: 'app-configure-import-input-modal',
  templateUrl: './configure-import-input-modal.component.html',
  styleUrls: ['./configure-import-input-modal.component.css']
})
export class ConfigureImportInputModalComponent implements OnInit {

  @Input() editing : boolean = false;
  @Input() index : number;

  controlElement : ControlElement;
  node : ImportTreeNode;
  columnNamesObject : {};
  spinner : boolean = false;

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
    private importLayoutService : ImportLayoutService,
    private pageLayoutService : PagelayoutService,
    private activeModal: NgbActiveModal,
    private alertService : AlertService
    
  ) { }

  ngOnInit() {
    
    this.node = this.importLayoutService.node;

    if(this.editing){
      this.controlElement = this.node.ControlElementsList[this.index];
    }
    else{
      this.controlElement = new ControlElement();
      this.controlElement.DataSource = new DataSource();
    }

    this.columnNamesObject = this.importLayoutService.ColumnNamesObject; 
    if(Object.keys(this.columnNamesObject[this.node.DataSource.Name]).length <= 0){
      this.spinner = true;
      this.pageLayoutService.getColumnOrParamName(this.node.DataSource).subscribe(
        data => {
          this.spinner = false;
          if(data.Status == true && data.dynamicObject){
            this.columnNamesObject[this.node.DataSource.Name] = data.dynamicObject;
            console.log(this.columnNamesObject);
          }
          else {
            console.log(data);
          }
            

        }, error =>
        {
          this.spinner = false;
          this.alertService.showWarning('Error Occured! Could not Fetch Column Names' );
          console.log(error);
        }
      )
    }

  }

  onSave(){
    
    if(!this.editing){
      this.node.ControlElementsList.push(this.controlElement);
    } 
    this.activeModal.close();
  }

  onCancel(){
    this.activeModal.close();
  }

}
