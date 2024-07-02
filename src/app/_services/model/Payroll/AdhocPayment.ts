import { BaseModel, UIMode } from "../Common/BaseModel";
import { AdjustmentType } from "./Adjustment";
import { BillUnitType, PayUnitType } from "./TimeCard";



export class  AdhocPayment extends BaseModel {
    TimeCardId: number;

    Type: AdhocPaymentType;

    ProductId: number;

    ProductCode : string;

    DisplayName: string;

    PayQuantity: number | null;

    PayUnitType: PayUnitType;

    PayUnitValue: number | null;

    BillQuantity : number;

    BillUnitType : BillUnitType;

    BillUnitValue : number;

    Status: AdhocPaymentStatus;

    Remarks: string;
    Modetype: UIMode;
}


export enum AdhocPaymentStatus
{
    InActive = 0,
    Active = 100
}


export enum AdhocPaymentType
{
    None = 0
}
