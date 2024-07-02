import { BaseModel, UIMode } from "../Common/BaseModel";
import { DeductonPayItemStatus } from "./EmployeeDeductions";

export class EmployeeDeductionScheduleDetails extends BaseModel {
  EmployeeId: number;
  EmployeeDeductionManagementId: number;
  IsSettlementDeduction: boolean;
  InstallmentPeriodId: number;
  InstallmentMonth: number;
  InstallmentYear: number;
  OpeningBalanceAmount: number;
  InstallmentAmount: number;
  ClosingBalance: number;
  IsDeducted: boolean;
  InterestPercentage: number;
  InterestAmount: number;
  IsCarryForwarded: boolean;
  CarryForwardedPeriodId: number;
  CarryForwardedMonth: number;
  CarryForwardedYear: number;
  DeductionPeriodId: number;
  DeductionPeriodName: string;
  DeductionPayitemId: number;
  IsExternalSystemDeducted: boolean;
  status: DeductonPayItemStatus;
  Modetype: UIMode;
  Select_Val?: boolean;
  IsSuspended?: boolean;
  IsPermanentSuspension?: boolean;
  Remarks?: string;

}

export enum DeductionPayItemStatus {
  Pending,
  Deducted,
  Suspended,
  CarryForward,
}
