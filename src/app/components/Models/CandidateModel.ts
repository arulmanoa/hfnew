import { LoginSessionDetails } from './LoginSessionDetails';
import { PersonDetails } from './PersonDetails';



export class CandidateModel {
    loginSessionDetails: LoginSessionDetails;
    OldPersonDetails: PersonDetails;
    NewPersonDetails: PersonDetails;
    CustomObject1: object;
    CustomObject2: object;
    Id: number;
}
export class PersonDetailsUpdate {
    SessionDtls?: LoginSessionDetails;
    OldPersonDetails?: PersonDetails;
    NewPersonDetails?: PersonDetails;
}

