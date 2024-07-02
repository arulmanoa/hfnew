import { BaseModel, UIMode } from "../Common/BaseModel";
import { EmployeeInvestmentDocuments } from "./EmployeeInvestmentDeductions";
import { InvestmentLogHistory } from "./EmployeeInvestmentDeductions";

export class EmployeeHouseRentDetails extends BaseModel
{
    EmployeeId: number;

    FinancialYearId: number;

    StartDate: Date | string;

    EndDate: Date | string;

    RentAmount: number;

    ApprovedAmount: number | null;

    AddressDetails: string;

    IsMetro: boolean;

    IsProposed: boolean;

    LandLordDetails: LandLordDetails;

    DocumentId: number;

    InputsRemarks: string;

    ApproverRemarks: string;

    Status: number;

    Modetype: UIMode;
    UIData   : any;
    EmployeeInvestmentDocuments: string;
    LstEmployeeInvestmentDocuments: EmployeeInvestmentDocuments[];
    LstInvestmentLogHistory: InvestmentLogHistory[];
    ReferenceId? : number;
}

export class LandLordDetails
{
    Name: string;
    AddressDetails: string;
    PAN: string;       

}

