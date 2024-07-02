

export class Scale {

    Id: number;
    Code: string;
    Name: string;
    Description: string;
    CustomFieldsConfigData: string;
    ScaleDetailsData: string;
    LstCustomFieldsConfig :CustomFields [];
    LstScaleDetails : ScaleDetails [];
    Status: number;
}


export const _Scale: Scale = {
    Id: 0,
    Name: "",
    Code: "",
    Description: "",
    CustomFieldsConfigData: "",
    ScaleDetailsData: "",
    LstCustomFieldsConfig: null,
    LstScaleDetails: null,
    Status: 0,
};



export class ScaleDetails {
    Effectivedate: Date;
    ScaleType: number;
    LstScaleRange: ScaleRanges[];
    Status :number;
    Modetype: number; 
    Id: number;
    // id:number;
    
}

export class ScaleRanges {
    RangeFrom : number;
    RangeTo  : number;
    IsStringBased : boolean;
    RangeValue  : number;
    RangeValue2  : number;
    RangeStringValue : string;
    RangeStringValue2 : string;
    ScaleCalculationType : CalculationType [];
    CustomFieldValues : CustomFields[]
    Id : number;

}

export class CustomFields {
    customDataType : CustomDataType [];
    CustomObjectName : string;
    CustomObjectvalue : object;

}

export enum CustomDataType {
    Numeric= 1,
    Boolean = 2,
    Text = 3,
}

export enum ScaleType {
    First_Fit = 1,
    Reducing_Balance = 2
}

export enum CalculationType {
    Fixed = 1,
    Percentage = 2
}
