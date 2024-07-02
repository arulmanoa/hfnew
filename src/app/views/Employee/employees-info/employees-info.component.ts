import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { AlertService } from '@services/service/alert.service';
import { EmployeeService } from '@services/service/employee.service';
import { OnboardingService } from '@services/service/onboarding.service';
import { LoginResponses } from '../../../_services/model/Common/LoginResponses';
import { SessionStorage } from '../../../_services/service//session-storage.service';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-employees-info',
  templateUrl: './employees-info.component.html',
  styleUrls: ['./employees-info.component.scss']
})
export class EmployeesInfoComponent implements OnInit, OnDestroy {
  private onboardingSubscription: Subscription;

  _loginSessionDetails: LoginResponses;
  employees: any[] = [];
  onboardingAdditionalInfo: any;
  employeeForm: any;
  sortOrder: string = '';
  sortColumn: string;
  spinner: boolean = false;
  spinnerForInitialAPICall : boolean = false;
  currentPage = 1;
  pageNumber: number = 1;
  searchText: any;
  clickedColumn: string = '';
  BusinessType: any;
  ClientId: any = 0;
  ClientContractId: any;
  clientLogoLink: any;
  clientminiLogoLink: any;
  isSearchPerformed = false;
  countResult:any;



  constructor(private employeeService: EmployeeService,
    public onboardingService: OnboardingService,
    private alertService: AlertService,
    private formBuilder: FormBuilder,
    public sessionService: SessionStorage,
  ) { }

  ngOnInit(): void {
    this.spinnerForInitialAPICall = true;
    this._loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses));
    this.BusinessType = this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping != null ? this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this._loginSessionDetails.Company.Id).BusinessType : 0;
    const clientId = this.BusinessType == 3 ? 0 : this.sessionService.getSessionStorage("default_SME_ClientId") || 0;
    const clientContractId = this.BusinessType == 3 ? 0 : this.sessionService.getSessionStorage("default_SME_ContractId") || 0;

    this.createReactiveForm();
    this.onboardingSubscription = this.onboardingService.GetOnboardingAdditionalInfo(clientId, clientContractId).subscribe((response: any) => {
      this.spinnerForInitialAPICall = false;
      if (response.Status) {
        this.onboardingAdditionalInfo = JSON.parse(response.Result);
        console.log('Additional Info :: ', this.onboardingAdditionalInfo);
      }
    }, (error) => {
    })
    this.clearForm();
  }


  createReactiveForm() {
    this.employeeForm = this.formBuilder.group({
      EmployeeCode: [],
      EmployeeName: [],
      Designation: [],
      Department: [],
      Division: []
    });
  }


  employeeInfo(searchBy = 'All', searchVal) {
    this.spinner = true;
    this.employeeService.getEmployeeInfo(searchBy, searchVal).subscribe(
      (result) => {
        console.log('EMP INFO DATA ::', result);
        let ans: any = result;
        if (ans && ans.Result) {
          this.employees = JSON.parse(ans.Result);
          this.getSearchResult();
          this.sortOrder = 'desc'
          this.SortData('MemberName');
          this.spinner = false;
      this.isSearchPerformed = true;

        } else {
          console.warn('No result data found');
        }
      },
      (error) => {
        console.error('Error fetching employee info:', error);
      }
    );
  }

  isFilterApplied() {
    return this.employeeForm.get('EmployeeCode').value || this.employeeForm.get('EmployeeName').value || this.employeeForm.get('Designation').value || this.employeeForm.get('Department').value || this.employeeForm.get('Division').value;
  }
  getSearchResult() {
    if (this.searchText != undefined && this.searchText != '') {
      const searchTextLower = this.searchText.toLowerCase();
      this.countResult = this.employees.filter(item => {
        
          const fieldsToFilter = ['MemberName', 'EmailId', 'LocationName', 'Designation', 'Department', 'Division', 'MobileNumber', 'Birthday', 'EmployeeCode', 'ManagerName', 'ManagerCode'];
  
          for (const key of fieldsToFilter) {
              if (item[key] && item[key].toString().toLowerCase().includes(searchTextLower)) {
                  return true;
              }
          }
          return false;
      });
      return this.countResult;
  }
   else {
      return this.employees;
    }

  }

  getFilteredItems() {
    return this.employees.filter(item =>
      item.Name.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  onClickSearch() {
    if (this.employeeForm.get('EmployeeCode').value == null && this.employeeForm.get('EmployeeName').value == null && this.employeeForm.get('Designation').value == null && this.employeeForm.get('Department').value == null && this.employeeForm.get('Division').value == null) {
      // alert('Please enter atleast one field');
      this.alertService.showWarning("Please provide input for at least one field.");
    }
    else {
      const formData = {
        Code: this.employeeForm.get('EmployeeCode').value,
        Name: this.employeeForm.get('EmployeeName').value,
        Designation: this.employeeForm.get('Designation').value,
        Department: this.employeeForm.get('Department').value,
        Division: this.employeeForm.get('Division').value
      };
      console.log('Form Data:', formData);
      this.pageNumber = 1;
      let stringifyData = JSON.stringify(formData);
      this.employeeInfo("All", stringifyData);
      this.searchText='';

      
    }
  }


  clearForm() {
    this.employees = [];
    this.pageNumber = 1;
    this.searchText='';
    this.isSearchPerformed = false;
  }

  SortData(col: string): void {
    this.clickedColumn = col;
    const headers = document.querySelectorAll('.sortable-header');
    headers.forEach(header => header.classList.remove('sorted'));
    if (this.sortColumn == col) {
      if (this.sortOrder == 'asc')
        this.sortOrder = 'desc';
      else
        this.sortOrder = 'asc';
    } else {
      this.sortColumn = col;
      this.sortOrder = 'asc';
    }

    const clickedHeader = document.getElementById(`header-${col.toLowerCase()}`);
    if (clickedHeader) {
      clickedHeader.classList.add('sorted');
    }

    this.employees = this.employees.sort((a, b) => {
      const aValue = a[col] ? a[col].toString().toLowerCase() : '';
      const bValue = b[col] ? b[col].toString().toLowerCase() : '';

      if (aValue < bValue)
        return this.sortOrder == 'asc' ? -1 : 1;
      if (aValue > bValue)
        return this.sortOrder == 'asc' ? 1 : -1;
      return 0;
    });
  }
  



  ngOnDestroy(): void {
    if (this.onboardingSubscription) {
      this.onboardingSubscription.unsubscribe();
    }
  }

}
