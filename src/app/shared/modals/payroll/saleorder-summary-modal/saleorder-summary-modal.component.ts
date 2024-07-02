import { enumHelper } from './../../../directives/_enumhelper';
import { SearchPanelType, DataSourceType } from './../../../../views/personalised-display/enums';
import { PageLayout } from './../../../../views/personalised-display/models';
import { PagelayoutService } from './../../../../_services/service/pagelayout.service';
import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TimeCardStatus } from 'src/app/_services/model/Payroll/TimecardStatus';
import Swal from "sweetalert2";
import * as _ from 'lodash';

import { PayrollService } from 'src/app/_services/service/payroll.service';
import { AlertService } from 'src/app/_services/service/alert.service';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
import { apiResult } from 'src/app/_services/model/apiResult';
import { SaleOrder, PayRun, SaleOrderStatus, PayRunStatus } from 'src/app/_services/model/Payroll/PayRun';
import { PayRunModel, _PayRun } from 'src/app/_services/model/Payroll/PayRunModel';
import { UIMode } from 'src/app/_services/model/Common/BaseModel';
import { CommonService } from 'src/app/_services/service';
import { Invoice } from 'src/app/_services/model/Payroll/Invoice';

@Component({
  selector: 'app-saleorder-summary-modal',
  templateUrl: './saleorder-summary-modal.component.html',
  styleUrls: ['./saleorder-summary-modal.component.scss']
})
export class SaleorderSummaryModalComponent implements OnInit {
  @Input() ClientName: any;
  @Input() PayRunIds: any;
  @Input() CoreJson: any;
  @Input() lstSelectedObj: any;

  progressTemplate: any;
  ClientContactList: [];
  ClientAddressList: any[];
  despatchTo: any;
  companyBankList = [];
  pageLayout: PageLayout = null;
  dataset = [];
  isLoading: boolean = false;
  LstTimecardStatus: any = [];

  payRunModel: PayRunModel = new PayRunModel();
  isMergeSelected: any;
  isSendEmailImmediately: boolean = true;
  showAction: boolean = true;
  selectAll: boolean = false;
  searchText: any = null;
  selectedSOs = [];


  ShipToClientContactId: any;
  PurchaseOrderNo: any;
  CompanyBankAccountId; ShippingContactDetails; CompanyAddressDetails; Narration; Reamrks;
  tempPurposetLstSO = [];
  // WIZARD STEPS
  current = 0;
  invoceRecords = [];
  invoiceNumbers: any;
  counter  = 0;
  count = 0;
  lstofInvoiceRecords = [];
  constructor(
    private activeModal: NgbActiveModal,
    private pageLayoutService: PagelayoutService,
    private utilsHelper: enumHelper,
    private payrollService: PayrollService,
    private loadingScreenService: LoadingScreenService,
    private alertService: AlertService,
    private commonService: CommonService

  ) {
    this.LstTimecardStatus = this.utilsHelper.transform(TimeCardStatus);
    this.pageLayout = {

      Description: "config1",
      Code: "employee",

      CompanyId: 1,
      ClientId: 2,

      SearchConfiguration: {
        SearchElementList: [
        ],
        SearchPanelType: SearchPanelType.Panel
      },

      GridConfiguration: {
        ColumnDefinitionList: [

        ],

        DataSource: {
          Type: DataSourceType.View,
          Name: 'City'
        },

        ShowDataOnLoad: true,
        IsPaginationRequired: false,
        DisplayFilterByDefault: false,
        EnableColumnReArrangement: true,
        IsColumnPickerRequired: true,

        IsSummaryRequired: true,
        IsGroupingEnabled: false,
        DefaultGroupingFields: ["Code", "Name"], 
        PinnedRowCount: -1,
        PinnedColumnCount: -1,
        PinRowFromBottom: true,

      },

      PageProperties: {
        PageTitle: "City List",
        BannerText: "City",
      }

    }
  }

