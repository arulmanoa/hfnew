import { UIMode,BaseModel } from "../Common/BaseModel";
import { ClientContractDocuments } from "./ClientContractDocuments";
import { ClientContractOperations } from "./ClientContractOperations";

export class ClientContract extends BaseModel
{ 
    Code: string;
    Name: string;
    Description: string;
    ClientContractBase: ClientContractBase;
    ClientId: number;
    LinesOfBusiness: [];
    ValidFrom: Date | string;
    ValidTo: Date | string;
    ClientType: ClientType;
    ContractType: number;
    IsNapBased: boolean
    NapsOnboardingType: number;
    NAPSLocation: string
    NAPSPlantName:string;
    IsAutoRenewal: boolean;
    SignedOn: Date | string;
    SignedBy: number;
    SignUpBranch: number;
    ExternalReferenceId: string; 
    LastRenewedOn: Date | string;
    Status: number;
    LstClientContractOperations: ClientContractOperations[];
    LstClientContractStakeHolders: ClientContractStakeHolders[];
    LstMarkupMappingDetails : any[];
    Modetype: UIMode;
    Value : number;
    LstClientContractDocuments : ClientContractDocuments[];
}

export const _ClientContract : ClientContract = {
    Id: 0,
    Name: "",
    Code: "",
    ClientId: 0,
    Description: "",
    ClientContractBase: null,
    LinesOfBusiness: [],
    ValidFrom: new Date(),
    ValidTo: new Date(),
    ClientType: 1,
    ContractType: 0,
    IsAutoRenewal: false,
    SignedOn: new Date(),
    SignedBy: 0,
    SignUpBranch: 0,
    ExternalReferenceId: "",
    LastRenewedOn: new Date(),
    Status: 0,
    LstClientContractOperations: null,
    LstClientContractStakeHolders: null,
    LstMarkupMappingDetails: [],
    Modetype: 0,
    Value: 0,
    LstClientContractDocuments: [],
    IsNapBased: false,
    NapsOnboardingType: 1,
    NAPSLocation: '',
    NAPSPlantName: ''
}

// export class ClientContractOperations extends BaseModel {
//     ClientContractId: number;
//     ApplicablePaygroups: ApplicablePayGroup[];
//     ApplicablePayCycles: number[]; 
//     ApplicableAttendanceCycles: number[];
//     ApplicableLeaveGroups: number[];
//     ApplicableHolidayCalendars: number[];
//     ApplicableNoticePeriodDays: number[];
//     PayrollInputMode: number;
//     LstStatutoryRulesDetails: StatutoryRulesDetails[];
//     ApplicableInsurancePlans: string;
//     KeyDates: KeyTransactionDates[]; 
//     ApplicableLeaveEncashmentRule: string;
//     ApplicableGratuityRule: string; 
//     Status: number;
//     MinimumWagesApplicableProducts: MinimumWagesApplicableProducts;
//     AdditionalConsultantsDetails: string;
//     Modetype: UIMode;
// }

export class ClientContractStakeHolders extends BaseModel {
    ClientContactId: number;
    ConsultantId: number;
    // roleId: number;
    ClientContractId: number;
    IsDefault: boolean;
    EffectiveFrom: string;
    Status: number;
}

export interface ClientContractBase extends BaseModel {
    Code: string;
    Name: string;
    ClientId: number;
  
}

export enum ClientType {
    Collect_Pay = 1,
    Pay_Collect = 2
}


export enum StatutoryType
{
    None=0,
    WCP =1,
    ESIC=2,
    LWF = 3,
    PT =4,
    PF =5
}

export interface StatutoryRulesDetails extends BaseModel {

    StatutoryType:	StatutoryType;
    EffectiveDate: Date | string;
    ProductId: number;
    ProductApplicabilityCode: string;
    IsApplicable: boolean;

}

export interface KeyTransactionDates extends BaseModel {

}

export interface MinimumWagesApplicableProducts {

    ApplicableProducts: number;
    IsIndividualbased: boolean;

}

export interface ApplicablePayGroup extends BaseModel {

}


export enum StatutoryType {
   
}
