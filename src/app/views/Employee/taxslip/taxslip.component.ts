import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
// import * as jspdf from 'jspdf';  
// import { jsPDF } from 'jspdf'
// import * as jsPDF from 'jspdf'
import * as jspdf from 'jspdf';
import html2canvas from 'html2canvas';
import { PageLayout } from '../../personalised-display/models';
import { PagelayoutService, EmployeeService, AlertService, SessionStorage, ClientContactService } from 'src/app/_services/service';
import { DataSourceType, SearchPanelType } from '../../personalised-display/enums';
import * as _ from 'lodash';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
import { apiResult } from 'src/app/_services/model/apiResult';
import { ApiResponse } from 'src/app/_services/model/Common/BaseModel';
import * as moment from 'moment';
import { ActivatedRoute, NavigationEnd, Router, RouterStateSnapshot } from '@angular/router';
import { LoginResponses } from 'src/app/_services/model';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { ProductYearlyTaxDetailsComponent } from 'src/app/shared/modals/product-yearly-tax-details/product-yearly-tax-details.component';

import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { NzDrawerService } from 'ng-zorro-antd';
import { environment } from 'src/environments/environment';
import { HtmlToPDFSrc } from 'src/app/_services/model/Employee/EmployeeDetails';
import { Location, LocationStrategy } from '@angular/common';
import { ClientContractService } from 'src/app/_services/service/clientContract.service';

@Component({
  selector: 'app-taxslip',
  templateUrl: './taxslip.component.html',
  styleUrls: ['./taxslip.component.css']
})
export class TaxslipComponent implements OnInit {
  CompanyName: any;
  @ViewChild('content') reportContent: ElementRef;
  @ViewChild('htmlData') htmlData: ElementRef;

  monthList = [{ id: 1, name: 'January' }, { id: 2, name: "February" }, { id: 3, name: "March" },
  { id: 4, name: "April" }, { id: 5, name: "May" }, { id: 6, name: "June" }, { id: 7, name: "July" }, { id: 8, name: "August" },
  { id: 9, name: "September" }, { id: 10, name: "October" }, { id: 11, name: "November" }, { id: 12, name: "December" }];
  yearList = [{ id: 2019, name: '2019' }, { id: 2020, name: "2020" }, { id: 2021, name: "2021" }]

  month: any; year: any; period: any;
  pageLayout: PageLayout = null;
  dataset = [];

  EmployeeTaxSlipRecords: any;
  LstAnnualSalary = [];
  LstHRA: any
  LstDeductions = [];
  LstPerquisites = [];
  LstIncomeFromHouseProperty = [];
  LstSavings = []; LstSavingsWithGroupBy = [];
  HRAExemption = [];
  GrossHRAExemption = [];
  OtherExemption = [];
  EmpDetails: any;
  TaxCodeList = [];
  ProductList = [];
  diffDuration: any = 0;
  IsNewTaxRegime: boolean = false;
  empCode: any;
  isEssLogin: boolean = false;
  clientLogoLink: any;
  clientminiLogoLink: any;
  _loginSessionDetails: LoginResponses;
  BusinessType: number;
  employeeId: any;
  locationhref: string = "";
  modalOption: NgbModalOptions = {};
  finacialYearId: any;
  UserId: any;
  RoleId: any;
  RoleCode: any;
  clientId: any;
  clientList: any[] = [];
  clientContractId: any;
  clientContractList: any[] = [];

