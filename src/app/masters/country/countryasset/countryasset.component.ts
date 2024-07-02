import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { GridOption, Column } from 'angular-slickgrid';
import { NgForm, FormGroup, FormBuilder, Validators, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';

import { HeaderService } from '../../../_services/service/header.service';
import { AlertService } from '../../../_services/service/alert.service';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { StatesModalComponent } from '../../states-modal/states-modal.component';
//const defaultPageSize = 1;
@Component({
  selector: 'app-countryasset',
  templateUrl: './countryasset.component.html',
  styleUrls: ['./countryasset.component.css']
})
export class CountrymanagerComponent implements OnInit {

  columnDefinitions: Column[] = [];
  gridOptions: GridOption = {};
  dataset: any[] = [];
  selectedTitle: any;
  ruleGrid: any;

  // ** forms on submit validation ** //
  submitted = false;
  countryForm: FormGroup;

  constructor(

    private headerService: HeaderService,
    private alertService: AlertService,
    public modalService: NgbModal,
    private formBuilder: FormBuilder,
    private elementHost: ElementRef

  ) { }

  get f() { return this.countryForm.controls; } // reactive forms validation 

  ngOnInit() {
    this.headerService.setTitle('Country');

    this.countryForm = this.formBuilder.group({
      code: ['', Validators.required],
      name: ['', Validators.required],
      abbrevation: ['', Validators.required]
    });


    this.columnDefinitions = [
      // { id: 'Id', name: 'Id', field: 'Id', sortable: true },
      { id: 'Code', name: 'Code', field: 'Code', sortable: true },
      { id: 'Name', name: 'Name', field: 'Name', sortable: true },
      { id: 'Status', name: 'Description', field: 'Description', sortable: true },
    ];

    // this.gridOptions = {
    //   enableAutoResize: true,       // true by default
    //   enableCellNavigation: true,
    //   datasetIdPropertyName: "Id",
    //   rowHeight: 40,

    //   autoResize: {
    //     containerId:`grid-container`,
    //     delay: 0,
    //     sidePadding: 10,
    //     bottomPadding: 10
    //   },

    // };

    this.gridOptions = {
      enableAutoResize: true,       // true by default
      enableCellNavigation: true,
      datasetIdPropertyName: "Id",
      pagination: {
        pageSizes: [10, 15, 20, 25, 30, 40, 50, 75, 100],
        pageSize: 5,// defaultPageSize,
        totalItems: 0
      },
      presets: {

        pagination: { pageNumber: 2, pageSize: 20 }
      },
      enableCheckboxSelector: true,
      enableRowSelection: true,
      checkboxSelector: {
        // remove the unnecessary "Select All" checkbox in header when in single selection mode
        hideSelectAllCheckbox: true,

        // you can override the logic for showing (or not) the expand icon
        // for example, display the expand icon only on every 2nd row
        // selectableOverride: (row: number, dataContext: any, grid: any) => (dataContext.id % 2 === 1)
      },
      rowSelectionOptions: {
        // True (Single Selection), False (Multiple Selections)
        selectActiveRow: true
      },
    };


    this.dataset = [

      { Id: 1, Code: 'TN', Name: 'Tamilnadu', Description: 'Tamil nadu' },
      { Id: 2, Code: 'KA', Name: 'Karnataka', Description: 'Karanataka' },
      { Id: 3, Code: 'AP', Name: 'Andra Pradesh', Description: 'Andra Pradesh' },
      { Id: 4, Code: 'KL', Name: 'Kerala', Description: 'Kerala' },
      { Id: 5, Code: 'TN', Name: 'Tamilnadu', Description: 'Tamil nadu' },
      { Id: 6, Code: 'KA', Name: 'Karnataka', Description: 'Karanataka' },
      { Id: 7, Code: 'AP', Name: 'Andra Pradesh', Description: 'Andra Pradesh' },
      { Id: 8, Code: 'KL', Name: 'Kerala', Description: 'Kerala' },
      { Id: 9, Code: 'TN', Name: 'Tamilnadu', Description: 'Tamil nadu' },
      { Id: 10, Code: 'KA', Name: 'Karnataka', Description: 'Karanataka' },
      { Id: 11, Code: 'AP', Name: 'Andra Pradesh', Description: 'Andra Pradesh' },
      { Id: 12, Code: 'KL', Name: 'Kerala', Description: 'Kerala' },

    ];

  }

  onKeyUp(boxInput: HTMLInputElement) {
    let length = boxInput.value.length; //this will have the length of the text entered in the input box
    console.log(length);
  }

  onCellClicked(e, args) {
    console.log(e);

  }
  handleSelectedRowsChanged1(e, args) {
    console.log(e);

    // if (Array.isArray(args.rows)) {
    //   this.selectedTitle = args.rows.map(idx => {
    //     const item = this.gridObj1.getDataItem(idx);
    //     return item.title || '';
    //   });
    // }
  }

  savebutton(): void {

    this.submitted = true;
    if (this.countryForm.invalid) {
      return;
    }

  }


  openModal() {

    this.submitted = true;
    if (this.countryForm.invalid) {
      return;
    }

    const modalRef = this.modalService.open(StatesModalComponent);
    modalRef.componentInstance.id = 10;
    modalRef.result.then((result) => {
      console.log(result);
    }).catch((error) => {
      console.log(error);
    });
  }

}
