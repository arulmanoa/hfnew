import { BaseModel } from "../Common/BaseModel";
import { Time } from "@angular/common";

export class AttendanceConfiguration extends BaseModel {
    Code: string; /// Dayshift, nightShift, generalShift

    Description: string; //  9:30 - 6:30

    ModeOfInput: ModeOfInput; // Web / Mobile, external system (swipes, ) // Done /// Any, web, mobile, swipe 

    IsPresentByDefault: boolean;  //To make default present for all working days, if not then default attendancetype is "UnMarked"  // current date have been updated as is present

    IsDailyPunchRequired: boolean; //to allow the emp to punch in and out from UI

    IsAllowMultiplePunches: boolean; // to allow the emp to punch in and out multiple times a day..so whats a day??
    //in ui while punch out..ask if this is their last signout.. if so dont allow further punch in

    IsAllowEmployeeToInputWorkingHours: boolean;  // to allow emp to edit worked hours manually

    IsUseDefaultWorkingHoursFromShiftDefinition: boolean; // this can be false only if dailypunch is enabled

    IsTimeCalculationRequiredBaseOnMultiplePunches: boolean; //consider this field only if daily punch is enabled. if this is false, FSI and LSO will be considered

    IsAutoPunchOutEnabled: boolean; //to let the system know if  punchout time to be automated

    AutoPunchOutSchedule: SimpleSchedule; // if not punched out post sometime, this would help to mark punch out // not done

    IsAllowToInputTimeForPunchIn: boolean; //if user forgets to punchin or due to internet prb, this allows to key in time
    //till what time can they edit?? or change time??

    IsAllowToInputTimeForPunchOut: boolean; //if user forgets to punchin or due to internet prb, this allows to key in time

    IsAllowToChangePunchOutIfAutoPunched: boolean;

    IsGeoFenceRequired: boolean; //to restrict user to punch in/out

    GeoFenceCoordinatesList: string; //list of geo fences to be accepted // its not there

    IsNetworkRestrictionRequired: boolean;  // to restrict user based on the internet connected to

    AllowedNetworkList: string; // list of networks to be accepted // ip address list is not there


    IsGeoTaggingRequired: boolean; //to store in the attendance // not done

    IsImageCaptureRequiredWhilePunchIn: boolean; //to store in the attendance 

    IsImageCaptureRequiredWhilePunchOut: boolean; //to store in the attendance 

    IsHoursBasedAttendanceTypeMarkingRequired: boolean; // to know if attewndancetype to be decided based of numberof hours worked

    AttendanceTypeMarkingScale: AttendanceTypeMarkingScale; //scale to beused to decide attendnce type

    //MinHoursToConsiderFullDayPresent: number;
    //MinHoursToConsiderHalfDayPresent: number;

    IsAllowToPunchOnHoliday: boolean;

    IsAllowToPunchOnNonPayableDay: boolean; // not done

    IsAllowToEditInAndOutTimesForPastDays: boolean; // to decided whether to allow employee to edit past days' in and out times and remarks(within attendance cycle / until prev prd is submitted)

    MaxPastDaysThatCanBeEdited: number; // if 0, alll past days with in att prd can be edited.. and they will become pending status again

    Status: number;

    GeoFenceCoordinatesMapping: any;

    IsAllowedToRequestForWOW: boolean;

    IsAllowedToRequestForWOH: boolean;
    CompensationConfiguration :any; 

    // ! : 16.2 for panasonic 
    IsEmployeeAllowToRegularizeAttendance: boolean;
    IsManagerAllowToEditEmployeesInOutTime: boolean;
    IsManagerAllowToMarkAsPresentOption: boolean;
    // ! for allen
    IsApprovalRequiredForEmployeeRegularization: boolean;
    IsLocationToBeDisplayed: boolean;
    IsMachineNameToBeDisplayed: boolean;
    IsRemarksToBeDisplayedForEachEntry: boolean;
    RegularizationType: RegularizationType;
}

export enum RegularizationType {
    Simple = 1, // default
    Detailed = 2
}



export enum DayOfWeek {

    Sunday = 0,
    Monday = 1,
    Tuesday = 2,
    Wednesday = 3,
    Thursday = 4,
    Friday = 5,
    Saturday = 6
}

