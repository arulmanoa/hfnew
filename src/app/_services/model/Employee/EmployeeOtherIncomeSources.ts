import { BaseModel, UIMode } from "../Common/BaseModel";
import { InvestmentLogHistory } from "./EmployeeInvestmentDeductions";

export class EmployeeOtherIncomeSources extends BaseModel
{       

    EmployeeId: number | null;

    FinancialYearId: number | null;

    TotalInterestAmount: number | null;

    OtherIncomeAmount: number | null;

    InterestIncomeBreakupDetails: InterestIncomeBreakup[];

    DocumentId: number | null;

    IsProposed: boolean | null;

    InputsRemarks: string;

    ApproverRemarks: string;

    Status: number | null;

    TotalApprovedInterestAmount: number | null;

    ApprovedOtherIncomeAmount: number | null;

    InterestIncomeType : InterestIncomeType;

    Modetype: UIMode;
    FileName : string;
    LstInvestmentLogHistory: InvestmentLogHistory[];
    ReferenceId? : number;
   
}


export class InterestIncomeBreakup
{
    Narration: string;
    InterestIncomeType: InterestIncomeType;
    Amount: number;
    DocumentId: number;

}

export enum InterestIncomeType {
    SavingAccount=1,
    FixedDeposit=2,
    Other=3
}
