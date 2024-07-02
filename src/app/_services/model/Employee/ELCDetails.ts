import { EmployeeLifeCycleTransaction } from "./EmployeeLifeCycleTransaction";
import { EmployeeRateset } from "./EmployeeRateset";
import { EmploymentContract } from "./EmployementContract";
import { CandidateOfferDetails } from "../Candidates/CandidateOfferDetails";
import { Gender } from "../Base/HRSuiteEnums";

export class ELCDetails {

    EmployeeId: number;

    Code: string;

    FirstName: string;

    LastName: string;

    CountryOfOrigin: number;

    CandidateId: number;

    EmploymentContracts: EmploymentContract[];

    ELCTransactions: EmployeeLifeCycleTransaction[];

    EmployeeRatesets: EmployeeRateset[];

    CandidateOfferDetails: CandidateOfferDetails[];

    CompanySettings: string;

    InsuranceList: any[];
    DateOfBirth?: any;
    Gender?: Gender

}