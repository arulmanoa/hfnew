import {BaseModel} from './Common/BaseModel';
import {Rule} from './Rule';

export class RuleSet extends BaseModel
{
    Id: number=0;
    Code: string;
    Name: string;
    Description: string;
    ImplementationCompanyId: number = 0;
    GroupId: number = 0;
    Status: number = 0;
    BusinessSystemId:number = 0;
    ClientId:number = 0;
    ClientContractId:number = 0;

    RuleList: Rule[];

    constructor()
    {
        super();
        this.RuleList = [];
    }
}