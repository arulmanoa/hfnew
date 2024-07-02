import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
// import { NgxSpinnerService } from 'ngx-spinner';
import {
  AngularGridInstance, Column, Formatters,
  GridOption, OnEventArgs, Statistic,
} from 'angular-slickgrid';
import { ToastrService } from 'ngx-toastr';
import { AuthorizationGuard } from '../../_guards/Authorizationguard';
import * as _ from 'lodash';


// services
import { HeaderService } from '../../_services/service/header.service';
import { CountryService } from '../../_services/service/country.service';
//model

// import { Country } from '../../_services/model/index';
import { UIMode } from '../../_services/model/Common/BaseModel';
import { Country } from 'src/app/_services/model/country';

@Component({
  selector: 'app-countries',
  templateUrl: './countries.component.html',
  styleUrls: ['./countries.component.css']
})
export class CountriesComponent implements OnInit {

  countryForm: FormGroup;
  countryModal: Country = {} as any;
  panelTitle: string;
  identity: number = 0;
  deleteColumn: string;
  columnDefinitions: Column[] = [];
  gridOptions: GridOption = {};
  dataset: any[] = [];
  angularGrid: AngularGridInstance;
  selectedTitles: any[];
  selectedTitle: any;
  gridObj1: any;
  isAutoEdit = true;
  statistics: Statistic;
  constructor(
    private alertService: ToastrService,
    private _countryService: CountryService,
    private _authorizationGuard: AuthorizationGuard,
    private fb: FormBuilder,
    private headerService: HeaderService,
  ) { }


  //#region Validation Start
  formErrors = {
    'code': '',
    'name': '',
  };

  // This object contains all the validation messages for this form
  validationMessages = {
    'code': {
      'required': 'This Field is required.',
      'minlength': 'This Field must be at least 2 characters.',
    },
    'name': {
      'required': 'This Field is required.',
    },
  };

  logValidationErrors(group: FormGroup = this.countryForm): void {
    Object.keys(group.controls).forEach((key: string) => {
      const abstractControl = group.get(key);
      this.formErrors[key] = '';
      if (abstractControl && !abstractControl.valid &&
        (abstractControl.touched || abstractControl.dirty)) {
        const messages = this.validationMessages[key];
        for (const errorKey in abstractControl.errors) {
          if (errorKey) {
            this.formErrors[key] += messages[errorKey] + ' ';
          }
        }
      }
      if (abstractControl instanceof FormGroup) {
        this.logValidationErrors(abstractControl);
      }
    });
  }
  //#endregion Validation End


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

        excludeFromExport: true,
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

    this.initial_getCountry_load();

    this.countryForm = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(2)]],
      name: ['', Validators.required],
    });


  }

  initial_getCountry_load() {
    this._countryService.getCountry().subscribe(response => {
      this.dataset = response;
      this.dataset.forEach(element => {
        element["StatusCode"] = element.Status == 0 ? "In-Active" : "Active";
      });
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
      this.editButtonClick(metadata.dataContext.Id);
    }
    //call delete popup
    else if (metadata.columnDef.id === 'delete') {
      debugger
      this.confirmDeleteid(metadata.dataContext.Id, metadata.dataContext.CountryAbbr);
    }
  }


  newButtonClick() {
    // if (this._authorizationGuard.CheckAcess("Countries", "ViewEdit")) {
    //   return;
    // }
    $('#modalpopupcountry').modal('show');
    this.logValidationErrors();
    this.panelTitle = "Add New Country";
    this.identity = 0;

    this.countryForm = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(2)]],
      name: ['', Validators.required],
    });

  }

  editButtonClick(id: number) {
    // if (this._authorizationGuard.CheckAcess("Countries", "ViewEdit")) {
    //   return;
    // }
    debugger
    this.panelTitle = "Edit Country";
    this.identity = + id;

    this.countryForm = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(2)]],
      name: ['', Validators.required],
    });
    this.countryModal = this.dataset.filter(item => item.Id != this.countryModal.Id)[0];
    this.countryForm.patchValue({
      code: this.countryModal.CountryAbbr,
      name: this.countryModal.Name,
    });
    $('#modalpopupcountry').modal('show');
  }



  IsCountryExists() {
    return this.dataset.filter(country => country.Id != this.countryModal.Id &&
      country.CountryAbbr == this.countryForm.get('code').value
      || country.Name == this.countryForm.get('name').value).length != 0 ? true : false;;

  }

  savebutton(): void {
    if (this.countryForm.invalid) {
      return;
    }
    if (this.IsCountryExists()) {

      this.alertService.warning("The Country code/name is already exists");
      return;
    }


    this.countryModal.Name = this.countryForm.get('name').value;
    this.countryModal.CountryAbbr = this.countryForm.get('code').value;
    this.countryModal.Status = 1;
    var country_request_param = JSON.stringify(this.countryModal);
    console.log(country_request_param);
    if (this.countryModal.Id > 0) { // edit 

      this._countryService.putCountry(country_request_param).subscribe((data: any) => {
        console.log(data);
        if (data.Status == true) {
          $('#modalpopupcountry').modal('hide');
          this.alertService.show(data.Message);

        } else {
          this.alertService.error(data.Message);
        }
      },
        (err) => {
          this.alertService.warning(`Something is wrong!  ${err}`);
        });

    } else {   // create
      this._countryService.postCountry(country_request_param).subscribe((data: any) => {
        if (data.Status) {
          $('#modalpopupcountry').modal('hide');
          this.alertService.show(data.Message);

        } else {
          this.alertService.error(data.Message);
        }
      },
        (err) => {
          this.alertService.warning(`Something is wrong!  ${err}`);
        });
    }
  }


  confirmDeleteid(id: number, DeleteColumnvalue: string) {
    // if (this._authorizationGuard.CheckAcess("Countries", "Delete")) {
    //   return;
    // }
    this.identity = + id;
    this.deleteColumn = DeleteColumnvalue;
    $('#modaldeleteconfimation').modal('show');
  }

  delete() {
    let deletContent: Country = {} as any;
    deletContent = this.dataset.filter(a => a.Id == this.identity)[0];
    deletContent.Modetype = UIMode.Delete;
    this._countryService.deleteCountry(JSON.stringify(deletContent)).subscribe(response => {
      if (response.Status) {
        this.alertService.show(response.Message);
        this.angularGrid.gridService.deleteDataGridItemById(this.identity);
      } else {
        this.alertService.warning(response.Message);
      }
      $('#modaldeleteconfimation').modal('hide');

    }, (error) => {
      $('#modaldeleteconfimation').modal('hide');
    });
  }
}
