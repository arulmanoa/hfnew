import { StringNullableChain } from "lodash";
import { EmployeeRequestStatus, CompensationDetailsStatus } from "./enums";


export class EmployeeRequest {
    Id: number;
    EmployeeId: Number;
    Type: string;
    EmployeeAttendanceBreakUpDetailsId: Number;
    Date: string;
    StartTime: string;
    EndTime: string;
    TotalTime: Date | string;
    ApprovedStartTime: string;
    ApprovedEndTime: string;
    TotalApprovedTime: Date | string;
    IsPermissionAllowed: string;
    IncludeInCalculation: boolean;
    RequestedClaimType: CompensationDetailsStatus;
    ApprovedClaimType: CompensationDetailsStatus;
    IsCompOffApplicable: boolean;
    ModuleProcessTransactionId: Number;
    EmployeeRemarks: string;
    ApproverRemarks: string;
    Status: EmployeeRequestStatus;
    SubmitStatus: boolean;
    ModuleProcessStatus: number;
    Message: string;
    ExpireOn: Date | string;
    ApprovedExpireOn: Date | string;
    FromDate: Date | string;
    TillDate: Date | string;
    CancelStatus : any;
}

