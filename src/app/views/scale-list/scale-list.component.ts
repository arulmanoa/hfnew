import { Component, OnInit } from '@angular/core';
import { HeaderService } from 'src/app/_services/service/header.service';
import { ScaleService } from 'src/app/_services/service/scale.service';
import { apiResponse } from 'src/app/_services/model/apiResponse';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import {
  AngularGridInstance,
  Column,
  Editors,
  EditorArgs,
  EditorValidator,
  FieldType,
  Filters,
  Formatters,
  GridOption,
  OnEventArgs,
  OperatorType,
  Sorters,
} from 'angular-slickgrid';

import Swal from "sweetalert2";
import { UIMode } from '../../_services/model/UIMode';
import { AlertService } from '../../_services/service/alert.service';
import { Scale, _Scale } from 'src/app/_services/model/scale'

@Component({
  selector: 'app-scale-list',
  templateUrl: './scale-list.component.html',
  styleUrls: ['./scale-list.component.css']
})
export class ScaleListComponent implements OnInit {

  spinner: boolean = true;
  isContent: boolean = false;

   // slick grid 
   columnDefinitions: Column[] = [];
   gridOptions: GridOption = {};
   dataset = [];
   angularGrid: AngularGridInstance;
   selectedTitles: any[];
   selectedTitle: any;
   gridObj1: any;
   isAutoEdit = true;


   deleteColumn: string;
   Scales:any = [];

   identity: number = 0;

   scaleObject: any =[];

  constructor(
    private headerService: HeaderService,
    private scaleservice: ScaleService,
    private router: Router,
    private alertService: AlertService,
  ) { }

  ngOnInit() {


    this.columnDefinitions = [

      { id: 'Code', name: 'Code', field: 'Code', sortable: true, filterable: true },
      { id: 'Name', name: 'Name', field: 'Name', sortable: true, filterable: true },
      { id: 'Description', name: 'Description', field: 'Description', sortable: true },
      {
        id: 'edit',
        field: 'id',
        excludeFromHeaderMenu: true,
        formatter: Formatters.editIcon,
        minWidth: 30,
        maxWidth: 30,   
        onCellClick: (e: Event, args: OnEventArgs) => {
          console.log(args);

          this.angularGrid.gridService.highlightRow(args.row, 1500);
          this.angularGrid.gridService.setSelectedRow(args.row);
  
        }
      },
      {
        id: 'delete',
        field: 'id',
        excludeFromHeaderMenu: true,
        formatter: Formatters.deleteIcon,
        minWidth: 30,
        maxWidth: 30,   
        onCellClick: (e: Event, args: OnEventArgs) => {
          console.log(args);

          this.angularGrid.gridService.highlightRow(args.row, 1500);
          this.angularGrid.gridService.setSelectedRow(args.row);
    
        }
      },
    ];
  
    this.gridOptions = {
      enableAutoResize: true,       // true by default
      enableCellNavigation: true,
      datasetIdPropertyName: "Id",
      editable: true,
      autoCommitEdit: false,
      autoResize: {
        containerId: 'demo-container',
        sidePadding: 15
      },
      asyncEditorLoading: false,
      autoEdit: this.isAutoEdit,
      enableColumnPicker: false,
      enableExcelCopyBuffer: true,
      enableFiltering: true,
      
    };

    this.getAllScales()
  }


  getAllScales(){

  this.scaleservice.getAllScale().subscribe((response) => {

    
    this.spinner = false;
    this.isContent = true;
    console.log('dataset',response.dynamicObject);
    this.dataset = response.dynamicObject;

    // let apiResponse: apiResponse = res;
    // this.dataset = apiResponse;
    // this.Scales = apiResponse.dynamicObject;
    // console.log('scales',this.Scales);

  }, (error) => {
    this.spinner = false;
    this.isContent = true;
  });
  }


  angularGridReady(angularGrid: AngularGridInstance) {
    this.angularGrid = angularGrid;
    this.gridObj1 = angularGrid && angularGrid.slickGrid || {};
  }


  addScale() {

    let navigationExtras: NavigationExtras = {
      queryParams: {
        
        "GetScale": this.scaleObject == null ? null : JSON.stringify(this.scaleObject.Id)
      }
    };
    

    if (!this.scaleObject) {
      this.alertService.showWarning("Please choose your scale before proceed!")
    }

    else {
      this.router.navigate(['/app/scale'], navigationExtras);
    }
  

  }



  async onCellClicked(e, args) {
    const metadata = this.angularGrid.gridService.getColumnFromEventArguments(args);
    if (metadata.columnDef.id === 'edit') {
      this.scaleObject = metadata.dataContext;
      
      this.addScale();

    } 
    // call delete popup
    else if (metadata.columnDef.id === 'delete') {
      debugger
      this.confirmDeleteid(metadata.dataContext.Id, metadata.dataContext.code);
    }
  }


  confirmDeleteid(id: number, DeleteColumnvalue: string) {
    this.identity = + id;
    this.deleteColumn = DeleteColumnvalue;
    $('#modaldeleteconfimation').modal('show');
  }


  delete() {
    let deletContent: Scale = {} as any;
    deletContent = this.dataset.find(a => a.Id == this.identity);
    console.log(deletContent);
    //deletContent1.Modetype=UIMode.Delete;
    deletContent.Status = "In-Active" ? 0 : 1;
    this.scaleservice.deleteScale(JSON.stringify(deletContent)).subscribe(response => {
      if (response.Status) {
        this.alertService.showSuccess(response.Message);
        this.angularGrid.gridService.deleteDataGridItemById(this.identity);
      } else {
        this.alertService.showWarning(response.Message);
      }
      $('#modaldeleteconfimation').modal('hide');

    }, (error) => {
      $('#modaldeleteconfimation').modal('hide');
    });
  }




}
