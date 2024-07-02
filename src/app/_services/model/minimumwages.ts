export class Minimumwages {
    Id: number;
    StateId:number;
    //StateName:string;
    ZoneId:number;
    //ZoneName:string;
    IndustryId:number;
   // IndustryName:string;
    SkillCategoryId:number;
    //SkillCategoryName:string;
    ProductId:number;
    //ProductName:string;
    ProductCode:string;
    ProductValue:number;
    EffectiveDate:Date;
    Modetype: number;  
    Status:number;
}

export const _Minimumwages: Minimumwages ={
    Id: 0,   
    StateId:0,
    //StateName:"",
    ZoneId:0,
   //ZoneName:"",
    IndustryId:0,
    //IndustryName:"",    
    SkillCategoryId:0,
   // SkillCategoryName:"",
    ProductId:0, 
    //ProductName:"",
    ProductCode:"",
    ProductValue:0,
    EffectiveDate:new Date(),
    Modetype: 0,
    Status:0,
}