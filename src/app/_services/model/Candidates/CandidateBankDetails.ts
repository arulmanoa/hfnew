import { BaseModel } from "../Common/BaseModel";
import { UIMode } from "../UIMode";
import { CandidateDocuments } from "./CandidateDocuments";
import { ObjectStorageDetails } from "./ObjectStorageDetails";

export class CandidateBankDetails extends BaseModel {

    CandidateId?: number;
    BankId?: number;
    BankBranchId?: number;
    BankBranchIdentifierType: BankBranchIdentifierType;
    IdentifierValue?: string;
    AccountNumber?: string;
    AccountHolderName?: string;
    SalaryContributionPercentage: number;
    IsDefault: boolean;
    Status?: number;
    DocumentId?: number;
    Modetype: UIMode;
    StorageDetails: ObjectStorageDetails;
    CandidateDocumentId?: number;
    CandidateDocument?: CandidateDocuments;
    
    VerificationMode ?:VerificationMode;
    VerificationAttempts ?: number;
    PayoutLogId ?: number;
    Remarks?: string;
    Attribute1? : string;

//         ConfirmedAccountNumber?: string;
//     IdentifierType?: number;
//     BankBranchType?: BankBranchType;
//     BranchCode?: string;

//     IsEditable?: boolean;
//     SalaryContributionPercentage?: CandidateDocuments;

}

export enum BankBranchIdentifierType {
    IFSC = 1,
    SWIFT = 2
}


export enum VerificationMode
{
    QcVerification = 1,
    PennyDrop = 2
   
}
