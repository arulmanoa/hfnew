import { Component, OnInit, Input } from '@angular/core';
import { DataSourceTreeNode, FormLayout } from 'src/app/views/generic-form/form-models';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DataSourceType } from 'src/app/views/personalised-display/enums';
import { RelationWithParent } from 'src/app/views/generic-form/enums';
import { DataSource } from 'src/app/views/personalised-display/models';
import { PagelayoutService } from 'src/app/_services/service/pagelayout.service';
import { AlertService } from 'src/app/_services/service/alert.service';
import { FormLayoutService } from 'src/app/_services/service/form-layout.service';


@Component({
  selector: 'app-configure-modal',
  templateUrl: './configure-modal.component.html',
  styleUrls: ['./configure-modal.component.css']
})
export class ConfigureModalComponent implements OnInit {

  @Input() inputNode : DataSourceTreeNode;
  @Input() formLayout : FormLayout; 
  @Input() editing : boolean = false;
  @Input() parent : boolean = false;
  
  dataSourceList : DataSource[];
  
  node : DataSourceTreeNode;
  spinner : boolean;
  fromDataSource : string = '';
  fromColumn : string = '';
  toColumn : string = '';

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

  relationWithParentNames = [
    {
      label : 'None',
      value : RelationWithParent.None
    },
    {
      label : 'One to One',
      value : RelationWithParent.OnetoOne
    },
    {
      label : 'One to Many',
      value : RelationWithParent.OnetoMany
    },
  ]
  
  constructor(
    private activeModal: NgbActiveModal,
    public modalService: NgbModal,
    private pageLayoutService : PagelayoutService,
    private alertService : AlertService,
    private formLayoutService : FormLayoutService
    ) { }

  ngOnInit() {
    if(this.editing){
        console.log(this.inputNode);
        this.node = JSON.parse(JSON.stringify(this.inputNode));
    }
    else{
      this.node = new DataSourceTreeNode();
      this.node.DataSource = new DataSource();
    
      if(this.parent){
        this.node.IsParent = true;
        this.node.RelationWithParent = RelationWithParent.None;
      }
    }

    this.node.DataSourceList = [];
    this.getDataSourceList(this.formLayoutService.formLayout.DataSourceTree);

    this.fromDataSource = '';
    this.fromColumn = '';
    this.toColumn = '';
  }

  onClickingConfirmDataSource(node : DataSourceTreeNode){
    this.spinner = true;
    if(this.formLayoutService.ColumnNamesObject == undefined || this.formLayoutService.ColumnNamesObject == null)
      this.formLayoutService.ColumnNamesObject = {};

    this.pageLayoutService.getColumnOrParamName(node.DataSource).subscribe(
      data => {
        this.spinner = false;

        if(data.Status == true && data.dynamicObject){
          this.formLayoutService.ColumnNamesObject[node.DataSource.Name] = data.dynamicObject;
          console.log(this.formLayoutService.ColumnNamesObject);
        }
        else {
          this.alertService.showWarning("Could not fetch Column names! Open Console for details");
          console.log(data);
        }
        
      }, error =>
      {
        this.spinner = false;
        this.alertService.showWarning('Error Occured! Could not fetch Column names! Open Console for details');
        console.log(error);
      }
    )
  }

  onClickingAddRelationButton(node : DataSourceTreeNode){
    if(this.formLayoutService.formLayout.EntityRelations == undefined || this.formLayoutService.formLayout.EntityRelations == null)
      this.formLayoutService.formLayout.EntityRelations = {}
    
    if(this.formLayoutService.formLayout.EntityRelations[node.DataSource.Name] == undefined || 
    this.formLayoutService.formLayout.EntityRelations[node.DataSource.Name] == null)
      this.formLayoutService.formLayout.EntityRelations[node.DataSource.Name] = {}  

    if(this.formLayoutService.formLayout.EntityRelations[node.DataSource.Name][this.fromDataSource] == undefined || 
      this.formLayoutService.formLayout.EntityRelations[node.DataSource.Name][this.fromDataSource] == null)
        this.formLayoutService.formLayout.EntityRelations[node.DataSource.Name][this.fromDataSource] = {}

    this.formLayoutService.formLayout.EntityRelations[node.DataSource.Name][this.fromDataSource][this.fromColumn] = this.toColumn;

    console.log(this.formLayoutService.formLayout.EntityRelations);
  }

  onClickingRemoveDataSourceButton(node : DataSourceTreeNode , dataSourceName : string){
    delete this.formLayoutService.formLayout.EntityRelations[node.DataSource.Name][dataSourceName];
    console.log(this.formLayoutService.formLayout.EntityRelations);
  }

  onClickingRemoveColumnButton(node : DataSourceTreeNode , dataSourceName : string , columnName : string){
    delete this.formLayoutService.formLayout.EntityRelations[node.DataSource.Name][dataSourceName][columnName];
  }

  getDataSourceList(dataSourceNode : DataSourceTreeNode){
    
    if(dataSourceNode.RelationWithParent === RelationWithParent.OnetoOne || 
      dataSourceNode.RelationWithParent === RelationWithParent.None){
        this.node.DataSourceList.push(dataSourceNode.DataSource);
    }
    if(dataSourceNode.DataSource.Name == this.node.DataSource.Name){
      return;
    }  
      for(let child of dataSourceNode.Children){
        this.getDataSourceList(child);
      }
  }

  onSave(){
    if(this.editing){
      
      if(this.node.IsParent ){
        this.formLayout.DataSourceTree = this.node;
      }
      else{   
        let keys = Object.keys(this.node);
        for(let key of keys){
          this.inputNode[key] = this.node[key];
        }
      }

    }
    else{
      if(this.parent){
        this.formLayout.DataSourceTree = this.node;
      }
      else{
        this.node.Parent = this.inputNode.DataSource.Name;
        this.inputNode.Children.push(this.node)
      }
    }

    this.activeModal.close();
  }

  closeModal(){
    if(!this.editing){
      if(this.parent){
        console.log("inside");
        this.formLayout.DataSourceTree = null;
      }
    }

    this.activeModal.close();
  }

  

}
