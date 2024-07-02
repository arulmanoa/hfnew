import { BaseModel } from "../Common/BaseModel";



export class ObjectStorageDetails extends BaseModel {

    OriginalObjectName: string;
    StorageContainerId: number;
    ObjectCategoryId: number;
    ObjectCategoryName: string;
    URI: string;
    Path: string;
    ObjectName: string;
    SizeInKB: number;
    Attribute1: string;
    Attribute2: string;
    Attribute3: string;
    Attribute4: string;
    Attribute5: string;
    Attribute6: string;
    ReplaceCount: number;
    Status: boolean;
    Type: number;
    PayrollMonth: string;
    CompanyId: number;
    ClientId: number;
    ClientContractId: number;
    CompanyCode: string;
    ClientCode: string;
    ClientContractCode: string;
    PayrollMonthAndYear: string;
    CandidateId: number;
    InvoiceNumber: string;
    PayPeriodId: string;
    EmployeeId: number;
    EmployeeCode: string;
    PersonId: string;
    FinancialYear: string;
    InvoiceId: string;
    Content: []; // maz limit 512kb 

}
