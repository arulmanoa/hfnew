export class MandateSchedule {
    Id: number; // ID
    MandateAssignmentDetailsID: number;
    UserId: number;
    StartDate: Date;
    EndDate: Date;
    WorkSession: number;
    TargetNumber: number;
    ActualTargetNumber: number;
    Notes: string;
    Status: number;
    LastUpdatedOn: Date;
    LastUpdatedBy: string;
}

export class MandateScheduleUpdate extends MandateSchedule {
    StatusName?: string;
}
