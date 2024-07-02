import { BaseModel } from "../Common/BaseModel";
import { UIMode } from "../UIMode";

export class LanguagesKnownDetails extends BaseModel {

    CompanyId: number;
    ClientId: number;
    ClientContractId: number | null;
    CandidateId: number | null;
    EmployeeId: number | null;
    LanguageProficiency: number;
    IsRead: boolean;
    IsWrite: boolean;
    IsSpeak: boolean;
    Status: number;
    Modetype: UIMode;
   
}