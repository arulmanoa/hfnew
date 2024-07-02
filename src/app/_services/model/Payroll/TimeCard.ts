import { BaseModel, UIMode } from "../Common/BaseModel";
import { ProcessCategory } from "./PayRun";
import { Attendance } from "./Attendance";
import { Adjustment } from "./Adjustment";
import { Allowance } from "./Allowance";
import { Expense } from "./Expense";
import { TimeCardStatus } from './TimecardStatus';
import { AdhocPayment } from "./AdhocPayment";

export class TimeCard extends BaseModel {
     CompanyId: number | null;

     ClientId: number;

     ClientContractId: number;

     TeamId: number;

     EmployeeId: number;

     EmploymentContractId: number;

     EmployeeName: string;

     PersonId: number;

     PayCycleId: number;

     PayPeriodId: number;

     PayPeriodFrequency: number;

     PeriodStartDate: Date | string | null;

     PeriodEndDate: Date | string | null;

     ProcessPeriodId: number | null;

     AttendanceStartDate: Date | string | null;

     AttendanceEndDate: Date | string | null;

     ProcessCategory: ProcessCategory;

     PayUnitType: number;

     BillUnitType: number;

     UnitsPerDay: number;

     TotalUnits: number | null;

     PayableUnits: number | null;

     BillableUnits: number | null;

     PISId: number | null;

     PVRId: number | null;

     InputType: TimeCardInputType;

     IsTaxBasedOnProof: boolean;

     IsNewJoiner: boolean;

     IsSalaryRevised: boolean;

     FinancialYearId: number;

     ArrearDays: number;

     LopDays: number;

     LopDaysRevoked: number;

     ErrorMessage: string;

     BookingReferenceId: number | null;

     ConsultantId: number | null;

     IsAutoCalcRequired: boolean | null;

     IsApprovalRequired: boolean | null;

     IsApproved: boolean | null;

     SpecialInstruction: string;

     LockedBy: string;

     OriginalTimeCardId: number | null;

     PayTransactionId: number | null;

     NonPayableDays: [];

     CustomData1: string;

     CustomData2: string;

     CustomData3: string;

     CustomData4: string;

     CustomData5: string;

     AdditionalData: string;

     PayGroupId: number;

     PayRunId: number;

     IsTaxIdentificationNumberExists: boolean; //PAN NO Exists or not

     IsTaxExempted: boolean;

     TaxRegimeId: number;

     CalculationRemarks: string;

     CostCode: string;

     CostCentre: string;

     TotalCharge: number | null;

     MarkUp: number | null;

     TotalTax: number | null;

     TotalBillableAmount: number | null;

     Status: TimeCardStatus;

     RatesetWiseSplitList: TimeCardRateSetSplit[];
     AttendanceList: Attendance[];
     AllowanceList: Allowance[];
     AdjustmentList: Adjustment[];
     LstPayitem: PayItem[];
     ExpenseList: Expense[];
     AdhocPaymentList : AdhocPayment[];
     LstPaymentsTillDate: EmployeePaymentTillDate[];
     TimeCardSubmissionLst: TimeCardSubmission[];

     CalculationInsight: TimecardCalculationInsight;

     Modetype: UIMode;
     IsFullMonthLOP: boolean;
     IsLOPBasedOnPayrollMonth : boolean;

     IsNilCasePayment : boolean;
}

export enum TaxRegime {
     Default = 1,
     Optional = 2
}


export class Holiday extends BaseModel {

     HolidayCalendarId: number;
     Type: HolidayType;
     Date: Date | string;
     Remarks: string;
     IsRestrictedToWork: boolean;
     PayQuantity: number;
     PayUnitType: PayUnitType;
     PayUnitValue: number | null;
     BillQuantity: number;
     BillUnitType: BillUnitType;
     BillUnitValue: number | null;
     Status: boolean;
     IsOverridable: boolean;
}

export class TimeCardSubmission {

     Id: number;
     TimeCardId: number | null;
     Submittedby: number | null;
     SubmittedOn: Date | string | null;
     SubmittedRemarks: string;
     IsSelfApproved: boolean | null;
     Approvedby: number | null;
     ApprovedOn: Date | string | null;
     ApprovedRemarks: string;
     Status: TimeCardSubmission;
     Modetype: UIMode;
     SubmittedDocumentId: number;
     ApprovalDocumentId: number;
}
export class EmployeePaymentTillDate {

     Id: number;
     EmployeeId: number;
     ProductId: number;
     PreviousPayTotal: number;
     CurrentPayTotal: number;
     PayTotal: number;
     DisplayOrder: number;
     FinancialyearId: number;
}

export class PayItem extends BaseModel {

