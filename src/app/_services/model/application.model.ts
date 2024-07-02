import {BaseModel} from './Common/BaseModel';
import {ApplicationVersion} from './applicationversion.model';

export class Application extends BaseModel
{
    Id: number;
    Code: string;
    Name: string;
    Description: string;
    IsActive: boolean;

    VersionList:ApplicationVersion[];

    constructor()
    {
        super();
        this.VersionList = [];
    }
}