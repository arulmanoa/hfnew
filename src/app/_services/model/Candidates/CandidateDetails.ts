import { BaseModel } from "../Common/BaseModel";
import { Gender, Nationality, MaritalStatus, BloodGroup } from "../Base/HRSuiteEnums";
import { Qualification, WorkExperience, SkillDetails, WorkPermit, CandidateCareerDetails } from "./CandidateCareerDetails";
import { CandidateCommunicationDetails } from "./CandidateCommunicationDetails";
import { UIMode } from "../UIMode";
import { CandidateOfferDetails } from "./CandidateOfferDetails";
import { CandidateLetterTransaction } from "./CandidateLetterTransaction";
import { CandidateFamilyDetails } from "./CandidateFamilyDetails";
import { CandidateDocuments } from "./CandidateDocuments";
import { ApprovalStatus } from "./CandidateDocuments";
import { CandidateProfileDetails } from "./CandidateProfileDetails";
import { CandidateBankDetails } from "./CandidateBankDetails";
import { CandidateOtherData } from "./CandidateOtherData";
import { CandidateMandateMapping } from "./CandidateMandateMapping";
import { EntityType } from "../Base/EntityType";
import { DynamicFieldDetails } from "../OnBoarding/DynamicFIeldDetails";
import { EmploymentReferenceDetails } from "./EmploymentReferenceDetails";
import { LanguagesKnownDetails } from "./LanguagesKnownDetails";
import { AdditionalOperationalDetails } from "./AdditionalOperationalDetails";

export enum CandidateStatus {
    Active = 1,
    InaAtive = 0
}

export enum RecordStatus {
    Active = 1,
    InaAtive = 0
}

export class CandidateDetails extends BaseModel {
    FirstName: string;
    LastName: string;
    PhotoStorage: string;
    DateOfBirth: string;
    Gender: Gender | any;
    Nationality: Nationality;
    CountryOfOrigin: number;
    MaritalStatus: MaritalStatus | any;
    BloodGroup: BloodGroup | any;
    IsDifferentlyabled: boolean;
    DisabilityPercentage: number;
    Status: CandidateStatus;
    Qualifications: Qualification[];
    WorkExperiences: WorkExperience[];
    LstSkillDetails: SkillDetails[];
    WorkPermits: WorkPermit[];
    LstCandidateOfferDetails: CandidateOfferDetails[];
    LstCandidateLetterTransaction: CandidateLetterTransaction[];
    CandidateCommunicationDtls: CandidateCommunicationDetails;
    LstCandidateFamilyDetails: CandidateFamilyDetails[];
    LstCandidateDocuments: CandidateDocuments[];
    LstCandidateProfileDetails: CandidateProfileDetails[];
    LstCandidateBankDetails: CandidateBankDetails[];
    CandidateCareerDtls: CandidateCareerDetails;
    CandidateOtherData: CandidateOtherData;
    CandidateMandateMapping: CandidateMandateMapping;
    Modetype: UIMode;
    ExternalApprovals:Approvals[];
    DynamicFieldsValue: DynamicFieldDetails;
    RelationshipId: number;
    RelationshipName: string;
    IsAadhaarKYCVerified: boolean;
    IsUANKYCVerified: boolean;
    IsPANKYCVerified : boolean;
    NameasPerProof? : string;
    DOBasPerProof? : string;
    MarriageDate? : Date | any;
    Religion? : number;
    SpouseName : string;
    MotherName : string;  

    EmploymentReferenceDetails: EmploymentReferenceDetails[];
    LanguagesKnownDetails: LanguagesKnownDetails[];
    AdditionalOperationalDetails: AdditionalOperationalDetails;
}

export class CandidateObjectData extends BaseModel {
    CandidateId: number;
    CandidateData: string;
}

export class Approvals extends BaseModel
{ 
   
    EntityType: EntityType;

    EntityId: number;

    ApprovalFor: ApprovalFor;

    ApprovalType: ApproverType;

    Remarks: string;

    DocumentName: string; // file name 

    ObjectStorageId: number;

    IsApproved: boolean;

    Status: ApprovalStatus;

    Modetype: UIMode;

    RejectionRemarks: string;
}


export enum ApprovalType
{
   Online=1,
   Attachment=2
}

export enum ApprovalFor {
    OL=1,
    AL=2, 
    MinimumWagesNonAdherence=3,
    CandidateJoiningConfirmation=4,
    Others = 5,
    ELC = 6,
    RequestForNewDOJ =7,
    ContractLetter =8,
    EvaluationSheet = 9
}

export enum ApproverType {
    Internal=1,
    External=2
}



export class DuplicateCandidateDetails {
    // CandidateId: number;
    // FirstName: string;
    // LastName: string;
    // dateOfBirth: Date | string | null;
    // PrimaryMobile: string;
    // PrimaryEmail: string;
    // NameExists: boolean;
    // MobileExists: boolean;
    // EmailExists: boolean;
    // Remarks: string;
    // ExistingCandidateId: number;
    // OfferStatus: number;
    // ClientName: string;
    // ClientContractName: string;
    // LocationName: string;
    // OpsName: string;
    // OpsEmail: string;
    // OpsMobile: string;
    // ContractEndDate: Date | string | null;
    // LastPayrollMonth: string;
    CandidateId: number;
    FirstName: string;
    LastName: string;
    dateOfBirth: Date | string | null;
    PrimaryMobile: string;
    PrimaryEmail: string;
    NameExists: boolean;
    MobileExists: boolean;
    EmailExists: boolean;
    Remarks: string;
    ExistingCandidateId: number;
    OfferStatus: number;
    ClientName: string;
    ClientContractName: string;
    Aadhaar: string;
    PAN: string;
    UAN: string;


    LocationName: string;

    OpsName: string;

    OpsEmail: string;
    OpsMobile: string;

    ContractEndDate: string;
    LastPayrollMonth: string;

    Id: number | null;
    ApprenticeCode? : string;
    EntityType? : number;
    EntityId : number;

}