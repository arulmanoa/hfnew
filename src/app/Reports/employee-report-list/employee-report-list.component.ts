import { Component, OnInit } from '@angular/core';
import { OnboardingService } from '../../_services/service/onboarding.service';
import { ExcelService } from '../../_services/service/excel.service';
import { MigratedCandidateDetails, MigratedCandidateDetailsList, _EmployeeTransitionGroup, _CandidateEmployeeMigration, MigrationResult } from '../../_services/model/Migrations/Transition';
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
  Pagination,
  GridService,
} from 'angular-slickgrid';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
import { AlertService } from '../../_services/service/alert.service';
import { stringify } from 'querystring';
import { formatNumber, formatDate } from '@angular/common';
//import { dateTimeShortIsoFormatter } from 'angular-slickgrid/app/modules/angular-slickgrid/formatters/dateTimeShortIsoFormatter';
import { DATE } from 'ngx-bootstrap/chronos/units/constants';
//import { dateIsoFilterCondition } from 'angular-slickgrid/app/modules/angular-slickgrid/filter-conditions/dateIsoFilterCondition';
@Component({
  selector: 'app-employee-report-list',
  templateUrl: './employee-report-list.component.html',
  styleUrls: ['./employee-report-list.component.css']
})
export class EmployeeReportListComponent implements OnInit {
  spinner: boolean = false;
  columnDefinitions1: Column[] = [];
  columnDefinitions2: Column[] = [];
  gridOptions: GridOption = {};
  datasetview1: any[] = [];
  datasetview2: any[] = [];
  migrationGridInstance: AngularGridInstance;
    migrationtGrid: any;
    migrationGridService: GridService;
    migrationDataView: any;
  grid1: any;
  grid2: any;
  objArray: any;
  previewFormatter: Formatter;
  selectedmigrationRecords: any[];
  LstEmployeeReportMigration: MigratedCandidateDetails[] = [];
  MigratedCandidateDetailsList: MigratedCandidateDetailsList = new MigratedCandidateDetailsList;
  constructor(
    private onboardingApi: OnboardingService,
     private excelService: ExcelService,
    private alertService: AlertService,
    private loadingScreenService: LoadingScreenService,

     ) { }

  newClickHere() {
    this.selectedmigrationRecords= [];
    this.LstEmployeeReportMigration=[];
    this.spinner = true;
    this.onboardingApi.getCandidateViewsDetails().subscribe((response) => {
      if(response.Status= false)
      {
        this.spinner = false;
        this.alertService.showWarning("No data found");
      }
      console.log(response);

      this.datasetview1 = response.Result[0].GeneralData;
      this.datasetview1.forEach(element => {

        element['Id'] = element['Employee Number'];
      });

      console.log(this.datasetview1);

      this.datasetview2 = response.Result[0].SalaryData;
      this.datasetview2.forEach(element => {

        element['Id'] = element['Employee Number'];

      });
      console.log(this.datasetview2);
      
      this.spinner = false;
    }, (error) => {
      this.spinner = false;
    });
    
  }
  ngOnInit() {

    this.columnDefinitions1 = [
      { id: 'EmployeeNumber', name: 'Employee Number', field: 'Employee Number', width: 120, exportCsvForceToKeepAsString: true, sortable: true },
      { id: 'Name', name: 'Name', field: 'Name', sortable: true, exportCsvForceToKeepAsString: true },
      { id: 'JoiningDate', name: 'Joining Date', field: 'Joining Date', exportCsvForceToKeepAsString: true, sortable: true },
      { id: 'EmailAddress', name: 'Email Address', field: 'Email Address', exportCsvForceToKeepAsString: true, sortable: true },
      { id: 'MobileNumber', name: 'Mobile Number', field: 'Mobile Number', exportCsvForceToKeepAsString: true, sortable: true },
      
    ];

   

    this.gridOptions = {
      asyncEditorLoading: false,
      autoResize: {
        containerId: 'grid-container',
      },
      enableAutoResize: true,
      editable: true,
      enableColumnPicker: true,
      enableCellNavigation: true,
      enableRowSelection: true,
      enableCheckboxSelector: true,
      enableFiltering: true,
      showHeaderRow: false,
      rowSelectionOptions: {
        // True (Single Selection), False (Multiple Selections)
        selectActiveRow: false
      },
      checkboxSelector: {
        // remove the unnecessary "Select All" checkbox in header when in single selection mode
        hideSelectAllCheckbox: false
      },
      datasetIdPropertyName: "Id"
    };

  }
  angularGridReady1(angularGrid: AngularGridInstance) {
    this.migrationGridInstance = angularGrid;
    this.grid1 = angularGrid && angularGrid.slickGrid || {};

  }



  newDownload() {
    this.loadingScreenService.startLoading();
    this.onboardingApi.getCandidateViewsDetails().subscribe((response) => {

      console.log(response);

      this.excelService.exportAsExcelFile(response.Result[0].GeneralData, 'GeneralDetails');
      this.excelService.exportAsExcelFile(response.Result[0].SalaryData, 'SalaryDetails');
      this.loadingScreenService.stopLoading();
    }, (error) => {
      this.loadingScreenService.stopLoading();
    });
   
  }
  onSelectedRowsChanged(data, args) {
    console.log(args);

    this.selectedmigrationRecords = [];
    if (args != null && args.rows != null && args.rows.length > 0) {
      for (let i = 0; i < args.rows.length; i++) {
        this.selectedmigrationRecords.push(this.datasetview1[args.rows[i]]);
      }
    }
    console.log(this.selectedmigrationRecords);
  }
  newMigrate() {
    if (this.selectedmigrationRecords.length != 0) {

      $('#popup_ReportMigrate').modal('show');
    }
    else {
      this.alertService.showWarning("Please select at least one employee to migrate");

    }
    
  }
  modal_dismiss() {

    $('#popup_ReportMigrate').modal('hide');
    this.migrationGridInstance.gridService.clearAllFiltersAndSorts();
    this.newClickHere();
}

  confirmMigrate() {
console.log('nn',this.selectedmigrationRecords);
    this.selectedmigrationRecords.forEach(element => {
      
      this.LstEmployeeReportMigration.push({
        EmployeeId: element['Employee Number'],
        EmployeeCode:element['Employee Number'],
        IsMigrated: 1,
        Id: 0,
      
      }

      )
    });
    
    console.log('cc',this.LstEmployeeReportMigration);
    this.MigratedCandidateDetailsList.LstMigratedCandidateDetails=this.LstEmployeeReportMigration;
    var request_param = JSON.stringify(this.MigratedCandidateDetailsList);
    console.log('ok',request_param)
    this.onboardingApi.postMigrateEmployeeReport(request_param).subscribe((data: any) => {

      // this.spinnerEnd();
      console.log(data);

      if (data.Status) {

       // this.activeModal.close();
        $('#popup_ReportMigrate').modal('hide');
        this.alertService.showSuccess(data.Message);
        this.selectedmigrationRecords= [];
        this.LstEmployeeReportMigration=[];
        this.newClickHere();
      } else {

        this.alertService.showInfo(data.Message);
        $('#popup_ReportMigrate').modal('hide');
        this.selectedmigrationRecords= [];
        this.LstEmployeeReportMigration=[];
        this.newClickHere();
      }
    },
      (err) => {
        // this.spinnerEnd();      
        this.alertService.showWarning(`Something is wrong!  ${err}`);
        console.log("Something is wrong! : ", err);
        $('#popup_ReportMigrate').modal('hide');
        this.selectedmigrationRecords= [];
        this.LstEmployeeReportMigration=[];
        this.newClickHere();
      });
  }
}
