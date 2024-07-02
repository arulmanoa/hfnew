import { BaseModel } from "../Common/BaseModel";
import { TimeCard } from "../Payroll/TimeCard";
import { EmployeeAttendanceDetails } from "./EmployeeAttendanceDetails";

export class PayrollInputsSubmission extends BaseModel {
    EntitlementBalances: string;
    AttendanceCycle: AttendanceCycle;
    dtAttendanceData: any;
    MasterData: any;
    TimeCards: TimeCard[];
    MigratedOn: Date | string;
    IsMigrated: boolean;
    IsPayrollSubmitted: boolean;
    ApproverName: string; 
    Approvedby: number;
    ProxyRemarks: string;
    ProxyUserName: string;
    ProxyUserId: number;
    IsProxy: boolean;
    ManagerName: string;
    ManagerId: number;
    IsOpen: boolean;
    AttendanceCycleId: number;
    AttendancePeriodId: number;
    AttendanceStartDate: Date | string;
    AttendanceEndDate: Date | string;
    IsMustor: boolean;
    AttendancePeriodName: string;
    AttendanceTypes: string[];
    ClientId: number;
    ClientContractId: number;
    ClientContractName: string;
    TeamId: number;
    TeamName: string;
    ClientLocationId: number;
    ClientLocationName: string;
    ClientName: string;
    LstEmployeeAttendanceDetails: EmployeeAttendanceDetails[];
    EmployeeWiseAttendanceList: any[];
}


export class AttendanceCycle extends BaseModel {

    Code: string;
    Name: string;
    Description: string;
    StartDate: Date | string;
    EndDate: Date | string;
    LockedBy: string;
    Status: number;
    AttendancePeriods: AttendancePeriod[];
}


export interface AttendancePeriod extends BaseModel {

    AttendanceCycleId: number;
    AttendancePeriodName: string;
    StartDate: Date | string;
    EndDate: Date | string;
    IsOpen: boolean;
    Status: number;
    lstYearlyAttendanceDates: YearlyAttendanceDates[];
    IsOpenPeriod : boolean;
}

export interface YearlyAttendanceDates extends BaseModel {

    Year: number;
    AttendanceDate: Date | string;
    Status: number;
}