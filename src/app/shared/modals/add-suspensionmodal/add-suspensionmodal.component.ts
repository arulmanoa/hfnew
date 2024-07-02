import { Component, OnInit } from "@angular/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { apiResult } from "src/app/_services/model/apiResult";
import {
  DeductionStatus,
  DeductionType,
  EmployeeDeductions,
  PaymentSourceType,
  SuspensionType,
} from "src/app/_services/model/Employee/EmployeeDeductions";

@Component({
  selector: "app-add-suspensionmodal",
  templateUrl: "./add-suspensionmodal.component.html",
  styleUrls: ["./add-suspensionmodal.component.css"],
})
export class AddSuspensionmodalComponent implements OnInit {
  //#region Intialize Parameters
  paymentSourceTypeList = [];
  deductionTypeList = [];
  deductionStatusList = [];
  suspensionTypeList = [];
  payperiodList = [];
  paymentSourceType = PaymentSourceType;
  deductionSourceType = DeductionType;
  deductionStatus = DeductionStatus;
  suspensionType = SuspensionType;
  employeeDeduction: EmployeeDeductions;
  suspended_CardVisible: boolean = false;
  endStatusList: { Id: number; Name: any }[];
  employeeService: any;
  productList: any;

  //#endregion

  //#region Constructor

  constructor() {}

  //#endregion

  //#region Page load events

  ngOnInit() {}

  //#endregion

  //#region Private Methods

  onChangeSuspension(suspension) {
    if (suspension.Name == "SUSPENSIONPERIOD") {
      this.suspended_CardVisible = true;
    } else {
      this.suspended_CardVisible = false;
    }
  }

  getDeductionControlList() {
    this.paymentSourceTypeList = Object.keys(this.paymentSourceType)
      .map((key) => ({ Id: parseInt(key), Name: this.paymentSourceType[key] }))
      .filter((f) => !isNaN(Number(f.Id)));
    this.deductionTypeList = Object.keys(this.deductionSourceType)
      .map((key) => ({
        Id: parseInt(key),
        Name: this.deductionSourceType[key],
      }))
      .filter((f) => !isNaN(Number(f.Id)));
    this.deductionStatusList = Object.keys(this.deductionStatus)
      .map((key) => ({ Id: parseInt(key), Name: this.deductionStatus[key] }))
      .filter((f) => !isNaN(Number(f.Id)));
    this.suspensionTypeList = Object.keys(this.suspensionType)
      .map((key) => ({ Id: parseInt(key), Name: this.suspensionType[key] }))
      .filter((f) => !isNaN(Number(f.Id)));
    this.endStatusList = Object.keys(this.endStatus)
      .map((key) => ({ Id: parseInt(key), Name: this.endStatus[key] }))
      .filter((f) => !isNaN(Number(f.Id)));

    this.employeeService
      .LoadEmployeeDeductionManagementLookupDetails(this.id)
      .subscribe((result) => {
        let apiresult: apiResult = result;
        let lookUpDetails = JSON.parse(apiresult.Result);
        this.productList = lookUpDetails.EarningProducts;
        this.payperiodList = lookUpDetails.PayperiodList;
        console.log(this.payperiodList);
      });
  }
  endStatus(endStatus: any) {
    throw new Error("Method not implemented.");
  }
  id(id: any) {
    throw new Error("Method not implemented.");
  }
  //#endregion
}
