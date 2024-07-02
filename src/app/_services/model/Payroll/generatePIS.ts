import { ProcessCategory } from "./PayRun";

export class GeneratePIS {
    ClientId: Number;
    ClientContractId: number;
    TeamIds: any[];
    PayPeriodId: number;
    EmployeeIds: any[];
    PISId: number;
    PVRIds: number[];   
     IsDownloadExcelRequired: boolean;
    ObjectStorageId: number;
    RequestedBy: number;
    RequestedOn: number;
    GeneratedRecords: number;
    IsPushrequired: boolean;
    ProcessCategory : ProcessCategory;


    
}
