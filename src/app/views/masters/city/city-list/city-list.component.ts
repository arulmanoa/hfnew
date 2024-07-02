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
  GridOdataService,
  OnEventArgs,
  OperatorType,
  Sorters,
  CaseType,
} from 'angular-slickgrid';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';

import { CountryModalComponent } from '../../../../shared/modals/country-modal/country-modal.component';

import { HeaderService } from '../../../../_services/service/header.service';
import { AlertService } from '../../../../_services/service/alert.service';
import { CountryService } from '../../../../_services/service/country.service';
import { StatesService } from '../../../../_services/service/states.service';
import { CityService } from '../../../../_services/service/city.service';

import { Cities } from '../../../../_services/model/city';


import Swal from "sweetalert2";
import * as _ from 'lodash';
import { UIMode } from '../../../../_services/model/UIMode';
import { Country } from 'src/app/_services/model';
import { States } from 'src/app/_services/model/states';

import { HttpClient, HttpHeaders } from '@angular/common/http';


const defaultPageSize = 20;

@Component({
  selector: 'app-city-list',
  templateUrl: './city-list.component.html',
  styleUrls: ['./city-list.component.css']
})
export class CityListComponent implements OnInit {

  httpOptions: any;
  
  isCountEnabled = true;
  odataVersion = 2;
  odataQuery = '';

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
  ListOfstate: any = [];
  
  people: any[] = [];
  selectedPersonId = '';

  countryId?: any;
  stateId: any;
  CitiesObject: any;

  constructor(
    private headerService: HeaderService,
    private alertService: AlertService,
    private countryService: CountryService,
    private stateService: StatesService,
    private cityService: CityService,
    public modalService: NgbModal,
    private router: Router,
    private http: HttpClient,

  ) { }

  ngOnInit() {

    
    // set header page ttile 

    this.headerService.setTitle('City');

    this.gridOptions = {
      enableAutoResize: true,       // true by default
      enableCellNavigation: true,
      datasetIdPropertyName: "Id",
      editable: true,
      rowHeight: 35 ,             
      forceFitColumns: true   ,
      syncColumnCellResize     : true,
      enableAddRow             : false,
      leaveSpaceForNewRows     : true,
      autoEdit                 : false,
      //enableFiltering: true,
      enablePagination: true,
      pagination: {
        pageSizes: [10, 15, 20, 25, 30, 40, 50, 75, 100],
        pageSize: 10,
        totalItems: 0
      },
      presets: {

        pagination: { pageNumber: 2, pageSize: 10 }
      },

      // backendServiceApi: {
      //   service: new GridOdataService(),
      //   // define all the on Event callbacks
      //   options: {
      //     caseType: CaseType.pascalCase,
      //     top: defaultPageSize,
      //   },
      //   preProcess: () => this.displaySpinner(true),
      //   process: (query) => this.getCityApiCall(query),
      //   postProcess: (response) => {
      //     this.displaySpinner(false);
      //     this.getCityCallback(response);
      //   }
      // }  
     
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

  
  displaySpinner(boolean){
        
  }

  initial_getCountry_load() {

    this.spinner = false;
    this.isContent = true;

    this.countryService.getCountry().subscribe(response => {
      console.log(response);
      this.country = response;
      this.country=_.orderBy(this.country,["Name"],["asc"])
      this.countryId = _.find(this.country, (item) => item.Id == "100" );
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
      
      console.log(response);
      this.ListOfstate=response;
      this.ListOfstate=_.orderBy(this.ListOfstate,["Name"],["asc"])
      
      this.stateId = _.find(this.ListOfstate, (item) => item.Id == "18");
      this.onStateChange(this.stateId);
    
      this.spinner = false;
      this.isContent = true;
    }, (error) => {
      this.spinner = false;
      this.isContent = true;
    });

  }

  
  onStateChange(state : States) {

    console.log(state.Id);
    
    this.stateId = state.Id;
    this.spinner = true;
    this.isContent = false;
    this.cityService.getCities(this.stateId).subscribe(response => {
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

  // getCustomerApiCall(odataQuery) {

  //   let out  = [];
  //   for(let i = 0; i < odataQuery; i++) {
  //   out.push(i)
  //   }
  //   return new Promise(resolve => {
  //     resolve(out);
  // });
  // // return this.http.get(`['/out'],${odataQuery}`).toPromise();
  // }

     
  // getCityApiCall(odataQuery) {
  //   return this.http.get(`http://35.209.219.112:8080/hrsuite.api/api/Location/GetCityListByStateId?${odataQuery}`).toPromise();
  // }
  
  
  // getCityCallback(response) {
  //   this.gridOptions.pagination.totalItems = response.totalRecordCount;
  //   this.gridOptions = Object.assign({}, this.gridOptions);

  //   this.dataset = response.items as Cities[];
  // }

  angularGridReady(angularGrid: AngularGridInstance) {
    this.angularGrid = angularGrid;
    this.gridObj1 = angularGrid && angularGrid.slickGrid || {};
  }

  addCity() {

    let navigationExtras: NavigationExtras = {
      queryParams: {
        "countryId": this.countryId,
        "stateId":  this.stateId,
        "CitiesObject": this.CitiesObject == null ? null : JSON.stringify(this.CitiesObject.Id)
      }
    };
    if (!this.stateId) {
      this.alertService.showWarning("Please choose your state before proceed!")
    }
    else {
      this.router.navigate(['/app/masters/city'], navigationExtras);
    }

  }

  async onCellClicked(e, args) {
    const metadata = this.angularGrid.gridService.getColumnFromEventArguments(args);
    if (metadata.columnDef.id === 'edit') {
      this.CitiesObject = metadata.dataContext;
      this.addCity();

    } else if (metadata.columnDef.id === 'delete') {

        await this.sweetalertConfirm(metadata.dataContext);
     
      
    }
  }

  deleteAPI(item: Cities) {

   

  }

  // confirmation dialog from sweet alert

  sweetalertConfirm(deletContent : Cities ): void {


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
        this.cityService.deleteCities(deletContent).subscribe(response => {
    
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
