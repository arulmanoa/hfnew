import { ApprovalStatus } from "../Candidates/CandidateDocuments";
import { BaseModel, UIMode } from "../Common/BaseModel";
import { InvestmentLogHistory } from "./EmployeeInvestmentDeductions";

export class EmployeeTaxExemptionDetails extends BaseModel {

    EmployeeId: number;

    FinancialYearId: number;

    ProductId: number;

    Amount: number;

    InputsRemarks: string;

    ApproverRemarks: string;

    IsProposed: boolean | null;

    ApprovedAmount: number | null;

   
    Status: number | null;

    DocumentId: number;             

    Modetype: UIMode;

    EmployeeExemptionBillDetails: string;

    LstEmployeeExemptionBillDetails: EmployeeExemptionBillDetails[];
    LstInvestmentLogHistory: InvestmentLogHistory[];
}

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

        IsProposed?: boolean | null;
        LstEmployeeExemptionBillDetails: EmployeeExemptionBillDetails[];
        LstInvestmentLogHistory: InvestmentLogHistory[];
         LstTravellerDetails?: any[];
         EmployeeJourneyId : number;
    }