import { BaseModel } from "../Common/BaseModel";
import { UIMode } from "../UIMode";
import { ExpenseClaimRequestStatus } from "./ExpenseEligibilityCriteria";

export class ExpenseClaimRequest extends BaseModel {
    ApprovedLevel: number;
    Status: ExpenseClaimRequestStatus;
    Remarks: string;
    TimeCardId: number;
    ModuleProcessTransactionId: number;
    ApproverUserId: number;
    TravelRequestReferenceId: number;
    DocumentDate: string;
    ModeType: UIMode;
    DocumentNumber: string;
    ExpenseToDate: string;
    ExpenseFromDate: string;
    ExpenseIncurredDate: string;
    ApprovedAmount: number;
    RequestedAmount: number;
    ProductId: number;
    ExpenseBatchId: number;
    EmployeeId: number;
    DocumentId: number;
    DocumentName: string;
}