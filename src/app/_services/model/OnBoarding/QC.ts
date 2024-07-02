import { CandidateOfferDetails } from "../Candidates/CandidateOfferDetails";
import { CandidateDocuments } from "../Candidates/CandidateDocuments";
import { SourceType } from "../Candidates/CandidateOfferDetails";
import { OnBoardingType, } from "../Base/HRSuiteEnums";
import { CandidateLetterTransaction } from "../Candidates/CandidateLetterTransaction";
import { CandidateStatutoryDetails } from "../Candidates/CandidateOtherData";
export class CandidateQualityCheckModel {
    ClientName: string;
    CandidateId: number;
    ModuleTransactionId: number;
    CandidateName: string;
    CandidateDetails: string;
    ClientSpocDetails: string;
    OnBoardingType: OnBoardingType;
    SourceType: SourceType;
    InitiatedDetails: string;
    SubmittedDetails: string;
    ClientId:number;
    ClientContractId:number;
    LstCandidateStatutoryDtls:CandidateStatutoryDetails[];
    ClientApprovals: ClientApproval[]; 

    LstGeneral: DocumentApprovalData[];

    LstBankDetails: DocumentApprovalData[];

    LstWorkExperiences: DocumentApprovalData[];

    LstEducation: DocumentApprovalData[];

    LstStatutory: DocumentApprovalData[];

    CandidateOfferDetails: CandidateOfferDetails;
    LstCandidateDocuments: CandidateDocuments[];

    OverallApprovalStatus: ApprovalStatus;

    LstLetterTransaction:CandidateLetterTransaction[];
    LstCandidateIdentity : any[] = [];
    OverallRemarks: string;
    LstRateSet : any;
    ProcessStatusId : any;
    ProposedDOJ : any;
    ActualDOJ : any;
    IsNapsBased : boolean;
    NapsContractCode : string;
    ApprenticeCode : string;

}

export class ClientApproval {
    ApprovalFor: ApprovalFor;
    ApprovalType: ApprovalType;
    ApprovalStatus: ApprovalStatus;
    Remarks: string;
    ObjectStorageId: number;
    displayOrder: number; 
    DocumentName: string;

}

export class DocumentApprovalData {
    CandidateDocumentId: number;
    Name: string;
    Details: string;
    ApprovalStatus: ApprovalStatus;
    Remarks: string;
    ObjectStorageId: number;
    displayOrder: number;
    DocumentName: string;
    VerificationMode? : any;
    VerificationRemarks? : any;

}


export enum ApprovalStatus {
    Pending = 0,
    Approved = 1,
    Rejected = 2

}
export enum ApprovalFor {
    OL=1,
    AL=2,
    MinimumWagesNonAdherence=3,
    CandidateJoiningConfirmation=4,
    Others=5,
    ELC = 6,
    RequestForNewDOJ =7,
    ContractLetter =8,
    EvaluationSheet = 9

}

export enum ApprovalType {
    Internal = 1,
    External = 2
}
export class CandidateOnboardingDetailsModel {
    Id:number;
    DateOfBirth: string;
      Gender: string;
      Nationality: string;
      CandidateName: string;
      CurrentDesignation: string;
      WorkLocation: string;
      ContactNumber: number;
      PrimaryEmailstring: string;
      OfferedDesignation: string;
      JobTitle: string;
      DateOfJoining: string;
      ContractEndDate: string;
      ActualDOJ: string;
      CountryName: string;
      StateName: string;
      LocationName: string;
      CTC: number;
      ClientName: string;
      ClientSPOC: string;
      ClientContract: string;
      Graduation: string;
      EducationDegree: string;
      ScoringType: string;
      ScoringValue: number;
      Institution: string;
      University: string;
      YearOfPassing: number;
      ExCompany: string;
      ExDesignation: string;
      ExWorklocation: string;
      YearOfExperiance: number;
      LastDrawnSalary: number;
      ExStartDate: string;
      ExEndDate: string;
      PrimarySkillName: string;
      Specialization: string;
      SkillExperience: number;
      WorkPermitCountry: string;
      WorkPermitType: string;
      WorkPermitValidFrom: string;
      WorkPermitValidTill: string;
      BankName: string;
      AccountNumber: number;
      AccountHolderName: string;
      BankBranchName: string;
      IsPreviouslyEmployed: string;
      PFNumber: number;
      UAN: number;
      ESICNumber: number;
      PAN: number;
      CV: string;
      PrimaryEmail: string;
      ClientContact : string;
      ClientSpocDetails : string;
}
