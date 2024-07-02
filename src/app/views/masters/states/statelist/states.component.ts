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

import { CountryModalComponent } from '../../../../shared/modals/country-modal/country-modal.component';

import { HeaderService } from '../../../../_services/service/header.service';
import { AlertService } from '../../../../_services/service/alert.service';
import { CountryService } from '../../../../_services/service/country.service';
import { StatesService } from '../../../../_services/service/states.service';

import { States } from '../../../../_services/model/states';

import Swal from "sweetalert2";
import * as _ from 'lodash';
import { UIMode } from '../../../../_services/model/UIMode';
import { Country } from 'src/app/_services/model';

@Component({
  selector: 'app-states',
  templateUrl: './states.component.html',
  styleUrls: ['./states.component.css']
})
export class StatesComponent implements OnInit {

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


  country: any = [];
  people: any[] = [];
  selectedPersonId = '';

  countryId?: any;
  statesObject: any;


  constructor(

    private headerService: HeaderService,
    private alertService: AlertService,
    private countryService: CountryService,
    private stateService: StatesService,
    public modalService: NgbModal,
    private router: Router,

  ) { }


  ngOnInit() {

    // set header page ttile 

    this.headerService.setTitle('State');

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
      { id: 'Code', name: 'Code', field: 'Code', formatter: Formatters.uppercase, sortable: true },
      { id: 'Name', name: 'Name', field: 'Name', sortable: true },
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

    this.initial_getCountry_load();
  }

  initial_getCountry_load() {

    this.spinner = false;
    this.isContent = true;

    this.countryService.getCountry().subscribe(response => {
      console.log(response);
      this.country = response;
      this.countryId = _.find(this.country, (item) => item.Id == "100");
      this.onCountryChange(this.countryId);

    }, (error) => {
    });
  }

  onCountryChange(country : Country) {

    console.log(country.Id);
    
    this.countryId = country.Id;
    this.spinner = true;
    this.isContent = false;

    this.stateService.getStates(country.Id).subscribe(response => {
      this.spinner = false;
      this.isContent = true;
      console.log(response);
      this.dataset = response;
      this.dataset.forEach(element => {
        element["StatusCode"] = element.Status == 0 ? "In-Active" : "Active";
      });

    }, (error) => {
      this.spinner = false;
      this.isContent = true;
    });

  }

  angularGridReady(angularGrid: AngularGridInstance) {
    this.angularGrid = angularGrid;
    this.gridObj1 = angularGrid && angularGrid.slickGrid || {};
  }


  addStates() {

    let navigationExtras: NavigationExtras = {
      queryParams: {
        "countryId": this.countryId,
        "statesObject": this.statesObject == null ? null : JSON.stringify(this.statesObject.Id)
      }
    };
    if (!this.countryId) {
      this.alertService.showWarning("Please choose your country before proceed!")
    }
    else {
      this.router.navigate(['/app/masters/state'], navigationExtras);
    }

  }

  async onCellClicked(e, args) {
    const metadata = this.angularGrid.gridService.getColumnFromEventArguments(args);
    if (metadata.columnDef.id === 'edit') {
      this.statesObject = metadata.dataContext;
      
      this.addStates();

    } else if (metadata.columnDef.id === 'delete') {

        await this.sweetalertConfirm(metadata.dataContext);
     
      
    }
  }



  deleteAPI(item: States) {

   

  }




  // confirmation dialog from sweet alert

  sweetalertConfirm(deletContent : States ): void {


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
        this.stateService.deleteStates(deletContent).subscribe(response => {
    
          if (response.Status) {
            this.alertService.showSuccess(response.Message);
            this.angularGrid.gridService.deleteDataGridItemById(deletContent.Id);
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
