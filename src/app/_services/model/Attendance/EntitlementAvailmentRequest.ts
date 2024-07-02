import { BaseModel } from "../Common/BaseModel";
import { EntitlementAvailmentRequestActivity } from "./EntitlementAvailmentRequestActivity";
import { EntitlementType } from "./EntitlementType";

export class EntitlementAvailmentRequest {
  ApprovedFrom: Date | string | null;
  IsApprovedFromSecondHalf: boolean;
  IsApprovedForFirstHalf: boolean;
  ApprovedTill: Date | string | null;
  IsApprovedTillFirstHalf: boolean;
  IsApprovedTillSecondHalf: boolean;
  CalculatedAppliedUnits: number;
  ApprovedUnits: number;
  AppliedBy: number;
  ValidatedOn: Date | string;
  ValidatedBy: number;
  ApplierRemarks: string;
  CancellationRemarks: string;
  ValidatorRemarks: string;
  AppliedOn: Date | string;
  Status: EntitlementRequestStatus;
  AppliedUnits: number;
  IsAppliedTillFirstHalf: boolean; // second morning
  Id: number;
  EmployeeId: number;
  EmployeeEntitlementId: number;
  EntitlementType: EntitlementType;
  EntitlementId: number;
  EntitlementDefinitionId: number;
  IsAppliedTillSecondHalf: boolean; // secon afternon
  EntitlementMappingId: number;
  ApplicablePayPeriodId: number;
  ApplicableAttendancePeriodId: number;
  AppliedFrom: Date | string | null;
  IsAppliedFromSecondHalf: boolean;   // first afternoon
  IsAppliedForFirstHalf: boolean; // first monring
  AppliedTill: Date | string | null;
  UtilizationUnitType: EntitlementUnitType;
  ActivityList: EntitlementAvailmentRequestActivity[];
  PendingAtUserId: number;
  isSelected?: boolean;
  EmployeeName: any;
  PendingAtUserName: any;
  LastUpdatedOn: any;
  ApprovalStatus: EntitlementRequestStatus;
  RegularizedBy: number;
  RegularizedOn: Date | string;
  ValidatedUserName?: string;
  AdditionalDate: Date | string;
  DocumentId: number;
  DocumentName: string;
  PendingAtRoleId: number;
  ApprovalLevel: number;
  CompensationDates?: CompensationDates[];
  RelationshipId?: number;
}

export enum EntitlementRequestStatus {
  Applied = 100,
  Cancelled = 200,
  Rejected = 300,
  Approved = 400,
  Availed = 500,
  CancelApplied = 600
}

export enum EntitlementRequestStatusForAllen {
  Applied = 100,
  Cancelled = 200,
  Rejected = 300,
  Approved = 400,
  Availed = 500,
  CancellationInProgress = 600
}


export enum EntitlementUnitType {
  Year = 0,
  Quarter = 1,
  Month = 2,
  Week = 3,
  Day = 4,
  Hour = 5,
  Amount = 6
}


export class EntitlementAvailmentRequestAsPresentViewModel {
  LeaveRequestId: number;
  FromDate: Date | string;
  ToDate: Date | string;
  EmployeeEntitlementId: number;
  RegularizedUnits: number;
  IsFullDay: boolean;
  IsFirstHalf: boolean;
  IsSecondHalf: boolean;
  RegularizedBy: number;
  EmployeeId: number;
}

export class CompensationDates {
  UtilizationDate: Date;
  UtilizedUnits: number;
}
