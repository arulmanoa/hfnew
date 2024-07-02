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
  Statistic,
  GridOdataService,
} from 'angular-slickgrid';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CountryModalComponent } from '../../country-modal/country-modal.component';
import * as _ from 'lodash';
import Swal from "sweetalert2";
import { Subscription } from 'rxjs';
// services

import { HeaderService } from '../../../_services/service/header.service';
import { AlertService } from '../../../_services/service/alert.service';
import { CountryService } from '../../../_services/service/country.service';
import { SessionStorage } from '../../../_services/service/session-storage.service'; // session storage

//model
import { SessionKeys } from '../../../_services/configs/app.config'; // app config 
import { UIMode } from '../../../_services/model/Common/BaseModel';
import { Country } from '../../../_services/model/country';
import { LoginResponses, ProfileAccessControl, AccessControlType, AccessControl }
  from '../../../_services/model/Common/LoginResponses';
// const defaultPageSize = 5;

@Component({
  selector: 'app-country',
  templateUrl: './country.component.html',
  styleUrls: ['./country.component.css']
})

export class CountryComponent implements OnInit {

   spinner = true;
   isContent = false;

  columnDefinitions: Column[] = [];
  gridOptions: GridOption = {};
  dataset = [];
  angularGrid: AngularGridInstance;
  selectedTitles: any[];
  selectedTitle: any;
  gridObj1: any;
  isAutoEdit = true;
  statistics: Statistic;

  odataVersion = 2;
  odataQuery = '';
  processing = true;
  status = { text: 'processing...', class: 'alert alert-danger' };

  SessionDetails: LoginResponses;
  AccessMenuLst: ProfileAccessControl[] = [];

  menuItems: AccessControl[] = [];
  menuFInal = [];

  elemtndd: any;

  constructor(

    public headerService: HeaderService,
    public alertService: AlertService,
    public countryService: CountryService,
    public modalService: NgbModal,
    public sessionService: SessionStorage,

  ) { }


