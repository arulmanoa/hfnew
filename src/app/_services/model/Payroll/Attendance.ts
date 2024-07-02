import { UIMode } from "../Common/BaseModel";
import { BaseModel } from "../Common/BaseModel";

export class Attendance extends BaseModel {
    
    TimeCardId: number;

    FromDate: Date | string | null;

    ToDate: Date | string | null;

    NumberOfDays: number | null;

    NumberOfHours: number | null;

    IsFirstDayHalf: boolean;
    IsSecondDayHalf? : boolean;

    Type: AttendanceType;

    //        //FromTime: TimeSpan | null;

    //        //ToTime: TimeSpan | null;

    ReferencedTimeCardId: number | null;

    Modetype: UIMode;
    EmployeeId? : number;
    AttendancePeriodId? : number;
}


export enum AttendanceType {
    // LOP =0,
    // RevokeLOP =1,
    // Present =2,//unsed for now
    // OT =3,//unsed for now
    // WorkingHoliday =4,//unsed for now
    // SL =5,
    // CL =6,
    // PL =7,

    LOP = 0,
    RevokeLOP =1,
    UnMarked =2,//--
    Present = 3,//unsed for now
    OT =4,//unsed for now
    WorkingHoliday =5,//unsed for now
    SL =6,
    CL =7,
    PL =8,
    Leave =9,
    NonPaidDays =10, 
    EL = 11

}