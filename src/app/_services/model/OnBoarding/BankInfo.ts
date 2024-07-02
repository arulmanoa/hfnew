
export class BankInfo {

    BankList: BankList[];
    BankDocumentCategoryList:BankDocumentCategoryList[];
} 

export class BankList {

    Id: number;
    Code: string;
    Name : string;
} 
export class BankDocumentCategoryList {

    Id: number;
    Code: string;
    Name : string;
    DocumentTypeId:number;
    DocumentCategoryId:number;
} 