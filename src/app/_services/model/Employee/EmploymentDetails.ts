import { ApprovalStatus } from "../Candidates/CandidateDocuments";
import { BaseModel, UIMode } from "../Common/BaseModel";

export class EmploymentDetails extends BaseModel
{       
    EmployeeId: number | null;

    FinancialYearId: number;

    CompanyName: string;

    StartDate: Date | string | null;

    EndDate: Date | string | null;

    GrossSalary: number | null;

    PreviousPT: number | null;

    PreviousPF: number | null;

    TaxDeducted: number | null;

    StandardDeduction: number;

    IsProposed: boolean;

    DocumentId: number | null;

    InputsRemarks: string;

    ApproverRemarks: string;

    Status: number | null;

    Modetype: UIMode;

    FileName : string;
    ApprovalStatus : ApprovalStatus;

    ApprovedGrossSalary: number | null;

    ApprovedPreviousPT: number | null;

    ApprovedPreviousPF: number | null;

    ApprovedTaxDeducted: number | null;

    ApprovedStandardDeduction: number;
}

