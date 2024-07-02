export class Statutory {
  
    StatutoryType: number;
    EffectiveDate:Date;
    IsApplicable: boolean;
    ScaleId: number;
    ScaleCode: string;
    ScaleDetails: string;
    ApplicableMonths:[];

}

export const _Statutory: Statutory = {
    StatutoryType: 0,
    EffectiveDate: new Date(),
    IsApplicable: false,
    ScaleId: 0,
    ScaleCode: "",
    ScaleDetails: null,
    ApplicableMonths:[],
};



export class ScaleDetails {
    Effectivedate: Date;
    ScaleType: number;
    LstScaleRange: string;
    
}