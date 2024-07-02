import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AngularGridInstance } from 'angular-slickgrid';
import { Subject } from 'rxjs';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { LoginResponses } from 'src/app/_services/model';
import { apiResponse } from 'src/app/_services/model/apiResponse';
import { AlertService, EmployeeService, FormLayoutService, PagelayoutService, SessionStorage } from 'src/app/_services/service';
import Swal from 'sweetalert2';
import { FormLayout } from '../../generic-form/form-models';
import { AccordianToggleType } from '../../personalised-display/enums';
import { PageLayout, SearchBarAccordianToggle } from '../../personalised-display/models';
import moment from 'moment';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-confirm-separation',
  templateUrl: './confirm-separation.component.html',
  styleUrls: ['./confirm-separation.component.css']
})
export class ConfirmSeparationComponent implements OnInit {

  readonly confirmSeparationPageLayoutCode: string = 'confirmSeparation'
  readonly confirmSeparationFormLayoutCode: string = 'confirmSeparation'


  confirmSeparationPageLayout: PageLayout;
  confirmSeparationFormLayout: FormLayout;
  confirmSeparationForm: FormGroup;
  dataset: any[] = [];
  grid: AngularGridInstance;
  gridObj: any;
  dataViewObj: any;
  spinner: boolean = false;
  BusinessType: any;

  sessionDetails: LoginResponses;
  toggleAccordianSubject: Subject<SearchBarAccordianToggle> = new Subject<SearchBarAccordianToggle>();
  selectedItems: any[] = [];
  resultList: any[];

  myForm: FormGroup;

  constructor(
    private pageLayoutService: PagelayoutService,
    private formLayoutService: FormLayoutService,
    public sessionService: SessionStorage,
    private loadingScreenService: LoadingScreenService,
    private alertService: AlertService,
    private router: Router,
    private employeeService: EmployeeService,
    private fb: FormBuilder

  ) { }

