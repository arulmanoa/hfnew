import { BaseModel, UIMode } from "../Common/BaseModel";
import { AdjustmentType } from "./Adjustment";
import { BillUnitType, PayUnitType } from "./TimeCard";



export class Expense extends BaseModel {
    TimeCardId: number;

    Type: ExpenseType;

    ProductId: number;

    DisplayName: string;

    PayQuantity: number | null;

    PayUnitType: PayUnitType;

    PayUnitValue: number | null;

    BillQuantity : number;

    BillUnitType : BillUnitType;

    BillUnitValue : number;

    Status: ExpenseStatus;

    Remarks: string;
    Modetype: UIMode;
}


export enum ExpenseStatus
{
    InActive = 0,
    Active = 100
}


export enum ExpenseType
{
    None = 0
}
