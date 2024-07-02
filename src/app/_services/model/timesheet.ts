import {BaseModel, UIMode} from './Common/BaseModel';

export class TimeSheetHeader extends BaseModel {
    EmployeeId: number;
    TimesheetConfigurationId: number;
    PeriodFrom: any;
    PeriodTo: any;
    TagName: string;
    PlannedHours: number;
    TotalHours: number;
    Status: TimeSheetStatus;
    EmployeeRemarks: string;
    ApproverRemarks: string;
    SubmittedOn: Date | string | null;
    SubmittedBy: number | string;
    ApprovedRejectedOn?: Date | string | null;
    ApprovedRejectedBy?: number | string;
    Modetype: UIMode;
    timesheetDetails: TimeSheetDetails[];
    timesheetDocuments?: TimeSheetDocuments[];
}

export class TimeSheetDetails extends BaseModel {
    TimesheetHeaderId: number;
    ProjectId: number;
    ActivityId: number;
    TransactionDate: any;
    StartTime: any;
    EndTime: any;
    BreakTime: number;
    WorkingHours: number;
    Status: TimeSheetStatus;
    IsActive: boolean;
    EmployeeRemarks: string;
    ApproverRemarks: string;
    SubmittedOn: any;
    SubmittedBy: number;
    ApprovedRejectedOn?: Date | string | null;
    ApprovedRejectedBy?: number | string;
}

export enum TimeSheetStatus {
    Saved = 1,
    Submitted = 2,
    Approved = 3,
    Rejected = 4,
    Resubmitted = 5
}

export class TimeSheetDocuments extends BaseModel {
    TimesheetHeaderId: number;
    DocumentId: number;
}

