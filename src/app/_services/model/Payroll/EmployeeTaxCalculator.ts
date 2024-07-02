import { BaseModel } from "../Common/BaseModel";
import { EmployeeDetails } from "../Employee/EmployeeDetails";
import { EmployeeRateset } from "../Employee/EmployeeRateset";

export class EmployeeTaxCalculator {
    EmployeeId: number;
    FinancialYearId: number;
    CompanyId: number;
    ClientId: number;
    EmployeeDetails: EmployeeDetails;
    EmployeeRateset: EmployeeRateset;
    TaxCalculatorRequestType: TaxCalculatorRequestType;
    PayTransaction: any;
    PayTransactionNewRegime: any;
    Recommendation: string;
    IsTaxBasedOnProof: boolean;
}

export enum TaxCalculatorRequestType {
    FBP,
    Invesment,
    StandAlone
}



// export class PayTransaction extends BaseModel {
//     timecardId: number;
//     employeeId: number;
//     employeeName: string;
//     payperiodId: number;
//     financialyearId: number;
//     payrollDate: string;
//     finStartDate: string;
//     finEndDate: string;
//     grossEarn: number;
//     grossDedn: number;
//     netPay: number;
//     totalCost: number;
//     payrunId: number;
//     grossSalaryWithOutPerquisites: number;
//     perquisites: number;
//     grossSalary: number;
//     exemptions: number;
//     deductions: number;
//     incomeChargeable: number;
//     incomeFromHouseProperty: number;
//     otherIncome: number;
//     rentDeduction: number;
//     grossTotalIncome: number;
//     savings: number;
//     taxableIncome: number;
//     taxOnIncome: number;
//     surcharge: number;
//     educationCess: number;
//     totalIncomeTax: number;
//     taxRebate: number;
//     taxPaid: number;
//     taxBalance: number;
//     currentMonthTaxOnIncome: number;
//     currentMonthSurcharge: number;
//     currentMonthEducationCess: number;
//     tDS: number;
//     taxPercentage: number;
//     surchargePercentage: number;
//     educationCessPercentage: number;
//     customdata1: string;
//     customdata2: string;
//     customdata3: string;
//     paymentStatus: PaymentSt;
//     status: PayTransactionStatus;
//     paymentReferrenceDetails: string;
//     incomeTaxScaleCode: string;
//     processCategoryId: ProcessCategory;
//     payOutInformationId: number;
//     payItemdata: PayItem[];
//     taxItemdata: TaxItem[];
//     remainingMonths: number;
//     paymentTillDates: EmployeePaymentTillDate[];
//     payPeriod: PayPeriod;
//     calendarBreakUp: CalendarBreakUp;
//     taxExemptionProducts: number[];
// }