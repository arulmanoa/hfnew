import { UIMode, BaseModel } from "../Common/BaseModel";


export class ClientContractOperations extends BaseModel {
  ClientContractId: number;

  ApplicablePaygroups: ApplicablePayGroup[];

  ApplicablePayCycles: number[];

  ApplicableAttendanceCycles: number[];

  ApplicableLeaveGroups: number[];

  ApplicableHolidayCalendars: number[];

  ApplicableNoticePeriodDays: number[];

  PayrollInputMode: number;

  LstStatutoryRulesDetails: StatutoryRulesDetails[];

  ApplicableInsurancePlans: number[];

  KeyDates: KeyTransactionDates[];

  ApplicableLeaveEncashmentRule: string;

  ApplicableGratuityRule: string;

  Status: number;

  MinimumWagesApplicableProducts: MinimumWagesApplicableProducts[];

  ProductStatutoryScaleDetails: ProductStatutoryScaleDetails[];

  AdditionalConsultantsDetails: string;

  ApplicableOneTimeTaxableProduct: ApplicableOneTimeTaxableProduct;

  IsAdminChargesNotInBillableAmount: boolean;

  CustomData1: string;

  CustomData2: string;

  CustomData3: string;

  CustomData4: string;

  IsHalfYearlyPTApplicable: boolean;

  AdditionalApplicableProducts: AdditionalPaymentProducts[];

  BreakupBasedays: number;

  BreakUpBaseHours: number;

  WageType: RateType;


  Modetype: UIMode;

  AccountManagerUserId: number;

  IsTimesheetApplicable: boolean;

  IsESSActiveLoginRequired: boolean;

  IsFBPApprovalRequired: boolean;

  IsFBPApplicable: boolean;

  ProductIdForFBPCalculation: number;

  PercentageForFBPCalculation: number;

  BaseDaysTypeForNonOpenPeriodLOP: BaseDaysTypeForNonOpenPeriodLOP;

  BaseDaysTypeForLOPRevokal: BaseDaysTypeForLOPRevokal;

  BaseDaysTypeForNewJoinerArrears: BaseDaysTypeForNewJoinerArrears;

  IsDefaultMinimumWageFromMaster: boolean

  IsCTCBasicAmountValidationNotRequired: boolean;
  IsReferenceDetailsRequied: boolean;
  IsPhotoMandatory: boolean;
  IsOperationDetailsRequried: boolean;
  IsLanguageDetailsRequired: boolean;
  OnboardingDeclarationText: string;
  IsEvaluationSheetRequired: boolean;
  IsDeclarationContextRequired : boolean;
  IsClientApprovalRequired : boolean;
  IsCandidateSignatureMandatory : boolean;
}

export enum BaseDaysTypeForNonOpenPeriodLOP {
  UseFromLOPDatePayPeriodsTimeCard = 1,
  UseFromCurrentTimeCard = 2 //if this is selected, better to select 3 in next enum, for revokal    
}
export enum BaseDaysTypeForLOPRevokal {
  UseFromLOPDatePayPeriodsTimeCard = 1,
  UseFromCurrentTimeCard = 2,
  UseFromTimeCardThatProcessedLOP = 3
}
export enum BaseDaysTypeForNewJoinerArrears {
  UseFromArrearPeriod = 1,
  UseFromCurrentTimeCard = 2
}

export enum RateType {
  Hourly = 1,
  Daily = 2,
  Monthly = 3,
  Mixed = 4
}




export class AdditionalPaymentProducts {
  ProductId: number;
  ProductCode: string;
  PaymentType: RateType;
  PayableRate: number;
  BillingType: RateType;
  BillableRate: number;
  CustomData1: string;
  CustomData2: string;
}

export class ApplicablePayGroup {
  PayGroupId: number;
}


export enum TaxCalculationBasedOn {
  Flat = 1,
  Differential = 2,
  FullTax = 3
}


