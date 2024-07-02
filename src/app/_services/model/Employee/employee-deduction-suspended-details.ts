import { BaseModel, UIMode } from "../Common/BaseModel";

export interface EmployeeSuspendedDeductions extends BaseModel {
    employeeDeductionManagementId: number;
    employeeDeductionScheduleDetailsId: number;
    employeeId: number;
    payPeriodId: number;
    isSuspended: boolean;
    suspensionType: number;
    suspensionFromPeriodId: number;
    suspensionToPeriodId: number;
    status: DeductionPayItemStatus;
    modetype: UIMode;
}
export enum DeductionPayItemStatus {
  Pending,
  Deducted,
  Suspended,
  CarryForward,
}

