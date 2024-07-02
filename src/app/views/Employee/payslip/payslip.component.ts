
import { Component, OnInit, Input, VERSION, Pipe, PipeTransform } from '@angular/core';
import { HeaderService } from 'src/app/_services/service/header.service';
import { FormGroup, FormBuilder, FormControl, Validators, AbstractControl } from '@angular/forms';
import { enumHelper } from '../../../shared/directives/_enumhelper';
import { DomSanitizer } from '@angular/platform-browser';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { ToastrService, ToastrConfig } from 'ngx-toastr';
import { RowDataService } from '../../personalised-display/row-data.service';
import { EmployeeService } from '../../../_services/service/employee.service';
import { apiResult } from '../../../_services/model/apiResult';
import { OnboardingService } from '../../../_services/service/onboarding.service';
import { SessionStorage } from '../../../_services/service//session-storage.service';
import { environment } from "../../../../environments/environment";
import * as _ from 'lodash';
import { PageLayout } from '../../personalised-display/models';
import { PagelayoutService, CommonService, SearchService } from 'src/app/_services/service';
import { SearchPanelType, DataSourceType } from '../../personalised-display/enums';
import { Title } from '@angular/platform-browser';
import { UIBuilderService } from 'src/app/_services/service/UIBuilder.service';
import { ProcessCategory } from 'src/app/_services/model/Payroll/PayRun';
import { DatePipe } from '@angular/common';
import { AlertService } from '../../../_services/service/alert.service';
import { FileUploadService } from 'src/app/_services/service/fileUpload.service';
import { LoadingScreenService } from '../../../shared/components/loading-screen/loading-screen.service';
import { LoginResponses } from 'src/app/_services/model';
import { SessionKeys } from 'src/app/_services/configs/app.config';




@Component({
  selector: 'app-payslip',
  templateUrl: './payslip.component.html',
  styleUrls: ['./payslip.component.scss']
})
export class PayslipComponent implements OnInit {
  FicalYearList = [];
  // Payment history 
  pageLayout: PageLayout = null;
  LstPaymentHistory = [];


  _loginSessionDetails: LoginResponses;
  businessType : number;

  // custom pagination
  page = 1;
  pageSize = 8;
  collectionSize = 0;
  paginateData_PaymentHistory = [];
  selctedProcesscategoryId: any;
  selectedyear: any;
  yearrangeList: any = [];
  _EmployeeName: any;
  _EmployeeCode: any;
  empCode: any;
  processCategoryList: any = [];
  spinner : boolean = false;
  constructor(
    private formBuilder: FormBuilder,
    private utilsHelper: enumHelper,
    private route: ActivatedRoute,
    private rowDataService: RowDataService,
    private headerService: HeaderService,
    public employeeService: EmployeeService,
    public onboardingService: OnboardingService,
    private loadingScreenService: LoadingScreenService,
    public sessionService: SessionStorage,
    private datePipe: DatePipe,
    private alertService: AlertService,
    private router: Router,
    public fileuploadService: FileUploadService,
    private toastr: ToastrService,
    private modalService: NgbModal,
    private pageLayoutService: PagelayoutService,
    private titleService: Title,
    private commonService: CommonService,
    public searchService: SearchService,
    public UIBuilderService: UIBuilderService,
    private sanitizer: DomSanitizer,

  ) { }

