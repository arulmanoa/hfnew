import { BaseModel, UIMode } from "../Common/BaseModel";
import { EmployeeDeductionScheduleDetails } from "./employee-deduction-schedule-details";
import { EmployeeSuspendedDeductions } from "./employee-deduction-suspended-details";

export class EmployeeDeductions {
  Id: number;

  EmployeeId: number;

  EmployeeCode: string;

  EmployeeName: string;

  ClientId: number;

  ClientName: string;

  ApprovedId: number;

  ApproverName: string;

  PaymentType: PaymentSourceType;

  PaymentTypeName: string;//PaymentType string name

  AdhocPaymentId: number;

  ExternalReferenceId: string;

  PaymentDate: Date | string;

  PaymentAmount: number;

  DeductionProductId: number;

  DeductionProductName: string;

  DeductionProduct: number;

  AccountNo: string;

  BankBranchCode: string;

  PayPeriodId: number = 0;

  PayperiodName: string;

  IntegrationOn: Date | string;

  IsIntegrationSucess: boolean;

  IsPerquisiteApplicable: boolean;

  PerquisitePercentage: number;

  DeductionType: DeductionType;//(deduction schedule)

  DeductionTypeId: number;

  DeductionTypeName: string;

  PayCycleId: number = 0;//payperiodid

  PayCycle: string;

  StartPeriodId: number;

  StartMonth: number;

  StartYear: number;

  EndStatus: EndStatus;//(deduction type)

  EndStatusName: string;

  EndPayPeriodId: number;

  EndMonth: number;

  EndYear: number;

  NoOfOccurrences: number = 0;

  RemainingOccurences: number;

  AfterDeductionAmount: number;//(Total Deduction amount)

  BalanceDeductionAmount: number;

  SuspensionType: SuspensionType;

  SuspensionTypeName: string;

  SuspensionTypeId: number;

  SuspensionFromPeriodId: number;

  SuspensionToPeriodId: number;

  SuspensionRemarks: string;

  RepaymentDate: Date | string;

  RePaymentReferrence: string;

  AmountRepaid: number;

  IsCarryForwarded: boolean;

  Status: DeductionStatus;

  Modetype: UIMode;

  EmployeeDednScheduleDetails: Array<EmployeeDeductionScheduleDetails>;

  IsDeductionAgainstPayment: boolean;

  TotalDeductionAmount: number;

  EmployeeSuspndDeductions: any;

  checkIsAllDeducted?: boolean;
  
  checkIsAllSuspended?: boolean;
}


export enum DeductonPayItemStatus {
  // Deducted,
  // Suspended,
  // CarryForward,
  Pending,
  Deducted,
  Suspended,
  CarryForward
}

export enum PaymentSourceType {
  Loan,
  SalaryAdvance,
  FestivalAdvance,
  ExternalPayment,
  //EarlySalary,
  //RefineSalaryPayment,
  OverPayment,
  ReimbPayment,
  Asset,
}

export enum DeductionType {
  CurrentPayrollCycle = 0,
  NextPayrollCycle = 1,
  //CurrentReimbCycle = 2,
  //NextReimbCycle =3,
  CalendarBased = 4,//schedulebased
  OnSettlement = 5
}

export enum DeductionStatus {
  ACTIVE = 0,
  INACTIVE = 1,
  HISTORY = 2,
  HOLD = 3,
  PENDING = 4,
}

export enum EndStatus {
  NOENDDATE = 0,
  //ENDPAYPERIOD = 1,
  NOOFOCCURRENCES = 2,
  FIXEDAMOUNT = 3,
  ENDINGPERIOD = 4,
  OnSettlement = 5
}

// export enum SuspensionType {
//   NOSUSPENSION = 0,
//   SUSPENSIONINDEFINITELY = 1,
//   SUSPENSIONPERIOD = 2,
// }
export enum SuspensionType {
 // SUSPEND_FOREVER = 1,//  1.Suspend forever 
  SUSPEND_NEXT_PERIOD = 2,// 2.Include in to next pay period 
  SUSPEND_NEW_PERIOD = 3,//3. Add a new installment 
  SUSPEND_BETWEEN_PERIOD = 4 // 4. Suspend between periods
}
