import { UIMode } from "../Common/BaseModel";
import { ContactDetails, AddressDetails } from "../Communication/CommunicationType";

export class CandidateCommunicationDetails {
    Id: number;
    CandidateId: number;
    AddressDetails: string;
    ContactDetails: string;
    LstAddressdetails: AddressDetails[];
    LstContactDetails: ContactDetails[];
    Modetype: UIMode;
}