  ngOnInit() {
    // this.invoceRecords = [];
    // this.invoceRecords.push({
    //   AdjustedBillAmount: 0,
    //   AdjustedInvoiceId: 0,
    //   Attribute1: "",
    //   Attribute2: null,
    //   Attribute3: null,
    //   Attribute4: null,
    //   Attribute5: null,
    //   Attribute6: null,
    //   BillToAddressDetails: "no45, Higher lverl, Integrum ech, Banaloer- 56003423.",
    //   BillToClientContactId: 525,
    //   BillToClientContactLocationMappingId: 77,
    //   BillToClientLocationId: 2397,
    //   BillToContactName: "Mr. Sapan Shah",
    //   BillableAmount: 10000,
    //   BillableAmountForMarkup: 10000,
    //   BillableAmountForServiceTax: 10000,
    //   BillingTransactions: null,
    //   BusinessCategory: 0,
    //   ClientContractId: 114,
    //   ClientGSTN: "24AAACP6474E1ZJ",
    //   ClientId: 514,
    //   ClientName: "ciel HIR technolog service limited",
    //   CollectionType: 0,
    //   CompanyAddressDetails: null,
    //   CompanyBankAccountDetails: null,
    //   CompanyBankAccountId: "1",
    //   CompanyBranchId: 13,
    //   CompanyBranchName: "Ciel Bangalore",
    //   CompanyGSTN: "12344321",
    //   CompanyId: 5,
    //   CreatedBy: "12",
    //   CreatedOn: "2020-07-16T15:44:22.453",
    //   CreditPeriodDays: 0,
    //   Currency: 0,
    //   ExpectedCollectionMode: 0,
    //   FinancialYearId: 2,
    //   GroupingInfo: null,
    //   Id: 1,
    //   InvNo: "2312",
    //   InvoiceDate: "2020-07-16T15:44:22.453",
    //   InvoiceType: 1,
    //   IsElectronicInvoice: false,
    //   IsInvoiceManuallyGenerated: true,
    //   IsServiceTaxExempted: false,
    //   LastUpdatedBy: "12",
    //   LastUpdatedOn: "2020-07-16T15:44:22.453",
    //   LineOfBusiness: 0,
    //   Month: 0,
    //   Narration: "adas",
    //   PayCycleId: 1,
    //   PayPeriodId: 4,
    //   ProcessCategory: 0,
    //   PurchaseOrderNo: "",
    //   ReferenceInvoiceId: "0",
    //   Remarks: "asd",
    //   SaleOrderIds: null,
    //   ServiceTaxCategory: 0,
    //   ShipToAddressDetails: null,
    //   ShipToClientContactId: 525,
    //   ShipToContactName: "T.Jayashan,kar",
    //   Status: 1,
    //   TotalBillAmount: 12154,
    //   TotalDiscount: 0,
    //   TotalMarkup: 300,
    //   TotalServiceTax: 1854,
    //   Year: 0
    // })


    this.CoreJson = JSON.parse(this.CoreJson);
    console.log('coreJSON', this.CoreJson);
    this.Get_SO_LookupDetails();
    this.Get_PayOut_LookupDetails();
    this.isMergeSelected = true;
    this.showAction = true;

    this.lstSelectedObj = JSON.parse(this.lstSelectedObj)
    this.tempPurposetLstSO = this.lstSelectedObj;
    console.log('lstSelectedObj', this.lstSelectedObj);

    this.lstSelectedObj.forEach(element => {
      element.CompanyBankAccountId = element.CompanyBankAccountId == null ? null  : Number(element.CompanyBankAccountId);
      element.ShipToAddressDetails = this.hasJsonStructure(element.ShipToAddressDetails) === true ? JSON.parse(element.ShipToAddressDetails) : element.ShipToAddressDetails;
      element.BillToAddressDetails = this.hasJsonStructure(element.BillToAddressDetails) === true ? JSON.parse(element.BillToAddressDetails) : element.BillToAddressDetails;
      element['isSelected'] = false;

    });
    console.log('test', this.lstSelectedObj);

    this.lstSelectedObj = _(this.lstSelectedObj)
      .groupBy(x => x.BillToClientContactId)
      .map((value, key) => ({ GroupId: key, SOList: value }))
      .value();
    console.log('result', this.lstSelectedObj);



    // this.getDataset();
  }
  modal_dismiss() {
    this.activeModal.close('Modal Closed');
  }
  hasJsonStructure(str) {
    if (typeof str !== 'string') return false;
    try {
      const result = JSON.parse(str);
      const type = Object.prototype.toString.call(result);
      return type === '[object Object]'
        || type === '[object Array]';

    } catch (err) {
      return false;
    }
  }
  selectAllSO(event: any) {
    console.log('event', event); this.selectedSOs = [];

    this.lstSelectedObj.forEach(e => {
      e.SOList.map((i) => {

        event.target.checked == true ? i.isSelected = true : i.isSelected = false

      });
    });

    if (event.target.checked) {
      this.lstSelectedObj.forEach(e => {
        e.SOList.map((i) => {
          this.selectedSOs.push(i);
        });
      });
    } else {
      this.selectedSOs = [];
    }
  }

