import { SalaryBreakUpType } from "../PayGroup/PayGroup";
import { BaseModel } from "../Common/BaseModel";
import { UIMode } from "../Common/LoginResponses";
import { PaymentType } from "../Base/HRSuiteEnums";

export class CandidateRateset extends BaseModel {
    CandidateId: number;
    CandidateOfferId: number;
    PayGroupdId: number;
    EffectiveDate: string;
    IsMonthlyValue: boolean;
    SalaryBreakUpType: SalaryBreakUpType;
    Salary: number;
    IsLatest: boolean;
    IsInsuranceApplicable: boolean;
    InsuranceId: number;
    MonthlySalary: number;
    AnnualSalary: number;
    InsuranceAmount: number;
    IsOveridable: boolean;
    Status: number;
    LstRateSet: RatesetProduct[];
    Modetype: UIMode;
    AnnualCTC?: number;
    AnnualNTH? : number;
    AnnualGross? : number;
    MonthlyCTC? : number;
    MonthlyNTH?: number;
    MonthlyGross? : number;
    PaymentType?: number;
    WageType: RateType;
    PayableRate?: number;
    BillableRate?: number;
    additionalApplicableProducts ?: AdditionalPaymentProducts;
    MinimumWagesApplicability?: MinimumWagesApplicableProducts;
}

export class RatesetProduct
{

    Id: number;

    EmployeeRatesetId: number;

    EmployeeId: number;

    ProductId: number;

    ProductCode: string;

    DisplayName: string;

    Value: number;

    IsOveridable: boolean;

    DisplayOrder: number;

    IsDisplayRequired: boolean;

    ProductTypeCode: string;

    ProductTypeId: number;

    RuleId: number;

    ProductCTCPayrollRuleMappingId: number;

    Modetype: UIMode;
    
    ClientId:number;

    CandidateId:number;
    PaymentType : PaymentType;
    PayableRate : number;
    BillableRate : number;
    BillingType : PaymentType;
}

export enum RateType {
    Hourly = 1,
    Daily = 2,
    Monthly = 3,
    Mixed = 4
}

export class MinimumWagesApplicableProducts {
    Code: string;
    Name: string;
    ApplicableProducts: any;
    IsIndividualbased: boolean;
}

export class AdditionalPaymentProducts
{
    ProductId: number;
    ProductCode: string;
    PaymentType: PaymentType;
    PayableRate: number;
    BillingType: PaymentType;
    BillableRate: number;
    CustomData1: string;
    CustomData2: string;
}

// export class RatesetProduct {
//     Id: number;
//     EmployeeRatesetId: number;
//     EmployeeId: number;
//     ProductId: number;
//     ProductCode: string; // uy
//     DisplayName: string;
//     Value: number; // y
//     IsOveridable: boolean; // y -  true enable txt
//     DisplayOrder: number; // y sort
//     IsDisplayRequired: boolean; // trur grid 
//     ProductTypeCode: string; // y
//     ProductTypeId: number;
//     Modetype: UIMode;
// }