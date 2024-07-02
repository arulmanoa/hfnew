import { BaseModel } from "../Common/BaseModel";
import { ObjectStorageDetails } from "./ObjectStorageDetails";
import { UIMode } from "../Common/LoginResponses";
import { DocumentCategory } from "../Document/DocumentCategory";

export class CandidateDocuments extends BaseModel {
    CandidateId: number;
    IsSelfDocument: boolean;
    DocumentId: number;
    DocumentCategoryId: number;
    DocumentTypeId: number;
    DocumentNumber: string;
    FileName: string;
    Remarks: string;
    ValidFrom: string;
    ValidTill: string;
    Status: ApprovalStatus;
    IsOtherDocument: boolean;
    StorageDetails: ObjectStorageDetails;
    Modetype: UIMode;
    DocumentType: DocumentType;
    DocumentCategoryName: string;
    DocumentCategory: DocumentCategory;
    DocumentTypeName: string;
    EmployeeId?: any;
    DocumentVerificationMode?: DocumentVerificationMode;
    IsDisablityProof?: boolean;
    RemarksHistory: DocumentRemarks[];
}
export enum DocumentVerificationMode {
    QcVerification = 1,
    KYC = 2

}

export enum ApprovalStatus {
    Pending = 0,
    Approved = 1,
    Rejected = 2

}

export class DocumentRemarks {
    Remarks: string;
    ModuleProcessActionTransactionId: number;
    RoleId: number;
}