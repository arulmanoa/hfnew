import { PayrollVerificationRequest } from './PayrollVerificationRequest';
import { BaseModel } from "../Common/BaseModel";


export class PayrollModel extends BaseModel {
    NewDetails?: PayrollVerificationRequest;
    OldDetails?: any;
    customObject1: any;
    customObject2: any;
}

export const _PayrollModel: PayrollModel = {

    NewDetails: null,
    OldDetails: null,
    customObject1: {},
    customObject2: {},
    Id: 0

}
