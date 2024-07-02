import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from '../../../_services/service/alert.service';
import { UIBuilderService } from '../../../_services/service/UIBuilder.service';
import { PaygroupService } from 'src/app/_services/service/paygroup.service';

import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';

import {
  AngularGridInstance,
  Column,
  Editors,
  EditorArgs,
  EditorValidator,
  FieldType,
  Filters,
  Formatters,
  Formatter,
  GridOption,
  OnEventArgs,
  OperatorType,
  Sorters,
  GridService,
} from 'angular-slickgrid';
import * as _ from 'lodash';
import { UUID } from 'angular2-uuid';

export const ProductCalculationType: any =
  [
    { ValueMember: 1, DisplayMember: 'Fixed', icon: "mdi-checkbox-marked-circle", checked: false },
    { ValueMember: 2, DisplayMember: 'Variable', icon: "mdi-shuffle-variant", checked: false },
    { ValueMember: 3, DisplayMember: 'Rule', icon: "mdi-check", checked: false }
  ];

@Component({
  selector: 'app-product-modal',
  templateUrl: './product-modal.component.html',
  styleUrls: ['./product-modal.component.css']
})
export class ProductModalComponent implements OnInit {


  @Input() editObjects: any;
  // slick grid 
  productcolumnDefinitions: Column[] = [];
  productgridOptions: GridOption = {};
  productdataset = [];
  angularGrid: AngularGridInstance;
  productgrid1: any;
  dataView: any;
  gridService: GridService;
  grid: any;
  updatedObject: any;


  searchList: [];
  spinner: boolean = false;

  selectedproductRecords: any[];

  previewFormatter: Formatter;


  listOfproductType = [];
  producttypename: any

  editobjectid: any;


  calculationTypename: any;
  showonlyactive: boolean = true;

  PaygroupProductModalFrom: FormGroup;

  submitted = false;
  disableBtn = false;

  constructor(
    private activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    // private utilsHelper: enumHelper,
    public modalService: NgbModal,
    public UIBuilderService: UIBuilderService,
    public paygroupService: PaygroupService,
  ) {
    this.createPlatform();
  }

  get f() { return this.PaygroupProductModalFrom.controls; } // reactive forms validation 

  createPlatform() {
    this.PaygroupProductModalFrom = this.formBuilder.group({

      showonlyactive: [true],

    })
  }



  ngOnInit() {
    console.log('INNNN');
    this.spinner = true;

    console.log('editobject in modal dataset', this.editObjects);


    this.productcolumnDefinitions = [
      { id: 'Code', name: 'Product Code', field: 'Code', filterable: true, sortable: true, type: FieldType.string },
      { id: 'DisplayName', name: 'Display Name', field: 'Name', sortable: true, filterable: true, type: FieldType.string },
      { id: 'ProductType', name: 'Product Type', field: 'ProductType', sortable: true, filterable: true, type: FieldType.string },
      { id: 'CalculationType', name: 'Calculation Type', field: 'CalculationType', sortable: true, filterable: true },
      { id: 'Status', name: 'Status', field: 'Status', sortable: true, filterable: true },


    ];



    this.productgridOptions = {
      asyncEditorLoading: false,
      autoResize: {
        containerId: 'grid-container',

      },
      enableAutoResize: true,
      enableHeaderMenu: true,   // <<-- this will automatically add extra custom commands
      enableFiltering: true,
      editable: true,
      enableColumnPicker: true,
      enableCellNavigation: true,
      enableRowSelection: true,
      showHeaderRow: false,
      explicitInitialization: true,
      datasetIdPropertyName: "Id",
      autoEdit: true,
      forceFitColumns: true,
      enableCheckboxSelector: true,
      rowSelectionOptions: {
        // True (Single Selection), False (Multiple Selections)
        selectActiveRow: false,
      },
      checkboxSelector: {
        // remove the unnecessary "Select All" checkbox in header when in single selection mode
        hideSelectAllCheckbox: false,
      },


    };

    this.loadProductTypeLst();
    this.spinner = false;
    this.initial_getProduct_load();


  }


