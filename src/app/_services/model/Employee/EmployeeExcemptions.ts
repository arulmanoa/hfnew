import { ApprovalStatus } from "../Candidates/CandidateDocuments";
import { BaseModel, UIMode } from "../Common/BaseModel";
import { InvestmentLogHistory } from "./EmployeeInvestmentDeductions";

export class EmployeeExemptionDetails extends BaseModel {
    Id: number;
    BillId:number;
    EmployeeId: number;
    FinancialYearId: number;
    ProductId: number;
    BillAmount: number;
    Remarks: string;
    ApproverRemarks: string;
    IsProposed: boolean | null;
    ApprovedAmount: number | null;
    Status: number | null;
    DocumentId: number;
    BillNumber:string;
    RejectedRemarks:string;
    BillDate:Date;
    Modetype: UIMode;
    FileName:string;
    ApprovalStatus : ApprovalStatus;
    EmployeeTaxExemptionId : number;
    LstInvestmentLogHistory: InvestmentLogHistory[];
    LstTravellerDetails?: any[];
    
}


export class InvestmentInfo {
    TaxDeclaration: any;
    FinancialDetails: any;
    TaxItems: any;
    ApplicableExemptionProducts : any;
    InvestmentSubmissionSlotList : any;
    CurrentFinancialYearId: number;

  }