export class ApplicableOneTimeTaxableProduct {
  ApplicableProducts: number[];
  TaxCalculationBasedOn: TaxCalculationBasedOn;
}

export class MinimumWagesApplicableProducts {
  Code: string;
  Name: string;
  ApplicableProducts: number[];
  IsIndividualbased: boolean;
}

export class AdditionalConsultantsDetails {
  HRD: string;
  CRD: string;
  Recruiter: string;
  Operationspersonnel: string;
  //AdditionalConsultantsDetails → (HRD/CRD/Recruiter/Operations personnel)
}
export class KeyTransactionDates {
  ApprovalSheetToBesent: boolean;
  InputsToBeRecorded: boolean;
  PaysheetToBeSent: boolean;
  PaysheetApproval: boolean;
  BillingSheet: string;
  BillingSheetApproval: boolean;
  InvoiceToBeSent: boolean;
  PayoutDates: Date | string;

  //   KeyTransactionDates → (Approval Sheet to be sent, Inputs to be recd, paysheet to be sent, paysheet approval, billing sheet, billing sheet approval, invoice to be sent, payout dates)

}
export class ApplicableMarkUpRules {
  MarkUpType: string;
  MarkUpRule: string;
  MarkUpValue: string;
  // ApplicableMarkUpRules → (MarkUpType, MarkUpRule, MarkUpValue)

}
export class ProductsMarkupApplicability {
  Billable: string;
  BillableforFullMonthLOP: string;
  BillableUnder: string;
  BillOnActual: string;
  IncludeForMarkUp: string;
  PartOfBillableCTC: string;
  Rule: string;

  //  ProductsMarkupApplicatibility → (Billable, BillableforFullMonthLOP, BillableUnder, BillOnActual, IncludeForMarkUp, PartOfBillableCTC, Rule)


}
export class RateCardDetails {
  RateCardModel: string;
  StandardHours: number;
  ThresholdApplicable: boolean;
  FixedDays: number;
  RoundingOff: number;
  PO_ValidationReqd: boolean;
  AdvanceAdjustmentReqd: boolean;
  // RateCardDetails → (RateCardModel, StandardHours, ThresholdApplicable Y/N, FixedDays, RoundingOff, PO_ValidationReqd Y/N, AdvanceAdjustmentReqd Y/N)  


}
export class AdditionalInvoicingDetails {
  TxnType: string;
  BillingFromAddress: string;
  BillerName: string;
  BillerAddresses: string;
  DefaultNarration: string;

  //   AdditionalInvoicingDetails → (TxnType, BillingFromAddress, BillerName, BillerAddresses, DefaultNarration)

}
export class BankAccountDetails {
  BankName: string;
  AccountName: string;
  AccountNumber: number;
  IFSC: number;
  SWIFT: number;
  NEFT: number;
  UPIID: number;
  PaytmID: number;
  // BankAccountDetails → (BankName, AccountName, AccountNumber, IFSC, SWIFT, NEFT, UPIID, PaytmID)


}


export class ProductStatutoryScaleDetails {
  EffectiveDate: Date | string;
  ProductId: number;
  ScaleId: number;
  ScaleCode: string;
  IsRangeValue2Applicable: boolean;
}

export class StatutoryRulesDetails {
  StatutoryType: StatutoryType;
  EffectiveDate: Date | string;
  ProductId: number;
  ProductApplicabilityCode: string;
  IsApplicable: boolean;
  IsPreviousPaymentExclusion: boolean;
  IsHalfYearlyApplicable: boolean;
  scaleLocationMappings: ScaleLocationMapping[];
}

export class ScaleLocationMapping {
  ProductId: number;
  EffectiveDate: Date | string;
  StateId: number;
  CityId: number;
  ScaleCode: string;
  ScaleId: number;
  ApplicableMonths: number[];
}

export enum StatutoryType {
  None = 0,
  WCP = 1,
  ESIC = 2,
  LWF = 3,
  PT = 4,
  PF = 5
}