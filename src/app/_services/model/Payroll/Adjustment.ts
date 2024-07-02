import { BaseModel, UIMode } from "../Common/BaseModel";

    export class Adjustment extends BaseModel
    {

        TimeCardId: number | null;

        Type: AdjustmentType;

        ProductId: number;

        PayQuantity: number | null;

        PayUnitType: PayUnitType;

        PayUnitValue: number | null;

        BillQuantity: number | null;

        BillUnitType: BillUnitType;

        BillUnitValue: number | null;

        ImpingeOnRevision: boolean;

        Remarks: String;

        Status: boolean;

        ProductTypeId: number;

        Modetype: UIMode;
    }



    export enum AdjustmentType
    {
        None = 0,
        Markup = 1
    }
    export enum PayUnitType
    {
        None = 0,
        Amount = 1,
        Days = 2,
        Hours = 3
    }
    export enum BillUnitType
    {
        None = 0,
        Amount = 1,
        Days = 2,
        Hours = 3
    }