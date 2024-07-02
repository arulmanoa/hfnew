import { Component, OnInit } from '@angular/core';
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
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';

import { Minimumwages, _Minimumwages } from 'src/app/_services/model/minimumwages';
import { HeaderService } from 'src/app/_services/service/header.service';
import { AlertService } from 'src/app/_services/service/alert.service';
import { WagesService } from 'src/app/_services/service/wages.service';


import Swal from "sweetalert2";
import { UUID } from 'angular2-uuid';
import * as _ from 'lodash';
import { UIMode } from 'src/app/_services/model/UIMode';
import { MinimumwagesModelComponent } from '../../../shared/modals/minimumwages-model/minimumwages-model.component'; 

@Component({
  selector: 'app-minimumwages',
  templateUrl: './minimumwages.component.html',
  styleUrls: ['./minimumwages.component.css']
})
export class MinimumwagesComponent implements OnInit {

  spinner: boolean = true;
  isContent: boolean = false;

  columnDefinitions: Column[] = [];
  gridOptions: GridOption = {};
  dataset: any[] = [];
  angularGrid: AngularGridInstance;
  selectedTitles: any[];
  selectedTitle: any;
  gridObj1: any;
  isAutoEdit = true;


  EditWages: any = [];
  wagesObject: any;


  constructor(

    private headerService: HeaderService,
    private alertService: AlertService, 
    public modalService: NgbModal,
    private router: Router,
    private wagesService: WagesService,


  ) { }

