import { Component, OnInit } from '@angular/core';
import { BankComponent } from 'src/app/views/bank/bank.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { AlertService } from '../../_services/service/alert.service';
import {BankService} from '../../_services/service//bank.service';
import { HeaderService } from 'src/app/_services/service/header.service';
import { BankDetails} from 'src/app/_services/model/Bank';
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
import { element } from '@angular/core/src/render3';
import { toInt } from 'ngx-bootstrap/chronos/utils/type-checks';
@Component({
  selector: 'app-bank-list',
  templateUrl: './bank-list.component.html',
  styleUrls: ['./bank-list.component.css']
})
export class BankListComponent implements OnInit {
  panelTitle: any; 
  spinner: boolean = false; 
  UserId: any; 
  identity: number = 0;
  columnDefinitions: Column[] = [];
  gridOptions: GridOption = {};
  datasetbank: any[] = [];
  angularGrid: AngularGridInstance;
  gridbank: any;
  deleteColumn: string;
 
  constructor(public modalService: NgbModal,private alertService: AlertService,private fb: FormBuilder,
    public BankService:BankService,private headerService: HeaderService,private router: Router,
    private route: ActivatedRoute) { }
  newButtonBankClick() {
    
    this.router.navigate(['app/masters/bank']);
     this.panelTitle = "Add New Bank";
     
   }
  ngOnInit() {
    this.headerService.setTitle('Bank-List');

   
    this.columnDefinitions = [
      { id: 'name', name: 'Name', field: 'Name',formatter: Formatters.uppercase, sortable: true ,filterable: true},
      { id: 'code', name: 'Code', field: 'Code', sortable: true,filterable: true },
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

    this.initial_getBankList_load();

  }
  initial_getBankList_load()
  {
    this.spinner=true;
    this.BankService.getBank().subscribe(response => {
      console.log(response);
      this.datasetbank = response.dynamicObject;
     
      console.log(this.datasetbank.length); 
      this.datasetbank.forEach(element => {    
        element["Status"] = element.Status == 0 ? "In-Active" : "Active";
      });
      this.spinner=false;   
    }, (error) => {
      this.spinner=false;
    });
    console.log(this.datasetbank);
  }

  angularGridReady(angularGrid: AngularGridInstance) {
    this.angularGrid = angularGrid;
    this.gridbank = angularGrid && angularGrid.slickGrid || {};

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
      
    this.router.navigate(['app/masters/bank'], {
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
    let deletContent:BankDetails = {} as any;
    deletContent = this.datasetbank.find(a => a.Id == this.identity );
    deletContent.Status= String(deletContent.Status) == "In-Active" ? 0 : 1;
    console.log(deletContent);
    //deletContent.Modetype=UIMode.Delete;
    this.BankService.deleteBank(JSON.stringify(deletContent)).subscribe(response => {
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
