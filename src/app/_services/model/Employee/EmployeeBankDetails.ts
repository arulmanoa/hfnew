import { BankBranchIdentifierType, VerificationMode } from "../Candidates/CandidateBankDetails";
import { ApprovalStatus, CandidateDocuments } from "../Candidates/CandidateDocuments";
import { UIMode } from "../Common/BaseModel";

export class EmployeeBankDetails
    {
        Id: number;

        EmployeeId: number;
        
        BankId: number;

        BankBranchId: number;


        BankBranchIdentifierType: BankBranchIdentifierType;

        IdentifierValue: string;

        AccountNumber: string;

       
        AccountHolderName: string;

        SalaryContributionPercentage: number;

        IsDefault: boolean;

        Status: ApprovalStatus;

        CandidateDocumentId: number;

        CandidateDocument: CandidateDocuments;


        LastUpdatedOn: Date | string;

        LastUpdatedBy: string;
        Modetype: UIMode;

        BankName: string;
        ModuleProcessTransactionId?: number;
        VerificationMode ?:VerificationMode;
        VerificationAttempts ?: number;
        PayoutLogId ?: number;
        Remarks?: string;
    }