     RevokeLopAmount: number;
     AdjustmentAmount: number;
     BillAmountForAdjutsment: number;
     ActualAmount: number;
     CustomData1: string;
     CustomData2: string;
     CustomData3: string;
     CustomData4: string;
     CustomData5: string;
     CustomData6: string;
     FinancialYearId: number;
     DeductionDetailsId: number;
     CostOverride: number;
     RevenueOverride: number;
     CostCode: string;
     CostCentre: string;
     BreakUpInfo: string;
     IsLOPApplicable: boolean;
     IsRevisionApplicable: boolean;
     Status: number;
     paymentTillDates: EmployeePaymentTillDate[];
     RevokeLopDays: number;
     ArrearDays: number;
     LopDays: number;
     TotalArrearAmount: number;
     PayItemType: number;
     IsAutoGenerated: boolean;
     EmployeeId: number;
     TimeCardID: number;
     PayPeriodId: number;
     ProductId: number;
     ProductTypeId: number;
     ProductDisplayName: string;
     ProductCode: string;
     ProductTypeCode: string;
     LstPayItemBreakUps: PayItemBreakUp[];
     PayQuantity: number;
     PayRate: number;
     BillRate: number;
     PayTotal: number;
     BillTotal: number;
     CalculationFormula: string;
     PayTransactionId: number;
     PayRunId: number;
     LopAmount: number;
     ArrearAmountForArrearDays: number;
     ArrearAmountForSalaryRevision: number;
     BillQuantity: number;
     PeriodWiseSplits: PayItemPeriodWiseSplit[];
}

export class PayItemBreakUp {

     PayItemId: number;
     ProductId: number;
     ApplicableProductId: number;
     ApplicableProductCode: string;
     PayRate: number;
     ChargeRate: number;
     Percentatevalue: number;
     TotalAmount: number;
}

export class TimeCardRateSetSplit {

     Id: number;
     TimeCardId: number;
     EmploymentContractId: number;
     EmployeeId: number;
     TimeCardPeriodId: number;
     ProcessPeriodId: number;
     RateSetId: number;
     FromDate: Date | string;
     ToDate: Date | string;
     BaseDays: number;
     HolidayCalendarId: number;
     IsVoided: boolean;
}
export enum HolidayCalendarType {
     Holidays = 1,
     NonPayableDays = 2
}

export class TimecardCalculationInsight {
     IsNewJoiner: boolean;
     IsTerminatedEmployee: boolean;
     ArrearDays: number;
     AdjustmentAmount: number;
     AttendanceList: Attendance[];
     HolidayCalendar: HolidayCalendar;
     OpenPeriodId: number;
     PeriodWiseCalcInfoList: PeriodCalculationInfo[];

}
export class HolidayCalendar extends BaseModel {

     Type: HolidayCalendarType;
     Code: string;
     Remarks: string;
     CountryId: number;
     StateId: number;
     IsGeneric: boolean;
     StartMonth: number;
     EndMonth: number;
     Status: boolean;
     IncludedHolidays: Holiday[];
     HolidayList: Holiday[];
     ExcludedHolidays: Holiday[];
}
export class PeriodCalculationInfo {

     LOPDaysAfterRevoke: number;
     LOPDatesAfterRevoke: [];
     ArrearStartDate: Date | string;
     ArrearEndDate: Date | string;
     ArrearDates: Date | string[];
     ArrearDays: number;
     IsArrearHalfDay: boolean;
     TotalAmountToBePaid: number;
     TotalAmountForArrearDays: number;
     TotalLOPAmount: number;
     TotalAmountPaidInCaseOfRevision: number;
     TotalAmountToBePaidInCaseOfRevision: number;
     RevisionPeriodAdjustmentAmount: number;
     OpenPeriodAdjustmentAmount: number;
     OpenPeriodRevokeLOPAmount: number;
     ChargeAmountForAdjutsment: number;
     IsRevisionPeriod: boolean;
     RevokeLOPDays: number;
     LOPDays: number;
     RevokeLOPAmount: number;
     RevokeLOPBreakUps: [];
     Holidays: Holiday[];
     BaseDays: number;
     BaseDaysToBeConsideredForRevision: number;
     HolidayCalendarId: number;
     PeriodId: number;
     PeriodStartDate: Date | string;
     IsOpenPeriod: boolean;
     PeriodEndDate: Date | string;
     PayEndDate: Date | string;
     ArrearPayPeriodSplits: [];
     NormalPayPeriodSplits: [];
     RevisionPayPeriodSplits: [];
     LOPDates: [];
     LOPDatesToBeProcessed: [];
     RevokeLOPDates: [];
     PayStartDate: Date | string;
     IsLOPPeriod: boolean;

    }

export enum TimeCardInputType {
     BulkImport = 1,
     SalaryEntry = 2,
     EmployeeSubmission = 3
}

export enum HolidayType {
     WeekOff = 0,
     NonPayableDay = 1,
     PublicHoliday = 2,
     OtherNonWorkingDay = 3
}
export enum PayUnitType {
     None = 0,
     Amount = 1,
     Days = 2,
     Hours = 3
}

export enum BillUnitType {
     None = 0,
     Amount = 1,
     Days = 2,
     Hours = 3
}

export class PayItemPeriodWiseSplit {

     ActualAmount: number;
     RevokeLopAmount: number;
     LopDaysRevoked: number;
     ArrearDays: number;
     LopDays: number;
     TotalArrearAmount: number;
     ArrearAmountForSalaryRevision: number;
     ArrearAmountForArrearDays: number;
     LopAmount: number;
     PayTransactionId: number;
     PayTotal: number;
     PayRate: number;
     PayQuantity: number;
     ProductCode: string;
     ProductId: number;
     ApplicablePeriodId: number;
     PayPeriodId: number;
     PayItemId: number;
     Id: number;
     IsLOPApplicable: boolean;
     IsRevisionApplicable: boolean;
}