export class WorkWeek {
    StartDay: DayOfWeek;
    EndDay: DayOfWeek;

}

export class AttendanceConfigurationMapping extends BaseModel {
    CompanyId: number;

    ClientId: number;

    ClientContractId: number;

    TeamId: number;

    EmployeeId: number;

    AttendanceCycleId: number;

    AttendanceConfigurationId: number;

    AttendanceDisplayShortCode: string;

    AttendanceDisplayName: string;

    Status: number;

    AttendanceConfiguration: AttendanceConfiguration;

}


export class AttendanceWorkflow {
    CompanyId: number;
    ClientId: number;
    ClientContractId: number;
    TeamId: number;
    EmployeeId: number;

    RoleId: number;

    AllowToViewAttenace: boolean;
    AllowToEditttenace: boolean;

    AllowToViewVariableInputs: boolean;
    AllowToEditVariableInputs: boolean;


}



export class test {
    Action: string;
    Isclosed: boolean;

}

//needs clarity
export class AttendanceTypeMarkingScale {
    From: number;
    To: number;

    AttendanceType: AttendanceType;
}

export enum AttendanceType {
    LOP,
    RevokeLOP,
    UnMarked,//--
    Present,//unsed for now
    OT,//unsed for now
    WorkingHoliday,//unsed for now
    SL,
    CL,
    PL,
    Leave,
    NonPaidDays

}

export enum AttendanceWorkFlowAction {
    PunchAttendance,//emp

    ApproveAttendance,//line mgr
    RejectAttendance,//line mgr

    RegularizeAttendance,//line mgr

    VariableInputs,//hr

    ClientSideFinalApprovalOfAttendace,//hr
    ClientSideFinalApprovalOfVariableInputs,//hr

    SubhmissionForProcessOfAttendance
}



export class SimpleSchedule {
    OccursAtATimeEveryDay: boolean;
    TriggerTime: Date | string;
    BufferTime: number;
}


export enum ModeOfInput {
    Any = 0,
    Web = 1,
    Mobile = 2,
    Swiping = 3
}




export const _SimpleSchedule: SimpleSchedule = {
    OccursAtATimeEveryDay: true,
    TriggerTime: new Date(),
    BufferTime: 0

}

export const _attendanceConfiguration: AttendanceConfiguration = {
    Id: 0,
    Code: "",

    Description: "",

    ModeOfInput: 0, // Web / Mobile, external system (swipes, ) // Done /// Any, web, mobile, swipe 

    IsPresentByDefault: true,  //To make default present for all working days, if not then default attendancetype is "UnMarked"  // current date have been updated as is present

    IsDailyPunchRequired: true, //to allow the emp to punch in and out from UI

    IsAllowMultiplePunches: true, // to allow the emp to punch in and out multiple times a day..so whats a day??
    //in ui while punch out..ask if this is their last signout.. if so dont allow further punch in

    IsAllowEmployeeToInputWorkingHours: true,  // to allow emp to edit worked hours manually

    IsUseDefaultWorkingHoursFromShiftDefinition: true, // this can be false only if dailypunch is enabled

    IsTimeCalculationRequiredBaseOnMultiplePunches: true, //consider this field only if daily punch is enabled. if this is false, FSI and LSO will be considered

    IsAutoPunchOutEnabled: true, //to let the system know if  punchout time to be automated

    AutoPunchOutSchedule: _SimpleSchedule, // if not punched out post sometime, this would help to mark punch out // not done

    IsAllowToInputTimeForPunchIn: true, //if user forgets to punchin or due to internet prb, this allows to key in time
    //till what time can they edit?? or change time??

    IsAllowToInputTimeForPunchOut: true, //if user forgets to punchin or due to internet prb, this allows to key in time

    IsAllowToChangePunchOutIfAutoPunched: true,

    IsGeoFenceRequired: true, //to restrict user to punch in/out

    GeoFenceCoordinatesList: null, //list of geo fences to be accepted // its not there

    IsNetworkRestrictionRequired: true,  // to restrict user based on the internet connected to

    AllowedNetworkList: "", // list of networks to be accepted // ip address list is not there


    IsGeoTaggingRequired: true, //to store in the attendance // not done

    IsImageCaptureRequiredWhilePunchIn: true, //to store in the attendance 

    IsImageCaptureRequiredWhilePunchOut: true, //to store in the attendance 

    IsHoursBasedAttendanceTypeMarkingRequired: true, // to know if attewndancetype to be decided based of numberof hours worked

    AttendanceTypeMarkingScale: null, //scale to beused to decide attendnce type

    //MinHoursToConsiderFullDayPresent: number;
    //MinHoursToConsiderHalfDayPresent: number;

    IsAllowToPunchOnHoliday: true,

    IsAllowToPunchOnNonPayableDay: true, // not done

    IsAllowToEditInAndOutTimesForPastDays: true, // to decided whether to allow employee to edit past days' in and out times and remarks(within attendance cycle / until prev prd is submitted)

    MaxPastDaysThatCanBeEdited: 0,// if 0, alll past days with in att prd can be edited.. and they will become pending status again

    Status: 1,
    GeoFenceCoordinatesMapping: null,
    IsAllowedToRequestForWOW: true,
    IsAllowedToRequestForWOH: true,
    CompensationConfiguration:[],
    
     // ! : 16.2 for panasonic 
     IsEmployeeAllowToRegularizeAttendance: false,
    
     IsManagerAllowToEditEmployeesInOutTime: false,
     IsManagerAllowToMarkAsPresentOption: false,
      // ! for allen
      IsApprovalRequiredForEmployeeRegularization: false,
     IsLocationToBeDisplayed: false,
     IsMachineNameToBeDisplayed: false,
     IsRemarksToBeDisplayedForEachEntry: false,
     RegularizationType : RegularizationType.Simple
}



