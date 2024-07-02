import { Component, OnInit, Input } from '@angular/core';
import { ImportTreeNode, ImportLayout } from 'src/app/views/generic-import/import-models';
import { ImportLayoutService } from 'src/app/_services/service/import-layout.service';
import { DataSource } from 'src/app/views/personalised-display/models';
import { RelationWithParent } from 'src/app/views/generic-form/enums';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PagelayoutService } from 'src/app/_services/service/pagelayout.service';
import { AlertService } from 'src/app/_services/service/alert.service';
import { DataSourceType } from 'src/app/views/personalised-display/enums';

@Component({
  selector: 'app-configure-data-source-modal',
  templateUrl: './configure-data-source-modal.component.html',
  styleUrls: ['./configure-data-source-modal.component.css']
})
export class ConfigureDataSourceModalComponent implements OnInit {

  //@Input() inputNode : ImportTreeNode;
  @Input() editing : boolean = false;
  @Input() parent : boolean = false;

  importLayout : ImportLayout;
  node : ImportTreeNode;
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
    private importLayoutService : ImportLayoutService,
    private activeModal: NgbActiveModal,
    public modalService: NgbModal,
    private pageLayoutService : PagelayoutService,
    private alertService : AlertService,
  ) { }

  ngOnInit() {

    this.importLayout = this.importLayoutService.importLayout;

    if(this.editing){
      console.log(this.importLayoutService.node);
      this.node = JSON.parse(JSON.stringify(this.importLayoutService.node));
    }
    else{
      this.node = new ImportTreeNode();
      this.node.DataSource = new DataSource();
    
      if(this.parent){
        this.node.IsParent = true;
        this.node.RelationWithParent = RelationWithParent.None;
      }
    }


    this.node.DataSourceList = [];
    this.getDataSourceList(this.importLayout.ImportTree);

    this.fromDataSource = '';
    this.fromColumn = '';
    this.toColumn = '';

  } 

  onClickingConfirmDataSource(node : ImportTreeNode){
    this.spinner = true;
    if(this.importLayoutService.ColumnNamesObject == undefined || this.importLayoutService.ColumnNamesObject == null)
      this.importLayoutService.ColumnNamesObject = {};

    this.pageLayoutService.getColumnOrParamName(node.DataSource).subscribe(
      data => {
        this.spinner = false;

        if(data.Status == true && data.dynamicObject){
          this.importLayoutService.ColumnNamesObject[node.DataSource.Name] = data.dynamicObject;
          console.log(this.importLayoutService.ColumnNamesObject);
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

  getDataSourceList(dataSourceNode : ImportTreeNode){
    if(dataSourceNode.DataSource.Name == this.node.DataSource.Name){
      return;
    }
    if(dataSourceNode.RelationWithParent === RelationWithParent.OnetoOne || 
      dataSourceNode.RelationWithParent === RelationWithParent.None){
        this.node.DataSourceList.push(dataSourceNode.DataSource);
      }
      for(let child of dataSourceNode.Children){
        this.getDataSourceList(child);
      }
  }
 
  onClickingAddRelationButton(node : ImportTreeNode){
    if(this.importLayout.SaveExcelDataConfiguration.EntityRelations == undefined || this.importLayout.SaveExcelDataConfiguration.EntityRelations == null)
      this.importLayout.SaveExcelDataConfiguration.EntityRelations = {}
    
    if(this.importLayout.SaveExcelDataConfiguration.EntityRelations[node.DataSource.Name] == undefined || 
    this.importLayout.SaveExcelDataConfiguration.EntityRelations[node.DataSource.Name] == null)
      this.importLayout.SaveExcelDataConfiguration.EntityRelations[node.DataSource.Name] = {}  

    if(this.importLayout.SaveExcelDataConfiguration.EntityRelations[node.DataSource.Name][this.fromDataSource] == undefined || 
      this.importLayout.SaveExcelDataConfiguration.EntityRelations[node.DataSource.Name][this.fromDataSource] == null)
        this.importLayout.SaveExcelDataConfiguration.EntityRelations[node.DataSource.Name][this.fromDataSource] = {}

    this.importLayout.SaveExcelDataConfiguration.EntityRelations[node.DataSource.Name][this.fromDataSource][this.fromColumn] = this.toColumn;

    console.log(this.importLayout.SaveExcelDataConfiguration.EntityRelations);
  }

  onClickingRemoveDataSourceButton(node : ImportTreeNode , dataSourceName : string){
    delete this.importLayout.SaveExcelDataConfiguration.EntityRelations[node.DataSource.Name][dataSourceName];
    console.log(this.importLayout.SaveExcelDataConfiguration.EntityRelations);
  }

  onClickingRemoveColumnButton(node : ImportTreeNode , dataSourceName : string , columnName : string){
    delete this.importLayout.SaveExcelDataConfiguration.EntityRelations[node.DataSource.Name][dataSourceName][columnName];
  }

  


  onSave(){
    if(this.editing){
      
      if(this.node.IsParent ){
        this.importLayoutService.importLayout.ImportTree = this.node;
      }
      else{   
        let keys = Object.keys(this.node);
        for(let key of keys){
          this.importLayoutService.node[key] = this.node[key];
        }
      }

    }
    else{
      if(this.parent){
        this.importLayoutService.importLayout.ImportTree = this.node;
      }
      else{
        this.node.Parent = this.importLayoutService.node.DataSource.Name;
        this.importLayoutService.node.Children.push(this.node)
      }
    }

    this.activeModal.close();
  }

  closeModal(){
    if(!this.editing){
      if(this.parent){
        //console.log("inside");
        this.importLayoutService.importLayout.ImportTree = null;
      }
    }

    this.activeModal.close();
  }

}
