
export interface BiometricData {
    EmployeeCode: string;
    EmployeeId: number | string;
    AttendanceDate: Date | string | null;
    In_Time: any;
    LocationId: string | number;
    BiometricDeviceId: string | number;
    Remarks: string;
    Type: number | string;
    Half_Type: number; // only for breakShift type
    // ! only for UI purpose
    Time: any;
    BioMetricDeviceName: string;
    LocationName?: string;
    isPunchInOutEditable: boolean;
    isDeleteAllowed: boolean;
}

export enum SubmissionType {
    Biometric = 1,
    CalculateWorkingHoursAndAttendanceStatus = 2,
    RegularizationByEmployee = 3,
    RegularizationByEmployeeWithApprovalRequired = 4,
    RegularizationByHRWithNoApprovalRequired = 5
}

// Used in Detail Type Regularization
export enum AttendanceCode {
    Present = 1,
    Absent = 2,
    HalfADayPresent = 3
}

export enum ShiftType {
    NormalShift = 1,
    OpenShift = 2,
    BreakShift = 3
}