  ngOnInit() {
    this._loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses)); // Get the whole matched session element set as a clean json(array) via an session object
    this.businessType = this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping.find(item=>item.CompanyId ==  this._loginSessionDetails.Company.Id).BusinessType;

  }

  onClear() {
    this.empCode = null; 
    this.LstPaymentHistory = [];
    this.paginateData_PaymentHistory = [];
  }

  onSearch() {
    this.spinner = true;
    this.loadingScreenService.startLoading();
    this.processCategoryList = [];
    this.processCategoryList = this.utilsHelper.transform(ProcessCategory);
    this.selctedProcesscategoryId = 1;
    this.processCategoryList = this.processCategoryList.filter(a => a.id != 4 && a.id != 0);
    this.yearrange_builder();
    let currentYear = new Date().getFullYear();
    this.selectedyear = this.yearrangeList.find(a => a.label == currentYear).value;
    this.get_EmployeePaymentHistory()
   
  }
  get_EmployeePaymentHistory() {
    this.pageLayout = {
      Description: "Any",
      Code: "Any",
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
          Name: 'Any'
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
        PageTitle: "Any List",
        BannerText: "Any",
      }
    }
    this.pageLayout.GridConfiguration.DataSource = null;
    this.pageLayout.GridConfiguration.DataSource = { Type: 0, Name: 'GETPAYMENTHISTORYBYCODE' }
    this.pageLayout.SearchConfiguration.SearchElementList.push(
      {
        FieldName : '@clientId',
        Value : null,
        IsIncludedInDefaultSearch : true,
        ReadOnly : false,
      },
      {
        "DisplayName": "@employeeCode",
        "FieldName": "@employeeCode",
        "InputControlType": 0,
        "Value": this.empCode,
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

      if(this.businessType !== 3){
        this.pageLayoutService.fillSearchElementsForSME(this.pageLayout.SearchConfiguration.SearchElementList);
      }

      console.log("Search Elements ::" , this.pageLayout.SearchConfiguration.SearchElementList);


    this.LstPaymentHistory = [];
    this.paginateData_PaymentHistory = [];
    this.pageLayoutService.getDataset(this.pageLayout.GridConfiguration.DataSource, this.pageLayout.SearchConfiguration.SearchElementList).subscribe(dataset => {
      if (dataset.Status == true && dataset.dynamicObject !== null && dataset.dynamicObject !== '') {
        dataset = JSON.parse(dataset.dynamicObject);
        console.log('dynomic', dataset);

        this.LstPaymentHistory = dataset;
        // this.LstPaymentHistory.forEach(element => {
        //   var last2 = element.PayPeriodName.slice(-2);
        //   element['YearOfPayment'] = `20${last2}`
        // });
        this.LstPaymentHistory = _.orderBy(this.LstPaymentHistory, ["PayTransactionId"], ["desc"]);
        this.paginateData_PaymentHistory = this.LstPaymentHistory;
        // .slice((this.page - 1) * this.pageSize, (this.page - 1) * this.pageSize + this.pageSize);
        // this.getPremiumData();
        this.onChangeProcessCategory({ id: 1 });
        this.onChangeYearOfPayment({ label: new Date().getFullYear() })
        this.loadingScreenService.stopLoading();
        this.spinner = false;
      }
      else {
        this.spinner = false;
        this.loadingScreenService.stopLoading();
        this.alertService.showWarning('No records found!');
        console.log('Sorry! Could not Fetch Data|', dataset);
      }
    }, error => {
      console.log(error);
    })


  }
  yearrange_builder() {

    var year = new Date(environment.environment.YearRangeFromStaringYear).getFullYear();
    this.yearrangeList = [];
    for (var i = 0; i < 7; i++) {
      this.yearrangeList.push({
        label: year + i,
        value: parseInt(String(year + i))
      });
    }
    console.log('YEAR LIST :: ', this.yearrangeList);

  }

  onChangeProcessCategory(event: any) {
    var str1 = '20';
    var res = str1.concat(this.selectedyear);
    console.log('selected Year', this.selectedyear);

    this.paginateData_PaymentHistory = [];
    this.paginateData_PaymentHistory = this.LstPaymentHistory.filter(x => x.ProcessCategoryId == event.id && (x.YearOfPayment) == this.selectedyear);
    this.paginateData_PaymentHistory = this.paginateData_PaymentHistory
      .slice((this.page - 1) * this.pageSize, (this.page - 1) * this.pageSize + this.pageSize);
    this.collectionSize = this.paginateData_PaymentHistory.length;

    console.log('PYMNT 1:', this.LstPaymentHistory);
    console.log('PGNHTRY 1:', this.paginateData_PaymentHistory);


  }
  onChangeYearOfPayment(event: any) {
    console.log('EV ::', event);

    console.log('YEAR :: ', this.selectedyear);
    console.log('PC ::', this.selctedProcesscategoryId);

    this.paginateData_PaymentHistory = [];
    this.paginateData_PaymentHistory = this.LstPaymentHistory.filter(x => x.ProcessCategoryId == this.selctedProcesscategoryId && (x.YearOfPayment) == event.label);
    this.paginateData_PaymentHistory = this.paginateData_PaymentHistory
      .slice((this.page - 1) * this.pageSize, (this.page - 1) * this.pageSize + this.pageSize);
    this.collectionSize = this.paginateData_PaymentHistory.length;

    console.log('PYMNT :', this.LstPaymentHistory);
    console.log('PGNHTRY :', this.paginateData_PaymentHistory);

  }


  downloadPaySlip(item) {
    this.loadingScreenService.startLoading();
    if (item.ObjectStorageId != 0) {
      this.fileuploadService.downloadObjectAsBlob(item.ObjectStorageId)
        .subscribe(res => {
          if (res == null || res == undefined) {
            this.loadingScreenService.stopLoading();
            this.alertService.showWarning('Sorry, unable to get the document. Please get in touch with the support team');
            return;
          }
          saveAs(res);
          this.loadingScreenService.stopLoading();
        });
    }
    else {
      this.employeeService.downloadPaySlip(item.PayTransactionId)
        .subscribe((result) => {
          let apiResult: apiResult = result;
          if (apiResult.Status) {
            this.alertService.showSuccess(apiResult.Message);
            this.loadingScreenService.stopLoading();           
            this.commonService.openNewtab(apiResult.Result, `PaySlip_${this.empCode}_${item.PayPeriodName}`,true);
          } else {
            this.loadingScreenService.stopLoading();
            this.alertService.showWarning(apiResult.Message);
          }
        }, err => {

        });
    }
  }

  downloadAllPayslip() {
    this.loadingScreenService.startLoading();
    this.LstPaymentHistory.forEach(element => {

      this.employeeService.downloadPaySlip(element.PayTransactionId)
        .subscribe((result) => {
          let apiResult: apiResult = result;
          if (apiResult.Status) {
            this.alertService.showSuccess(apiResult.Message);
            this.loadingScreenService.stopLoading();
            this.commonService.openNewtab(apiResult.Result, `PaySlip_${this.empCode}_${element.PayPeriodName}`);
          } else {
            this.loadingScreenService.stopLoading();
            this.alertService.showWarning(apiResult.Message);
          }
        }, err => {

        });
    });
  }

}
