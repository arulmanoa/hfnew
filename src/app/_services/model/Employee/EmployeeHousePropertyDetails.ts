import { BaseModel, UIMode } from "../Common/BaseModel";
import { EmployeeInvestmentDeductions, EmployeeInvestmentDocuments } from "./EmployeeInvestmentDeductions";
import { InvestmentLogHistory } from "./EmployeeInvestmentDeductions";

export class EmployeeHousePropertyDetails extends BaseModel
{
    EmployeeId: number;

    FinancialYearId: number | null;

    LetOut: boolean | null;

    GrossAnnualValue: number | null;

    MunicipalTax: number | null;

    InterestAmount: number | null;

    LoanDate: Date | string | null;

    PossessionDate: Date | string | null;

    IsProposed: boolean | null;

    DocumentId: number | null;

    InputsRemarks: string;

    ApproverRemarks: string;

    AddressDetails: string;
    Status: number;
    Modetype: UIMode;
    PreConstructionInterestAmount: number;
    InstallmentNumber: number;
    AddressOfLender: any;
    GrossAnnualValueApprovedAmount: number;
    MunicipalTaxApprovedAmount: number;
    InterestAmountApprovedAmount: number;
    PreConstructionInterestApprovedAmount: number;
    FirstTimeHomeOwner: boolean;
    OwnershipPercentage: number;
    LenderPANNO: any;
    NameOfLender: any;
    PrincipalAmount: number;
    EmployeeInvestmentDocuments: string;
    LstEmployeeInvestmentDocuments: EmployeeInvestmentDocuments[];
    employeeInvestmentDeduction : EmployeeInvestmentDeductions;
    LstInvestmentLogHistory: InvestmentLogHistory[];
    ReferenceId? : number;
}