  change(obj, parentObj, event) {
    console.log('obj', obj);
    console.log('parentObj', parentObj);

    console.log('event', event);

    let updateItem = parentObj.SOList.find(i => i.Id == obj.Id);
    let index = this.selectedSOs.indexOf(updateItem);

    console.log(index);

    if (index > -1) {
      this.selectedSOs.splice(index, 1);
    }
    else {
      this.selectedSOs.push(obj);
    }
    
    var totalLength = 0;
    this.lstSelectedObj.forEach(e => {
      e.SOList.map((i) => {
        totalLength = totalLength + 1;;
      });
    });
    if (totalLength === this.selectedSOs.length) {
      this.selectAll = true;
    }
    else {
      this.selectAll = false;
    }

    console.log('selectedSOs', this.selectedSOs);;

  }

  // API CALLS USING TABLE ROUTING AND SEARCHELEMENTS IF NEEDED
  async getDataset() {
    this.pageLayout.GridConfiguration.DataSource = null;
    this.pageLayout.GridConfiguration.DataSource = { Type: 0, Name: 'GET_EMPLOYEELISTUSING_PAYRUNID_EDIT' }
    this.pageLayout.SearchConfiguration.SearchElementList.push(

      {
        "DisplayName": "PayRunIds",
        "FieldName": "PayRunIds",
        "InputControlType": 0,
        "Value": this.PayRunIds,
        "MultipleValues": null,
        "RelationalOperatorsRequired": false,
        "RelationalOperatorValue": null,
        "DataSource": {
          "Type": 0,
          "Name": null,
          "EntityType": 0,
          "IsCoreEntity": false
        },
        "IsIncludedInDefaultSearch": true,
        "DropDownList": [],
        "ForeignKeyColumnNameInDataset": null,
        "DisplayFieldInDataset": null,
        "ParentFields": null,
        "ReadOnly": false,
        "TriggerSearchOnChange": false
      });

    this.dataset = [];
    this.isLoading = true;
    await this.pageLayoutService.getDataset(this.pageLayout.GridConfiguration.DataSource, this.pageLayout.SearchConfiguration.SearchElementList).subscribe(dataset => {
      if (dataset.Status == true && dataset.dynamicObject !== null && dataset.dynamicObject !== '') {
        var tempListofRecords = [];
        tempListofRecords = JSON.parse(dataset.dynamicObject);
        this.isLoading = false;
        console.log('tempListofRecords', tempListofRecords);
        var result = _.chain(tempListofRecords)
          .groupBy("BillToClientContactId")
          .map((element, id) => ({
            BillToGroup: id,
            SOList: element,
          }))
          .value();


        console.log('dataset', this.dataset);
      }
      else {
        console.log('Sorry! Could not Fetch Data|', dataset);
        this.isLoading = false;
      }
    }, error => {
      this.isLoading = false;
      console.log(error);
    })
  }

  Get_SO_LookupDetails() {
    this.payrollService.get_SOLookupDetails(this.CoreJson.clientId)
      .subscribe((result) => {
        console.log(result);
        const apiResult: apiResult = result;
        if (apiResult.Status) {
          var result = (apiResult.Result) as any;
          result = JSON.parse(result);
          this.ClientContactList = (result.ClientContactList);
          this.ClientAddressList = result.ClientAddressList;
          console.log(this.ClientContactList);
        }
      })
  }

