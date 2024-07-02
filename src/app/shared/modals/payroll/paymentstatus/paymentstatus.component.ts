import { Component, OnInit, Input } from '@angular/core';
import { PageLayout, ColumnDefinition, SearchElement } from 'src/app/views/personalised-display/models';
import { Column, AngularGridInstance, GridOption, Formatter, GridService, FieldType, Filters, Formatters, OnEventArgs } from 'angular-slickgrid';
import { NgbModalOptions, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { PagelayoutService, AlertService, PayrollService, CommonService, ExcelService } from 'src/app/_services/service';
import { Router, ActivatedRoute } from '@angular/router';
import { RowDataService } from 'src/app/views/personalised-display/row-data.service';
import { TimeCardStatus } from 'src/app/_services/model/Payroll/TimecardStatus';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
import { PayRunModel, _PayRun } from 'src/app/_services/model/Payroll/PayRunModel';
import { PayRunDetails, PayRun, PayRunStatus, MarkupCalculationMessage, ProcessCategory } from 'src/app/_services/model/Payroll/PayRun';
import { UIMode } from 'src/app/_services/model/Common/BaseModel';
import { LoginResponses } from 'src/app/_services/model/Common/LoginResponses';
import { apiResult } from 'src/app/_services/model/apiResult';
import { SessionStorage } from 'src/app/_services/service/session-storage.service';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import * as _ from 'lodash';
import { DataSourceType } from 'src/app/views/personalised-display/enums';
import { DataSource } from 'src/app/views/personalised-display/models';
import { NzNotificationService } from 'ng-zorro-antd';
import { enumHelper } from 'src/app/shared/directives/_enumhelper';
import { PayOutDetailsStatus, PayoutInformation } from 'src/app/_services/model/Payroll/PayOut';
import * as moment from 'moment';
@Component({
  selector: 'app-paymentstatus',
  templateUrl: './paymentstatus.component.html',
  styleUrls: ['./paymentstatus.component.css']
})
export class PaymentstatusComponent implements OnInit {

  @Input() rowData: any;

  //General
  pageLayout: PageLayout = null;
  tempColumn: Column;
  columnName: string;
  spinner: boolean;
  Screenspinner: boolean = false;
  loadingSpinner: boolean = false;

  processCategory: SearchElement;

  //Grouping
  angularGrid: AngularGridInstance;
  gridObj: any;
  dataviewObj: any;
  draggableGroupingPlugin: any;
  dataser: GridService;

  //Basic
  dataset: any;
  columnDefinition: Column[];
  gridOptions: GridOption;
  pagination = {
    pageSizes: [10, 15, 20, 25, 50, 75],
    pageSize: 15,
  };

  previewFormatter: Formatter;
  approveFormatter: Formatter;
  rejectFormatter: Formatter;
  hyperlinkFormatter: Formatter;
  modalOption: NgbModalOptions = {};
  overallStatus: any[] = [];

  // COMMON PROPERTIES
  selectedItems: any[];
  BehaviourObject_Data: any;
  inEmployeesInitiateGridInstance: AngularGridInstance;
  inEmployeesInitiateGrid: any;
  inEmployeesInitiateGridService: GridService;
  inEmployeesInitiateDataView: any;
  inEmployeesInitiateColumnDefinitions: Column[];
  inEmployeesInitiateGridOptions: GridOption;
  inEmployeesInitiateDataset: any;
  inEmployeesInitiateList = [];
  inEmployeesInitiateSelectedItems: any[];
  LstEmployeeForPayout: any;
  payoutdetailStatus = [];

  _LstPayoutEmployees = [];

  constructor(
    private commonService: CommonService,
    private notification: NzNotificationService,
    private payrollService: PayrollService,
    private alertService: AlertService,
    private utilsHelper: enumHelper,
    private loadingScreenService: LoadingScreenService,
    private excelService: ExcelService,
    private pageLayoutService: PagelayoutService



  ) { }

  ngOnInit() {
    this.spinner = true;
    this.loadinEmployeesInitiateRecords1();
    this.payoutdetailStatus = this.utilsHelper.transform(PayOutDetailsStatus) as any;

  }

  inEmployeesInitiateGridReady(angularGrid: AngularGridInstance) {
    this.inEmployeesInitiateGridInstance = angularGrid;
    this.inEmployeesInitiateDataView = angularGrid.dataView;
    this.inEmployeesInitiateGrid = angularGrid.slickGrid;
    this.inEmployeesInitiateGridService = angularGrid.gridService;
  }

  DateFormatter(rowIndex, cell, value, columnDef, grid, dataProvider) {
    console.log(new Date(value));
    
    if (value == null || value === "") { return " "; }
    
    return moment(value).format('DD-MM-YYYY HH:mm a');
  }

  //Feb  2 2023 10:02PM 
  loadinEmployeesInitiateRecords1() {
    this.previewFormatter = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) => {


      if (this.inEmployeesInitiateList.find(x => x.Id === parseInt(value)).PaymentMode !=2 && this.inEmployeesInitiateList.find(x => x.Id === parseInt(value)).Status > '7500' && this.inEmployeesInitiateList.find(x => x.Id === parseInt(value)).Status < '7849' && this.inEmployeesInitiateList.find(x => x.Id === parseInt(value)).Status != '7749') {
        return (value ? `
        <button type="button" class="ant-btn d-inline-flex align-items-center ant-btn-sm"
                                  style="font-size: 10px;color: #40a9ff;border-color: #40a9ff;"><span><i
                                      class="fa fa-refresh" aria-hidden="true" style="padding-right: 5px;"></i>Check
                                    Status</span></button>      
        
        ` : '<i class="mdi mdi-eye" style="cursor:pointer"></i>');
      }

      return '';
    }

    this.inEmployeesInitiateGridOptions = {
      //General
      enableGridMenu: true,
      enableColumnPicker: false,
      enableAutoResize: true,
      enableSorting: true,
      datasetIdPropertyName: "Id",
      enableColumnReorder: true,
      enableFiltering: true,
      showHeaderRow: true,
      enableAddRow: false,
      leaveSpaceForNewRows: true,
      autoEdit: true,
      alwaysShowVerticalScroll: false,
      enableCellNavigation: true,
      editable: true,
      enableAutoTooltip: true,

      //For Footer Summary
      createFooterRow: true,
      showFooterRow: false,
      footerRowHeight: 30,

      //For Grouping
      createPreHeaderPanel: true,
      showPreHeaderPanel: false,
      preHeaderPanelHeight: 40,
      enablePagination: false,



      enableCheckboxSelector: true,
      enableRowSelection: true,
      rowSelectionOptions: {
        selectActiveRow: false
      }

    };


    this.inEmployeesInitiateColumnDefinitions = [
      {
        id: 'EmployeeCode', name: 'Emp. Code', field: 'EmployeeCode',
        sortable: true,
        type: FieldType.string,
        filterable: true,
      },
      {
        id: 'EmployeeName', name: 'Emp. Name', field: 'EmployeeName',
        sortable: true,
        type: FieldType.string,
        filterable: true,
      },
      {
        id: 'MobileNumber', name: 'Mobile No.', field: 'MobileNumber',
        sortable: true,
        filterable: true,
        type: FieldType.string,
      },
      {
        id: 'AccountNumber', name: 'Acc. No.', field: 'AccountNumber',
        sortable: true,
        type: FieldType.string,
        filterable: true,
      },

      {
        id: 'NetPay', name: 'Net Pay', field: 'NetPay',
        sortable: true,
        type: FieldType.string,
        filterable: true,
      },
      {
        id: 'StatusName', name: 'Status', field: 'StatusName',
        sortable: true,
        type: FieldType.string,
        filterable: true,
      },
      {
        id: 'AcknowledgmentDetail', name: 'UTR', field: 'AcknowledgmentDetail',
        sortable: true,
        type: FieldType.string,
        filterable: true,
      }, 
      {
        id: 'PaymentDate', name: 'Pay.Date', field: 'PaymentDate',
        sortable: true,
        type: FieldType.date,
        filterable: true,
        formatter: this.DateFormatter
      },
      {
        id: 'ErrorMessage', name: 'Remarks', field: 'ErrorMessage',
        sortable: true,
        type: FieldType.string,
        filterable: true,
      },
      {
        id: 'edit',
        field: 'Id',
        excludeFromHeaderMenu: true,
        formatter: this.previewFormatter,
        minWidth: 120,
        maxWidth: 120,
        // use onCellClick OR grid.onClick.subscribe which you can see down below
        onCellClick: (e: Event, args: OnEventArgs) => {
          if (args.dataContext.PaymentMode != 2 && args.dataContext.Status > '7500' && args.dataContext.Status < '7849' && args.dataContext.Status != '7749') {
            this.checkPaymentStatus(this.LstEmployeeForPayout, args.dataContext)
          } else { return }
        }
      },

    ];

    this.onPaymentStatus(this.rowData);
  }


  onSelectedEmployeeChange(data, args) {
    this.inEmployeesInitiateSelectedItems = [];
    if (args != null && args.rows != null && args.rows.length > 0) {
      for (let i = 0; i < args.rows.length; i++) {
        var row = args.rows[i];
        var row_data = this.inEmployeesInitiateDataView.getItem(row);
        this.inEmployeesInitiateSelectedItems.push(row_data);
      }
    }

  }




  onPaymentStatus(rowData) {
    // const interval = setInterval(() => {
    //   this.getStarted();
    // }, 5000);
    console.log('ROW DATA :', rowData);
    this.commonService.Get_PayOut_LookupDetails(rowData.clientId).then((answer) => {
      if (answer != null) {
        var companyBankList_temp: any[] = [];
        companyBankList_temp = answer as any;
        console.log('companyBankList_temp', companyBankList_temp);


        this.LstEmployeeForPayout = null;

        let datasource: DataSource = {
          Name: "GET_EMPLOYEELISTUSING_BATCHID",
          Type: DataSourceType.SP,
          IsCoreEntity: false
        }

        let searctElements: SearchElement[] = [
          {
            FieldName: "@batchId",
            Value: rowData.Id
          }
        ]
        this.pageLayoutService.getDataset(datasource, searctElements).subscribe((result) => {
          console.log(result);
          this.spinner = false;
          if (result.Status && result.dynamicObject != null && result.dynamicObject != '') {
            let apiResult = JSON.parse(result.dynamicObject);
            console.log('apiResult', apiResult);
            this._LstPayoutEmployees = apiResult;
          }

          this.payrollService.GetPayoutInformationbyId(rowData.Id).subscribe((result) => {
            const apiResult: apiResult = result;
            if (apiResult.Status) {
              const lstEmps = apiResult.Result as any;
              console.log('PAYOUT INFO : ', lstEmps);
              lstEmps != null && lstEmps.LstPayoutInformationDetails.length > 0 && lstEmps.LstPayoutInformationDetails.forEach(element => {
                element['CompanyBankName'] = companyBankList_temp.length > 0 ? element.CompanyBankAccountId != null && element.CompanyBankAccountId != 0 ? companyBankList_temp.find(x => x.Id == element.CompanyBankAccountId).Details : '' : '';
              });
              this.LstEmployeeForPayout = lstEmps != null && lstEmps;
              this.inEmployeesInitiateList = this.LstEmployeeForPayout.LstPayoutInformationDetails
              this.inEmployeesInitiateList.length > 0 && this.inEmployeesInitiateList.forEach(element => {
                element['EmployeeCode'] = this.getEmployeeCode(element.Id);
              });

              try {
                this.inEmployeesInitiateList.length > 0 && this.inEmployeesInitiateList.forEach(element => {
                  element['StatusName'] = this.getPayoutDetailsName(element.Status);
                });
              } catch (error) {
                console.log('ERR :: ', error);
                
              }

              console.log('dd', this.inEmployeesInitiateList);
              
            
            


              this.spinner = false;
            } else {
              this.spinner = false;
              this.alertService.showWarning("No Records found!");
            }
          })
        }, error => {
          this.spinner = false;
          console.log(error);
          this.alertService.showWarning("Error Occured while Fetching Employee Data");
        })
      }
    })

  }
  getPayoutDetailsName(status) {
    return this.payoutdetailStatus.find(a => a.id == status).name;
  }

  getEmployeeCode(Id) {
    return this._LstPayoutEmployees.find(a => a.Id == Id).EmployeeCode;
  }



  checkPaymentStatus(_payoutInformation, item) {
        this.loadingScreenService.startLoading();

    var payoutJObject = new PayoutInformation();
    payoutJObject.ApprovedId = _payoutInformation.ApprovedId
    payoutJObject.ApprovedOn = _payoutInformation.ApprovedOn
    payoutJObject.ApproverName = _payoutInformation.ApproverName
    payoutJObject.ClientContractId = _payoutInformation.ClientContractId
    payoutJObject.ClientId = _payoutInformation.ClientId
    payoutJObject.ClientName = _payoutInformation.ClientName
    payoutJObject.CompanyBankAccountId = _payoutInformation.CompanyBankAccountId
    payoutJObject.CompanyId = _payoutInformation.CompanyId
    payoutJObject.ErrorMessage = _payoutInformation.ErrorMessage
    payoutJObject.Id = _payoutInformation.Id
    payoutJObject.IsLocked = _payoutInformation.IsLocked
    payoutJObject.IsLockedBy = _payoutInformation.IsLockedBy;
    payoutJObject.LstPayoutInformationDetails = [];
    payoutJObject.LstPayoutInformationDetails.push(item);
    payoutJObject.PayOutDate = _payoutInformation.PayOutDate
    payoutJObject.PayPeriodId = _payoutInformation.PayPeriodId
    payoutJObject.PayPeriodName = _payoutInformation.PayPeriodName
    payoutJObject.PaymentMode = _payoutInformation.PaymentMode
    payoutJObject.PayrunIds = _payoutInformation.PayrunIds
    payoutJObject.ProcessCategory = _payoutInformation.ProcessCategory
    payoutJObject.RequestedBy = _payoutInformation.RequestedBy
    payoutJObject.RequestedOn = _payoutInformation.RequestedOn
    payoutJObject.RequesterName = _payoutInformation.RequesterName
    payoutJObject.Status = _payoutInformation.Status
    payoutJObject.TransactionRemarks = _payoutInformation.TransactionRemarks;

    console.log('JOBJ ::', payoutJObject);
    
    this.payrollService.GetYBPaymentDetailsStatus(payoutJObject)
      .subscribe((response) => {
        const apiResult: apiResult = response;
        console.log('Status check ::', apiResult);
        
        if (apiResult.Status) {
          const lstEmps = apiResult.Result as any;
          var status = lstEmps != null && lstEmps.LstPayoutInformationDetails.length > 0 && lstEmps.LstPayoutInformationDetails[0].Status
          lstEmps != null && (status = this.payoutdetailStatus.find(c => c.id == status).name);
          this.loadingScreenService.stopLoading();
          this.notification.blank(
            'Payment Status',
            lstEmps != null ? `Payment ${status}: The final confirmation coming from bank and payment gateway` : apiResult.Message,
            {
              nzStyle: {
                width: '600px',
                marginLeft: '-265px'
              },
              nzClass: 'test-class'
            }
          );
        } else {

          this.loadingScreenService.stopLoading();

        }
      })
  }


  exportAsXLSX(): void {
    let exportExcelDate = [];
    this.inEmployeesInitiateList.forEach(element => {
      exportExcelDate.push({
        EmployeeCode: element.EmployeeCode,
        EmployeeName: element.EmployeeName,
        AccountNumber: element.AccountNumber,
        BankName: element.BankName,
        IFSCCode: element.IFSCCode,
        MobileNumber: element.MobileNumber,
        NetPay: (Number(element.NetPay)),
        UTR: element.AcknowledgmentDetail,
        Remarks : element.ErrorMessage
      })

    });

    this.excelService.exportAsExcelFile(exportExcelDate, 'ConfirmedPayout_Batch#_' + this.inEmployeesInitiateList[0].PayoutInformationId);
  }

}
