import { Component, OnInit, Input, HostListener, ElementRef, OnDestroy } from '@angular/core';
import { isObservable, Observable, Subscription } from 'rxjs';

import { NgForm, FormGroup, FormBuilder, Validators, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
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
import { UUID } from 'angular2-uuid';
import Swal from "sweetalert2";

// services
import { HeaderService } from '../../../_services/service/header.service';
import { AlertService } from '../../../_services/service/alert.service';
import { CountryService } from '../../../_services/service/country.service';
import { StatesService } from '../../../_services/service/states.service';
import { CityService } from '../../../_services/service/city.service';

// modal popup
import { StatuatoryModalComponent } from '../../../shared/modals/statuatory-modal/statuatory-modal.component';
// static dropdown json
import { config } from '../../../_services/configs/app.config';


// model and interfaces
import { Cities, _Cities } from '../../../_services/model/city';
import { Statutory, _Statutory } from '../../../_services/model/statutory';

import * as _ from 'lodash';
import { DatePipe } from '@angular/common';
import { UIMode } from '../../../_services/model/UIMode';
import { apiResponse } from 'src/app/_services/model/apiResponse';

const defaultPageSize = 12;

export class _StatutoryDetails {
  id: string;
  edate: string;
  statutory: string;
  statutoryName: string;
  scale: string;
  scaleName: string;
  isapplicableStatus: string;
  isapplicable: boolean;

}

@Component({
  selector: 'app-city-model',
  templateUrl: './city-model.component.html',
  styleUrls: ['./city-model.component.css']
})
export class CityModelComponent implements OnInit, OnDestroy {

  header = "Add New City";

  @Input() Id: number;
  EditCity: any = [];
  // country 
  LstCountry: any = [];
  countryName: any;
  selectedCountry: any; // from state list 

  // state 
  LstStateList: any = [];
  stateName: any;
  selectedState: any; // from city list 
  editCitiesObjects: any; // from city list

  submitted = false;
  cityForm: FormGroup;
  disableBtn = false;
  // slick grid 
  columnDefinitions: Column[] = [];
  gridOptions: GridOption = {};
  dataset = [];
  angularGrid: AngularGridInstance;
  selectedTitles: any[];
  selectedTitle: any;
  gridObj1: any;
  isAutoEdit = true;

  // model class
  citiesModal: Cities;
  statutoryModal: Statutory;

  statutoryResponse = [];
  LstStatutoryList: any = [];
  LstCityList: Cities[] = [];
  isExists: boolean = false;

  subscriptions: Subscription[] = [];


  isSaveAndNew: boolean = false;
  Scales = [];

  settings = {
    columns: {
      id: {
        title: 'ID'
      },
      name: {
        title: 'Full Name'
      },
      username: {
        title: 'User Name'
      },
      email: {
        title: 'Email'
      }
    }
  };

  constructor(
    private headerService: HeaderService,
    private alertService: AlertService,
    public modalService: NgbModal,
    private formBuilder: FormBuilder,
    private countryService: CountryService,
    private stateService: StatesService,
    private cityService: CityService,
    private router: Router,
    private route: ActivatedRoute,
    private datePipe: DatePipe

  ) {
    this.createForm();
    this.getCountryList();
    //this.getStateList(); // initial loading...
  }

  createForm() {

    this.cityForm = this.formBuilder.group({
      CountryId: ['', Validators.required],
      StateId: ['', Validators.required],
      Code: ['', [Validators.required, Validators.minLength(2)]],
      Name: ['', Validators.required],
      Status: [true],
      IsMetro: [false],
    });

    this.citiesModal = _Cities;
    this.statutoryModal = _Statutory;

  }


  get f() { return this.cityForm.controls; } // reactive forms validation 

  getCountryList(): void {

    this.countryService.getCountry().subscribe(response => {

      console.log(response);
      this.LstCountry = response;
    }, (error) => {
    });

  }

  getStateListByCountryId(_countryId: any): void {

    this.stateService.getStates(_countryId).subscribe(response => {

      console.log(response);
      this.LstStateList = response;
    }, (error) => {
    });

  }

  getCityListByStateId(_stateId: any): void {

    this.cityService.getCities(_stateId).subscribe(response => {

      console.log(response);
      this.LstCityList = response;
    }, (error) => {
    });

  }

  getCity(): void {

    this.cityService.editCity(this.Id).subscribe(response => {
      console.log(response);
      this.EditCity = response.dynamicObject;
      console.log('editcitydetails', this.EditCity);

      if (this.EditCity != null) {

        this.citiesModal.Id = this.EditCity.Id;

        this.cityForm.patchValue(this.EditCity);
        this.cityForm.controls['Code'].disable();
        console.log(this.EditCity);

        console.log(this.EditCity.LstStatutoryDetails);

        this.dataset = this.EditCity.LstStatutoryDetails;

        this.dataset = this.dataset == null ? [] : this.dataset;
        this.dataset.forEach(element => {

          element["Id"] = UUID.UUID();
          element["StatutoryName"] = config.StatutoryType.find(a => a.id == element.StatutoryType).name;
          element.EffectiveDate = this.datePipe.transform(element.EffectiveDate, "yyyy-MM-dd");
          element["apps"] = [];
          element.ApplicableMonths.forEach(e => {
            element.apps.push(config.Months.find(a => a.id == e).name)
          });

        });

        console.log('test', this.dataset);

      }
    }, (error) => {
    });
  }

  ngAfterViewInit(): void {
    //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
    //Add 'implements AfterViewInit' to the class.

    this.cityForm.valueChanges
      .subscribe((changedObj: any) => {
        this.disableBtn = true;
      });

  }

  ngOnInit() {

    this.headerService.setTitle('City');
    this.route.queryParams.subscribe(params => {
      this.selectedCountry = params["countryId"];
      this.selectedState = params["stateId"];
      this.editCitiesObjects = params["CitiesObject"];
      this.getStateListByCountryId(this.selectedCountry)
      this.getCityListByStateId(this.selectedState) // get state list by country id...
      if(this.editCitiesObjects != undefined){
        this.Id = this.editCitiesObjects;
        this.header = "Edit City";
        this.getCity();
      }
      else{
        this.citiesModal.Id = 0;
      }

      // if (this.editCitiesObjects != undefined) {
      //   let DeSerialize = JSON.parse(this.editCitiesObjects)

      //   if (DeSerialize) {
      //     this.citiesModal.Id = DeSerialize.Id;

      //     this.cityForm.patchValue(DeSerialize);
      //     this.cityForm.controls['Code'].disable();
      //     console.log(DeSerialize);

      //     console.log(DeSerialize.LstStatutoryDetails);

      //     this.dataset = DeSerialize.LstStatutoryDetails;

      //     this.dataset = this.dataset == null ? [] : this.dataset;
      //     this.dataset.forEach(element => {

      //       element["Id"] = UUID.UUID();
      //       element["StatutoryName"] = config.StatutoryType.find(a => a.id == element.StatutoryType).name;
      //       element.EffectiveDate = this.datePipe.transform(element.EffectiveDate, "yyyy-MM-dd");

      //     });
      //   }

      // }
    });

    this.cityService.getAllScale().subscribe((res) => {


      let apiResponse: apiResponse = res;
      this.Scales = apiResponse.dynamicObject;

    }), ((err) => {

    })


    this.columnDefinitions = [

      { id: 'EffectiveDate', name: 'Effective Date', field: 'EffectiveDate', sortable: true, filterable: true, filter: { model: Filters.compoundInputText } },
      { id: 'StatutoryName', name: 'Statutory Type', field: 'StatutoryName', sortable: true },
      { id: 'ScaleCode', name: 'Scale Code', field: 'ScaleCode', sortable: true },
      { id: 'apps', name: 'Applicable Months', field: 'apps', sortable: true },
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
          // this.angularGrid.gridService.highlightRow(args.row, 1500);
          // this.angularGrid.gridService.setSelectedRow(args.row);
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
          // this.angularGrid.gridService.highlightRow(args.row, 1500);
          // this.angularGrid.gridService.setSelectedRow(args.row);
        }
      },
    ];

    this.gridOptions = {
      enableAutoResize: true,       // true by default
      enableCellNavigation: true,
      datasetIdPropertyName: "Id",
      editable: true,

      // enableFiltering: true,
      pagination: {
        pageSizes: [10, 15, 20, 25, 30, 40, 50, 75, 100],
        pageSize: defaultPageSize,
        totalItems: 0
      },
      presets: {

        pagination: { pageNumber: 2, pageSize: 20 }
      },
      enableCheckboxSelector: false,
      enableRowSelection: false,
      checkboxSelector: {
        // remove the unnecessary "Select All" checkbox in header when in single selection mode
        hideSelectAllCheckbox: true,

        // you can override the logic for showing (or not) the expand icon
        // for example, display the expand icon only on every 2nd row
        // selectableOverride: (row: number, dataContext: any, grid: any) => (dataContext.id % 2 === 1)
      },
      rowSelectionOptions: {
        // True (Single Selection), False (Multiple Selections)
        selectActiveRow: false
      },
      autoCommitEdit: false,
      autoResize: {
        containerId: 'demo-container',
        sidePadding: 15
      },
      asyncEditorLoading: false,
      autoEdit: this.isAutoEdit,
      enableColumnPicker: false,
      enableExcelCopyBuffer: true,
      // enableFiltering: true,
    };
  }

  setAutoEdit(isAutoEdit) {

    this.isAutoEdit = isAutoEdit;
    this.gridObj1.setOptions({ autoEdit: isAutoEdit }); // change the grid option dynamically
    return true;

  }

  OnCountryChange(CountryId) {

    this.countryName = this.LstCountry.find(a => a.Id == CountryId).Name;

  }

  OnStateChange(StateId) {

    this.stateName = this.LstStateList.find(a => a.Id == StateId).Name;

  }

  IsCityExists() {

    this.isExists = _.find(_.filter(this.LstCityList, a => a.Id != this.citiesModal.Id), (city) => city.Code == this.cityForm.get('Code').value || city.Name == this.cityForm.get('Name').value) != null ? true : false;
    return this.isExists;
  }


  SaveandNewbutton(): void {

    this.isSaveAndNew = true;
    this.savebutton();

  }

  clearForm() {
    //  this.stateForm.get('Name').value = ""
    //     this.stateForm.get('Code').reset();
    this.clearForm();
    this.LstStatutoryList.length = 0;
    this.dataset.length = 0;

    this.cityForm.clearAsyncValidators();
    this.cityForm.clearValidators();
    this.cityForm.updateValueAndValidity();
    this.cityForm.setErrors(null);

    this.cityForm.markAsPristine();
    this.cityForm.markAsUntouched();

    // this.createForm();
  }

  savebutton(): void {


    this.LstStatutoryList.length = 0;
    this.submitted = true;
    if (this.cityForm.invalid) {
      return;
    }

    this.IsCityExists();

    if (this.isExists) {

      this.alertService.showWarning("The City code/name is already exists");
      return;

    }

    this.spinnerStarOver();

    if (this.dataset.length > 0) {

      this.dataset.forEach(element => {

        this.LstStatutoryList.push({
          "StatutoryType": element.StatutoryType,
          "EffectiveDate": element.EffectiveDate,
          "IsApplicable": true,
          "ApplicableMonths": element.ApplicableMonths,
          "ScaleId": element.ScaleId,
          "ScaleCode": element.ScaleCode,
          "ScaleDetails": null
        })
      });
    }

    console.log(this.citiesModal);

    this.citiesModal.Name = this.cityForm.get('Name').value;
    this.citiesModal.Code = this.cityForm.get('Code').value;
    this.citiesModal.CountryId = this.cityForm.get('CountryId').value;
    this.citiesModal.StateId = this.cityForm.get('StateId').value;
    this.citiesModal.Status = this.cityForm.get('Status').value == true ? UIMode.Edit : UIMode.None;
    this.citiesModal.IsMetro = this.cityForm.get('IsMetro').value == true ? 1 : 0;
    this.citiesModal.LstStatutoryDetails = (this.LstStatutoryList);
    this.citiesModal.Modetype = this.citiesModal.Id > UIMode.None ? UIMode.Edit : UIMode.None;
    // this.statesModal.StatutoryDetailsObjectData = JSON.stringify(this.LstStatutoryList);

    var city_request_param = JSON.stringify(this.citiesModal);
    console.log(city_request_param);


    if (this.citiesModal.Id > 0) {

      this.cityService.putCities(city_request_param).subscribe((data: any) => {

        console.log(data);

        this.spinnerEnd();
        if (data.Status) {

          this.alertService.showSuccess(data.Message);

          this.router.navigate(['/app/masters/cityList']);

        }
        else {

          this.alertService.showWarning(data.Message);

        }

      },
        (err) => {
          this.spinnerEnd();
          this.alertService.showWarning(`Something is wrong!  ${err}`);
          console.log("Something is wrong! : ", err);

        });


    } else {

      this.cityService.postCities(city_request_param).subscribe((data: any) => {

        console.log(data);


        this.spinnerEnd();
        if (data.Status) {

          this.alertService.showSuccess(data.Message);

          this.router.navigate(['/app/masters/cityList']);

        }
        else {

          this.alertService.showWarning(data.Message);

        }





      },
        (err) => {
          this.spinnerEnd();
          this.alertService.showWarning(`Something is wrong!  ${err}`);
          console.log("Something is wrong! : ", err);

        });

    }

  }

  add_statuatory() {

    this.submitted = true;
    if (this.cityForm.invalid) {
      return;
    }
    this.IsCityExists();

    if (this.isExists) {

      this.alertService.showWarning("The city code/name is already exists");
      return;

    }
    const modalRef = this.modalService.open(StatuatoryModalComponent);
    modalRef.componentInstance.cityName = this.cityForm.get('Name').value;
    modalRef.componentInstance.stateName = this.stateName;
    modalRef.componentInstance.countryName = this.countryName;
    modalRef.result.then((result) => {
      console.log(result);
      let isAlready = false;

      result.Id = UUID.UUID();
      result.id = result.Id;
      result.StatutoryName = config.StatutoryType.find(a => a.id.toString() === result.StatutoryType).name;
      result.ScaleCode = this.Scales.find(a => a.Id == result.ScaleId).Code;
      result.apps = [];
      result.ApplicableMonths.forEach(element => {

        var staticValue = config.Months.find(a => a.id == element);
        result.apps.push(staticValue.name);
      });

      result.IsApplicable = true;

      isAlready = _.find(this.dataset, (statutory) => statutory.Id != result.Id && statutory.EffectiveDate == result.EffectiveDate && statutory.StatutoryType == result.StatutoryType && statutory.ScaleId == result.ScaleId) != null ? true : false;

      if (isAlready) {

        this.alertService.showWarning("The specified statutory detail already exists")
      } else {

        this.angularGrid.gridService.addItemToDatagrid(result);

      }



      // console.log('sd', this.dataset);
      // console.log(this.dataset.length);

    }).catch((error) => {
      console.log(error);
    });


  }

  handleSelectedRowsChanged1(e, args) {
    //  args.item;



    if (Array.isArray(args.rows)) {
      this.selectedTitle = args.rows.map(idx => {
        const item = this.gridObj1.getDataItem(idx);
        console.log(item);


        return item.title || '';
      });
    }
  }

  // onCellChanged(e, args) {

  //   // this.updatedObject = args.item;
  // }

  onCellClicked(e, args) {
    const metadata = this.angularGrid.gridService.getColumnFromEventArguments(args);
    console.log(metadata);

    if (metadata.columnDef.id === 'edit') {
      // this.alertWarning = `open a modal window to edit: ${metadata.dataContext.title}`;

      console.log(`open a modal window to edit: ${metadata.dataContext.title}`);

      const modalRef = this.modalService.open(StatuatoryModalComponent);
      modalRef.componentInstance.editObjects = metadata.dataContext;
      modalRef.result.then((result) => {
        let isAlready = false;
        result.Id = metadata.dataContext.Id;
        result.StatutoryName = config.StatutoryType.find(a => a.id.toString() == result.StatutoryType.toString()).name;
        result.ScaleCode = this.Scales.find(a => a.Id == result.ScaleId).Code;

        result.apps = [];
        result.ApplicableMonths.forEach(element => {
          var staticValue = config.Months.find(a => a.id == element);
          result.apps.push(staticValue.name);
        });

        result.IsApplicable = true;
        console.log('test', result);

        isAlready = _.find(this.dataset, (statutory) => statutory.Id != result.Id && statutory.EffectiveDate == result.EffectiveDate && statutory.StatutoryType == result.StatutoryType && statutory.ScaleId == result.ScaleId && statutory.ApplicableMonths == result.ApplicableMonths) != null ? true : false;

        if (isAlready) {

          this.alertService.showWarning("The specified statutory detail already exists")
        } else {
          this.angularGrid.gridService.updateDataGridItemById(metadata.dataContext.Id, result, true, true);

        }


      }).catch((error) => {
        console.log(error);
      });


      // highlight the row, to customize the color, you can change the SASS variable $row-highlight-background-color
      this.angularGrid.gridService.highlightRow(args.row, 1500);

      // you could also select the row, when using "enableCellNavigation: true", it automatically selects the row
      // this.angularGrid.gridService.setSelectedRow(args.row);
    } else if (metadata.columnDef.id === 'delete') {
      if (confirm('Are you sure?')) {
        // this.dataset.find(a=>a.Id  == )

        this.angularGrid.gridService.deleteDataGridItemById(metadata.dataContext.Id);
      }
    }
  }


  angularGridReady(angularGrid: AngularGridInstance) {
    this.angularGrid = angularGrid;
    this.gridObj1 = angularGrid && angularGrid.slickGrid || {};
  }



  spinnerStarOver() {

    (<HTMLInputElement>document.getElementById('overlay')).style.display = "flex";

  }

  spinnerEnd() {

    (<HTMLInputElement>document.getElementById('overlay')).style.display = "none";

  }

  confirmExit() {

    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: true
    })

    swalWithBootstrapButtons.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Exit!',
      cancelButtonText: 'No, cancel!',
      reverseButtons: true
    }).then((result) => {
      if (result.value) {

        this.router.navigate(['/app/masters/cityList']);
        // swalWithBootstrapButtons.fire(
        //   'Deleted!',
        //   'Your file has been deleted.',
        //   'success'
        // )
      } else if (
        /* Read more about handling dismissals below */
        result.dismiss === Swal.DismissReason.cancel
      ) {
        // swalWithBootstrapButtons.fire(
        //   'Cancelled',
        //   'Your imaginary file is safe :)',
        //   'error'
        // )
      }
    })


  }
  ngOnDestroy() {
    // if (this.triggerStrategy) {
    //   this.triggerStrategy.destroy();
    // }
  }
}
