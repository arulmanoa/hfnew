import { BaseModel } from "../Common/BaseModel";
import {
    EntitlementType, RoundOffMmode, EntitlementCalendar, LeaveRangeConsiderationType, UsageLimitType,
    HolidayType,  OccuranceType, EntitlementUnitType, EntitlementRequestStatus,
    EntitlementCycleIdentifierType, EntitlementCycle
} from "./AttendanceEnum";

export class Entitlement extends BaseModel {
    CompanyId: number;

    ClientId: number;

    ClientContractId: number;

    Code: string;

    DisplayName: string;

    Description: string;

    Type: EntitlementType;

    Status: number;

    IsESICBased: boolean;
    IsPaternity: boolean;
    IsMaternity: boolean;
    IsMarriage: boolean;
    IsOptionalHoliday: boolean;
}

export class EntitlementDefinition extends BaseModel {
    //#region Entitlement

    EntitlementId: number;
    //extra info for ease of querying
    EntitlementDetails: Entitlement;
    EntitlementType: EntitlementType;

    //#endregion

    //#region Identifiers

    Code: string;

    DisplayName: string;

    Description: string;

    //#endregion

    //#region Obsolete -- to confirm

    //if entitlement group entity is not there, the below is not required
    EntitlementGroupId: number;

    //#endregion

    //#region Assigners

    CompanyId: number;

    ClientId: number;

    ClientContractId: number;

    ApplicableTeamIdList: string[];
    ApplicableEmployeeIdList: string[];

    ApplicableDesignationList: string[];
    ApplicableDepartmentList: string[];
    ApplicableLevelList: string[];
    ApplicableVerticalList: string[];

    //gen

    //#endregion

    //#region Common

    IsAllowedToUseDuringNoticePeriod: boolean;

    AllowCarryForward: boolean;//

    IsShareable: boolean;

    RoundOffMode: RoundOffMmode;

    RoundOffValue: number;

    IsEncasheable: boolean;

    //#endregion

    //#region Common - Credit

    IsCreditBasedOnDOJ: boolean;

    IsCreditRequired: boolean;

    CreditCalendar: EntitlementCalendar;

    CreditCycle: EntitlementCycle;

    CreditCycleIdentifierType: EntitlementCycleIdentifierType;

    CreditCycleIdentifier: string;

    CreditUnitType: EntitlementUnitType;

    CreditUnits: number;

    CreditScale: string;//if scale based on an attribute

    CreditScaleAttribute: string;//ex. an attribute of an employee, or a month name

    CreditRuleId: number;//ex., for every 20 worked days. credit something

    IsUpfrontCredit: boolean;// if this is there, no need to considercycle identifier i think

    IncludeNewJoinerArrearPeriods: boolean;

    IsNewJoinerProrationRequired: boolean;

    //joined  befire some date ..new joiner then only credit option

    //#endregion

    //#region Common - Lapse

    IsLapseRequired: boolean;

    LapseCalendar: EntitlementCalendar;

    LapseCycle: EntitlementCycle;

    LapseCycleIdentifierType: EntitlementCycleIdentifierType;

    LapseCycleIdentifier: string;

    LapseUnitType: EntitlementUnitType;

    LapseUnits: number;

    LapseScale: string;

    LapseScaleAttribute: string;//ex. an attribute of an employee, or a month name

    LapseRuleId: number;

    LapseAll: boolean;

    //#endregion

    //#region Common - Balance Maintenance / Validation

    MaxBalance: number;

    MinBalance: number;

    //#endregion

    //#region Common - Payment

    IsPaymentRequired: boolean;

    IsAutoPaymentInititation: boolean;

    PaymentCalendar: EntitlementCalendar;

    PaymentCycle: EntitlementCycle;

    PaymentCycleIdentifierType: EntitlementCycleIdentifierType;

    PaymentCycleIdentifier: string;

    PaymentAmount: number;

    PaymentScale: string;

    PaymentScaleAttribute: string;

    PaymentRuleId: number;

    //#endregion

    //#region Common - Payment / Credit

    IsAttendanceProrationRequired: boolean;

    IsNegativeBalanceAllowed: boolean;

    MaxNegativeBalanceAllowed: number;

    NegativeBalanceScale: string;

    NegativeBalanceScaleAttribute: string;

    NegativeBalanceRuleId: number;

    //#endregion

