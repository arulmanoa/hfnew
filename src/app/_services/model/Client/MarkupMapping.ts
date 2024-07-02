import { SourceType } from "../Candidates/CandidateOfferDetails";
import { BaseModel, UIMode } from "../Common/BaseModel";
import { ProcessCategory } from "../Payroll/PayRun";

export class MarkupMapping extends BaseModel
{

    MarkupType: MarkupType;
    ProcessCategory: ProcessCategory;
    CompanyId: number;
    ClientId: number;
    ClientContractId: number;
    TeamId: number;
    EmployeeId: number;
    EffectiveDate: Date | string;
    EffectivePeriodId: number;
    MarkupDetailsId: number;
    MarkupParameter: string;
    IsPeriodWiseCalculationRequired: boolean;
    Status: number;
    SourceType : SourceType ;
    ModeType: UIMode

   
}

export enum MarkupType
{
    FixedAmount = 0,
    Percentage = 1,
    ManMonth = 2,
    Scale = 3
}