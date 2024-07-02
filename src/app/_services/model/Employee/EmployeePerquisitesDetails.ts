import { BaseModel } from "../Common/BaseModel";
import { UIMode } from "../UIMode";

export class EmployeePerquisitesDetails extends BaseModel {
    EmployeeId: number;
    FinancialYearId: number;
    ProductId: number;
    ApprovedAmount: number;
    ApproverRemarks: string;
    DocumentId: number;
    Modetype: UIMode;
    Status: number | null;
    FileName : string;
}