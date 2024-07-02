import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DataSourceType, InputControlType, RowSelectionType, SearchPanelType } from '../../personalised-display/enums';
import { ColumnDefinition, PageLayout, SearchElement } from '../../personalised-display/models';
import { LoginResponses, UIMode } from 'src/app/_services/model';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { AlertService, FileUploadService, ImportLayoutService, PagelayoutService, SessionStorage } from 'src/app/_services/service';
import { ReportService } from 'src/app/_services/service/report.service';
import { apiResult } from 'src/app/_services/model/apiResult';
import { AngularGridInstance, Column, Formatter, Formatters, GridOption, GridService } from 'angular-slickgrid';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiRequestType, DataFormat, ImportControlElementType } from '../../generic-import/import-enums';
import { FormInputControlType, RelationWithParent } from '../../generic-form/enums';
import { ImportLayout } from '../../generic-import/import-models';
import FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
import { TimeCardStatus_SME } from 'src/app/_services/model/Payroll/TimecardStatus';
import moment from 'moment';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
type AOA = any[][];

const highlightingFormatter = (row, cell, value, columnDef, dataContext) => {
  if (value) {

    if (dataContext.Status != 10000) {
      return `<div style="color:red;">${value}</div>`;
    }
    else if (dataContext.AcknowledgmentDetail == '' || dataContext.AcknowledgmentDetail == null || dataContext.AcknowledgmentDetail == undefined) {
      return `<div style="color:red;">${value}</div>`;
    }
    else if (dataContext.PaymentDate == '' || dataContext.PaymentDate == null || dataContext.PaymentDate == undefined) {
      return `<div style="color:red;">${value}</div>`;
    }
    else {
      return value
    }

  }
};



@Component({
  selector: 'app-generate-payslip',
  templateUrl: './generate-payslip.component.html',
  styleUrls: ['./generate-payslip.component.scss']
})
export class GeneratePayslipComponent implements OnInit {

  private _jsonURL = 'assets/json/sampleBankUpload.json';

  spinner: boolean = false;
  BusinessType: number = 0;
  CompanyId: number = 0;
  RoleCode: string = '';
  ImplementationCompanyId: number = 0;
  RoleId: number = 0;
  UserId: number = 0;
  loginSessionDetails: LoginResponses;

  payperiodList: any[] = [];
  selectedPayPeriodId: number = null;
  selectedPayPeriodName : string = "";
  generationTypeList: any[] = [{ "Id": 1, "Name": "Generate Payslips by Uploading UTR" }, { "Id": 2, "Name": "Generate Payslips without UTR" }];
  selectedGenerationType: number = 1;
  apiCallSpinner: boolean = false;
  apiCallspinner_payperiod: boolean = false;
  paymentDate: any;
  isUTRBtnShouldDisable: boolean = false;

  // GRID
  inEmployeesInitiateGridInstance: AngularGridInstance;
  inEmployeesInitiateGrid: any;
  inEmployeesInitiateGridService: GridService;
  inEmployeesInitiateDataView: any;
  inEmployeesInitiateColumnDefinitions: Column[];
  inEmployeesInitiateGridOptions: GridOption;
  inEmployeesInitiateDataset: any;
  inEmployeesInitiateList = [];
  pageLayout : PageLayout;
  // IMPORT
  bankUploadImportConfigObject: ImportLayout = new ImportLayout();;
  uploadedImportLayout: ImportLayout = null;

  fillExcel: boolean = false;
  file: File;
  @ViewChild("fileInput") inputFile: ElementRef;

  selectedItems: any[] = [];
  rows: any[];

  searchElemetsList: SearchElement[];
  apiResultDataset: any[];

  //Grid beforeUpload
  modalOption: NgbModalOptions = {};
  visible_slider_confirmGeneration: boolean = false;
  beforeUploadColumnDefinition: Column[];
  beforeUploadGridOptions: GridOption;
  beforeUploadDataset: any[];
  beforeUploadAngularGrid: AngularGridInstance;
  beforeUploadGridObj: any;
  beforeUploadDataviewObj: any;
  beforeUploadselectedItems: any[];
  InvalidPaidCounts: number = 0;
  InvalidUTRCounts: number = 0;
  InvalidPaymentDateCounts: number = 0;
  TotalValidCounts: number = 0;

  draggableGroupingPlugin: any;

  gridObj: any;

  LstsearchElement : SearchElement[] = [];

  constructor(
    private sessionService: SessionStorage,
    private pagelayoutservice: PagelayoutService,
    private ReportService: ReportService,
    private http: HttpClient,
    private importLayoutService: ImportLayoutService,
    private alertService: AlertService,
    private loadingScreenService: LoadingScreenService,
    private modalService: NgbModal,
    private fileuploadService: FileUploadService,
  ) {
    // this.getJSON().subscribe(data => {
    // });
  }

