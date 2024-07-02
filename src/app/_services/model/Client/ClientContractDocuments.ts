import { BaseModel } from "../Common/BaseModel";

export class ClientContractDocuments extends BaseModel {
        ClientContractId: number;
        DocumentId: number;
        FileName: string;
        DocumentCategory: number;
        DocumentType: number;
        ReferenceCode: string;
        Status: number;
        Remarks: string;
        SignedOn: Date | string;
        SignedBy: [];
        SignUpCenter: string;
    }   