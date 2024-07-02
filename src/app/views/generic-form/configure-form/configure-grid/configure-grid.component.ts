import { Component, OnInit } from '@angular/core';
import { FormLayoutService } from 'src/app/_services/service/form-layout.service';
import { DataSourceTreeNode } from '../../form-models';
import { Router } from '@angular/router';
import { ColumnDefinition, GridConfiguration } from 'src/app/views/personalised-display/models';
import { ColumnType, DataSourceType } from 'src/app/views/personalised-display/enums';
import { RelationWithParent } from '../../enums';
import { PagelayoutService } from 'src/app/_services/service/pagelayout.service';
import { AlertService } from 'src/app/_services/service/alert.service';


@Component({
  selector: 'app-configure-grid',
  templateUrl: './configure-grid.component.html',
  styleUrls: ['./configure-grid.component.scss']
})
export class ConfigureGridComponent implements OnInit {

  columnNamesForColumnDefinition : { name : string|number , value : boolean}[] = [];
  tempColumnDefinitionObject = {};
  columnObjectLastKey : number;
  columnNames :string[] = [];
  spinner : boolean = false;

  node : DataSourceTreeNode;

  constructor(
    private formLayoutService : FormLayoutService,
    private pageLayoutService : PagelayoutService,
    private alertService : AlertService,
    private router : Router
  ) { }

  ngOnInit() {
    this.node = this.formLayoutService.node
    
    if(this.formLayoutService.ColumnNamesObject[this.node.DataSource.Name] == undefined ||
      this.formLayoutService.ColumnNamesObject[this.node.DataSource.Name] == null){
      this.formLayoutService.ColumnNamesObject[this.node.DataSource.Name] = [];
      this.columnNames = this.formLayoutService.ColumnNamesObject[this.node.DataSource.Name];
    }
    else {
      this.columnNames = this.formLayoutService.ColumnNamesObject[this.node.DataSource.Name];
    }

    if(this.node.GridConfiguration == undefined || this.node.GridConfiguration == null){
      this.node.GridConfiguration = new GridConfiguration();
      this.node.GridConfiguration.ColumnDefinitionList = [];
    }
    // this.node = {
    //   DataSource : {
    //     Name : 'City',
    //     Type : DataSourceType.View,
    //   },
    //   RelationWithParent : RelationWithParent.OnetoMany,
    //   Children : []
    // }
    // this.columnNames = ['Id' , 'Name' , 'IsMetro' , 'StateId' , 'abcd' , 'countryId' , 'xydg'];


    if(this.columnNames.length > 0){
      this.columnObjectLastKey = this.columnNames.length;
      this.setUp();

    }
    else {
      this.spinner = true;
      this.pageLayoutService.getColumnOrParamName(this.node.DataSource).subscribe(
        data =>{
          this.spinner = false;

          if(data.Status == true && data.dynamicObject.length > 0){
            this.formLayoutService.ColumnNamesObject[this.node.DataSource.Name] = data.dynamicObject;
            this.columnNames = data.dynamicObject;
            this.setUp();
            console.log(this.formLayoutService.ColumnNamesObject);
          }
          else {
            this.alertService.showWarning("Could not fetch Latest Column names from database");
            console.log(data);

            this.formLayoutService.ColumnNamesObject[this.node.DataSource.Name] = [];
            this.columnNamesForColumnDefinition = [];
            for(let i = 0 ; i <  this.node.GridConfiguration.ColumnDefinitionList.length ; ++i){
              let columnDefinition = this.node.GridConfiguration.ColumnDefinitionList[i];
              this.columnNamesForColumnDefinition.push(
                {
                  name : columnDefinition.Type==0?columnDefinition.FieldName:columnDefinition.Id,
                  value : true
                }
              )
              this.tempColumnDefinitionObject[i] = columnDefinition;
            }
          }
        },
        error => {
          this.spinner = false;
          this.alertService.showWarning("Error Occured");
        }
      )
      
    }
  }

