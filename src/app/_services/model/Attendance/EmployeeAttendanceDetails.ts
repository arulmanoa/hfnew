import { BaseModel } from "../Common/BaseModel";
import { Role } from "../Hierarchy/Role";
import { AttendanceBreakUpDetailsStatus } from "./AttendanceEnum";

export class EmployeeAttendanceDetails extends BaseModel {
    
    Status: number;
    AttendanceConfigurationMappingId: number;
    TotalNumberOfNonPayableDays: number;
    TotalNumberOfPayableDays: number;
    TotalNumberOfDays: number;
    TotalOThours: number;
    TotalApprovedhours: number;
    TotalSubmittedHours: number;
    AttendancePeriodId: number;
    AttendancecycleId: number;
    DOJ: Date | string;
    EmployeeName: string;
    ClientEmployeeCode: string;
    EmployeeCode: string;
    EmployeeId: number;
    PISId: number;
    LstEmployeeAttendanceBreakUpDetails: EmployeeAttendanceBreakUpDetails[];
    LstEmployeeAttendanceReversalDetails: EmployeeAttendanceReversalDetails[];
    LstEmployeeVariableInputsDetails: EmployeeVariableInputsDetails[];
}

export class EmployeeAttendanceBreakUpDetails extends BaseModel {

    RequesterRemarks: string;
    Status: AttendanceBreakUpDetailsStatus;
    PayableDay: number;
    AttendanceType: number;
    AttendanceCode: string;
    IsFullDayPresent: boolean;
    TotalApprovedHours: number;
    TotalSubmittedHours: number;
    LastCheckedOut: string;
    FirstCheckIn: string;
    AttendanceDate: Date | string;
    YADId: number;
    AttendancePeriodId: number;
    AttendanceCycleId: number;
    EADetailsId: number;
    PISId: string;
    EmployeeId: number;
    ApproverRemarks: string;
    PendingAtRoleId : number;
    PendingAtUserId : number;
  
    FirstHalfEntitlementId: number;
    SecondHalfEntitlementId: number;
    AttendanceBreakUpDetailsType : AttendanceBreakUpDetailsType;
    LstEmployeeAttendancePunchInDetails: EmployeeAttendancePunchInDetails[]; 
    IsIsShiftSpanAcrossDays? : boolean;
    // Notes 

}
export enum AttendanceBreakUpDetailsType
{
    FullDayPresent = 100,
    FirstHalfLeave = 200,
    SecondHalfLeave = 300,
    FullDayLeave = 400
}

export class EmployeeAttendanceReversalDetails extends BaseModel {

    EmployeeId: number;
    EADetailsId: number;
    AttendanceCycleId: number;
    AttendancePeriodId: number;
    RevokingAttBreakupId: number;
    RevokingDate: Date | string;
    NoOfDays: number;
    ReferenceEmpAttBreakUpDetailsId: number;
    Status: number;
}

export class EmployeeVariableInputsDetails extends BaseModel {

    EADetailsId: string;
    PISId: number;
    EmployeeId: number;
    ProductId: number;
    ProductCode: string ;
    Amount: number;
    EmployeeDetailsId: number;
    Remarks: string;
}


export class EmployeeAttendancePunchInDetails extends BaseModel {

    EmployeeId: number;
    EmployeeAttendanceBreakUpDetailsId: number;
    Attendancedate: Date | string;
    Starttime: string;
    FinishTime: string;
    SubmittedHours: number;
    ApprovedHours: number;
    RequesterRemarks: string;
    ApproverRemarks: string;
    Status: number;
    PunchInCoordinates: GeoCoordinates;

    PunchOutCoordinates: GeoCoordinates;

    PunchInPhotoId: number;

    PunchOutPhotoId: number;
    PunchInRemarks: any;
    PunchOutRemarks : any;
}

export class SubmitAttendanceUIModel 
{
    LstEmployeeAttendanceBreakUpDetails : EmployeeAttendanceBreakUpDetails[];
    ModuleProcessAction : number; 
    Role : Role; 
}

export class SubmitRegularizedAttendanceUIModel 
{
    EmployeeIds : number[];
    TeamId : number;
    AttendancePeriodId : number;
    ModuleProcessAction : number; 
    Role : Role; 
}


export class GeoCoordinates {
    Latitude: any;
    Longitude: any;
    Altitude: any;

    // GetDistanceTo(toCoordinates: GeoCoordinates): number;

    // rad(x: number): number;
}

// export enum AttendanceBreakUpDetailsStatus
// {
//     SystemGenerated = 50,
//     EmployeeSaved = 100,
//     EMployeeSubmitted = 200,
//     ManagerSaved = 300,
//     ManagerSubmitted = 400,
//     ManagerRejected = 500,
//     ManagerApproved = 600,
//     ManagerRegularized = 700,
//     OpsSaved = 800,
//     OpsSubmitted = 900,
//     OpsRejected = 1000,
//     OpsRegularized = 1100, 
//     Approved = 11200
// }

export class RegularizeAttendanceEmployeeUIModel {
        EmployeeIds: number[];
        FromDate: Date | string;
        ToDate: Date | string;

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

    }