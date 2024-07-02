import { SalaryBreakUpType } from "../PayGroup/PayGroup";
import { BaseModel, UIMode } from "../Common/BaseModel";
import { AdditionalPaymentProducts, MinimumWagesApplicableProducts, RatesetProduct, RateType } from "../Candidates/CandidateRateSet";
import {PaymentType} from "src/app/_services/model/Base/HRSuiteEnums";

export class EmployeeRateset extends BaseModel
    {
        EmployeeId: number;        
        EmployeeLifeCycleTransactionId: number;
        PayGroupdId: number;

        EffectiveDate: Date | string;

        IsMonthlyValue: boolean;

        SalaryBreakUpType: SalaryBreakUpType;

        Salary: number;

        IsLatest: boolean;

        RateSetData: string;
       
        IsInsuranceApplicable: boolean;

        InsuranceId: number;

        MonthlySalary: number;

        AnnualSalary: number;


        InsuranceAmount: number;


        IsOveridable: boolean;

        Status: number;

        RatesetProducts: RatesetProduct[];

        Modetype: UIMode;

        EffectivePeriodId: number;
        
        PaymentType?:PaymentType;

        WageType: RateType;
        PayableRate?: number;
        BillableRate?: number;
        additionalApplicableProducts ?: AdditionalPaymentProducts;
        MinimumWagesApplicability?: MinimumWagesApplicableProducts;
        

    }

   export const _EmployeeRateset : EmployeeRateset = {
        Id : 0,
        EmployeeId: 0,   
        EmployeeLifeCycleTransactionId: null,
        PayGroupdId: null,
        EffectiveDate: null,
        IsMonthlyValue: false,
        SalaryBreakUpType: null,
        Salary: 0,
        IsLatest: false,
        RateSetData: null,       
        IsInsuranceApplicable: false,
        InsuranceId: null,
        MonthlySalary: 0,
        AnnualSalary:0,
        InsuranceAmount: 0,
        IsOveridable: false,
        Status: 0,
        RatesetProducts: [],
        Modetype: 0,
        EffectivePeriodId: null,        
        PaymentType:null,
        WageType: null,
        PayableRate: 0,
        BillableRate: 0,
        additionalApplicableProducts : null,
        MinimumWagesApplicability: null,
        
   }