  setUp(){
    this.tempColumnDefinitionObject = {};
    for(let Column of this.columnNames){
        
      this.columnNamesForColumnDefinition.push({
        name : Column,
        value : false
      })
    }
    for(let columnDefinition of this.node.GridConfiguration.ColumnDefinitionList ){
      if(columnDefinition.Type == ColumnType.Basic){
        let i = this.columnNames.indexOf(columnDefinition.FieldName);
        if(i > -1){
          this.onClickingColumnSelectCheckBox(i,null,columnDefinition);
          // this.onDisplayOrderChange(columnDefinition.DisplayOrder , i);
        }
        else 
          console.log("Column : " +columnDefinition.FieldName + " does not exist in database! Please check Column Definition List")
      }
      else{
        this.tempColumnDefinitionObject[this.columnObjectLastKey] = columnDefinition;
        this.columnNamesForColumnDefinition.push({
          name : columnDefinition.Id,
          value : true
        })
        // this.onDisplayOrderChange(columnDefinition.DisplayOrder , this.columnObjectLastKey);
        this.columnObjectLastKey+= 1;
      }
    }
  }

  onClickingColumnSelectCheckBox( i :number , event : any , columnDefinition : ColumnDefinition = null ){
    this.columnNamesForColumnDefinition[i].value = !this.columnNamesForColumnDefinition[i].value;
    console.log("clicked");
    if(this.columnNamesForColumnDefinition[i].value){
      if(event){
        this.tempColumnDefinitionObject[i] = new ColumnDefinition();
        this.tempColumnDefinitionObject[i].GroupAggregatorColumnAndType = [];
        this.tempColumnDefinitionObject[i].SearchElementValuesList = [];
        this.tempColumnDefinitionObject[i].Id = this.columnNames[i];
        this.tempColumnDefinitionObject[i].FieldName = this.columnNames[i];
        this.tempColumnDefinitionObject[i].Type = ColumnType.Basic;
        console.log(this.tempColumnDefinitionObject);
      }
      else if(columnDefinition){
        this.tempColumnDefinitionObject[i] = columnDefinition; 
      }
      //this.numberOfColumns.push(this.numberOfColumns[this.numberOfColumns.length-1] +1);
    }
    else {
      if(this.tempColumnDefinitionObject[i].Type == ColumnType.Custom){
        this.columnNamesForColumnDefinition.splice(i,1);
      }
      delete this.tempColumnDefinitionObject[i];
      // this.numberOfColumns.splice(-1,1);
    }
    console.log(this.tempColumnDefinitionObject);
  }

  onClickingAddNewColumnButton(){
    let lastkey = this.columnNamesForColumnDefinition.length;
    this.tempColumnDefinitionObject[lastkey] = new ColumnDefinition();
    this.tempColumnDefinitionObject[lastkey].GroupAggregatorColumnAndType = [];
    this.tempColumnDefinitionObject[lastkey].Type = ColumnType.Custom;
    this.tempColumnDefinitionObject[lastkey].Id = 'Custom';
    this.columnNamesForColumnDefinition[lastkey] = {
      name: this.tempColumnDefinitionObject[lastkey].Id,
      value : true
    }
  }

  onClickingConfirmButton(){
    let columnDefinitionList : ColumnDefinition[] =[];
    let keys = Object.keys(this.tempColumnDefinitionObject);
    for(let key of keys){
      columnDefinitionList[this.tempColumnDefinitionObject[key].DisplayOrder-1] = this.tempColumnDefinitionObject[key];
    }

    if(columnDefinitionList.length == 0) columnDefinitionList=[];
    
    console.log(columnDefinitionList);
    if(this.node.GridConfiguration == undefined || this.node.GridConfiguration == null){
      this.node.GridConfiguration = new GridConfiguration();
      this.node.GridConfiguration.ColumnDefinitionList = [];
    }
    this.node.GridConfiguration.ColumnDefinitionList=columnDefinitionList;
    console.log(this.node);
    this.alertService.showSuccess("Saved");
    this.router.navigate(['app/configure/form']);
}

  Exit(){
    this.router.navigate(['app/configure/form']);
  }

}
