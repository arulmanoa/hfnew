export class OfferInfo {

    IndustryList: IndustryList[];
    ClientLocationList: ClientLocationList[];
    ClientReportingLocationList :  ClientLocationList[];
    LstCostCityCenter : LstCostCityCenter[];
    LstClientZone : LstClientZone[];
    PayGroupList: PayGroupList[];
    SkillCategoryList: SkillCategoryList[];
    ZoneList: ZoneList[];
    EmploymentTypeList : any[];
    LstEmployeeDesignation : LstSubEmploymentType[];
    ReportingManagerList : ReportingManagerList[];
    LstEmployeeCategory: LstEmployeeCategory[];
    LstEmployeeDepartment: LstEmployeeDepartment[];
    LstEmployeeDivision: LstEmployeeDivision[];
    LstEmployeeLevel: LstEmployeeLevel[];
    LstSubEmploymentType: LstSubEmploymentType[];
    LstJobProfile: LstJobProfile[];
    ClientCityList : any[];
}

export class IndustryList {
    Id: number;
    Name: string;
}
export class ClientLocationList {

    Id: number;
    LocationCode: string;
    LocationName: string;
    StateName: string;
    StateId: number;
    ClientId: number;
    CityId: number;
    CityName : string;
    DefaultSkillCategoryId? : number;
    DefaultZoneId? : number;


}
export class PayGroupList {

    ClientContractId: number;
    PayGroupId: number;
    Code: string;
    Name: string;
    SalaryBreakupType: number;
}

export class SkillCategoryList {

    Id: number;
    Code: number;
    Description: string;
    Name: string;
}
export class ZoneList {

    Id: number;
    Code: number;
    Description: string;
    Name: string;
}

export class LetterTemplateList {

    TemplateId: number;
    ClientContractId: number;
    ClientId: number;
    RequestType: number;
    Code: number;
    Name: string;
    companyId: number;
}

export class LstCostCityCenter {
    Code : string;
    Id : number;
    Name : string;
}

export class LstEmployeeDivision {
    Code : string;
    Id : number;
    Name : string;
}
export class LstSubEmploymentType {
    Code : string;
    Id : number;
    Name : string;
}

export class LstEmployeeLevel {
    Code : string;
    Id : number;
    Name : string;
}
export class LstJobProfile {
    Code : string;
    Id : number;
    Name : string;
}

export class ReportingManagerList {
    TeamId : number;
    ManagerId : number;
    ManagerName : string;
}

export class LstEmployeeCategory {
    Code : string;
    Id : number;
    Name : string;
}
export class LstEmployeeDepartment {
    Code : string;
    Id : number;
    Name : string;
}

export class LstEmployeeDesignation {
    CategoryId : string;
    Code : number;
    Id : string;
    LevelId : number;
    Name : string;
    SkillCategoryId : number;
}

 export class LstClientZone {
    Code : string;
    Id : number;
    Name : string;
 }