  onChange_Despatch(item, event, parentObj, indexPosition) {
    console.log('item', item);
    console.log('parentObj', parentObj);

    this.ShippingContactDetails = null;
    // let updateDetails = this.lstSelectedObj.find(a => a.Id === item.Id);
    this.ShippingContactDetails = this.ClientAddressList.find(a => a.Id === item.ShipToClientContactId).Address1;
    item.ShipToAddressDetails.Address1 = this.ShippingContactDetails;
    if (indexPosition == 'lastIndex') {
      parentObj.SOList.forEach(obj => {
        obj.ShipToAddressDetails.Address1 = this.ShippingContactDetails;
      });
    }
  }
  onChangeBank(item, event, parentObj, indexPosition) {
    if (indexPosition == 'lastIndex') {
      parentObj.SOList.forEach(obj => {
        obj.CompanyBankAccountId = item.CompanyBankAccountId;
      });
    }
  }
  onKeyUp(event, drivenFormName, parentObj) {

    parentObj.SOList.forEach(obj => {
      drivenFormName === 'PurchaseOrderNo' && (obj.PurchaseOrderNo = event.target.value);
      drivenFormName === 'ShipToAddressDetails' && (obj.ShipToAddressDetails.Address1 = event.target.value);
      drivenFormName === 'Narration' && (obj.Narration = event.target.value);
      drivenFormName === 'Remarks' && (obj.Remarks = event.target.value);

    });

  }

