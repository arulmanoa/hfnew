import { BaseModel } from "./Common/BaseModel";
import { UIMode } from "./Common/LoginResponses";
import { Rule } from "./Rule";




export class BankDetails extends BaseModel {
    Code: string;
    Name: string;
    AliasName: string;
    UniqueValidation: string;
    LstBankBranch: BankBranch[];
    Modetype: UIMode;
    Status:number;

}


export class BankBranch extends BaseModel {
    FinancialSystemCode:string;
    SwiftCode:string;
    Name: string;
    CountryId:number;
    Location:string;
    AddressDetails:string;
    Email:string;
    BankId:number;
    LstBankBranchOtherdetails:BankBranchOtherDetails[];
    Modetype: UIMode;
    Status:number;  
    
}
export class BankBranchOtherDetails {

}

