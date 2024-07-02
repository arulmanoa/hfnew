import { LoginSessionDetails, _LoginSessionDetails } from './LoginSessionDetails';
import { MandatesDetails } from './MandatesDetails';
import { MandateTransaction, _MandateTransaction } from './MandateTransaction';
import { MandateStage, _MandateStage } from './MandateStage';
import { SessionKeys } from 'src/app/app.config';
import { _LstMandateDetailsApplicableStagesValues, MandateDetailsApplicableStages } from './MandateDetailsApplicableStages';



export class PageModel {
    loginSessionDetails: LoginSessionDetails;
    OldmandatesDetails: MandatesDetails;
    NewmandatesDetails: MandatesDetails;
    customObject1: object;
    customObject2: object;
    Id: number;
}

export class MandateTransactionPageModel {
    SessionDtls: LoginSessionDetails;
    OldMandateTransaction: MandateTransaction[];
    NewMandateTransaction: MandateTransaction[];
    MandateStageDetails: MandateStage;
    customObject1: object;
    customObject2: object;
    Id: number;
    RequirementId?: number;
    LstMandateDetailsApplicableStages?: MandateDetailsApplicableStages[];
}

export const _MandateTransactionPageModel: MandateTransactionPageModel = {
    SessionDtls: _LoginSessionDetails,
    OldMandateTransaction: _MandateTransaction,
    NewMandateTransaction: _MandateTransaction,
    MandateStageDetails: _MandateStage,
    customObject1: {},
    customObject2: {},
    Id: 0,
    RequirementId: 0,
    LstMandateDetailsApplicableStages: []
};