    //#region Common - usage related

    OverallUsageLimitType: UsageLimitType;

    OverallMinUsageLimit: number;//no usecases predicted

    OverallMaxUsageLimit: number;// at any point of time.. for ex. if 100 crdits are there,,emp can use 95% or 98

    UtilizationCycle: EntitlementCycle;

    UtilizationCycleStartDate: Date | string | null;

    UtilizationCycleEndDate: Date | string | null;

    UsageLimitTypePerUtilizationCycle: UsageLimitType;

    UtilizationUnitType: EntitlementUnitType;

    MaxUsageLimitPerUtilizationCycle: number;

    MinUsageInOneShot: number;

    MaxUsageInOneShot: number;


    IsApprovalRequired: boolean;

    IsOptionRequiredToUploadDocuments: boolean;

    AreSupportingDocumentsMandatory: boolean;

    //#endregion

    //#region Specific to leave

    //consider previous strech while applying for leave

    IsHolidayInclusive: boolean;//a simple setting to include any holidays which come in between

    HolidayConsiderationPolicy: LeaveAndHolidayMixConsiderationPolicy;

    ImpingeOnServicePeriod: boolean;

    //#endregion

    ConsiderEarlierUsageForContinuityIndeterminingMaxUsagePerShot: boolean;
    //HolidayTypesToBeIncludedToValidateUsageLimit: SerializableDictionary<OccuranceType, HolidayType[]>;

    //HolidayTypesToBeIncludedToValidateLimit: number;
    //holiday types included in consecutiv uasage

    //for every 10 leaves .. lapse something
    IsHalfDayApplicable: boolean;
    IsAdditionalDateInputRequired: boolean;

    AdditionalDateLabelName: string;
    MaxDaysBeforeAdditionalDate: number;

    MaxDaysAfterAdditionalDate: number;

    InfoText: string;
    DownloadDocPath: string;
    DownloadLinkName: string;
    ProofDisplayRoleCodes: string;
    AutoCalculateEndDate: boolean;
    IsAdditionalDatePartOfRequest: boolean;
    IsAdditionalDateFromDOJ : boolean;
    IsCompOff: boolean;
    IsMultiSelectAllowedForCompOff: boolean;
    IsBereavementLeave: boolean;
    IsAutoCalcEndDateEditable : boolean;
    MaxPastDaysForAdditionalDate: number;
}

export class LeaveAndHolidayMixConsiderationPolicy {
    ApplicableForAllHolidayTypes: boolean;
    ApplicableHolidayTypes: HolidayType[];
    IsIncludedToValidateUsageLimit: boolean;
    ConsiderationType: LeaveRangeConsiderationType; 
    HolidayOccuranceType: OccuranceType;
    //RangeAndActionList: number[];
}

//not sure if this is required, but think would be useful
export class EntitlementGroup extends BaseModel {
    Code: string;
    Name: string;
    Description: string;

    Status: number;

    //CompanyId: number;
    //ClientId: number;
    //ClientContractId: number;
    //TeamId: number;
    //EmployeeId: number;
}



export class EntitlementAvailmentRequest {
    Id: number;

    EmployeeId: number;
    EmployeeEntitlementId: number;
    EntitlementType: EntitlementType;

    EntitlementId: number;
    EntitlementDefinitionId: number;
    EntitlementMappingId: number;
    UtilizationUnitType: EntitlementUnitType;

    ApplicablePayPeriodId: number;
    ApplicableAttendancePeriodId: number;

    AppliedFrom: Date | string | null;
    IsAppliedFromSecondHalf: boolean;//not ssure how to manage hours or quarter days
    IsAppliedForFirstHalf: boolean;//not ssure how to manage hours or quarter days
    AppliedTill: Date | string | null;
    IsAppliedTillFirstHalf: boolean;
    IsAppliedTillSecondHalf: boolean;
    AppliedUnits: number;
    CalculatedAppliedUnits: number;

    ApprovedFrom: Date | string | null;
    IsApprovedFromSecondHalf: boolean;//not ssure how to manage hours or quarter days
    IsApprovedForFirstHalf: boolean;//not ssure how to manage hours or quarter days
    ApprovedTill: Date | string | null;
    IsApprovedTillFirstHalf: boolean;
    IsApprovedTillSecondHalf: boolean;
    ApprovedUnits: number;