  constructor(
    private pageLayoutService: PagelayoutService,
    private loadingScreenService: LoadingScreenService,
    private employeeService: EmployeeService,
    private alertService: AlertService,
    private sessionService: SessionStorage,
    private modalService: NgbModal,
    private router: Router,
    private drawerService: NzDrawerService,
    private location: Location,
    private clientService: ClientContactService,
    private clientContractService: ClientContractService
  ) {
    this.pageLayout = {
      Description: "PageLayout",
      Code: "PageLayout",
      CompanyId: 1,
      ClientId: 2,
      SearchConfiguration: {
        SearchElementList: [
        ],
        SearchPanelType: SearchPanelType.Panel
      },
      GridConfiguration: {
        ColumnDefinitionList: [],
        DataSource: {
          Type: DataSourceType.View,
          Name: 'PageLayout'
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
        PageTitle: "PageLayout",
        BannerText: "PageLayout",
      }
    }
    this.CompanyName = 'Integrum Solution Pvt Ltd'
    this.router.url == '/app/ess/taxSlip' ? this.isEssLogin = true : this.isEssLogin = false
    this.isEssLogin == true ? this.empCode = sessionStorage.getItem('loginUserId') : null;


    window.addEventListener("beforeunload", function (e) {
      var confirmationMessage = "\o/";
      console.log("cond");
      e.returnValue = confirmationMessage;
      // e.preventDefault();     // Gecko, Trident, Chrome 34+ 
      return confirmationMessage;              // Gecko, WebKit, Chrome <34
    });

  }

  ngOnInit() {
    this.locationhref = location.pathname.split('#')[0];  //location.origin;
    this.yearList = [];
    var dojYear = new Date('2018-01-01');
    let currentYear = new Date().getFullYear();
    let earliestYear = dojYear.getFullYear();
    while (currentYear >= earliestYear) {
      this.yearList.push({
        id: currentYear,
        name: (String(currentYear))
      });
      currentYear -= 1;
    }

    this._loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses)); // Get the whole matched session element set as a clean json(array) via an session object
    this.clientLogoLink = 'logo.png';
    this.BusinessType = this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping != null ? this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this._loginSessionDetails.Company.Id).BusinessType : 0;
    this.UserId = this._loginSessionDetails.UserSession.UserId;
    this.RoleId = this._loginSessionDetails.UIRoles[0].Role.Id;
    this.RoleCode = this._loginSessionDetails.UIRoles[0].Role.Code;
    if (this._loginSessionDetails.CompanyLogoLink != "" && this._loginSessionDetails.CompanyLogoLink != null && this.BusinessType == 3) {
      let jsonObject = JSON.parse(this._loginSessionDetails.CompanyLogoLink)
      this.clientLogoLink = jsonObject.logo;
      this.clientminiLogoLink = jsonObject.minilogo;

    } else if (this._loginSessionDetails.ClientList != null && this._loginSessionDetails.ClientList.length > 0 && (this.BusinessType == 1 || this.BusinessType == 2)) {
      let isDefualtExist = (this._loginSessionDetails.ClientList.find(a => a.Id == Number(this.sessionService.getSessionStorage("default_SME_ClientId"))));
      if (isDefualtExist != null && isDefualtExist != undefined) {
        let jsonObject = JSON.parse(this._loginSessionDetails.ClientList.find(a => a.Id == Number(this.sessionService.getSessionStorage("default_SME_ClientId"))).ClientLogoURL);
        this.clientLogoLink = jsonObject.logo;
        this.clientminiLogoLink = jsonObject.minilogo;
      } else {
        let jsonObject = JSON.parse(this._loginSessionDetails.ClientList[0].ClientLogoURL);
        this.clientLogoLink = jsonObject.logo;
        this.clientminiLogoLink = jsonObject.minilogo;
      }
    }

    this.clientId = null;
    this.clientContractId = null;

    // implemented for data level security
    if (!this.isEssLogin && this.RoleCode != 'PayrollAdmin' && this.BusinessType == 3) {
      this.loadingScreenService.startLoading();
      this.clientService.getUserMappedClientList(this.RoleId, this.UserId).subscribe(result => {
        console.log('CLIENT LIST', result);
        this.clientList = result.dynamicObject;
        this.loadingScreenService.stopLoading();
      }, (error) => {
        this.loadingScreenService.stopLoading();
      });


    }
  }

  onClientChange(e) {
    this.loadingScreenService.startLoading();
    this.clientContractService.getUserMappedClientContractList(this.RoleId, this.UserId, this.clientId).subscribe(response => {
      console.log('CONTRACT LIST', response);
      this.clientContractList = response.dynamicObject;
      this.loadingScreenService.stopLoading();
    }, (error) => {
      this.loadingScreenService.stopLoading();
    });
  }

  onSearch() {
    this.ProductList = [];
    this.HRAExemption = [];
    this.EmpDetails = null;
    this.TaxCodeList = [];
    this.LstAnnualSalary = [];
    this.GrossHRAExemption = [];
    this.LstDeductions = [];
    this.OtherExemption = [];
    this.LstIncomeFromHouseProperty = [];
    this.LstSavingsWithGroupBy = [];

    if (!this.isEssLogin && this.BusinessType == 3 && (this.RoleCode != 'PayrollAdmin') && (this.clientId == null || this.clientContractId == null ||
      this.empCode == null || this.empCode == undefined || this.empCode == '' || this.month == null || this.year == null || this.month == undefined || this.year == undefined)) {
      this.alertService.showWarning("Please fill the required search item(s)!");
      return;
    }

    if (this.empCode == null || this.empCode == undefined || this.empCode == '' || this.month == null || this.year == null || this.month == undefined || this.year == undefined) {
      this.alertService.showWarning("Please fill the required search item(s)!");
      return;
    }

    this.period = `${this.monthList.find(z => z.id == this.month).name} - ${this.year}`;
    this.loadingScreenService.startLoading();
    this.pageLayout.GridConfiguration.DataSource = null;
    this.pageLayout.SearchConfiguration.SearchElementList = [];
    this.pageLayout.GridConfiguration.DataSource = { Type: 0, Name: 'GetPaytransactionDataForTaxSlip' }
    this.pageLayout.SearchConfiguration.SearchElementList.push(
      {
        FieldName: '@userId',
        Value: this.UserId,
        IsIncludedInDefaultSearch: true,
        ReadOnly: false,
      },
      {
        FieldName: '@roleCode',
        Value: this.RoleCode,
        IsIncludedInDefaultSearch: true,
        ReadOnly: false,
      },
      {
        FieldName: '@clientId',
        Value: this.BusinessType == 3 ? this.clientId : this.sessionService.getSessionStorage('default_SME_ClientId'),
        IsIncludedInDefaultSearch: true,
        ReadOnly: false,
      },
      {
        FieldName: '@clientContractId',
        Value: this.BusinessType == 3 ? this.clientContractId : this.sessionService.getSessionStorage('default_SME_ContractId'),
        IsIncludedInDefaultSearch: true,
        ReadOnly: false,
      },
      {
        "DisplayName": "@EmployeeId",
        "FieldName": "@EmployeeId",
        "InputControlType": 0,
        "Value":  this.isEssLogin == true ? sessionStorage.getItem('loginUserId') : this.empCode,
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
      },
      {
        "DisplayName": "@month",
        "FieldName": "@month",
        "InputControlType": 0,
        "Value": this.month,
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
      },
      {
        "DisplayName": "@year",
        "FieldName": "@year",
        "InputControlType": 0,
        "Value": this.year,
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

    if (this.BusinessType !== 3) {
      this.pageLayoutService.fillSearchElementsForSME(this.pageLayout.SearchConfiguration.SearchElementList);
      if (this.pageLayout.SearchConfiguration.SearchElementList.find(item => item.FieldName.toUpperCase().toString() == "@CLIENTCONTRACTID") != undefined) {
        this.pageLayout.SearchConfiguration.SearchElementList.find(item => item.FieldName.toUpperCase().toString() == '@CLIENTCONTRACTID').Value = this.sessionService.getSessionStorage('default_SME_ContractId')
      }
    }

    console.log("Search Elements ::", this.pageLayout.SearchConfiguration.SearchElementList);

    this.dataset = [];
    this.pageLayoutService.getDataset(this.pageLayout.GridConfiguration.DataSource, this.pageLayout.SearchConfiguration.SearchElementList).subscribe(dataset => {
      if (dataset.Status == true && dataset.dynamicObject !== null && dataset.dynamicObject !== '') {

        try {

          var tempListofRecords;
          tempListofRecords = JSON.parse(dataset.dynamicObject);
          console.log('tempListofRecords', tempListofRecords);
          this.EmpDetails = tempListofRecords;

          if (environment.environment.TaxSlipLogoForStaffing != null && environment.environment.TaxSlipLogoForStaffing.length > 0 &&
            environment.environment.TaxSlipLogoForStaffing.find(z => z.ClientId == tempListofRecords.ClientId) != undefined) {
            let logoURL = environment.environment.TaxSlipLogoForStaffing.find(z => z.ClientId == tempListofRecords.ClientId).LogoURL;
            let jsonObject = JSON.parse(logoURL)
            this.clientLogoLink = jsonObject.logo;
            this.clientminiLogoLink = jsonObject.minilogo;
          }

          if (tempListofRecords.PayTransactionList != null && tempListofRecords.PayTransactionList.length > 0) {
            this.EmployeeTaxSlipRecords = tempListofRecords.PayTransactionList[0];
            this.TaxCodeList = tempListofRecords.TaxCodeList;
            this.ProductList = tempListofRecords.ProductList;
            if (this.EmployeeTaxSlipRecords) {
              this.finacialYearId = this.EmployeeTaxSlipRecords.FinancialyearId
              this.employeeId = this.EmployeeTaxSlipRecords.EmployeeId
            }
            console.log('response', this.EmployeeTaxSlipRecords);

            if (this.EmployeeTaxSlipRecords.hasOwnProperty('TaxItemdata') == false) {
              this.EmployeeTaxSlipRecords = null;
              this.loadingScreenService.stopLoading();
              this.alertService.showInfo(dataset.Message ==''  ? "No records found!" : dataset.Message);
              return;

            }

            this.LstAnnualSalary = this.EmployeeTaxSlipRecords.TaxItemdata.length > 0 ? this.EmployeeTaxSlipRecords.TaxItemdata.filter(a => a.PayTransactionHead.toUpperCase() == 'GROSSSALARY') : [];
            this.LstAnnualSalary.length > 0 ? this.LstAnnualSalary = _.orderBy((this.LstAnnualSalary), ["ProductId"], ["asc"]) : true;
            // this.LstAnnualSalary.length > 0 ? this.LstAnnualSalary = this.LstAnnualSalary.filter(a => a.ProductId > 0) : true;

            console.log('LST OF ANNUAL SALARY >>>>>>>>>>>>', this.LstAnnualSalary);
            let HRAList = [];
            this.LstHRA = [];
            HRAList = this.EmployeeTaxSlipRecords.TaxItemdata.length > 0 ? this.EmployeeTaxSlipRecords.TaxItemdata.filter(a => a.PayTransactionHead.toUpperCase() == 'GROSSSALARY' && a.ProductCode == 'HRA') : [];
            HRAList != undefined && HRAList.length > 0 && (this.LstHRA = HRAList[0].LstTaxBreakUp)
            console.log('HRA >>>>>>>>>>>>>>>', this.LstHRA);

            this.LstDeductions = this.EmployeeTaxSlipRecords.TaxItemdata.length > 0 ? this.EmployeeTaxSlipRecords.TaxItemdata.filter(a => a.PayTransactionHead.toUpperCase() == "DEDUCTIONS" && a.ProductCode == 'PT') : [];
            this.LstIncomeFromHouseProperty = this.EmployeeTaxSlipRecords.TaxItemdata.length > 0 ? this.EmployeeTaxSlipRecords.TaxItemdata.filter(a => a.PayTransactionHead.toUpperCase() == 'INCOMEFROMHOUSEPROPERTY') : [];


            if (this.LstIncomeFromHouseProperty.length == 0) {
              this.LstIncomeFromHouseProperty.push({
                InterestAmount: 0,
                GrossAnnualRent: 0,
                HouseMaintenanceAmount: 0,
                MunicipalTaxAmount: 0
              }) //sec, prod 
            }

            var InvestmentRecords = [];
            InvestmentRecords = this.EmployeeTaxSlipRecords.TaxItemdata.length > 0 ? this.EmployeeTaxSlipRecords.TaxItemdata.filter(a => a.PayTransactionHead.toUpperCase() == 'SAVINGS' && a.ProductCode != 'PF' && a.ProductCode != 'VPF') : [];
            InvestmentRecords.length > 0 ? this.LstSavingsWithGroupBy = _.chain(InvestmentRecords)
              .groupBy("TaxCodeId")
              .map((element, id) => ({
                TaxCodeId: id,
                TaxAmount: this.calculcateTaxAmount(element),
              }))
              .value() : true;

            this.LstSavingsWithGroupBy.length > 0 ? this.LstSavingsWithGroupBy = _.orderBy((this.LstSavingsWithGroupBy), ["TaxCodeId"], ["asc"]) : true;
            this.LstSavingsWithGroupBy.length > 0 ? this.LstSavingsWithGroupBy = this.LstSavingsWithGroupBy.filter(a => a.TaxCodeId > 0) : true;
            var LstINCOMEFROMHOUSEPROPERTY = [];
            this.LstSavings = this.EmployeeTaxSlipRecords.TaxItemdata.length > 0 ? this.EmployeeTaxSlipRecords.TaxItemdata.filter(a => a.PayTransactionHead.toUpperCase() == 'SAVINGS') : [];
            LstINCOMEFROMHOUSEPROPERTY = this.EmployeeTaxSlipRecords.TaxItemdata.length > 0 ? this.EmployeeTaxSlipRecords.TaxItemdata.filter(a => a.PayTransactionHead.toUpperCase() == 'INCOMEFROMHOUSEPROPERTY') : [];

            this.LstSavings = this.LstSavings.concat(LstINCOMEFROMHOUSEPROPERTY);
            console.log('Savings >>>>>>>>>>', this.LstSavings);

            this.LstPerquisites = this.EmployeeTaxSlipRecords.TaxItemdata.length > 0 ? this.EmployeeTaxSlipRecords.TaxItemdata.filter(a => a.PayTransactionHead.toUpperCase() == 'PERQUISITES') : [];
            this.LstPerquisites.length > 0 ? this.LstPerquisites = this.LstPerquisites.filter(a => a.ProductId > 0) : true;
            console.log('Perquisites >>>>>>>>>>', this.LstPerquisites);


            this.EmployeeTaxSlipRecords.TaxItemdata.length > 0 ? this.EmployeeTaxSlipRecords.TaxItemdata.forEach(element => {
              if (element.ProductCode == 'HRA' && element.PayTransactionHead.toUpperCase() == 'EXEMPTIONS') {
                this.HRAExemption.push(element.LstTaxBreakUp);
              }
              if (element.ProductCode == 'HRA' && element.PayTransactionHead.toUpperCase() == 'EXEMPTIONS') {
                this.GrossHRAExemption.push(element);
              }
              if (element.ProductCode != 'HRA' && element.PayTransactionHead.toUpperCase() == 'EXEMPTIONS') {
                this.OtherExemption.push(element);
              }
            }) : true;

            console.log('Gross HRA Exemption >>>>>>>', this.GrossHRAExemption);
            console.log('HRA Exemption >>>>>>>>>>', this.HRAExemption);

            let a = moment(this.EmployeeTaxSlipRecords.PayrollDate).format('YYYY-MM-DD');
            let b = moment(this.EmployeeTaxSlipRecords.FinEndDate).format('YYYY-MM-DD');
            this.diffDuration = moment(b).diff(a, "months")

            // if(this.LstSavings != null && this.LstSavings.length > 0){

            //   this.LstSavings = this.LstSavings.filter(a=>a.LstTaxBreakUp != null && a.LstTaxBreakUp.length > 0 && a.LstTaxBreakUp.filter(z=>z.PayTransactionHead != null && z.ProductId != 0));
            //   console.log('vvvv', this.LstSavings);

            // }

            if (this.EmployeeTaxSlipRecords == undefined || this.EmployeeTaxSlipRecords == null) {
              this.loadingScreenService.stopLoading();
            } else {
              this.loadingScreenService.stopLoading();
              // this.getEmployeeDetails();
            }
          }
          else {
            this.EmployeeTaxSlipRecords = null;
            this.loadingScreenService.stopLoading();
            this.alertService.showInfo(dataset.Message ==''  ? "No records found!" : dataset.Message);
            console.log('Sorry! Could not Fetch Data|', dataset);
          }
        } catch (error) {
          this.loadingScreenService.stopLoading();
          this.alertService.showInfo(error);
        }
      } else {
        this.EmployeeTaxSlipRecords = null;
        this.loadingScreenService.stopLoading();
        this.alertService.showInfo(dataset.Message ==''  ? "No records found!" : dataset.Message);
      }
    }, error => {
      console.log(error);
    })


  }
  doCheckHasProp(item, prop) {
    return item.hasOwnProperty(prop);
  }

  doCheckValidProductId(item) {
    return item.hasOwnProperty('LstTaxBreakUp') ? item.LstTaxBreakUp.length > 0 && item.LstTaxBreakUp.find(a => a.Amount > 0) ? true : false : false;
  }

  calculcateTaxAmount(item) {
    var sum = 0;
    item.length > 0 ? item.forEach(e => { sum += parseInt(e.Amount) }) : sum = 0;
    return sum;
  }

  // getEmployeeDetails() {
  //   this.employeeService.getEmployeeDetailsById(this.EmployeeTaxSlipRecords.EmployeeId).subscribe((result) => {
  //     const apiResult: apiResult = result;
  //     if (apiResult.Status) {
  //       this.EmpDetails = apiResult.Result;
  //       this.IsNewTaxRegime = this.EmpDetails.EmploymentContracts[0].IsNewTaxRegimeOpted;
  //     }
  //     this.loadingScreenService.stopLoading();
  //   });
  // }

  onClear() {
    this.clientId = null;
    this.clientContractId = null;
    this.empCode = null;
    this.month = null;
    this.year = null;
    // this.EmpDetails = null;
    this.EmployeeTaxSlipRecords = null;

  }
  printDiv(divName) {

    var printContents = document.getElementById(divName).innerHTML;
    var originalContents = document.body.innerHTML;

    document.body.innerHTML = printContents;

    window.print();

    document.body.innerHTML = originalContents;
  }
  getAmount(PayTransactionHead) {
    if (PayTransactionHead.toUpperCase() == 'STANDARDDEDUCTION') {
      let isExists = [];
      isExists = this.EmployeeTaxSlipRecords.TaxItemdata.length > 0 ? this.EmployeeTaxSlipRecords.TaxItemdata.filter(a => a.PayTransactionHead.toUpperCase() == PayTransactionHead.toUpperCase()) : []
      return isExists.length > 0 ? isExists[0].Amount : 0;
    }
    else if (PayTransactionHead.toUpperCase() == 'PREVIOUSGROSSSALARY') {
      let isExists1 = [];;
      isExists1 = this.EmployeeTaxSlipRecords.TaxItemdata.length > 0 ? this.EmployeeTaxSlipRecords.TaxItemdata.filter(a => a.PayTransactionHead.toUpperCase() == PayTransactionHead.toUpperCase()) : [];
      return (isExists1 != null && isExists1 != undefined && isExists1.length > 0) ? isExists1[0].Amount : isExists1.length == 0 ? 0 : 0;
    }
    else if (PayTransactionHead.toUpperCase() == 'TAXDEDUCTED') {
      let isExists1 = [];
      isExists1 = this.EmployeeTaxSlipRecords.TaxItemdata.length > 0 ? this.EmployeeTaxSlipRecords.TaxItemdata.filter(a => a.PayTransactionHead.toUpperCase() == PayTransactionHead.toUpperCase()) : [];
      return (isExists1 != null && isExists1 != undefined && isExists1.length) > 0 ?
        isExists1[0].Amount : isExists1.length == 0 ? 0 : 0;
    }
    else if (this.EmployeeTaxSlipRecords.TaxItemdata.length > 0 && this.EmployeeTaxSlipRecords.TaxItemdata.filter(a => a.PayTransactionHead.toUpperCase() == PayTransactionHead.toUpperCase()).length > 0) {
      return (this.EmployeeTaxSlipRecords.TaxItemdata.filter(a => a.PayTransactionHead.toUpperCase() == PayTransactionHead.toUpperCase()).length > 0 &&
        this.EmployeeTaxSlipRecords.TaxItemdata.filter(a => a.PayTransactionHead.toUpperCase() == PayTransactionHead.toUpperCase())[0].LstTaxBreakUp != null &&
        this.EmployeeTaxSlipRecords.TaxItemdata.filter(a => a.PayTransactionHead.toUpperCase() == PayTransactionHead.toUpperCase())[0].LstTaxBreakUp.length > 0) ?
        this.EmployeeTaxSlipRecords.TaxItemdata.filter(a => a.PayTransactionHead.toUpperCase() == PayTransactionHead.toUpperCase())[0].LstTaxBreakUp[0].Amount : 0;
    } else {
      return 0;
    }
    // return (this.EmployeeTaxSlipRecords.TaxItemdata.filter(a => a.PayTransactionHead.toUpperCase() == PayTra nsactionHead.toUpperCase()).length > 0 ?  (this.EmployeeTaxSlipRecords.TaxItemdata.filter(a => a.PayTransactionHead.toUpperCase() == PayTransactionHead.toUpperCase())[0].LstTaxBreakUp[0].Amount) : 0);
  }

  getTotalAmount(PayTransactionHead) {

    if (PayTransactionHead.toUpperCase() == 'PREVIOUSGROSSSALARY') {
      return this.EmployeeTaxSlipRecords.TaxItemdata.length > 0 && this.EmployeeTaxSlipRecords.TaxItemdata.filter(a => a.PayTransactionHead.toUpperCase() == PayTransactionHead.toUpperCase()).length > 0 ?
        (Number(this.EmployeeTaxSlipRecords.GrossSalary) + Number(this.EmployeeTaxSlipRecords.TaxItemdata.filter(a => a.PayTransactionHead.toUpperCase() === PayTransactionHead.toUpperCase())[0].Amount)) : (Number(this.EmployeeTaxSlipRecords.GrossSalary) + 0)
    }
    else if (PayTransactionHead.toUpperCase() == "PT") {
      var sum = 0;
      this.LstDeductions.length > 0 && this.LstDeductions.forEach(e => { sum += parseInt(e.Amount) })
      return sum;
    }
    else if (PayTransactionHead.toUpperCase() == 'PREVIOUSDEDUCTION') {
      return this.EmployeeTaxSlipRecords.TaxItemdata.length > 0 && this.EmployeeTaxSlipRecords.TaxItemdata.filter(a => a.PayTransactionHead.toUpperCase() == PayTransactionHead.toUpperCase()).length > 0 ?
        Number((this.EmployeeTaxSlipRecords.TaxItemdata.filter(a => a.PayTransactionHead.toUpperCase() === PayTransactionHead.toUpperCase())[0].LstTaxBreakUp != null &&
          this.EmployeeTaxSlipRecords.TaxItemdata.filter(a => a.PayTransactionHead.toUpperCase() === PayTransactionHead.toUpperCase())[0].LstTaxBreakUp.length > 0) ? this.EmployeeTaxSlipRecords.TaxItemdata.filter(a => a.PayTransactionHead.toUpperCase() === PayTransactionHead.toUpperCase())[0].LstTaxBreakUp[0].Amount : 0) : 0;
    }
    else {
      return 0;
    }
  }

  getTaxCodeName(taxcodeId) {
    return this.TaxCodeList.find(x => x.Id == taxcodeId) != undefined ? this.TaxCodeList.find(x => x.Id == taxcodeId).Description : "";
  }
  getTaxCodeSec(taxcodeId) {
    return this.TaxCodeList.find(x => x.Id == taxcodeId) != undefined ? this.TaxCodeList.find(x => x.Id == taxcodeId).Code : "";
  }

  getProductName(productId) {
    return this.ProductList.find(x => x.Id == productId) != undefined ? this.ProductList.find(x => x.Id == productId).Name : "";
  }

  // testprint(){

  //   var data = document.getElementById('print1');
  //   var HTML_Width = $(".print1").width();
  //   var HTML_Height = $(".print1").height();
  //   var top_left_margin = 70;
  //   var PDF_Width = HTML_Width + (top_left_margin * 2) as any;
  //   var PDF_Height = (PDF_Width * 1.5) + (top_left_margin * 2) as any;
  //   var canvas_image_width = HTML_Width;
  //   var canvas_image_height = HTML_Height;

  //   var totalPDFPages = Math.ceil(HTML_Height / PDF_Height) - 1;
  //   this.loadingScreenService.stopLoading();

  //   html2canvas($(".print1")[0]).then(function (canvas) {
  //     var imgData = canvas.toDataURL("image/jpeg", 3.0);
  //     var pdf = new jspdf('p', 'pt', [PDF_Width, PDF_Height]);
  //     pdf.addImage(imgData, 'JPG', top_left_margin, top_left_margin, canvas_image_width, canvas_image_height);
  //     for (var i = 1; i <= totalPDFPages; i++) {
  //       pdf.addPage(PDF_Width, PDF_Height);
  //       pdf.addImage(imgData, 'JPG', top_left_margin, -(PDF_Height * i) + (top_left_margin * 4), canvas_image_width, canvas_image_height, '', 'FAST');
  //     }
  //     pdf.save('testt.pdf');
  //   });
  // }

  makePDF() {

    this.loadingScreenService.startLoading();
    var filename = `TaxSlip_${this.EmpDetails.EmployeeCode}_${this.monthList.find(z => z.id == this.month).name}_${this.year}`;
    filename = filename + '.pdf';
    console.log('this.EmpDetails', filename);

    var data = document.getElementById('print');
    var myInnerHtml = document.getElementById("print").innerHTML;

    // document.getElementById('image').src = c;
    console.log('this.router.url', (this.location));
    console.log(location.origin);
    console.log(location.href);
    console.log(location.pathname);

    const href = location.href; // "http://smeqc.integrumapps.com:8080/hrsuiteui/#/app/ess/employeetaxslip"
    const remove_after = href.indexOf('#');
    const originURL = href.substring(0, remove_after);
    // var a = (<HTMLInputElement>document.getElementById('image')).value; 
    (<HTMLInputElement>document.getElementById('image')).src = `${originURL}assets/Images/clientlogo/${this.clientLogoLink}`



    var docHtml = `<!doctype html>
    <html><head><title></title>
    <link rel="stylesheet" type="text/css" href="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css">
    </head><body>${document.getElementById('print').innerHTML}</body></html>
    `;

    console.log('HTML :::', myInnerHtml.toString());

    console.log('docHtml', docHtml);

    // var w = window.open();

    // w.document.write('<html><head><title></title>');
    // w.document.write('<link rel="stylesheet" type="text/css" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css">');
    // w.document.write('</head><body >');
    // w.document.write(document.getElementById('print').innerHTML);
    // w.document.write('</body></html>');

    // w.document.close();
    // w.focus();


    var htmlToPDFSrc = new HtmlToPDFSrc()
    htmlToPDFSrc.htmldata = docHtml.toString();
    htmlToPDFSrc.footer = "";
    htmlToPDFSrc.header = "";
    htmlToPDFSrc.hasHeader = true;
    htmlToPDFSrc.hasFooter = true;
    htmlToPDFSrc.headerHeight = 50;
    htmlToPDFSrc.footerHeight = 50;
    htmlToPDFSrc.baseUrlForCssAndImgs = "https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css";
    htmlToPDFSrc.putHeaderOnFirstPage = true;
    htmlToPDFSrc.putHeaderOnOddPages = true;
    htmlToPDFSrc.putHeaderOnEvenPages = true;
    htmlToPDFSrc.putFooterOnFirstPage = true;
    htmlToPDFSrc.putFooterOnOddPages = true;
    htmlToPDFSrc.putFooterOnEvenPages = true;
    htmlToPDFSrc.isPageNumRequired = true;
    let req = JSON.stringify(htmlToPDFSrc);
    this.employeeService.GeneratePDFDocument(req).subscribe((result) => {
      const linkSource = 'data:application/pdf;base64,' + result.Result;
      const downloadLink = document.createElement("a");
      downloadLink.href = linkSource;
      downloadLink.download = filename;
      downloadLink.click();
      this.loadingScreenService.stopLoading();

      (<HTMLInputElement>document.getElementById('image')).src = `/assets/Images/clientlogo/${this.clientLogoLink}`

    }, er => {

    })

    return;


    var HTML_Width = $(".print").width();
    var HTML_Height = $(".print").height();
    var top_left_margin = 15;
    var PDF_Width = HTML_Width + (top_left_margin * 2) as any;
    var PDF_Height = (PDF_Width * 1.5) + (top_left_margin * 2) as any;
    var canvas_image_width = HTML_Width;
    var canvas_image_height = HTML_Height;

    var totalPDFPages = Math.ceil(HTML_Height / PDF_Height) - 1;
    this.loadingScreenService.stopLoading();

    html2canvas($(".print")[0]).then(function (canvas) {
      var imgData = canvas.toDataURL("image/jpeg", 3.0);
      var pdf = new jspdf('p', 'pt', [PDF_Width, PDF_Height]);
      pdf.addImage(imgData, 'JPG', top_left_margin, top_left_margin, canvas_image_width, canvas_image_height);
      for (var i = 1; i <= totalPDFPages; i++) {
        pdf.addPage(PDF_Width, PDF_Height);
        pdf.addImage(imgData, 'JPG', top_left_margin, -(PDF_Height * i) + (top_left_margin * 4), canvas_image_width, canvas_image_height, '', 'FAST');
      }
      pdf.save(filename);
    });

    // html2canvas(data).then(canvas => {
    //   var imgData = canvas.toDataURL('image/png');
    //   var imgWidth = 210;
    //   var pageHeight = 295;
    //   var imgHeight = canvas.height * imgWidth / canvas.width;

    //   var heightLeft = imgHeight;
    //   var doc = new jspdf('p', 'mm');
    //   var position = 10; // give some top padding to first page



    //   doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    //   heightLeft -= pageHeight;

    //   while (heightLeft >= 0) {
    //     position += heightLeft - imgHeight; // top padding for other pages
    //     doc.addPage();
    //     doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    //     heightLeft -= pageHeight;
    //   }
    //   doc.save('file.pdf');
    //   // Few necessary setting options
    //   //     var options = {
    //   //       pagesplit: true
    //   //  };
    //   //     var imgWidth = 208;
    //   //     var pageHeight = 295;
    //   //     var imgHeight = canvas.height * imgWidth / canvas.width;
    //   //     var heightLeft = imgHeight;
    //   //     const contentDataURL = canvas.toDataURL('image/png')
    //   //     let pdf = new jspdf('p', 'mm', 'a4'); // A4 size page of PDF
    //   //     var position = 0;
    //   //     pdf.addImage(contentDataURL, 'PNG', 0, position, imgWidth, imgHeight)
    //   //     pdf.save('new-file.pdf'); // Generated PDF
    // });


    // const doc = new jspdf('p','pt','a4');
    // // const specialElementHandlers = {
    // //   '#editor': function (element, renderer) {
    // //     return true;
    // //   }
    // // };

    // const content = this.reportContent.nativeElement;

    // doc.fromHTML(content.innerHTML, 15, 15, {

    //   // 'elementHandlers': specialElementHandlers
    // });

    // doc.save('taxSlip' + '.pdf');


    // const doc = new jsPDF();
    // const specialElementHandlers = {
    //   '#editor': function (element, renderer) {
    //     return true;
    //   }
    // };
    // const content = this.reportContent.nativeElement;
    // doc.fromHTML(content.innerHTML, 15, 15, {
    //   'width': 190,
    //   'elementHandlers': specialElementHandlers
    // });


    // let docd = new jspdf('p','pt','a4');
    // docd.addHTML(this.reportContent.nativeElement, function() {
    //    docd.save("obrz.pdf"); 
    // });
    // this.download_DIVPdf();
  }

  download_DIVPdf() {
    var pdf = new jspdf('p', 'pt', 'letter');
    var pdf_name = 'PostMode-' + '.pdf';
    // source can be HTML-formatted string, or a reference
    // to an actual DOM element from which the text will be scraped.
    var htmlsource = $('#contentToConvert')[0];

    var specialElementHandlers = {
      // element with id of "bypass" - jQuery style selector
      '#bypassme': function (element, renderer) {
        // true = "handled elsewhere, bypass text extraction"
        return true
      }
    };
    var margins = {
      top: 80,
      bottom: 40,
      left: 20,
      width: 2222
    };

    pdf.fromHTML(
      htmlsource, // HTML string or DOM elem ref.
      margins.left, // x coord
      margins.top, { // y coord
      'width': margins.width, // max width of content on PDF
      'elementHandlers': specialElementHandlers
    },

      function (dispose) {

        pdf.save(pdf_name);
      }, margins);
  }


  yearlyTaxDetails() {
    const drawerRef = this.drawerService.create<ProductYearlyTaxDetailsComponent, { employeeId, finacialYearId }, string>({
      nzTitle: 'Salary Details',
      nzContent: ProductYearlyTaxDetailsComponent,
      nzWidth: 980,
      nzClosable: true,
      nzMaskClosable: false,
      nzContentParams: {
        employeeId: this.employeeId,
        finacialYearId: this.finacialYearId

      }
    });

    drawerRef.afterOpen.subscribe(() => {
      console.log('Drawer(Component) open');
    });

    drawerRef.afterClose.subscribe(data => {
      console.log('data', data);

      var modalResult = (data) as any;
      if (data != undefined) {

      }

    });
  }

  //   public openPDF():void {
  //     var docw = new jsPDF(); // this throws an exception
  // docw.text('Hello world!', 10, 10)
  // docw.save('a4.pdf')

  //     let DATA = this.htmlData.nativeElement; 
  //     let doc = new jsPDF('p','pt', 'a4');
  //     doc.fromHTML(DATA.innerHTML,15,15);
  //     doc.output('dataurlnewwindow');
  //   }


  //   public downloadPDF():void { 
  //     let DATA = this.htmlData.nativeElement;
  //     let doc = new jsPDF('p','pt', 'a4');

  //     let handleElement = {
  //       '#editor':function(element,renderer){
  //         return true;
  //       }
  //     };
  //     doc.fromHTML(DATA.innerHTML,15,15,{
  //       'width': 200,
  //       'elementHandlers': handleElement
  //     });

  //     doc.save('angular-demo.pdf');
  //   }

}