import { Component, OnInit } from '@angular/core';
import { ProductTypeComponent } from 'src/app/shared/modals/product-type/product-type.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HeaderService } from 'src/app/_services/service/header.service';
import { ProductType} from 'src/app/_services/model/ProductType';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { AlertService } from '../../_services/service/alert.service';
import {ProductTypeService} from '../../_services/service/producttype.service';
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
import * as _ from 'lodash';
@Component({
  selector: 'app-product-type-list',
  templateUrl: './product-type-list.component.html',
  styleUrls: ['./product-type-list.component.css']
})
export class ProductTypeListComponent implements OnInit {

  
  spinner: boolean = true;
  isContent: boolean = false;


  panelTitle: any;  
  UserId: any; 
  identity: number = 0;
  columnDefinitions: Column[] = [];
  gridOptions: GridOption = {};
  dataset: any[] = [];
  angularGrid: AngularGridInstance;
  gridObj1: any;
  deleteColumn: string;
  producttypeForm: FormGroup;
  ProductGroup: ProductType = {} as any;


  constructor(public modalService: NgbModal,private alertService: AlertService,private fb: FormBuilder,
    public ProductTypeService:ProductTypeService,private headerService: HeaderService) { }

    newButtonProducttypeClick() {
    
      const modalRef = this.modalService.open(ProductTypeComponent);
      modalRef.componentInstance.id = 0;
      modalRef.componentInstance.jsonObj = [];
      modalRef.result.then((result) => {

        this.initial_getProductType_load();
        this.angularGrid.gridService.addItemToDatagrid(result);

      }).catch((error) => {
        console.log(error);
      });
    }

  ngOnInit() {
    this.headerService.setTitle('Product-Type');

   
    this.columnDefinitions = [
      // { id: 'Id', name: 'Id', field: 'Id', sortable: true },
      //{ id: 'salutation', name: 'Salutation', field: 'Salutation', formatter: Formatters.uppercase, sortable: true },
     // { id: 'client', name: 'Client', field: 'ClientID', formatter: Formatters.uppercase, sortable: true },
      { id: 'name', name: 'Name', field: 'Name',formatter: Formatters.uppercase, sortable: true },
      { id: 'code', name: 'Code', field: 'Code', sortable: true },
      { id: 'StatusCode', name: 'Status', field: 'Status', cssClass: 'right-align', sortable: true },
      
      {
        id: 'edit',
        field: 'id',
       
        excludeFromExport: true,
        excludeFromHeaderMenu: true,
        formatter: Formatters.editIcon,
        minWidth: 30,
        maxWidth: 30,
        
        onCellClick: (e: Event, args: OnEventArgs) => {
          console.log(args);
          
        }
      },
      {
        id: 'delete',
        field: 'id',

        excludeFromExport: true,
        excludeFromHeaderMenu: true,
        formatter: Formatters.deleteIcon,
        minWidth: 30,
        maxWidth: 30,
        // use onCellClick OR grid.onClick.subscribe which you can see down below
        onCellClick: (e: Event, args: OnEventArgs) => {
          console.log(args);
          // this.alertWarning = `Editing: ${args.dataContext.title}`;
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
      forceFitColumns: true,
      enableHeaderMenu: false,
      enableGridMenu: true,   // <<-- this will automatically add extra custom commands
      enableFiltering: true,

    };

    this.initial_getProductType_load();

  }
  initial_getProductType_load() {
    this.ProductTypeService.getProductType().subscribe(response => {
      this.spinner=true;
      //dataset.fromJson(json);
      console.log(response);
      this.dataset = response.dynamicObject;
     
      console.log(this.dataset.length);
      this.dataset.forEach(element => {       
        element["Status"] = element.Status == 0 ? "In-Active" : "Active";
      });
      this.spinner=false; 
    }, (error) => {
      this.spinner=false;
    });
  }
  angularGridReady(angularGrid: AngularGridInstance) {
    this.angularGrid = angularGrid;
    this.gridObj1 = angularGrid && angularGrid.slickGrid || {};

  }
  onCellClicked(e, args) {

    const metadata = this.angularGrid.gridService.getColumnFromEventArguments(args);
    //call edit popup
    if (metadata.columnDef.id === 'edit') {
      this.editButtonClick(metadata.dataContext.Id);
    }
    //call delete popup
    else if (metadata.columnDef.id === 'delete') {
      debugger
      this.confirmDeleteid(metadata.dataContext.Id, metadata.dataContext.code);
    }
  
  }

  editButtonClick(id: number) {
    
    debugger
    this.identity = + id;

   let i : any = this.dataset.filter(item => item.Id == id);
    
   const modalRef = this.modalService.open(ProductTypeComponent);
   
   //modalRef.componentInstance.ClientContactForm.client.disable();
   modalRef.componentInstance.id = id;
   modalRef.componentInstance.jsonObj =  i;
   modalRef.result.then((result) => {
    let isSameResult = false;
    isSameResult = _.find(this.dataset, (a) => a.Id == result.Id) != null ? true : false;

    if (isSameResult) {

      this.angularGrid.gridService.updateDataGridItemById(result.Id, result, true, true);

    } else {
      this.initial_getProductType_load();
      this.angularGrid.gridService.addItemToDatagrid(result);
    }

   });
    
  }

  confirmDeleteid(id: number, DeleteColumnvalue: string) {
    this.identity = + id;
    this.deleteColumn = DeleteColumnvalue;
    $('#modaldeleteconfimation').modal('show');
  }
  delete() {
    let deletContent: ProductType = {} as any;
   // let deletContent1:ClientContactLocationMapping = {} as any;
    deletContent = this.dataset.filter(a => a.Id == this.identity)[0];
    //deletContent1.Modetype=UIMode.Delete;
    deletContent.Status = "Active" ? 1 : 0;
    this.ProductTypeService.deleteProductType(JSON.stringify(deletContent)).subscribe(response => {
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
