import { ClientContactLocationMapping } from "../ClientContactModelList";
import { UIMode,BaseModel } from "../Common/BaseModel";
import { AddressDetails, ContactDetails } from "../Communication/CommunicationType";

export class ClientContact extends BaseModel {
        
        ClientID: number;

        //        //ClientLocationId: number;

        Salutation: Salutation;

        Name: string;

        Designation: string;

        IsSinglePointOfContact: boolean;

        LstClientContact: ContactDetails;

        LstClientAddress: AddressDetails;
        LstClientContactLocationMapping: ClientContactLocationMapping[];

        Status: number;
        Modetype: UIMode;
    }
    export enum Salutation {
        Mr = 1,
        Mrs = 2,
        Ms = 3,
        Dr = 4
        
    }