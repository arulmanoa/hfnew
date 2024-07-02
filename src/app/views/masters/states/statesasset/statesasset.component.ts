import { Component, OnInit, Input, HostListener, ElementRef, OnDestroy } from '@angular/core';
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

import { HeaderService } from '../../../../_services/service/header.service';
import { AlertService } from '../../../../_services/service/alert.service';
import { CountryService } from '../../../../_services/service/country.service';
import { StatesService } from '../../../../_services/service/states.service';

// modal popup
import { StatuatoryModalComponent } from '../../../../shared/modals/statuatory-modal/statuatory-modal.component';

// static dropdown json
import { config } from '../../../../_services/configs/app.config';

// model and interfaces
import { States, _States } from '../../../../_services/model/states';
import { Statutory, _Statutory } from '../../../../_services/model/statutory';

import * as _ from 'lodash';
import { DatePipe } from '@angular/common';
import { UIMode } from '../../../../_services/model/UIMode';
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
  selector: 'app-statesasset',
  templateUrl: './statesasset.component.html',
  styleUrls: ['./statesasset.component.scss']
})
export class StatemanagerComponent implements OnInit, OnDestroy {

  header =  "Add New State";
  // header: any;

  @Input() Id: number;
  EditState: any = [];

  // country 
  LstCountry: any = [];
  countryName: any;
  selectedCountry: any; // from state list 
  editStateObjects: any; // from state list

  // ** forms on submit validation ** //
  submitted = false;
  stateForm: FormGroup;
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
  statesModal: States;
  statutoryModal: Statutory;

  statutoryResponse = [];
  LstStatutoryList: any = [];
  LstStateList: States[] = [];
  isExists: boolean = false;

