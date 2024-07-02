import { BaseModel } from "../Common/BaseModel";

export class Team extends BaseModel {
  Code: string;

  ClientContractId: number | null;

  ClientId: number | null;

  ClientContactId: number | null;

  PayCycleId: number | null;

  AttendanceStartday: number | null;

  AttendanceEndday: number | null;

  LeaveGroupId: number | null;

  PayGroupId: number | null;

  Name: string;

  ConsultantDetails: string;

  BaseDaysConsiderationType: BaseDaysConsiderationType;

  FixedDayCalendarId: number | null;

  FixedBaseDays: number | null;

  ExcludedDaysForBaseDays: DayOfWeek[];

  OpenPayPeriodId: number;

  PaycycleStartDay: number;

  IsAttendanceStampingBasedonLastDate: boolean;

  AttendanceCycleId: number;

  defaultManagerId: number;

  isnapbased: boolean;

  IsVanBasedPayOut: boolean;

  IsVanBasedAccount: boolean;

  VanAccountDetails: VanAccountDetails;

  ManagerDetails: UserManagerDetails[];

  IsLeaveApplicable: boolean;
  IsAttendanceApplicable: boolean;

  PreviousPayPeriodId: number;
  IsMustorRollApplicable: boolean;
}

export class VanAccountDetails {
  AccountHolderName: string;

  companyId: number;

  BankId: number;

  BankBranchId: number;

  IFSCCode: string;

  AccountNumber: number;
}

export class UserManagerDetails {
  ManagerId: number;
  Name: string;
}

export enum BaseDaysConsiderationType {
  AllDaysInPeriod = 1, // calendar must
  FixedDayCalendar = 2, // calendar must
  FixedDays = 3, // calendar must..is this required
  ExclusionOfDays = 4, //?? cant have default calendar, as the excluded days combination is unpredictable
  ConsiderFromInput = 5, // how would the input come?
}

export enum AdditionalWorkDaysCalcType {
  DoNotPay = 1,
  Pay = 2,
}

export enum NegativeWorkDaysCalcType {
  DoNotDeduct = 1,
  Deduct = 2,
}

export enum DayOfWeek {
  Sunday,
  Monday,
  Tuesday,
  Wednesday,
  Thursday,
  Friday,
  Saturday,
}
