import { BaseModel, UIMode } from "../Common/BaseModel";
import { CommunicationDetails } from "../Communication/CommunicationType";
import { CandidateDocuments } from "./CandidateDocuments";

export enum Relationship {
    Father = 1,
    Mother = 2,
    Spouse = 3,
    Son = 4,
    Daughter = 5,
    Guardian = 6,
    Father_in_law = 7,
    Mother_in_law = 8,
   
}

export enum ClaimType {
    PF = 1,
    ESIC = 2,
    Insurance = 3,
    Gratuity = 4
}

export class CandidateFamilyDetails extends BaseModel {
    Name: string;
    CandidateId?: number;
    RelationshipId: number;
    DOB: string;
    CommunicationDetailsData?: string;
    CommunicationDetails?: CommunicationDetails;
    Remarks?: string;
    ClaimData?: string;
    LstClaims: Claim[];
    Status?: number;
    CandidateDocumentId?: number;
    CandidateDocument?: CandidateDocuments;
    Modetype?: UIMode;
    IsEmployed: boolean;
    
    IsNominee : boolean;
    IsDependent : boolean;
    WeddingDate : string;
    IsAlive : boolean;
    FamilyEmployeeID : string;
    Occupation : number;
    Salutation: number;
}

export class Claim {
    ClaimType: ClaimType;
    Percentage: number;
    Remarks: string;
}

export class RelationShip {
    Id: number;
    Code: string;
    Name: string;
}

export class _CustomCandidateFamilyDetails {

    Name: string;
    RelationshipId: number;
    DOB: string;
    LstClaims: Claim[];
    IsEmployed: boolean;

}