import { BaseModel } from "../Common/BaseModel";
import { Time } from "@angular/common";

export class AvailCompensationModel extends BaseModel {
    EmployeeEntitlementId: number
    AppliedFrom: Date | string
    IsAppliedFromSecondHalf: boolean
    IsAppliedForFirstHalf: boolean
    AppliedTill: Date | string
    IsAppliedTillFirstHalf: boolean
    IsAppliedTillSecondHalf: boolean
    CompensationDetails: any
}