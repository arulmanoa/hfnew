import { MandateRequirementDetails } from './MandateRequirementDetails';
import { LoginSessionDetails } from './LoginSessionDetails';
import { SessionDetails } from './SessionDetails';
import { MandateTransaction } from './MandateTransaction';

export class MandateAssignmentDetails {
    Id: number;
    MandateDetailsID: number;
    AssignmentParentID: number;
    MandateDelegatedTo: number;
    ManagerID: number;
    DelegatedBy: number;
    DelegationDate: string;
    TargettedResourcesNumber: number;
    TargettedClosureDate: Date;
    Accepted: number;
    Status: number;
    AcceptedOn: Date;
    AcceptedBy: number;
    Remarks: string;
    LastUpdatedOn: Date;
    LastUpdatedBy: string;
    LstMandateTransaction?: MandateTransaction[];
}




export class MandatesDetails {
    Id: number;
    ClientID: number;
    PSAID: number;
    EnquiryReferenceID: number;
    PO_Number: string;
    AccountManagerID: number;
    MandateTypeId: number;
    CategoryId: number;
    RequestedBy: number;
    RequestedOn: Date;
    JobTitle: string;
    FunctionalAreaId: number;
    KeySkills: string;
    QualificationId: number;
    Confidential: Boolean;
    SelfAllocate: Boolean;
    Exclusive: Boolean;
    TargetIndustryId: number;
    TargetCompanies: string;
    NoPoachCompanies: string;
    GenderPreference: number;
    Remarks: string;
    Status: number;
    LastUpdatedOn: Date;
    LastUpdatedBy: string;
    NoticePeriodRestriction: number;
    ListRequirementDetails?: MandateRequirementDetails[];
    LstDocumentDetails?: MandateDocuments[];
    FileNames: string[];

}

export class MandatesDetailsView extends MandatesDetails {
    MandateTypeName?: string;
    ClientName?: string;
    CategoryName?: string;
    FunctionalAreaName?: string;
    JobTypeName?: string;
    ClientContactName?: string;
    QulificationName?: string;
    SelfAllocateName?: string;
    ConfidentialName?: string;
    ClientContractName?: string;
    TargetIndustryName?: string;
    GenderName?: string;
    StateName?: string;
    CityName?: string;
}

export class MandatesDetailsUpdate {
    SessionDtls?: LoginSessionDetails;
    OldmandatesDetails?: MandatesDetails;
    NewmandatesDetails?: MandatesDetails;
}


export class MandateDocuments {
    Id?: number;
    RefId?: number;
    DocumentId?: number;
    RefCode?: string; // add code value from MandatesRequirements
    Status?: number;
    DocCategoryId?: number;
    LastUpdatedOn?: Date;
    LastUpdatedBy?: string;
    FileName?: string;
}