    AppliedOn: Date | string;
    AppliedBy: number;

    ValidatedOn: Date | string;
    ValidatedBy: number;

    ApplierRemarks: string;
    CancellationRemarks: string;

    ValidatorRemarks: string;

    Status: EntitlementRequestStatus;

    ActivityList: EntitlementAvailmentRequestActivity[];

    PengingAtUserId: number;

    //PendingAtUserName: string;


}

export class EntitlementAvailmentRequestActivity {
    Id: number;

    EntitlementAvailmentRequestId: number;

    UserId: number;
    UserName: string;
    Remarks: string;
    Status: EntitlementRequestStatus;
    IsLatest: boolean;

    CreatedOn: Date | string;
}

export class EmployeeEntitlement extends BaseModel {
    EmployeeId: number;

    EntitlementId: number;
    EntitlementDefinitionId: number;

    Definition: EntitlementDefinition;

    EntitlementMappingId: number;

    DisplayName: string;//can be inherited from EntitlementMapping

    UnitType: EntitlementUnitType;
    UnitsForCurrentCycle: number;

    EntitlementFirstCreditDate: Date | string | null;
    EntitlementLastLapsedDate: Date | string | null;

    CurrentEntitlementCycleStartDate: Date | string | null;
    CurrentEntitlementCycleEndDate: Date | string | null;

    NextCreditDate: Date | string | null;
    NextLapseDate: Date | string | null;

    TotalUnitsCredited: number;
    TotalUnitsLapsed: number;

    TotalAvailedUnits: number;
    UnitsAvailedInCurrentCycle: number;

    AvailableUnits: number;
    EligibleUnits: number;

    IsLocked: boolean;
    Status: number;

    //#region only for ease of sys actions

    EntitlementAvailmentRequestList: EntitlementAvailmentRequest[];
    ClientId: number;
    ClientContractId: number;
    TeamId: number;
    StateId: number;
    LocationId: number;
    IsServingNoticePeriod: boolean;

    ManagerId: number;
    ManagerMailId: string;
    EmployeeMailId: string;
    ManagerName: string;
    EmployeeName: string;
    EmailSubject: string;
    EmailBody: string;
    //HolidayList: Holiday[];
    AvailmentRequest: EntitlementAvailmentRequest;
    Entitlement: Entitlement;
    //#endregion
}

export class EntitlementProcessActivity extends BaseModel {
    EmployeeEntitlementId: number;

    EmployeeId: number;
    EntitlementId: number;
    EntitlementDefinitionId: number;
    EntitlementMappingId: number;

    UnitsAffected: number;

    UnitsElapsed: number;


    Cycle: EntitlementCycle;
    Type: EntitlementProcessType;

    Remarks: string;
}

export enum EntitlementProcessType {
    Credit,
    Lapse

}

export class EntitlementMapping extends BaseModel {
    //EntitlementGroupId: number;
    EntitlementDefinitionId: number;
    Status: number;

    DisplayName: string;

    CompanyId: number;

    ClientId: number;

    ClientContractId: number;

    TeamId: number;

    EmployeeId: number;

    EffectiveFrom: Date | string;

    EffectivePeriodId: number;

    ValidTill: Date | string;

    ExpiryPeriodId: number;

}

//should be able to set as per entl. type
export class EntitlementNominee {

}

//Role - 
export class UserManagerMapping extends BaseModel {
    CompanyId: number;
    ClientId: number;
    ClientContractId: number;
    TeamId: number;

    EmployeeId: number;//should this be userId???? /**//.. not sure  */
    UserId: number;

    RoleId: number;
    RoleUserId: number;

    EffectiveFrom: Date | string | null;//this shd be moved to actionlevel
    EffectiveTill: Date | string | null;

    ModuleApplicabilityList: ModuleAndActionApplicability[];
    //ActionId: number;

}

export class ModuleAndActionApplicability {
    ModuleId: number;
    AllowedActions: number[];
    ExcludedActions: number[];

}

export class ProxyManagerMapping extends BaseModel {
    CompanyId: number;
    ClientId: number;
    ClientContractId: number;

    ActionId: number;

    Teamid: number;
    //Department: string;

    RoleId: number;
    UserId: number;

    ProxyRoleId: number;
    ProxyUserId: number;

    EffectiveFrom: Date | string | null;
    EffectiveTill: Date | string | null;

}