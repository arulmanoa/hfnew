import { BaseModel, UIMode } from "../Common/BaseModel";

export class IntegrationTransactionalDetails extends BaseModel {
    IntegrationMasterId: number | null;

    UniQueNumber: string;

    ExternalRequestId: string;

    AccessKey: string;

    IsFinalResponse: boolean;

    SourceData: string;

    ResponseData: string;

    IsSuccess: boolean | null;

    APIName: string;

    ErrorMessage: string;

    UserMessage: string;

    CustomData1: string;

    CustomData2: string;

    CustomData3: string;

    CustomData4: string;

    CandidateId: number;

    EmployeeId: number;

    PersonId: number;

    ModeType: UIMode;

    UniqueName: string;

    OTP: string;

    CompanyId: number;

    ClientId: number;

    ClientContractId: number;
}

export enum ExternalAPIType
    {
        AAdhar = 1,
        Bank,
        BioMetric,
        UAN,
        PAN
    }