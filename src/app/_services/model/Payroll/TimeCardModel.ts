import { BaseModel } from "../Common/BaseModel";
import { TimeCard } from "./TimeCard";


export class TimeCardModel extends BaseModel {
    NewDetails?: TimeCard;
    OldDetails?: any;
    customObject1: any;
    customObject2: any;
}

export const _TimeCardModel: TimeCardModel = {

    NewDetails: null,
    OldDetails: null,
    customObject1: {},
    customObject2: {},
    Id: 0

}