  Confirm() {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: true
    })

    swalWithBootstrapButtons.fire({
      title: `Review and Confirm?`,
      text: "Are you sure you want to confirm this Sale Order?",
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: "Yes, Confirm",
      cancelButtonText: 'No, Later',
      reverseButtons: true,
      allowEscapeKey: false,
      allowOutsideClick: false
    }).then((res) => {
      if (res.value) {
        this.loadingScreenService.startLoading();

        let LstSO = [];
        let PayRunId = 0;
        this.lstSelectedObj.forEach(e => {
          PayRunId = e.PayRunId;
          var confrimSO_Obj = new SaleOrder();
          confrimSO_Obj.Id = e.Id;
          confrimSO_Obj["PayRunId"] = PayRunId;
          // confrimSO_Obj.SONumber = e.SONumber;
          confrimSO_Obj.ClientId = e.clientId;
          confrimSO_Obj.ClientName = e.ClientName
          confrimSO_Obj.ClientContractId = e.clientcontractId;
          // confrimSO_Obj.BillingContactId = e.BillingContactId;
          // confrimSO_Obj.BillingContactName = e.BillingContactName;
          // confrimSO_Obj.BillingContactDetails = e.BillingContactDetails;
          // confrimSO_Obj.CompanyContactName = e.CompanyContactName;
          // confrimSO_Obj.CompanyBankAccountDetails = e.CompanyBankAccountDetails;
          // confrimSO_Obj.ClientGSTDetails = e.ClientGSTDetails;
          // confrimSO_Obj.ShippingContactId = e.ShippingContactId;
          // confrimSO_Obj.ClientGSTDetails = e.ClientGSTDetails;
          // confrimSO_Obj.ShippingContactName = e.ShippingContactName;
          // confrimSO_Obj.ShippingContactDetails = e.ShippingContactDetails;
          confrimSO_Obj.Narration = e.Narration;
          confrimSO_Obj.Remarks = e.Remarks;
          // confrimSO_Obj.VendorName = e.VendorName;

          // confrimSO_Obj.Duedate = e.Duedate;
          // confrimSO_Obj.PurchaseOrderNumber = e.PurchaseOrderNumber;
          // confrimSO_Obj.PurchaseOrderDate = e.PurchaseOrderDate;
          // confrimSO_Obj.SaleOrderDate = e.SaleOrderDate;
          // confrimSO_Obj.TotalCharge = e.TotalCharge;
          // confrimSO_Obj.CGST = e.CGST;
          // confrimSO_Obj.IGST = e.IGST;
          // confrimSO_Obj.SGST = e.SGST;
          // confrimSO_Obj.TotalTax = e.TotalTax;
          // confrimSO_Obj.TotalDiscount = e.TotalDiscount;
          // confrimSO_Obj.TotalBillableAmount = e.TotalBillableAmount;
          // confrimSO_Obj.linkingSaledOrderId = e.linkingSaledOrderId;
          confrimSO_Obj.Status = SaleOrderStatus.SaleOrderApproved;
          // confrimSO_Obj.BillingTransactions = LstBillingTransaction;
          LstSO.push(confrimSO_Obj);
        });

        var submitObject = new PayRun();
        submitObject.Id = PayRunId;
        submitObject.ModeType = UIMode.Edit;
        // submitObject.Code = `${this.CoreJson.ClientName}`;
        // submitObject.Name = `${this.CoreJson.ClientName}_${this.CoreJson.ContractCode}_${this.BehaviourObject_Data.PayPeriod}`;
        // submitObject.CompanyId = this.sessionDetails.Company.Id;
        submitObject.ClientContractId = this.CoreJson.clientcontractId;
        submitObject.ClientId = this.CoreJson.clientId;
        submitObject.PayPeriodId = this.CoreJson.payperiodId;
        // submitObject.TeamIds = [];
        // submitObject.TeamIds.push(this.BehaviourObject_Data.teamId);
        // submitObject.NumberOfEmpoyees = 0;
        // submitObject.NoOfSaleOrders = this.selectedItems1.length;
        submitObject.PayRunStatus = PayRunStatus.SaleOrderApproved;
        // submitObject.LstPayrunDetails = this.payRunModel.OldDetails.LstPayrunDetails;
        submitObject.SaleOrders = LstSO;
        this.payRunModel = _PayRun;
        this.payRunModel.NewDetails = submitObject;
        console.log('PAYRUN MODEL : ', this.payRunModel);

        this.payrollService.put_ConfirmSaleOrder(JSON.stringify(this.payRunModel))
          .subscribe((result) => {
            console.log('SUBMIT FOR SO CONFIRM RESPONSE :: ', result);
            const apiResult: apiResult = result;
            if (apiResult.Status && apiResult.Result) {
              this.loadingScreenService.stopLoading();
              this.alertService.showSuccess(apiResult.Message);
              this.activeModal.close('Success');

            } else {
              this.loadingScreenService.stopLoading();
              this.alertService.showWarning(apiResult.Message);
            }
          }, error => {
            this.loadingScreenService.stopLoading();

          });

      } else if (res.dismiss === Swal.DismissReason.cancel) {
      }
    })
  }

  onProfitSelectionChange(entry): void {

    entry == 1 ? this.isMergeSelected = false : this.isMergeSelected = true;
    entry == 1 ? this.showAction = false : this.showAction = true;


  }

  onSendInvoicetoClient(entry): void {

    entry == 3 ? this.isSendEmailImmediately = true : this.isSendEmailImmediately = false;

  }


  Get_PayOut_LookupDetails() {
    this.payrollService.get_PayOutLookUpDetails(this.CoreJson.clientId)
      .subscribe((result) => {
        console.log(result);
        const apiResult: apiResult = result;
        if (apiResult.Status) {
          var result = (apiResult.Result) as any
          result = JSON.parse(result);
          this.companyBankList = result.CompanyBankAccountList;
          console.log('result look up :', result);
        }
      })
  }

  // onChange_Despatch(event) {
  //   this.SOForm.controls['ShippingContactDetails'].setValue(this.ClientAddressList.find(a => a.Id === event.Id).Address1);
  // }

  confirm_InvoiceCreation() {

    // this.invoceRecords.forEach(element => {
    //   element['InvoiceStatus'] = this.Invoices
    // });


    this.showAction == true && (this.lstSelectedObj.forEach(object => {
      var last_element = object.SOList[object.SOList.length - 1];
      console.log('last_element', last_element);
      var solist = this.lstSelectedObj.find(a => a.GroupId == object.GroupId).SOList;
      solist.forEach(e => {
        if (e.Id != last_element.Id) {
          e.ShipToClientContactId = last_element.ShipToClientContactId;
          e.ShipToAddressDetails.Address1 = last_element.ShipToAddressDetails.Address1;
          e.CompanyBankAccountId = last_element.CompanyBankAccountId;
          e.Narration = last_element.Narration;
          e.Remarks = last_element.Remarks;
          e.PurchaseOrderNo = last_element.PurchaseOrderNo;
        }

      });
    }));


    console.log('list ', this.lstSelectedObj);

    if (this.selectedSOs.length == 0) {
      this.alertService.showWarning("No Sale Order record(s) have been selected! Please first select");
      return;
    }



    this.loadingScreenService.startLoading();
    // var lstOfRecords = [];
    // this.selectedSOs.forEach(element => {
    //   var so = new SaleOrder();
    //   so.Id = element.Id;
    //   so.ShipToClientContactId = element.ShipToClientContactId;
    //   so.ShipToAddressDetails = JSON.stringify(element.ShipToAddressDetails);
    //   so.CompanyBankAccountId = element.CompanyBankAccountId;
    //   so.Narration = element.Narration;
    //   so.Remarks = element.Remarks;
    //   so.Status = SaleOrderStatus.SaleOrderApproved;
    //   so.PurchaseOrderNo = element.PurchaseOrderNo;
    //   so.IsSendEmailImmediatly = this.isSendEmailImmediately
    //   lstOfRecords.push(so);
    // }); 

    // console.log(lstOfRecords);
    this.triggerSaleOrderApproveSubmit().then((result) => {

      console.log(this.selectedSOs.length);
      console.log( this.counter); 
      console.log(result);
      
      
      // this.loadingScreenService.startLoading();
     if(result == true &&  (this.selectedSOs.length == this.counter )) { 
      this.next();
       this.triggerInvoiceSubmit();
      };
    });
    // this.payrollService.put_UpdateSaleOrdersStatusDetails(lstOfRecords)
    //   .subscribe((result) => {
    //     let apiResult: apiResult = result;
    //     if (apiResult.Status) {
    //       this.alertService.showSuccess(apiResult.Message);
    //       // this.triggerInvoiceSubmit();
    //       this.loadingScreenService.stopLoading();
    //       this.selectedSOs = [];
    //     } else { this.loadingScreenService.stopLoading }
    //   }, err => {

    //   });
  }

  triggerSaleOrderApproveSubmit() {
    return new Promise((resolve, reject) => {

      var lstOfRecords1 = [];
      this.lstSelectedObj.forEach(e => {
        lstOfRecords1 = [];
        e.SOList.forEach(element => {
          var selectedItems = this.selectedSOs.find(x => x.Id == element.Id);
          if (selectedItems != undefined) {
            var so = new SaleOrder();
            so.Id = element.Id;
            so.ShipToClientContactId = element.ShipToClientContactId;
            so.ShipToAddressDetails = JSON.stringify(element.ShipToAddressDetails);
            so.CompanyBankAccountId = element.CompanyBankAccountId;
            so.Narration = element.Narration;
            so.Remarks = element.Remarks;
            so.Status = SaleOrderStatus.SaleOrderApproved;
            so.PurchaseOrderNo = element.PurchaseOrderNo;
            so.IsSendEmailImmediatly = this.isSendEmailImmediately
            lstOfRecords1.push(so);
            console.log('lst', lstOfRecords1);
            this.payrollService.put_UpdateSaleOrdersStatusDetails(lstOfRecords1)
              .subscribe((result) => {
                let apiResult: apiResult = result;
                if (apiResult.Status) {
                  this.alertService.showSuccess(apiResult.Message);
                  // this.triggerInvoiceSubmit();
                  // this.modal_dismiss();
                  // this.loadingScreenService.stopLoading();
                  
                  this.counter = this.counter + 1;
                  lstOfRecords1 = [];
                  if (this.selectedSOs.length == this.counter ) { resolve(true) };
                } else { this.loadingScreenService.stopLoading(), lstOfRecords1 = []; reject(false) }
              }, err => {

              });
          }
        });
       
      });  
    
    });

  }

  triggerInvoiceSubmit() {
   
    this.lstofInvoiceRecords = [];
   
    this.lstSelectedObj.forEach(e => {
      this.lstofInvoiceRecords = [];
      e.SOList.forEach(element => {
        var selectedItems = this.selectedSOs.find(x => x.Id == element.Id);
        if (selectedItems != undefined) {
          var so = new SaleOrder();
          so.Id = element.Id;
          so.ShipToClientContactId = element.ShipToClientContactId;
          so.ShipToAddressDetails = JSON.stringify(element.ShipToAddressDetails);
          so.CompanyBankAccountId = element.CompanyBankAccountId;
          so.Narration = element.Narration; 
          so.Remarks = element.Remarks;
          so.Status = SaleOrderStatus.Invoiced;
          so.PurchaseOrderNo = element.PurchaseOrderNo;
          so.IsSendEmailImmediatly = this.isSendEmailImmediately
          this.lstofInvoiceRecords.push(so);
          console.log('lst', this.lstofInvoiceRecords);
          if(this.isMergeSelected === false){
            this.generateInvoice(this.lstofInvoiceRecords);
          }
        } 

      });
      if(this.isMergeSelected === true){
      this.generateInvoice(this.lstofInvoiceRecords);
      }
    });

  }

  generateInvoice(lstOfRecords){
    return new Promise((resolve, reject) => {
    console.log(lstOfRecords);
    this.lstofInvoiceRecords = [];
    this.lstofInvoiceRecords.length = 0;
    
    this.payrollService.put_generateInvoice(lstOfRecords)
    .subscribe((result) => {
      let apiResult: apiResult = result;

    
     
      if (apiResult.Status) {
        this.invoceRecords.push(apiResult.Result);
        this.invoceRecords.forEach(element => {
          element.CompanyBankAccountId =  element.CompanyBankAccountId == null ? null  : Number(element.CompanyBankAccountId);
          element.ShipToAddressDetails = this.hasJsonStructure(element.ShipToAddressDetails) === true ? JSON.parse(element.ShipToAddressDetails) : element.ShipToAddressDetails;
          element.BillToAddressDetails = this.hasJsonStructure(element.BillToAddressDetails) === true ? JSON.parse(element.BillToAddressDetails) : element.BillToAddressDetails;
        });
        resolve(true);
        this.alertService.showSuccess(apiResult.Message);
        this.loadingScreenService.stopLoading();
      } else {
        resolve(true);
        this.loadingScreenService.stopLoading();
        this.alertService.showWarning(apiResult.Message);
      }
    }, err => {

    });
  });
  }

  pre(): void {
    this.invoceRecords.forEach(element => {
      element.CompanyBankAccountId = element.CompanyBankAccountId == null ? null  : Number(element.CompanyBankAccountId);
      element.ShipToAddressDetails = this.hasJsonStructure(element.ShipToAddressDetails) === true ? JSON.parse(element.ShipToAddressDetails) : element.ShipToAddressDetails;
      element.BillToAddressDetails = this.hasJsonStructure(element.BillToAddressDetails) === true ? JSON.parse(element.BillToAddressDetails) : element.BillToAddressDetails;
    });
    this.invoiceNumbers = null;
    this.count = 0;
    this.current -= 1;
    this.changeContent();
  }

  next(): void {
    this.current += 1;
    this.changeContent();
  }

  done(): void {
    console.log('done');
  }
  changeContent(): void {
    switch (this.current) {
      case 0: {
        // this.index = 'First-content';
        break;
      }
      case 1: {
        // this.index = 'Second-content';
        break;
      }
      case 2: {
        // this.index = 'third-content';
        break;
      }
      default: {
        // this.index = 'error';
      }
    }
  }

  previewSaleOrderInvoice(item, whichArea) {
    console.log('item', item);
    let LstpreviewSO = [];
    if (whichArea == 'multiple') {
      item.SOList.forEach((i) => {
        LstpreviewSO.push({
          Id: i.Id,
          Status: SaleOrderStatus.SaleOrderApproved,
          PurchaseOrderNo : i.PurchaseOrderNo,
          Narration : i.Narration,
          Remarks: i.Remarks,
          ShipToAddressDetails: JSON.stringify(i.ShipToAddressDetails),
          ShipToClientContactId: i.ShipToClientContactId,
          CompanyBankAccountId: i.CompanyBankAccountId
        })
      });
      this.triggerPrivewSaleOrderInvoiceAPI(LstpreviewSO);
    } else {
      LstpreviewSO.push({
        Id: item.Id,
        Status: SaleOrderStatus.SaleOrderApproved,
        PurchaseOrderNo : item.PurchaseOrderNo,
        Narration : item.Narration,
        Remarks: item.Remarks,
        ShipToAddressDetails: JSON.stringify(item.ShipToAddressDetails),
        ShipToClientContactId: item.ShipToClientContactId,
        CompanyBankAccountId: item.CompanyBankAccountId
      })
      this.triggerPrivewSaleOrderInvoiceAPI(LstpreviewSO);
    }

  }
  async previewInvoice(item, whichArea) {
    // let LstpreviewSO = [];
    // const returnValue = await whichArea == 'multiple' && item.SOList.forEach((i) => {
    //   LstpreviewSO.push({
    //     Id: i.Id,
    //     Status: SaleOrderStatus.SaleOrderApproved
    //   })
    // });
    const returnValue1 = await this.triggerPrivewInvoiceAPI(item.Id);

  }

  triggerPrivewSaleOrderInvoiceAPI(LstpreviewSO) {
    this.loadingScreenService.startLoading();
    this.payrollService.put_PreviewSaleOrderInvoice(LstpreviewSO)
      .subscribe((result) => {
        let apiResult: apiResult = result;
        if (apiResult.Status) {
          this.alertService.showSuccess(apiResult.Message);
          this.loadingScreenService.stopLoading();
          this.commonService.openNewtab(apiResult.Result, 'TaxInvoice_CoverLetter');
        } else {
          this.loadingScreenService.stopLoading();
          this.alertService.showWarning(apiResult.Message);

        }
      }, err => {

      });

  }
  triggerPrivewInvoiceAPI(Id) {
    this.loadingScreenService.startLoading();
    this.payrollService.get_PreviewInvoice(Id)
      .subscribe((result) => {
        let apiResult: apiResult = result;
        if (apiResult.Status) {
          this.alertService.showSuccess(apiResult.Message);
          this.loadingScreenService.stopLoading();
          this.commonService.openNewtab(apiResult.Result, 'TaxInvoice_CoverLetter');
        } else {
          this.loadingScreenService.stopLoading();
          this.alertService.showWarning(apiResult.Message);

        }
      }, err => {

      });
  }
 confirm_InvoiceUpdation() {
    let isSuccess: any = false;
    let invoiceNumbers = [];
    
    this.invoceRecords.forEach(obj => {
      obj.BillToAddressDetails = JSON.stringify(obj.BillToAddressDetails);
      obj.ShipToAddressDetails = JSON.stringify(obj.ShipToAddressDetails);
    
      this.loadingScreenService.startLoading();
      this.payrollService.put_SaveInvoice(obj)
        .subscribe((result) => {
          let apiResult: apiResult = result;
          if (apiResult.Status) {
                        invoiceNumbers.push(obj.InvNo);
            this.count = this.count + 1;
            this.loadingScreenService.stopLoading();
            this.alertService.showSuccess(apiResult.Message);
            isSuccess = true;
    console.log('invoiceNumber w s', invoiceNumbers);
            if (isSuccess == true && this.count == this.invoceRecords.length) {
              this.current = 1;
              this.invoiceNumbers = invoiceNumbers.join(',');
              this.next();
            }
            
          } else {
            isSuccess = false
            this.loadingScreenService.stopLoading();
            this.alertService.showWarning(apiResult.Message);
          }
        }, err => {
        })
    });
    
   
  }

}
