import { BaseModel, UIMode } from "../Common/BaseModel";


    export class Allowance extends BaseModel
    {
        TimeCardId: number;

        Type: AllowanceType;

        ProductCode: string;

        ProductId: number;

        PayQuantity: number | null;

        PayUnitType: PayUnitType;

        PayUnitValue: number | null;

        Status: boolean;

        Remarks: string;

        Modetype: UIMode;
    }


    export enum AllowanceType
    {
        None = 0
    }
    export enum PayUnitType
    {
        None = 0,
        Amount = 1,
        Days = 2,
        Hours = 3
    }