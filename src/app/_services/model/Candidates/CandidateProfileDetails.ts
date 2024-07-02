import { BaseModel, UIMode } from "../Common/BaseModel";
import { ObjectStorageDetails } from "./ObjectStorageDetails";

export enum CandidateSourcingType {
    IParse = 0,
    UI = 1,
    Others = 2
}

export enum CandidateSource {
    UI = 0,
    Naukri = 1,
    Shine = 2,
    LinkedIn = 3,
    InDeed = 4
}

export class CandidateProfileDetails extends BaseModel {
    CandidateId: number;
    ProfileSummary: string;
    DocumentId: number;
    IsDefault: boolean;
    IsActive: boolean;
    Status: number;
    Modetype: UIMode;
    StorageDetails: ObjectStorageDetails;
}

export class CandidateSourceHistory {
    Id: number;
    SourcedBy: CandidateSourcingType;
    SourcedFrom: CandidateSource;
    CandidateId: number;
    LastActiveDate: string;
    ProfileLastModifiedDate: string;
    ExternalRefId: string;
    LastUpdatedOn: string;
    IsEditable: boolean;
}