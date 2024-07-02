
import { BaseModel } from "../Common/BaseModel";
import { PayRun } from './PayRun';

export class PayRunModel extends BaseModel {
    NewDetails?: PayRun;
    OldDetails?: any;   
    customObject1: any;
    customObject2: any;
}

export const _PayRun: PayRunModel = {

    NewDetails: null,
    OldDetails: {},
    customObject1: {},
    customObject2: {},
    Id: 0

}