  // public getJSON(): Observable<any> {
  //   return this.http.get(this._jsonURL);
  // }

  ngOnInit() {

    fetch('assets/json/sampleBankUpload.json').then(res => res.json())
      .then(jsonData => {
        console.log('BANK UPLOAD JSON :::::', jsonData);
        this.bankUploadImportConfigObject = jsonData;
      });

    this.OnRefresh();

  }

  OnRefresh() {
    this.paymentDate = null;
    this.apiCallSpinner = false;
    this.isUTRBtnShouldDisable = false;
    this.selectedItems = [];
    this.spinner = true;
    this.loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses));
    this.BusinessType = this.loginSessionDetails.Company.LstCompanyBusinessTypeMapping != null ? this.loginSessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this.loginSessionDetails.Company.Id).BusinessType : 0;
    this.CompanyId = this.loginSessionDetails.Company.Id;
    this.RoleCode = this.loginSessionDetails.UIRoles[0].Role.Code;
    this.ImplementationCompanyId = this.loginSessionDetails.ImplementationCompanyId;
    this.RoleId = this.loginSessionDetails.UIRoles[0].Role.Id;
    this.UserId = this.loginSessionDetails.UserSession.UserId;

    this.beforeUploadColumnDefinition = null;
    this.beforeUploadGridOptions = null;
    this.isUTRBtnShouldDisable = true;

    this.setSlickGridForPaySlipEmployees();
    this.getPayPeriod();
    this.inEmployeesInitiateList = [];
  }

  getPayPeriod() {
    let searchElement: SearchElement[] = [];
    searchElement = [
      // {
      //   FieldName: '@clientId',
      //   Value: this.BusinessType == 3 ? null : this.sessionService.getSessionStorage('default_SME_ClientId'),
      //   IsIncludedInDefaultSearch: true,
      //   ReadOnly: false,
      // },
      // {
      //   FieldName: '@clientContractId',
      //   Value: this.BusinessType == 3 ? null : this.sessionService.getSessionStorage('default_SME_ContractId'),
      //   IsIncludedInDefaultSearch: true,
      //   ReadOnly: false,
      // },
      {
        DisplayName: "Client Contract",
        FieldName: '@clientcontractId',
        Value: this.sessionService.getSessionStorage('default_SME_ContractId'),
        InputControlType: InputControlType.DropDown,
        DataSource: {
          Name: 'payperiodview',
          Type: DataSourceType.View,
          IsCoreEntity: false
        },
        DropDownList: [],
        DefaultValue: 0,
        ParentFields: [],
        ParentDependentReadOnly: [true, false, false],
        ParentHasValue: null,
        IsIncludedInDefaultSearch: true,
        MultipleValues: null,
        FireEventOnChange: true,
        ForeignKeyColumnNameInDataset: 'Id',
        DisplayFieldInDataset: 'Name',
        ReadOnly: false
      }]

    if (this.BusinessType != undefined && this.BusinessType != 3) {
      this.pagelayoutservice.fillSearchElementsForSME(searchElement);
    }

    // var i = {
    //   SearchElementList: [{
    //     FieldName: "@clientcontractId",
    //     Value: 325,
    //     DefaultValue: 0,
    //     DataSource: {
    //       Name: 'payperiodview',
    //       Type: DataSourceType.View,
    //       IsCoreEntity: false
    //     },
    //   }]
    // }

    // {"SearchElementList":[{"FieldName":"@clientcontractId","Value":325,"DefaultValue":"0"}],
    // "DataSource":{"Type":1,"Name":"payperiodview","EntityType":0,"IsCoreEntity":false}}
    console.log('searchElement', searchElement);


    // this.pagelayoutservice.getDataset(searchElement[0].DataSource, searchElement).subscribe(dropDownList => {
    //   console.log('drop-down >>>>>>>>>>', dropDownList);
    //   if (dropDownList.Status) {
    //     let LstPayPeriod = [] ;
    //     LstPayPeriod = JSON.parse(dropDownList.dynamicObject);
    //     this.payperiodList =  LstPayPeriod.filter(a=>a.clientcontractId == this.sessionService.getSessionStorage('default_SME_ContractId'));
    //     if (this.selectedPayPeriodId != null) {
    //       this.getDataForPaySlipGeneration();
    //     }
    //   }

    //   this.spinner = false;
    // }, err => {

    // });
  }

  onRefreshStatus() {
    this.getDataForPaySlipGeneration();
  }
  async onChange_payperiod(value) {
    if (value.Id != null && value.Id != 0) {
      this.selectedPayPeriodId = value.Id;
      this.selectedPayPeriodName = value.Name;
      this.isUTRBtnShouldDisable = false;
      await this.getDataForPaySlipGeneration();
    }
  }

  async onChange_GenerationType(value) {
    console.log('s', value);

    // if (value.Id != null && value.Id != 0) {
    //   this.selectedGenerationType = value.Id;
    // }

    this.selectedGenerationType = value;
  }

  getDataForPaySlipGeneration() {
    try {
      this.inEmployeesInitiateList = [];
      this.apiCallspinner_payperiod = true;
      let clientId = this.LstsearchElement.find(a => a.FieldName.toUpperCase().toString() == '@CLIENTID').Value;
      let clientContractId = this.LstsearchElement.find(a => a.FieldName.toUpperCase().toString() == '@CLIENTCONTRACTID').Value;
      this.ReportService.GetDataForPayslipGeneration(clientId, clientContractId,this.selectedPayPeriodId).subscribe((result) => {
        let apir: apiResult = result;
        this.apiCallspinner_payperiod = false;
        if (apir.Status) {
          console.log(JSON.parse(apir.Result));
          this.inEmployeesInitiateList = JSON.parse(apir.Result) as any;
        } else {
        }
      })
    } catch (error) {
      this.apiCallspinner_payperiod = false;
      console.log('COMPLETE EXEPTION ON GET DATA FOR PAYSLIP GENERATION :::::: ', error);

    }
  }

  setSlickGridForPaySlipEmployees() {

    const promise = new Promise((res, rej) => {

      this.spinner = true;
      let code = 'generatepayslip';
      this.pagelayoutservice.getPageLayout(code).subscribe(data => {
        if (data.Status === true && data.dynamicObject != null) {
          console.log('data', data);
       
          this.setGridConfiguration(data.dynamicObject);
          this.spinner = false;
          res(true)
        }
        else {
          res(true)
        }

      }, error => {
        console.log(error);
        this.spinner = false;
      }
      );
    })
    return promise;

  }
  setGridConfiguration(pageLayout) {
    let docsFormatter: Formatter;
    //     docsFormatter = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) =>
    //       value ? ` <button  class="btn btn-default btn-sm" title="Invoice docs" style="padding: 2px 12px; font-size: 11px; border: 1px solid #d8d9dd;"><i
    // class="fa fa-files-o m-r-xs"></i> Docs </button>` : '<i class="mdi mdi-eye" style="cursor:pointer"></i>';

    docsFormatter = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) =>
      value != null && dataContext.DocumentId > 0 ? '<i class="mdi mdi-eye" style="cursor:pointer"></i></a>' : '---';
    this.pageLayout = pageLayout;
    this.LstsearchElement = this.pageLayout.SearchConfiguration.SearchElementList;

    if (this.BusinessType != undefined && this.BusinessType != 3) {

      this.LstsearchElement.length > 0 && this.LstsearchElement.filter(item => item.FieldName.toUpperCase().toString() == "@CLIENTID").length > 0 && ( this.LstsearchElement.find(a => a.FieldName.toUpperCase().toString() == '@CLIENTID').Value = this.sessionService.getSessionStorage("default_SME_ClientId"));
      this.LstsearchElement.length > 0 && this.LstsearchElement.filter(item => item.FieldName.toUpperCase().toString() == "@CLIENTCONTRACTID").length > 0 && ( this.LstsearchElement.find(a => a.FieldName.toUpperCase().toString() == '@CLIENTCONTRACTID').Value = this.sessionService.getSessionStorage("default_SME_ContractId"));
 
    }

    console.log(this.LstsearchElement);
    
    
    this.pagelayoutservice.getDataset(this.LstsearchElement[2].DataSource, this.LstsearchElement).subscribe(dropDownList => {
      console.log('drop-down >>>>>>>>>>', dropDownList);
      if (dropDownList.Status) {
        let LstPayPeriod = [] ;
        LstPayPeriod = JSON.parse(dropDownList.dynamicObject);
        this.payperiodList =  LstPayPeriod.filter(a=>a.clientcontractId == this.sessionService.getSessionStorage('default_SME_ContractId'));
        if (this.selectedPayPeriodId != null) {

          this.getDataForPaySlipGeneration();
        }
      }

      this.spinner = false;
    }, err => {

    });

    this.inEmployeesInitiateColumnDefinitions = this.pagelayoutservice.setColumns(pageLayout.GridConfiguration.ColumnDefinitionList);
    this.inEmployeesInitiateGridOptions = this.pagelayoutservice.setGridOptions(pageLayout.GridConfiguration);
    for (let k = 0; k < this.inEmployeesInitiateColumnDefinitions.length; k++) {
      const e4 = this.inEmployeesInitiateColumnDefinitions[k];
      if (e4.id === 'DocumentId') {
        e4.formatter = docsFormatter;
        e4.excludeFromExport = true;
      }
    }



  }
  onCellClicked(e, args) {
    const column = this.inEmployeesInitiateGridInstance.gridService.getColumnFromEventArguments(args);
    console.log('args', column);
    if(column.columnDef.id  == 'DocumentId' && column.dataContext.DocumentId > 0){
      this.downloadPayslip(column.dataContext);
      return;
    }
   
  }
  executeFunction(columnDefinition: ColumnDefinition, rowData: any, column: any) {
    switch (columnDefinition.FunctionName) {

      case 'downloadPayslip': {
        this.downloadPayslip(rowData);
        break;
      }
    }
  }
  downloadPayslip(rowData) {
    try {
      this.loadingScreenService.startLoading();
      this.fileuploadService.downloadObjectAsBlob(rowData.DocumentId)
        .subscribe(res => {
          if (res == null || res == undefined) {
            this.alertService.showWarning('Sorry, unable to get the document. Please get in touch with the support team');
            return;
          }
          saveAs(res, `${rowData.EmployeeCode}_PaySlip`);
          this.loadingScreenService.stopLoading();
        });
    } catch (error) {
      this.loadingScreenService.stopLoading();
      this.alertService.showWarning('Sorry, unable to get the document. Please get in touch with the support team');
      return;
    }
  }

  inEmployeesInitiateGridReady(angularGrid: AngularGridInstance) {
    this.inEmployeesInitiateGridInstance = angularGrid;
    this.inEmployeesInitiateDataView = angularGrid.dataView;
    this.inEmployeesInitiateGrid = angularGrid.slickGrid;
    this.inEmployeesInitiateGridService = angularGrid.gridService;

    const allRowIndexes = Array.from(Array(this.inEmployeesInitiateList.length).keys());
    angularGrid.slickGrid.setSelectedRows(allRowIndexes);

  }
  onSelectedEmployeeChange(eventData, args) {
    if (Array.isArray(args.rows)) {
      console.log('checkbox selected');
    }
     this.selectedItems = [];
    if (args != null && args.rows != null && args.rows.length > 0) {
      for (let i = 0; i < args.rows.length; i++) {
        var row = args.rows[i];
        var row_data = this.inEmployeesInitiateDataView.getItem(row);
        this.selectedItems.push(row_data);
      }
    }
    console.log('ANSWER ::', this.selectedItems);
  }


  downloadTemplate() {

    if (this.selectedPayPeriodId == null) {
      this.alertService.showInfo('Please choose your required pay period and try to download the template');
      return;
    }

    if (this.selectedItems == null || this.selectedItems.length == 0) {
      this.alertService.showInfo('Choose at least one employee and try to download the payslip template');
      return;
    }

    console.log('inEmployeesInitiateList', this.inEmployeesInitiateList);

    try {


      this.apiCallSpinner = true;
      if (this.bankUploadImportConfigObject.CreateExcelConfiguration.SearchConfiguration.SearchElementList !== undefined &&
        this.bankUploadImportConfigObject.CreateExcelConfiguration.SearchConfiguration.SearchElementList !== null &&
        this.bankUploadImportConfigObject.CreateExcelConfiguration.SearchConfiguration.SearchElementList.length > 0) {
        this.searchElemetsList = this.bankUploadImportConfigObject.CreateExcelConfiguration.SearchConfiguration.SearchElementList;

        if (this.BusinessType !== 3) {
          this.pagelayoutservice.fillSearchElementsForSME(this.searchElemetsList);
        }

      }
      else {
        this.searchElemetsList = [];
      }


      if (this.selectedItems != null && this.selectedItems.length <= 0) {
        this.selectedItems = null;
      }

      for (let controlElement of this.bankUploadImportConfigObject.ControlElementsList) {

        if (controlElement.SearchElements != undefined && controlElement.SearchElements != null
          && controlElement.SearchElements.length >= 0) {
          for (let searchElement of controlElement.SearchElements) {
            if (searchElement.GetValueFromUser) {
              let refrenceSearchElement = this.searchElemetsList.find(x => x.FieldName == searchElement.RefrenceFieldNameInSearchElements);
              if (refrenceSearchElement != null) {
                searchElement.Value = refrenceSearchElement.Value;
              }
            }
          }
        }
      }

      console.log('this.selectedItems', this.selectedItems);


      this.importLayoutService.getExcelTemplate(this.bankUploadImportConfigObject, this.selectedItems, this.bankUploadImportConfigObject.CreateExcelConfiguration.SearchConfiguration.SearchElementList).subscribe(
        data => {
          this.spinner = false;
          console.log(data);
          if (data.Status) {
            this.apiCallSpinner = false;
            this.base64ToBlob(data.dynamicObject, 'Template');
          }
          else {
            this.apiCallSpinner = false;
          }
        },
        error => {
          this.spinner = false;
          console.log(error);
        }
      )
    } catch (error) {
      console.log('EXEMPTION TEMPLATE DOWNLOAD ::: ', error);
      this.apiCallSpinner = false;
    }
  }

  public base64ToBlob(b64Data, dynoFileName, sliceSize = 512) {
    let byteCharacters = atob(b64Data); //data.file there
    let byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      let slice = byteCharacters.slice(offset, offset + sliceSize);
      let byteNumbers = new Array(slice.length);
      for (var i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      let byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    const file = new Blob(byteArrays, { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    FileSaver.saveAs(file, dynoFileName + new Date().getTime());
    return new Blob(byteArrays, { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }


  onUpload_GeneratingPaySlipEmpUTR(confirmGeneratePayslipGridSlider) {
    this.file = null;
    this.inputFile.nativeElement.files = null;
    this.inputFile.nativeElement.value = '';

  }


  columnLetter(col: number): string {
    let intFirstLetter: number = (Math.floor((col) / 676)) + 64;
    let intSecondLetter: number = (Math.floor((col % 676) / 26)) + 64;
    let intThirdLetter: number = (col % 26) + 65;

    let firstLetter: string = (intFirstLetter > 64) ? String.fromCharCode(intFirstLetter) : ' ';
    let secondLetter: string = (intSecondLetter > 64) ? String.fromCharCode(intSecondLetter) : ' ';
    let thirdLetter: string = String.fromCharCode(intThirdLetter);

    return firstLetter.concat(secondLetter).concat(thirdLetter).trim();
  }


  handleFileInput(files: FileList, confirmGeneratePayslipGridSlider) {

    try {



      this.file = files.item(0);
      //const file                = files.item(0);
      const RELATION = "Relation";
      const ONETOMANYINPUTTYPE = "OneToManyInputType";
      const MAXIMUMROWSALLOWED = "MaximumRowsAllowed";
      const NOOFCONTROLELEMENTS = "NoOfControlElements";
      const CELLREFRENCES = "CellRefrences";

      // const formData = new FormData();

      // formData.append(file.name, file);

      // this.importLayoutService.uploadExcel(formData).subscribe(
      //   data => {
      //     console.log(data);
      //   }, error => {
      //     console.log(error);
      //   }
      // );

      if (this.file == undefined || this.file == null) {
        this.alertService.showWarning("Please select a file to process");
        return;
      }

      console.log(this.file);

      const reader = new FileReader();
      let base64File;
      // reader.onload = (event) => {


      //   const data = reader.result.toString();  
      //   base64File = btoa(data);
      //   // console.log(base64File);
      //   // console.log(data);
      //   this.importLayoutService.uploadExcelData(base64File).subscribe(
      //     data => {
      //       console.log(data);
      //     }, error => {
      //       console.log(error);
      //     }
      //   );


      // }

      reader.onload = (e: any) => {

        this.loadingScreenService.startLoading();
        try {
          this.fillExcel = false;
          this.spinner = true;

          let rows: any[] = [];

          let row = {};
          /* read workbook */
          const bstr: string = e.target.result;
          const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary', cellDates: true });

          /* grab first sheet */
          const wsname: string = wb.SheetNames[0];
          const ws: XLSX.WorkSheet = wb.Sheets[wsname];

          /* save data */
          let data = <AOA>(XLSX.utils.sheet_to_json(ws,{
            raw: false, header: 0,
            
          }));
          console.log(data);



          var range = XLSX.utils.decode_range(ws['!ref']);

          if (ws['ZZ1'].v === undefined || ws['AAA1'].v === undefined || ws['AAC1'].v === undefined) {
            this.alertService.showWarning("Error Parsing the template. Please upload the template downloaded from the system");
            this.loadingScreenService.stopLoading();
            return;
          }

          let dataSourceObject = JSON.parse(ws['ZZ1'].v);
          let uniqueIdentifiers = JSON.parse(ws['AAA1'].v);
          this.uploadedImportLayout = JSON.parse(ws['AAC1'].v);
          //this.onImportLayoutChange();
          console.log("Uploaded Import Layout :: ", this.uploadedImportLayout);

          this.beforeUploadDataset = [];
          for (let rowNum = range.s.r + 2; rowNum <= range.e.r + 1; rowNum++) {
            let row: any = {};
            let blankCheck: number = 0;
            console.log('columns', range.s.c, range.e.c);
            for (let colNum: number = range.s.c; colNum <= range.e.c; colNum++) {
              let column: string = this.columnLetter(colNum)
              let cell: string = column + rowNum.toString();
              //console.log(cell);  
              if (ws[cell] != undefined) {
                row[ws[column + "1"].v] = ws[cell].v;
                blankCheck = 0;
              }
              else {
                ++blankCheck;
              }
              if (blankCheck >= 15) {
                break;
              }
            }
            row["Id"] = rowNum;
            this.beforeUploadDataset.push(row);
          }
          console.log("Before Upload Dataset :: ", this.beforeUploadDataset);

          //Data Formar : Raw Data
          if (this.uploadedImportLayout.SaveExcelDataConfiguration.DataFormat == undefined ||
            this.uploadedImportLayout.SaveExcelDataConfiguration.DataFormat == DataFormat.RawData) {
            rows = data;
          }
          //Data Format : Entity Mapped
          else {
            let uniqueIdentifierObject = {};


            console.log(uniqueIdentifiers);
            console.log(dataSourceObject);


            // for(let key of Object.keys(uniqueIdentifiers)){
            //   uniqueIdentifierObject[key] = {};
            // }

            let entityNames = Object.keys(dataSourceObject);
            let uniquekeys = Object.keys(uniqueIdentifiers);
            let firstEntity: string = null;
            if (uniquekeys.length > 0)
              firstEntity = uniquekeys[0];

            let str: string = '';
            // console.log(range);
            for (let rowNum = range.s.r + 2; rowNum <= range.e.r + 1; rowNum++) {
              row = {};
              row["Id"] = rowNum;
              str = '';

              if (firstEntity != null) {
                for (let column of uniqueIdentifiers[firstEntity]) {
                  str += ws[column + rowNum.toString()].v.toString().trim();
                }
              }

              // console.log(rowNum);
              // console.log(str);

              let index = Object.keys(uniqueIdentifierObject).indexOf(str);

              // console.log(index);

              //If similar row already exists
              if (index >= 0) {
                let existingRowIndex: number = uniqueIdentifierObject[str];

                for (let entity of entityNames) {
                  if (dataSourceObject[entity][RELATION] == RelationWithParent.OnetoMany && dataSourceObject[entity][ONETOMANYINPUTTYPE] == "1") {
                    let inputNumber = Object.keys(rows[existingRowIndex][entity]).length;
                    rows[existingRowIndex][entity][inputNumber] = {};
                    let cellRefrences = Object.keys(dataSourceObject[entity][CELLREFRENCES]["0"]);
                    for (let cellRefrence of cellRefrences) {
                      if (ws[cellRefrence + rowNum.toString()] !== undefined)
                        rows[index][entity][inputNumber][dataSourceObject[entity][CELLREFRENCES]["0"][cellRefrence]] =
                          ws[cellRefrence + rowNum.toString()].v;
                    }
                  }
                }
              }

              //No Similar row exist, a new row has to be created
              else {
                for (let entity of entityNames) {


                  if (dataSourceObject[entity][RELATION] == RelationWithParent.None ||
                    dataSourceObject[entity[RELATION]] == RelationWithParent.OnetoOne) {
                    row[entity] = {};
                    let cellRefrences = Object.keys(dataSourceObject[entity][CELLREFRENCES]["0"]);
                    // console.log(cellRefrences);
                    for (let cellRefrence of cellRefrences) {
                      if (ws[cellRefrence + rowNum.toString()] !== undefined)
                        row[entity][dataSourceObject[entity][CELLREFRENCES]["0"][cellRefrence]] =
                          ws[cellRefrence + rowNum.toString()].v;
                    }

                  }

                  else if (dataSourceObject[entity][RELATION] == RelationWithParent.OnetoMany) {

                    //If one row many columns
                    if (dataSourceObject[entity][ONETOMANYINPUTTYPE] == "0") {
                      row[entity] = [];
                      let inputNumbers = Object.keys(dataSourceObject[entity][CELLREFRENCES]);
                      for (let inputNumber of inputNumbers) {
                        row[entity][inputNumber] = {};

                        let cellRefrences = Object.keys(dataSourceObject[entity][CELLREFRENCES][inputNumber]);
                        for (let cellRefrence of cellRefrences) {
                          if (ws[cellRefrence + rowNum.toString()] !== undefined)
                            row[entity][inputNumber][dataSourceObject[entity][CELLREFRENCES][inputNumber][cellRefrence]] =
                              ws[cellRefrence + rowNum.toString()].v;
                        }
                      }
                      row[entity] = row[entity].filter((x) => { console.log(x, Object.keys(x).length); return ((Object.keys(x)).length > 0) });
                      console.log(entity, row[entity]);
                    }

                    else {
                      row[entity] = [];
                      row[entity][0] = {};
                      let cellRefrences = Object.keys(dataSourceObject[entity][CELLREFRENCES]["0"]);
                      // console.log(cellRefrences);
                      for (let cellRefrence of cellRefrences) {
                        if (ws[cellRefrence + rowNum.toString()] !== undefined)
                          row[entity][0][dataSourceObject[entity][CELLREFRENCES]["0"][cellRefrence]] =
                            ws[cellRefrence + rowNum.toString()].v;
                      }
                    }

                  }
                }
                rows.push(row);
                if (str != '') {
                  uniqueIdentifierObject[str] = rows.length - 1;
                }
              }


            }
          }

          console.log("rows :: ", rows);
          this.rows = rows;




          this.beforeUploadColumnDefinition = this.pagelayoutservice.setColumns(
            this.bankUploadImportConfigObject.SaveExcelDataConfiguration.BeforeUploadGridConfiguration.ColumnDefinitionList
          );
          this.beforeUploadGridOptions = this.pagelayoutservice.setGridOptions(
            this.uploadedImportLayout.SaveExcelDataConfiguration.BeforeUploadGridConfiguration
          );




          this.beforeUploadColumnDefinition.forEach(e2 => {

            e2['formatter'] = highlightingFormatter;
          });

          console.log('definition ::', this.beforeUploadColumnDefinition);

          this.beforeUploadDataset != null && this.beforeUploadDataset.length > 0 ? this.getEligibleCountOfConfirmation() : true;
          this.visible_slider_confirmGeneration = true;
          // console.log(this.beforeUploadColumnDefinition , this.beforeUploadGridOptions);
          // this.uploaded = true;
          // this.apiResultReceived = false;

          this.spinner = false;
          this.loadingScreenService.stopLoading();

        }
        catch (ex) {
          console.log(ex);
          this.alertService.showWarning("Error Occured while parsing excel");
        }
        finally {
          this.loadingScreenService.stopLoading();
          this.spinner = false;
        }

      };

      reader.readAsBinaryString(this.file);
    } catch (error) {
      console.log('EXE :::', error);

    }

  }
  getEligibleCountOfConfirmation() {

    this.TotalValidCounts = this.beforeUploadDataset.filter(a => a.Status == 10000 && a.AcknowledgmentDetail != '' && a.AcknowledgmentDetail != null && a.AcknowledgmentDetail != undefined && a.PaymentDate != '' && a.PaymentDate != null && a.PaymentDate != undefined).length;
    this.InvalidPaidCounts = this.beforeUploadDataset.filter(a => a.Status == 10000).length;
    this.InvalidUTRCounts = this.beforeUploadDataset.filter(a => a.AcknowledgmentDetail != '' && a.AcknowledgmentDetail != null && a.AcknowledgmentDetail != undefined).length;
    this.InvalidPaymentDateCounts = this.beforeUploadDataset.filter(a => a.PaymentDate != '' && a.PaymentDate != null && a.PaymentDate != undefined).length;

  }
  close_slider_confirmGeneration() {
    this.visible_slider_confirmGeneration = false;
  }
  onConfirm_GeneratingPaySlipEmpUTR() {

    if (this.TotalValidCounts == 0) {
      this.alertService.showWarning('There is no valid employee(s) available to initiate the payslip form');
      return;
    }


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
      confirmButtonText: 'Yes, Confirm!',
      cancelButtonText: 'No, cancel!',
      reverseButtons: true
    }).then((result) => {
      if (result.value) {
        this.uplaodExcelData(this.rows);
      } else if (
        result.dismiss === Swal.DismissReason.cancel
      ) {

      }
    })

  }
  onConfirm_GeneratingPaySlipEmpWOUTR() {

    let rows = [];

    if (this.paymentDate == null || this.paymentDate == "" || this.paymentDate == undefined) {
      this.alertService.showWarning('Select your payment date to generate the payslip form.');
      return;
    }
    if (this.selectedItems == null || this.selectedItems.length == 0) {
      this.alertService.showWarning('Choose at least one employee to generate the payslip form.');
      return;
    }



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
      confirmButtonText: 'Yes, Confirm!',
      cancelButtonText: 'No, cancel!',
      reverseButtons: true
    }).then((result) => {
      if (result.value) {

        this.selectedItems.forEach(e1 => {
          rows.push({
            EmployeeId: e1.EmployeeId,
            EmployeeCode: e1.EmployeeCode,
            EmployeeName: e1.EmployeeName,
            PayTransactionId: e1.PaytransactionId,
            BankName: e1.BankName,
            IFSCCode: e1.IFSCCode,
            AccountNumber: e1.AccountNumber,
            Narration: e1.Narration,
            Status: TimeCardStatus_SME.Paid,
            IsPaymentDone: true,
            NetPay: e1.NetPay,
            AcknowledgmentDetail: "",
            PaymentDate: moment(this.paymentDate).format('YYYY-MM-DD')

          })
        });
        console.log('rows', rows);

        this.loadingScreenService.startLoading();
        this.importLayoutService.uploadExcelDataWithCustomApi(this.bankUploadImportConfigObject.SaveExcelDataConfiguration.ApiName, rows, this.bankUploadImportConfigObject.SaveExcelDataConfiguration.ApiRequestType).subscribe(
          data => {

            this.loadingScreenService.stopLoading();
            if (data.Status == true) {

              if (data.Result != null && data.Result != '' && this.bankUploadImportConfigObject.SaveExcelDataConfiguration.DisplayDataGridAfterApiResult) {

                this.apiResultDataset = JSON.parse(data.Result);
                console.log(this.apiResultDataset);
                this.apiResultDataset.forEach(element => {
                  if (element.hasOwnProperty('Status')) {
                    element["Status"] = element.Status == 0 ? "Failed" : "Success";
                  }
                });

              }

              if (this.bankUploadImportConfigObject.SaveExcelDataConfiguration.ShowAlertWarningIfFailed) {
                for (let obj of this.apiResultDataset) {
                  if (obj.Status == false) {
                    this.alertService.showWarning(this.bankUploadImportConfigObject.SaveExcelDataConfiguration.WarningMessage);
                    return;
                  }
                }
              }

              this.OnRefresh();
              this.isUTRBtnShouldDisable = false;
              this.alertService.showSuccess("Payslip generation has been initiated successfully");

            }
            else {
              this.alertService.showWarning(data.Message);
            }
          },
          error => {
            this.loadingScreenService.stopLoading();
            // this.spinner = false;
            console.log(error);
            this.alertService.showWarning("Error Occured! Couldn't upload");
          }
        );
      } else if (
        result.dismiss === Swal.DismissReason.cancel
      ) {

      }
    })

  }

  // 
  uplaodExcelData(rows: any[]) {
    this.loadingScreenService.startLoading();
    // this.spinner = true;
    console.log('this.rows.', rows);


    this.importLayoutService.uploadExcelDataWithCustomApi(this.uploadedImportLayout.SaveExcelDataConfiguration.ApiName, rows, this.uploadedImportLayout.SaveExcelDataConfiguration.ApiRequestType).subscribe(
      data => {

        this.file = null;
        // this.spinner = false;
        if (this.inputFile != undefined) {
          this.inputFile.nativeElement.files = null;
          this.inputFile.nativeElement.value = '';
        }
        this.loadingScreenService.stopLoading();

        console.log('ddf', data);
        if (data.Status == true) {

          if (data.Result != null && data.Result != '' && this.uploadedImportLayout.SaveExcelDataConfiguration.DisplayDataGridAfterApiResult) {

            this.apiResultDataset = JSON.parse(data.Result);
            console.log(this.apiResultDataset);
            this.apiResultDataset.forEach(element => {
              if (element.hasOwnProperty('Status')) {
                element["Status"] = element.Status == 0 ? "Failed" : "Success";
              }
            });


          }

          if (this.uploadedImportLayout.SaveExcelDataConfiguration.ShowAlertWarningIfFailed) {
            for (let obj of this.apiResultDataset) {
              if (obj.Status == false) {
                this.alertService.showWarning(this.uploadedImportLayout.SaveExcelDataConfiguration.WarningMessage);
                return;
              }
            }
          }
          this.close_slider_confirmGeneration();
          this.OnRefresh();
          this.isUTRBtnShouldDisable = false;
          this.alertService.showSuccess("Payslip generation has been initiated successfully");

        }
        else {
          this.alertService.showWarning(data.Message);
        }
      },
      error => {
        this.loadingScreenService.stopLoading();
        // this.spinner = false;
        console.log(error);
        this.alertService.showWarning("Error Occured! Couldn't upload");
      }
    );
  }


  angularBeforeUploadGridReady(angularGrid: AngularGridInstance) {
    this.beforeUploadAngularGrid = angularGrid;
    this.beforeUploadGridObj = angularGrid.slickGrid; // grid object
    this.beforeUploadDataviewObj = angularGrid.dataView;

    if (this.beforeUploadGridObj && this.beforeUploadGridObj.setOptions) {

      this.beforeUploadGridObj.setOptions(
        {
          enableColumnPicker: false
        }
      )
      if (this.draggableGroupingPlugin && this.draggableGroupingPlugin.setDroppedGroups && this.uploadedImportLayout.SaveExcelDataConfiguration.ApiResultGridConfiguration.DefaultGroupingFields) {
        this.draggableGroupingPlugin.setDroppedGroups(this.uploadedImportLayout.SaveExcelDataConfiguration.BeforeUploadGridConfiguration.DefaultGroupingFields);
        this.gridObj.invalidate();
        this.gridObj.render();
      }


    }
    if (this.uploadedImportLayout.SaveExcelDataConfiguration.BeforeUploadGridConfiguration.DisplayFilterByDefault) {
      this.gridObj.setHeaderRowVisibility(true);
    }
  }

  onbeforeUploadSelectedRowsChanged(eventData, args) {
    if (Array.isArray(args.rows)) {
      console.log('checkbox selected');
    }

    console.log('dataset', this.beforeUploadDataset);

    this.beforeUploadselectedItems = [];
    if (args != null && args.rows != null && args.rows.length > 0) {
      for (let i = 0; i < args.rows.length; i++) {
        var row = args.rows[i];
        var row_data = this.beforeUploadDataviewObj.getItem(row);
        this.beforeUploadselectedItems.push(row_data);
      }
    }
    console.log('answer', this.beforeUploadselectedItems);
  }
}
