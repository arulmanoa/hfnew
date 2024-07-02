import { Component,OnInit, Input } from "@angular/core";
import { DatePipe } from "@angular/common";
import {FormGroup,FormBuilder,Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";

import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import Swal from "sweetalert2";
import { AngularGridInstance, Column, Formatters, GridOption, OnEventArgs } from "angular-slickgrid";
import { UUID } from "angular2-uuid";
import * as _ from "lodash";

import { ScaleModalComponent } from "src/app/shared/modals/scale-modal/scale-modal.component";
import { CalculationType, Scale, ScaleType, _Scale } from "src/app/_services/model/scale";
import { _ScaleModal } from "../../_services/model/scale-modal";
import { RowDataService } from "../personalised-display/row-data.service";
import { HeaderService } from "@services/service/header.service";
import { ScaleService } from "@services/service/scale.service";
import { AlertService } from "@services/service/alert.service";


@Component({
  selector: "app-scale",
  templateUrl: "./scale.component.html",
  styleUrls: ["./scale.component.css"],
})
export class ScaleComponent implements OnInit {
  isEditMode: boolean = false;
  scaleForm: FormGroup;
  @Input() Id: number;

  // slick grid
  columnDefinitions: Column[] = [];
  gridOptions: GridOption = {};
  dataset = [];
  angularGrid: AngularGridInstance;
  selectedTitles: any[];
  selectedTitle: any;
  gridObj1: any;
  isAutoEdit = true;
  scaleModal: Scale;
  ScaleDetails: any = [];
  editScaleObjects: any = [];
  scale: Scale = {} as any;
  submitted = false;

  constructor(
    private headerService: HeaderService,
    private formBuilder: FormBuilder,
    public modalService: NgbModal,
    private router: Router,
    private route: ActivatedRoute,
    private scaleservice: ScaleService,
    private datePipe: DatePipe,
    private alertService: AlertService,
    private rowDataService: RowDataService
  ) {
    this.createForm();
  }

  get f() {
    return this.scaleForm.controls;
  } // reactive forms validation

  createForm() {
    this.scaleForm = this.formBuilder.group({
      Code: ["", Validators.required],
      Name: ["", Validators.required],
      Description: [""],
      Status: [true],
    });

    this.scaleModal = _Scale;
  }

  ngOnInit() {
    this.headerService.setTitle("Scale");
    this.route.data.subscribe((data) => {
      if (data.DataInterface.RowData) {
        console.log(data.DataInterface.RowData.Id);
        this.Id = data.DataInterface.RowData.Id;
        this.editScaleDetails();
      } else {
        this.scaleModal.Id = 0;
      }
      this.rowDataService.dataInterface = {
        SearchElementValuesList: [],
        RowData: null,
      };
    });

    this.columnDefinitions = [
      {
        id: "Effectivedate",
        name: "Effective Date",
        field: "Effectivedate",
        sortable: true,
      },
      {
        id: "ScaleType",
        name: "Scale Type",
        field: "ScaleType",
        sortable: true,
      },
      { id: "Status", name: "Status", field: "Status", sortable: true },
      {
        id: "edit",
        field: "id",
        excludeFromHeaderMenu: true,
        formatter: Formatters.editIcon,
        minWidth: 30,
        maxWidth: 30,
        onCellClick: (e: Event, args: OnEventArgs) => {
          console.log(args);
        },
      },
      {
        id: "delete",
        field: "id",
        excludeFromHeaderMenu: true,
        formatter: Formatters.deleteIcon,
        minWidth: 30,
        maxWidth: 30,
        onCellClick: (e: Event, args: OnEventArgs) => {
          console.log(args);
        },
      },
    ];

    this.gridOptions = {
      enableAutoResize: true, // true by default
      enableCellNavigation: true,
      datasetIdPropertyName: "Id",
      editable: true,
      autoCommitEdit: false,
      autoResize: {
        containerId: "demo-container",
        sidePadding: 15,
      },
      asyncEditorLoading: false,
      autoEdit: this.isAutoEdit,
      enableColumnPicker: false,
      enableExcelCopyBuffer: true,
    };
  }

  savebutton(): void {
    this.ScaleDetails.length = 0;
    if (this.dataset.length === 0) {
      this.alertService.showWarning('There should be atleast one record to be save it');
      return;
    }
    this.submitted = true;
    if (this.scaleForm.invalid) {
      return;
    }
    this.spinnerStarOver();
    if (this.dataset.length > 0) {
      this.ScaleDetails = this.dataset.map((element: any) =>{
        delete element.id
        return {
          Id: this.isGuid(element.Id) == true ? 0 : element.Id,
          Effectivedate: element.Effectivedate,
          ScaleType: ScaleType[element.ScaleType],
          LstScaleRange: element.LstScaleRange.map((item: any)=> {
            return {
              ...item,
              ScaleCalculationType: CalculationType[item.ScaleCalculationType]
            }
          }),
          Status: element.Status == "Active" ? 1 : 0,
        }
      });
    };
    this.scale.Name = this.scaleForm.get("Name").value;
    this.scale.Code = this.scaleForm.get("Code").value;
    this.scale.Description = this.scaleForm.get("Description").value;
    this.scale.Status = this.scaleForm.get("Status").value == false ? 0 : 1;
    this.scale.LstScaleDetails = this.ScaleDetails;
    console.log(this.scale);
    _ScaleModal.NewDetails = this.scale;
    let Scale_request_param = JSON.stringify(_ScaleModal);

    if (this.scale.Id > 0) {
      this.scaleservice.putScale(Scale_request_param).subscribe(
        (data: any) => {
          console.log(data);

          this.spinnerEnd();
          if (data.Status) {
            this.alertService.showSuccess(data.Message);
            this.router.navigate(["/app/listing/ui/scalelist"]);
          } else {
            this.alertService.showWarning(data.Message);
          }
        },
        (err) => {
          this.spinnerEnd();
          this.alertService.showWarning(`Something is wrong!  ${err}`);
          console.log("Something is wrong! : ", err);
        }
      );
    } else {
      this.scaleservice.postScale(Scale_request_param).subscribe(
        (data: any) => {
          console.log(data);

          this.spinnerEnd();
          if (data.Status) {
            this.alertService.showSuccess(data.Message);

            this.router.navigate(["/app/listing/ui/scalelist"]);
          } else {
            this.alertService.showWarning(data.Message);
          }
        },
        (err) => {
          this.spinnerEnd();
          this.alertService.showWarning(`Something is wrong!  ${err}`);
          console.log("Something is wrong! : ", err);
        }
      );
    }
  };

  angularGridReady(angularGrid: AngularGridInstance) {
    this.angularGrid = angularGrid;
    this.gridObj1 = (angularGrid && angularGrid.slickGrid) || {};
  };

  editScaleDetails() {
    this.scaleservice.editScale(this.Id).subscribe(
      (response) => {
        console.log(response);
        this.scale = response.dynamicObject;
        console.log("editscaledetails", this.scale);

        _ScaleModal.NewDetails = this.scale;
        _ScaleModal.OldDetails = JSON.parse(JSON.stringify(response.dynamicObject));
        console.log(_ScaleModal)

        if (this.scale != null) {
          this.scaleModal.Id = this.scale.Id;
          this.scaleForm.patchValue(this.scale);
          this.dataset = this.scale.LstScaleDetails;
          console.log(this.dataset);
          this.dataset = this.dataset == null ? [] : this.dataset;
          this.dataset.forEach((element) => {
            element["Id"] = UUID.UUID();
            element.Effectivedate = this.datePipe.transform(
              element.Effectivedate,
              "yyyy-MM-dd"
            );
            element["Status"] = element.Status == 0 ? "In-Active" : "Active";
            element["ScaleType"] =
              element.ScaleType == 1 ? "First_Fit" : "Reducing_Balance";
          });
          this.isEditMode = true;
        }
       
      });
  };

  add_scale() {
    this.submitted = true;
    if (this.scaleForm.invalid) {
      alert("Enter a valid Code and Name");
      return;
    };

    const modalRef = this.modalService.open(ScaleModalComponent);
    modalRef.result
      .then((result) => {
        console.log("result", result);
        result.id = result.Id;
        result.Effectivedate = this.datePipe.transform(
          result.Effectivedate,
          "yyyy-MM-dd"
        );
        result.Status = result.Status == true ? "Active" : "In-Active";
        result.ScaleType =
          result.ScaleType == 1 ? "First_Fit" : "Reducing_Balance";
        this.angularGrid.gridService.addItemToDatagrid(result);
        console.log("ok", this.dataset);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  public isGuid(stringToTest) {
    if (stringToTest[0] === "{") {
      stringToTest = stringToTest.substring(1, stringToTest.length - 1);
    }
    var regexGuid =
      /^(\{){0,1}[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}(\}){0,1}$/gi;
    return regexGuid.test(stringToTest);
  };

  onCellClicked(e, args) {
    const metadata =
      this.angularGrid.gridService.getColumnFromEventArguments(args);
    console.log(metadata);

    if (metadata.columnDef.id === "edit") {
      console.log(`open a modal window to edit: ${metadata.dataContext.title}`);

      const modalRef = this.modalService.open(ScaleModalComponent);
      modalRef.componentInstance.editObjects = metadata.dataContext;
      modalRef.result
        .then((result) => {
          if(typeof result != 'string'){
            result.Id = metadata.dataContext.Id;
            result.Effectivedate = this.datePipe.transform(
              result.Effectivedate,
              "yyyy-MM-dd"
            );
            result.ScaleType =
              result.ScaleType == 1 ? "First_Fit" : "Reducing_Balance";
            result.Status = result.Status == true ? "Active" : "In-Active";
              result.IsStringBased=result.IsStringBased ;
            console.log("dataset", this.dataset);
            console.log("rsu", result);
  
            this.angularGrid.gridService.updateDataGridItemById(
              metadata.dataContext.Id,
              result,
              true,
              true
            );
          };
        })  
        .catch((error) => {
          console.log(error);
        });

      this.angularGrid.gridService.highlightRow(args.row, 1500);

      // you could also select the row, when using "enableCellNavigation: true", it automatically selects the row
    } else if (metadata.columnDef.id === "delete") {
      if (confirm("Are you sure?")) {
        this.angularGrid.gridService.deleteDataGridItemById(
          metadata.dataContext.Id
        );
      }
    }
  }

  confirmExit() {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: "btn btn-primary",
        cancelButton: "btn btn-danger",
      },
      buttonsStyling: true,
    });

    swalWithBootstrapButtons
      .fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        type: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, Exit!",
        cancelButtonText: "No, cancel!",
        reverseButtons: true,
      })
      .then((result) => {
        if (result.value) {
          this.router.navigate(["/app/listing/ui/scalelist"]);
        } else if (
          /* Read more about handling dismissals below */
          result.dismiss === Swal.DismissReason.cancel
        ) {
        }
      });
  }

  spinnerStarOver() {
    (<HTMLInputElement>document.getElementById("overlay")).style.display =
      "flex";
  }

  spinnerEnd() {
    (<HTMLInputElement>document.getElementById("overlay")).style.display =
      "none";
  }
}
