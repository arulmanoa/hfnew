import { BaseModel, UIMode } from "../Common/BaseModel";

export class CandidateLetterTransaction extends BaseModel {
    candidateId: number;
    LetterDocumentTypeId: number;
    EffectiveDate: string;
    DocumentId: number;
    Status: number;
    Modetype: UIMode;
}