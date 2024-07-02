import { ObjectStorageDetails } from "../Candidates/ObjectStorageDetails";


   export class ImportedPISLogData
   {
       Id: number;

       PISConfigurationId: number;

       CompanyId: number;

       ClientId: number;

       ClientContractId: number;

       PayPeriodId: number;

       ImportedOn: Date | string;

       ImportedBy: string;

       ImportedRecords: number;

       OutData: any;

       Remarks: string;

       ObjectStorageId: number;

       IsImported: boolean;

       ImportedFileDetails: ObjectStorageDetails;
   }