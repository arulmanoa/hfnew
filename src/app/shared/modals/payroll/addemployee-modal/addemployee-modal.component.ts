import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { PayrollService } from 'src/app/_services/service/payroll.service';
import { apiResult } from 'src/app/_services/model/apiResult';
import { TimeCardStatus } from '../../../../_services/model/Payroll/TimecardStatus';
import { AlertService } from 'src/app/_services/service/alert.service';


@Component({
  selector: 'app-addemployee-modal',
  templateUrl: './addemployee-modal.component.html',
  styleUrls: ['./addemployee-modal.component.css']
})
export class AddemployeeModalComponent implements OnInit {

  @Input() CoreJson: any;
  @Input() ContentArea: any;
  selectAll;
  isrendering_spinner: boolean = false;
  LstEmployees: any[] = [];
  searchText: any;
  
  selectedEmployees = [];
  constructor(
    private activeModal: NgbActiveModal,
    private payrollService: PayrollService,
    private alertService: AlertService

  ) { }

  ngOnInit() {
    this.searchText = null;
    this.isrendering_spinner = true;
    this.CoreJson = JSON.parse(this.CoreJson);
    console.log(this.CoreJson);
    this.ContentArea === "Payinput" ? this.get_AdditionalTimeCardDetails() : this.get_EmployeeList_forPayout();
  }

  get_AdditionalTimeCardDetails() {

    this.payrollService.get_AdditionalTimeCardDetails(this.CoreJson.clientcontractId, 
      this.CoreJson.payperiodId , this.CoreJson.ProcessCategory)
      .subscribe((result) => {
        console.log(result);
        const apiResult: apiResult = result;
        if (apiResult.Status) {
          this.LstEmployees = apiResult.Result as any;
          this.LstEmployees.forEach(element => {
            element["isSelected"] = false;
            element['Id'] = element.TimeCardId;
            element['id'] = element.TimeCardId;
            element['EmployeeCode'] = element.Employeecode;
            element['Status'] = element.Status;
            element['StatusCode'] = element.TimecardStatus;
          });
          this.isrendering_spinner = false;

        } else {
          this.isrendering_spinner = false;
        }
      })

  }

  get_EmployeeList_forPayout() {

    this.payrollService.get_EmployeePayOutDetails(this.CoreJson.clientcontractId, this.CoreJson.payperiodId)
      .subscribe((result) => {
        console.log('rsult', result);
        let apiResult: apiResult = result;
        if (apiResult.Status) {
          this.LstEmployees = apiResult.Result as any;
          console.log('length :', this.LstEmployees.length);
          this.LstEmployees.forEach(element => {
            element["isSelected"] = false;
            element['Id'] = element.TimeCardId;
            element['id'] = element.TimeCardId;
            element['EmployeeCode'] = element.EmployeeId;
            element['Status'] = '';

          });
          this.isrendering_spinner = false;

        } else {
          this.isrendering_spinner = false;
        }
      })
  }

  change(obj, event) {

    let updateItem = this.selectedEmployees.find(this.findIndexToUpdate, obj.Id);

    let index = this.selectedEmployees.indexOf(updateItem);

    console.log(index);

    if (index > -1) {
      this.selectedEmployees.splice(index, 1);
    }
    else {
      this.selectedEmployees.push(obj);
    }

    if (this.LstEmployees.length === this.selectedEmployees.length) {
      this.selectAll = true;
    }
    else {
      this.selectAll = false;
    }
  }

  selectAllEmp(event) {
    console.log('event', event);

    this.LstEmployees.forEach(e => {
      event.target.checked == true ? e.isSelected = true : e.isSelected = false;
    });
    if (event.target.checked) {
      this.LstEmployees.forEach(e => {
        this.selectedEmployees.push(e);
      });
    } else {
      this.selectedEmployees = [];
    }
  }

  findIndexToUpdate(obj) {
    return obj.Id === this;
  }



  Confirm() {

    console.log(this.selectedEmployees);

    if (this.selectedEmployees.length > 0) {
      if(this.CoreJson.BusinessType == 3){
      this.alertService.confirmSwal1("Confirmation!", "If the employee(s) is/are added, associated sale order(s) will be voided and new sale order(s) will be created", "Yes, Create", "No, Do not create").then(result => {
        this.payrollService.get_ValidateRecreateSo(this.CoreJson.PayrunId)
          .subscribe((result) => {
            let apiResult: apiResult = result;
            if (apiResult.Status) {
              let jobj = JSON.parse(apiResult.Result);
              console.log('jobj', jobj);
              if (jobj[0].IsValid != true && jobj[0].IsPayOutExists != false) {
                this.alertService.showWarning(jobj[0].Message);
                return;
              }else {
              this.activeModal.close(JSON.stringify({LstOfItems : this.selectedEmployees, isCreate: true}))

              }

            }
          }, err => {

          })
      }).catch(error => {
        this.activeModal.close(JSON.stringify({LstOfItems : this.selectedEmployees, isCreate: false}))
      });
    }else {
      this.activeModal.close(JSON.stringify({LstOfItems : this.selectedEmployees, isCreate: false}))

    }
    } else { this.alertService.showWarning("No record!") }
  }

  closeModal() {
    this.activeModal.close('Modal Closed');
  }
}
