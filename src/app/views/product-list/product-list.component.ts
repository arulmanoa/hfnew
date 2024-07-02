import { Component, OnInit } from '@angular/core';
import { ProductComponent } from 'src/app/views/product/product.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { AlertService } from '../../_services/service/alert.service';
import {ProductService} from '../../_services/service/product.service';
import { HeaderService } from 'src/app/_services/service/header.service';
import { Product} from 'src/app/_services/model/Product';
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
import * as _ from 'lodash';
@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
  spinner: boolean = false;
  panelTitle: any;  
  UserId: any; 
  identity: number = 0;
  columnDefinitions: Column[] = [];
  gridOptions: GridOption = {};
  dataset: any[] = [];
  angularGrid: AngularGridInstance;
  gridObj1: any;
  deleteColumn: string;
  productgroupForm: FormGroup;
  ProductModel: Product = {} as any;

  constructor(public modalService: NgbModal,private alertService: AlertService,private fb: FormBuilder,
    public ProductService:ProductService,private headerService: HeaderService,private router: Router,
    private route: ActivatedRoute) { }

    newButtonProductClick() {
    
     this.router.navigate(['app/Product']);
      this.panelTitle = "Add New Product";
      
    }
  ngOnInit() {
    this.headerService.setTitle('Product-List');

   
    this.columnDefinitions = [
      // { id: 'Id', name: 'Id', field: 'Id', sortable: true },
      //{ id: 'salutation', name: 'Salutation', field: 'Salutation', formatter: Formatters.uppercase, sortable: true },
     // { id: 'client', name: 'Client', field: 'ClientID', formatter: Formatters.uppercase, sortable: true },
      { id: 'name', name: 'Name', field: 'Name',formatter: Formatters.uppercase, sortable: true,filterable:true },
      { id: 'code', name: 'Code', field: 'Code', sortable: true,filterable:true },
      { id: 'productCategory', name: 'ProductCategory', field: 'ProductCategoryId', sortable: true ,filterable:true},
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

    this.initial_getProduct_load();

  }
  initial_getProduct_load() {
    this.spinner=true;
    this.ProductService.getProduct().subscribe(response => {
      //dataset.fromJson(json);
      console.log(response);
      this.dataset = response.dynamicObject;
     
      console.log(this.dataset.length); 
      this.dataset.forEach(element => {    
        element["ProductCategoryId"] =element.ProductCategoryId == 1 ? "Payroll" : "Billing" ;
        element["Status"] = element.Status == 0 ? "In-Active" : "Active";
      });
      this.spinner=false;   
    }, (error) => {
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
      this.editButtonClick(metadata);
    }
    //call delete popup
    else if (metadata.columnDef.id === 'delete') {
      debugger
      this.confirmDeleteid(metadata.dataContext.Id, metadata.dataContext.code);
    }
  
  }

   editButtonClick( metadata?: any ) {
    console.log(metadata.dataContext);
    let navigationExtras: NavigationExtras = {
        queryParams: {
           "Id": metadata.dataContext.Id,
        }
    };
 
    this.router.navigate(['app/Product'], {
        queryParams: {
            "Idx": btoa(metadata.dataContext.Id),
        }
    });
    
}
  
  

  confirmDeleteid(id: number, DeleteColumnvalue: string) {
    this.identity = + id;
    this.deleteColumn = DeleteColumnvalue;
    $('#modaldeleteconfimation').modal('show');
  }
  delete() {
    let deletContent: Product = {} as any;
    deletContent = this.dataset.find(a => a.Id == this.identity);
    console.log(deletContent);
    //deletContent1.Modetype=UIMode.Delete;
    deletContent.Status = "In-Active" ? 0 : 1;
    this.ProductService.deleteProduct(JSON.stringify(deletContent)).subscribe(response => {
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
