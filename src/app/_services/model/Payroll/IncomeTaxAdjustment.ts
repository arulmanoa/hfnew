import { BaseModel } from "../Common/BaseModel";

    export class IncomeTaxAdjustment extends BaseModel
    {       
        FinancialYearId: number;

        EmployeeId: number;

        GrossSalary: number;

        Exemptions: number;

        Deductions: number;

        IncomeChargeable: number;
        IncomeFromHouseProperty: number;
        OtherIncome: number;

        GrossTotalIncome: number;

       
        Savings: number;
        TaxableIncome: number;
        TaxOnIncome: number;
        Surcharge: number;
        EducationCess: number;
        TotalIncomeTax: number;
        TaxRebate: number;
        TaxPaid: number;



        TDS: number;
        Comments: string;
    }


