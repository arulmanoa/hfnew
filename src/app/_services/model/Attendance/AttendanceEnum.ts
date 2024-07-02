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

export enum HolidayCalendarType {
    Any = 0,
    Holidays = 1,
    NonPayableDays = 2
}

export enum EntitlementType {
    Leave = 1,
    Payment = 2,
    Reimbursement = 3
}

export enum EntitlementCycle {
    Daily = 10,
    Weekly = 20,
    Fortnightly = 30,
    Monthly = 40,
    Quarterly = 50,
    BiAnnual = 60,
    Annual = 70,
    Rule = 100,
    Eventual = 1000
}

export enum EntitlementCalendar {
    NormalCalendar,//1st jan to 31st dec
    AttendanceCalendar,//ex. 15th dec to 14th december
    PayCalender,//
    FinancialCalendar,
    DOJBased,
    Eventual
}//calendatr

export enum EntitlementCycleIdentifierType {
    None,
    FirstDay,//StartOfFirstDay,
    LastDay,
    DaysAfterFirstDay,
    DaysBeforeLastDay

}

export enum LeaveRangeConsiderationType {
    All,
    HolidaysOnly
}

export enum HolidayType {
    WeekOff,
    NonPayableDay,
    PublicHoliday,
    OtherNonWorkingDay
}

export enum DayType {
    FullDay,
    FirstHalf,
    SecondHalf
}

export enum Action {
    DontAllow,
    ConvertToLeave
}

export enum OccuranceType {
    Pre = 1,
    Post = 2,
    PreOrPost = 3,
    InBetween = 4,
    Any = 5
}

export enum UsageLimitType {
    None,
    Value,
    Difference,
    Percent
}

export enum RoundOffMmode {
    None,
    Nearest,
    Highest
}

export enum EntitlementUnitType {
    Year,
    Quarter,
    Month,
    Week,
    Day,
    Hour,
    Amount
}

export enum EntitlementRequestStatus {
    Applied = 100,
    Cancelled = 200,
    Rejected = 300,
    Approved = 400,
    Availed = 500,
    CancelApplied = 600
}

export enum AttendanceBreakUpDetailsStatus {
    SystemGenerated = 50,
    EmployeeSaved = 100,
    EMployeeSubmitted = 200,
    ManagerSaved = 300,
    ManagerSubmitted = 400,
    ManagerRejected = 500,
    ManagerApproved = 600,
    ManagerRegularized = 700,
    OpsSaved = 800,
    OpsSubmitted = 900,
    OpsRejected = 1000,
    OpsRegularized = 1100, 
    Approved = 11200
}

export enum EmployeeAttendancModuleProcessStatus {
    EmployeeSubmitAttendance = 30,
    ManagerSubmitAttendance = 30,
    OpsSubmitAttendance = 30
}

export enum AttendanceBreakUpDetailsType
{
    FullDayPresent = 100,
    FirstHalfLeave = 200,
    SecondHalfLeave = 300,
    FullDayLeave = 400
}

export enum ShiftChangeRequestStatus {
    Pending = 1,
    Approved = 2,
    Rejected = 3
}

