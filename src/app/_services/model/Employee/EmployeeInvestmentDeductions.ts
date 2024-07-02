import { ApprovalStatus } from "../Candidates/CandidateDocuments";
import { BaseModel, UIMode } from "../Common/BaseModel";


export class EmployeeInvestmentDeductions extends BaseModel {
    EmployeeId: number | null;

    FinancialYearId: number | null;

    ProductID: number | null;

    CLAIMINGSEVEREDISABILITY: boolean;

    IsDifferentlyabled: boolean;

    Amount: number;

    Details: string;

    IsProposed: boolean | null;

    InputsRemarks: string;

    ApprovedAmount: number | null;

    ApproverRemarks: string;

    Status: number | null;

    DocumentId: number;

    LstEmpInvDepDetails: EmployeeInvesmentDependentDetails[];

    Modetype: UIMode;
    EmployeeInvestmentDocuments: string;
    LstEmployeeInvestmentDocuments: EmployeeInvestmentDocuments[];
    LstInvestmentLogHistory: InvestmentLogHistory[];
    EHPId? : number;
    ReferenceId? : number;

}

export class EmployeeInvestmentDocuments {

    EmployeeId: number;
    ProductId: number;
    DocumentNumber: string;
    Date: any;
    DocumentId: number;
    FileName: string;
    Amount : number;
    ApprovedAmount : number;
    FromDate : any;
    ToDate : any;
    OtherInfo : string;    
    Status: InvestmentStatus;
    Remarks: string;
    Url?: any;


}
export class InvestmentLogHistory {
    DeclaredAmount: number;
    DeclaredRemarks: string;
    DeclaredBy: number;
    DeclaredOn: string;
    ApprovedAmount: number;
    ApproverRemarks: string;
    ApprovedBy: number;
    ApprovedOn: string;
}

export enum InvestmentStatus
{
    Pending = 0,
    Approved = 1,
    Rejected = 2,
    InActive = 3

}


export class EmployeeInvesmentDependentDetails extends BaseModel {

    EmpInvestmentDeductionId: number;

    EmployeeId: number;

    DependentType: any;

    DisabilityPercentage: any;

    DependentAge: any;

    Relationship: any;

    DependentName: string;

    DependentDateOfBirth: Date | string;

    Amount: number;

    Details: string;

    InputsRemarks: string;

    ApprovedAmount: number;

    ApproverRemarks: string;

    Status: number;

    DocumentId: number;

    Modetype: UIMode;

}






