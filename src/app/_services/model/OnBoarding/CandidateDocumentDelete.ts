import { BaseModel } from "../Common/BaseModel"

export class CandidateDocumentDelete extends BaseModel {

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
  Status: number;
  IsOtherDocument: boolean;
  storageDetails: string;
  Modetype: number;
  DocumentType: string;
  DocumentCategoryName: string;
  DocumentCategory: string;
 

}