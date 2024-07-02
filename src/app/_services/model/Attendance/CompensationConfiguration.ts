import { BaseModel } from "../Common/BaseModel";
import { Time } from "@angular/common";

export class CompensationConfiguration extends BaseModel {

    CompanyId: number;

    ClientId: number;

    ClientContractId: number;

    TeamId: number;

    Location: Location | any;

    EmployeeId: number;

    IsCompensationAllowed: boolean;

    AllowedClaimTypes: CompensationClaimType[];

    IsAllowedForWeekOff: boolean;

    IsAllowedForHoliday: boolean;

    ExpireDays: number;

    Status: boolean;

    CompensationCycleConfigurationList: any[] //list
}

export enum CompensationClaimType {
    None = 0,
    DecideLater = 100,
    Encash = 200,
    Leave = 300,
}


export class CompensationCycleConfiguration extends BaseModel {
    CompensationConfigurationId: number;

    CompensationCycleType: CompensationCycleType;

    MaxCompOffAllowed: number;

    Status: boolean;

}

export enum CompensationCycleType {
    Week = 300,
    CalendarMonth = 400,
    CalenderYear = 500,
    FinancialYear = 600,
    AttendancePeriod = 700
}
