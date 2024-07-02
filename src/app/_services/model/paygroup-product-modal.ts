import { Paygroup, _Paygroup  } from 'src/app/_services/model/paygroupproduct';

export class PaygroupModal {

    OldDetails: Paygroup;
    NewDetails: Paygroup;
    customObject1: any;
    customObject2: any;
    Id: number;

}

export const _PaygroupModal : PaygroupModal = {

    OldDetails: _Paygroup,
    NewDetails: _Paygroup,
    customObject1: null,
    customObject2: null,
    Id: 0,

}
