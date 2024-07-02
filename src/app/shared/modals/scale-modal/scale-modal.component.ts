import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { UUID } from 'angular2-uuid';
import moment from 'moment';
import {
  GridService,
  AngularGridInstance,
  Column,
  Editors,
  FieldType,
  Formatters,
  GridOption,
  OnEventArgs,
} from 'angular-slickgrid';

import { UIMode } from '../../../_services/model/UIMode';
import {ScaleType, CalculationType, ScaleRanges, ScaleDetails} from 'src/app/_services/model/scale';
import { enumHelper } from '../../../shared/directives/_enumhelper';
import { AlertService } from 'src/app/_services/service/alert.service';
import { UIBuilderService } from '@services/service/UIBuilder.service';

@Component({
  selector: 'app-scale-modal',
  templateUrl: './scale-modal.component.html',
  styleUrls: ['./scale-modal.component.scss']
})
export class ScaleModalComponent implements OnInit {


  @Input() editObjects: any;
    // slick grid 
  scalecolumnDefinitions: Column[] = [];
  scalegridOptions: GridOption = {};
  scaledataset: any[] = [];
  angularGrid: AngularGridInstance;
  scalegrid1: any;
  dataView: any;
  gridService: GridService;  
  grid: any;
  updatedObject: any;
  LstScaleRange:any[] = [];
  ScaleRange:ScaleRanges = {} as any;
  ScaleDetails:ScaleDetails = {} as any;
  newCol: any[] = [];
  duplicateTitleHeaderCount = 1;

  scalemodalFrom: FormGroup;
  IsInvalid : boolean = false;
  rowSave : boolean = false
  ScaleTypes: any=[];
  ScaleCalculationType = [
    { label: "Fixed", value: "Fixed" },
    { label: "Percentage", value: "Percentage" },
  ];
  IsStringBased: boolean;
  scaleranges: any[] = [];
  submitted = false;
  disableBtn = false;
  Rangeto:any;
  hardcoderDataset:any=[];
  warninig = "RangeTo Value must be Grater than the RangeFrom Value!";

  constructor(
    private activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private utilsHelper: enumHelper,
    public UIBuilderService: UIBuilderService,
 ) { 
    this.createPlatform();
   };

   get f() { return this.scalemodalFrom.controls; } // reactive forms validation 


  createPlatform(){
    this.scalemodalFrom = this.formBuilder.group({
      Id:[UUID.UUID()],
      Effectivedate:[null, Validators.required],
      ScaleType:[null, Validators.required],
      Status:[true],
      IsStringBased:[false],
      LstScaleRange:[],
    })
  }