  ngOnInit() {

    this.myForm = this.fb.group({
      EmployeeName : [''],
      EmployeeCode : [''],
      LDA: ['', Validators.required],
      Remarks: ['', Validators.required],
      GenerateLetters: [false],
      SendMailToEmployee: [false],
      CCMailIds: ['', [this.commaSeparatedEmailsValidator]],
      Id: 0
    });



    this.sessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses)); // Get the whole matched session element set as a clean json(array) via an session object
    this.BusinessType = this.sessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this.sessionDetails.Company.Id).BusinessType;


    this.pageLayoutService.getPageLayout(this.confirmSeparationPageLayoutCode).subscribe(data => {
      console.log(data);
      if (data.Status === true) {
        this.confirmSeparationPageLayout = data.dynamicObject;
      }
      else {
        this.confirmSeparationPageLayout = null;
      }

      if (this.confirmSeparationPageLayout === undefined || this.confirmSeparationPageLayout === null) {
        this.alertService.showWarning("Something went wrong! Please contact support!");
        this.router.navigate(['app/dashboard']);
      }

      if (this.BusinessType !== 3) {
        this.pageLayoutService.fillSearchElementsForSME(this.confirmSeparationPageLayout.SearchConfiguration.SearchElementList);
        console.log("Search Elemets::", this.confirmSeparationPageLayout.SearchConfiguration.SearchElementList);
      }


    }, error => {
      console.error(error);
    });

    this.formLayoutService.getFormLayout(this.confirmSeparationFormLayoutCode).subscribe(data => {

      if (data.Status === true) {
        this.confirmSeparationFormLayout = data.dynamicObject;
        console.log("Form Layout ::", this.confirmSeparationFormLayout);
      }
      else {
        this.confirmSeparationFormLayout = null;
      }

      if (this.confirmSeparationFormLayout === undefined || this.confirmSeparationFormLayout === null) {
        this.alertService.showWarning("Something went wrong! Please contact support!");
        this.router.navigate(['app/dashboard']);
      }

    }, error => {
      console.error(error);
    });

  }

  onClickingSearchButton() {

    this.toggleAccordianSubject.next({ Type: AccordianToggleType.hide, ChangeAccordianText: true });

    this.getDataset();
  }

  getDataset() {

    this.spinner = true;
    this.dataset = [];

    this.pageLayoutService.getDataset(this.confirmSeparationPageLayout.GridConfiguration.DataSource,
      this.confirmSeparationPageLayout.SearchConfiguration.SearchElementList).subscribe(data => {
        this.spinner = false;
        if (data !== undefined && data !== null && data.Status && data.dynamicObject !== "") {
          this.dataset = JSON.parse(data.dynamicObject);
        }
      }, error => {
        this.spinner = false;
        console.error(error);
      })
  }

  confirmSeparation() {
    if (this.selectedItems.length > 0 && this.selectedItems.length == 1 && 'LWD' in this.selectedItems[0]) {
      this.myForm.controls['LDA'].setValue(new Date(this.selectedItems[0].LWD));
    }
    this.myForm.controls['EmployeeName'].setValue(this.selectedItems[0].EmployeeName)
    this.myForm.controls['EmployeeCode'].setValue(this.selectedItems[0].EmployeeCode)

    $('#popup_dynamicForm').modal('show');
  }

  onSearchBarAccordianChange(event) {
    console.log("search bar changed ::", event);
    if (event === 'collapse') {
      if (this.grid !== undefined && this.grid !== null) {
        this.grid.resizerService.resizeGrid();
      }
    }
  }

  onGridCreated(angularGrid: AngularGridInstance) {
    this.grid = angularGrid;
    this.gridObj = angularGrid && angularGrid.slickGrid || {};
    this.dataViewObj = angularGrid.dataView;
  }

  onSelectedRowsChanged(event) {
    // console.log("Event ::" , event);
    let args = event.detail.args;

    this.selectedItems = [];

    if (args != null && args.rows != null && args.rows.length > 0) {
      for (let i = 0; i < args.rows.length; i++) {
        var row = args.rows[i];
        var row_data = this.dataViewObj.getItem(row);
        this.selectedItems.push(row_data);
      }
    }
    console.log('selected ::', this.selectedItems);
  }

  onFormCreated(formGroup: FormGroup) {
    this.confirmSeparationForm = formGroup;

    // this.confirmSeparationForm.patchValue(
    //   {
    //     LDA : '',
    //     GenerateLetters : false,
    //     MailEmployee : false
    //   }
    // )

    console.log("Form Group ::", this.confirmSeparationForm);
  }

  submitForm() {

    let submitObj = this.myForm.value;
    let employeeCodes = this.selectedItems.map(x => x.EmployeeCode);
    submitObj.LDA = moment(submitObj.LDA).format('YYYY-MM-DD');
    submitObj["EmployeeCodes"] = employeeCodes;
    console.log("Submit obj ::", submitObj);

    if (this.myForm.valid) {
      console.log('Form Submitted', this.myForm.value);
    } else {
      console.log('Form is invalid');
      this.alertService.showWarning('Please fill out the form correctly.');
      return;
    }
    // let submitObj = this.confirmSeparationForm.value;

    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: true,
    })

    swalWithBootstrapButtons.fire({
      title: 'Confirm?',
      text: "Are you sure you want to proceed?",
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ok!',
      cancelButtonText: 'No, cancel!',
      allowOutsideClick: false,
      reverseButtons: true
    }).then((result) => {
      console.log(result);

      if (result.value) {

        this.loadingScreenService.startLoading();
        this.resultList = [];
        this.employeeService.ConfirmSeparation(submitObj).subscribe(data => {
          this.loadingScreenService.stopLoading();
          console.log(data);
          if (data.Status) {
            this.alertService.showSuccess("Uploaded successfully");
            this.resultList = JSON.parse(data.Result);
            this.modal_dismiss_Form();
            $('#popup_displayResult').modal('show');
          }
          else {
            this.alertService.showWarning("Error Occured!");
          }
        })

      } else if (result.dismiss === Swal.DismissReason.cancel) {

        swalWithBootstrapButtons.fire(
          'Cancelled',
          'Your request has been cancelled',
          'error'
        )
      }
    })



  }

  modal_dismiss_Form() {
    $('#popup_dynamicForm').modal('hide');

  }

  modal_dismiss_displayResult() {
    $('#popup_displayResult').modal('hide');
  }

  commaSeparatedEmailsValidator(control: AbstractControl): { [key: string]: boolean } | null {
    if (control.value) {
      const emails = control.value.split(',');
      const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
      for (const email of emails) {
        if (!emailPattern.test(email.trim())) {
          return { 'invalidEmail': true };
        }
      }
    }
    return null;
  }


}
