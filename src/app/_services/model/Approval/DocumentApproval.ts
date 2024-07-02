import { EntityType } from "../Base/EntityType";
import { BaseModel } from "../Common/BaseModel";
import { UIMode } from "../UIMode";

export class DocumentApproval extends BaseModel {
    
    EntityType : EntityType;
    EntityId : number;
    RefrenceObject : string;
    DocumentApprovalFor : DocumentApprovalFor;
    DocumentApprovalType : DocumentApprovalType;
    DocumentName : string;
    ObjectStorageId : number;
    Remarks : string;
    SystemRemarks : string;
    Status : DocumentApprovalStatus;
    ModeType : UIMode;

    //UI Only
    UIStatus : DocumentApprovalStatus;
}


export enum DocumentApprovalFor
{
    OL = 1,
    AL = 2,
    MinimumWagesNonAdherence = 3,
    CandidateJoiningConfirmation = 4,
    Others = 5,
    ELC = 6
}

export enum DocumentApprovalType
{
    Internal = 1,
    External = 2
}

export enum DocumentApprovalStatus
{
    Deleted = 0,
    Pending = 1,
    Rejected = 2,
    PartiallyApproved = 3,
    Approved = 4
}