  ngOnInit() {
    this.ScaleTypes = this.utilsHelper.transform(ScaleType);//get a enum dropdown names

    if (this.editObjects != null) {
       this.scalemodalFrom.patchValue(this.editObjects);
       this.scalemodalFrom.controls['Effectivedate'].setValue(new Date(this.editObjects.Effectivedate));
       this.scalemodalFrom.controls['Effectivedate'].disable();
       this.scalemodalFrom.controls['Status'].setValue(this.editObjects.Status == "In-Active" ? false : true);
       this.scalemodalFrom.controls['ScaleType'].setValue(this.editObjects.ScaleType == "First_Fit" ? 1 : 2);

       if(this.editObjects.LstScaleRange != null){
       this.scaledataset = []
       this.scaledataset = this.editObjects.LstScaleRange;
       this.scaledataset = this.scaledataset == null ? [] : this.scaledataset;
       this.scaledataset = this.scaledataset.map((item: any)=>{
             return {
          ...item,
           ScaleCalculationType: typeof item.ScaleCalculationType === "string" ? item.ScaleCalculationType: CalculationType[item.ScaleCalculationType],
           Id:  UUID.UUID()
          }
        });
     };
     };
    this.scalemodalFrom.valueChanges
    .subscribe((changedObj: any) => {
      this.disableBtn = true;
    });
    this.scalecolumnDefinitions = [
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
          if (confirm('Are you sure?')) {
            console.log('delet',args.dataContext.Id);
            this.angularGrid.gridService.deleteItemById(args.dataContext.Id);
          };
        }
      },
      { id: 'RangeFrom', name: 'From Value', field: 'RangeFrom', sortable: true,  type: FieldType.float },
      { id: 'RangeTo', name: 'To Value', field: 'RangeTo', sortable: true, type: FieldType.float, editor:{model:Editors.float}},
      { id: 'ScaleCalculationType', name: 'Calculation Type', field: 'ScaleCalculationType', sortable: true,minWidth: 120,type: FieldType.string,filterable: true, editor:{ model: Editors.singleSelect,collection:this.ScaleCalculationType}},
      { id: 'RangeValue', name: 'Range Value 1', field: 'RangeValue', sortable: true, params: { useFormatterOuputToFilter: true }, editor:{model:Editors.float} },
      { id: 'RangeValue2', name: 'Range Value 2', field: 'RangeValue2', sortable: true, params: { useFormatterOuputToFilter: true }, editor:{model:Editors.float} },  
    ];

    this.scalegridOptions = {
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
      autoEdit:true,
      forceFitColumns:true,
    };
  };

  closeModal() {
    this.activeModal.close('Modal Closed');
  };

  change(event) {
    // you can dynamically add your column to your column definitions
    // and then use the spread operator [...cols] OR slice to force Angular to review the changes

    this. IsStringBased = event.target.checked;
    (window as any).Slick.GlobalEditorLock.commitCurrentEdit();

    if(this.IsStringBased == true){
    this.scalecolumnDefinitions.splice(4, 2);
    const newCol1 = { id: `RangeStringValue${this.duplicateTitleHeaderCount++}`, field: 'RangeStringValue', name: 'String Value 1', sortable: true,type: FieldType.string, editor:{model:Editors.text}, params: { useFormatterOuputToFilter: true }};
      
    this.scalecolumnDefinitions.push(newCol1);
    this.scalecolumnDefinitions = this.scalecolumnDefinitions.slice();

    const newCol2 = { id: `RangeStringValue2${this.duplicateTitleHeaderCount++}`, field: 'RangeStringValue2', name: 'String Value 2', sortable: true,type: FieldType.string, editor:{model:Editors.text}, params: { useFormatterOuputToFilter: true }};
    this.scalecolumnDefinitions.push(newCol2);
    this.scalecolumnDefinitions = this.scalecolumnDefinitions.slice();
  
    }
    else{
      this.scalecolumnDefinitions.splice(4, 2);
    const newCo11 = { id: `RangeValue${this.duplicateTitleHeaderCount++}`, name: 'Range Value 1', field: 'RangeValue', sortable: true,type: FieldType.float, params: { useFormatterOuputToFilter: true }, editor:{model:Editors.float} };
                 
    this.scalecolumnDefinitions.push(newCo11);
    this.scalecolumnDefinitions = this.scalecolumnDefinitions.slice();

    const newCol2 = { id: `RangeValue2${this.duplicateTitleHeaderCount++}`, name: 'Range Value 2', field: 'RangeValue2', sortable: true,type: FieldType.float, params: { useFormatterOuputToFilter: true }, editor:{model:Editors.float} };
    this.scalecolumnDefinitions.push(newCol2);
    this.scalecolumnDefinitions = this.scalecolumnDefinitions.slice();
    }
  }

  public isGuid(stringToTest) {
    if (stringToTest[0] === "{") {
      stringToTest = stringToTest.substring(1, stringToTest.length - 1);
    }
    var regexGuid = /^(\{){0,1}[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}(\}){0,1}$/gi;
    return regexGuid.test(stringToTest);
  }


  savebutton(): void {
    (window as any).Slick.GlobalEditorLock.commitCurrentEdit();
    this.IsInvalid = false
    this.scaledataset.forEach(element => {
        element.Id = 0;
        element.IsStringBased = this.scalemodalFrom.get('IsStringBased').value;
        element.RangeFrom = element.RangeFrom;
        element.RangeTo = element.RangeTo;
        if(element.RangeTo <= element.RangeFrom){
          this.alertService.showWarning("To Value must be Grater than the From Value");
          this.IsInvalid = true;
        };
        if (element.ScaleCalculationType !== 'Fixed' && element.ScaleCalculationType !== 'Percentage') {
          this.IsInvalid = true;
        };
        // if(element.ScaleCalculationType === 'Percentage' && element.RangeTo > 100 ){
        //   this.alertService.showWarning("In Percentage, To Value or Form Value cannot be greater than 100 ")
        //   this.IsInvalid=true;
        // }               
        if (element.IsStringBased === false && (element.RangeValue < 0 || element.RangeValue2 < 0)) {
          this.alertService.showWarning("Range Value or Range Value 2 cannot be less than 0");
          this.IsInvalid=true;
          }
      });
      for (let i = 0; i < this.scaledataset.length - 1; i++) {
        if (this.scaledataset[i].RangeTo > this.scaledataset[i + 1].RangeFrom) {
          this.alertService.showWarning("Range To value cannot be greater than the next row's Range From value");
          return;
        }
      }
      if(this.IsInvalid){
        return;
      }
     else if (this.scaledataset.length === 0) {
        this.alertService.showWarning('There should be atleast one record to be save it');
        return;
      }
      
      else if (this.scalemodalFrom.invalid) {
     
        this.alertService.showWarning('Enter Effective Date and Scale Type');
      //  alert('form invalid')
        return;
      }
      else{


        this.submitted = true;
        console.log('this.scalemodalFrom',this.scalemodalFrom.value);
        
        this.ScaleDetails.Status = this.scalemodalFrom.get('Status').value == true ? UIMode.Edit : UIMode.None;
        this.ScaleDetails.Effectivedate = moment(this.scalemodalFrom.get('Effectivedate').value).format('YYYY-MM-DD') as any;
        // this.scalemodalFrom.controls['Effectivedate'].enable()
        // console.log(this.ScaleDetails.Effectivedate);

        // const formatted =moment( this.ScaleDetails.Effectivedate).format("DD/MM/YYYY")
        // console.log('formatted', formatted)
        // this.ScaleDetails.Effectivedate = new Date(formatted)
        // // moment(props.date).format("DD/MM/YYYY")
        // console.log('afterSingtime',this.ScaleDetails.Effectivedate)

        // this.scalemodalFrom.controls['Effectivedate'].setValue(this.ScaleDetails.Effectivedate);
        this.scalemodalFrom.controls['LstScaleRange'].setValue(this.scaledataset);
        this.activeModal.close(this.scalemodalFrom.getRawValue());
        console.log('asdfghjk',this.scalemodalFrom);
        
      }
  }

  angularGridReady(angularGrid: AngularGridInstance) {
    this.angularGrid = angularGrid;
    this.dataView = angularGrid.dataView;
    this.grid = angularGrid.slickGrid;
    this.gridService = angularGrid.gridService;

  }

  addNewItem(insertPosition?: 'top' | 'bottom') {
    (window as any).Slick.GlobalEditorLock.commitCurrentEdit();
    if (this.scalemodalFrom.invalid) {
       this.alertService.showWarning('Enter Effective Date and Scale Type');
    //  alert('form invalid yes')
      return;
    };
    const newId = this.scaledataset.length - 1;

    if(newId == -1){
      const newItem = {
        Id: 0,
        id: 0,
        RangeFrom:0,
        RangeTo:  0,
        ScaleCalculationType: "",
        RangeValue: 0,
        RangeValue2:0,
        RangeStringValue: '',
        RangeStringValue2: '',
      };
     this.angularGrid.gridService.addItem(newItem,  { position: insertPosition });
    }
    else{

      let lastrowdata = this.scaledataset[newId];
      this.Rangeto = lastrowdata.RangeTo + .01;
        // console.log("lastrowdata",lastrowdata);

         // Check if any range values are greater than the next row's form value
         for (let i = 0; i < this.scaledataset.length - 1; i++) {
          if (this.scaledataset[i].RangeTo >= this.scaledataset[i + 1].RangeFrom) {
            this.alertService.showWarning("To value cannot be greater than the next row's From value");
            return;
          }
          
        }
      const newItem = {
        Id: UUID.UUID(),
        id: 0,
        RangeFrom: this.Rangeto,
        RangeTo:  0,
        ScaleCalculationType: lastrowdata.ScaleCalculationType,
        RangeValue: 0,
        RangeValue2:0,
        RangeStringValue: '',
        RangeStringValue2: '',
      };

      if(lastrowdata.RangeTo <= lastrowdata.RangeFrom ){
        this.alertService.showWarning("To Value must be Grater than the From Value");
        return;
      }
      // else if(newItem.ScaleCalculationType === 'Percentage' && lastrowdata.RangeTo >= 100 ){
      //   this.alertService.showWarning("In Percentage, To Value or Form Value cannot be greater than 100 ")
      // }
      else if (newItem.ScaleCalculationType !== 'Fixed' && newItem.ScaleCalculationType !== 'Percentage') {
        this.alertService.showWarning("Please select a valid  Calculation Type");  
      }
      
      else if (lastrowdata.RangeValue < 0 || lastrowdata.RangeValue2 < 0) {
        this.alertService.showWarning("Range Value or Range Value 2 cannot be less than 0");
        }
      
      else{
      this.angularGrid.gridService.addItem(newItem,  { position: insertPosition });
      }
    };
  };
}