  ShowOnlyActiveChange(event) {

    this.showonlyactive = event.target.checked;
    // console.log('this.showonlyactive',this.showonlyactive)
    if (this.showonlyactive == true) {
      this.initial_getProduct_load()
    }
    else {
      this.initial_getProduct_load()
    }

  }

  loadProductTypeLst() {

    this.paygroupService.getProductType().subscribe((res) => {
      this.listOfproductType = res.dynamicObject;
      this.listOfproductType = _.orderBy(this.listOfproductType, ["name"], ["asc"]);
      // console.log('ll', this.listOfproductType);
    });
    ((err) => {

    });
  }

  initial_getProduct_load() {
    this.spinner = true;
    this.paygroupService.getProduct().subscribe(response => {
      // console.log(response);
      this.searchList = response.dynamicObject;
      let dataList = response.dynamicObject;

      let productfilterid7 = dataList.filter(function (product) {
        return product.ProductTypeId != 7;
      });
      let productfilterid3 = productfilterid7.filter(function (product) {
        return product.ProductTypeId != 3;
      });

      if (this.showonlyactive == true) {
        this.productdataset = dataList.filter(function (product) {
          return product.Status == 1;
        });
        // this.productdataset = productfilterid3.filter(function(product) {
        //   return product.Status == 1;
        // });
      }
      else {
        // this.productdataset = productfilterid3;
        this.productdataset = dataList;
      }

      console.log("editobjects", this.productdataset, this.editObjects);
      if (this.editObjects != null && this.editObjects.length) {
        this.editObjects.forEach(element => {
          if (element.ProductId != undefined) {
            this.editobjectid = element.ProductId;
          }
          else {
            this.editobjectid = element.Id;
          }
          console.log('editobjectid', this.editobjectid)

          let editid = this.editobjectid

          this.productdataset = this.productdataset.filter(function (product) {
            return product.Id != editid;
          });
        });
      }

      console.log('dataset', this.productdataset)
      this.productdataset.forEach(element => {

        let productid = element.ProductTypeId;
        let caluculationid = element.CalculationType;

        this.listOfproductType.forEach(element => {
          if (element.Id == productid) {
            this.producttypename = element.Name
          }
        })

        ProductCalculationType.forEach(element => {
          if (element.ValueMember == caluculationid) {
            this.calculationTypename = element.DisplayMember
          }
        });

        element["CalculationType"] = this.calculationTypename;
        element["ProductType"] = this.producttypename;
        element["Status"] = element.Status == 0 ? "In-Active" : "Active";

      });
      this.spinner = false;
    }, (error) => {

    });
  }

  angularGridReady(angularGrid: AngularGridInstance) {
    this.angularGrid = angularGrid;
    this.dataView = angularGrid.dataView;
    this.productgrid1 = angularGrid.slickGrid;
    this.gridService = angularGrid.gridService;

  }

  onSelectedRowsChanged(data, args) {
    // const metadata = this.angularGrid.gridService.getColumnFromEventArguments(data);
    //  console.log('selecteddata',args);
    //  console.log('selected',data);
    //  console.log('selected2',this.searchList);

    this.selectedproductRecords = [];

    if (args != null && args.rows != null && args.rows.length > 0) {
      //  console.log('length ar',args.rows.length);
      for (let i = 0; i < args.rows.length; i++) {
        //  console.log('element4',args.rows)
        const row = args.rows[i];
        const row_data = this.dataView.getItem(row);
        this.selectedproductRecords.push(row_data);

      }
    }

    //  console.log('answer',this.selectedproductRecords);
  }
  /* #endregion */

  closeModal() {
    this.activeModal.close('Modal Closed');
  }

  savebutton(): void {
    this.submitted = true;
    this.selectedproductRecords.forEach(arr => {
      arr.id = arr.Id;
      arr.ProductId = arr.Id;
      arr.Id = UUID.UUID();
    });
    this.activeModal.close(this.selectedproductRecords);

  }

}
