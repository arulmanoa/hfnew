import { BaseModel, UIMode } from "../Common/BaseModel";
import { Relationship, Claim } from "../Candidates/CandidateFamilyDetails";
import { CommunicationDetails } from "../Communication/CommunicationType";
import { CandidateDocuments } from "../Candidates/CandidateDocuments";

export class FamilyDetails extends BaseModel {
    Name: string;

    EmployeeId: number;

    RelationshipId: Relationship;

    DOB: Date | string;

    CommunicationDetailsData: string;

    CommunicationDetails: CommunicationDetails;

    Remarks: string;

    LstClaims: Claim[];

    Status: number;

    CandidateDocumentId: number;

    CandidateDocument: CandidateDocuments;

    Modetype: UIMode;

    IsEmployed: boolean;

    IsNominee: boolean;

    IsDependent: boolean;

    WeddingDate: Date | string;

    IsAlive: boolean;

    Occupation: number;

    FamilyEmployeeID: string;

    Salutation: number;
}