  ngOnInit() {

    // set header page ttile 

    this.headerService.setTitle('Minimum Wages');

    this.gridOptions = {
      enableAutoResize: true,       // true by default
      enableCellNavigation: true,
      datasetIdPropertyName: "Id",
      editable: true,
      rowHeight: 35  ,             
      forceFitColumns: true   ,
      syncColumnCellResize     : true,
      enableAddRow             : false,
      leaveSpaceForNewRows     : true,
      autoEdit                 : false,
    };

    this.columnDefinitions = [
      // { id: 'Id', name: 'Id', field: 'Id', sortable: true },
      { id: 'IndustryName', name: 'Industry', field: 'IndustryName', sortable: true },
      { id: 'StateName', name: 'State', field: 'StateName', sortable: true },
      { id: 'SkillCategoryName', name: 'Skill Category', field: 'SkillCategoryName', sortable: true },
      { id: 'ZoneName', name: 'Zone', field: 'ZoneName', sortable: true },
      { id: 'ProductName', name: 'Product', field: 'ProductName', sortable: true },
      { id: 'ProductCode', name: 'Product Code', field: 'ProductCode', sortable: true },
      { id: 'ProductValue', name: 'Product Value', field: 'ProductValue', sortable: true },
      { id: 'EffectiveDate', name: 'Effective Date', field: 'EffectiveDate', sortable: true, filterable: true, filter: { model: Filters.compoundInputText } },
      { id: 'StatusCode', name: 'Status', field: 'StatusCode', sortable: true },
      {
        id: 'edit',
        field: 'id',
        
        excludeFromHeaderMenu: true,
        formatter: Formatters.editIcon,
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
      {
        id: 'delete',
        field: 'id',


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
    this.initial_getWages_load();
    
  }

  initial_getWages_load() {

    this.spinner = true;
    this.isContent = false;

    this.wagesService.getWages().subscribe(response => {
      this.spinner = false;
      this.isContent = true;    
      console.log(response);
      //this.wages = response.Result;    
      this.dataset = response.Result;
      this.dataset.forEach(element => {
        element["StatusCode"] = element.Status == 0 ? "In-Active" : "Active";
      });
      //console.log('dataset',this.dataset);
     
    }, (error) => {
      this.spinner = false;
      this.isContent = true;
    });
  }

  angularGridReady(angularGrid: AngularGridInstance) {
    this.angularGrid = angularGrid;
    this.gridObj1 = angularGrid && angularGrid.slickGrid || {};
  }

  addWages() {
    
    const modalRef = this.modalService.open(MinimumwagesModelComponent);
    modalRef.componentInstance.Id = 0;
    modalRef.result.then((result) => {
    console.log(result);
    let isAlready = false;

   
    isAlready = _.find(this.dataset, (wages) => wages.Id != result.Id && wages.StateId == result.State && wages.ZoneId == result.Zone && wages.IndustryId == result.Industry &&  wages.SkillCategoryId == result.SkillCategory &&   wages.ProductId == result.Product && wages.ProductCode == result.ProductCode && wages.ProductValue == result.ProductValue &&  wages.EffectiveDate == result.EffectiveDate && wages.Status == result.Status) != null ? true : false;   
    if (isAlready) {
      //alert("the data is already in data base");
      this.alertService.showWarning("The specified Minimum Wages detail already exists")
      return;
    } 
    else {
      this.initial_getWages_load();

      //alert("new data is added in data base");
      this.angularGrid.gridService.addItemToDatagrid(result);
      
    }

    }).catch((error) => {
      console.log(error);
    });

  }

  handleSelectedRowsChanged1(e, args) {
    if (Array.isArray(args.rows)) {
      this.selectedTitle = args.rows.map(idx => {
        const item = this.gridObj1.getDataItem(idx);
        console.log(item);
        

        return item.title || '';
      });
    }
  }

  
  async onCellClicked(e, args) {
    const metadata = this.angularGrid.gridService.getColumnFromEventArguments(args);
    console.log(metadata);

    if (metadata.columnDef.id === 'edit') {
      console.log(`open a modal window to edit: ${metadata.dataContext.Id}`);

      const modalRef = this.modalService.open(MinimumwagesModelComponent);

      modalRef.componentInstance.Id = metadata.dataContext.Id;
      this.wagesObject = metadata.dataContext;

      modalRef.result.then((result) => {
        let isAlready = false;
        result.Id = metadata.dataContext.Id;
       // result.StateName = this.wages.find(a => a.Id == result.State).StateName;
       

       console.log('data', this.dataset);
       console.log('rsu', result);
       
       
       isAlready = _.find(this.dataset, (wages) => wages.Id != result.Id && wages.StateId == result.State && wages.ZoneId == result.Zone && wages.IndustryId == result.Industry &&  wages.SkillCategoryId == result.SkillCategory &&   wages.ProductId == result.Product && wages.ProductCode == result.ProductCode && wages.ProductValue == result.ProductValue &&  wages.EffectiveDate == result.EffectiveDate && wages.Status == result.Status) != null ? true : false;   
       if (isAlready) {
         //alert("the data is already in data base");
         this.alertService.showWarning("The specified Minimum Wages detail already exists")
         return;
       } 
       else {
        // alert("new data is added in data base");
         this.initial_getWages_load();
         this.angularGrid.gridService.addItemToDatagrid(result);
         
       }

      }).catch((error) => {
        console.log(error);
      });

      //this.angularGrid.gridService.highlightRow(args.row, 1500);

      

    } else if (metadata.columnDef.id === 'delete') {

        await this.sweetalertConfirm(metadata.dataContext);

       
      
    }
  }


  deleteAPI(item: Minimumwages) {  

  }
  // confirmation dialog from sweet alert

  sweetalertConfirm(deletContent : Minimumwages ): void {


    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: true,
    })

    swalWithBootstrapButtons.fire({
      title: 'Confirm?',
      text: "Are you sure you want to delete this record?",
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ok!',
      cancelButtonText: 'No, cancel!',
      reverseButtons: true
    }).then((result) => {
      console.log(result);

      if (result.value) {

        deletContent.Modetype = UIMode.Delete;
        this.wagesService.deleteWages(deletContent).subscribe(response => {
    
          if (response.Status) {
            this.alertService.showSuccess(response.Message);
            this.angularGrid.gridService.deleteDataGridItemById(deletContent.Id);
            this.initial_getWages_load();
          } else {
            this.alertService.showWarning(response.Message);
          }
        
        }, (error) => {
    
        });
        
      } else if (result.dismiss === Swal.DismissReason.cancel) {

        swalWithBootstrapButtons.fire(
          'Cancelled',
          'Your request has been cancelled',
          'error'
        )
      }
      
      
    })
  }
}
