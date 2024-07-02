import { ObjectStorageDetails } from "./Candidates/ObjectStorageDetails";

export class GenericImportLogData {

        IsImported: boolean;
        ObjectStorageId: number;
        Remarks: string;
        OutData: any;
        ImportedRecords: number;
        ImportedBy: string;
        ImportedOn: Date | string;
        PayPeriodId: number;
        TeamId: number;
        ClientContractId: number;
        ClientId: number;
        CompanyId: number;
        ImportConfigurationId: number;
        ImportType: ImportType;
        Id: number;
        ImportedFileDetails: ObjectStorageDetails;
        EmploymentContracts: any[];
    }

    export enum ImportType
    {
        Master = 0,
        NewJoinee = 1,
        SalaryRevision = 2,
        InvesmentDeclaration = 3
    }