export const _attendanceConfigurationMapping: AttendanceConfigurationMapping = {
    Id: 0,
    CompanyId: 0,
    ClientId: 0,
    ClientContractId: 0,
    TeamId: 0,
    EmployeeId: 0,
    AttendanceCycleId: 1,
    AttendanceConfigurationId: 0,
    AttendanceDisplayName: null,
    AttendanceDisplayShortCode: null,
    Status: 1,
    AttendanceConfiguration: _attendanceConfiguration

}






export class WorkShiftDefinition extends BaseModel {
    Code: string;
    Name: string;
    StartTime: Time | any;
    EndTime: Time | any;
    DefaultWorkingHour: Time | any;
    Status?: boolean;

}

export class WorkShiftDefinitionMapping extends BaseModel {
    CompanyId: number;
    ClientId: number;
    ClientContractId: number
    TeamId: number;
    EmployeeId: number;
    WSDId: number;
}

export const _workShiftDefinition: WorkShiftDefinition = {
    Id: 0,
    Code: '',
    Name: '',
    StartTime: '',
    EndTime: '',
    DefaultWorkingHour: ''
}

export const _workShiftDefinitionMapping: WorkShiftDefinitionMapping = {
    Id: 0,
    CompanyId: 0,
    ClientId: 0,
    ClientContractId: 0,
    TeamId: 0,
    EmployeeId: 0,
    WSDId: 0,

}

export class AttendanceGeoFencingCoordinateMapping {
    Id: number;
    CompanyId: number;
    ClientId: number;
    ClientContractId: number;
    TeamId: number;
    EmployeeId: number;
    Locations: Location | any;
    Status: number;
    IsLatest: number;


}

export class Location {

    Coordinates: Coordinates;
    Radius: number;



}

export class Coordinates {
    Latitude: number;
    Longitude: number;
}
export const _CoordinateData: Coordinates = {
    Latitude: 0.000,
    Longitude: 0.000
}

export const _Location: Location = {
    Coordinates: _CoordinateData,
    Radius: 0.000,
}
export const _AttendanceGeoFencingCoordinateMapping: AttendanceGeoFencingCoordinateMapping = {
    Id: 0,
    CompanyId: 0,
    ClientId: 0,
    ClientContractId: 0,
    TeamId: 0,
    EmployeeId: 0,
    Locations: _Location,
    Status: 0,
    IsLatest: 0
}





