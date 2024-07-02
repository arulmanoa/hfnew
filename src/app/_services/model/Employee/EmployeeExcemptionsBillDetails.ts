import { ApprovalStatus } from "../Candidates/CandidateDocuments";
import { BaseModel, UIMode } from "../Common/BaseModel";

export class EmployeeExemptionBillDetails extends BaseModel {

    

    EmployeeId: number;

    FinancialYearId: number;

    ProductId: number;

    BillAmount: number;

    BillNumber: string;

    BillDate: Date | string | null;


    BillId: number;


    FileName: string;


    Remarks: string;

    EmployeeTaxExemptionId: number;

    ApprovedAmount: number | null;


    ApprovedBy: string;

    ApprovedOn: Date | string | null;

    Status: any;
    ApprovalStatus : ApprovalStatus

    RejectedBy: string;

    RejectedOn: Date | string | null;


    RejectedRemarks: string;
 
    Modetype: UIMode;
}