  ngOnInit() {

    // set header page ttile 

    this.headerService.setTitle('Country');


    this.columnDefinitions = [
      // { id: 'Id', name: 'Id', field: 'Id', sortable: true },
      { id: 'CountryAbbr', name: 'Abbrevation', field: 'CountryAbbr', formatter: Formatters.uppercase, sortable: true },
      { id: 'Name', name: 'Country Name', field: 'Name', sortable: true },
      { id: 'StatusCode', name: 'Status', field: 'StatusCode', cssClass: 'right-align', sortable: true },
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

    this.gridOptions = {
      enableAutoResize: true,       // true by default
      enableCellNavigation: true,
      datasetIdPropertyName: "Id",
      editable: true,



      // autoResize: {
      //   containerId: 'demo-container',
      //   sidePadding: 15
      // },
      // checkboxSelector: {
      //   // you can toggle these 2 properties to show the "select all" checkbox in different location
      //   hideInFilterHeaderRow: false,
      //   hideInColumnTitleRow: true
      // },

      // enableFiltering: true,
      // enableCheckboxSelector: true,
      // enableRowSelection: true,
      // pagination: {
      //   pageSizes: [5, 10, 15, 20, 25, 30, 40, 50, 75, 100],
      //   pageSize: defaultPageSize,
      //   totalItems: 0
      // },
      // presets: {
      //   // you can also type operator as string, e.g.: operator: 'EQ'
      //   filters: [
      //     { columnId: 'gender', searchTerms: ['male'], operator: OperatorType.equal },
      //   ],
      //   sorters: [
      //     // direction can be written as 'asc' (uppercase or lowercase) and/or use the SortDirection type
      //     { columnId: 'name', direction: 'asc' }
      //   ],
      //   pagination: { pageNumber: 2, pageSize: 20 }
      // },
      // backendServiceApi: {
      //   service: new GridOdataService(),
      //   options: { version: this.odataVersion }, // defaults to 2, the query string is slightly different between OData 2 and 4
      //   preProcess: () => this.displaySpinner(true),
      //   process: (query) => this.getCustomerApiCall(query),
      //   postProcess: (response) => {
      //     this.statistics = response.statistics;
      //     this.displaySpinner(false);
      //     this.getCustomerCallback(response);
      //   }
      // }




    };




    this.initial_getCountry_load();
    // this.dataset = [

    //   { Id: 1, CountryCode: 'IN', Name: 'INDIA', Status: 'Active' },
    //   { Id: 2, CountryCode: 'US', Name: 'AMERICA', Status: 'Active' },
    //   { Id: 3, CountryCode: 'UK', Name: 'LONDON', Status: 'Active' },

    // ];





  }

  displaySpinner(isProcessing) {
    this.processing = isProcessing;
    this.status = (isProcessing)
      ? { text: 'processing...', class: 'alert alert-danger' }
      : { text: 'done', class: 'alert alert-success' };
  }


  getCustomerCallback(data) {
    // totalItems property needs to be filled for pagination to work correctly
    // however we need to force Angular to do a dirty check, doing a clone object will do just that
    this.gridOptions.pagination.totalItems = data['totalRecordCount'];
    if (this.statistics) {
      this.statistics.totalItemCount = data['totalRecordCount'];
    }
    this.gridOptions = Object.assign({}, this.gridOptions);

    // once pagination totalItems is filled, we can update the dataset
    this.dataset = data['items'];
    this.odataQuery = data['query'];
  }


  getCustomerApiCall(query) {
    // in your case, you will call your WebAPI function (wich needs to return a Promise)
    // for the demo purpose, we will call a mock WebAPI function
    return this.getCustomerDataApiMock(query);
  }


  /** This function is only here to mock a WebAPI call (since we are using a JSON file for the demo)
   *  in your case the getCustomer() should be a WebAPI function returning a Promise
   */
  getCustomerDataApiMock(query) {
    // the mock is returning a Promise, just like a WebAPI typically does
    return new Promise((resolve, reject) => {
      const queryParams = query.toLowerCase().split('&');
      let top: number;
      let skip = 0;
      let orderBy = '';
      let countTotalItems = 100;
      const columnFilters = {};

      for (const param of queryParams) {
        if (param.includes('$top=')) {
          top = +(param.substring('$top='.length));
        }
        if (param.includes('$skip=')) {
          skip = +(param.substring('$skip='.length));
        }
        if (param.includes('$orderby=')) {
          orderBy = param.substring('$orderby='.length);
        }
        if (param.includes('$filter=')) {
          const filterBy = param.substring('$filter='.length).replace('%20', ' ');
          if (filterBy.includes('contains')) {
            const filterMatch = filterBy.match(/contains\(([a-zA-Z\/]+),\s?'(.*?)'/);
            const fieldName = filterMatch[1].trim();
            columnFilters[fieldName] = { type: 'substring', term: filterMatch[2].trim() };
          }
          if (filterBy.includes('substringof')) {
            const filterMatch = filterBy.match(/substringof\('(.*?)',([a-zA-Z ]*)/);
            const fieldName = filterMatch[2].trim();
            columnFilters[fieldName] = { type: 'substring', term: filterMatch[1].trim() };
          }
          if (filterBy.includes('eq')) {
            const filterMatch = filterBy.match(/([a-zA-Z ]*) eq '(.*?)'/);
            const fieldName = filterMatch[1].trim();
            columnFilters[fieldName] = { type: 'equal', term: filterMatch[2].trim() };
          }
          if (filterBy.includes('startswith')) {
            const filterMatch = filterBy.match(/startswith\(([a-zA-Z ]*),\s?'(.*?)'/);
            const fieldName = filterMatch[1].trim();
            columnFilters[fieldName] = { type: 'starts', term: filterMatch[2].trim() };
          }
          if (filterBy.includes('endswith')) {
            const filterMatch = filterBy.match(/endswith\(([a-zA-Z ]*),\s?'(.*?)'/);
            const fieldName = filterMatch[1].trim();
            columnFilters[fieldName] = { type: 'ends', term: filterMatch[2].trim() };
          }
        }
      }

      const sort = orderBy.includes('asc')
        ? 'ASC'
        : orderBy.includes('desc')
          ? 'DESC'
          : '';

      let url;

      const dataArray = this.dataset

      // Read the result field from the JSON response.
      const firstRow = skip;
      let filteredData = dataArray;
      if (columnFilters) {
        for (const columnId in columnFilters) {
          if (columnFilters.hasOwnProperty(columnId)) {
            filteredData = filteredData.filter(column => {
              const filterType = columnFilters[columnId].type;
              const searchTerm = columnFilters[columnId].term;
              let colId = columnId;
              if (columnId && columnId.indexOf(' ') !== -1) {
                const splitIds = columnId.split(' ');
                colId = splitIds[splitIds.length - 1];
              }
              const filterTerm = column[colId];
              if (filterTerm) {
                switch (filterType) {
                  case 'equal': return filterTerm.toLowerCase() === searchTerm;
                  case 'ends': return filterTerm.toLowerCase().endsWith(searchTerm);
                  case 'starts': return filterTerm.toLowerCase().startsWith(searchTerm);
                  case 'substring': return filterTerm.toLowerCase().includes(searchTerm);
                }
              }
            });
          }
        }
        countTotalItems = filteredData.length;
      }
      const updatedData = filteredData.slice(firstRow, firstRow + top);

      setTimeout(() => {
        resolve({ items: updatedData, totalRecordCount: countTotalItems, query });
      }, 500);

    });
  }




  initial_getCountry_load() {

    this.spinner = true;
    this.isContent = false;

    setTimeout(() => {
      this.spinner = false;
      this.isContent = true;

      this.countryService.getCountry().subscribe(response => {
        console.log(response);
        this.dataset = response;
        this.dataset.forEach(element => {


          element["StatusCode"] = element.Status == 0 ? "In-Active" : "Active";

        });
      }, (error) => {
      });

    }, 1000);

  }


  onCellClicked(e, args) {

    const metadata = this.angularGrid.gridService.getColumnFromEventArguments(args);

    if (metadata.columnDef.id === 'edit') {

      this.addCountry(metadata);
    } else if (metadata.columnDef.id === 'delete') {

      this.sweetalertConfirm((metadata.dataContext))

    }
  }


  addCountry(metadata?: any) {


    const modalRef = this.modalService.open(CountryModalComponent);
    modalRef.componentInstance.editObjects = metadata == undefined ? null : metadata.dataContext;
    modalRef.componentInstance.countryList = this.dataset;
    modalRef.result.then((result) => {
      console.log('res', result);
      this.initial_getCountry_load();
    }).catch((error) => {
      console.log(error);
    });

  }

  angularGridReady(angularGrid: AngularGridInstance) {

    this.angularGrid = angularGrid;
    this.gridObj1 = angularGrid && angularGrid.slickGrid || {};

  }



  // confirmation dialog from sweet alert

  sweetalertConfirm(deletContent: Country): void {


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

        this.countryService.deleteCountry(JSON.stringify(deletContent)).subscribe(response => {

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
