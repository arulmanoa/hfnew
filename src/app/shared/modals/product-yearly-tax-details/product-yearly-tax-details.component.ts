import { Component, Input, OnInit } from '@angular/core';
import { EmployeeService } from '../../../_services/service/employee.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'lodash';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { SessionStorage } from '../../../_services/service//session-storage.service';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
import { PagelayoutService, AlertService, PayrollService, CommonService, ExcelService } from 'src/app/_services/service';

@Component({
  selector: 'app-product-yearly-tax-details',
  templateUrl: './product-yearly-tax-details.component.html',
  styleUrls: ['./product-yearly-tax-details.component.css']
})
export class ProductYearlyTaxDetailsComponent implements OnInit {
  salaryDetails: any = [];
  months: any = [];
  finalSalaryDetails: any = [];
  MonthArr: any
  employeeDetails: any;
  _loginSessionDetails: any;
  businessType: any;
  financialYear: any


  @Input() employeeId: any;
  @Input() finacialYearId: any;

  constructor(
    public employeeService: EmployeeService,
    private activeModal: NgbActiveModal,
    private excelService: ExcelService,
    private loadingScreenService: LoadingScreenService,
    public sessionService: SessionStorage,

  ) { }



  ngOnInit() {
    this._loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses)); // Get the whole matched session element set as a clean json(array) via an session object
    this.businessType = this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this._loginSessionDetails.Company.Id).BusinessType;

    this.loadingScreenService.startLoading();

    let empid = this.employeeId;
    let finYearId = this.finacialYearId;
    this.financialYear = finYearId == 1 ? "2019-2020" : (finYearId == 2 ? "2020-2021" : (finYearId == 3 ? "2021-2022" : (finYearId == 4 ? "2022-2023" : null)))

    this.employeeService.GetEmployeeYTDDetails(empid, finYearId).subscribe((result) => {
      this.loadingScreenService.stopLoading();
      if (result.Status && result.Result) {
        this.salaryDetails = JSON.parse(result.Result);
        console.log("GetEmployeeYTDDetails", result.Result)
        if (this.salaryDetails && this.salaryDetails.length > 0) {
          this.salaryDetails = _.sortBy(this.salaryDetails, ['ProductTypeId']);
          this.finalSalaryDetails = JSON.parse(JSON.stringify(this.salaryDetails));
          // this.finalSalaryDetails = [...this.salaryDetails]
          this.employeeDetails = { ...this.finalSalaryDetails[0] }
          console.log("employeeDetails", this.employeeDetails);
          this.monthNameModification();


          console.log("finalSalaryDetails", this.finalSalaryDetails);

        }
      }
    });
  }


  convertKeysToShort(arr) {
    let newArr = [], key: any, n: any, keys: any;
    for (let i in arr) {
      keys = Object.keys(arr[i]);
      n = keys.length;
      var newobj = {}, j = 0;
      while (j < n) {
        key = keys[j];
        j++;
        newobj[key.substring(3, 0)] = arr[i][key]
      }
      newArr.push(newobj)
    }
    return newArr
  }
  monthNameModification() {
    let MonthObj = {}
    if (this.salaryDetails && this.salaryDetails.length > 0) {
      MonthObj = { ...this.salaryDetails[0] }
      delete MonthObj['ClientName'];
      delete MonthObj['DOJ'];
      delete MonthObj['Designation'];
      delete MonthObj['EmployeeCode'];
      delete MonthObj['EmployeeName'];
      delete MonthObj['LocationName'];
      delete MonthObj['ProductTypeCode'];
      delete MonthObj['ProductTypeId'];
      delete MonthObj['productId'];
      delete MonthObj['productCode'];
      delete MonthObj['StateName'];
      delete MonthObj['ProductCode'];
      this.MonthArr = Object.keys(MonthObj)


      this.salaryDetails.forEach(element => {
        delete element['ClientName'];
        delete element['DOJ'];
        delete element['Designation'];
        delete element['EmployeeCode'];
        delete element['EmployeeName'];
        delete element['LocationName'];
        delete element['ProductTypeCode'];
        delete element['productId'];
        element['PTY'] = 0
        element['total'] = 0
        _.each(element, function (value, key) {

          if (key == "ProductTypeId") {
            element['PTY'] = element['ProductTypeId'];
          }
          else if (key == "total" || key == "ProductCode" || key == "StateName" || key == "PTY") {
            console.log("test")
          }
          else {
            element['total'] += parseFloat(value)
          }
        })
        _.each(element, function (value, key) {
          if (key == "PTY") {
            if (value == 1)
              element['PTY'] = 1
            else if (value == 2)
              element['PTY'] = 3
            else if (value == 6)
              element['PTY'] = 2
            else if (value == 4)
              element['PTY'] = 5
            else if (value == 20)
              element['PTY'] = 6
          }
        })
        _.each(element, function (value, key) {
          if (value == "GrossDedn") {
            element['PTY'] = 4
          }
        })


        delete element['ProductTypeId'];
      });
      this.salaryDetails = this.convertKeysToShort(this.salaryDetails)
      console.log("this.salaryDetails", this.salaryDetails)
      this.salaryDetails = _.sortBy(this.salaryDetails, ['PTY']);
    }


  }
  monthNameForHeaders() {
    if (this.salaryDetails && this.salaryDetails.length > 0) {
      for (let obj of this.salaryDetails) {
      }
    }
  }
  modal_dismiss() {
    this.activeModal.close('Modal Closed');
  }


  exportAsXLSX(): void {
    let exportExcelDate = [];
    let tableHeaders = this.MonthArr

    let excelData = JSON.parse(JSON.stringify(this.salaryDetails))
if(excelData&&excelData.length>0){
    excelData.forEach(element => {
      element = { "Component": "", ...element }
      _.each(element, function (value, key) {
        if (key == "Pro") {
          element['Component'] = value
        }
        if (tableHeaders && tableHeaders.length > 0) {
          if (key == 'Apr') {
            element[tableHeaders[0]] = value
          }
          else if (key == 'May') {
            element[tableHeaders[1]] = value
          }
          else if (key == 'Jun') {
            element[tableHeaders[2]] = value
          }
          else if (key == 'Jul') {
            element[tableHeaders[3]] = value
          }
          else if (key == 'Aug') {
            element[tableHeaders[4]] = value
          }
          else if (key == 'Sep') {
            element[tableHeaders[5]] = value
          }
          else if (key == 'Oct') {
            element[tableHeaders[6]] = value
          }
          else if (key == 'Nov') {
            element[tableHeaders[7]] = value
          }
          else if (key == 'Dec') {
            element[tableHeaders[8]] = value
          }
          else if (key == 'Jan') {
            element[tableHeaders[9]] = value
          }
          else if (key == 'Feb') {
            element[tableHeaders[10]] = value
          }
          else if (key == 'Mar') {
            element[tableHeaders[11]] = value
          }
          else if (key == "tot") {
            element['Total'] = value
          }
        }
        
      })
      delete element['PTY'];
      delete element['Sta'];
      delete element['Pro'];
      
      if (tableHeaders && tableHeaders.length > 0) {
        delete element['Apr'];
        delete element['May'];
        delete element['Jun'];
        delete element['Jul'];
        delete element['Aug'];
        delete element['Sep'];
        delete element['Oct'];
        delete element['Nov'];
        delete element['Dec'];
        delete element['Jan'];
        delete element['Feb'];
        delete element['Mar'];
        delete element['tot'];
      }



      exportExcelDate.push(element)

    });
    this.excelService.exportAsExcelFile(exportExcelDate, 'salary Details-' + this.financialYear + '-' + this.employeeId);
 
  }
     }
}