  isSaveAndNew: boolean = false;
  Scales  = [];
  



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
    private router: Router,
    private route: ActivatedRoute,
    private datePipe: DatePipe


  ) {
    this.createForm();
    this.getCountryList(); // initial loading... 

  }


 

  createForm() {

    this.stateForm = this.formBuilder.group({
      Code: ['', [Validators.required, Validators.minLength(2)]],
      CountryId: ['', Validators.required],
      Name: ['', Validators.required],
      Status: [true]
    });

    this.statesModal = _States;
    this.statutoryModal = _Statutory;

  }

  get f() { return this.stateForm.controls; } // reactive forms validation 

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

  editStateDetails():void{
    this.stateService.editState(this.Id).subscribe(response => {
      console.log(response);
      this.EditState = response.dynamicObject;
      console.log('editstatedetails',this.EditState);

      if(this.EditState != null){
      //let DeSerialize = JSON.parse(this.EditState)

       // if (this.EditState) {
          this.statesModal.Id = this.EditState.Id;

          this.stateForm.patchValue(this.EditState);
          this.stateForm.controls['Code'].disable();
          console.log(this.EditState);

          console.log(this.EditState.LstStatutoryDetails);

          this.dataset = this.EditState.LstStatutoryDetails;
          console.log(this.dataset);
          this.dataset = this.dataset == null ? [] : this.dataset;
          this.dataset.forEach(element => {

            element["Id"] = UUID.UUID();
            element["StatutoryName"] = config.StatutoryType.find(a => a.id == element.StatutoryType).name;
            element["apps"] = [];
            element.ApplicableMonths.forEach(e => {
              element.apps.push(config.Months.find(a => a.id == e).name)
            });
            element.EffectiveDate = this.datePipe.transform(element.EffectiveDate, "yyyy-MM-dd");

          });

          console.log('test', this.dataset);
          
        //}
      }
    }, (error) =>{
    });
  }

  


  ngAfterViewInit(): void {
    //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
    //Add 'implements AfterViewInit' to the class.

    this.stateForm.valueChanges
      .subscribe((changedObj: any) => {
        this.disableBtn = true;
      });

  }

  ngOnInit() {

    this.headerService.setTitle('State');
    this.route.queryParams.subscribe(params => {
      this.selectedCountry = params["countryId"];
      this.editStateObjects = params["statesObject"];
      this.getStateListByCountryId(this.selectedCountry) // get state list by country id...
      if (this.editStateObjects != undefined) {
        this.Id = this.editStateObjects;

        this.header = "Edit State";       
        this.editStateDetails();

      }
      else{
        this.statesModal.Id = 0;
      }
    });

    this.stateService.getAllScale().subscribe((res)=> {

  
      let apiResponse : apiResponse = res;
      this.Scales = apiResponse.dynamicObject;
     
      
    }), ((err)=> {

    })

    // {value: 'Nancy', disabled: true}, Validators.required


    //     Code: "TN"
    // CountryId: 1
    // CreatedBy: null
    // CreatedOn: "2019-09-17T18:40:07.917"
    // Id: 1
    // LastUpdatedBy: null
    // LastUpdatedOn: "2019-09-17T18:40:07.917"
    // ListOfCity: null
    // ListOfDistrict: null
    // LstStatutoryDetails: null
    // Modetype: 0
    // Name: "Tamil Nadu"
    // Status: 0
    // StatusCode: "In-Active"



    // this.columnDefinitions = [

    //   { id: 'edate', name: 'Effective Date', field: 'Effective Date', sortable: true },
    //   { id: 'statutoryName', name: 'Statutory Type', field: 'Statutory Type', sortable: true },
    //   { id: 'isapplicableStatus', name: 'Is Applicable', field: 'Is Applicable' },
    //   { id: 'scaleName', name: 'Scales', field: 'Scales', sortable: true },
    // ];

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

    // this.columnDefinitions = [
    //   // { id: 'Id', name: 'Id', field: 'Id', sortable: true },
    //   { id: 'Code', name: 'Code', field: 'Code', sortable: true },
    //   { id: 'Name', name: 'Name', field: 'Name', sortable: true },
    //   { id: 'Status', name: 'Description', field: 'Description', sortable: true },
    // ];


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

  OnCountryChange(countryId) {

    this.countryName = this.LstCountry.find(a => a.Id == countryId).Name;

  }

  IsStateExists() {

    this.isExists = _.find(_.filter(this.LstStateList, a => a.Id != this.statesModal.Id), (state) => state.Code == this.stateForm.get('Code').value || state.Name == this.stateForm.get('Name').value) != null ? true : false;
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

    this.stateForm.clearAsyncValidators();
    this.stateForm.clearValidators();
    this.stateForm.updateValueAndValidity();
    this.stateForm.setErrors(null);

    this.stateForm.markAsPristine();
    this.stateForm.markAsUntouched();

    // this.createForm();
  }

  savebutton(): void {


    this.LstStatutoryList.length = 0;
    this.submitted = true;
    if (this.stateForm.invalid) {
      return;
    }

    this.IsStateExists();

    if (this.isExists) {

      this.alertService.showWarning("The State code/name is already exists");
      return;

    }

    this.spinnerStarOver();

    if (this.dataset.length > 0) {

      this.dataset.forEach(element => {

        this.LstStatutoryList.push({
          "StatutoryType": element.StatutoryType,
          "EffectiveDate": element.EffectiveDate,
          "IsApplicable": true,
          "ApplicableMonths":element.ApplicableMonths,
          "ScaleId": element.ScaleId,          
          "ScaleCode": element.ScaleCode,
          "ScaleDetails": null
        })
      });
    }

    console.log(this.statesModal);

    this.statesModal.Name = this.stateForm.get('Name').value;
    this.statesModal.Code = this.stateForm.get('Code').value;
    this.statesModal.CountryId = this.stateForm.get('CountryId').value;
    this.statesModal.Status = this.stateForm.get('Status').value == true ? UIMode.Edit : UIMode.None;
    this.statesModal.LstStatutoryDetails = (this.LstStatutoryList);
    this.statesModal.Modetype = this.statesModal.Id > UIMode.None ? UIMode.Edit : UIMode.None;
    //this.statesModal.StatutoryDetailsObjectData = JSON.stringify(this.LstStatutoryList.ApplicableMonths);

    var state_request_param = JSON.stringify(this.statesModal);
    console.log(state_request_param);




    if (this.statesModal.Id > 0) {

      this.stateService.putStates(state_request_param).subscribe((data: any) => {

        console.log(data);

        this.spinnerEnd();
        if (data.Status) {

          this.alertService.showSuccess(data.Message);

          // if(this.isSaveAndNew){


          //   this.stateForm.reset();
          //   // this.stateForm.get('Code').reset();
          //   this.LstStatutoryList.length = 0;
          //   this.dataset.length = 0;

          // }else {

          this.router.navigate(['/app/masters/stateList']);
          // }

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

      this.stateService.postStates(state_request_param).subscribe((data: any) => {

        console.log(data);


        this.spinnerEnd();
        if (data.Status) {

          this.alertService.showSuccess(data.Message);
          // if(this.isSaveAndNew){


          //   this.stateForm.get('Name').reset();
          //   this.stateForm.get('Code').reset();
          //   this.LstStatutoryList.length = 0;
          //   this.dataset.length = 0;
          //   this.createForm();

          // }else {

          this.router.navigate(['/app/masters/stateList']);
          // }
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

  getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }


  add_statuatory() {


    this.submitted = true;
    if (this.stateForm.invalid) {
      return;
    }
    this.IsStateExists();

    if (this.isExists) {

      this.alertService.showWarning("The State code/name is already exists");
      return;

    }
    const modalRef = this.modalService.open(StatuatoryModalComponent);
    modalRef.componentInstance.stateName = this.stateForm.get('Name').value;
    modalRef.componentInstance.countryName = this.countryName;
    modalRef.result.then((result) => {
      console.log(result);
      let isAlready = false;

      result.Id = UUID.UUID();
      result.id = result.ID;
      result.StatutoryName = config.StatutoryType.find(a => a.id.toString() === result.StatutoryType).name;
      result.ScaleCode = this.Scales.find(a => a.Id == result.ScaleId).Code;
      //result.ApplicableMonths = config.Months.find(a => a.id.toString() === result.ApplicableMonths.toString()).name;
      result.apps = [];
      result.ApplicableMonths.forEach(element => {

        var staticValue = config.Months.find(a => a.id == element);
        // if(staticValue.id === result.ApplicableMonths.id ){

        //   result.ApplicableMonths = config.Months.find(a => a.id.toString() === result.ApplicableMonths.toString()).name;

        // }
        result.apps.push(staticValue.name);
        
        
       
      });

      
      console.log('dataset',this.dataset);
      console.log('rsu', result);
      


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
        //result.ApplicableMonths = config.Months.find(a => a.id == result.ApplicableMonths).name;
       // result.ApplicableMonths = config.Months.find(a => a.id.toString() === result.ApplicableMonths.toString()).name;
        
        

       result.apps = [];
       result.ApplicableMonths.forEach(element => {
 
         var staticValue = config.Months.find(a => a.id == element);
         // if(staticValue.id === result.ApplicableMonths.id ){
 
         //   result.ApplicableMonths = config.Months.find(a => a.id.toString() === result.ApplicableMonths.toString()).name;
 
         // }
         result.apps.push(staticValue.name);
         
         
        
       });


        result.IsApplicable = true;
        console.log('dataset',this.dataset);
        console.log('rsu', result);

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


  //  onCellClicked(e, args) {

  //      if (Array.isArray(args.rows)) {
  //       let i = args.rows.map(idx => {
  //         const item = this.angularGrid.gridService.getDataItemByRowIndex(idx);
  //         console.log(item);

  //         return item.title || '';
  //       });
  //     }
  //  }

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

        this.router.navigate(['/app/masters/stateList']); 
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
  ngOnDestroy(){

  }
}
